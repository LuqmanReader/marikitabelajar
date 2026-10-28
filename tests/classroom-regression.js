'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
for(const file of ['auth.js','profile-page.js','classroom-page.js']){
 assert.doesNotThrow(()=>new Function(read(file)),file+' must parse as JavaScript');
}
const auth=read('auth.js'),profile=read('profile-page.js'),room=read('classroom-page.js');
const profilePage=read('profile.html'),classPage=read('classroom.html');
assert.ok(auth.includes("from('student_profiles').select('user_id')"),'Profile must be checked on private account entry');
assert.ok(auth.includes("location.replace('profile.html'+next)"),'Incomplete profiles must redirect to setup while retaining their destination');
assert.ok(auth.includes("profileRedirecting"),'Onboarding redirect must be preserved');
assert.ok(auth.includes("function safeDestination(raw)")&&auth.includes("const allowed=new Set("),'Only same-site approved destinations may be used');
assert.ok(auth.includes("function signInUrl(next)")&&auth.includes("loginLanding()"),'Direct classroom link must return to intended page after sign-in');
assert.ok(auth.includes("searchParams.get('next')"),'Pending classroom route must survive profile completion');
assert.ok(auth.includes("getClient(){return client;}")&&auth.includes("getUser(){return user;}"),'Pages must reuse the existing account session');
assert.ok(profile.includes("from('student_profiles').upsert(payload"),'Profile form must save in Supabase');
assert.ok(profile.includes("from('classroom_members').insert("),'Profile completion should join the shared room');
assert.ok(profile.includes("user_id:user.id"),'Profile writes must bind to signed-in user');
assert.ok(profilePage.includes('type="checkbox" id="guidelines" required'),'Require classroom etiquette agreement');
assert.ok(profilePage.includes('maxlength="240"')&&profilePage.includes('maxlength="50"'),'Limit profile data');
assert.ok(profilePage.includes('Use a nickname if you prefer.'),'Avoid collecting unnecessary identifying data');
assert.ok(classPage.includes('id="messages"')&&classPage.includes('id="chatForm"'),'Group chat must exist');
assert.ok(classPage.includes('id="postForm"')&&classPage.includes('id="members"'),'Resources and classmate directory must exist');
assert.ok(room.includes("from('classroom_members')"),'Room must have actual membership data');
assert.ok(room.includes("from('classroom_messages')")&&room.includes("from('classroom_posts')"),'Messages and posts must use Supabase');
assert.ok(room.includes("from('classroom_reports')"),'Users need a reporting mechanism');
assert.ok(room.includes("postgres_changes"),'Classroom must subscribe to live updates');
assert.ok(room.includes("A.signInUrl('classroom.html')"),'Direct room access must return to room after sign-in');
assert.ok(profile.includes("PersonalHubAuth.safeDestination(requested)"),'Profile completion must resume a safe original destination');
assert.ok(read('index.html').includes("const next=A.safeDestination(new URL(location.href).searchParams.get('next'))"),'Signed-in homepage must redirect to requested page safely');
assert.ok(room.includes("setInterval("),'Classroom must also refresh when realtime is unavailable');
assert.ok(room.includes("textContent"),'Render user-generated text without inserting HTML');
assert.ok(!room.includes('.innerHTML='),'Never inject untrusted user messages as HTML');
assert.ok(room.includes("url.protocol==='https:'"),'Only allow HTTPS resource links');
assert.ok(classPage.includes('type="file" id="attachmentInput"'),'Classroom attachments must have an actual file input');
assert.ok(classPage.includes('id="replyTray"')&&classPage.includes('id="cancelReply"'),'Reply composer must support preview and cancellation');
assert.ok(room.includes('function selectReply(')&&room.includes('function clearReply('),'Chat must manage reply selection');
assert.ok(room.includes('function replyQuote(')&&room.includes('function jumpToMessage('),'Quoted replies must link back to originals');
assert.ok(room.includes('payload.reply_to_message_id=replyId'),'Reply target must persist with messages in Supabase');
assert.ok(room.includes("const footer=make('div','chat-message-footer')")&&room.includes("addActions(footer,item,'message')"),'Reply action must appear in a visible footer below each chat message');
assert.ok(read('classroom.css').includes('.chat-bubble .chat-message-footer .message-actions .reply-action'),'Reply must be prominent inside the message footer');
assert.ok(classPage.includes('classroom-page.js?v=5')&&classPage.includes('classroom.css?v=5'),'Updated chat assets must bypass stale browser cache');
assert.ok(room.includes("select('id,classroom_id,user_id,body,created_at,reply_to_message_id')"),'Message loading must include reply references');
assert.ok(classPage.includes('REPLIES ENABLED · CHAT v5'),'Classroom must show a visible deployment and reply hint');
assert.ok(read('classroom.css').includes('.quoted-reply')&&read('classroom.css').includes('.reply-tray'),'Linked replies must have responsive presentation styles');
assert.ok(read('supabase/classroom-replies-schema.sql').includes('on delete set null (reply_to_message_id)'),'Database must preserve valid room-scoped reply references');
for(const file of ['hub.html','index.html','notes.html','quiz.html','study-planner.html']){
 assert.ok(read(file).includes('href="classroom.html"'),file+' should link Classroom');
}
for(const file of ['notes-page.js','quiz-page.js','calendar.html','study-planner.html']){
 assert.ok(read(file).includes('isRedirectingToProfile'),'Existing app page must not override onboarding redirect: '+file);
}
assert.ok(read('ai-tutor.html').includes('PersonalHubAuth.guard()'),'AI Tutor must honor the account gate');
console.log('PASS: classroom page, Supabase integration, client-side safety checks, and onboarding routing contracts.');
