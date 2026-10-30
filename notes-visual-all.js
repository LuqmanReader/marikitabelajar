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
 const svg=make('svg',{viewBox:'0 0 1200 510',role:'img','aria-label':opts.paper+' '+opts.code+': visual learning map for '+opts.title,'xmlns':ns});
 svg.append(make('rect',{width:1200,height:510,rx:14,fill:'#fffbf3'}));
 rounded(svg,16,16,1168,89,'#151515','#151515');
 icon(svg,mode.icon,40,28);
 text(svg,123,51,mode.label+' / '+opts.paper+' '+opts.code,17,900,'#ffe06b');
 wrapped(svg,123,82,opts.title,54,23,'#fff',1);
 const data=opts.steps.slice(0,4);
 while(data.length<4)data.push('Use the result to check the reported or planned answer.');
 const drawPanel=(x,y,w,h,index,fill)=>{
   rounded(svg,x,y,w,h,fill);
   svg.append(make('circle',{cx:x+31,cy:y+32,r:19,fill:'#171717'}));
   text(svg,x+31,y+39,String(index+1),20,900,'#ffe06b',{'text-anchor':'middle'});
   const charWidth=Math.max(13,Math.floor((w-32)/10.5));
   const fontSize=w<270?16:19;
   wrapped(svg,x+18,y+85,data[index],charWidth,fontSize,'#151515',Math.max(2,Math.floor((h-102)/29)+1));
 };
 const kind=mode.icon;
 if(kind==='bars'){
   // Four stage-specific cost/control strips, not false quantitative bars.
   const y=[130,221,312,403];
   data.forEach((_,i)=>{
     rounded(svg,90,y[i],1010,75,i%2?'#e0f0fc':'#fff');
     svg.append(make('rect',{x:33,y:y[i]+7,width:42,height:61,rx:7,fill:i%2?'#2c5f87':'#ffcf30',stroke:'#151515','stroke-width':3}));
     text(svg,54,y[i]+46,String(i+1),25,900,'#151515',{'text-anchor':'middle'});
     wrapped(svg,112,y[i]+30,data[i],83,18,'#151515',2);
   });
   text(svg,110,502,'ORDER OF ANALYSIS — NOT A GRAPH OF QUANTITIES',12,750);
 }else if(kind==='shield'){
   // Audit assurance: four separately evidenced checks around the engagement.
   svg.append(make('circle',{cx:598,cy:304,r:109,fill:'#d5f4e6',stroke:'#151515','stroke-width':4}));
   icon(svg,'shield',569,256);
   text(svg,598,357,'EVIDENCE',18,900,'#111',{'text-anchor':'middle'});
   drawPanel(24,131,385,154,0,'#fff');
   drawPanel(790,131,385,154,1,'#e7f7eb');
   drawPanel(24,327,385,155,2,'#e7f7eb');
   drawPanel(790,327,385,155,3,'#fff');
   for(const [x1,y1,x2,y2]of [[413,225,491,271],[789,225,704,271],[413,411,491,353],[789,411,704,353]])arrow(svg,x1,y1,x2,y2);
 }else if(kind==='scales'){
   // Two facing legal/ethics sides: authority, application and conclusion.
   rounded(svg,37,133,538,330,'#f3e9fc');
   rounded(svg,624,133,538,330,'#fff');
   drawPanel(54,153,502,135,0,'#fff');
   drawPanel(54,310,502,135,1,'#e5d6fa');
   drawPanel(640,153,502,135,2,'#fff2cc');
   drawPanel(640,310,502,135,3,'#fff');
   text(svg,290,484,'RULES AND OBLIGATIONS',15,900,'#171717',{'text-anchor':'middle'});
   text(svg,884,484,'APPLICATION AND RESULT',15,900,'#171717',{'text-anchor':'middle'});
 }else if(kind==='coins'){
   // Tax is a sequence of assessment stages, not a generic clipart coin.
   const xs=[31,334,637,940],ys=[133,205,277,349];
   for(let i=0;i<4;i++){
     drawPanel(xs[i],ys[i],240,148,i,i%2?'#fff':'#ffe8ce');
     if(i<3)arrow(svg,xs[i]+245,ys[i]+71,xs[i+1]-8,ys[i+1]+68);
   }
   text(svg,90,501,'TAX RULES DEPEND ON THE EXAM VARIANT AND RELEVANT FINANCE ACT',13,750,'#171717');
 }else if(kind==='matrix'||kind==='statement'){
   // Decision/financial statement structure: linked quadrants.
   const coords=[[40,143],[612,143],[40,322],[612,322]];
   coords.forEach(([x,y],i)=>drawPanel(x,y,540,158,i,i%2?'#f3ecdd':'#fff'));
   arrow(svg,580,225,609,225);
   arrow(svg,880,304,880,319);
   arrow(svg,610,404,582,404);
 }else if(kind==='timeline'){
   // Financial time progression: spaced milestones with a visual timeline.
   arrow(svg,62,362,1140,362);
   const xs=[40,340,640,940];
   for(let i=0;i<4;i++){
     drawPanel(xs[i],141,258,168,i,i%2?'#dbe9ff':'#fff');
     svg.append(make('line',{x1:xs[i]+128,y1:312,x2:xs[i]+128,y2:349,stroke:'#151515','stroke-width':4}));
     svg.append(make('circle',{cx:xs[i]+128,cy:362,r:14,fill:i%2?'#284f8e':'#ffd04b',stroke:'#151515','stroke-width':3}));
   }
   text(svg,600,460,'PERIOD / DECISION SEQUENCE',15,900,'#151515',{'text-anchor':'middle'});
 }else{
   // General accounting: two source stages feed two reporting stages.
   drawPanel(36,134,536,148,0,'#fff');
   drawPanel(628,134,536,148,1,'#ffeb97');
   drawPanel(36,326,536,148,2,'#e6f1ff');
   drawPanel(628,326,536,148,3,'#e3f4e8');
   arrow(svg,576,207,625,207);
   arrow(svg,895,284,895,323);
   arrow(svg,627,397,575,397);
 }
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
