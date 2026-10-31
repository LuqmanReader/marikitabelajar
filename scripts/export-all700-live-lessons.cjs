#!/usr/bin/env node
'use strict';
/* Export the EXACT chapter chosen by notes-page.js for each of the 700 keys.
 * Source inventory != academic approval. This is a reproducible review input.
 */
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const matrix=JSON.parse(fs.readFileSync('audit/notes-2026-27-review-matrix.json','utf8'));
const index=JSON.parse(fs.readFileSync('audit/authored-chapter-index.json','utf8'));
assert.equal(matrix.chapters.length,700);
const c={LedgerFiaNotes:{},LedgerPublishedSyllabi:{papers:{}}};c.window=c;c.globalThis=c;
vm.createContext(c);
const sourceFiles=['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js',...Object.keys(index.files)];
const provenance={};
for(const file of sourceFiles){
 assert(fs.existsSync(file),'Missing teaching source '+file);
 const before=new Set(Object.keys(c));
 vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file,timeout:15000});
 for(const key of Object.keys(c)){
  if(!before.has(key)&&/^Ledger/.test(key)&&c[key]&&typeof c[key]==='object')provenance[key]=file;
 }
}
const reader=fs.readFileSync('notes-page.js','utf8');
const match=/const textbookLessons=Object\.assign\(\{\},([\s\S]*?)\);/.exec(reader);
assert(match,'Reader merge order not found; cannot claim to export live chapters');
const vars=[...match[1].matchAll(/root\.(Ledger[A-Za-z0-9_]+)\|\|\{\}/g)].map(m=>m[1]);
assert(vars.length>70,'Reader precedence unexpectedly changed');
const live={},winner={},allDefinitions={};
for(const v of vars){
 for(const [key,ch] of Object.entries(c[v]||{})){
  const definitions=allDefinitions[key]??=[];
  if(!definitions.some(item=>item.variable===v))definitions.push({variable:v,file:provenance[v]||null});
  live[key]=ch;
  winner[key]={variable:v,file:provenance[v]||null};
 }
}
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const rows=matrix.chapters.map(r=>{
 const ch=live[r.topicKey];
 assert(ch&&Array.isArray(ch.sections)&&Array.isArray(ch.workings),'No reader-visible chapter '+r.topicKey);
 const sources=allDefinitions[r.topicKey]||[];
 const matches=Object.keys(index.files).filter(f=>index.files[f].includes(r.topicKey));
 assert.deepEqual(matches.sort(),r.authoredFiles.slice().sort(),'Source inventory mismatch for '+r.topicKey);
 return {
  key:r.topicKey,paper:r.paper,topicTitle:r.topicTitle,liveTitle:ch.title,
  jurisdiction:r.jurisdiction,edition:r.examEdition,officialSource:r.syllabusUrl,
  contentSha256:digest({title:ch.title,sections:ch.sections,workings:ch.workings}),
  liveSource:winner[r.topicKey],
  sourceDefinitions:sources,
  sectionCount:ch.sections.length,workedCount:ch.workings.length,
  academicSignoff:r.fullOutcomeCoverageStatus,technicalReview:r.technicalReview,
  sections:ch.sections,worked:ch.workings
 };
});
assert.equal(new Set(rows.map(x=>x.key)).size,700);
assert.equal(Object.keys(live).length,700,'Published chapter set changed');
const duplicates=rows.filter(r=>r.sourceDefinitions.length>1).map(r=>({key:r.key,definitions:r.sourceDefinitions,selected:r.liveSource}));
const output={generatedAt:new Date().toISOString(),method:'Exact 700-lesson source extraction using notes-page.js merge precedence; NOT academic certification',count:rows.length,duplicateCount:duplicates.length,duplicates,rows};
fs.mkdirSync('audit',{recursive:true});
fs.writeFileSync('audit/all700-live-lessons-ci.json',JSON.stringify(output,null,2)+'\n');
console.log('EXPORTED '+rows.length+' live topics, '+rows.reduce((n,r)=>n+r.workedCount,0)+' worked cases; '+duplicates.length+' duplicate chapter keys with explicit winning sources.');
