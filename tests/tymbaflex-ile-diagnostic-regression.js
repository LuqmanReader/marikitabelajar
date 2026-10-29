'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('extension/tymbaflex-bridge/manifest.json'));
const diagnostic=read('extension/tymbaflex-bridge/ile-diagnostic.js');
const popup=read('extension/tymbaflex-bridge/popup.js');
const html=read('extension/tymbaflex-bridge/popup.html');
const css=read('extension/tymbaflex-bridge/popup.css');
const parser=read('tymbaflex-bridge-parser.js');
assert.equal(manifest.version,'0.3.0');
assert.equal(manifest.action.default_popup,'popup.html');
assert.deepEqual(manifest.permissions,['tabs'],'Do not request cookies, requests, history or passwords');
const injected=manifest.content_scripts.find(s=>s.js.includes('ile-diagnostic.js'));
assert.deepEqual(injected.matches,['https://ile.flex.tymbaedu.com/*','https://twofive.flex.tymbaedu.com/*'],'Diagnostic runs on ILE and Group B only');
assert.ok(injected.js.indexOf('parser.js')<injected.js.indexOf('ile-diagnostic.js'),'Sanitizing parser must load first');
assert.ok(html.includes('id="scan"')&&html.includes('id="export"'),'Popup provides explicit scan and export');
assert.ok(html.includes('id="category"')&&html.includes('id="activityList"'),'Popup has activity filters');
assert.ok(css.includes('.pill.done')&&css.includes('.pill.todo'),'Show completion separately');
for(const s of [diagnostic,popup,parser])assert.doesNotThrow(()=>new Function(s));
assert.ok(!/fetch\(|XMLHttpRequest|chrome\.cookies|chrome\.webRequest/.test(diagnostic),'Diagnostic must never call an API or inspect cookies');
assert.ok(popup.includes('chrome.tabs.query({active:true,currentWindow:true})'),'Scan active Chrome tab on user request only');
assert.ok(popup.includes('chrome.tabs.sendMessage(tab.id'),'Read only in-page data');
assert.ok(popup.includes("ALLOWED_HOSTS=new Set(['ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com'])"),'Popup must permit exactly the two TYMBAFlex Moodle domains');
assert.ok(popup.includes("u.hostname!==host"),'The popup must reject cross-site activity URLs');
assert.ok(popup.includes('LP_DIAG_TYMBA_COURSE'),'Reuse unified scan request for either site');
assert.ok(html.includes('Group B FA2/MA2'),'Popup should visibly mention Group B');
assert.ok(popup.includes("if(!report)return;"),'Export button should require a completed scan');
assert.ok(!/localStorage|chrome\.storage/.test(popup),'No diagnostic persistence');
const chrome={runtime:{onMessage:{addListener:()=>{}}}},window={TymbaBridgeParser:{}};
function makeItem(name,type,buttonText,number,host='ile.flex.tymbaedu.com'){
 const url='https://'+host+'/mod/'+type+'/view.php?id='+number+'&sesskey=SENSITIVE';
 const link={getAttribute:k=>k==='href'?url:'',textContent:name};
 return {
  getAttribute:k=>k==='data-id'?String(number):null,
  querySelector:selector=>{
   if(selector==='.activityname a[href]')return link;
   if(selector==='.activity-item[data-activityname]')return {getAttribute:()=>name};
   if(selector==='.activity-completion [data-region="completionrequirements"] button')
    return buttonText?{textContent:buttonText}:null;
   return null;
  }
 };
}
const ctx={chrome,window,URL,Date,document:{}};
vm.runInNewContext(parser,ctx);
ctx.window.TymbaBridgeParser=ctx.window.TymbaBridgeParser;
vm.runInNewContext(diagnostic,ctx);
const inspect=ctx.window.LedgerPeerCourseDiagnostic.inspect;
assert.equal(ctx.window.LedgerPeerILEDiagnostic.inspect,inspect,'Existing ILE diagnostic remains compatible');
assert.equal(inspect({},'https://evil.example/course/view.php?id=5').ok,false,'Reject foreign hosts');
assert.equal(inspect({},'https://ile.flex.tymbaedu.com/mod/quiz/attempt.php?id=5').ok,false,'Never scan attempt pages');
const maRows=Array.from({length:23},(_,i)=>makeItem('Tutorial Chapter '+(i+1),'quiz',i<4?'Done':'To do',678+i));
const maDoc={
 querySelector:s=>s==='h1'?{textContent:'Management Accounting 2 (MA2)'}:null,
 querySelectorAll:s=>s==='.course-section'?[{
  getAttribute:()=> 'Chapter tutorials',
  querySelectorAll:()=>maRows
 }]:[],
 title:'MA2'
};
const ma=inspect(maDoc,'https://ile.flex.tymbaedu.com/course/view.php?id=5&sesskey=PRIVATE');
assert.equal(ma.totals.tutorial,23,'Identify all MA2 tutorials');
assert.equal(ma.totals.done,4,'Read four MA2 Done indicators');
assert.equal(ma.totals.todo,19,'Read To do accurately');
assert.equal(JSON.stringify(ma).includes('SENSITIVE'),false,'Never export session keys');
assert.equal(JSON.stringify(ma).includes('PRIVATE'),false,'Never export raw page query parameters');
const faRows=[
 ...Array.from({length:38},(_,i)=>makeItem('Chapter '+(i%11+1)+' - Set '+(Math.floor(i/11)+1),'quiz',null,100+i)),
 makeItem('FA2 Progress Test 1','quiz',null,250),
 makeItem('FA2 Progress Test 2','quiz',null,251),
 makeItem('FA2 Mock Examination 1','quiz',null,252),
 makeItem('FA2 Mock Examination 2','quiz',null,253)
];
const faDoc={
 querySelector:s=>s==='h1'?{textContent:'Financial Accounting 2 (FA 2)'}:null,
 querySelectorAll:s=>s==='.course-section'?[{
  getAttribute:()=> 'FA2 chapter sets',
  querySelectorAll:()=>faRows
 }]:[],
 title:'FA2'
};
const fa=inspect(faDoc,'https://ile.flex.tymbaedu.com/course/view.php?id=11');
assert.equal(fa.totals.quiz,42);
assert.equal(fa.totals.chapter_set,38);
assert.equal(fa.totals.progress_test,2);
assert.equal(fa.totals.mock,2);
assert.equal(fa.totals.unknown,42,'Unknown must not be mislabelled as unfinished');
assert.equal(fa.totals.tutorial,0,'FA2 set naming is different from MA2');
const groupBFA2={
 querySelector:s=>s==='h1'?{textContent:'Group B - Financial Accounting 2 (FA2)'}:null,
 querySelectorAll:s=>s==='.course-section'?[{
  getAttribute:()=> 'Chapter 2',querySelectorAll:()=>[
   makeItem('Chapter 2 set 2','quiz','Done',29011,'twofive.flex.tymbaedu.com'),
   makeItem('CHAPTER 9 SET 2','quiz','To do',30584,'twofive.flex.tymbaedu.com'),
   makeItem('Progress Test 1','quiz',null,30500,'twofive.flex.tymbaedu.com')
  ]
 }]:[],title:'Group B FA2'
};
const bfa=inspect(groupBFA2,'https://twofive.flex.tymbaedu.com/course/view.php?id=758&sesskey=SECRET');
assert.equal(bfa.ok,true,'The Group B FA2 page must be supported');
assert.equal(bfa.site,'Group B / TwoFive');
assert.equal(bfa.host,'twofive.flex.tymbaedu.com');
assert.equal(bfa.totals.chapter_set,2,'Group B FA2 chapter set names are recognised');
assert.equal(bfa.totals.progress_test,1,'Group B progress tests are recognised');
assert.equal(bfa.totals.done,1);
assert.equal(bfa.totals.todo,1);
assert.equal(bfa.totals.unknown,1);
assert.equal(bfa.items[0].url,'https://twofive.flex.tymbaedu.com/mod/quiz/view.php?id=29011');
assert.equal(JSON.stringify(bfa).includes('SENSITIVE'),false,'Do not export Group B tokens');
assert.equal(JSON.stringify(bfa).includes('SECRET'),false,'Do not export Group B session keys');
const groupBMA2={
 querySelector:s=>s==='h1'?{textContent:'Group B - Management Accounting 2 (MA2)'}:null,
 querySelectorAll:s=>s==='.course-section'?[{
  getAttribute:()=> 'Assessments',querySelectorAll:()=>[
   makeItem('Quiz 29/9/26','quiz',null,29309,'twofive.flex.tymbaedu.com'),
   makeItem('Tutorial Chapter 1','quiz','Done',29310,'twofive.flex.tymbaedu.com'),
   makeItem('Chapter 1 set 1','quiz','To do',29311,'twofive.flex.tymbaedu.com')
  ]
 }]:[],title:'Group B MA2'
};
const bma=inspect(groupBMA2,'https://twofive.flex.tymbaedu.com/course/view.php?id=757');
assert.equal(bma.ok,true,'The Group B MA2 page must be supported');
assert.equal(bma.totals.quiz,3);
assert.equal(bma.totals.other_quiz,undefined,'Other quizzes are included in item list but not an invented totals field');
assert.equal(bma.totals.tutorial,1);
assert.equal(bma.totals.chapter_set,1);
assert.equal(bma.items[0].category,'other_quiz','Dated Group B MA2 quiz names must not be labelled as tutorials');
assert.equal(bma.items[0].completion,'unknown','Unknown completion is not a grade');
assert.equal(inspect(groupBMA2,'https://twofive.flex.tymbaedu.com/mod/quiz/attempt.php?id=757').ok,false,'Never inspect exam attempt pages');
assert.ok(popup.includes("category==='all'||x.category===category"),'Popup category filtering remains wired');
assert.ok(parser.includes('completion_status'),'Current Chrome bridge must preserve accurate Moodle completion status');
console.log('PASS: ILE + Group B FA2/MA2 diagnostics classify tutorial, chapter set, progress test and other quizzes safely.');
