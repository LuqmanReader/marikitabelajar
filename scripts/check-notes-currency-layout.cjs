#!/usr/bin/env node
/* LedgerPeer Notes visual and teaching-currency regression.
 * Dollar signs are an illustrative convention, NOT a tax-law/country designation.
 * Run with: node scripts/check-notes-currency-layout.cjs
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const files=[
 'notes-data.js','notes-expanded-data.js','notes-outcome-lessons.js',
 'textbook-fa1-part-a.js','textbook-fa1-part-b.js','textbook-ma1.js',
 'textbook-fa2-part-a.js','textbook-fa2-part-b.js','textbook-fa2-part-c.js',
 'textbook-ma2-part-a.js','textbook-ma2-part-b.js','textbook-integrated-cases.js',
 'textbook-crossqual-a1.js','textbook-crossqual-a2-foundation.js',
 'textbook-crossqual-a2-professional.js','textbook-crossqual-a3-foundation.js',
 'textbook-crossqual-a3-professional.js',
 'notes-visual-workbook-data.js','notes-visual-workbook.js',
 'notes-worked-tables-data.js','notes-worked-tables.js',
 'notes-page.js','fia-study-data-v2.js','fia-study-content-v2.js',
 'notes-visual-all.js','assets/ledgerpeer-accounting-flow.svg',
 'assets/ledgerpeer-double-entry-rules.svg'
];
const errors=[];
let dollars=0;
for(const file of files){
 const s=read(file);
 // Money can appear as $45 or $ 45; these checks reject Malaysian ringgit
 // currency notation only in independently authored pedagogical examples.
 const leftovers=[...s.matchAll(/\bRM\b|\bRM(?=[\d.,])/g)];
 if(leftovers.length)errors.push(file+' contains '+leftovers.length+' remaining RM currency tokens');
 dollars+=(s.match(/\$(?=[\d ])/g)||[]).length;
 if(file.endsWith('.js'))new vm.Script(s,{filename:file});
}
const v=read('notes-visual-all.js'),css=read('notes.css'),html=read('notes.html');
if(v.includes('function connector(svg,')||v.includes("if(special)figure.append(workflow(opts))"))
 errors.push('Legacy fixed-width workflow SVG is still used');
for(const needle of [
 'function workflow(opts)','lv-purchase-workflow','lv-purchase-step-summary',
 "['PURCHASE ORDER'","['GOODS RECEIVED'","['SUPPLIER INVOICE'",
 '20 × $45 = $900','18 × $45 = $810','2 units × $45 = $90'
])if(!v.includes(needle))errors.push('Missing responsive workflow content: '+needle);
for(const selector of ['.lv-purchase-steps','.lv-purchase-step-heading',
 '.lv-purchase-step-connected::after','.lv-purchase-match-grid',
 '@container (min-width:1150px)','@container (max-width:700px)',
 '.lv-purchase-step-summary:focus-visible'])
 if(!css.includes(selector))errors.push('Missing mobile/desktop style: '+selector);
const sourceAssets=[
 'notes-data.js','notes-expanded-data.js','notes-outcome-lessons.js',
 'textbook-fa1-part-a.js','textbook-fa1-part-b.js','textbook-ma1.js',
 'textbook-fa2-part-a.js','textbook-fa2-part-b.js','textbook-fa2-part-c.js',
 'textbook-ma2-part-a.js','textbook-ma2-part-b.js','textbook-integrated-cases.js',
 'textbook-crossqual-a1.js','textbook-crossqual-a2-foundation.js',
 'textbook-crossqual-a2-professional.js','textbook-crossqual-a3-foundation.js',
 'textbook-crossqual-a3-professional.js',
 'notes-visual-workbook-data.js','notes-worked-tables-data.js','notes-visual-all.js',
 'notes-visual-workbook.js'
];
const assetVersions={
 'notes-visual-all.js':'20261031chapters2',
 'textbook-crossqual-a1.js':'20261031v2',
 'textbook-crossqual-a2-foundation.js':'20261031v1',
 'textbook-crossqual-a2-professional.js':'20261031v1',
 'textbook-crossqual-a3-foundation.js':'20261031v1',
 'textbook-crossqual-a3-professional.js':'20261031v1'
};
for(const filename of sourceAssets){
 const expected=assetVersions[filename]||'20261030usd5';
 if(!html.includes('src="'+filename+'?v='+expected))
 errors.push('Outdated/missing cache-bust query: '+filename);
}
if(!html.includes('href="notes.css?v=20261031chapters1"'))errors.push('Stylesheet cache query outdated');
if(!read('notes-visual-workbook.js').includes("src+'?v=20261030v8'"))
 errors.push('Static illustrations will remain cached in previous currency');
console.log(JSON.stringify({inspected:files.length,exampleDollarOccurrences:dollars,failures:errors.length},null,2));
if(errors.length){errors.forEach(e=>console.error('FAIL',e));process.exitCode=1}
else console.log('PASS: responsive workflow, $ examples, asset versions and Notes file syntax');
console.log('This check does not certify the completeness of ACCA syllabus learning outcomes.');
