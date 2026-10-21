(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);}, F=RevisionFlow;
  SubjectCatalog.fill($('subjectSelect'));
  var staged=null,source='',fileVersion=0;
  var localNow=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
  $('attemptDate').value=localNow;
  function message(text){$('entryMessage').textContent=text;}
  function invalidate(){staged=null;$('saveAttempt').disabled=true;$('entryPreview').innerHTML='';}
  function syllabus(){
    var resolved=window.LedgerSyllabus&&LedgerSyllabus.resolve(localStorage,$('subjectSelect').value);
    return resolved&&Array.isArray(resolved.topics)?resolved:{topics:[],verified:false};
  }
  function fields(){
    var type=$('testType').value, n=Number($('testNumber').value), chapter=ChapterAnalysis.label($('setChapter').value), total=$('setTotal').value.trim()?Number($('setTotal').value):null;
    var subject=$('subjectSelect').value,approved=syllabus().topics;
    if(!subject)throw new Error('Choose the FIA / ACCA paper for this attempt.');
    if(!Number.isSafeInteger(n)||n<1)throw new Error('Use a whole set or test number of 1 or higher.');
    if(type==='set'&&!chapter)throw new Error('Enter the chapter this set belongs to.');
    if(type==='set'&&approved.length&&!approved.includes(chapter))throw new Error('Choose the Chapter Set target from the approved syllabus topic list.');
    if(type==='set'&&total!==null&&(!Number.isSafeInteger(total)||total<n))throw new Error('The number of available sets must be a whole number at least as high as this set number.');
    var date=new Date($('attemptDate').value);if(!Number.isFinite(date.getTime()))throw new Error('Choose the date and time of the attempt.');
    return {subject:subject,testType:type,testNumber:n,setChapter:type==='set'?chapter:'',setTotal:type==='set'?total:null,attemptedAt:date.toISOString(),sourceType:'html'};
  }
  function names(){
    var selected=syllabus(),topics=selected.topics.length?selected.topics:ChapterAnalysis.catalog(localStorage,$('subjectSelect').value);
    $('setChapterNames').innerHTML=topics.map(function(n){return '<option value="'+F.escape(n)+'"></option>';}).join('');
    var code=window.LedgerSyllabus&&LedgerSyllabus.code($('subjectSelect').value),format=window.LedgerOfficialExamRegistry&&LedgerOfficialExamRegistry.get($('subjectSelect').value);
    $('formatReference').textContent=!$('subjectSelect').value?'Select a paper to load its official syllabus topics.':(code||$('subjectSelect').value)+' · '+topics.length+' approved syllabus topics'+(format&&format.variant?' · '+format.variant:'')+'.';
  }
  function mode(){var set=$('testType').value==='set';$('setFields').hidden=!set;$('setTotalWrap').hidden=!set;$('numberLabel').textContent=set?'Set number':'Test number';invalidate();}
  $('testType').addEventListener('change',mode);$('subjectSelect').addEventListener('change',names);
  ['subjectSelect','testNumber','setChapter','setTotal','attemptDate','titleInput'].forEach(function(id){$(id).addEventListener('input',invalidate);});
  $('sourceFile').addEventListener('change',async function(){
    invalidate();source='';var version=++fileVersion,file=this.files[0];$('parseAttempt').disabled=true;
    if(!file)return;
    if(!/\.html?$/i.test(file.name)&&file.type!=='text/html'){message('Choose an HTML attempt-review file (.html or .htm).');return;}
    try{var text=await file.text();if(version!==fileVersion)return;if(!/<(?:!doctype\s+html|html|div)\b/i.test(text))throw new Error('This file does not contain an HTML page.');source=text;$('parseAttempt').disabled=false;message(file.name+' is ready to extract.');}catch(e){message('Could not read this HTML file: '+e.message);}
  });
  function validateQuestions(qs,meta){
    if(!Array.isArray(qs)||!qs.length)throw new Error('No questions found. Use a marked attempt-review export.');
    var seen=new Set();
    return qs.map(function(q){
      var n=Number(q.qno);if(!Number.isSafeInteger(n)||n<1||seen.has(n))throw new Error('Every question needs a unique positive question number.');seen.add(n);
      if(q.is_correct!==true&&q.is_correct!==false&&q.is_correct!==null)throw new Error('Q'+n+' needs an original result (true, false, or null for unscored).');
      if(typeof q.qtext!=='string')throw new Error('Q'+n+' is missing its question text field.');
      var x=Object.assign({},q,{qno:n,qtext:F.sanitize(q.qtext),chapter:ChapterAnalysis.label(q.chapter||''),options:(Array.isArray(q.options)?q.options:[]).map(function(o){return {text:F.sanitize(o.text||''),checked:!!o.checked};})});
      x.your_answer=q.your_answer==null?null:F.sanitize(q.your_answer);x.correct_answer=String(q.correct_answer||'');x.debrief=F.sanitize(q.debrief||'');
      return x;
    });
  }
  function parseHtml(text){
    var doc=new DOMParser().parseFromString(text,'text/html'), els=Array.from(doc.querySelectorAll('div.que'));
    if(!els.length)throw new Error('This is not a marked attempt-review page. Export the page that shows each question and its result.');
    var questions=[],sharedHtml='',sharedPlain='',sharedRemaining=0,numberWords={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
    els.forEach(function(el){
      var no=el.querySelector('h3.no .qno');
      // Moodle/TymbaFlex inserts unnumbered "Information" cards between real
      // questions. They are context, not attempts; treating them as questions
      // creates duplicate numbers (for example Information -> Q9, then real Q9).
      if(!no){
        var info=el.querySelector('.qtext');
        if(info){
          sharedHtml=info.innerHTML;sharedPlain=(info.textContent||'').trim();
          var label=sharedPlain.match(/relates?\s+to\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+questions?/i);
          sharedRemaining=label?(numberWords[label[1].toLowerCase()]||Number(label[1])||1):1;
        }
        return;
      }
      var state=(el.querySelector('.state')?.textContent||'').trim().toLowerCase();
      var correct=state==='correct'?true:['incorrect','partially correct','not answered'].includes(state)?false:null;
      var qt=el.querySelector('.qtext'),answer=el.querySelector('.answer'),right=el.querySelector('.rightanswer');
      var options=Array.from(el.querySelectorAll('.answer > div')).map(function(o){var t=o.querySelector('[data-region="answer-label"] .flex-fill')||o.querySelector('[data-region="answer-label"]')||o.querySelector('label'),input=o.querySelector('input');return {text:t?t.innerHTML:'',checked:!!(input&&(input.hasAttribute('checked')||input.checked))};}).filter(function(o){return o.text;});
      var chosen=options.filter(function(o){return o.checked;}).map(function(o){return o.text;});
      if(!chosen.length){Array.from(el.querySelectorAll('.qtext select,.answer select,.answer input[type=text],.qtext input[type=text],.answer input[type=number],.qtext input[type=number]')).forEach(function(x){var v=x.tagName==='SELECT'?x.options[x.selectedIndex]?.textContent:x.getAttribute('value');if(v)chosen.push(F.escape(v));});}
      var feedback=el.querySelector('.specificfeedback'),gradeText=(el.querySelector('.grade')?.textContent||el.querySelector('.outcome')?.textContent||'').trim();
      var marks=gradeText.match(/(?:mark(?:s|ed)?\s*)?(-?\d+(?:\.\d+)?)\s*(?:out of|\/|from)\s*(-?\d+(?:\.\d+)?)/i);
      var originalMarks=marks?Number(marks[1]):null,originalMax=marks?Number(marks[2]):null;
      if(correct===null&&originalMarks!==null&&originalMax!==null)correct=originalMarks>=originalMax;
      var qtext=qt?qt.innerHTML:'';
      var information='';if(sharedHtml&&sharedRemaining>0){information=sharedPlain;qtext='<div><strong>Shared information:</strong>'+sharedHtml+'</div>'+qtext;sharedRemaining--;if(!sharedRemaining){sharedHtml='';sharedPlain='';}}
      questions.push({qno:Number(no.textContent),is_correct:correct,qtext:qtext,options:options,your_answer:chosen.join('<br>')||null,correct_answer:right?right.textContent.replace(/^\s*The correct answer is:\s*/i,'').trim():'',debrief:'',source_feedback:feedback?F.sanitize(feedback.innerHTML):'',source_result:state,original_marks:originalMarks,original_max_marks:originalMax,information:information,answer_capture_status:chosen.length?'captured':'not_captured',fb_is_custom:false});
    });
    if(!questions.length)throw new Error('No numbered questions were found. Make sure the saved page shows the full attempt review.');
    return questions;
  }
  $('parseAttempt').addEventListener('click',function(){
    invalidate();
    try{
      var meta=fields(),qs=validateQuestions(parseHtml(source),meta);
      var suggestions=window.LedgerTopicSuggest?LedgerTopicSuggest.apply(qs,meta.subject,localStorage):0;
      var graded=qs.filter(function(q){return typeof q.is_correct==='boolean';}),correct=graded.filter(function(q){return q.is_correct;}).length;
      meta.correct=correct;meta.total=graded.length;meta.totalQuestions=qs.length;
      meta.title=ExamModel.label(meta)+(meta.setChapter?' · '+meta.setChapter:'')+($('titleInput').value.trim()?' — '+$('titleInput').value.trim():'');
      staged={meta:meta,questions:qs};
      var captured=qs.filter(function(q){return q.answer_capture_status==='captured';}).length;
      $('entryPreview').innerHTML='<div class="flow-score"><strong>'+(graded.length?Math.round(correct/graded.length*100)+'%':'Unscored')+'</strong><span>'+correct+'/'+graded.length+' fully correct · '+qs.length+' questions</span></div>'+ (qs.length!==graded.length?'<p class="capture-warning">'+(qs.length-graded.length)+' questions are unscored and excluded from accuracy.</p>':'')+'<p><strong class="capture-ok">'+captured+' learner answers captured</strong> · '+suggestions+' provisional topic suggestions. The AI debrief will classify every question against the approved syllabus.</p><div class="question-preview">'+qs.map(function(q){return '<article><strong>Q'+q.qno+' · '+(q.is_correct===true?'Correct':q.is_correct===false?'Incorrect':'Unscored')+'</strong><p>'+F.escape(F.plain(q.qtext).slice(0,220)||'Question text missing')+'</p><p class="'+(q.answer_capture_status==='captured'?'capture-ok':'capture-warning')+'">'+(q.answer_capture_status==='captured'?'Answer captured':'Learner answer not found—review the saved HTML')+(q.chapter?' · Suggested topic: '+F.escape(q.chapter):'')+'</p></article>';}).join('')+'</div>';
      $('saveAttempt').disabled=false;message('Review the result, then save this attempt.');
    }catch(e){message(e.message);}
  });
  $('saveAttempt').addEventListener('click',async function(){
    if(!staged)return;
    var meta=Object.assign({},staged.meta), id='attempt-'+Date.now()+'-'+Math.random().toString(36).slice(2,9), key='tymba_exam_data:'+id;
    meta.id=id;meta.createdAt=new Date().toISOString();meta.file='view.html?id='+encodeURIComponent(id);meta.topics={};
    try{
      var exams=JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]');if(!Array.isArray(exams))throw new Error('Saved attempts could not be read.');
      F.save(localStorage,key,staged.questions);
      try{F.save(localStorage,'tymba_custom_exams',exams.concat([meta]));}catch(e){localStorage.removeItem(key);throw e;}
      this.disabled=true;
      message('Attempt saved on this device. Cloud backup runs automatically in the background.');
      location.href=meta.file;
    }catch(e){message('Could not save: '+e.message);}
  });
  mode();names();
})();
