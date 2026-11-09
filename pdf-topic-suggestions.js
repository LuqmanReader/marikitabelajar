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
  ["E2",[/\b(cash management|cash surplus|cash deficit|cash float|bank overdraft management|liquidity management|receivables collection period|payables payment period)\b/ig]],
  ["E4",[/\b(source of finance|financing decision|equity finance|debt finance|loan finance|bank loan|share capital finance|interest on borrowings|investment of surplus funds)\b/ig]],
  ["E1",[/\b(cash flow statement|operating cash flow|cash inflow|cash outflow|nature of cash|cash versus profit|cash operating cycle|operating cash cycle|working capital|current ratio)\b/ig]],
  ["A5",[/\b(management report|reporting management information|management accounts|presentation of management information|performance report|profit cent(?:re|er)|responsibility cent(?:re|er)|profitability performance|(?:component|percentage component|compound|simple) bar chart|type of graph)\b/ig]],
  ["A4",[/\b(comparison of costs|comparative information|high[\s-]?low method|scattergraph|regression analysis|index numbers|cost estimation)\b/ig]],
  ["A2",[/\b(cost accounting system|integrated accounts|interlocking accounts|cost ledger|cost accounts|sequential coding|hierarchical coding|coding system|optical character recognition|\bocr\b|computerised cost|automated information processing)\b/ig]],
  ["A1",[/\b(management information needs|information requirements|planning control information|strategic information|tactical information|operational information|management control system|definition of information|information is data|objective of management)\b/ig]],
  ["A3",[/\b(cost classification|direct (?:cost|expense|labou?r|material)|indirect (?:cost|expense)|fixed cost|variable cost|semi[\s-]?variable|mixed cost|step[\s-]?fixed|cost behaviour|cost center|cost centre|cost unit|product cost|period cost)\b/ig]],
  ["B3",[/\b(accounting for (?:other )?expenses|indirect expenses|rental expense|utility expenses|expenses allocation|depreciation charge|depreciation method|reducing balance depreciation|straight line depreciation|depreciation expense)\b/ig]]
 ];
 const fa2Rules=[
  ["A1",[/\b(?:going concern|business entity concept|separate entity concept|prudence concept|materiality concept|consistency concept|historical cost concept|accounting conventions)\b/ig]],
  ["B1",[/\b(?:accounting equation|assets\s*=\s*liabilities\s*\+\s*(?:capital|equity)|current (?:asset|liabilit)y|non-current liabilit(?:y|ies)|elements of (?:financial statements|the statement of financial position))\b/ig]],
  ["C1",[/\b(?:general journal(?: entry| entries)?|double[\s-]?entry journal|journalise|journalize|journal entry for the transaction)\b/ig]],
  ["C2",[/\b(?:t[\s-]?accounts?|ledger (?:balanc(?:e|ing)|postings?)|balancing a ledger account|posting (?:to|into) (?:the )?general ledger)\b/ig]],
  ["D1",[/\b(?:sales tax|value added tax|vat\b|sales (?:returns?|day book)|purchase (?:returns?|day book)|credit notes?|debit notes?|trade discount|goods received note)\b/ig]],
  ["D2",[/\b(?:imprest (?:system|petty cash)|petty cash|cash book (?:adjustment|entry|posting)|cash receipts? book|cash payments? book)\b/ig]],
  ["D3",[/\b(?:fifo\b|first[\s-]?in[\s-]?first[\s-]?out|weighted average (?:inventory|cost|method)|net reali[sz]able value|nrv\b|inventory (?:valuation|write[\s-]?down|count|stocktake)|closing inventory)\b/ig]],
  ["D4",[/\b(?:straight[\s-]?line depreciation|reducing[\s-]?balance depreciation|accumulated depreciation|depreciation (?:expense|charge|method|rate)|asset (?:disposal|register)|disposal (?:gain|loss|proceeds)|carrying amount of (?:equipment|machinery|plant|vehicle)|capital expenditure|revenue expenditure)\b/ig]],
  ["D5",[/\b(?:accruals?|accrued (?:expense|income|revenue)|prepayments?|prepaid (?:rent|expense|insurance)|deferred income|income received in advance|outstanding (?:rent|utilities|electricity|expenses?))\b/ig]],
  ["D6",[/\b(?:irrecoverable debts?|bad debts?|allowance for (?:receivables|doubtful debts)|provision for doubtful debts|receivables (?:control|ledger)|payables (?:control|ledger)|trade receivables?|trade payables?|warranty provision)\b/ig]],
  ["D7",[/\b(?:owner'?s? drawings|drawings account|capital introduced by (?:the )?owner|sole trader capital|finance costs?|interest on (?:bank )?loan|interest payable on borrowings)\b/ig]],
  ["E1",[/\b(?:bank reconciliation|bank reconcil(?:ing|iation)|unpresented cheques?|outstanding cheques?|uncredited (?:deposits?|lodgements?)|deposits? in transit|bank statement (?:reconciliation|balance))\b/ig]],
  ["E2",[/\b(?:supplier statement reconciliation|payables account reconciliation|reconcil(?:e|ing) (?:the |a )?supplier statement|supplier statement (?:balance|difference)|supplier account reconciliation)\b/ig]],
  ["F1",[/\b(?:trial balance|difference between debit and credit (?:balances|totals)|extraction of ledger balances)\b/ig]],
  ["F2",[/\b(?:suspense account|error of (?:principle|commission|omission)|compensating error|correction of (?:posting |accounting )?errors|rectif(?:y|ication) of errors|journal to correct an error)\b/ig]],
  ["G1",[/\b(?:statement of (?:profit or loss|financial position)|incomplete records|gross profit margin|cost of sales|net profit from incomplete records|preparation of financial statements)\b/ig]],
  ["H1",[/\b(?:partnership agreement|partners?['’]? (?:salaries|salary|interest on capital)|profit[\s-]?sharing agreement)\b/ig]],
  ["H2",[/\b(?:partners?['’]? current accounts?|partnership capital accounts?|partnership appropriation account|interest on partners?['’]? drawings)\b/ig]],
  ["H3",[/\b(?:admission of (?:a |new )?partner|retirement of (?:a )?partner|partnership statement of financial position|goodwill on (?:partner )?admission|change in profit[\s-]?sharing ratio)\b/ig]]
 ];
 function plain(value){return String(value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();}
 function pick(q,subject,storage){
  const syllabus=root.LedgerSyllabus&&root.LedgerSyllabus.resolve(storage,subject);
  if(!syllabus||!syllabus.verified||!Array.isArray(syllabus.topics)||!syllabus.topics.length)return null;
  const code=(root.LedgerSyllabus.code(subject)||"").toUpperCase();
  // Only the selected, published FIA paper may supply candidates. Unknown papers abstain.
  if(code!=="MA2"&&code!=="FA2")return null;
  const activeRules=code==="FA2"?fa2Rules:rules;
  const raw=String(q.qtext||"");
  const stem=plain(raw.includes("INFORMATION FOR THIS QUESTION:")?raw.slice(raw.lastIndexOf("\n\n")+2):raw);
  const information=plain(q.information||"");
  const found=[];
  for(const [tag,patterns] of activeRules){
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
  // Strong FA2 evidence may outrank a generic term within a multi-skill stem.
  // If two categories remain equally supported, abstain rather than guess.
  if(code==="FA2"){
   for(const [tag,pattern] of [
    ["E1",/\b(?:bank reconciliation|unpresented cheques?|uncredited (?:deposit|lodgement))\b/i],
    ["E2",/\b(?:supplier statement reconciliation|payables account reconciliation)\b/i],
    ["F2",/\b(?:suspense account|error of principle|compensating error)\b/i]
   ]){
    const match=found.find(x=>x.code===tag);
    if(match&&pattern.test(stem))match.score+=4;
   }
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

 // One-time migration of previously imported MA2 mock debriefs which used
 // "outside" for related cash/liquidity methods or "unreadable" for graph
 // questions whose topic is known although their image pixels were lost.
 // Leave every source answer, mark, and grading decision untouched.
 function repairLegacyRelated(questions,subject,storage){
  const code=root.LedgerSyllabus&&root.LedgerSyllabus.code(subject);
  if(code!=='MA2')return 0;
  const syllabus=root.LedgerSyllabus.resolve(storage,subject);
  function topic(prefix){return (syllabus.topics||[]).find(x=>x.startsWith(prefix+' · '))||'';}
  let repaired=0;
  for(const q of questions){
   if(q.chapter||!['outside','unreadable'].includes(q.topic_status))continue;
   const question=plain(q.qtext),isGraph=/\b(?:what type of graph|type of (?:bar )?chart)\b/i.test(question);
   const isCash=/\b(?:operating cash cycle|cash operating cycle|working capital cycle)\b/i.test(question)
     ||(/\bcurrent ratio\b/i.test(question)&&/\bworking capital\b/i.test(question));
   const target=isGraph?topic('A5'):isCash?topic('E1'):'';
   if(!target)continue;
   q.chapter=target;
   q.topic_status=isGraph?'matched':'related';
   q.topic_reason=isGraph
    ?'The question asks to interpret the presentation of management information, the scope of A5. The original chart still needs its source image attached to independently verify the answer.'
    :'The question applies a cash-flow/liquidity or working-capital technique related to E1. Its numerical formula is not an expressly specified MA2 2026–27 learning outcome, so it is labelled a related extension rather than a directly assessed outcome.';
   q.topic_origin='legacy-syllabus-repair';
   repaired++;
  }
  return repaired;
 }
 root.LedgerTopicSuggest={pick,apply,repairLegacyRelated};
})(window);
