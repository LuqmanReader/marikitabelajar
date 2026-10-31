#!/usr/bin/env node
'use strict';
/* Academic content regression for full teaching, not keyword-only status approval. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={LedgerFiaNotes:{},LedgerPublishedSyllabi:{papers:{}}};c.window=c;c.globalThis=c;vm.createContext(c);
for(const p of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js','textbook-fa2-part-a.js','textbook-editorial-business-07.js','textbook-editorial-management-04.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:p,timeout:15000});
const sources=Object.assign({},c.LedgerTextbookFA2A,c.LedgerEditorialBusiness07,c.LedgerEditorialManagement04);
const checks={
 'FA2:D1':{sections:8,cases:6,terms:['taxable supplies','registration','late registration','penalties','tax authority','taxable net sales','settlement discount','output sales tax','input tax','cash-accounting']},
 'BT:F2':{sections:6,cases:5,terms:['iesba','ifac','acca','regulators','profession','accountant','reporting','whistleblowing','public-interest']},
 'FBT:F2':{sections:6,cases:5,terms:['iesba','ifac','acca','regulators','profession','accountant','reporting','whistleblowing','public-interest']},
 'FMA:F2':{sections:9,cases:7,terms:['balanced scorecard','financial','customer','internal','learning','economy','efficiency','effectiveness','capacity','activity','roi','residual income','tqm']},
 'MA:F2':{sections:9,cases:7,terms:['balanced scorecard','financial','customer','internal','learning','economy','efficiency','effectiveness','capacity','activity','roi','residual income','tqm']},
 'FMA:F3':{sections:5,cases:4,terms:['cost control','cost reduction','value analysis','customer','lifecycle']},
 'MA:F3':{sections:5,cases:4,terms:['cost control','cost reduction','value analysis','customer','lifecycle']}
};
for(const [key,rule] of Object.entries(checks)){
 const ch=sources[key];assert(ch,'Missing chapter '+key);
 assert(ch.sections.length>=rule.sections,key+' incomplete teaching panels');
 assert(ch.workings.length>=rule.cases,key+' insufficient worked applications');
 const body=JSON.stringify(ch).toLowerCase();
 for(const w of rule.terms)assert(body.includes(w),key+' missing required examinable detail '+w);
 for(const x of ch.workings)assert(x[1].length>70&&x[2].length>120,key+' truncated case '+x[0]);
}
const contains=(key,title,expected)=>{const chapter=sources[key],caseRow=chapter.workings.find(x=>x[0]===title);assert(caseRow&&caseRow[2].includes(expected),key+' missing '+expected+' in '+title);};
assert.equal(24000*.10-11000*.10,1300);
contains('FA2:D1','Sales-tax control ledger and return reconciliation','$1,300');
assert.equal(8000*.05,400);contains('FA2:D1','Settlement discount expected and actual amount','$400');
assert.equal(180000-900000*.12,72000);assert.equal(260000-1400000*.12,92000);
contains('MA:F2','ROI versus residual income divisional comparison','$72,000');
contains('FMA:F2','ROI versus residual income divisional comparison','$92,000');
assert.equal(900/1250,0.72);contains('FMA:F2','Labour efficiency, capacity and activity','72%');
assert.equal(120000-108000,12000);contains('FMA:F3','Compare cost control and real cost reduction','$12,000');
assert.equal(10000*12-(10000*9.80+6000+4000),12000);contains('MA:F3','Value-analysis functional alternative','$12,000');
assert.equal(75000-70000,5000);
console.log('PASS: seven 2026-27 outcomes-reconciled chapters and independent numeric assertions; no independent professional certification claimed.');
