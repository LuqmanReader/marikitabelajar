/* LedgerPeer TYMBAFlex Revision Dashboard.
 * Read-only Moodle snapshots + private student-controlled revision status.
 * Does NOT fetch Moodle session data or represent exam marks/attempts. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const P=window.TymbaBridgeParser;
const els={
 alert:$('tfAlert'),courses:$('tfCourses'),count:$('tfResultCount'),
 courseCount:$('tfCourseCount'),activityCount:$('tfActivityCount'),
 revisedCount:$('tfRevisedCount'),studyingCount:$('tfStudyingCount'),
 lastSync:$('tfLastSync'),queue:$('tfQueue'),tabs:$('tfTabs'),
 search:$('tfSearch'),type:$('tfType'),status:$('tfStatus')
};
const labels={to_review:'To review',studying:'Studying',revised:'Revised'};
const category={quiz:'quiz',resource:'resource',book:'resource',folder:'resource',
 page:'resource',url:'resource',lesson:'resource',scorm:'resource',h5pactivity:'resource',
 assign:'assign'};
const maxVisible=45;
let client,user,rows=[],progress=new Map(),paper='all',openSections=new Set(),expandedCourses=new Set(),busy=false;
const element=(tag,text,cls)=>{
 const node=document.createElement(tag);
 if(typeof text==='string')node.textContent=text;
 if(cls)node.className=cls;
 return node;
};
const alert=(msg,isError=false)=>{
 els.alert.textContent=msg;
 els.alert.classList.toggle('is-error',isError);
};
const paperOf=title=>{
 const t=String(title||'');
 if(/financial accounting\s*2|\bfa\s*2\b/i.test(t))return 'FA2';
 if(/management accounting\s*2|\bma\s*2\b/i.test(t))return 'MA2';
 return 'OTHER';
};
const key=(host,course,url)=>host+'|'+course+'|'+url;
const courseKey=row=>row.source_host+'|'+row.course_id;
const statusOf=(host,id,url)=>progress.get(key(host,id,url))||'to_review';
const classOf=type=>category[type]||'other';
function filteredCourses(){
 return rows.filter(row=>paper==='all'||row.paper===paper);
}
function normalise(raw){
 if(!P||!raw||typeof raw!=='object')return null;
 const source_url=P.safeCourse(raw.source_host,String(raw.course_id||''));
 if(!source_url)return null;
 const safeActivities=[];
 const seen=new Set();
 for(const item of (Array.isArray(raw.activities)?raw.activities:[]).slice(0,200)){
  const valid=P.safeActivity(item?.url,raw.source_host);
  if(!valid||seen.has(valid.url))continue;
  const name=String(item?.name||'').replace(/\s+/g,' ').trim().slice(0,140);
  if(!name)continue;
  seen.add(valid.url);
  safeActivities.push({
   name,section:String(item?.section||'General').replace(/\s+/g,' ').trim().slice(0,100)||'General',
   url:valid.url,type:valid.kind
  });
 }
 return {
  course_id:String(raw.course_id),source_host:raw.source_host,
  source_url,title:String(raw.title||'Course').replace(/\s+/g,' ').slice(0,160),
  group_name:String(raw.group_name||'').slice(0,100),
  synced_at:raw.synced_at,paper:paperOf(raw.title),activities:safeActivities
 };
}
function allTasks(courses){
 const output=[];
 for(const c of courses)for(const a of c.activities){
  output.push({course:c,activity:a,status:statusOf(c.source_host,c.course_id,a.url)});
 }
 return output;
}
function renderStats(){
 const tasks=allTasks(rows);
 els.courseCount.textContent=String(rows.length);
 els.activityCount.textContent=String(tasks.length);
 els.revisedCount.textContent=String(tasks.filter(a=>a.status==='revised').length);
 els.studyingCount.textContent=String(tasks.filter(a=>a.status==='studying').length);
 const times=rows.map(r=>new Date(r.synced_at)).filter(x=>Number.isFinite(x.valueOf()));
 els.lastSync.textContent=times.length?
  'LAST COURSE IMPORT · '+new Date(Math.max(...times.map(x=>x.valueOf()))).toLocaleString('en-MY',{dateStyle:'medium',timeStyle:'short'}):
  'No course import recorded';
}
function matches(row,activity){
 if(els.type.value!=='all'&&classOf(activity.type)!==els.type.value)return false;
 if(els.status.value!=='all'&&statusOf(row.source_host,row.course_id,activity.url)!==els.status.value)return false;
 const q=els.search.value.trim().toLowerCase().slice(0,110);
 return !q||[row.title,row.group_name,activity.name,activity.section,activity.type].some(value=>String(value).toLowerCase().includes(q));
}
function taskItem(course,activity){
 const status=statusOf(course.source_host,course.course_id,activity.url);
 const item=element('div',undefined,'tf-task'+(status==='revised'?' is-revised':''));
 const main=element('div');
 const name=element('div',undefined,'tf-task-name');
 const link=element('a',activity.name);
 link.href=activity.url;link.target='_blank';link.rel='noopener noreferrer';
 name.append(link);main.append(name);
 main.append(element('div',activity.type.toUpperCase()+' · '+(activity.section||'General'),'tf-task-info'));
 const select=element('select');
 select.setAttribute('aria-label','Revision status for '+activity.name);
 select.dataset.sourceHost=course.source_host;
 select.dataset.courseId=course.course_id;
 select.dataset.activityUrl=activity.url;
 for(const [value,label] of Object.entries(labels)){
  const option=element('option',label);
  option.value=value;
  select.append(option);
 }
 select.value=status;
 item.append(main,select);
 return item;
}
function sectionGroup(course,sectionName,activities){
 const id=courseKey(course)+'|'+sectionName;
 const group=element('details',undefined,'tf-section-group');
 if(openSections.has(id)||els.search.value.trim()||els.status.value!=='all'||els.type.value!=='all')group.open=true;
 const summary=element('summary');
 const label=element('span',sectionName||'General');
 const quantity=element('small',activities.length+' item'+(activities.length===1?'':'s'));
 summary.append(label,quantity);
 group.append(summary);
 const list=element('div',undefined,'tf-section-list');
 const limit=expandedCourses.has(id)?activities.length:maxVisible;
 for(const activity of activities.slice(0,limit))list.append(taskItem(course,activity));
 if(activities.length>limit){
  const more=element('button','SHOW ALL '+activities.length+' ACTIVITIES','tf-more');
  more.type='button';
  more.addEventListener('click',()=>{
   expandedCourses.add(id);
   more.remove();
   for(const a of activities.slice(limit))list.append(taskItem(course,a));
  });
  list.append(more);
 }
 group.append(list);
 group.addEventListener('toggle',()=>{if(group.open)openSections.add(id);else openSections.delete(id);});
 return group;
}
function courseCard(course,matched){
 const section=element('article',undefined,'tf-course');
 const header=element('div',undefined,'tf-course-head');
 const head=element('div',undefined,'tf-course-headline');
 const titleWrap=element('div');
 titleWrap.append(element('span',course.paper,'tf-chip'));
 titleWrap.append(element('h3',course.title,'tf-course-title'));
 const descriptor=course.source_host.startsWith('ile.')?'VIDEOS & NOTES / ILE':'GROUP B / TWOFIVE';
 titleWrap.append(element('p',descriptor,'tf-course-desc'));
 const official=element('a','OPEN COURSE ↗','tf-course-link');
 official.href=course.source_url;official.target='_blank';official.rel='noopener noreferrer';
 head.append(titleWrap,official);header.append(head);
 const total=course.activities.length;
 const revised=course.activities.filter(a=>statusOf(course.source_host,course.course_id,a.url)==='revised').length;
 const studying=course.activities.filter(a=>statusOf(course.source_host,course.course_id,a.url)==='studying').length;
 const nums=element('div',undefined,'tf-course-numbers');
 for(const t of [total+' ACTIVITIES',revised+' MARKED REVISED',studying+' STUDYING'])nums.append(element('span',t));
 header.append(nums);
 const track=element('div',undefined,'tf-progress-track');
 track.setAttribute('role','progressbar');track.setAttribute('aria-label','Self-marked revision coverage');
 track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
 const percent=total?Math.round(revised/total*100):0;
 track.setAttribute('aria-valuenow',String(percent));
 const bar=element('span');
 bar.style.width=percent+'%';
 track.append(bar);header.append(track);
 const body=element('div',undefined,'tf-course-body');
 const grouped=new Map();
 for(const a of matched){
  if(!grouped.has(a.section))grouped.set(a.section,[]);
  grouped.get(a.section).push(a);
 }
 for(const [sectionName,activities] of grouped)body.append(sectionGroup(course,sectionName,activities));
 section.append(header,body);
 return section;
}
function queue(){
 const tasks=allTasks(filteredCourses());
 const sorted=tasks.filter(t=>t.status!=='revised')
   .sort((a,b)=>(a.status==='studying'?0:1)-(b.status==='studying'?0:1))
   .slice(0,6);
 els.queue.replaceChildren();
 if(!sorted.length){
  els.queue.append(element('p',tasks.length?'All imported activities are marked revised.':'Import course activities to build your revision queue.'));
  return;
 }
 for(const item of sorted){
  const box=element('div',undefined,'tf-queue-item');
  box.append(element('strong',item.activity.name));
  box.append(element('small',item.course.paper+' · '+labels[item.status]));
  const link=element('a','OPEN ACTIVITY ↗');
  link.href=item.activity.url;link.target='_blank';link.rel='noopener noreferrer';
  box.append(link);
  els.queue.append(box);
 }
}
function render(){
 renderStats();queue();els.courses.replaceChildren();
 const selected=filteredCourses();let shown=0,total=0;
 for(const course of selected){
  const matched=course.activities.filter(a=>matches(course,a));
  total+=matched.length;
  if(!matched.length&&(els.search.value.trim()||els.status.value!=='all'||els.type.value!=='all'))continue;
  shown++;
  els.courses.append(courseCard(course,matched));
 }
 els.count.textContent=shown+' course'+(shown===1?'':'s')+' · '+total+' matching activities';
 if(!rows.length){
  const empty=element('div',undefined,'tf-empty');
  empty.append(element('h3','CONNECT TYMBAFLEX TO START.'));
  empty.append(element('p','Your dashboard is ready. Import your TYMBAFlex Home page and FA2/MA2 course pages through the Bridge. Once saved, they appear here automatically.'));
  const a=element('a','OPEN THE TYMBAFLEX BRIDGE ↗');a.href='tymbaflex-bridge.html';empty.append(a);
  els.courses.append(empty);return;
 }
 if(!shown){
  const empty=element('div',undefined,'tf-empty');
  empty.append(element('h3','NO MATCHING ACTIVITIES.'));
  empty.append(element('p','Try another paper, search term or revision status.'));
  els.courses.append(empty);
 }
}
async function saveStatus(host,courseId,activityUrl,next){
 if(busy||!client||!user)return;
 const owner=rows.find(r=>r.source_host===host&&r.course_id===courseId);
 if(!owner||!owner.activities.some(a=>a.url===activityUrl)||!Object.hasOwn(labels,next))return;
 busy=true;
 const k=key(host,courseId,activityUrl);
 const previous=progress.get(k);
 if(next==='to_review')progress.delete(k);else progress.set(k,next);
 render();alert('Saving your revision status…');
 try{
  let error;
  if(next==='to_review'){
   ({error}=await client.from('tymbaflex_revision_progress').delete()
    .eq('user_id',user.id).eq('source_host',host).eq('course_id',courseId).eq('activity_url',activityUrl));
  }else{
   ({error}=await client.from('tymbaflex_revision_progress').upsert({
    user_id:user.id,source_host:host,course_id:courseId,activity_url:activityUrl,
    revision_status:next,updated_at:new Date().toISOString()
   },{onConflict:'user_id,source_host,course_id,activity_url'}));
  }
  if(error)throw error;
  alert('Saved: '+labels[next]+'. Your revision status is private to your LedgerPeer account.');
 }catch(err){
  if(previous)progress.set(k,previous);else progress.delete(k);
  render();alert('Unable to save revision status: '+(err?.message||'Please try again.'),true);
 }finally{busy=false;}
}
async function start(){
 try{
  if(!window.PersonalHubAuth||!P)throw Error('LedgerPeer authentication or course parser is not available.');
  const auth=window.PersonalHubAuth;
  if(!(await auth.ready())){
   if(!auth.isRedirectingToProfile?.())location.replace('index.html?next=tymbaflex-revision.html#access');
   return;
  }
  client=auth.getClient();user=auth.getUser();
  if(!client||!user?.id)throw Error('Sign in to LedgerPeer before opening your revision dashboard.');
  auth.addLockButton?.();
  const [c,p]=await Promise.all([
   client.from('tymbaflex_bridge_courses').select('source_host,course_id,title,group_name,source_url,activities,synced_at')
    .eq('user_id',user.id).order('synced_at',{ascending:false}).limit(50),
   client.from('tymbaflex_revision_progress').select('source_host,course_id,activity_url,revision_status')
    .eq('user_id',user.id).limit(1500)
  ]);
  if(c.error)throw c.error;
  if(p.error)throw p.error;
  rows=(c.data||[]).map(normalise).filter(Boolean);
  const allowed=new Set(allTasks(rows).map(t=>key(t.course.source_host,t.course.course_id,t.activity.url)));
  for(const item of p.data||[]){
   const k=key(item.source_host,item.course_id,item.activity_url);
   if(allowed.has(k)&&Object.hasOwn(labels,item.revision_status))progress.set(k,item.revision_status);
  }
  render();
  alert(rows.length?'Connected: '+rows.length+' TYMBAFlex courses loaded. Select FA2 or MA2 to start revising.':'No course snapshots yet. Use the TYMBAFlex Bridge to import your four course pages.');
 }catch(err){
  alert('Cannot load the TYMBAFlex Revision Dashboard: '+(err?.message||'Unexpected error.'),true);
  render();
 }
}
els.tabs.addEventListener('click',ev=>{
 const b=ev.target.closest('button[data-paper]');
 if(!b)return;
 const next=b.dataset.paper;
 if(!['all','FA2','MA2'].includes(next))return;
 paper=next;
 for(const button of els.tabs.querySelectorAll('button[data-paper]'))button.setAttribute('aria-pressed',String(button===b));
 render();
});
for(const el of [els.search,els.type,els.status])el.addEventListener(el===els.search?'input':'change',render);
els.courses.addEventListener('change',ev=>{
 const input=ev.target.closest('select[data-activity-url]');
 if(!input||busy)return;
 saveStatus(input.dataset.sourceHost,input.dataset.courseId,input.dataset.activityUrl,input.value);
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();