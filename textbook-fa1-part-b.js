/* Original LedgerPeer detailed FA1 textbook lessons G1–J2. */
(function(root){'use strict';root.LedgerTextbookFA1B={
  "FA1:G1": {
    "title": "Recording sales and customer balances",
    "sections": [
      [
        "Credit sales and customer accounts",
        "A customer invoice records credit sale at proper net revenue and any tax owed, and the full receivable. The sales day book posts an aggregate total to sales and receivables control while individual invoices update customer personal ledger accounts. Cash sales are entered through cash/book records, not duplicated in the credit-sales total."
      ],
      [
        "Sales returns, receipts and discounts",
        "A customer credit note reduces receivables and the relevant revenue or sales returns account, plus any required sales-tax adjustment. Customer receipts Dr bank / Cr receivables. An earned settlement discount extinguishes part of the receivable but may need separate presentation under specified accounting rules."
      ],
      [
        "Receivables control",
        "Open receivables Dr plus credit sales Dr less receipts Cr, returns Cr, write-offs Cr, permitted discounts and contra equals closing Dr (subject to any other transactions). Individual customer balances should reconcile. A credit customer balance can reflect an advance, refund due or posting error and needs investigation."
      ],
      [
        "Ageing and collection controls",
        "Aged debtors reports identify overdue invoices; reconciliations catch duplicate receipts, missing credits and wrong-customer postings. Authorise credit limits and verify changes to customer details. A receipt from a debtor is not a fresh revenue transaction."
      ]
    ],
    "workings": [
      [
        "Receivables control",
        "Opening customers $20,000, credit sales $34,000, bank receipts $30,000, returns $2,000, specific bad debt $1,000.",
        "Closing control debit=20,000+34,000−30,000−2,000−1,000=$21,000."
      ],
      [
        "Sales-tax invoice",
        "Credit sale net $2,500, tax rate supplied 8%.",
        "Gross invoice $2,700. Dr trade receivables $2,700, Cr revenue $2,500, Cr output-tax payable $200. Amount owed by customer is gross."
      ]
    ]
  },
  "FA1:H1": {
    "title": "Recording purchases and supplier balances",
    "sections": [
      [
        "Credit purchases and personal accounts",
        "A supplier invoice for goods received records purchases/inventory and the amount owed. Aggregate credit purchases increase the payables control account; each invoice is recorded in the relevant supplier ledger. Cash purchases and equipment acquisitions must be distinguished from ordinary inventory purchases."
      ],
      [
        "Supplier returns and payments",
        "A purchase return credit note decreases purchase cost and trade payable. Supplier payments reduce bank and the debt. An earned settlement discount reduces the liability and is recorded as specified; do not confuse it with trade discount already deducted from invoice price."
      ],
      [
        "Payables control",
        "Opening payables Cr + credit purchases Cr − payments Dr − returns Dr − contra/discount Dr = closing Cr, adjusted for other given items. Supplier statements are independently reconciled to customer-side books; a payment in transit is timing, not automatically another expense."
      ],
      [
        "Controls",
        "Use purchase order, receiving documentation and supplier invoice match; authorise supplier details and bank changes. Duplicate supplier accounts or missing invoices can overstate or understate obligations even if trial balance agrees."
      ]
    ],
    "workings": [
      [
        "Supplier control",
        "Opening payables $15,000, credit purchases $36,000, payments $31,000, purchase returns $3,000.",
        "Closing payable=15,000+36,000−31,000−3,000=$17,000 credit."
      ],
      [
        "Equipment bought from supplier",
        "Supplier supplies inventory $4,000 and a computer for office use $3,000, both on credit.",
        "Dr inventory/purchases $4,000; Dr equipment $3,000; Cr payables $7,000. Equipment is not automatically included in cost of sales."
      ]
    ]
  },
  "FA1:I1": {
    "title": "Purpose of reconciliations",
    "sections": [
      [
        "Definition and purpose",
        "A reconciliation compares independent records of the same balance or transaction stream, explains timing differences and corrects errors. It provides evidence about completeness, accuracy and possible fraud, but only if performed using independent documents and reviewed."
      ],
      [
        "Common reconciliations",
        "Bank ledger to bank statement, receivables control to customers, payables control to supplier balances and supplier statement to one supplier's account. Inventory count to stock ledger and payroll to approved timesheets are related controls. The objective is to identify exact reconciling items rather than insert a balancing figure."
      ],
      [
        "Timing versus accounting errors",
        "Unpresented cheques, deposits in transit and late bank processing might explain differences without a new book entry. Omitted bank charges, duplicated supplier invoices or wrong journal amounts need ledger correction. Document evidence and carry forward unresolved exceptions for timely review."
      ],
      [
        "Investigation discipline",
        "Work from one date, identify source transactions and mark them cleared/missing. Reconcile corrected book balance to independent evidence, then obtain independent sign-off and retain supporting schedules. Repeated stale reconciling items should not be treated as normal indefinitely."
      ]
    ],
    "workings": [
      [
        "Classify reconciling items",
        "Bank statement omits cheque $500 issued last week; book omits bank charge $60.",
        "Cheque $500 is timing (unpresented) and not re-entered. Charge $60 requires Dr bank charges / Cr bank and reduces adjusted cash-book balance."
      ],
      [
        "Subledger discrepancy",
        "Payables control $14,000; supplier accounts total $13,400; one invoice $600 posted to control but omitted from individual supplier.",
        "Post missing $600 to supplier personal account (the nominal ledger control already records it), restoring equality. Confirm invoice evidence and avoid duplicating general-ledger liability."
      ]
    ]
  },
  "FA1:I2": {"title":"Reconciling cash records","sections":[["Pre-reconciliation review","Confirm statement date, compare bank cash book and statement, tick matched items and identify direct transactions recorded by bank but not by entity. Update ledger for fees, interest, direct debit and dishonoured receipts first; this produces adjusted cash-book balance."],["Timing items","Outstanding lodgements have been entered in cash book but not yet reached bank statement; they make adjusted cash book higher than bank statement. Unpresented cheques are recorded payments not yet taken by bank; they make adjusted cash book lower than statement, all else equal."],["Two equivalent forms","From adjusted cash book to bank statement: add unpresented cheques, subtract outstanding lodgements. From statement to adjusted book: add outstanding lodgements, subtract unpresented cheques. If a bank overdraft exists, maintain signed balance convention carefully."],["Correction of errors","An entity posting a $980 supplier payment as $890 has overstated its bank ledger $90 and must credit bank another $90. If bank itself made an error, show a reconciliation item and request correction; do not invent a second payment journal."],["Bank reconciliation: distinguish book adjustments and timing differences","Start with a cash book balance and update it only for information not yet entered in the business ledger, such as bank charges, direct debits, standing-order receipts, bank interest and dishonoured receipts. Post those entries before preparing the bank reconciliation statement. Unpresented cheques were already credited in the cash book but have not reduced the bank statement, and deposits in transit have already increased the cash book but have not reached the bank. Consequently, when reconciling adjusted debit cash book to expected credit bank-statement balance, add unpresented cheques and deduct deposits in transit. A bank error should be investigated and reported to the bank rather than put through the entity cash book without evidence."]],"workings":[["Full reconciliation","Cash book balance debit $10,600, bank fees $100 unrecorded, deposit $2,500 outstanding, cheque $900 unpresented.","Adjusted book=10,600−100=$10,500. Bank statement expected=10,500+900−2,500=$8,900."],["Receipt from customer","Bank statement shows direct customer transfer $1,200 absent in book.","Dr bank $1,200 / Cr customer receivable $1,200; adjusted bank increases $1,200. Do not report new sales."],["Cash book adjustment followed by statement reconciliation","The cash book opens with a debit bank balance of $15,000. The bank statement records unposted monthly fees of $60 and a direct receipt from a customer of $740. Unpresented cheques total $1,400 and outstanding lodgements total $2,200. Calculate the adjusted cash book and the expected bank statement balance, then state the two correcting journals.","Adjusted cash book = $15,000−$60+$740=$15,680 debit. Record fee: Dr bank charges expense $60 / Cr bank $60. Record customer payment: Dr bank $740 / Cr trade receivables $740. Reconcile to statement: adjusted cash book $15,680 + unpresented cheques $1,400 − deposits in transit $2,200 = $14,880. Neither $1,400 nor $2,200 should be posted a second time to bank; they are timing items."]]},
  "FA1:I3": {
    "title": "Reconciling supplier accounts",
    "sections": [
      [
        "Supplier statement comparison",
        "Supplier statements are prepared by the supplier, while internal individual accounts reflect the buyer's records. Match invoice numbers, credit notes, receipts and account references at the same date. Differences may be due to timing, omission, misposting or wrong amount."
      ],
      [
        "Missing transactions",
        "A valid invoice present on statement but absent internally must be recorded as a liability and relevant purchase/inventory cost. A supplier credit note omitted internally reduces payable. A payment sent before period end but not processed by supplier is normally timing and needs no duplicate entry."
      ],
      [
        "Control account relationship",
        "Aggregate corrected supplier personal ledgers must equal the general payables control. Correct transaction in the correct layer: if an individual supplier balance is wrong but control correct, adjusting control as well would create a new difference."
      ],
      [
        "Evidence and exceptions",
        "Confirm unknown charges and matching purchase receipts before recognising liability. Old credit notes, returned goods and supplier overpayments require follow-up. Never simply debit a difference to purchases to force a statement to match."
      ]
    ],
    "workings": [
      [
        "Supplier statement reconciliation",
        "Supplier statement $5,000; entity account $4,250. Valid invoice $400 omitted internally; payment $350 sent but not yet shown on statement.",
        "Correct entity account=4,250+400=$4,650. Supplier statement less payment in transit=5,000−350=$4,650. Post invoice $400, not a duplicate payment."
      ],
      [
        "Missing credit note",
        "A supplier $200 credit note appears on statement but not entity records.",
        "Dr supplier payable $200; Cr purchase returns/inventory $200; then reconcile."
      ]
    ]
  },
  "FA1:J1": {
    "title": "Preparing the trial balance",
    "sections": [
      [
        "Trial balance concept",
        "The trial balance summarises each nominal account's closing debit or credit balance. Assets and expenses generally debit; liabilities, equity and income generally credit. Equal column totals indicate double-entry arithmetic agreement but not necessarily correct recognition or classification."
      ],
      [
        "Extraction from T-accounts",
        "Balance each general ledger account, distinguish credit versus debit balance and list exactly once. If a bank is overdrawn its balance can be credit; a customer overpayment may create a credit in an otherwise debit subledger."
      ],
      [
        "Locate imbalances",
        "Re-total each column, compare account balances to ledgers, test half/double differences for side errors, and review miscopy and transposition. Suspense should not be used as a permanent accounting treatment."
      ],
      [
        "Limits of agreement",
        "An entirely omitted sale, correctly balanced wrong expense classification or reversed double entry can leave totals equal. Reconcile key control and bank accounts; perform period-end accrual/inventory adjustments before issuing statements."
      ]
    ],
    "workings": [
      [
        "Simple trial balance",
        "Bank Dr $7,000, receivables Dr $9,000, rent Dr $4,000, equipment Dr $20,000; payables Cr $5,000, loan Cr $10,000, capital Cr $17,000, sales Cr $8,000.",
        "Debits=7,000+9,000+4,000+20,000=$40,000. Credits=5,000+10,000+17,000+8,000=$40,000."
      ],
      [
        "Trial balance error",
        "An $850 payment was posted as Cr bank $850 with no debit to creditor account.",
        "Credits exceed debits $850. Correct Dr payables $850 if that creditor was paid; compare supporting documents before assuming."
      ]
    ]
  },
  "FA1:J2": {"title":"Correcting errors in accounting records","sections":[["One-sided and two-sided errors","A one-sided posting may cause the trial balance to disagree; a double-entry error such as using repairs instead of equipment leaves columns equal. Diagnose by comparing required treatment to actual entry. Correct only the difference, not the full original amount twice."],["Error types","Omission: transaction not entered at all. Commission: posted to wrong personal account. Principle: wrong category of account. Original entry: both sides recorded at same wrong amount. Reversal: both sides opposite. Compensating: errors offset in aggregate. Different types have different profit and trial-balance effects."],["Suspense mechanics","Suspense holds unexplained one-sided difference temporarily. The correction journal posts against suspense only when necessary to clear the imbalance from the one-sided posting. Balance after correction should be nil and trial balance agree."],["Financial statement effect","Profit changes only where correcting a revenue or expense amount, including asset/expense classification. Some corrections move receivable balances between customers without changing profit or total assets. Review prior-period complications separately if relevant to the exam level."],["Correcting errors with and without suspense accounts","A complete omission, reversal of entries, error of principle, error of original entry or compensating error may leave debit and credit totals equal, so a balanced trial balance does not mean all postings are correct. A one-sided omission, wrong-side posting, or unequal debit and credit typically produces a trial balance difference. For a suspense-account question, first identify the exact side and amount required to equalise the trial balance, then post the correcting journal and clear suspense. An error of principle (for example, debiting repairs instead of equipment) is corrected by reclassification, not automatically through suspense. Quantify the effect on profit, assets and liabilities separately."]],"workings":[["Wrong purchase amount","Purchases of $2,400 recorded as $2,040 on both sides.","Dr purchases $360; Cr supplier payable $360. Trial balance would have agreed before the correction."],["Wrong classification","Repairs expense debited $1,500 for machinery acquisition.","Dr equipment $1,500; Cr repairs $1,500. Ignore depreciation only if not required; otherwise make it as a second adjusting journal."],["Suspense account and one-sided rent omission","A business correctly credits bank $700 for a rent payment but omits the debit to rent. The trial balance is provisionally balanced with suspense. Identify the initial imbalance, which suspense balance was needed and the correcting journal.","Because bank was credited $700 without an equal debit, total credits exceed total debits by $700. A provisional suspense DEBIT $700 balances the trial balance. Correction: Dr rent expense $700 / Cr suspense $700. The suspense account closes to zero, rent expense increases by $700, and period profit falls $700. Bank is already correct and must not be credited again."],["Error of principle with correct double entry","A $2,200 qualifying equipment purchase was posted Dr repairs expense $2,200 / Cr bank $2,200. No depreciation has yet arisen under the question's timing assumption. Give the correct adjustment and explain trial balance and profit effects.","The original Dr repairs / Cr bank agrees arithmetically, so no suspense entry is needed. Reclassify Dr equipment $2,200 / Cr repairs expense $2,200. Bank remains credited only once; equipment increases $2,200 and expense decreases $2,200. Compared with the erroneous entry, profit rises $2,200 before any later depreciation. The trial balance would have balanced both before and after the correction."]]}
};})(window);
