(function(){
  function normalize(exams){
    var counters={};
    return exams.map(function(e){
      var x=Object.assign({},e);
      if(window.SubjectCatalog)x.subject=window.SubjectCatalog.canonical(x.subject);
      x.id=x.id||x.file;
      x.testType=x.testType==='set'?'set':(x.testType==='pre'||x.testType==='progress')?'pre':x.testType==='mock'?'mock':(/(?:pre|progress)[\s-]*test/i.test(x.title||'')?'pre':'mock');
      var key=x.subject+'|'+x.testType;
      var match=(x.title||'').match(/(?:(?:pre|progress)[\s-]*test|mock(?:\s+exam|\s+test)?)\s*#?\s*(\d+)/i);
      var number=Number(x.testNumber)||(match?Number(match[1]):0);
      x.testNumber=Number.isSafeInteger(number)&&number>0?number:(counters[key]||0)+1;
      counters[key]=Math.max(counters[key]||0,x.testNumber);
      x.title=String(x.title||'').replace(/\bpre[\s-]*test/gi,'Progress Test');
      return x;
    });
  }
  function label(e){return (e.testType==='set'?'Set':e.testType==='pre'?'Progress Test':'Mock Test')+' '+e.testNumber;}
  function analysisExams(exams,storage){
    var excluded=JSON.parse(storage.getItem('tymba_analysis_excluded_v1')||'[]');
    return exams.filter(function(e){return excluded.indexOf(e.id)===-1;});
  }
  function resetAnalysis(exams,storage){
    var excluded=JSON.parse(storage.getItem('tymba_analysis_excluded_v1')||'[]');
    exams.forEach(function(e){if(excluded.indexOf(e.id)===-1) excluded.push(e.id);});
    storage.setItem('tymba_analysis_excluded_v1',JSON.stringify(excluded));
    exams.forEach(function(e){
      storage.removeItem('tymba_exam_confidence:'+e.id);
      storage.removeItem('tymba_retry_history:'+e.id);
    });
    storage.removeItem('tymba_topic_mastery_v1');
  }
  // Repair a stale auto-generated title when a learner changes an attempt's type
  // or number. Freeform titles stay exactly as the student wrote them.
  function suggestTitle(title,type,number){
    var raw=String(title||'').trim();
    var generated=label({testType:type,testNumber:number});
    if(!raw)return generated;
    var match=raw.match(/^(?:(?:Chapter\s+)?Set|(?:Pre|Progress)\s+Test|Mock\s+(?:Test|Exam))\s*#?\s*\d+(\s+[—–-]\s+.+)?$/i);
    return match?generated+(match[1]||''):raw;
  }
  function updateSavedAttempt(storage,id,details){
    if(!id)throw Error('An attempt ID is required.');
    var type=details&&details.testType;
    var number=Number(details&&details.testNumber);
    var title=String(details&&details.title||'').trim();
    var chapter=type==='set'?String(details.setChapter||'').trim():'';
    if(!['pre','mock','set'].includes(type))throw Error('Choose a valid attempt type.');
    if(!Number.isSafeInteger(number)||number<1||number>999)throw Error('Enter a test number from 1 to 999.');
    if(!title||title.length>180)throw Error('Enter an exam name between 1 and 180 characters.');
    if(type==='set'&&(!chapter||chapter.length>420))throw Error('Enter a Chapter Set target (maximum 420 characters).');
    var list=JSON.parse(storage.getItem('tymba_custom_exams')||'[]');
    if(!Array.isArray(list))throw Error('Saved attempts are not in the expected format.');
    var index=list.findIndex(function(item){return item&&item.id===id;});
    if(index===-1)throw Error('This attempt cannot be edited because it is not in your saved attempts.');
    var previous=list[index];
    var next=Object.assign({},previous,{
      title:title,testType:type,testNumber:number,
      setChapter:chapter,
      setTotal:type==='set'&&Number(previous.setTotal)>=number?previous.setTotal:null
    });
    list[index]=next;
    // Only metadata is updated: attempt ID, question data, grading, review progress,
    // original file link, debriefs, and all other saved attempts remain untouched.
    storage.setItem('tymba_custom_exams',JSON.stringify(list));
    return next;
  }
  window.ExamModel={normalize:normalize,label:label,analysisExams:analysisExams,resetAnalysis:resetAnalysis,
    suggestTitle:suggestTitle,updateSavedAttempt:updateSavedAttempt};
})();
