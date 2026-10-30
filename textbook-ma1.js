/* Original LedgerPeer detailed MA1 textbook lessons A1–E3. */
(function(root){'use strict';root.LedgerTextbookMA1={
  "MA1:A1": {
    "title": "Business organisations and accounting systems",
    "sections": [
      [
        "Organisation types and objectives",
        "Sole traders, partnerships, incorporated companies and public/non-profit entities differ in ownership, liability, governance and performance aims. Accounting supports stewardship and decisions regardless of whether profit is the primary objective. A distinct legal entity often separates personal and business assets; record owner contributions and drawings correctly."
      ],
      [
        "Financial versus management accounting",
        "Financial accounts summarise performance and position for external and internal users using prescribed accounting principles. Management accounts support internal planning, costing, budgeting and control and may use future estimates and non-financial indicators. They can be produced daily or by product; there is no requirement that internal costs equal external accounting classifications."
      ],
      [
        "Records and systems",
        "Transactions pass from source documents through classification, journals and ledgers to reports. An integrated accounting system shares records across modules; separate subsystems require reconciliation. A coding structure should distinguish products, departments, types of cost and responsibility centres."
      ],
      [
        "Control and accuracy",
        "Validation, authorisation, separation of duties, backing up data and reconciliation reduce errors. A report based on double-counted invoices is misleading even if its spreadsheet formula is mathematically correct. Use consistent dates, currencies, units and versions."
      ]
    ],
    "workings": [
      [
        "Classification scenario",
        "A charity's director needs cost per meal, weekly cash balance and annual statement of financial position.",
        "Cost per meal and weekly cash forecast are internal management information; statement of financial position summarises assets, liabilities and equity/net funds for reporting. The charity may optimise service coverage rather than profit."
      ],
      [
        "Owner capital",
        "An individual sets up a sole trader business with RM15,000 cash and immediately withdraws RM1,000 for personal use.",
        "Assets and equity rise RM15,000 on investment, then both fall RM1,000 on drawings. Withdrawals are not operating expenses."
      ]
    ]
  },
  "MA1:A2": {
    "title": "Nature and purpose of management information",
    "sections": [
      [
        "Decision information",
        "Managers need relevant information for long-term strategy, medium-term resource planning and day-to-day operations. The highest-level report may show broad demand and investment forecasts, while a shift supervisor needs timely machine output and material waste figures. Different decisions need different frequency and precision."
      ],
      [
        "Financial and non-financial measures",
        "Cost, revenue, profit, contribution and cash are financial. Delivery time, defect count, absenteeism, quality and customer retention are non-financial. Use a balanced set: lower cost per unit from poor quality is not automatically improvement."
      ],
      [
        "Quality of information",
        "Relevant, timely, accurate enough, complete, comparable, understandable and economical information supports better decisions. Source and scope must be identifiable; a mean alone can conceal an extreme. Historical data is not a guarantee of future demand."
      ],
      [
        "Reports and feedback",
        "A useful report states objectives, planned and actual figures, the variance, possible causes and action owners. Exceptions deserve investigation proportionate to materiality; avoid automatic blame or treating every percentage movement as important."
      ]
    ],
    "workings": [
      [
        "Capacity decision",
        "Manager sees monthly output 7,000 units versus plan 6,000, but customer returns rise from 1% to 6%.",
        "Higher volume is favourable numerically, but returns indicate potentially worsening quality and net contribution. Report both metrics and investigate causes."
      ],
      [
        "Report context",
        "Costs rose RM4,000 from RM20,000 to RM24,000 while output rose 1,000 from 4,000 to 5,000 units.",
        "Old unit cost RM5; new RM4.80. Higher total spending alone does not indicate inefficiency."
      ]
    ]
  },
  "MA1:B1": {
    "title": "Transaction processing systems",
    "sections": [
      [
        "Core transaction cycles",
        "Purchasing records requests, orders, receipts, invoices and payments; sales tracks customer orders, dispatch, invoices and receipts; payroll captures approved hours and deductions; inventory tracks receipt, issues and stock balances. Each cycle feeds both financial accounts and management data."
      ],
      [
        "Input, process and output",
        "Capture data accurately with validation (range, format and presence checks); process through authorised coded calculations; produce reconciled reports. A batch total control helps detect missing records, and a hash or document identifier may detect duplicate processing."
      ],
      [
        "Batch versus real-time processing",
        "Batch processing groups transactions for periodic posting, useful for payroll; real-time systems update stock or customer balances instantly. Both need backup, audit trail and restricted access. Timeliness may outweigh cost for urgent inventory visibility."
      ],
      [
        "Errors and controls",
        "A system can accept a valid-looking but fraudulent invoice. Separate authorisation from entry and payment, match purchase documents and reconcile bank/output totals. Investigate exceptions rather than alter source data to force agreement."
      ]
    ],
    "workings": [
      [
        "Batch control",
        "Five approved invoices total RM3,800, but system posts only RM3,200.",
        "Batch control mismatch RM600. Identify missing/incorrect invoice by document ID before accepting the run."
      ],
      [
        "Validation versus verification",
        "A payroll field accepts dates but contains 2027 instead of 2026; amount within allowed range has an incorrect payee.",
        "Format validation may pass despite erroneous facts. Verification against approved payroll data and period check is still needed."
      ]
    ]
  },
  "MA1:B2": {
    "title": "Coding systems",
    "sections": [
      [
        "Why codes matter",
        "Codes identify transactions, materials, departments and accounts consistently, facilitating sorting, analysis and machine processing. An account code should be unique and mapped to an explicit description, not arbitrarily reused for multiple categories."
      ],
      [
        "Hierarchical and sequential codes",
        "Sequential codes identify items without embedding meaning; block/hierarchical codes can group cost centres or categories (such as 4xxx selling expenses). Mnemonic codes use meaningful letters but can be ambiguous. Choose depending on scalability, readability and data integrity."
      ],
      [
        "Control over code creation",
        "Authorise new codes, retire redundant accounts, prevent duplicates, maintain a cross-reference to prior codes and document ownership. A wrong code can change a cost-centre report without changing overall financial ledger balance."
      ],
      [
        "Reporting by code",
        "Consistent coding enables comparisons by product, location, cost category and budget responsibility. Beware that a new product or merged department can break historical comparability; use mapping tables when necessary."
      ]
    ],
    "workings": [
      [
        "Design coded structure",
        "Company has three departments (production, sales, admin) and three cost types (wages, rent, electricity).",
        "Example code DD-CC with DD 10/20/30 and CC 01/02/03; 10-02 identifies production rent, 20-01 sales wages. Keep an independently controlled dictionary and validate codes."
      ],
      [
        "Miscoding",
        "RM1,500 machine maintenance is coded to administration instead of production.",
        "Reclassify RM1,500 from admin expense to factory overhead in management records; the organisation-wide expense may be unchanged, but reported product cost is wrong."
      ]
    ]
  },
  "MA1:C1": {
    "title": "Cost classification and behaviour",
    "sections": [
      [
        "Direct/indirect and production/non-production",
        "Direct material and direct labour trace to a cost unit; indirect cost is overhead. Production overhead supports output, while distribution/admin/selling costs relate to other functions. Prime cost = direct material + direct labour + direct expenses. Production cost = prime cost + production overhead."
      ],
      [
        "Variable, fixed and semi-variable",
        "Variable total cost changes with volume but per-unit rate may stay constant; fixed total cost remains stable within a relevant range; stepped fixed costs rise at capacity thresholds; semi-variable costs include fixed and variable portions. An average total cost per unit includes a spread of fixed cost and is not always the cost of one more unit."
      ],
      [
        "High-low method",
        "Select highest and lowest activity observations, derive variable cost/unit from cost change per activity difference, then infer fixed cost from total cost minus variable component. The method is approximate and can be distorted by abnormal costs or inflation."
      ],
      [
        "Decision cost categories",
        "Avoidable future costs and opportunity costs are relevant to alternatives; historical sunk costs are not. 'Fixed' and 'variable' describe behaviour, while 'direct' and 'indirect' describe traceability. A cost may be fixed and direct, or variable and indirect."
      ]
    ],
    "workings": [
      [
        "High-low",
        "At 600 units cost RM6,600; at 1,000 units cost RM9,000.",
        "Variable rate=(9,000−6,600)/(1,000−600)=RM6/unit. Fixed cost=9,000−1,000×6=RM3,000. Forecast at 800 units RM7,800."
      ],
      [
        "Prime and production cost",
        "Direct material RM4,000, labour RM2,000, direct expenses RM600 and production overhead RM1,500.",
        "Prime cost RM6,600; production cost RM8,100. Exclude selling cost from manufacturing inventory cost."
      ]
    ]
  },
  "MA1:C2": {
    "title": "Cost units, centres and responsibility centres",
    "sections": [
      [
        "Cost unit and cost centre",
        "A cost unit is the product/service quantity for which cost is measured, such as one batch, item, passenger-kilometre or patient-day. A cost centre is a location, department or activity collecting costs, such as assembly or maintenance. They are different levels of analysis."
      ],
      [
        "Profit and investment centres",
        "A profit centre manager is responsible for both revenue and controllable costs; an investment centre adds responsibility for assets/capital invested. Cost centre managers primarily manage cost and service quality. Do not judge a production maintenance team solely on net sales it cannot control."
      ],
      [
        "Allocation and responsibility",
        "Trace directly attributable costs to the appropriate centre; apportion shared charges using a defensible base. A shared head-office cost may not be controllable by branch manager; distinguish controlled expenditure from allocated total cost."
      ],
      [
        "Unit-cost measures",
        "Cost per unit = relevant total cost / correctly defined output units. For hospitals, patient-days may be more meaningful than number of patients; for delivery, tonne-kilometres can reflect service volume better than vehicle count."
      ]
    ],
    "workings": [
      [
        "Service cost unit",
        "Bus operates 300 km with 30 average passengers and costs RM9,000.",
        "Passenger-km =300×30=9,000; cost per passenger-km RM1."
      ],
      [
        "Investment-centre metric",
        "Division makes profit RM24,000 on capital employed RM200,000.",
        "Simple ROI =24,000/200,000 ×100%=12%. Interpretation requires comparable accounting policies and investment risk."
      ]
    ]
  },
  "MA1:D1": {
    "title": "Accounting for materials",
    "sections": [
      [
        "Materials cycle",
        "Materials are ordered, received, stored, issued and monitored using requisitions, orders, GRNs, stores ledger and material issue notes. Direct material flows to jobs; indirect material supports overhead. Keep physical quantities separate from monetary valuation to detect stock shortages."
      ],
      [
        "Reorder measures",
        "A reorder level signals when to order based on expected lead time and usage; safety stock protects uncertainty. EOQ is used under simplified assumptions to balance ordering and holding cost. Real suppliers may impose minimum orders and changing prices."
      ],
      [
        "FIFO and average issues",
        "FIFO values issues at oldest purchase costs and closing stock at more recent costs. Weighted average combines cost per unit; perpetual AVCO changes after every receipt, periodic AVCO at reporting interval. The units balance must reconcile opening + receipts − issues = closing."
      ],
      [
        "Stock control and waste",
        "Cycle counts detect shortages, duplicate movements and obsolete materials. Stock records may disagree with physical inventory because of spoilage, theft or incorrect issue notes. Abnormal loss can require separate reporting."
      ]
    ],
    "workings": [
      [
        "FIFO issue",
        "Opening 50 units @RM4; purchase 100 @RM5; issue 90.",
        "Issue cost=50×4+40×5=RM400; closing 60 units at RM5 =RM300."
      ],
      [
        "Reorder",
        "Maximum daily usage 40 units; maximum lead time 7 days.",
        "Reorder level=40×7=280 units under maximum-use model."
      ]
    ]
  },
  "MA1:D2": {
    "title": "Accounting for labour",
    "sections": [
      [
        "Pay methods",
        "Time-based wages use hours multiplied by hourly rate, with overtime premiums and bonuses as specified. Piecework rates pay for units, subject to any minimum guarantee. Gross pay includes bonus and overtime; net pay deducts employee statutory and voluntary items."
      ],
      [
        "Direct and indirect labour",
        "Direct production time can be allocated to a product/job; supervision and cleaning are indirect overhead. Timesheets and job cards track attendance, direct tasks, indirect time and idle time. Reconcile hours with payroll to prevent missing costs."
      ],
      [
        "Overtime and idle time treatment",
        "Overtime premium may be directly charged to a specific urgent customer job or treated as overhead depending on cause/policy. Normal idle time may be planned overhead while abnormal downtime warrants separate investigation; do not assume all paid hours produce output."
      ],
      [
        "Labour productivity",
        "Track output per labour hour, standard versus actual hours, absenteeism and replacements. High output with increased rework is not necessarily efficiency; controls on timesheets and supervisor authorisation matter."
      ]
    ],
    "workings": [
      [
        "Gross/net labour",
        "40 hours at RM16 and 5 overtime hours at double rate; deductions RM120.",
        "Basic 40×16=RM640, overtime 5×32=RM160; gross RM800, net RM680."
      ],
      [
        "Direct and indirect",
        "Total labour RM9,000; 70% traceable to individual products.",
        "Direct RM6,300; indirect factory labour RM2,700, assuming remaining all supports production."
      ]
    ]
  },
  "MA1:D3": {
    "title": "Accounting for other expenses",
    "sections": [
      [
        "Nature of overhead",
        "Indirect production overhead includes rent, electricity, equipment depreciation, indirect consumables and repairs. Selling/distribution costs, office administration and finance costs are different functions. A cost may be fixed, variable or mixed independent of its function."
      ],
      [
        "Accrual and prepayment basis",
        "Costs are recognised when incurred. Factory electricity of the period unpaid at year end is accrued; prepaid factory insurance is carried forward as an asset. In cost accounts allocate current-period cost, not simply cash paid."
      ],
      [
        "Allocate and apportion",
        "Allocate specific repair expense entirely to the machine department if traceable. Apportion shared rent using area and shared service cost using an appropriate activity base; document the rationale and reconcile totals."
      ],
      [
        "Controls",
        "Budget and actual comparison must account for changes in activity and capacity. Avoid charging general selling costs to production inventory value without a specific permissible basis."
      ]
    ],
    "workings": [
      [
        "Rent apportionment",
        "Factory rent RM30,000 for A 600m² and B 400m².",
        "Total floor space = 600+400=1,000m². Department A occupies 60%, so allocate RM30,000×60%=RM18,000. Department B occupies 40%, so allocate RM30,000×40%=RM12,000. Reconcile combined allocation RM18,000+RM12,000=RM30,000; no rent cost is lost or duplicated."
      ],
      [
        "Prepayment",
        "Annual factory insurance RM12,000 paid 1 July, year end 31 December.",
        "Six months expense RM6,000; closing prepaid asset RM6,000, assuming level annual coverage."
      ]
    ]
  },
  "MA1:D4": {
    "title": "Accounting for product costs",
    "sections": [
      [
        "Product-cost build",
        "Manufacturing product cost = direct materials + direct labour + direct expenses + production overhead (appropriate absorption). Selling and general administration typically remain period costs for financial reporting, although internal full-cost analysis may allocate them for pricing decisions."
      ],
      [
        "Job, batch and process differences",
        "Jobs are identifiable one-off customer orders; batches group identical units; processes accumulate cost across continuous production. Service costing uses appropriate non-physical composite units. Use the method matching production flow."
      ],
      [
        "Cost per unit",
        "Unit cost = total cost of comparable good output / quantity produced or service provided. Opening and closing work in progress, normal loss, absorption variance and volume can alter calculation, so do not simply divide every period cost by units sold."
      ],
      [
        "Margin and markup",
        "Profit margin = profit/selling price, markup = profit/cost. A markup gives different price from the same numerical margin, and product costing alone does not determine demand."
      ]
    ],
    "workings": [
      [
        "Unit cost",
        "Material RM8,000, labour RM6,000, direct expenses RM1,000, production overhead RM5,000; 2,000 good units.",
        "Production cost RM20,000; cost per good unit RM10."
      ],
      [
        "Markup",
        "Production job cost RM1,500, required 20% markup on cost.",
        "Profit RM300; selling price RM1,800. For 20% margin on sales, price would be RM1,875."
      ]
    ]
  },
  "MA1:E1": {
    "title": "Spreadsheets overview",
    "sections": [
      [
        "Spreadsheet purpose",
        "A spreadsheet organises quantitative data in rows and columns and performs calculations with formulas and functions. Common management uses include cost schedules, payroll summaries, cash budgets, variances and charts. It does not automatically validate business meaning."
      ],
      [
        "Cells, worksheets and workbooks",
        "A workbook contains sheets; a cell has an address such as B4; a range can be B4:B10. Labels, values and formulas should be visibly separated. Names and data types must be consistent. Keep raw data intact and use formulas for derived values."
      ],
      [
        "Relative and absolute references",
        "A relative reference like B2 changes when copied; an absolute reference like $B$2 stays fixed. A mixed reference locks either row or column. Most spreadsheet errors arise from referencing the wrong cell, mixing currencies/percentages or omitting rows from a sum."
      ],
      [
        "Control and presentation",
        "Protect formulas, validate entry ranges, reconcile totals and label units/periods. Sort/filter must retain entire records, not shift one column alone. Choose useful charts and accessible colour labels."
      ]
    ],
    "workings": [
      [
        "Absolute reference",
        "A2=10 units; B1=RM7 fixed price; create a formula in C2 copied down with varying units in A rows.",
        "Use =A2*$B$1. The price cell remains B1 as rows change."
      ],
      [
        "Validate SUM",
        "Expense values B2:B6 are 100, 200, 300, 400, 500; formula =SUM(B2:B5).",
        "Formula gives 1,000 but should include B6 and give RM1,500. The formula is syntactically valid yet incomplete."
      ]
    ]
  },
  "MA1:E2": {
    "title": "Creating and using spreadsheets",
    "sections": [
      [
        "Data entry and formulas",
        "Enter consistent numeric values (not text that looks numeric), meaningful column headings and dates. Basic formulas use arithmetic operators, SUM, AVERAGE, MIN, MAX, COUNT and simple logical functions appropriate to the question. Copy formulas with careful relative/absolute references."
      ],
      [
        "Planning model layout",
        "Place assumptions, input data, calculations and output summaries in distinct regions. Use one controlled rate table for variables like unit price or VAT. Avoid hard-coded rates in several formulas, which make updates inconsistent."
      ],
      [
        "Checking formulas",
        "Use independent hand-worked examples, cell auditing and reasonableness checks; verify that copied formulas refer to intended rows. Reconcile quantity counts to imported source data. A divide-by-zero or wrong percentage format can create misleading outputs."
      ],
      [
        "Spreadsheet data integrity",
        "Sort records as a full table so invoice amounts stay with customers. Remove duplicates only after checking unique identifiers. Test missing values, abnormal negatives and out-of-range dates. Protect confidential payroll and supplier bank data."
      ]
    ],
    "workings": [
      [
        "Contribution formula",
        "Column A has units, B price, C variable cost per unit. Row 2 has 250, 30 and 18.",
        "In D2 formula =(B2-C2)*A2 gives RM3,000 contribution. For new rows, use relative references unless using a fixed tax/discount assumption cell."
      ],
      [
        "IF function",
        "Cell B2 contains mark 63 and threshold in $E$1 is 50.",
        "=IF(B2>=$E$1,\"Pass\",\"Fail\") returns Pass. Absolute threshold permits copying to other students."
      ]
    ]
  },
  "MA1:E3": {
    "title": "Presenting and printing spreadsheet information",
    "sections": [
      [
        "Formatting accuracy",
        "Format numeric entries as currencies, percentages or dates based on their meaning; rounding displayed figures does not necessarily round underlying calculations. Show negative values clearly, and label thousands or millions. Consistency supports correct interpretation."
      ],
      [
        "Charts",
        "Use bar/column charts to compare categories, lines for time-series trends and scatterplots to explore relationships between two numeric variables. Start with appropriate axis scales, label units and avoid 3D distortion. A chart cannot establish causation by itself."
      ],
      [
        "Printing and layout",
        "Set print area, page orientation, margins, scaling and repeated headings so the audience can read all columns. Check page breaks, spreadsheet gridlines and whether formulas/hidden columns are needed. Print preview must be reviewed before distribution."
      ],
      [
        "Management communication and protection",
        "A good summary states period, assumptions and source. Use colour with labels so it remains understandable without colour vision. Restrict access to confidential data and archive a version of the inputs used to produce the report."
      ]
    ],
    "workings": [
      [
        "Misleading graph",
        "Monthly cost is RM10,000 then RM10,200. A chart's y-axis begins at RM9,990.",
        "A narrow axis can exaggerate the apparent movement. Explain actual increase RM200 / 2%, and use appropriate scaling."
      ],
      [
        "Printing problem",
        "A cash-budget worksheet prints payment columns on a second page without the month headings.",
        "Set print area and orientation or repeat headings so each page retains month context. A broken print is not a usable management report."
      ]
    ]
  }
};})(window);
