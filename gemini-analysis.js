/* LedgerPeer AI debrief: resume from locally saved batches, keep full tutor feedback,
   and respect quota errors. Original marks and answers are never modified. */
(function(root){
  'use strict';
  // Eighteen full explanations per API call: 50 questions usually require three calls.
  // The server enforces the same upper bound; completed feedback is cached per question.
  const BATCH_SIZE=18;
  const BATCH_CHAR_BUDGET=34000;
  const PAUSE_BETWEEN_BATCHES_MS=15500; // below a 5 RPM project limit
  function estimateSize(q){return JSON.stringify([q.qtext,q.options,q.your_answer,q.correct_answer,q.source_feedback]).length;}
  function chooseBatch(pending,maxItems=BATCH_SIZE){
    const batch=[];let used=0;
    for(const q of pending){
      const size=estimateSize(q);
      if(batch.length&&(batch.length>=maxItems||used+size>BATCH_CHAR_BUDGET))break;
      batch.push(q);used+=size;
    }
    return batch;
  }
  const F=root.RevisionFlow;
  const S=root.ChapterAnalysis;
  function aborted(signal){if(signal?.aborted)throw new Error('Analysis stopped. Completed questions remain saved. Click Analyze again to resume.');}
  function wait(ms,signal){return new Promise(function(resolve,reject){
    if(signal?.aborted)return reject(new Error('Analysis stopped. Completed questions remain saved.'));
    const timer=setTimeout(function(){if(signal)signal.removeEventListener('abort',cancel);resolve();},ms);
    function cancel(){clearTimeout(timer);reject(new Error('Analysis stopped. Completed questions remain saved.'));}
    if(signal)signal.addEventListener('abort',cancel,{once:true});
  });}
  function cached(q,catalog){
    if(!q||typeof q.chapter!=='string'||!q.chapter.trim())return false;
    if(Array.isArray(catalog)&&catalog.length&&!catalog.some(t=>t.toLowerCase()===q.chapter.trim().toLowerCase()))return false;
    return ['reasoning','calculation','justification','focus'].every(k=>typeof q[k]==='string'&&q[k].trim().length>0);
  }
  function validate(response, batch, meta, signature, catalog){
    if(!response || response.exam_id!==meta.id || response.attempt_signature!==signature)
      throw new Error('Gemini returned feedback for another attempt. No data was changed.');
    if(!Array.isArray(response.questions)||!response.questions.length||response.questions.length>batch.length)
      throw new Error('Gemini returned no usable answers. Previously saved questions are intact.');
    const incoming=new Map();
    const numbers=new Set(batch.map(q=>String(q.qno)));
    for(const item of response.questions){
      const n=String(item?.qno);
      if(!numbers.has(n)||incoming.has(n))throw new Error('Gemini returned a duplicate or unexpected question.');
      for(const name of ['chapter','reasoning','calculation','justification','focus']){
        if(typeof item[name]!=='string'||!item[name].trim()||item[name].length>24000)
          throw new Error('Gemini left '+name+' empty or invalid on Q'+n+'.');
      }
      if(/^(other|miscellaneous|general|uncategorized|unassigned|unknown|n\/?a)$/i.test(item.chapter.trim()))
        throw new Error('Gemini failed to classify Question '+n+'.');
      if(catalog.length&&!catalog.some(t=>t.toLowerCase()===item.chapter.trim().toLowerCase()))
        throw new Error('Question '+n+' received a topic outside the selected paper’s topic list.');
      incoming.set(n,item);
    }
    return response;
  }
  function makeResponse(working,meta,signature){
    return {schema:'personal-hub-debrief-v2',exam_id:meta.id,attempt_signature:signature,
      questions:working.map(q=>({qno:q.qno,chapter:q.chapter,reasoning:q.reasoning,calculation:q.calculation,justification:q.justification,focus:q.focus}))};
  }
  async function invoke(client,body,signal){
    const res=await client.functions.invoke('analyze-attempt',{body,signal});
    if(res.error){
      let details={};
      try{details=await res.error.context?.json()||{};}catch(e){}
      const err=new Error(details.error||'Gemini could not connect. Check Supabase function logs.');
      err.rateLimited=Number(res.error.context?.status)===429||['GEMINI_RATE_LIMIT','GEMINI_DAILY_QUOTA'].includes(details.code);
      err.dailyQuota=details.code==='GEMINI_DAILY_QUOTA'||details.limit_type==='daily';
      err.retryAfter=Number(details.retry_after_seconds)||0;err.outputLimited=details.code==='GEMINI_OUTPUT_LIMIT';
      throw err;
    }
    if(res.data?.error){const err=new Error(res.data.error);err.rateLimited=['GEMINI_RATE_LIMIT','GEMINI_DAILY_QUOTA'].includes(res.data.code);err.dailyQuota=res.data.code==='GEMINI_DAILY_QUOTA'||res.data.limit_type==='daily';err.retryAfter=Number(res.data.retry_after_seconds)||0;err.outputLimited=res.data.code==='GEMINI_OUTPUT_LIMIT';throw err;}
    return res.data;
  }
  async function analyze(meta,questions,onProgress,signal){
    const auth=root.PersonalHubAuth;
    if(!auth)throw new Error('Log in to analyze this attempt.');
    const tell=typeof onProgress==='function'?onProgress:()=>{};
    const key='tymba_exam_data:'+meta.id;
    const signature=F.signature(questions);
    const catalog=S.catalog(localStorage,meta.subject);
    aborted(signal);
    tell('Checking saved exam…');
    // Inspect local cache BEFORE contacting Supabase: completed attempts use zero AI calls.
    let saved=localStorage.getItem(key);
    let working;
    try{working=JSON.parse(saved||'null');}catch(e){working=null;}
    if(!Array.isArray(working)||F.signature(working)!==signature)
      throw new Error('The saved exam has changed. Reload your attempt before analyzing.');
    let pending=working.filter(q=>!cached(q,catalog));
    let completed=working.length-pending.length;
    tell(completed+' of '+working.length+' questions already analysed. '+pending.length+' remaining.');
    if(pending.length){
      if(!await auth.sync(true))throw new Error('Cloud backup unavailable. Your attempt remains saved on this device. Resume after syncing.');
      // Cloud sync may merge saved data; verify it did not change the scored questions.
      saved=localStorage.getItem(key);
      try{working=JSON.parse(saved||'null');}catch(e){working=null;}
      if(!Array.isArray(working)||F.signature(working)!==signature)
        throw new Error('The attempt changed during cloud sync. Reload before analysing.');
      pending=working.filter(q=>!cached(q,catalog));
      completed=working.length-pending.length;
    }
    let calls=0,batchCap=BATCH_SIZE;
    const failedAssignments=new Map();
    while(pending.length){
      aborted(signal);
      const eligible=pending.filter(q=>(failedAssignments.get(String(q.qno))||0)<2);
      if(!eligible.length){
        throw new Error('Gemini could not reliably classify '+pending.length+' question(s): '+pending.map(q=>'Q'+q.qno).join(', ')+'. '+completed+'/'+working.length+' completed explanations were saved.');
      }
      const batch=chooseBatch(eligible,batchCap);
      tell('Explaining '+batch.length+' questions · '+completed+'/'+working.length+' already saved…');
      let response;
      try{
        const client=await auth.init();
        response=await invoke(client,{
          exam_id:meta.id,attempt_signature:signature,
          qnos:batch.map(q=>q.qno),subject:meta.subject,
          set_chapter:meta.setChapter||'',topic_catalog:catalog,mode:'full_debrief'
        },signal);
        validate(response,batch,meta,signature,catalog);
      }catch(e){
        if(e.outputLimited && batchCap>5){
          batchCap=Math.max(5,Math.floor(batchCap/2));
          tell('Gemini response was too long. Retrying with batches of '+batchCap+' after a pause…');
          await wait(PAUSE_BETWEEN_BATCHES_MS,signal);
          continue;
        }
        if(e.rateLimited){
          const quotaText=e.dailyQuota?'The project’s daily Gemini allowance is exhausted. Resume after the daily reset.':'Gemini is temporarily rate-limited. Wait and resume later.';
          throw new Error(quotaText+' '+completed+'/'+working.length+' explanations are saved. No automatic quota retries were made.');
        }
        throw e;
      }
      const returned=new Set(response.questions.map(q=>String(q.qno)));
      for(const item of batch){
        if(!returned.has(String(item.qno)))failedAssignments.set(String(item.qno),(failedAssignments.get(String(item.qno))||0)+1);
      }
      const merged=F.review(response,working,meta).questions;
      if(localStorage.getItem(key)!==saved)
        throw new Error('This attempt changed in another browser tab. Reload to resume; previously saved answers remain intact.');
      F.save(localStorage,key,merged);
      saved=localStorage.getItem(key);
      working=merged;
      const next=working.filter(q=>!cached(q,catalog));
      if(next.length>=pending.length)throw new Error('Gemini returned no additional complete explanations. Existing work was retained.');
      pending=next;
      completed=working.length-pending.length;
      calls++;
      tell('Saved '+completed+'/'+working.length+' questions · '+calls+' Gemini request'+(calls===1?'':'s')+' this run.');
      if(pending.length)await wait(PAUSE_BETWEEN_BATCHES_MS,signal);
    }
    tell('All '+working.length+' explanations are available. Updating analysis…');
    return makeResponse(working,meta,signature);
  }
  root.GeminiAnalysis={analyze:analyze,validate:validate,hasCompleteFeedback:cached};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GeminiAnalysis;
})(typeof window!=='undefined'?window:globalThis);
