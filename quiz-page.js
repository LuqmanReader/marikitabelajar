(function(root){
'use strict';
const $=id=>document.getElementById(id),engine=root.LedgerQuizEngine;
const papers=root.SubjectCatalog?.papers||[],syllabi=root.LedgerNotesSyllabi?.papers||{},lessons=root.LedgerFiaNotes||{};
const params=new URLSearchParams(root.location.search);
let active=null,answers={},phase='setup',saved=false,mode='topic',recentlyGenerated=[],recentlyGeneratedGroups=[];
let cursor=0,flagged=new Set();
const element=(tag,className,value)=>{const n=document.createElement(tag);if(className)n.className=className;if(value!==undefined)n.textContent=value;return n;};
const getTopics=paper=>(syllabi[paper]?.topics||[]).map(engine.topicCode).filter(Boolean);
function setMessage(message){$('coverage').textContent=message;}
function fillPapers(){
 let group,stage='';
 for(const p of papers){
   if(stage!==p.stage){stage=p.stage;group=element('optgroup');group.label=stage;$('paper').append(group);}
   const supported=engine.SUPPORTED_EXAM_PAPERS?.includes(p.code);
   const o=element('option',null,p.label+(supported?'':' · QUESTION BANK IN DEVELOPMENT'));o.value=p.code;o.disabled=!supported;group.append(o);
 }
 const selected=params.get('paper')?.toUpperCase();
 $('paper').value=engine.SUPPORTED_EXAM_PAPERS?.includes(selected)?selected:'FA2';
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
 setMessage(covered+' syllabus headings mapped to '+paper+'. Questions are original, authored and calculation-based. Some topics have fewer than 20 distinct questions; there is no paragraph-matching filler.');
 updateReadLink();
}
function updateReadLink(){
 const paper=$('paper').value,topic=$('topic').value;
 $('readTopic').href='notes.html?paper='+encodeURIComponent(paper)+(topic!=='all'?'&topic='+encodeURIComponent(topic):'');
 $('readTopic').textContent=topic==='all'?'OPEN '+paper+' SYLLABUS ↗':'STUDY '+paper+' '+topic+' ↗';
}
function getSelection(){return $('topic').value==='all'?null:[$('topic').value];}
function setMode(next){
 mode=next==='mock'?'mock':next==='integrated'?'integrated':'topic';
 if(mode==='integrated'&&!['FA2','MA2'].includes($('paper').value))mode='topic';
 const isMock=mode==='mock',isIntegrated=mode==='integrated';
 $('integratedMode').disabled=!['FA2','MA2'].includes($('paper').value);
 $('integratedMode').title=$('integratedMode').disabled?'Integrated case bank is currently available for FA2 and MA2.':'Combine several syllabus topics in each problem.';
 // Cross-topic authored cases combine multiple steps and are rated hard;
 // do not expose an easy/moderate-only filter that would silently exclude them.
 const difficultySelect=$('difficulty');
 for(const option of difficultySelect.options){
  if(option.value==='easy'||option.value==='moderate')option.disabled=isIntegrated;
 }
 if(isIntegrated&&['easy','moderate'].includes(difficultySelect.value))difficultySelect.value='mixed';
 $('topicMode').classList.toggle('active',!isMock&&!isIntegrated);
 $('integratedMode').classList.toggle('active',isIntegrated);
 $('mockMode').classList.toggle('active',isMock);
 $('topicMode').setAttribute('aria-pressed',String(!isMock&&!isIntegrated));
 $('integratedMode').setAttribute('aria-pressed',String(isIntegrated));
 $('mockMode').setAttribute('aria-pressed',String(isMock));
 $('topicField').hidden=isMock||isIntegrated;
 $('chapterOnlyWrap').hidden=isMock||isIntegrated||$('topic').value==='all';
 $('countField').hidden=isMock;
 $('difficultyField').hidden=isMock;
 $('orderField').hidden=isMock;
 $('readTopic').hidden=isMock||isIntegrated;
 $('modeDescription').textContent=isMock
  ?(['FA2','MA2'].includes($('paper').value)?'50-question foundation-style practice: 35 MCQ and 15 numerical entries, including connected-topic cases. This does not replicate all CBE formats.':'50-question foundation-style practice with MCQs, not an official ACCA examination.')
  :isIntegrated?'Integrated Mix deliberately combines two or three FA2/MA2 chapters inside one scenario, alongside standalone problems from across the paper. Original practice, not an ACCA or Kaplan question bank.'
  :(['FA2','MA2'].includes($('paper').value)?'Up to 20 original questions; choose ALL TOPICS to mix standalone chapter skills with integrated cross-topic scenarios.':'Original multiple-choice practice. Question count depends on available independent skills.');
 $('generate').textContent=isMock?'GENERATE 50-QUESTION MOCK →':isIntegrated?'GENERATE '+$('count').value+' INTEGRATED QUESTIONS →':'GENERATE '+$('count').value+' QUESTIONS →';
}

function qTitle(q){const t=getTopics(active.paper).find(x=>x.code===q.key.split(':')[1]);return t?.title||q.key;}
function makeQuiz(){
 const paper=$('paper').value,topics=mode==='mock'||mode==='integrated'?null:getSelection(),count=mode==='mock'?50:Number($('count').value);
 const difficulty=mode==='mock'?'mixed':$('difficulty').value;
 const order=mode==='mock'?'random':$('order').value;
 const chapterOnly=mode==='topic'&&$('chapterOnly').checked&&$('topic').value!=='all';
 const records=engine.readHistory(root.localStorage).filter(r=>r.paper===paper).slice(0,100);
 const recentIds=records.flatMap(r=>(r.items||[]).map(q=>q.id)).concat(recentlyGenerated);
 const recentGroups=records.flatMap(r=>(r.items||[]).map(q=>q.key&&q.group?q.key+'|'+q.group:null).filter(Boolean)).concat(recentlyGeneratedGroups);
 active=engine.generate({paper,topics,count,mode,difficulty,order,recentIds,recentGroups,lessons,syllabus:syllabi,chapterOnly});
 active.selectedTopic=mode==='mock'||mode==='integrated'?'all':$('topic').value;
 recentlyGenerated=recentlyGenerated.concat(active.questions.map(q=>q.id)).slice(-400);
 recentlyGeneratedGroups=recentlyGeneratedGroups.concat(active.questions.map(q=>q.key+'|'+q.group)).slice(-400);
 answers={};phase='answering';saved=false;cursor=0;flagged=new Set();
 // Never present a 3-question quiz as the 20-question set the student ordered.
 // Show a clear capacity error rather than silently starting a partial assessment.
 if(!active.complete){
   $('quizSection').hidden=true;
   const advice=chapterOnly?' Uncheck Chapter only to combine questions across the paper.':' Try All Topics or another supported paper.';
   setMessage('CANNOT BUILD '+active.requested+' DISTINCT QUESTIONS · Found '+active.available+'. '+(active.reason||'The verified authored question bank is insufficient.')+advice+' No repeated reasoning was inserted to pad the count.');
   return;
 }
 $('quizSection').hidden=false;$('results').hidden=true;$('saveStatus').textContent='';$('save').disabled=false;
 const narrow=mode==='mock'?' / PAPER-WIDE MOCK PRACTICE':mode==='integrated'?' / INTEGRATED MULTI-TOPIC CASES':topics?' / '+topics.join(', '):' / MIXED TOPICS';
 $('quizTitle').textContent=mode==='mock'?'50-QUESTION MOCK PRACTICE':mode==='integrated'?'INTEGRATED CASE PRACTICE':'TOPIC PRACTICE SET';
 $('quizSummary').textContent=paper+narrow+' · '+active.available+' original questions · '+active.actualMix.mcq+' MCQ / '+active.actualMix.numeric+' numerical · '+active.topicsCovered+' syllabus topics / '+active.integratedCases+' integrated cases / '+active.familiesCovered+' reasoning families · '+(active.difficulty||'mixed').toUpperCase()+' difficulty · '+active.levelMix.easy+' easy / '+active.levelMix.moderate+' moderate / '+active.levelMix.hard+' hard'+(!active.complete?' · LIMITED: '+active.available+' of '+active.requested+' requested; no invented fillers.':'')+' · '+(active.repeatFamilyExposure?'REPEATED REASONING: '+active.repeatFamilyExposure+' family reuse(s) from recent sessions · ':'')+'Not official ACCA/Kaplan.';
 const notices=[];
 if(active.supplementedQuestions)notices.push(active.supplementedQuestions+' questions drawn from other syllabus topics to fulfil all '+active.requested+' requested questions');
 if(active.difficultyBackfill)notices.push(active.difficultyBackfill+' other-level questions added because too few distinct '+difficulty+' questions were authored');
 if(active.mixAdjusted)notices.push('MCQ/numerical split adjusted to preserve question count and distinct reasoning');
 if(active.integratedCases)notices.push(active.integratedCases+' integrated cross-topic cases; not certified ACCA outcome coverage');
 if(active.repeatFamilyExposure)notices.push('REASONING REUSE WARNING: '+active.repeatFamilyExposure+' families were seen in earlier sessions');
 setMessage(notices.length?notices.join(' · '):'Complete '+active.requested+'-question session built from '+active.familiesCovered+' distinct question families.');
 $('review').hidden=false;
 renderCoverage();
 renderQuestions();$('quizSection').scrollIntoView({block:'start',behavior:'smooth'});
}
function answerLabel(q,value){
 if(value===undefined||value===null||value==='')return 'Not answered';
 if(q.type==='numeric')return String(value)+' '+(q.unit||'');
 return q.choices.find(o=>o.value===value)?.label||'Not answered';
}
function renderCoverage(){
 const box=$('chapterCoverage');box.replaceChildren();
 const coverage=active.skillCoverage||{tested:0,available:0,uncovered:[]};
 box.append(element('h3',null,'CURRENT QUESTION BANK · '+coverage.tested+' / '+coverage.available+' DISTINCT SKILLS TESTED'));
 box.append(element('p',null,'This is question-bank skill coverage, not certification that every syllabus learning outcome has been tested.'));
 if(active.integratedCases){
  box.append(element('p',null,active.integratedCases+' integrated questions connect '+active.integratedTopicLinks+' distinct syllabus topics. Linked topics are not official learning-outcome mastery claims.'));
  const distribution=Object.entries(active.topicDistribution||{}).sort((a,b)=>b[1]-a[1]);
  box.append(element('p',null,'Topic appearances (cross-topic cases count toward each linked topic): '+distribution.slice(0,24).map(([key,n])=>key+' × '+n).join(' · ')+(distribution.length>24?' · …':'')));
 }
 if(coverage.uncovered.length){
  const missing=coverage.uncovered.slice(0,12).map(x=>x.label).join(' · ');
  box.append(element('p',null,'Not selected from available skills: '+missing+(coverage.uncovered.length>12?' …':'')+'.'));
 }
 const outcomes=active.outcomeCoverage||[];
 if(!outcomes.length){
  box.append(element('p',null,'Detailed outcome-to-question mapping is not yet available for this selection. Complete chapter coverage CANNOT be claimed.'));
 }else{
  for(const o of outcomes){
   box.append(element('h4',null,o.key+' · '+o.tested+' / '+o.total+' documented outcomes tested'));
   box.append(element('p',null,o.edition+' · Partial editorial mapping; not independent examination certification.'));
   if(o.untested.length)box.append(element('p',null,
     'Untested or not yet linked: '+o.untested.slice(0,20).map(x=>x.code+'. '+x.title).join('; ')+(o.untested.length>20?'; …':'')));
  }
 }
}
function answered(q){
 const value=answers[q.id];
 return q.type==='numeric'?engine.parseNumber(value)!==null:value!==undefined&&value!=='';
}
function showQuestion(index){
 if(!active?.questions?.length)return;
 cursor=Math.max(0,Math.min(active.questions.length-1,index));
 active.questions.forEach((q,i)=>{const card=$('practice-'+i);if(card)card.hidden=i!==cursor;});
 const nav=$('questionNavigator');nav.replaceChildren();
 active.questions.forEach((q,i)=>{
  const button=element('button','question-jump',String(i+1));button.type='button';
  button.classList.toggle('answered',answered(q));
  button.classList.toggle('flagged',flagged.has(i));
  button.classList.toggle('current',i===cursor);
  if(phase==='review'){
   const value=answers[q.id];
   const correct=answered(q)&&(q.type==='numeric'?
      engine.isNumericCorrect(value,q.correctValue):value===q.correctValue);
   button.classList.add(correct?'marked-correct':'marked-wrong');
  }
  button.setAttribute('aria-label','Question '+(i+1)+(answered(q)?', answered':', unanswered')+(flagged.has(i)?', flagged':''));
  if(i===cursor)button.setAttribute('aria-current','step');
  button.addEventListener('click',()=>showQuestion(i));nav.append(button);
 });
 $('previousQuestion').disabled=cursor===0;
 $('nextQuestion').disabled=cursor===active.questions.length-1;
 $('flagQuestion').setAttribute('aria-pressed',String(flagged.has(cursor)));
 $('flagQuestion').textContent=flagged.has(cursor)?'REMOVE FLAG':'FLAG FOR REVIEW';
 $('questionState').textContent='Question '+(cursor+1)+' of '+active.questions.length+
  ' · '+active.questions[cursor].difficulty.toUpperCase()+' · '+(active.questions[cursor].skillLabel||'Original question')+
  ' · '+active.questions.filter(answered).length+' answered'+
  (phase==='review'?' · MARKED':'');
}
function renderQuestions(){
 const list=$('questions');list.replaceChildren();
 active.questions.forEach((q,i)=>{
  const card=element('article','question');card.id='practice-'+i;
  const type=q.type==='mcq'?'MULTIPLE CHOICE':'NUMERICAL ENTRY';
  const linked=q.topicKeys?.length?q.topicKeys:[q.key];
  card.append(element('div','meta',String(i+1).padStart(2,'0')+' / '+linked.join(' + ')+' / '+type+' / '+(q.difficulty||'unrated').toUpperCase()+' / '+(q.skillLabel||'Original question')));
  if(q.integrated)card.append(element('p','integrated-case-label','INTEGRATED CASE · '+linked.map(x=>{const t=getTopics(active.paper).find(y=>x.endsWith(':'+y.code));return t?x+' · '+t.title:x;}).join(' / ')));
  card.append(element('h3',null,q.prompt));
  if(q.type==='mcq'){
    const choices=element('div','choices');
    q.choices.forEach((choice,index)=>{
      const label=element('label','choice'),input=element('input');
      input.type='radio';input.name='quiz-'+i;input.value=String(index);
      input.addEventListener('change',()=>{answers[q.id]=choice.value;showQuestion(cursor);});
      label.append(input,element('span',null,choice.label));choices.append(label);
    });
    card.append(choices);
  }else if(q.type==='numeric'){
    const field=element('label','numeric-label','YOUR ANSWER ('+(q.unit||'$')+')');
    const input=element('input','numeric-answer');
    input.type='text';input.inputMode='decimal';input.autocomplete='off';
    input.placeholder='Enter a number, e.g. 2500 or 2,500';
    input.setAttribute('aria-label','Numerical answer for question '+(i+1));
    input.addEventListener('input',()=>{answers[q.id]=input.value;showQuestion(cursor);});
    field.append(input);card.append(field);
  }
  const box=element('div','feedback');box.hidden=true;card.append(box);list.append(card);
 });
 showQuestion(0);
}
function reviewQuiz(){
 if(phase!=='answering')return;
 const countAnswered=active.questions.filter(answered).length;
 const unansweredCount=active.questions.length-countAnswered;
 if(unansweredCount>0&&!root.confirm('Submit with '+unansweredCount+' unanswered question(s)? Unanswered questions will be marked incorrect.'))return;
 phase='review';$('review').hidden=true;
 active.questions.forEach((q,i)=>{
  const card=$('practice-'+i),box=card.querySelector('.feedback'),answer=answers[q.id];
  card.querySelectorAll('input').forEach(el=>el.disabled=true);
  box.replaceChildren();box.hidden=false;
  const correct=q.type==='numeric'?engine.isNumericCorrect(answer,q.correctValue):answer===q.correctValue;
  box.classList.toggle('good',correct);box.classList.toggle('bad',!correct);
  box.append(element('h4',null,correct?'CORRECT ANSWER':'ANSWER REVIEW'));
  const expected=q.type==='numeric'?answerLabel(q,q.correctValue):answerLabel(q,q.correctValue);
  box.append(element('p',null,'Your answer: '+answerLabel(q,answer)+'\nExpected answer: '+expected+'\n\n'+q.explanation));
 });
 $('results').hidden=false;updateResult();showQuestion(0);$('results').scrollIntoView({block:'start',behavior:'smooth'});
}
function updateResult(){
 const s=engine.score(active.questions,answers),remaining=s.total-s.marked;
 $('score').replaceChildren();
 $('score').append(element('strong',null,s.correct+' / '+s.total));
 $('score').append(element('p',null,s.percent+'% of '+s.total+' questions correct · '+s.automatic+' attempted answers marked'+(remaining?' · '+remaining+' unanswered counted incorrect':'')));
 $('save').disabled=saved;
}
function saveQuiz(){
 if(!active||phase!=='review'||saved)return;
 const outcome=engine.score(active.questions,answers);
 const record={id:new Date().toISOString()+'-'+Math.floor(Math.random()*100000),at:new Date().toISOString(),
   paper:active.paper,topic:active.selectedTopic,mode:active.mode,correct:outcome.correct,total:outcome.total,percent:outcome.percent,
   automatic:outcome.automatic,selfMarked:outcome.selfMarked,unanswered:outcome.total-outcome.marked,
    difficulty:active.difficulty,levelMix:active.levelMix,
    skillCoverage:{tested:active.skillCoverage.tested,available:active.skillCoverage.available},
    flagged:[...flagged].sort((a,b)=>a-b),
    items:outcome.items.map((item,i)=>({...item,group:active.questions[i].group,
      difficulty:active.questions[i].difficulty,outcomeCodes:active.questions[i].outcomeCodes||[],
      topicKeys:active.questions[i].topicKeys||[active.questions[i].key],integrated:Boolean(active.questions[i].integrated)})),
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
   left.append(element('b',null,r.paper+' / '+(r.mode==='mock'?'50-QUESTION MOCK':r.mode==='integrated'?'INTEGRATED MIX':r.topic==='all'?'MIXED TOPICS':r.topic||'MIXED')));
   left.append(element('small',null,new Date(r.at).toLocaleString('en-MY')+' · '+r.automatic+' attempted answers graded'+(r.difficulty?' · '+r.difficulty+' level':'')));
   row.append(left,element('b',null,r.correct+' / '+r.total));wrap.append(row);
 }
 list.append(wrap);
}
async function init(){
 try{
  if(!engine||papers.length!==25||!root.PersonalHubAuth||!Object.keys(syllabi).length)throw Error('The syllabus or quiz engine could not load.');
  if(!await root.PersonalHubAuth.ready()){if(!root.PersonalHubAuth.isRedirectingToProfile?.())root.location.replace('index.html');return;}
  fillPapers();fillTopics();renderHistory();
  setMode(['mock','integrated'].includes(params.get('mode'))?params.get('mode'):'topic');
  $('topicMode').addEventListener('click',()=>setMode('topic'));
  $('mockMode').addEventListener('click',()=>setMode('mock'));
  $('integratedMode').addEventListener('click',()=>setMode('integrated'));
  $('count').addEventListener('change',()=>setMode(mode));
  $('previousQuestion').addEventListener('click',()=>showQuestion(cursor-1));
  $('nextQuestion').addEventListener('click',()=>showQuestion(cursor+1));
  $('flagQuestion').addEventListener('click',()=>{
    if(flagged.has(cursor))flagged.delete(cursor);else flagged.add(cursor);
    showQuestion(cursor);
  });
  $('paper').addEventListener('change',()=>{fillTopics();setMode(mode);});
  $('topic').addEventListener('change',()=>{updateReadLink();setMode(mode);});
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