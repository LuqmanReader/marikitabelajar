#!/usr/bin/env node
'use strict';
/* Evidence-based first-party check: official MA/FMA 2026-27 B2 applied techniques. */
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const c={LedgerFiaNotes:{},LedgerPublishedSyllabi:{papers:{}}};c.window=c;c.globalThis=c;vm.createContext(c);
for(const file of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js','textbook-crossqual-batch4a.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file,timeout:12000});
const approximate=(actual,expected)=>assert(Math.abs(actual-expected)<.0001,'Wrong independent calculation '+actual+' should be '+expected);
for(const key of ['MA:B2','FMA:B2']){
 const ch=c.LedgerSupplementalTextbooksBatch4A[key];assert(ch);
 assert(ch.sections.length>=8&&ch.workings.length>=8,key+' syllabus outcomes not fully explained');
 const body=JSON.stringify(ch).toLowerCase();
 for(const term of ['linear','high–low','stepped','regression','correlation','coefficient of determination','scatter','moving average','seasonal','laspeyres','paasche','product lifecycle','inflation'])assert(body.includes(term),key+' missing '+term);
 for(const w of ch.workings)assert(w[1].length>=100&&w[2].length>=150,key+' inadequate worked application '+w[0]);
 const solution=(name)=>{const r=ch.workings.find(w=>w[0]===name);assert(r);return r[2];};
 assert(solution('High–low fixed and variable component').includes('$21,400'));
 assert(solution('High–low allowing for a stepped fixed cost').includes('$25,500'));
 assert(solution('Correlation and regression from three observations').includes('0.9643'));
 assert(solution('Moving-average calculation and trend interpretation').includes('180 units'));
 assert(solution('Additive versus multiplicative seasonal forecasts').includes('$230,000'));
 assert(solution('Laspeyres and Paasche price indices').includes('119.23'));
 assert(solution('Inflation-adjusted real expense comparison').includes('10.00%'));
}
approximate((24200-17800)/(5500-3900),4);
approximate(17800-3900*4,2200);
approximate(2200+4800*4,21400);
approximate((31000-20000)/(7000-4000),11/3);
approximate((20000-4000*11/3)+5500*11/3,25500);
approximate((3/Math.sqrt(2*(14/3))),0.981980506061966);
approximate(9/(2*(14/3)),27/28);
approximate(1/3+1.5*5,47/6);
approximate(190/160*100,118.75);
approximate(186/156*100,119.23076923076923);
approximate((150+180+210)/3,180);
approximate(132000/1.2,110000);
console.log('PASS: MA/FMA B2 official forecast-method coverage, eight applied cases each, regression and price indices independently checked. Full independent academic approval remains pending.');
