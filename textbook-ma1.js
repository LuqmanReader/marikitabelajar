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
        "An individual sets up a sole trader business with $15,000 cash and immediately withdraws $1,000 for personal use.",
        "Assets and equity rise $15,000 on investment, then both fall $1,000 on drawings. Withdrawals are not operating expenses."
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
        "Costs rose $4,000 from $20,000 to $24,000 while output rose 1,000 from 4,000 to 5,000 units.",
        "Old unit cost $5; new $4.80. Higher total spending alone does not indicate inefficiency."
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
        "Five approved invoices total $3,800, but system posts only $3,200.",
        "Batch control mismatch $600. Identify missing/incorrect invoice by document ID before accepting the run."
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
        "$1,500 machine maintenance is coded to administration instead of production.",
        "Reclassify $1,500 from admin expense to factory overhead in management records; the organisation-wide expense may be unchanged, but reported product cost is wrong."
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
        "At 600 units cost $6,600; at 1,000 units cost $9,000.",
        "Variable rate=(9,000−6,600)/(1,000−600)=$6/unit. Fixed cost=9,000−1,000×6=$3,000. Forecast at 800 units $7,800."
      ],
      [
        "Prime and production cost",
        "Direct material $4,000, labour $2,000, direct expenses $600 and production overhead $1,500.",
        "Prime cost $6,600; production cost $8,100. Exclude selling cost from manufacturing inventory cost."
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
        "Bus operates 300 km with 30 average passengers and costs $9,000.",
        "Passenger-km =300×30=9,000; cost per passenger-km $1."
      ],
      [
        "Investment-centre metric",
        "Division makes profit $24,000 on capital employed $200,000.",
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
        "Opening 50 units @$4; purchase 100 @$5; issue 90.",
        "Issue cost=50×4+40×5=$400; closing 60 units at $5 =$300."
      ],
      [
        "Reorder",
        "Maximum daily usage 40 units; maximum lead time 7 days.",
        "Reorder level=40×7=280 units under maximum-use model."
      ]
    ]
  },
  "MA1:D2": {"title":"Accounting for labour","sections":[["Pay methods","Time-based wages use hours multiplied by hourly rate, with overtime premiums and bonuses as specified. Piecework rates pay for units, subject to any minimum guarantee. Gross pay includes bonus and overtime; net pay deducts employee statutory and voluntary items."],["Direct and indirect labour","Direct production time can be allocated to a product/job; supervision and cleaning are indirect overhead. Timesheets and job cards track attendance, direct tasks, indirect time and idle time. Reconcile hours with payroll to prevent missing costs."],["Overtime and idle time treatment","Overtime premium may be directly charged to a specific urgent customer job or treated as overhead depending on cause/policy. Normal idle time may be planned overhead while abnormal downtime warrants separate investigation; do not assume all paid hours produce output."],["Labour productivity","Track output per labour hour, standard versus actual hours, absenteeism and replacements. High output with increased rework is not necessarily efficiency; controls on timesheets and supervisor authorisation matter."],["Unit-labour costs and choice of remuneration","Under a time-rate system total wages depend on paid hours; with piecework pay depends on acceptable units and any minimum guarantee. Calculate gross wages and their cost per good unit separately. Overtime premiums and idle time require tracing to their cause: for an urgent customer job the incremental premium may be directly attributable; a general production-capacity shortage may be overhead. Compare alternative remuneration methods not only by gross pay, but by output quality, normal/abnormal scrap, achievable productivity and labour laws. A cheaper hourly rate need not mean a lower cost per acceptable unit when production falls."],["Exam method for remuneration and productivity changes","Establish basic paid hours, overtime hours, applicable pay multiplier, piece rate, guaranteed pay and deductions. Gross earnings comprise basic pay, premiums and bonuses; net earnings are gross less employee deductions, not less employer-side payroll cost. Calculate unit labour cost from gross labour allocated to good output. To assess a pay rise or productivity change, recompute both total labour expenditure and the denominator of output, then compare per-unit amounts. Distinguish efficiency (output per working hour) from attendance and paid idle time. A supervisor can approve hours without those hours becoming direct production cost."]],"workings":[["Gross/net labour","40 hours at $16 and 5 overtime hours at double rate; deductions $120.","Basic 40×16=$640, overtime 5×32=$160; gross $800, net $680."],["Direct and indirect","Total labour $9,000; 70% traceable to individual products.","Direct $6,300; indirect factory labour $2,700, assuming remaining all supports production."],["Time pay, piece rate and productivity","A team member earns $15 per hour for 8 paid hours. They make 40 acceptable units. A proposed piece rate is $2.50 per acceptable unit with no other guarantee; the worker could instead produce 30 good units at the same time rate after a machine slowdown. Calculate unit labour costs under each stated alternative.","Time pay at 40 units: total 8×$15=$120 and labour cost per accepted unit $120/40=$3.00. Piecework at 40 units: 40×$2.50=$100, or $2.50 per good unit. At the slowed output of 30 units while the time wage remains $120, unit labour cost increases to $120/30=$4.00. The piece-rate result depends on wages/guarantee actually permitted and may affect quality; do not conclude automatically that pay changes cause higher productivity."],["Gross pay, deductions, and idle time","An operator is paid $12 per hour. In a week they spend 35 hours on production, 5 hours on overtime production paid at time-and-a-half, and 2 hours on paid idle time at the normal rate. Employee deductions total $72. Calculate gross and net wages, and explain the normal/overtime/idle categories.","Production basic pay =35×$12=$420. Overtime gross =5×($12×1.5)=$90, comprising $60 basic-equivalent and $30 premium. Paid idle time=2×$12=$24. Total gross wages $420+$90+$24=$534. Net wages $534−$72=$462. How the $30 overtime premium and $24 idle-time cost are charged in cost accounts depends on their cause and the entity's permitted allocation policy; they should not be silently treated as 42 productive direct hours."]]},
  "MA1:D3": {"title":"Accounting for other expenses","sections":[["Nature of overhead","Indirect production overhead includes rent, electricity, equipment depreciation, indirect consumables and repairs. Selling/distribution costs, office administration and finance costs are different functions. A cost may be fixed, variable or mixed independent of its function."],["Accrual and prepayment basis","Costs are recognised when incurred. Factory electricity of the period unpaid at year end is accrued; prepaid factory insurance is carried forward as an asset. In cost accounts allocate current-period cost, not simply cash paid."],["Allocate and apportion","Allocate specific repair expense entirely to the machine department if traceable. Apportion shared rent using area and shared service cost using an appropriate activity base; document the rationale and reconcile totals."],["Controls","Budget and actual comparison must account for changes in activity and capacity. Avoid charging general selling costs to production inventory value without a specific permissible basis."],["Charging indirect costs and overhead absorption","Direct expenses are allocated to a specific cost centre or unit where uniquely traceable; shared overheads such as rent are apportioned using a supportable basis such as floor area, staff count, machine hours or electricity usage. A service department may need to be reapportioned to producing departments; the MA1 requirement excludes reciprocal service department calculations. An overhead absorption rate (OAR) is budgeted production overhead divided by budgeted activity measured in appropriate labour hours, machine hours or output units. Apply that predetermined rate to actual activity to arrive at overhead absorbed. This is not the same as simply splitting actual overhead equally across all production units."],["Over- and under-absorption analysis","Over-absorption exists when overhead absorbed at the predetermined rate exceeds actual production overhead incurred; under-absorption exists when actual overhead exceeds the amount absorbed. Both are accounting differences requiring investigation; neither necessarily means theft or waste. Actual activity may differ from budget, spending may differ or the chosen base may be inappropriate. Report the difference with its correct sign and explain how it is dealt with under the cost-accounting system and the exam's instructions. Reapportionment of service costs precedes calculating a departmental OAR."]],"workings":[["Rent apportionment","Factory rent $30,000 for A 600m² and B 400m².","Total floor space = 600+400=1,000m². Department A occupies 60%, so allocate $30,000×60%=$18,000. Department B occupies 40%, so allocate $30,000×40%=$12,000. Reconcile combined allocation $18,000+$12,000=$30,000; no rent cost is lost or duplicated."],["Prepayment","Annual factory insurance $12,000 paid 1 July, year end 31 December.","Six months expense $6,000; closing prepaid asset $6,000, assuming level annual coverage."],["Overhead absorption rate and shortfall","Factory overhead is budgeted at $84,000 for 14,000 direct labour hours. Actual direct labour hours are 12,500 and actual factory overhead totals $79,000. Calculate the rate, absorbed overhead and over/under absorption.","OAR = budget factory overhead / planned hours = $84,000/14,000=$6 per labour hour. Absorbed overhead =12,500×$6=$75,000. Actual overhead incurred $79,000 exceeds absorption $75,000 by $4,000: this is UNDER-absorption. Under-absorption needs appropriate treatment under the relevant cost-accounting policy, rather than adding the difference to units without analysing the cause."],["Indirect cost apportionment and service transfer","Monthly building rent $30,000 is shared across producing centres A (600 m²) and B (300 m²) and the service centre S (100 m²). S also incurs $2,000 of directly allocated overhead. Reapportion S's resulting cost 2:1 to A and B. Calculate production centre overhead after service reapportionment.","Total area =600+300+100=1,000m². Rent apportionment A = $30,000×600/1,000=$18,000, B $9,000 and S $3,000. S's total overhead = $3,000 rent + $2,000 direct expense = $5,000. Reapportion S: A $5,000×2/3=$3,333.33, B $1,666.67. Final production cost centres A $21,333.33 and B $10,666.67, together $32,000. Confirm the totals reconcile to rent $30,000 plus S's direct $2,000; no reciprocal-service technique is needed."]]},
  "MA1:D4": {"title":"Accounting for product costs","sections":[["Product-cost build","Manufacturing product cost = direct materials + direct labour + direct expenses + production overhead (appropriate absorption). Selling and general administration typically remain period costs for financial reporting, although internal full-cost analysis may allocate them for pricing decisions."],["Job, batch and process differences","Jobs are identifiable one-off customer orders; batches group identical units; processes accumulate cost across continuous production. Service costing uses appropriate non-physical composite units. Use the method matching production flow."],["Cost per unit","Unit cost = total cost of comparable good output / quantity produced or service provided. Opening and closing work in progress, normal loss, absorption variance and volume can alter calculation, so do not simply divide every period cost by units sold."],["Margin and markup","Profit margin = profit/selling price, markup = profit/cost. A markup gives different price from the same numerical margin, and product costing alone does not determine demand."],["Job costing and supporting job cards","Job costing is appropriate when each job or customer order is separately identifiable and often differs in its materials, labour or process requirements. Accumulate direct materials, direct labour and direct expenses traceable to the job, plus absorbed production overhead at the appropriate predetermined rate. A job card must support quantities, issue records, clocked hours and the OAR. Calculate cost per job, and if required cost per identical unit within the job. Selling price using a markup on cost differs from a margin on selling price; do not include selling or general administration costs in IAS 2 production inventory without a qualifying basis."],["Batch costing and quantity of acceptable output","Batch costing groups multiple identical or similar items in a manufacturing run. Set up cost per batch for direct inputs, set-up charges and absorbed overhead, then divide by the correct quantity of cost-bearing units. The unit cost changes when batch size changes because set-up expense is spread across a different quantity; avoid using the number of orders rather than units. If there are defective units, apply the question's normal-versus-abnormal loss assumptions before dividing. The batch method is a variant of job costing, but its principal cost unit is typically the batch and its identical units."],["Process costing: suitable operations and normal losses","Process costing is appropriate for continuous, homogeneous output such as chemicals, beverages or mass-flow processing, where distinct customer jobs cannot practically capture each individual unit's cost. Normal loss is the expected, unavoidable reduction in input under efficient working conditions; abnormal loss is loss in excess of that expectation; abnormal gain arises when the actual loss is less than normal. Compare input quantity, normal loss allowance and actual output. Where there is no scrap value or work in progress, unit production cost is process expenditure divided by expected good output; excess loss or gain should be isolated under the process costing method. For MA1 the detailed outcome requires characteristics, suitable situations and losses/gains, not full equivalent-unit computations."],["Job, batch and process selection under examination conditions","Choose the costing system from physical production evidence: unique custom build suggests job; several identical items produced as one authorised production run suggest batch; large homogeneous flow through sequential departments suggests process. The existence of overhead does not distinguish these methods because each must capture production resources. Test the difference by specifying a cost unit, recording material issues, applying labour and overhead, reconciling normal and exceptional waste, and comparing cost per acceptable output. Do not substitute a single generic product-cost formula for the separate examinable job, batch and process applications."]],"workings":[["Unit cost","Material $8,000, labour $6,000, direct expenses $1,000, production overhead $5,000; 2,000 good units.","Production cost $20,000; cost per good unit $10."],["Markup","Production job cost $1,500, required 20% markup on cost.","Profit $300; selling price $1,800. For 20% margin on sales, price would be $1,875."],["Separate job-card costing with markup","Job J17 consumes direct materials $3,600, direct labour 80 hours at $12 per hour, direct expenses $300 and production overhead absorbed at $8 per direct labour hour. The client requires a quotation at a 10% markup on total manufacturing job cost. Calculate the job cost and quoted price.","Direct materials $3,600; direct labour 80×$12=$960; direct expenses $300; absorbed overhead 80×$8=$640. Total job cost = $3,600+$960+$300+$640=$5,500. A 10% markup is $5,500×10%=$550, so quotation price = $5,500+$550=$6,050, excluding any sales tax. This is a markup on cost, not a 10% margin on selling price."],["Batch size and setup cost","A manufacturer makes one batch of 400 identical items. Direct material for the batch costs $4,000, direct labour $2,400, absorbed production overhead $1,600 and a directly attributable batch set-up charge $800. All 400 items pass inspection and there is no loss. Calculate cost per batch and per unit. What changes if batch size alone rises to 800 while the same total costs are incurred?","Original total batch cost = $4,000+$2,400+$1,600+$800=$8,800. Cost per unit = $8,800/400=$22.00. Under the expressly stated counterfactual that TOTAL inputs and overhead stay at $8,800 despite producing 800 items, unit cost = $8,800/800=$11.00. This illustrates fixed set-up spread only under the counterfactual assumption; in reality direct materials and variable labour would often increase with output."],["Normal loss versus abnormal loss and abnormal gain","A homogeneous continuous process receives 1,000 units of input at total manufacturing cost $9,000. Normal loss is 10% of input and has no scrap recovery value. Compute expected good units and cost per good unit. Then calculate the abnormal loss and gain separately if actual completed output is (i) 880 units or (ii) 930 units, assuming no work in progress.","Expected normal loss =1,000×10%=100 units. Expected good output =1,000−100=900 units. Cost per expected good unit = $9,000/900=$10.00. Case (i): actual loss 1,000−880=120 units, which is 20 units MORE than expected; abnormal loss 20 units valued at 20×$10=$200. Case (ii): actual loss 1,000−930=70 units, which is 30 units LESS than expected; abnormal gain 30 units valued at 30×$10=$300. Present abnormal outcomes separately rather than changing the normal loss expectation retrospectively."]]},
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
        "A2=10 units; B1=$7 fixed price; create a formula in C2 copied down with varying units in A rows.",
        "Use =A2*$B$1. The price cell remains B1 as rows change."
      ],
      [
        "Validate SUM",
        "Expense values B2:B6 are 100, 200, 300, 400, 500; formula =SUM(B2:B5).",
        "Formula gives 1,000 but should include B6 and give $1,500. The formula is syntactically valid yet incomplete."
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
        "In D2 formula =(B2-C2)*A2 gives $3,000 contribution. For new rows, use relative references unless using a fixed tax/discount assumption cell."
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
        "Monthly cost is $10,000 then $10,200. A chart's y-axis begins at $9,990.",
        "A narrow axis can exaggerate the apparent movement. Explain actual increase $200 / 2%, and use appropriate scaling."
      ],
      [
        "Printing problem",
        "A cash-budget worksheet prints payment columns on a second page without the month headings.",
        "Set print area and orientation or repeat headings so each page retains month context. A broken print is not a usable management report."
      ]
    ]
  }
};})(window);
