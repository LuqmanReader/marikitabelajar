/* LedgerPeer visual lesson renderer · all FIA–ACCA paper indexes.
   Each illustration depicts concepts drawn from that chapter, not imaginary
   causal relationships. Only verified document workflows use arrows.
   Original educational diagrams; not official ACCA or Kaplan material. */
(function(root){
'use strict';
const SVG_NS='http://www.w3.org/2000/svg';
const ink='#171717',paper='#fffaf0',yellow='#ffd447';
function svgNode(tag,attrs={},label){
 const n=document.createElementNS(SVG_NS,tag);
 for(const [key,value] of Object.entries(attrs))n.setAttribute(key,String(value));
 if(label!==undefined)n.textContent=String(label);
 return n;
}
function node(tag,cls,txt){
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(txt!==undefined)n.textContent=String(txt);
 return n;
}
function rect(s,x,y,w,h,fill,rx=10,stroke=ink,width=3){
 s.append(svgNode('rect',{x,y,width:w,height:h,rx,fill,stroke,'stroke-width':width}));
}
function write(s,x,y,content,size=18,weight=600,color=ink,attributes={}){
 s.append(svgNode('text',{
  x,y,fill:color,'font-family':'Arial, Helvetica, sans-serif',
  'font-size':size,'font-weight':weight,'letter-spacing':'0',
  ...attributes
 },content));
}
function clean(str){return String(str||'').replace(/\s+/g,' ').trim()}
function charWidth(c,size,heavy){
 if('ilI1|.,:;!\' '.includes(c))return size*.28;
 if('MW@%'.includes(c))return size*.85;
 if(/[A-Z]/.test(c))return size*(heavy?.66:.61);
 return size*(heavy?.58:.52);
}
function wrapping(str,maxWidth,size=18,heavy=false){
 const words=clean(str).split(' ').filter(Boolean),rows=[];let line='',pixels=0;
 for(const word of words){
  const ww=[...word].reduce((v,c)=>v+charWidth(c,size,heavy),0);
  const sw=line?size*.28:0;
  if(line&&pixels+sw+ww>maxWidth){
   rows.push(line);line=word;pixels=ww;
  }else{line+=(line?' ':'')+word;pixels+=sw+ww}
 }
 if(line)rows.push(line);
 return rows;
}
function measuredWidth(str,size,heavy){
 return [...str].reduce((w,c)=>w+charWidth(c,size,heavy),0);
}
function blockText(s,x,y,content,opts={}){
 const {width=420,size=17,weight=550,max=5,leading=25,color=ink}=opts;
 const heavy=weight>=700;
 const rows=wrapping(content,width,size,heavy);
 const displayed=rows.slice(0,max);
 displayed.forEach((line,i)=>{
  let value=line;
  const truncated=(i===max-1&&rows.length>max);
  if(truncated)value=value.replace(/[.,;: ]+$/,'');
  while(value.length&&measuredWidth(value+(truncated?'…':''),size,heavy)>width){
   value=value.slice(0,-1);
  }
  value=value.trimEnd()+(truncated?'…':'');
  write(s,x,y+i*leading,value,size,weight,color);
 });
 return displayed.length;
}
function topicMode(paper){
 if(['FA1','FA2'].includes(paper))return {name:'BOOKKEEPING & SOURCE RECORDS',colour:'#ffe4a2',type:'bookkeeping'};
 if(['MA1','MA2','MA','FMA','PM','APM'].includes(paper))return {name:'COST & MANAGEMENT ACCOUNTING',colour:'#d7edff',type:'management'};
 if(['TX','FTX','ATX'].includes(paper))return {name:'TAXATION · CHECK YOUR VARIANT',colour:'#ffe4c9',type:'tax'};
 if(['LW'].includes(paper))return {name:'CORPORATE & BUSINESS LAW',colour:'#eee0fa',type:'law'};
 if(['AA','AAA','FAU'].includes(paper))return {name:'AUDIT & ASSURANCE',colour:'#e0f6e6',type:'audit'};
 if(['FA','FFA','FR','SBR'].includes(paper))return {name:'FINANCIAL ACCOUNTING & REPORTING',colour:'#e1e8ff',type:'reporting'};
 if(['FM','AFM','FFM'].includes(paper))return {name:'FINANCIAL MANAGEMENT',colour:'#d8ecff',type:'finance'};
 return {name:'BUSINESS & PROFESSIONAL SKILLS',colour:'#f7e9c6',type:'business'};
}
function sections(opts){
 const book=opts.book;
 if(Array.isArray(book?.sections)&&book.sections.length){
  return book.sections.map(([heading,prose])=>({heading:clean(heading),detail:String(prose||'').trim()})).slice(0,4);
 }
 const n=opts.note||{};
 const steps=Array.isArray(n.steps)?n.steps.filter(Boolean):[];
 const labels=['Key principle','Accounting treatment','Practical application'];
 const result=steps.slice(0,3).map((detail,i)=>({heading:labels[i],detail:clean(detail)}));
 if(result.length===0&&n.summary)result.push({heading:'Core concept',detail:clean(n.summary)});
 if(n.formula)result.push({heading:'Formula / rule',detail:clean(n.formula)});
 if(n.trap)result.push({heading:'Common mistake',detail:clean(n.trap)});
 if(n.example)result.push({heading:'Illustrative example',detail:clean(n.example)});
 while(result.length<4){
  result.push({heading:'Further teaching required',detail:'A complete worked explanation has not yet been authored for this part of the topic.'});
 }
 return result.slice(0,4);
}
function header(svg,opts,mode,subtitle){
 rect(svg,24,20,1152,118,ink,10,ink,1);
 rect(svg,44,39,7,80,yellow,0,yellow,0);
 write(svg,72,58,mode.name+'   /   '+opts.paper+' '+opts.code,17,800,yellow);
 blockText(svg,72,100,opts.title,{width:1060,size:30,weight:850,max:2,leading:31,color:'#ffffff'});
 if(subtitle)write(svg,36,722,subtitle,14,650,ink);
}
function panel(svg,x,y,item,index,colour){
 const w=553,h=249;
 rect(svg,x,y,w,h,colour);
 // Fixed alignment for every card: number 48px from left, heading 84px from left.
 rect(svg,x+21,y+21,44,44,ink,22,ink,0);
 write(svg,x+43,y+52,String(index+1),21,900,yellow,{'text-anchor':'middle'});
 blockText(svg,x+85,y+48,item.heading,{width:447,size:21,weight:800,max:2,leading:27});
 // Explanation is below the heading, not floating in an empty panel.
 blockText(svg,x+24,y+123,item.detail,{width:502,size:18,weight:500,max:5,leading:27});
}
function interactiveMap(opts){
 // Real HTML controls replace the noninteractive SVG text boxes.
 // Each details panel contains the COMPLETE chapter section, never an SVG excerpt.
 const mode=topicMode(opts.paper);
 const map=node('section','lv-interactive-map');
 map.setAttribute('aria-label',opts.paper+' '+opts.code+' · '+opts.title+' · expandable explanations');
 const banner=node('div','lv-interactive-banner');
 const eyebrow=node('p','lv-interactive-eyebrow',mode.name+'  /  '+opts.paper+' '+opts.code);
 const title=node('h3','lv-interactive-title',opts.title);
 const sub=node('p','lv-interactive-subtitle','CONCEPT OVERVIEW · Open explanations are displayed in full. Select any heading to collapse or reopen it.');
 banner.append(eyebrow,title,sub);
 map.append(banner);
 const actions=node('div','lv-interactive-actions');
 const label=node('span','lv-interactive-help','Each card is interactive · Keyboard: Tab, then Enter');
 const collapse=node('button','lv-all-toggle','Collapse all');
 collapse.type='button';
 collapse.setAttribute('aria-label','Collapse all explanations for '+opts.paper+' '+opts.code);
 const expand=node('button','lv-all-toggle','Expand all');
 expand.type='button';
 expand.setAttribute('aria-label','Expand all explanations for '+opts.paper+' '+opts.code);
 actions.append(label,collapse,expand);
 map.append(actions);
 const grid=node('div','lv-interactive-grid');
 const cards=[];
 const items=sections(opts);
 items.forEach((entry,i)=>{
   const card=node('details','lv-interactive-card');
   card.open=true;
   card.setAttribute('data-panel-number',String(i+1));
   card.setAttribute('data-theme',i%2?'tinted':'white');
   const summary=node('summary','lv-card-summary');
   const num=node('span','lv-card-number',String(i+1));
   const heading=node('span','lv-card-heading',entry.heading);
   const action=node('span','lv-card-action');
   action.setAttribute('aria-hidden','true');
   action.append(node('span','lv-action-hide','Collapse explanation'),
                 node('span','lv-action-show','Read full explanation'));
   const chevron=node('span','lv-card-chevron','');
   chevron.setAttribute('aria-hidden','true');
   summary.append(num,heading,action,chevron);
   const content=node('div','lv-card-content');
   const paragraphs=String(entry.detail||'').split(/\n\s*\n/).map(t=>t.trim()).filter(Boolean);
   for(const para of paragraphs)content.append(node('p','lv-card-paragraph',para));
   card.append(summary,content);
   grid.append(card);
   cards.push(card);
 });
 collapse.addEventListener('click',()=>{
   cards.forEach(card=>{card.open=false});
 });
 expand.addEventListener('click',()=>{
   cards.forEach(card=>{card.open=true});
 });
 map.append(grid);
 map.append(node('p','lv-interactive-footer',
  'THESE ARE RELATED TOPIC CONCEPTS, NOT A REQUIRED ORDER OF TRANSACTIONS. The individual sections below contain further examples and study notes.'));
 return map;
}
function workflow(opts){
 // Responsive, semantic HTML: no fixed-width SVG boxes or overlaying arrows.
 // Each disclosure starts open, so no instructional content is hidden.
 const section=node('section','lv-purchase-workflow');
 section.setAttribute('aria-label','Purchase-to-pay source document workflow');
 const banner=node('header','lv-purchase-banner');
 banner.append(node('p','lv-purchase-overline','BOOKKEEPING & SOURCE RECORDS  /  FA1 A2'));
 banner.append(node('h3','', 'Purchase-to-pay: follow the documents'));
 banner.append(node('p','',
  'These arrows show the order of this example only. The supplier invoice must be checked against the purchase order and what was actually received.'));
 section.append(banner);
 const steps=[
  ['REQUISITION','Staff requests the goods. An authorised manager confirms that the purchase is necessary.','Evidence: approved purchase requisition. No supplier debt arises merely from this internal request.'],
  ['PURCHASE ORDER','The buyer orders 20 items at $45 each ($900 total).','Evidence: purchase order stating supplier, quantity, price, terms and authorisation.'],
  ['GOODS RECEIVED','The stores team records only 18 items delivered ($810 at the ordered unit price).','Evidence: goods received note and physical count; record discrepancies and any damaged items.'],
  ['SUPPLIER INVOICE','The supplier invoices all 20 items ($900), although only 18 were received.','Evidence: supplier invoice. Compare invoice details against the order and goods received note.'],
  ['MATCH & RESOLVE','The two undelivered items, worth $90, must be investigated before approving the invoice for payment.','Action: clarify a later delivery or request a corrected invoice/credit note; pay only the amount properly authorised under the agreed terms.']
 ];
 const list=node('ol','lv-purchase-steps');
 for(let i=0;i<steps.length;i++){
  const [heading,description,evidence]=steps[i];
  const li=node('li','lv-purchase-step');
  if(i<steps.length-1)li.className='lv-purchase-step lv-purchase-step-connected';
  const detail=node('details','lv-purchase-step-detail');
  detail.open=true;
  const summary=node('summary','lv-purchase-step-summary');
  const chevron=node('span','lv-purchase-step-chevron','');
  chevron.setAttribute('aria-hidden','true');
  summary.append(node('span','lv-purchase-step-num',String(i+1)),
    node('span','lv-purchase-step-heading',heading),chevron);
  const body=node('div','lv-purchase-step-body');
  body.append(node('p','',description),node('p','lv-purchase-evidence',evidence));
  detail.append(summary,body);li.append(detail);list.append(li);
 }
 section.append(list);
 const match=node('section','lv-purchase-match');
 match.append(node('h4','','Three-way match: do the documents agree?'));
 const cards=node('div','lv-purchase-match-grid');
 for(const [name,units,cost] of [
  ['Purchase order','20 units','20 × $45 = $900'],
  ['Goods received note','18 units','18 × $45 = $810'],
  ['Supplier invoice','20 units','20 × $45 = $900']
 ]){
  const card=node('div','lv-purchase-match-card');
  card.append(node('h5','',name),node('strong','',units),node('p','',cost));
  cards.append(card);
 }
 match.append(cards);
 const alert=node('p','lv-purchase-exception');
 alert.append(node('strong','','EXCEPTION: '),node('span','','2 units × $45 = $90 unmatched. Investigate before authorising payment.'));
 match.append(alert);section.append(match);
 return section;
}
function table(parent,heading,columns,rows){
 const area=node('section','lv-doc-table');
 area.append(node('h3','',heading));
 const scroll=node('div','lv-doc-scroll');scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',heading);
 const t=node('table','lv-doc-table-inner'),th=node('thead'),headRow=node('tr');
 columns.forEach(label=>{const cell=node('th','',label);cell.scope='col';headRow.append(cell)});
 th.append(headRow);t.append(th);
 const body=node('tbody');
 for(const row of rows){const tr=node('tr');row.forEach((value,i)=>{
  const cell=node(i?'td':'th','',value);if(!i)cell.scope='row';tr.append(cell);
 });body.append(tr)}
 t.append(body);scroll.append(t);area.append(scroll);
 parent.append(area);
}
function businessDocuments(parent){
 const area=node('section','lv-document-lesson');
 area.append(node('h3','','WHAT EACH SOURCE DOCUMENT ACTUALLY PROVES'));
 area.append(node('p','','A document is evidence of a specific stage—not automatic proof that a sale, expense or payment has occurred. Match dates, counterparties, references, quantities and terms before posting. Purchase-order approval, goods receipt and the supplier invoice are separate controls.'));
 table(area,'Purchase-to-pay evidence and control',
 ['Record','Purpose','Evidence to compare'],[
  ['Purchase requisition','Internal request for goods','Authorisation and quantity required'],
  ['Purchase order (PO)','Formal order sent to supplier','Agreed items, quantities and prices'],
  ['Goods received note (GRN)','What was physically received','Actual units and condition'],
  ['Supplier invoice','What the supplier claims is due','Invoice quantity, price, tax and PO/GRN references'],
  ['Credit note','Reduction of an earlier invoice','Returned items, price errors or agreed allowance'],
  ['Remittance advice','Which invoice(s) the payment relates to','Payment amount and invoice references'],
  ['Bank confirmation','Evidence that funds were transferred','Bank date, recipient and cleared amount']
 ]);
 area.append(node('h4','','THREE-WAY MATCH · WORKED EXAMPLE'));
 area.append(node('p','','The purchase order specifies 20 units at $45 each ($900). The goods received note confirms 18 units ($810). The supplier invoice requests payment for 20 units ($900). Two units—or $90—remain unmatched. The correct action is to investigate the short delivery or agreed invoicing terms, not simply authorise the entire invoice. Under an appropriate accounting policy, record the items controlled and any valid liability using the applicable evidence; do not invent goods received.'));
 area.append(node('p','lv-doc-note','Note: an approved purchase order does not itself create an expense. A payment instruction is not proof of an executed payment. A quotation is an offer of terms, not proof of a completed sale.'));
 parent.append(area);
}
function workedPanel(opts){
 const fig=node('figure','lv-all-worked');
 const caption=node('figcaption','', 'EXAM APPLICATION   /   '+opts.paper+' '+opts.code);fig.append(caption);
 const grid=node('div','lv-all-worked-grid');
 const working=opts.book?.workings?.[0];
 let cells;
 if(Array.isArray(working)&&working.length===3){
  cells=[['QUESTION · '+working[0],working[1]],
   ['ACCOUNTING METHOD',opts.book?.sections?.[0]?.[1]||opts.note?.summary||'Consult the relevant concept and method in the chapter.'],
   ['WORKED ANSWER',working[2]]];
 }else{
  cells=[['ILLUSTRATIVE EXAMPLE',opts.note?.example||'This topic has not yet received a complete worked example.'],
   ['KEY CONCEPT',opts.note?.summary||'Review the underlying study material.'],
   ['SELF-CHECK QUESTION',opts.note?.check||'An outcome-specific question has not yet been authored.']];
 }
 for(const [label,content]of cells){
  const card=node('div','lv-all-worked-card');
  card.append(node('strong','',label),node('p','',content));grid.append(card);
 }
 fig.append(grid);
 if(!working&&opts.note?.answer){
  const answer=node('details','lv-linked-self-check');
  answer.append(node('summary','','Reveal the answer to the self-check question'));
  answer.append(node('p','',opts.note.answer));fig.append(answer);
 }
 fig.append(node('p','lv-all-worked-warning',
  working?'Worked example adapted from this LedgerPeer chapter; calculations still require individual syllabus review.':
  'The illustration and self-check are separate. They are not presented as a fully verified worked examination solution.'));
 return fig;
}
root.renderLedgerChapterVisual=function(parent,opts){
 if(!opts?.paper||!opts.code)return false;
 const special=opts.paper==='FA1'&&opts.code==='A2';
 if(special){
   parent.append(workflow(opts));
   businessDocuments(parent);
 }
 parent.append(interactiveMap(opts));
 parent.append(workedPanel(opts));
 return true;
};
root.LedgerNotesVisualBuild='2026.10.30.7';
})(window);
