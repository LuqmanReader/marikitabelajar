/* LedgerPeer beta: Supabase identity and per-account cloud document sync. */
(function(){
 const CLIENT='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
 const PREFIX='rh_beta_active_user';
 const IGNORE=/^(ph_auth_hash_v1|ph_unlocked_v1|sb-|rh_beta_|google)/i;
 let client, user=null, timer=null, saving=false, lastSaved='', lastCloud='', pending=false, activeSync=null;
 function keys(){return Object.keys(localStorage).filter(k=>!IGNORE.test(k));}
 function snapshot(){const data={};for(const k of keys())data[k]=localStorage.getItem(k);return data;}
 function clearData(){for(const k of keys())localStorage.removeItem(k);}
 function status(s,fail=false){let e=document.getElementById('rhSyncStatus');if(!e&&document.body){e=document.createElement('div');e.id='rhSyncStatus';e.style.cssText='position:fixed;bottom:12px;left:12px;z-index:99998;padding:8px 12px;border:2px solid #111;background:#fff;color:#111;font:700 12px sans-serif;max-width:300px';document.body.append(e);}if(e){e.textContent=s;e.style.borderColor=fail?'#d22':'#111';}}
 async function init(){if(client)return client; if(!window.supabase)throw Error('Supabase library could not load');// Retire the old durable login token; keep saved study data intact.
 const authKey='sb-'+new URL(window.RH_SUPABASE_URL).hostname.split('.')[0]+'-auth-token';
 localStorage.removeItem(authKey);
 client=window.supabase.createClient(window.RH_SUPABASE_URL,window.RH_SUPABASE_PUBLISHABLE_KEY,{auth:{storage:sessionStorage,storageKey:authKey,persistSession:true,detectSessionInUrl:true,flowType:'implicit'}});return client;}
 async function loadUser(){await init();const {data:{user:u},error}=await client.auth.getUser();if(error||!u)throw Error('Please sign in again.');user=u;return u;}
 // Supabase stores payload as jsonb, which can reorder object keys. Compare values, not JSON text order.
 function sameData(a,b){
  if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
  const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();
  return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&a[k]===b[k]);
 }
 // Reconcile cloud data without clearing and rewriting identical values.
 // Rewriting every key makes other open tabs receive storage events and can
 // create an endless cross-tab reload loop.
 function applyData(data){
  const incoming=data&&typeof data==='object'?data:{};
  for(const k of keys())if(!Object.prototype.hasOwnProperty.call(incoming,k))localStorage.removeItem(k);
  for(const [k,v] of Object.entries(incoming)){
   if(typeof v==='string'&&!IGNORE.test(k)&&localStorage.getItem(k)!==v)localStorage.setItem(k,v);
  }
 }
 async function fetchCloud(){
  const {data,error}=await client.from('user_documents').select('payload').eq('user_id',user.id).eq('document_key','revision_hub_local_storage_v1').maybeSingle();
  if(error)throw error;
  return data?.payload?.data||null;
 }
 async function sync(force=false){
  if(!user)return false;
  if(saving){
    // Wait for the active sync, then re-evaluate the newest local snapshot.
    // Never report failure merely because an automatic sync is in flight.
    await activeSync;
    return sync(force);
  }
  const local=snapshot();
  if(!force&&sameData(local,JSON.parse(lastSaved||'null')))return true;
  saving=true;
  activeSync=(async()=>{
  try{
    const remoteBefore=await fetchCloud();
    const baseline=JSON.parse(lastCloud||'null');
    const cloudChanged=remoteBefore&&!sameData(remoteBefore,baseline);
    const localChanged=!sameData(local,JSON.parse(lastSaved||'null'));
    if(cloudChanged){
      if(localChanged){
        status('Cloud conflict: another device changed this account. Do not overwrite; back up both devices first.',true);
        return false;
      }
      applyData(remoteBefore);
      lastSaved=JSON.stringify(snapshot());lastCloud=JSON.stringify(remoteBefore);
      status('Newer cloud data loaded. Refresh this page to display it.');
      return true;
    }
    if(!localChanged&&remoteBefore){status('Cloud already up to date ✓');return true;}
    const {error}=await client.from('user_documents').upsert({user_id:user.id,document_key:'revision_hub_local_storage_v1',payload:{data:local}},{onConflict:'user_id,document_key'});
    if(error)throw error;
    const remoteAfter=await fetchCloud();
    if(!remoteAfter)throw Error('Cloud verification failed: no document was returned.');
    if(!sameData(remoteAfter,local))throw Error('Cloud verification failed: saved values differ from this device.');
    lastSaved=JSON.stringify(local);lastCloud=JSON.stringify(remoteAfter);
    status('Cloud saved and verified ✓');
    return true;
  }catch(e){
    const message=e?.message||String(e);
    status('Cloud save FAILED: '+message,true);
    console.error('LedgerPeer cloud save',e);
    return false;
  }finally{
    saving=false;
  }
  })();
  return activeSync;
 }
 async function hydrate(){
  await loadUser();
  const prior=sessionStorage.getItem(PREFIX);
  if(prior!==user.id){clearData();sessionStorage.setItem(PREFIX,user.id);}
  const cloud=await fetchCloud();
  if(cloud)applyData(cloud);
  lastSaved=JSON.stringify(snapshot());lastCloud=JSON.stringify(cloud);
  status(cloud?'Cloud loaded ✓ · SAVE TO CLOUD verifies changes':'Cloud connected · no saved document yet');
 }
 async function login(email,password){await init();const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await hydrate();location.href='index.html';}
 async function sendRecovery(email){await init();const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:new URL("index.html",location.href).href});if(error)throw error;}
 async function updatePassword(password){await init();const {error}=await client.auth.updateUser({password});if(error)throw error;}
 async function onAuthChange(callback){await init();return client.auth.onAuthStateChange((event,session)=>callback(event,session));}
 async function logout(){if(user){const ok=await sync(true);if(!ok){alert('Cloud save failed. Your unsynced changes may be lost on sign-out. Check the red cloud error before logging out.');return;}}if(client)await client.auth.signOut();user=null;clearData();sessionStorage.removeItem(PREFIX);location.replace('index.html');}
 async function ready(){try{await hydrate();start();return true;}catch(e){console.error(e);status('Login / cloud loading failed. Return to sign-in.',true);return false;}}
 function start(){
  if(timer)return;
  timer=setInterval(()=>sync(),2500);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)sync()});
  // pagehide cannot guarantee completion of an asynchronous network request.
  window.addEventListener('pagehide',()=>{sync()});
  if(!document.getElementById('rhManualSave')){
    const button=document.createElement('button');button.id='rhManualSave';button.type='button';button.textContent='SAVE TO CLOUD';
    button.style.cssText='position:fixed;bottom:52px;left:12px;z-index:99999;border:2px solid #111;background:#f5c518;color:#111;padding:9px 12px;font:800 12px sans-serif;cursor:pointer';
    button.onclick=async()=>{button.disabled=true;button.textContent='SAVING…';const ok=await sync(true);button.textContent=ok?'CLOUD VERIFIED ✓':'SAVE FAILED — SEE ERROR';button.disabled=false;};
    document.body.append(button);
  }
 }
 const api={login,logout,sendRecovery,updatePassword,onAuthChange,ready,sync,init,async isSignedIn(){try{await loadUser();return true}catch{return false}},
   guard(){document.documentElement.style.visibility='hidden';ready().then(ok=>{if(ok)document.documentElement.style.visibility='visible';else location.replace('index.html')});return true;},
   addLockButton(){if(document.getElementById('phLockButton'))return;const b=document.createElement('button');b.id='phLockButton';b.textContent='SIGN OUT';b.type='button';b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:99999;border:3px solid #111;background:#E63B2E;color:#fff;padding:10px 14px;font:900 12px monospace;box-shadow:4px 4px 0 #111;cursor:pointer';b.onclick=logout;document.body.append(b);}
 };window.PersonalHubAuth=api;
})();
