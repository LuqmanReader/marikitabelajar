#!/usr/bin/env node
'use strict';
/* Cross-reconcile the four independently produced sources of evidence.
 * This is a FAIL-CLOSED review docket, NEVER an automatic academic approval.
 */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const read=name=>JSON.parse(fs.readFileSync(path.join('audit',name),'utf8'));
const chapters=read('all700-live-lessons-ci.json');
const screening=read('all700-quality-preflight-ci.json');
const arithmetic=read('all700-arithmetic-evidence-ci.json');
const official=read('all700-official-syllabus-evidence-ci.json');
const matrix=read('notes-2026-27-review-matrix.json');
const unique=(rows,key)=>{const m=new Map();for(const r of rows){assert(!m.has(r[key]),'Duplicate '+key+' '+r[key]);m.set(r[key],r)}return m};
assert.equal(chapters.count,700,'700 published lessons required');
assert.equal(arithmetic.totalTopics,700,'All 700 arithmetic reviews required');
assert.equal(official.totalChapters,700,'All 700 official source reviews required');
assert.equal(matrix.count,700);
assert.equal(screening.indexed,700);
const bySource=unique(official.chapters,'key');
const byMath=unique(arithmetic.topics,'key');
const byMatrix=unique(matrix.chapters,'topicKey');
assert.equal(bySource.size,700);assert.equal(byMath.size,700);assert.equal(byMatrix.size,700);
const pdfs=new Map();
for(const source of official.sources){
 assert(!pdfs.has(source.url),'Duplicate PDF source '+source.url);
 pdfs.set(source.url,source);
}
assert.equal(pdfs.size,22,'Expected 22 unique official syllabus references');
const riskOrder={OFFICIAL_SOURCE_INVALID:0,OFFICIAL_HEADING_UNMATCHED:1,OUTCOME_EXTRACTION_UNCERTAIN:2,ARITHMETIC_REVIEW_REQUIRED:3,CONTENT_REVIEW_REQUIRED:4,DETAILED_OUTCOME_REVIEW_REQUIRED:5};
const risksByTopic=new Map();
for(const flag of screening.findings){const arr=risksByTopic.get(flag.key)||[];arr.push(flag);risksByTopic.set(flag.key,arr)}
const results=[],counts={};
for(const lesson of chapters.rows){
 const key=lesson.key,source=bySource.get(key),math=byMath.get(key),entry=byMatrix.get(key);
 assert(source && math && entry,'Missing evidence source for '+key);
 assert.equal(source.lessonSha256,lesson.contentSha256,'Stale official-syllabus evidence for '+key);
 assert.equal(source.officialPdf,lesson.officialSource,'Official PDF mismatch for '+key);
 assert.equal(math.workedCaseCount,lesson.workedCount,'Worked-case count disagreement for '+key);
 assert.equal(lesson.key,entry.topicKey);
 const pdf=pdfs.get(lesson.officialSource);
 const risks=[];
 if(!pdf || !pdf.fetched || !pdf.periodConfirmed || !pdf.sha256 || source.pdfSha256!==pdf.sha256)
  risks.push('OFFICIAL_SOURCE_INVALID');
 if(!source.officialTopicPdfPage || !Number.isFinite(source.topicHeadingMatchScore) || source.topicHeadingMatchScore<.75)
  risks.push('OFFICIAL_HEADING_UNMATCHED');
 const outcomes=source.officialDetailedOutcomeCandidates||[];
 if(!outcomes.length || source.flags?.includes('DETAILED_OUTCOME_LETTERS_NOT_EXTRACTED'))
  risks.push('OUTCOME_EXTRACTION_UNCERTAIN');
 if(math.arithmeticalMismatches)risks.push('ARITHMETIC_REVIEW_REQUIRED');
 if((risksByTopic.get(key)||[]).length)risks.push('CONTENT_REVIEW_REQUIRED');
 risks.push('DETAILED_OUTCOME_REVIEW_REQUIRED');
 const competencyChecklist=outcomes.map(o=>({
  outcomeLetter:o.letter,sourcePdfPage:source.officialTopicPdfPage,
  sourceAnchorSha256:o.sha256,intellectualLevelTags:o.intellectualLevelTags||[],
  automatedTokenComparison:(source.outcomeTokenComparison||[]).find(x=>x.letter===o.letter)||null,
  academicJudgement:'NOT_REVIEWED',teachingEvidence:null,applicationEvidence:null,
  reviewer:null,reviewedAt:null
 }));
 const record={key,paper:lesson.paper,title:lesson.topicTitle,edition:lesson.edition,
  jurisdiction:lesson.jurisdiction,liveSource:lesson.liveSource,
  currentLessonSha256:lesson.contentSha256,
  sourceUrl:lesson.officialSource,sourcePdfSha256:pdf?.sha256||null,
  sourcePdfPage:source.officialTopicPdfPage,
  confidenceFlags:[...new Set([...risks,...(source.flags||[])])].sort((a,b)=>(riskOrder[a]??50)-(riskOrder[b]??50)),
  workedExamples:lesson.workedCount,automatedEquationsRecomputed:math.arithmeticalIdentitiesRechecked,
  automatedArithmeticFlags:math.arithmeticalMismatches,
  depthFlags:risksByTopic.get(key)||[],
  detailedOutcomes:competencyChecklist,
  requiredUnverifiedChecks:['all nested official syllabus requirements','all journal directions and assumptions',
  'all worked solution steps','examinable edition and jurisdiction','teaching depth and intellectual level',
  'full browser visual and accessibility review'],
  reviewVerdict:'ACADEMIC_REVIEW_REQUIRED',independentSignoff:false
 };
 results.push(record);
 for(const flag of record.confidenceFlags)counts[flag]=(counts[flag]||0)+1;
}
assert.equal(results.length,700);
const paper={};
for(const r of results){const q=paper[r.paper]??={chapters:0,candidateOutcomes:0,sourceIssues:0,arithmeticFlags:0,depthFlags:0};
 q.chapters++;q.candidateOutcomes+=r.detailedOutcomes.length;
 q.sourceIssues+=r.confidenceFlags.includes('OFFICIAL_SOURCE_INVALID')||r.confidenceFlags.includes('OFFICIAL_HEADING_UNMATCHED')?1:0;
 q.arithmeticFlags+=r.automatedArithmeticFlags;q.depthFlags+=r.depthFlags.length;
}
const report={
 generatedAt:new Date().toISOString(),
 method:'Cross-reconciled 700 published chapter content hashes against official ACCA PDF screening, arithmetic, structure and current review matrix',
 caution:'Candidate outcomes and machine-checked mathematics do NOT establish examination-level teaching accuracy or constitute independent certification.',
 chapters:700,sourcePdfs:pdfs.size,verifiedSourcePdfs:[...pdfs.values()].filter(x=>x.fetched&&x.periodConfirmed).length,
 candidateOutcomes:results.reduce((n,x)=>n+x.detailedOutcomes.length,0),
 signedOff:0,counts,paper,results
};
fs.writeFileSync('audit/all700-academic-docket-ci.json',JSON.stringify(report,null,2)+'\n');
const md=[
 '# All 700 live LedgerPeer lessons — academic evidence docket','',
 '**NOT ACADEMICALLY SIGNED OFF. This report does not approve a chapter just because an automated scan succeeds.**','',
 '- Chapters reconciled: '+report.chapters,
 '- Official referenced PDF editions validated: '+report.verifiedSourcePdfs+'/'+report.sourcePdfs,
 '- Candidate detailed outcomes extracted: '+report.candidateOutcomes,
 '- Academic sign-offs awarded by this script: **0**','',
 '## Source/answer quality flags',...Object.entries(counts).map(([k,v])=>'- '+k+': '+v),
 '','## Paper work queue','|Paper|Chapters|Candidate outcomes|Source issues|Arithmetic flags|Depth flags|',
 '|---|---:|---:|---:|---:|---:|',
 ...Object.entries(paper).map(([k,v])=>'|'+k+'|'+v.chapters+'|'+v.candidateOutcomes+'|'+v.sourceIssues+'|'+v.arithmeticFlags+'|'+v.depthFlags+'|'),
 '','## Required for any subsequent sign-off',
 'Compare every detailed ACCA a/b/c outcome and examination level to specific live chapter paragraphs and worked applications. Independently check every calculation, journal and technical standard, confirm legal period and variant, review visual output, and preserve reviewer evidence tied to the current lesson and official PDF hashes.',''
];
fs.writeFileSync('audit/all700-academic-docket-ci.md',md.join('\n'));
console.log('ACADEMIC_DOCKET '+JSON.stringify({chapters:report.chapters,sourcePdfs:report.sourcePdfs,validPdfs:report.verifiedSourcePdfs,candidateOutcomes:report.candidateOutcomes,signoffs:0,flags:counts}));
if(report.verifiedSourcePdfs!==22)throw Error('Incomplete official source validation: some PDFs failed to download or had the wrong examination period');
if(results.some(x=>x.confidenceFlags.includes('OFFICIAL_HEADING_UNMATCHED')))
 console.warn('Official topic ambiguities detected; see docket. No lessons are approved.');
