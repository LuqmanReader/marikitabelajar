#!/usr/bin/env node
'use strict';
/* Whole-library QA preflight, not academic certification.
 * Run AFTER scripts/export-all700-live-lessons.cjs.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const report=JSON.parse(fs.readFileSync('audit/all700-live-lessons-ci.json','utf8'));
const matrix=JSON.parse(fs.readFileSync('audit/notes-2026-27-review-matrix.json','utf8'));
assert.equal(report.count,700);
assert.equal(matrix.count,700);
const byKey=new Map(matrix.chapters.map(ch=>[ch.topicKey,ch]));
const words=s=>(String(s||'').match(/[\p{L}\p{N}]+/gu)||[]).length;
const findings=[],perPaper={},math=[];
const add=(key,code,detail)=>findings.push({key,code,detail});
for(const ch of report.rows){
 const m=byKey.get(ch.key);assert(m,'Not indexed '+ch.key);
 const paper=perPaper[ch.paper]??={topics:0,worked:0,findings:0,percentMathPass:0,percentMathReview:0};
 paper.topics++;paper.worked+=ch.workedCount;
 if(!ch.officialSource?.startsWith('https://www.accaglobal.com/'))add(ch.key,'NON_OFFICIAL_SYLLABUS_REFERENCE',ch.officialSource);
 if(ch.sectionCount<3)add(ch.key,'FEW_TEACHING_SECTIONS',String(ch.sectionCount));
 if(ch.workedCount<2)add(ch.key,'ONE_OR_ZERO_WORKED_CASES',String(ch.workedCount));
 if(ch.sections.some(section=>words(section[1])<35))add(ch.key,'SHORT_EXPLANATION','At least one section under 35 words');
 if(ch.worked.some(w=>words(w[2])<25))add(ch.key,'SHORT_SOLUTION','At least one solution under 25 words');
 if(ch.sourceDefinitions.length>1)add(ch.key,'DUPLICATE_SOURCE','Live source: '+JSON.stringify(ch.liveSource));
 if(!ch.liveSource?.file)add(ch.key,'SOURCE_PROVENANCE_MISSING','Cannot establish winning source file');
 const allText=JSON.stringify({sections:ch.sections,workings:ch.worked});
 if(/\blorem ipsum\b|further teaching required|\bIndonesia\b|\bRM\s*[0-9]/i.test(allText))add(ch.key,'CONTENT_REVIEW_FLAG','Possible placeholder, geography, or inconsistent currency');
 if(m.fullOutcomeCoverageStatus!=='NOT_VERIFIED' || m.technicalReview!=='PENDING' ||
    m.numericalAnswerReview!=='PENDING' || m.languageAndVisualReview!=='PENDING'){
  // An approved claim must be accompanied by individually reviewable, outcome-level evidence.
  assert(m.independentReviewer&&m.evidenceUrl&&Array.isArray(m.outcomeEvidence)&&m.outcomeEvidence.length>0&&
   Array.isArray(m.workedAnswerEvidence)&&m.workedAnswerEvidence.length===ch.workedCount&&
   m.verifiedContentSha256===ch.contentSha256,
   'Academic status changed without full evidence or current content hash: '+ch.key);
 }
 // Only check unambiguous, directly printed "$ amount × rate% = $ amount" identities.
 const pattern=/\$\s*([\d,]+(?:\.\d+)?)\s*[×*]\s*(\d+(?:\.\d+)?)\s*%\s*=\s*\$\s*([\d,]+(?:\.\d+)?)/g;
 for(const match of allText.matchAll(pattern)){
  const amount=Number(match[1].replaceAll(',',''));
  const rate=Number(match[2]);
  const printed=Number(match[3].replaceAll(',',''));
  const expected=amount*rate/100;
  const ok=Math.abs(expected-printed)<=0.011;
  math.push({key:ch.key,expression:match[0],expected,printed,pass:ok});
  if(ok)paper.percentMathPass++;
  else {paper.percentMathReview++;add(ch.key,'PERCENT_ARITHMETIC_MISMATCH',match[0]+' expected '+expected);}
 }
}
for(const f of findings)perPaper[f.key.split(':')[0]].findings++;
const summary={generatedAt:new Date().toISOString(),scope:'Whole 700 published chapters: metadata, lesson-depth and extractable percentage arithmetic only; NOT outcome-by-outcome academic verification',indexed:report.count,workedCases:report.rows.reduce((n,r)=>n+r.workedCount,0),signedOff:matrix.chapters.filter(m=>m.fullOutcomeCoverageStatus!=='NOT_VERIFIED').length,mathChecks:math.length,mathPass:math.filter(m=>m.pass).length,mathReview:math.filter(m=>!m.pass).length,totalFlags:findings.length,flagsByType:findings.reduce((a,f)=>(a[f.code]=(a[f.code]||0)+1,a),{}),perPaper,duplicateSources:report.duplicates,findings,math};
fs.writeFileSync('audit/all700-quality-preflight-ci.json',JSON.stringify(summary,null,2)+'\n');
const markdown=['# LedgerPeer all-700 quality preflight','',
 'This is a reproducible review queue, **not a claim of 2026–27 academic certification**.','',
 'Chapters: '+summary.indexed+'; worked cases: '+summary.workedCases+'; reviewed percentage equations: '+summary.mathChecks+'; mismatches to investigate: '+summary.mathReview+'.',
 '## Flags',...Object.entries(summary.flagsByType).map(([k,v])=>'- '+k+': '+v),
 '','## Paper-level screening',...Object.entries(perPaper).map(([p,v])=>'- '+p+': '+v.topics+' topics / '+v.worked+' worked cases / '+v.findings+' flags'),
 '','## Outstanding','Every official a/b/c learning outcome and examination level must be independently mapped and every answer, journal, law/tax standard, assumption and visual checked. Number of flags is not number of errors. The lesson-level JSON includes live hashes, definitions and exact sources.',''];
fs.writeFileSync('audit/all700-quality-preflight-ci.md',markdown.join('\n'));
console.log(JSON.stringify({indexed:summary.indexed,workedCases:summary.workedCases,mathChecks:summary.mathChecks,mathPass:summary.mathPass,mathReview:summary.mathReview,totalFlags:summary.totalFlags,flagsByType:summary.flagsByType}));
assert.equal(report.rows.length,700);
assert.equal(new Set(report.rows.map(r=>r.key)).size,700);
if(summary.mathReview)console.warn('WARNING: arithmetic expressions require manual correction; see audit artifact');
