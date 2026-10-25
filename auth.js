/* LedgerPeer beta: local-first autosave with automatic per-account cloud backup. */
(function(){
 'use strict';
 const PREFIX='rh_beta_active_user';
 const OWNER='rh_beta_storage_owner_v3';
 const DIRTY='rh_beta_unsynced_v3';
 const BASELINE='rh_beta_cloud_baseline_v3';
 const IGNORE=/^(ph_auth_hash_v1|ph_unlocked_v1|sb-|rh_beta_|google)/i;
 let client,user=null,timer=null,debounce=null,saving=false,activeSync=null,profileRedirecting=false;
 let lastSaved=null,lastCloud=null,conflicted=false,applying=false,changedDuringHydrate=false;
 const rawSet=Storage.prototype.setItem;
 const rawRemove=Storage.prototype.removeItem;
 function get(k){return localStorage.getItem(k);}
 function setMeta(k,v){rawSet.call(localStorage,k,String(v));}
 function removeMeta(k){rawRemove.call(localStorage,k);}
 function keys(){return Object.keys(localStorage).filter(k=>!IGNORE.test(k));}
 function snapshot(){const data={};for(const k of keys())data[k]=get(k);return data;}
 function sameData(a,b){
  if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
  const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();
  return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&a[k]===b[k]);
 }
 function digest(data){
  // Stable, non-cryptographic change detector; never used for authorization.
  const serialized=JSON.stringify(Object.keys(data||{}).sort().map(k=>[k,data[k]]));
  let a=2166136261,b=2246822519;
  for(let i=0;i<serialized.length;i++){const c=serialized.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^(c+i),3266489917);}
  return (a>>>0).toString(36)+'.'+(b>>>0).toString(36)+'.'+serialized.length;
 }
 function status(s,fail=false){
  let el=document.getElementById('rhSyncStatus');
  if(!el&&document.body){el=document.createElement('div');el.id='rhSyncStatus';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.style.cssText='position:fixed;bottom:12px;left:12px;z-index:99998;padding:8px 12px;border:3px solid #111;background:#ffcf24;color:#111;font:800 12px ui-monospace,monospace;max-width:min(330px,calc(100vw - 95px));box-shadow:3px 3px 0 #111';document.body.append(el);}
  if(el){el.textContent=s;el.style.background=fail?'#ffcec8':'#ffcf24';}
 }
 function markDirty(){
  if(applying)return;
  const currentOwner=user?.id||get(OWNER);
  if(!currentOwner)return;
  setMeta(OWNER,currentOwner);setMeta(DIRTY,currentOwner);
  status('Saved on this device · cloud backup pending');
  clearTimeout(debounce);
  if(user)debounce=setTimeout(()=>{sync().catch(e=>console.error('Background autosave:',e));},850);
 }
 // Track the existing app's localStorage writes synchronously. Changes are already
 // durable on this browser before any network request starts.
 Storage.prototype.setItem=function(key,value){
  const change=this===localStorage&&!IGNORE.test(String(key))&&this.getItem(key)!==String(value);
  const result=rawSet.apply(this,arguments);
  if(change)markDirty();return result;
 };
 Storage.prototype.removeItem=function(key){
  const change=this===localStorage&&!IGNORE.test(String(key))&&this.getItem(key)!==null;
  const result=rawRemove.apply(this,arguments);
  if(change)markDirty();return result;
 };
 function clearData(){applying=true;try{for(const k of keys())rawRemove.call(localStorage,k);}finally{applying=false;}}
 function applyData(data){
  const incoming=data&&typeof data==='object'?data:{};
  const before=snapshot();applying=true;
  try{
   for(const k of keys())if(!Object.prototype.hasOwnProperty.call(incoming,k))rawRemove.call(localStorage,k);
   for(const [k,v] of Object.entries(incoming))if(typeof v==='string'&&!IGNORE.test(k)&&get(k)!==v)rawSet.call(localStorage,k,v);
  }finally{applying=false;}
  changedDuringHydrate=!sameData(before,snapshot());
 }
 async function init(){
  if(client)return client;
  if(!window.supabase)throw Error('Supabase library could not load');
  const authKey='sb-'+new URL(window.RH_SUPABASE_URL).hostname.split('.')[0]+'-auth-token';
  // Existing security policy: login tokens are only retained in sessionStorage.
  localStorage.removeItem(authKey);
  client=window.supabase.createClient(window.RH_SUPABASE_URL,window.RH_SUPABASE_PUBLISHABLE_KEY,{auth:{storage:sessionStorage,storageKey:authKey,persistSession:true,detectSessionInUrl:true,flowType:'implicit'}});
  return client;
 }
 async function loadUser(){await init();const {data:{user:u},error}=await client.auth.getUser();if(error||!u)throw Error('Please sign in again.');user=u;return u;}
 async function fetchCloud(){
  const {data,error}=await client.from('user_documents').select('payload').eq('user_id',user.id).eq('document_key','revision_hub_local_storage_v1').maybeSingle();
  if(error)throw error;
  return data?.payload?.data||null;
 }
 async function sync(force=false){
  if(!user||conflicted)return false;
  if(saving){await activeSync;return sync(force);}
  const local=snapshot();
  const dirty=get(DIRTY)===user.id;
  if(!dirty&&!force&&sameData(local,lastSaved))return true;
  saving=true;
  activeSync=(async()=>{
   try{
    const remote=await fetchCloud();
    const base=lastCloud;
    // After an offline restart, lastCloud is unknown; use the last verified
    // cloud fingerprint so an unchanged server isn't misreported as a conflict.
    const remoteChanged=remote&&!sameData(remote,base)&&get(BASELINE)!==digest(remote);
    const localChanged=dirty||!sameData(local,lastSaved);
    if(remote&&sameData(remote,local)){
     lastCloud=remote;lastSaved=remote;removeMeta(DIRTY);setMeta(BASELINE,digest(remote));
     status('Auto-saved on device and cloud ✓');return true;
    }
    if(remoteChanged){
     if(localChanged){conflicted=true;status('Saved locally · cloud conflict. Export a backup before changing devices.',true);return false;}
     applyData(remote);lastSaved=snapshot();lastCloud=remote;
     setMeta(BASELINE,digest(remote));removeMeta(DIRTY);
     status('Newer cloud data loaded · refresh to see changes');
     return true;
    }
    if(!localChanged&&remote){status('Saved on this device and cloud ✓');return true;}
    const {error}=await client.from('user_documents').upsert({user_id:user.id,document_key:'revision_hub_local_storage_v1',payload:{data:local}},{onConflict:'user_id,document_key'});
    if(error)throw error;
    const verified=await fetchCloud();
    if(!verified||!sameData(verified,local))throw Error('Cloud verification failed; local changes were kept.');
    lastCloud=verified;lastSaved=local;setMeta(BASELINE,digest(verified));
    if(sameData(snapshot(),local))removeMeta(DIRTY);
    status(sameData(snapshot(),local)?'Auto-saved on device and cloud ✓':'Saved locally · syncing newest changes');
    return true;
   }catch(e){status('Saved on device · cloud backup pending: '+(e?.message||e),true);console.error('LedgerPeer cloud sync:',e);return false;}
   finally{saving=false;}
  })();
  return activeSync;
 }
 async function hydrate(){
  await loadUser();
  const previousUser=sessionStorage.getItem(PREFIX);
  const owner=get(OWNER);
  const existing=snapshot();
  if(owner&&owner!==user.id){
   if(get(DIRTY)===owner)throw Error('Unsynced work belongs to a different account on this browser. Return to that account and export a backup before switching.');
   clearData();removeMeta(BASELINE);removeMeta(DIRTY);
  }else if(!owner&&previousUser&&previousUser!==user.id){
   // Prevent one student's legacy browser data from appearing in another account.
   clearData();removeMeta(BASELINE);removeMeta(DIRTY);
  }
  setMeta(OWNER,user.id);sessionStorage.setItem(PREFIX,user.id);
  let cloud;
  try{cloud=await fetchCloud();}
  catch(e){
   if(owner===user.id){lastSaved={};lastCloud=null;setMeta(DIRTY,user.id);status('Saved on this device · cloud temporarily unavailable',true);return;}
   throw e;
  }
  const local=snapshot();
  const localDirty=get(DIRTY)===user.id;
  const oldBaseline=get(BASELINE);
  const cloudFingerprint=digest(cloud||{});
  const hasLocal=Object.keys(local).length>0;
  const differs=!sameData(local,cloud||{});
  if((localDirty||(!owner&&hasLocal&&differs))&&differs){
   // Never replace locally saved exam answers with a stale cloud snapshot.
   // If both sides changed since the last confirmed cloud backup, pause cloud
   // writes rather than silently discarding either version.
   if(localDirty&&oldBaseline&&oldBaseline!==cloudFingerprint){
    conflicted=true;
    status('Saved on device · another device changed cloud data. Export a backup before resolving.',true);
   }else{
    setMeta(DIRTY,user.id);
    status('Unsynced work preserved on this device · automatic cloud backup pending');
   }
   lastSaved=cloud||{};lastCloud=cloud||{};
  }else{
   if(differs)applyData(cloud||{});
   lastSaved=snapshot();lastCloud=cloud||{};
   removeMeta(DIRTY);setMeta(BASELINE,cloudFingerprint);
   status(cloud?'Your work is loaded · autosave on':'Autosave ready · saved on this device');
  }
 }
 function safeDestination(raw){
  const allowed=new Set(['classroom.html','profile.html','hub.html','notes.html','quiz.html','study-planner.html','calendar.html']);
  const target=String(raw||'').trim();
  return allowed.has(target)?target:null;
 }
 function loginLanding(){
  try{return safeDestination(new URL(location.href).searchParams.get('next'))||'index.html#access';}
  catch{return 'index.html#access';}
 }
 function signInUrl(next){
  const destination=safeDestination(next)||'classroom.html';
  return 'index.html?next='+encodeURIComponent(destination)+'#access';
 }
 async function login(email,password){await init();const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await hydrate();location.href=loginLanding();}
 async function signUp(email,password){
  await init();
  const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:new URL('index.html',location.href).href}});
  if(error)throw error;
  // Never silently bypass the required verification step if Confirm Email is misconfigured.
  if(data?.session){
    await client.auth.signOut();
    throw Error('Email verification is disabled in Supabase. Turn ON Confirm Email before accepting registrations.');
  }
  return data;
 }
 async function verifySignUpOtp(email,code){
  const token=String(code).trim();
  if(!/^\d{8}$/.test(token))throw Error('Enter a valid 8-digit verification code.');
  await init();
  const {data,error}=await client.auth.verifyOtp({email:email.trim(),token,type:'email'});
  if(error)throw error;
  if(!data?.session||!data?.user)throw Error('Email verification did not create a valid session. Please try again.');
  if(!data.user.email_confirmed_at&&!data.user.confirmed_at)throw Error('Supabase has not confirmed this email. Please request a new code.');
  return data;
 }
 // Supabase confirmation emails may return with token_hash in query, a PKCE
 // code, or an implicit access_token fragment after /auth/v1/verify.
 // Treat a redirect as verified ONLY after Supabase returns a confirmed user.
 function clearConfirmationURL(){
  const path=location.pathname+(location.search&&!/token_hash=|(?:^|[?&])code=|error_code=|error_description=/i.test(location.search)?location.search:'')+'#access';
  history.replaceState(null,document.title,path);
 }
 async function completeEmailLink(incomingUrl){
  const callback=new URL(incomingUrl||location.href,location.href);
  const query=new URLSearchParams(callback.search);
  const hash=new URLSearchParams(callback.hash.replace(/^#/,''));
  const tokenHash=query.get('token_hash')||hash.get('token_hash');
  const incomingType=query.get('type')||hash.get('type')||'email';
  const hasImplicitTokens=!!(hash.get('access_token')&&hash.get('refresh_token'));
  const hasCode=!!query.get('code');
  const errorCode=query.get('error_code')||hash.get('error_code')||query.get('error');
  const authError=query.get('error_description')||hash.get('error_description');
  if(incomingType==='recovery')return {handled:false};
  if(errorCode||authError){
   clearConfirmationURL();
   throw Error('Supabase could not confirm this link: '+(authError||errorCode)+'. Request a fresh confirmation code or email.');
  }
  if(!tokenHash&&!hasImplicitTokens&&!hasCode)return {handled:false};
  await init();
  try{
   if(tokenHash){
    if(!['email','signup','invite','magiclink'].includes(incomingType))
     throw Error('Unsupported email verification link type.');
    const {error}=await client.auth.verifyOtp({token_hash:tokenHash,type:incomingType});
    if(error)throw error;
   }else if(hasCode){
    const {error}=await client.auth.exchangeCodeForSession(query.get('code'));
    if(error)throw error;
   }else{
    // Supabase normally reads and stores the implicit session on init.
    const {data,error}=await client.auth.getSession();
    if(error)throw error;
    if(!data?.session){
     const {error:sessionError}=await client.auth.setSession({
      access_token:hash.get('access_token'),
      refresh_token:hash.get('refresh_token')
     });
     if(sessionError)throw sessionError;
    }
   }
   const {data,error}=await client.auth.getUser();
   if(error)throw error;
   if(!data?.user?.email_confirmed_at&&!data?.user?.confirmed_at)
    throw Error('Supabase has not marked this email as confirmed yet.');
   clearConfirmationURL();
   return {handled:true,verified:true};
  }catch(e){
   // Remove one-time credentials from the address even if the link has expired.
   clearConfirmationURL();
   throw Error('Email confirmation failed: '+(e?.message||e)+'. Request a fresh confirmation email or enter its code.');
  }
 }
 async function resendSignUpOtp(email){
  await init();
  const {error}=await client.auth.resend({type:'signup',email:email.trim(),options:{emailRedirectTo:new URL('index.html',location.href).href}});
  if(error)throw error;
 }
 async function sendRecovery(email){await init();const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:new URL('index.html',location.href).href});if(error)throw error;}
 async function updatePassword(password){await init();const {error}=await client.auth.updateUser({password});if(error)throw error;}
 async function onAuthChange(callback){await init();return client.auth.onAuthStateChange((event,session)=>callback(event,session));}
 async function logout(){
  if(user){const ok=await sync(true);if(!ok){alert('Your work is saved on this device, but cloud backup is not complete. Sign out is blocked to protect unsynced work.');return;}}
  if(client)await client.auth.signOut();user=null;clearData();removeMeta(OWNER);removeMeta(DIRTY);removeMeta(BASELINE);sessionStorage.removeItem(PREFIX);location.replace('index.html');
 }
 async function ready(){
  try{
   await hydrate();start();
   // Account onboarding gate. Website-only routing is complemented by
   // Supabase RLS: unprofiled accounts cannot join or read classroom content.
   if(!/\/profile\.html$/i.test(location.pathname)){
    const {data,error}=await client.from('student_profiles').select('user_id').eq('user_id',user.id).maybeSingle();
    if(error)throw error;
    if(!data){
      profileRedirecting=true;
      const name=location.pathname.split('/').pop();
      const target=safeDestination(name);
      const next=target&&target!=='profile.html'?'?next='+encodeURIComponent(target):'';
      location.replace('profile.html'+next);
      return false;
    }
   }
   profileRedirecting=false;return true;
  }catch(e){console.error(e);status('Unable to open account safely: '+(e?.message||e),true);return false;}
 }
 function start(){
  if(timer)return;
  timer=setInterval(()=>{sync().catch(e=>console.error(e));},3000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)sync().catch(()=>{});});
  window.addEventListener('pagehide',()=>{sync().catch(()=>{});});
  // No manual Save to Cloud button: edits save locally at once and back up automatically.
  const obsolete=document.getElementById('rhManualSave');if(obsolete)obsolete.remove();
 }
 const api={login,logout,signUp,verifySignUpOtp,completeEmailLink,resendSignUpOtp,sendRecovery,updatePassword,onAuthChange,ready,sync,init,
  getClient(){return client;},getUser(){return user;},isRedirectingToProfile(){return profileRedirecting;},safeDestination,signInUrl,loginLanding,
  async isSignedIn(){try{await loadUser();return true;}catch{return false;}},
  guard(){document.documentElement.style.visibility='hidden';ready().then(ok=>{
    if(!ok){if(!profileRedirecting)location.replace('index.html');return;}
    if(changedDuringHydrate){
     changedDuringHydrate=false;
     if(document.readyState==='loading')window.addEventListener('load',()=>location.reload(),{once:true});
     else location.reload();
     return;
    }
    document.documentElement.style.visibility='visible';
   });return true;},
  addLockButton(){if(document.getElementById('phLockButton'))return;const b=document.createElement('button');b.id='phLockButton';b.textContent='SIGN OUT';b.type='button';b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:99999;border:3px solid #111;background:#E63B2E;color:#fff;padding:10px 14px;font:900 12px monospace;box-shadow:4px 4px 0 #111;cursor:pointer';b.onclick=logout;document.body.append(b);}
 };window.PersonalHubAuth=api;
})();
/* ADD THIS TO THE END OF YOUR EXISTING auth.js FILE.
   Do not replace the rest of auth.js or touch the login functions. */
;(() => {
  if (document.querySelector('script[data-ledgerpeer-spotify="true"]')) return;
  const script = document.createElement('script');
  script.src = 'spotify-study-music.js';
  script.async = true;
  script.dataset.ledgerpeerSpotify = 'true';
  document.head.appendChild(script);
})();
