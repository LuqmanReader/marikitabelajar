/* Syllabus topic headings transcribed from ACCA published study guides.
   PM 2026/27 verified against published syllabus; MA1/MA2 labels must be reviewed for each new exam year.
   Always use the selected paper; never infer it from an uploaded PDF. */
(function(root){
 'use strict';
 const syllabus={
  PM:[
   ['A1','Management information systems'],['A2','Uses and control of information'],['A3','Big data and data analytics'],
   ['B1','Activity-based costing'],['B2','Target costing'],['B3','Life-cycle costing'],['B4','Throughput accounting'],['B5','Accounting for environmental and sustainability factors'],
   ['C1','Relevant cost analysis'],['C2','Cost-volume-profit-analysis (CVP)'],['C3','Limiting factors'],['C4','Pricing decisions'],['C5','Make-or-buy and other short-term decisions'],['C6','Dealing with risk and uncertainty in decision-making'],
   ['D1','Budgetary systems and types of budget'],['D2','Analytical techniques in budgeting and forecasting'],['D3','Standard costing'],['D4','Material mix and yield variances'],['D5','Sales mix and quantity variances'],['D6','Planning and operational variances'],['D7','Performance analysis'],
   ['E1','Performance analysis in private sector, public sector and not-for-profit organisations'],['E2','Divisional performance and transfer pricing'],['E3','Specific performance analysis issues in not-for-profit organisations and the public sector'],
   ['F1','Use computer technology to efficiently access and manipulate relevant information.'],['F2','Work on relevant response options, using available functions and technology, as would be required in the workplace.'],['F3','Navigate windows and computer screens to create and amend responses to exam requirements, using the appropriate tools.'],['F4','Present data and information effectively, using the appropriate tools.']
  ],
  MA2:[
   ['A1','Management information requirements'],['A2','Cost accounting systems'],['A3','Cost classification'],['A4','Information for comparison'],['A5','Reporting management information'],
   ['B1','Accounting for materials'],['B2','Accounting for labour'],['B3','Accounting for other expenses'],
   ['C1','Absorption costing'],['C2','Marginal costing'],['C3','Job and batch costing'],['C4','Process costing'],['C5','Service costing'],
   ['D1','Cost-volume-profit analysis'],['D2','Factors affecting short-term decision-making'],['D3','Investment appraisal'],
   ['E1','Nature of cash and cash flow'],['E2','Cash management'],['E3','Cash budgets'],['E4','Investing and financing']
  ],
  MA1:[
   ['A1','Nature of business organisation and the accounting systems'],['A2','Nature and purpose of management information'],
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
 function published(subject){
  const data=root.LedgerPublishedSyllabi&&root.LedgerPublishedSyllabi.papers;
  const row=data&&data[code(subject)];
  return row&&Array.isArray(row.topics)&&row.topics.length>=8&&/^https:\/\/www\.accaglobal\.com\/.*\.pdf/i.test(row.source)?row:null;
 }
 function list(subject){const source=published(subject);return source?source.topics.slice():(syllabus[code(subject)]||[]).map(row=>row[0]+' · '+row[1]);}
 function official(subject){return !!published(subject)||Object.prototype.hasOwnProperty.call(syllabus,code(subject));}
 function match(subject,value){
  const target=String(value||'').trim().toLowerCase();
  return list(subject).find(x=>x.toLowerCase()===target)||null;
 }

 const STORAGE_KEY='ledgerpeer_verified_syllabi_v2';
 function validateEntries(lines){
  if(!Array.isArray(lines))throw Error('Syllabus topics must be a list.');
  const found=[],seenCodes=new Set(),seenNames=new Set();
  for(const raw of lines){
   const line=String(raw||'').replace(/\s+/g,' ').trim();
   if(!line)continue;
   const m=line.match(/^([A-Z]\d{1,2})\s*(?:[·:\-–.]\s*|\s+)(.{3,})$/);
   if(!m)throw Error('Use official syllabus codes, one per line, such as A1 · Exact topic heading. Invalid: '+line.slice(0,65));
   const normalized=m[1]+' · '+m[2].trim();
   if(normalized.length>420)throw Error('Each syllabus heading must be 420 characters or less.');
   if(seenCodes.has(m[1])||seenNames.has(normalized.toLowerCase()))throw Error('Duplicate syllabus topic or code: '+m[1]);
   seenCodes.add(m[1]);seenNames.add(normalized.toLowerCase());found.push(normalized);
  }
  if(found.length<2)throw Error('Enter at least two different official syllabus subtopics.');
  return found;
 }
 function readAll(storage){
  try{
   const out=JSON.parse(storage.getItem(STORAGE_KEY)||'{}');
   return out&&!Array.isArray(out)&&typeof out==='object'?out:{};
  }catch(e){return {};}
 }
 function resolve(storage,subject){
  const key=code(subject);
  const online=published(key);
  if(online)return {status:'ACCA-published',subject:key,topics:online.topics.slice(),source:online.source,version:online.edition||'Official ACCA syllabus',variant:online.variant||'GLO',verified:true};
  if(official(key))return {status:'built-in',subject:key,topics:list(key),source:sources[key]||'',version:'ACCA syllabus catalog (check applicable exam-year)',verified:true};
  const saved=readAll(storage)[key];
  if(saved&&Array.isArray(saved.topics)&&saved.source){
   try{
    const normalized=validateEntries(saved.topics);
    const source=String(saved.source||'').trim();
    if(/^https:\/\/(?:[a-z0-9-]+\.)*accaglobal\.com(?:[/:?#]|$)/i.test(source))
     return {status:'student-verified',subject:key,topics:normalized,source:source,version:saved.version||'Student-confirmed ACCA syllabus',verified:true};
   }catch(e){}
  }
  return {status:'missing',subject:key,topics:[],source:'',version:'',verified:false};
 }
 function saveVerified(storage,subject,rawLines,source,version){
  const key=code(subject);
  if(!root.SubjectCatalog||!root.SubjectCatalog.papers.some(p=>p.code===key))throw Error('Select a supported FIA/ACCA paper.');
  if(official(key))throw Error('This paper already has a built-in syllabus catalog.');
  const link=String(source||'').trim();
  if(!/^https:\/\/(?:[a-z0-9-]+\.)*accaglobal\.com(?:[/:?#]|$)/i.test(link))throw Error('Provide an official ACCA syllabus source URL (accaglobal.com).');
  const topics=validateEntries(rawLines);
  const all=readAll(storage);
  all[key]={topics,source:link,version:String(version||'').trim().slice(0,120),confirmedAt:new Date().toISOString()};
  storage.setItem(STORAGE_KEY,JSON.stringify(all));
  return resolve(storage,subject);
 }
 root.LedgerSyllabus={code,list,official,match,source:function(subject){const x=published(subject);return x?x.source:sources[code(subject)]||'';},resolve,saveVerified,validateEntries};

})(typeof window!=='undefined'?window:globalThis);
