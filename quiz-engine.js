/* LedgerPeer topic practice engine. Original practice, not official ACCA questions.
   Every question is automatically marked as MCQ or numerical answer. */
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

  const TERMS=[
   ['asset','liability','equity','expense','revenue'],
   ['assets','liabilities','equity','expenses','revenue'],
   ['invoice','credit note','receipt','purchase order','goods received note'],
   ['cash book','bank statement','trial balance','general ledger','supplier statement'],
   ['fixed cost','variable cost','semi-variable cost','relevant cost','sunk cost'],
   ['variable','fixed','direct','indirect','semi-variable'],
   ['cost centre','profit centre','investment centre','revenue centre','service cost centre'],
   ['FIFO','weighted average','specific identification','reducing balance','straight-line'],
   ['gross profit','contribution','net profit','revenue','cost of sales'],
   ['prepayment','accrual','provision','deferred income','accrued income'],
   ['receivables','payables','inventory','expenses','drawings'],
   ['materials','labour','overheads','expenses','revenue'],
   ['operating','investing','financing','production','administration'],
   ['current','non-current','direct','indirect','deferred']
  ];
  function factSentences(lesson){
    if(!lesson)return [];
    const out=[];
    for(const field of ['summary','steps','formula','example','trap','answer']){
      const values=field==='steps'?(Array.isArray(lesson.steps)?lesson.steps:[]):[lesson[field]];
      for(const value of values)for(const sentence of String(value||'').replace(/\s+/g,' ').split(/(?<=[.!?])\s+(?=[A-Z])/)){
        const s=sentence.trim();if(s.length>=23&&s.length<350&&!out.includes(s))out.push(s);
      }
    }
    return out.slice(0,30);
  }
  function clozeQuestions(key,lesson,rng){
    const pool=[];
    for(const [fi,sentence] of factSentences(lesson).entries()){
      const positions=new Set();
      for(const terms of TERMS){
        for(const term of terms){
          const regex=new RegExp('\\b'+term+'\\b','i'),match=regex.exec(sentence);
          if(!match||positions.has(match.index))continue;
          const alternatives=terms.filter(t=>t.toLowerCase()!==term.toLowerCase()&&!new RegExp('\\b'+t+'\\b','i').test(sentence));
          if(alternatives.length<3)continue;
          positions.add(match.index);
          const options=shuffled([match[0],...shuffled(alternatives,rng).slice(0,3)],rng);
          const completed=sentence.slice(0,match.index)+'______'+sentence.slice(match.index+match[0].length);
          pool.push({id:key+':cloze:'+fi+':'+match.index,key,group:'fact-'+fi,
           type:'mcq',prompt:'Complete the accounting principle: '+completed,
           choices:options.map((label,i)=>({value:'C'+i,label})),
           correctValue:'C'+options.indexOf(match[0]),explanation:sentence});
        }
      }
    }
    return pool;
  }
  function matchedQuestions(key,lesson,allLessons,title,rng){
    const snippets=factSentences(lesson).filter(s=>s.length<=230),paper=key.split(':')[0];
    const others=Object.entries(allLessons).filter(([k])=>k.startsWith(paper+':')&&k!==key)
      .flatMap(([,v])=>factSentences(v).slice(0,3)).filter(s=>s.length<=230&&!snippets.includes(s));
    const output=[];
    const styles=[
      'Which accounting guidance is most relevant to the following focus within ',
      'A learner is reviewing the following aspect of ',
      'Which explanation best fits this aspect of '
    ];
    for(let i=0;i<snippets.length;i++){
      const wrong=shuffled([...new Set(others)],rng).slice(0,3);if(wrong.length<3)continue;
      const focus=snippets[i].replace(/[.;:].*$/,'').split(/\s+/).slice(0,6).join(' ').toLowerCase();
      for(let variant=0;variant<3;variant++){
        const options=shuffled([snippets[i],...shuffled(wrong,rng)],rng);
        const prompt=variant===0?styles[0]+title+'? Focus: '+focus+'.':
          variant===1?styles[1]+title+'. Focus: '+focus+'. Which statement is relevant?':
          styles[2]+title+'? Focus: '+focus+'.';
        output.push({id:key+':association:'+i+':'+variant,key,group:'fact-'+i,type:'mcq',
          prompt,choices:options.map((label,j)=>({value:'C'+j,label})),
          correctValue:'C'+options.indexOf(snippets[i]),explanation:'Relevant lesson statement: '+snippets[i]});
      }
    }
    return output;
  }
  function scenarioQuestion(key,scenario,rng,seq){
    if(!scenario||!Number.isFinite(scenario.answer))return null;
    const id=key+':calc:'+scenario.family+':'+seq;
    if(['FA2','MA2'].includes(key.split(':')[0]))
      return {id,key,group:'calc-'+scenario.family,type:'numeric',prompt:scenario.prompt,
        correctValue:scenario.answer,unit:scenario.unit||'RM',explanation:scenario.explanation};
    const value=scenario.answer,delta=Math.max(1,Math.round(Math.abs(value)*.08*100)/100);
    const choices=[value];
    for(const candidate of shuffled([value+delta,value-delta,value+2*delta,value-2*delta,value+1,value-1,value+10,value-10],rng)){
      const n=Math.round(candidate*100)/100;
      if(n>=0&&!choices.includes(n)){choices.push(n);if(choices.length===4)break;}
    }
    if(choices.length!==4)return null;
    const shuffledChoices=shuffled(choices,rng);
    const fmt=n=>(scenario.unit==='units'?n.toLocaleString('en-MY')+' units':
        scenario.unit==='%'?n.toLocaleString('en-MY')+'%':
        scenario.unit==='years'?n.toLocaleString('en-MY')+' years':
        scenario.unit&&scenario.unit.startsWith('RM/')?'RM'+n.toLocaleString('en-MY')+' '+scenario.unit.slice(2):
        'RM'+n.toLocaleString('en-MY'));
    return {id,key,group:'calc-'+scenario.family,type:'mcq',prompt:scenario.prompt,
      choices:shuffledChoices.map((n,i)=>({value:'C'+i,label:fmt(n)})),
      correctValue:'C'+shuffledChoices.indexOf(value),explanation:scenario.explanation};
  }
  function generate({paper,topics,count=5,mode='topic',recentIds=[],lessons={},syllabus={},rng=Math.random}){
    const headings=syllabus[paper]?.topics||[];
    const allowed=new Map(headings.map(x=>{const t=topicCode(x);return t?[t.code,t.title]:null}).filter(Boolean));
    const mock=mode==='mock',wanted=mock?new Set(allowed.keys()):
      Array.isArray(topics)&&topics.length?new Set(topics):new Set(allowed.keys());
    const keys=shuffled([...wanted].filter(k=>allowed.has(k)).map(k=>paper+':'+k),rng);
    const qty=mock?50:Math.max(1,Math.min(20,Math.floor(Number(count)||5)));
    const recent=new Set(Array.isArray(recentIds)?recentIds:[]);
    const pools=new Map();
    for(const key of keys){
      const lessonsForTopic=lessons[key],title=allowed.get(key.split(':')[1]);
      let pool=clozeQuestions(key,lessonsForTopic,rng)
        .concat(matchedQuestions(key,lessonsForTopic,lessons,title,rng));
      if(typeof root.LedgerExamScenarios?.concept==='function'){
        for(let i=0;i<12;i++){
          const item=root.LedgerExamScenarios.concept(key,rng,i);
          if(!item)break;
          pool.push({...item,id:key+':author:'+i,key,group:'author-'+i,type:'mcq'});
        }
      }
      const seen=new Set(pool.map(q=>q.prompt));
      for(let i=0;i<qty+10;i++){
        const scenario=typeof root.LedgerExamScenarios?.problem==='function'?
           root.LedgerExamScenarios.problem(key,rng,i):null;
        const q=scenarioQuestion(key,scenario,rng,i);
        if(q&&!seen.has(q.prompt)){pool.push(q);seen.add(q.prompt);}
      }
      pool=[...new Map(pool.map(q=>[q.prompt,q])).values()];
      if(pool.length)pools.set(key,shuffled(pool,rng));
    }
    const availableKeys=shuffled([...pools.keys()],rng);
    // FA1 and MA1 remain MCQ-only. FA2/MA2 use the exact requested mix:
    // topic (20 questions): 10 MCQ + 10 numerical; mock (50): 35 + 15.
    // For odd-sized quick drills, the extra question is MCQ.
    const mixed=['FA2','MA2'].includes(paper);
    const numericalTarget=mixed?(mock?15:Math.floor(qty/2)):0;
    const mcqTarget=qty-numericalTarget;
    const seenPrompts=new Set(),selected=[],usedGroups=new Map();
    function collect(type,target){
      const collected=[];
      while(collected.length<target){
        let madeProgress=false;
        for(const key of availableKeys){
          if(collected.length>=target)break;
          const pool=pools.get(key);
          if(!pool||!pool.length)continue;
          const groups=usedGroups.get(key)||new Set();
          let bestIndex=-1,bestScore=Infinity;
          for(let i=0;i<pool.length;i++){
            const question=pool[i];
            if(question.type!==type||seenPrompts.has(question.prompt))continue;
            const penalty=(groups.has(question.group)?5:0)+(recent.has(question.id)?12:0)+
              (question.group?.startsWith('author-')?-3:question.group?.startsWith('calc-')?-1:
                question.group?.startsWith('fact-')?2:0)+rng()/10;
            if(penalty<bestScore){bestScore=penalty;bestIndex=i;}
          }
          if(bestIndex<0)continue;
          const [question]=pool.splice(bestIndex,1);
          collected.push(question);seenPrompts.add(question.prompt);
          groups.add(question.group);usedGroups.set(key,groups);madeProgress=true;
        }
        if(!madeProgress)break;
      }
      return collected;
    }
    const mcqs=collect('mcq',mcqTarget);
    const numerical=collect('numeric',numericalTarget);
    selected.push(...mcqs,...numerical);
    const picked=shuffled(selected,rng);
    return {questions:picked,available:picked.length,requested:qty,
      topicsCovered:new Set(picked.map(q=>q.key)).size,paper,mode:mock?'mock':'topic',
      targetMix:{mcq:mcqTarget,numeric:numericalTarget},
      actualMix:{mcq:mcqs.length,numeric:numerical.length}};
  }
  function parseNumber(value){
    if(typeof value==='number')return Number.isFinite(value)?value:null;
    const s=String(value??'').trim().replace(/,/g,'').replace(/^\((.+)\)$/,'-$1').replace(/^([+-]?)\s*(?:RM|£|\$)\s*/i,'$1');
    if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;
    const n=Number(s);return Number.isFinite(n)?n:null;
  }
  function isNumericCorrect(value,expected){
    const n=parseNumber(value);return n!==null&&Number.isFinite(expected)&&Math.abs(n-expected)<0.005;
  }
  function score(questions,answers){
    let correct=0,marked=0,automatic=0;
    const items=questions.map(q=>{
      const answer=answers[q.id];
      const attempted=q.type==='numeric'?parseNumber(answer)!==null:answer!==undefined&&answer!=='';
      const passed=attempted&&(q.type==='numeric'?isNumericCorrect(answer,q.correctValue):answer===q.correctValue);
      if(attempted){marked++;automatic++;if(passed)correct++;}
      return {id:q.id,key:q.key,type:q.type,attempted,correct:attempted?passed:null};
    });
    return {correct,marked,total:questions.length,automatic,selfMarked:0,items,
      percent:questions.length?Math.round(100*correct/questions.length):0};
  }
  function readHistory(storage){
    try{const a=JSON.parse(storage.getItem(STUDY_KEY)||'[]');return Array.isArray(a)?a.slice(0,250):[];}catch(e){return [];}
  }
  function saveHistory(storage,record){
    const old=readHistory(storage);
    const next=[record,...old].slice(0,250);
    storage.setItem(STUDY_KEY,JSON.stringify(next));return next;
  }
  const api={generate,score,readHistory,saveHistory,topicCode,STUDY_KEY,parseNumber,isNumericCorrect};
  root.LedgerQuizEngine=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
