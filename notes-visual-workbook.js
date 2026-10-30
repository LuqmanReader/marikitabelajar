/* LedgerPeer visual accounting textbook UI. Uses original authored data and safe textContent. */
(function(root){
'use strict';
const data=root.LedgerVisualWorkbook||{};
const lessons=data.topics||{};
const E=(tag,cls,text)=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined)el.textContent=String(text);
  return el;
};
const caption=(name)=>E('caption','vw-table-caption',name);
function addTable(parent,heading,headers,rows,options){
  const section=E('section','vw-table-section');
  if(heading)section.append(E('h4','vw-minor-heading',heading));
  const scroller=E('div','vw-scroll');
  scroller.tabIndex=0;
  scroller.setAttribute('aria-label',heading||'Accounting table');
  const t=E('table','vw-table');
  t.append(caption(heading||'Accounting illustration'));
  const thead=E('thead');const hr=E('tr');
  for(const h of headers){const th=E('th','',h);th.scope='col';hr.append(th)}
  thead.append(hr);t.append(thead);
  const body=E('tbody');
  for(const r of rows){
    const tr=E('tr');
    const total=String(r[0]).toUpperCase()==='TOTAL'||String(r[0]).startsWith('PROFIT')||String(r[0]).startsWith('TOTAL ASSETS')||String(r[0]).startsWith('LIABILITIES + EQUITY');
    if(total)tr.className='vw-table-total';
    r.forEach((value,j)=>{
       const cell=E(j===0?'th':'td',j===0?'vw-row-label':'',value||'—');
       if(j===0)cell.scope='row';
       if(options?.money&&j>0)cell.classList.add('vw-money');
       tr.append(cell);
    });
    body.append(tr);
  }
  t.append(body);scroller.append(t);section.append(scroller);parent.append(section);return section;
}
function image(parent,src,alt,captionText){
 const figure=E('figure','vw-figure');
 const img=E('img');img.src=src+'?v=20261030usd5';img.alt=alt;img.loading='lazy';img.decoding='async';img.width=1200;img.height=510;
 figure.append(img,E('figcaption','',captionText));parent.append(figure);
}
function accounts(parent,arr){
 const sec=E('section','vw-accounts');
 sec.append(E('h3','','DRAW THE GENERAL LEDGER — T-ACCOUNTS'));
 sec.append(E('p','','These accounts use the SAME transactions as the journal. Balance c/d is added for balancing only and is brought forward as b/d next period.'));
 const g=E('div','vw-account-grid');
 for(const a of arr){
   const card=E('div','vw-t-account');
   card.append(E('h4','',a.name));
   const cols=E('div','vw-t-cols');
   for(const [side,entries]of [['Dr',a.debit],['Cr',a.credit]]){
     const col=E('div','vw-t-col');col.append(E('strong','vw-t-side',side));
     for(const [n,v]of entries){const item=E('div','vw-t-item');item.append(E('span','',n),E('span','vw-num',v));col.append(item)}
     cols.append(col);
   }
   card.append(cols,E('p','vw-t-balance','CLOSING BALANCE · '+a.balance));g.append(card);
 }
 sec.append(g);parent.append(sec);
}
function section(parent,info,i){
 const sec=E('section','vw-prose-section');
 sec.append(E('h3','',String(i+1).padStart(2,'0')+' / '+info.heading));
 for(const p of info.paras)sec.append(E('p','',p));
 if(info.table)addTable(sec,info.heading+' — reference table',info.table.headers,info.table.rows);
 parent.append(sec);
}
function drills(parent,questions){
 const sec=E('section','vw-drills');sec.append(E('h3','','CHECK YOU CAN APPLY IT'));
 sec.append(E('p','','Try answering before opening each explanation. The worked solution is under each question; do not just memorise the final number.'));
 questions.forEach((q,i)=>{
   const details=E('details','vw-drill');
   details.append(E('summary','',String(i+1)+'. '+q.question));
   const ans=E('div','vw-drill-answer');
   ans.append(E('strong','','WORKED ANSWER'),E('p','',q.answer));details.append(ans);sec.append(details);
 });
 parent.append(sec);
}
function appendCase(parent,work){
 const caseSec=E('section','vw-full-case');
 caseSec.append(E('h3','',work.title));
 caseSec.append(E('p','vw-lead',work.intro));
 addTable(caseSec,'SOURCE DOCUMENTS → JOURNAL ACCOUNT CHANGES',['Event','What happened?','Evidence','Double-entry'],work.transactions);
 const detail=E('details','vw-case-details');
 detail.open=true;
 detail.append(E('summary','','VIEW THE COMPLETE GENERAL JOURNAL'));
 addTable(detail,'GENERAL JOURNAL: ALL NINE EVENTS',['Event','Account','Debit RM','Credit RM'],work.journals,{money:true});
 detail.append(E('p','vw-note',data.shared.journalExplainer));caseSec.append(detail);
 accounts(caseSec,work.accounts);
 caseSec.append(E('p','vw-note',data.shared.ledgerExplainer));
 addTable(caseSec,'ADJUSTED TRIAL BALANCE',['Account','Debit RM','Credit RM'],work.trial,{money:true});
 const pair=E('div','vw-statement-grid');
 addTable(pair,'STATEMENT OF PROFIT OR LOSS',['Line','RM'],work.pAndL);
 addTable(pair,'STATEMENT OF FINANCIAL POSITION',['Line','RM'],work.sofp);
 caseSec.append(pair,E('p','vw-note',data.shared.statementExplainer));
 parent.append(caseSec);
}
function appendMistakes(parent){
 const sec=E('section','vw-mistakes');
 sec.append(E('h3','','COMMON EXAM ERRORS — AND WHY THEY ARE WRONG'));
 const ol=E('ol');
 for(const mistake of data.shared.commonMistakes)ol.append(E('li','',mistake));
 sec.append(ol);parent.append(sec);
}
root.renderLedgerVisualWorkbook=function(host,key){
 const d=lessons[key];if(!d)return false;
 const article=E('article','vw-reader');
 article.append(E('p','vw-kicker','LEDGERPEER · ORIGINAL ILLUSTRATED ACCOUNTING LESSON'));
 article.append(E('h2','vw-title',d.label));
 article.append(E('p','vw-subtitle','A step-by-step lesson with actual bookkeeping records, visual diagrams, ledger workings and exam practice—not a short revision summary.'));
 const outcomes=E('section','vw-objectives');
 outcomes.append(E('h3','','WHAT YOU SHOULD BE ABLE TO DO'));
 const ol=E('ol');for(const objective of d.objectives)ol.append(E('li','',objective));
 outcomes.append(ol);article.append(outcomes);
 image(article,key==='FA1:B1'?'assets/ledgerpeer-double-entry-rules.svg':'assets/ledgerpeer-accounting-flow.svg',
   key==='FA1:B1'?'Debit/credit visual: asset and expense increase by debit while liability, capital and income increase by credit.':
     'Source evidence flows through books of original entry, nominal and customer ledgers, trial balance, adjustments and final statements.',
   'Figure 1. Original LedgerPeer learning diagram. A written table and example follow for accessible reading.');
 d.sections.forEach((info,i)=>section(article,info,i));
 if(key==='FA1:B1')image(article,'assets/ledgerpeer-accounting-flow.svg',
   'Six stages of the accounting information path, from source document to financial statements.',
   'Figure 2. How double-entry postings fit into the larger accounting information system.');
 else image(article,'assets/ledgerpeer-double-entry-rules.svg',
   'Debits increase assets and expenses; credits increase liabilities, capital and revenue.',
   'Reference diagram. Dr and Cr are sides of an account, not synonyms for cash in or out.');
 appendCase(article,data.worked);
 appendMistakes(article);
 drills(article,d.drills);
 const footer=E('p','vw-credit','SOURCE BASIS · Original LedgerPeer teaching explanations organised by ACCA FA1/FA2 topic structures. Check the official 2026–27 syllabus for the examination session. These examples are not copied from ACCA materials, nor certified as a complete paper textbook.');
 article.append(footer);
 host.append(article);
 return true;
};
})(window);
