#!/usr/bin/env node
/* Full 700-topic curriculum index audit, plus targeted 2026-27 change coverage.
 * Read-only local test: this is NOT an official ACCA certification.
 * The official PDF sources and edition are recorded for each syllabus topic.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={};ctx.window=ctx;ctx.globalThis=ctx;ctx.LedgerFiaNotes={};ctx.LedgerPublishedSyllabi={papers:{}};
vm.createContext(ctx);
for(const name of ['subject-catalog.js','acca-published-data.js','notes-uk-syllabi.js','notes-2026-27-outcome-addenda.js','notes-2026-ifrs18-addenda.js']){
 vm.runInContext(fs.readFileSync(name,'utf8'),ctx,{filename:name,timeout:10000});
}
const papers=ctx.SubjectCatalog.papers;
const catalogue=ctx.LedgerNotesSyllabi.papers;
const addenda=Object.assign({},ctx.Ledger2026OutcomeAddenda.topics,ctx.Ledger2026IFRS18Addenda.topics);
const expectedPapers=['FA1','MA1','FA2','MA2','FBT','FMA','FFA','FAU','FFM','FTX','BT','MA','FA','LW','PM','TX','FR','AA','FM','SBL','SBR','AFM','APM','ATX','AAA'];
assert.equal(papers.length,25);
assert.deepEqual(Array.from(papers,p=>p.code).sort(),expectedPapers.sort(),'Paper list changed');
const topicEntries=[];
const keys=new Set();
for(const paper of papers){
 const source=catalogue[paper.code];
 assert(source&&Array.isArray(source.topics),'Missing syllabus source '+paper.code);
 assert(source.source.startsWith('https://www.accaglobal.com/'),'Non-ACCA curriculum source '+paper.code);
 assert(source.source.endsWith('.pdf'),'Syllabus source should link official PDF '+paper.code);
 assert(source.variant,'Missing law/tax/assurance variant '+paper.code);
 assert(/2026|26|27/.test(source.edition),'Edition not explicitly linked to current period '+paper.code);
 for(const heading of source.topics){
  const m=/^([A-Z]\d+) · (.+)$/.exec(heading);
  assert(m,'Malformed or poorly extracted topic '+paper.code+' '+heading);
  const key=paper.code+':'+m[1];
  assert(!keys.has(key),'Duplicate topic '+key);
  keys.add(key);
  assert(!/©|syllabus and study guide|advanced performance management \(APM\)/i.test(m[2]),'PDF footer/header leaked into '+key);
  topicEntries.push({key,paper:paper.code,title:m[2],variant:source.variant,edition:source.edition,source:source.source,full_outcome_review:'not_certified',targeted_addendum:!!addenda[key]});
 }
}
assert.equal(topicEntries.length,700,'Every FIA/ACCA index topic must be accounted for');
assert.equal(keys.size,700);
assert.equal(Object.keys(addenda).length,13,'Expected 13 unique syllabus-specific 2026-27 addenda');
const expectedUpdates={
 'PM:A3':['A3d'],'PM:B5':['B5b'],'PM:E2':['E2a','E2d'],
 'APM:A1':['A1e'],'APM:A3':['A3b(iv)'],'APM:A4':['A4b'],'APM:A5':['A5c'],
 'APM:B4':['B4i'],'FA2:G1':['IFRS 18 examinable'],
 'FA:G2':['IFRS 18 examinable'],'FFA:G2':['IFRS 18 examinable'],
 'FR:D1':['IFRS 18 presentation'],'SBR:C10':['C10f']
};
for(const [key,requirements] of Object.entries(expectedUpdates)){
 const a=addenda[key];
 assert(a,key+' missing syllabus addendum');
 assert(keys.has(key),key+' not a recognized syllabus heading');
 assert.equal(a.source,catalogue[key.split(':')[0]].source===a.source ? a.source : a.source,'Unexpected source');
 assert(a.source.startsWith('https://www.accaglobal.com/'),'Non-ACCA source '+key);
 assert(a.outcomes.length>=1,'No outcome references '+key);
 for(const id of requirements)assert(a.outcomes.includes(id),key+' missing 2026-27 change '+id);
 assert(a.sections.length>=3,key+' needs multiple educational explanations');
 assert(a.sections.every(([h,s])=>h.length>=10&&s.length>=160),key+' shallow teaching');
 assert(a.workings.length>=2,key+' needs two worked exam applications');
 assert(a.workings.every(([t,q,ans])=>t.length>=8&&q.length>=60&&ans.length>=130),key+' weak worked case');
}
const pm=ctx.Ledger2026OutcomeAddenda.topics;
const fa=ctx.Ledger2026IFRS18Addenda.topics;
assert(pm['APM:A3'].sections.some(s=>s[1].includes('31.25%')||s[1].includes('shareholder return')));
assert(pm['APM:A4'].workings.some(w=>w[2].includes('33.33')));
assert(pm['APM:B4'].workings.some(w=>w[2].includes('99.7222')));
assert(fa['SBR:C10'].sections.some(x=>/reconciliation/.test(x[1])));
const html=fs.readFileSync('notes.html','utf8');
const page=fs.readFileSync('notes-page.js','utf8');
for(const script of ['notes-2026-27-outcome-addenda.js','notes-2026-ifrs18-addenda.js']){
 assert(html.includes(script+'?v='),script+' missing from published page');
 assert(html.indexOf(script)<html.indexOf('notes-page.js'),script+' script loads too late');
}
assert(page.includes('const syllabusAddenda=Object.assign('),'Reader fails to merge 2026-27 addenda');
const report={builtAt:new Date().toISOString(),auditType:'structural index and selected learning-outcome review ONLY; NOT ACCA certification',total:topicEntries.length,papers:papers.map(p=>({code:p.code,count:catalogue[p.code].topics.length,variant:catalogue[p.code].variant,edition:catalogue[p.code].edition,source:catalogue[p.code].source})),targetedAddenda:Object.keys(addenda),unverifiedFullOutcomeTopics:700,entries:topicEntries};
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/notes-2026-27-inventory.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS: 25 papers / 700 indexed topics, original ACCA source references, 13 independently updated topic sections, full-outcome verification explicitly pending.');
