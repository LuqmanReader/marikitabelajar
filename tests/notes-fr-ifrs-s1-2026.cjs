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
for(const [term,context] of [
 ['held for sale','IFRS 5 measurement'],['discontinued operation','IFRS 5 reporting'],
 ['prior-period error','IAS 8 restatement'],['estimate','IAS 8 changes'],
 ['bonus','IAS 33 bonus shares'],['rights','IAS 33 rights issues'],
 ['diluted','IAS 33 dilution'],['options','IAS 33 treasury-share method']
])assert(ch.sections.some(x=>x.join(' ').toLowerCase().includes(term)),context+' not taught');
const caseNames=ch.workings.map(x=>x[0]);
for(const caseName of ['IFRS 5 held-for-sale measurement and presentation',
 'IAS 8 change in estimate versus prior-period error',
 'Basic EPS, bonus issue and dilution',
 'Rights issue TERP and diluted options']){
 assert(caseNames.includes(caseName),'Missing applied scenario '+caseName);
}
const eps=ch.workings.find(w=>w[0]==='Basic EPS, bonus issue and dilution')[2];
assert(eps.includes('$1.60')&&eps.includes('$1.65'),'Bonus-adjusted and convertible diluted EPS must be recomputed');
assert.equal(300000/187500,1.6);
assert.equal(330000/200000,1.65);
const rights=ch.workings.find(w=>w[0]==='Rights issue TERP and diluted options')[2];
assert(rights.includes('$4.60')&&rights.includes('8,000'),'Rights bonus and treasury share dilution incorrectly presented');
assert.equal((4*5+3)/5,4.6);
assert(Math.abs(300000/(150000+8000)-1.898734)<0.000001);
const crosswalk=JSON.parse(fs.readFileSync('audit/academic-reviews/fr-b9-2026-27.json','utf8'));
assert.equal(crosswalk.topicKey,'FR:B9');
assert.equal(crosswalk.externalProfessionalSignoff,false,'Internal crosswalk cannot impersonate professional approval');
assert.deepEqual(crosswalk.outcomes.map(x=>x.letter),['a','b','c','d','e','f']);
for(const outcome of crosswalk.outcomes){
 assert([1,2,3].includes(outcome.level),'Missing documented intellectual level '+outcome.letter);
 for(const index of outcome.sectionIndex)
  assert(Number.isInteger(index)&&index>=0&&index<ch.sections.length,'Outcome '+outcome.letter+' lacks actual section index');
 for(const index of outcome.workedIndex)
  assert(Number.isInteger(index)&&index>=0&&index<ch.workings.length,'Outcome '+outcome.letter+' lacks worked-example mapping');
 assert(outcome.check.length>40,'Outcome requires a substantive mapped-requirement note');
}
const html=fs.readFileSync('notes.html','utf8');
assert(html.includes('textbook-editorial-fr-2026-a.js?v=20261031frB9completev3'),
 'Corrected IFRS S1 chapter is not guaranteed to reload');
console.log('PASS: current FR B9(f) IFRS S1 core-content and worked case exist in published source; NOT independent academic signoff.');
