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
assert.equal((html.match(/class="study-contrib-square level-/g)||[]).length,1397,'Render valid days for current year and three full previous calendar years');
assert.ok(html.includes('Study contributions on LedgerPeer'),'Show a simple GitHub-inspired title');
assert.deepEqual(model.years.map(y=>y.year),[2026,2025,2024,2023],'Show year-by-year history like the supplied reference');
assert.deepEqual(model.years.map(y=>y.contributions),[4,1,0,0],'Use true contributions, not generated history');
assert.equal(model.years[0].weeks.flat().filter(c=>c.valid).length,301,'Future dates must be blank');
assert.equal(model.years[2].weeks.flat().filter(c=>c.valid).length,366,'Include leap year 2024');
assert.ok(html.includes('2026: 4 contributions (so far)')&&html.includes('2025: 1 contributions'),'Display per-year totals');
assert.ok(html.includes('Jan')&&html.includes('Dec'),'Show month headers');
assert.ok(html.includes('data-date="2026-10-28"'),'Current local day must be represented');
assert.ok(html.includes('study session'),'Hover labels should explain recorded activity');
assert.ok(html.includes('No fabricated activity'),'Display must clarify truthful data source');
assert.ok(html.includes('Current streak')&&html.includes('Minutes logged'),'Display streaks and time');
assert.ok(html.includes('How contributions are counted')&&html.includes('Less')&&html.includes('More'),'Use GitHub-style legend with count explanation');

assert.ok(html.includes('id="contribDetail" role="status" hidden'),'Day details must not auto-highlight today');
const styles=read('study-contributions.css');
assert.ok(styles.includes('border:1px solid #d8dee4!important')&&styles.includes('box-shadow:none!important'),'Graph frame must use subtle, shadow-free grey border');
assert.ok(styles.includes('#ebedf0')&&styles.includes('#9be9a8')&&styles.includes('#40c463')&&styles.includes('#30a14e')&&styles.includes('#216e39'),'Graph squares must match GitHub green scale');
assert.ok(!styles.includes('border:3px solid #151515')&&!styles.includes('box-shadow:5px 5px 0 #111'),'Remove oversized frame and brutalist shadow');
assert.ok(styles.includes('.planner-page .sidebar{background:#fff'),'Planner sidebar should be neutral, not yellow');
assert.ok(styles.includes('.planner-page .stats .stat{background:#fff'),'Planner stats should not be yellow');
assert.ok(read('study-planner.html').includes('<body class="planner-page">'),'Planner-only styling must not affect Calendar');

assert.ok(!html.includes('study-contrib-stats')&&!html.includes('study-contrib-callout'),'No oversized stat cards in calendar');
assert.ok(styles.includes('.planner-page .study-contrib-square.level-0')&&styles.includes('background:#216e39!important'),'Graph squares must explicitly override yellow button theme');
assert.ok(!html.includes('style="background:#ffcf24"'),'No yellow fill in contribution graph');
const historical=api.build({tasks:[{done:true,completedAt:isoDay(2024,3,10)}]},at(2026,10,28));
assert.equal(historical.years[2].contributions,1,'Past years must reflect authentic historic task records');
assert.equal(historical.totalTasks,0,'Old activity must not inflate past-year summary');
const yesterdayOnly=api.build({sessions:[{date:isoDay(2026,10,27),minutes:20}]},at(2026,10,28));
assert.equal(yesterdayOnly.currentStreak,1,'A streak may remain active until the end of the next day');
assert.equal(api.activityDate('2026-02-30'),null,'Impossible date must not be accepted');
const planner=read('study-planner.html');
assert.ok(planner.includes('study-contributions.css?v=20261028c'),'Page must load green square styling');
assert.ok(planner.includes("await loadScript('study-contributions.js?v=20261028c')"),'Graph module must load before Study Planner');
const logic=read('study-planner-page.js');
assert.ok(logic.includes('Ledg'+'erPeerStudyContributions.build(db)'),'Planner should compute contributions from saved data');
assert.ok(logic.includes('LedgerPeerStudyContributions.render(contributions)'),'Planner should display graph');
assert.ok(logic.includes('LedgerPeerStudyContributions.mount('),'Planner should support click-to-inspect a day');
console.log('PASS: Study contribution grid, source integrity, date handling, intensity, rendering, and integration.');
