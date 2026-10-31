/* Validate both kinds of LedgerPeer learning resources without re-labelling drafts.
 * Run with: node tests/notes-all700-teaching.cjs
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const files=[
 'subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js',
 'notes-expanded-data.js',
 'textbook-fa1-part-a.js','textbook-fa1-part-b.js','textbook-ma1.js',
 'textbook-ma2-part-a.js','textbook-ma2-part-b.js',
 'textbook-fa2-part-a.js','textbook-fa2-part-b.js','textbook-fa2-part-c.js',
 'textbook-crossqual-a1.js','textbook-crossqual-a2-foundation.js',
 'textbook-crossqual-a2-professional.js','textbook-crossqual-a3-foundation.js',
 'textbook-crossqual-a3-professional.js','textbook-crossqual-batch4a.js',
 'textbook-crossqual-batch4b.js','textbook-crossqual-batch4c.js',
 'textbook-crossqual-batch4d.js','textbook-editorial-advanced.js','textbook-editorial-fia-applied.js','textbook-editorial-management-01.js','textbook-editorial-management-02.js','textbook-editorial-management-03.js','textbook-editorial-management-04.js','textbook-editorial-management-05.js','textbook-editorial-financial-01.js','textbook-editorial-financial-02.js','textbook-editorial-financial-03.js','textbook-editorial-financial-04.js','textbook-editorial-financial-05.js','textbook-editorial-financial-06.js','textbook-editorial-financial-07.js','textbook-editorial-business-01.js','textbook-editorial-business-02.js','textbook-editorial-business-03.js','textbook-editorial-business-04.js','textbook-editorial-business-05.js','textbook-editorial-business-06.js','textbook-editorial-business-07.js','textbook-editorial-audit-foundation-01.js','textbook-editorial-audit-foundation-02.js','textbook-editorial-audit-foundation-03.js','textbook-editorial-audit-foundation-04.js','textbook-editorial-audit-foundation-05.js','textbook-editorial-audit-foundation-06.js','textbook-editorial-foundation-finance-01.js','textbook-editorial-foundation-finance-02.js','textbook-editorial-foundation-finance-03.js','textbook-editorial-foundation-finance-04.js','textbook-editorial-pm-01.js','textbook-editorial-pm-02.js','textbook-editorial-pm-03.js','textbook-editorial-pm-04.js','textbook-editorial-pm-05.js','textbook-editorial-pm-06.js','textbook-editorial-law-eng-2026-part1.js','textbook-editorial-law-eng-2026-part2.js','textbook-editorial-sbr-int-2026-a.js','textbook-editorial-sbr-int-2026-b.js','textbook-structured-all-remaining.js'
];
const c={LedgerFiaNotes:{},LedgerPublishedSyllabi:{papers:{}}};c.window=c;c.globalThis=c;
vm.createContext(c);
for(const file of files)vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file,timeout:9000});
const all=Object.assign({},
 c.LedgerStructuredLessonChapters,c.LedgerEditorialPM01,c.LedgerEditorialPM02,c.LedgerEditorialPM03,c.LedgerEditorialPM04,c.LedgerEditorialPM05,c.LedgerEditorialPM06,c.LedgerEditorialLawENG2026,c.LedgerEditorialLawENG2026Part2,c.LedgerEditorialSBR2026A,c.LedgerEditorialSBR2026B,c.LedgerEditorialAdvancedChapters,c.LedgerEditorialFiaAppliedChapters,c.LedgerEditorialManagement01,c.LedgerEditorialManagement02,c.LedgerEditorialManagement03,c.LedgerEditorialManagement04,c.LedgerEditorialManagement05,c.LedgerEditorialFinancial01,c.LedgerEditorialFinancial02,c.LedgerEditorialFinancial03,c.LedgerEditorialFinancial04,c.LedgerEditorialFinancial05,c.LedgerEditorialFinancial06,c.LedgerEditorialFinancial07,c.LedgerEditorialBusiness01,c.LedgerEditorialBusiness02,c.LedgerEditorialBusiness03,c.LedgerEditorialBusiness04,c.LedgerEditorialBusiness05,c.LedgerEditorialBusiness06,c.LedgerEditorialBusiness07,c.LedgerEditorialAuditFoundation01,c.LedgerEditorialAuditFoundation02,c.LedgerEditorialAuditFoundation03,c.LedgerEditorialAuditFoundation04,c.LedgerEditorialAuditFoundation05,c.LedgerEditorialAuditFoundation06,c.LedgerEditorialFoundationFinance01,c.LedgerEditorialFoundationFinance02,c.LedgerEditorialFoundationFinance03,c.LedgerEditorialFoundationFinance04,
 c.LedgerSupplementalTextbooks,c.LedgerSupplementalTextbooksA2,
 c.LedgerSupplementalTextbooksProfessional,c.LedgerSupplementalTextbooksA3Foundation,
 c.LedgerSupplementalTextbooksA3Professional,
 c.LedgerSupplementalTextbooksBatch4A,c.LedgerSupplementalTextbooksBatch4B,
 c.LedgerSupplementalTextbooksBatch4C,c.LedgerSupplementalTextbooksBatch4D,
 c.LedgerTextbookFA1A,c.LedgerTextbookFA1B,c.LedgerTextbookMA1,
 c.LedgerTextbookMA2A,c.LedgerTextbookMA2B,c.LedgerTextbookFA2A,
 c.LedgerTextbookFA2B,c.LedgerTextbookFA2C
);
let total=0,authored=0,draft=0;
const concepts=new Set();
for(const p of c.SubjectCatalog.papers){
 const syll=c.LedgerNotesSyllabi.papers[p.code];
 assert(syll,'Missing paper '+p.code);
 for(const topic of syll.topics){
  const m=/^([A-Z]\d+)\s*·\s*(.+)$/.exec(topic);
  assert(m,'Malformed syllabus heading '+topic);
  const key=p.code+':'+m[1],ch=all[key];
  assert(!concepts.has(key),'Duplicate syllabus key '+key);concepts.add(key);
  assert(c.LedgerFiaNotes[key],'Missing topic core '+key);
  assert(ch&&ch.title&&ch.sections?.length>=3,'Missing lesson teaching '+key);
  assert(ch.workings?.length>0,'Missing worked application '+key);
  if(ch.sourceKind==='structured-expansion'){
   draft++;
   assert(ch.sections.length===4,key+' needs four teaching panels');
   assert(ch.workings.length===2,key+' needs two interactive problems');
   assert(ch.sections.every(x=>x[1].length>=320),key+' contains an insufficient panel');
   assert(ch.workings.every(w=>w[1].length>=35&&w[2].length>=150),key+' has a shallow practice');
   assert(ch.reviewStatus?.includes('REQUIRES'),key+' incorrectly marked complete');
  }else authored++;
  total++;
 }
}
assert.equal(total,700);
assert.equal(Object.keys(all).length,700,'No unrelated or duplicate chapters');
assert.equal(authored,454,'Individually authored chapter coverage changed');
assert.equal(draft,246,'Structured draft count changed');
assert.equal(c.LedgerStructuredLessonAudit.missingCore.length,0);
assert.equal(c.LedgerStructuredLessonAudit.weak.length,0);
const html=fs.readFileSync('notes.html','utf8');
const page=fs.readFileSync('notes-page.js','utf8');
assert(html.includes('src="textbook-structured-all-remaining.js?v='),'Structured content is not loaded');
assert(html.indexOf('textbook-structured-all-remaining.js')<html.indexOf('notes-page.js'),'Reader loads before structured data');
assert(page.includes('root.LedgerStructuredLessonChapters||{}'),'Reader does not merge teaching drafts');
assert(page.includes("sourceKind==='structured-expansion'"),'Reader does not distinguish drafts');
console.log('PASS: 700/700 topic-specific study pages; 454 extended chapters, 246 structured unverified teaching drafts.');
console.log('IMPORTANT: Structural checks do not certify correct, complete 2026-27 individual ACCA learning outcomes.');
