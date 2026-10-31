/* LedgerPeer: structured teaching expansion for all un-authored topics.
 * Uses unique topic-specific source concepts, actual source examples and
 * discipline-dependent methods. Deliberately NOT called independently authored
 * textbooks or validated complete ACCA 2026-27 detailed learning outcomes.
 * Original, copyright-safe student-support material.
 */
(function(root){'use strict';
const notes=root.LedgerFiaNotes||{};
const syllabus=root.LedgerNotesSyllabi?.papers||{};
const existing=Object.assign({},
 root.LedgerEditorialAdvancedChapters||{},root.LedgerEditorialFiaAppliedChapters||{},root.LedgerEditorialManagement01||{},root.LedgerEditorialManagement02||{},root.LedgerEditorialManagement03||{},root.LedgerEditorialManagement04||{},root.LedgerEditorialManagement05||{},root.LedgerEditorialManagement03||{},root.LedgerEditorialManagement04||{},root.LedgerEditorialManagement05||{},
 root.LedgerSupplementalTextbooks||{},
 root.LedgerSupplementalTextbooksA2||{},
 root.LedgerSupplementalTextbooksProfessional||{},
 root.LedgerSupplementalTextbooksA3Foundation||{},
 root.LedgerSupplementalTextbooksA3Professional||{},
 root.LedgerSupplementalTextbooksBatch4A||{},
 root.LedgerSupplementalTextbooksBatch4B||{},
 root.LedgerSupplementalTextbooksBatch4C||{},
 root.LedgerSupplementalTextbooksBatch4D||{},
 root.LedgerTextbookFA1A||{},root.LedgerTextbookFA1B||{},
 root.LedgerTextbookMA1||{},root.LedgerTextbookMA2A||{},
 root.LedgerTextbookMA2B||{},root.LedgerTextbookFA2A||{},
 root.LedgerTextbookFA2B||{},root.LedgerTextbookFA2C||{}
);
const discipline={
 law:{
  principle:'Identify the legal relationship, the parties and the source of the obligation. A rule applies only when its elements and jurisdictional conditions are established. The terminology alone does not resolve whether the claimant has a right or remedy.',
  method:'Use issue–rule–application–conclusion. State the rule precisely, relate every element to the scenario evidence, consider exceptions, then give a conditional conclusion if material facts remain unknown. Distinguish a binding legal requirement from good commercial practice.',
  evidence:'Check who did what, when the communication or transaction occurred, which documents are enforceable, and what jurisdiction governs. Analyse remedy separately from breach or wrongdoing. A claim may fail even where the claimant experienced a loss.',
  exam:'Applied-law questions reward disciplined analysis, not merely naming an Act or legal term. A plausible alternative answer may overlook intention, consideration, causation, capacity, formality or a statutory exception. Support the conclusion with the specific facts.'
 },
 tax:{
  principle:'Tax liability depends on the taxpayer, chargeable event, applicable period, statutory category and relevant relief or exemption. Accounting treatment and tax treatment can differ. Only the legislation and exam tables specified for the relevant sitting determine current thresholds and percentages.',
  method:'Classify the income, gain, expenditure or supply before applying a percentage. Prepare a labelled tax-base reconciliation; apply deductions and reliefs only where conditions are met. Keep tax base, tax charged, payments already made and final settlement in separate stages.',
  evidence:'Build a chronology including parties, income source, transaction dates, residence or place of supply, and the paperwork supporting the claim. A planning strategy may create tax for more than one person or under more than one tax head.',
  exam:'Do not import a memorised rate from a previous Finance Act. An apparent tax saving must be tested for legality, other tax costs, cash timing and reporting. A correct arithmetic result based on an incorrect classification is still wrong.'
 },
 audit:{
  principle:'An audit or assurance conclusion must be supported by sufficient appropriate evidence directed at a clearly identified risk and assertion. Management maintains records and controls; auditors evaluate evidence, remain professionally sceptical and report within the relevant engagement framework.',
  method:'Work from scenario fact to risk, affected assertion, suitable evidence and possible consequence. Specify procedure direction: inspect source records, trace to ledgers, confirm independently, observe, recalculate or reperform as appropriate. State the purpose of the evidence requested.',
  evidence:'Compare internal records with independent evidence, investigate contradictory dates and amounts, and consider the reliability of documents or explanations. Control design is not proof that the control operated; test performance and document exceptions.',
  exam:'Avoid “check the invoices” or “discuss with management” without saying which assertion and what evidence are sought. Suspicion is not proof of fraud. Reporting implications depend on materiality, pervasiveness and whether there is a misstatement or evidence limitation.'
 },
 financial:{
  principle:'Financial reporting seeks to depict the economic substance of rights, obligations, income and expenses under the applicable framework. Before entering numbers, determine what element exists, the recognition trigger, measurement basis and reporting period.',
  method:'List the transaction facts, applicable recognition and measurement requirement, initial entry, later adjustment and statement impact. Keep cash movement distinct from accrual recognition. Reconcile opening balances, period movements and closing balances.',
  evidence:'Check the source of the recognition or measurement assumption, reconcile the relevant opening and closing amounts, and test the sensitivity of any material estimate. For complex standards, distinguish what the entity is obliged to provide from what it has actually recognised and disclosed.',
  exam:'A trial balance can agree despite an incorrect classification or omitted transaction. Watch for profit versus cash, asset versus expense, and allowance versus write-off. Explain the journal and effect on financial statements rather than writing a bare figure.'
 },
 management:{
  principle:'Management accounting measures resources and outcomes for an internal decision. A useful cost is defined by its cost object, behaviour, traceability, time horizon and avoidability. A reported total can obscure the incremental effect of an action.',
  method:'State the objective and units, classify relevant and irrelevant costs, write the governing equation, substitute the case data and reconcile the result. Compare against the right activity level; where appropriate flex the budget before interpreting a variance.',
  evidence:'Inspect actual resource usage, labour and material records, allocation bases, bottlenecks and any non-financial outcome. Check that cost drivers match underlying activity. Investigate significant results and explain what decision follows.',
  exam:'Do not confuse mark-up with margin, variable total with variable unit cost or total allocation with avoidable cash. Favourable figures may reflect poorer quality, reduced activity or unsafe incentives. Show units and the business meaning of the answer.'
 },
 finance:{
  principle:'Financial management weighs the amount, timing, risk and flexibility of future cash flows. A return attractive in accounting profit may require too much liquidity or expose the business to refinancing and currency risk.',
  method:'Identify whose cash flows are relevant, use incremental after-tax inputs where required, match currency and inflation assumptions to the discount rate, then assess value, funding needs and uncertainty. Compare alternatives on a consistent basis.',
  evidence:'Test forecast demand, working capital, investment commitments, payment terms, borrowing covenants and scenario assumptions. Explain whether a cash flow is generated by the project, transferred within the group or paid to an outside party.',
  exam:'Separate NPV from simple payback and accounting profit. A positive model result is conditional on assumptions; do not double count financing, taxation or risk. A recommendation includes implementation constraints and a credible downside response.'
 },
 business:{
  principle:'Business decisions operate within an environment of stakeholders, resources, organisational culture and external change. A named management model helps structure an analysis but cannot replace applying it to the organisation described.',
  method:'Define the strategic objective, identify evidence of the problem and apply a relevant framework only where it clarifies options. Compare costs, people, governance, implementation risks and consequences for performance.',
  evidence:'Identify who is affected, who holds responsibility, what controls operate and which figures would demonstrate success. Use credible internal and external information. Distinguish an observed outcome from a claimed causal explanation.',
  exam:'Avoid long generic lists of advantages. For each recommendation, name the specific case fact, why it matters, the action owner and how its success is evaluated. Stakeholder power never removes a legal or ethical obligation.'
 }
};
const paperType={
 FA1:'financial',FA2:'financial',FA:'financial',FFA:'financial',FR:'financial',SBR:'financial',
 MA1:'management',MA2:'management',MA:'management',FMA:'management',PM:'management',APM:'management',
 BT:'business',FBT:'business',SBL:'business',LW:'law',
 FTX:'tax',TX:'tax',ATX:'tax',
 FAU:'audit',AA:'audit',AAA:'audit',
 FFM:'finance',FM:'finance',AFM:'finance'
};
const segmentRules=[
 [/(?:revenue|contract with customer|sales|receivable|debt|customer)/i,'Follow the transaction from the original customer agreement or supporting document through recognition, recording and subsequent recovery or settlement. The timing of an invoice and the timing of the underlying economic event may differ.'],
 [/(?:inventory|materials|stock|production|overhead|activity)/i,'Follow quantities and costs from the physical event to the recorded cost object. Distinguish the measurement of units from the valuation or allocation of costs, and reconcile what was consumed with what remains.'],
 [/(?:variance|budget|forecast|standard|performance)/i,'Compare results against a valid and consistently defined baseline. Separate changes in volume from price, efficiency and uncontrollable factors. Investigate causes before recommending corrective action.'],
 [/(?:depreciation|asset|plant|equipment|impairment|intangible|lease)/i,'Explain the initial qualifying expenditure, the subsequent measurement or allocation and the event that triggers a change in carrying amount. Distinguish cash paid from the expense recognised in a particular reporting period.'],
 [/(?:profit|financial statement|consolidat|reporting|equity|liabilit)/i,'Trace the transaction through profit or loss and statement of financial position, stating whether any effect is simply reclassification. Check intra-group eliminations and relevant disclosures if the entity is a group.'],
 [/(?:cash|liquid|working capital|receivable days|payable days)/i,'Use a cash-flow timeline to show when the organisation must pay and when it can collect or refinance. Assess the financing required between events and the impact of operational delays.'],
 [/(?:ethic|fraud|governance|independen|profession|conduct)/i,'Separate technical compliance, ethical responsibility and reputational consequences. Identify incentives and authority, document evidence and choose a proportionate escalation or control response.'],
 [/(?:capital|investment|discount|interest|exchange|hedg|risk)/i,'Keep initial cost, future cash flows, rates, timing and uncertainty consistent. Compare numerical value with liquidity or exposure under a credible adverse scenario.'],
 [/(?:employment|staff|human|motivat|leadership|organisation|culture)/i,'Analyse individual incentives and organisational systems together. Check whether targets, delegation and communication encourage the desired behaviour and whether consequences are being measured fairly.'],
 [/(?:audit|assurance|evidence|control|sample|test)/i,'State the specific risk and assertion, the evidence source and the action if results contradict management. A control that exists on paper must still be tested for actual operation.'],
 [/(?:tax|relief|allowance|VAT|NIC|income|gains|inheritance)/i,'Classify the chargeable transaction and taxpayer before computing a rate. Keep the tax-year-specific legal condition visible at each stage and separate the liability from payments or credits.']
];
function role(paper){
 if(['SBL','SBR','AFM','APM','ATX','AAA'].includes(paper))
  return 'At Strategic Professional level, give a concise recommendation supported by case-specific evidence, address a credible alternative and discuss material uncertainties.';
 if(['LW','PM','TX','FR','AA','FM'].includes(paper))
  return 'At Applied Skills level, explain the technical treatment, calculate or assess the case precisely and state the practical consequence rather than stopping at the rule.';
 return 'For the foundation or Applied Knowledge exam, identify the governing rule, show the correct sequence and check the result against the facts provided.';
}
function clean(x){return String(x||'').trim().replace(/\s+/g,' ')}
function join(...parts){return parts.filter(Boolean).map(clean).filter(Boolean).join('\n\n')}
const chapters={},audit={existing:Object.keys(existing).length,newKeys:[],missingCore:[],weak:[]};
for(const [paper,entry] of Object.entries(syllabus)){
 const profile=discipline[paperType[paper]||'business'];
 for(const heading of entry.topics||[]){
  const m=/^([A-Z]\d+)\s*·\s*(.+)$/.exec(heading);if(!m)continue;
  const key=paper+':'+m[1],title=m[2];
  if(existing[key])continue;
  const n=notes[key];if(!n){audit.missingCore.push(key);continue}
  const steps=(n.steps||[]).map(clean).filter(Boolean);
  const nuanced=segmentRules.filter(([rx])=>rx.test(title)).map(([,s])=>s);
  const topicLens=nuanced.length?nuanced.slice(0,2).join(' '):'Relate the stated concept to an identifiable transaction or management decision. A label is not evidence that the underlying treatment is correct.';
  const method=steps.length?steps.map((s,i)=>(i+1)+'. '+s).join('\n'):'Identify the transaction or issue, apply the governing rule, and check the resulting conclusion.';
  const sections=[
   ['What '+title+' means and why it matters',join(n.summary,profile.principle,topicLens)],
   ['Step-by-step method and governing conditions',join(method,n.formula?'Key relationship / legal test: '+n.formula:'',profile.method)],
   ['Worked application: interpreting the facts',join('Original case illustration: '+(n.example||n.summary),'Apply the method to the actual facts: '+(steps[0]||n.summary),n.formula?'Apply this particular relationship or legal test, and retain its stated assumptions: '+n.formula:'',profile.evidence)],
   ['Exam judgement, exceptions and common errors',join('Critical error to avoid: '+(n.trap||'Do not assume the conclusion without checking the evidence.'),profile.exam,role(paper),'Self-check conclusion: '+(n.answer||n.summary))]
  ];
  const question='Integrated case — '+title+': '+clean(n.example||n.summary)+' Required: '+clean(n.check||'Identify the applicable principle and calculate or evaluate the result.')+' Show the governing rule, all essential working or facts and explain why this common approach would be wrong: '+clean(n.trap||'Concluding without verifying the underlying assumptions.');
  const solution=join(n.answer||n.summary,'Reasoning and verification: '+method,n.trap?'Before finalising, avoid this error: '+n.trap:'',role(paper));
  const secondQuestion='A student is given this illustration of '+title+': '+clean(n.example||n.summary)+' A different student ignores this caution: '+clean(n.trap||'Check the underlying conditions.')+' Identify the reasoning error, then explain the correct sequence and final check.';
  const secondAnswer=join('The starting point is '+clean(n.summary), 'Use the relevant worked illustration as a check: '+clean(n.example||n.summary),'Correct the reasoning in sequence: '+method,n.formula?'Use the stated rule where its assumptions are met: '+clean(n.formula):'','The misleading approach is: '+clean(n.trap||'Using an unsupported assumption to force the result.'),profile.evidence);
  if(sections.some(s=>s[1].length<320)||solution.length<150||secondAnswer.length<150)audit.weak.push(key);
  chapters[key]={title,sourceKind:'structured-expansion',reviewStatus:'REQUIRES ORIGINAL DETAILED-OUTCOME REVIEW',sections,workings:[
   ['Topic-specific knowledge and calculation check',question,solution],
   ['Challenge: evaluate a changed assumption',secondQuestion,secondAnswer]
  ]};
  audit.newKeys.push(key);
 }
}
root.LedgerStructuredLessonChapters=chapters;
root.LedgerStructuredLessonAudit=audit;
})(typeof window!=='undefined'?window:globalThis);
