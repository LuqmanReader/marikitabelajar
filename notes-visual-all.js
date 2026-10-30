/* LedgerPeer chapter-specific diagram system.
   All diagrams are original SVGs built using the actual topic teaching content.
   They never pretend to be ACCA's official figures or to certify syllabus coverage. */
(function(root){
'use strict';
const ns='http://www.w3.org/2000/svg';
const make=(tag,attrs={},text)=>{
 const el=document.createElementNS(ns,tag);
 for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));
 if(text!==undefined)el.textContent=String(text);
 return el;
};
const el=(tag,cl,text)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(text!==undefined)n.textContent=String(text);return n};
const clip=(s,n=100)=>{const t=String(s||'').replace(/\s+/g,' ').trim();return t.length>n?t.slice(0,n-1).replace(/\s+\S*$/,'')+'…':t};
const lines=(s,max=27)=>{
 const words=String(s||'').replace(/\s+/g,' ').split(' '),out=[];let line='';
 for(const w of words){if((line+' '+w).trim().length>max&&line){out.push(line);line=w}else line=(line?line+' ':'')+w}if(line)out.push(line);
 return out;
};
const modes=[
 {label:'ACCOUNTING RECORDS',accent:'#ffe062',icon:'ledger'},
 {label:'COST AND PERFORMANCE',accent:'#d7edff',icon:'bars'},
 {label:'TAX COMPUTATION',accent:'#fbe0c9',icon:'coins'},
 {label:'AUDIT AND ASSURANCE',accent:'#d6f4e4',icon:'shield'},
 {label:'LAW AND GOVERNANCE',accent:'#eddcfa',icon:'scales'},
 {label:'FINANCE AND INVESTMENT',accent:'#dbe9ff',icon:'timeline'},
 {label:'BUSINESS DECISIONS',accent:'#faeac3',icon:'matrix'},
 {label:'FINANCIAL REPORTING',accent:'#dfebff',icon:'statement'}
];
function getMode(paper,title){
 const text=(paper+' '+title).toLowerCase();
 if(/tax|capital gains|vat|taxation/.test(text)||['TX','FTX','ATX'].includes(paper))return modes[2];
 if(/law|legal|contract|legislation/.test(text)||paper==='LW')return modes[4];
 if(/audit|assurance|internal control|ethical/.test(text)||['AA','AAA','FAU'].includes(paper))return modes[3];
 if(/financ|cash|treasury|capital investment|npv|investment appraisal|working capital/.test(text)&&['FM','AFM','FFM','MA2','MA1'].includes(paper))return modes[5];
 if(/cost|budget|variance|labour|material|performance|process/.test(text)||['MA','FMA','PM','APM','MA1','MA2'].includes(paper))return modes[1];
 if(/statement|IFRS|IAS|group account|consolidat|reporting/.test(text)||['FR','SBR','FFA','FA'].includes(paper))return modes[7];
 if(/strategy|business|stakeholder|organisation|governance|professional/.test(text)||['BT','FBT','SBL'].includes(paper))return modes[6];
 return modes[0];
}
function rounded(svg,x,y,w,h,fill,stroke='#181818',rx=14){svg.append(make('rect',{x,y,width:w,height:h,rx,fill,stroke,'stroke-width':3}))}
function text(svg,x,y,value,size=20,weight=600,color='#151515',other={}){
 svg.append(make('text',{x,y,fill:color,'font-size':size,'font-weight':weight,'font-family':'Arial, sans-serif',...other},value));
}
function wrapped(svg,x,y,s,width=29,size=20,color='#171717',max=3){
 const all=lines(s,width),take=all.slice(0,max);
 take.forEach((part,i)=>text(svg,x,y+i*(size+7),i===max-1&&all.length>max?clip(part,Math.max(10,width-3))+'…':part,size,650,color));
}
function icon(svg,name,x,y){
 const stroke='#161616';
 const g=make('g',{transform:'translate('+x+' '+y+')',stroke,fill:'none','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round'});
 const line=(x1,y1,x2,y2)=>g.append(make('line',{x1,y1,x2,y2}));
 if(name==='ledger'||name==='statement'){
  g.append(make('rect',{x:3,y:3,width:52,height:60,rx:5}));
  line(16,19,44,19);line(16,32,44,32);line(16,45,44,45);line(10,4,10,62);
 }else if(name==='bars'){
  g.append(make('rect',{x:2,y:31,width:12,height:32,fill:'#fff'}));
  g.append(make('rect',{x:23,y:18,width:12,height:45,fill:'#fff'}));
  g.append(make('rect',{x:44,y:5,width:12,height:58,fill:'#fff'}));
 }else if(name==='coins'){
  for(let j=0;j<3;j++){g.append(make('ellipse',{cx:29,cy:19+j*15,rx:26,ry:12}));if(j<2){line(3,19+j*15,3,34+j*15);line(55,19+j*15,55,34+j*15)}}
 }else if(name==='shield'){
  g.append(make('path',{d:'M29 3L54 12V33Q50 51 29 64Q8 51 4 33V12Z'}));
  g.append(make('path',{d:'M16 33L25 42L43 21'}));
 }else if(name==='scales'){
  line(30,6,30,61);line(7,24,53,24);line(10,61,50,61);
  line(9,24,9,40);line(51,24,51,40);
  g.append(make('path',{d:'M0 40Q9 57 18 40ZM42 40Q51 57 60 40Z'}));
 }else if(name==='timeline'){
  line(5,45,58,45);for(let j=0;j<3;j++){g.append(make('circle',{cx:10+j*22,cy:45,r:6,fill:'#ffe062'}));line(10+j*22,10+j*8,10+j*22,39)}
 }else{
  for(let j=0;j<4;j++){g.append(make('rect',{x:2+(j%2)*32,y:4+Math.floor(j/2)*32,width:23,height:23,rx:3}))}
 }
 svg.append(g);
}
function arrow(svg,x1,y1,x2,y2){
 svg.append(make('path',{d:'M'+x1+' '+y1+' L'+x2+' '+y2,fill:'none',stroke:'#161616','stroke-width':4,'stroke-linecap':'round'}));
 svg.append(make('path',{d:'M'+(x2-10)+' '+(y2-7)+' L'+x2+' '+y2+' L'+(x2-10)+' '+(y2+7),fill:'none',stroke:'#161616','stroke-width':4,'stroke-linejoin':'round'}));
}
function diagram(opts){
 const mode=getMode(opts.paper,opts.title);
 const svg=make('svg',{viewBox:'0 0 1200 466',role:'img','aria-label':opts.paper+' '+opts.code+': visual learning map for '+opts.title,'xmlns':ns});
 svg.append(make('rect',{width:1200,height:466,rx:14,fill:'#fffbf3'}));
 rounded(svg,16,16,1168,88,'#151515','#151515');
 icon(svg,mode.icon,40,28);
 text(svg,123,52,mode.label+' / '+opts.paper+' '+opts.code,17,900,'#ffe06b');
 wrapped(svg,123,83,opts.title,58,22,'#fff',1);
 const labels=['START WITH','IDENTIFY','APPLY','CHECK RESULT'];
 const steps=opts.steps.slice(0,4);
 while(steps.length<4)steps.push('Explain the consequence and reconcile the answer.');
 const xs=[28,326,624,922];
 for(let i=0;i<4;i++){
  rounded(svg,xs[i],149,255,241,i%2?mode.accent:'#ffffff');
  svg.append(make('circle',{cx:xs[i]+36,cy:183,r:20,fill:'#141414'}));
  text(svg,xs[i]+36,190,String(i+1),19,900,'#ffe07e',{'text-anchor':'middle'});
  text(svg,xs[i]+20,232,labels[i],16,900);
  wrapped(svg,xs[i]+20,273,steps[i],22,17,'#161616',5);
  if(i<3)arrow(svg,xs[i]+259,261,xs[i+1]-13,261);
 }
 svg.append(make('rect',{x:28,y:410,width:1149,height:37,rx:8,fill:'#fff0c4'}));
 text(svg,45,435,clip('KEY CHECK · '+(opts.formula||opts.trap||opts.summary||opts.title),140),15,750);
 return svg;
}
function buildWorking(opts){
 const fig=el('figure','lv-all-worked');
 const head=el('figcaption','', 'WORKED METHOD · '+opts.paper+' / '+opts.code);fig.append(head);
 const grid=el('div','lv-all-worked-grid');
 const parts=[
  ['QUESTION',opts.example||'Identify the examinable transaction or requirement.'],
  ['METHOD',opts.steps?.slice(0,2).join(' ')||opts.summary||'Apply the specified procedure.'],
  ['SOLUTION / CHECK',opts.answer||opts.formula||'Check the result against the requirements and underlying record.']
 ];
 for(const [name,content]of parts){const card=el('div','lv-all-worked-card');card.append(el('strong','',name),el('p','',content));grid.append(card)}
 fig.append(grid);
 const end=el('p','lv-all-worked-warning','This visual works from the existing chapter example; it is not an independently verified new examination question.');
 fig.append(end);return fig;
}
root.renderLedgerChapterVisual=function(parent,opts){
 if(!opts||!opts.paper||!opts.code)return false;
 const steps=(opts.book?.sections||[]).map(x=>x[0]);
 const method=steps.length?steps:opts.note?.steps||[];
 const diagramOpts={
   paper:opts.paper,code:opts.code,title:opts.title,
   steps:method,summary:opts.note?.summary,formula:opts.note?.formula,trap:opts.note?.trap,
   example:opts.book?.workings?.[0]?.[1]||opts.note?.example,
   answer:opts.book?.workings?.[0]?.[2]||opts.note?.answer
 };
 const figure=el('figure','lv-all-figure');
 figure.append(diagram(diagramOpts));
 figure.append(el('figcaption','','ORIGINAL TOPIC DIAGRAM · Follow the learning sequence from left to right. All labels come from this specific chapter. Graphics describe the study method; they are not a replacement for learning-outcome explanations.'));
 parent.append(figure);
 parent.append(buildWorking(diagramOpts));
 return true;
};
})(window);
