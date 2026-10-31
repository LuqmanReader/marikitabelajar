#!/usr/bin/env node
'use strict';
/* Nine original FIA/ACCA chapter mappings and independently computed numerical scenarios.
 * Does not establish detailed ACCA outcome equivalence. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={};c.window=c;c.globalThis=c;
vm.runInNewContext(fs.readFileSync('textbook-editorial-fia-applied.js','utf8'),c);
const books=c.LedgerEditorialFiaAppliedChapters||{};
const mapped=['FMA:C2','MA:C2','FFA:D8','FA:D8','FBT:B2','BT:B2','FFM:E3','PM:C3','FR:B7'];
assert.deepEqual(Object.keys(books).sort(),mapped.sort());
for(const [key,chapter] of Object.entries(books)){
 assert.equal(chapter.sourceKind,'independently-authored');
 assert(chapter.reviewStatus.includes('PENDING'));
 assert.equal(chapter.sections.length,3);
 assert.equal(chapter.workings.length,2);
 assert(chapter.sections.every(x=>x[0].length>10&&x[1].length>=280));
 assert(chapter.workings.every(x=>x[1].length>=100&&x[2].length>=150));
 assert(new Set(chapter.workings.map(x=>x[1])).size===2,'Duplicate case '+key);
 assert(!/lorem ipsum|indonesia|further teaching required/i.test(JSON.stringify(chapter)),'placeholder '+key);
}
function approx(a,b,eps=.03){assert(Math.abs(a-b)<eps,String(a)+' versus '+String(b))}
const calculations=[
 [6000-5200,800],[800*9,7200],[800+4000-4300,500],[300*5,1500],
 [78000+120000-112000-5000-3000,78000],
 [78000*.04,3120],[78000-3120,74880],[3120-2000,1120],
 [5*70000-(3*70000+90000),50000],
 [40000/1.10+45000/1.10**2-60000,13553.72],
 [2+(80000-25000-32000)/40000,2.575],
 [250*30+75*40,10500],[200*24+60*35,6900],
 [1000*(.8*0+.15*100+.05*400),35000],[260000-200000,60000]
];
for(const [actual,expected]of calculations)approx(actual,expected);
const results=[
 ['FMA:C2',0,'$7,200'],['FMA:C2',1,'$1,500'],
 ['FFA:D8',0,'$74,880'],['FFA:D8',1,'$1,120'],
 ['FBT:B2',1,'$50,000'],['FFM:E3',0,'$13,553.72'],
 ['FFM:E3',1,'2.58'],['PM:C3',0,'$10,500'],
 ['PM:C3',1,'$6,900'],['FR:B7',0,'$35,000'],
 ['FR:B7',1,'$60,000']
];
for(const [key,i,expected] of results)assert(books[key].workings[i][2].includes(expected),'Answer regression '+key+' '+i);
console.log('PASS: Nine FIA and ACCA mapped chapters, 18 worked cases and independent numerical-answer checks.');
