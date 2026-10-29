/* LedgerPeer single-tab workspace: persistent music player in the parent
   document, ordinary existing site pages inside a same-origin content iframe.
   Child navigations do not replace the parent document or its Spotify iframe. */
(()=>{
'use strict';
const frame=document.getElementById('lpContentFrame');
if(!frame)return;
const names=new Set([
 'index.html','hub.html','notes.html','quiz.html','classroom.html',
 'profile.html','study-planner.html','study-planner-3d.html','calendar.html',
 'tymbaflex-revision.html','tymbaflex-bridge.html','ai-tutor.html',
 'fia-study.html','view.html','add-exam.html','quant-model.html','about.html',
 'achievements.html','financial-dashboard.html','financial-manager.html'
]);
const base=new URL('.',location.href);
const label=document.getElementById('lpShellSection');
const button=document.getElementById('workspaceMusicButton');
let lastRoute='';
function safeRoute(raw){
 try{
  const url=new URL(String(raw||'index.html#access'),base);
  if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return 'index.html#access';
  const file=url.pathname.slice(base.pathname.length);
  if(!names.has(file))return 'index.html#access';
  return file+url.search+url.hash;
 }catch{return 'index.html#access';}
}
function routeFromHash(){
 if(!location.hash)return 'index.html#access';
 try{return safeRoute(decodeURIComponent(location.hash.slice(1)));}catch{return 'index.html#access';}
}
function openPage(route){
 const next=safeRoute(route);
 if(next===lastRoute)return;
 frame.src=next;
}
const start=routeFromHash();
frame.src=start;
lastRoute=start;
document.getElementById('lpShellHome').addEventListener('click',event=>{
 event.preventDefault();
 openPage('index.html#access');
});
document.getElementById('lpShellBack').addEventListener('click',()=>{
 try{
  const child=frame.contentWindow;
  if(child?.history.length>1){child.history.back();return;}
 }catch{}
 openPage('index.html#access');
});
function changeTitle(file){
 const labels={
  'index.html':'HOME','hub.html':'REVISION DASHBOARD','notes.html':'STUDY LIBRARY',
  'quiz.html':'QUIZ CENTRE','classroom.html':'CLASSROOM','study-planner.html':'STUDY PLANNER',
  'study-planner-3d.html':'STUDY PLANNER','calendar.html':'CALENDAR',
  'tymbaflex-revision.html':'TYMBAFLEX REVISION','tymbaflex-bridge.html':'TYMBAFLEX BRIDGE',
  'ai-tutor.html':'AI TUTOR','profile.html':'STUDENT PROFILE','view.html':'ATTEMPT REVIEW',
  'add-exam.html':'ADD AN ATTEMPT','fia-study.html':'STUDY GUIDES','quant-model.html':'QUANT',
  'about.html':'ABOUT LEDGERPEER'
 };
 label.textContent=labels[file]||'LEDGERPEER';
}
frame.addEventListener('load',()=>{
 let url,doc;
 try{url=new URL(frame.contentWindow.location.href);doc=frame.contentDocument;}
 catch{return;}
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;
 const file=url.pathname.slice(base.pathname.length);
 if(!names.has(file))return;
 const route=file+url.search+url.hash;
 lastRoute=route;
 // Don't push a second history entry for iframe navigation. The browser's
 // joint session history already records changes inside the content frame.
 const desired='#'+encodeURIComponent(route);
 if(location.hash!==desired)history.replaceState(history.state,'',location.pathname+location.search+desired);
 changeTitle(file);
 // Homepage's original music button belongs to the child document.
 // Capture its click and open the single player in the persistent parent.
 const childMusic=doc.getElementById('workspaceMusicButton');
 if(childMusic)childMusic.addEventListener('click',event=>{
  event.preventDefault();event.stopImmediatePropagation();
  window.LedgerPeerStudyMusic?.open?.();
 },true);
});
window.addEventListener('hashchange',()=>{
 const route=routeFromHash();
 if(route!==lastRoute)openPage(route);
});
})();
