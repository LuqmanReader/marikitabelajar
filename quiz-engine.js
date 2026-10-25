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
      const distinct=[answer];
      for(const candidate of [...alternatives,answer-1,answer+1,answer-2,answer+2,answer-10,answer+10]){
        if(candidate>=0&&Number.isFinite(candidate)&&!distinct.includes(candidate))distinct.push(candidate);
        if(distinct.length===4)break;
      }
      if(distinct.length!==4)return null;
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
  /* Each assessment is derived from an existing authored teaching fact. This is a
     *practice* generator, not an LLM and not a claim of 20 distinct exam outcomes. */
  function recallQuestions(key,lesson,title){
    if(!lesson)return [];
    const result=[];
    const add=(id,group,prompt,reference)=>{
      if(!prompt||!reference)return;
      result.push({id:key+':'+id,key,group,type:'recall',prompt:String(prompt),explanation:String(reference)});
    };
    const summary=String(lesson.summary||'').trim();
    const formula=String(lesson.formula||'').trim();
    const example=String(lesson.example||'').trim();
    const trap=String(lesson.trap||'').trim();
    const steps=Array.isArray(lesson.steps)?lesson.steps.map(s=>String(s||'').trim()).filter(Boolean):[];
    const background=summary+'\n\nWorked application: '+example;
    if(lesson.check&&lesson.answer)add('check','check',lesson.check,lesson.answer);
    if(summary){
      add('big-idea','overview','What is the central idea of '+title+'? Explain it without copying a definition.',summary);
      add('purpose','overview','Why does '+title+' matter when making accounting, financial or business decisions?',summary);
      add('relationship','overview','Explain how the key concepts in '+title+' fit together.',summary+'\n\nKey guidance: '+steps.join(' '));
      add('summary-explain','overview','Write a concise explanation of '+title+' suitable for teaching another learner.',summary);
    }
    steps.forEach((step,i)=>{
      const label='GUIDANCE: '+step;
      add('step-'+i+'-interpret','step-'+i,'In your own words, interpret this syllabus guidance and explain what it requires.\n'+label,step+'\n\nTopic context: '+summary);
      add('step-'+i+'-apply','step-'+i,'Give a practical example of how to apply this instruction.\n'+label,step+'\n\nReference application: '+example);
      add('step-'+i+'-verify','step-'+i,'How would you verify that a solution follows this instruction?\n'+label,step+'\n\nCross-check against: '+formula);
      add('step-'+i+'-pitfall','step-'+i,'What might a learner get wrong if they overlooked this instruction?\n'+label,step+'\n\nRelevant exam trap: '+trap);
      add('step-'+i+'-connect','step-'+i,'Connect this instruction to the broader topic: what does it help you understand?\n'+label,step+'\n\n'+summary);
    });
    if(formula){
      add('formula-recall','formula','State one important formula, framework or accounting rule used in '+title+'.',formula);
      add('formula-meaning','formula','Explain what the quantities or parts of the rule mean, and when it is useful in '+title+'.',formula+'\n\n'+summary);
      add('formula-check','formula','How would you check the reasonableness of a calculation or decision in '+title+'?',formula+'\n\n'+trap);
      add('formula-usage','formula','Describe the information you would need before applying the main rule in '+title+'.',formula+'\n\n'+example);
    }
    if(example){
      add('example-explain','example','Explain the reasoning behind the worked application of '+title+' in your notes.',example);
      add('example-work','example','Reconstruct the main workings or decision process used in an example of '+title+'.',example+'\n\nApplicable rule: '+formula);
      add('example-alternative','example','Invent a similar but different illustration of '+title+'. Compare it with the reference application.',background);
      add('example-judgement','example','What should be checked before accepting the conclusion of a worked example about '+title+'?',example+'\n\nExam caution: '+trap);
    }
    if(trap){
      add('trap-name','trap','Identify a common exam trap in '+title+' and give its correction.',trap);
      add('trap-prevent','trap','Describe a checking step that would prevent a common error in '+title+'.',trap+'\n\n'+steps.join(' '));
      add('trap-diagnose','trap','How could you spot a plausible but incorrect solution in '+title+'?',trap+'\n\n'+formula);
      add('trap-consequence','trap','Why does avoiding this exam trap matter when answering a question on '+title+'?',trap+'\n\n'+summary);
    }
    return result;
  }
  function generate({paper,topics,count=5,mode='topic',recentIds=[],lessons={},syllabus={},rng=Math.random}){
    const official=syllabus[paper]?.topics||[];
    const allowed=new Map(official.map(x=>{const t=topicCode(x);return t?[t.code,t.title]:null}).filter(Boolean));
    const mock=mode==='mock';
    const requested=mock?new Set(allowed.keys()):(Array.isArray(topics)&&topics.length?new Set(topics):new Set(allowed.keys()));
    const keys=shuffled([...requested].filter(x=>allowed.has(x)).map(x=>paper+':'+x),rng);
    const qty=mock?50:Math.max(1,Math.min(20,Math.trunc(Number(count)||5)));
    const recent=new Set(Array.isArray(recentIds)?recentIds:[]);
    const queues=new Map();
    for(const key of keys){
      const title=allowed.get(key.split(':')[1]);
      const pool=recallQuestions(key,lessons[key],title);
      const seen=new Set(pool.map(q=>q.prompt));
      for(let i=0;i<Math.min(12,qty);i++){
        const candidate=optionProblem(key,rng,i);
        if(candidate&&!seen.has(candidate.prompt)){
          candidate.group='numerical';
          pool.push(candidate);
          seen.add(candidate.prompt);
        }
      }
      if(pool.length)queues.set(key,shuffled(pool,rng));
    }
    const eligible=shuffled([...queues.keys()],rng);
    const selected=[],usedGroups=new Map(),numericCounts=new Map();
    // Round robin across syllabus headings for fair mock-exam coverage.
    while(selected.length<qty){
      let progress=false;
      for(const key of eligible){
        if(selected.length===qty)break;
        const pool=queues.get(key);
        if(!pool||!pool.length)continue;
        const counts=usedGroups.get(key)||new Map();
        const numericCap=mock?2:Math.max(2,Math.ceil(qty/(Math.max(1,eligible.length)*4)));
        let bestIndex=-1,bestCost=Infinity;
        for(let i=0;i<pool.length;i++){
          const q=pool[i],usage=counts.get(q.group)||0;
          const penalty=(recent.has(q.id)?8:0)+(usage>=2?6:usage*1.5)+
            (q.type==='mcq'&&(numericCounts.get(key)||0)>=numericCap?7:0)+rng();
          if(penalty<bestCost){bestCost=penalty;bestIndex=i;}
        }
        if(bestIndex<0)continue;
        const [q]=pool.splice(bestIndex,1);
        selected.push(q);progress=true;
        counts.set(q.group,(counts.get(q.group)||0)+1);usedGroups.set(key,counts);
        if(q.type==='mcq')numericCounts.set(key,(numericCounts.get(key)||0)+1);
      }
      if(!progress)break;
    }
    return {questions:selected,available:selected.length,requested:qty,
      topicsCovered:new Set(selected.map(q=>q.key)).size,paper,mode:mock?'mock':'topic'};
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
