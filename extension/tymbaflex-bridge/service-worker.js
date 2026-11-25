/* No network scraping or password storage. Read currently open permitted tabs only. */
const ALLOWED=['https://flex.tymbaedu.com/*','https://ile.flex.tymbaedu.com/*','https://twofive.flex.tymbaedu.com/*'];
const BRIDGE='https://luqmanreader.github.io/marikitabelajar/tymbaflex-bridge.html';
const REVISION='https://luqmanreader.github.io/marikitabelajar/tymbaflex-revision.html';
const SITE='https://luqmanreader.github.io';
const TRUSTED_TABS=new Set([
 '/marikitabelajar/','/marikitabelajar/index.html','/marikitabelajar/workspace.html',
 '/marikitabelajar/hub.html','/marikitabelajar/tymbaflex-bridge.html',
 '/marikitabelajar/tymbaflex-revision.html'
]);
function trustedFrame(sender,expectedPage){
 // A content script in the named page may be inside one or two iframes. Check
 // both its own document URL and the real top-level tab, without accepting
 // requests from another website that merely frames LedgerPeer.
 try{
  const frame=new URL(sender.url||'');
  const tab=new URL(sender.tab?.url||'');
  return frame.origin+frame.pathname===expectedPage
   &&tab.origin===SITE&&TRUSTED_TABS.has(tab.pathname);
 }catch{return false;}
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(message?.type!=='LP_COLLECT')return;
 if(!trustedFrame(sender,BRIDGE))return;
 (async()=>{
  const tabs=(await chrome.tabs.query({url:ALLOWED})).slice(0,30);
  if(!tabs.length){reply({error:'No TYMBAFlex tabs are open. Sign in to TYMBAFlex Home and open a course first.'});return;}
  const snapshots=[];
  for(const tab of tabs){
   if(!Number.isInteger(tab.id))continue;
   try{
    const data=await chrome.tabs.sendMessage(tab.id,{type:'LP_READ_VISIBLE_TYMBA'});
    if(data&&Array.isArray(data.courses)&&['portal','moodle'].includes(data.kind))snapshots.push(data);
   }catch{
    // Closed/unfinished or restricted tabs are skipped.
   }
  }
  if(!snapshots.length){reply({error:'No supported TYMBAFlex pages could be read. Refresh your TYMBAFlex tabs, then sync again.'});return;}
  reply({snapshots});
 })().catch(()=>reply({error:'The extension could not scan the open course tabs.'}));
 return true;
});
// Explicitly initiated from the signed-in LedgerPeer Revision Dashboard only.
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(message?.type!=='LP_COLLECT_QUIZ_REVIEWS')return;
 if(!trustedFrame(sender,REVISION))return;
 chrome.storage.local.get('lp_tymbaflex_quiz_reviews_v1').then(data=>{
  const records=data?.lp_tymbaflex_quiz_reviews_v1;
  reply({captures:Array.isArray(records)?records.slice(0,200):[]});
 }).catch(()=>reply({error:'Could not read locally saved review results.'}));
 return true;
});
