#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=name=>JSON.parse(fs.readFileSync('audit/'+name,'utf8'));
const a=read('all700-academic-outcome-review-ci.json');
const b=read('all700-technical-worked-answer-review-ci.json');
const live=read('all700-live-lessons-ci.json');
const mapping=read('all700-outcome-crosswalk-ci.json');
const arithmetic=read('all700-arithmetic-evidence-ci.json');
const journals=read('all700-journal-balance-ci.json');
assert.equal(a.rows.length,mapping.totalRows,'Entire syllabus learning-outcome crosswalk must be included');
assert.equal(b.rows.length,live.rows.reduce((n,r)=>n+r.worked.length,0),'Every published worked case must be included');
assert.equal(new Set(a.rows.map(x=>x.id)).size,a.rows.length);
assert.equal(new Set(b.rows.map(x=>x.id)).size,b.rows.length);
const byKey=new Map(live.rows.map(x=>[x.key,x]));
for(const o of a.rows){
 const l=byKey.get(o.topic);assert(l,'Unknown syllabus lesson');
 assert.equal(o.lessonHash,l.contentSha256,'Stale outcome review '+o.id);
 assert.equal(o.academicReview,'NOT_VERIFIED','Cannot approve heuristic outcome matches');
 assert(o.officialUrl.startsWith('https://www.accaglobal.com/')&&o.officialPage>0,'Official source missing');
 for(const s of o.teachingEvidence)assert(s.section>0&&s.section<=l.sections.length);
 for(const w of o.applicationEvidence)assert(w.caseIndex>0&&w.caseIndex<=l.worked.length);
}
for(const c of b.rows){
 const l=byKey.get(c.topic);assert(l,'Unknown worked lesson');
 assert.equal(c.lessonHash,l.contentSha256,'Stale case review '+c.id);
 assert(c.caseIndex>0&&c.caseIndex<=l.worked.length);
 assert.equal(c.fullTechnicalReview,'NOT_VERIFIED');
 assert.equal(c.fullAnswerReview,'NOT_VERIFIED');
 assert(c.remainingChecks.length>=3);
}
assert.equal(a.summary.independentAcademicSignoffs,0);
assert.equal(b.summary.independentAnswerSignoffs,0);
assert.equal(b.summary.formulasIndependentlyRecomputed,arithmetic.equationsRecomputed);
assert.equal(b.summary.numericallyBalancedJournals,journals.balanced);
assert.equal(b.summary.ambiguousJournalGroups,journals.ambiguousGroups);
for(const filename of ['all700-academic-outcome-review-ci.csv','all700-technical-worked-answer-review-ci.csv']){
 assert(fs.statSync('audit/'+filename).size>1000,filename+' missing');
}
console.log('PASS: all '+a.rows.length+' outcome entries and '+b.rows.length+
 ' worked answers have current evidence records, '+arithmetic.equationsRecomputed+
 ' extractable arithmetic checks, '+journals.balanced+
 ' journal balances; no automatic academic signoffs.');
