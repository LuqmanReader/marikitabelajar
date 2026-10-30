/* Original LedgerPeer detailed FA1 textbook lessons A1–F2. */
(function(root){'use strict';root.LedgerTextbookFA1A={
  "FA1:A1": {
    "title": "Types of business transaction",
    "sections": [
      [
        "The transaction and its economic effect",
        "A business transaction changes the assets, liabilities, capital, income or expenses of the entity. Cash sales and purchases involve immediate bank/cash movement; credit transactions create receivables or payables; owner's capital introduced and drawings affect equity rather than profit. A purchase of equipment differs from buying inventory held for resale."
      ],
      [
        "Common transaction classes",
        "Sales, purchases, returns, receipts, payments, payroll, capital, loans and finance costs each have different underlying records and ledgers. Distinguish supplier credit from a bank loan, and supplier credit notes from cash refunds. Record what occurred, not just which document was printed."
      ],
      [
        "Capital and revenue distinction",
        "Capital expenditure typically acquires or improves a resource giving benefits across periods. Revenue expenditure supports current-period trading or maintenance. Misclassification affects assets, expenses and profit. Assess substance and relevant accounting requirements instead of applying a price threshold to all items."
      ],
      [
        "Controls over transactions",
        "Source documents should be complete, sequential and authorised, with proper dates, business reasons and tax treatment. Check duplicate invoices, altered supplier bank details, unusual refunds, missing delivery evidence and unauthorised discounts before processing."
      ]
    ],
    "workings": [
      [
        "Classify three events",
        "(i) Owner invests $10,000, (ii) entity purchases $3,000 inventory on credit, (iii) entity pays $2,000 loan principal.",
        "(i) Asset/equity both rise $10,000. (ii) Inventory and payable rise $3,000. (iii) Bank and loan liability both fall $2,000; loan principal repayment is not an expense."
      ],
      [
        "Equipment versus supplies",
        "The entity buys a $8,000 delivery van and $600 fuel.",
        "Van is a non-current asset acquired for operations (subject to recognition requirements). Fuel is an expense or consumable according to use and record dates. Do not treat the van as purchases for resale."
      ]
    ]
  },
  "FA1:A2": {
    "title": "Business documentation",
    "sections": [
      [
        "Documents by transaction stage",
        "A purchase requisition initiates authorised need; a purchase order communicates requested goods and terms; a delivery note and goods received note establish supply. Supplier invoice requests payment, credit note reduces it, and remittance advice identifies invoices settled. For sales, a quotation can precede order, invoice and receipt."
      ],
      [
        "Document content",
        "A reliable document identifies parties, date, number, description, quantities, unit rate, discount, tax, gross total, currency and terms as applicable. Check arithmetic and quantity against order and goods receipt. A quotation alone does not establish that a sale took place."
      ],
      [
        "Cash, card and electronic evidence",
        "Till records, bank transfer confirmations and bank statements support cash settlement; payroll reports support payment of employees. A payment authorisation and executed bank transfer are different events. Keep an audit trail from source through ledger, including an electronic file's unique identifier."
      ],
      [
        "Errors and prevention",
        "Match purchase invoice to approved purchase order and goods receipt (three-way match). Investigate duplicate invoice numbers, non-matching supplier accounts and reversed amounts. Retain original documents when correcting; do not conceal the initial mistake."
      ]
    ],
    "workings": [
      [
        "Three-way match",
        "PO orders 20 items @$45; goods received note shows 18; invoice charges 20.",
        "Unmatched two units require query. Matched delivered amount =18×45=$810 excluding stated tax; do not approve all $900 without evidence or permitted backorder treatment."
      ],
      [
        "Credit note",
        "Supplier invoice $1,200, later credit note for damaged goods $300.",
        "Balance owed decreases to $900. Record Dr supplier payable $300 and Cr purchase returns/inventory $300 under the relevant recording method."
      ]
    ]
  },
  "FA1:A3": {
    "title": "Process of recording business transactions",
    "sections": [
      [
        "Recording chain",
        "Collect evidence, verify authorisation and arithmetic, choose journal/day book, code the accounts and post equal debit/credit totals. At period end reconcile subledgers and produce a trial balance. In computerised systems the same logic can run simultaneously, but a complete chain is still required."
      ],
      [
        "Sequential entries",
        "Credit sales commonly enter the sales day book, cash sales the cash book, returns their respective returns books, and unusual transactions the general journal. Batch totals flow to nominal accounts and individual invoices to customer/supplier subledgers. Avoid mixing net sales with tax collected for government."
      ],
      [
        "Information systems and security",
        "User permissions, voucher numbers, validation, backup, account reconciliation and change logs help safeguard accuracy. An electronic record can be duplicated, miscoded or entered in the wrong accounting period, so automation never removes responsibility for checks."
      ],
      [
        "Period cut-off",
        "Use invoice, receipt and delivery evidence to decide whether a transaction belongs in the reporting period. A document raised after month end may refer to goods received before month end. Preserve the distinction between the transaction event and when it was entered."
      ]
    ],
    "workings": [
      [
        "Credit sales day-book total",
        "Invoices excluding tax: $1,200, $2,400 and $900, all on credit and no tax.",
        "Sales day-book total $4,500. Dr trade receivables control $4,500 / Cr sales $4,500; post each invoice into the corresponding customer's personal ledger."
      ],
      [
        "Double-count check",
        "Invoice $2,000 entered in the sales day book twice, creating an extra debit receivables and credit sales.",
        "Cancel/reverse one duplicate: Dr sales $2,000 / Cr receivables $2,000. The trial balance would have agreed before correction despite overstated sales."
      ]
    ]
  },
  "FA1:B1": {
    "title": "Double-entry bookkeeping",
    "sections": [
      [
        "Dual aspect and equation",
        "Every recorded transaction affects at least two ledger entries such that total debits equal credits. Assets = equity + liabilities. Debit increases assets and expenses, while credit increases liabilities, revenue and capital. Memorise the underlying classification, not 'debit means money in'."
      ],
      [
        "Examples of account relationships",
        "Cash sale: Dr bank, Cr revenue. Credit purchase of goods: Dr inventory or purchases, Cr trade payables. Supplier settlement: Dr payables, Cr bank. Accrued expense: Dr expense, Cr accrual liability. Owner drawing: Dr drawings, Cr bank."
      ],
      [
        "Reversals and contra accounts",
        "Accumulated depreciation usually carries a credit balance offsetting an asset's cost, not the same as a new liability. A receivables allowance similarly offsets an asset balance. Correct an incorrect posting with an appropriate reversing or reclassification journal, preserving the original trail."
      ],
      [
        "Checks",
        "Sum individual debits and credits before posting a compound journal. Then ask which asset, obligation or income has really changed; a balanced entry to the wrong type of account remains wrong."
      ]
    ],
    "workings": [
      [
        "Compound transaction",
        "Customer pays $1,700 comprising $1,500 invoice settlement and $200 cash sale.",
        "Dr bank $1,700; Cr trade receivables $1,500; Cr sales $200. Debits and credits both $1,700."
      ],
      [
        "Pay supplier",
        "Entity owes supplier $6,000 and settles $4,000.",
        "Dr payables $4,000 / Cr bank $4,000; supplier still owed $2,000."
      ]
    ]
  },
  "FA1:B2": {
    "title": "Journal entries",
    "sections": [
      [
        "Manual journal components",
        "State date, debit and credit account, amount and narration. A journal is a record of the whole transaction rather than a T-account. Distinguish the entry from the later general ledger posting. Equal totals are mandatory."
      ],
      [
        "Opening and adjusting entries",
        "Open with assets debited and liabilities/capital credited. Use journals to record owner capital, depreciation, correction of errors, accruals, prepayments and unusual transfers where required by the level. A reversing entry is usually posted in next period, not immediately after the original when preparing the same period's statements."
      ],
      [
        "Supporting evidence and approval",
        "Every journal requires reason, source evidence and authorisation. A debit to suspense may temporarily correct an imbalance but cannot substitute for finding what happened. When uncertain, write the correct entry and compare it to the one made."
      ],
      [
        "Basic ledger accounts",
        "After journalising, post each debit/credit to relevant account, balance and include in trial balance. Individual subledger entries need cross-references and should reconcile to control totals."
      ]
    ],
    "workings": [
      [
        "Initial balances",
        "Business begins with cash $12,000 and equipment $8,000 funded by loan $5,000 and owner capital $15,000.",
        "Dr bank $12,000; Dr equipment $8,000; Cr loan $5,000; Cr capital $15,000. Total each side $20,000."
      ],
      [
        "Expense paid in advance",
        "Annual insurance $2,400 paid and initially Dr insurance expense. At year end six months remain unused.",
        "Dr prepayment $1,200 / Cr insurance expense $1,200. The future portion becomes asset; current-period insurance expense is $1,200."
      ]
    ]
  },
  "FA1:B3": {
    "title": "Elements of financial statements",
    "sections": [
      [
        "Assets and liabilities",
        "Assets are controlled resources with potential future benefits; examples include cash, receivables, inventory and equipment. Liabilities are present obligations such as suppliers, loans and accrued expenses. Current versus non-current classification reflects the expected operating cycle and maturity."
      ],
      [
        "Income, expenses and capital",
        "Revenue comes from normal sale of goods/services and is distinct from cash collection, loan receipts or owner contributions. Expenses consume economic benefits in earning income. Drawings distribute equity to owners and are not business expenses."
      ],
      [
        "Profit versus statement of financial position",
        "Profit or loss shows performance over a period; statement of financial position shows the entity's assets, liabilities and equity on one date. Net profit usually raises equity, while drawings reduce it. A receivable can be revenue before the customer pays."
      ],
      [
        "Debit/credit patterns",
        "Assets/expenses normally debit, liabilities/equity/revenue normally credit. If an asset is sold for less than carrying amount, a loss arises, not a new payable. Always use the accounting equation as a final control."
      ]
    ],
    "workings": [
      [
        "Determine equity",
        "Assets: equipment $30,000, bank $5,000, stock $8,000. Liabilities: loan $12,000, payables $6,000.",
        "Total assets $43,000, liabilities $18,000, residual equity $25,000."
      ],
      [
        "Profit versus cash",
        "A business performs $3,500 services on credit, and pays $900 rent.",
        "Revenue $3,500, rent expense $900, profit $2,600 before other costs, but bank has fallen by $900 until customer pays."
      ]
    ]
  },
  "FA1:C1": {
    "title": "Banking process",
    "sections": [
      [
        "Bank accounts and transactions",
        "Cash deposits, cheques, standing orders, direct debits, card receipts and bank transfers enter the accounting records according to settlement evidence. Bank statements show the bank's view and may use different debit/credit wording from the business ledger."
      ],
      [
        "Payment controls",
        "Authorise transfer instruction, verify beneficiary bank details, segregate approval from recording, and review transaction reference and amount. A cheque written is not necessarily presented. A direct debit may appear on statement before accounting staff enter it."
      ],
      [
        "Bank reconciliation",
        "Book-side bank charges/interest/direct receipts require ledger updates; timing differences such as unpresented cheques and outstanding lodgements explain statement-versus-ledger differences. A reconciliation must tie both to the same date."
      ],
      [
        "Shortages and overdrawn accounts",
        "A bank overdraft represents funding borrowed and interest may apply. Businesses must plan cash rather than use trial-balance equality as proof that cash exists. Investigate unidentified withdrawals promptly."
      ]
    ],
    "workings": [
      [
        "Banked sales",
        "Cash takings $1,600, of which $100 is kept in cash till and $1,500 deposited.",
        "Dr bank $1,500 / Cr cash on hand $1,500 when moving funds, assuming cash sale itself was separately recorded. Do not record the same $1,500 as sales again."
      ],
      [
        "Unpresented cheque",
        "Book bank balance $5,000 debit, outstanding cheque $800, outstanding lodgement $1,200, with no other items.",
        "Expected statement balance=5,000+800−1,200=$4,600."
      ]
    ]
  },
  "FA1:C2": {
    "title": "Banking documentation",
    "sections": [
      [
        "Document function",
        "Deposit slips, paying-in books, cheque counterfoils, bank statements and transfer confirmations provide transaction evidence. A remittance advice states what a payment relates to but is not always itself proof of the funds clearing."
      ],
      [
        "Verification fields",
        "Check date, account, reference, payer/payee identity, authorised signatories, amount in words/figures for cheques and clearing status. In card settlements, gross takings, processor fees and actual net bank settlement can differ."
      ],
      [
        "Recording receipt and payment",
        "When a customer settles a receivable, debit bank and credit customer receivables; when supplier is paid, debit payables and credit bank. Record bank interest income and charges to appropriate accounts. Never use a supplier statement as sole proof that payment cleared."
      ],
      [
        "Document exceptions",
        "A dishonoured cheque should restore the customer debt and reduce recorded bank. Missing deposit slips and unverified beneficiary changes need investigation. Match bank statement to internal cash book independently."
      ]
    ],
    "workings": [
      [
        "Payment with fees",
        "Card customer pays $1,000 sale; processor retains $20 and remits $980. Assume sale is recorded when made.",
        "Dr bank $980; Dr card processing expense $20; Cr card clearing receivable $1,000 if previously established. Revenue is $1,000, not $980."
      ],
      [
        "Dishonoured cheque",
        "Customer cheque $600 was previously credited against debt but is returned unpaid.",
        "Dr receivables $600 / Cr bank $600; any bank fee is a separate expense."
      ]
    ]
  },
  "FA1:D1": {
    "title": "Payroll transactions",
    "sections": [
      [
        "Gross and net wages",
        "Gross earnings include base pay, eligible overtime, commission and bonus. Employee deductions such as tax or employee social contributions reduce net pay but are part of gross wages expense, not additional employer expense. Net pay = gross pay − authorised deductions."
      ],
      [
        "Source records and controls",
        "Time sheets and employee records establish authorised hours, salary, rate and bank instructions. Protect payroll data, validate new starters/leavers and segregate preparation, approval and release of bank payments. Reconcile payroll register to ledger and bank."
      ],
      [
        "Payroll entries",
        "Dr wages expense for gross payroll, Cr employee deductions payable for deductions and Cr bank or net wages payable for employees' net amount. Employer contributions are separate additional costs and liabilities when applicable. Do not calculate statutory deductions without supplied applicable rates."
      ],
      [
        "Cost allocation",
        "Direct production labour may transfer to WIP; indirect production payroll belongs in overhead while office payroll is administration expense. The financial payroll ledger and cost allocations must reconcile."
      ]
    ],
    "workings": [
      [
        "Wages and deductions",
        "Base pay $3,000, overtime $450, employee deductions $520, employer charge $350.",
        "Gross wages $3,450; net employee pay $2,930. Dr wages expense $3,450 and Dr employer charge expense $350; Cr bank/net pay $2,930, Cr employee deduction payable $520, Cr employer charge payable $350."
      ],
      [
        "Payroll split",
        "Gross factory payroll $15,000: direct production $11,000, supervisor $4,000.",
        "Assign $11,000 direct labour to WIP and $4,000 indirect labour to manufacturing overhead through cost allocation, without duplicating the original payroll cost."
      ]
    ]
  },
  "FA1:E1": {
    "title": "Prepare general ledger accounts",
    "sections": [
      [
        "Posting from transactions",
        "Nominal ledger captures assets, liabilities, capital, income and expenses. Post dates, account names and debit/credit values from day-book totals or journals and keep references. Do not post sales day-book totals directly into bank when sales are on credit."
      ],
      [
        "Balance accounts",
        "Add debit and credit sides, put closing balance c/d on the smaller side so both totals equal, then bring it down on the opposite side at start of next period. An asset bank debit balance becomes a credit c/d entry at year end solely for balancing the account."
      ],
      [
        "Trial balance preparation",
        "After balancing nominal accounts, extract closing debit and credit balances. Revenue usually credit, expense debit, liability credit, assets debit. An agreed trial balance is not proof of no omission."
      ],
      [
        "Control account reconciliation",
        "Receivables/payables control accounts should agree with subsidiary customer/supplier balances after correcting reconciling items. Investigate differences rather than force one side."
      ]
    ],
    "workings": [
      [
        "Receivables T account",
        "Opening receivables Dr $8,000, credit sales Dr $14,000, receipts Cr $11,000, sales returns Cr $1,000.",
        "Closing receivables debit=8,000+14,000−11,000−1,000=$10,000."
      ],
      [
        "Loan account",
        "Opening loan Cr $20,000, new borrowing Cr $5,000, capital repayment Dr $4,000.",
        "Closing loan Cr $21,000. Loan interest, if charged, is recorded separately."
      ]
    ]
  },
  "FA1:F1": {
    "title": "Maintain cash records",
    "sections": [
      [
        "Cash receipt and payment books",
        "Record each cash receipt with date, source, reason and amount; payments need authorisation and supporting vouchers. The cash book may contain separate columns for cash on hand and bank. Transfer cash from till to bank without recording another sale."
      ],
      [
        "Cash controls",
        "Reconcile the physical till to recorded cash, segregate cash handling and ledger review, use numbered receipts and secure regular banking. Differences need investigation. Cash 'over' and 'short' may arise from counting or posting mistakes and should not be treated as revenue automatically."
      ],
      [
        "Cash discounts and bank transactions",
        "Where a settlement discount applies, identify the amount waived separately from the cash received and debt extinguished. Bank fees and direct debits are recorded according to statement evidence. Cash records support bank reconciliation."
      ],
      [
        "Periodic cash summary",
        "Opening cash + cash received − cash paid = closing cash held. Make a cash count at the reporting date and reconcile any in-transit deposits with bank and till records."
      ]
    ],
    "workings": [
      [
        "Till reconciliation",
        "Opening till $200, cash takings $1,450, expenses paid from till $120, cash banked $1,300.",
        "Expected closing till=200+1,450−120−1,300=$230. Physical count should agree or a difference must be investigated."
      ],
      [
        "Cash receipt discount",
        "Customer owes $2,000 and pays $1,960 to settle in full under permitted settlement discount $40.",
        "Dr bank $1,960; Dr settlement discount allowed $40; Cr receivables $2,000, subject to correct revenue/discount policy."
      ]
    ]
  },
  "FA1:F2": {
    "title": "Maintain petty cash record",
    "sections": [
      [
        "Petty cash purpose",
        "Petty cash handles modest authorised expenses without relying on frequent main-bank payments. An imprest float is held at a fixed authorised amount; replenishment equals approved payments so balance returns to float. A voucher documents date, supplier, reason, approval and amount."
      ],
      [
        "Analysed petty cash book",
        "Enter each voucher under appropriate expense column, such as travel, postage or stationery. At period end total analysed columns and agree their sum to paid vouchers; do not record all transactions as one vague general expense."
      ],
      [
        "Reimbursement and controls",
        "Replenish petty cash by cash or bank transfer against vouchers. Cash on hand + vouchers should equal the float before reimbursement, ignoring approved adjustments. Physical counts and segregation reduce risk."
      ],
      [
        "Shortages and irregularities",
        "A shortage cannot be corrected by fabricating stationery expense. Check vouchers, arithmetic and cash count, then authorise a documented shortage entry if required by policy."
      ]
    ],
    "workings": [
      [
        "Imprest reimbursement",
        "Float $500; stationery $70, postage $45, travel $65, sundries $20. No shortage.",
        "Vouchers total $200; cash left $300. Replenish $200 to restore $500. Expense coding: Dr stationery 70, postage 45, travel 65, sundries 20; Cr bank/cash reimbursement 200."
      ],
      [
        "Shortage",
        "Float $250; approved vouchers $120; cash counted $125.",
        "Expected cash $130, actual $125, shortage $5. Investigate; do not reimburse $125 as if vouchers were all authorised."
      ]
    ]
  }
};})(window);
