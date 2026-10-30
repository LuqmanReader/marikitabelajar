#!/usr/bin/env node
/* Regression checks for original LedgerPeer illustrated financial bookkeeping chapters.
 * Structural and numerical checks, NOT 2026-27 professional content certification.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const grab=file=>fs.readFileSync(path.join(root,file),'utf8');
const sb={window:{}};
vm.runInNewContext(grab('notes-visual-workbook-data.js'),sb,{timeout:1000});
const source=sb.window.LedgerVisualWorkbook;
const errors=[];
const money=v=>Number(String(v||'0').replace(/,/g,''))||0;
const required=['FA1:B1','FA1:B2','FA1:E1','FA2:B2','FA2:C1','FA2:C2','FA2:F1'];
for(const key of required){
 const l=source.topics[key];
 if(!l){errors.push('missing: '+key);continue}
 if(l.sections.length<4)errors.push('too few teaching sections: '+key);
 if(l.drills.length<3)errors.push('too few applied checks: '+key);
 if(l.objectives.length<3)errors.push('missing clear objectives: '+key);
 for(const s of l.sections){
   if(s.paras.join(' ').length<160)errors.push('short instructional section: '+key+' '+s.heading);
 }
}
const w=source.worked;
for(const a of w.accounts){
 const d=a.debit.reduce((n,x)=>n+money(x[1]),0);
 const c=a.credit.reduce((n,x)=>n+money(x[1]),0);
 if(d!==c)errors.push('unbalanced T account '+a.name+' Dr '+d+' Cr '+c);
}
const d=w.journals.reduce((n,x)=>n+money(x[2]),0);
const c=w.journals.reduce((n,x)=>n+money(x[3]),0);
if(d!==c||d!==70400)errors.push('journal totals '+d+'/'+c+' should both be RM70,400');
const tb=w.trial;
const dt=tb.slice(0,-1).reduce((n,x)=>n+money(x[1]),0);
const ct=tb.slice(0,-1).reduce((n,x)=>n+money(x[2]),0);
if(dt!==ct||dt!==45700)errors.push('trial balance totals '+dt+'/'+ct+' should both be RM45,700');
if(money(tb.at(-1)[1])!==dt||money(tb.at(-1)[2])!==ct)errors.push('trial balance reported total mismatch');
if(money(w.pAndL.at(-1)[1])!==5600)errors.push('profit calculation mismatch');
if(money(w.sofp.find(x=>x[0]==='TOTAL ASSETS')?.[1])!==39000||
 money(w.sofp.find(x=>x[0]==='LIABILITIES + EQUITY')?.[1])!==39000)errors.push('financial statements fail to reconcile');
const html=grab('notes.html');
const tags=['notes-visual-workbook-data.js','notes-visual-workbook.js','notes-page.js'];
if(tags.some(x=>!html.includes(x)))errors.push('missing script reference');
if(!(html.indexOf(tags[0])<html.indexOf(tags[1])&&html.indexOf(tags[1])<html.indexOf(tags[2])))errors.push('scripts load out of order');
const page=grab('notes-page.js');
new vm.Script(page,{filename:'notes-page.js'});
new vm.Script(grab('notes-visual-workbook.js'),{filename:'notes-visual-workbook.js'});
if(!page.includes('renderLedgerVisualWorkbook(main,key)'))errors.push('workbook not attached');
if(!page.includes('notes-lesson-layout--visual'))errors.push('workbook not full-width');
if(!html.includes('value="visual"'))errors.push('workbook filter missing');
for(const file of ['assets/ledgerpeer-accounting-flow.svg','assets/ledgerpeer-double-entry-rules.svg']){
 const svg=grab(file);
 if(!svg.includes('<svg')||!svg.includes('</svg>')||!svg.includes('<title'))errors.push('SVG invalid: '+file);
}
console.log('LEDGERPEER VISUAL WORKBOOK: '+required.length+' topic modules checked');
console.log('General journal: RM '+d.toLocaleString('en-US')+' debit = RM '+c.toLocaleString('en-US')+' credit');
console.log('Trial balance: RM '+dt.toLocaleString('en-US')+' debit = RM '+ct.toLocaleString('en-US')+' credit');
console.log('Net profit: RM 5,600; assets and (liabilities+equity): RM 39,000');
console.log('No automatic assertion of professional-level or full syllabus completeness.');
errors.forEach(e=>console.error('FAIL',e));
if(errors.length)process.exitCode=1;else console.log('ALL STRUCTURAL/ARITHMETIC TESTS PASSED');
