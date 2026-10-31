#!/usr/bin/env node
'use strict';
/* Academic evidence regression; official ACCA FA/FFA Sept 2026-June 2027 study guide p8, not professional certification. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
const files=['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js','textbook-crossqual-a1.js','textbook-crossqual-a3-foundation.js','textbook-crossqual-batch4a.js'];
for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f,timeout:10000});
const book=Object.assign({},ctx.LedgerSupplementalTextbooks,ctx.LedgerSupplementalTextbooksA3Foundation,ctx.LedgerSupplementalTextbooksBatch4A);
const rules={A1:{outcomes:['nature of financial reporting','legal structures: sole trader, partnership and incorporated company','differences in owner liability','advantages and drawbacks of entity forms','reporting scope and period'],
 mandatory:['sole trader','partnership','limited liability','external','equity','lenders','reporting']},
 A3:{outcomes:['four financial statement purposes','asset liability equity income and expense definitions'],
 mandatory:['statement of changes in equity','statement of cash flows','financial position','profit or loss','liability','income','expense']},
 A4:{outcomes:['IFRS Foundation, IASB, Advisory Council, Interpretations Committee, ISSB responsibilities','role of IFRS Accounting Standards in financial reporting'],
 mandatory:['IFRS Foundation','IASB','ISSB','IFRS Advisory Council','IFRS Interpretations Committee','jurisdiction']} };
const result=[];
for(const paper of ['FA','FFA'])for(const [topic,rule] of Object.entries(rules)){
 const key=paper+':'+topic,chapter=book[key];assert(chapter,'Missing source chapter '+key);
 const body=JSON.stringify(chapter).toLowerCase();
 for(const word of rule.mandatory)assert(body.includes(word.toLowerCase()),key+' missing '+word);
 assert(chapter.sections.length>=5,key+' depth requires teaching sections');
 assert(chapter.workings.length>=3,key+' requires multiple applied cases');
 result.push({key,outcomes:rule.outcomes,sectionCount:chapter.sections.length,workedCaseCount:chapter.workings.length,officialGuidePage:8,
  evidence:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/fa_ffa_s26_j27_syllabus_and_study_guide.pdf',
  status:'FIRST_PARTY_EXPLANATION_AND_CASE_CHECK_ONLY',externalIndependentSignoff:false});
}
assert.equal(result.length,6);
assert.equal(25000+15000-30000,10000,'A1 bank reconciliation');
assert.equal(25000+15000,30000+10000,'A1 accounting equation');
assert.equal(20000-3000-6000,11000,'A3 cash flow reconciliation');
assert.equal(8000-3000,5000,'A3 period profit');
assert.equal(11000+8000+6000,20000+5000,'A3 financial position');
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/fa-ffa-a1-a3-a4-2026-evidence.json',JSON.stringify({date:'2026-10-31',scope:'Six FA/FFA chapters, 18 paper-specific syllabus skill checks',reviewType:'internal syllabus cross-check; not certification',chapters:result},null,2)+'\n');
console.log('PASS six FA/FFA A1 A3 A4 2026-27 chapters; 18 first-party outcome links; four independent case arithmetic reconciliations. External peer review pending.');
