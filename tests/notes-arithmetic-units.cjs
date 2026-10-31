#!/usr/bin/env node
'use strict';
/* Regression for financial scale suffixes in the complete live arithmetic audit. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const audit=JSON.parse(fs.readFileSync('audit/all700-arithmetic-evidence-ci.json','utf8'));
assert.equal(audit.totalTopics,700);
const example=audit.individualChecks.find(x=>x.chapter==='FM:F1'&&x.caseTitle==='Earnings multiple'&&
 x.expression.includes('200,000'));
assert(example,'FM F1 earnings multiple was not extracted from published teaching');
assert.equal(example.status,'ARITHMETIC_IDENTITY_RECHECKED','Million-unit earnings multiple flagged incorrectly');
assert(Math.abs(example.calculated-1200000)<.001,'6 x $200,000 should equal 1.2 million');
assert(/1\.2m\b/i.test(example.reported),'Original display unit not captured');
console.log('PASS: 700-topic arithmetic output recognises FM:F1 $1.2m result as $1,200,000.');
