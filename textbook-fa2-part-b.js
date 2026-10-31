/* Original LedgerPeer textbook chapters: FA2 cash, stock, adjustments, finance and reconciliations. */
(function(root){'use strict';root.LedgerTextbookFA2B={
  "FA2:D2": {
    "title": "Cash and bank accounting",
    "sections": [
      [
        "The cash book as a ledger",
        "The cash book records receipts and payments from cash at bank and on hand; in a double-entry system it can serve as the bank ledger itself. Distinguish customer receipts (Dr bank / Cr receivables), supplier payments (Dr payables / Cr bank), and drawings or capital transfers. Cash and bank balances should be reconciled to supporting evidence regularly."
      ],
      [
        "Petty cash imprest",
        "Under an imprest system, petty cash is restored to a fixed float after authorised vouchers are collected. The reimbursements equal the value of authorised expenditure and make the cash on hand return to the original float. Record individual expense classifications rather than writing one ambiguous 'petty cash cost' account. A shortage is an exception to investigate."
      ],
      [
        "Bank statement versus cash book",
        "A bank statement is prepared from the bank's perspective: a credit on the statement increases a customer's bank balance, but in the entity's ledger bank is a debit-balance asset. Unpresented cheques and deposits in transit explain timing differences; bank fees, interest, direct debits and dishonoured receipts need book-side entries."
      ],
      [
        "Overdraft and bank charges",
        "A bank overdraft normally shows a credit bank ledger balance or a current liability, depending on the accounting system and reporting rules. Interest and charges are expenses, not reductions to sales revenue. Check the precise statement date and whether funds have actually cleared; 'payment issued' is not necessarily 'bank statement cleared'."
      ],
      [
        "Cash and bank control",
        "Separate authorisation, custody and reconciliation wherever possible. Investigate stale unpresented cheques, outstanding deposits and unknown transfers. Cash shortages, incorrect postings, duplicate deposits and bank errors must be identified rather than treated as arbitrary balancing entries."
      ]
    ],
    "workings": [
      [
        "Three-column cash book",
        "Opening bank debit $6,000. Receipts: customer $2,000, owner capital $3,000. Payments: supplier $4,500 and bank charges $120.",
        "Bank ending balance =6,000+2,000+3,000−4,500−120=$6,380 debit. Journal charges Dr bank charges expense $120 / Cr bank $120. Customer receipt reduces receivable."
      ],
      [
        "Imprest analysis",
        "Petty cash float $300. Vouchers: stationery $74, local travel $52, cleaning $39. Cash counted $135.",
        "Vouchers total $165; 300−165=$135, which agrees with count. Reimburse $165 to restore float $300. If counted cash were $132, $3 shortage would require investigation."
      ]
    ]
  },
  "FA2:D3": {
    "title": "Inventory, cost of sales and valuation",
    "sections": [
      [
        "What is inventory and its cost?",
        "Inventory includes goods held for resale, materials and supplies, work in progress and finished goods in a manufacturing business. Under IAS 2, cost includes purchase cost net of trade discounts plus directly attributable transport/handling and costs of conversion. Abnormal waste and most selling or general administration costs do not belong in inventory cost."
      ],
      [
        "Lower of cost and NRV",
        "Inventory is measured at lower of cost and net realisable value (NRV) at the relevant item or appropriate grouping level. NRV equals estimated selling price less costs necessary to complete and sell. A write-down to NRV reduces inventory and generally increases expense. Later reversals are limited by what the inventory would have been measured at without the previous write-down."
      ],
      [
        "FIFO and periodic weighted average",
        "FIFO assumes the oldest costs flow into cost of sales first, leaving more recent costs in closing inventory. Periodic weighted average divides total opening-and-purchase cost by total units available in the period. LIFO is not permitted under IAS 2; do not substitute physical storage assumptions for the required accounting cost formula."
      ],
      [
        "Perpetual weighted average",
        "Under a moving-average method, each new purchase changes average unit cost for units then in stock; an issue uses the average at the time of issue. A period-end average cannot simply be applied retrospectively to earlier issues when the question specifies perpetual AVCO. A returns transaction requires appropriate treatment of unit cost and stock records."
      ],
      [
        "Gross profit and manufacturing records",
        "In a periodic trading account, cost of sales = opening stock + net purchases + carriage inwards − closing stock. Manufacturing entities also transfer finished production cost from work in progress to finished goods. Physical count discrepancies, damaged or obsolete items, consignment stock and goods in transit require judgment about ownership and recoverability."
      ]
    ],
    "workings": [
      [
        "FIFO trading issues",
        "Opening 100 units @$4; purchase 200 @$5; sell 180 units; purchase 100 @$6; sell 70 more units.",
        "First sale FIFO cost=100×4+80×5=$800. Stock then 120 @5. Second sale cost=70×5=$350. Closing stock 50 @5 and 100 @6 =$850. Available cost 400+1,000+600=$2,000; cost of sales 800+350=$1,150; reconcile 1,150+850=2,000."
      ],
      [
        "Periodic AVCO same purchases",
        "Opening 100 @$4, purchase 200 @$5, purchase 100 @$6; total issues 250 units in the period.",
        "Total available 400 units with cost $2,000. Average $5/unit. Periodic cost of issues=250×5=$1,250; closing inventory 150×5=$750. This differs from FIFO because cost assumptions differ."
      ],
      [
        "Lower of cost/NRV",
        "Inventory item A cost $3,600, expected selling price $3,900 and cost to sell $500. Item B cost $1,800, NRV $2,100.",
        "A NRV=3,900−500=$3,400, therefore write down $200. B remains $1,800. Closing total $5,200 (3,400+1,800), not $5,700."
      ]
    ]
  },
  "FA2:D4": {
    "title": "Tangible non-current assets, depreciation and disposal",
    "sections": [
      [
        "Initial recognition and cost",
        "A tangible non-current asset is used in operations across more than one period. Its initial cost includes purchase price, delivery, installation and directly attributable costs to make it ready for use; ordinary maintenance and general staff training are normally expenses. Distinguish asset used by the business from identical goods held for resale."
      ],
      [
        "Straight-line and reducing balance",
        "Straight line annual depreciation=(cost−residual value)/estimated useful life. Reducing balance applies a percentage to the opening carrying amount; different amounts result over the asset's life. When acquiring or selling partway through a period, use the question's monthly or other time-apportionment policy. Depreciation is a systematic allocation rather than an estimate of market value."
      ],
      [
        "Ledgers and asset register",
        "For depreciation Dr depreciation expense, Cr accumulated depreciation, leaving gross asset cost identifiable. The non-current asset register tracks asset ID, location, gross cost, acquisition date, disposal date, useful life, residual value, accumulated depreciation and carrying amount; reconcile register totals to general ledger balances. Omitted disposals or depreciation miscalculations cause reconciliation differences."
      ],
      [
        "Disposals and part exchange",
        "Calculate carrying amount at date of disposal = original cost−accumulated depreciation, including any disposal-year charge. Profit/loss on disposal = proceeds−carrying amount. Transfer both cost and depreciation to a disposal account, record the proceeds and close the difference to profit or loss. A trade-in allowance counts as consideration for old asset; the new asset is recognised at its appropriate cost."
      ],
      [
        "Capital versus revenue errors",
        "Replacing a damaged component with routine equivalent servicing may be an expense, while a qualifying upgrade improving future benefits may be capital expenditure. Misclassifying repair as asset overstates assets and profit before depreciation; misclassifying a valid upgrade as expense has the reverse effect. Always consider corrections of related depreciation."
      ]
    ],
    "workings": [
      [
        "Depreciation with part-year timing",
        "Machine cost $45,000, residual $5,000, life 5 years; bought 1 April, year end 31 December and monthly depreciation policy.",
        "Full-year straight line=(45,000−5,000)/5=$8,000. Nine-month charge=8,000×9/12=$6,000. Carrying amount $39,000 at 31 December."
      ],
      [
        "Disposal ledger and proceeds",
        "Equipment cost $80,000, accumulated depreciation $55,000 at disposal, proceeds $29,000.",
        "Use the gross-cost disposal account consistently: (1) transfer asset cost Dr disposal $80,000 / Cr PPE cost $80,000; (2) transfer accumulated depreciation Dr accumulated depreciation $55,000 / Cr disposal $55,000; (3) record proceeds Dr bank $29,000 / Cr disposal $29,000. Disposal account debits $80,000; credits $55,000+$29,000=$84,000; credit excess is a $4,000 GAIN. Close with Dr disposal $4,000 / Cr gain on disposal (profit or loss) $4,000. The asset cost and its accumulated depreciation are now both removed, and there is no duplicated credit to PPE."
      ],
      [
        "Part exchange",
        "Old asset cost $30,000 accumulated dep $22,000. Supplier offers trade-in $10,000 towards new machine $42,000.",
        "Old carrying value $8,000; disposal gain $2,000. New asset is $42,000; remaining cash/payable $32,000. Do not record new asset only at $32,000."
      ]
    ]
  },
  "FA2:D5": {
    "title": "Accruals, prepayments and income adjustments",
    "sections": [
      [
        "Accounting periods and recognition",
        "Income belongs to the period services or goods are provided; expense belongs to the period resources are consumed. The cash date is merely evidence of settlement. Accruals and deferrals are year-end adjustments to meet period boundaries. Start by identifying what amount has already been recorded, then calculate the required closing asset or liability."
      ],
      [
        "Accrued versus prepaid expense",
        "Expense accrued: incurred this period but unpaid, so Dr expense / Cr accrual. Expense prepaid: paid now for later periods, so Dr prepayment asset / Cr expense if initially expensed. Closing accrued or prepaid balances appear in the statement of financial position and are reversed or consumed in the next period."
      ],
      [
        "Accrued versus deferred income",
        "Accrued income has been earned but not yet collected; Dr accrued income receivable, Cr income. Deferred income means cash is received before earning it; Dr income, Cr deferred income liability if the receipt was initially credited to income. The nature of underlying obligation determines when revenue is earned."
      ],
      [
        "Opening balances and adjustments",
        "A paid cash amount is not always the entire period expense. If opening accrual exists and final cash settlement includes last year's bill, remove prior-year cost from this year. T-account work is often safer: opening accrual, cash paid, closing accrual yield period expense. For prepayments, period expense = cash paid + opening prepayment − closing prepayment (assuming no other complexities)."
      ],
      [
        "Exam traps",
        "Do not reverse the sign of a closing accrual or mistake advance receipts for income. Use dates carefully: a year-end on 31 December includes only the months consumed through that date. Noncash year-end journals can change profit without affecting bank. Some exam questions present figures as totals before adjustment; do not post the same accrual twice."
      ]
    ],
    "workings": [
      [
        "Opening/closing accruals",
        "Opening electricity accrual $900; cash paid during year $11,200; required closing accrual $1,300.",
        "Electricity expense= cash paid + closing accrual − opening accrual =11,200+1,300−900=$11,600. The opening accrual related to last year, while the closing accrual belongs to this year."
      ],
      [
        "Opening/closing prepayments",
        "Opening prepaid rent $2,400; cash paid this year $14,000; closing prepaid rent $3,000.",
        "Current-year rent expense = cash paid + opening prepaid − closing prepaid =14,000+2,400−3,000=$13,400. Closing prepayment remains an asset."
      ],
      [
        "Accrued income",
        "Consultancy fee earned $4,500 before year end but invoiced in January next year.",
        "Dr accrued income receivable $4,500; Cr fee income $4,500 at year end. When the $4,500 fee is invoiced in January, reclassify Dr trade receivables $4,500 / Cr accrued income receivable $4,500 without recognising revenue twice. When the customer subsequently pays, record Dr bank $4,500 / Cr trade receivables $4,500."
      ]
    ]
  },
  "FA2:D6": {
    "title": "Receivables, payables, allowances and provisions",
    "sections": [
      [
        "Trading balances and reconciliations",
        "Trade receivables arise from credit sales and trade payables from credit purchases; other receivables/payables have different sources. Customer and supplier personal accounts should agree with control totals after corrections. A contra can set off balances owed between the same counterparties when permitted: Dr payable / Cr receivable; this changes neither revenue nor profit."
      ],
      [
        "Write-off versus allowance",
        "An irrecoverable debt write-off removes a specific invoice from gross trade receivables and charges an expense, subject to previously recorded write-offs and allowance treatment. An allowance is an estimate of further expected losses on remaining debtors; determine the closing allowance required, then recognise only the change from the opening credit balance. Do not charge the entire closing allowance again if an opening allowance already exists."
      ],
      [
        "Allowance base and presentation",
        "First remove specifically written-off balances; apply the required percentage or ageing rates to debts still outstanding. Credit the allowance for increases and debit it for reductions. Net receivables = gross outstanding receivables−closing allowance. A receivable write-off can reduce both profit and asset values; movement in allowance may partly offset an earlier estimation."
      ],
      [
        "Provisions versus accruals",
        "A provision is a present obligation from a past event with uncertainty of timing/amount, generally recognised when outflow is probable and measurable reliably. Ordinary payables are known debts; accruals reflect goods/services received but not yet invoiced. Future operating losses or intentions alone do not create a provision. Consider whether amount, due date and probability are supportable."
      ],
      [
        "Entries and financial statements",
        "Increase allowance: Dr irrecoverable debt expense / Cr allowance for receivables. Decrease allowance: Dr allowance / Cr expense credit. Recognise provision: Dr related expense / Cr provision liability. Settle provision: Dr provision / Cr bank, with further adjustment for differences. Separate trade receivables, other receivables, payables and current/non-current provisions as applicable."
      ]
    ],
    "workings": [
      [
        "Combined debt expense",
        "Trade receivables before adjustment $56,000, irrecoverable debt $3,000, opening allowance $1,500; new allowance requirement 4% of remaining receivables.",
        "Write-off $3,000; surviving gross $53,000. Closing allowance $2,120. Increase $620 (2,120−1,500). Profit-or-loss debt charge $3,620 if written-off debt not already charged. Net closing receivables $50,880."
      ],
      [
        "Recovering an old write-off",
        "Customer previously written off $700 unexpectedly pays $300.",
        "Dr bank $300; Cr irrecoverable-debt-recovered income (or reduce debt expense) $300. Do not credit trade receivables unless the customer's gross balance had first been properly reinstated."
      ],
      [
        "Provision example",
        "Business sold 400 items with an existing warranty obligation; expected repair $20 for 10% of units, and $100 for 2% of units, under given mutually exclusive expected outcomes.",
        "Expected warranty provision=400×(0.10×20 +0.02×100)=400×$4=$1,600, assuming other 88% have zero cost. Dr warranty expense $1,600 / Cr provision $1,600."
      ]
    ]
  },
  "FA2:D7": {
    "title": "Capital, borrowings and finance costs",
    "sections": [
      [
        "Sources of financing and equity",
        "Owner contributions increase equity and bank; drawings reduce both. Loans create liabilities and cash assets when received, not revenue. Borrowing costs (interest) are expenses or subject to relevant capitalisation rules when applicable to the specific asset and exam scope; repayment of principal reduces the liability, not profit."
      ],
      [
        "Interest calculations",
        "Simple interest = principal × annual interest rate × appropriate fraction of year. For fixed outstanding principal, accrue unpaid interest at year end even if bank pays it later. Interest already paid plus closing accrual less opening accrual gives period expense under a simple accrual model. If rates or principal change, split the period."
      ],
      [
        "Current and non-current split",
        "Classify borrowing portions according to when the obligations fall due and the entity's right to defer settlement under the applicable reporting framework. A single loan may have a current liability equal to repayments due within the next reporting period and a non-current remainder. Loan interest payable separately is normally a current accrual."
      ],
      [
        "Statement effects and disclosures",
        "An interest charge reduces profit/equity and creates a payable until settled; taking out a loan raises both assets and liabilities, leaving equity unchanged. Drawings are owner transactions, not expenses. Distinguish cash interest payments from the capital repayment in budget and statements."
      ]
    ],
    "workings": [
      [
        "Accrued loan interest",
        "A loan of $100,000 at 9% simple annual interest was outstanding from 1 July to 31 December, with interest unpaid at year end.",
        "Six-month interest=100,000×0.09×6/12=$4,500. Dr interest expense $4,500 / Cr interest payable $4,500. The loan principal remains $100,000."
      ],
      [
        "Split current/non-current loan",
        "Loan balance 31 December $70,000, with principal repayments $15,000 due next year and remaining $55,000 due later.",
        "Current portion $15,000; non-current $55,000, subject to reporting rights and actual terms. Any accrued interest is recorded separately from the principal."
      ]
    ]
  },
  "FA2:E1": {
    "title": "Bank reconciliation",
    "sections": [
      [
        "Purpose and evidence",
        "A bank reconciliation explains why the entity's adjusted bank ledger and bank statement differ at the same date. Timing items include deposits not yet credited, unpresented cheques and some bank transfers. Book-side errors or omissions require correcting journals; a bank error generally stays as reconciliation adjustment pending bank correction."
      ],
      [
        "Update cash book first",
        "Identify bank charges, standing orders, direct debits, interest, receipts paid directly by customers and dishonoured cheques absent from the entity records. Post them to the cash book: for fee Dr bank charges / Cr bank; for direct customer receipt Dr bank / Cr receivables. Reverse a dishonoured receipt Dr receivables / Cr bank (before any related fee)."
      ],
      [
        "Reconciliation sign convention",
        "From adjusted cash-book debit balance, add unpresented cheques and subtract outstanding deposits to arrive at bank statement balance. Or from statement balance, add outstanding deposits and subtract unpresented cheques to arrive at adjusted cash book balance. Ensure all amounts refer to same date; a negative bank balance changes intuitive signs if you are careless."
      ],
      [
        "Common errors and controls",
        "A cheque for $540 entered as $450 requires $90 additional bank credit and the appropriate counterpart. A duplicate receipt must be reversed. Missing or altered bank statements require independent verification. Outstanding items that remain for months can indicate posting errors or misuse; investigate rather than recycle them indefinitely."
      ]
    ],
    "workings": [
      [
        "Full reconciliation",
        "Cash book debit $18,500; unrecorded bank charge $250; direct debit insurance $600; customer paid bank directly $1,400. Unpresented cheques $2,100; outstanding lodgements $3,000.",
        "Adjusted cash book =18,500−250−600+1,400=$19,050 debit. Statement balance =adjusted book + unpresented 2,100−outstanding deposits 3,000 =$18,150 debit. Cross-check from statement:18,150+3,000−2,100=19,050."
      ],
      [
        "Dishonoured cheque",
        "Customer cheque $800 previously entered as receipt is dishonoured by bank.",
        "Dr trade receivables $800; Cr bank $800 to undo receipt. If a fee is charged, post it separately. The customer still owes $800."
      ]
    ]
  },
  "FA2:E2": {
    "title": "Payables account reconciliation",
    "sections": [
      [
        "Supplier accounts and control",
        "A supplier statement lists supplier invoices, credit notes and payments as recognised by that supplier. The entity's individual supplier account records its own evidence. Differences may arise from timing, missing credit notes, invoice errors, payments not yet received or duplicate postings. A reconciliation is not simply choosing whichever balance is smaller."
      ],
      [
        "Document matching",
        "Match statement item by item to supplier ledger using invoice number, credit note, date, quantity and amount. Mark which items are missing from which side. Unpresented payments sent before statement date can appear in the entity ledger but not on the supplier statement. Use purchase orders/GRNs to establish whether invoice is genuine."
      ],
      [
        "Accounting adjustments",
        "An omitted invoice for genuine goods is Dr purchases/inventory and Cr payables. An omitted supplier credit note reduces payables and returns or purchase cost. A payment wrongly posted to another supplier needs reclassification. Do not adjust general ledger solely for timing on the supplier's side."
      ],
      [
        "Control account implications",
        "Once individual supplier accounts are reconciled, compare their aggregate balances with the payables control account. A control account can have missing postings even when one supplier account appears accurate. Investigate unusual debit balances separately; they may be advances, overpayments or returns."
      ]
    ],
    "workings": [
      [
        "Supplier statement reconciliation",
        "Company ledger shows payable $7,200. Supplier statement shows $9,000. Company paid $1,500 before month end but supplier recorded it next month; company also omitted invoice $300.",
        "Correct ledger payable =7,200+300=$7,500. Supplier statement adjusted for payment in transit=9,000−1,500=$7,500. Difference explained; post omitted invoice $300, not payment a second time."
      ],
      [
        "Credit note missing",
        "Supplier's statement includes a $450 return credit note but company payable account omitted it.",
        "Record Dr payables $450 / Cr purchase returns or inventory $450; the payable falls. Check any associated input-tax adjustment where applicable."
      ]
    ]
  }
};})(window);
