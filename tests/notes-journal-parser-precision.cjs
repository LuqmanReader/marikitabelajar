#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const report=JSON.parse(fs.readFileSync('audit/all700-journal-balance-ci.json','utf8'));
assert.equal(report.lessons,700);
assert(report.checkedGroups>=196,'Loss of explicit journal groups after corrected parser');
assert.equal(report.reviewFlags,0,'Any unbalanced journal must fail');
assert.equal(report.ambiguousGroups,0,'Known journal commentary should not be mistaken for an unparseable posting');
assert(report.alternativeAccountGroups>=1,'Alternative acceptable account treatment must be disclosed');
const keys=['FA1:A1','FA2:A2','FFA:D4','FA:D4'];
for(const key of keys){
 assert(report.checks.some(x=>x.key===key&&x.status==='BALANCED'),
  'Known accounting posting cannot be recomputed: '+key);
}
assert(report.alternativePresentations.every(x=>x.reason.includes('substantive review')),
 'Alternative account treatments must not be certified solely by debit-credit balancing');
console.log('PASS: all 4 former journal parse exceptions resolved; alternative treatment disclosed, no arithmetic imbalances.');
