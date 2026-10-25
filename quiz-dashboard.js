(function(root){
'use strict';
const key='ledgerpeer_topic_quiz_history_v1';
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function start(){
 const host=document.getElementById('lpQuizOverview');if(!host)return;
 let history=[];
 try{const parsed=JSON.parse(root.localStorage.getItem(key)||'[]');if(Array.isArray(parsed))history=parsed;}catch(e){}
 host.replaceChildren();
 if(!history.length){
  host.append(el('p','No topic quiz results saved yet. Generate your first practice set and review your weak areas here.'));
  const a=el('a','START A TOPIC QUIZ →','site-back');a.href='quiz.html';host.append(a);
  return;
 }
 const valid=history.filter(r=>Array.isArray(r.items)&&r.items.length),topicTotals=new Map();
 let questions=0,correct=0,self=0;
 for(const session of valid){
  for(const item of session.items){
   if(!item.attempted)continue;
   questions++;if(item.correct)correct++;if(item.type==='recall')self++;
   const stat=topicTotals.get(item.key)||{correct:0,attempts:0,wrong:0};
   stat.attempts++;if(item.correct)stat.correct++;else stat.wrong++;
   topicTotals.set(item.key,stat);
  }
 }
 const coverage=el('div',null,'lp-quiz-overview-metrics');
 for(const [value,label]of [[String(history.length),'SETS'],[String(questions),'ANSWERS REVIEWED'],[questions?Math.round(100*correct/questions)+'%':'—','PRACTICE ACCURACY']]){
   const item=el('div');item.append(el('strong',value),el('span',label));coverage.append(item);
 }
 host.append(coverage);
 host.append(el('p','Quiz accuracy now uses automatically graded MCQs and numerical answers. Older self-marked results may remain in your history. Practice results are separate from exam attempts.','lp-quiz-caveat'));
 const weak=[...topicTotals.entries()].filter(([,s])=>s.wrong>0).sort((a,b)=>a[1].correct/a[1].attempts-b[1].correct/b[1].attempts||b[1].wrong-a[1].wrong).slice(0,3);
 host.append(el('h3','YOUR RECENT REVISION TARGETS'));
 if(!weak.length)host.append(el('p','No incorrect responses in saved sessions yet.'));
 else{
  const group=el('div',null,'lp-quiz-targets');
  weak.forEach(([k,s])=>{
   const [paper,topic]=k.split(':'),a=el('a',paper+' / '+topic+' · '+s.correct+' / '+s.attempts+' correct ↗');a.href='quiz.html?paper='+encodeURIComponent(paper)+'&topic='+encodeURIComponent(topic);group.append(a);
  });
  host.append(group);
 }
 const all=el('a','OPEN PRACTICE GENERATOR →','site-back');all.href='quiz.html';host.append(all);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);