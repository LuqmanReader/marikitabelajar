/* Revision Hub beta: Supabase identity and per-account cloud document sync. */
(function(){
 const CLIENT='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
 const PREFIX='rh_beta_active_user';
 const IGNORE=/^(ph_auth_hash_v1|ph_unlocked_v1|sb-|rh_beta_|google)/i;
 let client, user=null, timer=null, saving=false, lastSaved='';
 function keys(){return Object.keys(localStorage).filter(k=>!IGNORE.test(k));}
 function snapshot(){const data={};for(const k of keys())data[k]=localStorage.getItem(k);return data;}
 function clearData(){for(const k of keys())localStorage.removeItem(k);}
 function status(s,fail=false){let e=document.getElementById('rhSyncStatus');if(!e&&document.body){e=document.createElement('div');e.id='rhSyncStatus';e.style.cssText='position:fixed;bottom:12px;left:12px;z-index:99998;padding:8px 12px;border:2px solid #111;background:#fff;color:#111;font:700 12px sans-serif;max-width:300px';document.body.append(e);}if(e){e.textContent=s;e.style.borderColor=fail?'#d22':'#111';}}
 async function init(){if(client)return client; if(!window.supabase)throw Error('Supabase library could not load');client=window.supabase.createClient(window.RH_SUPABASE_URL,window.RH_SUPABASE_PUBLISHABLE_KEY,{auth:{detectSessionInUrl:true,flowType:'implicit'}});return client;}
 async function loadUser(){await init();const {data:{user:u},error}=await client.auth.getUser();if(error||!u)throw Error('Please sign in again.');user=u;return u;}
 async function sync(){if(!user||saving)return;const data=snapshot(),json=JSON.stringify(data);if(json===lastSaved)return;saving=true;try{const {error}=await client.from('user_documents').upsert({user_id:user.id,document_key:'revision_hub_local_storage_v1',payload:{data}},{onConflict:'user_id,document_key'});if(error)throw error;lastSaved=json;status('Cloud saved ✓');}catch(e){status('Cloud save failed — changes remain on this device',true);console.error('Revision Hub cloud save',e);}finally{saving=false;}}
 async function hydrate(){await loadUser();const prior=sessionStorage.getItem(PREFIX);if(prior!==user.id){clearData();sessionStorage.setItem(PREFIX,user.id);}const {data,error}=await client.from('user_documents').select('payload').eq('document_key','revision_hub_local_storage_v1').maybeSingle();if(error)throw error;if(data?.payload?.data){clearData();for(const [k,v] of Object.entries(data.payload.data))if(typeof v==='string'&&!IGNORE.test(k))localStorage.setItem(k,v);}lastSaved=JSON.stringify(snapshot());status('Cloud connected ✓');}
 async function login(email,password){await init();const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await hydrate();location.href='index.html';}
 async function logout(){if(user)await sync();if(client)await client.auth.signOut();user=null;clearData();sessionStorage.removeItem(PREFIX);location.replace('index.html');}
 async function ready(){try{await hydrate();start();return true;}catch(e){console.error(e);status('Login / cloud loading failed. Return to sign-in.',true);return false;}}
 function start(){if(timer)return;timer=setInterval(sync,8000);document.addEventListener('visibilitychange',()=>{if(document.hidden)sync()});window.addEventListener('pagehide',()=>{sync()});}
 const api={login,logout,ready,sync,init,async isSignedIn(){try{await loadUser();return true}catch{return false}},
   guard(){document.documentElement.style.visibility='hidden';ready().then(ok=>{if(ok)document.documentElement.style.visibility='visible';else location.replace('index.html')});return true;},
   addLockButton(){if(document.getElementById('phLockButton'))return;const b=document.createElement('button');b.id='phLockButton';b.textContent='SIGN OUT';b.type='button';b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:99999;border:3px solid #111;background:#E63B2E;color:#fff;padding:10px 14px;font:900 12px monospace;box-shadow:4px 4px 0 #111;cursor:pointer';b.onclick=logout;document.body.append(b);}
 };window.PersonalHubAuth=api;
})();
