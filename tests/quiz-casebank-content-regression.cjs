#!/usr/bin/env node
/* Content quality gate for the newly added original case-bank extensions.
   Tests exact explanations, option diversity and accounting answer fixtures;
   cannot by itself certify real-exam equivalence or academic editorial quality. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const bank=require('../quiz-exam-bank.js'),original=bank.concept.bind(bank);
const ctx={LedgerExamScenarios:bank};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['quiz-casebank-knowledge.js','quiz-casebank-ledger.js'])
 vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const knowledge='A1 A2 B1 B2 C1 C2 D1 D2 D3 D4 E1 E2 E3'.split(' ').map(k=>'MA1:'+k);
const ledger='A1 A2 A3 B1 B2 B3 C1 C2 D1 E1 F1 F2 G1 H1 I1 I2 I3 J1 J2'.split(' ').map(k=>'FA1:'+k);
let checked=0;const prompts=new Set();
for(const key of [...knowledge,...ledger]){
 let base=0;while(base<24&&original(key,()=>0.5,base))base++;
 for(let i=0;i<(key.startsWith('MA1:')?2:1);i++){
  const q=bank.concept(key,()=>0.35,base+i);
  assert(q,key+' authored question '+i+' absent');
  assert(q.prompt.length>=80,key+' scenario lacks necessary case detail');
  assert(q.explanation.length>=55,key+' explanation too shallow');
  assert(!/colour of|marketing brochure|annual performance review|owner.s vehicle/i.test(q.prompt+' '+q.choices.map(o=>o.label).join(' ')),key+' absurd distractor');
  assert(!/\bRM\s*\d/i.test(q.prompt+' '+q.explanation),key+' wrong currency');
  assert.equal(q.choices.length,4);
  const unique=new Set(q.choices.map(o=>o.label.toLowerCase()));
  assert.equal(unique.size,4,key+' duplicate distractor');
  assert(q.choices.filter(o=>o.value===q.correctValue).length===1,key+' invalid answer choice');
  assert(!prompts.has(q.prompt),key+' duplicate case stem');prompts.add(q.prompt);
  checked++;
 }
}
assert.equal(checked,45);
const expected={
 'FA2:D6':[[60,380],[62,48950]],
 'FA2:E1':[[60,19950]],
 'FA2:D5':[[60,4450]],
 'FA2:D4':[[60,-5000]],
 'MA2:D1':[[60,8000]],
 'MA2:E3':[[60,35900]],
 'MA2:C2':[[60,7200]]
};
let numerical=0;
for(const [key,variants] of Object.entries(expected))for(const [index,answer]of variants){
 const q=bank.problem(key,()=>0.5,index);
 assert(q&&Number.isFinite(q.answer),key+' invalid numeric answer');
 assert.equal(q.answer,answer,key+': incorrect expected answer');
 assert(q.prompt.length>=95&&q.explanation.length>=95,key+' underdeveloped numerical question');
 assert(!q.prompt.includes('RM'),key+' wrong displayed currency');
 numerical++;
}
console.log('PASS: '+checked+' original applied-knowledge MCQs, '+numerical+' multi-step numeric cases, independent answer checks, distractor diversity and no obviously irrelevant alternatives.');
