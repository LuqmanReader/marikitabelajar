'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'profile-page.js'),'utf8');
const markup=fs.readFileSync(path.join(root,'profile.html'),'utf8');
const catalogSource=fs.readFileSync(path.join(root,'subject-catalog.js'),'utf8');
const schema=fs.readFileSync(path.join(root,'supabase/student-profile-multiple-papers.sql'),'utf8');
assert.doesNotThrow(()=>new Function(source));
assert.ok(schema.includes('array[current_paper]'),'Existing single-paper profiles should be backfilled');
assert.ok(schema.includes('current_papers text[] not null'),'Multi-subject selections need a persisted array');
assert.ok(markup.includes('id="subjectOptions"')&&markup.includes('id="subjectSearch"'),'Picker and search must exist');
assert.ok(!markup.includes('id="currentPaper"'),'No one-paper-only selector');
assert.ok(markup.indexOf('subject-catalog.js')<markup.indexOf('profile-page.js'),'Catalog must load first');
const sourceStart=source.indexOf('const selectedPapers=new Set();');
const sourceEnd=source.indexOf('async function init()',sourceStart);
assert.ok(sourceStart>0&&sourceEnd>sourceStart,'Need extractable subject-picker logic');
const nodes={};
function el(tag){
 return {
  tag,children:[],listeners:{},dataset:{},hidden:false,value:'',textContent:'',checked:false,className:'',
  append(...children){this.children.push(...children)},
  appendChild(child){this.children.push(child)},
  replaceChildren(...children){this.children=children.flatMap(child=>child.tag==='fragment'?child.children:[child]);},
  addEventListener(type,fn){this.listeners[type]=fn},
  matches(selector){return selector==='input[name="currentPapers"]'&&this.tag==='input'&&this.name==='currentPapers';},
  querySelectorAll(selector){
   const result=[];
   const match=(n)=> selector==='input[type="checkbox"]'?(n.tag==='input'&&n.type==='checkbox')
    :selector==='.subject-stage'?n.className==='subject-stage'
    :selector==='.subject-choice'?n.className==='subject-choice':false;
   const visit=(n)=>{for(const c of n.children){if(match(c))result.push(c);visit(c)}};
   visit(this);return result;
  }
 };
}
nodes.subjectOptions=el('div');
nodes.subjectSearch=el('input');
nodes.subjectSelectedCount=el('span');
nodes.subjectNoMatches=el('p');
const byId=name=>{assert.ok(nodes[name],'Unexpected ID '+name);return nodes[name]};
const document={createElement:el,createDocumentFragment:()=>el('fragment')};
const window={SubjectCatalog:{papers:[
 {code:'FA2',name:'Maintaining Financial Records',stage:'FIA — Foundation exams'},
 {code:'MA2',name:'Managing Costs and Finance',stage:'FIA — Foundation exams'},
 {code:'FR',name:'Financial Reporting',stage:'ACCA — Applied Skills'}
]}};
const api=new Function('document','byId','window',
 source.slice(sourceStart,sourceEnd)+
 ';return {validPapers,selectedPaperCodes,restoreSubjects,populateSubjectPicker,filterSubjectPicker,selectedPapers};'
)(document,byId,window);
api.populateSubjectPicker();
assert.equal(nodes.subjectOptions.querySelectorAll('input[type="checkbox"]').length,3,'All paper choices appear');
assert.equal(nodes.subjectSelectedCount.textContent,'NO SUBJECTS SELECTED','No fake initial selection');
api.restoreSubjects({current_paper:'FA2',current_papers:['FA2','MA2','FA2','unknown']});
assert.deepEqual(api.selectedPaperCodes(),['FA2','MA2'],'Restore multiple selections without duplicate or unsupported codes');
assert.equal(nodes.subjectSelectedCount.textContent,'2 SUBJECTS SELECTED · FA2, MA2','Clearly show chosen subjects');
const checks=nodes.subjectOptions.querySelectorAll('input[type="checkbox"]');
assert.deepEqual(checks.map(e=>e.checked),[true,true,false],'Selected subjects must be visibly checked');
api.restoreSubjects({current_paper:'FR'});
assert.deepEqual(api.selectedPaperCodes(),['FR'],'Legacy single-paper records remain supported');
api.restoreSubjects({current_papers:['MA2','FA2'],current_paper:'FR'});
assert.deepEqual(api.selectedPaperCodes(),['MA2','FA2'],'Multi-paper selections take precedence over stale primary paper');
checks[2].checked=true;
nodes.subjectOptions.listeners.change({target:checks[2]});
assert.deepEqual(api.selectedPaperCodes(),['MA2','FA2','FR'],'Checkbox should add a third subject');
checks[1].checked=false;
nodes.subjectOptions.listeners.change({target:checks[1]});
assert.deepEqual(api.selectedPaperCodes(),['FA2','FR'],'Checkbox should remove only that subject');
nodes.subjectSearch.value='financial reporting';
nodes.subjectSearch.listeners.input();
assert.equal(nodes.subjectOptions.querySelectorAll('.subject-stage')[0].hidden,true,'Search should hide unrelated FIA group');
assert.equal(nodes.subjectOptions.querySelectorAll('.subject-stage')[1].hidden,false,'Search should reveal matching ACCA group');
assert.deepEqual(api.selectedPaperCodes(),['FA2','FR'],'Filtering subjects must not clear hidden selections');
nodes.subjectSearch.value='unknown paper';
nodes.subjectSearch.listeners.input();
assert.equal(nodes.subjectNoMatches.hidden,false,'Search shows no-match state');
assert.deepEqual(api.selectedPaperCodes(),['FA2','FR'],'No-match state must not remove selected papers');
assert.ok(source.includes('current_papers:papers')&&source.includes("current_paper:papers[0]||''"),'Save all papers while retaining primary field');
assert.ok(source.includes("from('student_profiles').upsert(payload,{onConflict:'user_id'})"),'Use existing ownership-guarded profile persistence');
console.log('PASS: multiple FIA/ACCA subject selection, legacy restoration, editing, search, and persistence contract.');
