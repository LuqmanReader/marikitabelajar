(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);}, F=RevisionFlow;
  SubjectCatalog.fill($('subjectSelect'));
  var staged=null,source='',fileVersion=0;
  var localNow=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
  $('attemptDate').value=localNow;
  function message(text){$('entryMessage').textContent=text;}
  function invalidate(){staged=null;$('saveAttempt').disabled=true;$('entryPreview').innerHTML='';}
  function fields(){
    var type=$('testType').value, n=Number($('testNumber').value), chapter=ChapterAnalysis.label($('setChapter').value), total=$('setTotal').value.trim()?Number($('setTotal').value):null;
    if(!Number.isSafeInteger(n)||n<1)throw new Error('Use a whole set or test number of 1 or higher.');
    if(type==='set'&&!chapter)throw new Error('Enter the chapter this set belongs to.');
    if(type==='set'&&total!==null&&(!Number.isSafeInteger(total)||total<n))throw new Error('The number of available sets must be a whole number at least as high as this set number.');
    var date=new Date($('attemptDate').value);if(!Number.isFinite(date.getTime()))throw new Error('Choose the date and time of the attempt.');
    return {subject:$('subjectSelect').value,testType:type,testNumber:n,setChapter:type==='set'?chapter:'',setTotal:type==='set'?total:null,attemptedAt:date.toISOString()};
  }
  function names(){
    $('setChapterNames').innerHTML=ChapterAnalysis.catalog(localStorage,$('subjectSelect').value).map(function(n){return '<option value="'+F.escape(n)+'"></option>';}).join('');
  }
  function mode(){var set=$('testType').value==='set';$('setFields').hidden=!set;$('numberLabel').textContent=set?'Set number':'Test number';invalidate();}
  $('testType').addEventListener('change',mode);$('subjectSelect').addEventListener('change',names);
  ['subjectSelect','testNumber','setChapter','setTotal','attemptDate','titleInput'].forEach(function(id){$(id).addEventListener('input',invalidate);});
  $('sourceFile').addEventListener('change',async function(){
    invalidate();source='';var version=++fileVersion,file=this.files[0];$('parseAttempt').disabled=true;
    if(!file)return;
    try{var text=await file.text();if(version!==fileVersion)return;source=text;$('parseAttempt').disabled=false;message(file.name+' is ready to review.');}catch(e){message('Could not read this file.');}
  });
  function validateQuestions(qs,meta){
    if(!Array.isArray(qs)||!qs.length)throw new Error('No questions found. Use a marked attempt-review export.');
    var seen=new Set();
    return qs.map(function(q){
      var n=Number(q.qno);if(!Number.isSafeInteger(n)||n<1||seen.has(n))throw new Error('Every question needs a unique positive question number.');seen.add(n);
      if(q.is_correct!==true&&q.is_correct!==false&&q.is_correct!==null)throw new Error('Q'+n+' needs an original result (true, false, or null for unscored).');
      if(typeof q.qtext!=='string')throw new Error('Q'+n+' is missing its question text field.');
      var x=Object.assign({},q,{qno:n,qtext:F.sanitize(q.qtext),chapter:ChapterAnalysis.label(q.chapter||meta.setChapter||''),options:(Array.isArray(q.options)?q.options:[]).map(function(o){return {text:F.sanitize(o.text||''),checked:!!o.checked};})});
      x.your_answer=q.your_answer==null?null:F.sanitize(q.your_answer);x.correct_answer=String(q.correct_answer||'');x.debrief=F.sanitize(q.debrief||'');
      return x;
    });
  }
  function parseHtml(text){
    var doc=new DOMParser().parseFromString(text,'text/html'), els=Array.from(doc.querySelectorAll('div.que'));
    if(!els.length)throw new Error('This is not a marked attempt-review page. Export the page that shows each question and its result.');
    var questions=[],sharedHtml='',sharedRemaining=0,numberWords={one:1,two:2,three:3,four:4,five:5,six:6};
    els.forEach(function(el){
      var no=el.querySelector('h3.no .qno');
      // Moodle/TymbaFlex inserts unnumbered "Information" cards between real
      // questions. They are context, not attempts; treating them as questions
      // creates duplicate numbers (for example Information -> Q9, then real Q9).
      if(!no){
        var info=el.querySelector('.qtext');
        if(info){
          sharedHtml=info.innerHTML;
          var label=(info.textContent||'').match(/relates?\s+to\s+(\d+|one|two|three|four|five|six)\s+questions?/i);
          sharedRemaining=label?(numberWords[label[1].toLowerCase()]||Number(label[1])||1):1;
        }
        return;
      }
      var state=(el.querySelector('.state')?.textContent||'').trim().toLowerCase();
      var correct=state==='correct'?true:['incorrect','partially correct','not answered'].includes(state)?false:null;
      var qt=el.querySelector('.qtext'),answer=el.querySelector('.answer'),right=el.querySelector('.rightanswer');
      var options=Array.from(el.querySelectorAll('.answer > div')).map(function(o){var t=o.querySelector('[data-region="answer-label"] .flex-fill')||o.querySelector('[data-region="answer-label"]')||o.querySelector('label');return {text:t?t.innerHTML:'',checked:!!o.querySelector('input[checked]')};}).filter(function(o){return o.text;});
      var chosen=options.filter(function(o){return o.checked;}).map(function(o){return o.text;});
      if(!chosen.length){Array.from(el.querySelectorAll('.qtext select,.answer select,.answer input[type=text],.qtext input[type=text],.answer input[type=number],.qtext input[type=number]')).forEach(function(x){var v=x.tagName==='SELECT'?x.options[x.selectedIndex]?.textContent:x.getAttribute('value');if(v)chosen.push(F.escape(v));});}
      var feedback=el.querySelector('.specificfeedback');
      var qtext=qt?qt.innerHTML:'';
      if(sharedHtml&&sharedRemaining>0){qtext='<div><strong>Shared information:</strong>'+sharedHtml+'</div>'+qtext;sharedRemaining--;if(!sharedRemaining)sharedHtml='';}
      questions.push({qno:Number(no.textContent),is_correct:correct,qtext:qtext,options:options,your_answer:chosen.join('<br>')||null,correct_answer:right?right.textContent.replace(/^\s*The correct answer is:\s*/i,'').trim():'',debrief:'',source_feedback:feedback?F.sanitize(feedback.innerHTML):'',fb_is_custom:false});
    });
    if(!questions.length)throw new Error('No numbered questions were found. Make sure the saved page shows the full attempt review.');
    return questions;
  }
  $('parseAttempt').addEventListener('click',function(){
    invalidate();
    try{
      var meta=fields(),trim=source.trim(),parsed=/^[\[{]/.test(trim)?F.parse(trim):null;
      var qs=validateQuestions(parsed?(Array.isArray(parsed)?parsed:parsed.questions):parseHtml(source),meta);
      var graded=qs.filter(function(q){return typeof q.is_correct==='boolean';}),correct=graded.filter(function(q){return q.is_correct;}).length;
      meta.correct=correct;meta.total=graded.length;meta.totalQuestions=qs.length;
      meta.title=ExamModel.label(meta)+(meta.setChapter?' · '+meta.setChapter:'')+($('titleInput').value.trim()?' — '+$('titleInput').value.trim():'');
      staged={meta:meta,questions:qs};
      $('entryPreview').innerHTML='<div class="flow-score"><strong>'+(graded.length?Math.round(correct/graded.length*100)+'%':'Unscored')+'</strong><span>'+correct+'/'+graded.length+' fully correct · '+qs.length+' questions</span></div>'+ (qs.length!==graded.length?'<p>'+ (qs.length-graded.length)+' questions are unscored and excluded from accuracy.</p>':'')+'<p>Your answer review is ready. Save it to open the debrief and prepare your AI request.</p><details><summary>Check the parsed questions</summary>'+qs.map(function(q){return '<p><strong>Q'+q.qno+' · '+(q.is_correct===true?'Correct':q.is_correct===false?'Incorrect':'Unscored')+'</strong> — '+F.escape(F.plain(q.qtext).slice(0,180)||'Question text missing')+'</p>';}).join('')+'</details>';
      $('saveAttempt').disabled=false;message('Review the result, then save this attempt.');
    }catch(e){message(e.message);}
  });
  $('saveAttempt').addEventListener('click',function(){
    if(!staged)return;
    var meta=Object.assign({},staged.meta), id='attempt-'+Date.now()+'-'+Math.random().toString(36).slice(2,9), key='tymba_exam_data:'+id;
    meta.id=id;meta.createdAt=new Date().toISOString();meta.file='view.html?id='+encodeURIComponent(id);meta.topics={};
    try{
      var exams=JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]');if(!Array.isArray(exams))throw new Error('Saved attempts could not be read.');
      F.save(localStorage,key,staged.questions);
      try{F.save(localStorage,'tymba_custom_exams',exams.concat([meta]));}catch(e){localStorage.removeItem(key);throw e;}
      this.disabled=true;location.href=meta.file;
    }catch(e){message('Could not save: '+e.message);}
  });
  mode();names();
})();
