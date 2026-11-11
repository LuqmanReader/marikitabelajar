/* PDF -> HTML is the first stage. No OCR, question parsing or topic sorting
 * runs here. The HTML contains selectable text, native form evidence and page
 * images; subsequent readers consume that HTML rather than reopening the PDF. */
(function(root){
'use strict';
var FORMAT='ledgerpeer-source-html-v1';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
function json(value){return JSON.stringify(value).replace(/</g,'\\u003c');}
function paragraphs(lines){return (lines||[]).map(function(s){return '<p>'+esc(s)+'</p>'}).join('');}
function tables(layout){
  var list=root.LedgerPeerPdfLayout?root.LedgerPeerPdfLayout.tableCandidates(layout):[];
  return list.map(function(t){return '<table><tbody>'+t.rows.map(function(row){return '<tr>'+row.map(function(v){return '<td>'+esc(v)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table>'}).join('');
}
function nativeLines(items){
  var rows=[];
  (items||[]).forEach(function(it){
    var s=String(it.str||'').replace(/\s+/g,' ').trim();if(!s)return;
    var x=Number(it.transform&&it.transform[4])||0,y=Number(it.transform&&it.transform[5])||0;
    var row=rows.find(function(r){return Math.abs(r.y-y)<=2.5});
    if(!row){row={y:y,parts:[]};rows.push(row)}row.parts.push({x:x,text:s});
  });
  return rows.sort(function(a,b){return b.y-a.y}).map(function(r){return r.parts.sort(function(a,b){return a.x-b.x}).map(function(p){return p.text}).join(' ')});
}
async function convert(source,onProgress,originalName){
  var pdf=await root.LedgerPeerPdfReader.openDocument(source,onProgress),pages=[],sections=[],warnings=[];
  try{
    for(var i=1;i<=pdf.numPages;i++){
      if(onProgress)onProgress('Converting PDF to HTML: page '+i+' / '+pdf.numPages);
      var page=null,canvas=null,lines=[],image='',record={number:i,layout:null,widgets:[],imageScale:1.7,textStatus:'unavailable',imageStatus:'unavailable'};
      try{
        page=await pdf.getPage(i);
        var viewport=page.getViewport({scale:1.7});
        try{
          var content=await page.getTextContent();lines=nativeLines(content.items);
          record.layout=root.LedgerPeerPdfLayout?root.LedgerPeerPdfLayout.fromNative(content.items,viewport):null;
          record.textStatus=lines.length?'native-text':'image-only';
        }catch(e){warnings.push('Page '+i+': native text unavailable; its HTML image is the backup.');}
        if(root.LedgerPeerPdfWidgets&&typeof page.getAnnotations==='function'){
          try{record.widgets=root.LedgerPeerPdfWidgets.widgets(await page.getAnnotations({intent:'display'}),viewport,i)}
          catch(e){warnings.push('Page '+i+': native form values unavailable.');}
        }
        try{
          var natural=page.getViewport({scale:1}),scale=Math.min(2,1400/Math.max(1,natural.width));
          var rendered=page.getViewport({scale:scale});canvas=document.createElement('canvas');
          canvas.width=Math.ceil(rendered.width);canvas.height=Math.ceil(rendered.height);
          var ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas unavailable');
          await page.render({canvasContext:ctx,viewport:rendered}).promise;
          image=canvas.toDataURL('image/png');record.imageScale=scale;record.imageStatus='preserved';
        }catch(e){warnings.push('Page '+i+': visual conversion unavailable; keep the original PDF for this page.');}
      }catch(e){warnings.push('Page '+i+': PDF page could not be converted. Other pages are retained.');}
      finally{if(canvas){canvas.width=0;canvas.height=0}if(page&&page.cleanup)page.cleanup();}
      pages.push(record);
      sections.push('<section class="page" id="page-'+i+'" data-page="'+i+'"><h2>Page '+i+'</h2>'+
        (image?'<img class="lp-source-image" alt="Original PDF page '+i+'" src="'+image+'">':'<p class="notice">Original page image unavailable.</p>')+
        '<div class="page-text"><h3>Converted HTML text</h3><div class="lp-source-lines">'+paragraphs(lines)+'</div></div>'+
        '<details class="lp-source-tables"><summary>Candidate table structure — verify against the page</summary>'+tables(record.layout)+'</details></section>');
    }
    var metadata={format:FORMAT,pipeline:'pdf-html-first',stage:'converted',originalName:originalName||source&&source.name||'Original exam PDF',pages:pages,warnings:warnings};
    var html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(metadata.originalName)+' · Converted HTML</title>'+
      '<style>body{font:15px/1.55 system-ui;margin:20px;background:#f5f6f7;color:#171717}main{max-width:1050px;margin:auto}.page,.notice{padding:18px;background:white;border:1px solid #aaa;margin:18px 0}img{display:block;max-width:100%;height:auto}p{overflow-wrap:anywhere}table{border-collapse:collapse}td{border:1px solid #bbb;padding:6px}details{margin:12px 0}</style></head><body><main><h1>'+esc(metadata.originalName)+'</h1>'+
      '<p class="notice">Converted to HTML before question extraction. Page images preserve figures and selections. Table structure is provisional. No topics or grades are inferred by conversion.</p>'+sections.join('')+'</main>'+
      '<script type="application/json" id="ledgerpeer-source-document">'+json(metadata)+'</script></body></html>';
    return new Blob([html],{type:'text/html'});
  }finally{if(pdf.destroy)await pdf.destroy();}
}
function parse(raw){
  var doc=new DOMParser().parseFromString(String(raw),'text/html'),el=doc.getElementById('ledgerpeer-source-document');
  if(!el)return null;
  var data;try{data=JSON.parse(el.textContent)}catch(e){throw new Error('The converted HTML source record is invalid. Reconvert the original PDF.');}
  if(data.format!==FORMAT||!Array.isArray(data.pages)||!data.pages.length||data.pages.length>120)throw new Error('Invalid converted HTML page record.');
  // Re-imported HTML is data. Do not carry executable content into its saved copy.
  doc.querySelectorAll('script').forEach(function(node){
    if(node.type!=='application/json'||!['ledgerpeer-source-document','ledgerpeer-pdf-record'].includes(node.id))node.remove();
  });
  doc.querySelectorAll('iframe,object,embed,base,link,form').forEach(function(node){node.remove()});
  doc.querySelectorAll('*').forEach(function(node){
    Array.from(node.attributes).forEach(function(attr){
      if(/^on/i.test(attr.name)||/^(?:href|src|action)$/i.test(attr.name)&&/^\s*javascript:/i.test(attr.value))node.removeAttribute(attr.name);
    });
  });
  var sections=Array.from(doc.querySelectorAll('section.page[data-page]'));
  var pages=data.pages.map(function(record,index){
    if(record.number!==index+1)throw new Error('Converted HTML page numbering is inconsistent.');
    var section=sections.find(function(s){return Number(s.getAttribute('data-page'))===record.number});
    if(!section)throw new Error('Converted HTML is missing page '+record.number+'.');
    var img=section.querySelector('img.lp-source-image'),src=img&&img.getAttribute('src')||'';
    return Object.assign({},record,{
      lines:Array.from(section.querySelectorAll('.lp-source-lines > p')).map(function(p){return p.textContent.trim()}).filter(Boolean),
      image:/^data:image\/(?:png|jpeg|webp);base64,/i.test(src)?src:'',section:section
    });
  });
  return {doc:doc,metadata:data,pages:pages};
}
async function imageCanvas(src){
  if(!/^data:image\/(?:png|jpeg|webp);base64,/i.test(src))throw new Error('No embedded HTML page image.');
  var img=await new Promise(function(resolve,reject){
    var image=new Image(),timer=setTimeout(function(){reject(new Error('HTML page image did not decode in time.'));},15000);
    image.onload=function(){clearTimeout(timer);resolve(image)};image.onerror=function(){clearTimeout(timer);reject(new Error('HTML page image cannot be decoded.'))};image.src=src;
  });
  var canvas=document.createElement('canvas');canvas.width=img.naturalWidth||img.width;canvas.height=img.naturalHeight||img.height;
  var ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(img,0,0);return canvas;
}
async function complete(converted,result){
  var doc=converted.doc,metadata=converted.metadata;
  metadata.stage='extracted';metadata.warnings=result.warnings;
  metadata.pages=converted.pages.map(function(page){
    var section=page.section,lines=section.querySelector('.lp-source-lines');
    if(page.textStatus==='ocr-recovered'&&lines){
      var original=doc.createElement('details');original.className='lp-original-text';
      original.innerHTML='<summary>Original converted text before image recovery</summary>'+lines.innerHTML;
      section.appendChild(original);lines.innerHTML=paragraphs(page.lines);
      section.querySelector('.page-text h3').textContent='HTML text with image recovery';
      section.querySelector('.lp-source-tables').innerHTML='<summary>Candidate table structure — verify against the page</summary>'+tables(page.layout);
    }
    return {number:page.number,layout:page.layout,widgets:page.widgets,imageScale:page.imageScale,
      textStatus:page.textStatus,imageStatus:page.imageStatus,ocrConfidence:page.ocrConfidence,ocrError:page.ocrError||''};
  });
  // Preserve per-question visual evidence without reopening or rescanning the PDF.
  if(root.LedgerPeerPdfVisual){
    for(var page of converted.pages){
      var regions=(result.questions||[]).flatMap(function(q){return (q.source_regions||[]).filter(function(r){return r.page===page.number&&r.hasAnchor}).map(function(r){return {qno:q.qno,region:r}})});
      if(!page.image||!regions.length)continue;
      var canvas;
      try{
        canvas=await imageCanvas(page.image);
        regions.forEach(function(item){
          var src=root.LedgerPeerPdfVisual.crop(canvas,item.region,page.imageScale);if(!src)return;
          var details=doc.createElement('details');details.className='question-evidence';
          details.innerHTML='<summary>Question '+Number(item.qno)+' · original page '+page.number+'</summary><img alt="Question source evidence" src="'+src+'">';page.section.appendChild(details);
        });
      }catch(e){/* The full HTML page image remains available when a crop fails. */}
      finally{if(canvas){canvas.width=0;canvas.height=0}}
    }
  }
  doc.getElementById('ledgerpeer-source-document').textContent=json(metadata);
  var record=doc.getElementById('ledgerpeer-pdf-record');if(!record){record=doc.createElement('script');record.id='ledgerpeer-pdf-record';record.type='application/json';doc.body.appendChild(record);}
  record.textContent=json({format:'ledgerpeer-pdf-conversion-v1',pipeline:'pdf-html-first',originalName:metadata.originalName,
    pages:converted.pages.length,readerEngine:result.readerEngine,questions:result.questions,warnings:result.warnings,
    extractionPipeline:result.extractionPipeline});
  return new Blob(['<!doctype html>\n'+doc.documentElement.outerHTML],{type:'text/html'});
}
root.LedgerPeerPdfHtml={convert:convert,parse:parse,imageCanvas:imageCanvas,complete:complete};
})(window);
