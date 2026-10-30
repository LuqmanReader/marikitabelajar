/* Original LedgerPeer explanatory textbook lessons, management information and cost recording. */
(function(root){'use strict';root.LedgerTextbookMA2A= {
  "MA2:A1": {
    "title": "Management information requirements",
    "sections": [
      [
        "Why information differs across management levels",
        "Strategic decisions affect the whole organisation for several years: capacity, markets, acquisition and capital. Tactical decisions allocate departmental resources and translate strategy into annual plans. Operational decisions concern daily production, scheduling, cash collection and exceptions. Strategic reporting is usually aggregated and forward-looking; operational reporting is detailed and frequent. Information should match the decision rather than repeat a generic financial report."
      ],
      [
        "Financial and non-financial information",
        "Financial measures include revenue, contribution, cost per unit, inventory value and cash forecasts. Non-financial indicators include units rejected, customer complaints, time per service, employee turnover and delivery punctuality. A cost reduction may appear favourable while defects or staff absence deteriorate. A good manager evaluates interrelated indicators with appropriate targets, not a single favourable variance."
      ],
      [
        "Information quality and controls",
        "Relevant information changes a decision; reliable information is free from significant bias or error; complete information contains the relevant population and periods. Timeliness matters because a perfect report arriving after a tender deadline cannot inform the bid. Understandability, comparability, reasonable cost and appropriate precision also matter. Record the source, extraction date, currency, units, assumptions and access rights. Validate input and reconcile totals before presenting results."
      ],
      [
        "Management reporting and responsibility",
        "Reports should show the responsible manager, decision to be made, period, budget, actual, comparative data, explanation of exceptions and proposed action. For a factory, separate matters controlled by the production manager from supplier-price changes controlled by purchasing. An investigation should look for causes and trade-offs, not assume that each adverse variance is employee failure."
      ]
    ],
    "workings": [
      [
        "Decision-level classification",
        "Management considers (1) entering a new country; (2) setting next quarter's production; (3) reallocating today's staff when a machine fails.",
        "1 Strategic, 2 tactical, 3 operational. The appropriate horizon and degree of detail change accordingly."
      ],
      [
        "Data-quality diagnosis",
        "A sales dashboard combines USD and MYR transactions as if they were identical, and contains duplicate invoices.",
        "Separate currencies and apply a clearly stated FX rule for a consistent period; deduplicate at invoice ID, reconcile to the sales ledger, document excluded rows and report both transaction count and reconciled value."
      ]
    ]
  },
  "MA2:A2": {
    "title": "Cost accounting systems",
    "sections": [
      [
        "Purpose and structure",
        "A cost accounting system gathers costs by cost centre, cost object and period so management can price products, control resources and prepare budgets. A cost object may be a job, batch, process, service, department or customer. The system should be more detailed than external financial reporting where decisions require it."
      ],
      [
        "Integrated and interlocking systems",
        "In an integrated system, financial and cost accounts share one set of general ledger records. An interlocking system maintains separate financial and cost ledgers, using control accounts to reconcile movements. In either case the amount of direct materials issued, payroll allocated, overhead incurred, work in progress and finished goods should be traceable to authorised underlying records."
      ],
      [
        "Cost flow through manufacturing",
        "Raw materials purchased increase material inventory. Materials issued for production are charged to work in progress (WIP); labour and production overhead follow. Finished units move from WIP to finished goods, and units sold move from finished goods to cost of sales. Indirect costs initially collect in overhead control before being absorbed. At each stage check beginning balance + additions − transfers = ending balance."
      ],
      [
        "Coding and documentation",
        "Purchase requisitions and goods received notes establish authorised receipts. Material issue notes transfer materials to a job, while timesheets and job cards track hours. Cost codes identify direct/indirect, cost centre and product. An incorrectly coded record can give a fully balanced but misleading cost account; regular reconciliation and exception reports are necessary."
      ]
    ],
    "workings": [
      [
        "Manufacturing flow reconciliation",
        "Opening WIP $4,000, direct material $12,000, direct labour $8,000, absorbed production overhead $6,000 and closing WIP $5,000.",
        "Production cost transferred to finished goods = 4,000 + 12,000 + 8,000 + 6,000 − 5,000 = $25,000. The $5,000 closing WIP stays in current assets."
      ],
      [
        "Cost reconciliation",
        "The financial ledger records factory overhead $10,200 while production jobs have absorbed $9,800.",
        "Under-absorption is $400. Investigate the difference and account for it under the system's specified policy rather than silently making overhead equal the absorbed figure."
      ]
    ]
  },
  "MA2:A3": {
    "title": "Cost classification",
    "sections": [
      [
        "Element and function",
        "Direct materials, direct labour and direct expenses can be traced economically to one unit or job. Indirect costs are overhead. Production overhead supports factory activity; administration, selling and distribution relate to other functions. Prime cost equals the total of direct material, direct labour and direct expenses. Production cost adds production overhead; total cost for internal analysis may also include non-production costs."
      ],
      [
        "Behaviour and relevant range",
        "A variable cost changes in total with activity while remaining approximately constant per unit within the relevant range; for example $4 of raw material per unit. Fixed cost remains constant in total over a defined activity range, so its cost per unit falls as output increases. Stepped fixed costs rise when capacity thresholds are crossed. Semi-variable costs have fixed and variable components. Real costs are often non-linear outside the relevant range."
      ],
      [
        "High-low estimation",
        "When two observations are sufficiently comparable, variable rate per unit = change in total cost / change in activity. The fixed component equals total cost minus variable cost at either observation. Use the highest and lowest activity levels, not necessarily the highest and lowest cost amounts. Abnormal events and changing prices may make the estimate unreliable."
      ],
      [
        "Product, period and decision classifications",
        "Product cost is attached to inventory until sale under the relevant costing method. Period cost is charged in the period. A sunk cost has already been incurred and cannot be changed; an opportunity cost is the benefit foregone by choosing an alternative. Relevant costs are future, incremental and differ between choices; fixed costs can be relevant when avoidable."
      ],
      [
        "Contribution and control",
        "Controllable costs can be influenced by the manager over the relevant timescale; an allocated head-office rental charge might not be. Understand what cost classification is needed before applying a formula. 'Fixed' does not automatically mean irrelevant: hiring a supervisor specifically for a new contract is a future incremental cost."
      ]
    ],
    "workings": [
      [
        "High-low worked example",
        "At 2,000 units total cost is $15,000; at 5,000 units total cost is $24,000.",
        "Variable cost = (24,000−15,000)/(5,000−2,000) = $3/unit. Fixed cost = 24,000−5,000×3 = $9,000. Expected cost at 4,000 units = 9,000+4,000×3 = $21,000."
      ],
      [
        "Relevant versus sunk",
        "A machine was bought for $30,000 last year. A special order requires materials $4,000 and pays $7,000, but accepting it would forgo rental income $1,500.",
        "Historical machine cost $30,000 is sunk. Relevant benefit = 7,000−4,000−1,500 = $1,500 (before any other avoidable cost); accept if no qualitative restriction or better alternative."
      ],
      [
        "Stepped fixed cost",
        "A machine supervisor costs $2,800 per month and can cover 3 machines. Production increases from 3 to 4 machines.",
        "One extra supervisor is required if each covers at most three machines. The change is a step cost of $2,800, not a smooth variable rate per unit."
      ]
    ]
  },
  "MA2:A4": {
    "title": "Information for comparison and performance",
    "sections": [
      [
        "Choosing a meaningful benchmark",
        "A budget provides a planned benchmark; a previous year's actual figure supplies historical performance; a benchmark from a comparable business can reveal operating differences. Compare the same activity definition and season. A higher total expenditure may reflect increased output rather than inefficiency. State any restrictions on controllability and mix."
      ],
      [
        "Fixed budget versus flexed budget",
        "The original fixed budget uses budgeted activity, while a flexed budget restates variable costs and revenues at actual activity using budgeted rates. Fixed costs ordinarily remain at planned amounts within the relevant range. The flexed budget separates the effect of doing more or fewer units from the cost/price performance at actual volume."
      ],
      [
        "Variance conventions",
        "For revenue, actual minus flexed budget is favourable if positive; for cost, flexed budget minus actual is favourable if positive. Clearly label F/A rather than relying on sign alone. An adverse cost variance is not automatically managerial negligence: inflation, quality upgrades, abnormal scrap and breakdowns can be explanatory factors."
      ],
      [
        "Exception reporting and investigation",
        "Management by exception concentrates attention on material, recurring, controllable or unusual differences. Set a tolerance by amount, percentage and risk. Comparing actual to budget only says that a deviation exists; investigate invoices, output units, material grades, waste records, supplier agreements and production downtime to find why."
      ],
      [
        "Management action",
        "Separate decisions about reducing waste from altering purchasing prices or revising an unrealistic plan. Consider whether the cost of investigating a difference is lower than the expected benefit. Avoid gaming a favourable variance at the expense of product quality or future capacity."
      ]
    ],
    "workings": [
      [
        "Complete flexed budget",
        "Plan 1,000 units at price $20, variable production $7/unit, variable selling $2/unit and fixed costs $5,000. Actual volume 1,200 units; revenue $23,000; variable production $8,700; selling $2,600; fixed $5,100.",
        "Original contribution = 1,000×(20−7−2)=$11,000; original profit $6,000. Flexed revenue 1,200×20=$24,000; flexed variable production $8,400; selling $2,400; fixed $5,000; flexed profit $8,200. Actual profit 23,000−8,700−2,600−5,100=$6,600. Performance variance against flexed profit $1,600 adverse."
      ],
      [
        "Break down profit variance",
        "Use the previous scenario and compute component variances.",
        "Revenue $1,000 A (23,000 versus 24,000); production $300 A; variable selling $200 A; fixed $100 A. Total $1,600 A. The volume effect is separate: flexed profit $8,200 minus original $6,000 = $2,200 favourable."
      ]
    ]
  },
  "MA2:A5": {
    "title": "Reporting management information",
    "sections": [
      [
        "Purpose of a good report",
        "A management report enables a specified decision, not just the display of raw data. State the intended audience, period, currency, units, basis, assumptions and the one or two main actions required. For a busy supervisor, a concise exception list may be better than twenty pages of ledger balances; a finance manager may need detailed reconciliations."
      ],
      [
        "Tables, ratios and trends",
        "Choose absolute and percentage changes together because a 100% increase from one transaction to two can be immaterial. Show denominators for ratios, consistent time periods and meaningful precision. Graph axes must have a clear scale; stacked bars display composition while line graphs make trends clearer. Do not hide negative values or use 3D charts that distort comparison."
      ],
      [
        "Spreadsheets and processing",
        "Source data should be separate from calculations and presentation. Use consistent formats and validation; label inputs, ensure that copied formulas use the proper relative or absolute references, and independently reconcile row counts and totals. Protect formulas if the audience will only change assumptions. Remember that a spreadsheet can calculate a wrong model very accurately."
      ],
      [
        "Communication and confidentiality",
        "Reports may contain personal payroll data, commercial prices or customer information. Share only with authorised users, keep version and access control, and explain uncertainty rather than giving apparent precision. Discuss root causes and recommended decisions, not only raw variances."
      ]
    ],
    "workings": [
      [
        "Comparability check",
        "Revenue rises from $50,000 to $58,000 but selling prices increased 10% while volume is unchanged.",
        "Nominal growth = 16%. Revenue at the new prices but old volume would be $55,000 if all prices rose evenly by 10%; the remaining $3,000 requires investigation into mix, product composition or changed assumption rather than attribution to higher volume."
      ],
      [
        "Variance communication",
        "A report says 'transport costs are 20% over budget' with no amounts or context.",
        "Improve it to 'Transport $12,000 actual versus $10,000 budget ($2,000/20% adverse), with 18% extra deliveries; compare flexed cost per delivery and late-delivery rates before action.'"
      ]
    ]
  },
  "MA2:B1": {
    "title": "Accounting for materials",
    "sections": [
      [
        "The purchases-to-issue cycle",
        "A requisition authorises purchase; a purchase order sets specifications; a goods received note confirms quantity; an invoice records price and credit obligation. The stores ledger tracks receipts, issues and balances in quantity and value. Material issue notes identify whether material belongs to a job (direct) or factory support (indirect). Regular stocktakes compare physical inventory with records."
      ],
      [
        "Inventory control and reorder decisions",
        "Reorder level often equals maximum usage × maximum lead time; minimum stock can be based on reorder level less average usage × average lead time; maximum stock = reorder level + reorder quantity − minimum usage × minimum lead time under the common textbook model. Always use the definitions in the question. Economic order quantity (EOQ) minimises the sum of annual ordering and holding cost under simplified constant demand assumptions."
      ],
      [
        "EOQ and its limitations",
        "EOQ = square root(2 × annual demand × cost per order / annual holding cost per unit). It assumes stable usage and costs, immediate replenishment and no stockouts. Bulk discounts, unpredictable supplier delays and deterioration may make the classical optimum unsuitable. Evaluate annual relevant ordering and holding cost at candidate quantities."
      ],
      [
        "Pricing material issues",
        "FIFO assumes earliest acquired stock is issued first; weighted average combines purchase prices. Perpetual AVCO recalculates average after each receipt, whereas periodic AVCO uses all purchases during the period. Opening inventory and purchase net amounts determine issue price; remaining stock must reconcile in units and value. Use the method specified, not whichever gives a lower cost."
      ],
      [
        "Loss, waste and records",
        "Normal waste can form part of good unit cost, depending on the process and stated policy. Abnormal waste is analysed separately. Inventory records, count differences, obsolete stocks, returns and supplier credits require appropriate investigation and adjustments. Control totals for receipts, issues and closing quantities should reconcile."
      ]
    ],
    "workings": [
      [
        "Perpetual FIFO and AVCO",
        "Opening 100 units @$5; buy 100 @$7; issue 120; then buy 80 @$8.",
        "FIFO issue 100×5 + 20×7 = $640. FIFO balance after issue 80×7=$560; after purchase 80×8, closing balance $1,200 for 160 units. Perpetual weighted average before issue = (500+700)/200=$6; issue $720; remaining $480; buy $640 gives closing $1,120/160=$7 per unit."
      ],
      [
        "EOQ example",
        "Annual demand 16,000 units, ordering cost $50/order, annual holding cost $2/unit.",
        "EOQ = √(2×16,000×50/2) = √800,000 ≈ 894.43, approximately 894 or 895 units. Check purchase constraints before rounding orders."
      ],
      [
        "Reorder level",
        "Usage 50–80 units/day, lead time 4–6 days. Compute reorder level with the common maximum-usage model.",
        "Reorder level = 80×6 = 480 units. It is a stock trigger based on assumptions, not an absolute assurance against all delays."
      ]
    ]
  },
  "MA2:B2": {
    "title": "Accounting for labour",
    "sections": [
      [
        "Time-related and output-related pay",
        "Under time rates, gross earnings equal approved hours × basic rate, adjusted for overtime premiums, bonuses and allowances. Piecework ties payment to accepted production units and often includes a minimum pay guarantee. Higher output incentives can lower cost per unit but risk poor quality or unsafe speed if monitoring is weak."
      ],
      [
        "Payroll versus labour costing",
        "Payroll calculates what employees and external bodies are owed; cost accounting allocates labour to jobs, production support, maintenance and idle time. A worker's entire gross wage is not necessarily direct labour. A time card captures attendance, while a job card records which task used those hours. Reconcile the two to identify unassigned and idle time."
      ],
      [
        "Overtime and idle time",
        "The treatment of overtime premium depends on its cause: a customer's urgent job may be charged directly if traceable, while general factory overtime premium may be production overhead. Normal idle-time cost is often absorbed in overhead; abnormal idle time is separately analysed. Follow the exam question's accounting policy."
      ],
      [
        "Turnover and productivity ratios",
        "Labour turnover (replacement basis) = replacements/average workforce ×100%; the separation basis uses leavers instead. Efficiency = standard hours for achieved output/actual production hours ×100%; capacity = actual production hours/budgeted hours ×100%; production-volume = standard hours/budgeted hours ×100%. Idle time ratio requires a clearly specified denominator."
      ],
      [
        "Controls and accounting",
        "Authorise staff changes, time entries, overtime and pay rate updates. Reconcile gross-to-net pay and post deductions as liabilities, not as a second employee expense. For direct labour transferred to WIP, debit WIP; charge indirect production labour to overhead control. Distinguish employer tax contributions from employee deductions."
      ]
    ],
    "workings": [
      [
        "Gross/net pay and overtime",
        "Basic rate $14/hour; 40 standard hours and 7 overtime hours paid at time-and-a-half; deductions $105.",
        "Basic = 40×14=$560; overtime = 7×21=$147; gross $707; net $602. Employee deductions $105 are payable to third parties and not another expense added to gross wages."
      ],
      [
        "Labour ratio reconciliation",
        "Budgeted hours 1,200; actual production hours 1,050; standard hours for completed units 1,000.",
        "Efficiency 1,000/1,050=95.24%. Capacity 1,050/1,200=87.5%. Production-volume 1,000/1,200=83.33%. Multiplying efficiency by capacity gives approximately 83.33%."
      ]
    ]
  },
  "MA2:B3": {
    "title": "Accounting for other expenses",
    "sections": [
      [
        "Other expenses in a cost system",
        "Besides materials and labour, organisations incur rent, depreciation, utilities, insurance, repairs, royalties, subcontractor charges and administrative/selling expenses. A direct expense is separately traceable to one cost unit; factory rent and depreciation are generally indirect production overhead."
      ],
      [
        "Accruals and prepayments",
        "Costs belong to the period in which benefits are consumed, not necessarily when cash is paid. An unpaid factory electricity bill increases factory overhead and an accrual liability; a prepaid factory insurance policy represents an asset until consumed. The same timing concept applies to non-production expenses but classification into product cost changes."
      ],
      [
        "Allocation and apportionment",
        "An overhead clearly arising in one cost centre is allocated there. Shared overheads are apportioned using a fair basis, such as floor area for rent, equipment value for insurance and machine hours for factory power. Apply each chosen rate to the correct driver and distinguish service cost centre from production cost centre."
      ],
      [
        "Classification and controls",
        "Maintain schedules for depreciation, annual insurance, rent reviews and standing orders. Reconcile actual supplier invoices, accruals and allocations. Avoid adding administration costs to inventory simply to inflate product cost under financial reporting; internal total-cost analysis and inventory valuation serve different purposes."
      ]
    ],
    "workings": [
      [
        "Accrued factory cost",
        "Factory electricity is $3,600 for the final quarter but $600 remains unpaid at year end.",
        "Record $3,600 factory overhead for the quarter. If cash paid $3,000 has been recorded, debit overhead $600 and credit accrual $600. This changes overhead incurred, not necessarily the overhead absorbed to jobs."
      ],
      [
        "Rent apportionment",
        "Total factory rent $18,000; departments occupy 500, 300 and 200 m².",
        "Total 1,000 m²; apportion $9,000, $5,400 and $3,600 respectively. The cost-centre balances together must equal $18,000."
      ]
    ]
  }
};})(window);
