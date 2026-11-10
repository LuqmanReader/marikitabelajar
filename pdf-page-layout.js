/* LedgerPeer source-preserving PDF page layout model.
 * Extract content as positioned text, not a flattened string. This module does
 * not decide whether a student answered or whether a grade is correct.
 * All coordinates are in the page's rendered pixel space.
 */
(function(root){
'use strict';
function finite(v){return Number.isFinite(v);}
function round(v){return Math.round(v*10)/10;}
function clean(s){return String(s==null?'':s).replace(/\s+/g,' ').trim();}
function median(values){
  var sorted=values.filter(finite).sort(function(a,b){return a-b});
  return sorted.length?sorted[Math.floor(sorted.length/2)]:0;
}
function fromNative(items,viewport){
  var scale=Number(viewport&&viewport.scale)||1,words=[];
  (items||[]).forEach(function(item){
    var text=clean(item.str);
    if(!text||!item.transform)return;
    var p=viewport&&typeof viewport.convertToViewportPoint==='function'?
      viewport.convertToViewportPoint(item.transform[4],item.transform[5]):
      [Number(item.transform[4])||0,Number(item.transform[5])||0];
    var h=Math.max(3,(Number(item.height)||Math.abs(Number(item.transform[3]))||9)*scale);
    var w=Math.max(1,(Number(item.width)||text.length*4)*scale);
    words.push({text:text,x:round(p[0]),y:round(p[1]-h),w:round(w),h:round(h),
      source:'native',confidence:1});
  });
  return build(words,'native');
}
function fromTsv(tsv){
  if(typeof tsv!=='string'||!tsv.includes('\t'))return {lines:[],words:[],source:'ocr'};
  var words=[];
  tsv.split(/\r?\n/).slice(1).forEach(function(raw){
    var parts=raw.split('\t');
    if(parts.length<12||parts[0]!=='5')return;
    var x=Number(parts[6]),y=Number(parts[7]),w=Number(parts[8]),h=Number(parts[9]);
    var value=clean(parts.slice(11).join('\t')),conf=Number(parts[10]);
    if(!value||!finite(x)||!finite(y)||!finite(w)||!finite(h)||w<=0||h<=0)return;
    words.push({text:value,x:round(x),y:round(y),w:round(w),h:round(h),
      source:'ocr',confidence:finite(conf)?Math.max(0,Math.min(1,conf/100)):null,
      group:parts.slice(1,5).join(':')});
  });
  return build(words,'ocr');
}
function build(words,source){
  var ordered=words.slice().sort(function(a,b){return a.y+a.h/2-(b.y+b.h/2)||a.x-b.x;});
  var lines=[],height=median(ordered.map(function(w){return w.h}))||12;
  ordered.forEach(function(word){
    var cy=word.y+word.h/2;
    var candidate=null,dist=Infinity;
    for(var i=lines.length-1;i>=Math.max(0,lines.length-8);i--){
      var row=lines[i],difference=Math.abs(row.cy-cy);
      if(difference<=Math.max(2,Math.min(8,height*.48))&&difference<dist){
        candidate=row;dist=difference;
      }
    }
    if(!candidate){candidate={cy:cy,words:[]};lines.push(candidate);}
    candidate.words.push(word);
    candidate.cy=(candidate.cy*(candidate.words.length-1)+cy)/candidate.words.length;
  });
  return {source:source,words:ordered,lines:lines.map(function(line){
    var row=line.words.slice().sort(function(a,b){return a.x-b.x;});
    var x0=Math.min.apply(null,row.map(function(w){return w.x}));
    var x1=Math.max.apply(null,row.map(function(w){return w.x+w.w}));
    var y0=Math.min.apply(null,row.map(function(w){return w.y}));
    var y1=Math.max.apply(null,row.map(function(w){return w.y+w.h}));
    var cells=[],current=[];
    row.forEach(function(w,i){
      var previous=current[current.length-1];
      var gap=previous?w.x-(previous.x+previous.w):0;
      if(previous&&gap>Math.max(23,median(row.map(function(z){return z.h}))*1.8)){
        cells.push(current);current=[];
      }
      current.push(w);
    });
    if(current.length)cells.push(current);
    return {text:row.map(function(w){return w.text}).join(' ').replace(/\s+/g,' ').trim(),
      box:{x:round(x0),y:round(y0),w:round(x1-x0),h:round(y1-y0)},
      words:row,columns:cells.map(function(group){return {text:group.map(function(w){return w.text}).join(' '),
        x:round(group[0].x),w:round(group[group.length-1].x+group[group.length-1].w-group[0].x)};})};
  }).sort(function(a,b){return a.box.y-b.box.y||a.box.x-b.box.x})};
}
function anchorNumber(line){
  var match=clean(line).match(/^(?:question|ques(?:tion)?|q\.?)\s*(?:no\.?\s*)?#?\s*(\d{1,3})\s*(?:[.:)]\s*)?$/i);
  var n=match?Number(match[1]):null;
  return n>0&&n<=300?n:null;
}
function candidateAnchors(page){
  var rows=(page.layout&&page.layout.lines)||[],out=[];
  rows.forEach(function(row,i){
    var n=anchorNumber(row.text);
    if(!n)return;
    var nearby=rows.slice(i+1,i+8).map(function(r){return r.text}).join(' ');
    var grade=/(?:mark|wark|score)\s*:?\s*\d|(?:correct|inconect|incorrect|unanswered|not answered|comet)/i.test(nearby);
    // A standalone number heading with source location is evidence even when
    // an OCR-distorted grading label is not recognisable.
    out.push({qno:n,page:page.number,box:row.box,hasGrade:grade,
      confidence:grade?'high':'medium'});
  });
  return out;
}
function sourceRegions(questions,pages){
  if(!Array.isArray(questions)||!Array.isArray(pages))return [];
  var anchors=pages.flatMap(candidateAnchors);
  questions.forEach(function(q){
    var pagesForQ=Array.isArray(q.source_pdf_pages)?q.source_pdf_pages:[];
    var regions=pagesForQ.map(function(pageNo){
      var page=pages.find(function(p){return p.number===pageNo});
      if(!page||!page.layout)return null;
      var own=anchors.filter(function(a){return a.page===pageNo&&a.qno===q.qno})[0];
      var next=own?anchors.filter(function(a){return a.page===pageNo&&a.box.y>own.box.y})
        .sort(function(a,b){return a.box.y-b.box.y})[0]:null;
      var lines=page.layout.lines.filter(function(line){
        return (!own||line.box.y>=own.box.y-3)&&(!next||line.box.y<next.box.y-2);
      });
      if(!lines.length)return null;
      var minX=Math.min.apply(null,lines.map(function(l){return l.box.x}));
      var minY=Math.min.apply(null,lines.map(function(l){return l.box.y}));
      var maxX=Math.max.apply(null,lines.map(function(l){return l.box.x+l.box.w}));
      var maxY=Math.max.apply(null,lines.map(function(l){return l.box.y+l.box.h}));
      return {page:pageNo,x:round(minX),y:round(minY),w:round(maxX-minX),h:round(maxY-minY),
        source:page.layout.source,lineCount:lines.length,
        hasAnchor:!!own};
    }).filter(Boolean);
    if(regions.length)q.source_regions=regions;
  });
  return anchors;
}
function tableCandidates(layout){
  if(!layout||!layout.lines)return [];
  var rows=layout.lines.filter(function(line){return line.columns&&line.columns.length>=3;});
  var groups=[],current=[];
  rows.forEach(function(line){
    var prior=current[current.length-1];
    var similar=prior&&line.box.y-(prior.box.y+prior.box.h)<Math.max(18,line.box.h*1.8)&&
      line.columns.length===prior.columns.length&&line.columns.every(function(c,i){
        return Math.abs(c.x-prior.columns[i].x)<22;
      });
    if(prior&&!similar){if(current.length>=2)groups.push(current);current=[];}
    current.push(line);
  });
  if(current.length>=2)groups.push(current);
  return groups.map(function(group){return {
    box:{x:group[0].box.x,y:group[0].box.y,
      w:Math.max.apply(null,group.map(function(r){return r.box.x+r.box.w}))-group[0].box.x,
      h:group[group.length-1].box.y+group[group.length-1].box.h-group[0].box.y},
    rows:group.map(function(row){return row.columns.map(function(c){return c.text})})};
  }});
}
root.LedgerPeerPdfLayout={fromNative:fromNative,fromTsv:fromTsv,
  anchorNumber:anchorNumber,candidateAnchors:candidateAnchors,sourceRegions:sourceRegions,
  tableCandidates:tableCandidates};
})(window);