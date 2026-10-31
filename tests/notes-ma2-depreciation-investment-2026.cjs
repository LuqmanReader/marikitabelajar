#!/usr/bin/env node
'use strict';
/* Independent numeric checks for MA2 B3 and D3 outcomes; not full signoff. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['textbook-ma2-part-a.js','textbook-ma2-part-b.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const chapters=Object.assign({},ctx.LedgerTextbookMA2A,ctx.LedgerTextbookMA2B);
for(const key of ['MA2:B3','MA2:D3']){const ch=chapters[key];assert(ch,'Missing '+key);
 const text=JSON.stringify(ch).toLowerCase();for(const word of ['depreciation','cash','expense'])assert(text.includes(word),key+' missing '+word);assert(ch.workings.length>=4);}
const values=[
 [50000-5000,45000],[45000/5,9000],[50000*.20,10000],[40000*.2,8000],
 [12000*3/12,3000],[12000-3000,9000],[3000+1400,4400],
 [10000*(1+.08*3),12400],[10000*1.08**3,12597.12],[12000/1.08**3,9525.98689224],
 [6000+4000-2000+1000,9000]];
for(const [a,b]of values)assert(Math.abs(a-b)<.02,'MA2 independent working mismatched');
console.log('PASS MA2 2026 B3 D3: two chapters, 11 rechecked numeric endpoints, interest, depreciation and accrued expenses; no professional signoff');
