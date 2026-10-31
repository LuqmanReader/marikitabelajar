#!/usr/bin/env node
'use strict';
/* Evidence audit for EACH ACCA outcome and EACH published worked answer.
   Auto-evidence is partial; no result is promoted to academic certification. */
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const data=s=>JSON.parse(fs.readFileSync('audit/'+s,'utf8'));
const live=data('all700-live-lessons-ci.json'),cross=data('all700-outcome-crosswalk-ci.json');
const source=data('all700-official-syllabus-evidence-ci.json'),arith=data('all700-arithmetic-evidence-ci.json');
const journals=data('all700-journal-balance-ci.json'),matrix=data('notes-2026-27-review-matrix.json');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const mapped=(rows,field)=>new Map(rows.map(x=>[x[field],x]));
const lessons=mapped(live.rows,'key'),src=mapped(source.chapters,'key'),byReview=mapped(matrix.chapters,'topicKey');
const maths=new Map(),drcr=new Map(),unclear=new Map(),perTopic=new Map();
const push=(map,key,value)=>map.set(key,[...(map.get(key)||[]),value]);
for(const e of arith.individualChecks)push(maths,e.chapter+'#'+e.caseIndex,e);
for(const e of journals.checks)push(drcr,e.key+'#'+e.caseIndex,e);
for(const e of journals.unparsed)push(unclear,e.key+'#'+e.caseIndex,e);
for(const e of cross.results)push(perTopic,e.topicKey,e);
assert.equal(lessons.size,700);assert.equal(cross.results.length,cross.totalRows,'Official outcome review count drift');
assert(cross.totalRows>=2357,'Unexpected loss of 2026-27 outcome extraction coverage');
const stop=new Set('the and this that each which from with have when where your were under using these their into those what also after before explain describe identify calculate prepare apply assess account accounting financial'.split(' '));
const terms=s=>[...new Set((String(s).toLowerCase().match(/[a-z]{4,}/g)||[]).filter(w=>!stop.has(w)))];
const domain=s=>{
 const v=String(s);
 return [
  [/\b(?:IFRS|IAS|IFRIC|GAAP|sustainability)\b/i,'IFRS_STANDARDS'],
  [/\b(?:ISA|audit standards|assurance engagements?)\b/i,'AUDIT_STANDARDS'],
  [/\b(?:VAT|tax|Finance Act|allowance|corporation tax|capital gains|inheritance tax)\b/i,'TAX_DATE_JURISDICTION'],
  [/\b(?:Dr|Cr|debit|credit|receivables?|payables?|revenue|assets?|liabilit|expenses?)\b/i,'ACCOUNT_CLASSIFICATION'],
  [/\b(?:NPV|IRR|WACC|CAPM|margin|variance|amortis|depreciation|discount rate)\b/i,'MODEL_AND_METHOD'],
  [/\b(?:regulation|law|director|statute|ethics|governance)\b/i,'LEGAL_AND_ETHICS'],
  [/\b(?:20(?:25|26|27)|tax rate|effective|per annum|threshold)\b/i,'PERIOD_OR_RATE']
 ].filter(([re])=>re.test(v)).map(x=>x[1]);
};
const outcomeRows=[],caseRows=[],paperStats={};
for(const lesson of live.rows){
 const topic=lesson.key,official=src.get(topic),review=byReview.get(topic);
 assert(official&&review,'missing official/reviewer record '+topic);
 assert.equal(official.lessonSha256,lesson.contentSha256);
 const paper=paperStats[lesson.paper]??={lessons:0,outcomes:0,cases:0,withoutSection:0,withoutApplication:0,withoutEquation:0,formulas:0,balancedDrCr:0,ambiguousDrCr:0};
 paper.lessons++;
 const outcomes=perTopic.get(topic)||[];
 for(const o of outcomes){
  assert.equal(o.lessonSha256,lesson.contentSha256,'stale learning outcome '+o.id);
  assert.equal(o.officialPdfSha256,official.pdfSha256,'stale source '+o.id);
  const sections=o.suggestedSections.map(x=>({index:x.index,title:x.title,text:lesson.sections[x.index-1]?.[1]||''}));
  const applications=o.suggestedWorkedCases.map(x=>({index:x.index,title:x.title,prompt:lesson.worked[x.index-1]?.[1]||'',answer:lesson.worked[x.index-1]?.[2]||''}));
  assert(sections.every(s=>s.text)&&applications.every(a=>a.prompt&&a.answer),'stale pointers '+o.id);
  const excerpt=sections.map(s=>s.text).concat(applications.map(a=>a.answer)).join(' ');
  const subjectTerms=terms(o.shortOfficialAnchor),found=subjectTerms.filter(t=>new RegExp('\\b'+t+'\\b','i').test(excerpt));
  const flags=[...(o.officialSourceFlags||[])];
  if(!sections.length)flags.push('NO_CANDIDATE_TEACHING_SECTION');
  if(!applications.length)flags.push('NO_CANDIDATE_WORKED_APPLICATION');
  if(o.outcomeType==='PRACTICAL SKILL')flags.push('PRACTICAL_PLATFORM_ASSESSMENT_REQUIRED');
  if(subjectTerms.length>2&&found.length<Math.ceil(subjectTerms.length/3))flags.push('WEAK_TEXTUAL_OVERLAP');
  if(!sections.length)paper.withoutSection++;
  if(!applications.length)paper.withoutApplication++;
  outcomeRows.push({
   id:o.id,paper:lesson.paper,topic,lessonTitle:lesson.topicTitle,
   officialPage:o.officialPdfPage,officialUrl:o.officialPageLink,officialAnchor:o.shortOfficialAnchor,
   officialAnchorHash:o.sourceAnchorSha256,officialPdfHash:official.pdfSha256,lessonHash:lesson.contentSha256,
   intellectualLevel:o.intellectualLevel,outcomeType:o.outcomeType,
   teachingEvidence:sections.map(s=>({section:s.index,title:s.title,excerpt:s.text.slice(0,350),contentHash:hash([s.title,s.text])})),
   applicationEvidence:applications.map(a=>({caseIndex:a.index,title:a.title,excerpt:a.answer.slice(0,350),contentHash:hash([a.title,a.prompt,a.answer])})),
   sourceTermsTested:subjectTerms,sourceTermsFound:found,
   flags:[...new Set(flags)],technicalDomains:domain(excerpt),
   remainingChecks:['Review FULL exact ACCA outcome and nested requirements on official PDF',
    'Judge explanation accuracy, depth and 2026-27 examinability',
    'Re-solve linked application independently and check all assumptions',
    'Check examples and any required computer-based examination skills'],
   academicReview:'NOT_VERIFIED',independentReviewer:null,reviewedAt:null
  });
  paper.outcomes++;
 }
 for(let j=0;j<lesson.worked.length;j++){
  const w=lesson.worked[j],i=j+1,key=topic+'#'+i;
  const calcs=maths.get(key)||[],journ=drcr.get(key)||[],amb=unclear.get(key)||[];
  const linked=outcomes.filter(o=>o.suggestedWorkedCases.some(x=>x.index===i)).map(o=>o.id);
  const flags=[];
  if(!calcs.length)flags.push('NO_INDEPENDENT_FORMULA_CHECK');
  if(calcs.some(a=>a.status!=='ARITHMETIC_IDENTITY_RECHECKED'))flags.push('ARITHMETIC_MISMATCH');
  if(journ.some(a=>a.status!=='BALANCED'))flags.push('DEBIT_CREDIT_MISMATCH');
  if(amb.length)flags.push('AMBIGUOUS_JOURNAL_STATEMENT');
  if(/\bDr\b|\bCr\b/.test(w[2])&&!journ.length)flags.push('POSTINGS_NOT_INDEPENDENTLY_BALANCE_TESTED');
  if(linked.length===0)flags.push('NO_MAPPED_ACC_OUTCOME');
  const technical=domain(w[1]+' '+w[2]);
  if(!technical.length)flags.push('CHECK_UNDERLYING_CONCEPTUAL_REASONING');
  if(String(w[2]).length<125)flags.push('SHORT_ANSWER_REVIEW');
  for(const d of technical)flags.push('SUBSTANTIVE_'+d+'_REVIEW');
  caseRows.push({
   id:key,paper:lesson.paper,topic,caseIndex:i,title:w[0],question:w[1],publishedAnswer:w[2],
   contentHash:hash(w),lessonHash:lesson.contentSha256,sourceFile:lesson.liveSource?.file,
   sourceUrl:lesson.officialSource,jurisdiction:lesson.jurisdiction,examEdition:lesson.edition,
   linkedOutcomeIds:linked,formulaChecks:calcs.map(a=>({expression:a.expression,printed:a.reported,
     independentlyCalculated:a.calculated,difference:a.absDifference,status:a.status})),
   journalChecks:journ.map(a=>({debits:a.debits,credits:a.credits,excerpt:a.excerpt,status:a.status})),
   ambiguousPostings:amb.map(a=>({excerpt:a.excerpt,reason:a.reason})),
   technicalDomains:technical,flags:[...new Set(flags)],
   remainingChecks:['Independently derive complete answer without viewing the published answer',
      'Confirm input selection, units, dates, finance/tax rates and rounding',
      'Check correct account direction, standards and exam jurisdiction',
      'Review conceptual reasoning and conclusion, then correct source lesson if required'],
   arithmeticScope:calcs.length?'EXTRACTABLE_IDENTITIES_ONLY':'NO_INDEPENDENT_FORMULA',
   fullTechnicalReview:'NOT_VERIFIED',fullAnswerReview:'NOT_VERIFIED',reviewer:null,reviewedAt:null
  });
  paper.cases++;paper.formulas+=calcs.length;
  paper.balancedDrCr+=journ.filter(e=>e.status==='BALANCED').length;paper.ambiguousDrCr+=amb.length;
  if(!calcs.length)paper.withoutEquation++;
 }
}
assert.equal(outcomeRows.length,cross.totalRows,'missing syllabus outcome');
assert.equal(caseRows.length,live.rows.reduce((n,l)=>n+l.worked.length,0),'missing worked case');
assert.equal(new Set(outcomeRows.map(x=>x.id)).size,outcomeRows.length);
assert.equal(new Set(caseRows.map(x=>x.id)).size,caseRows.length);
const summary={edition:'2026-27',publishedLessons:700,detailedOutcomeAndPracticalEntries:outcomeRows.length,
 workedCases:caseRows.length,papers:paperStats,independentAcademicSignoffs:0,independentAnswerSignoffs:0,
 outcomesWithoutTeachingSections:outcomeRows.filter(o=>!o.teachingEvidence.length).length,
 outcomesWithoutWorkedApplications:outcomeRows.filter(o=>!o.applicationEvidence.length).length,
 workedCasesWithoutExtractableEquations:caseRows.filter(c=>!c.formulaChecks.length).length,
 formulasIndependentlyRecomputed:caseRows.reduce((n,c)=>n+c.formulaChecks.length,0),
 numericallyBalancedJournals:caseRows.reduce((n,c)=>n+c.journalChecks.filter(x=>x.status==='BALANCED').length,0),
 ambiguousJournalGroups:caseRows.reduce((n,c)=>n+c.ambiguousPostings.length,0),
 caveat:'Complete review REGISTER, not complete academic approval. Full ACCA outcome wording, judgement, all written worked steps and technical standards still need individually documented review.'};
