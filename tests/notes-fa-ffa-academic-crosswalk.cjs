#!/usr/bin/env node
'use strict';
/* Validate the 2026-27 FA/FFA academic evidence against actual lesson content. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const report=JSON.parse(fs.readFileSync('audit/fa-ffa-2026-27-internal-crosswalk.json','utf8'));
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const name of ['textbook-editorial-financial-01.js','textbook-editorial-financial-02.js'])vm.runInContext(fs.readFileSync(name,'utf8'),ctx,{filename:name});
const chapters=Object.assign({},ctx.LedgerEditorialFinancial01,ctx.LedgerEditorialFinancial02);
assert.equal(report.officialAccaApproval,false);assert.equal(report.independentProfessionalSignoff,false);
assert.equal(report.mappedDetailedOutcomePairs,86);assert.equal(report.checkedNumericalResults,58);
assert.equal(report.outcomes.length,86);assert.equal(report.numericalChecks.length,58);
const chaptersChecked=new Set();
for(const item of report.outcomes){
 const chapter=chapters[item.key];assert(chapter,'Missing chapter '+item.key);
 const section=chapter.sections.find(x=>x[0]===item.evidenceTitle);
 assert(section&&section[1].length===item.explanationCharCount,item.key+' '+item.outcome+' evidence changed');
 assert(item.status==='INTERNAL_EVIDENCE_MATCHED'&&item.externalPeerApproval===false);
 chaptersChecked.add(item.key);
}
for(const n of report.numericalChecks){
 const ch=chapters[n.key],w=ch?.workings?.[n.caseIndex-1];
 assert(w&&w[0]===n.caseName&&w[2].includes(n.displayText),n.key+' case changed');
 const expected=Number(n.displayText.replace(/[$,]/g,''));
 assert(Math.abs(expected-n.independentlyComputed)<0.006,n.key+' numeric evidence mismatch');
 assert(n.result==='FIGURE_CORROBORATED');
}
assert.equal(chaptersChecked.size,14);
console.log('PASS 14 FA/FFA chapters; 86 outcome evidence links; 58 numerical result rechecks; external review still pending.');
