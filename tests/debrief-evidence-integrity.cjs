// Regression: a complete sequence of question numbers is not proof of a
// complete exam extraction. Run with: node tests/debrief-evidence-integrity.cjs
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const storage = {getItem(){return null},setItem(){},removeItem(){}};
const context = {console,localStorage:storage};
context.window=context;
context.LedgerSyllabus={
  code(){return 'FA2'},
  resolve(){return {source:'https://www.accaglobal.com/',version:'2026-27',topics:['A1 · Accounting concepts']}}
};
context.LedgerOfficialExamRegistry={
  get(){return {format:{mode:'on-demand',marks:100,sections:[]},variant:'GLO',formatSource:'https://www.accaglobal.com/'}}
};
for (const name of ['pdf-extraction-audit.js','revision-flow.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name});
}
const A=context.LedgerPeerPdfAudit,F=context.RevisionFlow;
const holeNumbers=[2,20,23,42];
const questions=Array.from({length:46},(_,index)=>{
  const qno=index+1;
  return {
    qno,qtext:holeNumbers.includes(qno)?'':'<p>What accounting concept applies to Question '+qno+'?</p>',
    options:[],is_correct:qno%2===1,source_result:qno%2===1?'correct':'incorrect',
    original_marks:qno%2===1?2:0,original_max_marks:2,
    answer_state:'unresolved',answer_capture_status:'not_captured',
    your_answer:null,correct_answer:'A'
  };
});
questions[0].options=[{text:'A',checked:true}];
questions[0].your_answer='A';
questions[0].answer_capture_status='captured';
questions[1].source_result='incorrect';
questions[2].answer_capture_status='captured';
questions[2].your_answer='<p>123.45</p>';
questions[3].source_result='not_answered';
questions[4].matrix_answers=[{selected:true},{selected:null}];
const marksBefore=questions.map(q=>q.original_marks);
const audit=A.audit(questions);
assert.equal(audit.detected,46);
assert.deepEqual(Array.from(audit.missing),[],'no missing question numbers');
assert.deepEqual(Array.from(audit.emptyQuestions),holeNumbers,'empty question contents must be detected');
assert.equal(audit.structuralComplete,false);
assert.equal(audit.quality,'needs_review');
assert.match(audit.warnings.join(' '),/Q2, Q20, Q23, Q42/);
assert.equal(questions[0].answer_state,'answered','explicit captured choice overrides stale unresolved flag');
assert.equal(questions[2].answer_state,'answered','captured numeric answer overrides stale unresolved flag');
assert.equal(questions[3].answer_state,'unanswered','only explicit source not-answered is unanswered');
assert.equal(questions[4].answer_state,'partially_answered','mixed matrix status is partial');
assert.equal(questions[5].answer_state,'unresolved','a graded answer alone proves no selected choice');
assert.deepEqual(questions.map(q=>q.original_marks),marksBefore,'source grading must remain unchanged');
assert.equal(A.missingQuestion({qno:1,qtext:'<img src="data:image/png;base64,AAAA">'}),true);
assert.equal(A.missingQuestion({qno:1,qtext:'[Image unavailable in this export — attach a screenshot.]'}),true);
assert.equal(A.missingQuestion({qno:1,qtext:'<p>Question 9</p><p>Correct</p><p>Mark 2 out of 2</p>'}),true);
assert.equal(A.missingQuestion({qno:1,qtext:'<p>Explain the entry for a bank payment.</p>'}),false);
const meta={id:'pt2',subject:'FA2 · Maintaining Financial Records',title:'Progress Test 2',testType:'pre',testNumber:2,sourceType:'html'};
const catalog=['A1 · Accounting concepts'];
assert.deepEqual(Array.from(F.sourceIntegrity(questions).missingQuestions),holeNumbers);
assert.throws(()=>F.prompt(meta,questions,catalog,questions),/Q2, Q20, Q23, Q42/);
assert.throws(()=>F.review({},questions,meta),/Source extraction incomplete/);
const clean=[questions[0],questions[2]];
const prompt=F.prompt(meta,clean,catalog,clean);
assert.match(prompt,/"emptyQuestionNumbers":\[\]/);
assert.match(prompt,/"answer_state":"answered"/);
assert.doesNotMatch(prompt,/"answer_state":"unresolved"/);
assert.match(prompt,/"expectedQuestionCount":null/);
assert.equal(F.sourceIntegrity(clean).ok,true);
console.log('PASS: 46-question completeness, answer provenance, original marks, stale attempts and safe AI prompt gate.');
