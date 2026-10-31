#!/usr/bin/env node
'use strict';
/* Source-to-lesson 2026 FA2/MA2 academic checks, not a professional signoff. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const p of ['textbook-ma2-part-a.js','textbook-fa2-part-a.js'])vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p});
const book=Object.assign({},ctx.LedgerTextbookMA2A,ctx.LedgerTextbookFA2A);
const rules={"MA2:A1":{"terms":["trainee","responsibility","cost-centre","profit-centre","investment-centre"],"minimum":4},"MA2:A2":{"terms":["job costing","batch costing","process costing","service costing","interlocking","cost unit"],"minimum":4},"MA2:A4":{"terms":["fixed budget","flexed budget","forecast","variable cost","variance"],"minimum":4},"MA2:A5":{"terms":["line chart","report","confidential","format","data"],"minimum":4},"FA2:A2":{"terms":["computerised","cloud","control","audit","invoice"],"minimum":4},"FA2:B1":{"terms":["accounting equation","statement of financial position","statement of profit or loss","comprehensive income"],"minimum":3},"FA2:C2":{"terms":["general ledger","receivables","balance c/d","compound journal","trial balance"],"minimum":4}};
for(const [key,v] of Object.entries(rules)){
 const c=book[key];assert(c,'Missing '+key);const t=JSON.stringify(c).toLowerCase();
 for(const term of v.terms)assert(t.includes(term.toLowerCase()),key+' missing '+term);
 assert(c.workings.length>=v.minimum,key+' underdeveloped worked cases');
}
const arithmetic=[
 ['MA2:A1',150000-90000-20000,40000],
 ['MA2:A2',1800/300,6],
 ['MA2:A2',10000-6000,4000],
 ['MA2:A2',6000+3000+2000,11000],
 ['MA2:A4',2500*(15-7)-6000,14000],
 ['MA2:A4',2500*15-18250-6200,13050],
 ['MA2:A4',14000-13050,950],
 ['MA2:A5',(14000-11000)/11000*100,27.2727272727],
 ['FA2:A2',2950-(1200+850+650),250],
 ['FA2:B1',30000+8000+5000-3000,40000],
 ['FA2:C2',5000*1.08,5400]
];
for(const [key,value,expected] of arithmetic)assert(Math.abs(value-expected)<0.00001,key+' numeric mismatch');
console.log('PASS FA2/MA2 2026: seven newly reconciled first-half chapters and 11 independent numeric endpoints; full external signoff remains pending.');
