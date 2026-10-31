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
  // Render the ACTUAL community beta notice and navigation with the live CSS.
  // Guard against the staggered buttons and mismatched left edges seen in production.
  const notesHtml=fs.readFileSync(path.join(root,'notes.html'),'utf8');
  const noticeStart=notesHtml.indexOf('<aside class="notes-beta-notice"');
  const navStart=notesHtml.indexOf('<nav class="back-navigation-row"');
  assert(noticeStart>=0&&navStart>=0,'Required Notes markup not found');
  const notice=notesHtml.slice(noticeStart,notesHtml.indexOf('</aside>',noticeStart)+8);
  const nav=notesHtml.slice(navStart,notesHtml.indexOf('</nav>',navStart)+6);
  assert(notice&&nav,'Community beta notice or navigation missing from Notes');
  assert(nav.includes('href="hub.html"')&&nav.includes('href="index.html#access"'),
    'Do not replace the existing functional navigation URLs');
  await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main class="notes-shell">'+notice+nav+'<section class="notes-hero"><h1>Learn the syllabus</h1></section></main></body></html>');
  await page.addStyleTag({path:path.join(root,'notes.css')});
  await page.addStyleTag({path:path.join(root,'site-nav.css')});
  for(const width of [375,600,925,1440]){
    await page.setViewport({width,height:800,deviceScaleFactor:1});
    const layout=await page.evaluate(()=>{
      const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();
        return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height}};
      const items=Array.from(document.querySelectorAll('.back-navigation-row .site-back')).map(el=>{
        const r=el.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom}});
      const font=selector=>getComputedStyle(document.querySelector(selector)).fontFamily;
      return {notice:rect('.notes-beta-notice'),nav:rect('.back-navigation-row'),
        hero:rect('.notes-hero'),buttons:items,
        fonts:{
          brandDisplay:font('.notes-hero h1'),
          betaTitle:font('.notes-beta-notice>strong'),
          brandBody:font('.notes-shell'),
          betaBody:font('.notes-beta-notice>p'),
          betaBold:font('.notes-beta-notice>p b'),
          betaLink:font('.notes-beta-notice>p a'),
          firstBack:font('.back-navigation-row .site-back:first-child'),
          secondBack:font('.back-navigation-row .site-back:last-child')
        },
        scrollWidth:document.documentElement.scrollWidth};
    });
    assert.equal(layout.fonts.betaTitle,layout.fonts.brandDisplay,
      'Community beta heading must match LedgerPeer display typography at '+width+'px');
    for(const key of ['betaBody','betaBold','betaLink','firstBack','secondBack']){
      assert.equal(layout.fonts[key],layout.fonts.brandBody,
        'Community beta '+key+' must use LedgerPeer body typography at '+width+'px');
    }
    assert.equal(layout.buttons.length,2,'Navigation must retain both buttons');
    assert(Math.abs(layout.notice.x-layout.nav.x)<=2,
      'Banner and navigation left edges must align: '+width+'px '+JSON.stringify(layout));
    assert(Math.abs(layout.nav.x-layout.hero.x)<=2,
      'Banner/buttons and hero must align: '+width+'px');
    assert(layout.nav.y-layout.notice.bottom>=20,
      'Beta banner shadow must have breathing room before navigation: '+width+'px');
    assert(layout.hero.y-layout.nav.bottom>=20,
      'Navigation shadow must have breathing room before hero: '+width+'px');
    assert(layout.buttons.every(b=>b.x>=-1&&b.right<=width+1),
      'Navigation buttons must not exceed viewport width: '+width+'px');
    assert(layout.scrollWidth<=width+2,
      'Beta banner/navigation horizontal overflow: '+width+'px');
    if(width>=600){
      assert(Math.abs(layout.buttons[0].y-layout.buttons[1].y)<=2,
        'Back navigation buttons are vertically staggered: '+width+'px');
    }else if(layout.buttons[1].y>layout.buttons[0].y+2){
      assert(layout.buttons[1].y-layout.buttons[0].bottom>=8,
        'Wrapped mobile buttons must have a visible gap');
    }
    console.log('PASS community-beta typography + notice/navigation layout at',width,'px');
  }
  // Check the actual standalone SVG embedded by FA1/FA2, NOT just page fonts.
  const flowSvg=fs.readFileSync(path.join(root,'assets/ledgerpeer-accounting-flow.svg'),'utf8');
  assert(flowSvg.includes('CUSTOMER SUBLEDGER')&&flowSvg.includes('06 / STATEMENTS'),
    'Revised accounting information-flow graphic missing');
  await page.setContent('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><div style="width:100%;max-width:1220px">'+flowSvg+'</div></body></html>');
  for(const width of [375,600,925,1440]){
    await page.setViewport({width,height:900,deviceScaleFactor:1});
    const actual=await page.evaluate(()=>{
      const svg=document.querySelector('svg');
      const titles=Array.from(svg.querySelectorAll('text.lp-card-title'));
      const body=Array.from(svg.querySelectorAll('.lp-card-body text'));
      const rects=Array.from(svg.querySelectorAll('rect.lp-card')).map(r=>{
        const b=r.getBBox();return{x:b.x,y:b.y,right:b.x+b.width,bottom:b.y+b.height};
      });
      const textOut=Array.from(svg.querySelectorAll('text.lp-card-title,.lp-card-body text')).map(t=>{
        const b=t.getBBox();
        const container=rects.find(r=>b.x>=r.x&&b.x<r.right&&b.y>=r.y&&b.y<=r.bottom);
        return{text:t.textContent,x:b.x,right:b.x+b.width,y:b.y,
          cardRight:container?.right,cardFound:!!container,
          overflow:!container||b.x+b.width>container.right-7};
      });
      return{
       headingFonts:[...new Set(titles.map(el=>getComputedStyle(el).fontFamily))],
       headingSizes:[...new Set(titles.map(el=>getComputedStyle(el).fontSize))],
       bodyFonts:[...new Set(body.map(el=>getComputedStyle(el).fontFamily))],
       bodySizes:[...new Set(body.map(el=>getComputedStyle(el).fontSize))],
       overflow:textOut.filter(x=>x.overflow),
       headings:titles.length,bodyLines:body.length,
       pageWidth:document.documentElement.scrollWidth
      };
    });
    assert.equal(actual.headings,7,'Accounting SVG must have seven coherent card headings');
    assert.equal(actual.headingFonts.length,1,'Every card heading must use the same display font');
    assert.equal(actual.headingSizes.length,1,'Every card heading must use the same size');
    assert.match(actual.headingFonts[0],/Arial Black/i);
    assert.equal(actual.bodyFonts.length,1,'All seven cards must use the same body font');
    assert.equal(actual.bodySizes.length,1,'All seven cards must use the same body size');
    assert.match(actual.bodyFonts[0],/ui-monospace/i);
    assert.equal(actual.overflow.length,0,
      'SVG text escapes a card at '+width+'px: '+JSON.stringify(actual.overflow));
    assert(actual.pageWidth<=width+2,'SVG causes horizontal overflow at '+width+'px');
    console.log('PASS accounting diagram SVG fonts, card-fit and responsive width at',width,'px');
  }
  assert.deepEqual(errors,[],'Browser JavaScript exception(s): '+errors);
 }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1});
