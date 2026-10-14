/* Provisional, rules-based ACCA topic suggestions. Works without an AI key.
   Only high-confidence matches use exact labels from the selected paper's
   approved ACCA syllabus. The full ChatGPT debrief remains authoritative. */
(function(root){
 "use strict";
 const rules=[
  ["B2",[/\b(overtime|idle[\s-]?time|labou?r (?:cost|overhead|rate|hour|efficiency|turnover)|wages?|remuneration|employee pay|payroll|piecework|time rate|bonus scheme)\b/ig]],
  ["B1",[/\b(economic order quantity|eoq|reorder (?:level|quantity)|inventory (?:control|holding|reorder)|stock levels?|material (?:usage|price|purchase|requisition)|first in first out|fifo|lifo|weighted average|stores? ledger|raw materials? (?:stock|purchase))\b/ig]],
  ["C4",[/\b(process (?:cost|account|loss|output)|equivalent units?|abnormal (?:loss|gain)|normal loss|joint products?|by-products?|split[\s-]?off point)\b/ig]],
  ["C3",[/\b(job(?:bing)? (?:cost|number|sheet|order)|batch (?:cost|quantity|size)|prime cost of (?:a |the )?job|cost of (?:a |the )?job)\b/ig]],
  ["C5",[/\b(service costing|cost per patient|cost per passenger|passenger[\s-]?kilometre|tonne[\s-]?kilometre|hotel room cost|cost per meal)\b/ig]],
  ["D3",[/\b(net present value|npv|internal rate of return|irr|payback period|discounted cash flow|investment appraisal|discount factor|accounting rate of return)\b/ig]],
  ["D1",[/\b(break[\s-]?even|contribution (?:per unit|to sales|sales ratio|margin)|c\/s ratio|margin of safety|cost[\s-]?volume[\s-]?profit|target (?:profit|sales volume)|sales units required|profit[\s-]?volume)\b/ig]],
  ["D2",[/\b(relevant cost|sunk cost|opportunity cost|limiting factor|scarce resource|make[\s-]?or[\s-]?buy|accept (?:the |a )?special order|shut[\s-]?down decision|avoidable cost|incremental cost|contribution per limiting)\b/ig]],
  ["C1",[/\b(absorption cost(?:ing)?|absorbed overhead|over[\s-]?absorbed|under[\s-]?absorbed|overhead absorption|absorption rate|oar\b|production overhead (?:absorption|rate|recovery)|full (?:production |unit )?cost)\b/ig]],
  ["C2",[/\b(marginal cost(?:ing)?|contribution under marginal|profit under marginal|inventory under marginal|marginal valuation|variable cost(?:ing)? method)\b/ig]],
  ["E3",[/\b(cash budget|budgeted cash|cash receipts? budget|cash payments? budget|closing cash balance|opening cash balance)\b/ig]],
  ["E2",[/\b(cash management|cash surplus|cash deficit|cash float|bank overdraft management|liquidity management|receivables collection period|payables payment period|working capital cycle)\b/ig]],
  ["E4",[/\b(source of finance|financing decision|equity finance|debt finance|loan finance|bank loan|share capital finance|interest on borrowings|investment of surplus funds)\b/ig]],
  ["E1",[/\b(cash flow statement|operating cash flow|cash inflow|cash outflow|nature of cash|cash versus profit)\b/ig]],
  ["A5",[/\b(management report|reporting management information|management accounts|presentation of management information|performance report)\b/ig]],
  ["A4",[/\b(comparison of costs|comparative information|high[\s-]?low method|scattergraph|regression analysis|index numbers|cost estimation)\b/ig]],
  ["A2",[/\b(cost accounting system|integrated accounts|interlocking accounts|cost ledger|cost accounts)\b/ig]],
  ["A1",[/\b(management information needs|information requirements|planning control information|strategic information|tactical information|operational information)\b/ig]],
  ["A3",[/\b(cost classification|direct (?:cost|expense|labou?r|material)|indirect (?:cost|expense)|fixed cost|variable cost|semi[\s-]?variable|mixed cost|step[\s-]?fixed|cost behaviour|cost center|cost centre|cost unit|product cost|period cost)\b/ig]],
  ["B3",[/\b(accounting for (?:other )?expenses|indirect expenses|rental expense|utility expenses|expenses allocation)\b/ig]]
 ];
 function plain(value){return String(value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();}
 function pick(q,subject,storage){
  const syllabus=root.LedgerSyllabus&&root.LedgerSyllabus.resolve(storage,subject);
  if(!syllabus||!syllabus.verified||!Array.isArray(syllabus.topics)||!syllabus.topics.length)return null;
  const code=(root.LedgerSyllabus.code(subject)||"").toUpperCase();
  if(code!=="MA2")return null;
  const raw=String(q.qtext||"");
  const stem=plain(raw.includes("INFORMATION FOR THIS QUESTION:")?raw.slice(raw.lastIndexOf("\n\n")+2):raw);
  const information=plain(q.information||"");
  const found=[];
  for(const [tag,patterns] of rules){
   let score=0,evidence=[];
   for(const pat of patterns){
    pat.lastIndex=0;const inStem=[...stem.matchAll(pat)];
    if(inStem.length){score+=Math.min(10,6+inStem.length);evidence.push(inStem[0][0]);}
    else if(information&&pat.test(information)){score+=2;evidence.push("shared information");}
    pat.lastIndex=0;
   }
   const label=syllabus.topics.find(x=>new RegExp("^"+tag+"\\s*·\\s*","i").test(x));
   if(label&&score>=6)found.push({code:tag,chapter:label,score,evidence});
  }
  found.sort((a,b)=>b.score-a.score);
  if(!found.length)return null;
  // Questions explicitly asking for profit under ONE method win over a
  // paragraph comparing marginal and absorption systems.
  const lower=stem.toLowerCase();
  for(const [key,expression] of [["C1",/(?:profit|stock valuation|inventory valuation|overheads?).{0,55}absorption|absorption.{0,45}(?:profit|cost|stock|inventory)/],["C2",/(?:profit|stock valuation|inventory valuation).{0,55}marginal|marginal.{0,45}(?:profit|cost|stock|inventory)/]]){
   if(expression.test(lower)){const f=found.find(x=>x.code===key);if(f)f.score+=5;}
  }
  found.sort((a,b)=>b.score-a.score);
  if(found.length>1&&found[0].score-found[1].score<2)return null;
  return {chapter:found[0].chapter,topic_origin:"rule-suggestion",topic_evidence:found[0].evidence.join(", "),topic_status:"matched",topic_reason:"Provisional rule-based syllabus suggestion. Confirm in the ChatGPT debrief."};
 }
 function apply(questions,subject,storage){
  let assigned=0;
  for(const q of questions){
   if(q.chapter||q.topic_status==="outside"||q.topic_status==="unreadable")continue;
   const suggestion=pick(q,subject,storage);
   if(!suggestion)continue;
   Object.assign(q,suggestion);assigned++;
  }
  return assigned;
 }
 root.LedgerTopicSuggest={pick,apply};
})(window);
