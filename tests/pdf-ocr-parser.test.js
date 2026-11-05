/* Run: node tests/pdf-ocr-parser.test.js */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../pdf-ocr-parser.js'),'utf8'),sandbox);
const api=sandbox.window.LedgerPeerOcrParser;
function pages(){
 const out=[];
 for(let p=1;p<=25;p++){
   const lines=p===1?['Grade','61.00 out of 100.00']:[];
   for(let j=0;j<2;j++){
     const n=(p-1)*2+j+1,mark=n<=30?2:n===31?1:0;
     lines.push('Question '+n,mark===2?'Correct':mark===0?'Incorrect':'Partially correct',
       'Mark '+mark.toFixed(2)+' out of 2.00',
       'Which graph is shown below?', 'The correct answer is: B');
   }
   out.push({number:p,lines,ocrConfidence:95});
 }
 return out;
}
function check(){
 const baseline=api.parse(pages());
 assert.equal(baseline.questions.length,50);
 assert.equal(baseline.reconciliation.extractedEarned,61);
 assert.equal(baseline.reconciliation.extractedPossible,100);
 assert.equal(baseline.reconciliation.headingsRecognized,50);
 assert.equal(baseline.questions[8].is_correct,true);
 assert.equal(baseline.questions[30].source_result,'partially_correct');
 assert.equal(baseline.questions[30].original_marks,1);
 assert.ok(baseline.questions.every(q=>q.your_answer===null));
 assert.ok(baseline.questions.every(q=>q.needs_visual_check));
 assert.equal(baseline.questions[30].source_pdf_pages[0],16);
 let missing=pages();missing[0].lines[2]='Quest';
 assert.equal(api.parse(missing).reconciliation.headingsRecognized,49);
 let bad=pages();bad[0].lines[1]='64.00 out of 100.00';
 assert.throws(()=>api.parse(bad),/reconciliation failed/);
 bad=pages();bad[0].lines[3]='Incorrect';
 assert.throws(()=>api.parse(bad),/alignment is uncertain/);
 console.log('OCR parser regression checks passed: 50 questions, 61/100, partial credit, missing headings, two rejection paths.');
}
check();
