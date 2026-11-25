/* LedgerPeer-initiated opt-in only. Never sees or stores student passwords. */
const PAGE='https://luqmanreader.github.io/marikitabelajar/tymbaflex-bridge.html';
if(location.origin+location.pathname===PAGE){
 window.addEventListener('message',event=>{
  if(event.source!==window||event.origin!==location.origin)return;
  if(event.data?.type!=='LP_TYMBA_REQUEST')return;
  const requestId=event.data.requestId;
  if(typeof requestId!=='string'||requestId.length>90)return;
  chrome.runtime.sendMessage({type:'LP_COLLECT'},result=>{
   const error=chrome.runtime.lastError?.message;
   window.postMessage({
    type:'LP_TYMBA_RESULT',requestId,
    ...(error?{error:'Extension unavailable: '+error}:result||{error:'Could not read open TYMBAFlex tabs.'})
   },location.origin);
  });
 });
}
// The revision dashboard can be embedded under My Revision (and the music
// workspace), so match this document's path, not the outer tab's hash.
const REVISION_PAGE='https://luqmanreader.github.io/marikitabelajar/tymbaflex-revision.html';
if(location.origin+location.pathname===REVISION_PAGE){
 window.addEventListener('message',event=>{
  if(event.source!==window||event.origin!==location.origin||event.data?.type!=='LP_TYMBA_REVIEWS_REQUEST')return;
  const requestId=event.data.requestId;
  if(typeof requestId!=='string'||requestId.length>90)return;
  chrome.runtime.sendMessage({type:'LP_COLLECT_QUIZ_REVIEWS'},result=>{
   const failure=chrome.runtime.lastError?.message;
   window.postMessage({type:'LP_TYMBA_REVIEWS_RESULT',requestId,
    ...(failure?{error:'Extension unavailable: '+failure}:result||{error:'No response from Chrome extension.'})},location.origin);
  });
 });
}
