'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const api=require('../study-contributions.js');
const at=(year,month,day)=>new Date(year,month-1,day,12);
const isoDay=(year,month,day)=>at(year,month,day).toISOString();
assert.doesNotThrow(()=>new Function(read('study-planner-page.js')),'Study Planner script must parse');
assert.doesNotThrow(()=>new Function(read('productivity-core.js')),'Productivity core must parse');
const empty=api.build({tasks:[],sessions:[]},at(2026,10,28));
assert.equal(empty.activeDays,0,'No contributions should be invented for empty data');
assert.equal(empty.currentStreak,0,'No fake streak should appear');
assert.equal(empty.weeks.length,53,'A full year needs aligned contribution weeks');
assert.equal(empty.weeks.flat().filter(day=>day.valid).length,365,'Exactly 365 calendar days must count');
assert.equal(empty.months[0].label,'Oct','First partial month must be labelled');
assert.equal(empty.months[0].week,1,'The first month must align to the first week');
const sample={
 tasks:[
  {done:true,completedAt:isoDay(2026,10,28)},
  {done:true,completedAt:isoDay(2026,10,28)},
  {done:false,date:'2026-10-28'},
  {done:true,date:'2026-10-28'}, // no trustworthy completedAt timestamp
  {done:true,completedAt:isoDay(2025,10,1)}
 ],
 sessions:[
  {date:isoDay(2026,10,28),minutes:45},
  {date:isoDay(2026,10,27),minutes:25},
  {date:isoDay(2026,10,29),minutes:60}, // future - exclude
  {date:'not-a-date',minutes:100},
  {date:isoDay(2026,10,28),minutes:-4}
 ]
};
const model=api.build(sample,at(2026,10,28));
assert.equal(model.activeDays,2,'Two days contain verified study activity');
assert.equal(model.totalTasks,2,'Count completed tasks, not planned tasks or timestamps that are missing');
assert.equal(model.totalSessions,2,'Only logged historical sessions count');
assert.equal(model.totalMinutes,70,'Session duration must be aggregated');
assert.equal(model.currentStreak,2,'A streak continues through yesterday and today');
assert.equal(model.bestStreak,2,'Best streak must match historical active days');
assert.equal(model.days.get('2026-10-28').total,3,'Task completions and sessions add to same-day intensity');
assert.equal(model.days.get('2026-10-28').level,3,'Three activities should be level 3');
assert.equal(model.days.get('2026-10-27').level,1,'A single logged session is level 1');
assert.equal(api.level(0),0);assert.equal(api.level(1),1);assert.equal(api.level(2),2);assert.equal(api.level(4),3);assert.equal(api.level(5),4);
const html=api.render(model);
assert.equal((html.match(/class="contrib-iso-column/g)||[]).length,301,'Render each valid day in the selected current year as a 3D cell');
assert.ok(html.includes('YOUR CONTRIBUTION LANDSCAPE.'),'Show the interactive 3D contribution heading');
assert.ok(html.includes('class="contrib-iso-svg"')&&html.includes('class="contrib-stage-scroll"'),'Render a responsive SVG stage');
assert.ok(html.includes('class="contrib-iso-top"')&&html.includes('class="contrib-iso-front"')&&html.includes('class="contrib-iso-side"'),'Render three faces on true 3D columns');
assert.equal((html.match(/class="contrib-iso-column has-activity"/g)||[]).length,3,'Only three study days should contain extruded data');
assert.ok(html.includes('id="contribYear"')&&html.includes('value="2023"'),'All four years must be available without rendering all simultaneously');
assert.ok(html.includes('id="contribFlatView" hidden'),'Keep 2D calendar collapsed by default');
assert.ok(html.includes('id="contribFlatToggle"'),'Make 2D fallback available on demand');
assert.deepEqual(model.years.map(y=>y.year),[2026,2025,2024,2023],'Show year-by-year history like the supplied reference');
assert.deepEqual(model.years.map(y=>y.contributions),[4,1,0,0],'Use true contributions, not generated history');
assert.equal(model.years[0].weeks.flat().filter(c=>c.valid).length,301,'Future dates must be blank');
assert.equal(model.years[2].weeks.flat().filter(c=>c.valid).length,366,'Include leap year 2024');
assert.ok(html.includes('4</strong> genuine study contributions in 2026'),'Show correct selected-year activity totals');
assert.ok(html.includes('class="contrib-busiest"')&&html.includes('class="contrib-streaks"'),'Display longest and current streak statistics in 3D chart');
assert.ok(html.includes('role="button"')&&html.includes('data-count="3"'),'Interactive cells must announce their study activity');
assert.ok(html.includes('data-date="2026-10-28"'),'Current local day must be represented');
assert.ok(html.includes('study session'),'Hover labels should explain recorded activity');
assert.ok(html.includes('Empty days stay grey')&&html.includes('genuine study contributions'),'Explain data integrity without fabricated activity');
assert.ok(html.includes('fixed 3D view')&&html.includes('FIXED VIEW'),'Explicitly identify the non-rotating chart');
assert.ok(html.includes('LESS')&&html.includes('MORE'),'Show green activity legend');

assert.ok(html.includes('id="contribDetail" role="status" hidden'),'Day details must be hidden until a click or tap');
assert.ok(html.includes('id="contrib3dTooltip"'),'3D bars must provide a hover/focus tooltip');
const styles=read('study-contributions.css');
assert.ok(styles.includes('border:1px solid #d0d7de!important')&&styles.includes('box-shadow:none!important'),'Graph frame must use subtle, shadow-free grey border');
assert.ok(styles.includes('#ebedf0')&&styles.includes('#b7e6a1')&&styles.includes('#8cd66d')&&styles.includes('#39a64b')&&styles.includes('#0a5920'),'3D chart must use grey floor and green bar palette');
assert.ok(!styles.includes('border:3px solid #151515')&&!styles.includes('box-shadow:5px 5px 0 #111'),'Remove oversized frame and brutalist shadow');
assert.ok(styles.includes('.planner-page .sidebar{background:#fff'),'Planner sidebar should be neutral, not yellow');
assert.ok(styles.includes('.planner-page .stats .stat{background:#fff'),'Planner stats should not be yellow');
assert.ok(read('study-planner.html').includes('<body class="planner-page">'),'Planner-only styling must not affect Calendar');

assert.ok(!html.includes('study-contrib-stats')&&!html.includes('study-contrib-callout'),'No oversized stat cards in calendar');
assert.ok(styles.includes('.contrib-iso-column')&&styles.includes('.contrib-iso-svg'),'The 3D SVG must have dedicated isolated styling');
assert.ok(!styles.includes('transform:rotate')&&!read('study-contributions.js').includes('rotateX('),'Do not allow the 3D graph to rotate');
assert.ok(!html.includes('style="background:#ffcf24"'),'No yellow fill in contribution graph');
const historical=api.build({tasks:[{done:true,completedAt:isoDay(2024,3,10)}]},at(2026,10,28));
assert.equal(historical.years[2].contributions,1,'Past years must reflect authentic historic task records');
assert.equal(historical.totalTasks,0,'Old activity must not inflate past-year summary');
const yesterdayOnly=api.build({sessions:[{date:isoDay(2026,10,27),minutes:20}]},at(2026,10,28));
assert.equal(yesterdayOnly.currentStreak,1,'A streak may remain active until the end of the next day');
assert.equal(api.activityDate('2026-02-30'),null,'Impossible date must not be accepted');
const planner=read('study-planner.html');
assert.ok(planner.includes('study-contributions.css?v=20261028d'),'Page must load green square styling');
assert.ok(planner.includes("await loadScript('study-contributions.js?v=20261028d')"),'Graph module must load before Study Planner');
const logic=read('study-planner-page.js');
assert.ok(logic.includes('Ledg'+'erPeerStudyContributions.build(db)'),'Planner should compute contributions from saved data');
assert.ok(logic.includes('LedgerPeerStudyContributions.render(contributions)'),'Planner should display graph');
assert.ok(logic.includes('LedgerPeerStudyContributions.mount('),'Planner should support click-to-inspect a day');
console.log('PASS: Study contribution grid, source integrity, date handling, intensity, rendering, and integration.');
