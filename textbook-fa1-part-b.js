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
        "Opening customers RM20,000, credit sales RM34,000, bank receipts RM30,000, returns RM2,000, specific bad debt RM1,000.",
        "Closing control debit=20,000+34,000−30,000−2,000−1,000=RM21,000."
      ],
      [
        "Sales-tax invoice",
        "Credit sale net RM2,500, tax rate supplied 8%.",
        "Gross invoice RM2,700. Dr trade receivables RM2,700, Cr revenue RM2,500, Cr output-tax payable RM200. Amount owed by customer is gross."
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
        "Opening payables RM15,000, credit purchases RM36,000, payments RM31,000, purchase returns RM3,000.",
        "Closing payable=15,000+36,000−31,000−3,000=RM17,000 credit."
      ],
      [
        "Equipment bought from supplier",
        "Supplier supplies inventory RM4,000 and a computer for office use RM3,000, both on credit.",
        "Dr inventory/purchases RM4,000; Dr equipment RM3,000; Cr payables RM7,000. Equipment is not automatically included in cost of sales."
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
        "Bank statement omits cheque RM500 issued last week; book omits bank charge RM60.",
        "Cheque RM500 is timing (unpresented) and not re-entered. Charge RM60 requires Dr bank charges / Cr bank and reduces adjusted cash-book balance."
      ],
      [
        "Subledger discrepancy",
        "Payables control RM14,000; supplier accounts total RM13,400; one invoice RM600 posted to control but omitted from individual supplier.",
        "Post missing RM600 to supplier personal account (the nominal ledger control already records it), restoring equality. Confirm invoice evidence and avoid duplicating general-ledger liability."
      ]
    ]
  },
  "FA1:I2": {
    "title": "Reconciling cash records",
    "sections": [
      [
        "Pre-reconciliation review",
        "Confirm statement date, compare bank cash book and statement, tick matched items and identify direct transactions recorded by bank but not by entity. Update ledger for fees, interest, direct debit and dishonoured receipts first; this produces adjusted cash-book balance."
      ],
      [
        "Timing items",
        "Outstanding lodgements have been entered in cash book but not yet reached bank statement; they make adjusted cash book higher than bank statement. Unpresented cheques are recorded payments not yet taken by bank; they make adjusted cash book lower than statement, all else equal."
      ],
      [
        "Two equivalent forms",
        "From adjusted cash book to bank statement: add unpresented cheques, subtract outstanding lodgements. From statement to adjusted book: add outstanding lodgements, subtract unpresented cheques. If a bank overdraft exists, maintain signed balance convention carefully."
      ],
      [
        "Correction of errors",
        "An entity posting a RM980 supplier payment as RM890 has overstated its bank ledger RM90 and must credit bank another RM90. If bank itself made an error, show a reconciliation item and request correction; do not invent a second payment journal."
      ]
    ],
    "workings": [
      [
        "Full reconciliation",
        "Cash book balance debit RM10,600, bank fees RM100 unrecorded, deposit RM2,500 outstanding, cheque RM900 unpresented.",
        "Adjusted book=10,600−100=RM10,500. Bank statement expected=10,500+900−2,500=RM8,900."
      ],
      [
        "Receipt from customer",
        "Bank statement shows direct customer transfer RM1,200 absent in book.",
        "Dr bank RM1,200 / Cr customer receivable RM1,200; adjusted bank increases RM1,200. Do not report new sales."
      ]
    ]
  },
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
        "Supplier statement RM5,000; entity account RM4,250. Valid invoice RM400 omitted internally; payment RM350 sent but not yet shown on statement.",
        "Correct entity account=4,250+400=RM4,650. Supplier statement less payment in transit=5,000−350=RM4,650. Post invoice RM400, not a duplicate payment."
      ],
      [
        "Missing credit note",
        "A supplier RM200 credit note appears on statement but not entity records.",
        "Dr supplier payable RM200; Cr purchase returns/inventory RM200; then reconcile."
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
        "Bank Dr RM7,000, receivables Dr RM9,000, rent Dr RM4,000, equipment Dr RM20,000; payables Cr RM5,000, loan Cr RM10,000, capital Cr RM17,000, sales Cr RM8,000.",
        "Debits=7,000+9,000+4,000+20,000=RM40,000. Credits=5,000+10,000+17,000+8,000=RM40,000."
      ],
      [
        "Trial balance error",
        "An RM850 payment was posted as Cr bank RM850 with no debit to creditor account.",
        "Credits exceed debits RM850. Correct Dr payables RM850 if that creditor was paid; compare supporting documents before assuming."
      ]
    ]
  },
  "FA1:J2": {
    "title": "Correcting errors in accounting records",
    "sections": [
      [
        "One-sided and two-sided errors",
        "A one-sided posting may cause the trial balance to disagree; a double-entry error such as using repairs instead of equipment leaves columns equal. Diagnose by comparing required treatment to actual entry. Correct only the difference, not the full original amount twice."
      ],
      [
        "Error types",
        "Omission: transaction not entered at all. Commission: posted to wrong personal account. Principle: wrong category of account. Original entry: both sides recorded at same wrong amount. Reversal: both sides opposite. Compensating: errors offset in aggregate. Different types have different profit and trial-balance effects."
      ],
      [
        "Suspense mechanics",
        "Suspense holds unexplained one-sided difference temporarily. The correction journal posts against suspense only when necessary to clear the imbalance from the one-sided posting. Balance after correction should be nil and trial balance agree."
      ],
      [
        "Financial statement effect",
        "Profit changes only where correcting a revenue or expense amount, including asset/expense classification. Some corrections move receivable balances between customers without changing profit or total assets. Review prior-period complications separately if relevant to the exam level."
      ]
    ],
    "workings": [
      [
        "Wrong purchase amount",
        "Purchases of RM2,400 recorded as RM2,040 on both sides.",
        "Dr purchases RM360; Cr supplier payable RM360. Trial balance would have agreed before the correction."
      ],
      [
        "Wrong classification",
        "Repairs expense debited RM1,500 for machinery acquisition.",
        "Dr equipment RM1,500; Cr repairs RM1,500. Ignore depreciation only if not required; otherwise make it as a second adjusting journal."
      ]
    ]
  }
};})(window);
