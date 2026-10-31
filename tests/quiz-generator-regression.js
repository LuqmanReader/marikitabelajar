'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=x=>fs.readFileSync(path.join(root,x),'utf8');
const engine=require('../quiz-engine.js'),bank=require('../quiz-exam-bank.js');
globalThis.LedgerQuizEngine=engine;globalThis.LedgerExamScenarios=bank;
vm.runInThisContext(read('quiz-casebank-knowledge.js'),{filename:'quiz-casebank-knowledge.js'});
vm.runInThisContext(read('quiz-casebank-ledger.js'),{filename:'quiz-casebank-ledger.js'});
vm.runInThisContext(read('quiz-quality-engine.js'),{filename:'quiz-quality-engine.js'});
const c=vm.createContext({window:{}});
for(const name of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js'])
 vm.runInContext(read(name),c,{filename:name,timeout:12000});
const source=c.window,syllabus=source.LedgerNotesSyllabi.papers,lessons=source.LedgerFiaNotes;
assert.equal(source.SubjectCatalog.papers.length,25);
const eligible=new Set(['FA1','MA1','FA2','MA2']);
let seed=98267;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
let checked=0,limited=0,mocks=0,originalQuestions=0,numeric=0;
for(const [paper,config] of Object.entries(syllabus)){
 for(const heading of config.topics){
  const code=engine.topicCode(heading).code,key=paper+':'+code;
  assert.ok(lessons[key],'Missing study source '+key);
  const set=engine.generate({paper,topics:[code],count:20,lessons,syllabus,rng});
  assert(set.available<=20);
  assert.equal(set.available,set.questions.length);
  assert.equal(set.actualMix.mcq+set.actualMix.numeric,set.available);
  assert.equal(new Set(set.questions.map(q=>q.prompt)).size,set.available,'Duplicate prompt '+key);
  assert.equal(new Set(set.questions.map(q=>q.id)).size,set.available,'Duplicate id '+key);
  if(eligible.has(paper))assert(set.available>0,'No original questions '+key);
  else assert.equal(set.available,0,'Unsupported advanced format must not pretend to be an official 20-question drill');
  if(!set.complete)limited++;
  const groups=new Map();
  for(const q of set.questions){
   originalQuestions++;
   assert.equal(q.key,key);
   assert(!/Complete the accounting principle|Which accounting guidance is most relevant|A learner is reviewing|Which explanation best fits this aspect/i.test(q.prompt),'Essay/cloze filler returned: '+q.prompt);
   assert.equal(q.prompt.includes('RM'),false,'Old currency: '+q.prompt);
   assert(q.explanation.length>12);
   assert(['mcq','numeric'].includes(q.type));
   const skill=q.group||'unknown';groups.set(skill,(groups.get(skill)||0)+1);
   assert(groups.get(skill)<=engine.MAX_VARIANTS_PER_SKILL,'Too many same-skill variants '+key+' '+skill);
   if(q.type==='mcq'){
    assert.equal(q.choices.length,4);
    assert.equal(new Set(q.choices.map(x=>x.label)).size,4);
    assert.equal(q.choices.filter(x=>x.value===q.correctValue).length,1);
   }else{
    assert(['FA2','MA2'].includes(paper));numeric++;
    assert(Number.isFinite(q.correctValue));
   }
  }
  checked++;
 }
 const set=engine.generate({paper,mode:'mock',count:50,lessons,syllabus,rng});
 if(eligible.has(paper)){
  assert.equal(set.available,50,'Foundation practice mock must contain 50 questions '+paper);
  assert(set.complete);
  assert.equal(new Set(set.questions.map(q=>q.prompt)).size,50);
  const mix=set.actualMix;
  if(paper==='FA2'||paper==='MA2'){assert.equal(mix.mcq,35);assert.equal(mix.numeric,15)}
  else{assert.equal(mix.mcq,50);assert.equal(mix.numeric,0)}
  assert(set.topicsCovered>=10,'Practice should spread across syllabus '+paper);
  mocks++;
 }else assert.equal(set.available,0,'Do not present advanced paper mocks with inaccurate sections '+paper);
}
assert.equal(checked,700);
assert.equal(engine.parseNumber('$2,500.00'),2500);
assert.equal(engine.parseNumber('RM2,500.00'),2500);
assert.equal(engine.parseNumber('-1,020.5'),-1020.5);
assert.equal(engine.parseNumber(''),null);
assert.equal(engine.parseNumber('twenty'),null);
assert.equal(engine.isNumericCorrect('$2,500',2500),true);
assert.equal(engine.isNumericCorrect('2499',2500),false);
const mock=engine.generate({paper:'FA2',mode:'mock',lessons,syllabus,rng}),answers={};
for(const q of mock.questions)answers[q.id]=q.correctValue;
const grade=engine.score(mock.questions,answers);
assert.equal(grade.marked,50);assert.equal(grade.correct,50);assert.equal(grade.percent,100);
const blank=engine.score(mock.questions,{});
assert.equal(blank.marked,0);assert.equal(blank.correct,0);assert.equal(blank.percent,0);
const html=read('quiz.html'),page=read('quiz-page.js');
assert(html.includes('quiz-quality-engine.js'));
assert(html.indexOf('quiz-casebank-knowledge.js')<html.indexOf('quiz-quality-engine.js'));
assert(html.indexOf('quiz-casebank-ledger.js')<html.indexOf('quiz-quality-engine.js'));
assert(html.includes('quiz-casebank-ledger.js?v=case-quality1'));

assert(page.includes("input.type='text'"));
assert(!page.includes("element('textarea'"));
console.log(JSON.stringify({syllabusTopicChecks:checked,originalQuestionsGenerated:originalQuestions,limitedTopicSets:limited,foundationMockChecks:mocks,numericalCases:numeric,unsupportedPapers:21}));
console.log('PASS: no pseudo-cloze filler, no artificial professional-level mocks, four answer choices, no duplicate prompts, capped skill variants and honest shortfall status');
