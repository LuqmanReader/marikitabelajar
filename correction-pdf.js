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
  out.setAuthor('LedgerPeer - student correction worksheet');
  out.setSubject('One A4 page per question; recorded marks and keys unchanged');
  const normal=await out.embedFont(L.StandardFonts.Helvetica);
  const bold=await out.embedFont(L.StandardFonts.HelveticaBold);
  const ink=L.rgb(.10,.12,.16),muted=L.rgb(.37,.40,.45),blue=L.rgb(.17,.31,.80);
  const border=L.rgb(.84,.86,.90),pale=L.rgb(.97,.98,1),warning=L.rgb(.67,.17,.14);
  const redBg=L.rgb(1,.96,.95),white=L.rgb(1,1,1);
  const M=44,W=A4[0]-2*M,TOP=706,BOTTOM=65;
  const footerQueue=[];
  function makePage(){
   const p=out.addPage(A4);
   p.drawText(DOC_TITLE,{x:M,y:807,size:10,font:bold,color:ink});
   p.drawLine({start:{x:M,y:795},end:{x:A4[0]-M,y:795},thickness:.8,color:border});
   return p;
  }
  function singleLine(value,font,size,width){
   let s=pdfSafe(value).replace(/\s+/g,' ').trim();
   if(font.widthOfTextAtSize(s,size)<=width)return s;
   while(s.length&&font.widthOfTextAtSize(s+'...',size)>width)s=s.slice(0,-1);
   return s+'...';
  }
  function footer(p,pageNumber,detail){
   // Page count is unknown until all continuation sheets have been laid out.
   footerQueue.push({p,detail});
  }
  function renderFooters(){
   const total=footerQueue.length;
   footerQueue.forEach(({p,detail},i)=>{
    p.drawLine({start:{x:M,y:46},end:{x:A4[0]-M,y:46},thickness:.65,color:border});
    p.drawText(singleLine(detail,normal,8,W-104),{x:M,y:30,size:8,font:normal,color:muted});
    p.drawText('PAGE '+(i+1)+' / '+total,{x:A4[0]-M-95,y:30,size:8,font:bold,color:muted});
   });
  }
  function paragraph(p,value,x,y,width,size,font=normal,color=ink,leading=size*1.4){
   for(const line of wrap(value,font,size,width)){
    if(line)p.drawText(line,{x,y,size,font,color});
    y-=leading;
   }
   return y;
  }
  const cover=makePage();
  cover.drawText('EXAM CORRECTIONS',{x:M,y:716,size:25,font:bold,color:ink});
  cover.drawRectangle({x:M,y:698,width:56,height:4,color:blue});
  let y=675;
  y=paragraph(cover,plan.meta.title||'Saved attempt',M,y,W,15,bold,ink,21)-12;
  for(const entry of [
   'PAPER  '+(plan.meta.subject||'Not recorded'),
   'ASSESSMENT  '+(plan.meta.testType||'Exam')+' '+(plan.meta.testNumber||''),
   'EXPORTED  '+new Date().toISOString().slice(0,10),
   'QUESTIONS  '+plan.rows.length+'   |   INCOMPLETE  '+plan.missing.length]){
   y=paragraph(cover,entry,M,y,W,10,normal,ink,15)-9;
  }
  cover.drawRectangle({x:M,y:y-100,width:W,height:100,
   color:plan.draft?redBg:pale,borderColor:border,borderWidth:.75});
  cover.drawText(plan.draft?'DRAFT - REVIEW REQUIRED':'ONE QUESTION AT A TIME',
   {x:M+14,y:y-20,size:10,font:bold,color:plan.draft?warning:blue});
  paragraph(cover,plan.draft?'Some corrections still need workings or explanations. Review them before sharing.'
   :'Each question starts on its own A4 sheet. Longer corrections continue neatly on a labelled page.',M+14,y-44,W-28,9.2,normal,ink,13.5);
  paragraph(cover,'Recorded lecturer marks and answer keys are not changed. Original figures may need source verification.',
   M+14,y-76,W-28,8.5,normal,muted,12);
  paragraph(cover,plan.includeOriginal&&originalPdf?'The original marked PDF follows as an unchanged appendix.'
   :'This export includes text-based corrections; consult the source exam for figures.',M,y-127,W,9,normal,muted,13);
  if(!plan.rows.length)paragraph(cover,'No questions matched this export filter.',M,y-160,W,10,bold);
  footer(cover,1,'LEDGERPEER  |  STUDENT-PREPARED CORRECTIONS');

  function blocks(item){
   const q=item.source,result=[];
   function add(label,value,tone='normal'){
    if(value!=null&&String(value).trim())result.push({label,value:String(value),tone});
   }
   add('ORIGINAL QUESTION',q.qtext||'Text not extracted. Consult original PDF.');
   if(q.information)add('QUESTION INFORMATION',q.information);
   const choices=(q.options||[]).map(o=>(o.checked?'[SELECTED] ':'[ ] ')+clean(o.text)).filter(Boolean);
   if(choices.length)add('ANSWER OPTIONS',choices.join('\n'));
   result.push({type:'pair',left:'STUDENT ANSWER',leftValue:q.your_answer||'Not captured',
    right:'RECORDED ANSWER KEY',rightValue:q.correct_answer||'Not captured'});
   if(item.proposedAnswer)add('PROPOSED CORRECTED ANSWER',item.proposedAnswer,'accent');
   add('CORRECT METHOD AND CALCULATIONS',item.workings||'Workings not yet supplied.');
   add('EXPLANATION / IDENTIFIED MISTAKE',item.explanation||q.debrief||'Explanation not yet supplied.');
   if(item.justification)add('ADDITIONAL JUSTIFICATION',item.justification);
   if(item.notes)add('STUDENT NOTES',item.notes);
   if(q.focus)add('PRACTISE NEXT',q.focus);
   if(/<img\b|<svg\b|<canvas\b|\[Image unavailable/i.test(q.qtext||'')||q.visual_review_required)
    add('CHECK VISUAL EVIDENCE','Verify any chart or figure against the original marked PDF. A text extract cannot establish its values.','warning');
   return result;
  }
  function layoutFor(item){
   const parts=blocks(item);
   let fallback;
   for(const [size,density] of [[10.2,1],[9.7,1],[9.2,.94],[8.7,.88],[8.2,.82]]){
    const pad=8.5*density,lead=size*1.34,labelSize=Math.max(7.8,size-1.2);
    const gap=7*density,labelGap=6*density;
    const full=W-2*pad,half=(full-17)/2;
    const measured=parts.map(part=>{
     if(part.type==='pair'){
      const leftLines=wrap(part.leftValue,normal,size,half);
      const rightLines=wrap(part.rightValue,normal,size,half);
      return {...part,leftLines,rightLines,height:pad*2+labelSize+labelGap+
       Math.max(leftLines.length,rightLines.length)*lead};
     }
     const lines=wrap(part.value,normal,size,full);
     return {...part,lines,height:pad*2+labelSize+labelGap+lines.length*lead};
    });
    const total=measured.reduce((n,part)=>n+part.height+gap,0)-gap;
    const result={measured,size,pad,lead,labelSize,labelGap,gap};
    if(size===9.2)fallback=result;
    if(total<=TOP-BOTTOM)return result;
   }
   // Keep the print comfortably readable instead of shrinking indefinitely.
   // Overflow is laid out onto question-specific continuation sheets below.
   return fallback;
  }
  function sliceBlock(part,count,layout,continued){
   const p={...part};
   if(part.type==='pair'){
    p.left=part.left+(continued?' (CONT.)':'');
    p.right=part.right+(continued?' (CONT.)':'');
    p.leftLines=part.leftLines.slice(0,count);
    p.rightLines=part.rightLines.slice(0,count);
   }else{
    p.label=part.label+(continued?' (CONT.)':'');
    p.lines=part.lines.slice(0,count);
   }
   p.height=2*layout.pad+layout.labelSize+layout.labelGap+
     Math.max(1,p.type==='pair'?Math.max(p.leftLines.length,p.rightLines.length):p.lines.length)*layout.lead;
   return p;
  }
  function drawBlock(p,part,top,layout){
   const {pad,lead,size,labelSize,labelGap,gap}=layout;
   const bottom=top-part.height;
   p.drawRectangle({x:M,y:bottom,width:W,height:part.height,
    color:part.tone==='warning'?redBg:part.tone==='accent'?pale:white,
    borderColor:border,borderWidth:.65});
   p.drawRectangle({x:M,y:bottom,width:3,height:part.height,color:part.tone==='warning'?warning:blue});
   const labelY=top-pad-labelSize,textY=labelY-labelGap-lead*.80;
   if(part.type==='pair'){
    const half=(W-2*pad-17)/2,x1=M+pad,x2=x1+half+17;
    p.drawText(part.left,{x:x1,y:labelY,size:labelSize,font:bold,color:muted});
    p.drawText(part.right,{x:x2,y:labelY,size:labelSize,font:bold,color:muted});
    p.drawLine({start:{x:x2-8,y:bottom+pad},end:{x:x2-8,y:top-pad},thickness:.65,color:border});
    part.leftLines.forEach((s,i)=>{if(s)p.drawText(s,{x:x1,y:textY-i*lead,size,font:normal,color:ink});});
    part.rightLines.forEach((s,i)=>{if(s)p.drawText(s,{x:x2,y:textY-i*lead,size,font:normal,color:ink});});
   }else{
    p.drawText(part.label,{x:M+pad,y:labelY,size:labelSize,font:bold,color:part.tone==='warning'?warning:muted});
    part.lines.forEach((s,i)=>{if(s)p.drawText(s,{x:M+pad,y:textY-i*lead,size,font:normal,color:ink});});
   }
   return bottom-gap;
  }
  function questionPage(item,index,continued){
   const p=makePage();
   const title='QUESTION '+pdfSafe(item.qno)+(continued?'  |  CONTINUED':'');
   p.drawText(title,{x:M,y:767,size:continued?15:19,font:bold,color:ink});
   p.drawText('CORRECTION '+(index+1)+' / '+plan.rows.length,
    {x:A4[0]-M-153,y:770,size:9,font:bold,color:blue});
   const q=item.source;
   const marks='ORIGINAL MARKS: '+(q.original_marks==null?'UNVERIFIED':q.original_marks)
    +' / '+(q.original_max_marks==null?'?':q.original_max_marks)
    +(q.pdf_page?'  |  SOURCE PAGE '+q.pdf_page:'');
   p.drawText(singleLine(marks,normal,9,W),{x:M,y:741,size:9,font:normal,color:muted});
   p.drawLine({start:{x:M,y:728},end:{x:A4[0]-M,y:728},thickness:.8,color:border});
   footer(p,0,'QUESTION '+item.qno+'  |  '+(continued?'CONTINUED':item.complete?'STUDENT CORRECTION':'INCOMPLETE DRAFT'));
   return p;
  }
  for(let i=0;i<plan.rows.length;i++){
   const item=plan.rows[i],layout=layoutFor(item);
   let p=questionPage(item,i,false),cursor=TOP;
   for(const original of layout.measured){
    let remaining=original,continued=false;
    while(remaining){
     // Leave enough room for a section heading and readable text.
     const available=cursor-BOTTOM,overhead=2*layout.pad+layout.labelSize+layout.labelGap;
     const lineCount=remaining.type==='pair'
       ?Math.max(remaining.leftLines.length,remaining.rightLines.length)
       :remaining.lines.length;
     const count=Math.floor((available-overhead)/layout.lead);
     if(count<1){
      p=questionPage(item,i,true);cursor=TOP;continue;
     }
     const chunk=sliceBlock(remaining,Math.min(count,lineCount),layout,continued);
     cursor=drawBlock(p,chunk,cursor,layout);
     if(count>=lineCount){remaining=null;break;}
     // Long sections continue under the same heading; not a single word is dropped.
     const next={...remaining};
     if(next.type==='pair'){
      next.leftLines=remaining.leftLines.slice(count);
      next.rightLines=remaining.rightLines.slice(count);
     }else next.lines=remaining.lines.slice(count);
     remaining=next;
     continued=true;
     p=questionPage(item,i,true);cursor=TOP;
    }
   }
  }
  renderFooters();
  // The separate source appendix is copied without altering source content or dimensions.
  if(plan.includeOriginal&&originalPdf){
   let original;
   try{original=await L.PDFDocument.load(await originalPdf.arrayBuffer(),{ignoreEncryption:false});}
   catch(e){throw Error('Could not append original PDF: '+(e.message||e));}
   for(const p of await out.copyPages(original,original.getPageIndices()))out.addPage(p);
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
  p.textContent='Each question starts on its own tidy A4 page. Long corrections are automatically fitted or continued on clearly labelled pages with no missing text. Original marks and answer keys stay unchanged.';
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
