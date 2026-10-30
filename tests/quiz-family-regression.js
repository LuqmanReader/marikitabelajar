// Run: node tests/quiz-family-regression.js
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ctx={Math,Set,Map,Number,console};
ctx.window=ctx;ctx.globalThis=ctx;
ctx.LedgerQuizEngine={topicCode:t=>t};
ctx.LedgerExamScenarios={
 concept:(key,rng,i)=>i>2?null:{
  prompt:'Which posting matches transaction concept '+i+' in '+key+'?',
  choices:[0,1,2,3].map(n=>({value:'C'+n,label:'Posting '+n})),
  correctValue:'C0',explanation:'Debit and credit treatment follows the transaction.',group:'concept-'+i
 },
 problem:(key,rng,i)=>({
  family:'same-logic',prompt:'A trial balance has debit '+(1000+i)+' and credit '+(800+i)+'. Find the difference.',
  answer:200,explanation:'The difference is 200.',unit:'$'
 })
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'quiz-quality-engine.js'),'utf8'),ctx);
const gen=ctx.LedgerQuizEngine.generate;
const opts={paper:'FA2',topics:['A1','A2','A3','A4'],count:20,mode:'topic',
 lessons:{'FA2:A1':{},'FA2:A2':{},'FA2:A3':{},'FA2:A4':{}},
 syllabus:{FA2:{topics:['A1','A2','A3','A4'].map(code=>({code,title:code}))}},
 rng:()=>0.37};
const first=gen(opts);
assert(first.questions.length>0,'Expected generated questions');
const groups=first.questions.map(q=>q.key+'|'+q.group);
assert.equal(new Set(groups).size,groups.length,'No repeated reasoning family within one quiz');
assert.equal(first.familiesCovered,groups.length);
const second=gen({...opts,recentGroups:groups,recentIds:first.questions.map(q=>q.id)});
assert(second.questions.length>0);
assert(second.repeatFamilyExposure>=0);
assert(second.questions.every(q=>q.id&&q.prompt&&q.explanation));
console.log('Quiz family regression passed: '+first.questions.length+' questions; '+first.familiesCovered+' distinct families.');
