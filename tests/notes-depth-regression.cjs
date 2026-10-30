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
'textbook-crossqual-a1.js','notes-visual-all.js'
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
'LedgerTextbookFA1A','LedgerTextbookFA1B','LedgerTextbookMA1',
'LedgerTextbookMA2A','LedgerTextbookMA2B','LedgerTextbookFA2A',
'LedgerTextbookFA2B','LedgerTextbookFA2C','LedgerSupplementalTextbooks'];
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
  assert(cards.length>=3,key+': fewer than three concept panels');
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
for(const [key,chapter] of Object.entries(ctx.LedgerSupplementalTextbooks)){
 assert(chapter.title&&chapter.sections.length>=3,key+': insufficient sections');
 assert(chapter.workings.length>0,key+': no worked examination application');
 for(const [heading,body] of chapter.sections)
  assert(heading.length>5&&body.length>=100,key+': short teaching section');
 for(const [title,question,answer] of chapter.workings)
  assert(title.length>4&&question.length>30&&answer.length>100,
    key+': weak worked scenario');
}
assert.equal(topics,700,'Unexpected syllabus count; update audit after rechecking curriculum');
assert.equal(Object.keys(ctx.LedgerSupplementalTextbooks).length,21);
assert.equal(extended,95,'Extended lesson count changed; review all new/remapped chapters');
assert.equal(short,605,'Introductory chapter count changed; update coverage audit');
console.log('PASS: '+topics+' FIA/ACCA topic cards, '+extended+' extended teaching chapters, '+short+' introductory lessons requiring authoring.');
