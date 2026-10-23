(function(root){'use strict';
const byId=id=>document.getElementById(id);
// Reuse the authoritative cross-platform subject catalog rather than hiding ACCA papers.
const PAPERS=root.SubjectCatalog?.papers||[];
const FIA_PAPERS=PAPERS.filter(p=>p.stage.startsWith('FIA'));
const ACCA_PAPERS=PAPERS.filter(p=>p.stage.startsWith('ACCA'));
function visiblePapers(){return qualification==='fia'?FIA_PAPERS:qualification==='acca'?ACCA_PAPERS:PAPERS}
function qualificationOf(code){return FIA_PAPERS.some(p=>p.code===code)?'fia':ACCA_PAPERS.some(p=>p.code===code)?'acca':'all'}
const syllabus=root.LedgerNotesSyllabi?.papers||{};
const lessons=root.LedgerFiaNotes||{};
let paper='ALL',qualification='all',filter='all',query='';
const searchParams=new URLSearchParams(location.search);
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function link(label,url,cls){
 const a=node('a',cls,label);
 if(/^https:\/\/www\.accaglobal\.com\//.test(url)){
    a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 }else if(/^(notes\.html\?|fia-study\.html(?:\?|$))/.test(url)){a.href=url}
 else{a.href='https://www.accaglobal.com/my/en/student/exam-support-resources.html';a.target='_blank';a.rel='noopener noreferrer'}
 return a;
}
function syllabusCode(t){const m=/^([A-Z]\d+)\s*·\s*(.*)$/.exec(t);return m?{code:m[1],title:m[2]}:{code:'—',title:t}}
function info(code){const p=PAPERS.find(x=>x.code===code);return {name:p?.name||code,description:p?.stage||'',topics:syllabus[code]?.topics||[],source:syllabus[code]?.source||null,edition:syllabus[code]?.edition||null,variant:syllabus[code]?.variant||'GLO'}}
function stageLabel(){return qualification==='fia'?'FIA / FOUNDATION':qualification==='acca'?'ACCA / FULL QUALIFICATION':'FIA + ACCA / ALL 25 PAPERS'}
function updateQualificationButtons(){
 document.querySelectorAll('[data-notes-qualification]').forEach(btn=>{
  const active=btn.dataset.notesQualification===qualification;
  btn.setAttribute('aria-pressed',String(active));btn.classList.toggle('active',active);
 });
 const badge=byId('qualificationBadge');if(badge)badge.textContent=stageLabel();
}
function resourceLink(code){return 'https://www.accaglobal.com/my/en/student/exam-support-resources.html'}
function renderPaperOptions(){
 const select=byId('paperSelect');select.replaceChildren();
 const all=node('option',null,qualification==='all'?'ALL 25 FIA + ACCA PAPERS':qualification==='fia'?'ALL 10 FIA PAPERS':'ALL 15 ACCA PAPERS');all.value='ALL';select.append(all);
 let stage='',group=null;
 for(const p of visiblePapers()){
  if(p.stage!==stage){stage=p.stage;group=node('optgroup');group.label=stage;select.append(group)}
  const opt=node('option',null,p.code+' · '+p.name+(syllabus[p.code]?.variant?' ('+syllabus[p.code].variant+')':''));opt.value=p.code;group.append(opt);
 }
 if(paper!=='ALL'&&!visiblePapers().some(p=>p.code===paper))paper=qualification==='acca'?'BT':qualification==='fia'?'FA2':'ALL';
 select.value=paper;
 updateQualificationButtons();
}
function changeQualification(next){
 if(!['fia','acca','all'].includes(next))return;
 qualification=next;
 paper=next==='fia'?'FA2':next==='acca'?'BT':'ALL';
 renderPaperOptions();render();
}
function textBlock(parent,title,text,cls){
 const block=node('div',cls||'');block.append(node('h4','',title),node('p','',text));parent.append(block);return block
}
function makeLesson(n,src,paperCode){
 const layout=node('div','notes-lesson-layout');
 const main=node('div','notes-lesson-main');
 main.append(node('p','notes-lesson-scope',(n.scope||'Core topic lesson').toUpperCase()+' · INTRODUCTION + WORKED APPLICATION'));
 if(n.reviewStatus)main.append(node('p','notes-review-status',n.reviewStatus+' · '+(n.updatedAt||'2026-10-23')));
 main.append(node('p','',n.summary));
 const chapterKey=root.LedgerFiaGuides?.topicChapters?.[paperCode+':'+n.code];
 if(chapterKey&&root.appendFiaTeaching)root.appendFiaTeaching(main,paperCode,chapterKey);
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
 if(FIA_PAPERS.some(p=>p.code===paperCode))side.append(link('READ THE EXPANDED '+paperCode+' STUDY GUIDE →','fia-study.html?paper='+paperCode,'notes-guide-link'));
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
 title.append(node('strong','',tag.title),node('small','',paperCode+' · '+(n?'CORE TOPIC LESSON':'SYLLABUS OUTLINE / OFFICIAL RESOURCE')));
 summary.append(c,title,node('span','notes-expand','+'));el.append(summary);
 const content=node('div','notes-topic-detail');
 let loaded=false;
 function loadContent(){
 if(loaded)return;loaded=true;
 if(n){content.append(makeLesson(n,p.source,paperCode))}
 else{
   const outline=node('p','notes-outline','This syllabus heading does not yet have a LedgerPeer core lesson. Its detailed learning outcomes still require study. Use the official syllabus and Study Hub chapters for complete examinable coverage. We do not present a generic placeholder as a finished note.');
   const note=node('div','notes-outline');
   note.append(link('VIEW OFFICIAL PAPER SYLLABUS ↗',p.source||resourceLink(paperCode)),document.createTextNode(' · '),
     link('ACCA EXAM RESOURCES ↗',resourceLink(paperCode)));
   content.append(outline,note);
 }
 }
 el.addEventListener('toggle',()=>{if(el.open)loadContent()});
 el.append(content);return el;
}
function renderIntro(codes){
 const area=byId('paperIntro');area.replaceChildren();
 const left=node('div');
 const label=node('span','notes-eyebrow',paper==='ALL'?'CROSS-PAPER STUDY':'CURRENT PAPER');
 left.append(label);
 left.append(node('h3','',paper==='ALL'?qualification==='all'?'EVERY FIA AND ACCA SYLLABUS TOPIC':qualification==='acca'?'ALL ACCA QUALIFICATION TOPICS':'ALL FIA SYLLABUS TOPICS':paper+' / '+info(paper).name));
 left.append(node('p','',paper==='ALL'?'Search the published 2026–27 syllabus topic index across '+visiblePapers().length+' papers. Core lessons include teaching points, worked examples and self-checks. Use the coverage map to identify remaining gaps; each paper’s detailed learning outcomes and exam practice require separate review.':info(paper).description+' · VARIANT '+info(paper).variant+' · '+info(paper).topics.length+' syllabus headings · '+(info(paper).edition||'check current examinable edition')));
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
 const activePapers=paper==='ALL'?visiblePapers().map(p=>p.code):[paper];
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
 const suffix=paper==='ALL'?'ACROSS '+activePapers.length+' PAPERS':paper+' SYLLABUS';
 byId('notesCount').textContent=rendered+' MATCHING TOPICS · '+detailCount+' CORE LESSONS / '+total+' HEADINGS · '+suffix;
 if(searchParams.has('topic') && !query && filter==='all'){
   const code=searchParams.get('topic')?.toUpperCase();
   const desired=byId('topic-'+paper+'-'+code);
   if(desired){desired.open=true;desired.scrollIntoView({block:'center',behavior:'auto'});searchParams.delete('topic')}
 }
}

function renderCoverage(){
 const rows=byId('coverageRows');rows.replaceChildren();let total=0,taught=0;
 for(const p of PAPERS){
  const data=info(p.code),count=data.topics.filter(t=>lessons[p.code+':'+syllabusCode(t).code]).length;
  total+=data.topics.length;taught+=count;
  const row=node('tr');
  const name=node('th');name.scope='row';name.append(node('strong','',p.code+' / '+data.variant),node('small','',p.name));
  const available=node('td','',count+' / '+data.topics.length);
  const missing=node('td','',String(data.topics.length-count));
  const destination=node('td');destination.append(link('OPEN '+p.code+' →','notes.html?paper='+p.code));
  row.append(name,available,missing,destination);rows.append(row);
 }
 byId('coverageSummary').textContent=taught+' / '+total+' HEADINGS WITH CORE LESSONS';
}

async function init(){
 const loading=byId('notesLoading');
 try{
   if(!root.PersonalHubAuth)throw Error('Student authentication unavailable.');
   const valid=await root.PersonalHubAuth.ready();
   if(!valid){location.replace('index.html');return}
   if(!root.LedgerNotesSyllabi||!root.LedgerFiaNotes||!root.SubjectCatalog?.papers?.length)throw Error('Subject catalog or syllabus bundle not loaded. Please refresh.');
   const arg=searchParams.get('paper')?.toUpperCase();
   if(arg==='ALL'){
      const scope=searchParams.get('qualification')?.toLowerCase();
      qualification=['fia','acca','all'].includes(scope)?scope:'all';paper='ALL';
   }else if(arg && PAPERS.some(p=>p.code===arg)){
      paper=arg;qualification=qualificationOf(arg);
   }else{
      const scope=searchParams.get('qualification')?.toLowerCase();
      if(['fia','acca','all'].includes(scope)){qualification=scope;paper=scope==='acca'?'BT':scope==='fia'?'FA2':'ALL'}
   }
   renderPaperOptions();renderCoverage();
   byId('paperSelect').addEventListener('change',e=>{paper=e.target.value;render()});
   document.querySelectorAll('[data-notes-qualification]').forEach(btn=>btn.addEventListener('click',()=>changeQualification(btn.dataset.notesQualification)));
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

