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
  window.ExamModel={normalize:normalize,label:label,analysisExams:analysisExams,resetAnalysis:resetAnalysis};
})();
