#!/usr/bin/env node
'use strict';
/* Provisional PDF topic-suggestion tests: no official ACCA marking or topic-certification claims. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(dir,file),'utf8');
const scope=vm.createContext({window:{},console});
for(const file of ['acca-published-data.js','syllabus-catalog.js','pdf-topic-suggestions.js'])
 vm.runInContext(read(file),scope,{filename:file,timeout:10000});
const api=scope.window.LedgerTopicSuggest,syllabus=scope.window.LedgerSyllabus;
const storage={getItem:()=>null,setItem:()=>{}};
const published=syllabus.resolve(storage,'FA2');
assert.equal(published.verified,true);
assert.equal(published.status,'ACCA-published');
assert(published.version.includes('2026')||published.version.includes('2027'));
const cases=[
 ['A machine is depreciated using straight-line depreciation. Calculate the annual depreciation charge.','D4'],
 ['A non-current asset disposal generates a gain. Calculate the proceeds on disposal.','D4'],
 ['Calculate the allowance for receivables after an irrecoverable debt write-off.','D6'],
 ['A credit sale has sales tax of 10%. Calculate the sales tax.','D1'],
 ['Calculate the closing inventory using the FIFO method.','D3'],
 ['Prepare a bank reconciliation from unpresented cheques and deposits in transit.','E1'],
 ['The supplier statement balance differs from the supplier ledger. Prepare a supplier statement reconciliation.','E2'],
 ['Determine the accrued income and deferred income at the year end.','D5'],
 ['The trial balance debit total exceeds the credits.','F1'],
 ['A suspense account was opened because of an error of principle. Correct it.','F2'],
 ['A partnership agreement provides for partners salaries.','H1'],
 ["Calculate the balances of partners' current accounts.",'H2'],
 ['Calculate goodwill on admission of a partner.','H3']
];
for(const [stem,code] of cases){
 const actual=api.pick({qtext:'<p>'+stem+'</p>'},'FA2',storage);
 assert(actual,'Expected confident classification: '+stem);
 assert.equal(actual.chapter.slice(0,2),code,'Wrong official heading: '+stem);
 assert(published.topics.includes(actual.chapter),'Suggested a label not on the selected published paper');
 assert.equal(actual.topic_origin,'rule-suggestion');
 assert.match(actual.topic_reason,/Provisional/);
}
for(const stem of [
 'Compute the closing cash position of the business.',
 'Compute net receivables and depreciation for a compound scenario.',
 'Sales returns, cash book, and trial balance are all discussed.',
 'What colour is the bar chart in the screenshot?'
]){
 assert.equal(api.pick({qtext:stem},'FA2',storage),null,'Ambiguous/weak evidence should abstain: '+stem);
}
assert.equal(api.pick({qtext:'Straight-line depreciation of equipment.'},'MA1',storage),null,'FA2 rules leaked into another paper');
assert.equal(api.pick({qtext:'The bank reconciliation contains unpresented cheques.'},'FA1',storage),null,'FA2 rules leaked into FA1');
const ma2=api.pick({qtext:'Calculate the replacement basis labour turnover rate for employees.'},'MA2',storage);
assert(ma2&&ma2.chapter.startsWith('B2 ·'),'Existing MA2 classification must be preserved');

const questions=[
 {qno:1,qtext:'Calculate the annual straight-line depreciation charge.',chapter:'',is_correct:false,correct_answer:'$800',original_marks:0},
 {qno:2,qtext:'Calculate sales tax on credit sales.',chapter:'D1 · Sales and purchases',topic_origin:'manual',is_correct:true,correct_answer:'$50',original_marks:1},
 {qno:3,qtext:'What is the FIFO cost?',chapter:'',topic_status:'unreadable',is_correct:false},
 {qno:4,qtext:'Compute net receivables and depreciation.',chapter:'',is_correct:true}
];
const gradingBefore=questions.map(q=>[q.qno,q.is_correct,q.correct_answer,q.original_marks]);
assert.equal(api.apply(questions,'FA2',storage),1,'Only the unambiguous, unreviewed row should be auto-suggested');
assert(questions[0].chapter.startsWith('D4 ·'));
assert.equal(questions[1].topic_origin,'manual','Manually classified question was overwritten');
assert.equal(questions[2].chapter,'','Unreadable source was silently classified');
assert.equal(questions[3].chapter,'','Ambiguous question was guessed');
assert.deepEqual(questions.map(q=>[q.qno,q.is_correct,q.correct_answer,q.original_marks]),gradingBefore,'Classification changed source answers/marks');
console.log('PASS: 13 high-signal FA2 categories, ambiguous abstention, published 2026-27 labels, MA2 compatibility and manual/source-grade preservation.');
