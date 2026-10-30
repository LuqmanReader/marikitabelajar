/* LedgerPeer original VISUAL workbook content. Independently written from accounting principles; official topic outlines are reference only. */
(function(root){'use strict';root.LedgerVisualWorkbook={
  "worked": {
    "title": "The complete accounting cycle: one business, nine events",
    "intro": "The following records all relate to ONE business. The dates and amounts are intentionally consistent across the invoice records, journals, general ledger, trial balance and financial statements. Assume there is no sales tax, the business uses perpetual inventory and the transactions occur in one period. Every line can be traced back to the original document.",
    "transactions": [
      [
        "01",
        "Owner invests RM30,000 cash",
        "Bank receipt / owner introduction form",
        "Dr Bank 30,000 · Cr Capital 30,000"
      ],
      [
        "02",
        "Equipment bought for RM8,000, bank transfer",
        "Supplier invoice and bank transfer",
        "Dr Equipment 8,000 · Cr Bank 8,000"
      ],
      [
        "03",
        "Inventory bought on credit RM6,000",
        "Supplier invoice and goods received note",
        "Dr Inventory 6,000 · Cr Payables 6,000"
      ],
      [
        "04",
        "Inventory sold on credit for RM12,000; cost RM4,500",
        "Customer invoice, goods dispatch and stock issue",
        "Dr Receivables 12,000 · Cr Sales 12,000; Dr Cost of sales 4,500 · Cr Inventory 4,500"
      ],
      [
        "05",
        "Customer pays RM5,000 of invoice",
        "Remittance advice / bank statement",
        "Dr Bank 5,000 · Cr Receivables 5,000"
      ],
      [
        "06",
        "Supplier paid RM3,000",
        "Supplier remittance and bank statement",
        "Dr Payables 3,000 · Cr Bank 3,000"
      ],
      [
        "07",
        "Rent of RM1,200 paid",
        "Rent receipt / bank debit",
        "Dr Rent 1,200 · Cr Bank 1,200"
      ],
      [
        "08",
        "Electricity bill accrued RM400, unpaid",
        "Utility bill or reliable estimate",
        "Dr Electricity 400 · Cr Accruals 400"
      ],
      [
        "09",
        "Period depreciation RM300",
        "Non-current asset register / calculation",
        "Dr Depreciation 300 · Cr Accumulated depreciation 300"
      ]
    ],
    "journals": [
      [
        "01",
        "Bank",
        "30,000",
        ""
      ],
      [
        "",
        "Capital",
        "",
        "30,000"
      ],
      [
        "02",
        "Equipment",
        "8,000",
        ""
      ],
      [
        "",
        "Bank",
        "",
        "8,000"
      ],
      [
        "03",
        "Inventory",
        "6,000",
        ""
      ],
      [
        "",
        "Trade payables",
        "",
        "6,000"
      ],
      [
        "04a",
        "Trade receivables",
        "12,000",
        ""
      ],
      [
        "",
        "Sales",
        "",
        "12,000"
      ],
      [
        "04b",
        "Cost of sales",
        "4,500",
        ""
      ],
      [
        "",
        "Inventory",
        "",
        "4,500"
      ],
      [
        "05",
        "Bank",
        "5,000",
        ""
      ],
      [
        "",
        "Trade receivables",
        "",
        "5,000"
      ],
      [
        "06",
        "Trade payables",
        "3,000",
        ""
      ],
      [
        "",
        "Bank",
        "",
        "3,000"
      ],
      [
        "07",
        "Rent expense",
        "1,200",
        ""
      ],
      [
        "",
        "Bank",
        "",
        "1,200"
      ],
      [
        "08",
        "Electricity expense",
        "400",
        ""
      ],
      [
        "",
        "Accruals",
        "",
        "400"
      ],
      [
        "09",
        "Depreciation expense",
        "300",
        ""
      ],
      [
        "",
        "Accumulated depreciation",
        "",
        "300"
      ]
    ],
    "trial": [
      [
        "Bank",
        "22,800",
        ""
      ],
      [
        "Equipment at cost",
        "8,000",
        ""
      ],
      [
        "Inventory",
        "1,500",
        ""
      ],
      [
        "Trade receivables",
        "7,000",
        ""
      ],
      [
        "Cost of sales",
        "4,500",
        ""
      ],
      [
        "Rent",
        "1,200",
        ""
      ],
      [
        "Electricity",
        "400",
        ""
      ],
      [
        "Depreciation expense",
        "300",
        ""
      ],
      [
        "Accumulated depreciation",
        "",
        "300"
      ],
      [
        "Trade payables",
        "",
        "3,000"
      ],
      [
        "Accrued electricity",
        "",
        "400"
      ],
      [
        "Owner capital",
        "",
        "30,000"
      ],
      [
        "Sales revenue",
        "",
        "12,000"
      ],
      [
        "TOTAL",
        "45,700",
        "45,700"
      ]
    ],
    "accounts": [
      {
        "name": "BANK",
        "debit": [
          [
            "Capital",
            "30,000"
          ],
          [
            "Receivables",
            "5,000"
          ]
        ],
        "credit": [
          [
            "Equipment",
            "8,000"
          ],
          [
            "Payables",
            "3,000"
          ],
          [
            "Rent",
            "1,200"
          ],
          [
            "Balance c/d",
            "22,800"
          ]
        ],
        "balance": "22,800 Dr"
      },
      {
        "name": "RECEIVABLES",
        "debit": [
          [
            "Credit sales",
            "12,000"
          ]
        ],
        "credit": [
          [
            "Bank receipt",
            "5,000"
          ],
          [
            "Balance c/d",
            "7,000"
          ]
        ],
        "balance": "7,000 Dr"
      },
      {
        "name": "TRADE PAYABLES",
        "debit": [
          [
            "Bank payment",
            "3,000"
          ],
          [
            "Balance c/d",
            "3,000"
          ]
        ],
        "credit": [
          [
            "Credit purchase",
            "6,000"
          ]
        ],
        "balance": "3,000 Cr"
      },
      {
        "name": "INVENTORY",
        "debit": [
          [
            "Credit purchase",
            "6,000"
          ]
        ],
        "credit": [
          [
            "Cost of sales",
            "4,500"
          ],
          [
            "Balance c/d",
            "1,500"
          ]
        ],
        "balance": "1,500 Dr"
      }
    ],
    "pAndL": [
      [
        "Revenue",
        "12,000"
      ],
      [
        "Less: cost of sales",
        "(4,500)"
      ],
      [
        "GROSS PROFIT",
        "7,500"
      ],
      [
        "Less: rent",
        "(1,200)"
      ],
      [
        "Less: electricity",
        "(400)"
      ],
      [
        "Less: depreciation",
        "(300)"
      ],
      [
        "PROFIT FOR THE PERIOD",
        "5,600"
      ]
    ],
    "sofp": [
      [
        "Bank",
        "22,800"
      ],
      [
        "Inventory",
        "1,500"
      ],
      [
        "Trade receivables",
        "7,000"
      ],
      [
        "Equipment net (8,000 − 300)",
        "7,700"
      ],
      [
        "TOTAL ASSETS",
        "39,000"
      ],
      [
        "Trade payables",
        "3,000"
      ],
      [
        "Accrued electricity",
        "400"
      ],
      [
        "Owner capital",
        "30,000"
      ],
      [
        "Retained profit",
        "5,600"
      ],
      [
        "LIABILITIES + EQUITY",
        "39,000"
      ]
    ]
  },
  "shared": {
    "commonMistakes": [
      "Debit does not mean a cash receipt and credit does not mean a cash payment. The entry depends on the type of account.",
      "A credit sale is not a cash receipt. It creates receivables and revenue; a later customer payment settles the receivable.",
      "The sales day book is not itself the statement of profit or loss. Transaction totals move into nominal ledger accounts before reporting.",
      "A subsidiary ledger contains individual customers or suppliers. Its total must reconcile to its control account in the general ledger.",
      "A balanced trial balance catches certain arithmetic/posting errors but does not detect all omissions, errors of principle or complete reversals.",
      "The closing balance c/d is placed on the shorter side of a T-account to balance totals; balance b/d begins the next period on its normal side.",
      "Inventory sales may require a separate cost-of-sales entry in a perpetual system. If the example omits inventory cost, it cannot yet produce a complete gross profit.",
      "Depreciation, accruals and other noncash period-end adjustments can change profit without changing the bank balance."
    ],
    "journalExplainer": "A journal identifies the exact account to debit and credit. A line with an empty debit (or credit) field is the second side of the same event; the total for each event must balance. The overall journal also balances, but it is the accounts—not a single undifferentiated cash list—that are posted.",
    "ledgerExplainer": "In the T-accounts, debit is left and credit is right. Where the account is an asset, its closing debit balance c/d is entered on the CREDIT side to make the two T-account totals equal; it is carried into the next period as a debit b/d. The opposite applies to payables and other credit balances. The c/d entry is not a new business transaction.",
    "statementExplainer": "The trial balance displays unclosed nominal account balances and is the starting point, not the final statement. Profit or loss collects income and expenses. The statement of financial position then shows assets, liabilities and equity. In this case profit is RM5,600 and adds to owner equity; assets RM39,000 equal liabilities RM3,400 plus equity RM35,600."
  },
  "topics": {
    "FA2:B2": {
      "label": "ACCOUNTING INFORMATION FLOW — VISUAL MASTER LESSON",
      "objectives": [
        "Trace a transaction from the original evidence to its first entry and the correct general or subsidiary ledger.",
        "Explain why ledger accounts are balanced and why a trial balance is produced.",
        "Take the adjusted trial balance through income calculation and statement of financial position preparation."
      ],
      "sections": [
        {
          "heading": "Why accountants do not start with financial statements",
          "paras": [
            "Imagine a shop sells RM12,000 of goods on credit. At that moment the shop has not necessarily received any money. It now has evidence that a customer owes it RM12,000, and it has earned revenue under the sale's terms. An accounting system must preserve the invoice, record which customer owes the money and update the general ledger totals. Only after thousands of such events have been processed can the final financial statements report a reliable position.",
            "This means the flow of information matters as much as debit and credit arithmetic. A source document proves a particular event; a book of original entry orders many similar events; ledger accounts classify the effects; the trial balance checks ledger arithmetical agreement; adjustments put the results in the correct accounting period; and statements communicate the result. Skipping a stage makes it harder to explain or verify a reported figure.",
            "The stages are not always separate screens in modern accounting software. A correctly configured program may update a sales journal, customer record, general ledger control and management report together. The underlying record trail still exists and needs controls against duplicate invoices, incorrect account codes and unauthorised adjustments."
          ]
        },
        {
          "heading": "Understand every book of original entry by seeing what it contains",
          "paras": [
            "The SALES DAY BOOK records credit sales invoices. The PURCHASES DAY BOOK records credit purchases of goods, typically inventory, subject to the business's accounting design. RETURNS INWARDS is the sales returns book for customer credit notes. RETURNS OUTWARDS is the purchase returns book for supplier credit notes. The CASH BOOK records cash and bank receipts and payments. The GENERAL JOURNAL records other entries, including correcting entries and period-end accruals, prepayments and depreciation. An equipment purchase on credit might be recorded in a general journal or dedicated asset purchase module rather than the inventory purchases day book.",
            "Why not write every sales invoice immediately into one giant financial statement? An invoice belongs to one customer, has a due date and tax treatment, and may be adjusted or paid later. Sales day book totals aggregate the revenue effect, while customer subledger entries preserve the debtor-level detail. This separation makes collection, reconciliation and record retention possible.",
            "Books of prime entry do not replace double entry. The sales day book is a chronological first listing; posting its total creates debit trade receivables control and credit sales revenue in the nominal ledger. Customer accounts are also updated for individual invoices. When software posts them together, the conceptual distinction is still important."
          ],
          "table": {
            "headers": [
              "Book / record",
              "What enters it?",
              "What normally does NOT enter it?",
              "Example posting"
            ],
            "rows": [
              [
                "Sales day book",
                "Credit sales invoices",
                "Cash receipts from customers",
                "Dr receivables control / Cr sales"
              ],
              [
                "Purchases day book",
                "Credit purchases of trading goods",
                "Bank payment to supplier",
                "Dr inventory or purchases / Cr payables"
              ],
              [
                "Returns inwards book",
                "Customer credit notes",
                "Supplier goods returns",
                "Dr sales returns / Cr receivables"
              ],
              [
                "Returns outwards book",
                "Supplier credit notes for returned purchases",
                "Customer returns",
                "Dr payables / Cr purchase returns or inventory"
              ],
              [
                "Cash book",
                "Bank/cash received and paid",
                "Unpaid credit invoice itself",
                "Dr bank / Cr receivables on settlement"
              ],
              [
                "General journal",
                "Adjustments, correction, unusual postings",
                "Routine sales invoices where specialised module exists",
                "Dr depreciation / Cr accumulated depreciation"
              ]
            ]
          }
        },
        {
          "heading": "Posting: one invoice creates both totals and customer detail",
          "paras": [
            "Suppose invoice SI-104 is for RM1,200 of credit sales to customer Maya, with sales tax ignored. The sales day book contains date, invoice SI-104, Maya and RM1,200. The customer personal ledger receives a debit of RM1,200. The receivables CONTROL account also receives a debit of RM1,200, while sales revenue receives a credit of RM1,200. It is not correct to add the customer personal ledger AGAIN to the control total—the personal account supports the control, it is not another asset.",
            "At the period end, the list of customer balances should agree with the trade receivables control after timing differences or errors are corrected. If the control shows RM25,000 but all customer accounts sum to RM24,600, the RM400 discrepancy is investigated using invoice and receipt references. A suspense or arbitrary 'miscellaneous customer' balance is not a proper explanation."
          ],
          "table": {
            "headers": [
              "SI-104 record",
              "Debit",
              "Credit",
              "Purpose"
            ],
            "rows": [
              [
                "Sales journal → GL control",
                "Trade receivables RM1,200",
                "Sales RM1,200",
                "Record the credit sale"
              ],
              [
                "Customer personal account (Maya)",
                "Maya RM1,200",
                "—",
                "Track WHICH customer owes RM1,200"
              ],
              [
                "Maya later settles",
                "Bank RM1,200",
                "Receivables RM1,200",
                "Settlement of receivable, NOT another sale"
              ]
            ]
          }
        },
        {
          "heading": "Close off the nominal ledger: distinguish totals from balances",
          "paras": [
            "At period end, accountants add both sides of each T-account. If the debit side totals RM35,000 and the credit side contains transactions of RM12,200, the closing debit balance is RM22,800. Balance c/d appears on the credit side for RM22,800 solely to make both account columns total RM35,000. The next period begins with balance b/d RM22,800 on the debit side. The words 'credit side' here do not mean the bank was actually paid RM22,800.",
            "Not every ledger balance must be closed to zero. Assets, liabilities and owner's capital carry forward. Income and expense balances are transferred to profit or loss as part of period closing under the entity's accounting system. A trial balance lists the debit or credit balance of each account before final transfers and provides an arithmetic check."
          ]
        },
        {
          "heading": "From trial balance to actual financial statements",
          "paras": [
            "First check that ledger debits equal credits. Next identify year-end matters that the raw transactions have missed: electricity used but not paid, rent paid in advance, equipment depreciation, inventory count adjustments, bad debts and expected credit losses, or interest accrued. Post EACH adjustment using equal debits and credits, then prepare the adjusted trial balance.",
            "Create the statement of profit or loss from income and expense accounts. The statement of financial position uses the adjusted asset and liability accounts and closing equity. Profit is reflected in equity; it is not an extra bank receipt. Compare the final statement to the accounting equation. The worked complete example below contains both statements and can be traced back to nine real types of documents."
          ]
        }
      ],
      "drills": [
        {
          "question": "A shop receives RM800 from a customer paying an invoice issued last week. Where is the initial receipt recorded?",
          "answer": "In the cash book or bank receipt module. Dr Bank RM800 / Cr Trade receivables RM800. It is NOT another credit sale in the sales day book."
        },
        {
          "question": "The general ledger receivables control is RM18,000 but the total of customer accounts is RM17,700. What does this mean?",
          "answer": "The subsidiary ledger does not agree with the control. Investigate RM300 using invoice, credit note, receipt and posting references. Do not invent a balancing entry."
        },
        {
          "question": "Does a balanced trial balance prove there are no errors?",
          "answer": "No. Equal wrong debits and credits, full omissions and incorrect classifications can preserve agreement."
        },
        {
          "question": "Why is the bank c/d entered on the credit side of a debit-balance bank account?",
          "answer": "It balances the T-account totals. It is not an actual cash payment. The debit balance is brought forward on the debit side next period."
        }
      ]
    },
    "FA1:B1": {
      "label": "DOUBLE ENTRY — LEARN IT BY POSTING",
      "objectives": [
        "Apply the accounting equation and dual aspect to a single entity.",
        "Decide which account is debited and credited for common transactions.",
        "Post and check both sides without confusing debit with cash in."
      ],
      "sections": [
        {
          "heading": "A transaction always has two sides inside ONE business",
          "paras": [
            "If the owner puts RM30,000 into their own shop's bank account, the shop has more money AND the owner's equity has increased. The correct entry is Dr Bank RM30,000 and Cr Capital RM30,000. It does not mean the owner records one side and the business records the other: both sides belong in the shop's accounting records.",
            "The equation is Assets = Liabilities + Equity. A credit purchase of inventory increases both an asset and a liability. A bank payment to a supplier reduces both bank and payable. A cash sale increases bank and increases revenue, with profit eventually increasing equity; a perpetual inventory system also records the cost of goods sold separately.",
            "Debit and credit refer to the left and right sides of a ledger account. They are NOT synonyms for good/bad or cash in/cash out. A debit normally increases an asset or expense but reduces a liability, capital or revenue. A credit normally increases a liability, capital or revenue but reduces an asset or expense. Use the type of account before deciding the direction."
          ]
        },
        {
          "heading": "The rules you should recognise instantly",
          "paras": [
            "Assets include bank, inventory, trade receivables and equipment. Debiting them increases them; crediting them decreases them. Expenses such as wages, rent and depreciation increase on the debit side. Capital, liabilities and revenue increase on the credit side; when those accounts fall, debit them. Drawings increase on the debit side because they reduce owner equity.",
            "If you cannot decide a debit or credit, start by writing WHAT the business received and WHAT changed in exchange. For goods on credit the business receives inventory and promises to pay: Dr Inventory, Cr Payables. For a customer settling an existing invoice, bank goes up and debtors go down: Dr Bank, Cr Receivables. This economic reasoning is more reliable than memorising isolated lists."
          ],
          "table": {
            "headers": [
              "Account type",
              "Increases with",
              "Decreases with",
              "Normal balance"
            ],
            "rows": [
              [
                "Asset (bank, inventory, receivables)",
                "Debit",
                "Credit",
                "Debit"
              ],
              [
                "Expense (rent, wages, depreciation)",
                "Debit",
                "Credit",
                "Debit"
              ],
              [
                "Drawings",
                "Debit",
                "Credit",
                "Debit"
              ],
              [
                "Liability (payables, loan)",
                "Credit",
                "Debit",
                "Credit"
              ],
              [
                "Capital / equity",
                "Credit",
                "Debit",
                "Credit"
              ],
              [
                "Income / sales",
                "Credit",
                "Debit",
                "Credit"
              ]
            ]
          }
        },
        {
          "heading": "Learn to distinguish the same action in different contexts",
          "paras": [
            "Buying goods for resale on CREDIT: Dr Inventory or Purchases / Cr Payables. Buying equipment for cash: Dr Equipment / Cr Bank. Paying supplier: Dr Payables / Cr Bank. A company receiving a bank loan: Dr Bank / Cr Loan. Repaying only the principal: Dr Loan / Cr Bank. Paying loan interest: Dr Interest expense / Cr Bank. The first repayment affects liabilities while the interest affects profit.",
            "A sale on CREDIT: Dr Trade receivables / Cr Sales. Customer settlement: Dr Bank / Cr Receivables. Owner invests: Dr Bank / Cr Capital. Owner withdrawals: Dr Drawings / Cr Bank. Salary paid: Dr Wages / Cr Bank and any additional deduction liability where appropriate. Each entry must use the scenario's exact facts."
          ]
        },
        {
          "heading": "Test the answer using the equation, not just the rule chart",
          "paras": [
            "After Dr Bank 30,000/Cr Capital 30,000, assets and equity each rise 30,000, so the equation still balances. After Dr Inventory 6,000/Cr Payables 6,000, both asset and liability rise 6,000. After Dr Payables 3,000/Cr Bank 3,000, both liability and asset fall 3,000. This check catches a mistaken posting that would falsely raise profit or double count an asset.",
            "A compound journal may have three or more individual lines: for example, tax-exclusive credit sales are Dr Receivables (gross), Cr Revenue (net), Cr Sales-tax payable. The number of lines is irrelevant provided debit total equals credit total and accounts reflect the correct economic effects."
          ]
        }
      ],
      "drills": [
        {
          "question": "A bank transfers RM4,000 to repay principal on an existing loan. Give the entry.",
          "answer": "Dr Loan RM4,000 and Cr Bank RM4,000; liabilities and assets both decrease. No interest expense is created from principal repayment."
        },
        {
          "question": "A business buys goods on credit for RM2,700. No tax. Give the entry.",
          "answer": "Dr Inventory/Purchases RM2,700, Cr Trade payables RM2,700. Inventory (or purchase cost) increases; an obligation to supplier is created."
        },
        {
          "question": "A customer settles RM1,500 from a previous invoice. Is sales credited again?",
          "answer": "No. Dr Bank RM1,500, Cr Receivables RM1,500. Sales was credited when the credit sale occurred."
        },
        {
          "question": "Rent RM900 is accrued but unpaid at year end. Which accounts?",
          "answer": "Dr Rent expense RM900, Cr Accrued expenses liability RM900. No bank entry until payment occurs."
        }
      ]
    },
    "FA2:C1": {
      "label": "JOURNAL WRITING — CORRECT ACCOUNT FORMAT",
      "objectives": [
        "Prepare equal debit and credit journal entries for routine and adjusting events.",
        "Show journal narration and document references.",
        "Distinguish multi-line entries, correcting entries and period-end adjustments."
      ],
      "sections": [
        {
          "heading": "What a proper journal actually looks like",
          "paras": [
            "An accounting journal should identify the business event, entry date, debit account(s), credit account(s), debit and credit amounts, and a short narration. A journal does not simply say 'sales RM1,000'. It states what asset or liability changed and what the counterparty to that change is. Each separate journal must balance even if the month-end total also balances.",
            "The table below contains each financial transaction from the same nine-event business case. The entry tagged 04a records revenue and receivables; 04b separately records the cost of inventory sold under a perpetual system. These are not alternatives; both are needed when the value of goods sold is known."
          ]
        },
        {
          "heading": "Compound journals, discounts and tax",
          "paras": [
            "When sales tax is explicitly applicable, debit the customer for the gross invoice, credit revenue for the net amount and credit output tax payable for the tax. Example: goods RM2,000 plus 6% sales tax: Dr Receivables RM2,120, Cr Sales RM2,000 and Cr Tax payable RM120. A journal can therefore have one debit and two credits.",
            "If the customer returns half, a credit note reverses net revenue RM1,000 and tax RM60 while reducing receivables RM1,060. The entries depend on the actual tax framework, and LedgerPeer should not imply that one hypothetical rate represents every jurisdiction or examination variant.",
            "Trade discounts are deducted from list prices before recording sales. A settlement discount may need separate treatment when its conditions are met. Never credit gross list price when the actual invoice is properly issued net of trade discount."
          ]
        },
        {
          "heading": "Year-end adjustments are real journals too",
          "paras": [
            "Electricity consumed but not invoiced: Dr Electricity expense, Cr Accrual. Insurance paid for a future period: Dr Prepayment asset, Cr Insurance expense if previously wholly expensed. Asset depreciation: Dr Depreciation expense, Cr Accumulated depreciation. These entries change expenses and statement of financial position balances without moving cash at year-end.",
            "For a correcting journal, compare the actual entry with what should have been recorded. If RM1,200 of equipment was wrongly debited to Repairs, the correction is Dr Equipment RM1,200 and Cr Repairs RM1,200, plus any relevant depreciation adjustment. Do not debit equipment and credit bank again because bank was already correctly reduced when the purchase happened."
          ]
        },
        {
          "heading": "Post a journal only once and verify its full effect",
          "paras": [
            "Each journal line posts to one named general ledger account. If a sales module has already automatically posted the invoice, manually posting it again would double revenue and receivables while leaving trial balance equal. The journal audit trail must preserve transaction ID and whether the event was already included.",
            "Check: (1) account names and classifications, (2) equal total Dr and Cr, (3) date/cutoff, (4) evidence, and (5) what will appear in statements. A mathematically balanced journal to the wrong account is an accounting error."
          ]
        }
      ],
      "drills": [
        {
          "question": "A machine bought for RM5,000 cash was wrongly Dr Repairs / Cr Bank. Correct it.",
          "answer": "Dr Machinery RM5,000 / Cr Repairs RM5,000. Do NOT credit Bank again; that credit was already correct. Separately account for appropriate depreciation."
        },
        {
          "question": "Sold services RM3,000 on credit with 8% assumed tax. Show journal.",
          "answer": "Dr Receivables RM3,240; Cr Service revenue RM3,000; Cr Output tax payable RM240."
        },
        {
          "question": "Used RM400 electricity by year end but supplier has not billed it.",
          "answer": "Dr Electricity expense RM400 / Cr Accruals RM400; bank unchanged."
        },
        {
          "question": "Why does a sale of inventory sometimes need TWO journals?",
          "answer": "One records revenue and receivable, the second removes inventory and recognises cost of sales under a perpetual inventory system."
        }
      ]
    },
    "FA2:C2": {
      "label": "GENERAL LEDGERS — T-ACCOUNTS THAT REALLY BALANCE",
      "objectives": [
        "Transfer journal debits and credits to the correct T-account.",
        "Balance general ledger accounts using balance c/d and b/d.",
        "Distinguish closing ledger balances from statement line items."
      ],
      "sections": [
        {
          "heading": "Understand the T-account physically",
          "paras": [
            "Every T-account has the account name at its top, with a DEBIT column on the left and a CREDIT column on the right. The journal entry Dr Bank/Cr Capital produces a debit line in the Bank T-account and a credit line in the Capital T-account. The entry is not left as one combined 'Bank and Capital' account; each account gathers its own entries over time.",
            "The four drawn ledger accounts below come from the same nine transaction case. Follow the narration from the journal to each T-account, then recompute the closing balance. For receivables, sales were debited RM12,000 and a customer receipt was credited RM5,000, leaving a debit RM7,000.",
            "The T-accounts shown are balances for the period. A line labelled balance c/d is a balancing entry, not an additional invoice or bank transfer. The next period brings the amount back as balance b/d on its normal side."
          ]
        },
        {
          "heading": "Why an asset can have a credit entry",
          "paras": [
            "Bank is an asset and normally has a debit balance. But payments to suppliers, rent and asset purchases CREDIT the Bank account because they REDUCE an asset. A credit line in a bank account does not make Bank an expense or liability. The account classification is unchanged until its overall balance becomes credit, perhaps reflecting an overdraft.",
            "A credit-balance payable works in reverse. Purchases on credit increase payable by credit. Supplier settlement reduces payable by debit. In the illustrated payable account, RM6,000 was credited on purchase; RM3,000 debited for the payment, leaving RM3,000 credit outstanding."
          ]
        },
        {
          "heading": "Balance and bring forward",
          "paras": [
            "For an asset account, total debit transactions and credit transactions separately. Insert the balancing figure c/d in the smaller credit column so both sides add to equal totals, then write the same figure b/d on the debit side of the account for the next period. For a liability credit balance, the c/d balancing figure goes on the debit side and the b/d returns to the credit side.",
            "In the Bank T-account here debit entries total RM35,000 (capital 30,000 and customer 5,000). Credit payments total RM12,200. Therefore c/d RM22,800 sits on the credit side to make RM35,000; next opening b/d is a RM22,800 debit. No additional bank payment occurred."
          ]
        },
        {
          "heading": "General versus subsidiary ledgers",
          "paras": [
            "Trade receivables CONTROL is a general ledger account containing the total owed by all customers. The customer personal ledger records individual counterparties, invoice references, returns and settlements. Both are needed to verify amounts and collect debt. The total of customer balances must be reconciled to the control ledger, and the exact source of a discrepancy identified.",
            "Assets, liabilities, capital, revenues and expenses can all be general ledger accounts. Their closing amounts are used to build the trial balance; the trial balance is not the same as displaying a separate T-account for every individual supplier."
          ]
        }
      ],
      "drills": [
        {
          "question": "Bank debit entries RM20,000; credit transaction entries RM13,500. Calculate balance and location of c/d.",
          "answer": "Closing Bank debit balance RM6,500. Put balance c/d RM6,500 on the credit side to make equal account totals. Next opening b/d is a debit RM6,500."
        },
        {
          "question": "Payables credit RM9,000, payment debit RM4,000. What remains?",
          "answer": "Credit balance RM5,000. The payable account has balance c/d on debit side, b/d on credit side next period."
        },
        {
          "question": "Why does a credit of RM5,000 to bank not mean a new liability?",
          "answer": "It is a decrease in the asset Bank. If the whole bank balance becomes overdrawn, there may be an overdraft liability, but individual payment credits are not themselves new liabilities."
        }
      ]
    },
    "FA2:F1": {
      "label": "TRIAL BALANCE — FROM T-ACCOUNTS TO STATEMENTS",
      "objectives": [
        "Extract the correct balance from each nominal ledger account.",
        "Arrange balances into the debit and credit columns of a trial balance.",
        "Describe and illustrate limits of a trial balance and the adjustments needed before statements."
      ],
      "sections": [
        {
          "heading": "Prepare the actual trial balance—not a list of invoices",
          "paras": [
            "A trial balance is a list of every general ledger account balance at one date. It is NOT the sales day book and it is NOT the statement of financial position. The debit column includes net balances of asset and expense accounts; the credit column includes net balances of liability, equity and income accounts and contra-assets such as accumulated depreciation.",
            "An individual account may contain dozens of entries, but the trial balance shows one net debit or credit balance for that account. That is why closing off T-accounts matters: the data are condensed into one figure per account for arithmetic checking and statement preparation."
          ]
        },
        {
          "heading": "Work through a complete agreeing trial balance",
          "paras": [
            "Use the table below. It includes bank, equipment at cost, inventory, trade receivables, expenses, accumulated depreciation, payables, accrued electricity, capital and revenue. When total debit RM45,700 equals total credit RM45,700, the postings agree arithmetically.",
            "The total of RM45,700 is not revenue, total assets or profit. It is the sum of account balances on each side. The same expense cannot appear both as an unadjusted expense and as a separate year-end expense twice: any adjusting entry has already affected the ledger totals shown here."
          ]
        },
        {
          "heading": "What a trial balance will miss",
          "paras": [
            "If the business completely omitted a RM2,000 credit sale, neither sales nor receivables is recorded. Both TB columns remain equal, yet profit and assets are understated. If an RM800 machine purchase is recorded Dr Repairs/Cr Bank instead of Dr Equipment/Cr Bank, the TB still balances while profit and net assets are wrong. If Dr and Cr are both reversed, the TB can still balance. Therefore agreement is a necessary arithmetic control, not an accounting opinion.",
            "Unexplained TB differences may indicate one-sided postings, transpositions or incorrect arithmetic. A suspense account can temporarily represent the difference but must be investigated and cleared; it cannot be used to make financial statements 'look right'."
          ]
        },
        {
          "heading": "The adjustments and final figures",
          "paras": [
            "Before reporting, check inventory values, accruals, prepayments, depreciation, bad debts, receivables allowances, sales-tax control and bank reconciliation. Then prepare an adjusted trial balance and the statement of profit or loss. In our business the final revenue is RM12,000, cost of sales RM4,500, rent RM1,200, electricity RM400 and depreciation RM300, giving profit RM5,600.",
            "The statement of financial position reports bank RM22,800, inventory RM1,500, receivables RM7,000 and net equipment RM7,700: total assets RM39,000. Liabilities are payables RM3,000 and electricity accrual RM400; capital and retained profit total RM35,600. Therefore assets RM39,000 equal liabilities plus equity RM39,000. The equation is a final cross-check, not a replacement for source-ledger verification."
          ]
        }
      ],
      "drills": [
        {
          "question": "Can a trial balance prove that inventory count is accurate?",
          "answer": "No. The trial balance only reflects ledger values. A physical count/valuation check and related adjustments are needed."
        },
        {
          "question": "Equipment worth RM3,000 was expensed as repairs, credit bank correctly entered. Does the TB still balance?",
          "answer": "Yes. Both sides were posted equally, but profit is understated and equipment assets are understated before considering any depreciation."
        },
        {
          "question": "Why is accumulated depreciation on the CREDIT side of the TB?",
          "answer": "It is a contra-asset account with a normal credit balance, reducing equipment's net carrying value; it is not an ordinary trade payable."
        },
        {
          "question": "Using revenue 12,000, COGS 4,500, rent 1,200, electricity 400, depreciation 300, calculate profit.",
          "answer": "12,000−4,500−1,200−400−300 = RM5,600."
        }
      ]
    },
    "FA1:B2": {
      "label": "FA1:B2 · JOURNAL WRITING — CORRECT ACCOUNT FORMAT",
      "objectives": [
        "Prepare equal debit and credit journal entries for routine and adjusting events.",
        "Show journal narration and document references.",
        "Distinguish multi-line entries, correcting entries and period-end adjustments."
      ],
      "sections": [
        {
          "heading": "What a proper journal actually looks like",
          "paras": [
            "An accounting journal should identify the business event, entry date, debit account(s), credit account(s), debit and credit amounts, and a short narration. A journal does not simply say 'sales RM1,000'. It states what asset or liability changed and what the counterparty to that change is. Each separate journal must balance even if the month-end total also balances.",
            "The table below contains each financial transaction from the same nine-event business case. The entry tagged 04a records revenue and receivables; 04b separately records the cost of inventory sold under a perpetual system. These are not alternatives; both are needed when the value of goods sold is known."
          ]
        },
        {
          "heading": "Compound journals, discounts and tax",
          "paras": [
            "When sales tax is explicitly applicable, debit the customer for the gross invoice, credit revenue for the net amount and credit output tax payable for the tax. Example: goods RM2,000 plus 6% sales tax: Dr Receivables RM2,120, Cr Sales RM2,000 and Cr Tax payable RM120. A journal can therefore have one debit and two credits.",
            "If the customer returns half, a credit note reverses net revenue RM1,000 and tax RM60 while reducing receivables RM1,060. The entries depend on the actual tax framework, and LedgerPeer should not imply that one hypothetical rate represents every jurisdiction or examination variant.",
            "Trade discounts are deducted from list prices before recording sales. A settlement discount may need separate treatment when its conditions are met. Never credit gross list price when the actual invoice is properly issued net of trade discount."
          ]
        },
        {
          "heading": "Year-end adjustments are real journals too",
          "paras": [
            "Electricity consumed but not invoiced: Dr Electricity expense, Cr Accrual. Insurance paid for a future period: Dr Prepayment asset, Cr Insurance expense if previously wholly expensed. Asset depreciation: Dr Depreciation expense, Cr Accumulated depreciation. These entries change expenses and statement of financial position balances without moving cash at year-end.",
            "For a correcting journal, compare the actual entry with what should have been recorded. If RM1,200 of equipment was wrongly debited to Repairs, the correction is Dr Equipment RM1,200 and Cr Repairs RM1,200, plus any relevant depreciation adjustment. Do not debit equipment and credit bank again because bank was already correctly reduced when the purchase happened."
          ]
        },
        {
          "heading": "Post a journal only once and verify its full effect",
          "paras": [
            "Each journal line posts to one named general ledger account. If a sales module has already automatically posted the invoice, manually posting it again would double revenue and receivables while leaving trial balance equal. The journal audit trail must preserve transaction ID and whether the event was already included.",
            "Check: (1) account names and classifications, (2) equal total Dr and Cr, (3) date/cutoff, (4) evidence, and (5) what will appear in statements. A mathematically balanced journal to the wrong account is an accounting error."
          ]
        }
      ],
      "drills": [
        {
          "question": "A machine bought for RM5,000 cash was wrongly Dr Repairs / Cr Bank. Correct it.",
          "answer": "Dr Machinery RM5,000 / Cr Repairs RM5,000. Do NOT credit Bank again; that credit was already correct. Separately account for appropriate depreciation."
        },
        {
          "question": "Sold services RM3,000 on credit with 8% assumed tax. Show journal.",
          "answer": "Dr Receivables RM3,240; Cr Service revenue RM3,000; Cr Output tax payable RM240."
        },
        {
          "question": "Used RM400 electricity by year end but supplier has not billed it.",
          "answer": "Dr Electricity expense RM400 / Cr Accruals RM400; bank unchanged."
        },
        {
          "question": "Why does a sale of inventory sometimes need TWO journals?",
          "answer": "One records revenue and receivable, the second removes inventory and recognises cost of sales under a perpetual inventory system."
        }
      ]
    },
    "FA1:E1": {
      "label": "FA1:E1 · GENERAL LEDGERS — T-ACCOUNTS THAT REALLY BALANCE",
      "objectives": [
        "Transfer journal debits and credits to the correct T-account.",
        "Balance general ledger accounts using balance c/d and b/d.",
        "Distinguish closing ledger balances from statement line items."
      ],
      "sections": [
        {
          "heading": "Understand the T-account physically",
          "paras": [
            "Every T-account has the account name at its top, with a DEBIT column on the left and a CREDIT column on the right. The journal entry Dr Bank/Cr Capital produces a debit line in the Bank T-account and a credit line in the Capital T-account. The entry is not left as one combined 'Bank and Capital' account; each account gathers its own entries over time.",
            "The four drawn ledger accounts below come from the same nine transaction case. Follow the narration from the journal to each T-account, then recompute the closing balance. For receivables, sales were debited RM12,000 and a customer receipt was credited RM5,000, leaving a debit RM7,000.",
            "The T-accounts shown are balances for the period. A line labelled balance c/d is a balancing entry, not an additional invoice or bank transfer. The next period brings the amount back as balance b/d on its normal side."
          ]
        },
        {
          "heading": "Why an asset can have a credit entry",
          "paras": [
            "Bank is an asset and normally has a debit balance. But payments to suppliers, rent and asset purchases CREDIT the Bank account because they REDUCE an asset. A credit line in a bank account does not make Bank an expense or liability. The account classification is unchanged until its overall balance becomes credit, perhaps reflecting an overdraft.",
            "A credit-balance payable works in reverse. Purchases on credit increase payable by credit. Supplier settlement reduces payable by debit. In the illustrated payable account, RM6,000 was credited on purchase; RM3,000 debited for the payment, leaving RM3,000 credit outstanding."
          ]
        },
        {
          "heading": "Balance and bring forward",
          "paras": [
            "For an asset account, total debit transactions and credit transactions separately. Insert the balancing figure c/d in the smaller credit column so both sides add to equal totals, then write the same figure b/d on the debit side of the account for the next period. For a liability credit balance, the c/d balancing figure goes on the debit side and the b/d returns to the credit side.",
            "In the Bank T-account here debit entries total RM35,000 (capital 30,000 and customer 5,000). Credit payments total RM12,200. Therefore c/d RM22,800 sits on the credit side to make RM35,000; next opening b/d is a RM22,800 debit. No additional bank payment occurred."
          ]
        },
        {
          "heading": "General versus subsidiary ledgers",
          "paras": [
            "Trade receivables CONTROL is a general ledger account containing the total owed by all customers. The customer personal ledger records individual counterparties, invoice references, returns and settlements. Both are needed to verify amounts and collect debt. The total of customer balances must be reconciled to the control ledger, and the exact source of a discrepancy identified.",
            "Assets, liabilities, capital, revenues and expenses can all be general ledger accounts. Their closing amounts are used to build the trial balance; the trial balance is not the same as displaying a separate T-account for every individual supplier."
          ]
        }
      ],
      "drills": [
        {
          "question": "Bank debit entries RM20,000; credit transaction entries RM13,500. Calculate balance and location of c/d.",
          "answer": "Closing Bank debit balance RM6,500. Put balance c/d RM6,500 on the credit side to make equal account totals. Next opening b/d is a debit RM6,500."
        },
        {
          "question": "Payables credit RM9,000, payment debit RM4,000. What remains?",
          "answer": "Credit balance RM5,000. The payable account has balance c/d on debit side, b/d on credit side next period."
        },
        {
          "question": "Why does a credit of RM5,000 to bank not mean a new liability?",
          "answer": "It is a decrease in the asset Bank. If the whole bank balance becomes overdrawn, there may be an overdraft liability, but individual payment credits are not themselves new liabilities."
        }
      ]
    }
  }
};})(window);
