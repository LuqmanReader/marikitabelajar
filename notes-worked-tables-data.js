/* Original LedgerPeer costed numerical teaching tables, one case per listed topic. */
(function(root){'use strict';root.LedgerNumericalTables={
  "FA2:D3": {
    "heading": "FIFO: show every stock movement",
    "intro": "Opening 100 units at RM4, buy 200 at RM5, sell 180, buy 100 at RM6, then sell 70. FIFO assumes the earliest purchase costs are issued first.",
    "headers": [
      "Event",
      "Units issued / remaining",
      "Cost charged RM",
      "Remaining layers"
    ],
    "rows": [
      [
        "Opening",
        "100 units",
        "—",
        "100 @ RM4"
      ],
      [
        "Purchase 200 @ RM5",
        "+200 units",
        "—",
        "100 @ RM4 + 200 @ RM5"
      ],
      [
        "Issue 180",
        "100 @ RM4 + 80 @ RM5",
        "800",
        "120 @ RM5"
      ],
      [
        "Purchase 100 @ RM6",
        "+100 units",
        "—",
        "120 @ RM5 + 100 @ RM6"
      ],
      [
        "Issue 70",
        "70 @ RM5",
        "350",
        "50 @ RM5 + 100 @ RM6"
      ],
      [
        "CLOSING",
        "150 units",
        "1,150 total issued",
        "Inventory RM850"
      ]
    ],
    "check": "Total goods available at cost RM2,000 = issues RM1,150 + closing RM850.",
    "trap": "The physically newest goods can still be sold; FIFO here describes the COST FLOW, not necessarily physical stock movement."
  },
  "FA2:D4": {
    "heading": "Depreciation and disposal account",
    "intro": "Machine cost RM60,000, residual value RM6,000, useful life five years. Sold halfway through Year 3 for RM32,000, applying a monthly straight-line depreciation policy.",
    "headers": [
      "Ledger working",
      "Calculation",
      "RM"
    ],
    "rows": [
      [
        "Annual straight-line depreciation",
        "(60,000 − 6,000) / 5",
        "10,800"
      ],
      [
        "Years 1 and 2 depreciation",
        "10,800 × 2",
        "21,600"
      ],
      [
        "Year 3 (six months)",
        "10,800 × 6/12",
        "5,400"
      ],
      [
        "Accumulated depreciation at sale",
        "21,600 + 5,400",
        "27,000"
      ],
      [
        "Carrying amount",
        "60,000 − 27,000",
        "33,000"
      ],
      [
        "Sale proceeds",
        "Bank receipt",
        "32,000"
      ],
      [
        "LOSS ON DISPOSAL",
        "32,000 − 33,000",
        "(1,000)"
      ]
    ],
    "check": "Transfer gross asset cost and accumulated depreciation to disposal, record proceeds and charge the RM1,000 loss to profit or loss.",
    "trap": "The RM32,000 cash received is not the profit on disposal; compare it with the RM33,000 carrying amount."
  },
  "FA2:D5": {
    "heading": "Distinguish accrued expenses from prepayments",
    "intro": "An accrual records this period's unpaid cost; a prepayment carries unconsumed expenditure into the next period.",
    "headers": [
      "Adjustment",
      "Working",
      "Profit or loss",
      "Financial position"
    ],
    "rows": [
      [
        "Electricity accrued",
        "Cash 11,200 + close accrual 1,300 − open accrual 900",
        "Expense RM11,600",
        "Close accrual RM1,300 liability"
      ],
      [
        "Prepaid rent",
        "Cash 14,000 + open prepay 2,400 − close prepay 3,000",
        "Expense RM13,400",
        "Prepay RM3,000 asset"
      ],
      [
        "Accrued fee income",
        "Earned not yet billed RM4,500",
        "Income RM4,500",
        "Accrued income RM4,500 asset"
      ],
      [
        "Deferred income",
        "Cash received RM6,000 for three months; one month performed",
        "Revenue RM2,000",
        "Deferred income RM4,000 liability"
      ]
    ],
    "check": "Each adjustment must balance Dr and Cr: accrual Dr expense / Cr liability; prepayment Dr asset / Cr expense; accrued income Dr asset / Cr income.",
    "trap": "Never record the full cash receipt as income if the related services are still unperformed."
  },
  "FA2:D6": {
    "heading": "Trade receivables, irrecoverable debts and allowance",
    "intro": "Gross receivables RM56,000 before a confirmed RM3,000 write-off; opening allowance RM1,500, new required allowance 4% of remaining debt.",
    "headers": [
      "Step",
      "Working",
      "RM"
    ],
    "rows": [
      [
        "Remove specific irrecoverable debt",
        "56,000 − 3,000",
        "53,000 gross"
      ],
      [
        "Calculate closing allowance",
        "53,000 × 4%",
        "2,120 credit"
      ],
      [
        "Movement in allowance",
        "2,120 − 1,500 opening",
        "620 expense"
      ],
      [
        "Total current-year charge",
        "3,000 write-off + 620 allowance increase",
        "3,620"
      ],
      [
        "NET RECEIVABLES",
        "53,000 − 2,120",
        "50,880"
      ]
    ],
    "check": "Dr irrecoverable expense 3,000 Cr receivables 3,000. Dr allowance movement expense 620 Cr allowance 620.",
    "trap": "Charge the change in allowance, not the entire closing allowance for a second time."
  },
  "FA2:E1": {
    "heading": "Bank reconciliation from cash book to statement",
    "intro": "Cash book Dr RM18,500; omitted charges RM250, insurance direct debit RM600 and direct receipt RM1,400. Cheques RM2,100 unpresented, deposits RM3,000 outstanding.",
    "headers": [
      "Reconciliation",
      "Adjust (+)/(−)",
      "Balance RM"
    ],
    "rows": [
      [
        "Cash book before corrections",
        "Opening debit balance",
        "18,500"
      ],
      [
        "Bank charges",
        "−250",
        "18,250"
      ],
      [
        "Direct debit insurance",
        "−600",
        "17,650"
      ],
      [
        "Direct customer receipt",
        "+1,400",
        "19,050 adjusted book"
      ],
      [
        "Add unpresented cheques",
        "+2,100",
        "21,150"
      ],
      [
        "Less outstanding deposits",
        "−3,000",
        "18,150 BANK STATEMENT"
      ]
    ],
    "check": "Reverse check: statement 18,150 + deposits 3,000 − unpresented 2,100 = adjusted book 19,050.",
    "trap": "Only unrecorded book transactions require new ledger journals; timing differences normally do not."
  },
  "FA2:G1": {
    "heading": "Trading account and profit calculation",
    "intro": "Prepare the statement of profit or loss using all sales and inventory adjustments. Here the figures are net of tax.",
    "headers": [
      "Statement of profit or loss",
      "Calculation",
      "RM"
    ],
    "rows": [
      [
        "Sales less returns",
        "120,000 − 4,000",
        "116,000"
      ],
      [
        "Net purchases",
        "66,000 − 3,000",
        "63,000"
      ],
      [
        "Cost of sales",
        "15,000 opening + 63,000 − 18,000 closing",
        "60,000"
      ],
      [
        "GROSS PROFIT",
        "116,000 − 60,000",
        "56,000"
      ],
      [
        "Administration",
        "Given",
        "(17,000)"
      ],
      [
        "Depreciation",
        "Given",
        "(4,000)"
      ],
      [
        "Loan interest",
        "Given",
        "(2,000)"
      ],
      [
        "NET PROFIT",
        "56,000 − 23,000",
        "33,000"
      ]
    ],
    "check": "Reconcile gross profit to net profit and ensure closing inventory appears in the statement of financial position, not as revenue.",
    "trap": "Finance proceeds and owner capital are not operating revenue; returns reduce the side of trading to which they belong."
  },
  "FA2:F2": {
    "heading": "Correct a capital-versus-revenue error",
    "intro": "Machinery costing RM5,000 was incorrectly debited to repairs. Credit Bank was already correctly entered. Annual depreciation should be RM500.",
    "headers": [
      "Entry",
      "Debit",
      "Credit",
      "Impact"
    ],
    "rows": [
      [
        "Correct misclassification",
        "Machinery 5,000",
        "Repairs 5,000",
        "Raises asset, reverses expense"
      ],
      [
        "Record depreciation",
        "Depreciation expense 500",
        "Accumulated depreciation 500",
        "Correct annual allocation"
      ],
      [
        "Net profit correction",
        "+5,000 reversal",
        "−500 depreciation",
        "+RM4,500 to profit"
      ]
    ],
    "check": "Bank is not credited a second time: it was correctly reduced on purchase. Net machinery increases by RM4,500.",
    "trap": "A balanced trial balance does not reveal this mistake; both sides were posted originally."
  },
  "FA2:H2": {
    "heading": "Partnership appropriation statement",
    "intro": "Profit RM90,000, partner A capital RM100,000, B capital RM80,000. Interest on capital 5%, salary allowance A RM12,000 and B RM9,000, residual ratio A:B 3:2.",
    "headers": [
      "Appropriation",
      "Partner A RM",
      "Partner B RM",
      "Total RM"
    ],
    "rows": [
      [
        "Interest on capital",
        "5,000",
        "4,000",
        "9,000"
      ],
      [
        "Salary allowance",
        "12,000",
        "9,000",
        "21,000"
      ],
      [
        "Residual profit (60,000 × 3:2)",
        "36,000",
        "24,000",
        "60,000"
      ],
      [
        "TOTAL PROFIT SHARE",
        "53,000",
        "37,000",
        "90,000"
      ]
    ],
    "check": "Residual RM90,000 − RM9,000 interest − RM21,000 salary = RM60,000, distributed RM36,000 and RM24,000.",
    "trap": "Partners' salary allowances are profit appropriation, not an extra employee wage expense under this scenario."
  },
  "MA1:C1": {
    "heading": "High–low semi-variable cost separation",
    "intro": "At 600 units cost is RM6,600; at 1,000 units cost is RM9,000. Calculate variable and fixed components.",
    "headers": [
      "Quantity / calculation",
      "Working",
      "Answer"
    ],
    "rows": [
      [
        "Activity change",
        "1,000 − 600",
        "400 units"
      ],
      [
        "Cost change",
        "9,000 − 6,600",
        "RM2,400"
      ],
      [
        "Variable cost per unit",
        "2,400 / 400",
        "RM6"
      ],
      [
        "Fixed cost",
        "9,000 − 1,000 × 6",
        "RM3,000"
      ],
      [
        "Forecast at 800 units",
        "3,000 + 800 × 6",
        "RM7,800"
      ]
    ],
    "check": "Check using low point: 3,000 + 600 × 6 = RM6,600. Both observations agree with the same estimate.",
    "trap": "Use the highest and lowest ACTIVITY levels, not necessarily the most expensive and cheapest periods."
  },
  "MA2:C1": {
    "heading": "Overhead apportionment, service transfer and absorption",
    "intro": "Factory rent RM24,000 allocated by floor area Cutting 500m², Assembly 300m², Maintenance 200m². Maintenance direct cost RM8,000 and transfers 70% to Cutting, 30% to Assembly.",
    "headers": [
      "Cost step",
      "Cutting RM",
      "Assembly RM",
      "Maintenance RM"
    ],
    "rows": [
      [
        "Rent by floor area",
        "12,000",
        "7,200",
        "4,800"
      ],
      [
        "Direct departmental overhead",
        "20,000",
        "10,000",
        "8,000"
      ],
      [
        "Before service reallocation",
        "32,000",
        "17,200",
        "12,800"
      ],
      [
        "Maintenance allocation",
        "8,960",
        "3,840",
        "(12,800)"
      ],
      [
        "FINAL PRODUCTION OVERHEAD",
        "40,960",
        "21,040",
        "0"
      ]
    ],
    "check": "40,960 + 21,040 = RM62,000, which equals rent 24,000 + direct overheads 20,000 + 10,000 + 8,000. OAR Cutting = 40,960/4,000 MH = RM10.24/MH.",
    "trap": "Don't absorb Maintenance overhead twice: transfer its entire service balance to production departments before calculating final OARs."
  },
  "MA2:C2": {
    "heading": "Reconcile absorption and marginal profits",
    "intro": "Production 1,000 units, sales 800 @RM30; variable production cost RM12/unit, variable selling RM2/unit sold, fixed production RM6,000, fixed admin RM3,000, no opening stock.",
    "headers": [
      "Profit bridge",
      "Marginal RM",
      "Absorption RM"
    ],
    "rows": [
      [
        "Revenue 800 × RM30",
        "24,000",
        "24,000"
      ],
      [
        "Variable production cost of sales",
        "(9,600)",
        "—"
      ],
      [
        "Absorption cost of sales 800 × RM18",
        "—",
        "(14,400)"
      ],
      [
        "Variable selling expenses",
        "(1,600)",
        "(1,600)"
      ],
      [
        "Fixed production period expense",
        "(6,000)",
        "Included in cost"
      ],
      [
        "Fixed admin",
        "(3,000)",
        "(3,000)"
      ],
      [
        "PROFIT",
        "3,800",
        "5,000"
      ]
    ],
    "check": "Absorption exceeds marginal by RM1,200 = increase in finished goods inventory 200 units × RM6 fixed production OAR/unit.",
    "trap": "Don't add fixed overhead again to absorption profit after it has already been included in product cost."
  },
  "MA2:C4": {
    "heading": "Process costing — normal and abnormal loss",
    "intro": "Input 1,000 units costing RM18,100. Normal loss 10%, scrap value RM1 each, actual good output 860 units and actual lost units 140.",
    "headers": [
      "Cost reconciliation",
      "Units",
      "Cost RM"
    ],
    "rows": [
      [
        "Expected normal loss",
        "100",
        "100 scrap credit"
      ],
      [
        "Expected good output",
        "900",
        "(18,100 − 100) / 900 = RM20/unit"
      ],
      [
        "Actual good output",
        "860",
        "17,200"
      ],
      [
        "Abnormal loss",
        "40",
        "800 process cost"
      ],
      [
        "PROCESS ACCOUNT CREDIT TOTAL",
        "1,000 (including normal loss)",
        "18,100"
      ],
      [
        "Abnormal loss scrap recovery",
        "40",
        "40"
      ],
      [
        "NET ABNORMAL LOSS EXPENSE",
        "40",
        "760"
      ]
    ],
    "check": "Process control: RM17,200 good output + RM800 abnormal loss + RM100 normal scrap = RM18,100.",
    "trap": "Abnormal loss is valued at process cost first; scrap recovery is recognised against it separately."
  },
  "MA2:D1": {
    "heading": "Break-even, target profit and margin of safety",
    "intro": "Selling price RM40, variable cost RM24/unit, fixed cost RM96,000. Planned sales 8,000 units, target profit RM32,000.",
    "headers": [
      "CVP metric",
      "Working",
      "Answer"
    ],
    "rows": [
      [
        "Contribution per unit",
        "40 − 24",
        "RM16"
      ],
      [
        "Contribution / sales ratio",
        "16 / 40",
        "40%"
      ],
      [
        "Break-even volume",
        "96,000 / 16",
        "6,000 units"
      ],
      [
        "Break-even revenue",
        "96,000 / 40%",
        "RM240,000"
      ],
      [
        "Margin of safety (units)",
        "8,000 − 6,000",
        "2,000 units"
      ],
      [
        "Margin of safety (%)",
        "2,000 / 8,000",
        "25%"
      ],
      [
        "Target-profit sales volume",
        "(96,000 + 32,000) / 16",
        "8,000 units"
      ]
    ],
    "check": "At 8,000 units profit = 8,000 × 16 − 96,000 = RM32,000.",
    "trap": "CVP assumes a stable sales mix and constant price/variable cost within the relevant range."
  },
  "MA2:D3": {
    "heading": "Discounted cash flow and NPV",
    "intro": "Project outlay RM40,000 immediately, three annual cash inflows RM17,000, discount rate 10%. All receipts arise at each year end.",
    "headers": [
      "Year",
      "Cash flow RM",
      "Discount factor @10%",
      "PV RM"
    ],
    "rows": [
      [
        "0",
        "(40,000)",
        "1.000000",
        "(40,000.00)"
      ],
      [
        "1",
        "17,000",
        "0.909091",
        "15,454.55"
      ],
      [
        "2",
        "17,000",
        "0.826446",
        "14,049.59"
      ],
      [
        "3",
        "17,000",
        "0.751315",
        "12,772.35"
      ],
      [
        "NPV",
        "—",
        "Sum using unrounded PVs",
        "+2,276.48"
      ]
    ],
    "check": "NPV = −40,000 + 17,000/1.1 + 17,000/1.1² + 17,000/1.1³ ≈ +RM2,276.48 (small rounding differences).",
    "trap": "Do not discount Year 0 outlay and don't substitute accounting depreciation for cash flow in NPV."
  },
  "MA2:E3": {
    "heading": "Three-month cash budget",
    "intro": "Opening January cash RM5,000. Customers settle 40% in sales month, 60% next month. December/Jan/Feb/Mar credit sales RM10k/RM20k/RM30k/RM24k. Payments Jan/Feb/Mar RM17k/RM31k/RM22k.",
    "headers": [
      "Cash budget",
      "January RM",
      "February RM",
      "March RM"
    ],
    "rows": [
      [
        "Opening cash",
        "5,000",
        "2,000",
        "(5,000)"
      ],
      [
        "40% current month's credit sales",
        "8,000",
        "12,000",
        "9,600"
      ],
      [
        "60% prior month's credit sales",
        "6,000",
        "12,000",
        "18,000"
      ],
      [
        "TOTAL RECEIPTS",
        "14,000",
        "24,000",
        "27,600"
      ],
      [
        "Payments",
        "(17,000)",
        "(31,000)",
        "(22,000)"
      ],
      [
        "CLOSING CASH / OVERDRAFT",
        "2,000",
        "(5,000)",
        "600"
      ]
    ],
    "check": "Cash rises/falls by receipts minus payments each month; February's RM5,000 overdraft is the peak immediate funding requirement.",
    "trap": "A positive March closing cash balance does not eliminate the cash shortage experienced in February."
  },
  "FA1:I2": {
    "heading": "Bank reconciliation using signed balances",
    "intro": "Adjusted cash book debit RM10,500, outstanding lodgement RM2,500, unpresented cheque RM900.",
    "headers": [
      "From cash book to statement",
      "Change RM",
      "Balance RM"
    ],
    "rows": [
      [
        "Adjusted cash book",
        "—",
        "10,500"
      ],
      [
        "Add unpresented cheque",
        "+900",
        "11,400"
      ],
      [
        "Less outstanding lodgement",
        "−2,500",
        "8,900 BANK STATEMENT"
      ]
    ],
    "check": "Check reverse: bank statement 8,900 + outstanding deposit 2,500 − unpresented cheque 900 = cash book 10,500.",
    "trap": "Timing adjustments aren't entered a second time in cash book. Only omitted bank-side transactions require correcting book entries."
  }
};})(window);
