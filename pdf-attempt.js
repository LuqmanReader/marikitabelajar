/* LedgerPeer PDF-first attempt importer. Extraction runs on-device using PDF.js
   text layer or Tesseract OCR; no file is uploaded to the AI provider. */
(function(root){
 'use strict';
 const F=root.RevisionFlow, $=id=>document.getElementById(id);
 const state={busy:false,run:0};
 const KIND=/\b(FA1|MA1|FA2|MA2|FBT|FMA|FFA|FAU|FFM|FTX|SBL|SBR|AFM|APM|ATX|AAA|BT|MA|FA|LW|PM|TX|FR|AA|FM)\b[^\n]{0,90}?\b(Progress\s*Test|Pre\s*Test|Mock(?:\s*(?:Test|Exam))?|Set)\s*#?\s*(\d+)/i;
 function tidy(s){return String(s||'').replace(/\r/g,'').replace(/[\u00a0\u200b]/g,' ').replace(/[\t ]+$/gm,'').replace(/\n{3,}/g,'\n\n').trim();}
 function detectMetadata(s){
  const m=String(s).match(KIND); if(!m)return null;
  const p=root.SubjectCatalog.papers.find(x=>x.code===m[1].toUpperCase());
  if(!p)return null;
  return {subject:p.label,testType:/set/i.test(m[2])?'set':/mock/i.test(m[2])?'mock':'pre',testNumber:Number(m[3])};
 }
 function cleanPageText(s){return tidy(s).replace(/^https?:\/{1,2}[^\s]+\s+(\d+)\/\d+\s*$/gm,'');}
 function parsePage(raw,pageNumber){
  const s=cleanPageText(raw);
  const matcher=/^\s*Question\s+(\d{1,3})[.:\s]*$/gim;
  const anchors=[];let m;
  while((m=matcher.exec(s)))anchors.push({qno:Number(m[1]),at:m.index,end:matcher.lastIndex});
  const parts=[];
  for(let i=0;i<anchors.length;i++){
   const a=anchors[i],b=anchors[i+1];
   const block=tidy(s.slice(a.end,b?b.at:undefined));
   if(block.length<30)continue;
   const first=block.slice(0,220);
   const label=first.match(/(?:^|\n)\s*(Partially\s+correct|Not\s+answered|Incorrect|Correct)\b/i);
   let result=label?label[1].toLowerCase().replace(/\s+/g,' '):'';
   const award=first.match(/Mar[k]?\s*[:\s]*(\d+(?:[.,]\d{1,2})?)\s+out\s+of\s+(\d+(?:[.,]\d{1,2})?)/i);
   const mark=award?Number(award[1].replace(',','.')):null;
   const possible=award?Number(award[2].replace(',','.')):null;
   if(!result&&/Your answer is (?:in)?correct/i.test(block))result=(/Your answer is incorrect/i.test(block)?'incorrect':'correct');
   if(!result&&Number.isFinite(mark)&&Number.isFinite(possible)&&possible>0)result=mark===possible?'correct':mark===0?'incorrect':'partially correct';
   const graded=result==='correct'?true:['incorrect','partially correct','not answered'].includes(result)?false:null;
   const correct=block.match(/(?:The\s+correct\s+answers?\s+(?:is|are)\s*:?|The\s+correct\s+answer\s*:)\s*([\s\S]*?)(?=\n\s*https?:\/{1,2}|$)/i);
   const endOfQuestion=block.search(/(?:^|\n)\s*(?:Your answer is|The correct answers? (?:is|are))\b/i);
   const before=endOfQuestion>=0?block.slice(0,endOfQuestion):block;
   const qtext=tidy(before.replace(/^[\s\S]*?\b\d{1,3}[.,]\d{2}\s+out\s+of\s+100[.,]00\s*\n/i,'').replace(/^\s*(?:Partially\s+correct|Not\s+answered|Incorrect|Correct)\s*\n/i,'').replace(/^\s*[‘'\"]?Mar[k]?\s*[:\s]*[\d.,]+\s+out\s+of\s+[\d.,]+\s*\n/i,'').replace(/^\s*\d{1,2}\/\d{1,2}\/\d{2,4}.*?(?:TYMBAFlex)?\s*\n/i,'').replace(/^\s*[‘'\"]?Mar[k]?\s*[:\s]*[\d.,]+\s+out\s+of\s+[\d.,]+\s*\n/i,''));
   const feedback=block.slice(Math.max(0,endOfQuestion));
   parts.push({qno:a.qno,is_correct:graded,qtext:qtext,options:[],your_answer:null,correct_answer:correct?tidy(correct[1]).slice(0,2500):'',debrief:'',chapter:'',pdf_page:pageNumber,source_format:'pdf',source_result:result||'unknown',original_marks:Number.isFinite(mark)?mark:null,original_max_marks:Number.isFinite(possible)?possible:null,source_feedback:tidy(feedback).slice(0,3500)});
  }
  return parts;
 }
 function inspect(all){
  const byNo=new Map(),duplicates=[];
  for(const q of all){if(byNo.has(q.qno))duplicates.push(q.qno);else byNo.set(q.qno,q);}
  const ordered=Array.from(byNo.values()).sort((a,b)=>a.qno-b.qno);
  const top=ordered.length?ordered[ordered.length-1].qno:0;
  const missing=[];for(let i=1;i<=top;i++)if(!byNo.has(i))missing.push(i);
  const ungraded=ordered.filter(q=>q.is_correct===null).map(q=>q.qno);
  const unreadable=ordered.filter(q=>q.qtext.length<20).map(q=>q.qno);
  return {ordered,top,missing,duplicates,ungraded,unreadable};
 }
 function note(txt){$('pdfStatus').textContent=txt;}
 function progress(done,total,txt){$('pdfProgress').max=total;$('pdfProgress').value=done;note(txt);}
 function loadScript(url){return new Promise((resolve,reject)=>{const x=document.createElement('script');x.src=url;x.onload=resolve;x.onerror=()=>reject(Error('Could not load PDF reading library. Check your connection and try again.'));document.head.appendChild(x);});}
 async function readPdf(file){
  if(!root.pdfjsLib)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  root.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf=await root.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  const combined=[];let header='',ocrWorker=null;
  try{
   for(let i=1;i<=pdf.numPages;i++){
    progress(i-1,pdf.numPages,'Reading PDF page '+i+' of '+pdf.numPages+'…');
    const page=await pdf.getPage(i);
    const layer=await page.getTextContent();
    let txt=layer.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('');
    if(txt.length<100||!/^\s*Question\s+\d+/im.test(txt)){
     if(!root.Tesseract)await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
     if(!ocrWorker){note('Preparing on-device PDF image reader…');ocrWorker=await root.Tesseract.createWorker('eng');}
     const viewport=page.getViewport({scale:2});
     const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
     const ctx=canvas.getContext('2d',{willReadFrequently:true});
     await page.render({canvasContext:ctx,viewport}).promise;
     const result=await ocrWorker.recognize(canvas);txt=result.data.text;
     canvas.width=canvas.height=0;
    }
    if(i===1)header=txt;
    combined.push(...parsePage(txt,i));
    progress(i,pdf.numPages,'Read page '+i+'/'+pdf.numPages+' · '+combined.length+' questions detected.');
   }
  }finally{if(ocrWorker)await ocrWorker.terminate();}
  return {questions:combined,header,pages:pdf.numPages};
 }
 async function save(questions,detected,pdf){
  const graded=questions.filter(x=>typeof x.is_correct==='boolean');
  const correct=graded.filter(x=>x.is_correct).length;
  const id='attempt-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);
  const meta={id,subject:detected.subject,testType:detected.testType,testNumber:detected.testNumber,setChapter:'',setTotal:null,attemptedAt:new Date().toISOString(),createdAt:new Date().toISOString(),sourceFormat:'pdf',total:graded.length,correct,totalQuestions:questions.length,title:(detected.testType==='set'?'Set':detected.testType==='pre'?'Progress Test':'Mock Test')+' '+detected.testNumber,file:'view.html?id='+encodeURIComponent(id),topics:{}};
  const current=JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]');
  if(!Array.isArray(current))throw Error('Saved attempt list is unavailable.');
  const key='tymba_exam_data:'+id;
  F.save(localStorage,key,questions);
  try{F.save(localStorage,'tymba_custom_exams',current.concat([meta]));}
  catch(e){localStorage.removeItem(key);throw e;}
  progress(pdf.pages,pdf.pages,'Saved '+questions.length+' questions locally. Opening automatic topic analysis…');
  location.href=meta.file+'&auto_analyze=1';
 }
 async function onPdf(file){
  if(!file)return;
  if(state.busy)return;
  if(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf'){note('Only completed attempt-review PDF files are supported.');return;}
  state.busy=true;$('pdfFile').disabled=true;$('pdfProgress').hidden=false;
  try{
   progress(0,1,'Opening your PDF…');
   const result=await readPdf(file);
   const check=inspect(result.questions);const detected=detectMetadata(result.header);
   if(!detected)throw Error('Could not determine the paper and attempt number from this PDF. No attempt was saved.');
   if(!check.ordered.length)throw Error('No numbered questions found. Make sure this is the completed attempt-review PDF.');
   if(check.duplicates.length||check.missing.length||check.ungraded.length||check.unreadable.length){
    const details=[];
    if(check.duplicates.length)details.push('duplicate numbers '+check.duplicates.join(', '));
    if(check.missing.length)details.push('missing numbers '+check.missing.join(', '));
    if(check.ungraded.length)details.push('unknown marks for '+check.ungraded.join(', '));
    if(check.unreadable.length)details.push('unreadable question text '+check.unreadable.join(', '));
    throw Error('Some pages need a clearer PDF ('+details.join('; ')+'). No incomplete attempt was saved.');
   }
   note(detected.subject+' · '+check.ordered.length+' questions · saving…');
   await save(check.ordered,detected,result);
  }catch(e){note('Could not import PDF: '+(e&&e.message?e.message:String(e)));}
  finally{state.busy=false;$('pdfFile').disabled=false;}
 }
 root.LedgerPeerPdfImport={parsePage,inspect,detectMetadata};
 if($('pdfFile'))$('pdfFile').addEventListener('change',function(){onPdf(this.files[0]);});
})(window);
