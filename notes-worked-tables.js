/* Render proper worked accounting tables with accessible HTML, not prose substitutes. */
(function(root){
'use strict';
const numeric=root.LedgerNumericalTables||{};
const node=(tag,cls,text)=>{
 const x=document.createElement(tag);
 if(cls)x.className=cls;
 if(text!==undefined)x.textContent=String(text);
 return x;
};
root.renderLedgerNumericalTable=function(parent,paperCode,topicCode){
 const data=numeric[paperCode+':'+topicCode];
 if(!data)return false;
 const figure=node('figure','lv-math-case');
 const caption=node('figcaption','lv-math-case-title');
 caption.append(node('span','lv-math-eyebrow','SOLVED ACCOUNTING DEMONSTRATION · '+paperCode+' / '+topicCode));
 caption.append(node('strong','',data.heading));
 figure.append(caption,node('p','lv-math-intro',data.intro));
 const viewport=node('div','lv-math-scroll');viewport.tabIndex=0;
 viewport.setAttribute('role','region');
 viewport.setAttribute('aria-label',data.heading+' table; scroll horizontally if needed');
 const table=node('table','lv-math-table');
 const thead=node('thead'),row=node('tr');
 data.headers.forEach((h)=>{const th=node('th','',h);th.scope='col';row.append(th)});
 thead.append(row);table.append(thead);
 const body=node('tbody');
 for(const r of data.rows){
   const tr=node('tr');
   if(/TOTAL|CLOSING|PROFIT|LOSS ON|GROSS PROFIT|NPV|NET RECEIVABLES|FINAL/.test(r[0]))tr.className='lv-math-total';
   r.forEach((s,i)=>{
     const cell=node(i===0?'th':'td',i===0?'lv-math-label':'',s);
     if(i===0)cell.scope='row';
     tr.append(cell);
   });
   body.append(tr);
 }
 table.append(body);viewport.append(table);figure.append(viewport);
 const checks=node('div','lv-math-checks');
 const reconcile=node('p','lv-math-reconcile');
 reconcile.append(node('strong','','RECONCILIATION / ANSWER CHECK'),node('span','',data.check));
 const caution=node('p','lv-math-caution');
 caution.append(node('strong','','COMMON MISTAKE'),node('span','',data.trap));
 checks.append(reconcile,caution);figure.append(checks);
 parent.append(figure);
 return true;
};
})(window);
