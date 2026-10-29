/* No network scraping or password storage. Read currently open permitted tabs only. */
const ALLOWED=['https://flex.tymbaedu.com/*','https://ile.flex.tymbaedu.com/*','https://twofive.flex.tymbaedu.com/*'];
const BRIDGE='https://luqmanreader.github.io/marikitabelajar/tymbaflex-bridge.html';
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(message?.type!=='LP_COLLECT')return;
 // A request from any other page cannot trigger a TYMBAFlex sync.
 if(!sender.tab?.url||new URL(sender.tab.url).origin+'/marikitabelajar/tymbaflex-bridge.html'!==BRIDGE)return;
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