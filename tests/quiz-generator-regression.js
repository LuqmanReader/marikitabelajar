'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const engine=require('../quiz-engine.js');
const scenarios=require('../quiz-exam-bank.js');
globalThis.LedgerExamScenarios=scenarios;
const ctx=vm.createContext({window:{}});
for(const file of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js']){
 vm.runInContext(read(file),ctx,{filename:file,timeout:15000});
}
const source=ctx.window,syllabus=source.LedgerNotesSyllabi.papers,lessons=source.LedgerFiaNotes;
assert.equal(source.SubjectCatalog.papers.length,25);
let seed=98267;
function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
let topics=0,objective=0,numeric=0;
for(const [paper,config] of Object.entries(syllabus)){
 for(const heading of config.topics){
  const topic=engine.topicCode(heading),key=paper+':'+topic.code;
  assert.ok(lessons[key],'Missing teaching source: '+key);
  const set=engine.generate({paper,topics:[topic.code],count:20,lessons,syllabus,rng});
  assert.equal(set.available,20,'Expected 20 scored questions: '+key);
  assert.equal(new Set(set.questions.map(q=>q.id)).size,20,'Duplicate question IDs '+key);
  assert.equal(new Set(set.questions.map(q=>q.prompt)).size,20,'Duplicate prompts '+key);
  const mixed=paper==='FA2'||paper==='MA2';
  assert.equal(set.actualMix.mcq,mixed?10:20,'Topic MCQ split incorrect: '+key);
  assert.equal(set.actualMix.numeric,mixed?10:0,'Topic numerical split incorrect: '+key);
  assert.equal(set.questions.filter(q=>q.type==='mcq').length,set.actualMix.mcq);
  assert.equal(set.questions.filter(q=>q.type==='numeric').length,set.actualMix.numeric);

  for(const q of set.questions){
   assert.equal(q.key,key,'Incorrect subject classification');
   assert.ok(q.prompt.length>12&&q.explanation.length>12,'Missing question/explanation');
   assert.ok(['mcq','numeric'].includes(q.type),'Free-text recall must not appear: '+key);
   if(paper==='FA1'||paper==='MA1')assert.equal(q.type,'mcq','FA1/MA1 are MCQ only');
   if(q.type==='mcq'){
    objective++;
    assert.equal(q.choices.length,4,'Four choices required');
    assert.equal(new Set(q.choices.map(o=>o.value)).size,4);
    assert.equal(new Set(q.choices.map(o=>o.label)).size,4);
    assert.equal(q.choices.filter(o=>o.value===q.correctValue).length,1);
   }else{
    numeric++;
    assert.ok(Number.isFinite(q.correctValue),'Numerical question needs computed key');
   }
  }
  topics++;
 }
 const mock=engine.generate({paper,mode:'mock',count:50,lessons,syllabus,rng});
 assert.equal(mock.available,50,'Paper mock needs fifty questions '+paper);
 const mixedMock=paper==='FA2'||paper==='MA2';
 assert.equal(mock.actualMix.mcq,mixedMock?35:50,'Mock MCQ split incorrect: '+paper);
 assert.equal(mock.actualMix.numeric,mixedMock?15:0,'Mock numerical split incorrect: '+paper);

 assert.equal(new Set(mock.questions.map(q=>q.id)).size,50);
 assert.ok(mock.topicsCovered>=10,'Mock should spread across syllabus headings');
 assert.ok(mock.questions.every(q=>q.key.startsWith(paper+':')),'Never mix papers in same exam');
 if(paper==='FA1'||paper==='MA1')assert.ok(mock.questions.every(q=>q.type==='mcq'));
 if(paper==='FA2'||paper==='MA2')assert.ok(mock.questions.some(q=>q.type==='numeric'));
}
assert.equal(topics,700);
for(const paper of ['FA1','MA1','FA2','MA2']){
 const topicsForPaper=syllabus[paper].topics.map(engine.topicCode);
 assert.ok(topicsForPaper.length>=13);
 for(const t of topicsForPaper){
  const q=engine.generate({paper,topics:[t.code],count:20,lessons,syllabus,rng});
  assert.equal(q.questions.length,20);
 }
}

for(const paper of ['FA2','MA2']){
 const topic=engine.topicCode(syllabus[paper].topics[0]).code;
 for(const [count,mcq,numeric] of [[5,3,2],[10,5,5],[20,10,10]]){
  const set=engine.generate({paper,topics:[topic],count,lessons,syllabus,rng});
  assert.equal(set.available,count,'Short drill question count '+paper+':'+count);
  assert.equal(set.actualMix.mcq,mcq,'Short drill MCQ ratio');
  assert.equal(set.actualMix.numeric,numeric,'Short drill numeric ratio');
 }
}
assert.equal(engine.parseNumber('RM2,500.00'),2500);
assert.equal(engine.parseNumber('-1,020.5'),-1020.5);
assert.equal(engine.parseNumber(''),null);
assert.equal(engine.parseNumber('twenty'),null);
assert.equal(engine.isNumericCorrect('RM2,500',2500),true);
assert.equal(engine.isNumericCorrect('2499',2500),false);
assert.equal(engine.isNumericCorrect('abc',2500),false);
for(const qkey of ['FA2:B1','FA2:D4','MA2:D1','MA2:E3']){
 const p=qkey.split(':')[0],code=qkey.split(':')[1];
 const questions=engine.generate({paper:p,topics:[code],count:20,lessons,syllabus,rng}).questions;
 const answers={};
 for(const q of questions)answers[q.id]=q.correctValue;
 const result=engine.score(questions,answers);
 assert.equal(result.marked,20);
 assert.equal(result.correct,20);
 assert.equal(result.selfMarked,0);
 assert.equal(result.automatic,20);
}
const example=engine.generate({paper:'FA2',topics:['B1'],count:20,lessons,syllabus,rng});
const again=engine.generate({paper:'FA2',topics:['B1'],count:20,recentIds:example.questions.map(q=>q.id),lessons,syllabus,rng});
assert.ok(again.questions.some(q=>!example.questions.some(prev=>prev.id===q.id)),'Generate different prompts across sessions');
assert.equal(engine.generate({paper:'FA2',topics:['Z9'],count:20,lessons,syllabus,rng}).available,0);
const store=new Map(),storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
engine.saveHistory(storage,{id:'first',at:new Date().toISOString(),items:[]});
assert.equal(engine.readHistory(storage).length,1);
const html=read('quiz.html'),page=read('quiz-page.js');
assert.ok(html.includes('quiz-exam-bank.js'));
assert.ok(page.includes("input.type='text'"),'Numerical entry must use a compact input');
assert.ok(!page.includes("element('textarea'"),'Essay fields must be removed');
assert.ok(!page.includes('SELF MARKED'),'Do not show legacy self-marking');
console.log('PASS Quiz Centre ratio checks: 700 topics x 20 questions, 25 mocks x 50 questions, FA2/MA2 exact topic 10 MCQ + 10 numerical and mock 35 MCQ + 15 numerical, FA1/MA1 MCQ-only; total MCQ:',objective,'numerical:',numeric);
