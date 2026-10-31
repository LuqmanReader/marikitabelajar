'use strict';
/* Export exactly the real student-visible first 350 teaching chapters for independent source comparison. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const review=JSON.parse(fs.readFileSync('audit/notes-2026-27-review-matrix.json','utf8'));
const index=JSON.parse(fs.readFileSync('audit/authored-chapter-index.json','utf8'));
const picked=review.chapters.slice(0,350);
assert.equal(picked.length,350);assert.equal(picked[0].topicKey,'FA1:A1');assert.equal(picked[349].topicKey,'FA:G4');
const c={LedgerFiaNotes:{},LedgerPublishedSyllabi:{papers:{}}};c.window=c;c.globalThis=c;vm.createContext(c);
const sources=['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js',...Object.keys(index.files)];
for(const f of sources){assert(fs.existsSync(f),'Missing '+f);vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f,timeout:15000});}
const page=fs.readFileSync('notes-page.js','utf8'),m=/const textbookLessons=Object\.assign\(\{\},([\s\S]*?)\);/.exec(page);
assert(m,'Cannot determine actual reader precedence');
const vars=[...m[1].matchAll(/root\.(Ledger[A-Za-z0-9_]+)\|\|\{\}/g)].map(x=>x[1]);
const content=Object.assign({},...vars.map(x=>c[x]||{}));
const rows=picked.map(r=>{
 const lesson=content[r.topicKey];assert(lesson,'Missing live lesson '+r.topicKey);
 const sections=lesson.sections||[],worked=lesson.workings||[];
 const full=JSON.stringify({sections,worked});
 return {key:r.topicKey,paper:r.paper,title:r.topicTitle,liveTitle:lesson.title,sourceUrl:r.syllabusUrl,
 examEdition:r.examEdition,variant:r.jurisdiction,authoredFiles:r.authoredFiles,
 publishedSectionCount:sections.length,publishedWorkedCount:worked.length,
 contentSha256:crypto.createHash('sha256').update(full).digest('hex'),
 sections,worked};
});
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/first350-live-lessons-ci.json',JSON.stringify({date:'2026-10-31',count:350,rows},null,2)+'\n');
console.log('EXPORTED 350 live lessons covering 13 papers and '+rows.reduce((a,r)=>a+r.publishedWorkedCount,0)+' published worked cases.');
