/* Extraction quality gate. A blank answer is not proof of an unanswered
 * question. Source status and visual evidence are distinct from OCR confidence.
 */
(function(root){
'use strict';
function number(value){return Number.isFinite(value)?value:null;}
function state(q){
  var explicit=String(q.answer_state||'').toLowerCase().replace(/\s+/g,'_');
  if(['answered','unanswered','partially_answered','unresolved'].includes(explicit))return explicit;
  var status=String(q.source_result||'').toLowerCase().replace(/\s+/g,'_');
  if(status==='not_answered'||status==='unanswered')return 'unanswered';
  if(Array.isArray(q.matrix_answers)&&q.matrix_answers.length){
    var selected=q.matrix_answers.filter(function(r){return r.selected!==null&&r.selected!==undefined;}).length;
    if(selected===q.matrix_answers.length)return 'answered';
    if(selected>0)return 'partially_answered';
    return 'unresolved';
  }
  if(q.answer_capture_status==='captured'&&
    (String(q.your_answer||'').trim()||Array.isArray(q.selected_answers)&&q.selected_answers.length))
    return 'answered';
  // A grade of zero does not prove that the student skipped the question.
  // Likewise a correct grade without a captured selection does not reconstruct
  // the selected option.
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
  var distribution={answered:0,unanswered:0,partially_answered:0,unresolved:0};
  list.forEach(function(q){distribution[q.answer_state]++});
  var structuralComplete=!!list.length&&!duplicates.length&&!gaps.length&&first===1&&!invalidNumbers;
  var warnings=[];
  if(gaps.length)warnings.push('Missing numbered question(s): '+gaps.join(', ')+'. Text may have merged into a neighbour; original PDF evidence must be inspected.');
  if(duplicates.length)warnings.push('Duplicate question number(s): '+duplicates.join(', ')+'.');
  if(first!==1&&list.length)warnings.push('Question numbering does not begin at 1.');
  if(!marksAligned)warnings.push('Original source marks are incomplete or do not reconcile; a full weighted score cannot be certified.');
  if(distribution.unresolved)warnings.push(distribution.unresolved+' answer state(s) remain unresolved. This is NOT the same as '+distribution.unanswered+' explicitly unanswered question(s).');
  return {structuralComplete:structuralComplete,marksAligned:marksAligned,
    allSelectionsVerified:distribution.unresolved===0,
    quality:structuralComplete&&marksAligned&&distribution.unresolved===0?'verified':'needs_review',
    detected:list.length,expected:expected,duplicates:duplicates,missing:gaps,
    answerStates:distribution,marksCaptured:scoreRecords.length,
    originalEarnedMarks:marksAligned?Math.round(earned*100)/100:null,
    originalPossibleMarks:marksAligned?Math.round(possible*100)/100:null,
    warnings:warnings};
}
root.LedgerPeerPdfAudit={state:state,apply:apply,audit:audit};
})(window);