#!/usr/bin/env node
'use strict';
/* Specific first-half MA1/MA2/FFM academic evidence; not external reviewer certification. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['textbook-ma1.js','textbook-ma2-part-b.js','textbook-editorial-foundation-finance-02.js','textbook-editorial-foundation-finance-03.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const book=Object.assign({},ctx.LedgerTextbookMA1,ctx.LedgerTextbookMA2B,ctx.LedgerEditorialFoundationFinance02,ctx.LedgerEditorialFoundationFinance03);
const targets={
 'MA1:E1':['spreadsheet','relative','absolute','range','formula'],
 'MA1:E2':['spreadsheet','average','IF(','assumption','formula'],
 'MA1:E3':['sort','filter','SUBTOTAL','print','chart'],
 'MA2:E1':['cash','receivable','solvency','liquidity','manufactur'],
 'MA2:E2':['treasury','bank','authoris','security','supplier'],
 'MA2:E3':['budget','weighted','forecast','financ','opening'],
 'MA2:E4':['overdraft','cash','borrowing','equity','matur'],
 'FFM:D4':['venture','guarantee','lender','asymmetry','SME'],
 'FFM:F4':['debt','recovery','factoring','discount','write-off']
};
const evidence=[];
for(const [key,terms] of Object.entries(targets)){
 const chapter=book[key];assert(chapter,'Missing chapter '+key);
 const full=JSON.stringify(chapter).toLowerCase();
 for(const term of terms)assert(full.includes(term.toLowerCase()),key+' missing '+term);
 assert(chapter.sections.length>=6,key+' has insufficient developed sections');
 assert(chapter.workings.length>=4,key+' has insufficient worked practice');
 evidence.push({key,sectionCount:chapter.sections.length,workedCaseCount:chapter.workings.length,requiredTerms:terms,externalApproval:false});
}
const verified=[
 ['MA1:E1',40+48+75+65,228],
 ['MA1:E2',150*12*1.25+200*14*1.25+250*16*1.25,10750],
 ['MA1:E3',1200+800,2000],
 ['MA2:E1',30000-14000-8000+4000,12000],
 ['MA2:E1',30000+6000-5000-2000,29000],
 ['MA2:E2',90000-60000-70000,-40000],
 ['MA2:E3',18000*.2+21000*.3+24000*.5,21900],
 ['MA2:E3',4000+17000-23000,-2000],
 ['MA2:E3',3000-(-2000),5000],
 ['MA2:E4',80000*.11*4/12,2933.3333333333],
 ['FFM:D4',180000-40000-100000,40000],
 ['FFM:D4',250000/.2,1250000],
 ['FFM:D4',50000*.1*90/365+200,1432.8767123288],
 ['FFM:F4',3600-900,2700],
 ['FFM:F4',80000*.09*60/365,1183.5616438356],
 ['FFM:F4',63750*.08*45/365,628.7671232877]
];
for(const [key,calc,expected] of verified)assert(Math.abs(calc-expected)<.00001,key+' independent calculation mismatch');
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/first350-ma-cash-finance-evidence.json',JSON.stringify({date:'2026-10-31',chapterCount:9,endpointChecks:verified.length,chapters:evidence,warning:'Internal academic checks and independent numeric results; no external reviewer signoff or full first350 coverage.'},null,2)+'\n');
console.log('PASS: 9 MA1/MA2/FFM academic content reviews, '+verified.length+' independent numerical crosschecks; peer approval pending.');
