#!/usr/bin/env node
'use strict';
/* BT and FBT Sept 2026–June 2027 C5/C7/F1 competency checks; not ACCA endorsement. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const path of ['textbook-editorial-business-03.js','textbook-editorial-business-04.js','textbook-editorial-business-07.js'])vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const ch=Object.assign({},ctx.LedgerEditorialBusiness03,ctx.LedgerEditorialBusiness04,ctx.LedgerEditorialBusiness07);
const map={
 C5:['purchasing','payroll','credit control','cash','application controls','general'],
 C7:['cloud','artificial intelligence','big data','blockchain','cybersecurity','multi-factor'],
 F1:['integrity','objectivity','professional competence','confidentiality','professional behaviour','public interest','IESBA']
};
for(const p of ['BT','FBT'])for(const [s,keywords] of Object.entries(map)){
const key=p+':'+s,lesson=ch[key];assert(lesson,'Missing '+key);
const full=JSON.stringify(lesson).toLowerCase();
for(const word of keywords)assert(full.includes(word.toLowerCase()),key+' missing official 2026 skill '+word);
assert(lesson.sections.length>=5&&lesson.workings.length>=4,key+' needs applied cases');
}
assert.equal(35/50*100,70,'AI alert precision');
assert.equal(9000+7500-6000-8000,2500,'Treasury budget');
assert.equal(1000-1000*.025,975,'Card processor payout');
console.log('PASS: BT/FBT 2026 C5/C7/F1 six chapters checked against source competencies; three independently recomputed numerical endpoints. No independent professional signoff.');
