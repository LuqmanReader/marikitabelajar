/* Real PDF smoke regression for both HTML-imported and original-PDF attempts.
   Install pdf-lib@1.17.1 before running with Node. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const L=require('pdf-lib');
// Execute in the same JS realm as pdf-lib: the library validates native
// Array/Object prototypes, which differ in Node vm.createContext sandboxes.
globalThis.PDFLib=L;
globalThis.localStorage={getItem(){return null},setItem(){}};
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../correction-pdf.js'),'utf8'),{filename:'correction-pdf.js'});
const E=globalThis.LedgerPeerCorrectionPDF;
assert(E,'Correction PDF exporter was not registered');
const meta={id:'fixture1',subject:'MA2 - Managing Costs and Finance',title:'Progress Test 2',testType:'pre',testNumber:2};
const questions=[
 {qno:1,qtext:'Calculate the material variance where cost is $600 and budget is $500. The company planned output of 100 units.',
  your_answer:'$500',correct_answer:'$100 adverse',is_correct:false,original_marks:0,original_max_marks:2,
  reasoning:'Compare actual with standard cost.',calculation:'$600 - $500 = $100 adverse.',
  justification:'Actual material cost is $100 above standard.',focus:'Material variance',
  chapter:'B1',pdf_page:4},
 {qno:2,qtext:'Which graph is this? [Image unavailable]',your_answer:'Simple bar chart',
  correct_answer:'Compound bar chart',is_correct:false,original_marks:0,original_max_marks:2,visual_review_required:true,pdf_page:8},
 {qno:3,qtext:'What is marginal cost?',your_answer:'Variable cost per unit',
  correct_answer:'Variable cost per unit',is_correct:true,original_marks:2,original_max_marks:2}
];
const manual={'2':{workings:'A compound bar chart displays grouped or stacked categories; verify the original figure.',
  explanation:'The question requires the original bar geometry to determine the exact variant.',
  proposedAnswer:'Needs lecturer/source confirmation.',notes:'Original diagram is shown in the source PDF.'}};
const plan=E.compose(meta,questions,manual,'incorrect',true);
assert.equal(plan.rows.length,2);
assert.deepEqual(Array.from(plan.missing),[]);
assert.equal(plan.draft,false);
assert.equal(plan.rows[0].workings,'$600 - $500 = $100 adverse.');
assert.equal(plan.rows[1].proposedAnswer,'Needs lecturer/source confirmation.');
const all=E.compose(meta,questions,manual,'all',false);
assert.equal(all.rows.length,3,'Student should optionally export all questions');
assert.equal(all.rows[2].source.is_correct,true);
const draft=E.compose(meta,questions,{},'incorrect',false);
assert.deepEqual(Array.from(draft.missing),[2],'Unreviewed questions must be flagged as draft');
assert(E.pdfSafe('Profit £200 − 100 × 2 = 0').includes('GBP 200 - 100 x 2'));
const long=Array(130).fill('Long financial accounting paragraph with $ and percentages.').join(' ');
const longQuestion=[{...questions[0],qtext:long,calculation:long,reasoning:long}];
(async()=>{
 const simple=E.compose(meta,longQuestion,{},'all',false);
 const generated=await E.generate(simple,null);
 assert.equal(Buffer.from(generated).subarray(0,5).toString(),'%PDF-');
 const pdf=await L.PDFDocument.load(generated);
 assert(pdf.getPageCount()>=3,'Long correction must paginate cleanly');
 assert(pdf.getTitle().includes('Progress Test 2'));
 // Preserve every original page as an exact source appendix.
 const original=await L.PDFDocument.create();
 const fig=original.addPage([420,610]);
 fig.drawText('ORIGINAL COMPOUND BAR CHART Q2',{x:45,y:540,size:15});
 const originalBytes=await original.save();
 const originalFile={arrayBuffer:async()=>originalBytes.buffer.slice(originalBytes.byteOffset,originalBytes.byteOffset+originalBytes.byteLength)};
 const withSource=await E.generate(plan,originalFile);
 const sourcePdf=await L.PDFDocument.load(withSource);
 const withoutSource=await E.generate(E.compose(meta,questions,manual,'incorrect',false),null);
 const noSourcePdf=await L.PDFDocument.load(withoutSource);
 assert.equal(sourcePdf.getPageCount(),noSourcePdf.getPageCount()+1,'Original PDF should be appended after corrections');
 const last=sourcePdf.getPages().at(-1);
 assert.equal(last.getWidth(),420,'Original page width must be retained');
 assert.equal(last.getHeight(),610,'Original page height must be retained');
 const bytes=await E.generate(draft,null);
 assert((await L.PDFDocument.load(bytes)).getPageCount()>=3,'Draft corrections must still produce a clearly marked PDF');
 console.log('PASS: actual PDF generation, pagination, editable correction content, draft labeling, and lossless original PDF appendix');
})().catch(e=>{console.error(e);process.exitCode=1;});
