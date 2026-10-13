/* LedgerPeer PDF-first attempt importer. Extraction runs on-device using PDF.js
   text layer or Tesseract OCR; no file is uploaded to the AI provider. */
(function(root){
 'use strict';
 const F=root.RevisionFlow, $=id=>document.getElementById(id);
 const state={busy:false,run:0,pending:null};

 function tidy(s){return String(s||'').replace(/\r/g,'').replace(/[\u00a0\u200b]/g,' ').replace(/[\t ]+$/gm,'').replace(/\n{3,}/g,'\n\n').trim();}


 function selectedMetadata(){
  const subject=$('pdfSubject').value;
  const testType=$('pdfTestType').value;
  const rawNumber=$('pdfTestNumber').value.trim();
  const testNumber=Number(rawNumber);
  if(!root.SubjectCatalog.labels.includes(subject))throw Error('Choose the FIA or ACCA paper before uploading.');
  if(!['set','pre','mock'].includes(testType))throw Error('Choose Chapter Set, Progress Test or Mock Test.');
  if(!/^\d+$/.test(rawNumber)||!Number.isSafeInteger(testNumber)||testNumber<1||testNumber>999)throw Error('Enter an attempt number between 1 and 999.');
  const setChapter=testType==='set'?$('pdfSetChapter').value.trim():'';
  if(setChapter.length>420)throw Error('The chapter name is too long.');
  if(setChapter&&root.LedgerSyllabus){
   const resolved=root.LedgerSyllabus.resolve(localStorage,subject);
   if(resolved.verified&&!resolved.topics.some(x=>x.toLowerCase()===setChapter.toLowerCase()))
    throw Error('Choose an exact ACCA syllabus topic from the Chapter Set suggestions.');
  }
  return {subject,testType,testNumber,setChapter};
 }
 function updateFormatReference(){
  const host=$('pdfFormatReference');if(!host)return;
  const paper=$('pdfSubject').value;
  const ref=root.LedgerOfficialExamRegistry&&root.LedgerOfficialExamRegistry.get(paper);
  host.replaceChildren();
  if(!ref){host.textContent='Choose your FIA or ACCA paper to view the official exam structure.';return;}
  const format=ref.format,descriptions=format.sections.map(s=>s.name+': '+s.count+' '+s.kind+' ('+(s.marks||s.count*s.marksEach)+' marks)').join(' · ');
  const note=document.createElement('strong');
  note.textContent=ref.code+' · '+(format.mode==='on-demand'?'On-demand CBE':'Session-based CBE')+
    (format.durationMinutes?' · '+format.durationMinutes+' minutes':'')+
    ' · '+format.marks+' marks';
  host.appendChild(note);
  const detail=document.createElement('span');
  detail.textContent=descriptions?'. Full-exam pattern: '+descriptions+'. Chapter sets and progress tests may contain fewer questions.':'. Detailed full-exam section breakdown still needs verification from ACCA.';
  host.appendChild(detail);
  const source=document.createElement('a');source.href=ref.formatSource;source.target='_blank';source.rel='noopener noreferrer';source.textContent=' Official ACCA reference ↗';
  host.appendChild(source);
  if(['LW','TX','ATX','FTX','AAA','SBR'].includes(ref.code)){
   const variant=document.createElement('em');
   variant.textContent=' · Reference version: '+ref.variant+'. The actual syllabus must match your registered examination variant.';
   host.appendChild(variant);
  }
 }
 function updateTopicOptions(){
  const chosen=$('pdfSubject').value;
  const syllabus=root.LedgerSyllabus&&root.LedgerSyllabus.resolve(localStorage,chosen);
  const options=$('pdfTopicOptions');
  options.replaceChildren();
  if(syllabus&&syllabus.topics.length){
   for(const name of syllabus.topics){const option=document.createElement('option');option.value=name;options.appendChild(option);}
   $('pdfSetChapter').placeholder='Choose from '+syllabus.topics.length+' approved syllabus topics';
  }else{
   $('pdfSetChapter').placeholder='Syllabus setup required after PDF upload';
  }
 }
 function refreshMetadata(){
  let ready=true;
  try{selectedMetadata();}catch(e){ready=false;}
  $('pdfFile').disabled=state.busy||!ready;
  $('pdfChapterWrap').hidden=$('pdfTestType').value!=='set';
  return ready;
 }
 function setupMetadata(){
  const paper=$('pdfSubject');
  root.SubjectCatalog.fill(paper);
  const empty=document.createElement('option');empty.value='';empty.textContent='Choose your paper';
  paper.insertBefore(empty,paper.firstChild);paper.value='';
  ['pdfSubject','pdfTestType','pdfTestNumber','pdfSetChapter'].forEach(id=>{
   $(id).addEventListener('change',()=>{
    if(id==='pdfSubject'){ $('pdfSetChapter').value='';updateTopicOptions();updateFormatReference(); }
    const ready=refreshMetadata();
    if(!state.busy&&!state.pending)note(ready?'Details ready. Select your marked attempt PDF.':'Choose the paper, attempt type and attempt number first.');
   });
  });
  updateTopicOptions();updateFormatReference();refreshMetadata();
  note('Choose the paper, attempt type and attempt number first, then upload the marked PDF.');
 }
 function cleanPageText(s){return tidy(s).replace(/^https?:\/{1,2}[^\s]+\s+(\d+)\/\d+\s*$/gm,'');}
 function parsePage(raw,pageNumber){
  const s=cleanPageText(raw);
  // Match numbered questions in common FIA/ACCA attempt-review exports, including
  // "Question 4", "Question 4:", "Question 4 of 50", "Question 4 (2 marks)".
  // Never treat a subquestion (4a) as a separate full-exam question.
  const matcher=/^\s*Question\s+(\d{1,3})(?:\s*(?:[.:]|of\s+\d{1,3}|\(\s*\d+(?:\.\d+)?\s*marks?\s*\)))?\s*$/gim;
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
  const combined=[];let ocrWorker=null;
  try{
   for(let i=1;i<=pdf.numPages;i++){
    progress(i-1,pdf.numPages,'Reading PDF page '+i+' of '+pdf.numPages+'…');
    const page=await pdf.getPage(i);
    const layer=await page.getTextContent();
    let txt=layer.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('');
    if(txt.length<100||!/^\s*Question\s+\d{1,3}\b/im.test(txt)){
     if(!root.Tesseract)await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
     if(!ocrWorker){note('Preparing on-device PDF image reader…');ocrWorker=await root.Tesseract.createWorker('eng');}
     const viewport=page.getViewport({scale:2});
     const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
     const ctx=canvas.getContext('2d',{willReadFrequently:true});
     await page.render({canvasContext:ctx,viewport}).promise;
     const result=await ocrWorker.recognize(canvas);txt=result.data.text;
     canvas.width=canvas.height=0;
    }
    combined.push(...parsePage(txt,i));
    progress(i,pdf.numPages,'Read page '+i+'/'+pdf.numPages+' · '+combined.length+' questions detected.');
   }
  }finally{if(ocrWorker)await ocrWorker.terminate();}
  return {questions:combined,pages:pdf.numPages};
 }
 async function save(questions,detected,pdf){
  const graded=questions.filter(x=>typeof x.is_correct==='boolean');
  const correct=graded.filter(x=>x.is_correct).length;
  const id='attempt-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);
  const meta={id,subject:detected.subject,testType:detected.testType,testNumber:detected.testNumber,setChapter:detected.setChapter||'',setTotal:null,attemptedAt:new Date().toISOString(),createdAt:new Date().toISOString(),sourceFormat:'pdf',total:graded.length,correct,totalQuestions:questions.length,title:(detected.testType==='set'?'Set':detected.testType==='pre'?'Progress Test':'Mock Test')+' '+detected.testNumber,file:'view.html?id='+encodeURIComponent(id),topics:{}};
  const current=JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]');
  if(!Array.isArray(current))throw Error('Saved attempt list is unavailable.');
  const key='tymba_exam_data:'+id;
  F.save(localStorage,key,questions);
  try{F.save(localStorage,'tymba_custom_exams',current.concat([meta]));}
  catch(e){localStorage.removeItem(key);throw e;}
  progress(pdf.pages,pdf.pages,'Saved '+questions.length+' questions. Opening ChatGPT debrief workflow…');
  location.href=meta.file+'#chatgpt-debrief';
 }
 function renderVerification(questions,detected){
  const host=$('pdfVerify');host.hidden=false;host.replaceChildren();
  const title=document.createElement('h2');title.textContent='Review the PDF scan';host.appendChild(title);
  const explanation=document.createElement('p');explanation.textContent='Selected paper: '+detected.subject+' · '+questions.length+' questions detected. Confirm the marks and questions below. LedgerPeer uses your selected paper, not an automatic guess from the PDF.';host.appendChild(explanation);
  const list=document.createElement('div');list.className='pdf-scan-list';host.appendChild(list);
  for(const q of questions){
   const card=document.createElement('details');card.className='pdf-scan-question';
   const heading=document.createElement('summary');card.appendChild(heading);
   function updateHeading(){
     const award=q.original_marks==null?'marks unclear':q.original_marks+' / '+q.original_max_marks+' marks';
     heading.textContent='Q'+q.qno+' · '+(q.source_result||'UNVERIFIED').toUpperCase()+' · '+award+' · PDF page '+q.pdf_page;
   }
   updateHeading();
   const body=document.createElement('pre');body.textContent=q.qtext||'[OCR could not read this question. Attach the original PDF in ChatGPT.]';card.appendChild(body);
   const label=document.createElement('label');label.textContent='Check marking status · ';card.appendChild(label);
   const sel=document.createElement('select');sel.setAttribute('aria-label','Marking for question '+q.qno);
   for(const [value,text] of [['correct','Correct'],['incorrect','Incorrect'],['partially correct','Partially correct'],['not answered','Not answered'],['unknown','Unreadable / not verified']]){
     const op=document.createElement('option');op.value=value;op.textContent=text;sel.appendChild(op);
   }
   sel.value=q.source_result||'unknown';label.appendChild(sel);
   sel.addEventListener('change',()=>{
     if(!q.ocr_source_result)q.ocr_source_result=q.source_result;
     q.source_result=sel.value;
     q.is_correct=sel.value==='correct'?true:sel.value==='unknown'?null:false;
     if(sel.value==='correct'&&q.original_max_marks!=null)q.original_marks=q.original_max_marks;
     else if((sel.value==='incorrect'||sel.value==='not answered')&&q.original_max_marks!=null)q.original_marks=0;
     updateHeading();
   });
   const marks=document.createElement('div');marks.className='pdf-scan-marks';card.appendChild(marks);
   for(const [field,display] of [['original_marks','Awarded marks'],['original_max_marks','Maximum marks']]){
     const markLabel=document.createElement('label');markLabel.textContent=display+' · ';
     const inp=document.createElement('input');inp.type='number';inp.min='0';inp.step='0.5';inp.setAttribute('aria-label',display+' for question '+q.qno);
     if(q[field]!=null)inp.value=q[field];markLabel.appendChild(inp);marks.appendChild(markLabel);
     inp.addEventListener('change',()=>{
       const value=inp.value.trim()===''?null:Number(inp.value);
       if(value!==null&&(!Number.isFinite(value)||value<0)){inp.value=q[field]==null?'':String(q[field]);return;}
       if(!q.ocr_marks_recorded){q.ocr_original_marks=q.original_marks;q.ocr_original_max_marks=q.original_max_marks;q.ocr_marks_recorded=true;}
       q[field]=value;
       if(q.original_marks!==null&&q.original_max_marks>0){
         q.is_correct=q.original_marks===q.original_max_marks;
         q.source_result=q.is_correct?'correct':q.original_marks>0?'partially correct':'incorrect';
         sel.value=q.source_result;
       }
       updateHeading();
     });
   }
   const keyLabel=document.createElement('label');keyLabel.textContent='Recorded correct answer (editable if OCR misread)';card.appendChild(keyLabel);
   const answer=document.createElement('textarea');answer.rows=2;answer.setAttribute('aria-label','Correct answer for question '+q.qno);answer.value=q.correct_answer||'';keyLabel.appendChild(answer);
   answer.addEventListener('change',()=>{if(!q.ocr_correct_answer)q.ocr_correct_answer=q.correct_answer;q.correct_answer=answer.value.trim();});
   list.appendChild(card);
  }
  const row=document.createElement('div');row.className='flow-actions';
  const approve=document.createElement('button');approve.type='button';approve.className='flow-button primary';approve.textContent='Confirm scan & prepare ChatGPT request';
  approve.addEventListener('click',async function(){
   if(!state.pending)return;
   const unknown=state.pending.questions.filter(q=>q.is_correct===null).map(q=>q.qno);
   if(unknown.length){note('Verify the grading for questions '+unknown.join(', ')+' before saving.');return;}
   approve.disabled=true;
   try{await save(state.pending.questions,selectedMetadata(),state.pending.result);}
   catch(e){note('Could not save the attempt: '+(e.message||e));approve.disabled=false;}
  });
  const retry=document.createElement('button');retry.type='button';retry.className='flow-button secondary';retry.textContent='Choose a different PDF';
  retry.addEventListener('click',function(){state.pending=null;host.hidden=true;host.replaceChildren();$('pdfFile').value='';note('Choose another completed attempt-review PDF.');});
  row.append(approve,retry);host.appendChild(row);
 }
 async function onPdf(file){
  if(!file)return;
  if(state.busy)return;
  try{selectedMetadata();}catch(e){note(e.message);$('pdfFile').value='';return;}
  $('pdfVerify').hidden=true;$('pdfVerify').replaceChildren();state.pending=null;
  if(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf'){note('Only completed attempt-review PDF files are supported.');return;}
  state.busy=true;$('pdfFile').disabled=true;$('pdfProgress').hidden=false;
  try{
   progress(0,1,'Opening your PDF…');
   const result=await readPdf(file);
   const check=inspect(result.questions);const detected=selectedMetadata();
   if(!check.ordered.length)throw Error('No numbered questions found. Make sure this is the completed attempt-review PDF.');
   if(check.duplicates.length||check.missing.length){
    const details=[];
    if(check.duplicates.length)details.push('duplicate numbers '+check.duplicates.join(', '));
    if(check.missing.length)details.push('missing numbers '+check.missing.join(', '));
    if(check.ungraded.length)details.push('unknown marks for '+check.ungraded.join(', '));
    if(check.unreadable.length)details.push('unreadable question text '+check.unreadable.join(', '));
    throw Error('Some pages need a clearer PDF ('+details.join('; ')+'). No incomplete attempt was saved.');
   }
   state.pending={questions:check.ordered,detected:detected,result:result};
   renderVerification(check.ordered,detected);
   note('Extracted '+check.ordered.length+' questions. Check the grades and correct answers. Expand any question to fix OCR mistakes.'+(check.ungraded.length?' Marking needs confirmation for questions '+check.ungraded.join(', ')+'.':'')+(check.unreadable.length?' Some question text is unclear; attach the original PDF in ChatGPT for verification.':''));
  }catch(e){note('Could not import PDF: '+(e&&e.message?e.message:String(e)));}
  finally{state.busy=false;refreshMetadata();}
 }
 root.LedgerPeerPdfImport={parsePage,inspect,selectedMetadata};
 if($('pdfFile')){setupMetadata();$('pdfFile').addEventListener('change',function(){onPdf(this.files[0]);});}
})(window);
