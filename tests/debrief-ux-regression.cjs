/* Browser-DOM regression for LedgerPeer manual ChatGPT handoff.
   Uses jsdom, no AI API calls and no real student exam data. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const base=path.resolve(__dirname,'..');
const dom=new JSDOM('<!doctype html><html><head></head><body><main id="first"></main><main id="second"></main></body></html>',{
 url:'https://ledgerpeer.example/view.html?id=ux-regression',runScripts:'outside-only',pretendToBeVisual:true
});
const w=dom.window;
const mediaHandlers=[];
const mq={matches:true,addEventListener(type,handler){if(type==='change')mediaHandlers.push(handler);}};
w.matchMedia=()=>mq;
w.HTMLElement.prototype.scrollIntoView=function(){};
w.confirm=()=>true;
for(const file of ['subject-catalog.js','official-exam-registry.js','acca-published-data.js','syllabus-catalog.js','chapter-analysis.js','revision-flow.js','debrief-workflow.js']){
 w.eval(fs.readFileSync(path.join(base,file),'utf8'));
}
const subject=w.SubjectCatalog.papers.find(p=>p.code==='MA2').label;
const allowed=w.LedgerSyllabus.resolve(w.localStorage,subject).topics;
const original={qno:1,is_correct:false,qtext:'<p>A cost estimation task with working.</p>',options:[{text:'$25',checked:true}],your_answer:'$25',correct_answer:'$30',original_marks:0,original_max_marks:2};
const meta={id:'ux-regression',subject,title:'UX regression',testType:'mock',testNumber:1,sourceType:'pdf',sourceFormat:'pdf'};
const sourceData=[original];
w.localStorage.setItem('tymba_exam_data:'+meta.id,JSON.stringify(sourceData));
w.localStorage.setItem('tymba_custom_exams',JSON.stringify([meta]));
const response={schema:'personal-hub-debrief-v2',exam_id:meta.id,paper:subject,paper_code:'MA2',
 attempt_signature:w.RevisionFlow.signature(sourceData),questions:[{
 qno:1,chapter:allowed[0],topic_status:'matched',topic_confidence:'high',
 topic_reason:'Official topic mapped to the tested task.',topic_evidence:'A cost estimation task',
 reasoning:'Explain the method.',calculation:'$30',justification:'Recorded answer stays unchanged.',focus:'Practice again.'
 }]};
let copied='',applied=0;
Object.defineProperty(w.navigator,'clipboard',{configurable:true,value:{
 writeText:async value=>{copied=value;},readText:async()=>JSON.stringify(response)
}});
const one=w.document.getElementById('first');
const two=w.document.getElementById('second');
w.DebriefWorkflow.mount(one,sourceData,meta,()=>{applied++;});
function pick(host,id){const el=host.querySelector('#'+id);assert(el,'Missing '+id);return el;}
function stage(host,name){const el=host.querySelector('[data-flow-stage="'+name+'"]');assert(el);return el;}
function click(host,id){pick(host,id).click();}
function next(){return new Promise(resolve=>setImmediate(resolve));}
(async()=>{
 assert.equal(stage(one,'copy').hidden,false,'Tablet opens at request step');
 assert.equal(stage(one,'response').hidden,true,'Tablet hides other stages, removing long stacked flow');
 assert.equal(one.querySelector('[data-flow-step="copy"]').getAttribute('aria-pressed'),'true');
 click(one,'copyAIRequest');await next();
 assert(copied.includes('QUESTION DATA:'),'Request copied to clipboard');
 assert.equal(stage(one,'response').hidden,false,'Copy advances to the response stage');
 assert.equal(stage(one,'copy').hidden,true);

 const draftKey='ledgerpeer_debrief_draft_v1:'+meta.id;
 const responseBox=pick(one,'aiResponse');
 responseBox.value='{"partial":true}';
 responseBox.dispatchEvent(new w.Event('input',{bubbles:true}));
 await new Promise(resolve=>setTimeout(resolve,360));
 assert.equal(JSON.parse(w.sessionStorage.getItem(draftKey)).value,'{"partial":true}','Unsaved response is preserved');

 w.DebriefWorkflow.mount(two,sourceData,meta,()=>{applied++;});
 assert.equal(pick(two,'aiResponse').value,'{"partial":true}','Draft is restored after remount/refresh');
 assert.equal(stage(two,'response').hidden,false);
 click(two,'pasteAIResponse');await next();
 assert.equal(pick(two,'aiResponse').value,JSON.stringify(response),'One-tap clipboard imports JSON');
 click(two,'previewAIResponse');
 assert.equal(pick(two,'aiResponsePreview').hidden,false,'Preview must be available before import');
 click(two,'applyAIResponse');
 assert.equal(applied,1,'Import invokes persisted-saved callback once');
 const stored=JSON.parse(w.localStorage.getItem('tymba_exam_data:'+meta.id));
 assert.equal(stored[0].chapter,allowed[0]);
 assert.equal(stored[0].original_marks,0,'Import must not change original marks');
 assert.equal(stored[0].correct_answer,'$30','Import must not change source correct answer');
 assert.equal(w.sessionStorage.getItem(draftKey),null,'Draft is removed after successful import');
 assert.equal(stage(two,'results').hidden,false,'Successful import moves to results');

 mq.matches=false;mediaHandlers.forEach(fn=>fn({matches:false}));
 assert.equal(stage(two,'copy').hidden,false,'All steps visible on desktop');
 assert.equal(stage(two,'response').hidden,false,'Desktop keeps the response alongside context');
 assert.equal(stage(two,'results').hidden,false);

 const view=fs.readFileSync(path.join(base,'view.html'),'utf8');
 const css=fs.readFileSync(path.join(base,'debrief-layout.css'),'utf8');
 assert(view.includes('data-review-jump="debrief"')&&view.includes('data-review-jump="questions"'),'Tablet has direct shortcuts to both areas');
 assert(view.includes('<button type="button" class="qhead"')&&view.includes('aria-expanded="false"'),'Question accordions must be accessible buttons');
 assert(css.includes('.review-side{grid-row:auto;position:static}'),'Tablet must not put tools ahead of questions');
 assert(css.includes('.review-side-scroll{max-height:none;min-height:0;overflow:visible}'),'Tablet must not trap scroll in the side pane');
 console.log('PASS: Tablet stages, browser clipboard, per-attempt draft recovery, JSON preview/import, marks integrity, desktop mode and question accessibility.');
 dom.window.close();
})().catch(err=>{console.error(err);process.exitCode=1;dom.window.close();});
