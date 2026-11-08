#!/usr/bin/env node
/* Independent fixed-answer checks of new accounting reasoning families.
 * Bank content is original; no ACCA/Kaplan certification implied.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const bank=require('../quiz-exam-bank.js'),engine=require('../quiz-engine.js');
globalThis.LedgerExamScenarios=bank;globalThis.LedgerQuizEngine=engine;
for(const file of ['quiz-casebank-knowledge.js','quiz-casebank-ledger.js','quiz-diversity-bank.js'])
 vm.runInThisContext(read(file),{filename:file});
const expected={
 'FA2:D4':[['reducing-balance-year-two',9386.3],['capitalised-cost-versus-training',38000],['part-year-depreciation',3250],['disposal-proceeds-from-gain',27000]],
 'FA2:D5':[['outstanding-expense-accrual',2800],['prepaid-expense-current-year-charge',2400],['accrued-income-recognition',4700]],
 'FA2:D6':[['receivables-return-and-cash',15200],['allowance-increase-or-reversal',-750],['net-receivables-after-writeoff',22800],['dishonoured-receipt-restatement',12500]],
 'FA2:E1':[['cash-book-three-unrecorded-items',19200],['deposit-in-transit-reconciliation',2500]],
 'FA2:G1':[['gross-margin-from-revenue',15000],['cost-of-sales-returns-and-carriage',37800]],
 'MA2:B1':[['fifo-two-batches-issue-value',6100],['weighted-average-inventory-unit-cost',8.5]],
 'MA2:B2':[['labour-turnover-leavers-rate',16.67],['overtime-premium-gross-pay',558]],
 'MA2:B3':[['overhead-under-absorption',0]],
 'MA2:C2':[['absorption-profit-lower-inventory-reduction',-7200],['multiple-variable-cost-contribution',24000]],
 'MA2:C4':[['process-abnormal-gain-or-loss',32]],
 'MA2:D1':[['break-even-after-price-and-fixed-change',2231],['margin-of-safety-percentage',61.9],['target-revenue-using-cs-ratio',145000]],
 'MA2:D2':[['limiting-factor-contribution-per-hour',7],['relevant-cost-with-opportunity',1900]],
 'MA2:D3':[['two-period-npv-with-factors',5700]],
 'MA2:E3':[['cash-receipts-collection-delay',40000],['cash-budget-with-capital-outlay',14000]]
};
const families=new Set();
let verified=0;
for(const [key,items] of Object.entries(expected)){
 for(let i=0;i<items.length;i++){
  const [family,answer]=items[i];
  for(let parity=0;parity<2;parity++){
   const q=bank.problem(key,()=>0.5,70+i*2+parity);
   assert(q,key+' '+family+' question missing');
   assert.equal(q.family,family,key+' wrong reasoning family');
   assert.equal(q.answer,answer,key+' '+family+' arithmetic mismatch at fixed parameters');
   assert.equal(q.unit==null,false,key+' unit missing');
   assert(q.prompt.length>=80&&q.explanation.length>=70,key+' '+family+' lacks a sufficient scenario or working');
   assert(!/\bRM\b/.test(q.prompt+' '+q.explanation),key+' wrong currency');
   assert(!/Complete the accounting principle|A learner is reviewing|Which paragraph/i.test(q.prompt),key+' artificial filler');
  }
  assert(!families.has(key+'|'+family),'Duplicate reasoning families for '+key);
  families.add(key+'|'+family);verified++;
 }
 assert.equal(bank.problem(key,()=>0.5,70+items.length*2),null,key+' leaked repeated bonus family');
}
assert.equal(verified,31,'Missing fixed-answer scenario checks');
assert.equal(globalThis.LedgerQuizDiversityBank.topics.length,14);
assert.equal(Object.values(globalThis.LedgerQuizDiversityBank.families).reduce((a,b)=>a+b,0),31);

const source={window:{}};
for(const file of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js'])
 vm.runInNewContext(read(file),source,{filename:file,timeout:12000});
vm.runInThisContext(read('quiz-quality-engine.js'),{filename:'quiz-quality-engine.js'});
const syllabus=source.window.LedgerNotesSyllabi.papers,lessons=source.window.LedgerFiaNotes;
let seed=851924;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const topic=engine.generate({paper:'MA2',topics:['D1'],count:5,mode:'topic',difficulty:'mixed',rng,lessons,syllabus});
assert(topic.questions.length>=4,'No useful first MA2 D1 practice questions');
const from=new Set(topic.questions.map(q=>q.key+'|'+q.group));
assert.equal(from.size,topic.questions.length,'Same family was repeated within one sitting');
assert(topic.questions.some(q=>/break-even-after-price|margin-of-safety-percentage|target-revenue-using-cs-ratio/.test(q.group)),'New families not selected in MA2 D1');
const next=engine.generate({paper:'MA2',topics:['D1'],count:5,mode:'topic',difficulty:'mixed',rng,lessons,syllabus,
 recentGroups:[...from],recentIds:topic.questions.map(q=>q.id)});
assert.equal(next.questions.length,topic.questions.length,'Rotation unexpectedly changed available set length');
const availableFresh=next.questions.filter(q=>!from.has(q.key+'|'+q.group));
assert(availableFresh.length>=2,'New questions should favor unused reasoning families');
assert.equal(next.repeatFamilyExposure,next.questions.length-availableFresh.length);
assert.equal(next.freshFamilies,availableFresh.length);
for(const q of next.questions)assert(['easy','moderate','hard'].includes(q.difficulty));
const all=engine.generate({paper:'FA2',mode:'mock',rng,lessons,syllabus});
assert.equal(all.questions.length,50,'Mock lost the required 50 practice questions');
assert.equal(all.actualMix.mcq,35);assert.equal(all.actualMix.numeric,15);
console.log('PASS: '+verified+' independently checked original reasoning scenarios in 14 chapters; balanced mock; fresh-skill rotation and repetition reporting.');
