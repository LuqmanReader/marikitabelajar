/* ACCA syllabus headings (not invented AI categories).
   Sources: ACCA PM 2026/27 syllabus, MA2 2025/26 syllabus, MA1 2025/26 syllabus.
   Always use the selected paper; never infer it from an uploaded PDF. */
(function(root){
 'use strict';
 const syllabus={
  PM:[
   ['A1','Management information systems'],['A2','Uses and control of information'],['A3','Big data and data analytics'],
   ['B1','Activity-based costing'],['B2','Target costing'],['B3','Life-cycle costing'],['B4','Throughput accounting'],['B5','Accounting for environmental and sustainability factors'],
   ['C1','Relevant cost analysis'],['C2','Cost-volume-profit analysis (CVP)'],['C3','Limiting factors'],['C4','Pricing decisions'],['C5','Make-or-buy and other short-term decisions'],['C6','Dealing with risk and uncertainty in decision-making'],
   ['D1','Budgetary systems and types of budget'],['D2','Analytical techniques in budgeting and forecasting'],['D3','Standard costing'],['D4','Material mix and yield variances'],['D5','Sales mix and quantity variances'],['D6','Planning and operational variances'],['D7','Performance analysis'],
   ['E1','Performance analysis in private sector, public sector and not-for-profit organisations'],['E2','Divisional performance and transfer pricing'],['E3','Specific performance analysis issues in not-for-profit organisations and the public sector']
  ],
  MA2:[
   ['A1','Management information requirements'],['A2','Cost accounting systems'],['A3','Cost classification'],['A4','Information for comparison'],['A5','Reporting management information'],
   ['B1','Accounting for materials'],['B2','Accounting for labour'],['B3','Accounting for other expenses'],
   ['C1','Absorption costing'],['C2','Marginal costing'],['C3','Job and batch costing'],['C4','Process costing'],['C5','Service costing'],
   ['D1','Cost-volume-profit analysis'],['D2','Factors affecting short-term decision-making'],['D3','Investment appraisal'],
   ['E1','Nature of cash and cash flow'],['E2','Cash management'],['E3','Cash budgets'],['E4','Investing and financing']
  ],
  MA1:[
   ['A1','Nature of business organisation and accounting systems'],['A2','Nature and purpose of management information'],
   ['B1','Transaction processing systems'],['B2','Coding system'],
   ['C1','Cost classification and behaviour'],['C2','Cost units, cost centres, profit centres and investment centres'],
   ['D1','Accounting for materials'],['D2','Accounting for labour'],['D3','Accounting for other expenses'],['D4','Accounting for product costs'],
   ['E1','Spreadsheets overview'],['E2','Creating and using spreadsheets'],['E3','Presenting and printing spreadsheet data/information']
  ]
 };
 const sources={
  PM:'https://www.accaglobal.com/content/dam/acca/global/PDF-students/acca/f5/studyguides/pm_s26_j27_syllabus_and_study_guide.pdf',
  MA2:'https://www.accaglobal.com/uk/en/student/exam-support-resources/foundation-level-study-resources/ma2/ma2-syllabus-study-guide.html',
  MA1:'https://www.accaglobal.com/middle-east/en/student/exam-support-resources/foundation-level-study-resources/ma1/ma1-syllabus-study-guide.html'
 };
 function code(subject){const match=String(subject||'').match(/^([A-Z]+[0-9]*)(?:\s|·|$)/);return match?match[1]:'';}
 function list(subject){return (syllabus[code(subject)]||[]).map(row=>row[0]+' · '+row[1]);}
 function official(subject){return Object.prototype.hasOwnProperty.call(syllabus,code(subject));}
 function match(subject,value){
  const target=String(value||'').trim().toLowerCase();
  return list(subject).find(x=>x.toLowerCase()===target)||null;
 }
 root.LedgerSyllabus={code,list,official,match,source:function(subject){return sources[code(subject)]||'';}};
})(typeof window!=='undefined'?window:globalThis);
