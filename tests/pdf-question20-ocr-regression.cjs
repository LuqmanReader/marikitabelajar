/* Regression: a scanned FA2 review must not merge Q20 into Q19 when the
 * grade/status text is degraded by OCR. Run: node tests/pdf-question20-ocr-regression.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../pdf-ocr-parser.js'),'utf8'),sandbox);
const parser=sandbox.window.LedgerPeerOcrParser;
const pages=[
  {number:10,ocrConfidence:86,lines:[
    'Question 19','Incorrect','Mark 0.00 out of 2.00',
    'Ronald operates using a mark-up of 20%.',
    'What was the cost of inventory destroyed in the fire?',
    'The correct answer is: 39600',
    'Question 20','Inconect','Wark 000 out of 200',
    'When carrying out a reconciliation between the non-current assets in his asset register',
    'and the assets that he can physically identify, Jay could not find information',
    'in his asset register for the smart TV that he bought last week.',
    'Could each of the following reasons explain the discrepancy?',
    'Yes No',
    "The supplier's invoice has not yet been received © © ® ®",
    'No record was made when the asset was bought © [©]'
  ]},
  {number:11,ocrConfidence:86,lines:[
    'Question 21','Incorrect','Mark 0.00 out of 2.00',
    'William purchased a machinery for $30,000.',
    'What is the profit or loss on disposal?',
    'The correct answer is: Profit of $312'
  ]}
];
const result=parser.parse(pages);
assert.deepEqual(Array.from(result.questions,q=>q.qno),[19,20,21]);
const q19=result.questions[0],q20=result.questions[1],q21=result.questions[2];
assert.doesNotMatch(q19.qtext,/smart TV/);
assert.match(q20.qtext,/smart TV/);
assert.match(q20.qtext,/supplier&#39;s invoice/);
assert.match(q20.qtext,/No record was made/);
assert.doesNotMatch(q21.qtext,/smart TV/);
assert.equal(q19.correct_answer,'39600');
assert.equal(q20.correct_answer,'');
assert.equal(q20.source_result,'incorrect');
assert.equal(q20.original_marks,0);
assert.equal(q20.original_max_marks,2);
assert.equal(q20.answer_capture_status,'not_captured');
assert.equal(q20.your_answer,null);
assert.deepEqual(Array.from(q20.source_pdf_pages),[10]);
// Readable question and grade are not proof of selected Yes/No matrix cells.
assert.ok(result.warnings.some(w=>/no proven selected-answer evidence/.test(w)));
console.log('PASS: Q19/Q20/Q21 remain separate; Q20 grade retained; missing matrix selections not fabricated.');
