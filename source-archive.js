/* LedgerPeer dual-source attempt archive.
   Local IndexedDB stores the student's original PDF AND a readable reconstructed HTML
   copy. Reconstruction is NOT the original TYMBAFlex HTML and cannot recover absent figures.
   No network upload; cloud sync must be separately authorized and implemented. */
(function(root){
  'use strict';
  const DB='ledgerpeer-attempt-source-archive', STORE='sources', VERSION=1;
  const escape=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain=value=>String(value==null?'':value).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  function openDb(){
    if(!root.indexedDB)return Promise.reject(Error('This browser does not support local source archiving.'));
    return new Promise((resolve,reject)=>{
      const request=root.indexedDB.open(DB,VERSION);
      request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||Error('Could not open the source archive.'));
    });
  }
  async function put(record){
    if(!record||!record.id||!record.pdf||typeof record.html!=='string')throw Error('Original PDF and reconstructed HTML are required.');
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put({id:record.id,pdf:record.pdf,html:record.html,report:record.report||null,savedAt:new Date().toISOString()});
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onerror=()=>{const e=tx.error;db.close();reject(e||Error('Could not save PDF and HTML; storage may be full.'));};
      tx.onabort=()=>{const e=tx.error;db.close();reject(e||Error('Source archive was cancelled.'));};
    });
  }
  async function get(id){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(id);
      req.onsuccess=()=>resolve(req.result||null);
      tx.oncomplete=()=>db.close();
      tx.onerror=()=>{const e=tx.error;db.close();reject(e||Error('Could not read source archive.'));};
    });
  }
  async function remove(id){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onerror=()=>{db.close();reject(tx.error||Error('Could not remove source archive.'));};
    });
  }
  function audit(questions,pageTexts){
    const issues=[], seen=new Set(),visual=[];
    const pageNumbers=new Set();
    (pageTexts||[]).forEach(p=>{
      const text=String(p.text||''), re=/^\s*Question\s+(\d{1,3})\b/gim;let m;
      while((m=re.exec(text)))pageNumbers.add(Number(m[1]));
    });
    for(const q of questions||[]){
      const number=Number(q.qno),prefix='Q'+number+': ';
      if(seen.has(number))issues.push(prefix+'duplicate extracted question number');
      seen.add(number);
      if(!plain(q.qtext)||plain(q.qtext).length<20)issues.push(prefix+'question wording appears incomplete');
      if(q.is_correct===null)issues.push(prefix+'grading must be checked');
      if(!String(q.your_answer||'').trim() && q.is_correct===false)issues.push(prefix+'student answer could not be recovered');
      if(!String(q.correct_answer||'').trim() && q.is_correct===false)issues.push(prefix+'recorded correct answer is absent');
      if(q.original_marks!=null&&q.original_max_marks!=null&&
         (q.original_marks<0||q.original_marks>q.original_max_marks))issues.push(prefix+'awarded marks conflict with maximum marks');
      if(q.pdf_page&&pageNumbers.size&&!pageNumbers.has(number))issues.push(prefix+'question number not independently found in PDF page text');
      const visualCue=/\b(?:graph|chart|diagram|figure|table|illustration|histogram)\b/i.test(plain(q.qtext||'')+' '+plain(q.information||''));
      if(visualCue){visual.push(number);q.visual_review_required=true;}
    }
    if(seen.size){
      const max=Math.max(...seen);for(let n=1;n<=max;n++)if(!seen.has(n))issues.push('Q'+n+': missing from reconstructed question sequence');
    }
    for(const n of pageNumbers)if(!seen.has(n))issues.push('PDF text refers to Q'+n+' but no matching question was extracted');
    return {total:(questions||[]).length,visualQuestions:visual,issues:Array.from(new Set(issues)),basis:'PDF text layer/OCR and structured question records. Reconstructed HTML is derived from the PDF, not independent corroboration.'};
  }
  function buildHtml(questions,meta,report){
    const rows=(questions||[]).map(q=>{
      const result=q.is_correct===true?'Correct':q.is_correct===false?'Incorrect or partial':'Unverified';
      const marks=q.original_marks==null?'Unverified':q.original_marks+' / '+(q.original_max_marks==null?'?':q.original_max_marks);
      return '<article id="q'+escape(q.qno)+'"><h2>Question '+escape(q.qno)+'</h2>'+
       '<p class="meta">PDF page '+escape(q.pdf_page||'?')+' · '+result+' · Marks '+escape(marks)+'</p>'+
       '<div class="question">'+escape(plain(q.qtext)||'[Text extraction incomplete — inspect original PDF]')+'</div>'+
       '<p><strong>Student answer:</strong> '+escape(plain(q.your_answer)||'[Not captured]')+'</p>'+
       '<p><strong>Recorded answer:</strong> '+escape(plain(q.correct_answer)||'[Not captured]')+'</p>'+
       (q.information?'<p><strong>Shared information:</strong> '+escape(plain(q.information))+'</p>':'')+
       (q.visual_review_required?'<p class="warning">Potential chart/table/figure: verify against original PDF page.</p>':'')+'</article>';
    }).join('\n');
    const issues=report&&report.issues?report.issues:[];
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
     '<title>'+escape(meta.title||'LedgerPeer reconstructed exam')+'</title>'+
     '<style>body{max-width:850px;margin:24px auto;padding:0 16px;background:#fff;color:#181818;font:16px/1.6 system-ui,sans-serif}article{border-top:2px solid #111;padding:18px 0;break-inside:avoid}h1,h2{line-height:1.2}h2{font-size:21px}.meta{color:#555}.question{white-space:pre-wrap}.warning{background:#fff0d7;padding:10px}nav a{margin-right:12px}small{color:#555}</style>'+
     '</head><body><h1>'+escape(meta.title||'LedgerPeer exam')+'</h1><p>'+escape(meta.subject||'')+'</p>'+
     '<p><strong>Reconstructed HTML from PDF.</strong> This is a reading copy, not the original TYMBAFlex page. Images and layout may be missing. Consult the archived PDF for visual evidence.</p>'+
     '<p><small>'+escape(issues.length+' extraction warnings · '+(report&&report.visualQuestions||[]).length+' potential visual questions')+'</small></p>'+
     '<nav>'+((questions||[]).map(q=>'<a href="#q'+escape(q.qno)+'">Q'+escape(q.qno)+'</a>').join(' '))+'</nav>'+
     rows+'</body></html>';
  }
  function download(blob,name){
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  async function mount(attemptId,anchor){
    if(!anchor||!attemptId)return;
    const panel=document.createElement('section');
    panel.className='flow-panel';panel.id='lp-source-archive-panel';
    panel.innerHTML='<h2>Original PDF + HTML reading copy</h2><p id="lp-source-msg" role="status">Checking local source files…</p><div class="flow-actions" id="lp-source-buttons"></div><details id="lp-source-audit" hidden><summary>Extraction cross-check</summary><div id="lp-source-issues"></div></details>';
    anchor.parentNode.insertBefore(panel,anchor);
    const msg=panel.querySelector('#lp-source-msg'),buttons=panel.querySelector('#lp-source-buttons');
    let record;
    try{record=await get(attemptId);}catch(e){msg.textContent='Could not open the local archive: '+e.message;return;}
    if(!record){msg.textContent='No dual-source archive on this device. Existing debrief records are unaffected; PDF/HTML originals are not synced automatically.';return;}
    const pdf=document.createElement('button');pdf.type='button';pdf.className='flow-button secondary';pdf.textContent='Download original PDF';
    pdf.addEventListener('click',()=>download(record.pdf,'ledgerpeer-original-'+attemptId+'.pdf'));
    const html=document.createElement('button');html.type='button';html.className='flow-button secondary';html.textContent='Download reconstructed HTML';
    html.addEventListener('click',()=>download(new Blob([record.html],{type:'text/html;charset=utf-8'}),'ledgerpeer-reading-'+attemptId+'.html'));
    buttons.append(pdf,html);
    const report=record.report||{issues:[],visualQuestions:[]};
    msg.textContent='Both source files are saved locally on this device. HTML is a reading copy; refer to the PDF for diagrams and disputed answers.';
    const detail=panel.querySelector('#lp-source-audit');detail.hidden=false;
    const list=panel.querySelector('#lp-source-issues');
    const lines=(report.issues||[]).concat((report.visualQuestions||[]).map(n=>'Q'+n+': check original PDF for possible visual information'));
    if(!lines.length)list.textContent='No automated consistency warnings. This is not proof that extraction is accurate.';
    else {const ul=document.createElement('ul');for(const line of lines){const li=document.createElement('li');li.textContent=line;ul.appendChild(li);}list.appendChild(ul);}
  }
  root.LedgerPeerSourceArchive={put,get,remove,audit,buildHtml,mount};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.LedgerPeerSourceArchive;
})(typeof window!=='undefined'?window:globalThis);
