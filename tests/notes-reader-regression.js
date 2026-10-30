// Exercise actual reader code with a minimal DOM, without signing into a real student account.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('notes.html','utf8');
async function create(search='',signedIn=true){
 const ids=new Map();
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.attributes={};this.dataset={};this.value='';this.hidden=false;this.classList={toggle(){},add(){},remove(){}};this._text='';}
  set id(v){this._id=v;ids.set(v,this)}get id(){return this._id}
  set textContent(v){this._text=String(v);this.children=[]}get textContent(){return this._text+this.children.map(c=>c.textContent).join(' ')}
  set open(v){this._open=v;this.listeners.toggle?.forEach(f=>f({target:this}))}get open(){return this._open}
  append(...items){this.children.push(...items)}replaceChildren(...items){this.children=items;this._text=''}
  addEventListener(e,f){(this.listeners[e]??=[]).push(f)}setAttribute(k,v){this.attributes[k]=v}scrollIntoView(){}
  fire(e){this.listeners[e]?.forEach(f=>f({target:this}))}
 }
 for(const m of html.matchAll(/id="([^"]+)"/g)){const n=new Element('div');n.id=m[1]}
 const buttons=['fia','acca','all'].map(q=>{const e=new Element('button');e.dataset.notesQualification=q;return e});
 let redirect='';const c={window:null,LedgerNotesDocumentBuild:JSON.parse(fs.readFileSync('notes-release.json','utf8')).build,URLSearchParams,console,location:{search,replace:v=>redirect=v},PersonalHubAuth:{ready:async()=>signedIn,addLockButton(){}},document:{readyState:'complete',createElement:t=>new Element(t),createTextNode:t=>{const e=new Element('text');e.textContent=t;return e},getElementById:id=>ids.get(id),querySelectorAll:()=>buttons}};c.window=c;vm.createContext(c);
 for(const f of [
  'subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js',
  'notes-expanded-data.js','notes-outcome-lessons.js','fia-study-data-v2.js','fia-study-content-v2.js',
  'textbook-fa1-part-a.js','textbook-fa1-part-b.js','textbook-ma1.js',
  'textbook-ma2-part-a.js','textbook-ma2-part-b.js',
  'textbook-fa2-part-a.js','textbook-fa2-part-b.js','textbook-fa2-part-c.js',
  'textbook-integrated-cases.js',
  'textbook-crossqual-a1.js','textbook-crossqual-a2-foundation.js','textbook-crossqual-a2-professional.js',
  'textbook-crossqual-a3-foundation.js','textbook-crossqual-a3-professional.js',
  'textbook-crossqual-batch4a.js','textbook-crossqual-batch4b.js','textbook-crossqual-batch4c.js','textbook-crossqual-batch4d.js','textbook-structured-all-remaining.js',
  'notes-visual-workbook-data.js','notes-visual-workbook.js',
  'notes-worked-tables-data.js','notes-worked-tables.js','notes-visual-all.js','notes-page.js'
 ])vm.runInContext(fs.readFileSync(f,'utf8'),c);
 await new Promise(r=>setImmediate(r));return{ids,buttons,redirect};
}
(async()=>{
 let r=await create();let list=r.ids.get('topicList');assert.equal(list.children.length,700);assert(r.ids.get('paperIntro').textContent.includes('209 independently authored extended chapters'),'Coverage counter must not pretend drafts are completed originals');assert.equal(r.ids.get('coverageRows').children.length,25);assert.equal(r.ids.get('notesLoading').hidden,true);
 let first=list.children[0],detail=first.children[1];assert.equal(detail.children.length,0,'Lesson content should load lazily');first.open=true;assert.equal(detail.children.length,1);first.open=false;first.open=true;assert.equal(detail.children.length,1,'Do not duplicate opened content');assert(detail.textContent.includes('LEDGERPEER TEXTBOOK'),'FIA topics must render the original dedicated chapter');
 const select=r.ids.get('paperSelect');select.value='TX';select.fire('change');assert.equal(list.children.length,36);assert(r.ids.get('paperIntro').textContent.includes('VARIANT UK'));
 const filter=r.ids.get('notesFilter');filter.value='lesson';filter.fire('change');assert.equal(list.children.length,6,'TX includes six individually authored extended chapters');assert.equal(r.ids.get('notesEmpty').hidden,true,'Nonempty detailed-chapter filter must not show empty state');filter.value='outline';filter.fire('change');assert.equal(list.children.length,30,'TX shows 30 provisional structured teaching drafts still requiring full authoring');filter.value='all';filter.fire('change');
 const search=r.ids.get('notesSearch');search.value='zzzz-no-match';search.fire('input');assert.equal(list.children.length,0);search.value='';search.fire('input');
 r.buttons[0].fire('click');assert.equal(select.value,'FA2');assert.equal(list.children.length,22);r.buttons[1].fire('click');assert.equal(select.value,'BT');assert.equal(list.children.length,36);r.buttons[2].fire('click');assert.equal(list.children.length,700);
 r=await create('?paper=TX&topic=B5');assert.equal(r.ids.get('topic-TX-B5').open,true);assert.equal(r.ids.get('topic-TX-B5').children[1].children.length,1);
 r=await create('',false);assert.equal(r.redirect,'index.html');assert.equal(r.ids.get('topicList').children.length,0,'Do not render lessons before authentication');
 console.log('PASS: all-topic rendering, lazy loading, paper and qualification filters, empty state, deep links and auth rejection.');
})().catch(e=>{console.error(e);process.exitCode=1});
