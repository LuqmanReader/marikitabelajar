#!/usr/bin/env node
/* LedgerPeer — regression test for ALL 700 topic overview illustrations.
 * The test verifies label routing, text/spacing conventions and that unrelated
 * syllabus concepts are NOT shown as transaction-flow arrows.
 * Usage: node scripts/check-notes-visual-consistency.cjs
 * Does not certify the academic correctness or completeness of lesson content.
 */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
function parse(source,marker){
 const index=source.indexOf(marker);
 if(index<0)throw Error('No assignment '+marker);
 const start=source.indexOf('{',index+marker.length);
 let depth=0,quoted=false,escaped=false;
 for(let i=start;i<source.length;i++){
  const ch=source[i];
  if(quoted){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')quoted=false}
  else if(ch==='"')quoted=true;else if(ch==='{')depth++;else if(ch==='}'&&--depth===0)return JSON.parse(source.slice(start,i+1));
 }
 throw Error('No end of '+marker);
}
const syllabus={
 ...parse(read('acca-published-data.js'),'root.LedgerPublishedSyllabi=').papers,
 ...parse(read('notes-uk-syllabi.js'),'root.LedgerPublishedSyllabi.papers,...')
};
const expanded=parse(read('notes-expanded-data.js'),'Object.assign(notes,');
const lessons={...parse(read('notes-data.js'),'root.LedgerFiaNotes='),...expanded};
for(const k of Object.keys(lessons))if(['LW','TX','ATX'].includes(k.split(':')[0])&&!(k in expanded))delete lessons[k];
const sources=[
 ['textbook-fa1-part-a.js','root.LedgerTextbookFA1A='],
 ['textbook-fa1-part-b.js','root.LedgerTextbookFA1B='],
 ['textbook-ma1.js','root.LedgerTextbookMA1='],
 ['textbook-fa2-part-a.js','root.LedgerTextbookFA2A='],
 ['textbook-fa2-part-b.js','root.LedgerTextbookFA2B='],
 ['textbook-fa2-part-c.js','root.LedgerTextbookFA2C='],
 ['textbook-ma2-part-a.js','root.LedgerTextbookMA2A='],
 ['textbook-ma2-part-b.js','root.LedgerTextbookMA2B=']
];
const books=Object.assign({},...sources.map(([file,mark])=>parse(read(file),mark)));
class FakeNode{
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.textContent='';this.className=''}
 setAttribute(k,v){this.attrs[k]=String(v)}
 append(...items){this.children.push(...items)}
}
const document={createElement:tag=>new FakeNode(tag),createElementNS:(_,tag)=>new FakeNode(tag)};
const window={};
new vm.Script(read('notes-visual-all.js'),{filename:'notes-visual-all.js'});
vm.runInNewContext(read('notes-visual-all.js'),{window,document},{filename:'notes-visual-all.js',timeout:3000});
const errors=[];
let count=0,diagrams=0,workflow=0,badArrows=0,badFonts=0;
function collect(n,pred){
 const arr=[];const go=x=>{if(pred(x))arr.push(x);for(const y of x.children)go(y)};
 go(n);return arr;
}
for(const [paper,syll] of Object.entries(syllabus)){
 for(const topic of syll.topics){
  count++;
  const code=topic.split(' · ')[0],key=paper+':'+code;
  const title=topic.split(' · ').slice(1).join(' · ');
  const host=new FakeNode('div');
  const opts={paper,code,title,note:lessons[key],book:books[key]};
  try{
   if(!window.renderLedgerChapterVisual(host,opts)){errors.push(key+' not rendered');continue}
   const images=collect(host,n=>n.tag==='svg');
   if(images.length!==1){errors.push(key+' not exactly one illustration');continue}
   diagrams++;
   const svg=images[0],isWorkflow=key==='FA1:A2';
   if(svg.attrs.viewBox!=='0 0 1200 734')errors.push(key+' inconsistent viewBox');
   const labels=collect(svg,n=>n.tag==='text').map(n=>n.textContent).join(' ');
   const textNodes=collect(svg,n=>n.tag==='text');
   for(const t of textNodes){
    if(t.attrs['font-family']!=='Arial, Helvetica, sans-serif')badFonts++;
    const x=Number(t.attrs.x),y=Number(t.attrs.y);
    if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>1200||y>734)errors.push(key+' text outside viewBox');
   }
   const paths=collect(svg,n=>n.tag==='line'||n.tag==='path');
   if(!isWorkflow&&paths.length){badArrows++;errors.push(key+' shows a false concept sequence')}
   if(isWorkflow){
    workflow++;
    if(!labels.includes('BOOKKEEPING & SOURCE RECORDS')||labels.includes('BUSINESS DECISIONS'))
     errors.push('FA1:A2 wrongly labelled');
    if(paths.length!==8)errors.push('FA1:A2 must have exactly four clear workflow arrows');
    const text=collect(host,n=>n.tag==='p'||n.tag==='th'||n.tag==='td').map(n=>n.textContent).join(' ');
    if(!text.includes('RM90')||!text.includes('purchase order')||!text.includes('goods received note'))
     errors.push('FA1:A2 missing document mismatch illustration');
   }else if(!labels.includes('CONCEPT OVERVIEW')){
    errors.push(key+' missing nonsequential concept disclosure');
   }
  }catch(e){errors.push(key+': '+e.message)}
 }
}
const html=read('notes.html'),css=read('notes.css');
if(!html.includes('notes-visual-all.js?v=20261030consistency3'))errors.push('diagram cache not refreshed');
if(!html.includes('notes.css?v=20261030consistency3'))errors.push('stylesheet cache not refreshed');
if(!css.includes('.lv-document-lesson')||!css.includes('.lv-doc-table-inner'))errors.push('source-document table styles missing');
console.log(JSON.stringify({papers:Object.keys(syllabus).length,topics:count,illustrated:diagrams,validDocumentWorkflow:workflow,badArrows,badFonts,failures:errors.length},null,2));
if(errors.length){errors.slice(0,30).forEach(e=>console.error('FAIL',e));process.exitCode=1}
else console.log('PASS: consistent visual structure for all indexed chapters; no false flow arrows');
console.log('This is a presentation/regression audit, not full 2026–27 learning-outcome certification.');
