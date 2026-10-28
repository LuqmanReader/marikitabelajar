(function(){
'use strict';
const $=id=>document.getElementById(id);
const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
const MAX_FILES=4,MAX_SIZE=15*1024*1024,BUCKET='classroom-media';
const mimeMap={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',mp4:'video/mp4',webm:'video/webm',pdf:'application/pdf',txt:'text/plain',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
let client,user,room,profiles=new Map(),channel,refreshTimer;
let messages=[],media=[],posts=[],pendingFiles=[],messageLimit=100,mediaShown=36;
let replyParents=new Map(),replyingTo=null;
let lastSent=0,lastPosted=0,mediaKind='all',messageSignature='',urlCache=new Map(),allMessageMedia=new Map(),reloading=false,shouldReload=false;
function status(id,msg,error=false){const element=$(id);if(element){element.textContent=msg||'';element.classList.toggle('error',error);}}
function person(id){return profiles.get(id)||{display_name:'Classmate',handle:'student',pathway:'FIA',current_paper:''};}
function fullName(id){const p=person(id);return p.display_name||p.handle||'Classmate';}
function formatDate(stamp){return new Date(stamp).toLocaleString('en-MY',{dateStyle:'medium',timeStyle:'short'});}
function formatTime(stamp){return new Date(stamp).toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'});}
function day(stamp){return new Date(stamp).toLocaleDateString('en-MY',{year:'numeric',month:'short',day:'numeric'});}
function sizeText(n){return n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.ceil(n/1024))+' KB';}
function fileKind(mime){return mime.startsWith('image/')?'image':mime.startsWith('video/')?'video':'document';}
function extension(name){return String(name).split('.').pop().toLowerCase();}
function acceptedFile(file){const ext=extension(file.name),mime=mimeMap[ext];return mime&&(!file.type||file.type===mime)?{mime,kind:fileKind(mime)}:null;}
function addActions(line,item,type){
 const mine=item.user_id===user.id,btn=make('button','',mine?'REMOVE':'REPORT');
 btn.type='button';btn.title=mine?'Remove from classroom':'Report to moderators';
 btn.addEventListener('click',()=>mine?removeItem(item,type):reportItem(item,type));
 const actions=make('div','message-actions');
 if(type==='message'){
  const replyButton=make('button','reply-action','REPLY');replyButton.type='button';
  replyButton.title='Reply to '+fullName(item.user_id);
  replyButton.addEventListener('click',()=>selectReply(item));actions.append(replyButton);
 }
 actions.append(btn);line.append(actions);
}
function postMeta(item){
 const line=make('div','post-meta');
 line.append(make('strong','',fullName(item.user_id)),make('span','','@'+person(item.user_id).handle),make('span','',' · '+formatDate(item.created_at)));
 addActions(line,item,'post');return line;
}
async function signed(item){
 if(!item||!item.object_path)throw Error('File is unavailable.');
 const current=urlCache.get(item.object_path);
 if(current&&current.until>Date.now())return current.promise;
 const promise=client.storage.from(BUCKET).createSignedUrl(item.object_path,1800).then(result=>{
  if(result.error||!result.data?.signedUrl)throw result.error||Error('Could not open attachment.');
  return result.data.signedUrl;
 });
 urlCache.set(item.object_path,{promise,until:Date.now()+25*60000});
 try{return await promise;}catch(e){urlCache.delete(item.object_path);throw e;}
}
function makeFileButton(file){
 const button=make('button','bubble-file');button.type='button';
 const glyph=make('span','file-glyph',file.media_kind==='video'?'▶':'▤');
 const desc=make('span');desc.append(make('span','',file.original_name),make('small','',sizeText(file.size_bytes)+' · OPEN'));
 button.append(glyph,desc);button.addEventListener('click',()=>openMedia(file));return button;
}
function appendMessageFiles(bubble,files){
 if(!files||!files.length)return;
 const wrap=make('div','message-attachments');
 for(const file of files){
  if(file.media_kind==='image'){
   const button=make('button','image-button');button.type='button';button.style.cssText='border:0;background:none;padding:0;text-align:left;cursor:pointer;';
   const img=make('img','bubble-image');img.alt='Shared photo: '+file.original_name;img.loading='lazy';
   img.title='Open '+file.original_name;button.append(img);
   button.addEventListener('click',()=>openMedia(file));
   signed(file).then(url=>{if(img.isConnected)img.src=url;}).catch(()=>{img.alt='Photo unavailable · '+file.original_name;});
   wrap.append(button);
  }else wrap.append(makeFileButton(file));
 }
 bubble.append(wrap);
}
function replyExcerpt(item){
 if(!item)return 'Original message unavailable';
 const attached=allMessageMedia.get(item.id)||[];
 const value=(item.body||'').trim()||((attached.length?attached.map(f=>f.original_name).join(', '):'Shared attachment'));
 return value.length>150?value.slice(0,147)+'…':value;
}
function clearReply(){
 replyingTo=null;$('replyTray').hidden=true;$('replyAuthor').textContent='';$('replyExcerpt').textContent='';
}
function selectReply(item){
 replyingTo={id:item.id,user_id:item.user_id,body:item.body};
 $('replyAuthor').textContent=fullName(item.user_id);
 $('replyExcerpt').textContent=replyExcerpt(item);
 $('replyTray').hidden=false;
 $('messageText').focus();
}
function replyQuote(item){
 if(!item.reply_to_message_id)return null;
 const target=replyParents.get(item.reply_to_message_id);
 const quote=make('button','quoted-reply');quote.type='button';
 quote.title='Jump to original message';
 quote.setAttribute('aria-label','Jump to message from '+(target?fullName(target.user_id):'classmate'));
 quote.append(make('strong','',target?fullName(target.user_id):'Original message'),make('span','',replyExcerpt(target)));
 quote.addEventListener('click',()=>jumpToMessage(item.reply_to_message_id));
 return quote;
}
async function jumpToMessage(id){
 if($('chatPanel').hidden)switchTab('chat');
 if($('chatSearch').value){$('chatSearch').value='';messageSignature='';renderMessages(true);}
 if(!messages.some(m=>m.id===id)){
  let original=replyParents.get(id);
  if(!original){
   const lookup=await client.from('classroom_messages').select('id,classroom_id,user_id,body,created_at,reply_to_message_id').eq('classroom_id',room.id).eq('id',id).maybeSingle();
   if(lookup.error){status('chatStatus','Could not open original message: '+lookup.error.message,true);return;}
   original=lookup.data;
  }
  if(!original){status('chatStatus','The original message has been removed.',true);return;}
  messages=[...messages,original].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  replyParents.set(original.id,original);
  messageSignature='';renderMessages(true);
 }
 const row=$('chat-'+id);
 if(row){
  row.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  row.classList.remove('reply-highlight');void row.offsetWidth;row.classList.add('reply-highlight');
  row.addEventListener('animationend',()=>row.classList.remove('reply-highlight'),{once:true});
 }
}
function renderMessages(force=false,older=false){
 const search=$('chatSearch').value.trim().toLowerCase();
 const list=$('messages');
 const filtered=messages.filter(item=>!search||(item.body+' '+fullName(item.user_id)+' @'+person(item.user_id).handle+' '+(allMessageMedia.get(item.id)||[]).map(m=>m.original_name).join(' ')+' '+(item.reply_to_message_id?replyExcerpt(replyParents.get(item.reply_to_message_id)):'' )).toLowerCase().includes(search));
 $('chatSearchCount').textContent=search?filtered.length+' found':'';
 const signature=filtered.map(m=>m.id+':'+(m.reply_to_message_id||'')+':'+(allMessageMedia.get(m.id)||[]).map(a=>a.id).join(',')).join('|')+'|'+search;
 if(!force&&signature===messageSignature)return;
 messageSignature=signature;
 const priorHeight=list.scrollHeight,priorTop=list.scrollTop;
 const nearBottom=list.scrollHeight-list.scrollTop-list.clientHeight<130;
 list.replaceChildren();
 if(!filtered.length){list.append(make('p','empty-state',search?'No matching messages in loaded history.':'No messages yet. Start the conversation!'));}
 let lastDay='';
 for(const item of filtered){
  const currentDay=day(item.created_at);
  if(currentDay!==lastDay){list.append(make('div','day-divider',currentDay));lastDay=currentDay;}
  const mine=item.user_id===user.id;
  const row=make('article','chat-row'+(mine?' mine':''));row.id='chat-'+item.id;
  if(!mine)row.append(make('span','chat-avatar',(fullName(item.user_id)||'?').slice(0,1).toUpperCase()));
  const bubble=make('div','chat-bubble');
  const meta=make('div','message-meta');
  meta.append(make('strong','',mine?'YOU':fullName(item.user_id)));
  if(!mine)meta.append(make('span','at','@'+person(item.user_id).handle));
  addActions(meta,item,'message');bubble.append(meta);
  const quote=replyQuote(item);if(quote)bubble.append(quote);
  if(item.body)bubble.append(make('p','message-body',item.body));
  appendMessageFiles(bubble,allMessageMedia.get(item.id)||[]);
  bubble.append(make('div','message-time',formatTime(item.created_at)));
  row.append(bubble);list.append(row);
 }
 if(older){list.scrollTop=Math.max(0,priorTop+list.scrollHeight-priorHeight);}
 else if(nearBottom||!priorHeight)list.scrollTop=list.scrollHeight;
}
function renderMembers(members){
 $('memberCount').textContent=String(members.length);
 $('roomSummary').textContent='FIA + ACCA group · '+members.length+' classmate'+(members.length===1?'':'s');
 const list=$('members');list.replaceChildren();
 for(const m of members){
  const p=person(m.user_id),card=make('div','member');
  card.append(make('div','avatar',(p.display_name||'?').slice(0,1).toUpperCase()));
  const side=make('div');
  side.append(make('strong','',p.display_name+(m.user_id===user.id?' (YOU)':'')));
  side.append(make('small','','@'+p.handle+' · '+p.pathway+(p.current_paper?' · '+p.current_paper:'')));
  if(p.bio)side.append(make('small','',p.bio));
  card.append(side);list.append(card);
 }
}
async function loadMembers(){
 const {data,error}=await client.from('classroom_members').select('user_id,joined_at').eq('classroom_id',room.id).order('joined_at',{ascending:true}).limit(200);
 if(error)throw error;
 const members=data||[],ids=members.map(m=>m.user_id);
 if(ids.length){
  const {data:people,error:err}=await client.from('student_profiles').select('user_id,display_name,handle,pathway,current_paper,bio').in('user_id',ids);
  if(err)throw err;profiles=new Map((people||[]).map(p=>[p.user_id,p]));
 }
 renderMembers(members);
}
async function loadMessages(older=false){
 if(!room)return;
 const {data,error}=await client.from('classroom_messages').select('id,classroom_id,user_id,body,created_at,reply_to_message_id')
  .eq('classroom_id',room.id).order('created_at',{ascending:false}).limit(messageLimit);
 if(error){status('chatStatus','Cannot load messages: '+error.message,true);return;}
 const items=(data||[]).reverse(),ids=items.map(i=>i.id);
 const attached=new Map();
 if(ids.length){
  const {data:files,error:fileError}=await client.from('classroom_media').select('id,message_id,user_id,object_path,original_name,mime_type,media_kind,size_bytes,created_at').in('message_id',ids);
  if(fileError){status('chatStatus','Unable to load attachments: '+fileError.message,true);}
  else for(const f of files||[]){if(!attached.has(f.message_id))attached.set(f.message_id,[]);attached.get(f.message_id).push(f);}
 }
 messages=items;allMessageMedia=attached;
 replyParents=new Map(items.map(item=>[item.id,item]));
 const missing=[...new Set(items.map(item=>item.reply_to_message_id).filter(id=>id&&!replyParents.has(id)))];
 if(missing.length){
  const linked=await client.from('classroom_messages').select('id,classroom_id,user_id,body,created_at,reply_to_message_id')
   .eq('classroom_id',room.id).in('id',missing);
  if(linked.error)status('chatStatus','Some original messages could not be loaded: '+linked.error.message,true);
  else for(const original of linked.data||[])replyParents.set(original.id,original);
 }
 $('loadOlder').hidden=items.length<messageLimit;
 renderMessages(false,older);
}
function renderPosts(items){
 const list=$('posts');list.replaceChildren();
 if(!items.length)list.append(make('p','empty-state','Nothing posted yet. Share the first study resource.'));
 for(const item of items){
  const card=make('article','post-card');
  card.append(postMeta(item),make('h3','post-title',item.title),make('p','post-body',item.body));
  if(item.resource_url){
   try{const url=new URL(item.resource_url);if(url.protocol==='https:'){
    const link=make('a','resource-link','OPEN SHARED RESOURCE ↗');link.href=url.href;link.rel='noopener noreferrer nofollow';link.target='_blank';card.append(link);
   }}catch{}
  }
  list.append(card);
 }
}
async function loadPosts(){
 const {data,error}=await client.from('classroom_posts').select('id,classroom_id,user_id,title,body,resource_url,created_at').eq('classroom_id',room.id).order('created_at',{ascending:false}).limit(150);
 if(error){status('postStatus',error.message,true);return;}
 posts=data||[];renderPosts(posts);
 if(!$('mediaPanel').hidden)renderMedia();
}
async function loadMedia(){
 if(!room)return;
 const {data,error}=await client.from('classroom_media')
  .select('id,classroom_id,message_id,user_id,object_path,original_name,mime_type,media_kind,size_bytes,created_at,classroom_messages(body)')
  .eq('classroom_id',room.id).order('created_at',{ascending:false}).limit(300);
 if(error){$('mediaCount').textContent='Could not load media: '+error.message;return;}
 media=data||[];if(!$('mediaPanel').hidden)renderMedia();
}
function libraryRows(){
 const entries=media.map(m=>Object.assign({},m,{kind:m.media_kind,title:m.original_name,caption:m.classroom_messages?.body||''}));
 for(const p of posts){if(p.resource_url)entries.push({id:'link-'+p.id,kind:'link',title:p.title,caption:p.body,created_at:p.created_at,user_id:p.user_id,resource_url:p.resource_url});}
 const query=$('mediaSearch').value.trim().toLowerCase();
 return entries.filter(m=>(mediaKind==='all'||m.kind===mediaKind)
  &&(!query||(m.title+' '+m.caption+' '+fullName(m.user_id)+' '+(m.resource_url||'')).toLowerCase().includes(query)))
  .sort((a,b)=>($('sortMedia').value==='old'?1:-1)*(new Date(a.created_at)-new Date(b.created_at)));
}
function renderMedia(){
 const rows=libraryRows(),shown=rows.slice(0,mediaShown),result=$('mediaResults');result.replaceChildren();
 $('mediaCount').textContent=rows.length+' item'+(rows.length===1?'':'s')+' found'+(rows.length>shown.length?' · showing '+shown.length:'')+(media.length>=300?' · newest 300 files indexed':'');
 $('loadMoreMedia').hidden=shown.length>=rows.length;
 if(!shown.length){result.append(make('p','empty-state','No items match. Files sent in chat and links posted to the board appear here.'));return;}
 for(const m of shown){
  const button=make('button','media-card '+m.kind);button.type='button';button.title='Open '+m.title;
  const thumb=make('div','media-thumb',m.kind==='image'?'▧':m.kind==='video'?'▶':m.kind==='link'?'↗':'▤');
  if(m.kind==='image'){
   const img=make('img');img.alt='';img.loading='lazy';
   signed(m).then(url=>{if(img.isConnected){thumb.replaceChildren(img);img.src=url;}}).catch(()=>{});
  }
  const details=make('div','media-card-body');
  details.append(make('strong','',m.title),make('small','',fullName(m.user_id)+' · '+formatDate(m.created_at)));
  button.append(thumb,details);button.addEventListener('click',()=>openMedia(m));result.append(button);
 }
}
async function openMedia(item){
 const dlg=$('mediaDialog'),body=$('previewBody');body.replaceChildren(make('p','empty-state','Opening shared item…'));
 $('previewTitle').textContent=item.title||item.original_name||'SHARED FILE';
 $('previewDetail').textContent=fullName(item.user_id)+' · '+formatDate(item.created_at)+(item.size_bytes?' · '+sizeText(item.size_bytes):'');
 if(!dlg.open)dlg.showModal();
 try{
  let url;
  if(item.kind==='link'){url=new URL(item.resource_url).href;if(!url.startsWith('https://'))throw Error('Unsafe resource link.');}
  else url=await signed(item);
  body.replaceChildren();
  if(item.kind==='image'||item.media_kind==='image'){
   const img=make('img');img.alt=item.original_name||'Shared photo';img.src=url;body.append(img);
  }else if(item.kind==='video'||item.media_kind==='video'){
   const video=make('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.src=url;body.append(video);
  }else{
   const link=make('a','',item.kind==='link'?'OPEN SHARED LINK ↗':'OPEN / DOWNLOAD FILE ↗');
   link.href=url;link.target='_blank';link.rel='noopener noreferrer';body.append(link);
  }
 }catch(error){body.replaceChildren(make('p','empty-state','Could not open this file: '+(error.message||error)));}
}
function renderPending(){
 const tray=$('fileTray');tray.replaceChildren();tray.hidden=pendingFiles.length===0;
 for(const file of pendingFiles){
  const pill=make('div','pending-file');pill.append(make('span','',file.name),make('small','',sizeText(file.size)));
  const remove=make('button','','×');remove.type='button';remove.title='Remove '+file.name;
  remove.addEventListener('click',()=>{pendingFiles=pendingFiles.filter(f=>f!==file);renderPending();});
  pill.append(remove);tray.append(pill);
 }
}
function chooseFiles(event){
 let warning='';
 for(const file of Array.from(event.target.files||[])){
  if(pendingFiles.length>=MAX_FILES){warning='Limit of four files per message.';break;}
  if(!acceptedFile(file)){warning='Unsupported file type: '+file.name;continue;}
  if(!file.size||file.size>MAX_SIZE){warning=file.name+' must be under 15 MB.';continue;}
  if(pendingFiles.some(p=>p.name===file.name&&p.size===file.size)){warning='That file is already attached.';continue;}
  pendingFiles.push(file);
 }
 event.target.value='';renderPending();
 status('chatStatus',warning,Boolean(warning));
}
async function joinRoom(){
 const {data,error}=await client.from('classroom_members').select('user_id').eq('classroom_id',room.id).eq('user_id',user.id).maybeSingle();
 if(error)throw error;
 if(!data){const r=await client.from('classroom_members').insert({classroom_id:room.id,user_id:user.id});if(r.error)throw r.error;}
}
async function sendMessage(event){
 event.preventDefault();
 const text=$('messageText').value.trim(),files=pendingFiles.slice(),replyId=replyingTo?.id||null;
 if(!text&&!files.length){status('chatStatus','Write a message or attach a file.',true);return;}
 if(text.length>1000){status('chatStatus','Message must be at most 1,000 characters.',true);return;}
 if(Date.now()-lastSent<3000){status('chatStatus','Please wait a moment before sending again.',true);return;}
 const button=$('sendMessage'),uploaded=[];let newMessage=null;
 button.disabled=true;$('attachButton').disabled=true;
 try{
  const records=[];
  for(let i=0;i<files.length;i++){
   const file=files[i],kind=acceptedFile(file);
   if(!kind||!file.size||file.size>MAX_SIZE)throw Error('Unsupported file: '+file.name);
   const path=room.id+'/'+user.id+'/'+crypto.randomUUID()+'.'+extension(file.name);
   status('chatStatus','Uploading '+(i+1)+' of '+files.length+' · '+file.name);
   const result=await client.storage.from(BUCKET).upload(path,file,{contentType:kind.mime,upsert:false,cacheControl:'3600'});
   if(result.error)throw result.error;
   uploaded.push(path);
   records.push({classroom_id:room.id,user_id:user.id,object_path:path,original_name:file.name.slice(0,180),mime_type:kind.mime,media_kind:kind.kind,size_bytes:file.size});
  }
  const fallback=files.length===1?'Shared a file':('Shared '+files.length+' files');
  const payload={classroom_id:room.id,user_id:user.id,body:text||fallback};
  if(replyId)payload.reply_to_message_id=replyId;
  const inserted=await client.from('classroom_messages').insert(payload).select('id').single();
  if(inserted.error)throw inserted.error;newMessage=inserted.data;
  if(records.length){
   const saving=await client.from('classroom_media').insert(records.map(r=>Object.assign(r,{message_id:newMessage.id})));
   if(saving.error)throw saving.error;
  }
  lastSent=Date.now();$('messageText').value='';$('messageCount').textContent='0';pendingFiles=[];renderPending();clearReply();
  status('chatStatus','Sent.');await Promise.all([loadMessages(),loadMedia()]);
 }catch(error){
  if(newMessage?.id)await client.from('classroom_messages').delete().eq('id',newMessage.id).eq('user_id',user.id);
  if(uploaded.length)await client.storage.from(BUCKET).remove(uploaded);
  status('chatStatus','Message not sent: '+(error.message||error),true);
 }finally{button.disabled=false;$('attachButton').disabled=false;}
}
async function sharePost(event){
 event.preventDefault();
 const title=$('postTitle').value.trim(),body=$('postText').value.trim(),input=$('postLink').value.trim();
 if(title.length<3||title.length>100||!body||body.length>2200)return status('postStatus','Check the title and description.',true);
 if(Date.now()-lastPosted<15000)return status('postStatus','You can share another resource shortly.',true);
 let url=null;if(input){try{url=new URL(input);if(url.protocol!=='https:'||url.href.length>600)throw Error('');url=url.href;}catch{return status('postStatus','Use a valid HTTPS link.',true);}}
 const button=$('sharePost');button.disabled=true;
 try{
  const {error}=await client.from('classroom_posts').insert({classroom_id:room.id,user_id:user.id,title,body,resource_url:url});
  if(error)throw error;lastPosted=Date.now();$('postTitle').value='';$('postText').value='';$('postLink').value='';
  status('postStatus','Resource shared.');await loadPosts();
 }catch(error){status('postStatus','Could not share: '+error.message,true);}finally{button.disabled=false;}
}
async function removeItem(item,kind){
 if(item.user_id!==user.id||!confirm('Remove this '+(kind==='post'?'resource':'message')+' from the classroom?'))return;
 const table=kind==='post'?'classroom_posts':'classroom_messages';
 const paths=kind==='message'?(allMessageMedia.get(item.id)||[]).map(f=>f.object_path):[];
 const {error}=await client.from(table).delete().eq('id',item.id).eq('user_id',user.id);
 if(error){status(kind==='post'?'postStatus':'chatStatus','Could not remove: '+error.message,true);return;}
 if(paths.length){const deleted=await client.storage.from(BUCKET).remove(paths);if(deleted.error)status('chatStatus','Message removed, but cleanup failed: '+deleted.error.message,true);}
 if(kind==='post')await loadPosts();else await Promise.all([loadMessages(),loadMedia()]);
}
async function reportItem(item,kind){
 const answer=prompt('Report reason: spam, harassment, unsafe, or other');if(answer===null)return;
 const reason=answer.trim().toLowerCase(),dest=kind==='post'?'postStatus':'chatStatus';
 if(!['spam','harassment','unsafe','other'].includes(reason))return status(dest,'Choose spam, harassment, unsafe, or other.',true);
 const record={reporter_id:user.id,classroom_id:room.id,reason};
 record[kind==='post'?'post_id':'message_id']=item.id;
 const {error}=await client.from('classroom_reports').insert(record);
 status(dest,error?'Report could not be sent: '+error.message:'Report submitted for review.',Boolean(error));
}
function switchTab(name){
 for(const key of ['chat','media','resource']){
  const selected=key===name;
  $(key+'Panel').hidden=!selected;$(key+'Tab').setAttribute('aria-selected',String(selected));
 }
 if(name==='media')renderMedia();
}
async function reload(){
 if(reloading){shouldReload=true;return;}
 reloading=true;
 try{await Promise.all([loadMessages(),loadPosts(),loadMedia()]);}
 finally{reloading=false;if(shouldReload){shouldReload=false;setTimeout(reload,250);}}
}
function subscribe(){
 const schedule=()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(reload,300);};
 channel=client.channel('ledgerpeer-commons-'+room.id)
 .on('postgres_changes',{event:'*',schema:'public',table:'classroom_messages',filter:'classroom_id=eq.'+room.id},schedule)
 .on('postgres_changes',{event:'*',schema:'public',table:'classroom_media',filter:'classroom_id=eq.'+room.id},schedule)
 .on('postgres_changes',{event:'*',schema:'public',table:'classroom_posts',filter:'classroom_id=eq.'+room.id},schedule)
 .on('postgres_changes',{event:'*',schema:'public',table:'classroom_members',filter:'classroom_id=eq.'+room.id},()=>{loadMembers().catch(()=>{});schedule();})
 .subscribe(state=>{
  if(state==='SUBSCRIBED')status('classStatus','CLASSROOM CONNECTED · Shared messages and files update live.');
  if(state==='CHANNEL_ERROR'||state==='TIMED_OUT')status('classStatus','Realtime disconnected · messages will refresh periodically.',true);
 });
 const interval=setInterval(()=>{if(!document.hidden)reload();},30000);
 const onVisible=()=>{if(!document.hidden){loadMembers().catch(()=>{});reload();}};
 document.addEventListener('visibilitychange',onVisible);
 window.addEventListener('pagehide',()=>{clearInterval(interval);clearTimeout(refreshTimer);document.removeEventListener('visibilitychange',onVisible);if(channel)client.removeChannel(channel);},{once:true});
}
async function init(){
 try{
  const A=window.PersonalHubAuth;if(!A)throw Error('Student login is unavailable.');
  if(!await A.ready()){if(!A.isRedirectingToProfile?.())location.replace(A.signInUrl('classroom.html'));return;}
  client=A.getClient();user=A.getUser();if(!client||!user)throw Error('Please sign in.');
  const {data,error}=await client.from('classrooms').select('id,name,description').eq('slug','ledgerpeer-commons').maybeSingle();
  if(error)throw error;if(!data)throw Error('Study Commons is unavailable.');room=data;
  await joinRoom();await loadMembers();
  $('chatTab').addEventListener('click',()=>switchTab('chat'));
  $('mediaTab').addEventListener('click',()=>switchTab('media'));
  $('resourceTab').addEventListener('click',()=>switchTab('resource'));
  $('jumpMedia').addEventListener('click',()=>switchTab('media'));
  $('chatSearch').addEventListener('input',()=>renderMessages(true));
  $('loadOlder').addEventListener('click',()=>{messageLimit+=100;loadMessages(true);});
  $('attachButton').addEventListener('click',()=>$('attachmentInput').click());
  $('attachmentInput').addEventListener('change',chooseFiles);
  $('chatForm').addEventListener('submit',sendMessage);
  $('cancelReply').addEventListener('click',clearReply);
  $('postForm').addEventListener('submit',sharePost);
  $('messageText').addEventListener('input',()=>{$('messageCount').textContent=String($('messageText').value.length);});
  $('messageText').addEventListener('keydown',event=>{
   if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('chatForm').requestSubmit();}
  });
  $('mediaSearch').addEventListener('input',()=>{mediaShown=36;renderMedia();});
  $('sortMedia').addEventListener('change',renderMedia);
  $('mediaFilters').addEventListener('click',event=>{
   const btn=event.target.closest('button[data-kind]');if(!btn)return;
   mediaKind=btn.dataset.kind;mediaShown=36;
   $('mediaFilters').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
   renderMedia();
  });
  $('loadMoreMedia').addEventListener('click',()=>{mediaShown+=36;renderMedia();});
  $('closePreview').addEventListener('click',()=>$('mediaDialog').close());
  $('mediaDialog').addEventListener('close',()=>{const v=$('previewBody').querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load();}});
  A.addLockButton?.();
  $('classApp').hidden=false;
  await Promise.all([loadMessages(),loadPosts(),loadMedia()]);
  subscribe();
 }catch(error){status('classStatus','Classroom could not load: '+(error.message||error)+'. Sign in again from the student homepage.',true);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();