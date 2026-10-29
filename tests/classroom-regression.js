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
assert.ok(profilePage.includes('id="subjectOptions"')&&profilePage.includes('id="subjectSearch"'),'Profile must offer searchable multi-subject selection');
assert.ok(profilePage.includes('subject-catalog.js?v=20261028multisubject'),'Profile subjects must come from shared FIA/ACCA syllabus catalogue');
assert.ok(profile.includes('current_papers:papers')&&profile.includes("current_paper:papers[0]||''"),'Profile must save all subjects and a legacy primary subject');
assert.ok(profile.includes('restoreSubjects(data)'),'Existing users must get selected subjects restored');
assert.ok(profile.includes("select('display_name,handle,pathway,current_paper,current_papers,bio')"),'Profile loading must request the complete paper list');
assert.ok(room.includes('current_paper,current_papers,bio'),'Classroom must query all subject selections');
assert.ok(room.includes("subjects.join(' · ')"),'Classmate directory must display all chosen subjects');
assert.ok(read('profile-subjects.css').includes('.subject-choice-grid'),'Multiple-subject picker must be responsive');
assert.ok(read('supabase/student-profile-multiple-papers.sql').includes('current_papers text[]'),'Schema migration must preserve multiple selections');

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
assert.ok(classPage.includes('classroom-page.js?v=')&&classPage.includes('classroom.css?v='),'Classroom must use versioned assets to bypass stale browser cache');
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

const sharedNav=read('site-nav.css');
assert.ok(sharedNav.includes('.site-back{')&&sharedNav.includes('.back-navigation-row'),'Consistent back-button style must exist in shared stylesheet');
const backRoutes=[
 ['classroom.html','index.html','BACK TO HOME'],
 ['hub.html','index.html','BACK TO HOME'],
 ['view.html','hub.html','BACK TO REVISION'],
 ['add-exam.html','hub.html','BACK TO REVISION'],
 ['notes.html','hub.html','BACK TO REVISION'],
 ['quiz.html','notes.html','BACK TO STUDY LIBRARY'],
 ['ai-tutor.html','hub.html','BACK TO REVISION'],
 ['about.html','index.html','BACK TO HOME'],
 ['profile.html','index.html','BACK TO HOME'],
 ['quant-model.html','hub.html','BACK TO REVISION'],
 ['fia-study.html','notes.html?edition=fia-2','BACK TO STUDY LIBRARY']
];
for(const [file,url,label] of backRoutes){
 const html=read(file);
 assert.ok(html.includes('site-nav.css?v=20261028-unifiedback'),file+' must load shared button CSS');
 const anchors=[...html.matchAll(/<a\b[^>]*>[^<]*<\/a>/g)].map(m=>m[0]);
 assert.ok(anchors.some(a=>a.includes('site-back')&&a.includes('href="'+url+'"')&&a.includes('← '+label)),file+' needs consistent back link to '+url);
}
for(const page of ['calendar.html','study-planner.html']){
 assert.ok(read(page).includes('site-nav.css?v=20261028-unifiedback'),page+' must load shared back CSS');
}
assert.ok(read('productivity-core.js').includes('class="site-back" href="index.html">← BACK TO HOME'),'Planner and Calendar must render a labelled home button');
assert.ok(read('classroom.html').includes('aria-label="Return to homepage"'),'Classroom home button must be outside the gated chat and visible near the top');
assert.ok(read('ai-tutor.html').includes('PersonalHubAuth.guard()'),'AI Tutor must honor the account gate');

// Home routing + student navigation should remain intact.
const homepage=read('index.html'),music=read('spotify-study-music.js');
assert.ok(auth.includes("||'index.html#access'"),'Standard login should open the signed-in homepage workspace');
assert.ok(homepage.includes("document.body.classList.add('lp-workspace-ready')"),'Authenticated homepage should show the student workspace immediately');
assert.ok(homepage.includes('class="workspace-grid"')&&['notes.html?edition=fia-2','quiz.html','hub.html','classroom.html'].every(x=>homepage.includes('href="'+x+'"')),'Homepage must expose all four core student tools');
assert.ok(homepage.includes('id="workspaceMusicButton"')&&music.includes('workspaceMusicButton'),'Study Music must open from homepage utilities');
assert.ok(auth.includes("querySelector('#hubView .workspace-utilities')"),'Sync status must be integrated into homepage utilities');

console.log('PASS: classroom page, Supabase integration, client-side safety checks, and onboarding routing contracts.');
