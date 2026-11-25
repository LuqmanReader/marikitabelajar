(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);}, F=RevisionFlow;
  SubjectCatalog.fill($('subjectSelect'));
  var staged=null,source='',sourceFile=null,fileVersion=0,inputVersion=0,reading=false,pendingReparse=false;
  var localNow=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
  $('attemptDate').value=localNow;
  function message(text){$('entryMessage').textContent=text;}
  function invalidate(){
    inputVersion++;
    staged=null;$('saveAttempt').disabled=true;$('entryPreview').innerHTML='';
    $('htmlReviewGate').hidden=true;
  }
  function changeReader(){
    invalidate();source='';sourceFile=null;fileVersion++;
    $('sourceFile').value='';$('sourceFile').accept='.html,.htm,text/html';
    $('parseAttempt').disabled=true;$('parseAttempt').hidden=true;
    $('uploadLabel').textContent='Upload your marked HTML attempt';
    $('htmlDescription').textContent='Choose one .html or .htm marked review export. Questions and selected answers are read directly from the HTML.';
    message('Choose an HTML review file. Extraction begins automatically.');
  }
  function syllabus(){
    var resolved=window.LedgerSyllabus&&LedgerSyllabus.resolve(localStorage,$('subjectSelect').value);
    return resolved&&Array.isArray(resolved.topics)?resolved:{topics:[],verified:false};
  }
  function fields(){
    var type=$('testType').value, n=Number($('testNumber').value), chapter=ChapterAnalysis.label($('setChapter').value), total=$('setTotal').value.trim()?Number($('setTotal').value):null;
    var subject=$('subjectSelect').value,approved=syllabus().topics;
    if(!subject)throw new Error('Choose the FIA / ACCA paper for this attempt.');
    if(!['set','pre','mock'].includes(type))throw new Error('Choose the assessment type: Chapter Set, Progress Test or Mock Test.');
    if(!Number.isSafeInteger(n)||n<1)throw new Error('Use a whole set or test number of 1 or higher.');
    if(type==='set'&&!chapter)throw new Error('Enter the chapter this set belongs to.');
    if(type==='set'&&approved.length&&!approved.includes(chapter))throw new Error('Choose the Chapter Set target from the approved syllabus topic list.');
    if(type==='set'&&total!==null&&(!Number.isSafeInteger(total)||total<n))throw new Error('The number of available sets must be a whole number at least as high as this set number.');
    var date=new Date($('attemptDate').value);if(!Number.isFinite(date.getTime()))throw new Error('Choose the date and time of the attempt.');
    return {subject:subject,testType:type,testNumber:n,setChapter:type==='set'?chapter:'',setTotal:type==='set'?total:null,attemptedAt:date.toISOString(),sourceType:'html',sourceFormat:'html'};
  }
  function names(){
    var selected=syllabus(),topics=selected.topics.length?selected.topics:ChapterAnalysis.catalog(localStorage,$('subjectSelect').value);
    $('setChapterNames').innerHTML=topics.map(function(n){return '<option value="'+F.escape(n)+'"></option>';}).join('');
    var code=window.LedgerSyllabus&&LedgerSyllabus.code($('subjectSelect').value),format=window.LedgerOfficialExamRegistry&&LedgerOfficialExamRegistry.get($('subjectSelect').value);
    $('formatReference').textContent=!$('subjectSelect').value?'Select a paper to load its official syllabus topics.':(code||$('subjectSelect').value)+' · '+topics.length+' approved syllabus topics'+(format&&format.variant?' · '+format.variant:'')+'.';
  }
  function mode(){var set=$('testType').value==='set';$('setFields').hidden=!set;$('setTotalWrap').hidden=!set;$('numberLabel').textContent=set?'Set number':'Test number';}
  $('testType').addEventListener('change',mode);$('subjectSelect').addEventListener('change',names);
  // Adjusting paper, type or date must not discard extracted questions.
  $('sourceFile').addEventListener('change',async function(){
    invalidate();source='';
    var version=++fileVersion,file=this.files[0];sourceFile=file||null;$('parseAttempt').disabled=true;$('parseAttempt').hidden=true;
    if(!file)return;
    try{
      if(file.size>35*1024*1024)throw new Error('File is over 35 MB; reduce its size before importing.');
      if(!/\.html?$/i.test(file.name))throw new Error('Select a .html or .htm marked-review export. PDF uploads are no longer supported.');
      var bytes=new Uint8Array(await file.arrayBuffer());
      if(version!==fileVersion)return;
      if(/^\s*%PDF-/i.test(new TextDecoder('ascii').decode(bytes.slice(0,64))))throw new Error('This file contains PDF data. Export the marked review as HTML instead.');
      source=new TextDecoder('utf-8').decode(bytes);
      if(!/<(?:!doctype\s+html|html|head|body|main|form|div|section|article)\b/i.test(source))throw new Error('This does not contain a recognizable HTML document. Save the completed review page as HTML.');
      $('parseAttempt').disabled=false;
      message('Reading HTML questions and answers…');
      $('parseAttempt').click();
    }catch(e){
      sourceFile=null;
      message(e&&e.name==='NotReadableError'?'Browser access to the file expired; save a local copy and reselect it.':'Unable to read file: '+e.message);
    }
  });
  function validateQuestions(qs,meta){
    if(!Array.isArray(qs)||!qs.length)throw new Error('No questions found. Use a marked attempt-review export.');
    var seen=new Set();
    return qs.map(function(q){
      var n=Number(q.qno);if(!Number.isSafeInteger(n)||n<1||seen.has(n))throw new Error('Every question needs a unique positive question number.');seen.add(n);
      if(q.is_correct!==true&&q.is_correct!==false&&q.is_correct!==null)throw new Error('Q'+n+' needs an original result (true, false, or null for unscored).');
      if(typeof q.qtext!=='string')throw new Error('Q'+n+' is missing its question text field.');
      // Import is evidence capture only. A PDF/HTML adapter must not assign topic tags.
      // The external AI, prompted in the debrief stage, classifies each question.
      var x=Object.assign({},q,{
        qno:n,qtext:F.sanitize(q.qtext),
        chapter:'',topic_status:'',topic_reason:'',topic_origin:'',
        topic_evidence:'',topic_confidence:'',
        options:(Array.isArray(q.options)?q.options:[]).map(function(o){return {text:F.sanitize(o.text||''),checked:!!o.checked};})
      });
      x.your_answer=q.your_answer==null?null:F.sanitize(q.your_answer);x.correct_answer=String(q.correct_answer||'');x.debrief=F.sanitize(q.debrief||'');
      return x;
    });
  }
  function parseHtml(text){
    var doc=new DOMParser().parseFromString(text,'text/html'), els=Array.from(doc.querySelectorAll('div.que'));
    if(!els.length){
      if(!window.LedgerPeerUniversalHtml)throw new Error('Generic HTML reader was not loaded. Refresh and try again.');
      var generic=LedgerPeerUniversalHtml.parse(text);
      if(!generic.questions.length)throw new Error('This HTML contains no recognizable assessment questions. Use a marked review export for Debrief; the original HTML is still readable as a document.');
      return generic.questions;
    }
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
      // Some Moodle/HTML exports place their actual prompt outside .qtext.
      // Recover from semantic question containers, but never from answer or
      // feedback nodes (which could falsely make an empty question look valid).
      var qtext=qt?qt.innerHTML:'';
      if(!qtext.trim()){
        var fallback=el.querySelector('.formulation .questiontext, .questiontext, [data-region="question-text"], .prompt, .formulation');
        if(fallback){
          var clone=fallback.cloneNode(true);
          clone.querySelectorAll('.answer,.specificfeedback,.rightanswer,.outcome,.grade,input,button,select').forEach(function(n){n.remove();});
          qtext=clone.innerHTML;
        }
      }
      var information='';if(sharedHtml&&sharedRemaining>0){information=sharedPlain;qtext='<div><strong>Shared information:</strong>'+sharedHtml+'</div>'+qtext;sharedRemaining--;if(!sharedRemaining){sharedHtml='';sharedPlain='';}}
      questions.push({qno:Number(no.textContent),is_correct:correct,qtext:qtext,options:options,your_answer:chosen.join('<br>')||null,correct_answer:right?right.textContent.replace(/^\s*The correct answer is:\s*/i,'').trim():'',debrief:'',source_feedback:feedback?F.sanitize(feedback.innerHTML):'',source_result:state,original_marks:originalMarks,original_max_marks:originalMax,information:information,answer_capture_status:chosen.length?'captured':'not_captured',fb_is_custom:false});
    });
    if(!questions.length)throw new Error('No numbered questions were found. Make sure the saved page shows the full attempt review.');
    return questions;
  }
  $('parseAttempt').addEventListener('click',async function(){
    if(reading){pendingReparse=true;return;}
    invalidate();reading=true;$('parseAttempt').disabled=true;$('parseAttempt').hidden=true;
    var versionAtStart=inputVersion;
    try{
      if(!source)throw new Error('Choose a marked HTML review file first.');
      var meta={sourceType:'html',sourceFormat:'html',subject:$('subjectSelect').value||''};
      var qs=parseHtml(source),warnings=[];
      if(versionAtStart!==inputVersion)throw new Error('Inputs changed while the HTML was being read. Retry the extraction.');
      qs=validateQuestions(qs,meta);
      // Preserve source marks. The evidence audit never invents unanswered
      // states or lets the external AI overwrite grading.
      var extractionAudit=window.LedgerPeerPdfAudit?LedgerPeerPdfAudit.audit(qs):null;
      if(!extractionAudit)throw new Error('Extraction validation is unavailable. Refresh and retry; an unvalidated attempt cannot be saved.');
      if(extractionAudit.emptyQuestions&&extractionAudit.emptyQuestions.length){
        throw new Error('Question content missing for Q'+extractionAudit.emptyQuestions.join(', Q')+
          '. Reopen the marked HTML review and check those questions. Nothing was saved or sent for AI debrief.');
      }
      meta.extractionAudit=extractionAudit;
      warnings.push(...extractionAudit.warnings);
      var graded=qs.filter(function(q){return typeof q.is_correct==='boolean';});
      var correct=graded.filter(function(q){return q.is_correct;}).length;
      if(!graded.length)warnings.push('This attempt has unverified scores. It will be saved as unscored, with its source evidence available for checking.');
      meta.correct=correct;meta.total=graded.length;meta.totalQuestions=qs.length;
      var sourceMarks=qs.filter(function(q){
        return Number.isFinite(q.original_marks)&&Number.isFinite(q.original_max_marks)&&q.original_max_marks>0&&q.original_marks>=0&&q.original_marks<=q.original_max_marks;
      });
      meta.markCoverage=sourceMarks.length;
      if(sourceMarks.length===qs.length&&(!extractionAudit||extractionAudit.marksAligned)){
        meta.originalEarnedMarks=Math.round(sourceMarks.reduce(function(sum,q){return sum+q.original_marks;},0)*100)/100;
        meta.originalPossibleMarks=Math.round(sourceMarks.reduce(function(sum,q){return sum+q.original_max_marks;},0)*100)/100;
      }
      meta.readerEngine='html-structured';
      meta.extractionWarnings=warnings;
      staged={meta:meta,questions:qs,warnings:warnings};
      var captured=qs.filter(function(q){return q.answer_capture_status==='captured';}).length;
      var states=extractionAudit&&extractionAudit.answerStates||{answered:captured,unanswered:0,partially_answered:0,unresolved:qs.length-captured};
      var captureDescription='<p><strong>'+states.answered+' answered · '+states.unanswered+' confirmed unanswered · '+states.partially_answered+' partially answered · '+states.unresolved+' unresolved</strong>. Blank fields are not automatically classified as extraction failures.</p>';
      var structureDescription=extractionAudit&&extractionAudit.missing.length?
        '<p class="capture-warning">Missing question number(s): '+extractionAudit.missing.join(', ')+'. This export is not structurally verified.</p>':'';
      $('entryPreview').innerHTML='<div class="flow-score"><strong>'+(graded.length?Math.round(correct/graded.length*100)+'%':'Unscored')+'</strong><span>Full-correct rate · '+correct+'/'+graded.length+' questions · '+qs.length+' total</span></div>'+
        (meta.originalPossibleMarks?'<p><strong>Original graded marks: '+meta.originalEarnedMarks+' / '+meta.originalPossibleMarks+'</strong> (source marking, including partial credit).</p>':'<p>Original marks verified for '+sourceMarks.length+'/'+qs.length+' questions; a weighted original score cannot be confirmed.</p>')+
        (qs.length!==graded.length?'<p class="capture-warning">'+(qs.length-graded.length)+' questions are unscored and excluded from accuracy.</p>':'')+
        captureDescription+structureDescription+'<p>Topics remain unclassified until you import the external AI JSON.</p>'+
        '<div class="question-preview">'+qs.map(function(q){return '<article><strong>Q'+q.qno+' · '+(q.is_correct===true?'Correct':q.is_correct===false?'Incorrect':'Unscored')+'</strong>'+
          '<p>'+F.escape(F.plain(q.qtext).slice(0,220)||'Question text missing')+'</p><p class="'+(q.answer_capture_status==='captured'?'capture-ok':'capture-warning')+'">'+
          (q.answer_state==='unanswered'?'Confirmed unanswered':q.answer_state==='partially_answered'?'Partially answered':q.answer_state==='answered'?'Learner answer captured':'Answer state unresolved; inspect source evidence')+'</p></article>';}).join('')+'</div>';
      if(warnings.length){
        $('htmlReviewGate').hidden=false;
        $('htmlWarningSummary').innerHTML='<p>'+warnings.length+' HTML extraction warning(s). '+(qs.length-graded.length)+' unscored question(s). '+states.unanswered+' confirmed unanswered; '+states.unresolved+' unresolved answer state(s).</p>'+
          '<ul>'+warnings.slice(0,12).map(function(w){return '<li>'+F.escape(w)+'</li>';}).join('')+'</ul>'+
          (warnings.length>12?'<p>And '+(warnings.length-12)+' more; consult every question before relying on the result.</p>':'');
      }
      $('saveAttempt').disabled=false;
      message('Extraction finished. Confirm the paper and assessment type, then save to open the manual JSON debrief.');
    }catch(e){
      staged=null;$('saveAttempt').disabled=true;
      var reason=e&&e.name==='NotReadableError'?'This browser no longer has permission to read the selected HTML. Save a local copy and reselect it.':String(e&&e.message||e);
      message('Extraction stopped: '+reason);
      if(sourceFile)$('parseAttempt').hidden=false;
    }finally{
      reading=false;$('parseAttempt').disabled=!sourceFile;
      if(pendingReparse&&sourceFile){
        pendingReparse=false;
        $('parseAttempt').click();
      }
    }
  });
  $('saveAttempt').addEventListener('click',async function(){
    if(!staged)return;
    var meta,id='attempt-'+Date.now()+'-'+Math.random().toString(36).slice(2,9), key='tymba_exam_data:'+id;
    try{
      meta=Object.assign({},staged.meta,fields());
      meta.title=$('titleInput').value.trim()||ExamModel.label(meta)+(meta.setChapter?' · '+meta.setChapter:'');
      meta.id=id;meta.createdAt=new Date().toISOString();meta.file='view.html?id='+encodeURIComponent(id);meta.autoDebriefRequested=false;meta.topics={};
      var questions=staged.questions.map(function(q){return Object.assign({},q);});
      var exams=JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]');if(!Array.isArray(exams))throw new Error('Saved attempts could not be read.');
      F.save(localStorage,key,questions);
      try{F.save(localStorage,'tymba_custom_exams',exams.concat([meta]));}catch(e){localStorage.removeItem(key);throw e;}
      this.disabled=true;
      message('Attempt saved. Opening the manual JSON debrief page…');
      location.href=meta.file;
    }catch(e){message('Could not save: '+e.message);}
  });
  mode();names();changeReader();
})();
