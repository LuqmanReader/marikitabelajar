(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);}, F=RevisionFlow;
  SubjectCatalog.fill($('subjectSelect'));
  var staged=null,source='',sourceFile=null,sourceKind='',originalPdf=null,pdfBytes=null,convertedHtml=null,fileVersion=0,inputVersion=0,reading=false,pendingReparse=false,inputHealth=null;
  var localNow=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
  $('attemptDate').value=localNow;
  function message(text){$('entryMessage').textContent=text;}
  function readerMode(){return sourceKind;}
  function invalidate(){
    inputVersion++;
    staged=null;convertedHtml=null;$('saveAttempt').disabled=true;$('entryPreview').innerHTML='';
    $('pdfReviewGate').hidden=true; // The old acknowledgement checkbox was retired from the import page.
    $('conversionResult').hidden=true;
    if($('pdfDiagnostics'))$('pdfDiagnostics').hidden=true;
    // Converted HTML is attached internally as a Blob.
  }
  function ensurePdfJs(){
    if(window.pdfjsLib&&window.pdfjsLib.getDocument)return Promise.resolve();
    if(window.__ledgerpeerPdfJsLoading)return window.__ledgerpeerPdfJsLoading;
    var urls=['https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'];
    window.__ledgerpeerPdfJsLoading=new Promise(function(resolve,reject){
      function attempt(n){
        if(n>=urls.length){reject(new Error('PDF.js could not load from either library mirror. Check your connection and retry extraction.'));return;}
        var script=document.createElement('script');script.src=urls[n];
        script.onload=function(){window.pdfjsLib&&window.pdfjsLib.getDocument?resolve():attempt(n+1);};
        script.onerror=function(){attempt(n+1);};
        document.head.appendChild(script);
      }
      attempt(0);
    }).catch(function(err){window.__ledgerpeerPdfJsLoading=null;throw err;});
    return window.__ledgerpeerPdfJsLoading;
  }
  function changeReader(){
    invalidate();source='';sourceKind='';sourceFile=null;originalPdf=null;pdfBytes=null;inputHealth=null;fileVersion++;
    $('sourceFile').value='';$('sourceFile').accept='.pdf,.html,.htm,application/pdf,text/html';
    $('parseAttempt').disabled=true;$('parseAttempt').hidden=true;
    $('uploadLabel').textContent='Upload a marked attempt · PDF or HTML';
    $('htmlDescription').textContent='Universal detection, OCR for image-based PDFs, and internal PDF-to-HTML reconstruction.';
    message('Choose one PDF or HTML. Extraction begins automatically.');
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
    return {subject:subject,testType:type,testNumber:n,setChapter:type==='set'?chapter:'',setTotal:type==='set'?total:null,attemptedAt:date.toISOString(),sourceType:readerMode()==='html'?'html':'pdf-html',sourceFormat:readerMode()==='html'?'html':'pdf'};
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
    invalidate();source='';sourceKind='';originalPdf=null;pdfBytes=null;inputHealth=null;
    var version=++fileVersion,file=this.files[0];sourceFile=file||null;$('parseAttempt').disabled=true;$('parseAttempt').hidden=true;
    if(!file)return;
    try{
      if(file.size>35*1024*1024)throw new Error('File is over 35 MB; reduce its size before importing.');
      var bytes=new Uint8Array(await file.arrayBuffer());
      if(version!==fileVersion)return;
      if(!window.LedgerPeerPdfHealth)throw new Error('File validation library did not load. Refresh and retry.');
      inputHealth=LedgerPeerPdfHealth.inspect(bytes,file.name,file.type);
      if(inputHealth.kind==='pdf'){
        sourceKind='pdf';pdfBytes=bytes;
        originalPdf=new File([bytes],file.name,{type:'application/pdf'});
      }else if(inputHealth.kind==='html'||(/\.html?$/i.test(file.name)||file.type==='text/html')&&!inputHealth.expectedPdf){
        sourceKind='html';source=new TextDecoder('utf-8').decode(bytes);
        if(!/<(?:!doctype\s+html|html|body|div|section)\b/i.test(source))throw new Error('This HTML does not contain a readable document.');
      }else if(inputHealth.expectedPdf){
        throw new Error('This file is named as a PDF but has no PDF header. Download the complete original PDF, or export HTML instead.');
      }else throw new Error('Unsupported file content. Select a genuine PDF or HTML marked-review export.');
      $('parseAttempt').disabled=false;
      message('Reading '+(sourceKind==='pdf'?'PDF pages and recognising questions…':'HTML questions and answers…'));
      $('parseAttempt').click();
    }catch(e){
      sourceFile=null;pdfBytes=null;originalPdf=null;sourceKind='';
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
      var x=Object.assign({},q,{qno:n,qtext:F.sanitize(q.qtext),chapter:ChapterAnalysis.label(q.chapter||''),options:(Array.isArray(q.options)?q.options:[]).map(function(o){return {text:F.sanitize(o.text||''),checked:!!o.checked};})});
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
      var qtext=qt?qt.innerHTML:'';
      var information='';if(sharedHtml&&sharedRemaining>0){information=sharedPlain;qtext='<div><strong>Shared information:</strong>'+sharedHtml+'</div>'+qtext;sharedRemaining--;if(!sharedRemaining){sharedHtml='';sharedPlain='';}}
      questions.push({qno:Number(no.textContent),is_correct:correct,qtext:qtext,options:options,your_answer:chosen.join('<br>')||null,correct_answer:right?right.textContent.replace(/^\s*The correct answer is:\s*/i,'').trim():'',debrief:'',source_feedback:feedback?F.sanitize(feedback.innerHTML):'',source_result:state,original_marks:originalMarks,original_max_marks:originalMax,information:information,answer_capture_status:chosen.length?'captured':'not_captured',fb_is_custom:false});
    });
    if(!questions.length)throw new Error('No numbered questions were found. Make sure the saved page shows the full attempt review.');
    return questions;
  }
  $('parseAttempt').addEventListener('click',async function(){
    if(reading){pendingReparse=true;return;}
    invalidate();reading=true;$('parseAttempt').disabled=true;$('parseAttempt').hidden=true;
    var versionAtStart=inputVersion,selectedMode=readerMode();
    try{
      var meta={sourceType:readerMode()==='html'?'html':'pdf-html',sourceFormat:readerMode()==='html'?'html':'pdf',subject:$('subjectSelect').value||''};
      var result,qs,warnings=[],pdfRecord=null;
      if(readerMode()==='html'){
        pdfRecord=window.LedgerPeerPdfReader&&LedgerPeerPdfReader.parseConvertedHtml(source);
        qs=pdfRecord?pdfRecord.questions:parseHtml(source);
        if(pdfRecord){meta.sourceType='pdf-html';meta.sourceFormat='pdf';convertedHtml=new Blob([source],{type:'text/html'});warnings=pdfRecord.warnings.concat(['Converted HTML was imported without its original PDF. Keep the source PDF for evidence.']);}
      }else{
        if(!originalPdf)throw new Error('Select the original PDF first.');
        await ensurePdfJs();
        result=await LedgerPeerPdfReader.read(pdfBytes,message);
        result.originalName=originalPdf.name;
        if(result.reconciliation)meta.ocrReconciliation=result.reconciliation;
        if(result.ocrUsed)meta.ocrUsed=true;
        qs=result.questions;warnings=result.warnings.slice();
        // PDF-to-HTML runs internally; no intermediate download or re-upload.
        try{convertedHtml=await LedgerPeerPdfReader.convertToHTML(result,message);$('conversionResult').hidden=false;}
        catch(err){warnings.push('HTML visual copy was unavailable: '+err.message+'. Original PDF remains attached.');}
      }
      if(versionAtStart!==inputVersion||readerMode()!==selectedMode)throw new Error('Inputs changed while extraction was running. Choose Extract answer review again.');
      if(!Array.isArray(qs)||!qs.length)throw new Error('The PDF was opened, but no identifiable exam questions were found. Check that you uploaded a completed, marked attempt review; no scores have been invented.');
      qs=validateQuestions(qs,meta);
      var suggestions=meta.subject&&window.LedgerTopicSuggest?LedgerTopicSuggest.apply(qs,meta.subject,localStorage):0;
      var graded=qs.filter(function(q){return typeof q.is_correct==='boolean';});
      var correct=graded.filter(function(q){return q.is_correct;}).length;
      if(!graded.length)warnings.push('This attempt has unverified scores. It will be saved as unscored, with its source evidence available for checking.');
      meta.correct=correct;meta.total=graded.length;meta.totalQuestions=qs.length;
      var sourceMarks=qs.filter(function(q){
        return Number.isFinite(q.original_marks)&&Number.isFinite(q.original_max_marks)&&q.original_max_marks>0&&q.original_marks>=0&&q.original_marks<=q.original_max_marks;
      });
      meta.markCoverage=sourceMarks.length;
      if(sourceMarks.length===qs.length){
        meta.originalEarnedMarks=Math.round(sourceMarks.reduce(function(sum,q){return sum+q.original_marks;},0)*100)/100;
        meta.originalPossibleMarks=Math.round(sourceMarks.reduce(function(sum,q){return sum+q.original_max_marks;},0)*100)/100;
      }
      meta.readerEngine=result&&result.readerEngine||'html-structured';
      staged={meta:meta,questions:qs,warnings:warnings};
      var captured=qs.filter(function(q){return q.answer_capture_status==='captured';}).length;
      $('entryPreview').innerHTML='<div class="flow-score"><strong>'+(graded.length?Math.round(correct/graded.length*100)+'%':'Unscored')+'</strong><span>Full-correct rate · '+correct+'/'+graded.length+' questions · '+qs.length+' total</span></div>'+
        (meta.originalPossibleMarks?'<p><strong>Original graded marks: '+meta.originalEarnedMarks+' / '+meta.originalPossibleMarks+'</strong> (source marking, including partial credit).</p>':'<p>Original marks verified for '+sourceMarks.length+'/'+qs.length+' questions; a weighted original score cannot be confirmed.</p>')+
        (qs.length!==graded.length?'<p class="capture-warning">'+(qs.length-graded.length)+' questions are unscored and excluded from accuracy.</p>':'')+
        '<p><strong class="capture-ok">'+captured+' learner answers captured</strong> · '+suggestions+' provisional topic suggestions. The returned JSON can classify questions against the approved syllabus.</p>'+
        '<div class="question-preview">'+qs.map(function(q){return '<article><strong>Q'+q.qno+' · '+(q.is_correct===true?'Correct':q.is_correct===false?'Incorrect':'Unscored')+'</strong>'+
          (q.source_pdf_pages?'<p>Original PDF page(s): '+q.source_pdf_pages.join(', ')+'</p>':'')+
          '<p>'+F.escape(F.plain(q.qtext).slice(0,220)||'Question text missing')+'</p><p class="'+(q.answer_capture_status==='captured'?'capture-ok':'capture-warning')+'">'+
          (q.answer_capture_status==='captured'?'Learner answer captured':'Learner answer not found—verify original review')+
          (q.chapter?' · Suggested topic: '+F.escape(q.chapter):'')+'</p></article>';}).join('')+'</div>';
      if(meta.sourceType!=='html'){
        $('pdfReviewGate').hidden=false;
        $('pdfWarningSummary').innerHTML='<p>'+warnings.length+' extraction warning(s). '+(qs.length-graded.length)+' unscored question(s). '+(qs.length-captured)+' without explicitly captured learner answers.</p>'+
          '<ul>'+warnings.slice(0,12).map(function(w){return '<li>'+F.escape(w)+'</li>';}).join('')+'</ul>'+
          (warnings.length>12?'<p>And '+(warnings.length-12)+' more; consult every question before relying on the result.</p>':'');
        $('saveAttempt').disabled=false;
      }else $('saveAttempt').disabled=false;
      message('Extraction finished. Confirm the paper and assessment type, then save to open the manual JSON debrief.');
    }catch(e){
      staged=null;$('saveAttempt').disabled=true;
      var reason=e&&e.name==='NotReadableError'?'This browser no longer has permission to read the selected PDF. Save a local copy and reselect it.':String(e&&e.message||e);
      message('Extraction stopped: '+reason);
      if(sourceFile){
        $('parseAttempt').hidden=false;
        if(sourceKind==='pdf'&&inputHealth&&$('pdfDiagnostics')){
          $('pdfDiagnostics').hidden=false;
          $('pdfDiagnosticsText').textContent='Selected file: '+sourceFile.name+' ('+Math.ceil(inputHealth.size/1024)+' KB). PDF header: '+(inputHealth.headerOffset>=0?'found':'missing')+'; end-of-file marker: '+(inputHealth.hasEof?'found':'not detected')+'; cross-reference index: '+(inputHealth.hasStartXref?'found':'not detected')+'. The markers are diagnostic only and do not prove that every page is valid.';
        }
      }
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
      if(window.LedgerTopicSuggest)LedgerTopicSuggest.apply(questions,meta.subject,localStorage);
      var exams=JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]');if(!Array.isArray(exams))throw new Error('Saved attempts could not be read.');
      if(meta.sourceType==='pdf'||meta.sourceType==='pdf-html'){
        if(originalPdf){
          if(!window.LedgerPeerPdfProof)throw new Error('PDF evidence storage was not loaded.');
          await LedgerPeerPdfProof.put(id,originalPdf);
        }
        if(convertedHtml)await LedgerPeerPdfProof.putHtml(id,convertedHtml);
      }
      F.save(localStorage,key,questions);
      try{F.save(localStorage,'tymba_custom_exams',exams.concat([meta]));}catch(e){localStorage.removeItem(key);throw e;}
      this.disabled=true;
      message('Attempt saved. Opening the manual JSON debrief page…');
      location.href=meta.file;
    }catch(e){message('Could not save: '+e.message);}
  });
  mode();names();changeReader();
})();
