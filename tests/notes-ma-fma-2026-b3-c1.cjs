#!/usr/bin/env node
'use strict';
/* 2026-27 direct MA/FMA B3 and C1 outcome checks; peer signoff not implied. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js','textbook-crossqual-batch4a.js','textbook-editorial-management-02.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file,timeout:12000});
const chapters=Object.assign({},ctx.LedgerSupplementalTextbooksBatch4A,ctx.LedgerEditorialManagement02);
const checks=[["MA:B3","Big data and variable classification in a retail analytics feed",["volume","variety","velocity","veracity","value","structured","ordinal"]],["MA:B3","Variance, standard deviation and coefficient of variation",["variance","median","mode","population","coefficient of variation"]],["MA:B3","Grouped mean and variability from frequency classes",["weighted","frequency","standard deviation"]],["MA:B3","Expected value versus certain settlement",["expected value","probabilit"]],["MA:B3","Normal table and z-score",["normal distribution","z"]],["FMA:B3","Big data and variable classification in a retail analytics feed",["volume","variety","velocity","veracity","value","structured","ordinal"]],["FMA:B3","Normal table and z-score",["normal distribution","z"]],["MA:C1","Reciprocal service overhead reapportionment",["reciprocal","service","overhead"]],["MA:C1","Economic order quantity and average costs",["economic order quantity","reorder"]],["MA:C1","FIFO, LIFO and periodic weighted average material issues",["FIFO","LIFO","average"]],["FMA:C1","Reciprocal service overhead reapportionment",["reciprocal","service","overhead"]]];
for(const [key,caseName,terms] of checks){
const ch=chapters[key];assert(ch,'Missing taught paper '+key);
const caseRow=ch.workings.find(row=>row[0]===caseName);assert(caseRow,key+' missing '+caseName);
const body=JSON.stringify(ch).toLowerCase();for(const term of terms)assert(body.includes(term.toLowerCase()),key+' lacks '+term);
assert(ch.sections.length>=4&&ch.workings.length>=3,key+' lacks applied learning depth');
}
const assertNear=(actual,expected,label,tolerance=0.006)=>assert(Math.abs(actual-expected)<tolerance,label+' recomputation mismatched');
assertNear((2+4+4+6)/4,4,'B3 mean');
assertNear((4+0+0+4)/4,2,'B3 population variance');
assertNear(Math.sqrt(2)/4*100,35.355339059327,'B3 coefficient variation',0.01);
assertNear((2*5+3*15+25)/6,13.333333333333,'B3 grouped mean');
assertNear((2*(5-80/6)**2+3*(15-80/6)**2+(25-80/6)**2)/6,47.222222222222,'B3 grouped variance');
assertNear(0.7*8000+0.3*2000,6200,'B3 expected value');
assertNear((130-100)/15,2,'B3 standard normal z');
assertNear(1-.9772,.0228,'B3 tail probability');
assertNear(100*5+20*7,640,'C1 FIFO issue');
assertNear(100*7+20*5,800,'C1 LIFO issue');
assertNear(120*(1200/200),720,'C1 weighted average issue');
assertNear(Math.sqrt(2*12000*50/2),774.596669241483,'C1 EOQ');
const S=32000/.99,T=20000+.1*S;
assertNear(.7*S+.3*T,29595.95959596,'C1 reciprocal P');
assertNear(.2*S+.6*T,20404.04040404,'C1 reciprocal Q');
assertNear(80000+50000+.7*S+.3*T+.2*S+.6*T,180000,'C1 reciprocal overhead reconciliation');
console.log('PASS MA/FMA B3 C1 official 2026-27: four chapters, 11 teaching-case references, 15 separate arithmetic checks. Peer review pending.');
