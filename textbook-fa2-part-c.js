/* Original LedgerPeer textbook chapters: FA2 errors, statements and partnerships. */
(function(root){'use strict';root.LedgerTextbookFA2C={
  "FA2:F1": {
    "title": "Preparing the trial balance",
    "sections": [
      [
        "Extracting balances",
        "A trial balance lists debit and credit balances of the nominal ledger at a specified date. Assets and expenses normally debit; liabilities, revenue and equity normally credit. Include all accounts with non-zero balances, including bank overdrafts, drawings, accumulated depreciation, allowances and suspense if present. Separate trial balance from financial statements: many period-end adjustments still remain to be posted."
      ],
      [
        "Balancing T-accounts",
        "Total each side, carry down the difference on the shorter side and bring it forward on the other side in the new period. A bank account with $40,000 debits and $29,000 credits carries an $11,000 debit balance. For liabilities it is common to have a credit brought forward, but recheck if a supplier is overpaid."
      ],
      [
        "What agreement does and doesn't prove",
        "Equality of debit and credit columns confirms arithmetic of account balances and double-entry posting totals. It does not detect missing transactions, complete reversals, wrong accounts, equal incorrect amounts, compensating errors or errors of principle that affect both sides correctly. Financial statements can be materially wrong with a perfectly balanced trial balance."
      ],
      [
        "Unadjusted and adjusted trial balances",
        "Record corrections, accrued expenses, prepayments, depreciation, inventory adjustments and allowances, then compile the adjusted trial balance. The period-end profit/loss statement uses income and expense balances; the statement of financial position uses assets, liabilities and equity. Preserve a working trail from the original TB to each adjusted figure."
      ]
    ],
    "workings": [
      [
        "Mini trial balance",
        "Ledger balances: bank Dr $12,000; receivables Dr $8,000; inventory Dr $6,000; equipment Dr $30,000; expenses Dr $15,000; payables Cr $9,000; loan Cr $20,000; capital Cr $30,000; revenue Cr $12,000.",
        "Debit total=12,000+8,000+6,000+30,000+15,000=$71,000. Credit total=9,000+20,000+30,000+12,000=$71,000. Equal totals mean arithmetic agreement, not comprehensive accuracy."
      ],
      [
        "Missing accrual in TB",
        "The balanced trial balance excludes $900 unpaid electricity for the period.",
        "Dr electricity expense $900 / Cr accrual liability $900. Both trial balance columns rise $900, remain equal, while profit falls $900 and liabilities rise $900."
      ]
    ]
  },
  "FA2:F2": {
    "title": "Correction of accounting errors",
    "sections": [
      [
        "Errors detected by unequal trial balance",
        "Single-sided entries, posting to the wrong side, arithmetic summation mistakes and unequal debits/credits may cause trial balance differences. Use the difference as a clue, not as an arbitrary adjustment. A difference divisible by 9 suggests transposition may be worth checking, but is not proof. A difference doubled can suggest a side reversal."
      ],
      [
        "Errors not detected by the trial balance",
        "Errors of complete omission, commission (wrong personal account), principle (asset treated as expense), original entry at equally wrong amounts, complete reversal and equal compensating errors may preserve agreement. The type of error determines which correcting entry is required and whether profit or net assets are misstated."
      ],
      [
        "Suspense accounts",
        "A suspense account may temporarily equalise an unexplained debit/credit imbalance while investigation continues. Post corrections against suspense for one-sided posting errors; fully balanced reclassifications generally do not use suspense. A remaining suspense balance is not a legitimate permanent substitute for investigation."
      ],
      [
        "Impact on profit and financial position",
        "If an expense was overstated, profit was understated; reducing that expense increases profit. A customer payment posted to wrong customer leaves total receivables unchanged but individual balances wrong. A purchase of machinery debited to repairs reduces profit and understates assets, plus any omitted depreciation needs accounting."
      ],
      [
        "Correcting journal narration",
        "Write 'what should have happened', 'what actually happened', then the minimum journal needed to bridge the two. State both debit and credit accounts and amounts, and whether the error happened this period or a prior period. Prior-period error treatment can differ under advanced standards and examination scope."
      ]
    ],
    "workings": [
      [
        "One-sided posting and suspense",
        "Cash received $1,200 from customer was correctly Dr bank $1,200 but Cr receivables only $120. Trial balance credit short $1,080.",
        "Correct Dr suspense $1,080 / Cr receivables $1,080 if suspense has a credit-side balancing entry from the original TB difference; this clears the suspense amount and fixes receivables. Check original suspense balance before posting."
      ],
      [
        "Asset wrongly expensed",
        "Machinery $5,000 was debited to repairs, correctly credited to bank. The asset should depreciate $500 this year.",
        "Dr machinery $5,000 / Cr repairs $5,000; Dr depreciation expense $500 / Cr accumulated depreciation $500. Profit increases $4,500 overall; non-current net assets rise $4,500."
      ],
      [
        "Full reversal",
        "Credit sale $2,000 incorrectly Dr revenue / Cr receivables $2,000 instead of Dr receivables / Cr revenue.",
        "Correct by Dr receivables $4,000 / Cr revenue $4,000, reversing the wrong entry and recording the right one. Double-entry still agreed before correction."
      ]
    ]
  },
  "FA2:G1": {
    "title": "Preparation of financial statements and incomplete records",
    "sections": [
      [
        "From trial balance to statements",
        "Begin with ledger balances, adjust all period-end items and present statement of profit or loss and statement of financial position. A trader's net sales = sales less sales returns; cost of sales = opening inventory + net purchases + carriage inwards − closing inventory. Gross profit = net sales−cost of sales; deduct expenses and add appropriate other income to find profit."
      ],
      [
        "Statement of financial position",
        "Classify cash, receivables (net of allowance), inventory and prepayments as current assets where relevant; recognise equipment at net carrying amount and include current/non-current loan portions. Trade payables, accrued expenses and deferred income are liabilities. Equity = opening capital + further contributions + profit − drawings, subject to the type of entity."
      ],
      [
        "Margins and mark-ups to reconstruct amounts",
        "Gross profit margin = gross profit/sales ×100%; mark-up = gross profit/cost of sales ×100%. For a 25% mark-up, sales = cost ×1.25; for 25% margin, cost = sales×0.75. Distinguish the denominator before calculating missing sales, purchases or gross profit from incomplete records."
      ],
      [
        "Control accounts to reconstruct credit transactions",
        "Receivables control: opening receivables + credit sales − customer receipts − sales returns − irrecoverable debts − discounts/contra = closing receivables, adjusted for other stated items. Payables control: opening payables + credit purchases − supplier payments − purchase returns − discounts/contra = closing payables. Use the correct direction and note that cash sales/purchases bypass those credit controls."
      ],
      [
        "Profit from net assets",
        "For sole traders with incomplete income records, profit = closing net assets − opening net assets + drawings − additional capital introduced (assuming no other adjustments). Drawings reduce equity without being business expenses; fresh owner capital raises equity without being income. This is a fallback cross-check, not permission to ignore cash and inventory records."
      ],
      [
        "Exam workflow",
        "Prepare numbered workings: inventory and cost of sales; allowance; depreciation and disposal; accrual/prepayment; loan classification; other items; profit or loss; statement of financial position. Finally verify assets = liabilities + equity. If statements do not balance, investigate journals instead of adding unexplained 'balancing figures'."
      ]
    ],
    "workings": [
      [
        "Prepare statement of profit or loss",
        "Sales $120,000; sales returns $4,000; opening inventory $15,000; purchases $66,000; purchase returns $3,000; closing inventory $18,000; administrative expenses $17,000; depreciation $4,000; interest $2,000.",
        "Net sales 120,000−4,000=$116,000. Net purchases 66,000−3,000=$63,000. Cost of sales 15,000+63,000−18,000=$60,000. Gross profit $56,000. Expenses 17,000+4,000+2,000=$23,000. Profit for year $33,000."
      ],
      [
        "Reconstruct credit sales",
        "Opening receivables $18,000; closing $25,000; collections $90,000; returns inwards $2,000; debts written off $1,000; no other control items.",
        "Credit sales = closing receivables−opening receivables+collections+returns+write-offs =25,000−18,000+90,000+2,000+1,000=$100,000."
      ],
      [
        "Reconstruct credit purchases",
        "Opening trade payables $14,000; closing $19,000; payments to suppliers $80,000; purchase returns $3,000; no other items.",
        "Credit purchases = closing payables−opening payables+payments+returns =19,000−14,000+80,000+3,000=$88,000."
      ],
      [
        "Net assets profit",
        "Opening net assets $55,000; closing net assets $71,000; drawings $12,000; further owner capital introduced $6,000.",
        "Profit = 71,000−55,000+12,000−6,000=$22,000. Do not treat drawings as expense or contributions as sales."
      ]
    ]
  },
  "FA2:H1": {
    "title": "Partnership agreements and profit-sharing rules",
    "sections": [
      [
        "Nature of partnership",
        "A partnership brings together co-owners of a business subject to local governing law and the partnership agreement. Financial records distinguish each partner's capital, current account, drawings, salary allocation, interest on capital and share of residual profit. A partner 'salary' in appropriation is not automatically wages of an employee under the paper's partnership profit-sharing model."
      ],
      [
        "Key clauses of the agreement",
        "Specify profit and loss sharing ratio, capital balances, interest on capital or drawings, salaries/commission to partners, admission/retirement provisions and treatment of goodwill. In exam questions, the agreement determines appropriation. If no agreement applies, any statutory default rules depend on the jurisdiction; follow stated exam assumptions."
      ],
      [
        "Profit versus appropriation",
        "First calculate the partnership's operating profit after normal business expenses. Then make the appropriation of that profit among partners using agreed salary allowances, interest on capital, interest on drawings and remaining profit sharing. Appropriation redistributes profit, not create it."
      ],
      [
        "Capital and current accounts",
        "Under fixed capital accounts, long-term investments remain in each partner's capital account; yearly profit shares, salary appropriations and drawings go through individual current accounts. Under fluctuating capital accounts, those movements appear in capital balances directly. Clearly follow the method required."
      ]
    ],
    "workings": [
      [
        "Simple appropriation",
        "Partnership profit $60,000. A receives salary allowance $12,000; B receives $6,000; residual profit ratio A:B 3:2.",
        "Residual =60,000−12,000−6,000=$42,000. Residual allocation A $25,200; B $16,800. Total A share $37,200, B $22,800; together $60,000."
      ],
      [
        "Interest on drawings",
        "Partner A withdrew $10,000 at beginning of year; agreement charges interest on drawings 5% annually.",
        "Interest charged to A $500. In appropriation accounts, this increases pool available for distribution and reduces A's current account; do not recognise it as outside revenue from a customer."
      ]
    ]
  },
  "FA2:H2": {
    "title": "Partnership accounting records",
    "sections": [
      [
        "Fixed versus fluctuating capital",
        "Fixed-capital approach keeps each partner's invested capital relatively stable, while current accounts track profit shares, salary allowance, interest, drawings and adjustments. Fluctuating-capital approach records those movements within partner capital accounts. Transactions with the partnership's owners must be distinguished from business trading expenses."
      ],
      [
        "Profit appropriation ledger",
        "Credit the partner current account for salary allowance, interest on capital and residual profit share. Debit for drawings and interest on drawings. Interest on capital and salary allowances are distributions of profit under typical partnership appropriation, not extra operating expenses in the profit or loss calculation."
      ],
      [
        "Appropriation order",
        "Start with net profit, add any interest on drawings credited to appropriation, deduct partner salaries and interest on capital (if the agreement specifies), then allocate residual profit using the agreed ratio. If the appropriation total exceeds profit, residual may be a loss to share unless otherwise stated."
      ],
      [
        "Reconcile partner balances",
        "Opening current credit plus credited appropriations minus drawings and interest on drawings gives closing balance. Debit current accounts indicate a partner owes the partnership or has drawn more than allocated; do not silently reclassify as ordinary trade receivables without question context."
      ]
    ],
    "workings": [
      [
        "Full appropriation with interest",
        "Profit $90,000. A and B have capital $100,000/$80,000. Capital interest 5%, salaries A $12,000 and B $9,000, and residual ratio 3:2. Ignore drawing interest.",
        "Interest on capital A $5,000, B $4,000; salaries total $21,000. Residual=90,000−9,000−21,000=$60,000. Residual A $36,000, B $24,000. Total share A 5,000+12,000+36,000=$53,000; B 4,000+9,000+24,000=$37,000."
      ],
      [
        "Current-account balances",
        "Opening A current credit $6,000; current-year share $53,000; drawings $25,000.",
        "A closing current credit=6,000+53,000−25,000=$34,000. Show as part of partnership equity, subject to required format."
      ]
    ]
  },
  "FA2:H3": {
    "title": "Partnership financial statements and changes in partnership",
    "sections": [
      [
        "Prepare partnership statements",
        "A partnership statement of profit or loss measures revenue, cost of sales, expenses and profit of the business. A separate appropriation statement allocates that profit among partners as agreed. The statement of financial position presents assets and liabilities plus partner capital/current equity balances. Check the sum of partners' entitlements against total partnership equity."
      ],
      [
        "New partner admitted",
        "Admission can involve capital introduced, goodwill valuation and changes in future profit-sharing ratio. Existing partners may receive a goodwill adjustment for value generated before admission according to the partnership's prescribed accounting method. The accounting depends on whether goodwill is retained as an asset or written off, and on agreed capital/current account treatment."
      ],
      [
        "Partner retirement and ratio change",
        "On retirement, calculate the retiring partner's entitlement for capital/current accounts, share of profit to retirement date, and any agreed goodwill adjustment. Settlement may be in cash or transfer to a loan payable to former partner. The remaining partners agree a new sharing ratio for future profits; changing ratio affects how balances are allocated."
      ],
      [
        "Goodwill accounting",
        "Goodwill can represent value beyond identifiable net assets. In foundation-level change-of-partnership questions, the accounting may require crediting old partners in old profit-sharing ratio and then writing off goodwill in new ratio, or direct compensation via capital/current accounts. Follow the question's explicit method rather than blindly capitalising indefinite goodwill."
      ],
      [
        "Closing reconciliation",
        "Reconcile opening partner equity + new capital + profit − drawings − withdrawals = closing aggregate equity, including appropriate goodwill and admission/retirement transfers. The accounting equation should still hold. Record partner loans separately if an outgoing partner's entitlement remains payable."
      ]
    ],
    "workings": [
      [
        "Change of ratio with goodwill adjustment",
        "A:B previously share 3:2, now 1:1. Goodwill valued at $20,000 for the ratio-change adjustment and written off immediately. Ignore other terms.",
        "Credit A old share $12,000 and B old share $8,000; write off in new ratio: debit A $10,000 and B $10,000. Net adjustment A +$2,000, B −$2,000. This reflects transfer of pre-existing goodwill benefits between partners."
      ],
      [
        "Retirement settlement",
        "Partner C capital $50,000, current credit $8,000; entitlement to goodwill $12,000; drawings to date $5,000; retirement settled $40,000 in cash, remainder as loan.",
        "Total entitlement 50,000+8,000+12,000−5,000=$65,000. Cash settlement $40,000, partner loan payable $25,000. Ensure goodwill adjustment agrees with chosen partnership method."
      ]
    ]
  }
};})(window);
