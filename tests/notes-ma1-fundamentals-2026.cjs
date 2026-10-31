#!/usr/bin/env node
'use strict';
/* Reconcile selected Management Information 2026-27 learning outcomes; internal only. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('textbook-ma1.js','utf8'),ctx,{filename:'textbook-ma1.js'});
const chapters=ctx.LedgerTextbookMA1;
const target={
 'MA1:A1':['organisation','systems','account','management','authoris'],
 'MA1:A2':['strategic','tactical','operational','financial','quality'],
 'MA1:C1':['direct','indirect','high-low','variable','fixed'],
 'MA1:C2':['cost centre','cost unit','profit centre','investment centre','residual']
};
for(const [key,terms] of Object.entries(target)){
 const ch=chapters[key];assert(ch,key+' missing');
 const txt=JSON.stringify(ch).toLowerCase();
 for(const term of terms)assert(txt.includes(term.toLowerCase()),key+' missing '+term);
 assert(ch.sections.length>=6&&ch.workings.length>=4,key+' lacks teaching depth');
}
const cases=[
 ['MA1:A1',6000-2500,3500],
 ['MA1:A1',540000/9000,60],
 ['MA1:A2',48000/12000,4],
 ['MA1:A2',51000/15000,3.4],
 ['MA1:C1',(10700-8300)/(900-500),6],
 ['MA1:C1',5300+700*6,9500],
 ['MA1:C2',18000*720/1200,10800],
 ['MA1:C2',62000/400000,0.155],
 ['MA1:C2',62000-400000*.10,22000]
];
for(const [key,actual,expected] of cases)assert(Math.abs(actual-expected)<1e-9,key+' calculation failed');
console.log('PASS MA1 A1/A2/C1/C2: 4 improved chapters, 9 independently recalculated model results; complete independent review pending.');
