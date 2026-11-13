/* Source-layout and evidence-state regression. No private student PDF or
 * screenshot is stored in the test repository. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const w={window:{}};w.window=w;
for(const name of ['pdf-page-layout.js','pdf-native-widgets.js','pdf-extraction-audit.js'])
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),w,{filename:name});
const layout=w.LedgerPeerPdfLayout,widgets=w.LedgerPeerPdfWidgets,audit=w.LedgerPeerPdfAudit;
const viewport={scale:2,convertToViewportPoint(x,y){return [x*2,800-y*2]},
  convertToViewportRectangle(a){return [a[0]*2,800-a[1]*2,a[2]*2,800-a[3]*2]}};
function item(t,x,y,width){return {str:t,transform:[1,0,0,8,x,y],height:9,width:width||t.length*5};}
const native=layout.fromNative([
 item('Question',40,360,45),item('20',95,360,11),
 item('Incorrect',40,345,60),
 item('Jay cannot find the smart TV in his asset register',40,326,260),
 item('The supplier invoice has not been received',40,310,230),
 item('No record was made when the asset was bought',40,295,245),
 item('Question',40,250,45),item('21',95,250,11),
 item('Calculate reducing balance depreciation',40,230,220)
],viewport);
assert.equal(native.source,'native');
assert.equal(native.lines[0].text,'Question 20');
assert.equal(native.lines.filter(r=>layout.anchorNumber(r.text)!==null).length,2);
const pages=[{number:10,layout:native}];
const questions=[{qno:20,source_pdf_pages:[10]},{qno:21,source_pdf_pages:[10]}];
const anchors=layout.sourceRegions(questions,pages);
assert.equal(anchors.length,2);
assert.equal(questions[0].source_regions[0].hasAnchor,true);
assert.ok(questions[0].source_regions[0].h>0);
assert.ok(questions[1].source_regions[0].y>questions[0].source_regions[0].y);
assert.equal(layout.anchorNumber('Information for Question 20'),null);
assert.equal(layout.anchorNumber('Question 20'),20);
// OCR TSV layout: inventory table values retain their original columns.
const tsvHeader=['level','page_num','block_num','par_num','line_num','word_num',
 'left','top','width','height','conf','text'].join('\t');
const ocrWords=[
 [20,20,55,13,'Question'],[81,20,19,13,'29'],
 [20,61,38,13,'Item'],[135,61,30,13,'Cost'],[260,61,58,13,'Expected price'],
 [20,91,13,13,'A'],[135,91,25,13,'300'],[260,91,40,13,'450'],
 [20,121,13,13,'B'],[135,121,27,13,'400'],[260,121,40,13,'390'],
 [20,170,55,13,'Question'],[81,170,19,13,'30']
];
const tsv=[tsvHeader,...ocrWords.map((v,i)=>[5,1,1,1,i+1,1,v[0],v[1],v[2],v[3],97,v[4]].join('\t'))].join('\n');
const scanned=layout.fromTsv(tsv);
assert.equal(scanned.source,'ocr');
assert.equal(scanned.lines[0].text,'Question 29');
const table=layout.tableCandidates(scanned);
assert.equal(table.length,1);
assert.deepEqual(Array.from(table[0].rows[1]),['A','300','450']);
assert.equal(layout.candidateAnchors({number:14,layout:scanned}).length,2);
// Blank answer + incorrect grade = unresolved, not unanswered.
const records=[
 {qno:1,source_result:'correct',your_answer:'Yes',answer_capture_status:'captured',original_marks:2,original_max_marks:2},
 {qno:2,source_result:'not_answered',your_answer:null,original_marks:0,original_max_marks:2},
 {qno:3,source_result:'incorrect',your_answer:null,original_marks:0,original_max_marks:2},
 {qno:4,source_result:'incorrect',your_answer:null,matrix_answers:[{selected:'Yes'},{selected:null}],
  original_marks:0,original_max_marks:2}
];
// This fixture tests answer-state provenance, not missing question content.
// Supply genuine question prompts; a textless question is now correctly incomplete.
records.forEach((record,i)=>{record.qtext='<p>What is the source treatment for test record '+(i+1)+'?</p>';});
const a=audit.audit(records,{expectedQuestionCount:4});
assert.equal(a.structuralComplete,true);
assert.equal(a.marksAligned,true);
assert.equal(a.answerStates.answered,1);
assert.equal(a.answerStates.unanswered,1);
assert.equal(a.answerStates.partially_answered,1);
assert.equal(a.answerStates.unresolved,1);
assert.equal(records[2].answer_state,'unresolved');
assert.equal(audit.audit(records,{expectedQuestionCount:5}).missing[0],5);
// Real embedded PDF form fields can independently establish an unanswered
// response without interpreting a zero grade as evidence.
const radio=widgets.widgets([
 {subtype:'Widget',fieldType:'Btn',fieldName:'Q20',fieldValue:'Off',buttonValue:'Yes',rect:[50,330,60,340]},
 {subtype:'Widget',fieldType:'Btn',fieldName:'Q20',fieldValue:'Off',buttonValue:'No',rect:[65,330,75,340]}
],viewport,10);
const q={qno:20,source_pdf_pages:[10],source_regions:[{page:10,x:80,y:98,w:600,h:110}],
 answer_capture_status:'not_captured',your_answer:null,source_result:'incorrect'};
widgets.attach([q],[{number:10,widgets:radio}]);
assert.equal(q.answer_state,'unanswered');
assert.equal(q.answer_state_evidence,'native-pdf-widgets-empty');
const selected=widgets.widgets([
 {subtype:'Widget',fieldType:'Btn',fieldName:'Q20',fieldValue:'Yes',buttonValue:'Yes',rect:[50,330,60,340]},
 {subtype:'Widget',fieldType:'Btn',fieldName:'Q20',fieldValue:'Yes',buttonValue:'No',rect:[65,330,75,340]}
],viewport,10);
const another={qno:20,source_pdf_pages:[10],source_regions:q.source_regions,your_answer:null};
widgets.attach([another],[{number:10,widgets:selected}]);
assert.equal(another.your_answer,'Yes');
assert.equal(another.answer_state,'answered');
console.log('PASS: coordinate text, OCR tables, question anchors, widget answer states and no false unanswered classification.');