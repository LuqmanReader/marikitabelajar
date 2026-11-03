/* LedgerPeer correction PDF exporter.
   Produces a student-editable correction worksheet and optional original-PDF appendix
   from a saved attempt. Never silently changes original grades or lecturer keys. */
(function(root){
 'use strict';
 const PREFIX='ledgerpeer_correction_notes:';
 const LIB='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
 const DOC_TITLE='LEDGERPEER | EXAM CORRECTIONS';
 const A4=[595.28,841.89];

 function clean(value){
   const raw=String(value==null?'':value);
   if(typeof DOMParser==='undefined')return raw.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
   const doc=new DOMParser().parseFromString(raw,'text/html');
   doc.querySelectorAll('script,style,iframe,object,embed').forEach(x=>x.remove());
   doc.querySelectorAll('img,svg,canvas').forEach(x=>x.replaceWith(doc.createTextNode(' [Figure or chart: see original attempt PDF] ')));
   doc.querySelectorAll('br,tr,p,li,table').forEach(x=>x.appendChild(doc.createTextNode('\n')));
   return (doc.body.textContent||'').replace(/\r/g,'').replace(/[\t ]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
 }
 function pdfSafe(value){
  return clean(value).normalize('NFKD')
   .replace(/[\u0300-\u036f]/g,'')
   .replace(/[\u2010-\u2015\u2212]/g,'-')
   .replace(/[\u2018\u2019]/g,"'")
   .replace(/[\u201c\u201d]/g,'"')
   .replace(/[\u00d7]/g,'x').replace(/[\u00f7]/g,'/')
   .replace(/[\u2265]/g,'>=').replace(/[\u2264]/g,'<=')
   .replace(/[\u2192]/g,'->').replace(/[\u00a3]/g,'GBP ')
   .replace(/[\u20ac]/g,'EUR ').replace(/[\u2022]/g,'-')
   .replace(/[^\x0a\x20-\x7e]/g,'?');
 }
 function filename(value){return String(value||'attempt').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'').slice(0,65)||'attempt';}
 function eligible(q){return q.is_correct!==true;}
 function questionsFor(questions,mode){
  return (questions||[]).filter(q=>mode==='all'||eligible(q));
 }
 function storedNotes(key){
  try{const x=JSON.parse(root.localStorage.getItem(PREFIX+key)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}catch{return {};}
 }
 function saveNotes(key,notes){root.localStorage.setItem(PREFIX+key,JSON.stringify(notes));}
 function correction(q,manual){
  manual=manual||{};
  const workings=String(manual.workings||q.calculation||'').trim();
  const explanation=String(manual.explanation||q.reasoning||'').trim();
  const justification=String(q.justification||'').trim();
  const notes=String(manual.notes||'').trim();
  return {qno:q.qno,source:q,workings,explanation,justification,notes,
   proposedAnswer:String(manual.proposedAnswer||'').trim(),
   complete:!!(workings||explanation||justification||notes||q.debrief)};
 }
 function compose(meta,questions,manual,mode,includeOriginal){
  const rows=questionsFor(questions,mode).map(q=>correction(q,manual[String(q.qno)]||{}));
  const missing=rows.filter(x=>!x.complete).map(x=>x.qno);
  return {meta,rows,missing,draft:missing.length>0,includeOriginal:!!includeOriginal};
 }
 function wrap(text,font,size,maxWidth){
  const lines=[];
  // PDF text layout must never produce a line wider than the printable area.
  for(const para of pdfSafe(text).split('\n')){
   if(!para.trim()){lines.push('');continue;}
   let line='';
   for(const word of para.split(/\s+/)){
    if(!word)continue;
    const candidate=line?line+' '+word:word;
    if(font.widthOfTextAtSize(candidate,size)<=maxWidth){line=candidate;continue;}
    if(line){lines.push(line);line='';}
    let chunk='';
    for(const char of word){
     if(chunk&&font.widthOfTextAtSize(chunk+char,size)>maxWidth){lines.push(chunk);chunk='';}
     chunk+=char;
    }
    line=chunk;
   }
   if(line)lines.push(line);
  }
  return lines;
 }
 async function lib(){
  if(root.PDFLib)return root.PDFLib;
  await new Promise((resolve,reject)=>{
   const x=document.createElement('script');x.src=LIB;x.async=true;
   x.onload=resolve;x.onerror=()=>reject(Error('Could not load PDF generation library. Check your connection.'));
   document.head.appendChild(x);
  });
  if(!root.PDFLib)throw Error('PDF generation library did not initialise.');
  return root.PDFLib;
 }
 async function generate(plan,originalPdf){
  const L=await lib(),out=await L.PDFDocument.create();
  out.setTitle('Exam corrections - '+pdfSafe(plan.meta.title||'Attempt').slice(0,120));
  out.setAuthor('LedgerPeer - learner-generated corrections');
  out.setSubject('Student corrections from a saved exam attempt; original marking retained');
  const roman=await out.embedFont(L.StandardFonts.Helvetica);
  const bold=await out.embedFont(L.StandardFonts.HelveticaBold);
  const ink=L.rgb(0.09,0.09,0.09),grey=L.rgb(0.39,0.39,0.39),red=L.rgb(0.65,0.15,0.12);
  const margin=46,top=53,bottom=59,width=A4[0]-margin*2;
  let page,y,section=0;
  function newPage(){
   page=out.addPage(A4);section++;
   y=A4[1]-top;
   page.drawText(DOC_TITLE,{x:margin,y:A4[1]-32,size:10,font:bold,color:ink});
   page.drawLine({start:{x:margin,y:A4[1]-38},end:{x:A4[0]-margin,y:A4[1]-38},thickness:0.7,color:grey});
  }
  function need(space){if(y-space<bottom)newPage();}
  function lines(text,size=10,font=roman,color=ink,lineHeight=15){
   const blocks=wrap(text,font,size,width);
   for(const l of blocks){
    need(lineHeight);
    if(l)page.drawText(l,{x:margin,y,size,font,color});
    y-=lineHeight;
   }
  }
  function heading(label){
   need(33);y-=6;lines(label.toUpperCase(),10.6,bold,ink,18);
  }
  function field(label,value){
   heading(label);lines(value||'Not provided.',10,roman,ink,15);y-=5;
  }
  newPage();
  need(140);
  lines(pdfSafe(plan.meta.title||'Saved attempt'),19,bold,ink,28);
  lines('Paper: '+pdfSafe(plan.meta.subject||'Not recorded'),11,bold,ink,17);
  lines('Test: '+pdfSafe(plan.meta.testType||'exam')+' '+pdfSafe(plan.meta.testNumber||''),10,roman,ink,16);
  lines('Exported: '+new Date().toISOString().slice(0,10),10,roman,grey,16);
  lines('Items: '+plan.rows.length+' | Corrections awaiting completion: '+plan.missing.length,10,bold,plan.draft?red:ink,18);
  if(plan.draft){
   lines('DRAFT - NOT READY FOR LECTURER SUBMISSION. Unfinished questions: '+plan.missing.join(', ')+'.',10,bold,red,17);
  }
  lines('Original lecturer marks and answer keys remain unchanged. Any proposed correction is shown separately.',9,roman,grey,14);
  lines(plan.includeOriginal&&originalPdf?'The original marked attempt is appended after the corrections.':'Only extracted text is included. Embedded/external figures may be missing; consult the original exam for charts.',9,roman,grey,15);
  y-=15;
  if(!plan.rows.length){heading('No questions to correct');lines('This attempt does not contain any incorrect or partially credited questions for the selected filter.');}
  for(const item of plan.rows){
   const q=item.source;
   newPage();
   lines('QUESTION '+q.qno+(q.is_correct===true?' - REVIEW':' - CORRECTION'),15,bold,ink,24);
   lines('Original grading: '+(q.original_marks==null?'Unverified':q.original_marks)+' / '+(q.original_max_marks==null?'?':q.original_max_marks)+' marks'
    +(q.pdf_page?' | Original PDF page '+q.pdf_page:''),9,roman,grey,17);
   field('Original question',q.qtext||'Text could not be extracted. Refer to original PDF.');
   if(q.information)field('Shared question information',q.information);
   const choices=(q.options||[]).map(o=>(o.checked?'[Selected] ':'[ ] ')+clean(o.text)).filter(Boolean);
   if(choices.length)field('Answer options',choices.join('\n'));
   field('Student submitted answer',q.your_answer||'Not captured from the uploaded file.');
   field('Recorded answer key',q.correct_answer||'Not captured from the uploaded file.');
   if(item.proposedAnswer)field('Proposed corrected answer (student-editable)',item.proposedAnswer);
   field('Correct method and calculations',item.workings||'Correction workings not yet supplied.');
   field('Explanation',item.explanation||q.debrief||'Explanation not yet supplied.');
   if(item.justification)field('Justification / identified mistake',item.justification);
   if(q.topic_reason)field('Syllabus classification evidence',q.topic_reason);
   if(item.notes)field('Student notes',item.notes);
   if(q.focus)field('Practise next',q.focus);
   if(q.forecast)field('AI forecast - '+(q.evidence_status||'unverified'),q.forecast);
   if(/<img\b|<svg\b|<canvas\b|\[Image unavailable/i.test(q.qtext||'')||q.visual_review_required){
     lines('VISUAL EVIDENCE: Check the original PDF; a reconstructed HTML text extract cannot confirm missing chart or diagram values.',9,bold,red,15);
   }
  }
  // Append the exact original PDF instead of pretending a text/HTML reconstruction
  // preserves diagrams. This is the student's optional evidence appendix.
  if(plan.includeOriginal&&originalPdf){
   let original;
   try{original=await L.PDFDocument.load(await originalPdf.arrayBuffer(),{ignoreEncryption:false});}
   catch(e){throw Error('Could not append the original PDF: '+(e.message||e));}
   const sourcePages=await out.copyPages(original,original.getPageIndices());
   for(const copied of sourcePages)out.addPage(copied);
  }
  // Footer on the generated correction section only; source PDF stays untouched.
  const all=out.getPages();
  const total=all.length;
  for(let i=0;i<section;i++){
   const p=all[i];
   p.drawLine({start:{x:margin,y:41},end:{x:A4[0]-margin,y:41},thickness:0.5,color:grey});
   p.drawText('Learner correction | '+(plan.draft?'DRAFT':'Reviewed')+' | Page '+(i+1)+' of '+total,
    {x:margin,y:28,size:8,font:roman,color:grey});
  }
  return out.save();
 }
 async function download(bytes,name){
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);
  a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 function statusSummary(plan){
  if(!plan.rows.length)return 'No questions match this filter.';
  return plan.missing.length
   ?plan.rows.length+' questions selected. '+plan.missing.length+' still need workings or an explanation. You can export a clearly labelled draft, or fill the fields first.'
   :plan.rows.length+' corrections have explanations/workings. Ready to generate the PDF.';
 }
 function input(label,initial,onChange,rows=3){
  const wrap=document.createElement('label');
  wrap.style.cssText='display:block;margin:12px 0;font-weight:750';
  const name=document.createElement('span');name.textContent=label;
  const area=document.createElement('textarea');area.value=initial;area.rows=rows;
  area.style.cssText='display:block;width:100%;min-height:66px;resize:vertical;padding:9px;border:2px solid #111;font:14px/1.4 system-ui,sans-serif;margin-top:6px';
  area.addEventListener('change',()=>onChange(area.value));
  area.addEventListener('input',()=>onChange(area.value));
  wrap.append(name,area);return wrap;
 }
 async function mount(anchor,meta,questions){
  if(!anchor||!meta||!Array.isArray(questions))return;
  const panel=document.createElement('section');
  panel.className='flow-panel';panel.id='correctionPdfPanel';
  panel.style.cssText='margin:20px 0;padding:20px;border:4px solid #111;background:#fff;box-shadow:7px 7px 0 #111';
  const h=document.createElement('h2');h.textContent='Download your corrected exam PDF';panel.appendChild(h);
  const p=document.createElement('p');
  p.textContent='Create one correction PDF from your saved HTML or PDF attempt. Add or edit workings before export; the original marks and recorded answer key will not change.';
  panel.appendChild(p);
  const controls=document.createElement('div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0';
  panel.appendChild(controls);
  const select=document.createElement('select');select.setAttribute('aria-label','Questions included in correction PDF');
  for(const [value,label] of [['incorrect','Incorrect, partial and ungraded questions'],['all','All questions']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;select.appendChild(option);
  }
  select.style.cssText='max-width:100%;padding:10px;border:2px solid #111;font:inherit';
  controls.appendChild(select);
  const originalLabel=document.createElement('label');originalLabel.style.cssText='display:flex;gap:7px;align-items:center;font-size:13px;font-weight:750';
  const originalToggle=document.createElement('input');originalToggle.type='checkbox';originalToggle.checked=true;
  originalLabel.append(originalToggle,document.createTextNode('Append original exam PDF when available'));controls.appendChild(originalLabel);
  const sourceLabel=document.createElement('label');sourceLabel.style.cssText='display:block;font-size:13px;font-weight:700;margin:9px 0';
  sourceLabel.textContent='Optional: attach the original marked PDF (useful when you imported HTML)';
  const file=document.createElement('input');file.type='file';file.accept='.pdf,application/pdf';file.style.cssText='display:block;margin-top:6px;width:100%';
  sourceLabel.appendChild(file);panel.appendChild(sourceLabel);
  const sourceStatus=document.createElement('p');sourceStatus.className='flow-muted';sourceStatus.textContent='Checking for an archived PDF on this device…';panel.appendChild(sourceStatus);
  let archivedPdf=null;
  if(root.LedgerPeerSourceArchive){
   try{const record=await root.LedgerPeerSourceArchive.get(meta.id);if(record&&record.pdf)archivedPdf=record.pdf;}
   catch(e){sourceStatus.textContent='Unable to access the original-PDF archive: '+e.message;}
  }
  if(archivedPdf)sourceStatus.textContent='Original PDF found in LedgerPeer local archive; it can be appended automatically.';
  else sourceStatus.textContent='No original PDF is archived with this attempt. You can attach one above or export text-based corrections without it.';
  const summary=document.createElement('p');summary.setAttribute('role','status');summary.style.fontWeight='800';panel.appendChild(summary);
  const editor=document.createElement('div');editor.style.cssText='max-height:500px;overflow:auto;margin:15px 0;border:2px solid #111;padding:10px';panel.appendChild(editor);
  const notes=storedNotes(meta.id);
  let mode='incorrect';
  function plan(){return compose(meta,questions,notes,mode,originalToggle.checked);}
  function refreshSummary(){summary.textContent=statusSummary(plan());}
  function edit(q,k,value){
   const key=String(q.qno);notes[key]=notes[key]||{};notes[key][k]=value;
   try{saveNotes(meta.id,notes);refreshSummary();}
   catch(e){summary.textContent='Could not save your correction draft in this browser: '+(e.message||e);}
  }
  function render(){
   editor.replaceChildren();
   const chosen=questionsFor(questions,mode);
   for(const q of chosen){
    const key=String(q.qno),manual=notes[key]||{};
    const details=document.createElement('details');details.style.cssText='padding:10px;border-bottom:1px solid #aaa';
    if(chosen.length<=3)details.open=true;
    const title=document.createElement('summary');
    title.textContent='Q'+q.qno+' · '+(q.is_correct===true?'Correct':q.is_correct===false?'Incorrect or partial':'Unverified')+' · '+clean(q.qtext||'').slice(0,75);
    title.style.cssText='cursor:pointer;font-weight:750';
    details.appendChild(title);
    const base=correction(q,manual);
    const desc=document.createElement('p');desc.style.cssText='font-size:12px;color:#555';
    desc.textContent='Existing AI debrief: '+(base.complete?'Some explanation/workings available':'Not yet added. Enter a manual correction below or import your ChatGPT JSON first.');
    details.appendChild(desc);
    details.appendChild(input('Correct method / calculations',manual.workings||'',v=>edit(q,'workings',v),4));
    details.appendChild(input('Explanation / identify the mistake',manual.explanation||'',v=>edit(q,'explanation',v),4));
    details.appendChild(input('Proposed corrected answer (optional, original key stays unchanged)',manual.proposedAnswer||'',v=>edit(q,'proposedAnswer',v),2));
    details.appendChild(input('Additional personal notes (optional)',manual.notes||'',v=>edit(q,'notes',v),3));
    editor.appendChild(details);
   }
   if(!chosen.length){const p=document.createElement('p');p.textContent='No questions match this filter. Choose All questions to export the full review.';editor.appendChild(p);}
   refreshSummary();
  }
  select.addEventListener('change',()=>{mode=select.value;render();});render();
  const button=document.createElement('button');button.type='button';button.className='flow-button primary';button.textContent='Download correction PDF';
  panel.appendChild(button);
  const result=document.createElement('p');result.setAttribute('role','status');result.style.marginTop='10px';panel.appendChild(result);
  button.addEventListener('click',async()=>{
   const compiled=plan();
   if(!compiled.rows.length){result.textContent='Select at least one question to export.';return;}
   const source=file.files&&file.files[0]||archivedPdf;
   if(originalToggle.checked&&!source)result.textContent='No original PDF found. Corrections can still be exported without it; diagrams may be missing.';
   button.disabled=true;button.textContent='Generating correction PDF…';
   try{
    const bytes=await generate(compiled,originalToggle.checked?source:null);
    const name='LedgerPeer-Corrections-'+filename(meta.subject)+'-'+filename(meta.title||meta.id)+(compiled.draft?'-DRAFT':'')+'.pdf';
    await download(bytes,name);
    result.textContent=compiled.draft
      ?'Draft correction PDF generated. Finish the remaining explanations before submitting it to your lecturer.'
      :'Correction PDF generated. Review the downloaded document before submitting it.';
   }catch(e){result.textContent='Could not generate correction PDF: '+(e&&e.message||String(e));}
   finally{button.disabled=false;button.textContent='Download correction PDF';}
  });
  anchor.parentNode.insertBefore(panel,anchor);
 }
 root.LedgerPeerCorrectionPDF={clean,pdfSafe,eligible,questionsFor,correction,compose,wrap,generate,mount};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.LedgerPeerCorrectionPDF;
})(typeof window!=='undefined'?window:globalThis);
