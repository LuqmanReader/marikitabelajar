/* LedgerPeer TYMBAFlex accuracy dashboard
 * Requires student-consented capture of FINISHED Moodle quiz review pages.
 * No attempts/answers/grades fetched automatically from institutional services. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),P=window.TymbaBridgeParser;
const HOSTS=new Set(['ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com']);
const STATES=new Set(['correct','incorrect','partial','ungraded','unanswered']);
const report=$('tfReviewMessage'),btn=$('tfSyncReviews'),graph=$('tfAttemptGraphs'),untouched=$('tfUntouchedList');
const paperFilter=$('tfPerformancePaper'),hostFilter=$('tfPerformanceSource');
const pendingBox=$('tfReviewMatchSection'),pendingList=$('tfReviewMatches');
let client,user,courses=[],attempts=[],pending=[],busy=false,request=null;
const el=(tag,text,css)=>{
 const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);
 if(css)e.className=css;return e;
};
function notice(msg,error=false){report.textContent=msg;report.classList.toggle('bad',error);}
function paperOf(title){
 if(/financial accounting\s*2|\bfa\s*2\b/i.test(title))return 'FA2';
 if(/management accounting\s*2|\bma\s*2\b/i.test(title))return 'MA2';
 return 'OTHER';
}
function courseKey(c){return c.source_host+'|'+c.course_id;}
function quizKey(host,course,url){return host+'|'+course+'|'+url;}
function filtered(){return courses.filter(c=>(paperFilter.value==='all'||c.paper===paperFilter.value)&&(hostFilter.value==='all'||c.source_host===hostFilter.value));}
function sanitizedCourse(c){
 const url=P?.safeCourse(c.source_host,String(c.course_id));
 if(!url)return null;
 const activities=[],seen=new Set();
 for(const raw of (Array.isArray(c.activities)?c.activities:[]).slice(0,200)){
  const link=P.safeActivity(raw?.url,c.source_host);
  if(!link||seen.has(link.url)||!String(raw.name||'').trim())continue;
  seen.add(link.url);
  activities.push({url:link.url,name:String(raw.name).slice(0,140),
   section:String(raw.section||'').slice(0,100),
   type:link.kind,completion_status:raw.completion_status==='todo'?'todo':raw.completion_status==='done'||raw.completed===true?'done':'unknown'});
 }
 return {source_host:c.source_host,course_id:String(c.course_id),title:String(c.title||'Course').slice(0,160),
  paper:paperOf(c.title||''),activities};
}
function quizRows(course){return course.activities.filter(a=>a.type==='quiz');}
function cleanCapture(item){
 if(!item||!HOSTS.has(item.host)||!/^\d{1,20}$/.test(String(item.attempt_id||'')))return null;
 const states=Array.isArray(item.states)?item.states.slice(0,200):[];
 if(!states.length||states.some(s=>!STATES.has(s)))return null;
 let quiz_url=null;
 if(item.quiz_url){
  const q=P.safeActivity(item.quiz_url,item.host);
  if(q?.kind==='quiz')quiz_url=q.url;
 }
 const course_id=/^\d{1,12}$/.test(String(item.course_id||''))?String(item.course_id):null;
 return {source_host:item.host,course_id,quiz_url,attempt_id:String(item.attempt_id),question_states:states,
  captured_at:/^\d{4}-\d\d-\d\dT/.test(item.captured_at||'')?item.captured_at:new Date().toISOString()};
}
function resolve(capture){
 const matches=[];
 for(const c of courses){
  if(c.source_host!==capture.source_host)continue;
  if(!capture.quiz_url&&capture.course_id&&c.course_id!==capture.course_id)continue;
  for(const a of quizRows(c)){
   if(capture.quiz_url&&a.url!==capture.quiz_url)continue;
   matches.push({course:c,activity:a});
  }
 }
 // Automatic mapping ONLY when Moodle exposed an exact whitelisted quiz URL.
 if(capture.quiz_url&&matches.length===1)return matches[0];
 return null;
}
async function saveCapture(capture,target){
 const c=target.course,a=target.activity;
 if(!c||!a||c.source_host!==capture.source_host||
  !quizRows(c).some(x=>x.url===a.url))throw Error('Invalid course or quiz mapping.');
 if(capture.quiz_url&&capture.quiz_url!==a.url)throw Error('This review belongs to another quiz.');
 if(!capture.quiz_url&&capture.course_id&&capture.course_id!==c.course_id)throw Error('This review belongs to another course.');
 const row={user_id:user.id,source_host:c.source_host,course_id:c.course_id,
  quiz_url:a.url,attempt_id:capture.attempt_id,question_states:capture.question_states,
  captured_at:capture.captured_at};
 const {error}=await client.from('tymbaflex_quiz_attempts').upsert(row,
  {onConflict:'user_id,source_host,attempt_id'});
 if(error)throw Error(error.message||'Could not save attempt.');
}
function selectOptions(capture){
 const options=[];
 for(const c of courses){
  if(c.source_host!==capture.source_host||(!capture.quiz_url&&capture.course_id&&capture.course_id!==c.course_id))continue;
  for(const q of quizRows(c)){
   if(capture.quiz_url&&q.url!==capture.quiz_url)continue;
   options.push({course:c,activity:q});
  }
 }
 return options;
}
function showPending(){
 pendingList.replaceChildren();pendingBox.hidden=pending.length===0;
 for(const capture of pending){
  const choices=selectOptions(capture),wrap=el('div',undefined,'tf-match-item');
  const title=el('strong','Review attempt #'+capture.attempt_id+' · '+capture.question_states.length+' question results · '+(capture.source_host.startsWith('ile.')?'ILE':'Group B'));
  wrap.append(title);
  const choice=el('select');choice.setAttribute('aria-label','Choose the original quiz for attempt '+capture.attempt_id);
  choice.append(el('option','Select matching tutorial or quiz…'));
  choice.options[0].value='';
  for(let i=0;i<choices.length;i++){
   const c=choices[i];
   const opt=el('option',c.course.paper+' / '+c.course.title+' / '+c.activity.name);
   opt.value=String(i);choice.append(opt);
  }
  const save=el('button','SAVE MATCH','tf-match-save');save.type='button';
  save.addEventListener('click',async()=>{
   if(busy||!choice.value){notice('Select the correct quiz before saving an unmatched review.',true);return;}
   const target=choices[Number(choice.value)];
   if(!target)return;
   busy=true;save.disabled=true;
   try{
    await saveCapture(capture,target);
    pending=pending.filter(x=>!(x.source_host===capture.source_host&&x.attempt_id===capture.attempt_id));
    await refresh();
    notice('Linked attempt #'+capture.attempt_id+' to '+target.activity.name+'.');
   }catch(err){notice(err.message,true);}
   finally{busy=false;save.disabled=false;}
  });
  wrap.append(choice,save);pendingList.append(wrap);
 }
}
async function refresh(){
 const [cs,as]=await Promise.all([
  client.from('tymbaflex_bridge_courses')
   .select('source_host,course_id,title,activities').eq('user_id',user.id).limit(50),
  client.from('tymbaflex_quiz_attempts')
   .select('source_host,course_id,quiz_url,attempt_id,question_states,captured_at')
   .eq('user_id',user.id).order('captured_at',{ascending:false}).limit(1000)
 ]);
 if(cs.error)throw cs.error;if(as.error)throw as.error;
 courses=(cs.data||[]).map(sanitizedCourse).filter(Boolean);
 const valid=new Set();
 for(const c of courses)for(const q of quizRows(c))valid.add(quizKey(c.source_host,c.course_id,q.url));
 attempts=(as.data||[]).filter(x=>valid.has(quizKey(x.source_host,x.course_id,x.quiz_url))
  &&Array.isArray(x.question_states)&&x.question_states.every(s=>STATES.has(s)));
 render();
}
function square(state,i){
 const span=el('span',undefined,'tf-square '+state);
 span.title='Question '+(i+1)+': '+({correct:'Correct',incorrect:'Wrong',partial:'Partly correct',ungraded:'Not graded',unanswered:'Unanswered'}[state]||'Unspecified');
 span.setAttribute('role','img');span.setAttribute('aria-label',span.title);return span;
}
function attemptRow(attempt){
 const row=el('div',undefined,'tf-attempt-row'),stats={correct:0,incorrect:0,partial:0,ungraded:0,unanswered:0};
 const cells=el('div',undefined,'tf-square-grid');
 attempt.question_states.forEach((s,i)=>{stats[s]++;cells.append(square(s,i));});
 row.append(cells);
 const bar=el('div',undefined,'tf-attempt-meta');
 const dated=new Date(attempt.captured_at);
 bar.append(el('span','ATTEMPT '+attempt.attempt_id+' · '+(Number.isFinite(dated.valueOf())?dated.toLocaleDateString('en-MY'):'Captured review')));
 bar.append(el('strong',stats.correct+' correct · '+stats.incorrect+' wrong'+(stats.partial?' · '+stats.partial+' partial':'')+
   (stats.ungraded?' · '+stats.ungraded+' ungraded':'')+(stats.unanswered?' · '+stats.unanswered+' unanswered':'')));
 row.append(bar);return row;
}
function resultsFor(c,q){
 return attempts.filter(a=>a.source_host===c.source_host&&a.course_id===c.course_id&&a.quiz_url===q.url);
}
function resultGraph(c,q,entries){
 const box=el('article',undefined,'tf-quiz-graph');
 const header=el('div',undefined,'tf-quiz-graph-head');
 const title=el('div');title.append(el('strong',q.name));
 title.append(el('small',c.paper+' · '+(c.source_host.startsWith('ile.')?'ILE':'GROUP B')+' · '+entries.length+' saved attempt'+(entries.length!==1?'s':'')));
 const link=el('a','OPEN QUIZ ↗');link.href=q.url;link.target='_blank';link.rel='noopener noreferrer';
 header.append(title,link);box.append(header);
 for(const entry of entries)box.append(attemptRow(entry));
 return box;
}
function render(){
 const selected=filtered();
 const quizzes=selected.flatMap(c=>quizRows(c).map(q=>({c,q})));
 const attempted=quizzes.filter(({c,q})=>resultsFor(c,q).length);
 const missing=quizzes.filter(({c,q})=>!resultsFor(c,q).length);
 const visibleAttempts=attempted.flatMap(({c,q})=>resultsFor(c,q));
 const allStates=visibleAttempts.flatMap(a=>a.question_states);
 $('tfReviewedQuizzes').textContent=String(attempted.length);
 $('tfCorrectQuestions').textContent=String(allStates.filter(s=>s==='correct').length);
 $('tfWrongQuestions').textContent=String(allStates.filter(s=>s==='incorrect').length);
 $('tfNotCaptured').textContent=String(missing.length);
 $('tfAttemptSummary').textContent=attempted.length+' quizzes · '+visibleAttempts.length+' recorded reviews';
 $('tfUntouchedSummary').textContent=missing.length+' quiz activities without an imported review';
 graph.replaceChildren();
 if(!attempted.length){
  graph.append(el('p','No per-question results imported yet. Open a finished Moodle quiz review, capture it in Chrome, then sync here.','tf-result-empty'));
 }else{
  for(const {c,q} of attempted)graph.append(resultGraph(c,q,resultsFor(c,q)));
 }
 untouched.replaceChildren();
 const group=new Map();
 for(const {c,q} of missing){
  const ck=courseKey(c);
  if(!group.has(ck))group.set(ck,{course:c,items:[]});
  group.get(ck).items.push(q);
 }
 if(!missing.length)untouched.append(el('p',courses.length?'Every imported quiz has at least one captured review.':'Import your TYMBAFlex course list to show activities.','tf-result-empty'));
 for(const {course,items} of group.values()){
  const details=el('details',undefined,'tf-untouched-group'),summary=el('summary',course.paper+' · '+(course.source_host.startsWith('ile.')?'ILE':'GROUP B')+' · '+items.length+' uncaptured');
  details.append(summary);
  const list=el('ol');
  for(const q of items){
   const li=el('li');
   const a=el('a',q.name);a.href=q.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);
   if(q.completion_status==='todo')li.append(el('span','Moodle: To do','tf-moodle-todo'));
   else if(q.completion_status==='done')li.append(el('span','Moodle: Done (score not imported)','tf-moodle-done'));
   list.append(li);
  }
  details.append(list);untouched.append(details);
 }
 const todoList=$('tfMoodleTodoList');
 todoList.replaceChildren();
 let todoTotal=0;
 for(const c of selected){
  const todo=c.activities.filter(a=>a.completion_status==='todo');
  if(!todo.length)continue;
  todoTotal+=todo.length;
  const details=el('details',undefined,'tf-untouched-group');
  const summary=el('summary',c.paper+' · '+(c.source_host.startsWith('ile.')?'ILE':'GROUP B')+' · '+todo.length+' marked To do');
  details.append(summary);
  const list=el('ol');
  for(const activity of todo){
   const li=el('li'),a=el('a',activity.name);
   a.href=activity.url;a.target='_blank';a.rel='noopener noreferrer';
   li.append(a);list.append(li);
  }
  details.append(list);todoList.append(details);
 }
 $('tfMoodleTodoCount').textContent=todoTotal+' To do activities in last imported snapshots';
 if(!todoTotal)todoList.append(el('p','No explicit To do indicators are present in the saved course snapshots. Refresh the Bridge to import the latest completion labels.','tf-result-empty'));
 showPending();
}
async function importReviews(records){
 if(!user||!client)throw Error('Sign in to LedgerPeer first.');
 if(!courses.length)throw Error('Import your ILE and Group B course lists via TYMBAFlex Bridge before importing quiz results.');
 if(!Array.isArray(records))throw Error('The extension returned no valid capture list.');
 const clean=records.slice(0,200).map(cleanCapture).filter(Boolean);
 let saved=0,unmatched=[];
 const seen=new Set();
 for(const c of clean){
  const id=c.source_host+'|'+c.attempt_id;if(seen.has(id))continue;seen.add(id);
  const match=resolve(c);
  if(match){
   try{await saveCapture(c,match);saved++;}catch(err){unmatched.push(c);}
  }else unmatched.push(c);
 }
 pending=unmatched;
 await refresh();
 const message='Imported '+saved+' reviewed attempt(s). '+pending.length+' review(s) need manual tutorial matching. '+(clean.length?'Review squares now show what was actually captured.':'Open a finished quiz Review page and capture it with the extension first.');
 notice(message,Boolean(!saved&&pending.length===0));
}
function requestSync(){
 if(busy)return;busy=true;btn.disabled=true;
 notice('Reading saved review summaries from the Chrome extension…');
 const requestId=crypto.randomUUID();
 const timeout=setTimeout(()=>{
  if(request?.requestId!==requestId)return;
  request=null;busy=false;btn.disabled=false;
  notice('Extension did not respond. Install/reload v0.4.0, refresh this page, then try again.',true);
 },8500);
 request={requestId,timeout};
 window.postMessage({type:'LP_TYMBA_REVIEWS_REQUEST',requestId},location.origin);
}
window.addEventListener('message',async event=>{
 if(event.source!==window||event.origin!==location.origin||event.data?.type!=='LP_TYMBA_REVIEWS_RESULT')return;
 if(!request||event.data.requestId!==request.requestId)return;
 clearTimeout(request.timeout);request=null;
 try{
  if(event.data.error)throw Error(event.data.error);
  await importReviews(event.data.captures);
 }catch(err){notice(err.message||'Could not sync review results.',true);}
 finally{busy=false;btn.disabled=false;}
});
btn.addEventListener('click',requestSync);
paperFilter.addEventListener('change',render);
hostFilter.addEventListener('change',render);
async function start(){
 try{
  const auth=window.PersonalHubAuth;
  if(!auth||!P)throw Error('LedgerPeer login or bridge parser is unavailable.');
  if(!(await auth.ready()))return;
  client=auth.getClient();user=auth.getUser();
  if(!client||!user?.id)return;
  await refresh();
  notice(attempts.length?'Loaded your private Moodle quiz review summaries.':'No reviewed quiz results saved yet. Use the extension to capture a finished quiz review.');
 }catch(err){notice('Cannot load quiz accuracy dashboard: '+(err?.message||'Unexpected error'),true);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();