const auditPath='audit/';
fs.writeFileSync(auditPath+'all700-academic-outcome-review-ci.json',JSON.stringify({summary,rows:outcomeRows},null,2)+'\n');
fs.writeFileSync(auditPath+'all700-technical-worked-answer-review-ci.json',JSON.stringify({summary,rows:caseRows},null,2)+'\n');
const cell=x=>'"'+String(x==null?'':x).replace(/"/g,'""').replace(/[\r\n]+/g,' ').slice(0,31000)+'"';
const csv=(path,headers,rows)=>fs.writeFileSync(auditPath+path,'\ufeff'+[headers.map(cell).join(','),...rows.map(x=>x.map(cell).join(','))].join('\n')+'\n');
csv('all700-academic-outcome-review-ci.csv',
 ['ID','Paper','Lesson','Title','Official source page','Official anchor','Intellectual level','Mapped sections','Mapped worked cases','Evidence excerpts','Flags','Academic verdict','Lesson hash','Official PDF hash'],
 outcomeRows.map(x=>[x.id,x.paper,x.topic,x.lessonTitle,x.officialUrl,x.officialAnchor,(x.intellectualLevel||[]).join(';'),
  x.teachingEvidence.map(z=>'S'+z.section+' '+z.title).join(' | '),
  x.applicationEvidence.map(z=>'W'+z.caseIndex+' '+z.title).join(' | '),
  x.teachingEvidence.map(z=>z.excerpt).concat(x.applicationEvidence.map(z=>z.excerpt)).join(' | '),
  x.flags.join(';'),x.academicReview,x.lessonHash,x.officialPdfHash]));
csv('all700-technical-worked-answer-review-ci.csv',
 ['ID','Paper','Lesson','Worked case','Question','Published answer','Official source','Mapped outcomes','Independent equation checks','Dr Cr groups','Ambiguous postings','Technical concerns','Arithmetic evidence level','Technical verdict','Answer verdict','Case hash'],
 caseRows.map(x=>[x.id,x.paper,x.topic,x.title,x.question,x.publishedAnswer,x.sourceUrl,
 x.linkedOutcomeIds.join(';'),x.formulaChecks.map(z=>z.expression+' = '+z.printed+' / recalculated '+z.independentlyCalculated+' ('+z.status+')').join(' | '),
 x.journalChecks.map(z=>'Dr '+z.debits+' / Cr '+z.credits+' ('+z.status+')').join(' | '),
 x.ambiguousPostings.map(z=>z.reason+': '+z.excerpt).join(' | '),
 x.flags.join(';'),x.arithmeticScope,x.fullTechnicalReview,x.fullAnswerReview,x.contentHash]));
let md=['# LedgerPeer — complete academic and worked-answer review register','',
 'A FULL-SCOPE evidence register, not an ACCA-approved or independently signed-off teaching library.','',
 '|Measure|Result|','|---|---:|'];
for(const [k,v] of Object.entries(summary))if(typeof v==='number')md.push('|'+k+'|'+v+'|');
md.push('','## Review every case','The outcome CSV has every candidate outcome and linked lesson evidence. The worked-answer CSV contains every question, published solution and independent extractable-equation/journal check. Entries without verified technical reasoning remain NOT_VERIFIED.','',
 '## Paper summary','|Paper|Lessons|Outcomes|Cases|Equations|Cases lacking machine equation|Balanced journals|Ambiguous journals|','|---|---:|---:|---:|---:|---:|---:|---:|');
for(const [p,v] of Object.entries(paperStats))
 md.push('|'+p+'|'+v.lessons+'|'+v.outcomes+'|'+v.cases+'|'+v.formulas+'|'+v.withoutEquation+'|'+v.balancedDrCr+'|'+v.ambiguousDrCr+'|');
fs.writeFileSync(auditPath+'all700-full-review-summary-ci.md',md.join('\n')+'\n');
console.log('FULL_ACADEMIC_REGISTER '+JSON.stringify({
 lessons:summary.publishedLessons,outcomes:summary.detailedOutcomeAndPracticalEntries,cases:summary.workedCases,
 independentEquations:summary.formulasIndependentlyRecomputed,balancedJournals:summary.numericallyBalancedJournals,
 outcomesNoSection:summary.outcomesWithoutTeachingSections,outcomesNoExample:summary.outcomesWithoutWorkedApplications,
 casesNoEquation:summary.workedCasesWithoutExtractableEquations,signoffs:summary.independentAcademicSignoffs}));
