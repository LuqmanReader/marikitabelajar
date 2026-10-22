(function(root){'use strict';
const byId=id=>document.getElementById(id);
const PAPERS=[
 ['FA1','Recording Financial Transactions','Core double entry, cash records and ledger controls'],
 ['MA1','Management Information','Cost behaviour, material and labour controls, spreadsheets'],
 ['FA2','Maintaining Financial Records','Financial reporting, ledger adjustments, reconciliation and partnerships'],
 ['MA2','Managing Costs and Finance','Costing systems, CVP, short-term decisions and cash management'],
 ['FBT','Business and Technology','Organisation, ethics, technology and management'],
 ['FMA','Management Accounting','Budgeting, variance analysis and performance measurement'],
 ['FFA','Financial Accounting','Financial statements, accounting standards and interpretation']
];
const syllabus=root.LedgerPublishedSyllabi?.papers||{};
const lessons=root.LedgerFiaNotes||{};
let paper='FA2',filter='all',query='';
const searchParams=new URLSearchParams(location.search);
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function link(label,url,cls){
 const a=node('a',cls,label);
 if(/^https:\/\/www\.accaglobal\.com\//.test(url)){
    a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 }else if(/^notes\.html\?/.test(url)){a.href=url}
 else{a.href='https://www.accaglobal.com/my/en/student/exam-support-resources.html';a.target='_blank';a.rel='noopener noreferrer'}
 return a;
}
function syllabusCode(t){const m=/^([A-Z]\d+)\s*·\s*(.*)$/.exec(t);return m?{code:m[1],title:m[2]}:{code:'—',title:t}}
function info(code){const p=PAPERS.find(x=>x[0]===code);return {name:p?.[1]||code,description:p?.[2]||'',topics:syllabus[code]?.topics||[],source:syllabus[code]?.source||null}}
function resourceLink(code){return 'https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/'+code.toLowerCase()+'.html'}
function renderPaperOptions(){
 const select=byId('paperSelect');select.replaceChildren();
 const all=node('option',null,'ALL FIA PAPERS');all.value='ALL';select.append(all);
 for(const row of PAPERS){const opt=node('option',null,row[0]+' · '+row[1]);opt.value=row[0];select.append(opt)}
 select.value=paper;
}
function textBlock(parent,title,text,cls){
 const block=node('div',cls||'');block.append(node('h4','',title),node('p','',text));parent.append(block);return block
}
function makeLesson(n,src,paperCode){
 const layout=node('div','notes-lesson-layout');
 const main=node('div','notes-lesson-main');
 main.append(node('p','',n.summary));
 main.append(node('h4','', 'HOW IT WORKS'));
 const ul=node('ul');
 for(const step of n.steps)ul.append(node('li','',step));
 main.append(ul);
 if(n.formula){const f=node('div','notes-formula',n.formula);f.setAttribute('aria-label','Formula or rule');main.append(f)}
 textBlock(main,'WORKED EXAMPLE',n.example,'notes-example');
 const side=node('aside','notes-sidebox');
 textBlock(side,'EXAM TRAP',n.trap);
 const check=node('details','notes-check');
 const summary=node('summary','',n.check);
 const answer=node('div','notes-check-answer',n.answer);
 check.append(node('h4','', 'SELF CHECK'),summary,answer);side.append(check);
 side.append(link('OFFICIAL SYLLABUS ↗',src || resourceLink(paperCode)));
 layout.append(main,side);return layout;
}
function buildTopic(paperCode,item,index){
 const p=info(paperCode),tag=syllabusCode(item),n=lessons[paperCode+':'+tag.code];
 const el=node('details','notes-topic');
 el.id='topic-'+paperCode+'-'+tag.code;
 const summary=node('summary');
 const c=node('span','notes-topic-code',tag.code);
 const title=node('div','notes-topic-title');
 title.append(node('strong','',tag.title),node('small','',paperCode+' · '+(n?'DETAILED STUDY NOTE':'SYLLABUS OUTLINE / OFFICIAL RESOURCE')));
 summary.append(c,title,node('span','notes-expand','+'));el.append(summary);
 const content=node('div','notes-topic-detail');
 if(n){content.append(makeLesson(n,p.source,paperCode))}
 else{
   const outline=node('p','notes-outline','This learning outcome is listed in ACCA’s published syllabus but does not yet have a full LedgerPeer lesson. Use the official syllabus and Study Hub chapters for complete examinable coverage. We do not present a generic placeholder as a finished note.');
   const note=node('div','notes-outline');
   note.append(link('VIEW OFFICIAL PAPER SYLLABUS ↗',p.source||resourceLink(paperCode)),document.createTextNode(' · '),
     link('ACCA EXAM RESOURCES ↗',resourceLink(paperCode)));
   content.append(outline,note);
 }
 el.append(content);return el;
}
function renderIntro(codes){
 const area=byId('paperIntro');area.replaceChildren();
 const left=node('div');
 const label=node('span','notes-eyebrow',paper==='ALL'?'CROSS-PAPER STUDY':'CURRENT PAPER');
 left.append(label);
 left.append(node('h3','',paper==='ALL'?'EVERY FIA SYLLABUS TOPIC':paper+' / '+info(paper).name));
 left.append(node('p','',paper==='ALL'?'Search the full syllabus index for FIA foundation papers. Detailed notes are currently concentrated on the four introductory/intermediate papers.':info(paper).description+' · '+info(paper).topics.length+' published syllabus topics'));
 area.append(left);
 const right=node('div');
 if(paper!=='ALL'){
   const source=info(paper).source;
   right.append(link('ACCA 2026–27 SYLLABUS ↗',source||resourceLink(paper)));
   right.append(document.createTextNode(' '));
   right.append(link('EXAM SUPPORT ↗',resourceLink(paper)));
 }else{right.append(link('ACCA EXAM RESOURCE FINDER ↗','https://www.accaglobal.com/my/en/student/exam-support-resources.html'))}
 area.append(right);
}
function render(){
 const list=byId('topicList');list.replaceChildren();
 const activePapers=paper==='ALL'?PAPERS.map(x=>x[0]):[paper];
 renderIntro(activePapers);
 const q=query.trim().toLowerCase();
 let total=0,rendered=0,detailCount=0;
 for(const code of activePapers){
  const all=info(code).topics;total+=all.length;
  for(const item of all){
   const t=syllabusCode(item),lesson=lessons[code+':'+t.code];
   if(lesson)detailCount++;
   if(filter==='lesson'&&!lesson||filter==='outline'&&lesson)continue;
   if(q){
     const hay=[code,item,info(code).name,lesson?.summary,lesson?.formula,lesson?.trap,lesson?.example,...(lesson?.steps||[])].filter(Boolean).join(' ').toLowerCase();
     if(!hay.includes(q))continue;
   }
   const el=buildTopic(code,item,rendered);
   list.append(el);rendered++;
  }
 }
 byId('notesEmpty').hidden=rendered!==0;
 const suffix=paper==='ALL'?'ACROSS 7 PAPERS':paper+' SYLLABUS';
 byId('notesCount').textContent=rendered+' MATCHING TOPICS · '+detailCount+' DETAILED / '+total+' TOTAL · '+suffix;
 if(searchParams.has('topic') && !query && filter==='all'){
   const code=searchParams.get('topic')?.toUpperCase();
   const desired=byId('topic-'+paper+'-'+code);
   if(desired){desired.open=true;desired.scrollIntoView({block:'center',behavior:'auto'});searchParams.delete('topic')}
 }
}
async function init(){
 const loading=byId('notesLoading');
 try{
   if(!root.PersonalHubAuth)throw Error('Student authentication unavailable.');
   const valid=await root.PersonalHubAuth.ready();
   if(!valid){location.replace('index.html');return}
   if(!root.LedgerPublishedSyllabi||!root.LedgerFiaNotes)throw Error('Syllabus or notes bundle not loaded. Please refresh.');
   const arg=searchParams.get('paper')?.toUpperCase();
   if(arg && (arg==='ALL'||PAPERS.some(x=>x[0]===arg)))paper=arg;
   renderPaperOptions();
   byId('paperSelect').addEventListener('change',e=>{paper=e.target.value;render()});
   byId('notesFilter').addEventListener('change',e=>{filter=e.target.value;render()});
   byId('notesSearch').addEventListener('input',e=>{query=e.target.value;render()});
   if(root.PersonalHubAuth.addLockButton)root.PersonalHubAuth.addLockButton();
   render();
   loading.hidden=true;
 }catch(error){
   loading.textContent='NOTES LIBRARY COULD NOT START: '+error.message+' · Refresh or return to LedgerPeer.';
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})(window);
