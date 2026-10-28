'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'study-planner-page.js'),'utf8');
const core=fs.readFileSync(path.join(root,'productivity-core.js'),'utf8');
const planner=fs.readFileSync(path.join(root,'study-planner.html'),'utf8');
const independent=fs.readFileSync(path.join(root,'study-planner-3d.html'),'utf8');
const styles=fs.readFileSync(path.join(root,'study-contributions.css'),'utf8');
const contributions=require('../study-contributions.js');
assert.doesNotThrow(()=>new Function(source),'Study Planner must parse');
assert.ok(source.includes("sessionHistoryHtml()+'</div>"),'Logged sessions must appear beneath logging form');
assert.ok(source.includes("document.addEventListener('click'")&&source.includes("button.closest('#sessionHistory')"),'Use delegated delete actions scoped to session history');
assert.ok(source.includes('db.sessions.splice(index,1)'),'Delete only the selected session');
assert.ok(source.includes('save();\n render();'),'Persist a deletion and rebuild the graph');
assert.ok(styles.includes('.session-history-row')&&styles.includes('.session-delete'),'Study session history and delete buttons must be styled');
for(const html of [planner,independent]){
 assert.ok(html.includes("study-planner-page.js?v=20261028f"),'Updated logging code must bypass browser cache');
 assert.ok(html.includes('study-contributions.css?v=20261028f'),'History CSS must bypass browser cache');
}
const start=source.indexOf('function sessionTimeLabel('),end=source.indexOf('function render(){',start);
assert.ok(start>=0&&end>start,'Session operations must be defined before page render');
const sample={
 tasks:[],
 sessions:[
  {id:'repeat',subject:'FA2',topic:'Receivables',date:'2026-10-27T10:00:00.000Z',minutes:'45'},
  {id:'repeat',subject:'MA2',topic:'<img src=x onerror=alert(1)>',date:'2026-10-28T10:00:00.000Z',minutes:'30'},
  {id:'older',subject:'FA2',topic:'Ledgers',date:'2026-10-20T10:00:00.000Z',minutes:'60'}
 ]
};
let approved=false,saves=0,renders=0;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const methods=new Function('db','save','render','confirm','esc',source.slice(start,end)+';return {sessionHistoryHtml,deleteStudySession,sessionTimeLabel}')(sample,()=>{saves++},()=>{renders++},()=>approved,esc);
const first=methods.sessionHistoryHtml();
assert.ok(first.includes('RECORDED STUDY SESSIONS'),'History title must be clear');
assert.ok(first.includes('data-delete-session="1"'),'Newest session button must refer to original array index');
assert.ok(first.indexOf('30 MIN')<first.indexOf('45 MIN'),'Session history must show newest first');
assert.ok(!first.includes('<img src=x onerror=alert(1)>'),'User-supplied topics must not inject HTML');
assert.ok(first.includes('&lt;img src=x onerror=alert(1)&gt;'),'User-supplied topics should be rendered as escaped text');
assert.ok(first.includes('aria-label="Delete 30 minute session'),'Delete action must be accessible');
const on=new Date(2026,9,28,12);
assert.equal(contributions.build(sample,on).totalMinutes,135,'Initial contribution minutes must match saved sessions');
methods.deleteStudySession(1);
assert.equal(sample.sessions.length,3,'Cancelling confirmation must preserve sessions');
assert.equal(saves,0,'Cancelled deletion must not save changes');
approved=true;
methods.deleteStudySession(1);
assert.equal(sample.sessions.length,2,'Delete exactly one entry');
assert.equal(sample.sessions[0].id,'repeat','Another session with the same id must survive');
assert.equal(sample.sessions[1].id,'older','Older session must survive');
assert.equal(saves,1,'Deletion must persist exactly once');
assert.equal(renders,1,'Deletion must rebuild Study Planner and its graph');
assert.equal(contributions.build(sample,on).totalMinutes,105,'Removing 30 minutes must update graph totals');
assert.equal(contributions.build(sample,on).days.get('2026-10-28'),undefined,'Deleted only activity for a day must remove its contribution');
methods.deleteStudySession(-1);methods.deleteStudySession(42);methods.deleteStudySession(0.5);
assert.equal(saves,1,'Invalid indexes must never mutate records');
methods.deleteStudySession(0);
assert.equal(sample.sessions.length,1,'Another session can also be deleted');
assert.equal(contributions.build(sample,on).totalMinutes,60,'Repeated deletes must recompute minutes');
assert.equal(saves,2);
methods.deleteStudySession(0);
assert.equal(sample.sessions.length,0,'Every study session can be deleted individually');
assert.ok(methods.sessionHistoryHtml().includes('No study sessions logged yet.'),'Empty history must be clear');
assert.equal(contributions.build(sample,on).totalMinutes,0,'Cleared history must reset minutes');
assert.equal(contributions.build(sample,on).activeDays,0,'Deleted study sessions must no longer contribute to 3D graph');
console.log('PASS: Study sessions can be viewed, confirmed, individually deleted, saved and reflected in 3D contributions.');
