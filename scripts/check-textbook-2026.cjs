#!/usr/bin/env node
/**
 * Verify that every published 2026–27 FA1, MA1, FA2 and MA2 topic
 * has its own nonempty long-form LedgerPeer teaching chapter.
 * Usage: node scripts/check-textbook-2026.cjs
 * This is a STRUCTURAL test: it cannot guarantee content accuracy
 * or certification against every detailed ACCA learning outcome.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const modules=[
 'acca-published-data.js',
 'textbook-fa1-part-a.js','textbook-fa1-part-b.js','textbook-ma1.js',
 'textbook-fa2-part-a.js','textbook-fa2-part-b.js','textbook-fa2-part-c.js',
 'textbook-ma2-part-a.js','textbook-ma2-part-b.js','textbook-integrated-cases.js'
];
const sandbox={window:{}};
for(const file of modules){
 const content=fs.readFileSync(path.join(root,file),'utf8');
 vm.runInNewContext(content,sandbox,{filename:file,timeout:2500});
}
const w=sandbox.window;
const book=Object.assign({},w.LedgerTextbookFA1A,w.LedgerTextbookFA1B,w.LedgerTextbookMA1,
 w.LedgerTextbookFA2A,w.LedgerTextbookFA2B,w.LedgerTextbookFA2C,w.LedgerTextbookMA2A,w.LedgerTextbookMA2B);
const expected={FA1:19,MA1:13,FA2:22,MA2:20};
const errors=[],totals={topics:0,sections:0,worked:0,cases:0,caseSteps:0};
for(const [paper,required] of Object.entries(expected)){
 const official=w.LedgerPublishedSyllabi.papers[paper].topics;
 const keys=official.map(x=>paper+':'+x.split(' · ')[0]);
 if(keys.length!==required)errors.push(paper+' unexpected topic count: '+keys.length);
 for(let j=0;j<keys.length;j++){
  const key=keys[j],topic=book[key];
  if(!topic){errors.push('Missing textbook for '+key);continue;}
  totals.topics++;
  const title=official[j].split(' · ').slice(1).join(' · ');
  if(!title||!topic.title)errors.push(key+': invalid title');
  if(!Array.isArray(topic.sections)||topic.sections.length<4)errors.push(key+': insufficient sections');
  if(!Array.isArray(topic.workings)||topic.workings.length<2)errors.push(key+': insufficient worked questions');
  for(const [i,entry]of(topic.sections||[]).entries()){
   if(!Array.isArray(entry)||entry.length!==2||entry[1].length<80)errors.push(key+': invalid section '+i);
  }
  for(const [i,entry]of(topic.workings||[]).entries()){
   if(!Array.isArray(entry)||entry.length!==3||entry[2].length<50)errors.push(key+': invalid solution '+i);
  }
  totals.sections+=topic.sections?.length||0;
  totals.worked+=topic.workings?.length||0;
 }
}
for(const [key,c] of Object.entries(w.LedgerMasterCases||{})){
 if(!book[key])errors.push('Integrated case targets missing textbook '+key);
 if(!Array.isArray(c.steps)||c.steps.length<6||!c.reconciliation||!c.pitfall)errors.push('Incomplete integrated case '+key);
 totals.cases++;
 totals.caseSteps+=c.steps?.length||0;
}
if(Object.keys(book).length!==74)errors.push('Unexpected textbook topic count '+Object.keys(book).length);
const html=fs.readFileSync(path.join(root,'notes.html'),'utf8');
for(const file of modules.slice(1))if(!html.includes('src="'+file+'?'))errors.push('Script not loaded by notes.html: '+file);
const notes=fs.readFileSync(path.join(root,'notes-page.js'),'utf8');
new vm.Script(notes,{filename:'notes-page.js'});
if(!notes.includes('appendTextbook(main,paperCode,n.code)'))errors.push('Textbook renderer not connected');
if(!notes.includes('integratedCases[paperCode'))errors.push('Integrated cases not connected');
console.log('STUDY CONTENT INTEGRITY',JSON.stringify(totals));
for(const error of errors)console.error('FAIL',error);
console.log(errors.length?'CHECK FAILED':'CHECK PASSED: all 74 FA1/MA1/FA2/MA2 topic chapters structurally present');
console.log('NOT a claim of detailed syllabus completeness, examiner endorsement or independently checked calculations.');
if(errors.length)process.exitCode=1;
