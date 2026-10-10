(function(root){
  'use strict';
  var F=RevisionFlow, M=ChapterAnalysis;
  function rankTable(questions){
    var rows=M.summary(questions).chapters.sort(function(a,b){return b.correct/b.total-a.correct/a.total||b.total-a.total;});
    if(!rows.length)return '<p>No topic tags yet. The AI response will assign them.</p>';
    return '<div class="flow-table-scroll"><table class="flow-rank-table"><thead><tr><th>Rank</th><th>Topic / chapter</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>'+rows.map(function(r,i){return '<tr><td>'+(i+1)+'</td><td>'+F.escape(r.chapter)+'</td><td>'+r.correct+'/'+r.total+'</td><td>'+Math.round(r.correct/r.total*1000)/10+'%</td></tr>';}).join('')+'</tbody></table></div>';
  }
  function mount(el,data,meta,onSaved){
    var staged=null, inputVersion=0, geminiBusy=false, geminiController=null, original=localStorage.getItem('tymba_exam_data:'+meta.id),summary=M.summary(data),explained=data.filter(F.hasFeedback).length;
    el.className='flow-panel';
    el.innerHTML='<nav class="flow-steps" aria-label="Revision workflow"><span>1 · Attempt saved</span><span class="current">2 · Ask AI</span><span>3 · Paste &amp; save</span><span>4 · See progress</span></nav>'+
      '<h2>Answer review → Gemini analysis → progress</h2><p>'+data.length+' questions saved · '+explained+' with explanations · '+summary.coverage.tagged+' scored questions tagged.</p>'+
      '<h3>Analyze this attempt here</h3><p>Get topic assignments, explanations and practice priorities without leaving LedgerPeer. Your question text, choices and answers will be sent to Google Gemini when you select Analyze.</p>'+
      '<div class="flow-actions"><button type="button" id="analyzeGemini" class="flow-button primary">Analyze with Gemini</button><button type="button" id="cancelGemini" class="flow-button secondary" hidden>Cancel analysis</button></div><p id="geminiMessage" role="status" aria-live="polite"></p>'+
      '<details id="manualAIImport"><summary>Use another AI or import an existing response</summary>'+
      '<h3>2. Get the reasoning from AI</h3><p>Copy the request into ChatGPT or your preferred AI. It asks for reasoning, calculation, justification, practice focus, and topic tags for every question. You do not need to edit any code.</p>'+
      '<div class="flow-actions"><button type="button" id="copyAIRequest" class="flow-button">Copy AI request</button><a class="flow-button secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Open ChatGPT ↗</a><button type="button" id="downloadAIRequest" class="flow-button secondary">Download request</button></div>'+
      '<details id="requestFallback"><summary>Read or manually copy the request</summary><textarea id="requestText" rows="7" readonly aria-label="Request to copy into AI"></textarea></details>'+
      '<h3>3. Paste the AI response</h3><label>Paste the complete response block<textarea id="aiResponse" class="flow-response" placeholder="Paste the AI’s response here. Its question feedback and topic tags will be checked before saving."></textarea></label>'+
      '<label class="flow-field">Or choose the AI’s response file<input type="file" id="aiResponseFile" accept=".json,.txt,application/json,text/plain"></label>'+
      '<div class="flow-actions"><button type="button" id="previewAIResponse" class="flow-button">Preview feedback &amp; ranking</button></div></details>'+
      '<div class="flow-actions"><button type="button" id="saveAIResponse" class="flow-button primary" disabled>Save debrief &amp; update analysis</button></div>'+
      '<p id="aiResponseMessage" role="status" aria-live="polite"></p><div id="aiResponsePreview" hidden class="flow-preview"></div>'+
      '<div class="flow-actions"><a class="flow-button secondary" href="hub.html#analysis">4. View graphs &amp; topic ranking →</a><button type="button" id="downloadAttemptData" class="flow-button secondary">Download attempt backup</button></div>'+
      '<details><summary>Current topic ranking · strongest to weakest</summary>'+rankTable(data)+'</details>'+
      '<details><summary>Review or edit topic / chapter assignments</summary><div id="chapterEditor"></div></details>';
    var $=function(id){return el.querySelector('#'+id);};
    function message(text){$('aiResponseMessage').textContent=text;}
    function makePrompt(){return F.prompt(meta,data,M.catalog(localStorage,meta.subject));}
    function fillRequest(){var text=makePrompt();$('requestText').value=text;return text;}
    fillRequest();
    $('cancelGemini').addEventListener('click',function(){if(geminiController)geminiController.abort();});
    $('analyzeGemini').addEventListener('click',async function(){
      if(geminiBusy)return;
      geminiBusy=true;invalidate();geminiController=new AbortController();
      var version=inputVersion;
      $('analyzeGemini').disabled=true;$('cancelGemini').hidden=false;
      try{
        if(!root.GeminiAnalysis)throw new Error('Upload gemini-analysis.js alongside this page.');
        var response=await root.GeminiAnalysis.analyze(meta,data,function(text){$('geminiMessage').textContent=text;},geminiController.signal);
        if(version!==inputVersion)throw new Error('The response input changed during analysis. Run analysis again.');
        if(localStorage.getItem('tymba_exam_data:'+meta.id)!==original)throw new Error('This attempt changed. Reload before applying analysis.');
        $('aiResponse').value=JSON.stringify(response);
        $('previewAIResponse').click();
        if(staged)$('geminiMessage').textContent='Analysis ready. Review the feedback below, then select Save debrief & update analysis.';
      }catch(e){$('geminiMessage').textContent=e.message||'Analysis failed. Your saved attempt has not changed.';}
      finally{geminiBusy=false;geminiController=null;$('analyzeGemini').disabled=false;$('cancelGemini').hidden=true;}
    });
    $('copyAIRequest').addEventListener('click',async function(){
      var text=fillRequest();try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);message('Copied. Paste the request into your AI, then bring its response back here.');}
      catch(e){$('requestFallback').open=true;$('requestText').focus();$('requestText').select();message('Request selected. Press Ctrl+C (or Copy) and paste it into your AI.');}
    });
    $('downloadAIRequest').addEventListener('click',function(){F.download('ai-request-'+meta.id+'.txt',fillRequest(),'text/plain');});
    $('downloadAttemptData').addEventListener('click',function(){F.download('attempt-'+meta.id+'.json',JSON.stringify({subject:meta.subject,title:meta.title,testType:meta.testType,testNumber:meta.testNumber,setChapter:meta.setChapter,questions:data},null,2));});
    function invalidate(){staged=null;inputVersion++;$('saveAIResponse').disabled=true;$('aiResponsePreview').hidden=true;}
    $('aiResponse').addEventListener('input',invalidate);
    $('aiResponseFile').addEventListener('change',async function(){invalidate();var v=inputVersion,file=this.files[0];if(!file)return;try{var text=await file.text();if(v!==inputVersion)return;$('aiResponse').value=text;message('Response file loaded. Select Preview feedback & ranking.');}catch(e){message('Could not read that response file.');}});
    $('previewAIResponse').addEventListener('click',function(){
      invalidate();
      try{
        staged=F.review($('aiResponse').value,data,meta);
        var preview='<h3>Preview · '+staged.count+' question updates</h3><p>Ranked using your original test results. This import updates the saved attempt; it does not create another attempt.</p>'+
          staged.warnings.map(function(w){return '<p class="flow-notice">'+F.escape(w)+'</p>';}).join('')+rankTable(staged.questions)+
          '<details><summary>Check reasoning, calculation &amp; justification</summary>'+staged.changed.map(function(p){var q=staged.questions.find(function(x){return String(x.qno)===String(p.qno);});return '<section class="flow-preview"><strong>Q'+F.escape(q.qno)+' · '+F.escape(q.chapter||'Unassigned')+'</strong><p>'+F.escape(F.plain(q.qtext).slice(0,200))+'</p>'+F.feedback(q)+'</section>';}).join('')+'</details>';
        $('aiResponsePreview').innerHTML=preview;$('aiResponsePreview').hidden=false;$('saveAIResponse').disabled=false;
        message('Preview ready. Check the feedback and topic ranking, then save.');
      }catch(e){message(e.message);}
    });
    $('saveAIResponse').addEventListener('click',async function(){
      if(!staged)return;
      $('saveAIResponse').disabled=true;
      try{
        if(localStorage.getItem('tymba_exam_data:'+meta.id)!==original)throw new Error('This attempt changed in another tab. Reload it before importing.');
        var merged=staged.questions.map(function(q){var x=Object.assign({},q);if(typeof x.debrief==='string')x.debrief=F.sanitize(x.debrief);return x;});
        F.save(localStorage,'tymba_exam_data:'+meta.id,merged);
        try{sessionStorage.setItem('personal_hub_ai_saved:'+meta.id,'1');}catch(e){}
        original=localStorage.getItem('tymba_exam_data:'+meta.id);
        if(root.PersonalHubAuth){message('Saved in this browser. Verifying cloud backup…');if(!await root.PersonalHubAuth.sync(true)){message('Saved locally, but cloud backup failed. Use SAVE TO CLOUD before leaving this page.');$('saveAIResponse').disabled=false;return;}}
        onSaved(merged);
      }catch(e){$('saveAIResponse').disabled=false;message('Could not save: '+e.message);}
    });
    M && ChapterUI.mountEditor($('chapterEditor'),data,meta,localStorage,function(merged){
      if(localStorage.getItem('tymba_exam_data:'+meta.id)!==original)throw new Error('This attempt changed elsewhere. Reload before saving.');
      F.save(localStorage,'tymba_exam_data:'+meta.id,merged);onSaved(merged);
    });
    el.addEventListener('click',function(e){if(e.target.id==='saveChapterCatalog')setTimeout(fillRequest,0);});
    try{if(sessionStorage.getItem('personal_hub_ai_saved:'+meta.id)){message('Saved! Your topic ranking, line graph and strengths/weaknesses are updated.');$('aiResponseMessage').className='flow-success';sessionStorage.removeItem('personal_hub_ai_saved:'+meta.id);}}catch(e){}
  }
  root.DebriefWorkflow={mount:mount,rankTable:rankTable};
})(window);
