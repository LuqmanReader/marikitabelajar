/* Regression tests for FIA / ACCA topic-classified debriefs.
   No fabricated ACCA facts. Test fixtures are intentionally synthetic. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const dir=path.resolve(__dirname,'..');
const storage={
 cache:new Map(),getItem(k){return this.cache.has(k)?this.cache.get(k):null;},
 setItem(k,v){this.cache.set(k,String(v));},removeItem(k){this.cache.delete(k);}
};
const world={localStorage:storage,console};world.window=world;world.globalThis=world;
const context=vm.createContext(world);
for(const file of ['subject-catalog.js','official-exam-registry.js','acca-published-data.js','syllabus-catalog.js','chapter-analysis.js','revision-flow.js']){
 vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file});
}
const {SubjectCatalog:subjects,LedgerOfficialExamRegistry:registry,LedgerSyllabus:syllabus,ChapterAnalysis:chapters,RevisionFlow:debrief}=world;
const papers=subjects.papers;
const goodSource='https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/syllabus-study-guide.html';
const trace=[];
function q(id){
 return {qno:id,is_correct:id%2===0,qtext:'Synthetic question '+id,correct_answer:'A',your_answer:'B',options:[],original_marks:id%2?0:2,original_max_marks:2};
}
function expectFailure(fn,fragment){let e;try{fn()}catch(error){e=error;}assert(e,'Expected rejection: '+fragment);assert(String(e.message).includes(fragment),String(e.message));}
function tryCase(code){
 const label=subjects.papers.find(p=>p.code===code).label;
 const record=registry.get(label);
 assert(record&&record.source.startsWith('https://www.accaglobal.com/'),'official paper reference missing: '+code);
 assert(record.format&&['on-demand','session'].includes(record.format.mode),'invalid exam mode: '+code);
 if(record.format.sections.length){
  const markTotal=record.format.sections.reduce((sum,s)=>sum+(s.marks||s.count*s.marksEach||0),0);
  assert.strictEqual(markTotal,record.format.marks,'bad paper exam format mark allocation: '+code);
 }
 let verified=syllabus.resolve(storage,label);
 assert.strictEqual(verified.status,'ACCA-published','Every paper must have ACCA 2026/27 topics: '+code);
 assert.strictEqual(verified.verified,true,'Paper requires no manual syllabus setup: '+code);
 assert(verified.topics.length>=8,'Syllabus too small for '+code);
 assert(verified.source.startsWith('https://www.accaglobal.com/')&&verified.source.includes('.pdf'),'Official guide source missing for '+code);
 const codes=verified.topics.map(s=>s.split(' · ')[0]),seen=new Set();
 for(const topic of verified.topics){
  const match=topic.match(/^([A-J])(\\d{1,2}) · (.{3,})$/);
  assert(match,'Invalid official syllabus heading '+code+': '+topic);
  assert(!seen.has(match[0].split(' · ')[0]),'Duplicated syllabus code '+code+': '+topic);
  seen.add(match[0].split(' · ')[0]);
 }

 const questions=[q(1),q(2)];
 const meta={id:'exam-'+code,subject:label,testType:'set',testNumber:2,title:'Set 2',setChapter:verified.topics[0]};
 const prompt=debrief.prompt(meta,questions,verified.topics,questions);
 for(const keyword of [label,'ATTEMPT TYPE: Chapter Set; number 2','SET TARGET SYLLABUS TOPIC',verified.topics[0],'STUDENT-SELECTED PAPER CODE','APPROVED ACCA SYLLABUS','QUESTION DATA:']){
   assert(prompt.includes(keyword),'Debrief prompt missing '+keyword+' on '+code);
 }
 const originalSig=debrief.signature(questions);
 const explanation={reasoning:'Reason',calculation:'Not applicable',justification:'Answer justification',focus:'Practice the topic',topic_reason:'Matches the official learning requirement for the tested concept.'};
 const items=questions.map(x=>({qno:x.qno,chapter:verified.topics[0],topic_status:'matched',...explanation}));
 const payload={schema:'personal-hub-debrief-v2',exam_id:meta.id,paper:meta.subject,paper_code:code,attempt_signature:originalSig,questions:items};
 const result=debrief.review(payload,questions,meta);
 assert.strictEqual(result.count,2);assert.strictEqual(result.coverage.tagged,2);
 assert.strictEqual(result.questions[0].original_marks,0);
 assert.strictEqual(result.questions[1].original_marks,2);
 assert.strictEqual(result.questions[0].chapter,verified.topics[0]);
 expectFailure(()=>debrief.review({...payload,paper_code:'WRONG'},questions,meta),'different ACCA paper');
 expectFailure(()=>debrief.review({...payload,exam_id:'not-this-exam'},questions,meta),'another attempt');
 expectFailure(()=>debrief.review({...payload,attempt_signature:'wrong'},questions,meta),'different question set');
 expectFailure(()=>debrief.review({...payload,questions:[items[0],items[0]]},questions,meta),'Duplicate');
 expectFailure(()=>debrief.review({...payload,questions:[{...items[0],chapter:'Made up heading'}]},questions,meta),'not in the approved syllabus');
 const outside=debrief.review({...payload,questions:[{...items[0],chapter:'',topic_status:'outside'}]},questions,meta);
 assert.strictEqual(outside.coverage.outside,1);assert.strictEqual(outside.coverage.tagged,0);
 const premature=chapters.summary([{...questions[0],chapter:'Invented topic',topic_status:'matched'}],label,storage);
 assert.strictEqual(premature.coverage.tagged,0);
 const changed=debrief.review({...payload,questions:[{...items[0],is_correct:true,correct_answer:'X',original_marks:99}]},questions,meta);
 assert.strictEqual(changed.questions[0].is_correct,questions[0].is_correct,'AI must not change recorded grade');
 assert.strictEqual(changed.questions[0].original_marks,0,'AI must not change marks');
 trace.push({paper:code,source:record.source,formatVerified:!!record.format.sections.length,syllabusTopics:verified.topics.length,passed:true});
}
assert.strictEqual(papers.length,25);
for(const paper of papers)tryCase(paper.code);
assert.strictEqual(registry.get('FA1').format.sections[0].count,50);
assert.strictEqual(registry.get('MA2').format.sections[0].marksEach,2);
assert.strictEqual(registry.get('BT').format.sections.reduce((s,x)=>s+(x.marks||x.count*x.marksEach),0),100);
assert.strictEqual(registry.get('SBL').format.durationMinutes,195);
assert.notStrictEqual(registry.get('LW').variant,'UK');
assert.strictEqual(registry.get('TX').variant,'MYS');
assert.strictEqual(registry.get('AAA').variant,'INT');
assert.strictEqual(registry.get('FTX').variant,'UK');
console.log(JSON.stringify({result:'PASS',papers:papers.length,formatsVerified:trace.filter(x=>x.formatVerified).length,debriefCasesPerPaper:10,tests:'real 2026/27 syllabus papers, paper context, proper topics, wrong paper, wrong attempt, signature, duplicate, invented topic, outside, existing bogus, unchanged marks',perPaper:trace},null,2));
