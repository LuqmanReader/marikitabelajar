/* Controlled PDF adapters exercise the real HTML conversion, DOM read and
 * upload handlers. This verifies ordering/data flow, not OCR model accuracy. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const base=path.resolve(__dirname,'..'),source=n=>fs.readFileSync(path.join(base,n),'utf8');
const dom=new JSDOM(source('add-exam.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),{url:'https://ledgerpeer.test/add-exam.html',runScripts:'outside-only'}),w=dom.window;
w.Blob=Blob;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Uint8Array=Uint8Array;
const events=[];
w.HTMLCanvasElement.prototype.getContext=function(){return {drawImage(){}}};
w.HTMLCanvasElement.prototype.toDataURL=function(){return 'data:image/jpeg;base64,AAAA'};
for(const n of ['subject-catalog.js','official-exam-registry.js','acca-published-data.js','syllabus-catalog.js','exam-model.js','chapter-analysis.js','revision-flow.js','pdf-ocr-parser.js','universal-pdf-document.js','universal-html-reader.js','pdf-input-health.js','pdf-page-layout.js','pdf-native-widgets.js','pdf-extraction-audit.js','pdf-html-converter.js','pdf-attempt-reader.js'])w.eval(source(n));
w.LedgerPeerPdfHtml.imageCanvas=async()=>({width:1200,height:1600,getContext:()=>({drawImage(){}})});
const bytes=Uint8Array.from(Buffer.from('%PDF-1.7\nstartxref\n9\n%%EOF'));
const stem='Calculate the total recorded cost for the following purchases using the figures in the question and show the resulting balance.';
function native(n,extra=[]){return [...extra,'Question '+n,'Correct','Mark 2.00 out of 2.00',stem,'Your answer: $40','The correct answer is: $40'];}
function setup(specs,ocr){
 events.length=0;
 w.pdfjsLib={GlobalWorkerOptions:{},getDocument:()=>({promise:Promise.resolve({numPages:specs.length,
  getPage:async n=>{
   const s=specs[n-1];if(s.failPage)throw Error('Page failure');
   return {getTextContent:async()=>{events.push('text:'+n);if(s.failText)throw Error('Text failure');return {items:(s.lines||[]).map((str,i)=>({str,width:str.length*5,height:10,transform:[1,0,0,10,20,750-i*22]}))}},
    getViewport:({scale})=>({scale,width:600*scale,height:800*scale,convertToViewportPoint:(x,y)=>[x*scale,(800-y)*scale],convertToViewportRectangle:r=>r.map(v=>v*scale)}),
    getAnnotations:async()=>s.widgets||[],render:()=>({promise:(async()=>{events.push('render:'+n);if(s.failRender)throw Error('Render failure')})()}),cleanup(){}};
  },destroy:async()=>{events.push('pdf-closed')}})})};
 w.Tesseract={createWorker:async()=>({recognize:async(...args)=>{events.push('ocr');return ocr(...args)},terminate:async()=>{events.push('ocr-closed')}})};
}
async function run(){
 setup([{lines:native(1,['Grade','10.00 out of 10.00'])}],()=>{throw Error('Native page should not use OCR')});
 const converted=await w.LedgerPeerPdfHtml.convert(bytes,null,'Test.pdf');
 let raw=await converted.text();
 assert(raw.includes('ledgerpeer-source-document'));assert(!raw.includes('ledgerpeer-pdf-record'));
 assert(!events.includes('ocr'));assert.equal(events.at(-1),'pdf-closed');
 assert.equal(w.LedgerPeerPdfHtml.parse(raw).pages[0].lines.includes(stem),true);
 const inert=w.LedgerPeerPdfHtml.parse(raw.replace('</body>','<script>window.untrusted=true</script><p onclick="alert(1)">Note</p></body>'));
 assert.equal(inert.doc.querySelectorAll('script:not([type="application/json"])').length,0);
 assert.equal(inert.doc.querySelectorAll('[onclick]').length,0);
 // Mutating only HTML changes the extracted question: the PDF is not reread.
 raw=raw.replace('<p>'+stem+'</p>','<p>HTML_ONLY_VALUE '+stem+'</p>');
 let result=await w.LedgerPeerPdfReader.readHtml(raw);
 assert(result.questions[0].qtext.includes('HTML_ONLY_VALUE'));
 assert.equal(events.filter(x=>x.startsWith('text:')).length,1);
 assert.equal(events.filter(x=>x==='ocr').length,0);
 assert.equal(result.extractionPipeline.primarySource,'converted-html');
 assert((await result.convertedHtml.text()).includes('ledgerpeer-pdf-record'));
 console.log('PASS native PDF: conversion finishes and closes PDF before HTML question extraction; no OCR.');

 setup([{lines:native(1,['Grade','4.00 out of 4.00'])},{lines:[]}],()=>({data:{text:native(2).join('\n'),confidence:97}}));
 const mixed=await w.LedgerPeerPdfHtml.convert(bytes);
 assert(!events.includes('ocr'));
 result=await w.LedgerPeerPdfReader.readHtml(await mixed.text());
 assert.deepEqual(Array.from(result.extractionPipeline.ocrPages),[2]);
 assert.deepEqual(Array.from(result.questions,q=>q.qno),[1,2]);
 assert(events.indexOf('ocr')>events.indexOf('pdf-closed'));
 assert(events.indexOf('ocr')>events.indexOf('render:2'));
 assert.equal(result.questions[0].original_marks,2);assert.equal(result.questions[1].original_marks,2);
 assert.equal(result.questions[1].your_answer,'$40');
 const completed=await result.convertedHtml.text();
 assert(completed.includes('HTML text with image recovery'));
 assert(completed.includes('lp-original-text'));
 const reimport=w.LedgerPeerPdfReader.parseConvertedHtml(completed);
 assert.equal(reimport.questions.length,2);assert.equal(reimport.extractionPipeline.primarySource,'converted-html');
 console.log('PASS mixed PDF: only the image-only HTML page uses OCR; native marks, selections and reimport survive.');

 setup([{lines:['TYMBA EDUCATION PROGRESS TEST REVIEW']}],()=>({data:{text:native(1).join('\n'),confidence:90}}));
 result=await w.LedgerPeerPdfReader.read(bytes);
 assert.deepEqual(Array.from(result.extractionPipeline.ocrPages),[1]);assert.equal(result.questions.length,1);
 console.log('PASS header-only text layer: recover question from the converted HTML image.');

 setup([{lines:native(1)},{failText:true}],()=>({data:{text:native(2).join('\n'),confidence:90}}));
 result=await w.LedgerPeerPdfReader.read(bytes);
 assert.equal(result.questions.length,2);assert.deepEqual(Array.from(result.extractionPipeline.ocrPages),[2]);
 console.log('PASS damaged text layer: HTML image backup retains and recovers the page.');

 setup([{lines:native(1)},{lines:[]}],()=>{throw Error('OCR unavailable')});
 result=await w.LedgerPeerPdfReader.read(bytes);
 assert.equal(result.questions[0].qno,1);assert.deepEqual(Array.from(result.extractionPipeline.unresolvedPages),[2]);
 assert.equal(result.extractionAudit.quality,'needs_review');assert(result.convertedHtml);
 setup([{lines:native(1)},{failPage:true}],()=>{throw Error('No image to OCR')});
 result=await w.LedgerPeerPdfReader.read(bytes);
 assert.equal(result.questions.length,1);assert.deepEqual(Array.from(result.extractionPipeline.unresolvedPages),[2]);
 console.log('PASS failed page/OCR: keep converted HTML and readable questions, flag unresolved page.');

 const subject=w.SubjectCatalog.papers.find(x=>x.code==='FA2').label;
 const meta={id:'html-first',subject,testType:'pre',testNumber:1,title:'Test',extractionPipeline:result.extractionPipeline,extractionWarnings:result.warnings,extractionAudit:result.extractionAudit};
 const prompt=w.RevisionFlow.prompt(meta,result.questions,w.LedgerSyllabus.resolve(w.localStorage,subject).topics);
 assert(prompt.includes('HTML converted from the PDF BEFORE question extraction'));
 assert(prompt.includes('"unresolvedPages":[2]'));assert(prompt.includes('EXTRACTION REPORT:'));
 assert(prompt.includes('TOPIC CLASSIFICATION RUNS HERE'));
 console.log('PASS request: HTML primary source, unresolved-page evidence and external-only topic sorting.');

 // Exercise the real upload handler, not only the reader API.
 setup([{lines:native(1,['Grade','2.00 out of 2.00'])}],()=>{throw Error('Unexpected OCR')});
 w.eval(source('attempt-entry.js'));
 const input=w.document.getElementById('sourceFile');
 Object.defineProperty(input,'files',{configurable:true,value:[{name:'upload.pdf',size:bytes.length,type:'application/pdf',arrayBuffer:async()=>bytes.buffer}]});
 input.dispatchEvent(new w.Event('change'));
 for(let i=0;i<30;i++){
  await new Promise(r=>setTimeout(r,10));
  if(/Extraction finished|Extraction stopped/.test(w.document.getElementById('entryMessage').textContent))break;
 }
 assert.match(w.document.getElementById('entryMessage').textContent,/Extraction finished/);
 assert.equal(w.document.getElementById('saveAttempt').disabled,false);
 assert.equal(w.document.getElementById('conversionResult').hidden,false);
 assert(w.document.getElementById('downloadConvertedHtml'));
 assert.equal(events.filter(x=>x==='ocr').length,0);
 console.log('PASS upload UI: automatic PDF -> HTML -> extraction, downloadable HTML and save enabled.');
}
run().then(()=>dom.window.close()).catch(e=>{console.error(e);dom.window.close();process.exitCode=1});
