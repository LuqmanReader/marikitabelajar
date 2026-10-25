(function(root){
'use strict';
const $=id=>document.getElementById(id),engine=root.LedgerQuizEngine;
const papers=root.SubjectCatalog?.papers||[],syllabi=root.LedgerNotesSyllabi?.papers||{},lessons=root.LedgerFiaNotes||{};
const params=new URLSearchParams(root.location.search);
let active=null,answers={},phase='setup',saved=false,mode='topic',recentlyGenerated=[];
const element=(tag,className,value)=>{const n=document.createElement(tag);if(className)n.className=className;if(value!==undefined)n.textContent=value;return n;};
const getTopics=paper=>(syllabi[paper]?.topics||[]).map(engine.topicCode).filter(Boolean);
function setMessage(message){$('coverage').textContent=message;}
function fillPapers(){
 let group,stage='';
 for(const p of papers){
   if(stage!==p.stage){stage=p.stage;group=element('optgroup');group.label=stage;$('paper').append(group);}
   const o=element('option',null,p.label);o.value=p.code;group.append(o);
 }
 const selected=params.get('paper')?.toUpperCase();
 $('paper').value=papers.some(p=>p.code===selected)?selected:'FA2';
}
function fillTopics(){
 const paper=$('paper').value,topics=getTopics(paper),select=$('topic'),prior=params.get('topic')?.toUpperCase()||select.value;
 select.replaceChildren();
 const all=element('option',null,'ALL TOPICS · MIXED PRACTICE');all.value='all';select.append(all);
 let covered=0;
 for(const topic of topics){
   const hasContent=Boolean(lessons[paper+':'+topic.code]);
   if(hasContent)covered++;
   const o=element('option',null,topic.code+' · '+topic.title+(hasContent?'':' · OUTLINE ONLY'));o.value=topic.code;select.append(o);
 }
 select.value=topics.some(t=>t.code===prior)?prior:'all';
 if(!params.has('topic'))select.value='all';
 params.delete('topic');
 setMessage(covered+' of '+topics.length+' syllabus headings have source-backed lesson questions. Outline-only headings need authored material before a quiz can be made. Calculation templates are available for selected FA2/MA2 topics.');
 updateReadLink();
}
function updateReadLink(){
 const paper=$('paper').value,topic=$('topic').value;
 $('readTopic').href='notes.html?paper='+encodeURIComponent(paper)+(topic!=='all'?'&topic='+encodeURIComponent(topic):'');
 $('readTopic').textContent=topic==='all'?'OPEN '+paper+' SYLLABUS ↗':'STUDY '+paper+' '+topic+' ↗';
}
function getSelection(){return $('topic').value==='all'?null:[$('topic').value];}
function setMode(next){
 mode=next==='mock'?'mock':'topic';
 const isMock=mode==='mock';
 $('topicMode').classList.toggle('active',!isMock);
 $('mockMode').classList.toggle('active',isMock);
 $('topicMode').setAttribute('aria-pressed',String(!isMock));
 $('mockMode').setAttribute('aria-pressed',String(isMock));
 $('topicField').hidden=isMock;
 $('countField').hidden=isMock;
 $('readTopic').hidden=isMock;
 $('modeDescription').textContent=isMock
  ?'50 questions are drawn across the selected paper’s syllabus topics. This is mock-style revision practice with written self-marking, not an official computer-based ACCA examination.'
  :'Up to 20 questions per topic. Questions are selected from distinct lesson-based prompts and random numerical scenarios where available. Recently used questions are deprioritised.';
 $('generate').textContent=isMock?'GENERATE 50-QUESTION MOCK →':'GENERATE '+$('count').value+' QUESTIONS →';
}

function qTitle(q){const t=getTopics(active.paper).find(x=>x.code===q.key.split(':')[1]);return t?.title||q.key;}
function makeQuiz(){
 const paper=$('paper').value,topics=mode==='mock'?null:getSelection(),count=mode==='mock'?50:Number($('count').value);
 const records=engine.readHistory(root.localStorage).filter(r=>r.paper===paper).slice(0,3);
 const recentIds=records.flatMap(r=>(r.items||[]).map(q=>q.id)).concat(recentlyGenerated);
 active=engine.generate({paper,topics,count,mode,recentIds,lessons,syllabus:syllabi});
 active.selectedTopic=mode==='mock'?'all':$('topic').value;
 recentlyGenerated=recentlyGenerated.concat(active.questions.map(q=>q.id)).slice(-400);
 answers={};phase='answering';saved=false;
 if(!active.questions.length){
   $('quizSection').hidden=true;
   setMessage('There are no authored questions for the selected topic yet. Open its study resources or select another syllabus topic. No questions will be invented.');
   return;
 }
 $('quizSection').hidden=false;$('results').hidden=true;$('saveStatus').textContent='';$('save').disabled=false;
 const narrow=mode==='mock'?' / PAPER-WIDE MOCK PRACTICE':topics?' / '+topics.join(', '):' / MIXED TOPICS';
 $('quizTitle').textContent=mode==='mock'?'50-QUESTION MOCK PRACTICE':'TOPIC PRACTICE SET';
 $('quizSummary').textContent=paper+narrow+' · '+active.available+' varied questions'+(active.available<count?' (requested '+count+'; available source material is limited)':'')+' · '+active.topicsCovered+' syllabus topics covered · '+(mode==='mock'?'Written answers require self-assessment.':'Calculation questions are auto-marked where supported.');
 $('review').hidden=false;
 renderQuestions();$('quizSection').scrollIntoView({block:'start',behavior:'smooth'});
}
function renderQuestions(){
 const list=$('questions');list.replaceChildren();
 active.questions.forEach((q,i)=>{
  const card=element('article','question');card.id='practice-'+i;
  card.append(element('div','meta',String(i+1).padStart(2,'0')+' / '+q.key+' / '+(q.type==='mcq'?'AUTO MARKED':'SELF MARKED')));
  card.append(element('h3',null,q.prompt));
  if(q.type==='mcq'){
    const choices=element('div','choices');
    q.choices.forEach((choice,index)=>{
      const label=element('label','choice'),input=element('input');input.type='radio';input.name='quiz-'+i;input.value=String(index);
      input.addEventListener('change',()=>{answers[q.id]=choice.value;});
      label.append(input,element('span',null,choice.label));choices.append(label);
    });
    card.append(choices);
  }else{
    const answer=element('textarea','answer');answer.placeholder='Write your own explanation here before viewing the model answer.';answer.setAttribute('aria-label','Written answer for question '+(i+1));card.append(answer);
  }
  card.append(element('div','feedback'));list.append(card);
 });
}
function markWritten(q,passed,container){
 answers[q.id]=passed;
 container.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.passed===String(passed))));
 updateResult();
}
function reviewQuiz(){
 if(phase!=='answering')return;
 const unanswered=active.questions.find(q=>q.type==='mcq'&&answers[q.id]===undefined);
 if(unanswered){
  setMessage('Answer every multiple-choice question before checking. Written questions can be assessed after revealing the reference answer.');
  const index=active.questions.indexOf(unanswered);
  $('practice-'+index).scrollIntoView({block:'center',behavior:'smooth'});
  return;
 }
 phase='review';$('review').hidden=true;
 active.questions.forEach((q,i)=>{
  const card=$('practice-'+i),box=card.querySelector('.feedback');
  card.querySelectorAll('input,textarea').forEach(el=>el.disabled=true);
  box.replaceChildren();box.append(element('h4',null,q.type==='mcq'?'AUTOMATIC ANSWER REVIEW':'REFERENCE ANSWER / SELF ASSESSMENT'));
  const answer=answers[q.id];
  if(q.type==='mcq'){
   const right=answer===q.correctValue;
   box.classList.add(right?'good':'bad');
   const chosen=q.choices.find(o=>o.value===answer)?.label||'No option selected';
   const expected=q.choices.find(o=>o.value===q.correctValue)?.label||'';
   box.append(element('p',null,'Your answer: '+chosen+'\nCorrect answer: '+expected+'\n\n'+q.explanation));
  }else{
   box.append(element('p',null,q.explanation));
   const options=element('div','self-actions');
   for(const [value,label] of [[true,'I GOT IT ✓'],[false,'NEEDS REVISION ↻']]){
     const btn=element('button',null,label);btn.type='button';btn.dataset.passed=String(value);btn.setAttribute('aria-pressed','false');
     btn.addEventListener('click',()=>markWritten(q,value,options));options.append(btn);
   }
   box.append(options);
  }
 });
 $('results').hidden=false;updateResult();$('results').scrollIntoView({block:'start',behavior:'smooth'});
}
function updateResult(){
 const s=engine.score(active.questions,answers),remaining=s.total-s.marked;
 $('score').replaceChildren();
 $('score').append(element('strong',null,s.correct+' / '+s.total));
 $('score').append(element('p',null,s.percent+'% of '+s.marked+' marked answers correct · '+s.automatic+' automatically marked · '+s.selfMarked+' self-marked'+(remaining?' · '+remaining+' still need marking':'')));
 $('save').disabled=remaining>0||saved;
}
function saveQuiz(){
 if(!active||phase!=='review'||saved)return;
 const outcome=engine.score(active.questions,answers);
 if(outcome.marked!==outcome.total)return;
 const record={id:new Date().toISOString()+'-'+Math.floor(Math.random()*100000),at:new Date().toISOString(),
   paper:active.paper,topic:active.selectedTopic,mode:active.mode,correct:outcome.correct,total:outcome.total,percent:outcome.percent,
   automatic:outcome.automatic,selfMarked:outcome.selfMarked,items:outcome.items,
   edition:syllabi[active.paper]?.edition||null};
 try{
   engine.saveHistory(root.localStorage,record);
   saved=true;updateResult();renderHistory();
   $('saveStatus').textContent='Saved on this device. LedgerPeer will back it up to your signed-in account when cloud sync succeeds.';
   if(root.PersonalHubAuth?.sync)root.PersonalHubAuth.sync().then(ok=>{
      $('saveStatus').textContent=ok?'Saved on device and verified in your cloud account ✓':'Saved on device; cloud backup is still pending. Check the sync indicator.';
   }).catch(()=>$('saveStatus').textContent='Saved on device. Cloud backup is pending.');
 }catch(e){$('saveStatus').textContent='Could not save quiz history: '+e.message;}
}
function renderHistory(){
 const entries=engine.readHistory(root.localStorage),list=$('history');list.replaceChildren();
 if(!entries.length){list.textContent='No topic quizzes saved yet. Complete a set to build your learning record.';return;}
 const summary=element('p',null,entries.length+' saved practice sessions on this account. Most recent first.');list.append(summary);
 const wrap=element('div','history-list');
 for(const r of entries.slice(0,8)){
   const row=element('div','history-row'),left=element('div');
   left.append(element('b',null,r.paper+' / '+(r.mode==='mock'?'50-QUESTION MOCK':r.topic==='all'?'MIXED TOPICS':r.topic||'MIXED')));
   left.append(element('small',null,new Date(r.at).toLocaleString('en-MY')+' · '+r.automatic+' automatic / '+r.selfMarked+' self-marked'));
   row.append(left,element('b',null,r.correct+' / '+r.total));wrap.append(row);
 }
 list.append(wrap);
}
async function init(){
 try{
  if(!engine||papers.length!==25||!root.PersonalHubAuth||!Object.keys(syllabi).length)throw Error('The syllabus or quiz engine could not load.');
  if(!await root.PersonalHubAuth.ready()){root.location.replace('index.html');return;}
  fillPapers();fillTopics();renderHistory();
  setMode(params.get('mode')==='mock'?'mock':'topic');
  $('topicMode').addEventListener('click',()=>setMode('topic'));
  $('mockMode').addEventListener('click',()=>setMode('mock'));
  $('count').addEventListener('change',()=>setMode(mode));
  $('paper').addEventListener('change',()=>{fillTopics();});
  $('topic').addEventListener('change',updateReadLink);
  $('generate').addEventListener('click',makeQuiz);
  $('regenerate').addEventListener('click',makeQuiz);
  $('review').addEventListener('click',reviewQuiz);
  $('save').addEventListener('click',saveQuiz);
  root.PersonalHubAuth.addLockButton?.();
  $('access').hidden=true;$('app').hidden=false;$('loading').hidden=true;
 }catch(e){$('loading').textContent='QUIZ GENERATOR COULD NOT START: '+e.message+' · RETURN TO LEDGERPEER.';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);