#!/usr/bin/env node
/** Validate the LedgerPeer *visual teaching layer* for every indexed syllabus topic.
 * This checks data, loading and diagram coverage; it does NOT certify the underlying
 * lessons' academic accuracy or 2026–27 detailed learning-outcome coverage.
 *
 * node scripts/check-all-chapter-visuals.cjs
 * node scripts/check-all-chapter-visuals.cjs --require-full-textbook  (expected to fail)
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function parse(src,marker){
 const a=src.indexOf(marker);if(a<0)throw Error('Missing '+marker);
 const b=src.indexOf('{',a+marker.length);let d=0,quote=false,esc=false;
 for(let i=b;i<src.length;i++){
  const c=src[i];
  if(quote){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')quote=false}
  else if(c==='"')quote=true;else if(c==='{')d++;else if(c==='}'&&--d===0)return JSON.parse(src.slice(b,i+1));
 }
 throw Error('Unclosed JSON object: '+marker);
}
const published=parse(read('acca-published-data.js'),'root.LedgerPublishedSyllabi=');
const variants=parse(read('notes-uk-syllabi.js'),'root.LedgerPublishedSyllabi.papers,...');
const topics={...published.papers,...variants};
const base=parse(read('notes-data.js'),'root.LedgerFiaNotes=');
const expanded=parse(read('notes-expanded-data.js'),'Object.assign(notes,');
const lesson={...base,...expanded};
for(const k of Object.keys(lesson)){
 if(['LW','TX','ATX'].includes(k.split(':')[0])&&!Object.prototype.hasOwnProperty.call(expanded,k))delete lesson[k];
}
const problems=[],keys=[];
for(const [paper,data]of Object.entries(topics)){
 for(const title of data.topics){
  const code=title.split(' · ')[0],k=paper+':'+code;keys.push(k);
  if(!lesson[k])problems.push('Missing topic data '+k);
  else if(!Array.isArray(lesson[k].steps)||!lesson[k].steps.length)problems.push('No mapped method steps '+k);
 }
}
const numeric=parse(read('notes-worked-tables-data.js'),'root.LedgerNumericalTables=');
for(const [key,d] of Object.entries(numeric)){
 if(!keys.includes(key))problems.push('Numeric case points to unknown topic '+key);
 if(!d.heading||!d.intro||!d.check||!d.trap||!Array.isArray(d.rows))problems.push('Missing numerical components '+key);
 for(const row of d.rows||[])if(row.length!==d.headers.length)problems.push('Numerical column mismatch '+key);
}
const scripts=['notes-visual-all.js','notes-worked-tables-data.js','notes-worked-tables.js','notes-page.js'];
const html=read('notes.html'),idx=scripts.map(p=>html.indexOf('src="'+p+'?'));
if(idx.some(x=>x<0))problems.push('Missing required script');
if(!(idx[1]<idx[2]&&idx[2]<idx[0]&&idx[0]<idx[3]))problems.push('Scripts out of order');
const scriptSources=['notes-visual-all.js','notes-worked-tables-data.js','notes-worked-tables.js','notes-page.js'];
scriptSources.forEach(p=>new vm.Script(read(p),{filename:p}));
const fake={
 createElementNS:(_,tag)=>new Element(tag),createElement:tag=>new Element(tag)
};
class Element{
 constructor(name){this.name=name;this.children=[];this.attrs={};this.className='';this.textContent=''}
 setAttribute(k,v){this.attrs[k]=String(v)}
 append(...nodes){this.children.push(...nodes)}
}
const window={};
vm.runInNewContext(read('notes-visual-all.js'),{window,document:fake},{filename:'notes-visual-all.js',timeout:1000});
vm.runInNewContext(read('notes-worked-tables-data.js'),{window},{filename:'notes-worked-tables-data.js',timeout:1000});
vm.runInNewContext(read('notes-worked-tables.js'),{window,document:fake},{filename:'notes-worked-tables.js',timeout:1000});
let illustrated=0,solved=0;
for(const [paper,data]of Object.entries(topics)){
 for(const title of data.topics){
  const code=title.split(' · ')[0],rootEl=new Element('section');
  try{
   const shown=window.renderLedgerChapterVisual(rootEl,{paper,code,title:title.split(' · ').slice(1).join(' · '),note:lesson[paper+':'+code]});
   if(shown)illustrated++;
   if(!rootEl.children.some(node=>node.name==='figure'))problems.push('No diagram figure '+paper+':'+code);
   if(window.renderLedgerNumericalTable(rootEl,paper,code))solved++;
  }catch(e){problems.push('Rendering '+paper+':'+code+' '+e.message)}
 }
}
console.log('LedgerPeer total 2026–27 indexed topics:',keys.length);
console.log('Generated chapter-specific schematic diagrams:',illustrated);
console.log('Independent numerical demonstration tables:',solved);
console.log('Important: a diagram and table are not evidence of full syllabus mastery.');
if(illustrated!==keys.length)problems.push('Not all topics illustrated');
if(solved!==Object.keys(numeric).length)problems.push('Not all numerical tables rendered');
for(const p of problems)console.error('FAIL',p);
if(process.argv.includes('--require-full-textbook')){
 console.error('STRICT CONTENT GATE NOT SATISFIED: the 2026–27 outcomes and full textbook chapters across all 25 papers have not been individually verified.');
 process.exitCode=2;
}else if(problems.length)process.exitCode=1;
else console.log('ALL VISUAL COVERAGE AND DATA-STRUCTURE CHECKS PASSED');
