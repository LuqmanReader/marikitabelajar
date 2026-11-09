#!/usr/bin/env node
'use strict';
/* Locked editorial regression for two expanded foundation chapters.
 * Outcome labels describe LedgerPeer's authored practice mapping, not ACCA approval.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const engine=require('../quiz-engine.js');
const bank=require('../quiz-exam-bank.js');
globalThis.LedgerQuizEngine=engine;
globalThis.LedgerExamScenarios=bank;
// The source lessons are browser IIFEs. Mirror the browser global for Node CI.
globalThis.window=globalThis;
for(const name of ['quiz-casebank-knowledge.js','quiz-casebank-ledger.js','quiz-diversity-bank.js','quiz-integrated-cases.js','notes-outcome-lessons.js','quiz-outcome-map.js','quiz-quality-engine.js'])
 vm.runInThisContext(read(name),{filename:name});

const fixture={
 'FA2:D4':[
  [78,'repair-capitalisation-profit-error',3000],
  [80,'asset-register-ledger-discrepancy',7000],
  [82,'asset-register-cost-rollforward',96000],
  [84,'accumulated-depreciation-ledger',30000],
  [86,'part-exchange-disposal-gain',4000],
  [88,'business-use-asset-versus-inventory',26000]
 ],
 'MA2:B2':[
  [74,'piece-rate-production-bonus',1350],
  [76,'labour-timesheet-direct-wip',442],
  [78,'payroll-cost-ledger-reconciliation',800],
  [80,'labour-turnover-replacement-rate',10],
  [82,'labour-efficiency-ratio',90.4],
  [84,'labour-capacity-ratio',87.91],
  [86,'labour-production-volume-ratio',84.75],
  [88,'labour-idle-time-ratio',7.1]
 ]
};
for(const [key,rows] of Object.entries(fixture)){
 for(const [index,family,answer] of rows){
  const question=globalThis.LedgerExamScenarios.problem(key,()=>0.5,index);
  assert.equal(question.family,family,key+' reasoning family at '+index);
  assert.equal(question.answer,answer,key+' independently recalculated answer '+family);
  assert(question.prompt.length>=55&&question.explanation.length>=55,'Insufficient teaching detail for '+family);
  const mapped=globalThis.LedgerQuizOutcomeMap[key]['skill-'+family];
  assert(Array.isArray(mapped)&&mapped.length>0,'No documented outcome mapping for '+family);
  for(const outcome of mapped)
   assert(globalThis.LedgerOutcomeLessons[key].outcomes[outcome],'Invalid mapped outcome '+key+'/'+outcome);
 }
}

const syllabus={
 FA2:{topics:['D4 · Non-current assets and depreciation']},
 MA2:{topics:['B2 · Accounting for labour']}
};
const lessons={'FA2:D4':{},'MA2:B2':{}};
for(const [paper,chapter,expectedOutcomes,expectedExtraConcepts] of [['FA2','D4',15,11],['MA2','B2',8,10]]){
 const key=paper+':'+chapter;
 const conceptFamilies=new Set();
 for(let i=1;i<=expectedExtraConcepts;i++){
  const question=globalThis.LedgerExamScenarios.concept(key,()=>0.5,i);
  assert(question&&question.prompt.length>=55&&question.explanation.length>=55,key+' missing substantive concept '+i);
  assert.equal(question.choices.length,4);
  assert.equal(question.choices.filter(option=>option.value===question.correctValue).length,1);
  conceptFamilies.add(question.prompt);
  assert(globalThis.LedgerQuizOutcomeMap[key]['concept-'+i],key+' missing concept-outcome mapping '+i);
 }
 assert.equal(conceptFamilies.size,expectedExtraConcepts,key+' duplicate concept stems');
 for(const difficulty of ['mixed','easy','moderate','hard']){
  let seed=913;
  const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const result=engine.generate({paper,topics:[chapter],count:20,mode:'topic',difficulty,chapterOnly:true,lessons,syllabus,rng});
  assert.equal(result.complete,true,key+' '+difficulty+' partial practice');
  assert.equal(result.questions.length,20);
  assert.equal(result.supplementedQuestions,0,key+' '+difficulty+' used unrelated chapters');
  assert.deepEqual(result.actualMix,{mcq:10,numeric:10},key+' '+difficulty+' MCQ/numerical mix');
  assert.equal(new Set(result.questions.map(q=>q.key+'|'+q.group)).size,20,key+' '+difficulty+' repeats a skill');
  assert(result.questions.every(q=>q.key===key&&q.outcomeCodes.length>0),key+' unmapped or wrong-chapter question');
  const coverage=result.outcomeCoverage.find(row=>row.key===key);
  assert(coverage,key+' missing outcome report');
  assert.equal(coverage.total,expectedOutcomes);
  assert.equal(coverage.tested,expectedOutcomes,key+' '+difficulty+' failed to vary practice across all documented outcomes');
  const correctAnswers=Object.fromEntries(result.questions.map(q=>[q.id,q.correctValue]));
  const scored=engine.score(result.questions,correctAnswers);
  assert.equal(scored.correct,20,key+' scoring regression');
 }
}
console.log('PASS: 14 new quantitative fixtures, 21 original concept stems, 20 distinct questions, 10:10 question format, mapped syllabus outcomes and marking across both chapter banks.');
