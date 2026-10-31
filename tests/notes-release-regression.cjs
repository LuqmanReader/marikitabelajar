#!/usr/bin/env node
/* Regression: explicitly identify Notes UI builds, detect stale open tabs and
 * reload to a cache-busted URL preserving the selected paper/topic.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const build='2026.10.31.11';
const html=fs.readFileSync('notes.html','utf8');
const manifest=JSON.parse(fs.readFileSync('notes-release.json','utf8'));
const page=fs.readFileSync('notes-page.js','utf8');
const renderer=fs.readFileSync('notes-visual-all.js','utf8');
assert.equal(manifest.build,build);
assert(html.includes('window.LedgerNotesDocumentBuild="'+build+'"'));
assert(html.includes('notes-visual-all.js?v=20261031chapters12'));
assert(html.includes('notes-page.js?v=20261031chapters18'));
assert(html.includes('notes-build.js?v=20261031chapters2'));
assert(html.includes('notes.css?v=20261031chapters2'));
assert(renderer.includes("root.LedgerNotesVisualBuild='"+build+"'"));
assert(page.includes("root.LedgerNotesVisualBuild!=='"+build+"'"));
assert(!renderer.includes("function connector(svg,"));
let assigned='';
const ids={};
class E{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.hidden=false;this.textContent='';this.firstChild=null;}
 set id(value){this._id=value;ids[value]=this}
 get id(){return this._id}
 setAttribute(){}
 append(...children){this.children.push(...children);this.firstChild=this.children[0]}
 insertBefore(child){this.children.unshift(child);this.firstChild=this.children[0]}
 addEventListener(name,callback){this.events[name]=callback}
}
const main=new E('main');main.id='notesApp';
const stamp=new E('button');stamp.id='notesBuildStamp';
const body=new E('body');const listeners={};
let latest=build,fetchChecks=0;
const win={
 LedgerNotesDocumentBuild:build,
 location:{
  href:'https://example.org/marikitabelajar/notes.html?paper=FA1&topic=A2',
  assign(url){assigned=url}
 },
 fetch:async(url,options)=>{
  fetchChecks++;
  assert.match(url,/notes-release\.json\?check=\d+/);
  assert.equal(options.cache,'no-store');
  return{ok:true,json:async()=>({build:latest})};
 },
 addEventListener(name,callback){listeners[name]=callback},
 setInterval(){}
};
const doc={
 baseURI:'https://example.org/marikitabelajar/notes.html',
 readyState:'complete',
 body,
 hidden:false,
 createElement:tag=>new E(tag),
 getElementById:id=>ids[id]||null,
 addEventListener(name,callback){listeners['document:'+name]=callback}
};
vm.runInNewContext(fs.readFileSync('notes-build.js','utf8'),{window:win,document:doc,URL,Date,console},{filename:'notes-build.js'});
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(stamp.textContent,/2026\.10\.31\.10/);
 assert.equal(ids.notesReleaseStatus.hidden,true,'No false update banner when current');
 latest='2026.10.31.12';
 await win.LedgerNotesCheckForUpdates();
 assert.equal(ids.notesReleaseStatus.hidden,false,'A newer manifest must show update banner');
 assert.match(ids.notesReleaseMessage.textContent,/2026\.10\.31\.11/);
 assert(ids.notesReleaseReload.events.click,'Reload button must work');
 ids.notesReleaseReload.events.click();
 const u=new URL(assigned);
 assert.equal(u.searchParams.get('paper'),'FA1');
 assert.equal(u.searchParams.get('topic'),'A2');
 assert.equal(u.searchParams.get('lp_build'),build);
 assert(u.searchParams.get('lp_fresh'),'Reload must bypass cached HTML');
 assert.equal(u.hash,'#library');
 assert(fetchChecks>=2,'Stale manifest was checked');
 console.log('PASS: Notes build marker, coherent script versions, update detection, and cache-busted reload');
})().catch(error=>{console.error(error);process.exitCode=1});
