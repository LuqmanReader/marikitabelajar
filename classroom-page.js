(function(){
'use strict';
const $=id=>document.getElementById(id);
const node=(tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
let client,user,room,profiles=new Map(),channel=null,lastSent=0,lastPosted=0,lastRead=0;
const ago=iso=>{try{return new Date(iso).toLocaleString('en-MY',{dateStyle:'medium',timeStyle:'short'});}catch{return 'Recently';}};
function status(id,message,error=false){const e=$(id);if(!e)return;e.textContent=message;e.classList.toggle('error',error);}
function author(id){return profiles.get(id)||{display_name:'Classmate',handle:'student',pathway:'FIA',current_paper:''};}
function shortName(id){const p=author(id);return p.display_name||p.handle||'Student';}
function appendActions(container,item,kind){
 const actions=node('div','message-actions'),own=item.user_id===user.id;
 const button=node('button','',own?'REMOVE':'REPORT');button.type='button';
 button.addEventListener('click',()=>own?removeItem(item,kind):reportItem(item,kind));
 actions.append(button);container.append(actions);
}
function meta(item,kind){
 const line=node('div',kind==='message'?'message-meta':'post-meta');
 line.append(node('strong','',shortName(item.user_id)));
 line.append(node('span','','@'+author(item.user_id).handle));
 line.append(node('span','','· '+ago(item.created_at)));
 appendActions(line,item,kind);return line;
}
function renderMessages(items){
 const list=$('messages'),pin=list.scrollTop+list.clientHeight>=list.scrollHeight-110 || !lastRead;
 list.replaceChildren();
 if(!items.length)list.append(node('div','empty-state','No messages yet. Introduce yourself to the group!'));
 for(const item of items){
  const card=node('article','chat-message'+(item.user_id===user.id?' is-mine':''));
  card.append(meta(item,'message'),node('p','message-body',item.body));list.append(card);
 }
 lastRead=Date.now();
 if(pin)list.scrollTop=list.scrollHeight;
}
function renderPosts(items){
 const list=$('posts');list.replaceChildren();
 if(!items.length)list.append(node('div','empty-state','Nothing shared yet. Add the first resource or study tip.'));
 for(const item of items){
  const card=node('article','post-card');
  card.append(meta(item,'post'),node('h3','post-title',item.title),node('p','post-body',item.body));
  if(item.resource_url){
   try{
    const url=new URL(item.resource_url);
    if(url.protocol==='https:'){
     const link=node('a','resource-link','OPEN SHARED RESOURCE ↗');
     link.href=url.href;link.rel='noopener noreferrer nofollow';link.target='_blank';
     card.append(link);
    }
   }catch{}
  }
  list.append(card);
 }
}
async function loadMembers(){
 const {data:members,error}=await client.from('classroom_members').select('user_id,joined_at').eq('classroom_id',room.id).order('joined_at',{ascending:true}).limit(200);
 if(error)throw error;
 const ids=members.map(m=>m.user_id);
 if(!ids.length){$('members').replaceChildren(node('div','empty-state','No classmates yet.'));return;}
 const {data:people,error:profileError}=await client.from('student_profiles').select('user_id,display_name,handle,pathway,current_paper,bio').in('user_id',ids);
 if(profileError)throw profileError;
 profiles=new Map((people||[]).map(p=>[p.user_id,p]));
 $('memberCount').textContent=String(ids.length);
 const list=$('members');list.replaceChildren();
 for(const member of members){
  const p=author(member.user_id),card=node('div','member');
  card.append(node('div','avatar',(p.display_name||'?').slice(0,1).toUpperCase()));
  const side=node('div');
  side.append(node('strong','',p.display_name+(member.user_id===user.id?' (YOU)':'')));
  side.append(node('small','','@'+p.handle+' · '+p.pathway+(p.current_paper?' · '+p.current_paper:'')));
  if(p.bio)side.append(node('small','',p.bio));card.append(side);list.append(card);
 }
}
async function loadMessages(){
 if(!room)return;
 const {data,error}=await client.from('classroom_messages').select('id,classroom_id,user_id,body,created_at')
  .eq('classroom_id',room.id).order('created_at',{ascending:false}).limit(120);
 if(error){status('chatStatus',error.message,true);return;}
 renderMessages((data||[]).reverse());
}
async function loadPosts(){
 if(!room)return;
 const {data,error}=await client.from('classroom_posts').select('id,classroom_id,user_id,title,body,resource_url,created_at')
  .eq('classroom_id',room.id).order('created_at',{ascending:false}).limit(50);
 if(error){status('postStatus',error.message,true);return;}
 renderPosts(data||[]);
}
async function joinRoom(){
 const {data:existing,error:checkError}=await client.from('classroom_members').select('user_id').eq('classroom_id',room.id).eq('user_id',user.id).maybeSingle();
 if(checkError)throw checkError;
 if(existing)return;
 const {error}=await client.from('classroom_members').insert({classroom_id:room.id,user_id:user.id});
 if(error)throw error;
}
async function sendMessage(event){
 event.preventDefault();
 const body=$('messageText').value.trim();
 if(!body||body.length>1000)return status('chatStatus','Write a message of 1–1,000 characters.',true);
 if(Date.now()-lastSent<3000)return status('chatStatus','Give classmates a moment before sending another message.',true);
 const button=$('sendMessage');button.disabled=true;
 try{
  const {error}=await client.from('classroom_messages').insert({classroom_id:room.id,user_id:user.id,body});
  if(error)throw error;
  lastSent=Date.now();$('messageText').value='';$('messageCount').textContent='0';
  status('chatStatus','Message posted.');await loadMessages();
 }catch(error){status('chatStatus','Message not sent: '+error.message,true);}
 finally{button.disabled=false;}
}
async function sharePost(event){
 event.preventDefault();
 const title=$('postTitle').value.trim(),body=$('postText').value.trim(),input=$('postLink').value.trim();
 if(title.length<3||title.length>100||body.length<1||body.length>2200)return status('postStatus','Check your title and resource description.',true);
 if(Date.now()-lastPosted<15000)return status('postStatus','You can share another resource shortly.',true);
 let resource_url=null;
 if(input){try{const url=new URL(input);if(url.protocol!=='https:')throw Error('');resource_url=url.href;if(resource_url.length>600)throw Error('');}
  catch{return status('postStatus','Use a valid HTTPS resource link or leave it blank.',true);}}
 const button=$('sharePost');button.disabled=true;
 try{
  const {error}=await client.from('classroom_posts').insert({classroom_id:room.id,user_id:user.id,title,body,resource_url});
  if(error)throw error;
  $('postTitle').value='';$('postText').value='';$('postLink').value='';lastPosted=Date.now();
  status('postStatus','Resource shared with the class.');await loadPosts();
 }catch(error){status('postStatus','Could not share: '+error.message,true);}
 finally{button.disabled=false;}
}
async function removeItem(item,kind){
 if(item.user_id!==user.id)return;
 if(!confirm('Remove this '+(kind==='post'?'resource':'message')+' from the classroom?'))return;
 const table=kind==='post'?'classroom_posts':'classroom_messages';
 const {error}=await client.from(table).delete().eq('id',item.id).eq('user_id',user.id);
 if(error){status(kind==='post'?'postStatus':'chatStatus','Could not remove: '+error.message,true);return;}
 if(kind==='post')await loadPosts();else await loadMessages();
}
async function reportItem(item,kind){
 const requested=prompt('Report reason: spam, harassment, unsafe, or other');
 if(requested===null)return;
 const reason=requested.trim().toLowerCase();
 if(!['spam','harassment','unsafe','other'].includes(reason)){
  status(kind==='post'?'postStatus':'chatStatus','Report not sent. Choose spam, harassment, unsafe, or other.',true);return;
 }
 const record={reporter_id:user.id,classroom_id:room.id,reason};
 record[kind==='post'?'post_id':'message_id']=item.id;
 const {error}=await client.from('classroom_reports').insert(record);
 status(kind==='post'?'postStatus':'chatStatus',error?'Report was not sent: '+error.message:'Report submitted for moderator review.',Boolean(error));
}
function switchTab(which){
 const chat=which==='chat';
 $('chatPanel').hidden=!chat;$('resourcePanel').hidden=chat;
 $('chatTab').setAttribute('aria-selected',String(chat));
 $('resourceTab').setAttribute('aria-selected',String(!chat));
 if(!chat)loadPosts();
}
function subscribe(){
 channel=client.channel('ledgerpeer-commons-'+room.id)
  .on('postgres_changes',{event:'*',schema:'public',table:'classroom_messages',filter:'classroom_id=eq.'+room.id},()=>loadMessages())
  .on('postgres_changes',{event:'*',schema:'public',table:'classroom_posts',filter:'classroom_id=eq.'+room.id},()=>loadPosts())
  .on('postgres_changes',{event:'*',schema:'public',table:'classroom_members',filter:'classroom_id=eq.'+room.id},()=>loadMembers())
  .subscribe(state=>{if(state==='SUBSCRIBED')status('classStatus','CLASSROOM CONNECTED · Messages update live.');
      if(state==='CHANNEL_ERROR'||state==='TIMED_OUT')status('classStatus','Realtime temporarily unavailable · classroom refreshes automatically.');});
 const refresh=setInterval(()=>{if(!document.hidden){loadMessages();loadPosts();loadMembers();}},15000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){loadMessages();loadPosts();loadMembers();}});
 window.addEventListener('pagehide',()=>{clearInterval(refresh);if(channel)client.removeChannel(channel);},{once:true});
}
async function init(){
 try{
  const A=window.PersonalHubAuth;
  if(!A)throw Error('Student login is unavailable.');
  const ready=await A.ready();
  if(!ready){if(!A.isRedirectingToProfile?.())location.replace(A.signInUrl('classroom.html'));return;}
  client=A.getClient();user=A.getUser();
  if(!client||!user)throw Error('You must sign in first.');
  const {data,error}=await client.from('classrooms').select('id,name,description').eq('slug','ledgerpeer-commons').maybeSingle();
  if(error)throw error;if(!data)throw Error('The Study Commons is not configured.');
  room=data;await joinRoom();await loadMembers();await Promise.all([loadMessages(),loadPosts()]);
  $('chatTab').addEventListener('click',()=>switchTab('chat'));
  $('resourceTab').addEventListener('click',()=>switchTab('posts'));
  $('chatForm').addEventListener('submit',sendMessage);$('postForm').addEventListener('submit',sharePost);
  $('messageText').addEventListener('input',()=>{$('messageCount').textContent=String($('messageText').value.length);});
  $('messageText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('chatForm').requestSubmit();}});
  A.addLockButton?.();
  $('classApp').hidden=false;subscribe();
 }catch(error){
  status('classStatus','Classroom could not load: '+(error.message||error)+'. Try signing in again from the student homepage.',true);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();