(function(root){'use strict';
const $=id=>document.getElementById(id),data=root.LedgerFiaGuides,params=new URLSearchParams(location.search);
const papers=(root.SubjectCatalog?.papers||[]).filter(p=>p.stage.startsWith('FIA'));
const chapters=new Map();for(const b of Object.values(data?.books||{}))for(const c of b.chapters)chapters.set(b.id+':'+c.id,c);
let paper='FA1',selected='',all=false,query='';
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function list(){return(data.paperChapters[paper]||[]).filter(key=>{const c=chapters.get(key);return c&&(!query||(c.title+' '+c.text).toLowerCase().includes(query))})}
function href(key){return'fia-study.html?paper='+encodeURIComponent(paper)+'&chapter='+encodeURIComponent(key)}
function paragraph(parent,text){parent.append(node('p',text))}
function article(key){const c=chapters.get(key),el=node('article');el.id='chapter-'+c.id;el.append(node('p',paper+' · EXPANDED STUDY GUIDE · '+c.text.split(/\s+/).length+' WORDS','chaptermeta'),node('h2',c.title));let target=el,bullets=null;
 for(const line of c.text.split('\n')){
  if(!line.trim())continue;
  if(line.startsWith('## ')){target=el;bullets=null;el.append(node('h3',line.slice(3)))}
  else if(line.startsWith('### Answer')){const answer=node('details',undefined,'answer');answer.append(node('summary','Show explained answer'));el.append(answer);target=answer;bullets=null}
  else if(line.startsWith('- ')){if(!bullets){bullets=node('ul');target.append(bullets)}bullets.append(node('li',line.slice(2)))}
  else{bullets=null;paragraph(target,line)}
 }
 return el;
}
function render(){
 const keys=list();if(!keys.includes(selected))selected=keys[0]||'';
 const nav=$('chapterLinks');nav.replaceChildren();
 for(const [i,key]of keys.entries()){const a=node('a',String(i+1).padStart(2,'0')+' / '+chapters.get(key).title);a.href=href(key);if(!all&&key===selected)a.setAttribute('aria-current','page');a.addEventListener('click',e=>{e.preventDefault();selected=key;all=false;render();$('chapterBody').scrollIntoView({block:'start'});});nav.append(a)}
 $('noChapters').hidden=keys.length>0;
 const body=$('chapterBody');body.replaceChildren();for(const key of all?keys:selected?[selected]:[])body.append(article(key));
 if(!keys.length)paragraph(body,'No chapters match this search. Clear it to restore the full reading route.');
 const index=keys.indexOf(selected);$('readingPosition').textContent=all?'READING ALL '+keys.length+' CHAPTERS':keys.length?'CHAPTER '+(index+1)+' OF '+keys.length:'NO MATCHES';
 $('previousChapter').disabled=all||index<=0;$('nextChapter').disabled=all||index<0||index===keys.length-1;
 $('readAll').textContent=all?'Read one chapter at a time':'Read all chapters for this paper';
 $('topicLibrary').href='notes.html?paper='+paper+'&edition=fia-2';
 $('paperDescription').textContent=paper+' · '+(papers.find(p=>p.code===paper)?.name||'')+' · '+(data.paperChapters[paper]||[]).length+' chapters. Shared chapters may include useful material beyond this paper.';
 const source=root.LedgerPublishedSyllabi?.papers?.[paper]?.source;
 $('paperSyllabus').hidden=!source;if(source)$('paperSyllabus').href=source;
 $('taxSources').hidden=paper!=='FTX';
 if(root.history?.replaceState)root.history.replaceState(null,'',all?'fia-study.html?paper='+paper+'&read=all':href(selected));
}
async function init(){try{
 if(!data||papers.length!==10)throw Error('Study-guide data is unavailable. Refresh this page.');
 $('guideStats').textContent=data.chapterCount+' SUBSTANTIAL CHAPTERS · '+data.wordCount.toLocaleString()+' WORDS · 10 FIA PAPERS';
 if(!root.PersonalHubAuth||!await root.PersonalHubAuth.ready()){
  const panel=$('accessMessage');panel.replaceChildren(node('p','Sign in to your LedgerPeer student account, then return to the FIA Study Guides.'));const a=node('a','Sign in to LedgerPeer →');a.href='index.html#access';panel.append(a);return;
 }
 paper=papers.some(p=>p.code===params.get('paper'))?params.get('paper'):'FA1';selected=params.get('chapter')||data.paperChapters[paper][0];all=params.get('read')==='all';
 for(const p of papers){const o=node('option',p.code+' · '+p.name);o.value=p.code;$('guidePaper').append(o)}$('guidePaper').value=paper;
 $('guidePaper').addEventListener('change',e=>{paper=e.target.value;query='';$('guideSearch').value='';selected=data.paperChapters[paper][0];all=false;render()});
 $('guideSearch').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render()});
 $('readAll').addEventListener('click',()=>{all=!all;render()});
 $('previousChapter').addEventListener('click',()=>{const keys=list(),i=keys.indexOf(selected);if(i>0){selected=keys[i-1];render();$('chapterBody').scrollIntoView({block:'start'})}});
 $('nextChapter').addEventListener('click',()=>{const keys=list(),i=keys.indexOf(selected);if(i<keys.length-1){selected=keys[i+1];render();$('chapterBody').scrollIntoView({block:'start'})}});
 let printAnswers=[];root.addEventListener('beforeprint',()=>{printAnswers=Array.from(document.querySelectorAll('.answer')).map(n=>({n,open:n.open}));for(const a of printAnswers)a.n.open=true});root.addEventListener('afterprint',()=>{for(const a of printAnswers)a.n.open=a.open;printAnswers=[]});
 $('printGuide').addEventListener('click',()=>root.print());
 $('taxTables').href=data.sources.ftxTables;$('taxChanges').href=data.sources.ftxChanges;
 $('accessMessage').hidden=true;$('guideApp').hidden=false;render();
 }catch(e){$('accessMessage').hidden=false;$('accessMessage').textContent='The FIA guide could not open: '+e.message}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
