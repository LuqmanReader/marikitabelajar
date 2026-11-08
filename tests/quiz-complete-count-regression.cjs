#!/usr/bin/env node
/* Verify that requested 5/10/20 practice sessions are full across every authored
 * foundation chapter and difficulty. No duplicated family permitted within a sitting.
 * Original marks/answer scoring and official mock structure are tested separately.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=require('../quiz-engine.js'),bank=require('../quiz-exam-bank.js');
globalThis.LedgerQuizEngine=engine;globalThis.LedgerExamScenarios=bank;
for(const name of ['quiz-casebank-knowledge.js','quiz-casebank-ledger.js','quiz-diversity-bank.js','quiz-integrated-cases.js','quiz-quality-engine.js'])
 vm.runInThisContext(read(name),{filename:name});
const source=vm.createContext({window:{}});
for(const name of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js'])
 vm.runInContext(read(name),source,{filename:name,timeout:12000});
const lessons=source.window.LedgerFiaNotes,syllabus=source.window.LedgerNotesSyllabi.papers;
let seed=7318991;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const failures=[],samples=[],papers=['FA1','MA1','FA2','MA2'];
function check(result,{paper,topic,difficulty,count,mode}){
 const identity=paper+'/'+mode+'/'+topic+'/'+difficulty+'/'+count;
 if(result.available!==count||!result.complete)failures.push({identity,available:result.available,requested:result.requested,reason:result.reason,mix:result.actualMix});
 if(result.questions.length!==result.available)throw Error('Inconsistent question count '+identity);
 const familyKeys=result.questions.map(q=>q.key+'|'+q.group);
 assert.equal(new Set(familyKeys).size,familyKeys.length,'Repeated reasoning families within '+identity);
 assert.equal(new Set(result.questions.map(q=>q.id)).size,result.questions.length,'Duplicate question IDs '+identity);
 assert.equal(result.actualMix.mcq+result.actualMix.numeric,result.available);
 assert(result.questions.every(q=>q.explanation&&q.prompt&&q.key.includes(':')),identity+' malformed question');
 if(result.supplementedQuestions)assert(result.topicsCovered>1,'Supplement must include distinct syllabus topic');
 if(result.difficultyBackfill)assert(result.questions.some(q=>q.difficulty!==difficulty),'Difficulty adjustment missing evidence');
 if(samples.length<15&&result.supplementedQuestions)samples.push({identity,available:result.available,supplemented:result.supplementedQuestions,difficultyBackfill:result.difficultyBackfill,mixAdjusted:result.mixAdjusted,topicsCovered:result.topicsCovered});
}
for(const paper of papers){
 const topics=syllabus[paper].topics.map(x=>engine.topicCode(x)?.code).filter(Boolean);
 for(const topic of topics){
  for(const difficulty of ['mixed','hard','moderate','easy']){
   const r=engine.generate({paper,mode:'topic',topics:[topic],difficulty,count:20,lessons,syllabus,rng});
   check(r,{paper,topic,difficulty,count:20,mode:'topic'});
   const strict=engine.generate({paper,mode:'topic',topics:[topic],difficulty,count:20,chapterOnly:true,lessons,syllabus,rng});
   assert.equal(strict.supplementedQuestions,0,'Chapter-only should not include unrelated topics '+paper+':'+topic);
   assert(strict.questions.every(q=>q.key===paper+':'+topic),'Chapter-only returned external key');
   assert(strict.available<=20);
  }
 }
 for(const count of [5,10,20]){
  for(const difficulty of ['mixed','hard']){
   const r=engine.generate({paper,mode:'topic',topics:null,count,difficulty,lessons,syllabus,rng});
   check(r,{paper,topic:'all',difficulty,count,mode:'topic'});
  }
 }
 if(['FA2','MA2'].includes(paper)){
  for(const count of [5,10,20]){
   const r=engine.generate({paper,mode:'integrated',count,difficulty:'hard',lessons,syllabus,rng});
   check(r,{paper,topic:'all',difficulty:'hard',count,mode:'integrated'});
   assert(r.integratedCases>=1,'Integrated mode lost integrated cases '+paper);
  }
 }
 const mock=engine.generate({paper,mode:'mock',count:50,lessons,syllabus,rng});
 check(mock,{paper,topic:'all',difficulty:'mixed',count:50,mode:'mock'});
 assert.equal(mock.actualMix.numeric,['FA2','MA2'].includes(paper)?15:0);
}
console.log('20-QUESTION BACKFILL AUDIT',JSON.stringify({papers,failures:failures.slice(0,35),failureCount:failures.length,samples},null,2));
assert.equal(failures.length,0,'Student-requested question counts must never silently drop below the selected count across the paper.');
const html=read('quiz.html'),page=read('quiz-page.js'),css=read('quiz.css');
assert(html.includes('id="chapterOnly"'),'User cannot opt in to strict chapter-only mode');
assert(page.includes('CANNOT BUILD '),'Partial quiz can still start silently');
assert(page.includes("active.supplementedQuestions"),'Cross-topic adjustments not disclosed');
assert(page.includes("active.difficultyBackfill"),'Difficulty adjustment not disclosed');
assert(page.includes("setMode(mode)"),'Chapter-only visibility may not respond to topic change');
assert(css.includes('.quiz-chapter-option'),'Chapter-only switch lacks styling');
console.log('PASS: All foundation paper chapters with mixed/easy/moderate/hard selection return exactly 20 original question families; mocks preserve 50 questions and chapter-only opt-in stays strict.');
