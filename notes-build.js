/* LedgerPeer Notes build identity + stale-tab detector.
 * A student's previously opened tab does not refresh merely because GitHub Pages
 * deployed a newer file. This module detects new deployed builds and provides
 * a safe explicit reload while preserving paper/topic selections in the URL.
 */
(function(root){
'use strict';
const CURRENT=String(root.LedgerNotesDocumentBuild||'').trim();
const releaseNodeId='notesReleaseStatus';
const checkUrl=()=>new URL('notes-release.json',document.baseURI);
let running=false,seenUpdate=false;
function reloadUrl(){
 const u=new URL(root.location.href);
 u.searchParams.set('lp_build',CURRENT);
 u.searchParams.set('lp_fresh',String(Date.now()));
 u.hash=u.hash||'#library';
 return u.href;
}
function createBanner(){
 let node=document.getElementById(releaseNodeId);
 if(node)return node;
 node=document.createElement('aside');
 node.id=releaseNodeId;
 node.className='notes-release-banner';
 node.hidden=true;
 node.setAttribute('role','status');
 node.setAttribute('aria-live','polite');
 const message=document.createElement('p');
 message.id='notesReleaseMessage';
 const btn=document.createElement('button');
 btn.type='button';btn.id='notesReleaseReload';btn.textContent='LOAD LATEST NOTES';
 btn.addEventListener('click',()=>{root.location.assign(reloadUrl())});
 node.append(message,btn);
 const main=document.getElementById('notesApp');
 if(main)main.insertBefore(node,main.firstChild);
 else document.body.insertBefore(node,document.body.firstChild);
 return node;
}
function showUpdate(build){
 if(seenUpdate)return;
 seenUpdate=true;
 const banner=createBanner();
 document.getElementById('notesReleaseMessage').textContent=
   'A NEWER LEDGERPEER NOTES VERSION IS AVAILABLE ('+build+'). THIS TAB IS STILL USING '+CURRENT+'.';
 banner.hidden=false;
}
async function check(){
 if(!CURRENT||running||seenUpdate)return;
 running=true;
 try{
  const u=checkUrl();
  // A unique query defeats stale HTML asset URL reuse and most intermediary caches.
  u.searchParams.set('check',String(Date.now()));
  const resp=await root.fetch(u.href,{cache:'no-store',credentials:'same-origin'});
  if(!resp.ok) return;
  const data=await resp.json();
  if(data&&typeof data.build==='string'&&data.build&&data.build!==CURRENT)showUpdate(data.build);
 }catch(error){
  // Offline or temporarily inaccessible network: keep the current reading usable.
 }finally{running=false}
}
function init(){
 const stamp=document.getElementById('notesBuildStamp');
 if(stamp){
  stamp.textContent='BUILD '+CURRENT;
  stamp.title='LedgerPeer Notes revision '+CURRENT+' · select to check the latest release';
  stamp.addEventListener('click',()=>check());
 }
 createBanner();
 check();
 root.addEventListener('focus',check);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
 // Keep an already-open Notes tab informed when a new website deployment arrives.
 root.setInterval(check,120000);
}
root.LedgerNotesCheckForUpdates=check;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})(window);
