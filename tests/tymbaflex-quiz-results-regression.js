'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const manifest=JSON.parse(read('extension/tymbaflex-bridge/manifest.json'));
const captureJS=read('extension/tymbaflex-bridge/quiz-review-capture.js');
const popup=read('extension/tymbaflex-bridge/review-capture-popup.js');
const html=read('tymbaflex-revision.html');
const dashboard=read('tymbaflex-performance.js'),css=read('tymbaflex-revision.css');
const bridge=read('extension/tymbaflex-bridge/ledgerpeer-content.js');
const worker=read('extension/tymbaflex-bridge/service-worker.js');
const sql=read('supabase/tymbaflex-quiz-review-attempts.sql');
assert.equal(manifest.version,'0.4.0');
assert.deepEqual(manifest.permissions,['tabs','storage'],'No cookies, webRequest, history or credential permissions');
const reader=manifest.content_scripts.find(s=>s.js.includes('quiz-review-capture.js'));
assert.ok(reader&&reader.matches.length===2);
assert.ok(reader.matches.every(m=>m.includes('/mod/quiz/review.php')),'Capture only applies to finished review URLs');
const dashboardScript=manifest.content_scripts.find(s=>s.js.includes('ledgerpeer-content.js'));
assert.ok(dashboardScript.matches.some(m=>m.includes('tymbaflex-revision.html')),'Extension must be present on dashboard');
for(const source of [captureJS,popup,dashboard,bridge,worker])assert.doesNotThrow(()=>new Function(source),'Valid script');
assert.ok(!/fetch\(|XMLHttpRequest|chrome\.cookies|chrome\.webRequest|document\.cookie/.test(captureJS),'No network requests or credential access in capture');
assert.ok(captureJS.includes("'/mod/quiz/review.php'"),'Review capture must reject active attempt and course overview');
assert.ok(popup.includes("chrome.storage.local.set"),'Capture stores only summary in browser until user syncs');
assert.ok(popup.includes("button.addEventListener('click'"),'Capture requires button click');
assert.ok(worker.includes('LP_COLLECT_QUIZ_REVIEWS')&&worker.includes('sender.frameId!==0'),'Only first-party dashboard requests saved capture');
assert.ok(dashboard.includes('LP_TYMBA_REVIEWS_REQUEST')&&dashboard.includes("client.from('tymbaflex_quiz_attempts')"),'Dashboard connects extension to RLS results');
assert.ok(dashboard.includes('const match=resolve(c)'),'Never attach unknown quiz reviews automatically');
assert.ok(dashboard.includes('Choose the matching')||dashboard.includes('Select matching'),'User must explicitly assign ambiguous review to tutorial');
assert.ok(dashboard.includes("if(capture.quiz_url&&capture.quiz_url!==a.url)"),'Prevent mismapping an identified review');
assert.ok(dashboard.includes('without an imported review'),'Untouched list must not imply no prior attempt');
for(const c of ['correct','incorrect','partial','ungraded','unanswered'])assert.ok(css.includes('.tf-square.'+c),'All question result colors required');
for(const id of ['tfSyncReviews','tfReviewedQuizzes','tfCorrectQuestions','tfWrongQuestions','tfNotCaptured','tfAttemptGraphs','tfUntouchedList','tfReviewMatches'])
 assert.ok(html.includes('id="'+id+'"'),'Required dashboard element: '+id);
assert.ok(sql.includes('enable row level security')&&sql.includes('auth.uid()'),'Student-owned RLS protection');
assert.ok(sql.includes('foreign key(user_id,source_host,course_id)'),'Attempt must match an imported course');
assert.ok(sql.includes('question_states jsonb'),'Only status labels are saved, not answer text');
const questions=[
 {id:'q1',className:'que multichoice correct',answer:'PRIVATE ANSWER',getAttribute:k=>k==='data-slot'?'1':null,querySelector:()=>null},
 {id:'q2',className:'que multichoice incorrect',answer:'PRIVATE ANSWER',getAttribute:k=>k==='data-slot'?'2':null,querySelector:()=>null},
 {id:'q3',className:'que numerical partiallycorrect',getAttribute:k=>k==='data-slot'?'3':null,querySelector:()=>null},
 {id:'q4',className:'que numerical',getAttribute:k=>k==='data-slot'?'4':null,querySelector:sel=>sel==='.state'?{textContent:'Not answered'}:null},
 {id:'q5',className:'que numerical',getAttribute:k=>k==='data-slot'?'5':null,querySelector:sel=>sel==='.state'?{textContent:'Requires grading'}:null}
];
const reviewDoc={
 body:{className:'format-topics course-758',dataset:{}},
 querySelectorAll:selector=>{
  if(selector==='.que')return questions;
  if(selector.startsWith('a[href*='))return [{getAttribute:()=> 'https://twofive.flex.tymbaedu.com/mod/quiz/view.php?id=29011&sesskey=NEVER_EXPORT'}];
  return [];
 }
};
const win={};
const ctx={window:win,URL,Date,location:{origin:'https://twofive.flex.tymbaedu.com'},document:reviewDoc};
vm.runInNewContext(captureJS,ctx);
const capture=win.LedgerPeerQuizReview.capture;
const snap=capture(reviewDoc,'https://twofive.flex.tymbaedu.com/mod/quiz/review.php?attempt=12345&sesskey=SUPER_PRIVATE');
assert.equal(snap.ok,true);
assert.equal(snap.host,'twofive.flex.tymbaedu.com');
assert.equal(snap.course_id,'758');
assert.equal(snap.quiz_url,'https://twofive.flex.tymbaedu.com/mod/quiz/view.php?id=29011');
assert.equal(snap.attempt_id,'12345');
assert.deepEqual(Array.from(snap.states),['correct','incorrect','partial','unanswered','ungraded']);
assert.equal(JSON.stringify(snap).includes('PRIVATE'),false,'No session keys/answers may be present');
assert.equal(JSON.stringify(snap).includes('NEVER_EXPORT'),false);
assert.equal(capture(reviewDoc,'https://twofive.flex.tymbaedu.com/mod/quiz/attempt.php?attempt=12345').ok,false,'Never capture an active attempt');
assert.equal(capture(reviewDoc,'https://another.example/mod/quiz/review.php?attempt=12345').ok,false,'Never capture off-domain reviews');
const docNoLink={body:{className:'course-5'},querySelectorAll:sel=>sel==='.que'?questions:[]};
const unlinked=capture(docNoLink,'https://ile.flex.tymbaedu.com/mod/quiz/review.php?attempt=999');
assert.equal(unlinked.ok,true);assert.equal(unlinked.quiz_url,null,'Missing quiz identity requires manual mapping');
console.log('PASS: Private ILE/Group B quiz review correctness snapshots, green/red squares, safe extension import, unmatched quiz mapping and student RLS.');
