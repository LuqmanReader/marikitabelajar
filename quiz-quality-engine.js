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
const MAX_VARIANTS_PER_SKILL=1; // Do not repeat a reasoning family in the same sitting.
const LEVELS=['easy','moderate','hard'];
const LEVEL_RANK={easy:0,moderate:1,hard:2};
/* Estimated practice difficulty; not externally calibrated or ACCA-certified. */
function estimateLevel(q){
 if(LEVELS.includes(q.difficulty))return q.difficulty;
 const family=String(q.group||'').replace(/^skill-/,'');
 if(/multi|reconciliation-combined|after-disposal|allowance-adjustment|writeoff-net|cash-budget-lagged|accrual-and-prepayment|contribution-absorption|variance|investment-risk/.test(family))return 'hard';
 if(q.type==='numeric'){
  if(/accounting-equation|basic-wage|trial-balance|simple-interest|contribution-unit|overhead-rate|gross-profit/.test(family))return 'easy';
  return q.prompt.length>=205?'hard':'moderate';
 }
 if(/accounting-equation|basic-wage|trial-balance/.test(family))return 'easy';
 if(q.prompt.length>=210)return 'hard';
 return q.prompt.length>=110?'moderate':'easy';
}
function skillLabel(q){
 if(String(q.group||'').startsWith('skill-'))
  return q.group.slice(6).replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
 return 'Applied knowledge · '+String(q.group||'').replace(/[^0-9]+/g,'').slice(0,3);
}
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
   correctValue:'C'+ordered.indexOf(correct),explanation:p.explanation,difficulty:p.difficulty};
}
function calculatedNumeric(key,p){
 if(!p||!Number.isFinite(p.answer))return null;
 return {key,type:'numeric',group:'skill-'+p.family,prompt:p.prompt,
   correctValue:p.answer,unit:p.unit||String.fromCharCode(36),explanation:p.explanation,difficulty:p.difficulty};
}
function valid(q){
 return q&&typeof q.prompt==='string'&&q.prompt.trim().length>=17&&
  typeof q.explanation==='string'&&q.explanation.trim().length>=12&&
  (q.type==='numeric'?Number.isFinite(q.correctValue):
   q.type==='mcq'&&Array.isArray(q.choices)&&q.choices.length===4&&
   new Set(q.choices.map(o=>String(o.label).trim())).size===4&&
   q.choices.filter(o=>o.value===q.correctValue).length===1);
}
function generate({paper,topics,count=20,mode='topic',difficulty='mixed',order='progressive',recentIds=[],recentGroups=[],lessons={},syllabus={},rng=Math.random}){
 const mock=mode==='mock',qty=mock?50:Math.max(1,Math.min(20,Math.floor(Number(count)||20)));
 const selectedDifficulty=mock?'mixed':LEVELS.includes(difficulty)?difficulty:'mixed';
 const questionOrder=order==='random'?'random':'progressive';
 const mixed=paper==='FA2'||paper==='MA2';
 const required={mcq:qty-(mixed?(mock?15:Math.floor(qty/2)):0),numeric:mixed?(mock?15:Math.floor(qty/2)):0};
 const result={questions:[],available:0,requested:qty,paper,mode:mock?'mock':'topic',topicsCovered:0,
    targetMix:required,actualMix:{mcq:0,numeric:0},complete:false,quality:'original-exam-style',
    difficulty:selectedDifficulty,order:questionOrder,
    levelMix:{easy:0,moderate:0,hard:0},availableLevelMix:{easy:0,moderate:0,hard:0},
    skillCoverage:{tested:0,available:0,uncovered:[],type:'authored question families, not verified syllabus outcomes'},
    syllabusCoverageVerified:false,
    outcomeCoverage:[],
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
   q.difficulty=estimateLevel(q);
   q.skillLabel=skillLabel(q);
   const authoredMap=root.LedgerQuizOutcomeMap?.[key]||{};
   const documented=root.LedgerOutcomeLessons?.[key]?.outcomes||{};
   q.outcomeCodes=(authoredMap[q.group]||[]).filter(code=>Boolean(documented[code]));
   pool.push(q);
  }
  for(let i=0;i<24;i++){
   const c=bank.concept(key,rng,i);
   if(!c)break;
   push({...c,key,type:'mcq',group:'concept-'+i});
  }
  for(let i=0;i<90;i++){
   const scenario=bank.problem(key,rng,i);
   if(!scenario)continue;
   // For intermediate papers, expose the same kind of scenario in either
   // numerical-entry or MCQ format, but never repeat its exact stem in a set.
   const numeric=mixed&&i%2===0;
   push(numeric?calculatedNumeric(key,scenario):calculatedMCQ(key,scenario,rng));
  }
 }
 const eligible=pool.filter(q=>selectedDifficulty==='mixed'||q.difficulty===selectedDifficulty);
 const availableAreas=new Map();
 for(const q of eligible){const area=q.key+'|'+q.group;if(!availableAreas.has(area))availableAreas.set(area,q.skillLabel);}
 for(const q of eligible)result.availableLevelMix[q.difficulty]++;
 const used=new Map(),prompts=new Set(),picked=[],rngScores=new Map();
 const targetLevels={easy:Math.round(qty*.3),moderate:Math.round(qty*.4),hard:0};
 targetLevels.hard=qty-targetLevels.easy-targetLevels.moderate;
 const levelsUsed={easy:0,moderate:0,hard:0};
 const assessedOutcomes=new Set();
 const familyKey=q=>q.key+'|'+q.group;
 const familyExposure=q=>exposure.get(familyKey(q))||0;
 function count(key,group){return used.get(key+'|'+group)||0}
 function take(type,n){
  for(let j=0;j<n;j++){
   let best=null,bestScore=Infinity;
   for(const q of eligible){
    if(q.type!==type||prompts.has(q.prompt)||count(q.key,q.group)>=MAX_VARIANTS_PER_SKILL)continue;
    let priorTopic=0;
    for(const p of picked)if(p.key===q.key)priorTopic++;
    const overLevel=selectedDifficulty==='mixed'&&levelsUsed[q.difficulty]>=targetLevels[q.difficulty]?25:0;
    const mappedChapter=Boolean(root.LedgerQuizOutcomeMap?.[q.key]);
    const freshOutcome=(q.outcomeCodes||[]).some(code=>!assessedOutcomes.has(q.key+'|'+code));
    const outcomePenalty=mappedChapter?(freshOutcome?-30:q.outcomeCodes?.length?8:12):0;
    const score=priorTopic*9+count(q.key,q.group)*110+
      familyExposure(q)*70+(recent.has(q.id)?120:0)+overLevel+outcomePenalty+(rngScores.get(q.id)??rng());
    rngScores.set(q.id,score%1);
    if(score<bestScore){bestScore=score;best=q;}
   }
   if(!best)break;
   picked.push(best);prompts.add(best.prompt);levelsUsed[best.difficulty]++;
   for(const code of best.outcomeCodes||[])assessedOutcomes.add(best.key+'|'+code);
   const id=best.key+'|'+best.group;
   used.set(id,(used.get(id)||0)+1);
  }
 }
 take('mcq',required.mcq);take('numeric',required.numeric);
 const questions=questionOrder==='progressive'&&!mock?
   [...picked].sort((a,b)=>LEVEL_RANK[a.difficulty]-LEVEL_RANK[b.difficulty]):shuffle(picked,rng);
 result.questions=questions;result.available=questions.length;
 result.actualMix={mcq:questions.filter(q=>q.type==='mcq').length,numeric:questions.filter(q=>q.type==='numeric').length};
 result.topicsCovered=new Set(questions.map(q=>q.key)).size;
 result.familiesCovered=new Set(questions.map(familyKey)).size;
 result.repeatFamilyExposure=questions.filter(q=>familyExposure(q)>0).length;
 result.freshFamilies=questions.length-result.repeatFamilyExposure;
 result.repeatedFamilies=[...new Set(questions.filter(q=>familyExposure(q)>0).map(q=>q.key+'|'+q.group))];
 result.diversityAudited=Boolean(root.LedgerQuizDiversityBank);
 for(const q of questions)result.levelMix[q.difficulty]++;
 const tested=new Set(questions.map(familyKey));
 result.skillCoverage={tested:tested.size,available:availableAreas.size,
   uncovered:[...availableAreas].filter(([key])=>!tested.has(key)).map(([key,label])=>({key,label})),
   type:'authored question families, not verified syllabus outcomes'};
 result.outcomeCoverage=keys.filter(key=>root.LedgerOutcomeLessons?.[key]?.outcomes).map(key=>{
   const documented=root.LedgerOutcomeLessons[key].outcomes;
   const testedCodes=new Set(questions.filter(q=>q.key===key).flatMap(q=>q.outcomeCodes||[]));
   const entries=Object.entries(documented);
   return {key,total:entries.length,tested:entries.filter(([code])=>testedCodes.has(code)).length,
    untested:entries.filter(([code])=>!testedCodes.has(code)).map(([code,o])=>({
       code,title:o.title,level:o.level
    })),edition:root.LedgerOutcomeLessons[key].edition||'Not independently verified',
    mappedBy:'partial manual editorial question-family mapping'};
 });
 result.complete=questions.length===qty&&result.actualMix.mcq===required.mcq&&result.actualMix.numeric===required.numeric;
 if(result.complete)result.reason='';
 else if(selectedDifficulty!=='mixed')result.reason='Insufficient distinct '+selectedDifficulty+' questions in this chapter; no filler has been invented.';
 return result;
}
engine.generate=generate;
engine.SUPPORTED_EXAM_PAPERS=['FA1','MA1','FA2','MA2'];
engine.MAX_VARIANTS_PER_SKILL=MAX_VARIANTS_PER_SKILL;
})(typeof window!=='undefined'?window:globalThis);
