#!/usr/bin/env node
'use strict';
/* Complete authoring-to-2026/27 ACCA syllabus crosswalk for all 700 LedgerPeer chapters.
 * Exports outcome anchors (not copyrighted full text) and candidate teaching references.
 * A term match NEVER constitutes academic sign-off. Manual review must be independently recorded.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const live=read('audit/all700-live-lessons-ci.json');
const off=read('audit/all700-official-syllabus-evidence-ci.json');
const matrix=read('audit/notes-2026-27-review-matrix.json');
const internal=read('audit/academic-reviews/fr-b9-2026-27.json');
assert.equal(live.rows.length,700);
assert.equal(off.chapters.length,700);
assert.equal(matrix.chapters.length,700);
const m=new Map(live.rows.map(ch=>[ch.key,ch]));
const signed=new Map(matrix.chapters.map(ch=>[ch.topicKey,ch]));
const STOP=new Set(('a an and are as at be by can could describe discuss define demonstrate explain identify indicate outline state calculate prepare record assess evaluate determine how why what is the of to for from into on in their them through which where when with without include including includes using used use given this these those other different relevant importance significance factors necessary expected apply perform recognise recognize compare distinguish understand analyse analyze name list show present').split(' '));
const tokenise=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)&&!(/^\d+$/.test(w))).map(w=>
 w.length>=6&&w.endsWith('ies')?w.slice(0,-3)+'y':
 w.length>=6&&w.endsWith('ing')?w.slice(0,-3):
 w.length>=6&&w.endsWith('ed')?w.slice(0,-2):
 w.length>5&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w);
const uniq=values=>[...new Set(values)];
function score(anchor,title,body,question=''){
 const terms=new Set(tokenise(anchor)),heading=new Set(tokenise(title)),explain=new Set(tokenise(body)),prompt=new Set(tokenise(question));
 let points=0,hits=[];
 for(const term of terms){
  if(heading.has(term)){points+=4;hits.push(term)}
  else if(prompt.has(term)){points+=2;hits.push(term)}
  else if(explain.has(term)){points++;hits.push(term)}
 }
 return {points,terms:hits};
}
const reviewed=read('audit/academic-reviews/fa2-d4-ma2-d2-2026-27.json');
const byLetter=new Map((internal.outcomes||[]).map(o=>[o.letter,o]));
const curated=new Map(Object.entries(reviewed.records||{}).map(([key,rows])=>[key,new Map(rows.map(x=>[x.letter,x]))]));
const results=[];
for(const source of off.chapters){
 const ch=m.get(source.key),review=signed.get(source.key);
 assert(ch&&review,'Unindexed or missing live chapter '+source.key);
 assert.equal(source.lessonSha256,ch.contentSha256,'Stale official outcome extraction '+source.key);
 const outcomes=source.officialDetailedOutcomeCandidates.length?source.officialDetailedOutcomeCandidates:[{
  letter:'PRACTICAL',anchorWords:source.title.split(/\s+/),intellectualLevelTags:[],sha256:''
 }];
 for(const o of outcomes){
  const anchor=o.letter==='PRACTICAL'?source.title:o.anchorWords.join(' ');
  let sections=[],worked=[],method='AUTOMATED CANDIDATE ONLY';
  const override=source.key==='FR:B9'?byLetter.get(o.letter):curated.get(source.key)?.get(o.letter)||null;
  if(override){
   sections=override.sectionIndex.map(i=>({index:i+1,title:ch.sections[i]?.[0]}));
   worked=override.workedIndex.map(i=>({index:i+1,title:ch.worked[i]?.[0]}));
   assert(sections.every(x=>x.title)&&worked.every(x=>x.title),'Stale curated authoring crosswalk '+source.key);
   method='INTERNAL OUTCOME CROSSWALK — NOT SIGNED OFF';
  } else {
   sections=ch.sections.map((s,i)=>({index:i+1,title:s[0],...score(anchor,s[0],s[1])}))
     .filter(x=>x.points>0).sort((a,b)=>b.points-a.points).slice(0,2);
   worked=ch.worked.map((w,i)=>({index:i+1,title:w[0],...score(anchor,w[0],w[2],w[1])}))
     .filter(x=>x.points>0).sort((a,b)=>b.points-a.points).slice(0,2);
   if(o.letter==='PRACTICAL')method='PRACTICAL SKILL — DEMONSTRATION REQUIRED';
   else if(!sections.length&&!worked.length)method='NO AUTOMATED CANDIDATE';
   else if(!sections.length||!worked.length)method='PARTIAL AUTOMATED CANDIDATE';
  }
  results.push({
   id:source.key+':'+o.letter,paper:source.paper,topicKey:source.key,
   lessonTitle:source.title,outcomeType:o.letter==='PRACTICAL'?'PRACTICAL SKILL':
    o.letter==='main'?'DIRECT UNLETTERED REQUIREMENT':'LETTERED OUTCOME',
   outcomeLetter:o.letter,intellectualLevel:o.intellectualLevelTags||[],
   shortOfficialAnchor:anchor,officialSyllabusUrl:source.officialPdf,
   officialPdfPage:o.sourcePdfPage||source.officialTopicPdfPage,
   officialPageLink:source.officialPdf+'#page='+(o.sourcePdfPage||source.officialTopicPdfPage),
   sourceAnchorSha256:o.sha256||null,lessonSha256:ch.contentSha256,
   officialPdfSha256:source.pdfSha256,liveSourceFile:ch.liveSource?.file||null,
   suggestedSections:sections,suggestedWorkedCases:worked,
   matchedTerms:uniq([...sections,...worked].flatMap(x=>x.terms||[])),
   mappingMethod:method,officialSourceFlags:source.flags||[],
   academicReviewStatus:'NOT_VERIFIED',reviewer:null,reviewEvidence:null
  });
 }
}
assert.equal(results.length,off.totalOutcomeLetterCandidates+off.chapters.filter(ch=>!ch.officialDetailedOutcomeCandidates.length).length);
assert.equal(new Set(results.map(r=>r.id)).size,results.length,'Duplicate outcome IDs');
assert.equal(new Set(results.map(r=>r.topicKey)).size,700,'Not all 700 lessons mapped');
assert(results.every(r=>r.academicReviewStatus==='NOT_VERIFIED'),'Do not auto certify');
const counts=results.reduce((a,r)=>(a[r.mappingMethod]=(a[r.mappingMethod]||0)+1,a),{});
const output={generatedAt:new Date().toISOString(),edition:'ACCA 2026–27',lessons:700,
 totalRows:results.length,extractedOutcomes:off.totalOutcomeLetterCandidates,
 practicalSkillTopics:off.chapters.filter(x=>!x.officialDetailedOutcomeCandidates.length).length,
 verifiedAcademicSignoffs:0,counts,
 warning:'Only short source anchors and heuristic section/example links. Open original ACCA PDF page for full learning outcome. Academic signoff requires independent verification.',
 results};
fs.writeFileSync('audit/all700-outcome-crosswalk-ci.json',JSON.stringify(output,null,2)+'\n');
const header=['Outcome ID','Paper','Lesson key','Title','Outcome type','Letter','Intellectual level','Short source anchor','Official page link','Suggested sections','Suggested worked cases','Mapping method','Academic status','Lesson SHA-256','Official PDF SHA-256'];
const cell=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
const lines=[header.map(cell).join(',')];
for(const r of results){
 const row=[r.id,r.paper,r.topicKey,r.lessonTitle,r.outcomeType,r.outcomeLetter,
 r.intellectualLevel.join(';'),r.shortOfficialAnchor,r.officialPageLink,
 r.suggestedSections.map(x=>'S'+x.index+': '+x.title).join(' | '),
 r.suggestedWorkedCases.map(x=>'W'+x.index+': '+x.title).join(' | '),
 r.mappingMethod,r.academicReviewStatus,r.lessonSha256,r.officialPdfSha256];
 lines.push(row.map(cell).join(','));
}
fs.writeFileSync('audit/all700-outcome-crosswalk-ci.csv','\ufeff'+lines.join('\n')+'\n');
console.log('CROSSWALK_700 '+JSON.stringify({lessons:700,rows:results.length,
 outcomes:output.extractedOutcomes,practical:output.practicalSkillTopics,counts}));
