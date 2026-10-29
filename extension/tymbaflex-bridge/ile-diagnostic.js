/* ILE course-page diagnostic. Read-only; never reads account info, passwords,
 * auth headers, CSRF tokens, cookies, grades, quiz attempts, or source HTML. */
(function(){
'use strict';
const HOST='ile.flex.tymbaedu.com';
const MAX=200;
const clean=(v,n=120)=>String(v||'').replace(/\s+/g,' ').trim().slice(0,n);
function classify(name,type){
 if(type==='quiz'){
  if(/\btutorial(?:\s+chapter)?\b/i.test(name))return 'tutorial';
  if(/\bprogress\s*test\b/i.test(name))return 'progress_test';
  if(/\bmock\b/i.test(name))return 'mock';
  if(/\bset\s*\d+\b/i.test(name))return 'chapter_set';
  return 'other_quiz';
 }
 if(['resource','folder','book','page','url','lesson'].includes(type))return 'material';
 return 'other';
}
function completion(row){
 const btn=row.querySelector('.activity-completion [data-region="completionrequirements"] button');
 const label=clean(btn?.textContent,60).toLowerCase();
 if(/\bdone\b/.test(label))return 'done';
 if(/\bto\s*do\b/.test(label))return 'todo';
 return 'unknown';
}
function inspect(doc,url){
 let page;
 try{page=new URL(url);}catch{return {ok:false,error:'Invalid course URL.'};}
 if(page.protocol!=='https:'||page.hostname!==HOST||page.pathname!=='/course/view.php'
    ||!/^\d{1,12}$/.test(page.searchParams.get('id')||''))
  return {ok:false,error:'Open an ILE FA2 or MA2 course overview (course/view.php?id=...).'};
 const courseId=page.searchParams.get('id'),items=[],seen=new Set(),sections=doc.querySelectorAll('.course-section');
 for(const section of sections){
  const chapter=clean(section.getAttribute('data-sectionname')||section.querySelector('.sectionname')?.textContent||'General',105);
  for(const row of section.querySelectorAll('li.activity[data-id]')){
   const anchor=row.querySelector('.activityname a[href]');
   if(!anchor)continue;
   const link=window.TymbaBridgeParser?.safeActivity(anchor.getAttribute('href'),HOST);
   if(!link||seen.has(link.url))continue;
   seen.add(link.url);
   const name=clean(row.querySelector('.activity-item[data-activityname]')?.getAttribute('data-activityname')||
     row.querySelector('.instancename')?.textContent||anchor.textContent,140);
   if(!name)continue;
   const status=completion(row);
   items.push({name,chapter,kind:link.kind,category:classify(name,link.kind),
     completion:status,url:link.url});
   if(items.length>=MAX)break;
  }
  if(items.length>=MAX)break;
 }
 const title=clean(doc.querySelector('h1')?.textContent||doc.title,150);
 const totals={
  activities:items.length,
  quiz:items.filter(x=>x.kind==='quiz').length,
  tutorial:items.filter(x=>x.category==='tutorial').length,
  chapter_set:items.filter(x=>x.category==='chapter_set').length,
  progress_test:items.filter(x=>x.category==='progress_test').length,
  mock:items.filter(x=>x.category==='mock').length,
  done:items.filter(x=>x.completion==='done').length,
  todo:items.filter(x=>x.completion==='todo').length,
  unknown:items.filter(x=>x.completion==='unknown').length
 };
 return {
  ok:true,host:HOST,course_id:courseId,course_url:'https://'+HOST+'/course/view.php?id='+courseId,
  title,scanned_at:new Date().toISOString(),sections:sections.length,totals,
  items,notes:['Activity completion is not a quiz grade.','Unknown means the overview has no recognizable Done/To do indicator.','This report reflects only the open course page, not private attempt results.']
 };
}
window.LedgerPeerILEDiagnostic={inspect,classify,completion};
if(typeof chrome!=='undefined'&&chrome.runtime?.onMessage){
 chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(message?.type!=='LP_DIAG_ILE_COURSE')return;
  // Popup may ask, but only this page's DOM can be inspected.
  respond(inspect(document,location.href));
 });
}
})();