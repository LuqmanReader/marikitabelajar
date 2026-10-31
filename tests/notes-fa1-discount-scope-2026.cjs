#!/usr/bin/env node
'use strict';
/* FA1 examiner-informed treatment checks, not full chapter certification. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('textbook-fa1-part-a.js','utf8'),ctx,{filename:'textbook-fa1-part-a.js'});
const lesson=ctx.LedgerTextbookFA1A['FA1:A1'];
assert(lesson);
const main=lesson.sections.flat().join(' ');
const discount=lesson.workings.find(x=>x[0]==='Trade versus settlement discount');
const purchase=lesson.workings.find(x=>x[0]==='Early settlement discount received on a credit purchase');
assert(discount&&purchase,'Both sales and purchases prompt-payment discount cases are required');
assert(main.includes('expected to take the conditional settlement discount'));
assert(!main.includes('For income recognition under IFRS Accounting Standards'),'Do not teach named IFRS standards as FA1 prerequisites');
const sale=discount[2],buy=purchase[2];
for(const part of ['Dr trade receivables $1,764','Cr sales $1,764','Dr receivables $1,800','Cr sales $1,800','Dr bank $1,764','Cr receivables $1,800'])
 assert(sale.includes(part),'Missing sales transaction side: '+part);
for(const part of ['Dr purchases $400','Cr trade payables $400','Dr trade payables $400','Cr bank $396','Cr discounts received $4'])
 assert(buy.includes(part),'Missing settlement receipt journal side: '+part);
assert.equal(400*0.01,4);
assert.equal(400-4,396);
assert.equal(2000*.9*.98,1764);
const page=fs.readFileSync('notes-page.js','utf8');
assert(!page.includes('VERIFIED REFERENCE: ACCA 2025–26'),'Misleading prior-edition verified badge returned');
assert(page.includes('OLDER-EDITION SOURCE · CHECK CURRENT 2026–27 SYLLABUS'));
console.log('PASS: FA1 discount journal cases checked against arithmetic and published treatment; no claim of full academic signoff.');
