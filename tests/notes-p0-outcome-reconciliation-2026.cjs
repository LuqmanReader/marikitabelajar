#!/usr/bin/env node
'use strict';
/* P0 substantive regression against independently derived original numbers
 * and full 2026-27 ACCA detailed topic coverage. Does NOT certify all papers. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['textbook-fa2-part-b.js','textbook-ma2-part-b.js'])
 vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const fa=ctx.LedgerTextbookFA2B['FA2:D4'],ma=ctx.LedgerTextbookMA2B['MA2:D2'];
assert(fa&&ma);
const official=JSON.parse(fs.readFileSync('audit/all700-official-syllabus-evidence-ci.json','utf8'));
const letters=(key)=>official.chapters.find(x=>x.key===key)?.officialDetailedOutcomeCandidates.map(o=>o.letter);
const fa2=letters('FA2:D4'),ma2=letters('MA2:D2');
assert(fa2,'FA2 D4 official curriculum missing');
assert(ma2,'MA2 D2 official curriculum missing');
assert.deepEqual([...fa2],Array.from({length:15},(_,i)=>String.fromCharCode(97+i)),
  'FA2 D4 must not silently truncate official non-current asset learning outcomes a–o');
assert.deepEqual([...ma2],['a','b','c','d','e','f'],
  'MA2 D2 must retain detailed decision-making outcomes a–f');
const caseOf=(c,name)=>{const x=c.workings.find(w=>w[0]===name);
 assert(x,'Missing independently-reviewed worked case: '+name);return x[2]};
const requires=(s,parts)=>{for(const p of parts)assert(s.includes(p),'Missing technical step '+p)};
assert(fa.sections.some(x=>/asset register/i.test(x[0])),'FA2 D4 asset-register teaching missing');
assert(fa.sections.some(x=>/discrepanc/i.test(x[0])),'FA2 D4 asset-register reconciliation missing');
let a=caseOf(fa,'Part-exchange journals with disposal account');
requires(a,['Dr PPE (new machine) $42,000','Cr supplier payable $42,000',
 'Dr disposal $30,000','Cr PPE (old machine) $30,000',
 'Dr accumulated depreciation $22,000','Cr disposal $22,000',
 'Dr supplier payable $10,000','Cr disposal $10,000',
 'Dr supplier payable $32,000','Cr bank $32,000',
 'Dr disposal $2,000','Cr gain on disposal in profit or loss $2,000']);
assert.equal(30000-22000,8000);
assert.equal(10000-8000,2000);
assert.equal(42000-10000,32000);
assert.equal(30000+2000,22000+10000);
a=caseOf(fa,'Scrapping an asset with no proceeds');
requires(a,['Dr loss on disposal (profit or loss) $3,000','Cr disposal $3,000']);
assert.equal(15000-12000,3000);
a=caseOf(fa,'Asset register and ledger reconciliation');
requires(a,['$42,000','$7,000','$35,000','Dr depreciation expense $500','Cr accumulated depreciation $500']);
assert.equal((24000-4000)/5+18000/3*6/12,7000);
assert.equal(42000-7000,35000);
a=caseOf(fa,'Comparing suitable depreciation methods');
requires(a,['$8,000','$4,800','$7,200']);
assert.equal(20000*.4,8000);assert.equal((20000-8000)*.4,4800);
assert(ma.sections.some(x=>/Multiple binding constraints/.test(x[0])),'MA2 D2 graphical optimisation missing');
a=caseOf(ma,'Optimal mix with a single limiting factor and compulsory demand');
requires(a,['100 units','B 400 units','$9,600','$1,200']);
assert.equal(100*3+400*1.5,900);
assert.equal(100*24+400*18,9600);
assert.equal(600*18-9600,1200);
a=caseOf(ma,'Graphical linear programming with two scarce resources');
requires(a,['2a + b ≤ 100','3a + 4b ≤ 180','a = 44','b = 12','$1,608']);
assert.equal(2*44+12,100);assert.equal(3*44+4*12,180);
assert.equal(44*30+12*24,1608);
assert(1608>50*30&&1608>45*24);
a=caseOf(ma,'Special order with genuinely sacrificed contribution');
requires(a,['$900','$1,125','−$225']);
assert.equal(100*(35-26)-(100*1.5/2)*15,-225);
assert(!ma.workings.some(w=>w[0]==='Special order with opportunity cost'),
 'Spare-capacity example must not misleadingly claim nonzero opportunity cost');
console.log('PASS: 2026-27 FA2 D4 15 official outcomes, MA2 D2 six outcomes, added cases with independent cash, ledger, scarce-resource and LP arithmetic.');
