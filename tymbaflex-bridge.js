/* LedgerPeer TYMBAFlex bridge — explicit user opt-in only; no credentials handled. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const status=$('tbStatus'), courses=$('tbCourses'), count=$('tbCount');
const importBtn=$('tbImport'),syncBtn=$('tbSyncTabs'),refreshBtn=$('tbRefresh'),fileInput=$('tbFiles'),consent=$('tbConsent');
const parser=window.TymbaBridgeParser;
let client,user,busy=false,pendingSync=null;
function notify(text,error=false){status.textContent=text;status.classList.toggle('error',Boolean(error));}
function setBusy(on){
 busy=on;importBtn.disabled=on||!user||!consent.checked;syncBtn.disabled=on||!user||!consent.checked;refreshBtn.disabled=on||!user;fileInput.disabled=on||!user;
}
function create(tag,text,className){
 const node=document.createElement(tag);if(text!==undefined)node.textContent=String(text);
 if(className)node.className=className;return node;
}
function link(text,url){
 const a=create('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function normalize(s){return String(s||'').trim().toLowerCase();}
function sourceCourses(snapshots){
 if(!Array.isArray(snapshots))throw Error('No readable TYMBAFlex pages were found.');
 if(snapshots.length>30)throw Error('Maximum 30 pages per sync.');
 if(!consent.checked)throw Error('Confirm that you own these TYMBAFlex pages before importing.');
 const portal=snapshots.find(x=>x?.kind==='portal'&&Array.isArray(x.courses));
 if(!portal)throw Error('Include Home - TYMBAFlex.html with the course pages so we can verify the course list.');
 // Portal and LedgerPeer email addresses may legitimately differ. This is
 // an explicitly consented course-data import, NEVER single sign-on.
 // The portal email is used only locally, not uploaded to LedgerPeer.
 const sameEmail=Boolean(user?.email&&portal.email&&normalize(portal.email)===normalize(user.email));
 if(!sameEmail&&typeof portal.email!=='string')throw Error('Invalid TYMBAFlex Home page.');
 const allowed=new Set((portal.courses||[]).map(c=>c.source_host+':'+c.course_id));
 if(!allowed.size)throw Error('Your TYMBAFlex portal page contains no recognized courses.');
 const map=new Map();
 for(const snapshot of snapshots){
  if(!['portal','moodle'].includes(snapshot?.kind))continue;
  for(const row of Array.isArray(snapshot.courses)?snapshot.courses:[]){
   const safe=parser.safeRecord(row);
   if(!safe||!allowed.has(safe.source_host+':'+safe.course_id))continue;
   const key=safe.source_host+':'+safe.course_id;
   const existing=map.get(key);
   if(!existing||safe.activity_count>existing.activity_count)map.set(key,safe);
  }
 }
 return [...map.values()].slice(0,30);
}
async function persist(snapshots){
 const rows=sourceCourses(snapshots);
 if(!rows.length)throw Error('Nothing suitable was extracted.');
 const upserts=rows.map(row=>({...row,user_id:user.id,synced_at:new Date().toISOString()}));
 const {error}=await client.from('tymbaflex_bridge_courses')
   .upsert(upserts,{onConflict:'user_id,source_host,course_id'});
 if(error)throw Error(error.message||'Unable to save course snapshots.');
 notify('Imported '+rows.length+' course(s). Your TYMBAFlex password, email, SSO links and original HTML were not saved.');
 await load();
}
function courseCard(c){
 const box=create('article',undefined,'tb-course');
 box.append(create('small',c.source_host.toUpperCase()));
 box.append(create('h3',c.title));
 const meta=create('div',undefined,'tb-meta');
 meta.append(create('span',c.group_name||'Course overview'));
 meta.append(create('span',String(c.activity_count||0)+' activities'));
 box.append(meta);
 box.append(link('OPEN COURSE ↗',c.source_url));
 const activities=(Array.isArray(c.activities)?c.activities:[]).slice(0,100);
 if(activities.length){
  const ol=create('ol',undefined,'tb-activities');
  for(const activity of activities){
   const valid=parser.safeActivity(activity.url,c.source_host);
   if(!valid)continue;
   const li=create('li');
   li.append(link(activity.name||'Course activity',valid.url));
   li.append(create('em',' · '+(activity.section||valid.kind)+(activity.completed===true?' · completed':'')));
   ol.append(li);
  }
  box.append(ol);
 }
 const remove=create('button','REMOVE SNAPSHOT','tb-remove');remove.type='button';
 remove.addEventListener('click',async()=>{
  if(busy||!confirm('Remove the saved snapshot for '+c.title+' from your LedgerPeer account?'))return;
  setBusy(true);
  try{
   const {error}=await client.from('tymbaflex_bridge_courses').delete()
    .eq('user_id',user.id).eq('source_host',c.source_host).eq('course_id',c.course_id);
   if(error)throw error;
   notify('Saved course snapshot removed. This does not change TYMBAFlex.');
   await load();
  }catch(e){notify(e.message||'Unable to remove snapshot.',true);}
  finally{setBusy(false);}
 });
 box.append(remove);return box;
}
async function load(){
 if(!client||!user)return;
 const {data,error}=await client.from('tymbaflex_bridge_courses')
  .select('source_host,course_id,title,group_name,source_url,activities,activity_count,synced_at')
  .eq('user_id',user.id).order('synced_at',{ascending:false}).limit(40);
 if(error)throw error;
 courses.replaceChildren(...(data||[]).map(courseCard));
 count.textContent=(data?.length||0)+' saved course(s) · Only visible to your LedgerPeer account';
}
async function importSaved(){
 if(busy)return;
 if(!consent.checked){notify('Confirm ownership of these course pages before importing.',true);return;}
 const files=[...fileInput.files];
 if(!files.length){notify('Choose TYMBAFlex HTML files first.',true);return;}
 if(files.length>30){notify('Import up to 30 files at once.',true);return;}
 setBusy(true);
 try{
  const snapshots=[];
  for(const f of files){
   if(f.size>6500000||f.size<50)throw Error('File size out of range: '+f.name);
   if(!/\.html?$/i.test(f.name))throw Error('Only HTML files are supported.');
   const html=await f.text();
   const result=parser.fromHTML(html);
   if(result)snapshots.push(result);
  }
  await persist(snapshots);
  fileInput.value='';
 }catch(e){notify(e?.message||'Unable to import the supplied pages.',true);}
 finally{setBusy(false);}
}
function syncTabs(){
 if(busy)return;
 if(!consent.checked){notify('Confirm that you own your TYMBAFlex pages before syncing.',true);return;}
 if(pendingSync){notify('A sync request is already running.',true);return;}
 const requestId=crypto.randomUUID();
 notify('Checking open, signed-in TYMBAFlex tabs through the optional browser extension…');
 setBusy(true);
 const timeout=setTimeout(()=>{
  if(pendingSync?.requestId!==requestId)return;
  pendingSync=null;setBusy(false);
  notify('No bridge extension replied. Install the extension, refresh LedgerPeer, and leave TYMBAFlex Home and your course tabs open.',true);
 },7000);
 pendingSync={requestId,timeout};
 window.postMessage({type:'LP_TYMBA_REQUEST',requestId},location.origin);
}
window.addEventListener('message',async event=>{
 if(event.source!==window||event.origin!==location.origin||event.data?.type!=='LP_TYMBA_RESULT')return;
 if(!pendingSync||event.data.requestId!==pendingSync.requestId)return;
 clearTimeout(pendingSync.timeout);pendingSync=null;
 try{
  if(event.data.error)throw Error(event.data.error);
  await persist(event.data.snapshots);
 }catch(e){notify(e.message||'Unable to sync TYMBAFlex.',true);}
 finally{setBusy(false);}
});
async function start(){
 setBusy(true);
 try{
  const auth=window.PersonalHubAuth;
  if(!auth)throw Error('Login service is unavailable.');
  const ready=await auth.ready();
  if(!ready){location.replace('index.html?next=tymbaflex-bridge.html#access');return;}
  client=auth.getClient();user=auth.getUser();
  if(!client||!user?.id)throw Error('Sign in to LedgerPeer first.');
  notify('Signed into LedgerPeer. Connect only your own TYMBAFlex pages.');
  setBusy(false);await load();
 }catch(e){notify(e.message||'Cannot open the bridge.',true);setBusy(true);}
}
consent.addEventListener('change',()=>{setBusy(busy);if(consent.checked)notify('Import permission confirmed. Choose all five HTML files or sync your open TYMBAFlex tabs.');});
importBtn.addEventListener('click',importSaved);
syncBtn.addEventListener('click',syncTabs);
refreshBtn.addEventListener('click',async()=>{setBusy(true);try{await load();notify('Your saved courses are up to date.');}catch(e){notify(e.message,true);}finally{setBusy(false);}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();