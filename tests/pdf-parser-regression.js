/* Synthetic PDF text extraction regression. These tests do not substitute a live scanned PDF. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const fakeNodes={
 pdfSubject:{value:'MA2 · Managing Costs and Finance'},
 pdfTestType:{value:'pre'},
 pdfTestNumber:{value:'1'},
 pdfSetChapter:{value:''}
};
const doc={getElementById(id){return fakeNodes[id]||null;}};
const context={document:doc,window:null,localStorage:{getItem(){return null}},console};context.window=context;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../pdf-attempt.js'),'utf8'),context,{filename:'pdf-attempt.js'});
const reader=context.LedgerPeerPdfImport;
function question(n,result,marks,total,header='Question '+n){
 return header+'\n'+result+'\nMark: '+marks+' out of '+total+'\n'+'A fictional, carefully worded question requiring a recorded numerical answer about a financial result.\n'+'The correct answer is: 15\n';
}
const tests=[
 ['MA2 · 50 two-mark OT',Array.from({length:50},(_,i)=>question(i+1,i%2?'Correct':'Incorrect',i%2?2:0,2)),50],
 ['MA · 35 two-mark OT + 3 ten-mark multitask top-level',Array.from({length:35},(_,i)=>question(i+1,'Correct',2,2)).concat(Array.from({length:3},(_,i)=>question(i+36,'Incorrect',0,10))),38],
 ['FA · 35 two-mark OT + 2 fifteen-mark multitask top-level',Array.from({length:35},(_,i)=>question(i+1,'Correct',2,2)).concat(Array.from({length:2},(_,i)=>question(i+36,'Incorrect',0,15))),37],
 ['PM · OT + scenario + constructed responses',Array.from({length:15},(_,i)=>question(i+1,'Correct',2,2)).concat([question(16,'Partially correct',9,20),question(17,'Incorrect',0,20)]),17],
 ['Short progress test',Array.from({length:7},(_,i)=>question(i+1,'Incorrect',0,2)),7]
];
let total=0;
for(const [name,items,count] of tests){
 const qs=reader.parsePage(items.join('\n'),1);const check=reader.inspect(qs);
 assert.strictEqual(qs.length,count,name+' count');
 assert.strictEqual(check.ordered.length,count,name+' ordered');
 assert.strictEqual(check.missing.length,0,name+' missing');
 assert.strictEqual(check.duplicates.length,0,name+' duplicates');
 assert.strictEqual(check.ungraded.length,0,name+' ungraded');
 assert(qs.every(q=>q.source_format==='pdf'&&q.chapter===''&&q.original_marks!=null&&q.original_max_marks!=null),name+' grade metadata');
 total+=count;
}
for(const heading of ['Question 1','Question 1:','Question 1 of 20','Question 1 (2 marks)']){
 const qs=reader.parsePage(question(1,'Correct',2,2,heading),1);assert.strictEqual(qs.length,1,heading);
 total++;
}
const gaps=reader.inspect(reader.parsePage([question(1,'Correct',2,2),question(3,'Correct',2,2)].join('\n'),1));
assert.deepStrictEqual(Array.from(gaps.missing),[2]);
const duplicated=reader.inspect(reader.parsePage([question(1,'Correct',2,2),question(1,'Incorrect',0,2)].join('\n'),1));
assert.deepStrictEqual(Array.from(duplicated.duplicates),[1]);
console.log(JSON.stringify({status:'PASS',formats:tests.map(x=>x[0]),questionsChecked:total,variants:4,duplicateGapChecks:2},null,2));
