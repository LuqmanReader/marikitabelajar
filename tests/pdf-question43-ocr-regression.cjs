/* Real OCR corruption patterns from FA2 Progress Test 2 review. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../pdf-ocr-parser.js'),'utf8'),sandbox);
const parser=sandbox.window.LedgerPeerOcrParser;
const cases=[
 {number:21,ocrConfidence:86,lines:[
  'Question 42','Mark 400 out of 10.00',
  'The following information relates to question 42 to 46',
  'Nazree non-current asset register',
  '42. Calculate the cost of the new motor vehicle.',
  '43. Calculate the loss on disposal of office equipment.',
  '44. Calculate the profit on disposal of motor vehicles.',
  '45. Calculate the annual depreciation charge.',
  '46. Calculate the closing accumulated depreciation.',
  'Question 43','Comet','Wark 200 auto 200',
  'Listed below are some comments on accounting concepts:',
  '(1) Financial statements always treat the business as a separate entity',
  '(2) Materiality only applies to physical assets',
  'The correct answer is: 1 only']},
 {number:22,ocrConfidence:91,lines:[
  'Question 44','Correct','Mark 200 0 of 200',
  'During the year receivables totalling 14600 were written off.',
  'The correct answer is: 12600',
  'Question 45','Incorrect','Mar 0.00 out of 200',
  'The supplier allowed John a cash discount that was not entered.',
  'The correct answer is: discount not entered',
  'Question 46','Incorrect','Mark 0.00 out of 2.00',
  'Elmina sold goods with early settlement discount.',
  'The correct answer is: Debit Cash']
 }
];
const r=parser.parse(cases);
assert.deepEqual(Array.from(r.questions,q=>q.qno),[42,43,44,45,46]);
const byNo=new Map(Array.from(r.questions,q=>[q.qno,q]));
assert.doesNotMatch(byNo.get(42).qtext,/Financial statements always treat/);
assert.match(byNo.get(43).qtext,/Financial statements always treat/);
assert.equal(byNo.get(42).original_marks,4);
assert.equal(byNo.get(42).original_max_marks,10);
assert.equal(byNo.get(43).source_result,'correct');
assert.equal(byNo.get(43).original_marks,2);
assert.equal(byNo.get(43).original_max_marks,2);
assert.equal(byNo.get(44).original_marks,2);
assert.equal(byNo.get(45).original_marks,0);
assert.equal(byNo.get(45).original_max_marks,2);
console.log('PASS: Q42 4/10; independent Q43 2/2; recovered Q44/Q45 OCR marks.');
