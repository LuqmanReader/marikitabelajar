// node tests/fia-notes-regression.js — verifies 2026/27 FIA notes and routing.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('acca-published-data.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('notes-data.js','utf8'),ctx);
const syllabus=ctx.LedgerPublishedSyllabi.papers,notes=ctx.LedgerFiaNotes;
assert(ctx.LedgerPublishedSyllabi.edition.includes('2026'),'Syllabus must be 2026 edition');
const papers=['FA1','MA1','FA2','MA2'];
let total=0;
for(const paper of papers){
  let mapped=0;
  for(const entry of syllabus[paper].topics){
    const match=entry.match(/^([A-Z]\d+)\s*·\s*(.+)$/);
    assert(match,'Topic code invalid: '+entry);
    const lesson=notes[paper+':'+match[1]];
    assert(lesson,'Missing detailed study note: '+paper+' '+match[1]);
    assert.equal(lesson.code,match[1]);
    assert.equal(lesson.paper,paper);
    assert(lesson.summary.length>=75,'Shallow explanation: '+paper+' '+match[1]);
    assert(Array.isArray(lesson.steps)&&lesson.steps.length>=3,'Missing teaching points: '+paper+' '+match[1]);
    for(const field of ['formula','example','trap','check','answer'])
      assert(typeof lesson[field]==='string'&&lesson[field].length>=(field==='answer'?3:field==='formula'?8:15),'Missing lesson field '+field+': '+paper+' '+match[1]);
    mapped++;total++;
  }
  console.log(paper+': '+mapped+'/'+syllabus[paper].topics.length+' syllabus topics supported');
}
assert.equal(Object.keys(notes).length,total,'Orphaned notes or duplicate syllabus references');
assert.equal(total,74,'Four core FIA syllabus papers changed, audit content before release');
for(const paper of ['FBT','FMA','FFA']){
 assert(syllabus[paper]?.topics?.length>10&&/^https:\/\/www\.accaglobal\.com\//.test(syllabus[paper].source),'Supplementary FIA syllabus index missing: '+paper);
}
const html=fs.readFileSync('notes.html','utf8');
const script=fs.readFileSync('notes-page.js','utf8');
assert(html.includes('id="notesApp"')&&html.includes('id="notesFilter"')&&html.includes('id="topicList"'),'Notes navigation missing');
assert(html.includes('src="acca-published-data.js?')&&html.includes('src="notes-data.js?')&&html.includes('src="notes-page.js?'),'Missing syllabus/notes scripts');
assert(script.includes('PersonalHubAuth.ready()'),'Student auth gate missing');
assert(script.includes("content.append(makeLesson("),'Lesson renderer missing');
const home=fs.readFileSync('index.html','utf8');
assert(home.includes('FIA–ACCA Notes Library')&&!home.includes('financial-manager.html'),'Home still promotes finance instead of notes');
const hub=fs.readFileSync('hub.html','utf8');
assert(hub.includes('href="notes.html"')&&!hub.includes('achievements.html'),'Revision navigation not updated');
for(const page of ['calendar.html','study-planner.html']){
 const s=fs.readFileSync(page,'utf8');
 assert(s.includes('href="notes.html"')&&!s.includes('href="financial-manager.html"')&&!s.includes('href="achievements.html'),page+' navigation stale');
}
for(const [oldPage,dest] of [['achievements.html','notes.html'],['financial-manager.html','hub.html'],['financial-dashboard.html','hub.html']]){
 const s=fs.readFileSync(oldPage,'utf8');
 assert(s.includes('location.replace("'+dest+'")'),'Legacy destination not retired: '+oldPage);
}
const quant=fs.readFileSync('quant-model.html','utf8');
assert(!quant.includes('href="financial-manager.html"'),'QUANT returns to deleted finance area');
console.log('FIA NOTES REGRESSION PASSED | '+total+' original detailed notes | public finance card retired | QUANT preserved');
