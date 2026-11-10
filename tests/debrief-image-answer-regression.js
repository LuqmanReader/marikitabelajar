/* Regression for MA2 question figures, exact answer options, legacy topic repair,
   and FIA/ACCA cross-paper debrief integrity. Run: node tests/debrief-image-answer-regression.js */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const dir=path.resolve(__dirname,'..');
const storage={items:new Map(),getItem(k){return this.items.get(k)||null;},setItem(k,v){this.items.set(k,String(v));}};
const w={console,localStorage:storage};w.window=w;w.globalThis=w;
const context=vm.createContext(w);
for(const file of ['subject-catalog.js','official-exam-registry.js','acca-published-data.js',
  'syllabus-catalog.js','chapter-analysis.js','revision-flow.js','answer-option-match.js',
  'pdf-topic-suggestions.js']){
 vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file});
}
const code='MA2',subject=w.SubjectCatalog.papers.find(p=>p.code===code).label;
const syllabus=w.LedgerSyllabus.resolve(storage,subject);
const matching=w.LedgerAnswerMatch;
const q7Options=[
 {text:'Compound bar chart',checked:true},
 {text:'Simple bar chart',checked:false},
 {text:'Percentage component bar chart',checked:false},
 {text:'Component bar chart',checked:false}
];
assert.deepStrictEqual(Array.from(q7Options.map(opt=>matching.optionClass(opt,
 {is_correct:false,correct_answer:'Component bar chart'}))),
 ['chosen-wrong','plain','plain','right-unchosen'],
 'Q7 may never mark percentage component and component bar charts as both correct');
const q9Key='The correct answers are: Interest charged to products based on average inventory, Notional rent for the use, by different cost centres, of company-owned buildings';
const q9Options=[
 {text:'Interest charged to products based on average inventory',checked:true},
 {text:'Notional rent for the use, by different cost centres, of company-owned buildings',checked:false},
 {text:'Cash discounts available to customers',checked:true},
 {text:'Trade discounts received from suppliers',checked:false}
];
assert.deepStrictEqual(Array.from(q9Options.map(opt=>matching.optionClass(opt,
 {is_correct:false,correct_answer:q9Key}))),
 ['chosen-correct','right-unchosen','chosen-wrong','plain'],
 'Partial-credit answer review must highlight correct and incorrect selections separately');
const legacy=[
 {qno:7,chapter:'',topic_status:'unreadable',qtext:'What type of graph is this? [Image unavailable in this export — consult the original question.]',is_correct:false,original_marks:0},
 {qno:45,chapter:'',topic_status:'outside',qtext:"Current ratio 2.5:1; What is the company's working capital?",is_correct:true,original_marks:2},
 {qno:50,chapter:'',topic_status:'outside',qtext:'What is the operating cash cycle? 45 + 30 - 25',is_correct:true,original_marks:2},
 {qno:51,chapter:'',topic_status:'outside',qtext:'A question about a legal system unrelated to MA2',is_correct:false,original_marks:0}
];
assert.strictEqual(w.LedgerTopicSuggest.repairLegacyRelated(legacy,subject,storage),3);
assert.strictEqual(legacy[0].chapter,syllabus.topics.find(t=>t.startsWith('A5 · ')));
assert.strictEqual(legacy[0].topic_status,'matched');
assert.strictEqual(legacy[1].chapter,syllabus.topics.find(t=>t.startsWith('E1 · ')));
assert.strictEqual(legacy[2].topic_status,'related');
assert.strictEqual(legacy[3].topic_status,'outside');
assert.deepStrictEqual(Array.from(legacy.map(q=>q.original_marks)),[0,2,2,0]);
const question={qno:50,is_correct:true,qtext:'What is the operating cash cycle? <img src="data:image/png;base64,AAAA">',
 options:[],your_answer:'50',correct_answer:'50',original_marks:2,original_max_marks:2};
const meta={id:'exam-test',subject,testType:'mock',testNumber:2,title:'Mock Test 2'};
const request=w.RevisionFlow.prompt(meta,[question],syllabus.topics,[question]);
assert(request.includes('IMAGE EVIDENCE:'));
assert(request.includes('"image_not_in_text_export":true'));
assert(request.includes('topic_status "related"'));
const response={schema:'personal-hub-debrief-v2',exam_id:meta.id,paper:meta.subject,
 paper_code:code,attempt_signature:w.RevisionFlow.signature([question]),
 questions:[{qno:50,chapter:syllabus.topics.find(t=>t.startsWith('E1 · ')),topic_status:'related',
 topic_reason:'Related cash flow management technique',reasoning:'Cash cycle',calculation:'45 + 30 - 25 = 50',
 justification:'Recorded answer is 50',focus:'Practise cycle calculations'}]};
const applied=w.RevisionFlow.review(response,[question],meta);
assert.strictEqual(applied.questions[0].original_marks,2);
assert.strictEqual(applied.questions[0].correct_answer,'50');
assert.strictEqual(applied.coverage.tagged,1);
const matrixQuestion=Object.assign({},question,{
 qno:20,qtext:'Could each reason explain missing equipment? Yes No',
 your_answer:'Invoice not received: No | Purchase not recorded: Yes',
 correct_answer:'Invoice not received: Yes | Purchase not recorded: Yes',
 answer_capture_method:'pdf-visual-matrix',answer_capture_status:'captured',
 matrix_answers:[
  {statement:'Invoice not received',selected:'No',correct:'Yes',is_correct:false,confidence:'high'},
  {statement:'Purchase not recorded',selected:'Yes',correct:'Yes',is_correct:true,confidence:'high'}
 ]
});
const matrixPrompt=w.RevisionFlow.prompt(meta,[matrixQuestion],syllabus.topics,[matrixQuestion]);
assert(matrixPrompt.includes('"matrix_answers"'));
assert(matrixPrompt.includes('"selected":"No"'));
assert(matrixPrompt.includes('"correct":"Yes"'));
assert(matrixPrompt.includes('For any captured matrix_answers'), 'Debrief AI must interpret every statement independently');
const exporter=fs.readFileSync(path.join(dir,'extension/tymbaflex-bridge/quiz-figure-export.js'),'utf8');
assert(exporter.includes('credentials:')&&exporter.includes('data:image/png;base64,'));
assert(exporter.includes('LP_EXPORT_REVIEW_WITH_IMAGES'));
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'extension/tymbaflex-bridge/manifest.json'),'utf8'));
assert(manifest.content_scripts.some(c=>c.js.includes('quiz-figure-export.js')));
console.log('PASS: Q7 exact option, Q9 partial credit, legacy topic correction, image evidence, original marks, extension exporter.');
