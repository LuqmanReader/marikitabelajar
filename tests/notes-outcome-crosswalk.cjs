#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const map=JSON.parse(fs.readFileSync('audit/all700-outcome-crosswalk-ci.json','utf8'));
const src=JSON.parse(fs.readFileSync('audit/all700-official-syllabus-evidence-ci.json','utf8'));
const lessons=JSON.parse(fs.readFileSync('audit/all700-live-lessons-ci.json','utf8'));
assert.equal(map.lessons,700);
assert.equal(map.totalRows,src.totalOutcomeLetterCandidates+map.practicalSkillTopics);
assert.equal(map.results.length,map.totalRows);
assert.equal(new Set(map.results.map(x=>x.id)).size,map.totalRows);
assert.equal(new Set(map.results.map(x=>x.topicKey)).size,700);
const byKey=new Map(lessons.rows.map(x=>[x.key,x]));
for(const row of map.results){
 const lesson=byKey.get(row.topicKey);
 assert(lesson,'Missing published lesson '+row.topicKey);
 assert.equal(row.lessonSha256,lesson.contentSha256,'Stale lesson crosswalk '+row.id);
 assert.equal(row.academicReviewStatus,'NOT_VERIFIED','Automatic approval prohibited');
 assert(row.officialPageLink.startsWith('https://www.accaglobal.com/')&&/#page=\d+$/.test(row.officialPageLink),
   'Missing official ACCA PDF page link '+row.id);
 assert(row.suggestedSections.every(s=>s.index>0&&s.index<=lesson.sections.length),
   'Invalid section mapping for '+row.id);
 assert(row.suggestedWorkedCases.every(w=>w.index>0&&w.index<=lesson.worked.length),
   'Invalid worked-case mapping for '+row.id);
}
const csv=fs.readFileSync('audit/all700-outcome-crosswalk-ci.csv','utf8');
assert.equal(csv.trim().split('\n').length,map.totalRows+1,'CSV row count mismatch');
console.log('PASS: '+map.totalRows+' outcomes/practical skill rows cover all 700 current lessons; exact official page links, source hashes and pending approvals.');
