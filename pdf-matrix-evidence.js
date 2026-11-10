/* Evidence-first visual answer capture for marked PDF Yes/No and True/False grids.
 * Uses OCR word coordinates PLUS actual colour/icon pixels and radio centres.
 * No guessing from question grade, neighbouring feedback, or flattened OCR glyphs. */
(function(root){
'use strict';
function wordsFromTsv(tsv){
  if(typeof tsv!=='string')return [];
  return tsv.split(/\r?\n/).slice(1).map(function(line){
    var p=line.split('\t');if(p.length<12||p[0]!=='5')return null;
    var x=Number(p[6]),y=Number(p[7]),w=Number(p[8]),h=Number(p[9]),t=p.slice(11).join('\t').trim();
    return t&&[x,y,w,h].every(Number.isFinite)&&w>0&&h>0?{x:x,y:y,w:w,h:h,t:t,cx:x+w/2,cy:y+h/2}:null;
  }).filter(Boolean);
}
function questionAnchors(words){
  var result=[];
  for(var i=0;i<words.length;i++){
    var w=words[i],n=null;
    var direct=w.t.match(/^question[:.#-]?(\d{1,3})$/i);
    if(direct)n=Number(direct[1]);
    else if(/^question[:.]?$/i.test(w.t)){
      var next=words.filter(function(other){
        return other.x>=w.x+w.w-3&&other.x<w.x+w.w+100&&Math.abs(other.cy-w.cy)<Math.max(10,w.h);
      }).sort(function(a,b){return a.x-b.x})[0];
      if(next&&/^\d{1,3}[.:]?$/.test(next.t))n=Number(next.t.replace(/[^\d]/g,''));
    }
    if(n>0&&n<=300&&!result.some(function(o){return o.qno===n&&Math.abs(o.y-w.y)<20;}))
      result.push({qno:n,y:w.y});
  }
  return result.sort(function(a,b){return a.y-b.y});
}
function columnHeaders(words){
  var heads=[];
  words.forEach(function(a){
    var t=a.t.toLowerCase().replace(/[^a-z]/g,'');
    if(t!=='yes'&&t!=='true')return;
    words.forEach(function(b){
      var u=b.t.toLowerCase().replace(/[^a-z]/g,'');
      if(u!==(t==='yes'?'no':'false'))return;
      var gap=b.cx-a.cx;
      if(gap<25||gap>350||Math.abs(a.cy-b.cy)>Math.max(13,a.h,b.h))return;
      if(!heads.some(function(h){return Math.abs(h.y-a.cy)<12&&Math.abs(h.yes.cx-a.cx)<15;}))
        heads.push({yes:a,no:b,y:Math.max(a.cy,b.cy),labels:[t==='yes'?'Yes':'True',t==='yes'?'No':'False']});
    });
  });
  return heads;
}
function colorType(data,index){
  var p=index*4,r=data[p],g=data[p+1],b=data[p+2];
  if(g>65&&g>r*1.35&&g>b*1.16)return 'correct';
  if(r>140&&r>g*1.65&&r>b*1.55&&g<145)return 'incorrect';
  return '';
}
function colorIcons(image,x0,y0,x1,y1){
  var W=image.width,H=image.height,data=image.data;
  x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));
  x1=Math.min(W,Math.ceil(x1));y1=Math.min(H,Math.ceil(y1));
  var rw=x1-x0,rh=y1-y0;
  if(rw<4||rh<4)return [];
  var seen=new Uint8Array(rw*rh),result=[];
  for(var y=0;y<rh;y++)for(var x=0;x<rw;x++){
    var start=y*rw+x,kind=colorType(data,(y0+y)*W+(x0+x));
    if(seen[start]||!kind)continue;
    var queue=[start],head=0,minX=x,maxX=x,minY=y,maxY=y,count=0;seen[start]=1;
    while(head<queue.length&&count<800){
      var cur=queue[head++],cx=cur%rw,cy=Math.floor(cur/rw);count++;
      minX=Math.min(minX,cx);maxX=Math.max(maxX,cx);minY=Math.min(minY,cy);maxY=Math.max(maxY,cy);
      for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;
        var xx=cx+dx,yy=cy+dy;
        if(xx<0||xx>=rw||yy<0||yy>=rh)continue;
        var idx=yy*rw+xx;
        if(seen[idx]||colorType(data,(y0+yy)*W+(x0+xx))!==kind)continue;
        seen[idx]=1;queue.push(idx);
      }
    }
    var bw=maxX-minX+1,bh=maxY-minY+1;
    if(count>=16&&count<=600&&bw>=8&&bw<=50&&bh>=8&&bh<=50&&bw/bh>=.6&&bw/bh<=1.5)
      result.push({kind:kind,x:x0+minX,y:y0+minY,w:bw,h:bh,cx:x0+(minX+maxX)/2,cy:y0+(minY+maxY)/2});
  }
  return result;
}
function lightness(image,x,y){
  var data=image.data,W=image.width,H=image.height,total=0,n=0;
  x=Math.round(x);y=Math.round(y);
  for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
    var xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;
    var p=(yy*W+xx)*4;total+=(data[p]+data[p+1]+data[p+2])/3;n++;
  }
  return n?total/n:NaN;
}
function rowText(words,cy,leftEdge){
  var rows=words.filter(function(w){return w.cx<leftEdge&&Math.abs(w.cy-cy)<=Math.max(10,w.h*.75);})
    .sort(function(a,b){return a.x-b.x;});
  return rows.map(function(w){return w.t;}).join(' ').replace(/\s+/g,' ').trim();
}
function scan(canvas,tsv,pageNumber){
  var words=wordsFromTsv(tsv),headers=columnHeaders(words),anchors=questionAnchors(words);
  if(!words.length||!headers.length||!anchors.length||!canvas||!canvas.getContext)return [];
  var ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx||!ctx.getImageData)return [];
  var image=ctx.getImageData(0,0,canvas.width,canvas.height);
  var observations=[];
  headers.forEach(function(header){
    var prev=anchors.filter(function(a){return a.y<header.y-4;}).at(-1);
    if(!prev)return;
    var next=anchors.find(function(a){return a.y>header.y+6;});
    var below=Math.min(next?next.y-5:canvas.height,header.y+Math.max(180,header.no.cx-header.yes.cx)*4);
    var span=header.no.cx-header.yes.cx;
    var marks=colorIcons(image,header.yes.cx-10,header.y+9,header.no.cx+Math.min(46,span*.64),below);
    var optionMarks=marks.map(function(m){
      var col=Math.abs(m.cx-(header.yes.cx+span*.24))<Math.abs(m.cx-(header.no.cx+span*.24))?0:1;
      var anchor=col===0?header.yes.cx:header.no.cx;
      var dx=m.cx-anchor;
      return dx>2&&dx<Math.min(45,span*.56)?Object.assign({},m,{col:col}):null;
    }).filter(Boolean).sort(function(a,b){return a.cy-b.cy});
    var clusters=[];
    optionMarks.forEach(function(m){
      var existing=clusters.find(function(row){return Math.abs(row.y-m.cy)<=Math.max(9,m.h*.6);});
      if(!existing){existing={y:m.cy,marks:[]};clusters.push(existing);}
      existing.marks.push(m);
    });
    var calibration=[null,null];
    optionMarks.forEach(function(m){
      if(calibration[m.col]===null)calibration[m.col]=m.cx-(m.w+3);
    });
    var rowResults=[];
    clusters.forEach(function(cluster){
      var correctMarkers=cluster.marks.filter(function(m){return m.kind==='correct'});
      var distinct=[...new Set(correctMarkers.map(function(m){return m.col}))];
      if(distinct.length!==1)return;
      var label=rowText(words,cluster.y,header.yes.x-15);
      if(label.length<12||/^the correct answer/i.test(label))return;
      var r0=calibration[0]===null?header.yes.cx-8:calibration[0];
      var r1=calibration[1]===null?header.no.cx-8:calibration[1];
      var l0=lightness(image,r0,cluster.y),l1=lightness(image,r1,cluster.y);
      var contrast=Math.abs(l0-l1);
      // Filled radio interiors are darker than empty ones. Require an explicit
      // visual difference, not just source grading, to attribute student choice.
      var selected=Number.isFinite(contrast)&&contrast>=17?(l0<l1?0:1):null;
      rowResults.push({
        statement:label,selected:selected===null?null:header.labels[selected],
        correct:header.labels[distinct[0]],is_correct:selected===null?null:selected===distinct[0],
        selection_evidence:selected===null?'radio fill ambiguous':'radio interior contrast',
        correct_evidence:'green keyed-answer icon',
        confidence:selected===null?'low':contrast>=25?'high':'medium',
        page:pageNumber
      });
    });
    if(!rowResults.length)return;
    observations.push({qno:prev.qno,source_pdf_page:pageNumber,question_type:'matrix',
      rows:rowResults,complete:rowResults.every(function(r){return r.selected!==null}),
      header:header.labels.join('/')});
  });
  return observations;
}
function apply(questions,observations,warnings){
  if(!Array.isArray(questions)||!Array.isArray(observations))return;
  observations.forEach(function(ob){
    var q=questions.find(function(item){
      return item.qno===ob.qno&&(!Array.isArray(item.source_pdf_pages)||item.source_pdf_pages.includes(ob.source_pdf_page));
    });
    if(!q)return;
    q.matrix_answers=ob.rows.map(function(row){return Object.assign({},row)});
    q.answer_capture_method='pdf-visual-matrix';
    q.visual_verification_required=!ob.complete;
    if(!ob.complete){
      q.answer_capture_status='review';
      if(Array.isArray(warnings))warnings.push('Q'+q.qno+': a matrix radio selection was not visually verifiable; do not infer the missing choice.');
      return;
    }
    q.your_answer=ob.rows.map(function(row){return row.statement+': '+row.selected}).join(' | ');
    q.correct_answer=ob.rows.map(function(row){return row.statement+': '+row.correct}).join(' | ');
    q.answer_capture_status='captured';
  });
}
root.LedgerPeerPdfMatrixEvidence={scan:scan,apply:apply,wordsFromTsv:wordsFromTsv,questionAnchors:questionAnchors};
})(window);