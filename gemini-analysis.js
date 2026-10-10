(function(root){
  'use strict';
  function complete(response, questions, meta, expectedSignature) {
    if(!response || response.exam_id!==meta.id || response.attempt_signature!==(expectedSignature||RevisionFlow.signature(questions)))
      throw new Error('The returned analysis belongs to a different attempt.');
    if(!Array.isArray(response.questions) || response.questions.length!==questions.length)
      throw new Error('Gemini did not finish every question. Your saved attempt has not changed.');
    var seen=new Set(), known=new Set(questions.map(function(q){return String(q.qno);}));
    response.questions.forEach(function(q){
      var n=String(q.qno);
      if(!known.has(n)||seen.has(n))throw new Error('Gemini returned an unexpected or duplicate question.');
      seen.add(n);
      ['chapter','reasoning','calculation','justification','focus'].forEach(function(k){
        if(typeof q[k]!=='string'||q[k].length>24000)throw new Error('Gemini returned invalid feedback.');
      });
    });
    return RevisionFlow.review(Object.assign({},response,{attempt_signature:RevisionFlow.signature(questions)}),questions,meta);
  }
  async function analyze(meta,questions,onProgress,signal) {
    var auth=root.PersonalHubAuth;
    if(!auth)throw new Error('Please log in first.');
    onProgress('Verifying your saved attempt…');
    if(!await auth.sync(true))throw new Error('Cloud save failed. Resolve the cloud error before requesting analysis.');
    var client=await auth.init(), signature=RevisionFlow.signature(questions), all=[];
    for(var start=0;start<questions.length;start+=8){
      if(signal.aborted)throw new Error('Analysis cancelled. Your saved attempt has not changed.');
      onProgress('Analyzing questions '+(start+1)+'–'+Math.min(start+8,questions.length)+' of '+questions.length+'…');
      var result=await client.functions.invoke('analyze-attempt',{
        body:{exam_id:meta.id,attempt_signature:signature,qnos:questions.slice(start,start+8).map(function(q){return q.qno;})},signal:signal
      });
      if(signal.aborted)throw new Error('Analysis cancelled. Your saved attempt has not changed.');
      if(result.error){
        var detail='';
        try{detail=(await result.error.context.json()).error||'';}catch(e){}
        throw new Error(detail||'Gemini could not connect. Check the Supabase function and Gemini secret, then try again.');
      }
      var response=result.data;
      if(response && response.error)throw new Error(response.error);
      complete(response,questions.slice(start,start+8),meta,signature);
      // Each batch carries the full-attempt signature, checked separately below.
      all=all.concat(response.questions);
    }
    var response={schema:'personal-hub-debrief-v2',exam_id:meta.id,attempt_signature:signature,questions:all};
    complete(response,questions,meta);
    return response;
  }
  root.GeminiAnalysis={analyze:analyze,validate:complete};
})(window);
