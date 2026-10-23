const fs=require('fs'),books={};
function book(id,title,papers){books[id]={id,title,papers,chapters:[]}}
function chapter(book,id,title,text){books[book].chapters.push({id,title,text:text.trim()})}
for(const file of ['accounting.js','management.js','business-audit.js','finance-tax.js'])eval(fs.readFileSync('fia-authoring/'+file,'utf8'));
const paperChapters={
FA1:['accounting:records','accounting:double-entry','accounting:cash-payroll','accounting:trading-inventory','accounting:reconciliations','accounting:errors-statements'],
MA1:['management:information','management:cost-behaviour','management:inputs','management:methods'],
FA2:['accounting:framework','accounting:records','accounting:double-entry','accounting:trading-inventory','accounting:adjustments','accounting:non-current','accounting:reconciliations','accounting:errors-statements','accounting:partnerships'],
MA2:['management:information','management:cost-behaviour','management:inputs','management:methods','management:cvp-decisions','management:budgets','management:standards','management:investment-performance','finance:working-capital'],
FBT:books.business.chapters.map(c=>'business:'+c.id),
FMA:books.management.chapters.map(c=>'management:'+c.id).concat(['finance:working-capital']),
FFA:books.accounting.chapters.filter(c=>c.id!=='partnerships'&&c.id!=='cash-payroll').map(c=>'accounting:'+c.id),
FAU:books.audit.chapters.map(c=>'audit:'+c.id).concat(['management:information']),
FFM:books.finance.chapters.map(c=>'finance:'+c.id).concat(['management:information','management:investment-performance']),
FTX:books.tax.chapters.map(c=>'tax:'+c.id).concat(['management:information'])};
eval(fs.readFileSync('fia-authoring/topic-map.cjs','utf8').replace('const topicChapters={};','var topicChapters={};'));
for(const [key,chapterKey]of Object.entries(topicChapters)){const p=key.split(':')[0];if(!paperChapters[p].includes(chapterKey))paperChapters[p].push(chapterKey)}
const data={topicChapters,edition:'FIA STUDY GUIDES · EXPANDED EDITION 2',release:'2026-10-23-fia-2',reviewStatus:'Original teaching guides · editorial review pending',books,paperChapters,sources:{ftxTables:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/ftx/examdocs/ftx_uk_tax_rates_j26_j27.pdf',ftxChanges:'https://www.accaglobal.com/gb/en/student/exam-support-resources/foundation-level-study-resources/ftx/ftx-technical-articles/finance-act-2025.html',ftxDocuments:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/ftx/examdocs/ftx_uk_j26_j27_examinable_docs_fa2025.pdf'}};
const chapters=Object.values(books).flatMap(b=>b.chapters);data.wordCount=chapters.reduce((s,c)=>s+c.text.split(/\s+/).length,0);data.chapterCount=chapters.length;
fs.writeFileSync('fia-study-data-v2.js','/* Original teaching material. Shared chapters are explicitly reused; no complete-outcome certification is implied. */\nwindow.LedgerFiaGuides='+JSON.stringify(data,null,2)+';\n');
console.log({chapters:data.chapterCount,words:data.wordCount,papers:Object.keys(paperChapters).length});
