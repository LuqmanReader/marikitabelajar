#!/usr/bin/env node
/* One million answer-marking simulation against the ACTUAL production quiz engine,
 * with 400 freshly generated foundation practice mocks and deterministic seeded inputs.
 * This is 1,000,000 scored responses, NOT one million independently written questions
 * and NOT a content certification for ACCA/Kaplan.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=require('../quiz-engine.js'),bank=require('../quiz-exam-bank.js');
globalThis.LedgerQuizEngine=engine;globalThis.LedgerExamScenarios=bank;
vm.runInThisContext(read('quiz-quality-engine.js'),{filename:'quiz-quality-engine.js'});
const scope=vm.createContext({window:{}});
for(const p of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js'])
 vm.runInContext(read(p),scope,{filename:p,timeout:10000});
const syllabus=scope.window.LedgerNotesSyllabi.papers,lessons=scope.window.LedgerFiaNotes;
let seed=76124395;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const papers=['FA1','MA1','FA2','MA2'];
let generated=0,marked=0,expectedPass=0,actualPass=0,failed=0;
const mocks=[],ids=new Set(),families=new Map(),examplesByPaper={};
for(let i=0;i<400;i++){
 const paper=papers[i%papers.length];
 const result=engine.generate({paper,mode:'mock',count:50,lessons,syllabus,rng});
 assert(result.complete,'Could not assemble a 50-question foundation practice mock for '+paper);
 assert.equal(result.questions.length,50);
 const localPrompts=new Set(),localIds=new Set();
 for(const q of result.questions){
  assert(!localIds.has(q.id));localIds.add(q.id);
  assert(!localPrompts.has(q.prompt));localPrompts.add(q.prompt);
  assert(!/Complete the accounting principle|Which explanation best fits|Which accounting guidance is most relevant|A learner is reviewing/i.test(q.prompt));
  assert(!q.prompt.includes('RM'));
  const key=q.key+'|'+q.group;families.set(key,(families.get(key)||0)+1);
  ids.add(q.id);
  if(q.type==='numeric')assert(Number.isFinite(q.correctValue));
  else assert.equal(q.choices.length,4);
 }
 examplesByPaper[paper]=(examplesByPaper[paper]||0)+1;
 mocks.push(result.questions);
 generated+=result.questions.length;
}
for(let cycle=0;cycle<20000;cycle++){
 const questions=mocks[cycle%mocks.length];
 const responses={};
 let expect=0;
 for(let i=0;i<questions.length;i++){
  const q=questions[i],yes=(cycle+i)%5<3;
  if(yes){
   // Verify markability of the exact displayed correct answer, including formatting.
   responses[q.id]=q.type==='numeric'?
     (q.correctValue<0?'-$'+Math.abs(q.correctValue).toFixed(2):'$'+q.correctValue.toFixed(2)):q.correctValue;
   expect++;
  }else{
   responses[q.id]=q.type==='numeric'?String(q.correctValue+1000):
    q.choices.find(c=>c.value!==q.correctValue).value;
  }
 }
 const result=engine.score(questions,responses);
 if(result.marked!==50||result.correct!==expect||result.percent!==Math.round(expect/50*100)||
    result.items.some((x,j)=>x.correct!==((cycle+j)%5<3))){
   failed++;if(failed<=3)console.error('FAILED',cycle,result.correct,result.marked,expect);
 }
 expectedPass+=expect;actualPass+=result.correct;marked+=result.marked;
}
assert.equal(generated,20000);
assert.equal(marked,1000000,'Must actually grade one million submitted answers');
assert.equal(actualPass,expectedPass,'Wrong scoring outcomes');
assert.equal(failed,0,'Inconsistent answer keys');
const data={uniqueMockSessions:400,questionsGenerated:generated,uniqueQuestionIds:ids.size,
 scoredAnswers:marked,expectedCorrect:expectedPass,actuallyCorrect:actualPass,
 scoringMismatches:failed,papersExamined:papers,practiceMocksPerPaper:examplesByPaper};
console.log(JSON.stringify(data,null,2));
console.log('PASS: 1,000,000 real answer grading simulations, varied correct/incorrect response patterns, exact mock lengths, answer formatting, no filler stems and no scoring mismatches');
