/* LedgerPeer / TYMBAFlex read-only bridge parser.
   Extracts explicit course metadata. NO SSO URLs, session IDs, cookies,
   authorization headers, passwords, CSRF tokens or raw HTML are exported. */
(function(root){
'use strict';
const HOSTS=new Set(['ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com']);
const MODS=new Set(['quiz','resource','assign','page','forum','lesson','url','book','folder','h5pactivity','scorm']);
const compact=(value,max=180)=>String(value||'').replace(/\s+/g,' ').trim().slice(0,max);
function safeCourse(host,id){
 if(!HOSTS.has(host)||!/^\d{1,12}$/.test(String(id)))return '';
 return 'https://'+host+'/course/view.php?id='+id;
}
function safeActivity(href,host){
 try{
  const u=new URL(href,'https://'+host);
  if(u.protocol!=='https:'||u.hostname!==host)return null;
  const m=/^\/mod\/([a-z_]+)\/view\.php$/.exec(u.pathname);
  if(!m||!MODS.has(m[1]))return null;
  const id=u.searchParams.get('id');
  if(!/^\d{1,12}$/.test(id||''))return null;
  return {kind:m[1],url:'https://'+host+u.pathname+'?id='+id};
 }catch{return null;}
}
function safeRecord(raw){
 if(!raw||typeof raw!=='object'||!HOSTS.has(raw.source_host))return null;
 const id=String(raw.course_id||'');
 const source_url=safeCourse(raw.source_host,id);
 if(!source_url)return null;
 const activities=Array.isArray(raw.activities)?raw.activities.slice(0,200).flatMap(item=>{
  const a=safeActivity(item?.url,raw.source_host);
  if(!a)return [];
  return [{
   id:String(item.id||'').replace(/[^\d]/g,'').slice(0,12)||a.url.match(/id=(\d+)$/)?.[1]||'',
   name:compact(item.name,140),section:compact(item.section,100),
   type:a.kind,url:a.url,completed:item.completed===true,
   completion_status:item.completed===true||item.completion_status==='done'?'done':item.completion_status==='todo'?'todo':'unknown'
  }];
 }):[];
 return {source_host:raw.source_host,course_id:id,title:compact(raw.title,160)||'Course '+id,
  group_name:compact(raw.group_name,100),source_url,activities,activity_count:activities.length};
}
function fromPortal(doc){
 const page=doc.querySelector('[data-page]');
 if(!page)return null;
 let json;
 try{json=JSON.parse(page.getAttribute('data-page'));}catch{return null;}
 const props=json?.props||{};
 const email=typeof props.auth?.user?.email==='string'?props.auth.user.email.trim().toLowerCase():'';
 const rows=Array.isArray(props.courses?.data)?props.courses.data:[];
 const courses=rows.slice(0,50).map(c=>{
  const short=c.lms_instance_name;
  const host=short==='ile'?'ile.flex.tymbaedu.com':short==='twofive'?'twofive.flex.tymbaedu.com':'';
  return safeRecord({
   source_host:host,course_id:c.lms_course_id,
   title:c.subject?.name||c.code,
   group_name:c.student_group?.name||'',activities:[]
  });
 }).filter(Boolean);
 return {kind:'portal',source:'flex.tymbaedu.com',email,courses};
}
function fromMoodle(doc,url){
 const pageUrl=new URL(url),host=pageUrl.hostname;
 if(!HOSTS.has(host))return null;
 // Only parse a course overview, never grades, tests or account settings.
 if(pageUrl.pathname!=='/course/view.php')return null;
 const courseId=pageUrl.searchParams.get('id');
 if(!safeCourse(host,courseId))return null;
 const title=compact((doc.querySelector('h1')?.textContent||doc.title||'').replace(/^Course:\s*/i,'').replace(/\s*\|\s*TYMBAFlex$/i,''),160);
 const activities=[],seen=new Set();
 const sections=doc.querySelectorAll('.course-section');
 for(const section of sections){
  const sectionName=compact(section.getAttribute('data-sectionname')||section.querySelector('.sectionname')?.textContent,100);
  for(const row of section.querySelectorAll('li.activity[data-id]')){
   const link=row.querySelector('.activityname a[href]');
   if(!link)continue;
   const valid=safeActivity(link.getAttribute('href'),host);
   if(!valid||seen.has(valid.url))continue;
   const name=compact(row.querySelector('[data-activityname]')?.getAttribute('data-activityname')||row.querySelector('.instancename')?.textContent||link.textContent,140);
   if(!name)continue;
   seen.add(valid.url);
   // Moodle Boost represents completion in its own activity dropdown.
   // A quiz with no completion indicator is UNKNOWN, not automatically To do.
   const button=row.querySelector('.activity-completion [data-region="completionrequirements"] button');
   const label=compact(button?.textContent,50).toLowerCase();
   const completion_status=/\bdone\b/.test(label)?'done':/\bto\s*do\b/.test(label)?'todo':'unknown';
   activities.push({id:row.getAttribute('data-id'),name,section:sectionName,
    type:valid.kind,url:valid.url,completed:completion_status==='done',completion_status});
   if(activities.length>=200)break;
  }
  if(activities.length>=200)break;
 }
 const course=safeRecord({source_host:host,course_id:courseId,title,activities});
 return {kind:'moodle',source:host,email:'',courses:course?[course]:[]};
}
function fromDocument(doc,url){
 try{
  const u=new URL(url);
  if(u.protocol!=='https:')return null;
  if(u.hostname==='flex.tymbaedu.com')return fromPortal(doc);
  return fromMoodle(doc,url);
 }catch{return null;}
}
function detectSavedUrl(html){
 const source=String(html||'');
 const marker=source.slice(0,700).match(/saved from url=\(\d+\)(https:\/\/[^\s<>]+)/i);
 if(marker)return marker[1].replace(/-->.*/,'').trim();
 // Moodle pages still expose their own course ID and base domain.
 const base=source.match(/"wwwroot":"https:\\\/\\\/(ile|twofive)\.flex\.tymbaedu\.com"/);
 const id=source.match(/"courseId":(\d+)/);
 if(base&&id)return safeCourse(base[1]+'.flex.tymbaedu.com',id[1]);
 if(source.includes('data-page=')&&source.includes('TYMBAFlex'))return 'https://flex.tymbaedu.com/';
 return '';
}
function fromHTML(html){
 const url=detectSavedUrl(html);
 if(!url||typeof DOMParser==='undefined')return null;
 return fromDocument(new DOMParser().parseFromString(html,'text/html'),url);
}
const api={fromDocument,fromHTML,detectSavedUrl,safeRecord,safeCourse,safeActivity};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.TymbaBridgeParser=api;
})(typeof window!=='undefined'?window:globalThis);
