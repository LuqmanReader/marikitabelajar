// node tests/fia-notes-regression.js — verifies 2026/27 FIA notes and routing.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={};ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('subject-catalog.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('acca-published-data.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('notes-data.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('notes-uk-syllabi.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('notes-expanded-data.js','utf8'),ctx);
const syllabus=ctx.LedgerNotesSyllabi.papers,notes=ctx.LedgerFiaNotes;
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
const registry=ctx.SubjectCatalog.papers;
const fia=registry.filter(p=>p.stage.startsWith('FIA'));
const acca=registry.filter(p=>p.stage.startsWith('ACCA'));
assert.equal(fia.length,10,'Expected 10 FIA papers including specialist options');
assert.equal(acca.length,15,'Expected 15 ACCA qualification papers');
assert.equal(registry.length,25,'Expected all 25 FIA and ACCA subjects in official catalog');
assert.equal(new Set(registry.map(p=>p.code)).size,25,'Subject codes must be unique');
let accaTopics=0;
for(const paper of acca){
 const data=syllabus[paper.code];
 assert(data?.topics?.length>=10,'Missing ACCA syllabus topics: '+paper.code);
 assert(data.source?.startsWith('https://www.accaglobal.com/'),'Missing official source for '+paper.code);
 const ids=new Set();
 for(const item of data.topics){
  const match=item.match(/^([A-Z][0-9]+) · (.+)$/);
  assert(match,'Invalid ACCA topic code in '+paper.code+': '+item);
  assert(!ids.has(match[1]),'Repeated syllabus code '+paper.code+': '+match[1]);
  ids.add(match[1]);accaTopics++;
 }
 assert(Object.keys(notes).some(k=>k.startsWith(paper.code+':')),'No original study lesson for '+paper.code);
}
assert(accaTopics>300,'ACCA study topic index incomplete');
assert(Object.keys(notes).length>=total+acca.length,'Missing existing study lessons');
assert.equal(total,74,'Four core FIA syllabus papers changed, audit content before release');
for(const paper of ['FBT','FMA','FFA']){
 assert(syllabus[paper]?.topics?.length>10&&/^https:\/\/www\.accaglobal\.com\//.test(syllabus[paper].source),'Supplementary FIA syllabus index missing: '+paper);
}
const html=fs.readFileSync('notes.html','utf8');
const script=fs.readFileSync('notes-page.js','utf8');
assert(html.includes('id="notesApp"')&&html.includes('id="notesFilter"')&&html.includes('id="topicList"'),'Notes navigation missing');
assert(html.includes('src="subject-catalog.js?')&&html.includes('src="acca-published-data.js?')&&html.includes('src="notes-data.js?')&&html.includes('src="notes-page.js?'),'Missing full subject registry / syllabus / notes scripts');
assert(html.includes('data-notes-qualification="acca"') && html.includes('data-notes-qualification="fia"') && html.includes('data-notes-qualification="all"'),'Missing FIA vs ACCA first-class selector');
assert(script.includes('PersonalHubAuth.ready()'),'Student auth gate missing');
assert(script.includes('SubjectCatalog?.papers')&&script.includes("qualification==='acca'"),'Notes renderer still limited to FIA hardcoded subjects');
assert(!script.includes('ACROSS 7 PAPERS'),'Outdated FIA-only topic count found');
assert(script.includes("paper=arg;qualification=qualificationOf(arg)"),'Deep linked ACCA subjects must switch qualification automatically');
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
console.log('FIA + ACCA NOTES REGRESSION PASSED | FIA core: '+total+' existing core notes | ACCA: '+acca.length+' subjects, '+accaTopics+' topics, '+Object.keys(notes).length+' core lesson entries | finance retired | QUANT preserved');

