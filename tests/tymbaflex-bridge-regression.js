'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('tymbaflex-bridge-parser.js');
const page=read('tymbaflex-bridge.html'),js=read('tymbaflex-bridge.js'),style=read('tymbaflex-bridge.css');
const manifest=JSON.parse(read('extension/tymbaflex-bridge/manifest.json'));
const worker=read('extension/tymbaflex-bridge/service-worker.js');
const content=read('extension/tymbaflex-bridge/tymba-content.js');
const receiver=read('extension/tymbaflex-bridge/ledgerpeer-content.js');
const schema=read('supabase/tymbaflex-bridge-schema.sql'),auth=read('auth.js');
for(const [file,code] of [['browser parser',source],['website',js],['worker',worker],['content',content],['receiver',receiver]]){
 assert.doesNotThrow(()=>new Function(code),file+' must be valid JS');
}
const context={window:{},URL};vm.runInNewContext(source,context);
const parser=context.window.TymbaBridgeParser;
assert.ok(parser,'Parser must be exported');
assert.equal(parser.safeCourse('twofive.flex.tymbaedu.com','758'),'https://twofive.flex.tymbaedu.com/course/view.php?id=758');
assert.equal(parser.safeCourse('attacker.example','758'),'','Never accept unknown hosts');
assert.equal(parser.safeCourse('ile.flex.tymbaedu.com','1&token=exposed'),'','Reject suspicious course IDs');
const clean=parser.safeActivity('https://twofive.flex.tymbaedu.com/mod/quiz/view.php?id=29007&sesskey=private','twofive.flex.tymbaedu.com');
assert.equal(clean.url,'https://twofive.flex.tymbaedu.com/mod/quiz/view.php?id=29007','Only retain whitelisted module ID, no tokens');
assert.equal(parser.safeActivity('https://twofive.flex.tymbaedu.com/admin/tool/directsso/login.php?token=private','twofive.flex.tymbaedu.com'),null,'Never copy SSO links');
assert.equal(parser.safeActivity('https://attacker.example/mod/quiz/view.php?id=2','twofive.flex.tymbaedu.com'),null,'Never send off-site activity links');
assert.equal(parser.safeActivity('javascript:alert(1)','twofive.flex.tymbaedu.com'),null,'Reject dangerous schemes');
const samplePortal={
 props:{
  auth:{user:{email:'student@example.com',password:'DO_NOT_SAVE',two_factor_secret:'DO_NOT_SAVE'}},
  courses:{data:[
   {lms_instance_name:'twofive',lms_course_id:758,subject:{name:'Financial Accounting 2'},student_group:{name:'Group B'},lms_url:'https://twofive.flex.tymbaedu.com/admin/tool/directsso/login.php?token=PRIVATE'},
   {lms_instance_name:'ile',lms_course_id:5,subject:{name:'Management Accounting 2 - Videos & Notes'},student_group:null},
   {lms_instance_name:'evil',lms_course_id:999,subject:{name:'Unknown'}}
  ]}
 }
};
const fakePortal={querySelector:selector=>selector==='[data-page]'?{getAttribute:()=>JSON.stringify(samplePortal)}:null};
const portal=parser.fromDocument(fakePortal,'https://flex.tymbaedu.com/');
assert.equal(portal.kind,'portal');
assert.equal(portal.email,'student@example.com');
assert.equal(portal.courses.length,2,'Discover only recognized course hosts');
assert.equal(portal.courses[0].source_url,'https://twofive.flex.tymbaedu.com/course/view.php?id=758','Do not reuse embedded SSO links');
assert.equal(JSON.stringify(portal).includes('DO_NOT_SAVE'),false,'Never export passwords or second-factor data');
assert.equal(JSON.stringify(portal).includes('directsso'),false,'Never export direct login URLs');
const validQuiz={getAttribute:k=>k==='href'?'https://twofive.flex.tymbaedu.com/mod/quiz/view.php?id=29007&sesskey=SENSITIVE':''};
const validRow={
 getAttribute:key=>key==='data-id'?'29007':'',
 querySelector:selector=>({
  '.activityname a[href]':validQuiz,
  '[data-activityname]':{getAttribute:()=> 'Chapter 1 set 1'},
  '.completioninfo.completion_complete, .completioninfo.completion_pass, [data-region="activity-information"] .badge-success':null
 })[selector]||null
};
const section={
 getAttribute:key=>key==='data-sectionname'?'Assessment':null,
 querySelector:()=>null,
 querySelectorAll:()=>[validRow]
};
const moodleDoc={
 querySelector:sel=>sel==='h1'?{textContent:'Group B - Financial Accounting 2'}:null,
 querySelectorAll:sel=>sel==='.course-section'?[section]:[],
 title:'Course: Group B - Financial Accounting 2 | TYMBAFlex'
};
const moodle=parser.fromDocument(moodleDoc,'https://twofive.flex.tymbaedu.com/course/view.php?id=758');
assert.equal(moodle.kind,'moodle');
assert.equal(moodle.courses[0].activities.length,1,'Read visible course activities');
assert.equal(moodle.courses[0].activities[0].name,'Chapter 1 set 1');
assert.equal(moodle.courses[0].activities[0].section,'Assessment');
assert.equal(moodle.courses[0].activities[0].url,'https://twofive.flex.tymbaedu.com/mod/quiz/view.php?id=29007');
assert.equal(JSON.stringify(moodle).includes('SENSITIVE'),false,'Never export embedded session keys');
assert.equal(parser.fromDocument(moodleDoc,'https://twofive.flex.tymbaedu.com/mod/quiz/attempt.php?attempt=123'),null,'Never read attempted-question pages');
assert.equal(parser.detectSavedUrl('<!-- saved from url=(0056)https://twofive.flex.tymbaedu.com/course/view.php?id=758 -->'),'https://twofive.flex.tymbaedu.com/course/view.php?id=758');
assert.equal(manifest.manifest_version,3,'Use supported Manifest V3');
assert.ok(!manifest.permissions.includes('cookies')&&!manifest.permissions.includes('webRequest'),'Bridge needs no browser cookies or network monitoring permissions');
assert.ok(manifest.host_permissions.every(host=>host.includes('tymbaedu.com')||host.includes('luqmanreader.github.io')),'Limit allowed hosts');
assert.ok(worker.includes('sender.frameId!==0')&&worker.includes('caller.origin+caller.pathname!==BRIDGE'),'Other pages must not trigger the extension');
assert.ok(worker.includes('chrome.tabs.sendMessage'),'Read visible page content, not hidden institutional APIs');
assert.ok(!worker.includes('fetch('),'Extension must not fetch TYMBAFlex protected resources');
assert.ok(page.includes('tbFiles')&&page.includes('tbSyncTabs'),'Both local HTML import and live-tab sync are available');
assert.ok(page.includes('id="tbConsent"'),'Students must consent before importing their saved TYMBAFlex pages');
assert.ok(js.includes("if(!consent.checked)"),'Consent must be enforced before both file imports and tab sync');
assert.ok(!js.includes("normalize(portal.email)!==normalize(user.email)"),'Different institutional and LedgerPeer emails must not block a consented file import');
assert.ok(js.includes("if(!portal)throw Error('Include Home - TYMBAFlex.html"),'Course authorization must be scoped to the saved TYMBAFlex home course list');
assert.ok(page.includes('tymbaflex-bridge.js?v=2'),'Updated import script must bypass stale browser caches');
assert.ok(page.includes('tymbaflex-bridge.css?v=3'),'Consent controls must use latest styles');
assert.ok(js.includes("client.from('tymbaflex_bridge_courses')"),'Persist user-owned snapshots');
assert.ok(!js.includes('setPassword')&&!js.includes('passwordInput'),'Bridge never captures passwords');
assert.ok(style.includes('.tb-course-grid'),'Provide a course display');
assert.ok(schema.includes('enable row level security'),'RLS required');
assert.ok(schema.includes('(select auth.uid()) = user_id'),'Students see only own rows');
assert.ok(schema.includes('revoke all on public.tymbaflex_bridge_courses from anon'),'Anonymous users must have no access');
assert.ok(auth.includes("'tymbaflex-bridge.html'"),'Auth redirects should support bridge');
console.log('PASS: TYMBAFlex bridge safely identifies courses and activities, strips sensitive SSO/session data, and restricts syncing to consenting account owners.');
