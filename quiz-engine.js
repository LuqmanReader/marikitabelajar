/* LedgerPeer topic practice engine. Original practice, not official ACCA questions.
   Works without paid AI or network requests; self-checks are explicitly self-marked. */
(function(root){
  'use strict';
  const STUDY_KEY='ledgerpeer_topic_quiz_history_v1';
  const randInt=(min,max,rng)=>min+Math.floor(rng()*(max-min+1));
  function shuffled(input,rng){
    const a=input.slice();
    for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function topicCode(item){const m=String(item||'').match(/^([A-Z]\d{1,2})\s*·\s*(.+)$/);return m?{code:m[1],title:m[2]}:null;}
  function optionProblem(key,rng,sequence){
    const id=key+':variation:'+sequence;
    const add=(prompt,answer,formula,offsets,unit='RM')=>{
      const alternatives=offsets.map(n=>answer+n).filter(n=>Number.isFinite(n)&&n>=0&&n!==answer);
      const distinct=[answer,...new Set(alternatives)].slice(0,4);
      if(distinct.length!==4) return null;
      const choices=shuffled(distinct,rng).map(n=>({value:n,label:unit==='units'?n.toLocaleString('en-MY')+' units':unit==='rate'?'RM'+n.toLocaleString('en-MY')+' per unit':'RM'+n.toLocaleString('en-MY')}));
      return {id,key,type:'mcq',prompt,choices,correctValue:answer,explanation:formula};
    };
    switch(key){
      case 'FA2:B1': {
        const equity=randInt(30,150,rng)*1000,liabilities=randInt(10,60,rng)*1000,assets=equity+liabilities;
        return add('A business has assets of RM'+assets.toLocaleString('en-MY')+' and liabilities of RM'+liabilities.toLocaleString('en-MY')+'. What is its equity?',equity,'Equity = assets − liabilities = RM'+equity.toLocaleString('en-MY')+'.',[liabilities,-5000,5000]);
      }
      case 'FA2:C2': {
        const opening=randInt(3,15,rng)*1000,sales=randInt(5,18,rng)*1000,receipts=randInt(1,Math.floor((opening+sales)/1000)-2,rng)*1000;
        const closing=opening+sales-receipts;
        return add('Trade receivables open at RM'+opening.toLocaleString('en-MY')+'. Credit sales are RM'+sales.toLocaleString('en-MY')+' and customer receipts RM'+receipts.toLocaleString('en-MY')+'. What is the closing debit balance?',closing,'Closing receivables = opening + credit sales − receipts = RM'+closing.toLocaleString('en-MY')+'.',[receipts,-1000,1000]);
      }
      case 'FA2:D1': {
        const rate=[5,8,10][randInt(0,2,rng)],net=randInt(20,150,rng)*100;
        const gross=net*(100+rate)/100,tax=gross-net;
        return add('An invoice totals RM'+gross.toLocaleString('en-MY')+' INCLUDING '+rate+'% sales tax. What is the amount before tax?',net,'Net amount = RM'+gross.toLocaleString('en-MY')+' ÷ '+(1+rate/100)+' = RM'+net.toLocaleString('en-MY')+'.',[tax,-100,100]);
      }
      case 'MA2:C1': {
        const units=randInt(2,12,rng)*1000,rate=randInt(4,24,rng),oh=units*rate;
        return add('Budgeted overhead is RM'+oh.toLocaleString('en-MY')+' for '+units.toLocaleString('en-MY')+' units. What is the overhead absorption rate per unit?',rate,'Overhead absorption rate = budgeted overhead ÷ budgeted activity = RM'+rate+' per unit.',[-3,3,5],'rate');
      }
      case 'MA2:C2': {
        const units=randInt(4,22,rng)*100,variable=randInt(5,22,rng),contribution=randInt(5,25,rng),selling=variable+contribution,total=units*contribution;
        return add('A product sells for RM'+selling+' and has variable cost of RM'+variable+' per unit. If '+units+' units are sold, what is the total contribution?',total,'Total contribution = units sold × (selling price − variable cost) = '+units+' × RM'+contribution+' = RM'+total.toLocaleString('en-MY')+'.',[-units,units,units*2]);
      }
      case 'MA2:D1': {
        const contribution=randInt(4,18,rng),units=randInt(5,35,rng)*100,variable=randInt(4,21,rng),selling=variable+contribution,fixed=contribution*units;
        return add('Fixed costs are RM'+fixed.toLocaleString('en-MY')+'. Selling price is RM'+selling+' and variable cost is RM'+variable+' per unit. How many units are required to break even?',units,'Break-even units = fixed costs ÷ contribution per unit = RM'+fixed.toLocaleString('en-MY')+' ÷ RM'+contribution+' = '+units.toLocaleString('en-MY')+' units.',[-100,100,200],'units');
      }
      default:return null;
    }
  }
  function recallQuestions(key,lesson,title){
    if(!lesson)return [];
    const q=[];
    if(lesson.check&&lesson.answer)q.push({id:key+':check',key,type:'recall',prompt:String(lesson.check),explanation:String(lesson.answer)});
    if(Array.isArray(lesson.steps)&&lesson.steps.length>=2)q.push({id:key+':principles',key,type:'recall',prompt:'Explain two important principles or steps involved in '+title+'.',explanation:lesson.steps.slice(0,2).join('\n\n')});
    if(lesson.trap)q.push({id:key+':trap',key,type:'recall',prompt:'What common exam mistake must a student avoid in '+title+'?',explanation:String(lesson.trap)});
    return q;
  }
  function generate({paper,topics,count=5,lessons={},syllabus={},rng=Math.random}){
    const official=syllabus[paper]?.topics||[];
    const allowed=new Map(official.map(x=>{const t=topicCode(x);return t?[t.code,t.title]:null}).filter(Boolean));
    const requested=Array.isArray(topics)&&topics.length?new Set(topics):new Set(allowed.keys());
    const keys=[...requested].filter(x=>allowed.has(x)).map(x=>paper+':'+x);
    const qty=Math.max(1,Math.min(20,Number(count)||5));
    let pool=[];
    for(const key of keys){
      const title=allowed.get(key.split(':')[1]);
      pool.push(...recallQuestions(key,lessons[key],title));
      // Parametric numerical questions have different input values each time.
      for(let k=0;k<qty;k++){const item=optionProblem(key,rng,k);if(item)pool.push(item);}
    }
    pool=shuffled(pool,rng);
    // Balance broad paper tests so one numerical template does not dominate.
    const picked=[],used=new Map();
    while(picked.length<qty&&pool.length){
      let index=pool.findIndex(q=>(used.get(q.key)||0)===Math.min(...keys.map(k=>used.get(k)||0)) );
      if(index<0)index=0;
      const [item]=pool.splice(index,1);picked.push(item);used.set(item.key,(used.get(item.key)||0)+1);
    }
    return {questions:picked,available:picked.length,requested:qty,topicsCovered:new Set(picked.map(q=>q.key)).size,paper};
  }
  function score(questions,answers){
    let correct=0,marked=0,automatic=0,selfMarked=0;
    const items=questions.map(q=>{
      const answer=answers[q.id];
      const isAuto=q.type==='mcq';
      const passed=isAuto?answer===q.correctValue:answer===true;
      const attempted=isAuto?answer!==undefined:(answer===true||answer===false);
      if(attempted){marked++;if(passed)correct++;if(isAuto)automatic++;else selfMarked++;}
      return {id:q.id,key:q.key,type:q.type,attempted,correct:attempted?passed:null};
    });
    return {correct,marked,total:questions.length,automatic,selfMarked,items,percent:marked?Math.round(100*correct/marked):0};
  }
  function readHistory(storage){
    try{const a=JSON.parse(storage.getItem(STUDY_KEY)||'[]');return Array.isArray(a)?a.slice(0,250):[];}catch(e){return [];}
  }
  function saveHistory(storage,record){
    const old=readHistory(storage);
    const next=[record,...old].slice(0,250);
    storage.setItem(STUDY_KEY,JSON.stringify(next));return next;
  }
  const api={generate,score,readHistory,saveHistory,topicCode,STUDY_KEY};
  root.LedgerQuizEngine=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
