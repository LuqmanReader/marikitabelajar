// Run: node tests/universal-document.test.js
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../universal-pdf-document.js'),'utf8'),context);
const d=context.window.LedgerPeerUniversalDocument;
function fixture(lines){return [{number:1,lines}];}
const report=d.parse(fixture(['Annual report','Operating profit $150,000','Revenue increased year over year.']));
assert.equal(report.questions.length,0);
assert.equal(report.graded,false);
assert.ok(report.warnings.some(x=>/grading|No verified/i.test(x)));
const assignment=d.parse(fixture(['Exercise 1','Explain absorption costing','Exercise 2','What is marginal costing?']));
assert.equal(assignment.questions.length,2);
assert.equal(assignment.graded,false);
const exam=d.parse(fixture(['FINAL SCORE','15 out of 20','Problem 1','Score 8 / 10','Your response: A','Answer key: B','Problem 2','Score 7 / 10','Your response: C','Answer key: C']));
assert.equal(exam.graded,true);
assert.equal(exam.questions.length,2);
assert.equal(exam.questions[0].original_marks,8);
assert.equal(exam.questions[0].is_correct,false);
assert.equal(exam.questions[1].is_correct,false);
const mismatch=d.parse(fixture(['Final score','16 out of 20','Problem 1','Score 8 / 10','Problem 2','Score 7 / 10']));
assert.equal(mismatch.graded,false);
assert.equal(mismatch.questions[0].original_marks,null);
const scan=d.parse([{number:1,lines:[]}]);
assert.equal(scan.questions.length,0);
assert.equal(scan.graded,false);
console.log('Universal document regression checks passed: report, assignment, alternate exam, mismatched marks, empty scan.');
