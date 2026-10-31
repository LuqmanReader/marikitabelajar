#!/usr/bin/env node
'use strict';
/* Release of an academically VERIFIED library requires actual independently
 * evidenced approval of every current lesson. Dev CI can pass without it.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const matrix=JSON.parse(fs.readFileSync('audit/notes-2026-27-review-matrix.json','utf8'));
const authored=JSON.parse(fs.readFileSync('audit/all700-live-lessons-ci.json','utf8'));
const source=JSON.parse(fs.readFileSync('audit/all700-official-syllabus-evidence-ci.json','utf8'));
const numbers=JSON.parse(fs.readFileSync('audit/all700-arithmetic-evidence-ci.json','utf8'));
const proof=require('./notes-academic-proof-gate.cjs');
const sources=new Map(source.chapters.map(x=>[x.key,x]));
const worksheets=new Map(authored.rows.map(x=>[x.key,x]));
const maths=new Map(numbers.topics.map(x=>[x.key,x]));
const pdfs=new Map(source.sources.map(x=>[x.url,x]));
const failures=[];
for(const entry of matrix.chapters){
 const key=entry.topicKey,l=worksheets.get(key),s=sources.get(key),m=maths.get(key);
 if(entry.fullOutcomeCoverageStatus!=='VERIFIED'){
  failures.push({key,reason:'FULL_OUTCOME_ACADEMIC_REVIEW_PENDING'});continue;
 }
 if(!l||!s||!m){failures.push({key,reason:'MISSING_CURRENT_REVIEW_EVIDENCE'});continue}
 try{proof.validateSigned({entry,lesson:l,source:s,arithmetic:m,pdf:pdfs.get(s.officialPdf)})}
 catch(err){failures.push({key,reason:String(err.message||err).slice(0,250)})}
}
assert.equal(matrix.chapters.length,700,'700 full lesson records required');
const passed=700-failures.length;
const report={academicReleaseEligible:passed===700 && matrix.fullOutcomeSignOff===700,
 requiredVerifiedLessons:700,verifiedWithFullEvidence:passed,blockedLessons:failures.length,
 caution:'Only confirms signed, referenced evidence is structurally complete; does not imply ACCA endorsement.',
 failingLessons:failures};
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/all700-academic-release-eligibility.json',JSON.stringify(report,null,2)+'\n');
console.log('ACADEMIC_RELEASE_GATE '+JSON.stringify({eligible:report.academicReleaseEligible,
 approved:passed,blocked:failures.length}));
if(!report.academicReleaseEligible){
 console.error('BLOCKED: 700 independently signed current-edition academic reviews required before labeling this library VERIFIED.');
 process.exitCode=1;
}
