'use strict';
/* Validate that 700-topic editorial evidence is complete, honest and traceable.
   Presence/consistency checks do not certify academic correctness. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const idx=JSON.parse(fs.readFileSync('audit/authored-chapter-index.json','utf8'));
const m=JSON.parse(fs.readFileSync('audit/notes-2026-27-review-matrix.json','utf8'));
assert.equal(m.count,700);
assert.equal(m.chapters.length,700);
assert.equal(m.authoringCoverage,700);
assert.equal(m.fullOutcomeSignOff,0,'Never claim certification without evidence');
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
 assert(ch.fullOutcomeCoverageStatus==='NOT_VERIFIED','Unsubstantiated outcome approval: '+ch.topicKey);
 assert(ch.numericalAnswerReview==='PENDING','Unsubstantiated numerical approval: '+ch.topicKey);
 assert(ch.technicalReview==='PENDING','Unsubstantiated technical approval: '+ch.topicKey);
 assert(ch.languageAndVisualReview==='PENDING','Unsubstantiated visual approval: '+ch.topicKey);
 assert(ch.independentReviewer===null,'Reviewer assigned without source evidence: '+ch.topicKey);
 assert(ch.evidenceUrl===null,'Evidence URL recorded while review remains pending: '+ch.topicKey);
 assert(ch.syllabusUrl?.startsWith('https://www.accaglobal.com/'),'Non-official syllabus link: '+ch.topicKey);
 const files=references.get(ch.topicKey)||[];
 assert(files.length>0,'Authored source not indexed: '+ch.topicKey);
 assert.deepEqual([...ch.authoredFiles].sort(),[...files].sort(),'Source index disagreement: '+ch.topicKey);
}
assert.equal(keyset.size,700);
assert.equal(references.size,700);
console.log('PASS: 700 indexed lessons, 97 source files, 700 consistent review records; 0 unjustified technical/ACCA approvals.');
