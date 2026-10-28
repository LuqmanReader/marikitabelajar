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
    if(firstOfWeek<=last&&firstOfWeek<=today&&month!==previousMonth){
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

 // Fixed isometric projection. There is deliberately no camera/rotation control.
 const ISO={width:1210,height:475,originX:155,originY:130,wx:17.2,wy:4.1,dx:-11.6,dy:6.1};
 const COLORS=['#ebedf0','#b7e6a1','#8cd66d','#39a64b','#0a5920'];
 const LIGHT=['#f3f5f7','#e3f5be','#baf49b','#6edb64','#238a30'];
 const DARK=['#d8dee4','#8ebc79','#66b451','#217b35','#063d17'];
 let activeYear=null;
 function yearOf(model){
  const found=model.years.find(y=>y.year===activeYear);
  return found||model.years[0];
 }
 function svgPoint(x,y){return x.toFixed(1)+','+y.toFixed(1);}
 function poly(points,fill,cssClass=''){
  return '<polygon class="'+cssClass+'" points="'+points.map(p=>svgPoint(p[0],p[1])).join(' ')+'" fill="'+fill+'"/>';
 }
 function statsForYear(year){
  let busiest=null,run=0,longest=0,yearEndStreak=0;
  let streakStart='',bestStart='',bestEnd='',currentStart='',lastDate='';
  for(const week of year.weeks){
   for(const cell of week){
    if(!cell.valid)continue;
    lastDate=cell.date;
    const count=cell.activity.total;
    if(count>0){
     if(!busiest||count>=busiest.activity.total)busiest=cell;
     if(!run)streakStart=cell.date;
     run++;
     if(run>longest){longest=run;bestStart=streakStart;bestEnd=cell.date;}
    }else{run=0;}
   }
  }
  // The historical year-end streak is based only on the selected year's days.
  yearEndStreak=run;
  currentStart=run?streakStart:'';
  return {busiest,longest,bestStart,bestEnd,yearEndStreak,currentStart,lastDate};
 }
 function shortDate(date){
  const parsed=fromKey(date);
  return parsed?parsed.toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}):'—';
 }
 function readableSpan(start,end){
  if(!start||!end)return 'No recorded streak';
  return shortDate(start)+(start===end?'':' – '+shortDate(end));
 }
 function svgForYear(year){
  const cells=year.weeks.flatMap((week,w)=>week.map((cell,d)=>({cell,w,d})))
   .filter(row=>row.cell.valid);
  // Back-to-front painter order keeps 3D bars properly overlapped.
  cells.sort((a,b)=>(a.w*ISO.wy+a.d*ISO.dy)-(b.w*ISO.wy+b.d*ISO.dy));
  let markup='<svg class="contrib-iso-svg" viewBox="0 0 '+ISO.width+' '+ISO.height+'" preserveAspectRatio="xMidYMid meet" role="group" aria-label="'+year.year+' interactive fixed-angle three-dimensional contribution columns">';
  for(const {cell,w,d} of cells){
   const c=cell.activity,x=ISO.originX+w*ISO.wx+d*ISO.dx,y=ISO.originY+w*ISO.wy+d*ISO.dy;
   const height=c.total?Math.min(104,9+Math.sqrt(c.total)*24):0;
   const top=[[x,y-height],[x+15.2,y+3.7-height],[x+3.5,y+9.5-height],[x-11.7,y+5.8-height]];
   const bottom=top.map(([px,py])=>[px,py+height]);
   const l=c.total?c.level:0;
   markup+='<g class="contrib-iso-column'+(height?' has-activity':'')+'" data-date="'+cell.date+'" data-count="'+c.total+'" tabindex="0" role="button" aria-label="'+detail(cell.date,c)+'">';
   markup+='<title>'+detail(cell.date,c)+'</title>';
   if(height){
    markup+=poly([top[3],top[2],bottom[2],bottom[3]],COLORS[l],'contrib-iso-front');
    markup+=poly([top[1],top[2],bottom[2],bottom[1]],DARK[l],'contrib-iso-side');
    markup+=poly(top,LIGHT[l],'contrib-iso-top');
   }else{
    markup+=poly([[x,y],[x+15.2,y+3.7],[x+3.5,y+9.5],[x-11.7,y+5.8]],COLORS[0],'contrib-iso-empty');
   }
   markup+='</g>';
  }
  return markup+'</svg>';
 }
 function flatForYear(year){
  const months=year.months.map(m=>'<span style="grid-column:'+m.week+'">'+m.label+'</span>').join('');
  let cells='';
  for(const week of year.weeks)for(const day of week){
   if(!day.valid){cells+='<span class="contrib-flat-blank" aria-hidden="true"></span>';continue;}
   cells+='<button type="button" class="contrib-flat-square level-'+day.activity.level+'" data-date="'+day.date+'" title="'+detail(day.date,day.activity)+'" aria-label="'+detail(day.date,day.activity)+'"></button>';
  }
  return '<div class="contrib-flat-calendar" style="--weeks:'+year.weeks.length+'"><div class="contrib-flat-months">'+months+'</div><div class="contrib-flat-squares">'+cells+'</div></div>';
 }
 function render(model){
  const year=yearOf(model);
  let html='<section class="study-contrib-panel" aria-labelledby="contribTitle">';
  html+='<header class="study-contrib-heading"><div><span class="contrib-eyebrow">LEDGERPEER / STUDY ACTIVITY</span><h2 id="contribTitle">YOUR CONTRIBUTION LANDSCAPE.</h2><p>Real study progress, in a fixed 3D view.</p></div>';
  html+='<label class="contrib-year-label" for="contribYear">YEAR <select id="contribYear" aria-label="Select contribution year">';
  for(const option of model.years)html+='<option value="'+option.year+'"'+(year.year===option.year?' selected':'')+'>'+option.year+'</option>';
  html+='</select></label></header>';
  html+='<div class="contrib-stage" id="contrib3dStage">';
  html+='<div class="contrib-iso-area" id="contrib3dCanvas">'+svgForYear(year)+'</div>';
  html+='<div class="contrib-busiest" id="contribBusiest"></div>';
  html+='<div class="contrib-streaks" id="contribStreaks"></div>';
  html+='<div class="contrib-3d-tooltip" id="contrib3dTooltip" role="status" hidden></div>';
  html+='</div>';
  html+='<div class="contrib-bottom"><div class="contrib-bottom-copy"><strong id="contribYearCount">'+year.contributions.toLocaleString('en-MY')+'</strong> genuine study contributions in '+year.year+'<span class="contrib-fixed-label">FIXED VIEW · HOVER OR TAP THE BARS</span></div>';
  html+='<div class="contrib-legend" aria-label="More activity means taller, darker green bars"><span>LESS</span><i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i><span>MORE</span></div></div>';
  html+='<button type="button" class="contrib-flat-toggle" id="contribFlatToggle" aria-expanded="false" aria-controls="contribFlatView">Show normal chart below <span aria-hidden="true">⌄</span></button>';
  html+='<div class="contrib-flat-view" id="contribFlatView" hidden><h3>Normal contribution calendar · <span id="contribFlatYear">'+year.year+'</span></h3><div id="contribFlatBody">'+flatForYear(year)+'</div></div>';
  html+='<p class="contrib-a11y-detail" id="contribDetail" role="status" hidden></p>';
  html+='<p class="contrib-source">Each completed task and each logged study session counts as one contribution. Empty days stay grey. Study records stay in this browser.</p>';
  return html+'</section>';
 }
 function mount(container,model){
  if(!container)return;
  let year=yearOf(model),pinned='';
  const yearPicker=container.querySelector('#contribYear');
  const stage=container.querySelector('#contrib3dStage');
  const canvas=container.querySelector('#contrib3dCanvas');
  const tooltip=container.querySelector('#contrib3dTooltip');
  const detailBox=container.querySelector('#contribDetail');
  const busiest=container.querySelector('#contribBusiest');
  const streaks=container.querySelector('#contribStreaks');
  const count=container.querySelector('#contribYearCount');
  const flatToggle=container.querySelector('#contribFlatToggle');
  const flatView=container.querySelector('#contribFlatView');
  function showStats(){
   const x=statsForYear(year);
   busiest.innerHTML='<span class="contrib-stat-label">Busiest day</span><div class="contrib-stat-line"><strong>'+ (x.busiest?x.busiest.activity.total:0)+'</strong><span>contributions</span></div><span class="contrib-stat-date">'+(x.busiest?shortDate(x.busiest.date):'No study activity yet')+'</span>';
   streaks.innerHTML='<div class="contrib-streak-block"><span class="contrib-stat-label">Longest streak</span><div class="contrib-stat-line"><strong>'+x.longest+'</strong><span>days</span></div><span class="contrib-stat-date">'+readableSpan(x.bestStart,x.bestEnd)+'</span></div><div class="contrib-streak-block"><span class="contrib-stat-label">'+(year.isCurrent?'Current streak':'Year-end streak')+'</span><div class="contrib-stat-line"><strong>'+ (year.isCurrent?model.currentStreak:x.yearEndStreak)+'</strong><span>days</span></div><span class="contrib-stat-date">'+(year.isCurrent&&model.currentStreak===0?'No active streak':readableSpan(x.currentStart,x.lastDate))+'</span></div>';
  }
  function hideTip(){tooltip.hidden=true;}
  function showTip(target,event){
   const date=target.getAttribute('data-date');if(!date)return;
   const day=year.weeks.flat().find(item=>item.date===date);
   if(!day||!day.valid)return;
   tooltip.textContent=detail(date,day.activity);
   tooltip.hidden=false;
   // Position the card above the pointer when possible, inside the stage.
   if(event&&typeof event.clientX==='number'&&typeof event.clientY==='number'){
    const bounds=stage.getBoundingClientRect();
    tooltip.style.left=Math.min(Math.max(event.clientX-bounds.left,110),Math.max(110,bounds.width-110))+'px';
    tooltip.style.top=Math.max(12,event.clientY-bounds.top-56)+'px';
   }else{tooltip.style.left='50%';tooltip.style.top='10px';}
  }
  function choose(target,event){
   const date=target.getAttribute('data-date');if(!date)return;
   pinned=date;
   for(const cell of container.querySelectorAll('.contrib-iso-column'))cell.classList.toggle('is-selected',cell===target);
   showTip(target,event);
   detailBox.hidden=false;detailBox.textContent=tooltip.textContent;
  }
  canvas.addEventListener('pointerover',event=>{
   const cell=event.target.closest('.contrib-iso-column');if(cell&&canvas.contains(cell))showTip(cell,event);
  });
  canvas.addEventListener('pointerout',event=>{
   if(!event.relatedTarget||!canvas.contains(event.relatedTarget.closest?.('.contrib-iso-column')||event.relatedTarget)){
    if(!pinned)hideTip();
   }
  });
  canvas.addEventListener('click',event=>{
   const cell=event.target.closest('.contrib-iso-column');if(cell&&canvas.contains(cell))choose(cell,event);
  });
  canvas.addEventListener('focusin',event=>{
   const cell=event.target.closest('.contrib-iso-column');if(cell)showTip(cell);
  });
  canvas.addEventListener('keydown',event=>{
   const cell=event.target.closest('.contrib-iso-column');
   if(cell&&(event.key==='Enter'||event.key===' ')){event.preventDefault();choose(cell);}
  });
  canvas.addEventListener('focusout',()=>{if(!pinned)hideTip();});
  yearPicker.addEventListener('change',()=>{
   const chosen=model.years.find(item=>String(item.year)===yearPicker.value);if(!chosen)return;
   activeYear=chosen.year;year=chosen;pinned='';hideTip();detailBox.hidden=true;
   canvas.innerHTML=svgForYear(year);count.textContent=year.contributions.toLocaleString('en-MY');
   container.querySelector('#contribFlatYear').textContent=String(year.year);
   container.querySelector('#contribFlatBody').innerHTML=flatForYear(year);
   showStats();
  });
  flatToggle.addEventListener('click',()=>{
   const open=flatView.hidden;
   flatView.hidden=!open;flatToggle.setAttribute('aria-expanded',String(open));
   flatToggle.innerHTML=open?'Hide normal chart <span aria-hidden="true">⌃</span>':'Show normal chart below <span aria-hidden="true">⌄</span>';
  });
  container.querySelector('#contribFlatBody').addEventListener('click',event=>{
   const square=event.target.closest('.contrib-flat-square');
   if(!square)return;
   const date=square.getAttribute('data-date');
   const day=year.weeks.flat().find(item=>item.date===date);
   detailBox.textContent=detail(date,day.activity);detailBox.hidden=false;
  });
  showStats();
 }
 return {activityDate,build,render,mount,level,detail};
});