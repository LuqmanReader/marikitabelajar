// Run: node tests/ai-only-topic-boundary.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
function read(n){return fs.readFileSync(path.join(root,n),'utf8');}
const input=read('attempt-entry.js');
const form=read('add-exam.html');
const page=read('view.html');
const prompt=read('revision-flow.js');
const workflow=read('debrief-workflow.js');
assert(!/LedgerTopicSuggest/.test(input),'Upload and save must never apply topic suggestions');
assert(!/pdf-topic-suggestions\.js/.test(form),'Topic sorter must not load in the uploader');
assert(!/pdf-topic-suggestions\.js/.test(page),'Topic sorter must not load when opening exam review');
assert(!/LedgerTopicSuggest\.apply|LedgerTopicSuggest\.repairLegacyRelated/.test(page),
  'Exam review must not classify before the user submits AI JSON');
assert.match(input,/chapter:''\s*,\s*topic_status:''/,'Importer must clear any pre-populated topic on all input formats');
assert.match(input,/Topics remain unclassified until you import the external AI JSON/,
  'Upload preview must explicitly explain when classification happens');
assert.match(page,/topic_origin:'',topic_reason:''/,'Legacy automated topic guesses must be retired');
assert.match(page,/\['rule-suggestion','legacy-syllabus-repair'\]/,
  'Legacy migration must leave manual and AI-applied tags untouched');
assert(!/existing_topic_suggestion:q\.chapter|existing_topic_origin:q\.topic_origin/.test(prompt),
  'AI prompt must not include local heuristic topic hints');
assert.match(prompt,/TOPIC CLASSIFICATION RUNS HERE/,'External AI prompt must explicitly own topic sorting');
assert.match(prompt,/APPROVED ACCA SYLLABUS FOR/,'AI prompt still needs the selected official syllabus');
assert.match(prompt,/QUESTION DATA:/,'AI prompt must still provide every source question');
assert.match(workflow,/F\.review\(\$\('aiResponse'\)\.value,data,meta\)/,
  'Only external AI response must be validated before applying');
assert.match(workflow,/\$\('applyAIResponse'\)\.addEventListener/,
  'Classification must be applied only by the dedicated AI JSON action');
console.log('PASS: upload/save evidence only, review no preclassification, prompt AI-only, manual JSON apply intact.');
