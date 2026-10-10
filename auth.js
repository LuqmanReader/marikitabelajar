/* Revision Hub beta: Supabase identity and per-account cloud document sync. */
(function(){
 const CLIENT='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
 const PREFIX='rh_beta_active_user'; // Shared across tabs, unlike sessionStorage
 const IGNORE=/^(ph_auth_hash_v1|ph_unlocked_v1|sb-|rh_beta_|google)/i;
 let client, user=null, timer=null, saving=false, lastSaved='', lastCloud='', activeSync=null, hydrated=false;
 function keys(){return Object.keys(localStorage).filter(k=>!IGNORE.test(k));}
 function snapshot(){const data={};for(const k of keys())data[k]=localStorage.getItem(k);return data;}
 function clearData(){for(const k of keys())localStorage.removeItem(k);}
 function status(s,fail=false){let e=document.getElementById('rhSyncStatus');if(!e&&document.body){e=document.createElement('div');e.id='rhSyncStatus';e.style.cssText='position:fixed;bottom:12px;left:12px;z-index:99998;padding:8px 12px;border:2px solid #111;background:#fff;color:#111;font:700 12px sans-serif;max-width:300px';document.body.append(e);}if(e){e.textContent=s;e.style.borderColor=fail?'#d22':'#111';}}
 async function init(){if(client)return client; if(!window.supabase)throw Error('Supabase library could not load');client=window.supabase.createClient(window.RH_SUPABASE_URL,window.RH_SUPABASE_PUBLISHABLE_KEY,{auth:{detectSessionInUrl:true,flowType:'implicit'}});return client;}
 async function loadUser(){
  await init();
  const {data:sessionData,error:sessionError}=await client.auth.getSession();
  if(sessionError)throw Error('Unable to check your session: '+sessionError.message);
  if(!sessionData?.session) {const e=Error('Please sign in again.');e.code='NOT_SIGNED_IN';throw e;}
  const {data,error}=await client.auth.getUser();
  if(error)throw Error('Could not verify your session. Check the connection and retry: '+error.message);
  if(!data?.user){const e=Error('Please sign in again.');e.code='NOT_SIGNED_IN';throw e;}
  user=data.user;return user;
 }
 // Supabase stores payload as jsonb, which can reorder object keys. Compare values, not JSON text order.
 function sameData(a,b){
  if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
  const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();
  return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&a[k]===b[k]);
 }
 function applyData(data){
  // Never wipe a working local copy before a complete remote payload is available.
  if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid cloud document; local data preserved.');
  const entries=Object.entries(data).filter(([k,v])=>typeof v==='string'&&!IGNORE.test(k));
  clearData();for(const [k,v] of entries)localStorage.setItem(k,v);
 }
 async function fetchCloud(){
  const {data,error}=await client.from('user_documents').select('payload').eq('user_id',user.id).eq('document_key','revision_hub_local_storage_v1').maybeSingle();
  if(error)throw error;
  return data?.payload?.data||null;
 }
 async function sync(force=false){
  if(!user||!hydrated){status('Cloud is not ready. Local work has not been uploaded.',true);return false;}
  if(saving){await activeSync;return sync(force);}
  saving=true;
  activeSync=(async()=>{
   try{
    const local=snapshot();
    const remote=await fetchCloud();
    const baseline=JSON.parse(lastCloud||'null');
    const cloudChanged=!sameData(remote,baseline) && !(remote===null&&baseline===null);
    const localChanged=!sameData(local,JSON.parse(lastSaved||'null'));
    if(remote&&sameData(remote,local)){
      lastSaved=JSON.stringify(local);lastCloud=JSON.stringify(remote);
      status('Cloud saved and verified ✓');return true;
    }
    if(cloudChanged){
      status('Cloud differs from this page. Nothing overwritten. Reload only after checking your saved attempts.',true);
      return false;
    }
    if(!localChanged&&remote){status('Cloud already up to date ✓');return true;}
    if(!localChanged&&!remote){status('Cloud connected · nothing to save');return true;}
    const {error}=await client.from('user_documents').upsert({user_id:user.id,document_key:'revision_hub_local_storage_v1',payload:{data:local}},{onConflict:'user_id,document_key'});
    if(error)throw error;
    const verified=await fetchCloud();
    if(!sameData(verified,local))throw Error('Cloud verification failed. Your local work is still on this device.');
    lastSaved=JSON.stringify(local);lastCloud=JSON.stringify(verified);
    status('Cloud saved and verified ✓');return true;
   }catch(e){status('Cloud save FAILED: '+(e?.message||String(e)),true);console.error('Revision Hub cloud save',e);return false;}
   finally{saving=false;}
  })();
  return activeSync;
 }
 async function hydrate(){
  await loadUser();
  // localStorage is common to all tabs. sessionStorage is NOT; the old code wiped
  // attempts every time a second tab opened for the first time.
  const prior=localStorage.getItem(PREFIX);
  if(prior&&prior!==user.id){
    // Different user on the same browser: isolate accounts rather than mixing data.
    clearData();
  }
  localStorage.setItem(PREFIX,user.id);
  const cloud=await fetchCloud();
  const local=snapshot();
  if(cloud){
    if(Object.keys(local).length===0){applyData(cloud);status('Cloud loaded ✓');}
    else if(!sameData(local,cloud)){
      // Never throw away local attempts when the remote snapshot is stale.
      status('Local and cloud data differ. Local work preserved; cloud save paused until resolved.',true);
    }else status('Cloud loaded ✓');
  }else status('Cloud connected · no saved document yet');
  lastSaved=JSON.stringify(snapshot());lastCloud=JSON.stringify(cloud);
  hydrated=true;
 }
 async function login(email,password){await init();const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await hydrate();location.href='index.html';}
 async function sendRecovery(email){await init();const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:new URL("index.html",location.href).href});if(error)throw error;}
 async function updatePassword(password){await init();const {error}=await client.auth.updateUser({password});if(error)throw error;}
 async function onAuthChange(callback){await init();return client.auth.onAuthStateChange((event,session)=>callback(event,session));}
 async function logout(){
  if(user){const ok=await sync(true);if(!ok){alert('Cloud save could not be verified. Your local work is preserved; resolve the sync warning before logging out.');return;}}
  if(client)await client.auth.signOut();user=null;hydrated=false;clearData();localStorage.removeItem(PREFIX);location.replace('index.html');
 }
 async function ready(){
  try{await hydrate();start();return true;}
  catch(e){console.error('Revision Hub initialization',e);status('Could not load cloud: '+(e?.message||e)+' · Your local data was not cleared.',true);if(e?.code==='NOT_SIGNED_IN')return false;throw e;}
 }
 function start(){
  if(timer)return;
  timer=setInterval(()=>{if(hydrated&&!document.hidden)sync()},10000);
  // No async pagehide writes: they can race with a new page's cloud hydration.
  if(!document.getElementById('rhManualSave')){
    const button=document.createElement('button');button.id='rhManualSave';button.type='button';button.textContent='SAVE TO CLOUD';
    button.style.cssText='position:fixed;bottom:52px;left:12px;z-index:99999;border:2px solid #111;background:#f5c518;color:#111;padding:9px 12px;font:800 12px sans-serif;cursor:pointer';
    button.onclick=async()=>{button.disabled=true;button.textContent='SAVING…';const ok=await sync(true);button.textContent=ok?'CLOUD VERIFIED ✓':'SAVE FAILED — SEE ERROR';button.disabled=false;};
    document.body.append(button);
  }
 }
 function showLoadError(e){
  const box=document.createElement('div');box.id='rhLoadError';box.setAttribute('role','alert');
  box.style.cssText='position:fixed;inset:20px;z-index:100000;background:white;color:#111;border:4px solid #d22;padding:24px;overflow:auto;font:16px sans-serif';
  const title=document.createElement('h2');title.textContent='Cloud connection interrupted — you have not been signed out';
  const detail=document.createElement('p');detail.textContent=(e?.message||'Cloud could not load')+'. Your local work was not cleared.';
  const button=document.createElement('button');button.textContent='Retry loading';button.onclick=()=>location.reload();
  box.append(title,detail,button);document.body.append(box);
 }
 const api={login,logout,sendRecovery,updatePassword,onAuthChange,ready,sync,init,async isSignedIn(){try{await loadUser();return true}catch{return false}},
   guard(){
    document.documentElement.style.visibility='hidden';
    ready().then(ok=>{if(ok)document.documentElement.style.visibility='visible';else location.replace('index.html')})
      .catch(e=>{document.documentElement.style.visibility='visible';showLoadError(e);});
    return true;
   },
   addLockButton(){if(document.getElementById('phLockButton'))return;const b=document.createElement('button');b.id='phLockButton';b.textContent='SIGN OUT';b.type='button';b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:99999;border:3px solid #111;background:#E63B2E;color:#fff;padding:10px 14px;font:900 12px monospace;box-shadow:4px 4px 0 #111;cursor:pointer';b.onclick=logout;document.body.append(b);}
 };window.PersonalHubAuth=api;
})();
