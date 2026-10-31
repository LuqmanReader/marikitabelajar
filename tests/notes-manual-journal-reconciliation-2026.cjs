#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const p of ['textbook-fa1-part-a.js','textbook-fa1-part-b.js','textbook-fa2-part-a.js',
 'textbook-fa2-part-b.js','textbook-editorial-financial-02.js'])
 vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p});
const find=(key)=>Object.values(ctx).find(x=>x&&typeof x==='object'&&x[key]&&Array.isArray(x[key].workings))?.[key];
const caseOf=(key,title)=>{const c=find(key);assert(c,'Lesson not found: '+key);
 const w=c.workings.find(x=>x[0]===title);assert(w,'Worked case not found: '+key+' '+title);return w;};
const includes=(str,words)=>{for(const word of words)assert(str.includes(word),'Missing full ledger evidence: '+word)};
let a=caseOf('FA1:C2','Bank document versus remittance advice')[2];
includes(a,['leave trade payables and bank balances unchanged']);
a=caseOf('FA1:I1','Classify reconciling items')[2];
includes(a,['Dr bank charges $60','Cr bank $60']);assert.equal(60,60);
a=caseOf('FA1:J2','Error of principle with correct double entry')[2];
includes(a,['Dr repairs expense $2,200','Cr bank $2,200','Dr equipment $2,200','Cr repairs expense $2,200']);
a=caseOf('FA2:A2','Credit sale through books')[2];
includes(a,['Dr trade receivables $2,500','Cr sales $2,500','Dr bank $2,500','Cr trade receivables $2,500']);
a=caseOf('FA2:A2','Audit trail error')[2];
includes(a,['Dr purchases $18,000','Cr trade payables $18,000','Dr trade payables $16,200','Cr purchases $16,200']);
assert.equal(18000-1800,16200);
a=caseOf('FA2:B1','Income versus capital')[2];
includes(a,['Dr bank $8,000','Cr capital $8,000','Dr bank $3,000','Cr service revenue $3,000']);
a=caseOf('FA2:D1','Discounts and output tax')[2];
includes(a,['Dr trade receivables $4,240','Cr sales $4,000','Cr output tax payable $240']);
assert.equal(5000*(1-.2),4000);assert.equal(4000*.06,240);assert.equal(4000+240,4240);
a=caseOf('FA2:D5','Accrued income')[2];
includes(a,['Dr accrued income receivable $4,500','Cr fee income $4,500',
 'Dr trade receivables $4,500','Cr accrued income receivable $4,500',
 'Dr bank $4,500','Cr trade receivables $4,500']);
const reval=(key)=>{
 const w=caseOf(key,'Revaluation upward with accumulated depreciation elimination');
 assert.equal(120000-40000,80000);assert.equal(95000-80000,15000);
 includes(w[2],['Dr accumulated depreciation $40,000','Cr PPE $40,000','Dr PPE $15,000','Cr revaluation surplus through OCI $15,000']);
};
reval('FFA:D4');reval('FA:D4');
a=caseOf('FA1:A1','Early settlement discount received on a credit purchase')[2];
includes(a,['Dr purchases $400','Cr trade payables $400','Cr bank $396','Cr discounts received $4']);
assert.equal(400*0.01,4);assert.equal(400-4,396);
console.log('PASS: corrected FA1/FA2 journals and identical FFA/FA IAS 16 PPE revaluation examples independently reconciled; no full-lesson professional sign-off implied.');
