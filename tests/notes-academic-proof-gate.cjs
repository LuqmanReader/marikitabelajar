#!/usr/bin/env node
'use strict';
/* Academic integrity sign-off gate for the 700 student-visible chapters.
 * No automatic "VERIFIED" statuses. Rejects forged or incomplete approval records.
 * Passing this gate proves evidence consistency, NOT academic truth or ACCA approval.
 */
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/i.test(v);
const hasText=(s,min=20)=>typeof s==='string'&&s.trim().length>=min;
function validateSigned({entry,lesson,source,arithmetic,pdf}){
 const key=entry.topicKey;
 assert.equal(entry.fullOutcomeCoverageStatus,'VERIFIED');
 for(const prop of ['numericalAnswerReview','technicalReview','languageAndVisualReview'])
  assert.equal(entry[prop],'VERIFIED',key+' '+prop+' must be explicitly VERIFIED');
 assert(hasText(entry.independentReviewer,5),key+' requires a named human reviewer');
 assert(hasText(entry.reviewerQualification,6),key+' requires reviewer qualification');
 assert(/^\d{4}-\d{2}-\d{2}T/.test(entry.reviewedAt||''),key+' reviewer timestamp missing');
 assert(/^https:\/\//.test(entry.evidenceUrl||''),key+' review evidence URL missing');
 assert(hasText(entry.reviewerDecision,20),key+' requires substantive reviewer judgement');
 assert.equal(entry.verifiedContentSha256,lesson.contentSha256,key+' signed content is stale');
 assert.equal(entry.verifiedOfficialPdfSha256,source.pdfSha256,key+' signed syllabus evidence is stale');
 assert(pdf?.fetched && pdf?.periodConfirmed && hex(pdf?.sha256),key+' official PDF not verified');
 assert.equal(pdf.sha256,source.pdfSha256,key+' source PDF changed');
 assert(source.officialTopicPdfPage>0,key+' official topic location not confirmed');
 assert(source.topicHeadingMatchScore>=.75,key+' weak syllabus heading mapping');
 assert(!source.flags?.some(f=>/UNAVAILABLE|NOT_RELIABLY|NOT_EXTRACTED/.test(f)),key+' official source issue unresolved');
 assert.equal(source.lessonSha256,lesson.contentSha256,key+' source screen not based on current teaching');
 assert.equal(arithmetic.arithmeticalMismatches,0,key+' arithmetic contradictions unresolved');
 assert.equal(arithmetic.workedCaseCount,lesson.workedCount,key+' worked-case count mismatch');
 assert(Array.isArray(entry.outcomeEvidence),key+' missing outcome evidence');
 const candidates=source.officialDetailedOutcomeCandidates||[];
 assert(candidates.length>0,key+' source outcomes not extractable');
 assert.equal(entry.outcomeEvidence.length,candidates.length,key+' not every official outcome individually reviewed');
 const byLetter=new Map();
 for(const proof of entry.outcomeEvidence){
  assert(proof&&typeof proof==='object',key+' malformed outcome proof');
  assert(!byLetter.has(proof.letter),key+' duplicate outcome approval '+proof.letter);
  byLetter.set(proof.letter,proof);
 }
 for(const outcome of candidates){
  const proof=byLetter.get(outcome.letter);
  assert(proof,key+' missing outcome '+outcome.letter);
  assert.equal(proof.sourceAnchorSha256,outcome.sha256,key+' official outcome wording changed');
  assert.equal(proof.sourcePdfPage,source.officialTopicPdfPage,key+' wrong source page');
  assert.equal(proof.intellectualLevelReviewed,true,key+' exam level not checked for '+outcome.letter);
  assert.equal(proof.verdict,'PASS',key+' outcome requires a PASS decision for '+outcome.letter);
  assert(hasText(proof.reasoning,80),key+' needs detailed independent academic reasoning for '+outcome.letter);
  assert(Array.isArray(proof.sectionReferences)&&proof.sectionReferences.length>0,key+' requires paragraph evidence for '+outcome.letter);
  for(const n of proof.sectionReferences){
   assert(Number.isInteger(n)&&n>=0&&n<lesson.sections.length,key+' section index not present');
  }
  assert(Array.isArray(proof.workedCaseReferences)&&proof.workedCaseReferences.length>0,key+' requires exam application evidence');
  for(const n of proof.workedCaseReferences)
   assert(Number.isInteger(n)&&n>=0&&n<lesson.worked.length,key+' referenced application not present');
 }
 assert(Array.isArray(entry.workedAnswerEvidence),key+' worked answers require independent review');
 assert.equal(entry.workedAnswerEvidence.length,lesson.workedCount,key+' some worked answers not reviewed');
 const cases=new Map();
 for(const r of entry.workedAnswerEvidence){
  assert(r&&Number.isInteger(r.caseIndex),key+' invalid worked-answer evidence');
  assert(!cases.has(r.caseIndex),key+' duplicate case proof');
  cases.set(r.caseIndex,r);
 }
 for(let i=0;i<lesson.worked.length;i++){
  const w=lesson.worked[i],proof=cases.get(i);
  assert(proof,key+' missing worked-case verification '+(i+1));
  assert.equal(proof.caseSha256,sha(w),key+' worked example changed after review');
  assert.equal(proof.arithmeticAndMethodVerified,true,key+' worked answer needs whole-method review');
  assert.equal(proof.journalsAndAssumptionsVerified,true,key+' accounting entries/assumptions not checked');
  assert.equal(proof.verdict,'PASS',key+' worked case unresolved');
  assert(hasText(proof.recomputedSteps,80),key+' requires independently recorded reasoning and workings');
 }
 assert(entry.visualEvidence&&entry.visualEvidence.verdict==='PASS'&&
  hasText(entry.visualEvidence.description,35),key+' browser visual review missing');
 assert(entry.jurisdictionEvidence&&entry.jurisdictionEvidence.verdict==='PASS'&&
  hasText(entry.jurisdictionEvidence.description,35),key+' law/standards and jurisdiction evidence missing');
 return true;
}
if(require.main===module){
 const read=f=>JSON.parse(fs.readFileSync('audit/'+f,'utf8'));
 const matrix=read('notes-2026-27-review-matrix.json');
 const chapters=read('all700-live-lessons-ci.json');
 const sources=read('all700-official-syllabus-evidence-ci.json');
 const maths=read('all700-arithmetic-evidence-ci.json');
 const map=xs=>new Map(xs.map(r=>[r.key,r]));
 const byLesson=map(chapters.rows),bySource=map(sources.chapters),byMath=map(maths.topics);
 const pdfs=new Map(sources.sources.map(p=>[p.url,p]));
 assert.equal(matrix.chapters.length,700);
 const verified=matrix.chapters.filter(ch=>ch.fullOutcomeCoverageStatus==='VERIFIED');
 for(const entry of verified){
  const lesson=byLesson.get(entry.topicKey),source=bySource.get(entry.topicKey);
  const arithmetic=byMath.get(entry.topicKey);
  assert(lesson&&source&&arithmetic,'Missing evidence for approved chapter '+entry.topicKey);
  validateSigned({entry,lesson,source,arithmetic,pdf:pdfs.get(source.officialPdf)});
 }
 assert.equal(matrix.fullOutcomeSignOff,verified.length);
 // Self-test the fail-closed logic even while no chapter is yet signed off.
 const forged={topicKey:'FA1:A1',fullOutcomeCoverageStatus:'VERIFIED',
   numericalAnswerReview:'VERIFIED',technicalReview:'VERIFIED',languageAndVisualReview:'VERIFIED',
   independentReviewer:'Fake reviewer',reviewerQualification:'Pretend accountant',
   reviewedAt:'2026-10-31T12:00:00Z',evidenceUrl:'https://example.test/review',
   reviewerDecision:'All lessons approved automatically'};
 const synthetic={key:'FA1:A1',contentSha256:'0'.repeat(64),sections:[['a','b']],worked:[['a','b','c']],workedCount:1};
 const fakeSource={pdfSha256:'1'.repeat(64),officialDetailedOutcomeCandidates:[{letter:'a',sha256:'abc'}],
   officialTopicPdfPage:8,topicHeadingMatchScore:1,lessonSha256:synthetic.contentSha256};
 const fakeMath={arithmeticalMismatches:0,workedCaseCount:1};
 assert.throws(()=>validateSigned({entry:forged,lesson:synthetic,source:fakeSource,arithmetic:fakeMath,pdf:{fetched:true,periodConfirmed:true,sha256:'1'.repeat(64)}}),
   /stale|missing|requires|not checked|verification|evidence|proof/i,'Incomplete academic signoff must fail');
 const valid={
  ...forged,
  reviewerDecision:'Reviewed all syllabus outcome requirements and documented every technical decision and result.',
  verifiedContentSha256:synthetic.contentSha256,
  verifiedOfficialPdfSha256:fakeSource.pdfSha256,
  outcomeEvidence:[{letter:'a',sourceAnchorSha256:'abc',sourcePdfPage:8,intellectualLevelReviewed:true,
   verdict:'PASS',reasoning:'I independently checked the complete stated outcome, its examination level and the explanation in this lesson against the official current-edition guide.',
   sectionReferences:[0],workedCaseReferences:[0]}],
  workedAnswerEvidence:[{caseIndex:0,caseSha256:sha(synthetic.worked[0]),arithmeticAndMethodVerified:true,
   journalsAndAssumptionsVerified:true,verdict:'PASS',
   recomputedSteps:'All inputs, assumptions, arithmetic transformations, account classifications and journal directions were independently recomputed and agreed with the actual case.'}],
  visualEvidence:{verdict:'PASS',description:'Examined the rendered desktop and mobile display for legibility, layout and accessibility.'},
  jurisdictionEvidence:{verdict:'PASS',description:'Exam period, applicable jurisdiction and relevant technical standards individually checked.'}
 };
 const context={entry:valid,lesson:synthetic,source:fakeSource,arithmetic:fakeMath,pdf:{fetched:true,periodConfirmed:true,sha256:'1'.repeat(64)}};
 assert.equal(validateSigned(context),true,'Fully completed synthetic approval fixture should validate');
 const tamper=(change,expected)=>{const altered=structuredClone(context);change(altered);
   assert.throws(()=>validateSigned(altered),expected);};
 tamper(x=>{x.entry.outcomeEvidence=[]},/not every official outcome/);
 tamper(x=>{x.entry.outcomeEvidence[0].verdict='PENDING'},/requires a PASS decision/);
 tamper(x=>{x.entry.workedAnswerEvidence[0].caseSha256='0'.repeat(64)},/worked example changed/);
 tamper(x=>{x.entry.workedAnswerEvidence[0].journalsAndAssumptionsVerified=false},/entries\/assumptions/);
 tamper(x=>{x.entry.visualEvidence.verdict='PENDING'},/visual review missing/);
 tamper(x=>{x.source.pdfSha256='0'.repeat(64)},/signed syllabus evidence is stale/);
 tamper(x=>{x.arithmetic.arithmeticalMismatches=1},/arithmetic contradictions unresolved/);
 console.log('PASS: '+matrix.chapters.length+' evidence records, '+verified.length+' signed chapters; fabricated approval rejected; complete synthetic proof accepted and seven tampered proofs rejected.');
}
module.exports={validateSigned};
