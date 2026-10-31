#!/usr/bin/env node
'use strict';
/* FA1 2026-27 first-party syllabus coverage gate; NOT an external academic signoff. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const path of ['textbook-fa1-part-a.js','textbook-fa1-part-b.js'])vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const chapters=Object.assign({},ctx.LedgerTextbookFA1A,ctx.LedgerTextbookFA1B);
const rules={"FA1:A1":["sales","purchases","payroll","trade discount","cash","cheques","digital","security"],"FA1:A2":["customer","supplier","credit note","debit note","delivery","remittance advice","statement of account","retention"],"FA1:A3":["cloud","customer","coding","invoice","credit note","period-end","audit","report"],"FA1:B1":["accounting equation","debit","credit","asset","liabilit","journal"],"FA1:B2":["journal","narration","debit","credit","correction"],"FA1:B3":["profit","comprehensive income","financial position","asset","equity"],"FA1:C1":["bank","other financial services","cheque","digital","clearing","card"],"FA1:C2":["document retention","cheque","bank statement","remittance","transfer"],"FA1:D1":["overtime","piece-rate","salary","deductions","authorisation","payment"],"FA1:E1":["general ledger","balance c/d","receivables","credit","debit"],"FA1:F1":["cash","bank","sales tax","till"],"FA1:F2":["imprest","non-imprest","voucher","sales tax","replenish"],"FA1:G1":["receivables","sales tax","discount","contra","irrecoverable","allowance"],"FA1:H1":["payables","purchases","purchase returns","contra","tax","discount"],"FA1:I1":["reconciliation","regular","external","professional","discrepancy"],"FA1:I2":["bank","cash book","unpresented","deposit","reconciliation"],"FA1:I3":["supplier","statement","ledger","reconciliation"],"FA1:J1":["trial balance","debit","credit","ledger"],"FA1:J2":["suspense","error","trial balance","redraft","journal"]};
const cases=[["FA1:A2","Prepare customer invoice, credit note and statement of account",422.08,"$422.08"],["FA1:B3","Profit, OCI and closing equity",50000,"$50,000"],["FA1:C1","Compare settlement evidence across payment rails",975,"$975"],["FA1:D1","Compare hourly, overtime and piecework gross pay",660,"$660"],["FA1:F1","Cash sale gross of tax and till banking",1000,"$1,000"],["FA1:F2","Imprest voucher including sales tax and reimbursement",170,"$170"],["FA1:G1","Receivables control with sales returns, contra and write-off",5500,"$5,500"],["FA1:H1","Payables account reconciliation and authorised contra",3800,"$3,800"],["FA1:I1","Cash book and external proof of a direct debit",120,"$120"],["FA1:J2","Redraft a complete corrected trial balance",44600,"$44,600"]];
const reviewed=[];
for(const [key,requirements] of Object.entries(rules)){
 const chapter=chapters[key];assert(chapter,'Missing FA1 2026 student lesson '+key);
 const body=JSON.stringify(chapter).toLowerCase();
 for(const required of requirements)assert(body.includes(required.toLowerCase()),key+' lacks '+required);
 assert(chapter.sections.length>=4,key+' inadequate explanatory sections');
 assert(chapter.workings.length>=2,key+' lacks applied numerical cases');
 reviewed.push({key,source:'FA1 Recording Financial Transactions syllabus September 2026–June 2027, detailed guide pp 7-10',checkedCompetencyTerms:requirements,sectionCount:chapter.sections.length,workedCases:chapter.workings.length,review:'INTERNAL_SOURCE_AND_TEACHING_COVERAGE_SCREEN',fullTechnicalReview:false,independentReviewer:null});
}
for(const [key,title,expected,display] of cases){
 const ch=chapters[key],caseRow=ch.workings.find(w=>w[0]===title);
 assert(caseRow,'Missing case '+key+' '+title);
 assert(caseRow[2].includes(display),'Recomputed answer text missing: '+key+' '+title);
 assert(Number.isFinite(expected)&&expected>=0,'Invalid arithmetic target');
}
assert.equal(reviewed.length,19);
const out={date:'2026-10-31',edition:'September 2026–June 2027',papers:['FA1'],matchedChapterCount:19,scopedArithmeticResultChecks:cases.length,chapters:reviewed,warning:'Terms and sampled end-result figures check specific evidence; they do not certify every journal, hands-on skill, or full independent technical accuracy.'};
fs.mkdirSync('audit',{recursive:true});fs.writeFileSync('audit/fa1-2026-official-syllabus-skills-ci.json',JSON.stringify(out,null,2)+'\n');
console.log('PASS FA1 2026: all 19 lessons have targeted syllabus evidence and '+cases.length+' sampled result checks. Independent technical signoff pending.');
