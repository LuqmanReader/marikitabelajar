/* User-triggered, strictly read-only ILE and Group B course diagnostic. No persistent storage,
 * no remote requests, no cookies, passwords, Moodle tokens or attempt data. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const status=$('status'),scan=$('scan'),exportBtn=$('export'),results=$('results'),list=$('activityList');
let report=null;
const ALLOWED_HOSTS=new Set(['ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com']);
const MODS=new Set(['quiz','resource','assign','page','forum','lesson','url','book','folder','h5pactivity','scorm']);
const show=(message,error=false)=>{status.textContent=message;status.classList.toggle('bad',error);};
const text=(id,value)=>{$(id).textContent=String(value);};
const safeItem=(item,host)=>{
 if(!item||typeof item!=='object')return null;
 try{
  const u=new URL(item.url);
  const match=/^\/mod\/([a-z_]+)\/view\.php$/.exec(u.pathname);
  if(u.protocol!=='https:'||!ALLOWED_HOSTS.has(host)||u.hostname!==host
    ||!match||!MODS.has(match[1])
    ||!/^\d{1,12}$/.test(u.searchParams.get('id')||''))return null;
  const category=String(item.category||'other').slice(0,32);
  return {name:String(item.name||'').slice(0,140),chapter:String(item.chapter||'').slice(0,105),
   category,kind:String(item.kind||'').slice(0,25),
   completion:['done','todo'].includes(item.completion)?item.completion:'unknown',
   url:'https://'+host+u.pathname+'?id='+u.searchParams.get('id')};
 }catch{return null;}
};
function render(){
 const category=$('category').value;
 list.replaceChildren();
 if(!report)return;
 const activities=report.items.filter(x=>category==='all'||x.category===category);
 const frag=document.createDocumentFragment();
 for(const item of activities.slice(0,200)){
  const li=document.createElement('li'),top=document.createElement('div');
  const a=document.createElement('a');a.textContent=item.name||'Activity';a.href=item.url;
  a.rel='noopener noreferrer';a.target='_blank';
  const pill=document.createElement('span');pill.className='pill '+item.completion;
  pill.textContent=item.completion==='done'?'Done':item.completion==='todo'?'To do':'Unknown';
  top.append(a,pill);
  const small=document.createElement('small');
  small.textContent=(item.chapter||'General')+' · '+item.kind.toUpperCase();
  li.append(top,small);frag.append(li);
 }
 list.append(frag);
 text('summary',activities.length+' matching activities · Done '+activities.filter(x=>x.completion==='done').length+
  ' · To do '+activities.filter(x=>x.completion==='todo').length+
  ' · Unknown '+activities.filter(x=>x.completion==='unknown').length);
}
async function diagnose(){
 scan.disabled=true;exportBtn.disabled=true;results.hidden=true;report=null;
 try{
  const tabs=await chrome.tabs.query({active:true,currentWindow:true}),tab=tabs?.[0];
  if(!Number.isInteger(tab?.id))throw Error('No active Chrome tab could be found.');
  const u=new URL(tab.url||'');
  if(u.protocol!=='https:'||!ALLOWED_HOSTS.has(u.hostname)||u.pathname!=='/course/view.php'||!/^[0-9]{1,12}$/.test(u.searchParams.get('id')||''))
   throw Error('Open an ILE or Group B FA2/MA2 course overview and try again.');
  show('Inspecting visible course activities in the current TYMBAFlex tab…');
  let result;
  try{result=await chrome.tabs.sendMessage(tab.id,{type:'LP_DIAG_TYMBA_COURSE'});}
  catch{throw Error('Chrome cannot read this tab yet. Refresh the FA2/MA2 course page, or reload the extension at chrome://extensions.');}
  if(!result?.ok)throw Error(result?.error||'Unsupported Moodle course page or not signed in.');
  if(result.host!==u.hostname||String(result.course_id)!==u.searchParams.get('id'))
   throw Error('The course report does not match the active tab. Please refresh and scan again.');
  const items=(Array.isArray(result.items)?result.items:[]).slice(0,200).map(item=>safeItem(item,u.hostname)).filter(Boolean);
  if(!items.length)throw Error('No visible course activities found. Check you are signed in and viewing an actual course overview.');
  const site=u.hostname.startsWith('twofive.')?'GROUP B / TWOFIVE':'ILE';
  report={version:2,source:site+' course overview',host:u.hostname,course_id:String(result.course_id||''),
   course_url:'https://'+u.hostname+'/course/view.php?id='+encodeURIComponent(result.course_id),
   title:String(result.title||'').slice(0,150),
   scanned_at:new Date().toISOString(),items};
  const totals={quiz:items.filter(x=>x.kind==='quiz').length,
   tutorials:items.filter(x=>x.category==='tutorial').length,
   chapterSets:items.filter(x=>x.category==='chapter_set').length,
   done:items.filter(x=>x.completion==='done').length};
  text('courseId',site+' · COURSE '+report.course_id);
  text('courseTitle',report.title);
  text('scannedAt','Scanned '+new Date(report.scanned_at).toLocaleString()+' · '+items.length+' activities');
  text('quizCount',totals.quiz);text('tutorialCount',totals.tutorials);
  text('setCount',totals.chapterSets);text('doneCount',totals.done);
  if(totals.tutorials)$('category').value='tutorial';
  else if(totals.chapterSets)$('category').value='chapter_set';
  else $('category').value='all';
  render();results.hidden=false;exportBtn.disabled=false;
  show('Scan complete: '+items.length+' visible activities. No account credentials or raw page content were collected.');
 }catch(e){show(e?.message||'Diagnostic failed.',true);}
 finally{scan.disabled=false;}
}
function exportReport(){
 if(!report)return;
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;
 a.download='tymbaflex-'+(report.host.startsWith('twofive.')?'group-b':'ile')+'-course-'+report.course_id+'-diagnostic.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}
scan.addEventListener('click',diagnose);
exportBtn.addEventListener('click',exportReport);
$('category').addEventListener('change',render);
})();
