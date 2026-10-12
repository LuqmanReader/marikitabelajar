(function(root){
  'use strict';
  var F=RevisionFlow, M=ChapterAnalysis;
  function rankTable(questions){
    var rows=M.summary(questions).chapters.sort(function(a,b){return b.correct/b.total-a.correct/a.total||b.total-a.total;});
    if(!rows.length)return '<p>No graded questions have topic tags yet. AI will assign them.</p>';
    return '<div class="flow-table-scroll"><table class="flow-rank-table"><thead><tr><th>Rank</th><th>Topic</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>'+rows.map(function(r,i){return '<tr><td>'+(i+1)+'</td><td>'+F.escape(r.chapter)+'</td><td>'+r.correct+'/'+r.total+'</td><td>'+Math.round(r.correct/r.total*1000)/10+'%</td></tr>';}).join('')+'</tbody></table></div>';
  }
  function insights(questions){
    var sum=M.summary(questions),rows=sum.chapters.filter(function(r){return r.total>=3;});
    if(!rows.length)return '<p class="flow-muted">At least 3 graded questions in a topic are needed before it is labelled a strength or weakness. The chart still uses every graded, tagged question.</p>';
    var strong=rows.filter(function(r){return r.correct/r.total>=.8;}).sort(function(a,b){return b.correct/b.total-a.correct/a.total;}).slice(0,3);
    var weak=rows.filter(function(r){return r.correct/r.total<.6;}).sort(function(a,b){return a.correct/a.total-b.correct/b.total;}).slice(0,3);
    function group(title,items){return '<div class="flow-insight-card"><strong>'+title+'</strong>'+(items.length?'<ul>'+items.map(function(x){return '<li>'+F.escape(x.chapter)+' — '+x.correct+'/'+x.total+' correct</li>';}).join('')+'</ul>':'<p>Not enough evidence yet.</p>')+'</div>';}
    return '<div class="flow-insights">'+group('Strengths · 80%+',strong)+group('Needs work · under 60%',weak)+'</div>';
  }
  function mount(el,data,meta,onSaved){
    var staged=null,geminiBusy=false,geminiController=null;
    var original=localStorage.getItem('tymba_exam_data:'+meta.id);
    var summary=M.summary(data),explained=data.filter(F.hasFeedback).length;
    el.className='flow-panel';
    el.innerHTML='<nav class="flow-steps" aria-label="Revision workflow"><span>1 · Attempt saved</span><span class="current">2 · Generate AI debrief</span><span>3 · Analyze progress</span></nav>'+
      '<h2>One AI debrief · Every question</h2><p>One response assigns topics, explains answers and suggests what to practise. LedgerPeer uses <strong>your original marks</strong> to update topic rankings, graphs, strengths and weaknesses automatically.</p>'+
      '<p class="flow-muted">'+data.length+' questions saved · '+explained+' already explained · '+summary.coverage.tagged+' graded questions have topic tags.</p>'+
      '<section class="flow-path"><h3>A · Analyze inside LedgerPeer</h3><p>Classifies every question using the subject’s topic catalog, then explains it. Requires the updated Supabase <code>analyze-attempt</code> function; your questions and answers are sent securely to that AI service.</p>'+
      '<div class="flow-actions"><button type="button" id="analyzeGemini" class="flow-button primary">Analyze all questions with AI</button><button type="button" id="cancelGemini" class="flow-button secondary" hidden>Cancel analysis</button></div><p id="geminiMessage" role="status" aria-live="polite"></p></section>'+
      '<section class="flow-path"><h3>B · Or use ChatGPT</h3><p>Just copy the prepared request, get the JSON response, paste it back here, and click Apply. No manual chapter tagging, rankings or calculations required.</p>'+
      '<div class="flow-actions"><button type="button" id="copyAIRequest" class="flow-button">1 · Copy AI request</button><a class="flow-button secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Open ChatGPT ↗</a></div>'+
      '<label class="flow-field">2 · Paste the AI response<textarea id="aiResponse" class="flow-response" rows="7" placeholder="Paste one complete JSON response from your AI here."></textarea></label>'+
      '<label class="flow-field">Or upload the AI response (.json or .txt)<input type="file" id="aiResponseFile" accept=".json,.txt,application/json,text/plain"></label>'+
      '<div class="flow-actions"><button type="button" id="applyAIResponse" class="flow-button primary">3 · Apply debrief &amp; update graphs</button><button type="button" id="previewAIResponse" class="flow-button secondary">Preview first</button></div>'+
      '<details id="requestFallback"><summary>Manual copy / save AI request</summary><textarea id="requestText" rows="7" readonly aria-label="AI request to copy"></textarea><div class="flow-actions"><button type="button" id="downloadAIRequest" class="flow-button secondary">Download request (.txt)</button></div></details></section>'+
      '<p id="aiResponseMessage" role="status" aria-live="polite"></p><div id="aiResponsePreview" hidden class="flow-preview"></div>'+
      '<section class="flow-path"><h3>Topic analysis</h3>'+insights(data)+'<details><summary>Current topic ranking · strongest to weakest</summary>'+rankTable(data)+'</details><div class="flow-actions"><a class="flow-button secondary" href="hub.html#analysis">See graphs and strengths/weaknesses →</a><button type="button" id="downloadAttemptData" class="flow-button secondary">Download attempt backup</button></div></section>'+
      '<details><summary>Advanced · Edit question topics or the topic catalog</summary><div id="chapterEditor"></div></details>';
    var $=function(id){return el.querySelector('#'+id);};
    function message(text){$('aiResponseMessage').textContent=text;}
    function makePrompt(){return F.prompt(meta,data,M.catalog(localStorage,meta.subject));}
    function fillRequest(){var content=makePrompt();$('requestText').value=content;return content;}
    try {fillRequest();} catch(promptError) {
      console.warn('AI request preview unavailable:',promptError);
      $('requestText').value='Could not prepare manual AI prompt: '+promptError.message;
      $('aiResponseMessage').textContent='The manual prompt could not be prepared. Gemini analysis may still be available.';
    }
    function renderPreview(result){
      var coverage=M.summary(result.questions).coverage;
      var preview='<h3>Debrief preview · '+result.count+'/'+data.length+' questions</h3>'+
        '<p>'+coverage.tagged+' graded questions tagged · '+coverage.untagged+' still untagged. These statistics come from the original marked answers.</p>'+
        result.warnings.map(function(w){return '<p class="flow-notice">'+F.escape(w)+'</p>';}).join('')+
        insights(result.questions)+rankTable(result.questions)+
        '<details><summary>See each explanation</summary>'+result.changed.map(function(p){var q=result.questions.find(function(x){return String(x.qno)===String(p.qno);});return '<section class="flow-preview"><strong>Q'+F.escape(q.qno)+' · '+F.escape(q.chapter||'Unassigned')+'</strong><p>'+F.escape(F.plain(q.qtext).slice(0,200))+'</p>'+F.feedback(q)+'</section>';}).join('')+'</details>';
      $('aiResponsePreview').innerHTML=preview;$('aiResponsePreview').hidden=false;
    }
    async function saveResult(result){
      if(localStorage.getItem('tymba_exam_data:'+meta.id)!==original)throw new Error('The attempt changed in another tab. Reload before importing.');
      var merged=result.questions.map(function(q){var x=Object.assign({},q);if(typeof x.debrief==='string')x.debrief=F.sanitize(x.debrief);return x;});
      F.save(localStorage,'tymba_exam_data:'+meta.id,merged);
      try{sessionStorage.setItem('personal_hub_ai_saved:'+meta.id,'1');}catch(e){}
      original=localStorage.getItem('tymba_exam_data:'+meta.id);
      message('Saved on this device. Cloud backup will run automatically.');
      // Local data is saved immediately. Autosync keeps trying in the background;
      // never block a learner's debrief on a remote network request.
      message('Debrief saved. Opening your updated review…');
      onSaved(merged);
    }
    function confirmCoverage(result){
      var incomplete=result.count<data.length;
      var untagged=M.summary(result.questions).coverage.untagged;
      var missing=result.questions.filter(function(q){return q.is_correct===false&&!F.hasFeedback(q);}).length;
      if(incomplete||untagged||missing){
        var summary=[];
        if(incomplete)summary.push('Only '+result.count+' of '+data.length+' question updates were returned.');
        if(untagged)summary.push(untagged+' graded questions have no topic tag.');
        if(missing)summary.push(missing+' incorrect questions have no explanation.');
        return confirm('This response is incomplete:\n\n'+summary.join('\n')+'\n\nSave the partial debrief anyway? You can import more feedback later.');
      }
      return true;
    }
    $('copyAIRequest').addEventListener('click',async function(){
      var content=fillRequest();try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(content);message('Request copied. Paste it into ChatGPT, then bring the JSON answer back here.');}
      catch(e){$('requestFallback').open=true;$('requestText').focus();$('requestText').select();message('Request selected. Press Ctrl+C to copy it.');}
    });
    $('downloadAIRequest').addEventListener('click',function(){F.download('ai-request-'+meta.id+'.txt',fillRequest(),'text/plain');});
    $('downloadAttemptData').addEventListener('click',function(){F.download('attempt-'+meta.id+'.json',JSON.stringify({subject:meta.subject,title:meta.title,testType:meta.testType,testNumber:meta.testNumber,setChapter:meta.setChapter,questions:data},null,2));});
    $('aiResponseFile').addEventListener('change',async function(){
      var file=this.files[0];if(!file)return;
      try{$('aiResponse').value=await file.text();message('AI response loaded. Click Apply debrief & update graphs.');$('aiResponsePreview').hidden=true;}
      catch(e){message('Could not read the AI response file.');}
    });
    $('aiResponse').addEventListener('input',function(){$('aiResponsePreview').hidden=true;});
    $('previewAIResponse').addEventListener('click',function(){
      try{staged=F.review($('aiResponse').value,data,meta);renderPreview(staged);message('Preview ready. When satisfied, click Apply debrief & update graphs.');}
      catch(e){staged=null;message(e.message);}
    });
    $('applyAIResponse').addEventListener('click',async function(){
      var button=this;button.disabled=true;
      try{staged=F.review($('aiResponse').value,data,meta);renderPreview(staged);if(!confirmCoverage(staged))return;await saveResult(staged);}
      catch(e){message('Import failed: '+e.message);}
      finally{button.disabled=false;}
    });
    $('cancelGemini').addEventListener('click',function(){if(geminiController)geminiController.abort();});
    $('analyzeGemini').addEventListener('click',async function(){
      if(geminiBusy)return;geminiBusy=true;geminiController=new AbortController();
      $('analyzeGemini').disabled=true;$('cancelGemini').hidden=false;
      try{
        if(!root.GeminiAnalysis)throw new Error('gemini-analysis.js is missing. Use the manual AI workflow below.');
        var response=await root.GeminiAnalysis.analyze(meta,data,function(text){$('geminiMessage').textContent=text;},geminiController.signal);
        if(geminiController.signal.aborted)throw new Error('Analysis cancelled.');
        staged=F.review(response,data,meta);
        renderPreview(staged);
        if(!confirmCoverage(staged)){$('geminiMessage').textContent='Not saved. You can preview the results or try again.';return;}
        await saveResult(staged);
      }catch(e){$('geminiMessage').textContent=e.message||'Analysis failed. Use the manual workflow below.';}
      finally{geminiBusy=false;geminiController=null;$('analyzeGemini').disabled=false;$('cancelGemini').hidden=true;}
    });
    if(M&&root.ChapterUI)root.ChapterUI.mountEditor($('chapterEditor'),data,meta,localStorage,function(merged){
      if(localStorage.getItem('tymba_exam_data:'+meta.id)!==original)throw new Error('This attempt changed elsewhere. Reload before saving.');
      F.save(localStorage,'tymba_exam_data:'+meta.id,merged);onSaved(merged);
    });
    el.addEventListener('click',function(e){if(e.target.id==='saveChapterCatalog')setTimeout(fillRequest,0);});
    try{if(sessionStorage.getItem('personal_hub_ai_saved:'+meta.id)){message('Saved! Your question explanations, topic rankings, graphs and strengths/weaknesses have been refreshed.');$('aiResponseMessage').className='flow-success';sessionStorage.removeItem('personal_hub_ai_saved:'+meta.id);}}catch(e){}
  }
  root.DebriefWorkflow={mount:mount,rankTable:rankTable,insights:insights};
})(window);
