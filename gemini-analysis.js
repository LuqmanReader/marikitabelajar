/* LedgerPeer AI debrief: resume from locally saved batches, keep full tutor feedback,
   and respect quota errors. Original marks and answers are never modified. */
(function(root){
  'use strict';
  const BATCH_SIZE=8;
  const PAUSE_BETWEEN_BATCHES_MS=9000;
  const MAX_QUOTA_RETRIES=2;
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
    if(!Array.isArray(response.questions)||response.questions.length!==batch.length)
      throw new Error('Gemini did not complete this batch. Your previously saved questions are intact.');
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
      err.rateLimited=Number(res.error.context?.status)===429||details.code==='GEMINI_RATE_LIMIT';
      err.retryAfter=Number(details.retry_after_seconds)||0;
      throw err;
    }
    if(res.data?.error){const err=new Error(res.data.error);err.rateLimited=res.data.code==='GEMINI_RATE_LIMIT';err.retryAfter=Number(res.data.retry_after_seconds)||0;throw err;}
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
    // Each new batch is saved locally before the next one starts. Supabase autosave
    // backs up that local state; it does not need a manual Save to Cloud button.
    if(!await auth.sync(true))throw new Error('Cloud backup is unavailable. Your attempt is saved on this device; retry when the cloud connection is working.');
    const client=await auth.init();
    let saved=localStorage.getItem(key);
    let working;
    try{working=JSON.parse(saved||'null');}catch(e){working=null;}
    if(!Array.isArray(working)||F.signature(working)!==signature)
      throw new Error('The saved exam has changed. Reload your attempt before analyzing.');
    let pending=working.filter(q=>!cached(q,catalog));
    const reused=working.length-pending.length;
    tell(reused+' of '+working.length+' questions already analysed. '+pending.length+' remaining.');
    let completed=0;
    for(let start=0;start<pending.length;start+=BATCH_SIZE){
      aborted(signal);
      const batch=pending.slice(start,start+BATCH_SIZE);
      let response, retry=0;
      while(true){
        aborted(signal);
        tell('Explaining '+batch.length+' questions · '+(reused+completed)+'/'+working.length+' saved…');
        try{
          response=await invoke(client,{
            exam_id:meta.id,attempt_signature:signature,
            qnos:batch.map(q=>q.qno),subject:meta.subject,
            set_chapter:meta.setChapter||'',topic_catalog:catalog,mode:'full_debrief'
          },signal);
          validate(response,batch,meta,signature,catalog);
          break;
        }catch(e){
          if(!e.rateLimited||retry>=MAX_QUOTA_RETRIES){
            if(e.rateLimited)throw new Error('Gemini quota is still unavailable. '+(reused+completed)+'/'+working.length+' questions are saved. Try again later; completed questions will be skipped.');
            throw e;
          }
          // A delay helps temporary rate limits, not exhausted daily quotas.
          const delay=Math.min(120000,Math.max(20000,e.retryAfter*1000,20000*Math.pow(2,retry)));
          retry++;
          tell('Gemini is rate-limited. Waiting '+Math.ceil(delay/1000)+' seconds before retry '+retry+'/'+MAX_QUOTA_RETRIES+'…');
          await wait(delay,signal);
        }
      }
      // Merge with the ORIGINAL scored questions. The validated AI response cannot
      // change the question text, answers, or marks.
      const merged=F.review(response,working,meta).questions;
      if(localStorage.getItem(key)!==saved)
        throw new Error('This attempt changed in another browser tab. Previously completed questions remain saved. Reload to resume.');
      F.save(localStorage,key,merged);
      saved=localStorage.getItem(key);
      working=merged;
      completed+=batch.length;
      tell('Saved '+(reused+completed)+'/'+working.length+' questions on this device. Cloud autosave is running.');
      if(start+BATCH_SIZE<pending.length)await wait(PAUSE_BETWEEN_BATCHES_MS,signal);
    }
    tell('All '+working.length+' explanations are available. Updating analysis…');
    return makeResponse(working,meta,signature);
  }
  root.GeminiAnalysis={analyze:analyze,validate:validate,hasCompleteFeedback:cached};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GeminiAnalysis;
})(typeof window!=='undefined'?window:globalThis);
