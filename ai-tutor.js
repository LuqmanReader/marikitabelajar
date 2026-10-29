/* LedgerPeer AI Tutor · authenticated in-site chat, session-only history. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const node=$('chatLog'),form=$('chatForm'),question=$('question');
 const paper=$('paper'),mode=$('mode'),send=$('send');
 const welcome=$('welcome'),counter=$('counter'),status=$('chatStatus'),remaining=$('remaining');
 let client,user,key='',messages=[],busy=false,credits=null;
 function info(message,error=false){status.textContent=message;status.classList.toggle('is-error',error)}
 function scroll(){node.scrollTop=node.scrollHeight;}
 function save(){
  if(!key)return;
  try{sessionStorage.setItem(key,JSON.stringify({messages:messages.slice(-30),paper:paper.value,mode:mode.value,credits}));}catch{}
 }
 function renderBubble(role,content,pending=false){
  const line=document.createElement('article');
  line.className='tutor-message'+(role==='user'?' is-user':'')+(pending?' is-pending':'');
  const avatar=document.createElement('span');avatar.className='tutor-avatar';avatar.textContent=role==='user'?'YOU':'LP';
  const bubble=document.createElement('div');bubble.className='tutor-bubble';bubble.textContent=content;
  line.append(avatar,bubble);node.append(line);scroll();return line;
 }
 function render(){
  node.querySelectorAll('.tutor-message').forEach(el=>el.remove());
  welcome.hidden=messages.length>0;
  for(const msg of messages)renderBubble(msg.role,msg.content);
  scroll();
 }
 function setBusy(next){
  busy=next;send.disabled=next||!question.value.trim();paper.disabled=next;mode.disabled=next;question.disabled=next;
  send.textContent=next?'THINKING…':'SEND ↗';
 }
 function persistChoice(){save();}
 async function start(){
  document.documentElement.style.visibility='hidden';
  try{
   const auth=window.PersonalHubAuth;
   if(!auth)throw Error('Login service unavailable.');
   const ok=await auth.ready();
   if(!ok){if(!auth.isRedirectingToProfile?.())location.replace('index.html');return;}
   client=auth.getClient();user=auth.getUser();
   if(!client||!user)throw Error('Please log in again.');
   key='lp_ai_tutor_chat_v1_'+user.id;
   try{
    const saved=JSON.parse(sessionStorage.getItem(key)||'null');
    if(saved){
     if(Array.isArray(saved.messages))messages=saved.messages.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-30).map(x=>({role:x.role,content:x.content.slice(0,9000)}));
     if([...paper.options].some(x=>x.value===saved.paper))paper.value=saved.paper;
     if([...mode.options].some(x=>x.value===saved.mode))mode.value=saved.mode;
     if(Number.isInteger(saved.credits)&&saved.credits>=0&&saved.credits<=15)credits=saved.credits;
    }
   }catch{}
   if(credits!==null)remaining.textContent=String(credits);
   render();auth.addLockButton?.();
   info('Connected to LedgerPeer. Ask your first question.');
   question.focus();
  }catch(e){info('Unable to open AI Tutor: '+(e?.message||e),true);}
  finally{document.documentElement.style.visibility='visible';}
 }
 async function submit(event){
  if(event)event.preventDefault();
  if(busy||!client||!user)return;
  const q=question.value.trim();
  if(q.length<2||q.length>3500){info('Enter a question between 2 and 3,500 characters.',true);return;}
  const history=messages.slice(-10).map(x=>({role:x.role,content:x.content.slice(0,1600)}));
  setBusy(true);question.value='';counter.textContent='0 / 3500';
  messages.push({role:'user',content:q});save();render();
  const pending=renderBubble('assistant','Thinking through your question…',true);
  info('Asking GroqCloud. Please keep this tab open.');
  try{
   const {data:sessionData,error:sessionError}=await client.auth.getSession();
   if(sessionError||!sessionData?.session?.access_token)throw Error('Please sign in again.');
   const {data,error}=await client.functions.invoke('ledgerpeer-ai',{
    headers:{Authorization:'Bearer '+sessionData.session.access_token},
    body:{paper:paper.value,style:mode.value,question:q,history}
   });
   let payload=data;
   if(error){
    try{payload=await error.context?.json();}catch{}
    throw Error(payload?.error||'The AI service is temporarily unavailable.');
   }
   if(!payload||typeof payload.answer!=='string')throw Error(payload?.error||'No reply was received.');
   pending.remove();messages.push({role:'assistant',content:payload.answer});save();render();
   if(Number.isInteger(payload.remaining)){credits=payload.remaining;remaining.textContent=String(credits);save();}
   info('Response delivered. You can ask a follow-up.');
  }catch(e){
   pending.remove();
   if(e?.message?.includes('15 AI Tutor messages')){credits=0;remaining.textContent='0';}
   if(e?.message){info(e.message,true);}else{info('Request failed. Please try again.',true);}
   messages.pop();question.value=q;counter.textContent=question.value.length+' / 3500';save();render();
  }finally{setBusy(false);question.focus();}
 }
 form.addEventListener('submit',submit);
 question.addEventListener('input',()=>{counter.textContent=question.value.length+' / 3500';send.disabled=busy||!question.value.trim()});
 question.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();if(!busy&&question.value.trim())form.requestSubmit();}});
 for(const select of [paper,mode])select.addEventListener('change',persistChoice);
 $('clear').addEventListener('click',()=>{if(busy)return;if(messages.length&&!confirm('Clear this conversation?'))return;messages=[];save();render();info('New conversation started. Your daily quota is unchanged.');question.focus();});
 node.addEventListener('click',event=>{const trigger=event.target.closest('[data-suggestion]');if(!trigger)return;question.value=trigger.dataset.suggestion||'';question.dispatchEvent(new Event('input'));question.focus();});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
