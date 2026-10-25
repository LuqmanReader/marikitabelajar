'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const engine=require('../quiz-engine.js');
const base=path.resolve(__dirname,'..');
const ctx=vm.createContext({window:{}});
for(const file of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js']){
  vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),ctx,{filename:file,timeout:15000});
}
const src=ctx.window,syllabus=src.LedgerNotesSyllabi.papers,lessons=src.LedgerFiaNotes;
assert.equal(src.SubjectCatalog.papers.length,25,'All FIA/ACCA papers must be visible');
let seed=98267;
function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
let topics=0;
for(const [paper,config] of Object.entries(syllabus)){
  for(const heading of config.topics){
    const topic=engine.topicCode(heading);
    assert.ok(topic,'Syllabus headings must have parseable codes');
    assert.ok(lessons[paper+':'+topic.code],'Missing authored lesson: '+paper+':'+topic.code);
    const result=engine.generate({paper,topics:[topic.code],count:20,lessons,syllabus,rng});
    assert.equal(result.questions.length,20,'Every topic needs 20 practice questions: '+paper+':'+topic.code);
    assert.equal(new Set(result.questions.map(q=>q.prompt)).size,20,'No duplicated prompts in the set');
    assert.equal(new Set(result.questions.map(q=>q.id)).size,20,'No duplicate answer IDs in a session');
    for(const q of result.questions){
      assert.equal(q.key,paper+':'+topic.code);
      assert.ok(q.prompt&&q.explanation,'Questions must have model answers');
      if(q.type==='mcq'){
        assert.equal(q.choices.length,4);
        assert.equal(new Set(q.choices.map(x=>x.value)).size,4);
        assert.equal(q.choices.filter(x=>x.value===q.correctValue).length,1);
      }
    }
    topics++;
  }
}
assert.equal(topics,700,'Expected 700 indexed 2026–27 syllabus headings');
for(const paper of Object.keys(syllabus)){
  const mock=engine.generate({paper,mode:'mock',count:50,lessons,syllabus,rng});
  assert.equal(mock.available,50,'50-question paper mock must be complete: '+paper);
  assert.equal(new Set(mock.questions.map(q=>q.id)).size,50,'Mock questions must not duplicate IDs');
  assert.ok(mock.topicsCovered>=10,'Mock should distribute questions across a paper: '+paper);
  assert.ok(mock.questions.every(q=>q.key.startsWith(paper+':')),'Mock must not mix ACCA papers');
}
const first=engine.generate({paper:'FA2',topics:['A1'],count:20,lessons,syllabus,rng});
const second=engine.generate({paper:'FA2',topics:['A1'],count:20,recentIds:first.questions.map(q=>q.id),lessons,syllabus,rng});
assert.ok(second.questions.some(q=>!first.questions.map(x=>x.id).includes(q.id)),'Repeat practice must offer previously unseen questions');
for(const [paper,code]of [['FA2','B1'],['FA2','C2'],['FA2','D1'],['MA2','C1'],['MA2','C2'],['MA2','D1']]){
  for(let i=0;i<25;i++){
    const set=engine.generate({paper,topics:[code],count:10,lessons,syllabus,rng});
    assert.equal(set.available,10,'Calculation templates should support 10-question drills');
    assert.equal(new Set(set.questions.map(q=>q.prompt)).size,10);
  }
}
const set=engine.generate({paper:'FA2',topics:['B1'],count:5,lessons,syllabus,rng});
const answers={};
for(const q of set.questions)answers[q.id]=q.type==='mcq'?q.correctValue:true;
const marked=engine.score(set.questions,answers);
assert.equal(marked.correct,5);
assert.equal(marked.marked,5);
assert.equal(marked.percent,100);
assert.equal(engine.generate({paper:'FA2',topics:['Z9'],count:5,lessons,syllabus,rng}).available,0,'Unknown topics must not fabricate practice');
const store=new Map(),storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
engine.saveHistory(storage,{id:'one',at:new Date().toISOString(),items:[]});
assert.equal(engine.readHistory(storage).length,1);
console.log('Quiz Centre regression passed: 25 papers, '+topics+' twenty-question topic pools, 50-question paper mocks, numerical MCQs, randomized selection, scoring and persistence.');
