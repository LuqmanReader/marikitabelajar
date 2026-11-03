/* PDF.js selectable text coordinate parsing; no raster/AI vision needed. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const context={};context.window=context;context.globalThis=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../pdf-layout-evidence.js'),'utf8'),context);
const layout=context.LedgerPeerPdfLayout;
function token(str,x,y,w=35){return {str,transform:[1,0,0,1,x,y],width:w,height:12};}
const content={items:[
 token('200',240,700,20), token('2025',70,700,40),
 token('Cost',240,730,30),token('Year',70,730,35),
 token('1',105,760,10),token('Question',20,760,80),
 token('2',105,660,10),token('Question',20,660,80),
 token('Bar chart data are in the table',20,750,240),
 token('Illustrated chart has no machine-readable pixels',20,650,250)
]};
const result=layout.extract(content);
assert.equal(result.method,'pdf-text-coordinate-layout');
assert(result.text.includes('Question 1'),'Reassemble split numbered heading');
assert(result.text.includes('Year  |  Cost'),'Preserve wide column gaps');
const q1=layout.selectRows(result.rows,1),q2=layout.selectRows(result.rows,2);
assert.equal(q1[0].text,'Question 1');
assert(q1.some(r=>r.text.includes('2025')&&r.text.includes('200')));
assert(q2.some(r=>r.text.includes('Illustrated chart')),'Next question begins at next header');
assert(!q2.some(r=>r.text.includes('Year')),'Do not leak other question table');
const hint=layout.compactEvidence({qtext:'Refer to the bar chart below',pdf_layout_rows:q1});
assert.equal(hint.type,'pdf_text_positions');
assert(hint.rows.some(row=>row.tokens.some(tok=>tok[0]==='200')),'Capture visible numeric labels without interpreting bar heights');
assert(hint.note.includes('do not')||hint.note.includes('do not')||hint.note.includes('do not')||hint.note.includes('not establish'));
const noHint=layout.compactEvidence({qtext:'Calculate two plus two',pdf_layout_rows:q1});
assert.equal(noHint,null,'Ordinary questions should not repeat layout and inflate prompts');
const fallback=layout.extract({items:[{str:'Question 1',hasEOL:true},{str:'Incorrect'}]});
assert.equal(fallback.method,'sequence');
assert(fallback.text.includes('Question 1'));
console.log('PASS: PDF text positions, question boundaries, chart-label hints and text-only fallback');
