/* LedgerPeer PDF attempt reader. Conservative extraction: unverifiable marks remain null.
   The optional PDF-to-HTML report embeds visual page snapshots, while AI prompts use text only. */
(function(root){
'use strict';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
function assertPdf(file){
  if(!file||!(file.type==='application/pdf'||/\.pdf$/i.test(file.name||'')))throw new Error('Select a PDF file (.pdf).');
  if(file.size>35*1024*1024)throw new Error('PDF is over 35 MB. Reduce its size or use the HTML review export.');
}
async function open(file){
  assertPdf(file);
  if(!root.pdfjsLib||!root.pdfjsLib.getDocument)throw new Error('PDF reader library did not load. Check your connection or use HTML import.');
  root.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  var bytes=new Uint8Array(await file.arrayBuffer());
  if(String.fromCharCode.apply(null,bytes.slice(0,5))!=='%PDF-')throw new Error('The file does not start with a valid PDF header.');
  var document=await root.pdfjsLib.getDocument({data:bytes}).promise;
  if(!document.numPages||document.numPages>120)throw new Error('This PDF has more than 120 pages. Please split it into smaller attempt reviews.');
  return document;
}
function linesOf(items){
  var rows=[];
  items.forEach(function(it){
    var value=clean(it.str);
    if(!value)return;
    var x=Number(it.transform&&it.transform[4])||0,y=Number(it.transform&&it.transform[5])||0;
    var row=rows.find(function(r){return Math.abs(r.y-y)<=2.5;});
    if(!row){row={y:y,parts:[]};rows.push(row);}
    row.parts.push({x:x,text:value});
  });
  return rows.sort(function(a,b){return b.y-a.y;}).map(function(r){
    return clean(r.parts.sort(function(a,b){return a.x-b.x;}).map(function(p){return p.text;}).join(' '));
  }).filter(Boolean);
}
function heading(line){
  var match=line.match(/^(?:question\s*(?:no\.?\s*)?|q\.?\s*)(\d{1,3})(?:\s*[:.)-]\s*|\s+|$)/i);
  return match?Number(match[1]):null;
}
function parseBlocks(pages){
  var blocks=[],block=null,allLines=0;
  pages.forEach(function(page){
    page.lines.forEach(function(line){
      allLines++;
      var n=heading(line);
      if(n!==null&&n>0&&n<=300){
        if(block&&block.qno===n){block.lines.push({text:line,page:page.number});return;}
        block={qno:n,lines:[],pages:new Set()};
        blocks.push(block);
      }
      if(block){block.lines.push({text:line,page:page.number});block.pages.add(page.number);}
    });
  });
  if(!allLines)throw new Error('No selectable PDF text was found. This appears to be a scanned/image-only PDF. Use a marked HTML export; OCR is not available.');
  if(!blocks.length)throw new Error('No explicit "Question 1", "Question 2" headings were found. The PDF cannot be classified safely. Use the marked HTML export.');
  var seen=new Set(),notes=[];
  var questions=blocks.map(function(b){
    if(seen.has(b.qno))throw new Error('Duplicate question number '+b.qno+' in the PDF. Use the original HTML export for reliable grading.');
    seen.add(b.qno);
    var lines=b.lines.map(function(it){return it.text;});
    var max=null,marks=null,state=null,yourAnswer='',rightAnswer='';
    lines.slice(0,18).forEach(function(line){
      var status=line.match(/^(correct|incorrect|partially correct|not answered|unanswered)$/i);
      if(status){var st=status[1].toLowerCase();state=st==='correct'?true:false;}
      var grade=line.match(/(?:^|\b)(?:mark(?:ed|s)?|grade)\s*:?\s*(-?\d+(?:\.\d+)?)\s*(?:out of|\/)\s*(\d+(?:\.\d+)?)/i);
      if(grade){marks=Number(grade[1]);max=Number(grade[2]);}
    });
    lines.forEach(function(line){
      var a=line.match(/^(?:your answer|your response|selected answer)\s*:?\s*(.*)$/i);
      if(a&&a[1])yourAnswer+=(yourAnswer?' ':'')+a[1];
      var r=line.match(/^(?:the correct answer is|correct answer)\s*:?\s*(.*)$/i);
      if(r&&r[1])rightAnswer+=(rightAnswer?' ':'')+r[1];
    });
    var gradeState=(marks!==null&&max!==null&&max>0&&marks>=0&&marks<=max)?marks>=max:null;
    var conflict=state!==null&&gradeState!==null&&state!==gradeState;
    var verified=conflict?null:gradeState!==null?gradeState:state;
    if(conflict)notes.push('Q'+b.qno+': source status conflicts with marks; result marked unscored.');
    if(verified===null)notes.push('Q'+b.qno+': no reliable graded result found.');
    if(!yourAnswer)notes.push('Q'+b.qno+': selected answer is not explicit in PDF text.');
    var pageNumbers=Array.from(b.pages).sort(function(a,b){return a-b;});
    var questionText=lines.join('\n');
    if(questionText.length>30000){notes.push('Q'+b.qno+': text truncated; consult original PDF.');questionText=questionText.slice(0,30000);}
    return {
      qno:b.qno,is_correct:verified,
      qtext:'<p>'+esc(questionText).replace(/\n/g,'</p><p>')+'</p>',
      options:[],your_answer:yourAnswer?esc(yourAnswer):null,
      correct_answer:rightAnswer,debrief:'',source_result:state===true?'correct':state===false?'incorrect':'unverified',
      original_marks:conflict?null:marks,original_max_marks:conflict?null:max,
      answer_capture_status:yourAnswer?'captured':'not_captured',
      source_pdf_pages:pageNumbers,visual_verification_required:true,source_format:'pdf',fb_is_custom:false
    };
  });
  return {questions:questions,warnings:notes};
}
async function read(file,onProgress){
  var pdf=await open(file),pages=[];
  for(var i=1;i<=pdf.numPages;i++){
    if(onProgress)onProgress('Reading PDF page '+i+' / '+pdf.numPages);
    var page=await pdf.getPage(i),content=await page.getTextContent();
    pages.push({number:i,lines:linesOf(content.items)});
    page.cleanup();
  }
  var parsed=parseBlocks(pages);
  return {document:pdf,pages:pages,questions:parsed.questions,warnings:parsed.warnings,pageCount:pdf.numPages,originalName:file.name};
}
async function convertToHTML(result,onProgress){
  if(!result||!result.document||!result.pages)throw new Error('Read a PDF first.');
  var headingText=esc(result.originalName||'Converted PDF'),visuals=[];
  for(var i=1;i<=result.pageCount;i++){
    if(onProgress)onProgress('Preserving visual PDF page '+i+' / '+result.pageCount+' in HTML');
    var page=await result.document.getPage(i),natural=page.getViewport({scale:1});
    var scale=Math.min(1.5,1000/Math.max(1,natural.width));
    var viewport=page.getViewport({scale:scale}),canvas=document.createElement('canvas');
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    var ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx)throw new Error('Canvas is not available for PDF page images.');
    await page.render({canvasContext:ctx,viewport:viewport}).promise;
    visuals.push(canvas.toDataURL('image/jpeg',0.62));
    canvas.width=0;canvas.height=0;page.cleanup();
  }
  var json=JSON.stringify({format:'ledgerpeer-pdf-conversion-v1',originalName:result.originalName,pages:result.pageCount,questions:result.questions,warnings:result.warnings}).replace(/</g,'\\u003c');
  var body=result.pages.map(function(page,i){
    return '<section class="page"><h2>Page '+page.number+'</h2><img alt="Visual snapshot of original PDF page '+page.number+'" src="'+visuals[i]+'"><details><summary>Selectable text extracted from page '+page.number+'</summary><pre>'+esc(page.lines.join('\n'))+'</pre></details></section>';
  }).join('\n');
  var html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+headingText+' · PDF to HTML</title><style>body{background:#f6f3ec;color:#171717;font:15px system-ui;margin:0;padding:20px}main{max-width:1050px;margin:auto}h1{font-size:26px}.notice,.page{background:white;border:2px solid #111;padding:18px;margin:18px 0}.notice{background:#fff0c8}.page img{display:block;max-width:100%;height:auto;margin:auto;border:1px solid #bbb}summary{cursor:pointer;font-weight:bold;margin:12px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5}</style></head><body><main><h1>PDF → HTML · '+headingText+'</h1><div class="notice">Visual page snapshots preserve charts and diagrams. Text extraction may reorder tables and cannot prove which answer was selected. Check the original PDF before trusting marks. This standalone HTML may be re-imported into LedgerPeer.</div>'+body+'</main><script type="application/json" id="ledgerpeer-pdf-record">'+json+'</script></body></html>';
  return new Blob([html],{type:'text/html'});
}
function parseConvertedHtml(raw){
  var doc=new DOMParser().parseFromString(raw,'text/html'),el=doc.getElementById('ledgerpeer-pdf-record');
  if(!el)return null;
  var data;try{data=JSON.parse(el.textContent||'');}catch(e){throw new Error('The converted PDF metadata is invalid. Reconvert the original PDF.');}
  if(data.format!=='ledgerpeer-pdf-conversion-v1'||!Array.isArray(data.questions)||!data.questions.length)throw new Error('This is not a valid LedgerPeer PDF conversion.');
  return {questions:data.questions,warnings:Array.isArray(data.warnings)?data.warnings:[],pageCount:data.pages||0};
}
root.LedgerPeerPdfReader={read:read,convertToHTML:convertToHTML,parseConvertedHtml:parseConvertedHtml};
})(window);
