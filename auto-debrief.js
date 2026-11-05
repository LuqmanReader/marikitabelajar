/* LedgerPeer automatic exam debrief: no copy/paste or file re-upload.
 * Uses the existing authenticated analyze-attempt edge function.
 * Failures never overwrite original grades or invent missing visual evidence.
 */
(function(root){
'use strict';
var running=false;
function $id(id){return document.getElementById(id);}
function source(id){try{return JSON.parse(localStorage.getItem('tymba_exam_data:'+id)||'[]');}catch(e){return [];}}
function exams(){try{return ExamModel.normalize(JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]'));}catch(e){return [];}}
function complete(q){return !!(q&&q.chapter&&typeof q.reasoning==='string'&&q.reasoning.trim()&&typeof q.justification==='string'&&q.justification.trim());}
function panel(){
  var el=$id('autoDebriefStatus');
  if(el)return el;
  var host=$id('claudeSyncPanel'),parent=host&&host.parentElement;
  if(!host||!parent)return null;
  el=document.createElement('section');el.id='autoDebriefStatus';el.className='flow-panel';
  el.style.cssText='padding:12px 14px;margin:0 0 15px;border:3px solid #111;background:#fff4d2;';
  var strong=document.createElement('strong');strong.textContent='Automatic question debrief';strong.style.display='block';
  var status=document.createElement('p');status.id='autoDebriefMessage';status.setAttribute('role','status');
  status.style.cssText='font-size:12px;line-height:1.55;margin:8px 0;';
  var btn=document.createElement('button');btn.type='button';btn.id='autoDebriefRetry';btn.className='flow-button secondary';btn.textContent='Resume incomplete debrief';btn.hidden=true;
  el.append(strong,status,btn);parent.insertBefore(el,host);
  btn.addEventListener('click',function(){start(true);});
  return el;
}
function update(text,action){
  var el=panel(),node=$id('autoDebriefMessage'),btn=$id('autoDebriefRetry');
  if(node)node.textContent=text;
  if(btn)btn.hidden=!action;
  if(el)el.hidden=false;
}
async function start(manual){
  if(running)return;
  var params=new URLSearchParams(location.search),id=params.get('id');
  if(!id)return;
  var meta=exams().find(function(x){return x.id===id;});
  var list=source(id);
  if(!meta||!list.length)return;
  if(!manual&&params.get('autodebrief')!=='1')return;
  if(!meta.subject){update('Select a paper before generating explanations.',false);return;}
  var approved=root.LedgerSyllabus&&root.LedgerSyllabus.resolve(localStorage,meta.subject);
  var catalog=approved&&approved.topics||[];
  if(!catalog.length){update('No verified topic catalog for '+meta.subject+'. Configure the paper syllabus before analysing.',true);return;}
  var pending=list.filter(function(q){return !complete(q);});
  if(!pending.length){update('Debrief complete. All '+list.length+' questions have saved explanations.',false);return;}
  var auth=root.PersonalHubAuth;
  if(!auth||typeof auth.sync!=='function'){update('Automatic analysis requires a signed-in LedgerPeer session.',true);return;}
  running=true;
  var completed=0;
  try{
    var ready=await auth.ready();
    if(!ready)throw new Error('Sign in to LedgerPeer to enable automatic analysis.');
    // The edge function reads RLS-protected user_documents, so save to cloud first.
    update('Saving the attempt securely before analysis…',false);
    var synced=await auth.sync(true);
    if(synced===false)throw new Error('Cloud backup is not available. The attempt remains saved locally; resume when sync is available.');
    var client=auth.getClient&&auth.getClient();
    if(!client)throw new Error('LedgerPeer AI service is unavailable.');
    var session=await client.auth.getSession();
    if(!session.data||!session.data.session||!session.data.session.access_token)throw new Error('Your session needs to be refreshed.');
    var signature=RevisionFlow.signature(list);
    // Small sequential batches avoid exhausting model output limits. Never
    // retry a failed AI batch automatically (especially on quota errors).
    var groups=[];
    for(var i=0;i<pending.length;i+=8)groups.push(pending.slice(i,i+8));
    for(var n=0;n<groups.length;n++){
      update('Generating explanations: batch '+(n+1)+' of '+groups.length+' · '+completed+'/'+pending.length+' questions completed.',false);
      var payload={
        exam_id:id,attempt_signature:signature,
        qnos:groups[n].map(function(q){return q.qno;}),
        subject:meta.subject,set_chapter:meta.testType==='set'?meta.setChapter||'':'',
        topic_catalog:catalog
      };
      var answer=await client.functions.invoke('analyze-attempt',{body:payload});
      if(answer.error){
        var detail=null;
        try{detail=await answer.error.context.json();}catch(e){}
        throw new Error((detail&&detail.error)||answer.error.message||'AI service request failed.');
      }
      if(!answer.data||!Array.isArray(answer.data.questions)||!answer.data.questions.length)
        throw new Error('AI service did not return a valid question analysis.');
      list=source(id);
      var reviewed=RevisionFlow.review(answer.data,list,meta);
      RevisionFlow.save(localStorage,'tymba_exam_data:'+id,reviewed.questions);
      list=reviewed.questions;
      completed+=reviewed.count;
      await auth.sync(true);
    }
    var left=source(id).filter(function(q){return !complete(q);});
    if(left.length)update(completed+' explanations saved. '+left.length+' question(s) need additional review; choose Resume incomplete debrief.',true);
    else update('All '+list.length+' questions now have AI explanations. Original marks remain unchanged.',false);
    // Existing review renderer uses its saved initial snapshot. Refresh once
    // after successful generation to display the new correction cards.
    if(completed&&root.sessionStorage){
      var key='lp_auto_debrief_refreshed_'+id;
      if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');location.replace('view.html?id='+encodeURIComponent(id));}
    }
  }catch(e){
    update((completed?completed+' explanations saved. ':'')+'Automatic analysis paused: '+String(e.message||e)+'. Your attempt is safe; resume when ready.',true);
  }finally{running=false;}
}
function concealManualHandoff(){
  var container=$id('chatgpt-debrief');
  if(!container||$id('manualDebriefFallback'))return;
  var sections=Array.from(container.querySelectorAll(':scope > section.flow-path'))
    .filter(function(section){return /Copy the question request|Bring the JSON back/i.test(section.textContent||'');});
  if(!sections.length)return;
  var details=document.createElement('details');
  details.id='manualDebriefFallback';
  details.className='html-help';
  details.style.marginTop='12px';
  var summary=document.createElement('summary');
  summary.textContent='Advanced · Manual analysis backup (only if automatic analysis is unavailable)';
  details.appendChild(summary);
  sections.forEach(function(section){details.appendChild(section);});
  container.appendChild(details);
}
function init(){
  if(new URLSearchParams(location.search).get('autodebrief')==='1'){
    panel();concealManualHandoff();start(false);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
root.LedgerPeerAutoDebrief={start:start};
})(window);
