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
const outcomeLessons=root.LedgerOutcomeLessons||{};
const textbookLessons=Object.assign({},root.LedgerStructuredLessonChapters||{},root.LedgerEditorialAdvancedChapters||{},root.LedgerEditorialFiaAppliedChapters||{},root.LedgerEditorialManagement01||{},root.LedgerEditorialManagement02||{},root.LedgerEditorialManagement03||{},root.LedgerEditorialManagement04||{},root.LedgerEditorialManagement05||{},root.LedgerEditorialFinancial01||{},root.LedgerEditorialFinancial02||{},root.LedgerEditorialFinancial03||{},root.LedgerEditorialFinancial04||{},root.LedgerEditorialFinancial05||{},root.LedgerEditorialFinancial06||{},root.LedgerEditorialFinancial07||{},root.LedgerEditorialBusiness01||{},root.LedgerEditorialBusiness02||{},root.LedgerEditorialBusiness03||{},root.LedgerEditorialBusiness04||{},root.LedgerEditorialBusiness05||{},root.LedgerEditorialBusiness06||{},root.LedgerEditorialBusiness07||{},root.LedgerEditorialAuditFoundation01||{},root.LedgerEditorialAuditFoundation02||{},root.LedgerEditorialAuditFoundation03||{},root.LedgerEditorialAuditFoundation04||{},root.LedgerEditorialAuditFoundation05||{},root.LedgerEditorialAuditFoundation06||{},root.LedgerEditorialFoundationFinance01||{},root.LedgerEditorialFoundationFinance02||{},root.LedgerEditorialFoundationFinance03||{},root.LedgerEditorialFoundationFinance04||{},root.LedgerEditorialPM01||{},root.LedgerEditorialPM02||{},root.LedgerEditorialPM03||{},root.LedgerEditorialPM04||{},root.LedgerEditorialPM05||{},root.LedgerEditorialPM06||{},root.LedgerEditorialLawENG2026||{},root.LedgerEditorialLawENG2026Part2||{},root.LedgerEditorialSBR2026A||{},root.LedgerEditorialSBR2026B||{},root.LedgerEditorialFR2026A||{},root.LedgerEditorialFR2026B||{},root.LedgerEditorialAA2026A||{},root.LedgerEditorialAA2026B||{},root.LedgerEditorialAA2026C||{},root.LedgerEditorialFM2026A||{},root.LedgerEditorialFM2026B||{},root.LedgerEditorialFM2026C||{},root.LedgerEditorialAFM2026A||{},root.LedgerEditorialAFM2026B||{},root.LedgerEditorialAFM2026C||{},root.LedgerEditorialManagement03||{},root.LedgerEditorialManagement04||{},root.LedgerEditorialManagement05||{},root.LedgerSupplementalTextbooks||{},root.LedgerSupplementalTextbooksA2||{},root.LedgerSupplementalTextbooksProfessional||{},root.LedgerSupplementalTextbooksA3Foundation||{},root.LedgerSupplementalTextbooksA3Professional||{},root.LedgerSupplementalTextbooksBatch4A||{},root.LedgerSupplementalTextbooksBatch4B||{},root.LedgerSupplementalTextbooksBatch4C||{},root.LedgerSupplementalTextbooksBatch4D||{},root.LedgerTextbookFA1A||{},root.LedgerTextbookFA1B||{},root.LedgerTextbookMA1||{},root.LedgerTextbookMA2A||{},root.LedgerTextbookMA2B||{},root.LedgerTextbookFA2A||{},root.LedgerTextbookFA2B||{},root.LedgerTextbookFA2C||{});
const integratedCases=root.LedgerMasterCases||{};
const renderChapterVisual=root.renderLedgerChapterVisual||null;
const renderNumericalTable=root.renderLedgerNumericalTable||null;
const illustratedLessons=root.LedgerVisualWorkbook?.topics||{};
const officialSyllabusPages={FA2:'https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/fa2/fa2-syllabus-study-guide.html',MA2:'https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/ma2/ma2-syllabus-study-guide.html'};
const financialExaminableDocs={FA2:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/fa2_ffa_s26_j27_examinable_docs.pdf',FA:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/fa2_ffa_s26_j27_examinable_docs.pdf',FFA:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/fa2_ffa_s26_j27_examinable_docs.pdf'};
const verifiedFiaSources={FA2:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/FA2%20S25-A26%20syllabus%20and%20study%20guide%20-%20final.pdf',MA2:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/MA2%20S25-A26%20syllabus%20and%20study%20guide%20-%20final.pdf'};
let paper='ALL',qualification='all',filter='all',query='';
const searchParams=new URLSearchParams(location.search);
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function link(label,url,cls){
 const a=node('a',cls,label);
 if(/^https:\/\/www\.accaglobal\.com\//.test(url)){
    a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 }else if(/^(notes\.html\?|fia-study\.html(?:\?|$)|quiz\.html(?:\?|$))/.test(url)){a.href=url}
 else{a.href='https://www.accaglobal.com/my/en/student/exam-support-resources.html';a.target='_blank';a.rel='noopener noreferrer'}
 return a;
}
function syllabusCode(t){const m=/^([A-Z]\d+)\s*·\s*(.*)$/.exec(t);return m?{code:m[1],title:m[2]}:{code:'—',title:t}}
function info(code){const p=PAPERS.find(x=>x.code===code);return {name:p?.name||code,description:p?.stage||'',topics:syllabus[code]?.topics||[],source:officialSyllabusPages[code]||syllabus[code]?.source||null,edition:officialSyllabusPages[code]?'ACCA 2026–27 GUIDE PUBLISHED · INDEPENDENT DETAILED OUTCOME REVIEW PENDING':syllabus[code]?.edition||null,variant:syllabus[code]?.variant||'GLO'}}
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
function appendOutcomeTeaching(parent,paperCode,topicCode){
 const d=outcomeLessons[paperCode+':'+topicCode];if(!d)return false;
 const section=node('section','notes-outcome-teaching');
 section.append(node('h3','','INDIVIDUAL SYLLABUS LEARNING OUTCOMES'));
 section.append(node('p','notes-review-status',d.edition+' · ACCA outcome IDs; original LedgerPeer explanations'));
 const intro=node('p','','Each outcome below has its own K (knowledge) or S (skill) requirement. These notes are an independently authored expansion, not official ACCA study text or a certification of the 2026–27 edition.');section.append(intro);
 for(const [id,o] of Object.entries(d.outcomes)){
  const article=node('article','notes-outcome-card');
  const head=node('h4','');head.append(node('span','notes-outcome-code',topicCode+'.'+id+' ['+o.level+']'),document.createTextNode(' '+o.title));
  article.append(head,node('p','',o.explanation));section.append(article);
 }
 if(d.workings?.length){
  section.append(node('h3','','STEP-BY-STEP EXAM WORKINGS'));
  for(const w of d.workings){
   const work=node('article','notes-outcome-worked');
   work.append(node('h4','',w.title),node('p','',w.question),node('h5','','WORKING AND ANSWER'),node('p','',w.solution));section.append(work);
  }
 }
 section.append(link('VERIFIED REFERENCE: ACCA 2025–26 STUDY GUIDE ↗',d.source));
 parent.append(section);return true;
}
function appendTextbook(parent,paperCode,topicCode){
 const chapterData=textbookLessons[paperCode+':'+topicCode];if(!chapterData)return false;
 const provisional=chapterData.sourceKind==='structured-expansion';
 const chapter=node('section','lp-textbook');
 chapter.append(node('p','lp-textbook-eyebrow',(provisional?'LEDGERPEER STRUCTURED TEACHING DRAFT':'LEDGERPEER TEXTBOOK')+' · '+paperCode+' / '+topicCode));
 chapter.append(node('h3','lp-textbook-title',chapterData.title));
 if(renderChapterVisual)renderChapterVisual(chapter,{paper:paperCode,code:topicCode,title:chapterData.title,note:lessons[paperCode+':'+topicCode],book:chapterData});
 if(renderNumericalTable)renderNumericalTable(chapter,paperCode,topicCode);
 chapter.append(node('p','lp-textbook-intro',provisional?'This topic has a longer structured teaching draft, built from its existing topic-specific explanations and problems. It is NOT an independently authored, full-syllabus chapter. Detailed syllabus outcomes and challenge quality still require review.':'Original independently written teaching and worked examples. This is not ACCA-published text. Individual 2026–27 learning-outcome equivalence still requires external checking.'));
 const nav=node('nav','lp-textbook-contents');
 nav.setAttribute('aria-label','Contents for '+paperCode+' '+topicCode);
 nav.append(node('strong','','IN THIS CHAPTER'));
 const ol=node('ol','');
 chapterData.sections.forEach((section,i)=>{
   const li=node('li',''),a=node('a','',section[0]);
   a.href='#tx-'+paperCode+'-'+topicCode+'-'+i;li.append(a);ol.append(li);
 });
 nav.append(ol);chapter.append(nav);
 chapterData.sections.forEach((section,i)=>{
   const article=node('section','lp-textbook-section');
   article.id='tx-'+paperCode+'-'+topicCode+'-'+i;
   article.append(node('h4','',String(i+1)+'. '+section[0]));
   for(const paragraph of section[1].split('\n\n'))article.append(node('p','',paragraph));
   chapter.append(article);
 });
 const practice=node('section','lp-textbook-work');
 practice.append(node('h4','','WORKED EXAM APPLICATIONS'));
 chapterData.workings.forEach((worked,i)=>{
   const article=node('article','lp-textbook-problem');
   article.append(node('h5','',String(i+1)+'. '+worked[0]));
   article.append(node('p','lp-textbook-question',worked[1]));
   const answer=node('details','lp-textbook-answer');
   answer.append(node('summary','','REVEAL COMPLETE WORKING / EXPLANATION'),node('p','',worked[2]));
   article.append(answer);practice.append(article);
 });
 chapter.append(practice);
 const fullCase=integratedCases[paperCode+':'+topicCode];
 if(fullCase){
   const caseArticle=node('section','lp-integrated-case');
   caseArticle.append(node('p','lp-case-marker','COMPLETE ACCOUNTING CASE STUDY'));
   caseArticle.append(node('h4','',fullCase.title),node('p','lp-case-context',fullCase.context));
   const steps=node('ol','lp-case-steps');
   for(const step of fullCase.steps)steps.append(node('li','',step));
   caseArticle.append(steps);
   caseArticle.append(node('h5','','RECONCILIATION / CONCLUSION'),node('p','',fullCase.reconciliation));
   caseArticle.append(node('h5','','EXAM TRAP'),node('p','',fullCase.pitfall));
   chapter.append(caseArticle);
 }
 chapter.append(node('p','lp-textbook-end','END OF CHAPTER · Review the formulae and practise variations.'));
 parent.append(chapter);
 return true;
}
function makeLesson(n,src,paperCode){
 const layout=node('div','notes-lesson-layout');
 const main=node('div','notes-lesson-main');
 layout.classList.add('notes-lesson-layout--visual');
 const isTextbook=Boolean(textbookLessons[paperCode+':'+n.code]);
 if(illustratedLessons[paperCode+':'+n.code])layout.classList.add('notes-lesson-layout--visual');
 const detailed=Boolean(outcomeLessons[paperCode+':'+n.code]);
 if(isTextbook){
   const key=paperCode+':'+n.code;
   if(illustratedLessons[key]&&root.renderLedgerVisualWorkbook){
     root.renderLedgerVisualWorkbook(main,key);
     if(renderNumericalTable)renderNumericalTable(main,paperCode,n.code);
     // The complete textbook is primary teaching, not optional buried material.
     // Keep visual drills above it, but never make students discover the full chapter.
     main.append(node('p','notes-lesson-scope',textbookLessons[key].sourceKind==='structured-expansion'?'STRUCTURED LEARNING DRAFT · CONTENT REVIEW REQUIRED':'FULL TEXTBOOK CHAPTER · STEP-BY-STEP TEACHING AND EXAM APPLICATIONS'));
     appendTextbook(main,paperCode,n.code);
   }else{
     main.append(node('p','notes-lesson-scope',textbookLessons[key].sourceKind==='structured-expansion'?'STRUCTURED LEARNING DRAFT · CONTENT REVIEW REQUIRED':'LONG-FORM TEXTBOOK CHAPTER · ORIGINAL TEACHING'));
     appendTextbook(main,paperCode,n.code);
   }
   const extras=node('details','lp-legacy-notes');
   extras.append(node('summary','','Earlier revision notes and prior-edition learning outcomes'));
   extras.append(node('p','',n.summary));
   if(detailed)appendOutcomeTeaching(extras,paperCode,n.code);
   const chapterKey=root.LedgerFiaGuides?.topicChapters?.[paperCode+':'+n.code];
   if(chapterKey&&root.appendFiaTeaching)root.appendFiaTeaching(extras,paperCode,chapterKey);
   main.append(extras);
 }else{
   main.append(node('p','notes-lesson-scope',detailed?'PREVIOUS-EDITION OUTCOME EXPANSION · RECHECK REQUIRED':'SHORT LESSON · NOT FULL SYLLABUS TEACHING'));
   if(!detailed)main.append(node('p','notes-review-status','Individual learning-outcome teaching is not yet written for this heading.'));
   if(n.reviewStatus)main.append(node('p','notes-review-status',n.reviewStatus+' · '+(n.updatedAt||'2026-10-23')));
   if(renderChapterVisual)renderChapterVisual(main,{paper:paperCode,code:n.code,title:syllabus[paperCode]?.topics?.find(t=>t.startsWith(n.code+' · '))?.split(' · ').slice(1).join(' · ')||n.code,note:n});
   // Publish all available topic-specific teaching rather than reducing the
   // lesson to three bullets; never call a short introduction a finished book.
   const summaryBlock=node('article','lv-short-revision');
   summaryBlock.append(node('h3','','THE PRINCIPLE AND WHY IT MATTERS'),node('p','',n.summary));
   const method=node('ol','lv-checklist');
   (n.steps||[]).forEach(step=>method.append(node('li','',step)));
   summaryBlock.append(node('h3','','HOW TO APPLY THE METHOD'),method);
   if(n.formula)summaryBlock.append(node('h4','','FORMULA, TEST OR RULE'),node('p','lv-formula',n.formula));
   if(n.example){
     const application=node('section','lv-topic-application');
     application.append(node('h3','','ILLUSTRATED APPLICATION'),node('p','',n.example));
     summaryBlock.append(application);
   }
   if(n.trap){
     const pitfall=node('section','lv-topic-pitfall');
     pitfall.append(node('h3','','WHERE STUDENTS LOSE MARKS'),node('p','',n.trap));
     summaryBlock.append(pitfall);
   }
   if(n.check){
     const exercise=node('details','lv-topic-exercise');
     exercise.append(node('summary','','TEST YOUR UNDERSTANDING · '+n.check));
     exercise.append(node('p','',n.answer||'Refer to the relevant rule above and explain your conclusion.'));
     summaryBlock.append(exercise);
   }
   main.append(summaryBlock);
   if(detailed)appendOutcomeTeaching(main,paperCode,n.code);
   const chapterKey=root.LedgerFiaGuides?.topicChapters?.[paperCode+':'+n.code];
   if(chapterKey&&root.appendFiaTeaching)root.appendFiaTeaching(main,paperCode,chapterKey);
   main.append(node('p','notes-review-status','Not yet a comprehensive textbook chapter. The diagram and procedure are topic-specific study aids, not confirmation of full 2026–27 syllabus coverage.'));
 }
 const side=node('aside','notes-sidebox');
 textBlock(side,'EXAM TRAP',n.trap);
 if(n.formula)textBlock(side,'QUICK FORMULA',n.formula);
 const check=node('details','notes-check');
 check.append(node('h4','','SELF CHECK'),node('summary','',n.check),node('div','notes-check-answer',n.answer));
 side.append(check);
 side.append(link('PRACTICE '+paperCode+' / '+n.code+' →','quiz.html?paper='+paperCode+'&topic='+n.code,'notes-guide-link'));
 side.append(link('OFFICIAL 2026–27 SYLLABUS ↗',src || resourceLink(paperCode)));
 if(financialExaminableDocs[paperCode])side.append(link('2026–27 EXAMINABLE IFRS DOCUMENTS ↗',financialExaminableDocs[paperCode]));
 layout.append(main,side);return layout;
}
function buildTopic(paperCode,item,index){
 const p=info(paperCode),tag=syllabusCode(item),n=lessons[paperCode+':'+tag.code];
 const el=node('details','notes-topic');
 el.id='topic-'+paperCode+'-'+tag.code;
 const summary=node('summary');
 const c=node('span','notes-topic-code',tag.code);
 const title=node('div','notes-topic-title');
 title.append(node('strong','',tag.title),node('small','',paperCode+' · '+(illustratedLessons[paperCode+':'+tag.code]?'ILLUSTRATED ACCOUNTING WORKBOOK':textbookLessons[paperCode+':'+tag.code]?.sourceKind==='structured-expansion'?'STRUCTURED TEACHING DRAFT · REVIEW PENDING':textbookLessons[paperCode+':'+tag.code]?'EXTENDED TOPIC TEACHING':outcomeLessons[paperCode+':'+tag.code]?'EXPANDED OUTCOMES · EDITION RECHECK PENDING':n?'INTRODUCTORY TOPIC LESSON':'SYLLABUS OUTLINE / OFFICIAL RESOURCE')));
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
 const total=codes.reduce((sum,code)=>sum+info(code).topics.length,0);
 const authored=codes.reduce((sum,code)=>sum+info(code).topics.filter(t=>{
  const parsed=syllabusCode(t);const book=textbookLessons[code+':'+parsed.code];
  return Boolean(book&&book.sourceKind!=='structured-expansion');
 }).length,0);
 const structured=total-authored;
 const coverage=node('p','notes-chapter-coverage',
  'STUDY PAGES '+total+' / '+total+' · '+authored+' independently authored extended chapters · '+structured+' structured teaching drafts still awaiting subject-specific development. Full examinable-outcome coverage is NOT certified.');
 coverage.setAttribute('role','status');
 left.append(coverage);
 area.append(left);
 const right=node('div');
 if(paper!=='ALL'){
   const source=info(paper).source;
   right.append(link('OFFICIAL 2026–27 SYLLABUS ↗',source||resourceLink(paper)));
   if(financialExaminableDocs[paper])right.append(link('EXAMINABLE IFRS DOCUMENTS · 2026–27 ↗',financialExaminableDocs[paper]));
   right.append(document.createTextNode(' '));
   right.append(link('EXAM SUPPORT ↗',resourceLink(paper)));
 }else{right.append(link('ACCA EXAM RESOURCE FINDER ↗','https://www.accaglobal.com/my/en/student/exam-support-resources.html'))}
 area.append(right);
}
function render(){
 const guide=byId('fiaLibraryGuides');
 if(guide){guide.hidden=qualification==='acca';const link=byId('fiaGuideLibraryLink');if(link)link.href='fia-study.html'+(paper!=='ALL'&&qualificationOf(paper)==='fia'?'?paper='+encodeURIComponent(paper):'');}
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
   if(filter==='visual'&&!illustratedLessons[code+':'+t.code]||filter==='lesson'&&(!textbookLessons[code+':'+t.code]||textbookLessons[code+':'+t.code]?.sourceKind==='structured-expansion')||filter==='outline'&&textbookLessons[code+':'+t.code]?.sourceKind!=='structured-expansion')continue;
   if(q){
     const extra=outcomeLessons[code+':'+t.code],book=textbookLessons[code+':'+t.code],illustrated=illustratedLessons[code+':'+t.code];
      const hay=[code,item,info(code).name,lesson?.summary,lesson?.formula,lesson?.trap,lesson?.example,...(lesson?.steps||[]),...Object.values(extra?.outcomes||{}).flatMap(o=>[o.title,o.explanation]),...(book?.sections||[]).flat(),...(book?.workings||[]).flat(),...(illustrated?.sections||[]).flatMap(v=>[v.heading,...v.paras]),...(illustrated?.drills||[]).flatMap(v=>[v.question,v.answer])].filter(Boolean).join(' ').toLowerCase();
     if(!hay.includes(q))continue;
   }
   const el=buildTopic(code,item,rendered);
   list.append(el);rendered++;
  }
 }
 byId('notesEmpty').hidden=rendered!==0;
 const suffix=paper==='ALL'?'ACROSS '+activePapers.length+' PAPERS':paper+' SYLLABUS';
 byId('notesCount').textContent=rendered+' MATCHING TOPICS · '+activePapers.reduce((n,p)=>n+Object.keys(textbookLessons).filter(k=>k.startsWith(p+':')).length,0)+' TEXTBOOK CHAPTERS · '+detailCount+' STARTER LESSONS / '+total+' · '+suffix;
 if(searchParams.has('topic') && !query && filter==='all'){
   const code=searchParams.get('topic')?.toUpperCase();
   const desired=byId('topic-'+paper+'-'+code);
   if(desired){desired.open=true;desired.scrollIntoView({block:'center',behavior:'auto'});searchParams.delete('topic')}
 }
}

