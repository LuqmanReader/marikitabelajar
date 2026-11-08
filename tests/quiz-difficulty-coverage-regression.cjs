#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=require('../quiz-engine.js'),bank=require('../quiz-exam-bank.js');
globalThis.LedgerQuizEngine=engine;globalThis.LedgerExamScenarios=bank;
for(const name of ['quiz-casebank-knowledge.js','quiz-casebank-ledger.js','quiz-diversity-bank.js','quiz-integrated-cases.js'])
 vm.runInThisContext(read(name),{filename:name});
const notes={window:{}};
vm.runInNewContext(read('notes-outcome-lessons.js'),notes,{filename:'notes-outcome-lessons.js'});
globalThis.LedgerOutcomeLessons=notes.window.LedgerOutcomeLessons;
vm.runInThisContext(read('quiz-outcome-map.js'),{filename:'quiz-outcome-map.js'});
vm.runInThisContext(read('quiz-quality-engine.js'),{filename:'quiz-quality-engine.js'});
const source={window:{}};
for(const name of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js'])
 vm.runInNewContext(read(name),source,{filename:name,timeout:12000});
const lessons=source.window.LedgerFiaNotes,syllabus=source.window.LedgerNotesSyllabi.papers;
let seed=20261105;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const rank={easy:0,moderate:1,hard:2};
for(const key of ['FA2:D4','FA2:D5','FA2:D6','MA2:A4','MA2:B2','MA2:C1','MA2:C2','MA2:D1','FA1:B1','MA1:C1']){
 const [paper,code]=key.split(':');
 for(const difficulty of ['easy','moderate','hard','mixed']){
  const quiz=engine.generate({paper,topics:[code],count:20,mode:'topic',chapterOnly:true,difficulty,order:'progressive',lessons,syllabus,rng});
  assert.equal(quiz.difficulty,difficulty);
  assert(quiz.available<=quiz.requested);
  assert.equal(quiz.available,quiz.questions.length);
  assert.equal(quiz.actualMix.mcq+quiz.actualMix.numeric,quiz.available);
  assert.equal(quiz.levelMix.easy+quiz.levelMix.moderate+quiz.levelMix.hard,quiz.available);
  assert(quiz.questions.every(q=>['easy','moderate','hard'].includes(q.difficulty)&&q.skillLabel));
  if(difficulty!=='mixed')assert.equal(quiz.difficultyBackfill,quiz.questions.filter(q=>q.difficulty!==difficulty).length,key+' undisclosed difficulty fallback');
  assert(quiz.questions.every((q,i,a)=>i===0||rank[a[i-1].difficulty]<=rank[q.difficulty]));
  assert(quiz.skillCoverage.tested<=quiz.skillCoverage.available);
  assert.equal(new Set(quiz.questions.map(q=>q.key+'|'+q.group)).size,quiz.questions.length);
  if(globalThis.LedgerOutcomeLessons[key]){
   const row=quiz.outcomeCoverage.find(x=>x.key===key);
   assert(row,key+' outcome report missing');
   assert.equal(row.tested+row.untested.length,row.total);
   assert(row.total>0);
   assert(quiz.questions.every(q=>q.outcomeCodes.every(c=>globalThis.LedgerOutcomeLessons[key].outcomes[c])));
  }
 }
}
for(const paper of ['FA1','MA1','FA2','MA2']){
 const mock=engine.generate({paper,mode:'mock',difficulty:'hard',count:50,order:'random',lessons,syllabus,rng});
 assert.equal(mock.difficulty,'mixed','Mock must not inherit topic-only difficulty filtering');
 assert.equal(mock.available,50,'Mock count '+paper);
}
const html=read('quiz.html'),page=read('quiz-page.js');
for(const id of ['difficulty','order','chapterCoverage','questionNavigator','previousQuestion','nextQuestion','flagQuestion']){
 assert(html.includes('id="'+id+'"'),'Missing control '+id);
}
assert(html.indexOf('quiz-outcome-map.js')<html.indexOf('quiz-quality-engine.js'));
assert(html.includes('notes-outcome-lessons.js'));
assert(page.includes("function renderCoverage()"));
assert(page.includes("function showQuestion(index)"));
console.log('PASS: level filters, progressive sort, question-family uniqueness, honest outcome gaps, 50-question mocks and chapter navigation controls.');
