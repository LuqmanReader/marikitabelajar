// Exercise actual reader code with a minimal DOM, without signing into a real student account.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('fia-study.html','utf8');
async function create(search='',signedIn=true){
 const ids=new Map();
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.attributes={};this.dataset={};this.value='';this.hidden=false;this.classList={toggle(){}};this._text='';}
  set id(v){this._id=v;ids.set(v,this)}get id(){return this._id}
  set textContent(v){this._text=String(v);this.children=[]}get textContent(){return this._text+this.children.map(c=>c.textContent).join(' ')}
  set open(v){this._open=v;this.listeners.toggle?.forEach(f=>f({target:this}))}get open(){return this._open}
  append(...items){this.children.push(...items)}replaceChildren(...items){this.children=items;this._text=''}
  addEventListener(e,f){(this.listeners[e]??=[]).push(f)}setAttribute(k,v){this.attributes[k]=v}scrollIntoView(){}
  fire(e){this.listeners[e]?.forEach(f=>f({target:this,preventDefault(){}}))}
 }
 for(const m of html.matchAll(/id="([^"]+)"/g)){const n=new Element('div');n.id=m[1]}
 const buttons=['fia','acca','all'].map(q=>{const e=new Element('button');e.dataset.notesQualification=q;return e});
 let redirect='';let printed=false;const events={};const c={window:null,URLSearchParams,console,addEventListener:(e,f)=>events[e]=f,print:()=>{printed=true;events.beforeprint?.();events.afterprint?.()},history:{replaceState(){}},location:{search,replace:v=>redirect=v},PersonalHubAuth:{ready:async()=>signedIn,addLockButton(){}},document:{readyState:'complete',createElement:t=>new Element(t),createTextNode:t=>{const e=new Element('text');e.textContent=t;return e},getElementById:id=>ids.get(id),querySelectorAll:()=>[]}};c.window=c;vm.createContext(c);
 for(const f of ['subject-catalog.js','acca-published-data.js','fia-study-data-v2.js','fia-study-reader-v2.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
 await new Promise(r=>setImmediate(r));return{ids,buttons,redirect,c,printed:()=>printed};
}
(async()=>{
 let r=await create();assert.equal(r.ids.get('guideApp').hidden,false);assert(r.ids.get('guideStats').textContent.includes('37 SUBSTANTIAL CHAPTERS'));assert.equal(r.ids.get('chapterBody').children.length,1);
 assert(r.ids.get('chapterBody').textContent.includes('Business documents'));
 r.ids.get('nextChapter').fire('click');assert(r.ids.get('chapterBody').textContent.includes('Debits, credits'));r.ids.get('previousChapter').fire('click');assert(r.ids.get('chapterBody').textContent.includes('Business documents'));
 r.ids.get('readAll').fire('click');assert.equal(r.ids.get('chapterBody').children.length,r.c.LedgerFiaGuides.paperChapters.FA1.length);
 for(const p of Object.keys(r.c.LedgerFiaGuides.paperChapters)){r.ids.get('guidePaper').value=p;r.ids.get('guidePaper').fire('change');assert(r.ids.get('paperDescription').textContent.startsWith(p));assert.equal(r.ids.get('chapterLinks').children.length,r.c.LedgerFiaGuides.paperChapters[p].length)}
 assert.equal(r.ids.get('taxSources').hidden,false);assert(r.ids.get('taxTables').href.includes('ftx_uk_tax_rates_j26_j27.pdf'));
 r.ids.get('guideSearch').value='zzzz-no-chapter';r.ids.get('guideSearch').fire('input');assert.equal(r.ids.get('noChapters').hidden,false);assert(r.ids.get('chapterBody').textContent.includes('No chapters match'));
 r.ids.get('guideSearch').value='';r.ids.get('guideSearch').fire('input');r.ids.get('printGuide').fire('click');assert(r.printed());
 r=await create('?paper=FA2&chapter=accounting%3Acash-payroll');assert(r.ids.get('chapterBody').textContent.includes('Cash, petty cash'));
 r=await create('?paper=FA2&chapter=not-a-real-chapter');assert.equal(r.ids.get('chapterBody').children.length,1);
 r=await create('',false);assert.equal(r.ids.get('chapterBody').children.length,0);assert(r.ids.get('accessMessage').textContent.includes('Sign in'));
 console.log('PASS: FIA reader, all ten paper routes, deep links, search, navigation, print invocation and unsigned access. Browser layout not tested.');
})().catch(e=>{console.error(e);process.exitCode=1});
