/* Saved attempt editing must never mutate scores, question data, or debriefs. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root={SubjectCatalog:{canonical:x=>x}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../exam-model.js'),'utf8'),{window:root});
const M=root.ExamModel;
assert.equal(M.suggestTitle('Mock Test 2','pre',2),'Progress Test 2');
assert.equal(M.suggestTitle('Mock Test 2 — Group B','pre',3),'Progress Test 3 — Group B');
assert.equal(M.suggestTitle('My MA2 assessment','pre',2),'My MA2 assessment');
assert.equal(M.suggestTitle('','set',4),'Set 4');
const exams=[
 {id:'attempt-test',file:'view.html?id=attempt-test',subject:'MA2',title:'Mock Test 2',
  testType:'pre',testNumber:2,correct:29,total:50,topics:{B1:4},attemptedAt:'2026-11-05T00:00:00Z'},
 {id:'another',title:'Progress Test 1 — PT1',testType:'pre',testNumber:1,correct:22,total:50}
];
const db={
 tymba_custom_exams:JSON.stringify(exams),
 'tymba_exam_data:attempt-test':JSON.stringify([{qno:1,is_correct:false,reasoning:'Reviewed earlier'}]),
 'view_attempt-test_debrief_progress_v1':JSON.stringify({'1':true})
};
const storage={getItem:key=>db[key]||null,setItem:(key,value)=>{db[key]=value;}};
const questionBefore=db['tymba_exam_data:attempt-test'];
const debriefBefore=db['view_attempt-test_debrief_progress_v1'];
const after=M.updateSavedAttempt(storage,'attempt-test',{title:'Progress Test 2 — PT2',testType:'pre',testNumber:2});
assert.equal(after.title,'Progress Test 2 — PT2');
assert.equal(after.correct,29);
assert.equal(after.file,'view.html?id=attempt-test');
assert.equal(JSON.stringify(after.topics),JSON.stringify({B1:4}));
assert.equal(db['tymba_exam_data:attempt-test'],questionBefore);
assert.equal(db['view_attempt-test_debrief_progress_v1'],debriefBefore);
assert.equal(JSON.parse(db.tymba_custom_exams)[1].title,'Progress Test 1 — PT1');
const switched=M.updateSavedAttempt(storage,'attempt-test',{title:'A custom mock title',testType:'mock',testNumber:5});
assert.equal(switched.testType,'mock');
assert.equal(switched.title,'A custom mock title');
assert.equal(switched.testNumber,5);
for(const bad of [
 {title:'',testType:'pre',testNumber:2},
 {title:'Name',testType:'unknown',testNumber:2},
 {title:'Name',testType:'pre',testNumber:0},
 {title:'Name',testType:'set',testNumber:1,setChapter:''}
]){
 assert.throws(()=>M.updateSavedAttempt(storage,'attempt-test',bad));
}
assert.throws(()=>M.updateSavedAttempt(storage,'nonexistent',{title:'Name',testType:'pre',testNumber:1}));
console.log('PASS: attempt title/type/number edits, stale-name repair, data preservation, validation');
