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
async function open(source,onProgress){
  if(!(source instanceof Uint8Array))assertPdf(source);
  if(!root.pdfjsLib||!root.pdfjsLib.getDocument)throw new Error('PDF reader library did not load. Check your connection and retry.');
  var bytes=source instanceof Uint8Array?source:new Uint8Array(await source.arrayBuffer());
  var health=root.LedgerPeerPdfHealth,report=health&&health.inspect(bytes,source&&source.name||'',source&&source.type||'');
  if(!report||report.kind!=='pdf')throw new Error('This file has no valid PDF header. Export the actual PDF or HTML review and try again.');
  // PDF.js may transfer an ArrayBuffer to a worker: always pass a fresh copy.
  var workerUrls=['https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
  var cause=null;
  for(var attempt=0;attempt<2;attempt++){
    root.pdfjsLib.GlobalWorkerOptions.workerSrc=workerUrls[attempt];
    var input=attempt===1&&report.headerOffset>0?bytes.subarray(report.headerOffset):bytes;
    var options={data:input.slice(),stopAtErrors:false};
    if(attempt===1){
      // A second pass changes the worker CDN and disables stream/range behaviour.
      // It does NOT fabricate missing PDF objects or student marks.
      options.disableStream=true;options.disableRange=true;options.disableAutoFetch=true;
      options.isEvalSupported=false;options.useWorkerFetch=false;
    }
    var task;
    try{
      task=root.pdfjsLib.getDocument(options);
      var document=await task.promise;
      if(!document.numPages||document.numPages>120){
        await document.destroy();
        throw new Error('This PDF has no readable pages or more than 120 pages. Split it into smaller review files.');
      }
      return document;
    }catch(error){
      if(task&&typeof task.destroy==='function')try{await task.destroy();}catch(ignore){}
      if(/no readable pages or more than 120 pages/i.test(String(error.message||'')))throw error;
      cause=error;
      if(error&&error.name==='PasswordException')break;
      if(attempt===0&&onProgress)onProgress('PDF opening failed. Trying a second compatible parsing configuration…');
    }
  }
  throw new Error(health.explain(cause,report));
}
function hasMatrixHeader(lines){return /\b(?:yes\s+no|true\s+false)\b/i.test((lines||[]).join(' '));}
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
    var max=null,marks=null,state=null,sourceStatus='',yourAnswer='',rightAnswer='';
    lines.slice(0,18).forEach(function(line){
      var status=line.match(/^(correct|incorrect|partially correct|not answered|unanswered)$/i);
      if(status){var st=status[1].toLowerCase();state=st==='correct'?true:false;sourceStatus=st.replace(/\s+/g,'_');}
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
      correct_answer:rightAnswer,debrief:'',source_result:conflict?'conflicting_source_grades':sourceStatus||(marks!==null&&max!==null&&marks>0&&marks<max?'partially_correct':verified===true?'correct':verified===false?'incorrect':'unverified'),
      original_marks:conflict?null:marks,original_max_marks:conflict?null:max,
      answer_capture_status:yourAnswer?'captured':'not_captured',
      source_pdf_pages:pageNumbers,visual_verification_required:true,source_format:'pdf',fb_is_custom:false
    };
  });
  return {questions:questions,warnings:notes};
}
function ensureTesseract(){
  if(root.Tesseract&&typeof root.Tesseract.createWorker==='function')return Promise.resolve();
  if(root.__ledgerpeerTesseractLoading)return root.__ledgerpeerTesseractLoading;
  root.__ledgerpeerTesseractLoading=new Promise(function(resolve,reject){
    var tag=document.createElement('script');
    tag.src='https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
    tag.onload=function(){root.Tesseract&&root.Tesseract.createWorker?resolve():reject(new Error('OCR engine could not initialize.'));};
    tag.onerror=function(){reject(new Error('OCR engine could not download. Check your connection and try again.'));};
    document.head.appendChild(tag);
  }).catch(function(err){root.__ledgerpeerTesseractLoading=null;throw err;});
  return root.__ledgerpeerTesseractLoading;
}
async function recognizePdfPage(page,worker,pageNumber){
  var size=page.getViewport({scale:1.7}),canvas=document.createElement('canvas');
  canvas.width=Math.ceil(size.width);canvas.height=Math.ceil(size.height);
  try{
    var context=canvas.getContext('2d',{alpha:false});
    if(!context)throw new Error('Canvas rendering is not available in this browser.');
    await page.render({canvasContext:context,viewport:size}).promise;
    var image=canvas.toDataURL('image/png');
    var reading=await worker.recognize(image,{}, {text:true,tsv:true});
    var data=reading&&reading.data||{};
    var positioned=root.LedgerPeerPdfLayout&&data.tsv?root.LedgerPeerPdfLayout.fromTsv(data.tsv):null;
    var matrixObservations=root.LedgerPeerPdfMatrixEvidence&&data.tsv?
      root.LedgerPeerPdfMatrixEvidence.scan(canvas,data.tsv,pageNumber):[];
    var flat=String(data.text||'').split(/\r?\n/).map(clean).filter(Boolean);
    var sourceAnchors=flat.filter(function(line){return /^question\s*\d{1,3}\s*$/i.test(line)}).length;
    var positionedAnchors=positioned?positioned.lines.filter(function(row){return root.LedgerPeerPdfLayout.anchorNumber(row.text)!==null}).length:0;
    // OCR word coordinates can rescue a question heading that was merged into
    // a neighbouring line by plain-text OCR. Keep the original if no improvement.
    if(positionedAnchors>sourceAnchors&&positioned.lines.length>=flat.length*.65)
      flat=positioned.lines.map(function(row){return row.text});
    return {lines:flat,layout:positioned,
      confidence:Number.isFinite(data.confidence)?data.confidence:null,matrixObservations:matrixObservations};
  }finally{canvas.width=0;canvas.height=0;}
}
async function read(source,onProgress){
  var pdf=await open(source,onProgress),pages=[],anyOcr=false,worker=null,matrixObservations=[],visualWarnings=[];
  try{
    for(var i=1;i<=pdf.numPages;i++){
      if(onProgress)onProgress('Inspecting page '+i+' / '+pdf.numPages);
      var page=await pdf.getPage(i),content=await page.getTextContent();
      var lines=linesOf(content.items),confidence=null;
      var viewport=page.getViewport({scale:1.7});
      var layout=root.LedgerPeerPdfLayout?root.LedgerPeerPdfLayout.fromNative(content.items,viewport):null;
      var widgets=[];
      if(root.LedgerPeerPdfWidgets&&typeof page.getAnnotations==='function'){
        try{widgets=root.LedgerPeerPdfWidgets.widgets(await page.getAnnotations({intent:'display'}),viewport,i)}
        catch(formErr){visualWarnings.push('Page '+i+': native PDF form fields unavailable.');}
      }
      // OCR selection is based on text-layer presence, not exam vocabulary.
      // Ordinary reports and documents must not require "Question" or "Mark".
      var requiresOcr=!lines.length||lines.join(' ').length<18;
      if(requiresOcr){
        if(!worker){
          if(onProgress)onProgress('This PDF has image-only pages. Loading local-browser OCR engine…');
          await ensureTesseract();
          worker=await root.Tesseract.createWorker('eng');
        }
        if(onProgress)onProgress('Reading image-based page '+i+' / '+pdf.numPages+' (OCR)');
        var recognized=await recognizePdfPage(page,worker,i);
        lines=recognized.lines;confidence=recognized.confidence;anyOcr=true;
        if(recognized.layout&&recognized.layout.lines.length)layout=recognized.layout;
        if(Array.isArray(recognized.matrixObservations))matrixObservations.push(...recognized.matrixObservations);
      }else if(root.LedgerPeerPdfMatrixEvidence&&hasMatrixHeader(lines)){
        // A selectable PDF text layer does not preserve filled radio-button pixels.
        // Read its matrix cells visually as well, without replacing the good text layer.
        try{
          if(!worker){await ensureTesseract();worker=await root.Tesseract.createWorker('eng');}
          var visual=await recognizePdfPage(page,worker,i);
          if(Array.isArray(visual.matrixObservations))matrixObservations.push(...visual.matrixObservations);
        }catch(visualError){visualWarnings.push('Page '+i+': visual matrix reading unavailable; selections remain unverified.');}
      }
      pages.push({number:i,lines:lines,ocrConfidence:confidence,layout:layout,widgets:widgets});
      page.cleanup();
    }
  }finally{if(worker)await worker.terminate();}
  // Conversion is universal; assessment-grading readers are optional adapters.
  // Unfamiliar layouts must still yield a visual + text HTML document.
  var parseFailures=[],parsed=null,engine='universal-document';
  if(anyOcr&&root.LedgerPeerOcrParser){
    try{parsed=root.LedgerPeerOcrParser.parse(pages);engine='marked-review-ocr';}
    catch(e){parseFailures.push('Marked-exam OCR rules did not match this layout: '+String(e.message||e));}
  }
  if(!parsed&&!anyOcr){
    try{parsed=parseBlocks(pages);engine='marked-review-text';}
    catch(e){parseFailures.push('Marked-exam text rules did not match this layout: '+String(e.message||e));}
  }
  // Strong question-header + status evidence must not be discarded merely
  // because a few OCR decimals or the overall-grade header are unreadable.
  var evidence=parsed&&parsed.extractionConfidence;
  var credibleOcr=!!(parsed&&parsed.partialGrading&&evidence&&
    evidence.questionCount>=2&&evidence.statusCount>=Math.ceil(evidence.questionCount*0.6));
  if(!parsed||(!parsed.reconciliation&&!credibleOcr)){
    if(!root.LedgerPeerUniversalDocument)throw new Error('Universal PDF document reader did not load. Refresh and try again.');
    var generic=root.LedgerPeerUniversalDocument.parse(pages);
    if(generic.reconciliation||!parsed){
      parsed=generic;engine='universal-document';
    }else{
      // When a detailed review adapter has partial information but not full score
      // reconciliation, do not treat its assumptions as verified grades.
      parsed=generic.questions.length?generic:{
        questions:parsed.questions.map(function(q){
          return Object.assign({},q,{is_correct:null,original_marks:null,original_max_marks:null,source_result:'unverified'});
        }),
        warnings:generic.warnings.concat(parsed.warnings||[]),reconciliation:null
      };
      engine='universal-document';
    }
  }
  var warnings=(parsed.warnings||[]).slice().concat(parseFailures,visualWarnings);
  if(root.LedgerPeerPdfLayout){
    root.LedgerPeerPdfLayout.sourceRegions(parsed.questions||[],pages);
    (parsed.questions||[]).forEach(function(q){
      var tablePages=[];
      (q.source_regions||[]).forEach(function(region){
        var page=pages.find(function(p){return p.number===region.page});
        if(page&&page.layout)root.LedgerPeerPdfLayout.tableCandidates(page.layout).forEach(function(table){
          if(table.box.y+table.box.h>=region.y&&table.box.y<=region.y+region.h)
            tablePages.push({page:region.page,rows:table.rows,box:table.box});
        });
      });
      if(tablePages.length)q.source_tables=tablePages.slice(0,4);
    });
  }
  if(root.LedgerPeerPdfWidgets)root.LedgerPeerPdfWidgets.attach(parsed.questions||[],pages);
  if(root.LedgerPeerPdfMatrixEvidence&&matrixObservations.length)
    root.LedgerPeerPdfMatrixEvidence.apply(parsed.questions||[],matrixObservations,warnings);
  if(matrixObservations.length){
    warnings=warnings.filter(function(w){return !/selected answer\(s\) could not be proven from OCR/i.test(w);});
    var unverified=(parsed.questions||[]).filter(function(q){return q.answer_capture_status!=='captured';}).length;
    if(unverified)warnings.push(unverified+' answer selection(s) remain unverified after visual matrix analysis.');
  }
  var extractionAudit=null;
  if(root.LedgerPeerPdfAudit){
    extractionAudit=root.LedgerPeerPdfAudit.audit(parsed.questions||[]);
    warnings.push(...extractionAudit.warnings);
  }
  return {document:pdf,pages:pages,questions:parsed.questions||[],warnings:warnings,extractionAudit:extractionAudit,
    reconciliation:parsed.reconciliation||null,ocrUsed:anyOcr,readerEngine:engine,
    extractionConfidence:parsed.extractionConfidence||null,
    pageCount:pdf.numPages,originalName:source&&source.name||'Original exam PDF'};
}
async function convertToHTML(result,onProgress){
  if(!result||!result.document||!result.pages)throw new Error('Read a PDF first.');
  var headingText=esc(result.originalName||'Converted PDF'),visuals=[],questionCrops=[];
  for(var i=1;i<=result.pageCount;i++){
    if(onProgress)onProgress('Preserving visual PDF page '+i+' / '+result.pageCount+' in HTML');
    var page=await result.document.getPage(i),natural=page.getViewport({scale:1});
    var scale=Math.min(2,1400/Math.max(1,natural.width));
    var viewport=page.getViewport({scale:scale}),canvas=document.createElement('canvas');
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    var ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx)throw new Error('Canvas is not available for PDF page images.');
    await page.render({canvasContext:ctx,viewport:viewport}).promise;
    visuals.push(canvas.toDataURL('image/jpeg',0.76));
    if(root.LedgerPeerPdfVisual){
      (result.questions||[]).forEach(function(q){
        (q.source_regions||[]).forEach(function(region){
          if(region.page!==i||!region.hasAnchor)return;
          var photo=root.LedgerPeerPdfVisual.crop(canvas,region,viewport.scale);
          if(photo)questionCrops.push({qno:q.qno,page:i,src:photo});
        });
      });
    }
    canvas.width=0;canvas.height=0;page.cleanup();
  }
  var json=JSON.stringify({format:'ledgerpeer-pdf-conversion-v1',originalName:result.originalName,pages:result.pageCount,readerEngine:result.readerEngine||'unknown',questions:result.questions,warnings:result.warnings}).replace(/</g,'\\u003c');
  var originalQuestions=questionCrops.map(function(c){
    return '<details class="question-evidence"><summary>Question '+c.qno+' · original page '+c.page+'</summary><img alt="Original PDF visual evidence for Question '+c.qno+'" src="'+c.src+'"></details>';
  }).join('');
  var body=result.pages.map(function(page,i){
    return '<section class="page" id="page-'+page.number+'"><h2>Page '+page.number+'</h2><img alt="Visual snapshot of original PDF page '+page.number+'" src="'+visuals[i]+'"><div class="page-text" aria-label="Reconstructed searchable text from page '+page.number+'"><h3>Recognized text</h3>'+ (page.lines.length?page.lines.map(function(line){return '<p>'+esc(line)+'</p>';}).join(''):'<p>No readable text detected; consult the original page image.</p>') + '</div></section>';
  }).join('\n');
  var html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+headingText+' · PDF to HTML</title><style>body{background:#f6f3ec;color:#171717;font:15px system-ui;margin:0;padding:20px}main{max-width:1050px;margin:auto}h1{font-size:26px}.notice,.page{background:white;border:2px solid #111;padding:18px;margin:18px 0}.notice{background:#fff0c8}.page img{display:block;max-width:100%;height:auto;margin:auto;border:1px solid #bbb}.page-text{padding:14px;margin:16px 0;background:#f6f7f7;border:1px solid #bbb}.page-text p{margin:.3em 0;line-height:1.55;overflow-wrap:anywhere}.page-text h3{font-size:15px}pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5}.question-evidence{background:white;border:1px solid #aaa;padding:10px;margin:10px 0}.question-evidence img{display:block;max-width:100%;height:auto;margin:10px auto}</style></head><body><main><h1>PDF → HTML · '+headingText+'</h1><div class="notice">Visual page snapshots preserve charts and diagrams. Text extraction may reorder tables and cannot prove which answer was selected. Check the original PDF before trusting marks. This HTML can be viewed independently. Re-importing it as a graded exam requires complete, verified exam results.</div>'+originalQuestions+body+'</main><script type="application/json" id="ledgerpeer-pdf-record">'+json+'</script></body></html>';
  return new Blob([html],{type:'text/html'});
}
function parseConvertedHtml(raw){
  var doc=new DOMParser().parseFromString(raw,'text/html'),el=doc.getElementById('ledgerpeer-pdf-record');
  if(!el)return null;
  var data;try{data=JSON.parse(el.textContent||'');}catch(e){throw new Error('The converted PDF metadata is invalid. Reconvert the original PDF.');}
  if(data.format!=='ledgerpeer-pdf-conversion-v1'||!Array.isArray(data.questions))throw new Error('This is not a valid LedgerPeer PDF conversion.');
  return {questions:data.questions,warnings:Array.isArray(data.warnings)?data.warnings:[],pageCount:data.pages||0,documentOnly:!data.questions.length};
}
root.LedgerPeerPdfReader={read:read,openDocument:open,convertToHTML:convertToHTML,parseConvertedHtml:parseConvertedHtml};
})(window);
