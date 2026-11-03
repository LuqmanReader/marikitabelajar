/* Synthetic, device-independent regression for PDF+HTML archive and compact prompts. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const dir=path.resolve(__dirname,'..');
const storage={getItem(){return null},setItem(){}};
const world={console,localStorage:storage};
world.window=world;world.globalThis=world;
world.LedgerSyllabus={resolve(){return {version:'2026–27',topics:['A1 · Test topic']}},code(){return 'MA2'}};
world.LedgerOfficialExamRegistry={get(){return {variant:'Global'}}};
const ctx=vm.createContext(world);
for(const file of ['revision-flow.js','source-archive.js'])
 vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),ctx,{filename:file});
const archive=world.LedgerPeerSourceArchive,flow=world.RevisionFlow;
const qs=[
 {qno:1,qtext:'The graph below shows fixed costs. What is the total?',is_correct:false,
  pdf_page:1,correct_answer:'$500',your_answer:'$400',original_marks:0,original_max_marks:2,
  source_result:'incorrect',options:[]},
 {qno:2,qtext:'A <script>alert(1)</script> cash purchase that should be debited to equipment',
  is_correct:true,pdf_page:2,your_answer:'equipment',correct_answer:'equipment',
  original_marks:2,original_max_marks:2,options:[]},
 {qno:4,qtext:'A question with unknown grading',is_correct:null,pdf_page:3,options:[],
  original_marks:null,original_max_marks:2}
];
const report=archive.audit(qs,[
 {page:1,text:'Question 1\nIncorrect\nThe graph below'},
 {page:2,text:'Question 2\nCorrect'},
 {page:3,text:'Question 3\nQuestion 4\nUnknown'}
]);
assert(report.visualQuestions.includes(1),'Graph question needs original PDF');
assert(report.issues.some(s=>s.includes('Q3: missing')),'Must flag missing questions');
assert(report.issues.some(s=>s.includes('PDF text refers to Q3')),'Must compare PDF text with reconstructed question numbers');
assert(report.issues.some(s=>s.includes('Q4: grading')),'Must flag unverifiable grading');
const html=archive.buildHtml(qs,{title:'MA2 <test>',subject:'MA2'},report);
assert(html.startsWith('<!DOCTYPE html>'),'Standalone reading copy');
assert(html.includes('MA2 &lt;test&gt;'),'Escape exam title');
assert(!html.includes('<script>alert(1)</script>'),'Untrusted question wording must never execute');
assert(html.includes('original PDF'),'Clearly identify provenance');
const meta={id:'attempt-1',subject:'MA2',testType:'pre',testNumber:2,title:'Progress Test 2'};
const prompt=flow.prompt(meta,qs.slice(0,1),['A1 · Test topic'],qs);
assert(prompt.includes('visual_review_required":true'),'Visual question flag');
assert(prompt.includes('personal-hub-debrief-v2'),'Keep existing import schema');
assert(prompt.includes('attempt_signature'),'Use entire attempt signature');
assert(prompt.includes('JSON only'),'Request structured answer');
assert(prompt.includes('do not guess'),'Prevent invented visuals');
assert(prompt.length<3500,'A short single-question prompt should stay compact');
console.log('PASS: dual PDF+HTML source archive, cross-checks, HTML escaping and compact AI prompt');
