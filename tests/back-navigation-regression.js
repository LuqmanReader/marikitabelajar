'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const activePages=[
 'about.html','add-exam.html','ai-tutor.html','calendar.html',
 'classroom.html','fia-study.html','hub.html','notes.html',
 'profile.html','quant-model.html','quiz.html','study-planner-3d.html',
 'study-planner.html','tymbaflex-bridge.html','tymbaflex-revision.html','view.html'
];
const renderedByCore=new Set(['calendar.html','study-planner.html','study-planner-3d.html']);
const core=read('productivity-core.js');
const coreHeader=core.match(/function header\(title,desc\)\{return (['"])([\s\S]*?)\1\}/)?.[2]||'';
assert.ok(coreHeader.includes('class=\\"site-back\\"')&&coreHeader.includes('href=\\"index.html\\"')&&coreHeader.includes('← BACK TO HOME'),'Shared Calendar/Planner renderer must expose Back to Home in its header');
assert.ok(core.includes('header(title,desc)+content'),'Calendar/Planner shell must render the header');
const backAnchor=/<a\b[^>]*>[^<]*← BACK TO HOME<\/a>/g;
for(const file of activePages){
 const html=read(file);
 assert.ok(html.includes('site-nav.css'),'Shared back button design missing: '+file);
 if(renderedByCore.has(file)){
   assert.ok(html.includes("loadScript('productivity-core.js')"),'Page must load shared Back to Home renderer: '+file);
   continue;
 }
 const body=html.slice(html.indexOf('<body'));
 const anchors=[...body.matchAll(backAnchor)].map(m=>({markup:m[0],offset:m.index}));
 const visible=anchors.find(a=>a.markup.includes('site-back')&&/href="index\.html(?:#access)?"/.test(a.markup)&&a.offset<5000&&!/\bhidden(?:=|\s|>)/.test(a.markup));
 assert.ok(visible,'Prominent visible Back to Home control missing near top of '+file);
}
for(const file of ['add-exam.html','ai-tutor.html','fia-study.html','notes.html','quant-model.html','quiz.html','tymbaflex-bridge.html','tymbaflex-revision.html','view.html']){
 const html=read(file);
 const expected=(file==='fia-study.html')?'notes.html?edition=fia-2':(file==='quiz.html'?'notes.html':'hub.html');
 assert.ok(html.includes('href="'+expected+'"'),'Contextual parent route removed: '+file);
}
assert.ok(read('tymbaflex-revision.html').indexOf('← BACK TO HOME')<read('tymbaflex-revision.html').indexOf('class="tf-hero"'),'TYMBAFlex Back button must appear above its oversized hero');
assert.ok(read('index.html').includes('id="hubView"'),'Homepage must remain the root destination');
for(const page of ['achievements.html','financial-manager.html','financial-dashboard.html'])assert.ok(/location\.replace\(/.test(read(page)),'Retired redirect must stay functional: '+page);
console.log('PASS: 16 active secondary pages have visible Back to Home controls; legacy redirect pages and root homepage intentionally exempt.');
