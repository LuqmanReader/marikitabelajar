/* ACCA public syllabus and exam-format source registry. The authoritative technical
   content is ACCA's own syllabus and study guide for the correct paper, sitting and variant.
   Never select UK tax/law when a Malaysian sitting was specified. */
(function(root){
 'use strict';
 const prefix='https://www.accaglobal.com/gb/en/student/exam-support-resources/';
 const foundation=prefix+'foundation-level-study-resources/';
 const skills=prefix+'fundamentals-exams-study-resources/';
 const pro=prefix+'professional-exams-study-resources/';
 const sources={
  FA1:[foundation+'fa1/fa1-syllabus-study-guide.html','GLO'],
  MA1:[foundation+'ma1/ma1-syllabus-study-guide.htm.html','GLO'],
  FA2:[foundation+'fa2/fa2-syllabus-study-guide.html','GLO'],
  MA2:[foundation+'ma2/ma2-syllabus-study-guide.html','GLO'],
  FBT:[skills+'f1/syllabus-study-guide.html','GLO'],
  FMA:[foundation+'fma/fma-syllabus-study-guide.html','GLO'],
  FFA:[foundation+'ffa/ffa-syllabus-study-guide.html','GLO'],
  FAU:[foundation+'fau/fau-syllabus-study-guide.html','GLO'],
  FFM:[foundation+'ffm/ffm-syllabus-study-guide.html','GLO'],
  FTX:[foundation+'ftx/ftx-syllabus-study-guide.html','UK'],
  BT:[skills+'f1/syllabus-study-guide.html','GLO'],
  MA:[skills+'f2/syllabus-study-guide.html','GLO'],
  FA:[skills+'f3/syllabus-study-guide.html','GLO'],
  LW:[skills+'f4/acca-f4-syllabus-study-guide/f4-syllabus-and-study-guide-malaysia-mys.html','MYS'],
  PM:[skills+'f5/syllabus-study-guide.html','GLO'],
  TX:[skills+'f6/syllabus-study-guide/f6-syllabus-study-guide-malaysia-mys.html','MYS'],
  FR:[skills+'f7/syllabus-study-guide.html','GLO'],
  AA:[skills+'f8/syllabus-study-guide.html','GLO'],
  FM:[skills+'f9/syllabus-study-guide.html','GLO'],
  SBL:[pro+'strategic-business-leader/syllabus-study-guide.html','GLO'],
  SBR:[pro+'strategic-business-reporting/syllabus-and-study-guide.html','INT'],
  AFM:[pro+'p4/syllabus-study-guide.html','GLO'],
  APM:[pro+'p5/syllabus-study-guide.html','GLO'],
  ATX:[pro+'p6/syllabus-study-guide/p6-syllabus-and-study-guide-malaysia-mys.html','MYS'],
  AAA:[pro+'p7/syllabus-study-guide/p7-international-int-syllabus-study-guide.html','INT']
 };
 const formats={
  FA1:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'All questions',kind:'multiple choice',count:50,marksEach:2}]},
  MA1:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'All questions',kind:'multiple choice',count:50,marksEach:2}]},
  FA2:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'All questions',kind:'objective test (mixed response types)',count:50,marksEach:2}]},
  MA2:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'All questions',kind:'objective test (mixed response types)',count:50,marksEach:2}]},
  FBT:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'A',kind:'objective test',count:46,marks:76,detail:'16 × 1 mark; 30 × 2 marks'},{name:'B',kind:'multi-task',count:6,marksEach:4}]},
  BT:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'A',kind:'objective test',count:46,marks:76,detail:'16 × 1 mark; 30 × 2 marks'},{name:'B',kind:'multi-task',count:6,marksEach:4}]},
  FMA:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'A',kind:'objective test',count:35,marksEach:2},{name:'B',kind:'multi-task',count:3,marksEach:10}]},
  MA:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'A',kind:'objective test',count:35,marksEach:2},{name:'B',kind:'multi-task',count:3,marksEach:10}]},
  FFA:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'A',kind:'objective test',count:35,marksEach:2},{name:'B',kind:'multi-task',count:2,marksEach:15}]},
  FA:{mode:'on-demand',durationMinutes:120,marks:100,sections:[{name:'A',kind:'objective test',count:35,marksEach:2},{name:'B',kind:'multi-task',count:2,marksEach:15}]},
  PM:{mode:'session',durationMinutes:180,marks:100,sections:[{name:'A',kind:'objective test',count:15,marksEach:2},{name:'B',kind:'scenario: 3 × 5 objective tests',count:3,marksEach:10},{name:'C',kind:'constructed response',count:2,marksEach:20}]},
  FM:{mode:'session',durationMinutes:180,marks:100,sections:[{name:'A',kind:'objective test',count:15,marksEach:2},{name:'B',kind:'scenario: 3 × 5 objective tests',count:3,marksEach:10},{name:'C',kind:'constructed response',count:2,marksEach:20}]},
  SBL:{mode:'session',durationMinutes:195,marks:100,sections:[{name:'Case study',kind:'three compulsory integrated tasks',count:3,marks:100,detail:'80 technical + 20 professional skills marks; pre-seen information released two weeks before'}]},
  SBR:{mode:'session',durationMinutes:195,marks:100,sections:[{name:'A',kind:'constructed response',count:2,marks:50,detail:'30 + 20 marks'},{name:'B',kind:'constructed response',count:2,marksEach:25,detail:'Four professional skills marks across paper'}]}
 };
 const formatSource={
  FA1:'https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/foundation-level-exam-faqs.html',
  MA1:'https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/foundation-level-exam-faqs.html',
  FA2:'https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/foundation-level-exam-faqs.html',
  MA2:'https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/foundation-level-exam-faqs.html',
  FBT:'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f1/session-cbe-introduction/bt-essentials.html',
  BT:'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f1/session-cbe-introduction/bt-essentials.html',
  FMA:'https://www.accaglobal.com/sg/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/changes-to-the-structure-of-paper-f2-fma.html',
  MA:'https://www.accaglobal.com/sg/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/changes-to-the-structure-of-paper-f2-fma.html',
  FFA:'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f3/technical-articles/fa-ffa-structure.html',
  FA:'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f3/technical-articles/fa-ffa-structure.html',
  PM:'https://www.accaglobal.com/my/en/student/exam-support-resources/fundamentals-exams-study-resources/f5/faqs.html',
  FM:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/acca/f9/studyguides/FM%20S25-J26%20syllabus%20and%20study%20guide.pdf',
  SBL:'https://www.accaglobal.com/my/en/student/exam-support-resources/professional-exams-study-resources/strategic-business-leader/introduction/intro-to-strategic-business-leader-sbl-essentials-on-one-page.html',
  SBR:'https://www.accaglobal.com/my/en/student/exam-support-resources/professional-exams-study-resources/strategic-business-reporting/introduction/intro-to-strategic-business-reporting-sbr-essentials-on-one-page.html'
 };
 for(const code of Object.keys(sources)){
   if(!formats[code])formats[code]={mode:(['FAU','FFM','FTX','TX','FR','AA','LW','AFM','APM','ATX','AAA'].includes(code)?'session':'on-demand'),durationMinutes:null,marks:100,sections:[],needsGuideVerification:true};
 }
 // For Malaysian-specific and international versions, select variant explicitly in future releases.
 function get(paper){const code=String(paper||'').match(/^([A-Z]+[0-9]*)(?=\s|·|$)/)?.[1]||String(paper||'');const source=sources[code];return source?{code,source:source[0],variant:source[1],format:formats[code],formatSource:formatSource[code]||source[0]}:null;}
 root.LedgerOfficialExamRegistry={sources,formats,get,formatSource};
})(typeof window!=='undefined'?window:globalThis);