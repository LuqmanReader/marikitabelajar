/* LedgerPeer manual, zero-API-cost ChatGPT debrief.
   PDF -> original marks saved -> user copies one request -> JSON validated and merged ->
   ChapterAnalysis produces graphs/strengths/weaknesses from the original grades. */
(function(root){
 'use strict';
 const F=root.RevisionFlow, M=root.ChapterAnalysis;
 const requireFields=['reasoning','calculation','justification','focus'];
 const escape=F.escape;
 function incomplete(q){return !String(q.chapter||'').trim()||requireFields.some(k=>!String(q[k]||'').trim());}
 function catalog(meta){
  if(root.LedgerSyllabus&&root.LedgerSyllabus.official(meta.subject))
   return root.LedgerSyllabus.list(meta.subject);
  try{
   const all=JSON.parse(localStorage.getItem('personal_hub_chapters_v1')||'{}');
   return all&&Array.isArray(all[meta.subject])?all[meta.subject].filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()):[];
  }catch(e){return [];}
 }
 function rankTable(questions){
  const rows=M.summary(questions).chapters.sort((a,b)=>b.correct/b.total-a.correct/a.total||b.total-a.total);
  if(!rows.length)return '<p class="flow-muted">Import the AI topics to populate topic accuracy.</p>';
  return '<div class="flow-table-scroll"><table class="flow-rank-table"><thead><tr><th>Topic</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+escape(x.chapter)+'</td><td>'+x.correct+'/'+x.total+'</td><td>'+Math.round(x.correct/x.total*1000)/10+'%</td></tr>').join('')+'</tbody></table></div>';
 }
 function insights(questions){
  const rows=M.summary(questions).chapters.filter(x=>x.total>=3);
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
  el.className='flow-panel';el.id='chatgpt-debrief';
  el.innerHTML=`
    <div class="flow-steps"><span>1 · PDF saved</span><span class="current">2 · Ask ChatGPT</span><span>3 · Update graphs</span></div>
    <h2>AI Question Analysis · ChatGPT JSON</h2>
    <p>Your marks stay unchanged. Each question must match an official ACCA syllabus topic for your selected paper or stay untagged when outside the syllabus.</p>
    <p id="syllabusNotice" class="flow-muted"></p><div class="flow-actions" id="repairSyllabusActions"></div>
    <p id="debriefProgress" class="flow-muted"></p>
    <section class="flow-path"><h3>Step 1 · Copy the question request</h3>
      <p>Click Copy Request, open ChatGPT, and paste it. <strong>${isPdf?'Attach the same original PDF in ChatGPT':'Attach the original marked exam PDF if available'}</strong> so figures, tables and answers can be verified against the source rather than unreliable OCR. Ask ChatGPT to return the <strong>complete JSON</strong>.</p>
      <div class="flow-actions"><button type="button" class="flow-button primary" id="copyAIRequest">Copy complete request</button><a class="flow-button secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Open ChatGPT ↗</a><button type="button" class="flow-button secondary" id="downloadAIRequest">Download request .txt</button></div>
      <details><summary>View / manually copy your AI request</summary><textarea id="requestText" rows="7" readonly aria-label="Prepared request"></textarea></details>
    </section>
    <section class="flow-path"><h3>Step 2 · Bring the JSON back to LedgerPeer</h3>
      <p>Paste ChatGPT's JSON below, or upload its saved <code>.json</code> / <code>.txt</code>. LedgerPeer checks the question IDs, original marks and topic labels before saving anything.</p>
      <label class="flow-field">ChatGPT JSON response<textarea id="aiResponse" class="flow-response" rows="9" placeholder='Paste the complete JSON response here, starting with {'></textarea></label>
      <label class="flow-field">Or select the response file<input type="file" id="aiResponseFile" accept=".json,.txt,application/json,text/plain"></label>
      <div class="flow-actions"><button type="button" class="flow-button secondary" id="previewAIResponse">Preview classification</button><button type="button" class="flow-button primary" id="applyAIResponse">Apply JSON &amp; update graphs</button></div>
      <p role="status" aria-live="polite" id="aiResponseMessage"></p><div id="aiResponsePreview" class="flow-preview" hidden></div>
    </section>
    <section class="flow-path"><h3>Step 3 · Your topic analysis</h3><div id="aiCurrentAnalysis"></div>
      <div class="flow-actions"><a class="flow-button secondary" href="hub.html#analysis">View dashboard graphs →</a><button type="button" class="flow-button secondary" id="downloadAttemptData">Download attempt backup</button></div>
      <p class="flow-muted">Partial-credit questions retain their awarded marks. The existing correct/incorrect graph counts only fully correct answers as correct.</p>
    </section>
    <details><summary>Advanced · Edit topic names and the topic catalog</summary><div id="chapterEditor"></div></details>`;
  const $=id=>el.querySelector('#'+id);
  function missing(){return data.filter(incomplete);}
  function updateInfo(){
   const left=missing();const info=M.summary(data);
   $('debriefProgress').textContent=data.length+' questions saved · '+(data.length-left.length)+' with complete explanations and topics · '+left.length+' still pending · '+info.coverage.tagged+' tagged for graphs.';
   $('aiCurrentAnalysis').innerHTML=insights(data)+rankTable(data);
   $('copyAIRequest').textContent=left.length&&left.length<data.length?'Copy request for '+left.length+' unfinished questions':'Copy complete request';
  }
  function makePrompt(){
    const pending=missing();const selected=pending.length?pending:data;
    return F.prompt(meta,selected,catalog(meta),data);
  }
  function fillPrompt(){
   if(!catalog(meta).length){
    const msg='No official ACCA topic list is loaded for '+meta.subject+'. Enter exact official headings under Advanced → Topic Catalog before creating a request.';
    $('requestText').value=msg;return msg;
   }
   const result=makePrompt();$('requestText').value=result;return result;
  }
  function message(text,error=false){const node=$('aiResponseMessage');node.textContent=text;node.className=error?'flow-notice':'flow-success';}
  function preview(result){
   const coverage=M.summary(result.questions).coverage;
   const next=result.questions.filter(incomplete);
   $('aiResponsePreview').hidden=false;
   $('aiResponsePreview').innerHTML='<h3>Import preview</h3><p>'+result.count+' question updates included · '+coverage.tagged+' topics assigned · '+next.length+' questions still need full feedback.</p>'+result.warnings.map(x=>'<p class="flow-notice">'+escape(x)+'</p>').join('')+insights(result.questions)+rankTable(result.questions)+'<details><summary>Preview explanations and classifications</summary>'+result.changed.map(change=>{const q=result.questions.find(x=>String(x.qno)===String(change.qno));return '<section class="flow-preview"><strong>Q'+escape(q.qno)+' · '+escape(q.chapter||'Topic not assigned')+'</strong><p>'+escape(F.plain(q.qtext).slice(0,160))+'</p>'+F.feedback(q)+'</section>';}).join('')+'</details>';
  }
  const isOfficial=root.LedgerSyllabus&&root.LedgerSyllabus.official(meta.subject);
  const topicNames=catalog(meta);
  if(isOfficial){
   const source=root.LedgerSyllabus.source(meta.subject);
   $('syllabusNotice').innerHTML='Official ACCA syllabus: '+escape(root.LedgerSyllabus.code(meta.subject))+' · '+topicNames.length+' exact syllabus topics. <a href="'+escape(source)+'" target="_blank" rel="noopener noreferrer">Read ACCA guide ↗</a>.';
  }else{
   $('syllabusNotice').textContent='Verified official topics are not preloaded for this paper. Paste its exact ACCA topic headings in Advanced → Topic Catalog before requesting classification.';
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
     const updated=data.map(q=>bad.includes(q)?Object.assign({},q,{chapter:'',topic_reason:''}):q);
     F.save(localStorage,'tymba_exam_data:'+meta.id,updated);
     data=updated;expected=localStorage.getItem('tymba_exam_data:'+meta.id);
     onSaved(updated);
    }catch(e){message('Could not clear invalid topics: '+e.message,true);}
   });
   $('repairSyllabusActions').appendChild(btn);
  }
  refreshInvalidTags();updateInfo();fillPrompt();
  if(!topicNames.length){$('copyAIRequest').disabled=true;$('downloadAIRequest').disabled=true;}
  $('copyAIRequest').addEventListener('click',async()=>{
   try{await navigator.clipboard.writeText(fillPrompt());message('Request copied. Attach the PDF to ChatGPT, paste the request and ask for the JSON.');}
   catch(e){fillPrompt();$('requestText').parentElement.open=true;$('requestText').focus();$('requestText').select();message('Clipboard unavailable; the request is selected. Press Ctrl+C.');}
  });
  $('downloadAIRequest').addEventListener('click',()=>F.download('ledgerpeer-chatgpt-request-'+meta.id+'.txt',fillPrompt(),'text/plain'));
  $('downloadAttemptData').addEventListener('click',()=>F.download('ledgerpeer-attempt-backup-'+meta.id+'.json',JSON.stringify({meta,questions:data},null,2)));
  $('aiResponseFile').addEventListener('change',async function(){
   const file=this.files[0];if(!file)return;
   try{$('aiResponse').value=await file.text();$('aiResponsePreview').hidden=true;message('JSON file loaded. Preview or click Apply.');}
   catch(e){message('Could not read the response file.',true);}
  });
  $('aiResponse').addEventListener('input',()=>{$('aiResponsePreview').hidden=true;staged=null;});
  $('previewAIResponse').addEventListener('click',()=>{
   try{staged=F.review($('aiResponse').value,data,meta);preview(staged);message('Preview ready. Check topics and explanations before applying.');}
   catch(e){staged=null;message('Invalid AI response: '+e.message,true);}
  });
  $('applyAIResponse').addEventListener('click',()=>{
   const btn=$('applyAIResponse');btn.disabled=true;
   try{
    staged=F.review($('aiResponse').value,data,meta);
    preview(staged);
    const left=staged.questions.filter(incomplete);
    if(left.length&&!confirm('ChatGPT returned an incomplete debrief: '+left.length+' question(s) still need topics or explanations. Save valid parts now? LedgerPeer will prepare a continuation prompt for the missing parts.'))return;
    if(localStorage.getItem('tymba_exam_data:'+meta.id)!==expected)throw Error('The saved attempt changed in another tab. Reload before importing so you do not overwrite newer work.');
    const updated=staged.questions.map(q=>Object.assign({},q,{debrief:typeof q.debrief==='string'?F.sanitize(q.debrief):q.debrief}));
    F.save(localStorage,'tymba_exam_data:'+meta.id,updated);
    try{sessionStorage.setItem('personal_hub_ai_saved:'+meta.id,'1');}catch(e){}
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
