/* Original LedgerPeer textbook chapters: FA2 principles, records, journals and trading. */
(function(root){'use strict';root.LedgerTextbookFA2A={
  "FA2:A1": {
    "title": "Accounting principles, concepts and characteristics",
    "sections": [
      [
        "Purpose and users",
        "Financial accounting records transactions and produces statements about financial position, performance and cash flows. Owners and lenders assess stewardship, returns and ability to repay; employees, regulators and suppliers may have additional information needs. Recording a transaction differs from recognising an item in a financial statement: recognition follows the applicable concepts and standards, not simply cash movement."
      ],
      [
        "Accrual accounting and matching",
        "Under accruals, recognise income when earned and expenses when incurred, subject to standards, even if cash moves in another period. The matching idea helps explain why an expense supporting current-period income belongs in that period; it does not justify inventing an asset without meeting recognition criteria. A payment for future insurance can be a prepayment asset; a bill for current-period electricity remains an expense even if unpaid."
      ],
      [
        "Going concern, consistency and materiality",
        "Going concern assumes the entity will continue operating for the foreseeable future when the assessment supports it. Consistency supports comparable accounting policies across periods but does not prevent justified change. Material information is information whose omission, misstatement or obscuring could reasonably influence users' decisions; materiality depends on size and nature, not one universal percentage."
      ],
      [
        "Fundamental and enhancing qualities",
        "Relevant information has predictive or confirmatory value; faithful representation aims at completeness, neutrality and freedom from error. Comparability, verifiability, timeliness and understandability enhance usefulness. Prudence supports caution under uncertainty without deliberate understatement. Substance rather than legal label should guide analysis where the applicable framework requires it."
      ],
      [
        "Accounting equation and duality",
        "Assets = liabilities + equity. Each correctly recorded transaction has balanced debit and credit effects. Profit increases equity, drawings/distributions reduce it, and a loan raises both cash and liability. Balanced books are not proof of accurate accounting: omitting an entire transaction or debiting the wrong expense can still produce a balanced trial balance."
      ]
    ],
    "workings": [
      [
        "Accrual versus cash",
        "An entity receives $6,000 on 1 December for a 3-month service from December through February and has a 31 December year-end.",
        "If service is performed evenly, December revenue =$2,000; year-end contract/deferred income liability $4,000. On initial receipt Dr bank $6,000 / Cr deferred income $6,000; at December end Dr deferred income $2,000 / Cr revenue $2,000."
      ],
      [
        "Equation effects",
        "Owner contributes $25,000 cash, buys equipment $10,000 cash, then takes $2,000 drawings.",
        "After contribution: assets +25,000 and equity +25,000. Equipment purchase exchanges $10,000 cash for $10,000 equipment, so total assets unchanged. Drawings reduce bank and equity by $2,000; closing total assets/equity $23,000 absent other items."
      ]
    ]
  },
  "FA2:A2": {"title":"Maintaining financial records and accounting systems","sections":[["Why records are maintained","A complete and timely accounting system supports management decisions, financial statements, tax records, audit trails, safeguarding assets and relationships with customers/suppliers. Primary transaction records such as invoices, credit notes, receipts, payslips and bank statements provide evidence. A transaction should have a unique reference, correct date, authorisation and traceable entry."],["Source documents to the ledger","For credit sales, sales invoice details enter the sales day book or equivalent transaction module, update customer individual accounts and are posted to control and nominal ledger balances. Credit purchases similarly use the purchases day book and supplier accounts. A cash transaction can enter the bank/cash book directly. Electronic systems may make simultaneous postings, but the accounting logic remains the same."],["Double entry and controls","Every financial event must create equal total debits and credits. A chart of accounts and coding conventions classify entries; separate general ledger and subsidiary ledgers may be reconciled through control accounts. Access permissions, sequential numbering, backups, reconciliations and review of unusual journals reduce error and fraud risk."],["Corrections and retention","When a document is wrong, preserve a clear audit trail; use a credit note, authorised correcting journal or reversing entry according to the underlying transaction. Avoid overwriting original approved amounts with no history. Period-end checks include outstanding receipts, accruals, supplier statements and bank reconciliation. Retention requirements depend on local law."],["Computerised accounting features, advantages and limitations","Computerised accounting systems capture accounting transactions through invoices, receipts, credit notes and authorised journals and update the appropriate general and subsidiary ledgers. Features may include validation, user-role restrictions, a chart of accounts, automatic document numbering, date cut-off controls, reconciliations, audit logs, transaction search, backups and configurable financial reports. Benefits include quick processing, repeatable calculations, timely outputs and retrieval; limitations include poor source-data accuracy, cyber risk, duplicate imports, unauthorised access, system downtime and reliance on suitable backup recovery. Cloud access permits shared remote working but does not transfer responsibility for proper authorisation or correct accounting to the software provider."],["Accounting records to preserve and inspect","A complete transaction audit trail links originating sales, purchases, inventory, payroll and banking documents with input reference, account code, tax treatment, currency, dates, posting, authorisation and later correction. Preserve a customer's individual account, supplier ledger, nominal controls and reconciled reports at the right reporting cut-off. An accounting entry may be balanced but still incorrectly classify a cash receipt as revenue. Only the affected journal should be reversed or corrected; do not delete records merely because a report needs to agree. Validate source records before exporting finance reports or relying on automatic forecasts."]],"workings":[["Credit sale through books","An entity sells goods on credit for $2,500 excluding tax and with no sales tax applicable.","Sales invoice documents transaction. Dr trade receivables $2,500; Cr sales $2,500. The individual customer account increases by $2,500 and the receivables control balance increases accordingly. On settlement Dr bank / Cr receivables."],["Audit trail error","A purchase invoice $1,800 was incorrectly posted as $18,000.","If the original entry was Dr purchases / Cr payables $18,000, reduce each account by $16,200: Dr payables $16,200, Cr purchases $16,200; retain the correcting journal and invoice reference."],["Cloud system's duplicate-posting risk","A system receives two identical imports of a supplier invoice for $2,400. Both debit inventory and credit payables, but only one valid delivery occurred. Calculate the misstatement and the correcting journal if both posted.","Payables and inventory are each overstated $2,400; the trial balance still balances. Once independent invoice, goods receipt and posting evidence confirms the duplication, reverse the extra journal: Dr trade payables $2,400 / Cr inventory $2,400. Configure a supplier-plus-invoice duplicate alert and preserve the correction audit trail. The correction is not a bank payment and does not clear the valid invoice."],["Information retrieval and control account check","An accounting application's customer ledger shows three debtor balances of $1,200, $850 and $650. The trade receivables control account contains $2,950 at the same date. Identify the expected total and what a trainee accountant should do before changing any ledger.","Individual customer balances total $1,200+$850+$650=$2,700. The control account is $2,950, a $250 excess. Compare dated sales-daybook totals, cash receipts, credit notes and posting references to locate the difference. A trainee should document the $250 mismatch and get authorised correction after identifying the transaction rather than force the personal customer ledgers to agree."]]},
  "FA2:A3": {
    "title": "Regulatory framework and accounting standards",
    "sections": [
      [
        "Sources of financial reporting requirements",
        "The entity applies its relevant financial reporting framework and legal rules. International Financial Reporting Standards (IFRS Accounting Standards) are issued by the IASB, while local law/regulators determine adoption and filing obligations. A Conceptual Framework guides consistent judgments but does not override an applicable standard."
      ],
      [
        "Recognition and measurement",
        "An item is accounted for based on its economic nature and the recognition/measurement requirements of the applicable standard. Historical cost is common for basic records, but some standards use other bases. Distinguish recognition (whether an item appears), measurement (at what amount), presentation (where grouped) and disclosure (what explanation is supplied)."
      ],
      [
        "Foundational examinable documents",
        "The 2026–27 ACCA FA2/FA/FFA examinable documents cover relevant requirements including inventory (IAS 2), property plant and equipment (IAS 16), provisions (IAS 37), revenue from contracts (IFRS 15) and presentation/disclosure (IFRS 18). Examine only the depth specified for FA2: higher-level calculations and advanced judgments from other ACCA papers are not automatically examinable here."
      ],
      [
        "IFRS 18 and presentation",
        "IFRS 18 introduces categories and defined subtotals in the statement of profit or loss and requirements for aggregation/disaggregation and management-defined performance measures. It replaces IAS 1 in the new IFRS reporting model, subject to effective/adoption and the paper's examinable guide. IFRS 18 changes how some performance is presented; it does not replace individual standards on inventory, revenue or depreciation."
      ],
      [
        "Professional care and exam approach",
        "Start with the transaction facts, identify the asset/liability/income/expense, consult the relevant standard and check whether the syllabus includes the requirement. Accounting standards evolve; dated examples, unsupported blanket statements and local tax assumptions can produce a technically incorrect answer. Never treat a balanced trial balance as evidence of IFRS compliance."
      ]
    ],
    "workings": [
      [
        "Presentation versus recognition",
        "Equipment cost $40,000 with accumulated depreciation $8,000 at year end.",
        "IAS 16 governs relevant recognition and depreciation principles; equipment carrying amount $32,000 in the statement of financial position. Its depreciation expense is presented in profit or loss in the relevant classification under the applicable presentation standard. The statement layout does not change how the $8,000 accumulated depreciation is calculated."
      ],
      [
        "Framework application",
        "Customer pays $10,000 in advance for next year's services.",
        "Receipt Dr bank $10,000 and Cr contract/deferred income liability $10,000 if performance obligation remains. Do not call it revenue solely because cash is received; recognise revenue as performance occurs under the relevant IFRS 15 principles."
      ]
    ]
  },
  "FA2:B1": {"title":"Elements of financial statements","sections":[["Assets and liabilities","An asset is a present economic resource controlled by the entity as a result of past events. A liability is a present obligation to transfer an economic resource arising from past events. 'Economic resource' means a right with potential to produce benefits. A liability is not simply a planned future expenditure; a future plan without an existing obligation may not meet recognition conditions."],["Equity, income and expenses","Equity is the residual interest after deducting liabilities from assets. Income increases assets or decreases liabilities and thereby increases equity except owner contributions. Expenses decrease assets or increase liabilities and reduce equity except owner distributions. Owners introducing cash is equity, not revenue; owner drawings are equity reductions, not operating expenses."],["Financial statements together","The statement of financial position shows resources, obligations and residual interest at a date. The statement of profit or loss reports recognised income and expenses over a period. Cash flow information explains cash generation/consumption, which may differ from profit. Correct classification between current/non-current often depends on the expected operating cycle and settlement timing."],["Double-entry effect on elements","Debit increases assets and expenses and reduces liabilities, income and equity. Credit reverses those effects. Control accounts summarise subsidiary balances; a debit trade receivables balance is an asset, a credit trade payables balance is liability. A receivable can be impaired without changing its initial gross invoice amount."],["Accounting equation and changes in capital","The accounting equation Assets = Liabilities + Equity reconciles financial position. A loan creates a bank asset and matching borrowing obligation, not revenue; an owner contribution increases bank and equity, and drawings reduce bank and equity rather than creating an operating expense. An income transaction changes profit and generally increases equity through retained earnings; an expense has the opposite effect, subject to recognised reserves and other comprehensive income. Identify economic resources, present obligations and residual ownership before posting. Debit/credit agreement alone cannot prove that all events were included or classified correctly."],["Components of primary statements and reconciled performance","The statement of financial position reports assets, liabilities and equity at a reporting date. The statement of profit or loss summarises recognised income and expenses for a period; under relevant accounting frameworks other comprehensive income is separately presented and not necessarily part of profit. Cash flow information distinguishes operating, investing and financing cash movements; the statement of changes in equity reconciles owner contributions, distributions, total comprehensive income and reserve transfers. Accompanying notes help users interpret significant policies, estimates and components. A credit sale can create profit while increasing receivables rather than bank cash."]],"workings":[["Net assets","An entity reports bank $22,000, inventory $13,000, equipment cost $60,000, accumulated depreciation $15,000, trade payables $19,000 and loan $20,000.","Assets =22,000+13,000+(60,000−15,000)=$80,000. Liabilities $39,000. Equity =80,000−39,000=$41,000."],["Income versus capital","Owner deposits $8,000 and the entity receives $3,000 for services already performed.","Owner contribution Dr bank / Cr capital $8,000. Service fees Dr bank / Cr revenue $3,000. Treating $8,000 as revenue would overstate profit $8,000."],["Reconcile opening and closing equity with income and drawings","A business has opening equity $30,000. During the year it earns profit $8,000, the owner introduces new capital of $5,000 and draws $3,000. There is no other comprehensive income or reserve adjustment. Calculate closing equity and identify which movements belong in profit.","Closing equity=$30,000+$8,000+$5,000−$3,000=$40,000. Only the $8,000 earned profit is part of period financial performance under the stated assumptions. The $5,000 contribution and $3,000 drawings are direct equity movements and not revenue or operating expenses. The resulting equity is the residual of assets less liabilities at reporting date."]]},
  "FA2:B2": {
    "title": "Recording financial data and accounting information flow",
    "sections": [
      [
        "Accounting data path",
        "Authorised source document → transaction journal/day book → nominal and personal accounts → trial balance → period-end adjustments → financial statements. Computerised systems can automate several steps, but each event still requires a business explanation and audit trail."
      ],
      [
        "Books of original entry",
        "The sales day book usually records credit sales, not cash receipts; the purchases day book records credit purchases, not necessarily settlement. Sales returns and purchase returns have their own books or modules; cash receipts/payments are recorded in the cash book. The journal handles adjustments and transactions not suited to specialist books."
      ],
      [
        "Nominal and personal ledgers",
        "Nominal accounts include revenue, expenses, assets, liabilities and capital. Individual customer and supplier accounts sit within receivables/payables subledgers and must reconcile to total control accounts. Trial balances draw general ledger balances rather than listing every source invoice."
      ],
      [
        "Period-end processes",
        "Check cut-off dates and outstanding invoices, post depreciation, prepayments, accruals, inventory closing adjustments and allowance movements. Then prepare adjusted trial balance and statements. Missing a supplier invoice is not automatically cured by the trial balance because both sides of the transaction may have been omitted."
      ],
      [
        "Automation risks",
        "A configured accounting system can produce balanced but inaccurate entries when chart-of-account mapping or tax code is wrong. Control access to journals, perform bank reconciliations, check ageing reports and investigate suspense accounts. Keep correction dates and user authorisation."
      ]
    ],
    "workings": [
      [
        "Credit purchase to payables",
        "Purchase office equipment for $4,000 on credit, settle $1,500 later.",
        "Initial Dr equipment $4,000 / Cr supplier payable $4,000; settlement Dr supplier payable $1,500 / Cr bank $1,500. Remaining amount due $2,500. This is not purchases of inventory."
      ],
      [
        "Cut-off test",
        "Stock arrives 29 December with invoice dated 5 January, and reporting year ends 31 December. Ownership transferred on receipt.",
        "Assuming control passed on 29 December, recognise inventory and payable in December even if the invoice is recorded in January; otherwise both are omitted from the 31 December statements."
      ]
    ]
  },
  "FA2:C1": {
    "title": "Journal entries",
    "sections": [
      [
        "Structure of the journal",
        "A manual journal includes date, debit account(s), credit account(s), equal amounts, narration and reference to supporting evidence. Debit means the left side of an account, not 'good'; credit is the right side, not 'money received'. An account's normal balance follows its nature."
      ],
      [
        "Recording opening entries and transactions",
        "When the entity starts a ledger, debit its opening assets and credit its liabilities and capital so the books balance. Common adjustments include depreciation, accruals, prepayments, irrecoverable debt write-off, capital introduced, drawings, and disposal. Every adjustment needs the correct debit/credit and period."
      ],
      [
        "Reversals and correcting journals",
        "An accrual may be reversed in the next period so that later cash/invoice processing does not double count. A correcting journal reclassifies amounts incorrectly debited or credited. A suspense balance may represent only one-sided errors, but some errors leave the trial balance equal while misstating balances."
      ],
      [
        "Tax and settlement entries",
        "A sales-tax-inclusive invoice may contain revenue net of tax and output tax payable. Purchase tax treatment depends on whether it is recoverable; irrecoverable sales tax is usually part of the underlying cost. Do not use a tax rate without the question giving one or the relevant jurisdiction."
      ]
    ],
    "workings": [
      [
        "Compound sales journal",
        "Goods sold on credit: net price $2,000, sales tax specified 6%.",
        "Dr trade receivables $2,120; Cr sales $2,000; Cr output sales tax liability $120. All debits equal credits."
      ],
      [
        "Correct incorrect expense classification",
        "$1,200 computer equipment was debited to repairs but should have been capitalised under given facts.",
        "Correct by Dr equipment $1,200 / Cr repairs expense $1,200; then calculate any appropriate depreciation for period and record separately."
      ]
    ]
  },
  "FA2:C2": {"title":"General ledger accounts and balancing","sections":[["T-account logic","An individual account has debit left and credit right. Transactions are posted with corresponding account references and dates. A debit balance is carried forward when debit totals exceed credit totals; for a credit-balance account the opposite holds. The balance carried down (c/d) closes the account and is brought down (b/d) on the opposite side at the start of next period."],["Types of accounts","Bank and receivables commonly carry debit balances; payables, loans, accumulated depreciation, revenue and capital commonly credit balances. Expenses normally debit. Trade receivables and payables control accounts track totals; subsidiary accounts identify individual customers/suppliers."],["Ledgers and trial balance","After balancing, extract debit and credit totals to compile a trial balance. Equality verifies arithmetic of postings but not correct classification, omission or duplicate balanced entries. Investigate unusual account signs, stale suspense balances and unreconciled control accounts before statements."],["Posting closing entries","Revenue and expense accounts are ultimately closed through profit or loss; assets, liabilities and capital carry forward. Under the inventory accounting system, cost of sales may be adjusted for opening/closing stock. Posting closing transfers does not itself create or consume cash."],["Post compound journals to general ledger accounts","A general ledger consolidates each nominal asset, liability, equity, income and expense account so that closing balances can be extracted into reports and the trial balance. Source documents or adjusting journals must debit and credit the correct nominal accounts, then each amount appears on its respective T-account side with date and contra-account reference. The personal customer and supplier ledgers supplement control accounts rather than replacing general-ledger totals. A compound posting may include two debits and one credit, for example a credit sales invoice net of tax: Dr receivables for the gross, Cr sales for net and Cr output tax for the tax. Verify debits equal credits and the related control accounts reconcile."],["Posting errors and correction before ledger close","Check normal debit and credit balances, opening and brought-down balances, timing of adjustments and totals of each T-account. An asset debit balance has balance c/d placed temporarily on the credit side, then balance b/d on debit at the new period; a liability works the opposite way. An omitted debit generally creates a temporary imbalance, whereas a duplicated balanced journal can leave trial-balance totals equal while overstating activity. Correct the underlying journal with supporting evidence and independent authorisation; don't invent a bank movement merely to resolve a ledger discrepancy."]],"workings":[["Balance a bank T-account","Opening bank debit $10,000; receipts debit $4,000 and $3,000; payments credit $5,000 and $2,500.","Total debit $17,000; total credit $7,500; closing bank debit $9,500. In the T-account record $9,500 balance c/d on credit side to balance; next period bring down $9,500 on debit side."],["Balance payables ledger","Opening payable credit $6,000; goods purchased on credit $4,000; supplier paid $7,500.","Credits $10,000; debit $7,500; closing credit $2,500. The payable balance c/d is placed on debit side and b/d carried on credit next period."],["Compound sales invoice through three T-accounts","A business invoices a customer $5,000 plus 8% output sales tax and receives no cash yet. Show how the amount is posted to the trade receivables, sales and output-tax general ledger accounts.","Tax=$5,000×8%=$400, gross invoice=$5,400. Debit the trade receivables control ledger $5,400; credit sales revenue $5,000; credit output sales-tax payable $400. The compound journal balances because debit $5,400 equals credits $5,400. The customer's individual subsidiary record also receives the gross invoice, but it is not another general ledger debit. Revenue excludes the tax collected for the authority."],["Balance a liability account and show carried balances","A supplier payable account begins with credit $6,000, records new credit purchases $4,000 and bank payments debited $7,500. Show its ending balance c/d and next period b/d sides.","Supplier account credits total $6,000+$4,000=$10,000; debits from payments are $7,500. The normal credit balance is $2,500. Write balance c/d $2,500 on the debit side to equalise $10,000 on both ledger sides. Next period open Cr payables balance b/d $2,500. The balancing figure is not an additional supplier payment."]]},
  "FA2:D1": {
  "title": "Sales, purchases, discounts, returns and sales tax",
  "sections": [
    [
      "Sales and purchases records",
      "A sales invoice establishes the customer's obligation and normally increases revenue and trade receivables. Purchases of inventories increase inventory (perpetual system) or purchases/cost of sales account (periodic system) and supplier liabilities. Cash settlement changes bank and personal accounts; it is not another sale or purchase."
    ],
    [
      "Trade versus settlement discounts",
      "Trade discount is deducted from catalogue/list price before recording the invoice. Settlement/cash discount depends on early payment terms; the expected amount of consideration and any subsequent discount are recorded according to the question's framework. Keep the selling price, tax base and timing rules clear. A discount offered but not earned should not automatically reduce the bank receipt."
    ],
    [
      "Returns inwards and outwards",
      "Customer returns reduce net sales and gross receivables: Dr sales returns / Cr trade receivables; if applicable, adjust output sales tax and inventory/cost of sales. Supplier credit note for purchase returns reduces what is owed: Dr trade payables / Cr purchase returns (or inventory) with corresponding input-tax treatment. Returns inwards belong to sales, returns outwards to purchases."
    ],
    [
      "Sales-tax accounting",
      "For tax-inclusive total T and rate r, net = T/(1+r); tax =T−net. For tax-exclusive net N, tax=N×r; gross=N×(1+r). Output tax on taxable sales increases tax payable, and recoverable input tax can offset it. Nonrecoverable purchase tax forms part of the relevant cost. Specific Malaysia/UK rules are not presumed without exam facts."
    ],
    [
      "Cost of sales and cutoff",
      "Under a periodic system, cost of sales = opening inventory + net purchases + inward freight/other costs − closing inventory; follow stipulated treatment of carriage. Sales cut-off and supplier receipt cut-off affect both profit and assets/liabilities. Do not charge purchase of long-term equipment to cost of goods sold."
    ],
    [
      "Sales tax: registration, taxable supplies and information sources",
      "Sales-tax obligations depend on the applicable law and jurisdiction: first determine whether the entity is required or eligible to register, the registration threshold and effective registration date, and whether particular supplies are standard-rated, reduced-rated, zero-rated, exempt or outside the tax system. Zero-rated taxable supplies are not necessarily equivalent to exempt supplies: the right to recover input tax and reporting treatment may differ. Obtain requirements from the current tax authority legislation, official guidance and valid invoices, not an unsupported assumed tax rate. Standard documentation generally identifies the supplier, customer where required, invoice number/date, supply description, net value, applicable rate, tax amount and gross total, as the governing law requires. A learner must distinguish rules about registering and reporting from the arithmetic of the output/input tax ledger."
    ],
    [
      "Sales tax: accounting schemes, filing and penalties",
      "Common tax-accounting methods distinguish a sales/invoice-date (accrual) basis from a cash-receipts/payment basis where local law permits the scheme. Under an invoice basis, a credit sale may create an output-tax liability before customer cash is collected; on a permitted cash scheme, liability generally follows qualifying receipts, with input-tax recovery timing governed by local rules. Record output sales tax and allowable recoverable input sales tax separately or in one properly reconciled control account. Generate a return from audited sales and purchase ledgers: reconcile net taxable turnover, output tax, input tax recoverable, corrections and net tax owed or repayable. Keep a filing calendar and tax authority references; late registration, late returns, underpayments and late payments may produce jurisdiction-specific interest and penalties. Never invent amounts or universal legal deadlines: identify which tax rates and sanctions the question supplies or the official authority confirms."
    ],
    [
      "Trade versus prompt-payment discounts under revenue recognition",
      "A seller's unconditional trade discount reduces the transaction price before revenue is recorded. Under IFRS 15, an early-settlement discount offered to a customer is variable consideration: estimate the amount the seller expects to be entitled to, subject to the constraint on variable consideration. If prompt payment is expected, the transaction-price estimate is net of the discount and later reversed if not taken. If full payment is expected and early payment unexpectedly qualifies, reduce receivable and revenue by the discount actually allowed when recognising settlement. Discounts received by a purchaser are a separate purchase-side issue; do not automatically record a seller's settlement discount as a financing charge. When sales tax is involved, calculate it using the transaction base and adjustment rules expressly specified by the applicable regime."
    ]
  ],
  "workings": [
    [
      "Discounts and output tax",
      "List price $5,000; trade discount 20%, sales tax 6% on net invoice amount; ignore settlement discount.",
      "Invoice net =5,000×80%=$4,000. Output tax=4,000×6%=$240. Total receivable $4,240. Journal Dr receivables 4,240 / Cr sales 4,000 / Cr tax payable 240."
    ],
    [
      "Customer return including tax",
      "Original invoice for goods $1,000 net plus 8% sales tax. Customer returns half of goods and credit note is issued.",
      "Dr sales returns $500; Dr output tax payable $40; Cr receivables $540. The remaining customer balance is $540, assuming no other transactions."
    ],
    [
      "Gross profit",
      "Opening stock $5,000, purchases $32,000, purchase returns $2,000, carriage inwards $1,000 and closing stock $6,000. Sales $60,000, sales returns $4,000.",
      "Net sales=$56,000; net purchases=$30,000; cost of sales=5,000+30,000+1,000−6,000=$30,000. Gross profit=56,000−30,000=$26,000."
    ],
    [
      "Sales-tax control ledger and return reconciliation",
      "A VAT-style question specifies taxable net sales $24,000 at 10%, eligible taxable net purchases $11,000 at 10%, and an additional $200 of input tax on a mixed-use cost that is explicitly non-recoverable. All relevant invoices are valid, there are no other supplies, and the law permits offsetting eligible input against output tax. Calculate the return and show key ledger postings.",
      "Output tax = $24,000×10%=$2,400. Recoverable input tax = $11,000×10%=$1,100; the separately specified $200 is non-recoverable and must be attributed to the appropriate cost, not used to reduce the tax balance. Net tax payable = $2,400−$1,100=$1,300. Record sales Dr receivables $26,400 / Cr sales $24,000 / Cr output-tax control $2,400; record eligible purchases Dr inventory/purchases $11,000 / Dr recoverable-input-tax control $1,100 / Cr payables $12,100. Reconcile credit output of $2,400 and debit allowable input of $1,100; net payable $1,300. The non-recoverable $200 is not a claim on the tax authority. Settlement when due: Dr tax payable $1,300 / Cr bank $1,300."
    ],
    [
      "Invoice versus cash accounting and filing risk",
      "Assume a jurisdiction allows a cash-accounting scheme for a qualifying registered trader and taxes specified supplies at 10%. On 28 December the trader issues a credit sales invoice for $5,000 net. The customer pays on 15 January. Reporting closes 31 December. Calculate illustrative output tax under invoice-based and qualifying cash-based schemes, ignoring other transactions.",
      "The invoice specifies $5,000×10%=$500 of output tax. Under the assumed invoice accounting basis, output tax of $500 belongs in the December tax period despite receipt arriving in January; Dr receivables $5,500 / Cr revenue $5,000 / Cr output tax $500, subject to the applicable tax-point rules. Under the assumed eligible cash basis, output tax of $500 becomes reportable when the $5,500 cash is received in January, subject to governing exceptions. Both approaches yield total output tax $500 eventually, but the cash-flow and reporting periods differ. The organisation must verify eligibility, filing dates, supporting invoices and any locally applicable interest or penalties rather than assuming a universal rule."
    ],
    [
      "Settlement discount expected and actual amount",
      "A supplier sells goods for $8,000 after a trade discount and offers an additional 5% discount for payment within ten days. The seller expects the customer to pay within the discount period and eventually receives full payment after the window. Ignore sales tax. Determine the initial seller journal, the required later adjustment, and the settlement.",
      "Expected early-payment discount = $8,000×5%=$400. Initially the expected consideration is $7,600: Dr receivables $7,600 / Cr revenue $7,600. When the prompt-payment window expires without discount, adjust Dr receivables $400 / Cr revenue $400; the contractual price due is now $8,000. On subsequent payment Dr bank $8,000 / Cr receivables $8,000. Total revenue $8,000 reflects the consideration ultimately expected and received. The $400 reversal is a variable-consideration change, not bank interest."
    ]
  ]
}
};})(window);
