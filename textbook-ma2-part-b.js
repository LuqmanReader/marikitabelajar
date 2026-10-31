/* Original LedgerPeer explanatory textbook lessons, costing, decisions and cash. */
(function(root){'use strict';root.LedgerTextbookMA2B={
  "MA2:C1": {
    "title": "Absorption costing and overhead accounting",
    "sections": [
      [
        "What absorption costing does",
        "Absorption costing assigns manufacturing costs to units produced. Direct materials and labour are traced to their units; indirect production costs are collected in overhead pools, then distributed to departments and absorbed using a suitable driver. Fixed production overhead forms part of inventory cost under absorption accounting, while selling and general administration usually remain period costs for financial reporting."
      ],
      [
        "Allocation, apportionment, reapportionment, absorption",
        "Allocate a cost directly when one centre is responsible (for example a dedicated supervisor). Apportion shared rent by floor area and machine insurance by asset value where appropriate. Redistribute service departments such as maintenance to production departments: direct method ignores inter-service support, while step-down recognises some of it in a chosen order. Finally calculate each production department's overhead absorption rate (OAR)."
      ],
      [
        "Choosing the right absorption base",
        "Machine-intensive departments may use machine hours; manual assembly may use labour hours. Unit rates can be appropriate for uniform production. Budgeted OAR = budgeted overhead/budgeted units of the driver; cost charged to jobs = rate × activity for the job. A poor driver causes cross-subsidisation: simple products appear too costly and complex products too cheap."
      ],
      [
        "Over- and under-absorption",
        "Actual overhead rarely equals overhead charged at the predetermined rate. If absorbed overhead exceeds actual overhead, overhead is overabsorbed; if less, it is underabsorbed. Check the signs: underabsorbed overhead is a remaining cost that normally reduces profit when written off. Do not confuse underabsorbed overhead with an adverse total-budget variance automatically: volume and spending differ."
      ],
      [
        "Product-cost and profitability interpretation",
        "Production cost includes direct material, direct labour, direct expenses and absorbed production overhead. For a job that takes 6 machine hours in Dept A at $9/hour and 3 labour hours in Dept B at $4/hour, overhead = 6×9+3×4. Selling price and total-period profitability require further decisions and non-production costs. Consider capacity, rework and the quality of absorption bases."
      ]
    ],
    "workings": [
      [
        "Departmental overhead statement",
        "Rent $40,000 shared between production A (400m²), production B (300m²), service S (300m²). Maintenance S also incurs direct overhead $12,000; re-apportion all S overhead 60% A / 40% B.",
        "Rent allocation by area: A $16,000, B $12,000, S $12,000. S pool = 12,000+12,000=$24,000. Transfer A 24,000×60%=$14,400; B $9,600. Final production pools: A $30,400 and B $21,600."
      ],
      [
        "OAR and reconciliation",
        "Dept A budget overhead $96,000 for 24,000 machine hours. Actual activity 22,000 hours; actual overhead $91,000.",
        "Rate = 96,000/24,000=$4 per machine hour. Absorbed = 22,000×4=$88,000. Underabsorbed = $91,000−$88,000=$3,000."
      ],
      [
        "Step-down services",
        "Maintenance $10,000 goes 50% A, 30% B and 20% Stores. Stores originally $6,000, thereafter shared 60% A and 40% B.",
        "Maintenance sends $5,000 A; $3,000 B; $2,000 Stores. Stores now $8,000, sends $4,800 A and $3,200 B. Total A $9,800 and B $6,200, totalling $16,000."
      ]
    ]
  },
  "MA2:C2": {
    "title": "Marginal costing and profit reconciliation",
    "sections": [
      [
        "What is a marginal cost?",
        "For a relevant production volume, marginal cost is the additional variable production cost of one more unit; for a decision include all other incremental variable and avoidable costs. Marginal costing treats fixed production overhead as a period cost rather than inventoriable product cost. A contribution statement shows sales less variable costs equals contribution; subtract fixed costs to derive profit."
      ],
      [
        "Marginal profit statement",
        "Start with sales revenue net of returns and permitted discounts. Deduct variable production cost of units sold and other variable selling/distribution costs (these are also relevant to contribution). Subtract fixed production and non-production period costs once. Under marginal costing, opening and closing inventories contain variable production cost only."
      ],
      [
        "Absorption profit statement",
        "Under absorption costing, product cost includes fixed production overhead absorbed per unit. Inventory movement can defer or release fixed overhead, creating different period profits compared with marginal costing. Over/under-absorption may require an adjustment before reconciliation; first check which overhead rate is used."
      ],
      [
        "Reconcile the two approaches",
        "Where all other elements are unchanged, absorption profit − marginal profit = (closing inventory units − opening inventory units) × fixed production OAR/unit. If inventory grows, absorption profit generally exceeds marginal; if it shrinks, absorption profit is generally lower. For a multi-product mix use each product's relevant absorbed rate."
      ],
      [
        "Uses and limitations",
        "Marginal analysis highlights short-run contribution and spare-capacity decisions. It is less suitable alone for long-run pricing because fixed cost and capacity investment still need recovery. Absorption costing produces full production cost but arbitrary overhead drivers can mislead short-term decisions. The methods answer different management questions."
      ]
    ],
    "workings": [
      [
        "Profit statements",
        "Production 1,000 units, sales 800 at $30, variable production cost $12/unit, variable selling $2/unit sold, fixed production overhead $6,000, fixed selling/admin $3,000; no opening inventory.",
        "Marginal sales $24,000. Variable production cost of sales 800×12=$9,600; variable selling 800×2=$1,600. Contribution $12,800, fixed costs $9,000, marginal profit $3,800. Absorption unit production cost =12+6,000/1,000=$18; cost of sales 800×18=$14,400. Gross profit 24,000−14,400=$9,600; less variable selling 1,600 and fixed admin 3,000 = $5,000 absorption profit. Difference $1,200 (=200 closing units×$6)."
      ],
      [
        "Inventory falls",
        "Opening inventory 500 units; closing 300 units. Fixed production overhead per unit absorbed $5.",
        "Inventory decrease 200 units releases 200×5=$1,000 prior fixed overhead into absorption cost of sales; absorption profit is $1,000 below marginal profit, absent other differences."
      ]
    ]
  },
  "MA2:C3": {
    "title": "Job and batch costing",
    "sections": [
      [
        "Separate jobs and batches",
        "Job costing traces the cost of a specific customer order, repair or bespoke project. Batch costing accumulates cost for a group of similar items and divides total batch cost by good output units. A job cost card records authorised material requisitions, time sheets, external direct expenses and overhead absorbed using the specified base."
      ],
      [
        "Cost card preparation",
        "Direct material includes relevant issued materials net of returns. Labour is direct hours × prescribed rate, plus overtime premium if the cost treatment makes it direct. A job may incur direct subcontracting or specific equipment hire. Add absorbed production overhead; where more than one department is involved, apply each department's OAR to its own activity."
      ],
      [
        "Normal and abnormal outcomes",
        "For batch work, wasted material or defective products may reduce good units; specify whether scrap value reduces batch cost. Abnormal loss normally needs separate analysis so that inefficiency is not hidden in unit costs. Opening WIP and completed jobs must be reconciled at the transfer date."
      ],
      [
        "Markup versus margin",
        "Markup is profit divided by cost; margin is profit divided by selling price. For 25% markup on $800 cost, selling price = $1,000. For 25% margin, selling price = 800/(1−0.25)=$1,066.67. Always identify which denominator the examiner uses."
      ],
      [
        "Cost-plus decisions",
        "A cost-plus quotation is a useful starting point, but the market can reject the resulting price. Compare relevant incremental costs, capacity, competitive conditions and risks. Cost estimates may include learning effects or uncertain overhead rates; document assumptions and update once actual results are known."
      ]
    ],
    "workings": [
      [
        "Full job card",
        "Job J17 uses material $3,200; direct labour 50 hours at $18; 20 machine hours at OAR $12; 50 assembly hours at OAR $6; external subcontractor $500.",
        "Material $3,200 + labour $900 + machine overhead $240 + assembly overhead $300 + subcontractor $500 = $5,140 job cost. A 20% markup quotation = 5,140×1.20 = $6,168."
      ],
      [
        "Batch cost per good unit",
        "A batch of 500 units costs materials $4,000, labour $2,500 and overhead $1,500. Of the 500 units, 20 are defective with no recovery value. All loss cost is charged to good units under this scenario.",
        "Total $8,000; 480 good units; cost per good unit = 8,000/480 = $16.67 (rounded). If the question instead separates abnormal loss, alter the treatment."
      ],
      [
        "Margin and mark-up",
        "Job cost $2,400 and required selling margin 30%.",
        "Selling price = 2,400 / 0.70 = $3,428.57; profit $1,028.57. A 30% markup would yield only $3,120 and is incorrect for this requirement."
      ]
    ]
  },
  "MA2:C4": {
    "title": "Process costing: losses, equivalent units and joint products",
    "sections": [
      [
        "Flow in continuous processing",
        "A process account captures opening WIP, current material, labour and overhead. Output is transferred to the next process or finished goods. Input quantities must reconcile with completed output, expected normal loss, unexpected abnormal loss or gain, and closing WIP. Never treat partially complete WIP as fully converted when computing a cost per equivalent unit."
      ],
      [
        "Normal versus abnormal loss",
        "Normal loss is expected from the process and is generally borne by good production, net of any salvage proceeds. Abnormal loss arises where actual loss exceeds expectation; the cost is recognised separately under the scenario. Abnormal gain occurs when actual loss is less than expected and also has a distinct accounting treatment."
      ],
      [
        "Equivalent units",
        "Part-finished output consumes some materials and conversion work. Equivalent units = completed output + closing WIP × completion percentage, calculated independently for material and conversion. Materials may be added at the start (100% complete) while conversion cost accrues evenly. Opening WIP complicates the calculation: weighted average combines opening and current period costs, while FIFO isolates current work."
      ],
      [
        "Weighted-average and FIFO methods",
        "Under weighted average, equivalent unit cost = (opening WIP cost + current cost) / (completed units + closing WIP equivalent units) for that element, after relevant loss treatment. FIFO separates completed opening WIP, units started and completed, and closing WIP, then divides current cost by current-period equivalent work. Use only the specified method."
      ],
      [
        "Joint and by-products",
        "Joint products share costs up to the split-off point; relative sales value at split-off or output volume may be prescribed allocation bases. By-products have secondary economic value; the specified policy might deduct expected by-product proceeds from main joint costs. Joint allocations support reporting, not necessarily whether further processing should be undertaken; that decision compares incremental revenue and incremental cost."
      ]
    ],
    "workings": [
      [
        "Normal loss with scrap",
        "Input 1,000 units costing $9,000. Normal loss 10% of input; scrap can be sold for $2 per unit. Actual completed output 900 units.",
        "Expected normal loss 100 units. Scrap proceeds 100×$2=$200. Net cost of good output = 9,000−200=$8,800. Cost per good unit = 8,800/900 ≈ $9.78. If actual output differs, calculate abnormal loss/gain separately."
      ],
      [
        "Two equivalent unit bases",
        "Input 1,000 units. Completed 800. Closing WIP 200, materials 100% complete and conversion 40% complete. Materials cost $5,000; conversion cost $4,400. No opening WIP or losses.",
        "Material EU = 800+200×100%=1,000; rate $5. Conversion EU=800+200×40%=880; rate $5. Completed cost=800×(5+5)=$8,000. Closing WIP=200×5 + 80×5=$1,400. Reconcile 8,000+1,400=$9,400."
      ],
      [
        "Joint cost allocation",
        "Joint process costs $72,000. Product A yields 2,000 units selling at $30; B yields 1,000 units at $20 at split-off.",
        "Sales values A $60,000, B $20,000, ratio 3:1. Allocate A $54,000 and B $18,000. For further processing, ignore sunk joint allocation and compare additional net realisable value with further processing cost."
      ]
    ]
  },
  "MA2:C5": {
    "title": "Service costing",
    "sections": [
      [
        "Cost units for services",
        "A service business has no single physical output equivalent to a manufactured unit. Its cost unit should reflect what customers receive and what drives cost, such as passenger-kilometre, tonne-kilometre, room-night, patient-day, meal served or chargeable consulting hour. Define the numerator and denominator before dividing."
      ],
      [
        "Composite cost units",
        "A composite unit combines volume with another driver. One bus carrying 20 passengers for 10 km provides 200 passenger-km. One lorry carrying 3 tonnes for 15 km provides 45 tonne-km. Do not confuse a vehicle-km with a passenger-km: the latter changes when utilisation changes."
      ],
      [
        "Cost structure and classification",
        "Service operations may have large fixed capacity costs (premises, vehicle leasing, salaried staff) and smaller variable costs (fuel, consumables, casual labour). Distinguish operating cost per occupied unit from cost per available capacity unit; low utilisation makes a high fixed-cost business expensive per service delivered."
      ],
      [
        "Service costing statements",
        "Aggregate materials, staff, running, maintenance, insurance and indirect support for the defined reporting period, then divide by total service units. For pricing, consider desired margin, demand and constraints. A low cost per passenger-km may come from long-distance journeys rather than efficient management; compare similar routes."
      ]
    ],
    "workings": [
      [
        "Passenger-kilometres",
        "Bus A travels 400 km with average 25 passengers; Bus B travels 250 km with average 40 passengers. Total operating cost $20,000.",
        "Passenger-km = 400×25+250×40 = 20,000. Cost per passenger-km $20,000/20,000 = $1.00."
      ],
      [
        "Hotel cost per occupied night",
        "A hotel has 30 rooms, 30 nights in month, occupancy 70%, and operating costs $126,000.",
        "Available room nights = 30×30=900; occupied room nights 900×70%=630. Cost per occupied room-night = 126,000/630 = $200. Cost per available room-night = $140; the two answer different questions."
      ]
    ]
  },
  "MA2:D1": {
    "title": "Cost–volume–profit analysis",
    "sections": [
      [
        "Contribution and the CVP model",
        "For a single product under a linear model, contribution per unit = selling price−variable cost per unit. Profit = units × contribution−fixed cost. The model assumes constant unit price and variable rate, stable fixed costs within the relevant range and either a single product or constant sales mix. Distinguish total contribution from contribution margin ratio."
      ],
      [
        "Break-even volume and revenue",
        "Break-even occurs where contribution exactly covers fixed costs. Break-even units = fixed cost/contribution per unit. Break-even sales revenue = fixed cost/contribution-to-sales ratio, where the ratio is expressed as a decimal. Always round the number of units up when units must be whole and a target at least breaks even."
      ],
      [
        "Margin of safety",
        "Margin of safety in units = planned (or actual) volume − break-even volume. Margin of safety percentage = margin of safety units / planned volume ×100%. A wide safety margin indicates more room for a drop in demand before operating losses, but ignores uncertainty in costs and the difficulty of meeting sales forecasts."
      ],
      [
        "Target profit and sensitivity",
        "To earn target operating profit, required volume = (fixed costs + target profit)/unit contribution. A price reduction can raise sales demand but also lowers contribution; recalculate before predicting profitability. If fixed cost steps up when volume crosses capacity, solve in the appropriate range, not with one constant fixed-cost assumption."
      ],
      [
        "Charts and decisions",
        "On a break-even chart, the sales and total cost lines intersect at zero profit. The difference between those lines at a given output is profit or loss. A profit-volume chart plots profit against volume, crossing zero at break-even. Labelling axis units matters; a chart in thousands is easy to misread."
      ]
    ],
    "workings": [
      [
        "Complete CVP scenario",
        "Selling price $40, variable cost $24, fixed cost $96,000, expected units 8,000, target profit $32,000.",
        "Contribution $16/unit, C/S ratio 16/40=40%. BEP = 96,000/16=6,000 units or $240,000 revenue. Margin of safety=8,000−6,000=2,000 units, 25%. Expected profit=8,000×16−96,000=$32,000. Target profit volume=(96,000+32,000)/16=8,000 units."
      ],
      [
        "Evaluate discount effect",
        "Price decreases to $36 while variable cost stays $24 and fixed cost $96,000.",
        "New contribution $12; break-even rises to 8,000 units. To preserve $32,000 profit, volume must rise to (96,000+32,000)/12 = 10,666.67, hence 10,667 whole units."
      ]
    ]
  },
  "MA2:D2": {
    "title": "Short-term decision-making and relevant costing",
    "sections": [
      [
        "Relevant cost principle",
        "A decision compares the future cash flows changed by each alternative. A historical cost cannot change and is sunk, whereas opportunity cost is the value of the next-best alternative sacrificed. Book depreciation is usually non-cash and irrelevant to a short-run cash comparison, but extra wear, a replacement purchase or tax effects can matter if specified."
      ],
      [
        "Make or buy",
        "Compare incremental avoidable manufacturing cost against external purchase cost, and include any extra quality inspection, delivery, supplier risk and use of freed capacity. An arbitrary share of fixed overhead that continues regardless of decision is not relevant. Avoiding a future supervisor or leasing equipment specifically for one alternative is relevant."
      ],
      [
        "Special order and limiting factors",
        "Where capacity is spare, a one-off order can be attractive if incremental revenue exceeds incremental cost and it does not cannibalise normal sales. With a scarce resource (machine hours, labour hours, material), rank products by contribution per unit of scarce resource, not contribution per unit of product. Account for minimum commitments and binding constraints."
      ],
      [
        "Shutdown and further processing",
        "A temporary shutdown saves avoidable costs but may lose contribution and incur closure/restart cost; compare them directly. After split-off, a joint product should be processed further only if additional revenue exceeds additional processing and selling costs. Joint costs already incurred are sunk for that decision."
      ],
      [
        "Qualitative and long-run factors",
        "Supplier reliability, safety, quality, workforce implications, intellectual property and customer relationships may override a small apparent advantage. Avoid using a short-run special-order price as a permanent full-cost pricing policy."
      ]
    ],
    "workings": [
      [
        "Make versus buy",
        "A component uses $12 materials, $8 direct labour and $3 variable overhead per unit. Fixed allocated overhead $7/unit continues if outsourced. Outside supplier quotes $26 per unit.",
        "Relevant internal cost = 12+8+3=$23. Buying $26 costs $3 more per unit, so make if capacity is available and there are no other avoidable costs. $7 unavoidable allocation is ignored."
      ],
      [
        "Limiting factor ranking",
        "Product A contributes $24/unit and takes 3 machine hours; B contributes $18/unit and takes 1.5 hours.",
        "Contribution per machine hour: A $8; B $12. If machine hours are the sole constraint, make B before A, subject to demand limits and contractual commitments."
      ],
      [
        "Special order with opportunity cost",
        "Spare capacity permits order of 100 units at $35 each; variable cost $26/unit and one-off tooling $500.",
        "Incremental sales 100×35=$3,500; variable cost $2,600; tooling $500; relevant profit $400. Accept assuming no lost normal sales, tax or other omitted costs."
      ]
    ]
  },
  "MA2:D3": {"title":"Investment appraisal: payback, NPV and IRR","sections":[["Cash flows and time value of money","Investment appraisal compares expected future net cash flows with the initial outlay. Use incremental cash flows, not accounting profit; depreciation is normally excluded unless tax effects require its consideration. Include disposal proceeds, working capital changes and relevant terminal costs. Discounting reflects that a future $1 is worth less than an immediate $1 at a positive cost of capital."],["Simple and discounted payback","Payback measures how long cash inflows take to recover the original investment. For uneven receipts, accumulate year by year, then calculate the fraction of the recovery year where permitted. Discounted payback repeats the calculation using discounted cash flows; it generally takes longer or may not occur. Payback ignores later gains and is not a full wealth measure."],["Net present value","NPV = sum of discounted net cash flows minus initial investment. Discount factor at period t =1/(1+r)^t. For annuities (equal end-period payments) and perpetuities, use the supplied present-value factors or standard formulas when required. A positive NPV means the project exceeds the chosen hurdle rate under the forecast assumptions."],["Internal rate of return","IRR is the rate giving NPV zero. For conventional single-outflow projects, compare IRR with required return; the usual rule accepts if IRR exceeds hurdle rate. Interpolation using two trial discount rates gives an approximation; multiple or non-conventional cash flow sign changes can cause misleading or multiple IRRs."],["Forecast risk and interpretation","Scrutinise uncertain volumes, cost escalation, residual value, inflation consistency and the discount rate. Nominal cash flows need nominal discount rates; real with real. Compare mutually exclusive projects using NPV, especially where scale/timing differs. An investment with fast payback can still have negative NPV."],["Simple interest, compound interest and discounting","Simple interest on the original principal is P×r×n over n identical periods; the accumulated value is P(1+rn). Compound interest adds interest to prior interest each period, giving future value P(1+r)^n. Discounting reverses compounding: the present value of future value FV is FV/(1+r)^n. Match rate to period; an annual nominal quote compounded monthly does not mean 12% earned every month. Net present value subtracts the initial outlay from appropriately discounted future incremental cash receipts and payments, retaining precision until the end."],["Reconcile accounting profit to investment cash flows","Accounting profit may include depreciation (non-cash expense), accrued but uncollected revenue and unpaid expenses, while investment appraisal values incremental cash flows at their actual expected dates. Adjust profit for depreciation, relevant working-capital changes, disposal proceeds and project tax effects when specified. Existing sunk costs are not affected by today's project decision; opportunity costs from using scarce resources may matter. Positive NPV is a model-based decision criterion, not a promise of future return. A fast simple payback does not necessarily establish positive NPV because payback ignores the time value of money and post-payback cash flows."]],"workings":[["Uneven payback","Initial project cost $50,000; expected cash receipts year 1 $10,000, year 2 $20,000, year 3 $25,000.","Cumulative by end of year 2 $30,000. Unrecovered $20,000 at start of year 3. Assuming year-3 inflows arrive evenly, payback =2 + 20,000/25,000=2.8 years."],["NPV calculation","Outlay $40,000 today; three end-year inflows of $17,000; discount rate 10%.","NPV =−40,000 + 17,000/1.10 + 17,000/1.10² + 17,000/1.10³ = −40,000 + 17,000×[(1−1.10^(−3))/0.10] = +$2,276.48 when the full-precision annuity factor is used (individual annual present values rounded only for display: $15,454.55, $14,049.59 and $12,772.35). Accept on the stated NPV criterion."],["IRR interpolation","Suppose a project's NPV is +$4,000 at 10% and −$2,000 at 20%.","Approximate IRR = 10% + [4,000/(4,000+2,000)] × (20%−10%) =16.67%. The interpolation is approximate; verify with a calculator where available."],["Interest methods and present value","An investment of $10,000 earns 8% annually for three years. Compare simple and compounded end values and calculate the present value of $12,000 payable in three years at an annual discount rate of 8%. Round to two decimals.","Simple end value=$10,000×(1+0.08×3)=$12,400. Compound end value=$10,000×1.08^3=$12,597.12. Present value of the future $12,000 payment=$12,000/(1.08^3)=$9,525.99. Compounding adds interest on previously earned interest, while discounting reverses it. Keep the annual period and annual rate consistent."],["Accounting profit and working-capital cash conversion","A project earns accounting profit $6,000 after charging depreciation $4,000. Trade receivables increased $2,000 and payables increased $1,000 during the year. Ignore all other taxes, inventory changes and noncash adjustments. Estimate operating cash from these figures.","Cash generated under the stated assumptions = accounting profit $6,000 + depreciation $4,000 − receivables increase $2,000 + payables increase $1,000 = $9,000. This one-year undiscounted cash measure is not an NPV because the initial outlay, the discount rate and other future flows were not supplied."]]},
  "MA2:E1": {"title":"Cash, cash flows and liquidity","sections":[["Accruals do not equal cash","Accrual accounting records economic performance when earned or incurred, while a cash budget records the date money is received or paid. A profitable credit sale can cause a cash shortage if customers pay slowly; purchasing equipment consumes cash immediately even when depreciation spreads cost over years."],["Sources and uses of cash","Routine inflows include collections from customers and investment income; exceptional inflows include asset sales, loans and new equity. Outflows include inventory, payroll, taxes, loan repayments, interest, dividends and asset purchases. Classify flows consistently for the question; interest and dividend classification may vary with the specified reporting convention."],["Liquidity and solvency","Liquidity is the ability to meet near-term payments when due; solvency is the longer-run ability to meet obligations. Cash shortages can force late payment despite accounting profits. Credit risk, stockholding, collection cycles, supplier terms and growth are significant liquidity drivers."],["Patterns by organisation","Retail customers might pay immediately while suppliers allow credit; a construction company might suffer long payment gaps; seasonal businesses can show strong cash for a few months and deficits at other times. Cash management requires forecasting timing, not only profit."],["Cash, cash equivalents and operating liquidity","Cash comprises money available immediately through physical cash and demand deposits; cash equivalents are short-term highly liquid investments readily convertible to known cash amounts with insignificant value-change risk. Cash flow is the movement of cash into or out of the entity during a stated period; revenue or reported profit alone does not establish cash received. Operating collections, financing receipts and proceeds from asset disposals can fund different needs but differ in recurrence. Cash control focuses on the dates obligations fall due, with liquidity assessed against the timing of payroll, supplier accounts, financing instalments and tax. Solvency concerns the ability to meet obligations over a longer horizon."],["Compare cash-flow patterns of different business models","A cash-and-carry retailer receives customer money immediately but may settle suppliers later, producing positive early operating cash. A manufacturer pays wages and purchases components before collecting on credit sales. A construction contractor may incur costs before milestone certificates and client remittances. A seasonal business can have recurring annual deficits and surpluses even when full-year profit is positive. A budget should distinguish amounts owed from amounts collected, analyse the receivables and inventory cycle, and ensure cash is reserved or finance arranged before known shortfalls."]],"workings":[["Profit differs from cash","A retailer reports profit $20,000, trade receivables rise $12,000, inventory rises $6,000 and payables rise $4,000; ignore other changes.","Approximate operating cash flow =20,000−12,000−6,000+4,000=$6,000 (assuming noncash items and tax are irrelevant). Profit exceeds cash generated by $14,000."],["Credit receipt timing","Credit sales: January $15,000; February $20,000. Customers pay one month after sale.","Cash receipts in February are January's $15,000. February credit sales normally become March collections. Do not put February revenue into February cash inflows."],["Compare reported profit and operating cash generation","Two firms each report $30,000 accounting profit, with no depreciation, taxes or other non-cash items. Firm A has receivables increase $14,000, inventory increase $8,000 and payables increase $4,000. Firm B has receivables decrease $6,000, inventory increase $5,000 and payables decrease $2,000. Calculate simplified operating cash for each.","Firm A operating cash = $30,000−$14,000−$8,000+$4,000=$12,000. Firm B operating cash = $30,000+$6,000−$5,000−$2,000=$29,000. Both have identical accounting profit, but A ties more cash in receivables and inventory. The figures exclude taxes, depreciation and other non-cash reconciling items under the stated assumptions."],["Map manufacturing collection delays","A manufacturer pays materials $12,000 and wages $8,000 in January and sells finished goods for $32,000 on credit, collectible in March. There are no other cash flows. State January and March cash consequences and why January profit cannot be inferred from these cash movements alone.","January net cash outflow is $12,000+$8,000=$20,000 with no collection from this sale. March receives $32,000, assuming the customer pays in full. The $32,000 credit sale may be recognised as revenue earlier than cash collection, but profit depends on the cost of goods sold, inventory and other accrual adjustments, not simply the January payments. The business needs at least $20,000 opening cash or financing to pay its January obligations."]]},
  "MA2:E2": {"title":"Cash management and controls","sections":[["Why cash balances move","A cash surplus may arise from collection or asset sale; a deficit may reflect inventory build-up, growth, seasonal purchases, slow receipts or unplanned tax. Excess idle cash has opportunity cost, while insufficient cash leads to penalties, supply disruption and reputational harm. Forecast both expected and stressed balances."],["Internal cash controls","Segregate cash custody, recording and bank reconciliation. Require approval for payments, reconcile statements promptly, control petty cash and investigate unusual payments. Cash counts and secure deposit procedures deter loss. Bank reconciliations distinguish outstanding deposits/payments from ledger errors; only book-side items require ledger adjustments."],["Working capital management","Reduce unnecessary stock, invoice promptly, follow up overdue receivables and negotiate sustainable supplier terms. Extending payables too far may lose discounts or harm supplier relationships. Maintain operating liquidity without excessive borrowing or excessive idle balances."],["Economic environment","Interest rates alter borrowing and deposit returns. Inflation changes funding needs; foreign currency exposures can change foreign receipts and payments. Businesses should match financing maturity to the timing and risk of cash flows rather than relying on a single point forecast."],["Treasury, payment procedures and fraud prevention","Core treasury responsibilities can include managing day-to-day liquidity, forecasting funding requirements, placing surplus cash prudently, arranging appropriate finance, monitoring exchange and interest exposures, and maintaining banking relationships. A cash receipt should be documented, counted or electronically confirmed, posted promptly and reconciled independently to bank deposits. Payments need an approved supplier or payroll obligation, verified beneficiary details and appropriate authorisation. Custody, authorisation and ledger recording should be segregated where practical; restrict access to customer and payroll data and retain a complete audit trail."],["Legal compliance, safeguarding and bank exceptions","Cash and electronic payment handling should follow applicable anti-money-laundering, safeguarding, confidentiality, tax, employment and record-retention requirements, with jurisdiction-specific rules checked before giving a definite threshold. Suspected fraud, forged payments or unusual bank-detail changes must be escalated under the organisation's policy rather than hidden by a suspense amount. Bank reconciliation distinguishes book errors and direct bank items from unpresented cheques and deposits in transit; timing differences require monitoring, not duplicate posting. A liquidity decision must balance risk and investment return as well as cost and forecast uncertainty."]],"workings":[["Bank reconciliation","Ledger bank balance $8,000 debit. Bank statement shows $6,700. Outstanding lodgement $2,000 and unpresented cheque $700.","Statement balance 6,700 + deposit not yet credited 2,000 − cheque not yet presented 700 = $8,000. If there are bank charges or direct debits not yet recorded, update the ledger first."],["Working capital cycle","Inventory 55 days, receivables 40 days, payables 35 days.","Cash operating cycle =55+40−35 =60 days. The business must fund about 60 days of operating activity on these assumptions; seasonality and discounts also matter."],["Treasury choice and bank control","A business has $90,000 bank cash and must pay $70,000 supplier invoices in ten days. It considers investing $60,000 in a deposit inaccessible for 30 days and keeping only $30,000 cash. Explain its minimum near-term funding gap and a safer allocation.","If $60,000 is locked, liquid cash becomes $90,000−$60,000=$30,000. A ten-day supplier obligation of $70,000 creates a $40,000 deficit unless another confirmed inflow or borrowing facility is available. With no other inflow assumed, retain at least $70,000 for the payment and invest no more than $20,000, ideally with an operational contingency buffer. A higher yield does not compensate for an inability to pay suppliers when due."],["Controls over amended payment instructions","A supplier has an approved invoice for $6,800, but an email claims its bank details have changed. A junior clerk can both edit beneficiary data and release payment. Identify the weaknesses and state the control responses.","There are two main control weaknesses: the new beneficiary is not independently authenticated and the same clerk can alter supplier details and release cash. Contact the supplier through previously verified channels, use independent dual approval and restricted access for bank-master changes, compare the remittance with the approved invoice, and retain logs. The $6,800 payable remains outstanding until a valid authorised settlement. A suspicious request should be investigated under the relevant anti-fraud policy."]]},
  "MA2:E3": {"title":"Cash budgets and forecasting","sections":[["From accounting transactions to cash dates","A cash budget begins with opening cash/bank position and forecasts receipts and payments in each period. Cash sales are collected immediately; credit sales follow settlement patterns. Purchases may be paid at later dates; wages, tax, loan interest, drawings and equipment have their own cash dates. Ignore noncash depreciation."],["Receipt and payment schedules","Separate the schedule of credit sales from the cash collection schedule. If 30% pays in the month of sale and 70% the following month, the receipt for February equals 30% February credit sales plus 70% January credit sales. For purchases, apply supplier terms and tax timing as explicitly given. Check VAT/sales tax treatment if included."],["Multi-period budget and closing position","For each month, closing balance = opening balance + total cash receipts − total cash payments. The next month's opening is the previous closing; a negative balance is an overdraft requirement, not automatically a loss. Distinguish approved overdraft limit from the expected deficit and investigate peak funding need."],["Control and sensitivity","Compare actual receipts and payments to forecast to identify inaccurate assumptions. Use scenarios for slower customer collections, late grants or unexpected equipment failure. Update forecast as soon as new information becomes available; a forecast is a decision-support tool, not a certainty."],["Forecasting collection patterns using historical data","A cash forecast may estimate collections using known contract dates, prior receipt patterns or statistical methods. A simple moving average smooths fluctuations by averaging recent observations; a weighted moving average gives different weights to selected periods. A naive extrapolation assumes recent behaviour persists and may be unreliable for seasonal or changing customer patterns. Cash receipts must be allocated to months when cash is expected, not months when credit revenue was recognised. Use an explicit receivables ageing schedule, expected settlement proportions and separate forecasts for cash sales, loan proceeds, interest and extraordinary receipts."],["Using a cash budget to take action","A multi-period cash budget starts with opening balance, adds period cash inflows and subtracts payments for each month to obtain the closing balance, which becomes the next opening balance. A negative closing amount indicates potential financing needs rather than an accounting loss. Compare forecast closing balances with any minimum liquidity policy. A business might pursue earlier customer collections, renegotiate supplier payment terms, defer discretionary equipment spending or pre-arrange overdraft cover. Compare actuals to budget for timing differences and update probability-weighted scenarios rather than assuming the original forecast is guaranteed."]],"workings":[["Three-month collections","Credit sales: January $20,000, February $30,000, March $24,000. Customers pay 40% in month of sale and 60% next month. December credit sales $10,000.","January receipts 40%×20,000 +60%×10,000=$14,000. February =40%×30,000 +60%×20,000=$24,000. March =40%×24,000 +60%×30,000=$27,600."],["Monthly closing cash balances","Opening January $5,000. Receipts Jan $14,000, Feb $24,000, Mar $27,600. Total cash payments Jan $17,000, Feb $31,000, Mar $22,000.","Jan close 5,000+14,000−17,000=$2,000. Feb close 2,000+24,000−31,000=−$5,000 overdraft. Mar close −5,000+27,600−22,000=$600. Maximum expected funding need is $5,000, not just the positive March closing figure."],["Forecast receipts from a weighted moving average","Cash receipts for the last three months were $18,000, $21,000 and $24,000, in chronological order. A manager assigns weights 20%, 30% and 50% respectively to forecast next month's receipts. Calculate the forecast and explain its limitation.","Weighted forecast = ($18,000×20%)+($21,000×30%)+($24,000×50%) = $3,600+$6,300+$12,000=$21,900. Weights total 100%. This is an estimate based on recent data rather than a signed collection commitment, and it does not separately model seasonality, overdue accounts or one-off receipts."],["Build a two-month cash budget and funding request","Opening January bank balance is $4,000. January receipts $17,000 and payments $23,000. February receipts $28,000 and payments $21,000. The minimum target cash balance at each month end is $3,000. Calculate both closing balances before finance and the January facility required to meet the minimum.","January unfinanced closing balance = $4,000+$17,000−$23,000=−$2,000. To meet the $3,000 minimum, financing of $3,000−(−$2,000)=$5,000 is needed by January end. Without financing, February closes −$2,000+$28,000−$21,000=$5,000. If January draws the $5,000 facility and it is not repaid in February, January closes $3,000 and February closes $10,000; repayment policy would determine the true February financed balance."]]},
  "MA2:E4": {"title":"Short-term investments, borrowing and financing","sections":[["Managing surplus cash","Compare liquidity, security and return. Demand deposits are usually liquid with lower yield; term deposits offer defined maturity and typically different rates. Money-market investments and short-dated government securities can provide alternatives but contain credit, price, settlement and interest-rate risks. 'Risk-free' should not be assumed for all assets."],["Managing cash deficits","Options include a bank overdraft, revolving line, short-term loan, invoice discounting and renegotiated payment terms. Choose based on cost, repayment timetable, collateral, covenants and reliability of renewal. A short-lived working capital gap typically calls for flexible short-term financing, not necessarily long-term equity."],["Borrowing costs and effective cost","Simple interest = principal × annual rate × time expressed in years. Borrowing fees, discounting, commitment fees and security costs affect effective cost. Overdraft interest generally depends on the amount used and duration. Compare lenders on the same cash flow and term basis."],["Risk-return trade-off","Higher interest normally compensates for higher risk or reduced liquidity, though not always. Short-term government securities can lose market value if sold before maturity when rates change. Bank deposit safety varies with the bank and deposit protection rules. Management must also avoid concentration of cash in one institution."],["Short-term deposits, money-market instruments and risk","Surplus cash can remain in current accounts, earn interest in notice or fixed-term deposits, or be placed in suitable money-market instruments or short-dated securities. Compare liquidity, counterparty default risk, yield, currency, charges and redemption terms. A treasury investment must not tie up the amount needed for forecast salaries or tax. Cash deficits can be financed by an authorised overdraft, revolving credit facility, trade credit, short-term bank loan or receivables finance. These instruments have differing costs and repayment flexibility, and some require collateral or give the financier recourse."],["Long-term financing and matching the funding horizon","A long-lived equipment asset is commonly better supported by longer-duration finance, including term borrowing, hire purchase or leasing where appropriate, retained earnings and new equity. Equity generally avoids mandatory interest repayments but may dilute voting and residual ownership; debt preserves existing ownership but creates contractual cash obligations. Trade credit and overdrafts are not automatically cheaper merely because the explicit headline interest is low—lost settlement discounts, arrangement fees and rollover risks matter. Compute the relevant total financing cash cost for the forecast period and evaluate whether the lender can withdraw the facility before the asset generates cash."]],"workings":[["Compare overdraft versus term borrowing","A business needs $100,000 for 3 months. Overdraft rate 9% p.a. on actual balances throughout; short-term loan 7% p.a. plus $1,000 arrangement fee. Assume full balance used for 3 months.","Overdraft cost =100,000×9%×3/12=$2,250. Loan interest =100,000×7%×3/12=$1,750 plus fee $1,000 = $2,750. Overdraft is $500 cheaper under assumptions; repayment flexibility may affect decision."],["Deposit interest","$80,000 held in a 6-month deposit at simple 4% annual interest.","Interest =80,000×0.04×6/12=$1,600 before tax and fees. Compare the maturity with expected payroll and supplier obligations."],["Borrowing cost including fees and time","A company needs $80,000 for four months. Option A is an 11% annualised overdraft throughout; option B is a 7% annualised short-term loan plus $900 fixed arrangement fee. Ignore compounding, taxes and other charges. Compare cash financing costs.","Overdraft simple interest = $80,000×11%×4/12=$2,933.33. Loan interest = $80,000×7%×4/12=$1,866.67 plus fee $900, total $2,766.67. Loan is cheaper by approximately $166.67 under the stated constant-balance assumption, though early repayment flexibility, security and rollover terms can reverse the preference."],["Equity versus debt for a long-life asset","A start-up wants a $120,000 machine and compares a bank term loan at 8% annual interest with issuing 30% new equity for $120,000. Ignore loan principal repayment in the first-year cash comparison and assume no contractual dividend. Compare direct annual cash commitment and ownership effects.","The loan produces first-year interest of $120,000×8%=$9,600 before fees; principal still has to be repaid under the contract later and may require security. Issuing 30% equity generally carries no mandatory interest or principal repayment, but transfers 30% of the relevant post-issue ownership claim and may create voting/control consequences. It is incorrect to call equity 'free' merely because no interest is scheduled. Match asset life, funding certainty and future cash-flow capacity."]]}
};})(window);
