/* Built-in broad topic suggestions are taken from LedgerPeer's existing FIA topics catalog.
   If you have precise TymbaFlex/textbook chapters, save those in the debrief's Topic Catalog:
   your custom labels always win. These are descriptive categories, NOT verified textbook chapter titles. */
(function(root){
 'use strict';
 var topics=
{
  "FA1": [
    "Types of business transactions and documentation",
    "Duality of transactions and the double entry system",
    "Banking system and transactions",
    "Payroll",
    "Ledger accounts",
    "Cash and bank (incl. petty cash and bank reconciliations)",
    "Sales and credit transactions",
    "Purchases and credit transactions",
    "Control account reconciliations and correcting errors",
    "Preparing the trial balance"
  ],
  "MA1": [
    "Nature and purpose of cost and management accounting",
    "Source documents and coding data in a costing system",
    "Classifying costs by nature, behaviour and purpose",
    "Recording costs for material, labour and expenses",
    "Overheads: allocation, apportionment and absorption",
    "Providing information on actual and expected costs",
    "Responsibility accounting (cost, profit and investment centres)",
    "Using spreadsheets (Microsoft Excel) for costing"
  ],
  "FA2": [
    "Underlying principles, concepts and regulations of accounting",
    "Non-current assets and depreciation",
    "Ledger accounting and double entry",
    "Preparing basic financial statements for sole traders",
    "Preparing basic financial statements for partnerships and simple consolidations",
    "Interpretation of financial statements (introductory ratios)"
  ],
  "MA2": [
    "Costing techniques: absorption, marginal and activity-based costing",
    "Job, batch and process costing",
    "Budgeting and standard costing",
    "Variance analysis",
    "Short-term decision making techniques",
    "Cash management and sources of finance"
  ],
  "FBT": [
    "Business organisation structure and governance",
    "The role of accounting and finance functions",
    "Business ethics and professionalism",
    "Technology and its impact on accounting",
    "Managing people and personal effectiveness"
  ],
  "FMA": [
    "Cost classification, budgeting and standard costing",
    "Performance measurement and short-term decision making"
  ],
  "FFA": [
    "Preparing financial statements for single entities and simple groups",
    "Regulatory and conceptual framework"
  ],
  "FAU": [
    "Concepts of audit and assurance",
    "Internal control systems",
    "Gathering evidence and audit procedures",
    "Review and reporting"
  ],
  "FFM": [
    "Investment appraisal techniques",
    "Sources of business finance",
    "Working capital management",
    "Risk and business finance decisions"
  ],
  "FTX": [
    "Principles of taxation systems",
    "Income tax and corporate tax computations",
    "Tax administration and compliance"
  ]
};
 function names(subject){
  var match=String(subject||'').match(/^([A-Z]+[0-9]*)(?:\b|\s|·)/);
  var code=match?match[1]:'';
  return (topics[code]||[]).slice();
 }
 function canonical(label,subject,catalog){
  var value=String(label||'').trim().replace(/\s+/g,' ');
  var allowed=Array.isArray(catalog)?catalog:names(subject);
  return allowed.find(function(t){return t.toLowerCase()===value.toLowerCase();})||value;
 }
 root.LedgerTopicTaxonomy={names:names,canonical:canonical};
})(typeof window!=='undefined'?window:globalThis);
