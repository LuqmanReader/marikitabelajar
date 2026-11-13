/* Extraction quality gate. A blank answer is not proof of an unanswered
 * question. Source status and visual evidence are distinct from OCR confidence.
 */
(function(root){
'use strict';
function number(value){return Number.isFinite(value)?value:null;}
function questionText(q){
  // Only question content counts, never grading labels, selected-answer
  // feedback or a placeholder for missing image pixels.
  var html=String(q.qtext||q.question_html||q.question||'')
    .replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/\s*(?:script|style)\s*>/gi,' ')
    .replace(/<\/?(?:p|div|li|tr|br|h[1-6])\b[^>]*>/gi,'\n')
    .replace(/<[^>]+>/g,' ').replace(/&(?:nbsp|#160|#xA0);/gi,' ')
    .replace(/&[a-z]+;|&#\d+;|&#x[0-9a-f]+;/gi,' ');
  return html.split(/\n+/).map(function(line){return line.replace(/\s+/g,' ').trim()})
    .filter(function(line){
      return line&&!/^(?:question\s+\d{1,3}\s*[:.\-]?|correct|incorrect|partially\s+correct|not\s+answered|unanswered|marked?\s+out\s+of|mark(?:s|ed)?\s*[:\d].*|grade\s*[:\d].*|your\s+(?:answer|response)\s*:.*|selected\s+answer\s*:.*|the\s+correct\s+answers?\s+(?:is|are)\s*:.*|https?:\/\/\S+)$/i.test(line);
    }).join(' ').replace(/\[(?:image unavailable|figure present|question figure present)[^\]]*\]/gi,' ').replace(/\s+/g,' ').trim();
}
function missingQuestion(q){
  var text=questionText(q);
  return text.length<4||!/[a-z0-9]/i.test(text);
}
function state(q){
  var status=String(q.source_result||'').toLowerCase().replace(/\s+/g,'_');
  if(status==='not_answered'||status==='unanswered')return 'unanswered';
  if(Array.isArray(q.matrix_answers)&&q.matrix_answers.length){
    var selected=q.matrix_answers.filter(function(r){return r.selected!==null&&r.selected!==undefined;}).length;
    if(selected===q.matrix_answers.length)return 'answered';
    if(selected>0)return 'partially_answered';
    return 'unresolved';
  }
  var checked=Array.isArray(q.options)&&q.options.some(function(o){return o.checked===true||o.chosen===true;});
  var captured=q.answer_capture_status==='captured'&&String(q.your_answer||q.my_answer||'').trim();
  if(checked||captured)return 'answered';
  // Never trust a stale answer_state="unresolved" over captured selections.
  // Equally, a correct grade or answer_state="answered" alone is not proof
  // that the underlying choice was captured.
  return 'unresolved';
}
function apply(questions){
  (questions||[]).forEach(function(q){
    q.answer_state=state(q);
    q.answer_state_evidence=q.answer_state==='unanswered'?
      (q.answer_state_evidence||'explicit-source-not-answered'):
      q.answer_state==='answered'?
        (q.answer_capture_method||q.answer_capture||q.answer_capture_status||'source-selection'):
        q.answer_state==='partially_answered'?'partial-visual-selections':'insufficient-evidence';
  });
  return questions;
}
function audit(questions,opts){
  opts=opts||{};
  var list=apply(Array.isArray(questions)?questions:[]),numbers=list.map(function(q){return Number(q.qno)}).filter(Number.isInteger);
  var count=new Map();
  numbers.forEach(function(n){count.set(n,(count.get(n)||0)+1)});
  var duplicates=Array.from(count).filter(function(x){return x[1]>1}).map(function(x){return x[0]});
  var last=Math.max(0,...numbers),first=Math.min(...numbers);
  var expected=Number.isInteger(opts.expectedQuestionCount)&&opts.expectedQuestionCount>0?
    opts.expectedQuestionCount:last;
  var gaps=[];
  for(var i=first===1?1:Math.max(1,first);i<=expected;i++)if(!count.has(i))gaps.push(i);
  var invalidNumbers=numbers.some(function(n){return n<1||n>300});
  var scoreRecords=list.filter(function(q){return number(q.original_marks)!==null&&
      number(q.original_max_marks)!==null&&q.original_max_marks>0&&
      q.original_marks>=0&&q.original_marks<=q.original_max_marks});
  var earned=scoreRecords.reduce(function(n,q){return n+q.original_marks},0),
      possible=scoreRecords.reduce(function(n,q){return n+q.original_max_marks},0);
  var markedTotal=opts.sourceTotal;
  var marksAligned=scoreRecords.length===list.length&&!invalidNumbers&&
    (markedTotal==null||(Math.abs(earned-markedTotal.earned)<.011&&Math.abs(possible-markedTotal.possible)<.011));
  var emptyQuestions=list.filter(missingQuestion).map(function(q){return q.qno;});
  var distribution={answered:0,unanswered:0,partially_answered:0,unresolved:0};
  list.forEach(function(q){distribution[q.answer_state]++});
  var structuralComplete=!!list.length&&!duplicates.length&&!gaps.length&&!emptyQuestions.length&&first===1&&!invalidNumbers;
  var warnings=[];
  if(gaps.length)warnings.push('Missing numbered question(s): '+gaps.join(', ')+'. Text may have merged into a neighbour; original PDF evidence must be inspected.');
  if(duplicates.length)warnings.push('Duplicate question number(s): '+duplicates.join(', ')+'.');
  if(emptyQuestions.length)warnings.push('Unreadable/empty question content for Q'+emptyQuestions.join(', Q')+'. Numbering and grades alone DO NOT prove successful extraction. Reopen the source; do not generate a debrief request yet.');
  if(first!==1&&list.length)warnings.push('Question numbering does not begin at 1.');
  if(!marksAligned)warnings.push('Original source marks are incomplete or do not reconcile; a full weighted score cannot be certified.');
  if(distribution.unresolved)warnings.push(distribution.unresolved+' answer state(s) remain unresolved. This is NOT the same as '+distribution.unanswered+' explicitly unanswered question(s).');
  return {structuralComplete:structuralComplete,marksAligned:marksAligned,
    allSelectionsVerified:distribution.unresolved===0,
    quality:structuralComplete&&marksAligned&&distribution.unresolved===0?'verified':'needs_review',
    detected:list.length,expected:Number.isInteger(opts.expectedQuestionCount)&&opts.expectedQuestionCount>0?expected:null,duplicates:duplicates,missing:gaps,emptyQuestions:emptyQuestions,
    answerStates:distribution,marksCaptured:scoreRecords.length,
    originalEarnedMarks:marksAligned?Math.round(earned*100)/100:null,
    originalPossibleMarks:marksAligned?Math.round(possible*100)/100:null,
    warnings:warnings};
}
root.LedgerPeerPdfAudit={state:state,apply:apply,audit:audit,missingQuestion:missingQuestion};
})(window);