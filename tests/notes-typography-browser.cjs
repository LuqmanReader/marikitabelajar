#!/usr/bin/env node
/* Browser typography and overflow regression for LedgerPeer Notes.
 * Run with: npm install --no-save --package-lock=false puppeteer-core
 *           node tests/notes-typography-browser.cjs
 * Uses actual Notes CSS + renderer, without logging into a student account.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const puppeteer=require('puppeteer-core');
const root=path.resolve(__dirname,'..');
async function main(){
 const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser']
  .find(x=>x&&fs.existsSync(x));
 assert(chrome,'Chrome/Chromium executable not found');
 const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="notes-shell"><div class="notes-topic-detail"><div class="notes-lesson-layout notes-lesson-layout--visual"><div class="notes-lesson-main" id="chapter"></div></div></div></main></body></html>');
  await page.addStyleTag({path:path.join(root,'notes.css')});
  await page.addScriptTag({path:path.join(root,'notes-visual-all.js')});
  await page.evaluate(()=>{
   window.renderLedgerChapterVisual(document.getElementById('chapter'),{
    paper:'FA1',code:'A2',title:'Business documentation',
    note:{summary:'Purchase documents are separate evidence for distinct transaction stages.',steps:['Match documents to business events.','Check quantities and price before accounting.','Investigate differences before approving payment.'],example:'The supplier invoiced 20 units but delivered 18.'},
    book:{sections:[
      ['Documents by transaction stage','A requisition is an internal request. A purchase order communicates the authorised order. The goods received note records actual receipt. The supplier invoice makes a claim, but each source must be compared carefully.'],
      ['Document content','Include the date, reference number, counterparty, item description, quantities, price, terms, approver and applicable tax information where relevant.'],
      ['Cash, card and electronic evidence','A bank statement proves a clearing event, but payment instructions alone do not prove completed settlement.'],
      ['Errors and prevention','The three-way match compares the purchase order, receiving evidence and supplier invoice. Investigate discrepancies before authorising payment.']
    ],workings:[]}
   });
  });
  for(const width of [375,600,768,1024,1440]){
   await page.setViewport({width,height:900,deviceScaleFactor:1});
   const result=await page.evaluate(()=>{
    const q=s=>document.querySelector(s),all=s=>Array.from(document.querySelectorAll(s));
    const flow=q('.lv-purchase-steps');
    const cards=all('.lv-purchase-step-detail');
    const headings=all('.lv-purchase-step-heading');
    const overflow=[];
    for(const el of [...cards,...headings,...all('.lv-purchase-match-card'),...all('.lv-interactive-card')]){
      if(el.scrollWidth>el.clientWidth+2)overflow.push({class:el.className,text:el.textContent.slice(0,70),scroll:el.scrollWidth,client:el.clientWidth});
      const rect=el.getBoundingClientRect();
      if(rect.right>window.innerWidth+2||rect.left < -2)overflow.push({class:el.className,left:rect.left,right:rect.right,screen:window.innerWidth});
    }
    return{
      screen:window.innerWidth,
      documentWidth:document.documentElement.scrollWidth,
      columns:getComputedStyle(flow).gridTemplateColumns,
      fontHeading:getComputedStyle(headings[0]).fontFamily,
      fontParagraph:getComputedStyle(q('.lv-purchase-step-body p')).fontFamily,
      fontConceptHeading:getComputedStyle(q('.lv-card-heading')).fontFamily,
      fontConceptBody:getComputedStyle(q('.lv-card-paragraph')).fontFamily,
      arrows:getComputedStyle(q('.lv-purchase-step-connected'),'::after').display,
      stepCount:cards.length,
      expanded:cards.every(x=>x.open),
      overflow
    };
   });
   assert.equal(result.stepCount,5,'Exactly five workflow steps at width '+width);
   assert(result.expanded,'Workflow steps should start open at '+width);
   assert(result.documentWidth<=width+2,'Page overflow at '+width+' width='+result.documentWidth);
   assert.equal(result.overflow.length,0,'Card overflow at '+width+': '+JSON.stringify(result.overflow));
   assert.equal(result.columns.trim().split(/\s+/).length,1,'Workflow must be one column at '+width);
   assert.match(result.fontHeading,/Arial Black/i,'Wrong heading font at '+width);
   assert.match(result.fontConceptHeading,/Arial Black/i,'Wrong concept heading font at '+width);
   assert.match(result.fontParagraph,/ui-monospace/i,'Wrong prose font at '+width);
   assert.match(result.fontConceptBody,/ui-monospace/i,'Wrong concept body font at '+width);
   assert.equal(result.arrows,'none','Old arrow overlaps have returned at '+width);
   console.log('PASS viewport',width, '| timeline:',result.columns,'| brand font pairing correct | no clipping');
  }
  assert.deepEqual(errors,[],'Browser JavaScript exception(s): '+errors);
 }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1});
