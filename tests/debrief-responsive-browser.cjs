/* Real Chrome layout test for LedgerPeer debrief, at laptop/tablet/phone widths. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const puppeteer=require('puppeteer-core'),root=path.resolve(__dirname,'..');
async function main(){
 const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>p&&fs.existsSync(p));
 assert(chrome,'No Chromium/Chrome executable on runner');
 const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage();
  const view=fs.readFileSync(path.join(root,'view.html'),'utf8');
  const match=view.match(/<style>[\s\S]*?<\/style>/);
  assert(match,'Review-page inline CSS not found');
  const pieces=[
   '<!doctype html><html data-lp-page="review"><head><meta name="viewport" content="width=device-width, initial-scale=1">',
   match[0],'</head><body><div class="wrap"><header class="hero"><h1 class="title">Exam review</h1></header>',
   '<nav class="review-jump-nav"><button>Open AI debrief</button><button>Review questions</button></nav>',
   '<div class="review-workspace"><section class="review-primary"><h2 class="review-primary-title">Question review</h2>',
   '<p class="review-primary-hint">Review questions and source evidence.</p><div class="review-question-scroll">',
   '<div class="filters"><button class="filter-btn">All questions</button><button class="filter-btn">Needs debrief</button></div>',
   '<div class="qlist"><article class="qcard"><button class="qhead" aria-expanded="false">',
   '<span class="qno-badge">1</span><span class="qhead-mid"><span class="qhead-snippet">Classify the financial concept and its specific accounting operation.</span>',
   '<span class="qhead-tags"><span class="stamp">MA2 A1</span></span></span><span class="chevron">+</span></button></article></div></div></section>',
   '<aside class="review-side"><div class="review-side-tabs"><button class="review-side-tab">Overview</button>',
   '<button class="review-side-tab">JSON Debrief</button><button class="review-side-tab">Retry &amp; Confidence</button></div>',
   '<div class="review-side-scroll"><section class="review-panel"><div id="chatgpt-debrief" class="flow-panel">',
   '<h2>Manual AI Debrief</h2><p>Classify every question from its approved syllabus.</p>',
   '<nav class="flow-stage-nav"><button aria-pressed="true">1 · Request</button><button>2 · Import JSON</button><button>3 · Results</button></nav>',
   '<section class="flow-path flow-stage"><h3>Copy question request</h3><div class="flow-actions">',
   '<button class="flow-button primary">Copy request</button><button class="flow-button secondary">Open ChatGPT</button>',
   '</div></section><section class="flow-path flow-stage" hidden><h3>Import JSON</h3><textarea rows="5"></textarea></section>',
   '</div></section></div></aside></div></div></body></html>'
  ];
  await page.setContent(pieces.join(''));
  for(const file of ['revision-flow.css','debrief-layout.css'])await page.addStyleTag({path:path.join(root,file)});
  for(const width of [375,600,768,1024,1280,1440]){
   await page.setViewport({width,height:860,deviceScaleFactor:1});
   const m=await page.evaluate(()=>{
    const q=s=>document.querySelector(s),rect=s=>q(s).getBoundingClientRect();
    const side=q('.review-side-scroll');
    return {bodyWidth:document.documentElement.scrollWidth,width:innerWidth,
      qTop:rect('.review-primary').top,sideTop:rect('.review-side').top,
      qLeft:rect('.review-primary').left,sideLeft:rect('.review-side').left,
      maxHeight:getComputedStyle(side).maxHeight,overflowY:getComputedStyle(side).overflowY,
      jump:getComputedStyle(q('.review-jump-nav')).display!=='none',
      steps:getComputedStyle(q('.flow-stage-nav')).display!=='none',
      controls:[...document.querySelectorAll('.review-side-tab,.review-jump-nav button,.flow-stage-nav button,.flow-actions button')]
       .filter(x=>getComputedStyle(x).display!=='none').map(x=>({name:x.textContent.trim(),height:x.getBoundingClientRect().height}))};
   });
   assert(m.bodyWidth<=width+3,'Horizontal overflow at '+width+'px: '+JSON.stringify(m));
   const tablet=width<=1130;
   assert.equal(m.jump,tablet,'Jump navigation wrong at '+width);
   assert.equal(m.steps,tablet,'Guided stages wrong at '+width);
   if(tablet){
    assert(m.sideTop>m.qTop+20,'Question-first layout absent at '+width);
    assert.equal(m.maxHeight,'none','Nested height limit at '+width);
    assert.equal(m.overflowY,'visible','Nested vertical scrolling at '+width);
   }else assert(m.sideLeft>m.qLeft+200,'Desktop two-column layout absent at '+width);
   assert.equal(m.controls.filter(x=>x.height<43).length,0,'Small tap target at '+width+': '+JSON.stringify(m.controls));
   console.log('PASS '+width+'px: no overflow, '+(tablet?'question-first tablet':'desktop two-column')+', all controls >=43px');
  }
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
