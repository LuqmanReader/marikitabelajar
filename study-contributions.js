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
  const historyStart=key(new Date(today.getFullYear()-3,0,1,12));
  const end=addDays(today,6-today.getDay());
  const days=new Map();
  function entry(date){if(!days.has(date))days.set(date,empty());return days.get(date);}
  for(const task of Array.isArray(records.tasks)?records.tasks:[]){
   if(!task||!task.done)continue;
   const date=activityDate(task.completedAt);
   if(!date||date<historyStart||date>todayKey)continue;
   entry(date).tasks++;
  }
  for(const session of Array.isArray(records.sessions)?records.sessions:[]){
   if(!session)continue;
   const date=activityDate(session.date);
   const minutes=Number(session.minutes);
   if(!date||date<historyStart||date>todayKey||!Number.isFinite(minutes)||minutes<=0)continue;
   const active=entry(date);
   active.sessions++;active.minutes+=minutes;
  }
  let activeDays=0,totalTasks=0,totalSessions=0,totalMinutes=0;
  for(const record of days.values()){
   record.total=record.tasks+record.sessions;
   record.level=level(record.total);
   // A four-year archive is displayed, but summary stats remain last-365-day values.
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
  const years=[];
  for(let y=today.getFullYear();y>=today.getFullYear()-3;y--){
   const first=new Date(y,0,1,12),last=new Date(y,11,31,12);
   const alignedFirst=addDays(first,-first.getDay()),alignedLast=addDays(last,6-last.getDay());
   const yearWeeks=[],yearMonths=[];
   let previousMonth=-1,yearContributions=0,yearActiveDays=0;
   for(let weekStart=alignedFirst;weekStart<=alignedLast;weekStart=addDays(weekStart,7)){
    const week=[];
    for(let d=0;d<7;d++){
     const dateObj=addDays(weekStart,d),date=key(dateObj);
     const valid=date>=key(first)&&date<=key(last)&&date<=todayKey;
     const activity=valid?(days.get(date)||empty()):empty();
     if(valid&&activity.total>0){yearContributions+=activity.total;yearActiveDays++;}
     week.push({date,day:dateObj,valid,activity});
    }
    const firstOfWeek=weekStart<first?first:weekStart;
    const month=firstOfWeek.getMonth();
    if(firstOfWeek<=last&&month!==previousMonth){
     yearMonths.push({week:yearWeeks.length+1,label:firstOfWeek.toLocaleDateString('en-MY',{month:'short'})});
     previousMonth=month;
    }
    yearWeeks.push(week);
   }
   years.push({year:y,isCurrent:y===today.getFullYear(),weeks:yearWeeks,months:yearMonths,contributions:yearContributions,activeDays:yearActiveDays});
  }
  for(const [date,record] of days){
   if(date<key(earliest)||date>todayKey)continue;
   activeDays++;totalTasks+=record.tasks;totalSessions+=record.sessions;totalMinutes+=record.minutes;
  }
  function hasActivity(day){return (days.get(key(day))?.total||0)>0;}
  let cursor=hasActivity(today)?today:addDays(today,-1),currentStreak=0;
  while(cursor>=earliest&&hasActivity(cursor)){currentStreak++;cursor=addDays(cursor,-1);}
  let bestStreak=0,run=0;
  for(let date=earliest;date<=today;date=addDays(date,1)){
   run=hasActivity(date)?run+1:0;
   if(run>bestStreak)bestStreak=run;
  }
  return {weeks,months,years,days,activeDays,totalTasks,totalSessions,totalMinutes,currentStreak,bestStreak,todayKey,earliest:key(earliest)};
 }
 function plural(n,name){return n+' '+name+(n===1?'':'s');}
 function detail(date,activity){
  const day=fromKey(date),label=day?day.toLocaleDateString('en-MY',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):date;
  return label+' · '+plural(activity.tasks,'completed task')+' · '+plural(activity.sessions,'study session')+' · '+Math.round(activity.minutes)+' logged minutes';
 }
 function render(model){
  const legend='<div class="study-contrib-legend" aria-label="Activity intensity, from fewer to more study contributions"><span>Less</span><i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i><span>More</span></div>';
  let html='<section class="study-contrib-panel" aria-labelledby="contribTitle">';
  html+='<header class="study-contrib-heading"><h2 id="contribTitle">Study contributions on LedgerPeer</h2>'+legend+'</header>';
  html+='<div class="study-contrib-years">';
  for(const year of model.years){
   html+='<section class="study-contrib-year" aria-label="Study activity for '+year.year+'">';
   html+='<h3>'+year.year+': '+year.contributions.toLocaleString('en-MY')+' contributions'+(year.isCurrent?' (so far)':'')+'</h3>';
   html+='<div class="study-contrib-scroll" tabindex="0" role="region" aria-label="'+year.year+' contribution calendar, scroll horizontally for all months">';
   html+='<div class="study-contrib-calendar" style="--weeks:'+year.weeks.length+'">';
   html+='<div class="study-contrib-months">';
   for(const month of year.months)html+='<span style="grid-column:'+month.week+'">'+month.label+'</span>';
   html+='</div><div class="study-contrib-squares">';
   for(const week of year.weeks){
    for(const cell of week){
     if(!cell.valid){html+='<span class="study-contrib-placeholder" aria-hidden="true"></span>';continue;}
     const activity=cell.activity,description=detail(cell.date,activity);
     html+='<button type="button" class="study-contrib-square level-'+activity.level+'" data-date="'+cell.date+'" title="'+description+'" aria-label="'+description+'" aria-pressed="false"></button>';
    }
   }
   html+='</div></div></div></section>';
  }
  html+='</div>';
  html+='<footer class="study-contrib-footer"><span>LedgerPeer · Activity from completed tasks and logged sessions only</span><details class="study-contrib-method"><summary>How contributions are counted</summary><p>1 contribution = 1 completed study task or 1 logged study session. Tasks count on their completion date, not the scheduled date. No fabricated activity; data remains in this browser.</p></details></footer>';
  html+='<p class="study-contrib-detail" id="contribDetail" role="status" hidden></p>';
  html+='<p class="study-contrib-meta">Current streak: <strong>'+model.currentStreak+' days</strong> · Best streak: <strong>'+model.bestStreak+' days</strong> · Minutes logged (past year): <strong>'+model.totalMinutes.toLocaleString('en-MY')+'</strong></p>';
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
   detailBox.textContent=detail(date,model.days.get(date)||empty());detailBox.hidden=false;
  };
  container.addEventListener('click',event=>{
   const button=event.target.closest('.study-contrib-square');
   if(button&&container.contains(button))selectDate(button);
  });
  // Leave squares unselected initially, like GitHub's contributions calendar.
 }
 return {activityDate,build,render,mount,level,detail};
});