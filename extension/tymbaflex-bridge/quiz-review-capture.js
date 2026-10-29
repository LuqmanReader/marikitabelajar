/* Explicit, read-only Moodle quiz REVIEW capture.
 * Collects ONLY question grading states, attempt ID and whitelisted activity ID.
 * No question or answer text, session tokens, passwords, marks or answer keys.
 * Runs only on ILE/TwoFive; never on attempt/summary/grade pages. */
(()=>{
'use strict';
const HOSTS=new Set(['ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com']);
const STATES=new Set(['correct','incorrect','partial','ungraded','unanswered']);
const cleanURL=(href,kind,host)=>{
 try{
  const url=new URL(href,location.origin);
  if(url.protocol!=='https:'||url.hostname!==host)return null;
  if(url.pathname!==('/mod/quiz/'+kind+'.php'))return null;
  const id=url.searchParams.get(kind==='review'?'attempt':'id');
  return /^\d{1,20}$/.test(id||'')?id:null;
 }catch{return null;}
};
function statusOf(question){
 const classes=(question.className||'').toLowerCase().split(/\s+/);
 if(classes.includes('partiallycorrect'))return 'partial';
 if(classes.includes('incorrect'))return 'incorrect';
 if(classes.includes('correct'))return 'correct';
 if(classes.includes('notanswered')||classes.includes('notyetanswered'))return 'unanswered';
 if(classes.includes('requiresgrading')||classes.includes('needsgrading'))return 'ungraded';
 const state=(question.querySelector('.state')?.textContent||'').trim().toLowerCase();
 if(/partially correct/.test(state))return 'partial';
 if(/incorrect/.test(state))return 'incorrect';
 if(/^correct$/.test(state))return 'correct';
 if(/not answered|not yet answered/.test(state))return 'unanswered';
 if(/requires grading|not yet graded/.test(state))return 'ungraded';
 return 'ungraded';
}
function capture(doc,url){
 let u;
 try{u=new URL(url);}catch{return {ok:false,error:'Invalid review URL.'};}
 if(u.protocol!=='https:'||!HOSTS.has(u.hostname)||u.pathname!=='/mod/quiz/review.php')
  return {ok:false,error:'Open a completed Moodle quiz REVIEW page, not an active quiz attempt.'};
 const attemptId=cleanURL(u.href,'review',u.hostname);
 if(!attemptId)return {ok:false,error:'The quiz review has no valid attempt ID.'};
 const questions=[...doc.querySelectorAll('.que')];
 const seen=new Set(),states=[];
 for(const q of questions){
  const slot=q.getAttribute('data-slot')||q.id||'';
  if(!slot||seen.has(slot))continue;
  seen.add(slot);
  states.push(statusOf(q));
  if(states.length>=200)break;
 }
 if(!states.length)return {ok:false,error:'No reviewed questions were visible. Open a finished quiz review with per-question feedback.'};
 const candidates=[
  ...doc.querySelectorAll('a[href*="/mod/quiz/view.php?id="]'),
  ...doc.querySelectorAll('a[href*="/mod/quiz/view.php?"]')
 ];
 let quizId=null;
 for(const a of candidates){
  quizId=cleanURL(a.getAttribute('href'),'view',u.hostname);
  if(quizId)break;
 }
 const body=doc.body;
 const courseClass=String(body?.className||'').match(/(?:^|\s)course-(\d{1,12})(?:\s|$)/);
 const courseId=String(body?.dataset?.courseid||courseClass?.[1]||'');
 const validatedCourse=/^\d{1,12}$/.test(courseId)?courseId:null;
 return {
  ok:true,version:1,host:u.hostname,attempt_id:attemptId,
  course_id:validatedCourse,
  quiz_url:quizId?'https://'+u.hostname+'/mod/quiz/view.php?id='+quizId:null,
  states:states.filter(s=>STATES.has(s)),
  captured_at:new Date().toISOString(),
  note:quizId?'Recognized the quiz activity from visible review navigation.':'Choose the matching quiz in LedgerPeer before saving; this review page did not expose its quiz activity link.'
 };
}
if(typeof chrome!=='undefined'&&chrome.runtime?.onMessage){
 chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(message?.type!=='LP_CAPTURE_VISIBLE_QUIZ_REVIEW')return;
  reply(capture(document,location.href));
 });
}
window.LedgerPeerQuizReview={capture,statusOf};
})();