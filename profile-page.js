(function(){
'use strict';
const byId=id=>document.getElementById(id);
const status=(message,error=false)=>{const target=byId('profileStatus');target.textContent=message;target.classList.toggle('error',error);};
let client,user;
const selectedPapers=new Set();
function paperCatalog(){return window.SubjectCatalog?.papers||[];}
function validPapers(values){
 const allowed=new Set(paperCatalog().map(p=>p.code));
 const supplied=Array.isArray(values)?values:[];
 return [...new Set(supplied.filter(code=>typeof code==='string'&&allowed.has(code)))];
}
function selectedPaperCodes(){return validPapers([...selectedPapers]);}
function syncSubjectSelection(){
 const current=selectedPaperCodes();
 for(const input of byId('subjectOptions').querySelectorAll('input[type="checkbox"]')){
  input.checked=selectedPapers.has(input.value);
 }
 byId('subjectSelectedCount').textContent=current.length
  ?current.length+' SUBJECT'+(current.length===1?'':'S')+' SELECTED · '+current.join(', ')
  :'NO SUBJECTS SELECTED';
}
function populateSubjectPicker(){
 const picker=byId('subjectOptions'),papers=paperCatalog();
 if(!papers.length)throw Error('Subject catalogue unavailable. Please reload this page.');
 const stages=new Map();
 const fragment=document.createDocumentFragment();
 for(const paper of papers){
  let group=stages.get(paper.stage);
  if(!group){
   const section=document.createElement('section');
   section.className='subject-stage';
   const title=document.createElement('h3');title.textContent=paper.stage;
   const grid=document.createElement('div');grid.className='subject-choice-grid';
   section.append(title,grid);fragment.appendChild(section);
   group=grid;stages.set(paper.stage,group);
  }
  const label=document.createElement('label');label.className='subject-choice';
  label.dataset.search=(paper.code+' '+paper.name+' '+paper.stage).toLowerCase();
  const input=document.createElement('input');
  input.type='checkbox';input.name='currentPapers';input.value=paper.code;
  const text=document.createElement('span');
  const code=document.createElement('strong');code.textContent=paper.code;
  const name=document.createElement('small');name.textContent=paper.name;
  text.append(code,name);label.append(input,text);group.appendChild(label);
 }
 picker.replaceChildren(fragment);
 picker.addEventListener('change',event=>{
  const input=event.target;
  if(!input.matches('input[name="currentPapers"]'))return;
  if(input.checked)selectedPapers.add(input.value);
  else selectedPapers.delete(input.value);
  syncSubjectSelection();
 });
 byId('subjectSearch').addEventListener('input',filterSubjectPicker);
 syncSubjectSelection();
}
function filterSubjectPicker(){
 const term=byId('subjectSearch').value.trim().toLowerCase();
 let visible=0;
 for(const group of byId('subjectOptions').querySelectorAll('.subject-stage')){
  let within=0;
  for(const option of group.querySelectorAll('.subject-choice')){
   const show=!term||option.dataset.search.includes(term);
   option.hidden=!show;
   if(show){within++;visible++;}
  }
  group.hidden=!within;
 }
 byId('subjectNoMatches').hidden=visible>0;
}
function restoreSubjects(data){
 selectedPapers.clear();
 const stored=Array.isArray(data?.current_papers)&&data.current_papers.length
  ?data.current_papers
  :data?.current_paper?[data.current_paper]:[];
 for(const code of validPapers(stored))selectedPapers.add(code);
 syncSubjectSelection();
}
async function init(){
 try{
  if(!window.PersonalHubAuth)throw Error('Account system unavailable.');
  const ok=await PersonalHubAuth.ready();
  if(!ok){location.replace(PersonalHubAuth.signInUrl('profile.html'));return;}
  client=PersonalHubAuth.getClient();user=PersonalHubAuth.getUser();
  if(!client||!user)throw Error('Please log in again.');
  populateSubjectPicker();
  const {data,error}=await client.from('student_profiles').select('display_name,handle,pathway,current_paper,current_papers,bio').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(data){
    byId('displayName').value=data.display_name;
    byId('handle').value=data.handle;
    byId('pathway').value=data.pathway;
    restoreSubjects(data);
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
  const papers=selectedPaperCodes();
  const payload={user_id:user.id,display_name:name,handle,pathway,current_papers:papers,current_paper:papers[0]||'',bio:byId('bio').value.trim()};
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
  const route=destination&&destination!=='profile.html'?destination:'index.html#access';
  location.replace(window.self!==window.top?route:'workspace.html#'+encodeURIComponent(route));
 }catch(e){
  const duplicate=e?.code==='23505'||/duplicate key|unique constraint/i.test(e?.message||'');
  status(duplicate?'That username is already taken. Choose another.':('Could not save your profile: '+(e?.message||e)),true);
 }finally{button.disabled=false;}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();