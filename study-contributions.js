/* LedgerPeer Study Contributions · original calendar implementation.
   The uploaded green-squares-bot example generates Git commits; this module
   does not automate or invent study activity. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.LedgerPeerStudyContributions=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const pad=n=>String(n).padStart(2,'0');
 function key(date){return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());}
 function fromKey(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const [year,month,day]=value.split('-').map(Number);
  const parsed=new Date(year,month-1,day);
  return parsed.getFullYear()===year&&parsed.getMonth()===month-1&&parsed.getDate()===day?parsed:null;
 }
 function activityDate(value){
  if(typeof value!=='string'||!value.trim())return null;
  const bare=fromKey(value);
  if(bare)return key(bare);
  if(/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const parsed=new Date(value);
  return Number.isNaN(parsed.getTime())?null:key(parsed);
 }
 function addDays(day,n){return new Date(day.getFullYear(),day.getMonth(),day.getDate()+n,12);}
 function level(total){return total===0?0:total===1?1:total===2?2:total<=4?3:4;}
 function empty(){return {tasks:0,sessions:0,minutes:0,total:0,level:0};}
 function build(records={},now=new Date()){
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  const todayKey=key(today);
  const earliest=addDays(today,-364),start=addDays(earliest,-earliest.getDay());
  const end=addDays(today,6-today.getDay());
  const days=new Map();
  function entry(date){if(!days.has(date))days.set(date,empty());return days.get(date);}
  for(const task of Array.isArray(records.tasks)?records.tasks:[]){
   if(!task||!task.done)continue;
   const date=activityDate(task.completedAt);
   if(!date||date<key(earliest)||date>todayKey)continue;
   entry(date).tasks++;
  }
  for(const session of Array.isArray(records.sessions)?records.sessions:[]){
   if(!session)continue;
   const date=activityDate(session.date);
   const minutes=Number(session.minutes);
   if(!date||date<key(earliest)||date>todayKey||!Number.isFinite(minutes)||minutes<=0)continue;
   const active=entry(date);
   active.sessions++;active.minutes+=minutes;
  }
  let activeDays=0,totalTasks=0,totalSessions=0,totalMinutes=0;
  for(const record of days.values()){
   record.total=record.tasks+record.sessions;
   record.level=level(record.total);
   activeDays++;totalTasks+=record.tasks;totalSessions+=record.sessions;totalMinutes+=record.minutes;
  }
  const weeks=[],months=[];
  let priorMonth=-1;
  for(let startWeek=start;startWeek<=end;startWeek=addDays(startWeek,7)){
   const week=[];
   for(let offset=0;offset<7;offset++){
    const day=addDays(startWeek,offset),date=key(day);
    week.push({date,day,valid:date>=key(earliest)&&date<=todayKey,activity:days.get(date)||empty()});
    if(offset===0){
     const firstVisible=startWeek<earliest?earliest:startWeek;
     if(firstVisible<=today){
      const month=firstVisible.getMonth();
      if(month!==priorMonth){months.push({week:weeks.length+1,label:firstVisible.toLocaleDateString('en-MY',{month:'short'})});priorMonth=month;}
     }
    }
   }
   weeks.push(week);
  }
  function hasActivity(day){return (days.get(key(day))?.total||0)>0;}
  let cursor=hasActivity(today)?today:addDays(today,-1),currentStreak=0;
  while(cursor>=earliest&&hasActivity(cursor)){currentStreak++;cursor=addDays(cursor,-1);}
  let bestStreak=0,run=0;
  for(let date=earliest;date<=today;date=addDays(date,1)){
   run=hasActivity(date)?run+1:0;
   if(run>bestStreak)bestStreak=run;
  }
  return {weeks,months,days,activeDays,totalTasks,totalSessions,totalMinutes,currentStreak,bestStreak,todayKey,earliest:key(earliest)};
 }
 function plural(n,name){return n+' '+name+(n===1?'':'s');}
 function detail(date,activity){
  const day=fromKey(date),label=day?day.toLocaleDateString('en-MY',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):date;
  return label+' · '+plural(activity.tasks,'completed task')+' · '+plural(activity.sessions,'study session')+' · '+Math.round(activity.minutes)+' logged minutes';
 }
 function render(model){
  const labels=['','Mon','','Wed','','Fri',''];
  const contributions=model.totalTasks+model.totalSessions;
  let html='<section class="study-contrib-panel" aria-labelledby="contribTitle">';
  html+='<header class="study-contrib-heading"><h2 id="contribTitle">'+contributions.toLocaleString('en-MY')+' study contributions in the last year</h2></header>';
  html+='<div class="study-contrib-scroll" tabindex="0" role="region" aria-label="Study contribution calendar, scroll horizontally to see all months"><div class="study-contrib-calendar" style="--weeks:'+model.weeks.length+'">';
  html+='<div class="study-contrib-months">';
  for(const month of model.months)html+='<span style="grid-column:'+month.week+'">'+month.label+'</span>';
  html+='</div><div class="study-contrib-body"><div class="study-contrib-weekdays" aria-hidden="true">';
  for(const label of labels)html+='<span>'+label+'</span>';
  html+='</div><div class="study-contrib-squares">';
  for(const week of model.weeks){
   for(const cell of week){
    if(!cell.valid){html+='<span class="study-contrib-placeholder" aria-hidden="true"></span>';continue;}
    const activity=cell.activity,description=detail(cell.date,activity);
    html+='<button type="button" class="study-contrib-square level-'+activity.level+'" data-date="'+cell.date+'" title="'+description+'" aria-label="'+description+'" aria-pressed="false"></button>';
   }
  }
  html+='</div></div></div></div>';
  html+='<footer class="study-contrib-footer"><details class="study-contrib-method"><summary>Learn how we count contributions</summary><p>1 contribution = 1 completed study task or 1 logged study session. Tasks only count when marked complete, not on their planned dates. Activity is stored in this browser and follows your device timezone. No automatic or simulated activity.</p></details><div class="study-contrib-legend" aria-label="Activity levels from no activity to five or more contributions"><span>Less</span><i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i><span>More</span></div></footer>';
  html+='<p class="study-contrib-detail" id="contribDetail" role="status"></p>';
  html+='<p class="study-contrib-meta">Current streak: <strong>'+model.currentStreak+' days</strong><span aria-hidden="true"> · </span>Best streak: <strong>'+model.bestStreak+' days</strong><span aria-hidden="true"> · </span>Minutes logged: <strong>'+model.totalMinutes.toLocaleString('en-MY')+'</strong></p>';
  if(!model.activeDays)html+='<p class="study-contrib-empty">Complete a study task or log a session to earn your first green square.</p>';
  return html+'</section>';
 }
 function mount(container,model){
  if(!container)return;
  const scroller=container.querySelector('.study-contrib-scroll');
  if(scroller)scroller.scrollLeft=scroller.scrollWidth;
  const detailBox=container.querySelector('#contribDetail');
  const cells=container.querySelectorAll('.study-contrib-square');
  const selectDate=(button)=>{
   for(const cell of cells)cell.setAttribute('aria-pressed',String(cell===button));
   const date=button.getAttribute('data-date');
   detailBox.textContent=detail(date,model.days.get(date)||empty());
  };
  container.addEventListener('click',event=>{
   const button=event.target.closest('.study-contrib-square');
   if(button&&container.contains(button))selectDate(button);
  });
  const today=container.querySelector('[data-date="'+model.todayKey+'"]');
  if(today)selectDate(today);
 }
 return {activityDate,build,render,mount,level,detail};
});