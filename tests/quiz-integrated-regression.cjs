#!/usr/bin/env node
/* Independent numeric fixtures and integration tests for original cross-topic cases.
 * These are LedgerPeer practice tasks, NOT ACCA/Kaplan exam-kit certification.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=require('../quiz-engine.js'),bank=require('../quiz-exam-bank.js');
globalThis.LedgerQuizEngine=engine;globalThis.LedgerExamScenarios=bank;
for(const name of ['quiz-casebank-knowledge.js','quiz-casebank-ledger.js','quiz-diversity-bank.js','quiz-integrated-cases.js'])
 vm.runInThisContext(read(name),{filename:name});
vm.runInThisContext(read('quiz-quality-engine.js'),{filename:'quiz-quality-engine.js'});
const source=vm.createContext({window:{}});
for(const name of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js'])
 vm.runInContext(read(name),source,{filename:name,timeout:12000});
const lessons=source.window.LedgerFiaNotes,syllabus=source.window.LedgerNotesSyllabi.papers;
assert.deepEqual(globalThis.LedgerIntegratedCases.counts,{FA2:12,MA2:12});
const answers={
 FA2:[46550,52700,62000,15200,23400,42200,31000,32000,39000,-3000,35200,50600],
 MA2:[10800,941,0,20.78,22,-4,2435,21000,5000,-8,460,8000]
};
const answerMismatches=[];
for(const [paper,expected] of Object.entries(answers)){
 const uniqueFamilies=new Set();
 const officialKeys=new Set(syllabus[paper].topics.map(s=>paper+':'+engine.topicCode(s).code));
 for(let i=0;i<expected.length;i++){
  const q=globalThis.LedgerIntegratedCases.get(paper,()=>.5,i);
  assert(q,'Integrated case '+paper+'/'+i+' missing');
  assert(Number.isFinite(q.answer),'Nonfinite calculated answer '+paper+'/'+i);
  if(q.answer!==expected[i])answerMismatches.push({paper,index:i,actual:q.answer,fixture:expected[i],prompt:q.prompt.slice(0,240)});
  assert(q.prompt.length>=125,paper+' case '+i+' not a detailed business scenario');
  assert(q.explanation.length>=95,paper+' case '+i+' missing multi-step explanation');
  assert(q.topicKeys.length>=2&&new Set(q.topicKeys).size===q.topicKeys.length,'Scenario not genuinely cross-topic: '+paper+'/'+i);
  assert(q.topicKeys.every(k=>officialKeys.has(k)),paper+' case '+i+' references unknown syllabus heading');
  assert(!uniqueFamilies.has(q.family),'Repeated reasoning family '+paper+'/'+q.family);
  uniqueFamilies.add(q.family);
 }
}
assert.equal(answerMismatches.length,0,'Reconcile independent answer fixtures: '+JSON.stringify(answerMismatches));
let seed=385712;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(const paper of ['FA2','MA2']){
 for(const count of [5,10,20]){
  const result=engine.generate({paper,mode:'integrated',count,difficulty:'mixed',rng,lessons,syllabus});
  assert.equal(result.mode,'integrated');
  assert.equal(result.available,count,'Wrong integrated drill count '+paper+'/'+count);
  assert(result.complete,'Integrated drill incomplete '+paper+'/'+count+' '+result.reason);
  assert(result.integratedCases>=(count===5?2:count===10?4:7),'Too few combined topics '+paper+'/'+count);
  assert(result.topicsCovered>=4,'Integrated drill does not spread over syllabus');
  assert.equal(result.actualMix.mcq+result.actualMix.numeric,count);
  assert.equal(new Set(result.questions.map(q=>q.prompt)).size,result.questions.length,'Duplicate stem');
  assert.equal(new Set(result.questions.map(q=>q.key+'|'+q.group)).size,result.questions.length,'Duplicate reasoning family');
  const allLinked=new Set(result.questions.flatMap(q=>q.topicKeys||[q.key]));
  assert.equal(result.topicsCovered,allLinked.size,'Topic coverage ignores linked secondary chapters');
  assert.equal(Object.values(result.topicDistribution).reduce((a,b)=>a+b,0),result.questions.reduce((a,q)=>a+(q.topicKeys||[q.key]).length,0),'Topic exposure miscount');
  for(const q of result.questions.filter(q=>q.integrated)){
   assert(q.topicKeys.length>=2,'Integrated flag without linked topics');
   assert.equal(q.outcomeCodes.length,0,'Integrated case falsely credited learning outcomes');
   assert(q.key===q.topicKeys[0],'Wrong primary classification');
  }
  const grades=engine.score(result.questions,Object.fromEntries(result.questions.map(q=>[q.id,q.correctValue])));
  assert.equal(grades.correct,count,'Mixed case marking failed');
 }
 const all=engine.generate({paper,mode:'topic',topics:null,count:20,rng,lessons,syllabus});
 assert(all.integratedCases>=4,'All Topics must include cross-topic cases '+paper);
 const chapter=engine.generate({paper,mode:'topic',topics:['D1'],count:10,chapterOnly:true,rng,lessons,syllabus});
 assert.equal(chapter.integratedCases,0,'Single-topic practice must remain strictly within chapter '+paper);
 const mock=engine.generate({paper,mode:'mock',rng,lessons,syllabus});
 assert.equal(mock.available,50);
 assert(mock.integratedCases>=5,'Practice mock has no integrated cases '+paper);
 assert.equal(mock.actualMix.mcq,35);assert.equal(mock.actualMix.numeric,15);
 const initial=engine.generate({paper,mode:'integrated',count:10,rng,lessons,syllabus});
 const prior=initial.questions.map(q=>q.key+'|'+q.group);
 const next=engine.generate({paper,mode:'integrated',count:10,rng,lessons,syllabus,recentGroups:prior,recentIds:initial.questions.map(q=>q.id)});
 assert.equal(next.repeatFamilyExposure,next.questions.filter(q=>prior.includes(q.key+'|'+q.group)).length);
 assert(next.freshFamilies>0,'Integrated case rotation should allow previously unused reasoning');
}
const rejected=engine.generate({paper:'MA1',mode:'integrated',count:10,lessons,syllabus,rng});
assert.equal(rejected.available,0,'Do not fake unsupported MA1 integrated cases');
assert(/FA2 and MA2/.test(rejected.reason));
const html=read('quiz.html'),page=read('quiz-page.js');
assert(html.includes('id="integratedMode"'),'Missing integrated mode UI');
assert(html.indexOf('quiz-integrated-cases.js')<html.indexOf('quiz-quality-engine.js'),'Integrated bank not loaded before generator');
assert(page.includes("setMode('integrated')")&&page.includes("active.integratedCases"),'Integrated mode not connected to students');
assert(page.includes("topicKeys:active.questions[i].topicKeys"),'Linked skills not retained in saved records');
console.log('PASS: 24 original integrated answer fixtures, all linked syllabus headings, FA2/MA2 mixed and mock formats, five/ten/twenty count integrity, honest outcome credit and cross-session family rotation.');
