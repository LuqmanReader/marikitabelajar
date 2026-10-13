/* No real credentials, users or Supabase network access: simulated auth backend. */
'use strict';
const assert=require('assert');
const fs=require('fs'),vm=require('vm'),path=require('path');
const authCode=fs.readFileSync(path.resolve(__dirname,'../auth.js'),'utf8');
const homepage=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
function fixture(url,opts={}){
 const state={verifyCalls:[],session:null,user:null,setSessionCalls:0,history:[]};
 class Storage{constructor(){this.m={};}getItem(k){return Object.hasOwn(this.m,k)?this.m[k]:null;}setItem(k,v){this.m[k]=String(v);}removeItem(k){delete this.m[k];}}
 const location=new URL(url);
 const auth={
  verifyOtp:async data=>{
   state.verifyCalls.push(data);
   if(opts.rejectToken)return {data:null,error:new Error('Token has expired or is invalid')};
   state.user={id:'test-user',email_confirmed_at:opts.stillUnconfirmed?null:'2026-10-13T12:00:00Z'};
   state.session={access_token:'mock-session',refresh_token:'mock-refresh',user:state.user};
   return {data:{user:state.user,session:state.session},error:null};
  },
  exchangeCodeForSession:async code=>{
   if(code!=='valid-code')return {data:null,error:new Error('Invalid exchange code')};
   state.user={id:'test-user',email_confirmed_at:'2026-10-13T12:00:00Z'};
   state.session={access_token:'mock-session',refresh_token:'mock-refresh',user:state.user};
   return {data:{user:state.user,session:state.session},error:null};
  },
  getSession:async()=>({data:{session:state.session},error:null}),
  setSession:async credentials=>{
   state.setSessionCalls++;
   state.user={id:'test-user',email_confirmed_at:'2026-10-13T12:00:00Z'};
   state.session={...credentials,user:state.user};
   return {data:{session:state.session},error:null};
  },
  getUser:async()=>({data:{user:state.user},error:null}),
  onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),
  signInWithPassword:async()=>({data:{session:state.session},error:null}),
  signUp:async()=>({data:{session:null},error:null}),
  resend:async()=>({data:{},error:null}),
  resetPasswordForEmail:async()=>({data:{},error:null}),
  updateUser:async()=>({data:{},error:null}),
  signOut:async()=>{state.session=null;state.user=null;return {error:null}}
 };
 const win={supabase:{createClient:()=>({auth})},RH_SUPABASE_URL:'https://example.supabase.co',RH_SUPABASE_PUBLISHABLE_KEY:'public-test-key'};
 const context={window:win,document:{querySelector:()=>({}),body:null},Storage,
  localStorage:new Storage(),sessionStorage:new Storage(),
  history:{replaceState:(...args)=>state.history.push(args)},location,
  URL,URLSearchParams,console,setTimeout,clearTimeout,setInterval,clearInterval,Math,Date,
 };
 Object.assign(win,context);
 vm.runInNewContext(authCode,context,{filename:'auth.js'});
 return{A:win.PersonalHubAuth,state,location};
}
async function main(){
 const origin='https://example.github.io/marikitabelajar/index.html';
 const direct=fixture(origin+'?token_hash=valid-hash&type=email');
 const yes=await direct.A.completeEmailLink();
 assert.strictEqual(yes.verified,true);
 assert.strictEqual(direct.state.verifyCalls[0].token_hash,'valid-hash');
 assert.strictEqual(direct.state.verifyCalls[0].type,'email');
 assert(direct.state.history.at(-1)[2].endsWith('#access'));
 const normal=fixture(origin);
 assert.deepStrictEqual(JSON.parse(JSON.stringify(await normal.A.completeEmailLink())),{handled:false});
 assert.strictEqual(normal.state.verifyCalls.length,0);
 const wrong=fixture(origin+'?token_hash=expired&type=email',{rejectToken:true});
 await assert.rejects(()=>wrong.A.completeEmailLink(),/Email confirmation failed.*expired/);
 assert(wrong.state.history.length>0);
 const fake=fixture(origin+'?token_hash=fake&type=email',{stillUnconfirmed:true});
 await assert.rejects(()=>fake.A.completeEmailLink(),/not marked this email as confirmed/);
 const implicit=fixture(origin+'#access_token=mock-access&refresh_token=mock-refresh&type=signup');
 const implicitResult=await implicit.A.completeEmailLink();
 assert(implicitResult.verified);
 assert(implicit.state.setSessionCalls===1);
 const code=fixture(origin+'?code=valid-code');
 assert((await code.A.completeEmailLink()).verified);
 const recovery=fixture(origin+'#type=recovery&access_token=abc&refresh_token=def');
 assert.strictEqual((await recovery.A.completeEmailLink()).handled,false);
 const badCallback=fixture(origin+'#error_code=otp_expired&error_description=Email+link+is+invalid');
 await assert.rejects(()=>badCallback.A.completeEmailLink(),/Supabase could not confirm/);
 assert(homepage.includes('completeEmailLink(incomingAuthCallback)'),'home page did not await confirmation');
 assert(homepage.includes('email not confirmed'),'unconfirmed account path missing');
 assert(homepage.includes("Sign Up & Verify"),'signup UI not updated');
 assert(homepage.includes('We sent a confirmation LINK'),'default confirmation-link wording missing');
 assert(homepage.includes('Resend confirmation email'),'resend-button label missing');
 assert(homepage.includes('Supabase email limit reached'),'rate-limit recovery missing');
 assert(homepage.includes('newest confirmation email'),'old-link guidance missing');
 const scripts=[...homepage.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 for(const js of scripts)new Function(js);
 console.log(JSON.stringify({result:'PASS',cases:['confirmed-token-hash','plain-homepage-does-not-fake-confirmation','expired-link','server-still-unconfirmed','implicit-session-redirect','PKCE-code','recovery-preserved','Supabase-error-surfaced','login-callback-integration'],count:9},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
