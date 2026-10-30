#!/usr/bin/env node
/* LedgerPeer — regression test for all chapter interactive explanation cards.
 * Verifies complete content is never clipped, keyboard accessible native details
 * are used, and expand/collapse controls work for every indexed topic.
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
 constructor(tag){
  this.tag=tag;this.children=[];this.attrs={};this.handlers={};
  this.textContent='';this.className='';this.open=false;
 }
 setAttribute(k,v){this.attrs[k]=String(v)}
 append(...items){this.children.push(...items)}
 addEventListener(name,handler){this.handlers[name]=handler}
}
const document={createElement:tag=>new FakeNode(tag),createElementNS:(_,tag)=>new FakeNode(tag)};
const window={};
new vm.Script(read('notes-visual-all.js'),{filename:'notes-visual-all.js'});
vm.runInNewContext(read('notes-visual-all.js'),{window,document},{filename:'notes-visual-all.js',timeout:3000});
const errors=[];
let count=0,interactive=0,buttonsTested=0,untruncatedSections=0,preservedWorkflows=0;
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
  const book=books[key];
  try{
   if(!window.renderLedgerChapterVisual(host,{paper,code,title,note:lessons[key],book})){
    errors.push(key+' not rendered');continue;
   }
   const maps=collect(host,n=>n.className==='lv-interactive-map');
   const cards=collect(host,n=>n.tag==='details'&&n.className==='lv-interactive-card');
   const controls=collect(host,n=>n.className==='lv-all-toggle');
   if(maps.length!==1||cards.length!==4)errors.push(key+' missing four interactive cards');
   else interactive++;
   if(cards.some(card=>!card.open))errors.push(key+' cards must initially be expanded');
   if(cards.some(card=>collect(card,n=>n.tag==='summary').length!==1))
    errors.push(key+' cards must have keyboard-operable native summary');
   if(controls.length!==2||controls.some(button=>!button.handlers.click)){
    errors.push(key+' missing functional bulk controls');
   }else{
    controls[0].handlers.click();
    if(cards.some(card=>card.open))errors.push(key+' collapse all failed');
    controls[1].handlers.click();
    if(cards.some(card=>!card.open))errors.push(key+' expand all failed');
    buttonsTested++;
   }
   for(let i=0;i<Math.min(4,book?.sections.length||0);i++){
    const paragraphText=collect(cards[i],n=>n.className==='lv-card-paragraph')
     .map(n=>n.textContent).join('\n\n');
    if(paragraphText!==book.sections[i][1].trim())
     errors.push(key+' section '+(i+1)+' does not preserve source text');
    else untruncatedSections++;
   }
   const images=collect(host,n=>n.tag==='svg');
   if(key==='FA1:A2'){
    if(images.length!==1)errors.push('FA1:A2 document workflow SVG missing');
    else preservedWorkflows++;
    const text=collect(host,n=>n.tag==='p'||n.tag==='th'||n.tag==='td').map(n=>n.textContent).join(' ');
    if(!text.includes('RM90')||!text.includes('purchase order')||!text.includes('goods received note'))
     errors.push('FA1:A2 document example damaged');
   }else if(images.length){
    errors.push(key+' should use interactive concept cards, not a static SVG');
   }
  }catch(e){errors.push(key+': '+e.message)}
 }
}
const html=read('notes.html'),css=read('notes.css');
if(!html.includes('notes-visual-all.js?v=20261030interactive4'))errors.push('interactive JS cache not refreshed');
if(!html.includes('notes.css?v=20261030interactive4'))errors.push('interactive stylesheet cache not refreshed');
if(!css.includes('.lv-interactive-card')||!css.includes('.lv-card-content'))errors.push('interactive card CSS missing');
console.log(JSON.stringify({papers:Object.keys(syllabus).length,topics:count,interactive,buttonsTested,untruncatedSections,preservedWorkflows,errors:errors.length},null,2));
if(errors.length){errors.slice(0,35).forEach(e=>console.error('FAIL',e));process.exitCode=1}
else console.log('PASS: all topics expose full, interactive, keyboard-accessible chapter cards');
console.log('This regression test does not certify 2026–27 detailed syllabus content.');
