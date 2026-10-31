'use strict';
/* Validate that 700-topic editorial evidence is complete, honest and traceable.
   Presence/consistency checks do not certify academic correctness. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const idx=JSON.parse(fs.readFileSync('audit/authored-chapter-index.json','utf8'));
const m=JSON.parse(fs.readFileSync('audit/notes-2026-27-review-matrix.json','utf8'));
assert.equal(m.count,700);
assert.equal(m.chapters.length,700);
assert.equal(m.authoringCoverage,700);
const signed=m.chapters.filter(ch=>ch.fullOutcomeCoverageStatus==='VERIFIED');
assert.equal(m.fullOutcomeSignOff,signed.length,'Claimed signoffs must equal individually evidenced approvals');
assert.equal(m.officialAccaCertification,false,'ACCA endorsement not granted');
assert.equal(m.independentTechnicalCertification,false,'Independent technical signoff not granted');
assert.equal(idx.authorCount,700);
assert.equal(idx.remainingDraftTopics.length,0);
assert.equal(idx.totalExpectedFiles,97);
assert.equal(idx.completed,97);
const keyset=new Set(),references=new Map();
for(const [filename,keys] of Object.entries(idx.files)){
 assert(fs.existsSync(filename),'Source listed in inventory but not in repository: '+filename);
 for(const key of keys){
  references.set(key,(references.get(key)||[]).concat(filename));
 }
}
for(const ch of m.chapters){
 assert(/^[A-Z0-9]+:[A-Z][0-9]+$/.test(ch.topicKey),'Invalid chapter key');
 assert(!keyset.has(ch.topicKey),'Duplicate chapter in review matrix '+ch.topicKey);
 keyset.add(ch.topicKey);
 assert(ch.topicKey.startsWith(ch.paper+':'),'Chapter assigned to wrong paper: '+ch.topicKey);
 assert(typeof ch.topicTitle==='string'&&ch.topicTitle.length>3,'Missing academic topic label');
 assert(ch.chapterPresent===true,'Chapter absent: '+ch.topicKey);
 assert(['NOT_VERIFIED','VERIFIED'].includes(ch.fullOutcomeCoverageStatus),'Unknown academic status: '+ch.topicKey);
 if(ch.fullOutcomeCoverageStatus==='NOT_VERIFIED'){
  assert(ch.numericalAnswerReview==='PENDING','Numerical check incorrectly marked complete: '+ch.topicKey);
  assert(ch.technicalReview==='PENDING','Technical check incorrectly marked complete: '+ch.topicKey);
  assert(ch.languageAndVisualReview==='PENDING','Visual check incorrectly marked complete: '+ch.topicKey);
  assert(ch.independentReviewer===null,'Reviewer assigned without signoff: '+ch.topicKey);
  assert(ch.evidenceUrl===null,'Evidence URL recorded but full outcome review pending: '+ch.topicKey);
 }else{
  assert(ch.numericalAnswerReview==='VERIFIED'&&ch.technicalReview==='VERIFIED'&&ch.languageAndVisualReview==='VERIFIED','All verification dimensions must pass: '+ch.topicKey);
  assert(typeof ch.independentReviewer==='string'&&ch.independentReviewer.trim(),'Named reviewer missing: '+ch.topicKey);
  assert(/^https?:\/\//.test(ch.evidenceUrl),'External review evidence missing: '+ch.topicKey);
  assert(typeof ch.verifiedContentSha256==='string'&&/^[a-f0-9]{64}$/.test(ch.verifiedContentSha256),'Content fingerprint missing: '+ch.topicKey);
  assert(Array.isArray(ch.outcomeEvidence)&&ch.outcomeEvidence.length>0,'Outcome-by-outcome evidence missing: '+ch.topicKey);
  assert(Array.isArray(ch.workedAnswerEvidence)&&ch.workedAnswerEvidence.length>0,'Worked-answer evidence missing: '+ch.topicKey);
 }
 assert(ch.syllabusUrl?.startsWith('https://www.accaglobal.com/'),'Non-official syllabus link: '+ch.topicKey);
 const files=references.get(ch.topicKey)||[];
 assert(files.length>0,'Authored source not indexed: '+ch.topicKey);
 assert.deepEqual([...ch.authoredFiles].sort(),[...files].sort(),'Source index disagreement: '+ch.topicKey);
}
assert.equal(keyset.size,700);
assert.equal(references.size,700);
console.log('PASS: 700 indexed lessons, 97 source files; '+signed.length+' evidence-backed internal reviews; no implied ACCA approval.');
