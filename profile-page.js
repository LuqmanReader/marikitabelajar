(function(){
'use strict';
const byId=id=>document.getElementById(id);
const status=(message,error=false)=>{const target=byId('profileStatus');target.textContent=message;target.classList.toggle('error',error);};
let client,user;
async function init(){
 try{
  if(!window.PersonalHubAuth)throw Error('Account system unavailable.');
  const ok=await PersonalHubAuth.ready();
  if(!ok){location.replace(PersonalHubAuth.signInUrl('profile.html'));return;}
  client=PersonalHubAuth.getClient();user=PersonalHubAuth.getUser();
  if(!client||!user)throw Error('Please log in again.');
  const {data,error}=await client.from('student_profiles').select('display_name,handle,pathway,current_paper,bio').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(data){
    byId('displayName').value=data.display_name;
    byId('handle').value=data.handle;
    byId('pathway').value=data.pathway;
    byId('currentPaper').value=data.current_paper||'';
    byId('bio').value=data.bio||'';
    byId('profileTitle').textContent='UPDATE YOUR STUDENT PROFILE.';
    byId('profileSave').textContent='SAVE PROFILE CHANGES →';
    byId('profileBack').hidden=false;
  }
  status(data?'You can update your public student information here.':'Please complete the required fields before entering the workspace.');
  PersonalHubAuth.addLockButton?.();
 }catch(e){status('Cannot load profile: '+(e?.message||e),true);}
}
byId('handle').addEventListener('input',event=>{
 event.target.value=event.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,24);
});
byId('profileForm').addEventListener('submit',async event=>{
 event.preventDefault();if(!client||!user)return;
 const name=byId('displayName').value.trim(),handle=byId('handle').value.trim().toLowerCase();
 const pathway=byId('pathway').value;
 if(name.length<2||name.length>50||!/^[a-z][a-z0-9_]{2,23}$/.test(handle)||!['FIA','ACCA','BOTH'].includes(pathway)){
  status('Check your display name, username and study pathway.',true);return;
 }
 if(!byId('guidelines').checked){status('Please agree to the classroom guidelines before continuing.',true);return;}
 const button=byId('profileSave');button.disabled=true;
 status('Saving your student profile…');
 try{
  const payload={user_id:user.id,display_name:name,handle,pathway,current_paper:byId('currentPaper').value,bio:byId('bio').value.trim()};
  const {error}=await client.from('student_profiles').upsert(payload,{onConflict:'user_id'});
  if(error)throw error;
  const {data:room,error:roomError}=await client.from('classrooms').select('id').eq('slug','ledgerpeer-commons').maybeSingle();
  if(roomError)throw roomError;
  if(room){
   const {data:member,error:memberError}=await client.from('classroom_members').select('user_id').eq('classroom_id',room.id).eq('user_id',user.id).maybeSingle();
   if(memberError)throw memberError;
   if(!member){
    const {error:joinError}=await client.from('classroom_members').insert({classroom_id:room.id,user_id:user.id});
    if(joinError)console.warn('Classroom join pending:',joinError.message);
   }
  }
  status('Profile saved. Opening your workspace…');
  const requested=new URLSearchParams(location.search).get('next');
  const destination=PersonalHubAuth.safeDestination(requested);
  location.replace(destination&&destination!=='profile.html'?destination:'index.html#access');
 }catch(e){
  const duplicate=e?.code==='23505'||/duplicate key|unique constraint/i.test(e?.message||'');
  status(duplicate?'That username is already taken. Choose another.':('Could not save your profile: '+(e?.message||e)),true);
 }finally{button.disabled=false;}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();