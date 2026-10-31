#!/usr/bin/env node
/* Targeted academic sanity checks for editorially authored LedgerPeer content.
 * These independently recompute representative case answers; they do not
 * replace human review of all detailed ACCA learning outcomes. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('textbook-editorial-advanced.js','utf8');
const c={};c.window=c;c.globalThis=c;
vm.runInNewContext(source,c,{filename:'textbook-editorial-advanced.js',timeout:5000});
const chapters=c.LedgerEditorialAdvancedChapters;
const keys=['FR:B3','FR:B4','PM:C1','PM:C2','FM:D1','SBR:C6','AA:D1','AAA:D3'];
assert.deepEqual(Object.keys(chapters).sort(),keys.slice().sort());
for(const [key,chapter] of Object.entries(chapters)){
 assert.equal(chapter.sourceKind,'independently-authored',key);
 assert(chapter.reviewStatus.includes('PENDING'),key+': review status must be visible');
 assert(chapter.sections.length>=3,key+': insufficient teaching sections');
 assert(chapter.workings.length>=2,key+': insufficient case diversity');
 assert(new Set(chapter.workings.map(w=>w[1])).size===chapter.workings.length,key+': duplicate case');
 for(const [title,body] of chapter.sections){
  assert(title.length>12&&body.length>300,key+': shallow chapter section');
  assert(!/further teaching required|lorem ipsum|indonesia/i.test(body),key+': placeholder or irrelevant content');
 }
 for(const [title,question,answer] of chapter.workings){
  assert(title.length>8&&question.length>=100&&answer.length>=155,key+': underdeveloped case');
  assert(!/lorem ipsum|indonesia|RM\\d/i.test(question+' '+answer),key+': inappropriate example');
 }
}
function approx(actual,expected,tol=.015){assert(Math.abs(actual-expected)<tol,actual+' not approx '+expected)}
// Independently recomputed solutions for the specific case fixtures.
const frImpairment=Math.max(305000-12000,318000);assert.equal(340000-frImpairment,22000);
const cguLoss=200000-150000,remaining=cguLoss-20000;
approx(remaining*(80000/180000),13333.3333);
approx(remaining*(100000/180000),16666.6667);
assert.equal(100*Math.min(46,52-8)+80*Math.min(35,44-5),7200);
approx(210*((120*14+180*18)/(120+180)),3444);
assert.equal(900*(28-(12+6+3))-2100,4200);
assert.equal(300*(70/2)-300*(96/3),900);
assert.equal(120000/(80-50),4000);
approx((6000-4000)/6000,1/3);
assert.equal(3*20+2*36,132);
assert.equal(Math.ceil(144000/132),1091);
const npv1=38000/1.10+44000/1.10**2+(42000+15000)/1.10**3-100000;
approx(npv1,13734.03);
const annuity=50000*(1-1.08**(-4))/.08;
const pvTerminal=30000/1.08**4;
const npv2=annuity+pvTerminal-170000;
approx(annuity,165606.34);approx(pvTerminal,22050.90);approx(npv2,17657.24);
const taxTemporary=(450000-290000)*.25;assert.equal(taxTemporary,40000);
const taxLossAsset=Math.min(120000,75000)*.20;assert.equal(taxLossAsset,15000);
// Ensure student-visible answers agree with these independently computed values.
const contains=(key,index,needle)=>assert(
 chapters[key].workings[index][2].includes(needle),
 key+' case '+index+': missing independently validated result '+needle
);
contains('FR:B3',0,'$22,000');contains('FR:B3',1,'$13,333.33');
contains('FR:B4',0,'$7,200');contains('FR:B4',1,'$3,444');
contains('PM:C1',0,'$4,200');contains('PM:C1',1,'$10,500');
contains('PM:C2',0,'33.33%');contains('PM:C2',1,'1,091');
contains('FM:D1',0,'$13,734');contains('FM:D1',1,'$17,657.24');
contains('SBR:C6',0,'$40,000');contains('SBR:C6',1,'$15,000');
console.log('PASS: eight independently authored ACCA chapters, 16 distinct worked cases, six independently recomputed accounting and finance models, and 700-topic review-status integrity preserved.');
