#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={};c.window=c;c.globalThis=c;vm.createContext(c);
vm.runInContext(fs.readFileSync('textbook-editorial-fr-2026-a.js','utf8'),c,{filename:'textbook-editorial-fr-2026-a.js'});
const ch=c.LedgerEditorialFR2026A?.['FR:B9'];
assert(ch&&Array.isArray(ch.sections)&&Array.isArray(ch.workings),'FR:B9 live authored chapter missing');
assert.equal(ch.title,'Reporting financial and non-financial performance');
const s=ch.sections.find(x=>/IFRS S1/i.test(x[0]));
assert(s,'FR B9(f) needs dedicated IFRS S1 teaching');
const text=s.join(' ').toLowerCase();
for(const term of ['objective','scope','governance','strategy','risk management','metrics and targets','cash flows','financ']){
 assert(text.includes(term),'Missing FR B9(f) IFRS S1 concept '+term);
}
assert(/level 1/i.test(text),'IFRS S1 exam-intellectual-level boundary must be explicit');
assert(ch.workings.some(w=>/IFRS S1/i.test(w[0])&&/governance/i.test(w[2])&&/metrics and targets/i.test(w[2])),
 'FR B9(f) needs a scenario demonstrating the standard');
const html=fs.readFileSync('notes.html','utf8');
assert(html.includes('textbook-editorial-fr-2026-a.js?v=20261031frs1v2'),
 'Corrected IFRS S1 chapter is not guaranteed to reload');
console.log('PASS: current FR B9(f) IFRS S1 core-content and worked case exist in published source; NOT independent academic signoff.');