function renderCoverage(){
 const rows=byId('coverageRows');rows.replaceChildren();let total=0,taught=0,expanded=0,books=0;
 for(const p of PAPERS){
  const data=info(p.code),count=data.topics.filter(t=>lessons[p.code+':'+syllabusCode(t).code]).length;
  const detailedCount=data.topics.filter(t=>Boolean(outcomeLessons[p.code+':'+syllabusCode(t).code])).length;
  const bookCount=data.topics.filter(t=>Boolean(textbookLessons[p.code+':'+syllabusCode(t).code])).length;
   total+=data.topics.length;taught+=count;expanded+=detailedCount;books+=bookCount;
  const row=node('tr');
  const name=node('th');name.scope='row';name.append(node('strong','',p.code+' / '+data.variant),node('small','',p.name));
  const available=node('td','',count+' / '+data.topics.length);
   const audited=node('td','',String(bookCount)+' / '+data.topics.length);
  const mapped=node('td','',String(detailedCount)+' / '+data.topics.length);
  const missing=node('td','',String(data.topics.length-count));
  const destination=node('td');destination.append(link('OPEN '+p.code+' →','notes.html?paper='+p.code));
  row.append(name,available,audited,mapped,missing,destination);rows.append(row);
 }
 byId('coverageSummary').textContent=books+' TEXTBOOK CHAPTERS / '+total+' HEADINGS · '+expanded+' WITH PREVIOUS OUTCOME MAPS';
}

async function init(){
 const loading=byId('notesLoading');
 try{
   if(root.LedgerNotesDocumentBuild!=='2026.10.31.21'||root.LedgerNotesVisualBuild!=='2026.10.31.21')throw Error('Notes page and diagram scripts are from different builds. Select the build button above to check for updates, or reopen Notes with a fresh link.');
   if(!root.PersonalHubAuth)throw Error('Student authentication unavailable.');
   const valid=await root.PersonalHubAuth.ready();
   if(!valid){if(!root.PersonalHubAuth.isRedirectingToProfile?.())location.replace('index.html');return}
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

