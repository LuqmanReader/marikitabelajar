/* Capture only completed Moodle review grading states, on a user click.
 * Save locally until the student imports into their authenticated LedgerPeer. */
(()=>{
'use strict';
const KEY='lp_tymbaflex_quiz_reviews_v1';
const HOSTS=new Set(['ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com']);
const STATES=new Set(['correct','incorrect','partial','ungraded','unanswered']);
const $=id=>document.getElementById(id);
const notice=$('captureStatus'),button=$('captureReview'),count=$('captureCount');
function msg(text,bad=false){notice.textContent=text;notice.classList.toggle('bad',bad);}
async function list(){const obj=await chrome.storage.local.get(KEY);return Array.isArray(obj[KEY])?obj[KEY]:[];}
async function counter(){count.textContent=(await list()).length+' review(s) saved locally. Import them in LedgerPeer.';}
function cleaned(value,sourceHost){
 if(!value?.ok||!HOSTS.has(sourceHost)||value.host!==sourceHost||!/^\d{1,20}$/.test(String(value.attempt_id||'')))return null;
 const states=Array.isArray(value.states)?value.states.slice(0,200):[];
 if(!states.length||states.some(s=>!STATES.has(s)))return null;
 let quiz_url=null;
 if(value.quiz_url){
  try{
   const q=new URL(value.quiz_url);
   if(q.protocol==='https:'&&q.hostname===sourceHost&&q.pathname==='/mod/quiz/view.php'&&/^\d{1,12}$/.test(q.searchParams.get('id')||''))
    quiz_url='https://'+sourceHost+'/mod/quiz/view.php?id='+q.searchParams.get('id');
  }catch{}
 }
 const course_id=/^\d{1,12}$/.test(String(value.course_id||''))?String(value.course_id):null;
 return {host:sourceHost,course_id,quiz_url,attempt_id:String(value.attempt_id),
  states,captured_at:new Date().toISOString()};
}
button.addEventListener('click',async()=>{
 button.disabled=true;
 try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!Number.isInteger(tab?.id))throw Error('Open a completed quiz review page first.');
  const url=new URL(tab.url||'');
  if(url.protocol!=='https:'||!HOSTS.has(url.hostname)||url.pathname!=='/mod/quiz/review.php')
   throw Error('Open a finished quiz REVIEW page on ILE or Group B, not a course or active attempt page.');
  const raw=await chrome.tabs.sendMessage(tab.id,{type:'LP_CAPTURE_VISIBLE_QUIZ_REVIEW'});
  const record=cleaned(raw,url.hostname);
  if(!record)throw Error(raw?.error||'No recognized reviewed question states. Refresh the finished quiz review and try again.');
  const current=await list();
  const next=current.filter(c=>!(c.host===record.host&&c.attempt_id===record.attempt_id));
  next.unshift(record);
  await chrome.storage.local.set({[KEY]:next.slice(0,200)});
  await counter();
  msg('Captured '+record.states.length+' question results. '+(record.quiz_url?'Quiz identified.':'Quiz link not detected—you will select its tutorial in LedgerPeer.')+' Open LedgerPeer and click Sync Saved Reviews.');
 }catch(err){msg(err?.message||'Review capture failed.',true);}
 finally{button.disabled=false;}
});
$('clearCaptures').addEventListener('click',async()=>{
 if(!confirm('Clear all locally saved Moodle review summaries from this Chrome extension? This does not delete anything already imported into LedgerPeer.'))return;
 await chrome.storage.local.remove(KEY);await counter();msg('All locally saved review summaries cleared.');
});
counter().catch(()=>msg('Chrome storage is unavailable. Reload the extension.',true));
})();