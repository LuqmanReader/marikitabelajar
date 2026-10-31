/* Run: node tests/notes-depth-regression.cjs
 * Structural regression, NOT a substitute for editorial / syllabus sign-off.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const files=[
'subject-catalog.js','acca-published-data.js','notes-data.js',
'notes-expanded-data.js','notes-uk-syllabi.js',
'textbook-fa1-part-a.js','textbook-fa1-part-b.js','textbook-ma1.js',
'textbook-ma2-part-a.js','textbook-ma2-part-b.js','textbook-fa2-part-a.js',
'textbook-fa2-part-b.js','textbook-fa2-part-c.js',
'textbook-crossqual-a1.js','textbook-crossqual-a2-foundation.js',
 'textbook-crossqual-a2-professional.js','textbook-crossqual-a3-foundation.js',
 'textbook-crossqual-a3-professional.js',
 'textbook-crossqual-batch4a.js','textbook-crossqual-batch4b.js','textbook-crossqual-batch4c.js','textbook-crossqual-batch4d.js','textbook-editorial-advanced.js','textbook-editorial-fia-applied.js','notes-visual-all.js'
];
const ctx={LedgerFiaNotes:{},LedgerPublishedSyllabi:{papers:{}},console};
ctx.window=ctx;ctx.globalThis=ctx;
vm.createContext(ctx);
for(const file of files){
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
}
const catalog=ctx.SubjectCatalog.papers;
assert.equal(catalog.length,25,'The qualification index must contain 25 papers');
const chapterSets=[
'LedgerSupplementalTextbooks','LedgerSupplementalTextbooksA2',
'LedgerSupplementalTextbooksProfessional','LedgerSupplementalTextbooksA3Foundation',
'LedgerSupplementalTextbooksA3Professional',
'LedgerSupplementalTextbooksBatch4A','LedgerSupplementalTextbooksBatch4B',
'LedgerSupplementalTextbooksBatch4C','LedgerSupplementalTextbooksBatch4D','LedgerEditorialAdvancedChapters','LedgerEditorialFiaAppliedChapters','LedgerTextbookFA1A','LedgerTextbookFA1B',
'LedgerTextbookMA1','LedgerTextbookMA2A','LedgerTextbookMA2B','LedgerTextbookFA2A',
'LedgerTextbookFA2B','LedgerTextbookFA2C'];
const chapters=Object.assign({},...chapterSets.map(name=>ctx[name]||{}));
let topics=0,short=0,extended=0;
for(const paper of catalog){
 const titles=ctx.LedgerNotesSyllabi.papers[paper.code].topics;
 assert(titles.length>0, paper.code+': no syllabus headings');
 for(const title of titles){
  const m=/^([A-Z]\d+)/.exec(title);
  assert(m,paper.code+': malformed syllabus topic '+title);
  const key=paper.code+':'+m[1],note=ctx.LedgerFiaNotes[key];
  assert(note,key+': missing core teaching');
  const cards=ctx.LedgerChapterSections({paper:paper.code,code:m[1],note,
    book:chapters[key]});
  assert(cards.length===4,key+': chapter must display four substantial concept panels');
  for(const c of cards){
   assert(c.heading&&c.detail&&c.detail.length>=85,
     key+': trivial or empty concept panel');
   assert(!/Further teaching required/.test(c.detail),
     key+': user-facing placeholder panel');
  }
  if(chapters[key])extended++;else short++;
  topics++;
 }
}
const allSupplemental=Object.assign({},ctx.LedgerSupplementalTextbooks,ctx.LedgerSupplementalTextbooksA2,ctx.LedgerSupplementalTextbooksProfessional,ctx.LedgerSupplementalTextbooksA3Foundation,ctx.LedgerSupplementalTextbooksA3Professional,ctx.LedgerSupplementalTextbooksBatch4A,
ctx.LedgerSupplementalTextbooksBatch4B,ctx.LedgerSupplementalTextbooksBatch4C,ctx.LedgerSupplementalTextbooksBatch4D,ctx.LedgerEditorialAdvancedChapters,ctx.LedgerEditorialFiaAppliedChapters);
for(const [key,chapter] of Object.entries(allSupplemental)){
 assert(chapter.title&&chapter.sections.length>=3,key+': insufficient sections');
 assert(chapter.workings.length>0,key+': no worked examination application');
 for(const [heading,body] of chapter.sections)
  assert(heading.length>5&&body.length>=320,key+': short teaching section');
 for(const [title,question,answer] of chapter.workings)
  assert(title.length>4&&question.length>30&&answer.length>=130,
    key+': weak worked scenario');
}
assert.equal(topics,700,'Unexpected syllabus count; update audit after rechecking curriculum');
assert.equal(Object.keys(allSupplemental).length,160,'Expected extended original FIA and ACCA teaching');
assert.equal(extended,226,'Unique extended lesson count changed; review overlaps and depth');
assert.equal(short,474,'Introductory chapter count changed; update coverage audit');
const html=fs.readFileSync(path.join(root,'notes.html'),'utf8');
const page=fs.readFileSync(path.join(root,'notes-page.js'),'utf8');
for(const file of files.filter(x=>x.startsWith('textbook-crossqual'))){
 assert(html.includes(file+'?v='),'Missing chapter script '+file);
 assert(html.indexOf(file)<html.indexOf('notes-page.js'),'Script order must precede reader '+file);
}
assert(page.includes('notes-chapter-coverage'),'The reader must display genuine chapter coverage');
assert(page.indexOf('root.LedgerSupplementalTextbooksBatch4D||{}')<page.indexOf('root.LedgerTextbookFA1A||{}'),'Existing detailed FIA chapters must retain priority');
console.log('PASS: '+topics+' FIA/ACCA topic cards, '+extended+' extended teaching chapters, '+short+' introductory lessons requiring authoring.');
