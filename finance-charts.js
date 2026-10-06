(function(){
 'use strict';
 const colors=['#1D3FA0','#E63B2E','#26754A','#AD7800','#6F409A','#555'];
 const esc=FinanceCore.esc;
 function short(v){return Math.abs(v)>=1e6?(v/1e6).toFixed(1)+'m':Math.abs(v)>=1000?(v/1000).toFixed(1)+'k':Number(v.toFixed(1)).toString();}
 function empty(el,message){el.innerHTML='<div class="chart-empty">'+esc(message||'No records for this view yet.')+'</div>';}
 function svgStart(w,h,title){return '<svg role="img" aria-label="'+esc(title)+'" viewBox="0 0 '+w+' '+h+'" width="100%" height="'+h+'"><title>'+esc(title)+'</title>';}
 function legend(series){return '<div class="legend">'+series.map((s,i)=>'<span><i style="background:'+colors[i%colors.length]+'"></i>'+esc(s.name)+'</span>').join('')+'</div>';}
 function plot(el,labels,series,options={}){
  const values=series.flatMap(s=>s.values).filter(v=>v!==null&&Number.isFinite(v));
  if(!labels.length||!values.length||values.every(v=>v===0)&&!options.showZero)return empty(el,options.empty);
  const width=Math.max(280,Math.floor(el.clientWidth||480)),height=280,L=64,R=18,T=22,B=58,pw=width-L-R,ph=height-T-B;
  let lo=Math.min(0,...values),hi=Math.max(0,...values);if(options.target!=null){lo=Math.min(lo,options.target);hi=Math.max(hi,options.target);}if(lo===hi)hi=lo+1;
  const range=hi-lo;hi+=range*.12;if(lo<0)lo-=range*.08;
  const y=v=>T+ph-(v-lo)/(hi-lo)*ph;
  let dates=options.dates?.map(d=>new Date(d+'T12:00:00Z').getTime()),xmin=dates?Math.min(...dates):0,xmax=dates?Math.max(...dates):0;
  const x=i=>options.bar?L+(i+.5)/labels.length*pw:dates&&xmax>xmin?L+(dates[i]-xmin)/(xmax-xmin)*pw:L+(labels.length===1?.5:i/(labels.length-1))*pw;
  let svg=svgStart(width,height,options.title||'Financial chart');
  for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,yy=y(v);svg+='<line x1="'+L+'" x2="'+(width-R)+'" y1="'+yy+'" y2="'+yy+'" stroke="#ddd"/><text x="'+(L-8)+'" y="'+(yy+4)+'" text-anchor="end">'+short(v)+(options.unit==='%'?'%':'')+'</text>';}
  svg+='<text x="'+L+'" y="12">'+esc(options.unit||'RM')+'</text>';
  if(options.target!=null){svg+='<line x1="'+L+'" x2="'+(width-R)+'" y1="'+y(options.target)+'" y2="'+y(options.target)+'" stroke="#777" stroke-dasharray="4 5"/><text x="'+(width-R)+'" y="'+(y(options.target)-6)+'" text-anchor="end">Target '+options.target+'%</text>';}
  series.forEach((s,si)=>{
   const color=colors[si%colors.length];let path='',run=false;
   s.values.forEach((v,i)=>{if(v===null||!Number.isFinite(v)){run=false;return;}const xx=x(i),yy=y(v),tip=s.name+' · '+labels[i]+': '+(options.unit==='%'?v.toFixed(1)+'%':options.unit==='grams'?v.toFixed(4)+' g':FinanceCore.money(v));
    if(options.bar){const bw=pw/labels.length*.7/series.length;svg+='<rect x="'+(xx-pw/labels.length*.35+si*bw)+'" y="'+Math.min(yy,y(0))+'" width="'+Math.max(1,bw-1)+'" height="'+Math.abs(yy-y(0))+'" fill="'+color+'"><title>'+esc(tip)+'</title></rect>';}
    else{path+=(run?'L':'M')+xx.toFixed(2)+','+yy.toFixed(2)+' ';run=true;svg+='<circle cx="'+xx+'" cy="'+yy+'" r="4" fill="'+color+'"><title>'+esc(tip)+'</title></circle>';}
   });
   if(!options.bar)svg+='<path d="'+path+'" fill="none" stroke="'+color+'" stroke-width="2.5"'+(si===1?' stroke-dasharray="7 4"':'')+'/>';
  });
  const ticks=width<450?4:6,step=Math.max(1,Math.ceil((labels.length-1)/(ticks-1))),indices=[...new Set([0,...labels.map((_,i)=>i).filter(i=>i%step===0),labels.length-1])];
  let lastLabelRight=-Infinity;
  indices.forEach(i=>{const xx=x(i),text=options.labelFormat?options.labelFormat(labels[i]):labels[i],estimatedWidth=String(text).length*6.3,anchor=i===0?'start':i===labels.length-1?'end':'middle';const left=anchor==='start'?xx:anchor==='end'?xx-estimatedWidth:xx-estimatedWidth/2;if(left<lastLabelRight+6)return;lastLabelRight=left+estimatedWidth;svg+='<text x="'+xx+'" y="'+(height-30)+'" text-anchor="'+anchor+'">'+esc(options.labelFormat?options.labelFormat(labels[i]):labels[i])+'</text>';});
  svg+='<text x="'+(L+pw/2)+'" y="'+(height-8)+'" text-anchor="middle">'+esc(options.xLabel||'Month')+'</text></svg>';
  el.innerHTML=svg+legend(series);
 }
 function bars(el,items,options={}){
  if(!items.length||!items.some(x=>x.value!==0))return empty(el,options.empty);
  let data=items.slice(0,options.limit||8);if(items.length>data.length)data.push({label:'Other',value:items.slice(data.length).reduce((n,x)=>n+x.value,0)});
  const max=Math.max(...data.map(x=>Math.abs(x.value))),total=data.reduce((n,x)=>n+x.value,0);
  el.innerHTML='<div class="horizontal-bars">'+data.map((d,i)=>'<div class="bar-row"><div class="bar-label"><span>'+esc(d.label)+'</span><b>'+esc(options.unit==='grams'?d.value.toFixed(4)+' g':options.unit==='%'?d.value.toFixed(2)+'%':FinanceCore.money(d.value))+(options.share&&total>0?' · '+(d.value/total*100).toFixed(1)+'%':'')+'</b></div><div class="bar-track"><div style="width:'+Math.abs(d.value)/max*100+'%;background:'+colors[i%colors.length]+'"></div></div></div>').join('')+'</div>';
 }
 function gauge(el,value,target,options={}){
  if(value==null||target==null||target<=0)return empty(el,options.empty||'Set your target to see progress.');
  const pct=value/target*100;
  el.innerHTML='<div class="gauge-number">'+esc(options.label||pct.toFixed(1)+'%')+'</div><div class="gauge-track" role="progressbar" aria-label="'+esc(options.title||'Progress')+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.max(0,Math.min(pct,100))+'"><div style="width:'+Math.max(0,Math.min(pct,100))+'%"></div></div><div class="chart-caption">'+esc(options.caption||'')+'</div>';
 }
 window.FinanceCharts={plot,bars,gauge,empty,colors};
})();
