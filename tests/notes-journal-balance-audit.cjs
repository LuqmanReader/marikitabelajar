#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const report=JSON.parse(fs.readFileSync('audit/all700-journal-balance-ci.json','utf8'));
assert.equal(report.lessons,700);
assert(report.checkedGroups>=100,'Too few debit-credit journal groups were extracted; inspect parsing regression');
assert.equal(report.balanced+report.reviewFlags,report.checkedGroups);
assert(Array.isArray(report.unparsed));
assert.equal(report.reviewFlags,0,'Possible unbalanced journal entries must block clean math result');
assert.equal(report.academicSignoffs,0,'Journal balance check is NOT full academic verification');
console.log('PASS: '+report.checkedGroups+' journal groups independently recalculated; '+
 report.balanced+' numerically balanced, '+report.ambiguousGroups+
 ' ambiguous for manual review, no academic signoffs claimed.');
