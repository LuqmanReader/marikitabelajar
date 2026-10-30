/* Quiz Centre quality gate.
 * Only original authored ACCA-style knowledge checks and calculation scenarios.
 * Remove lesson-text clozes and "which paragraph belongs" filler.
 * Not a Kaplan publication or a certified ACCA mock.
 */
(function(root){
'use strict';
const engine=root.LedgerQuizEngine;
const bank=root.LedgerExamScenarios;
if(!engine||!bank)return;
const allowedPapers=new Set(['FA1','MA1','FA2','MA2']);
const MAX_VARIANTS_PER_SKILL=1; // One reasoning family per sitting, even with changed numbers.
const number=x=>Number(x).toLocaleString('en-GB',{maximumFractionDigits:2});
const shuffle=(input,rng)=>{
 const a=input.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
};
function hashId(key,q){
 const content=key+'|'+q.type+'|'+q.prompt;
 let h=2166136261;
 for(let i=0;i<content.length;i++)h=Math.imul(h^content.charCodeAt(i),16777619)>>>0;
 return key+':original:'+h.toString(36);
}
function calculatedMCQ(key,p,rng){
 const correct=Number(p.answer);
 const delta=Math.max(.01,Math.round(Math.max(1,Math.abs(correct))*.08*100)/100);
 const values=[correct];
 for(const candidate of shuffle([
  correct+delta,correct-delta,correct+2*delta,correct-2*delta,
  correct+1,correct-1,correct+10,correct-10
 ],rng)){
  const rounded=Math.round((candidate+Number.EPSILON)*100)/100;
  if(Number.isFinite(rounded)&&!values.includes(rounded))values.push(rounded);
  if(values.length===4)break;
 }
 if(values.length!==4)return null;
 const unit=p.unit||'$';
 const fmt=n=>unit==='units'?number(n)+' units':
    unit==='%'?number(n)+'%':
    unit==='years'?number(n)+' years':
    unit==='$'?'$'+number(n):
    unit.startsWith('$/')?'$'+number(n)+' '+unit.slice(2):number(n)+' '+unit;
 const ordered=shuffle(values,rng);
 return {key,type:'mcq',group:'skill-'+p.family,prompt:p.prompt,
   choices:ordered.map((x,i)=>({value:'C'+i,label:fmt(x)})),
   correctValue:'C'+ordered.indexOf(correct),explanation:p.explanation};
}
function calculatedNumeric(key,p){
 if(!p||!Number.isFinite(p.answer))return null;
 return {key,type:'numeric',group:'skill-'+p.family,prompt:p.prompt,
  correctValue:p.answer,unit:p.unit||'$',explanation:p.explanation};
}
function valid(q){
 return q&&typeof q.prompt==='string'&&q.prompt.trim().length>=17&&
  typeof q.explanation==='string'&&q.explanation.trim().length>=12&&
  (q.type==='numeric'?Number.isFinite(q.correctValue):
   q.type==='mcq'&&Array.isArray(q.choices)&&q.choices.length===4&&
   new Set(q.choices.map(o=>String(o.label).trim())).size===4&&
   q.choices.filter(o=>o.value===q.correctValue).length===1);
}
function generate({paper,topics,count=20,mode='topic',recentIds=[],recentGroups=[],lessons={},syllabus={},rng=Math.random}){
 const mock=mode==='mock',qty=mock?50:Math.max(1,Math.min(20,Math.floor(Number(count)||20)));
 const mixed=paper==='FA2'||paper==='MA2';
 const required={mcq:qty-(mixed?(mock?15:Math.floor(qty/2)):0),numeric:mixed?(mock?15:Math.floor(qty/2)):0};
 const result={questions:[],available:0,requested:qty,paper,mode:mock?'mock':'topic',topicsCovered:0,
    targetMix:required,actualMix:{mcq:0,numeric:0},complete:false,quality:'original-exam-style',
    reason:'Not enough distinct authored questions; fillers have been disabled.'};
 if(!allowedPapers.has(paper)){
   result.reason='This paper needs an independently authored question bank and its correct official exam format.';
   return result;
 }
 const headings=syllabus[paper]?.topics||[];
 const available=new Set(headings.map(x=>engine.topicCode(x)?.code).filter(Boolean));
 const wanted=mock||!topics?.length?[...available]:topics.filter(x=>available.has(x));
 const keys=shuffle([...new Set(wanted)].map(code=>paper+':'+code),rng);
 const recent=new Set(recentIds||[]),exposure=new Map();
 for(const g of recentGroups||[]){if(typeof g==='string')exposure.set(g,(exposure.get(g)||0)+1);}
 const pool=[];
 for(const key of keys){
  if(!lessons[key])continue;
  const seen=new Set();
  function push(q){
   if(!valid(q)||seen.has(q.type+'|'+q.prompt))return;
   seen.add(q.type+'|'+q.prompt);
   q.id=hashId(key,q);q.key=key;
   pool.push(q);
  }
  for(let i=0;i<24;i++){
   const c=bank.concept(key,rng,i);
   if(!c)break;
   push({...c,key,type:'mcq',group:'concept-'+i});
  }
  for(let i=0;i<70;i++){
   const scenario=bank.problem(key,rng,i);
   if(!scenario)break;
   // For intermediate papers, expose the same kind of scenario in either
   // numerical-entry or MCQ format, but never repeat its exact stem in a set.
   const numeric=mixed&&i%2===0;
   push(numeric?calculatedNumeric(key,scenario):calculatedMCQ(key,scenario,rng));
  }
 }
 const used=new Map(),prompts=new Set(),picked=[],rngScores=new Map();
 const familyKey=q=>q.key+'|'+q.group;
 const familyExposure=q=>exposure.get(familyKey(q))||0;
 function count(key,group){return used.get(key+'|'+group)||0}
 function take(type,n){
  for(let j=0;j<n;j++){
   let best=null,bestScore=Infinity;
   for(const q of pool){
    if(q.type!==type||prompts.has(q.prompt)||count(q.key,q.group)>=MAX_VARIANTS_PER_SKILL)continue;
    let priorTopic=0;
    for(const p of picked)if(p.key===q.key)priorTopic++;
    const score=priorTopic*9+count(q.key,q.group)*110+
      familyExposure(q)*70+(recent.has(q.id)?120:0)+(rngScores.get(q.id)??rng());
    rngScores.set(q.id,score%1);
    if(score<bestScore){bestScore=score;best=q;}
   }
   if(!best)break;
   picked.push(best);prompts.add(best.prompt);
   const id=best.key+'|'+best.group;
   used.set(id,(used.get(id)||0)+1);
  }
 }
 take('mcq',required.mcq);take('numeric',required.numeric);
 const questions=shuffle(picked,rng);
 result.questions=questions;result.available=questions.length;
 result.actualMix={mcq:questions.filter(q=>q.type==='mcq').length,numeric:questions.filter(q=>q.type==='numeric').length};
 result.topicsCovered=new Set(questions.map(q=>q.key)).size;
 result.familiesCovered=new Set(questions.map(familyKey)).size;
 result.repeatFamilyExposure=questions.filter(q=>familyExposure(q)>0).length;
 result.complete=questions.length===qty&&result.actualMix.mcq===required.mcq&&result.actualMix.numeric===required.numeric;
 if(result.complete)result.reason='';
 return result;
}
engine.generate=generate;
engine.SUPPORTED_EXAM_PAPERS=['FA1','MA1','FA2','MA2'];
engine.MAX_VARIANTS_PER_SKILL=MAX_VARIANTS_PER_SKILL;
})(typeof window!=='undefined'?window:globalThis);
