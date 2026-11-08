/* LedgerPeer manual, zero-API-cost ChatGPT debrief.
   PDF -> original marks saved -> user copies one request -> JSON validated and merged ->
   ChapterAnalysis produces graphs/strengths/weaknesses from the original grades. */
(function(root){
 'use strict';
 const F=root.RevisionFlow, M=root.ChapterAnalysis;
 const requireFields=['reasoning','calculation','justification','focus','topic_reason'];
 const escape=F.escape;
 function incomplete(q,meta){
  const allowed=catalog(meta);
  const matched=allowed.some(t=>t.toLowerCase()===String(q.chapter||'').toLowerCase())&&(q.topic_status==='matched'||q.topic_status==='related'||!q.topic_status);
  const outside=(q.topic_status==='outside'||q.topic_status==='unreadable')&&!String(q.chapter||'').trim();
  return !(matched||outside)||requireFields.some(k=>!String(q[k]||'').trim());
 }
 function catalog(meta){
  return root.LedgerSyllabus?root.LedgerSyllabus.resolve(localStorage,meta.subject).topics:[];
 }
 function rankTable(questions,subject){
  const rows=M.summary(questions,subject).chapters.sort((a,b)=>b.correct/b.total-a.correct/a.total||b.total-a.total);
  if(!rows.length)return '<p class="flow-muted">Import the AI topics to populate topic accuracy.</p>';
  return '<div class="flow-table-scroll"><table class="flow-rank-table"><thead><tr><th>Topic</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+escape(x.chapter)+'</td><td>'+x.correct+'/'+x.total+'</td><td>'+Math.round(x.correct/x.total*1000)/10+'%</td></tr>').join('')+'</tbody></table></div>';
 }
 function insights(questions,subject){
  const rows=M.summary(questions,subject).chapters.filter(x=>x.total>=3);
  if(!rows.length)return '<p class="flow-muted">Strengths and weaknesses become available when a topic has at least three graded questions.</p>';
  const strong=rows.filter(x=>x.correct/x.total>=.8).sort((a,b)=>b.correct/b.total-a.correct/a.total).slice(0,3);
  const weak=rows.filter(x=>x.correct/x.total<.6).sort((a,b)=>a.correct/a.total-b.correct/b.total).slice(0,3);
  function group(title,items){return '<div class="flow-insight-card"><strong>'+title+'</strong>'+(items.length?'<ul>'+items.map(x=>'<li>'+escape(x.chapter)+' — '+x.correct+'/'+x.total+' correct</li>').join('')+'</ul>':'<p>More evidence needed.</p>')+'</div>';}
  return '<div class="flow-insights">'+group('Strengths',strong)+group('Needs work',weak)+'</div>';
 }
 function mount(el,initial,meta,onSaved){
  if(!el||!F||!M)return;
  let data=initial,expected=localStorage.getItem('tymba_exam_data:'+meta.id),staged=null;
  const isPdf=meta.sourceFormat==='pdf';
  // Drafts persist only in the current browser tab, never as saved grades.
  const draftKey='ledgerpeer_debrief_draft_v1:'+meta.id;
  const stageKey='ledgerpeer_debrief_stage_v1:'+meta.id;
  const draftSignature=F.signature(data);
  let draftTimer=null,activeStage='copy';
  el.className='flow-panel';el.id='chatgpt-debrief';
  el.innerHTML=`
    <div class="flow-steps"><span>1 · Attempt saved</span><span class="current">2 · Classify + debrief</span><span>3 · Review results</span></div>
    <h2>Manual AI Debrief · JSON</h2>
    <p>LedgerPeer prepares the request but does not run an internal AI. Copy the question JSON and instructions, ask an AI of your choice for the completed JSON, then paste the result here. Original marks stay unchanged; syllabus topics must match your selected paper.</p>
    <p id="syllabusNotice" class="flow-muted"></p><div class="flow-actions" id="repairSyllabusActions"></div>
    <section id="syllabusSetup" class="flow-path" hidden>
      <h3>One-time ACCA syllabus setup for this paper</h3>
      <p>No verified syllabus headings are preloaded for this paper. Copy the exact numbered topic headings from your current <strong>ACCA Syllabus and Study Guide</strong>. LedgerPeer saves this list for future attempts on this device; invented AI categories are not accepted.</p>
      <label class="flow-field">Official ACCA syllabus source URL<input type="url" id="syllabusSource" placeholder="https://www.accaglobal.com/..."></label>
      <label class="flow-field">Syllabus edition<input type="text" id="syllabusEdition" placeholder="e.g. September 2026–June 2027"></label>
      <label class="flow-field">Official subtopics, one per line<textarea id="syllabusTopics" rows="8" placeholder="A1 · Exact ACCA syllabus heading&#10;A2 · Next exact syllabus heading"></textarea></label>
      <label class="flow-field"><input id="syllabusConfirm" type="checkbox"> I verified these headings against the chosen paper's official ACCA guide.</label>
      <div class="flow-actions"><button type="button" class="flow-button secondary" id="copySyllabusRequest">Copy syllabus extraction request</button><button type="button" class="flow-button primary" id="saveVerifiedSyllabus">Save syllabus for this paper</button></div>
      <p role="status" id="syllabusSetupMessage"></p>
    </section>
    <div class="flow-controls"><label>Change paper for this saved attempt
      <select id="correctAttemptSubject" aria-label="Correct the FIA or ACCA paper for this saved attempt"></select>
    </label><button type="button" class="flow-button secondary" id="saveAttemptSubject">Save paper change</button></div>
    <p id="debriefProgress" class="flow-muted" role="status"></p>
     <nav class="flow-stage-nav" id="flowStageNav" aria-label="Debrief steps">
       <button type="button" data-flow-step="copy" aria-pressed="true">1 · Request</button>
       <button type="button" data-flow-step="response" aria-pressed="false">2 · Import JSON</button>
       <button type="button" data-flow-step="results" aria-pressed="false">3 · Results</button>
     </nav>
    <section class="flow-path flow-stage" data-flow-stage="copy"><h3>Step 1 · Copy the question JSON request</h3>
      <p>Click Copy Request, open your preferred AI, and paste it. <strong>${isPdf?'Attach the same original PDF in ChatGPT':'Attach the original marked exam PDF if available'}</strong> so figures, tables and answers can be verified against the source rather than unreliable OCR. Ask ChatGPT to return the <strong>complete JSON</strong>.</p>
      <div class="flow-actions"><button type="button" class="flow-button primary" id="copyAIRequest">Copy questions + JSON instructions</button><a class="flow-button secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Open ChatGPT ↗</a><button type="button" class="flow-button secondary" id="downloadAIRequest">Download request .txt</button></div>
      <details><summary>View / manually copy your AI request</summary><textarea id="requestText" rows="7" readonly aria-label="Prepared request"></textarea></details>
    </section>
    <section class="flow-path flow-stage" data-flow-stage="response"><h3>Step 2 · Paste the completed JSON into LedgerPeer</h3>
      <p>Paste the completed AI JSON below, or upload its saved <code>.json</code> / <code>.txt</code>. LedgerPeer checks the question IDs, original marks and topic labels before saving anything.</p>
      <div class="flow-actions"><a class="flow-button secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Open ChatGPT ↗</a><button type="button" class="flow-button secondary" data-flow-return="copy">Back to request</button></div>
      <label class="flow-field">AI JSON response<textarea id="aiResponse" class="flow-response" rows="9" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder='Paste the complete JSON response here, starting with {'></textarea></label>
      <div class="flow-actions"><button type="button" class="flow-button secondary" id="pasteAIResponse">Paste from clipboard</button><button type="button" class="flow-button secondary" id="clearAIResponse">Clear draft</button></div>
       <p id="aiDraftStatus" role="status" class="flow-muted">Unsaved JSON drafts stay in this browser tab until applied or cleared.</p>
       <label class="flow-field">Or select the response file<input type="file" id="aiResponseFile" accept=".json,.txt,application/json,text/plain"></label>
      <div class="flow-actions"><button type="button" class="flow-button secondary" id="previewAIResponse">Preview classification</button><button type="button" class="flow-button primary" id="applyAIResponse">Apply JSON &amp; update graphs</button></div>
      <p role="status" aria-live="polite" id="aiResponseMessage"></p><div id="aiResponsePreview" class="flow-preview" hidden></div>
    </section>
    <section class="flow-path flow-stage" data-flow-stage="results"><h3>Step 3 · Your topic analysis</h3><div id="aiCurrentAnalysis"></div>
      <div class="flow-actions"><a class="flow-button secondary" href="hub.html#analysis">View dashboard graphs →</a><button type="button" class="flow-button secondary" id="downloadAttemptData">Download attempt backup</button></div>
      <p class="flow-muted">Partial-credit questions retain their awarded marks. The existing correct/incorrect graph counts only fully correct answers as correct.</p>
    </section>
    <details><summary>Advanced · Edit topic names and the topic catalog</summary><div id="chapterEditor"></div></details>`;
  const $=id=>el.querySelector('#'+id);

  const compactView=root.matchMedia?root.matchMedia('(max-width:1130px)'):null;
  const stageNames=['copy','response','results'];
  function setStage(name,scroll=false){
   activeStage=stageNames.includes(name)?name:'copy';
   const compact=!!(compactView&&compactView.matches);
   el.querySelectorAll('[data-flow-stage]').forEach(section=>{section.hidden=compact&&section.dataset.flowStage!==activeStage;});
   el.querySelectorAll('[data-flow-step]').forEach(button=>{
     const current=button.dataset.flowStep===activeStage;
     button.setAttribute('aria-pressed',String(current));
     if(current)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
   });
   try{sessionStorage.setItem(stageKey,activeStage);}catch(e){}
   if(scroll&&compact){
     const target=el.querySelector('[data-flow-stage="'+activeStage+'"]');
     if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
   }
  }
  el.querySelectorAll('[data-flow-step]').forEach(button=>button.addEventListener('click',()=>setStage(button.dataset.flowStep,true)));
  el.querySelectorAll('[data-flow-return]').forEach(button=>button.addEventListener('click',()=>setStage(button.dataset.flowReturn,true)));
  if(compactView){
   if(compactView.addEventListener)compactView.addEventListener('change',()=>setStage(activeStage));
   else if(compactView.addListener)compactView.addListener(()=>setStage(activeStage));
  }
  function draftStatus(value){$('aiDraftStatus').textContent=value;}
  function writeDraft(){
   if(draftTimer){clearTimeout(draftTimer);draftTimer=null;}
   const value=$('aiResponse').value;
   try{
     if(value.trim())sessionStorage.setItem(draftKey,JSON.stringify({signature:draftSignature,paper:meta.subject,value}));
     else sessionStorage.removeItem(draftKey);
     draftStatus(value.trim()?'Draft preserved in this browser tab. Apply JSON to save it to your attempt.':'No unsaved JSON response in this tab.');
   }catch(e){draftStatus('Browser storage could not retain this draft. Copy your response before leaving this tab.');}
  }
  function scheduleDraft(){
   staged=null;$('aiResponsePreview').hidden=true;
   draftStatus('Saving draft in this tab…');
   if(draftTimer)clearTimeout(draftTimer);
   draftTimer=setTimeout(writeDraft,300);
  }
  try{
    const saved=JSON.parse(sessionStorage.getItem(draftKey)||'null');
    const recovered=!!(saved&&saved.signature===draftSignature&&saved.paper===meta.subject&&typeof saved.value==='string'&&saved.value.trim());
    if(recovered){
      $('aiResponse').value=saved.value;
      draftStatus('Unsaved JSON draft restored for this attempt.');
      activeStage='response';
    }
    const chosen=sessionStorage.getItem(stageKey);
    if(!recovered&&stageNames.includes(chosen))activeStage=chosen;
  }catch(e){}
  setStage(activeStage);
  root.addEventListener('pagehide',writeDraft);

  function missing(){return data.filter(q=>incomplete(q,meta));}
  function updateInfo(){
   const left=missing();const info=M.summary(data,meta.subject);
   $('debriefProgress').textContent=data.length+' questions saved · '+(data.length-left.length)+' explained and classified · '+left.length+' pending · '+info.coverage.tagged+' approved topic tags for graphs · '+info.coverage.outside+' outside/unreadable.';
   $('aiCurrentAnalysis').innerHTML=insights(data,meta.subject)+rankTable(data,meta.subject);
   $('copyAIRequest').textContent=left.length&&left.length<data.length?'Copy request for '+left.length+' unfinished questions':'Copy questions + JSON instructions';
  }
  function makePrompt(){
    const pending=missing();const selected=pending.length?pending:data;
    return F.prompt(meta,selected,catalog(meta),data);
  }
  function fillPrompt(){
   if(!catalog(meta).length){
    const msg='No verified syllabus topics are configured for '+meta.subject+'. Complete one-time ACCA syllabus setup above, then copy the question request.';
    $('requestText').value=msg;return msg;
   }
   const result=makePrompt();$('requestText').value=result;return result;
  }
  function message(text,error=false){const node=$('aiResponseMessage');node.textContent=text;node.className=error?'flow-notice':'flow-success';}
  function preview(result){
   const coverage=M.summary(result.questions,meta.subject).coverage;
   const next=result.questions.filter(q=>incomplete(q,meta));
   $('aiResponsePreview').hidden=false;
   const uncertain=result.questions.filter(q=>q.topic_status==='needs_review').length;
   $('aiResponsePreview').innerHTML='<h3>Import preview</h3><p>'+result.count+' updates included · '+coverage.tagged+' approved topic tags · '+uncertain+' uncertain matches · '+next.length+' questions needing more feedback.</p>'+result.warnings.map(x=>'<p class="flow-notice">'+escape(x)+'</p>').join('')+insights(result.questions,meta.subject)+rankTable(result.questions,meta.subject)+'<details><summary>Preview explanations and classifications</summary>'+result.changed.map(change=>{const q=result.questions.find(x=>String(x.qno)===String(change.qno));return '<section class="flow-preview"><strong>Q'+escape(q.qno)+' · '+escape(q.chapter||'Topic not assigned')+'</strong><p>'+escape(F.plain(q.qtext).slice(0,160))+'</p>'+F.feedback(q)+'</section>';}).join('')+'</details>';
  }
  if(root.SubjectCatalog){
   const paper=$('correctAttemptSubject');
   root.SubjectCatalog.fill(paper);
   paper.value=meta.subject;
   $('saveAttemptSubject').addEventListener('click',()=>{
    const chosen=paper.value;
    if(!chosen||chosen===meta.subject){message('Paper unchanged.');return;}
    if(!confirm('Move this saved attempt from '+meta.subject+' to '+chosen+'? Your original questions, scores, and answer records stay unchanged. Old topic assignments will be reset for reclassification under the new syllabus; all marks, questions and explanations remain.'))return;
    try{
     const all=JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]');
     const row=Array.isArray(all)?all.find(e=>e.id===meta.id):null;
     if(!row)throw Error('Saved attempt metadata is missing.');
     const dataKey='tymba_exam_data:'+meta.id;
     const previous=localStorage.getItem(dataKey);
     const cleared=data.map(q=>Object.assign({},q,{chapter:'',topic_reason:'',topic_status:''}));
     F.save(localStorage,dataKey,cleared);
     try{
      row.subject=chosen;
      F.save(localStorage,'tymba_custom_exams',all);
     }catch(error){
      if(previous!==null)localStorage.setItem(dataKey,previous);
      throw error;
     }
     location.reload();
    }catch(e){message('Could not update the paper: '+e.message,true);}
   });
  }
  const syllabus=root.LedgerSyllabus.resolve(localStorage,meta.subject);
  const isOfficial=syllabus.verified;
  const topicNames=syllabus.topics;
  if(isOfficial){
   const description=syllabus.status==='built-in'?'Preloaded ACCA syllabus':'Student-confirmed ACCA syllabus';
   $('syllabusNotice').innerHTML=escape(description)+': '+escape(syllabus.subject)+' · '+topicNames.length+' approved subtopics. <a href="'+escape(syllabus.source)+'" target="_blank" rel="noopener noreferrer">View syllabus ↗</a>.';
  }else{
   $('syllabusNotice').textContent='The selected paper needs a syllabus catalog before topic analysis can begin. Your PDF and marks are already saved.';
   $('syllabusSetup').hidden=false;
   $('copySyllabusRequest').addEventListener('click',async()=>{
    const prompt=[
      'I am configuring LedgerPeer for the FIA/ACCA paper: '+meta.subject+'.',
      'I will attach the OFFICIAL ACCA syllabus and study guide PDF for this exact paper and edition.',
      'Read the syllabus section of the ATTACHED GUIDE, not general web summaries.',
      'Return ONLY the exact numbered subtopics from the official syllabus in this format, one per line:',
      'A1 · Exact official heading',
      'A2 · Exact official heading',
      'B1 · Exact official heading',
      'Continue through all syllabus areas and topic numbers. DO NOT invent a heading, create an extra topic, or substitute broad paraphrases.',
      'If the attachment is missing/unreadable, reply "NO VERIFIED SYLLABUS" and do not guess.',
      'Do not include explanatory paragraphs, Markdown bullets, code blocks, or unrelated exams.',
      'The student will check these lines against the official PDF before saving them in LedgerPeer.'
    ].join('\n');
    try{
     await navigator.clipboard.writeText(prompt);
     $('syllabusSetupMessage').textContent='Syllabus extraction request copied. Open ChatGPT, attach the official syllabus PDF, paste the request, then verify and paste the headings here.';
    }catch(error){
     $('syllabusSetupMessage').textContent='Clipboard access failed. Use your browser clipboard permissions or copy from the syllabus prompt provided by LedgerPeer.';
    }
   });
   $('saveVerifiedSyllabus').addEventListener('click',()=>{
    const status=$('syllabusSetupMessage');
    try{
     if(!$('syllabusConfirm').checked)throw Error('Confirm the official ACCA syllabus headings were checked.');
     const saved=root.LedgerSyllabus.saveVerified(localStorage,meta.subject,$('syllabusTopics').value.split(/\r?\n/),$('syllabusSource').value,$('syllabusEdition').value);
     status.textContent='Saved '+saved.topics.length+' approved syllabus topics. Reloading…';
     location.reload();
    }catch(error){status.textContent='Syllabus not saved: '+(error.message||error);}
   });
  }
  function refreshInvalidTags(){
   $('repairSyllabusActions').replaceChildren();
   if(!isOfficial)return;
   const bad=data.filter(q=>q.chapter&&!topicNames.some(t=>t.toLowerCase()===String(q.chapter).toLowerCase()));
   if(!bad.length)return;
   const btn=document.createElement('button');btn.type='button';btn.className='flow-button secondary';
   btn.textContent='Clear '+bad.length+' invalid old topic tags · keep all marks';
   btn.addEventListener('click',()=>{
    if(!confirm('Remove '+bad.length+' non-syllabus topic tags? Your recorded marks, original questions, and explanation text will remain.'))return;
    if(localStorage.getItem('tymba_exam_data:'+meta.id)!==expected){message('Saved attempt changed in another tab. Please reload.',true);return;}
    try{
     const updated=data.map(q=>bad.includes(q)?Object.assign({},q,{chapter:'',topic_reason:'',topic_status:''}):q);
     F.save(localStorage,'tymba_exam_data:'+meta.id,updated);
     data=updated;expected=localStorage.getItem('tymba_exam_data:'+meta.id);
     onSaved(updated);
    }catch(e){message('Could not clear invalid topics: '+e.message,true);}
   });
   $('repairSyllabusActions').appendChild(btn);
  }
  refreshInvalidTags();updateInfo();fillPrompt();
  if(!topicNames.length){
   $('copyAIRequest').disabled=true;
   $('downloadAIRequest').disabled=true;
   $('previewAIResponse').disabled=true;
   $('applyAIResponse').disabled=true;
  }

  $('copyAIRequest').addEventListener('click',async()=>{
   try{
    if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error('Clipboard unavailable');
    await navigator.clipboard.writeText(fillPrompt());
    message('Request copied. Paste it into your preferred AI, attach the original PDF if needed, then return to Step 2.');
    setStage('response',true);
   }catch(e){
    fillPrompt();$('requestText').parentElement.open=true;$('requestText').focus();$('requestText').select();
    message('Clipboard access unavailable. The request is selected. On tablets, use the text-selection menu to Copy, or download the request .txt.',true);
   }
  });
  $('downloadAIRequest').addEventListener('click',()=>F.download('ledgerpeer-chatgpt-request-'+meta.id+'.txt',fillPrompt(),'text/plain'));
  $('downloadAttemptData').addEventListener('click',()=>F.download('ledgerpeer-attempt-backup-'+meta.id+'.json',JSON.stringify({meta,questions:data},null,2)));
  $('pasteAIResponse').addEventListener('click',async()=>{
   try{
    if(!navigator.clipboard||!navigator.clipboard.readText)throw Error('Clipboard reading is unavailable');
    const value=await navigator.clipboard.readText();
    if(!value.trim())throw Error('Clipboard is empty');
    if($('aiResponse').value.trim()&&!confirm('Replace the existing unsaved JSON draft with the clipboard contents?'))return;
    $('aiResponse').value=value;scheduleDraft();writeDraft();
    message('JSON pasted from clipboard. Preview the classification before applying.');
   }catch(e){
    $('aiResponse').focus();
    message('Clipboard reading unavailable ('+(e.message||'permission denied')+'). On tablets, tap and hold the response field and choose Paste, or select a .json/.txt file.',true);
   }
  });
  $('clearAIResponse').addEventListener('click',()=>{
   if($('aiResponse').value.trim()&&!confirm('Clear the unsaved JSON draft for this attempt?'))return;
   $('aiResponse').value='';$('aiResponseFile').value='';scheduleDraft();writeDraft();
   message('Unsaved draft cleared. Original questions, answers and marks were not changed.');
  });
  $('aiResponseFile').addEventListener('change',async function(){
   const file=this.files[0];if(!file)return;
   try{
    const contents=await file.text();
    if($('aiResponse').value.trim()&&!confirm('Replace the existing unsaved response with this file?')){this.value='';return;}
    $('aiResponse').value=contents;scheduleDraft();writeDraft();
    message('JSON file loaded. Preview or Apply to save your debrief.');
   }catch(e){message('Could not read the response file.',true);}
  });
  $('aiResponse').addEventListener('input',scheduleDraft);
  $('previewAIResponse').addEventListener('click',()=>{
   writeDraft();
   try{staged=F.review($('aiResponse').value,data,meta);preview(staged);message('Preview ready. Check topics and explanations before applying.');}
   catch(e){staged=null;message('Invalid AI response: '+e.message,true);}
  });
  $('applyAIResponse').addEventListener('click',()=>{
   writeDraft();
   const btn=$('applyAIResponse');btn.disabled=true;
   try{
    staged=F.review($('aiResponse').value,data,meta);
    preview(staged);
    const left=staged.questions.filter(q=>incomplete(q,meta));
    if(left.length&&!confirm('The AI returned an incomplete debrief: '+left.length+' question(s) still need topics or explanations. Save valid parts now? LedgerPeer will prepare a continuation prompt for the missing parts.'))return;
    if(localStorage.getItem('tymba_exam_data:'+meta.id)!==expected)throw Error('The saved attempt changed in another tab. Reload before importing so you do not overwrite newer work.');
    const updated=staged.questions.map(q=>Object.assign({},q,{debrief:typeof q.debrief==='string'?F.sanitize(q.debrief):q.debrief}));
    F.save(localStorage,'tymba_exam_data:'+meta.id,updated);
    try{
      sessionStorage.removeItem(draftKey);
      $('aiResponse').value='';
      sessionStorage.setItem(stageKey,'results');
      sessionStorage.setItem('personal_hub_ai_saved:'+meta.id,'1');
    }catch(e){}
    setStage('results');
    data=updated;expected=localStorage.getItem('tymba_exam_data:'+meta.id);
    updateInfo();fillPrompt();refreshInvalidTags();
    message('Saved '+staged.count+' question updates. Refreshing questions and topic graphs…');
    onSaved(updated);
   }catch(e){message('Could not apply the JSON: '+e.message,true);}
   finally{btn.disabled=false;}
  });
  if(root.ChapterUI){
    root.ChapterUI.mountEditor($('chapterEditor'),data,meta,localStorage,function(merged){
      if(localStorage.getItem('tymba_exam_data:'+meta.id)!==expected)throw Error('Your attempt has changed; reload before saving.');
      F.save(localStorage,'tymba_exam_data:'+meta.id,merged);onSaved(merged);
    });
  }
  el.addEventListener('click',e=>{if(e.target.id==='saveChapterCatalog')setTimeout(fillPrompt,0);});
  try{if(sessionStorage.getItem('personal_hub_ai_saved:'+meta.id)){message('Your imported feedback is saved. Graphs are calculated from your original marks.');sessionStorage.removeItem('personal_hub_ai_saved:'+meta.id);}}catch(e){}
 }
 root.DebriefWorkflow={mount,rankTable,insights};
})(window);
