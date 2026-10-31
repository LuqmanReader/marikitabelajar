'use strict';
/* Recompute and inspect syllabus-based corrections; first-party checks only. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={LedgerFiaNotes:{},LedgerPublishedSyllabi:{papers:{}}};c.window=c;c.globalThis=c;vm.createContext(c);
for(const p of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js','textbook-crossqual-batch4a.js','textbook-ma1.js','textbook-ma2-part-b.js']){
 vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:p,timeout:12000});
}
const first=c.LedgerSupplementalTextbooksBatch4A;
const terms=['going concern','accrual','materiality','offsetting','consistency','prudence','duality','business entity','historical cost','current value','substance over form'];
for(const key of ['FA:B1','FFA:B1']){
 const ch=first[key];assert(ch&&ch.sections.length>=6&&ch.workings.length>=3,key+' is not complete');
 const body=JSON.stringify(ch).toLowerCase();
 for(const term of terms)assert(body.includes(term),key+' missing official ACCA B1 concept '+term);
 assert(ch.title.includes('Key principles'),key+' must follow the detailed study guide, not the duplicated B2 heading');
 assert(!/relevance, faithful representation and material judgement/i.test(ch.title),'B1 still incorrectly duplicates B2');
}
const cases=c.LedgerTextbookMA1;
for(const k of ['MA1:D2','MA1:D3','MA1:D4'])assert(cases[k].sections.length>=6&&cases[k].workings.length>=4,k+' lacks detailed teaching');
const assertResult=(key,title,answer)=>{
 const w=cases[key].workings.find(x=>x[0]===title);
 assert(w&&w[2].includes(answer),key+' '+title+' missing checked result '+answer);
};
assert.equal(35*12+5*(12*1.5)+2*12,534);
assert.equal(534-72,462);
assertResult('MA1:D2','Gross pay, deductions, and idle time','$534');
assertResult('MA1:D2','Gross pay, deductions, and idle time','$462');
assert.equal(84000/14000,6);
assert.equal(79000-12500*6,4000);
assertResult('MA1:D3','Overhead absorption rate and shortfall','$4,000');
assert.equal(3600+80*12+300+80*8,5500);
assert.equal(5500*1.1,6050);
assertResult('MA1:D4','Separate job-card costing with markup','$6,050');
assert.equal((4000+2400+1600+800)/400,22);
assertResult('MA1:D4','Batch size and setup cost','$22.00');
assert.equal(1000-1000*.1,900);
assert.equal(9000/900,10);
assert.equal((1000-880)-100,20);
assert.equal(100-(1000-930),30);
assertResult('MA1:D4','Normal loss versus abnormal loss and abnormal gain','$200');
assertResult('MA1:D4','Normal loss versus abnormal loss and abnormal gain','$300');
const ma2=c.LedgerTextbookMA2B['MA2:D3'];
const npv=17000/1.1+17000/(1.1**2)+17000/(1.1**3)-40000;
assert.equal(npv.toFixed(2),'2276.48');
const npvLesson=ma2.workings.find(x=>x[0]==='NPV calculation');
assert(npvLesson&&npvLesson[2].includes('$2,276.48'));
assert(!npvLesson[2].includes('$2,276.49'));
console.log('PASS: FA/FFA 2026-27 B1 ten principles, MA1 labour and product costing, MA2 precise NPV, all checked numeric endpoints.');
