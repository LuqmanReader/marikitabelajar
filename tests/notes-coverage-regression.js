const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={};c.window=c;vm.createContext(c);
for(const f of ['subject-catalog.js','acca-published-data.js','notes-data.js','notes-uk-syllabi.js','notes-expanded-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const original=c.LedgerPublishedSyllabi.papers,papers=c.LedgerNotesSyllabi.papers,notes=c.LedgerFiaNotes;
assert.equal(Object.keys(papers).length,25);
for(const [p,v]of [['LW','ENG'],['TX','UK'],['ATX','UK'],['FTX','UK']])assert.equal(papers[p].variant,v);
for(const p of ['LW','TX','ATX'])assert.equal(original[p].variant,'MYS','Do not change historical revision taxonomy');
assert.equal(papers.LW.topics.length,20);assert.equal(papers.TX.topics.length,36);assert.equal(papers.ATX.topics.length,24);
assert(papers.TX.topics.some(t=>t.startsWith('D1')&&t.includes('transfers of value')));
assert(!papers.TX.topics.some(t=>/service tax|real property gains tax/i.test(t)));
let total=0;const valid=new Set(),report=[];
for(const [p,data]of Object.entries(papers)){
 assert(/^https:\/\/www\.accaglobal\.com\/.+\.pdf$/.test(data.source),'Invalid source '+p);
 const seen=new Set();let count=0;
 for(const topic of data.topics){const m=/^([A-Z]\d+) · (.+)$/.exec(topic);assert(m,'Invalid topic '+topic);assert(!seen.has(m[1]),'Duplicate '+p+':'+m[1]);seen.add(m[1]);const key=p+':'+m[1];valid.add(key);total++;
  const n=notes[key];assert(n,'No core lesson '+key);count++;
  assert.equal(n.paper,p);assert.equal(n.code,m[1]);
  for(const f of ['summary','formula','example','trap','check','answer'])assert(typeof n[f]==='string'&&n[f].trim().length>2,key+' missing '+f);
  assert(n.summary.length>=75,key+' insufficient introduction');assert(n.steps?.length>=3,key+' missing teaching points');
  if(['LW','TX','ATX'].includes(p)){assert(n.reviewStatus,key+' must show review status');assert(!/ringgit|labuan|real property gains tax/i.test(n.summary+' '+n.example),key+' incorrect variant');}
 }
 report.push({paper:p,variant:data.variant,coreLessons:count,headings:data.topics.length});
}
for(const key of Object.keys(notes))assert(valid.has(key),'Orphan or misclassified lesson '+key);
assert.equal(total,700);assert.equal(Object.keys(notes).length,700);
const html=fs.readFileSync('notes.html','utf8'),js=fs.readFileSync('notes-page.js','utf8');
assert(html.includes('id="coverageRows"'));
assert(html.includes('The heading index is not the same as textbook completeness.'),'Must distinguish topic headings from full syllabus coverage');
assert(html.includes('individual 2026–27 outcome-level verification is not finished'),'Must disclose that syllabus outcome certification remains unfinished');
assert(html.indexOf('notes-uk-syllabi.js')<html.indexOf('notes-page.js'));assert(html.indexOf('notes-expanded-data.js')<html.indexOf('notes-page.js'));
assert(js.includes('PersonalHubAuth.ready()'));assert(js.includes('function loadContent()'));assert(js.includes('if(el.open)loadContent()'));
console.table(report);console.log('PASS: 700/700 headings have core lessons. Detailed learning-outcome and exam-practice completeness is not asserted.');
