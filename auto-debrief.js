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
  var host=$id('chatgpt-debrief')||$id('claudeSyncPanel'),parent=host&&host.parentElement;
  if(!host||!parent)return null;
  el=document.createElement('section');el.id='autoDebriefStatus';el.className='flow-panel';
  el.style.cssText='padding:12px 14px;margin:0 0 15px;border:3px solid #111;background:#fff4d2;';
  var strong=document.createElement('strong');strong.textContent='Automatic question debrief';strong.style.display='block';
  var status=document.createElement('p');status.id='autoDebriefMessage';status.setAttribute('role','status');
  status.style.cssText='font-size:12px;line-height:1.55;margin:8px 0;';
  var btn=document.createElement('button');btn.type='button';btn.id='autoDebriefRetry';btn.className='flow-button secondary';btn.textContent='Generate / resume AI debrief';btn.hidden=true;
  var details=document.createElement('details');details.id='autoDebriefJsonDetails';details.style.cssText='margin-top:10px;font-size:11px';
  var summary=document.createElement('summary');summary.textContent='Advanced · View generated debrief JSON';
  var pre=document.createElement('pre');pre.id='autoDebriefJson';
  pre.style.cssText='max-height:280px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;border:2px solid #111;background:#fff;padding:10px;font-size:10px';
  details.append(summary,pre);
  el.append(strong,status,btn,details);parent.insertBefore(el,host);
  btn.addEventListener('click',function(){start(true);});
  return el;
}
function showSavedJson(){
  var params=new URLSearchParams(location.search),id=params.get('id'),pre=$id('autoDebriefJson'),details=$id('autoDebriefJsonDetails');
  if(!id||!pre||!details)return;
  var items=source(id).filter(function(q){return complete(q);}).map(function(q){
    return {qno:q.qno,chapter:q.chapter,reasoning:q.reasoning,
      calculation:q.calculation||'Not applicable',justification:q.justification,focus:q.focus||'',
      visual_observed_selection:q.visual_observed_selection||'',
      visual_observed_correct_answer:q.visual_observed_correct_answer||''};
  });
  details.hidden=!items.length;
  if(items.length)pre.textContent=JSON.stringify({schema:'personal-hub-debrief-v2',exam_id:id,
    questions:items,generated_from:'saved_question_feedback'},null,2);
}
function update(text,action){
  var el=panel(),node=$id('autoDebriefMessage'),btn=$id('autoDebriefRetry');
  if(node)node.textContent=text;
  if(btn)btn.hidden=!action;
  if(el)el.hidden=false;
  showSavedJson();
}
function scriptOnce(src,globalKey){
  if(root[globalKey])return Promise.resolve();
  if(root.__lpScriptLoads&&root.__lpScriptLoads[src])return root.__lpScriptLoads[src];
  root.__lpScriptLoads=root.__lpScriptLoads||{};
  return root.__lpScriptLoads[src]=new Promise(function(resolve,reject){
    var script=document.createElement('script');script.src=src;
    script.onload=function(){root[globalKey]?resolve():reject(new Error('Reader did not initialize'));};
    script.onerror=function(){reject(new Error('Unable to load extraction repair script.'));};
    document.head.appendChild(script);
  });
}
function pageTextFromHtml(html){
  var doc=new DOMParser().parseFromString(html,'text/html'),nodes=Array.from(doc.querySelectorAll('section.page'));
  return nodes.map(function(section,index){
    var region=section.querySelector('.page-text'),lines=region?
      Array.from(region.querySelectorAll('p')).map(function(el){return el.textContent.trim();}).filter(Boolean):[];
    if(!lines.length){
      var legacy=section.querySelector('details pre');
      if(legacy)lines=(legacy.textContent||'').split(/\r?\n/).map(function(s){return s.trim();}).filter(Boolean);
    }
    return {number:Number((section.id||'').replace('page-',''))||index+1,lines:lines,ocrConfidence:null};
  }).filter(function(p){return p.lines.length;});
}
async function repairLegacyOcr(id,meta,list){
  // Only repair known-broken OCR attempts. Never overwrite a learner's reviewed
  // corrections or rerun the full OCR whenever an old attempt is opened.
  if(!/^pdf/.test(meta.sourceType||'')||!list.length)return false;
  var originalGraded=list.filter(function(q){return typeof q.is_correct==='boolean';}).length;
  if(originalGraded>=Math.ceil(list.length*0.8))return false;
  var seenMarker='lp_ocr_repair_checked_'+id+'_v2';
  if(root.sessionStorage&&sessionStorage.getItem(seenMarker))return false;
  if(root.sessionStorage)sessionStorage.setItem(seenMarker,'1');
  if(!root.LedgerPeerPdfProof||typeof root.LedgerPeerPdfProof.getHtml!=='function')return false;
  update('Checking the original saved document to repair the inaccurate OCR grading…',false);
  var archived=await root.LedgerPeerPdfProof.getHtml(id).catch(function(){return null;});
  if(!archived)return false;
  var report=pageTextFromHtml(await archived.text());
  if(!report.length)return false;
  await scriptOnce('pdf-ocr-parser.js?v=20261105-repair2','LedgerPeerOcrParser');
  var repaired;
  try{repaired=root.LedgerPeerOcrParser.parse(report);}catch(e){return false;}
  var fixed=repaired.questions||[], graded=fixed.filter(function(q){return typeof q.is_correct==='boolean';}).length;
  if(fixed.length!==list.length||graded<=originalGraded||
    graded<Math.ceil(list.length*.65))return false;
  var known=new Map(list.map(function(q){return [q.qno,q];}));
  var combined=fixed.map(function(q){
    var old=known.get(q.qno)||{},next=Object.assign({},old,q);
    // Keep feedback and verified student annotations, but replace unreliable OCR
    // question text, answers and grade values with better source extraction.
    ['reasoning','calculation','justification','focus','topic_reason','topic_status','debrief'].forEach(function(k){
      if(old[k])next[k]=old[k];
    });
    if(old.chapter&&old.topic_origin==='manual')next.chapter=old.chapter;
    return next;
  });
  var saved=exams(),pos=saved.findIndex(function(e){return e.id===id;});
  if(pos<0)return false;
  var nextMeta=Object.assign({},saved[pos],{correct:combined.filter(function(q){return q.is_correct===true;}).length,
    total:graded,totalQuestions:combined.length,markCoverage:combined.filter(function(q){return q.original_marks!==null;}).length,
    ocrReconciliation:repaired.reconciliation||null,ocrRepairVersion:2});
  if(repaired.reconciliation){
    nextMeta.originalEarnedMarks=repaired.reconciliation.originalEarned;
    nextMeta.originalPossibleMarks=repaired.reconciliation.originalPossible;
  }else{delete nextMeta.originalEarnedMarks;delete nextMeta.originalPossibleMarks;}
  saved[pos]=nextMeta;
  RevisionFlow.save(localStorage,'tymba_exam_data:'+id,combined);
  RevisionFlow.save(localStorage,'tymba_custom_exams',saved);
  var auth=root.PersonalHubAuth;
  if(auth&&typeof auth.sync==='function'){
    try{
      var synced=await auth.sync(true);
      if(synced===false){
        update('Recovered '+graded+' question grades locally, but cloud backup is pending. Use Resume once your connection is restored.',true);
        return true;
      }
    }catch(syncError){
      update('OCR repair saved locally, but cloud backup is unavailable: '+String(syncError.message||syncError),true);
      return true;
    }
  }
  update('Recovered '+graded+'/'+combined.length+' question grades from the original PDF evidence. Opening the corrected debrief…',false);
  location.replace('view.html?id='+encodeURIComponent(id)+'&autodebrief=1&ocrrepaired=1');
  return true;
}
async function originalVisualPages(id){
  // Visual snapshots stay device-local until a logged-in student requests AI
  // analysis. Only PDF pages relevant to the current question batch are sent.
  if(!root.LedgerPeerPdfProof||!root.LedgerPeerPdfProof.getHtml)return new Map();
  var blob=await root.LedgerPeerPdfProof.getHtml(id).catch(function(){return null;});
  if(!blob)return new Map();
  var html=await blob.text(),doc=new DOMParser().parseFromString(html,'text/html'),map=new Map();
  Array.from(doc.querySelectorAll('section.page')).forEach(function(section){
    var n=Number((section.id||'').replace(/^page-/,'')),img=section.querySelector('img[src^="data:image/"]');
    if(!n||!img)return;
    var src=img.getAttribute('src')||'',m=src.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if(m&&m[2].length<=850000)map.set(n,{page:n,mime_type:m[1],data:m[2]});
  });
  return map;
}
function batchPages(qs,source){
  var ids=new Set();
  qs.forEach(function(q){(q.source_pdf_pages||[]).forEach(function(n){if(Number.isInteger(n))ids.add(n);});});
  var count=0,output=[];
  Array.from(ids).sort(function(a,b){return a-b;}).forEach(function(id){
    var item=source.get(id);
    if(!item||output.length>=5||count+item.data.length>1300000)return;
    output.push(item);count+=item.data.length;
  });
  return output;
}
async function start(manual){
  if(running)return;
  var params=new URLSearchParams(location.search),id=params.get('id');
  if(!id)return;
  var meta=exams().find(function(x){return x.id===id;});
  var list=source(id);
  if(!meta||!list.length)return;
  if(!manual&&params.get('autodebrief')!=='1'&&!meta.autoDebriefRequested&&!/autodebrief=1/.test(meta.file||''))return;
  if(!meta.subject){update('Select a paper before generating explanations.',false);return;}
  var approved=root.LedgerSyllabus&&root.LedgerSyllabus.resolve(localStorage,meta.subject);
  var catalog=approved&&approved.topics||[];
  if(!catalog.length){update('No verified topic catalog for '+meta.subject+'. Configure the paper syllabus before analysing.',true);return;}
  var pending=list.filter(function(q){return !complete(q);});
  if(!pending.length){update('Debrief complete. All '+list.length+' questions have saved explanations.',false);return;}
  if(!manual){
    try{if(await repairLegacyOcr(id,meta,list))return;}
    catch(e){update('Source repair was unavailable: '+String(e.message||e)+'. The saved attempt is unchanged.',true);}
  }
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
    var groups=[],visuals=await originalVisualPages(id);
    for(var i=0;i<pending.length;i+=8)groups.push(pending.slice(i,i+8));
    for(var n=0;n<groups.length;n++){
      update('Generating explanations: batch '+(n+1)+' of '+groups.length+' · '+completed+'/'+pending.length+' questions completed.',false);
      var payload={
        exam_id:id,attempt_signature:signature,
        qnos:groups[n].map(function(q){return q.qno;}),
        subject:meta.subject,set_chapter:meta.testType==='set'?meta.setChapter||'':'',
        topic_catalog:catalog,
        visual_pages:batchPages(groups[n],visuals)
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
  var query=new URLSearchParams(location.search),id=query.get('id'),
      meta=id&&exams().find(function(e){return e.id===id;});
  var requested=query.get('autodebrief')==='1'||!!(meta&&(meta.autoDebriefRequested||/autodebrief=1/.test(meta.file||'')));
  if(!meta)return;
  // A single action always exists for older attempts; no JSON handoff needed.
  panel();concealManualHandoff();
  var btn=$id('autoDebriefRetry');
  if(btn){btn.hidden=false;btn.textContent='Generate / resume AI debrief';}
  update('This attempt is ready for automatic question analysis. Original scores will not be changed by AI.',true);
  if(requested)start(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
root.LedgerPeerAutoDebrief={start:start};
})(window);
