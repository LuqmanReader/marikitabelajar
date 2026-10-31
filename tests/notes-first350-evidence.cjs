'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const idx=JSON.parse(fs.readFileSync('audit/authored-chapter-index.json','utf8'));
const matrix=JSON.parse(fs.readFileSync('audit/notes-2026-27-review-matrix.json','utf8'));
const chosen=matrix.chapters.slice(0,350);
assert.equal(chosen.length,350);assert.equal(chosen[0].topicKey,'FA1:A1');assert.equal(chosen[349].topicKey,'FA:G4');
const c={LedgerFiaNotes:{},LedgerPublishedSyllabi:{papers:{}}};c.window=c;c.globalThis=c;
vm.createContext(c);
for(const path of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js',...Object.keys(idx.files)])
 vm.runInContext(fs.readFileSync(path,'utf8'),c,{filename:path,timeout:12000});
const page=fs.readFileSync('notes-page.js','utf8');
const match=/const textbookLessons=Object\.assign\(\{\},([\s\S]*?)\);/.exec(page);
assert(match,'Cannot extract actual Notes reader override order');
const vars=[...match[1].matchAll(/root\.(Ledger[A-Za-z0-9_]+)\|\|\{\}/g)].map(m=>m[1]);
assert(vars.length>50,'Missing textbook source variables');
const live=Object.assign({},...vars.map(n=>c[n]||{}));
const words=s=>(String(s||'').match(/[\p{L}\p{N}]+/gu)||[]).length;
const results=[],flagCounts={},perPaper={};
for(const r of chosen){
 const ch=live[r.topicKey],flags=[];
 if(!ch||!Array.isArray(ch.sections)||!Array.isArray(ch.workings))flags.push('MISSING_LIVE_CHAPTER');
 const sections=ch?.sections||[],cases=ch?.workings||[];
 const sWords=sections.map(s=>words(s[1])),aWords=cases.map(s=>words(s[2]));
 const blob=JSON.stringify(ch||{});
 if(sections.length<3)flags.push('INSUFFICIENT_SECTION_COUNT');
 if(cases.length<2)flags.push('INSUFFICIENT_WORKED_CASE_COUNT');
 if(sWords.some(n=>n<35))flags.push('SHORT_SECTION_REVIEW');
 if(aWords.some(n=>n<25))flags.push('SHORT_SOLUTION_REVIEW');
 if(sWords.reduce((a,b)=>a+b,0)+aWords.reduce((a,b)=>a+b,0)<300)flags.push('LOW_TEXT_DEPTH_REVIEW');
 if(/lorem ipsum|further teaching required|indonesia|\bRM\s*[\d,]/i.test(blob))flags.push('UNSUITABLE_TEXT');
 if(r.authoredFiles.length>1)flags.push('MULTIPLE_SOURCE_DEFINITIONS');
 if(!r.syllabusUrl?.startsWith('https://www.accaglobal.com/'))flags.push('INVALID_SOURCE_REFERENCE');
 if(!/2026|26/.test(r.examEdition||''))flags.push('EDITION_NOT_IDENTIFIED');
 const record={key:r.topicKey,paper:r.paper,title:r.topicTitle,variant:r.jurisdiction,edition:r.examEdition,
  syllabusReference:r.syllabusUrl,authoredFiles:r.authoredFiles,liveTitle:ch?.title||null,
  sectionWords:sWords,workedSolutionWords:aWords,flags,
  academicOutcomeSignoff:false,outcomeReview:r.fullOutcomeCoverageStatus};
 results.push(record);
 for(const f of flags)flagCounts[f]=(flagCounts[f]||0)+1;
 const p=perPaper[r.paper]??={screened:0,flagged:0};p.screened++;if(flags.length)p.flagged++;
}
const independentChecks=[
 ['FA1:E1',10000,8000+14000-11000-1000],
 ['FA2:D3',850,2000-1150],
 ['FA2:D4',6000,(45000-5000)/5*9/12],
 ['FA2:D5',11600,11200+1300-900],
 ['FA:C2',29000,24000+58000-49000-3000-1000],
 ['FFA:C2',29000,24000+58000-49000-3000-1000]
].map(([key,expected,calculated])=>{
 const found=!!live[key]?.workings?.some(w=>String(w[2]).includes('$'+expected.toLocaleString('en-US')));
 return {key,expected,calculated,solutionContainsExpected:found,scope:'one numerical result only'};
});
const faC1=['quotation','purchase order','sales order','goods received note','remittance advice',
 'credit note','cloud','accounting equation'];
const outcomeSpotChecks=['FA:C1','FFA:C1'].map(key=>{
 const text=JSON.stringify(live[key]||{}).toLowerCase();
 return {key,officialSyllabus:'FA/FFA 2026-27 C1(a)-(f), study guide p9',
  missingConcepts:faC1.filter(t=>!text.includes(t)),
  caveat:'Keyword presence is NOT academic outcome validation'};
});
const report={date:'2026-10-31',method:'first 350: automated source/reader-content preflight; NOT academic certification',
 sourcePeriod:'2026-27 per catalogue; direct guide source comparison not complete',
 screened:350,academicOutcomeSignoffs:0,perPaper,flagCounts,independentChecks,outcomeSpotChecks,topics:results};
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/notes-first350-evidence.json',JSON.stringify(report,null,2)+'\n');
const md=['# First 350 LedgerPeer lessons: evidence preflight','','**350/700** records screened; **0/350** fully academically verified.',
 'This compares actual reader-loaded content, structural completeness and risk indicators. A short answer or low word count is a review flag, not proof of a wrong answer.',
 '## Recorded review flags',...Object.entries(flagCounts).map(([k,v])=>'- '+k+': '+v),
 '## Numerical spot checks',...independentChecks.map(r=>'- '+r.key+': independent result '+r.calculated+'; matching answer text: '+r.solutionContainsExpected),
 '## 2026-27 official FA/FFA C1 detailed outcomes (spot check)',
 ...outcomeSpotChecks.map(r=>'- '+r.key+': missing concepts '+(r.missingConcepts.join(', ')||'none by keyword')),
 '## Limitations','A syllabus URL and matching heading are not evidence of current-edition outcome coverage. Every a/b/c skill, tax/legal variant and worked answer needs independent corroboration. No topic has been awarded a completion certificate.',
 '## Topic-level evidence','See the generated notes-first350-evidence.json in the same CI artifact.',''];
fs.writeFileSync('audit/notes-first350-evidence.md',md.join('\n'));
console.log('First-half QA: '+JSON.stringify({screened:350,signoffs:0,flagCounts,perPaper,independentChecks,outcomeSpotChecks}));
assert(results.every(r=>!r.flags.includes('MISSING_LIVE_CHAPTER')),'Missing live teaching chapter');
assert(independentChecks.every(r=>r.calculated===r.expected&&r.solutionContainsExpected),'Fixed arithmetic check failed');
assert(outcomeSpotChecks.every(r=>r.missingConcepts.length===0),'Official 2026-27 FA/FFA C1 concepts missing');
console.log('PASS: automated first-350 evidence preflight (not full academic certification)');