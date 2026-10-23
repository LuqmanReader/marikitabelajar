book('management','Management accounting: information, costs and decisions',['MA1','MA2','FMA']);
chapter('management','information','Management information, data quality, coding and spreadsheets',`## Begin with the decision
Management accounting supports planning, decisions and control. Financial accounts summarise external reporting; managers may need daily units, service quality, forecasts or product margins. Strategic information is broad and long-term; operational information is detailed and frequent. Relevant, timely information is more useful than an exact report arriving after the decision.
Primary data is collected for the present purpose; secondary data already exists. Internal data can be detailed but still biased or incomplete. External data may improve context but use different definitions. Check source, period, units, completeness and whether the population matches the question. A survey of existing premium customers does not represent every potential customer.
## Codes and processing
A coding system identifies products, departments, transactions and accounts consistently. Hierarchical codes can group related items, but codes should remain unique, understandable and controlled. Input validation, authorisation, duplicate checks and reconciliations protect the information path from transaction capture to output. A formatted code is not proof that the underlying purchase was genuine.
## Spreadsheet skills that prevent mistakes
Use one clearly labelled set of assumptions, formulas for calculations and separate output tables. Relative references move when copied; absolute references such as $B$2 stay fixed. If column A contains quantity and B2 holds a constant rate, a copied formula may need A5*$B$2 rather than A5*B2. Check ranges after inserting rows; a SUM can omit the last row without producing an error message.
- Preserve an original data copy and document transformations.
- Reconcile input counts and totals to the source.
- Check formulas using a simple independently calculated case.
- Label currencies, thousands, periods and percentages; 5 and 5% are different inputs.
- Use appropriate chart scales, print areas, repeated headings and page orientation so output is usable.
## Statistics and sampling
A mean uses all observations and is affected by extremes; a median uses ordered central positions. A weighted mean reflects importance or frequency. Random sampling gives defined selection chances; stratification can ensure important subgroups are represented. Sampling risk remains and large biased samples remain biased.
## Worked example and practice
A product contributes £8 on 300 units; another £20 on 100. Weighted average contribution = (300×8+100×20)/400 = £11. The simple average £14 assumes equal volumes and is wrong for this mix.
A report shows costs of 240 and revenue 300, both in thousands. What is profit and margin?
### Answer
Profit is 60 thousand, or £60,000 if the currency is pounds. Margin = 60/300 = 20%. Multiplying one side by 1,000 but not the other would invalidate the calculation.`);
chapter('management','cost-behaviour','Classifying costs and modelling cost behaviour',`## Classify for a purpose
A cost object is what you want to measure: a product, job, customer or service. A direct cost can be economically traced to that object; an indirect cost needs allocation. The same cost can be direct to a department but indirect to individual products. Production cost is not synonymous with every expense the business incurs.
Cost centres collect costs; profit centres are responsible for revenue and costs; investment centres also influence relevant invested capital. Responsibility reports should distinguish controllable costs from allocations a manager cannot change.
## Fixed and variable behaviour
A variable cost changes in total with the relevant activity while its rate per activity unit is assumed constant within the model. A fixed cost remains unchanged in total within a relevant range and period; fixed cost per unit falls as output rises. Step-fixed costs change when capacity bands are crossed. A mixed cost includes fixed and variable components.
For 1,000 units at variable cost £4 and fixed cost £6,000, total cost is £10,000 and average £10. At 2,000 units within capacity, total is £14,000 and average £7. It is wrong to predict £20,000 simply by carrying forward the old £10 average unit cost.
## High–low calculation
Use the observations with highest and lowest activity, not necessarily highest and lowest cost. Cost £26,000 at 4,000 units and £38,000 at 7,000 gives variable rate (38,000−26,000)/(7,000−4,000) = £4. Fixed cost is £26,000−4,000×4 = £10,000. Forecast at 6,000 units is £34,000.
This uses two points and assumes their difference reflects activity rather than a strike, price change or unusual event. Plot data, inspect outliers and consider regression where appropriate. Correlation indicates association, not causation; extrapolating outside observed capacity can be unreliable.
## Relevant range and time
A factory rent may be fixed this month but increase when another building is required. A labour cost may be fixed within a shift yet variable across staffing decisions. Always identify the decision horizon. Cost behaviour for budgeting and cost relevance for a specific decision are related but different classifications.
## Practice
A service has £12,000 fixed monthly cost plus £3 per customer. Calculate cost at 4,000 and 5,000 customers. Can the same formula automatically be used at 50,000?
### Answer
£24,000 and £27,000. Not automatically at 50,000: extra premises, staff, systems or purchasing changes may invalidate the assumed relevant range. State and test the capacity assumptions.`);
chapter('management','inputs','Materials, labour and production overhead',`## Materials through the system
Control starts with purchase authorisation, receipt checks, storage records and authorised issues. A material requisition records use in production; a purchase invoice records acquisition. These are different events. Inventory balances reconcile opening stock + receipts − issues ± adjustments = closing stock. Investigate losses rather than change quantities to force agreement.
FIFO and weighted average determine issue costs under their assumptions. For 100 kg at £4 and 200 kg at £5, total cost is £1,400. Periodic weighted average is £4.6667/kg; issuing 90 kg costs £420 and leaves £980. A moving average recomputes after each receipt and may give a different answer when issues occur between receipts.
## Labour cost and idle time
Time records identify paid hours, productive hours, overtime and idle time. Distinguish the worker's basic pay from overtime premium and employer on-costs. Whether a premium is direct to a specific job or part of overhead depends on why it arose and the question's policy. Idle-time cost is not productive labour simply because it is paid.
Ten workers are each paid 40 hours at £15, so basic pay totals £6,000. If 20 total hours are idle, productive hours are 380 and idle cost £300. The appropriate allocation preserves the full £6,000 cost; it does not make idle time disappear.
## Overhead absorption
Allocate overhead wholly to a relevant cost centre when possible; apportion shared costs on a rational basis such as floor area or usage. Reapportion service departments to production departments using the required method. Then absorb production overhead into cost units using a predetermined rate.
Budget production overhead £120,000 and budget machine hours 30,000 gives an absorption rate £4/hour. Actual activity 28,000 hours absorbs £112,000. If actual overhead is £118,000, overhead is under-absorbed by £6,000: actual cost exceeds the amount charged to products. Separate spending and volume effects if required.
## Stock controls and purchasing
Order quantity balances order and holding costs; reorder point considers lead-time demand and safety stock. A stock ledger should not allow staff to authorise, receive, hold and independently reconcile all stock without review. An independent count can reveal errors that a perfectly adding spreadsheet misses.
## Practice
A job uses 12 material units at £5, six labour hours at £18 and four machine hours at a £7 overhead rate. What is production job cost?
### Answer
Materials £60 + labour £108 + absorbed overhead £28 = £196. This is not necessarily a selling price, nor does it automatically include selling, administration or financing costs.`);
chapter('management','methods','Job, batch, process and service costing; absorption and marginal cost',`## Choose the cost object and method
Job costing tracks a distinct order; batch costing accumulates a run and divides by its good units; process costing averages continuous production; service costing chooses a meaningful output measure such as passenger-kilometres or occupied bed-days. Do not choose a method merely because its name appears familiar.
A batch has £2,400 setup cost and variable production £0.40 for each of 6,000 good units. Total £4,800 gives £0.80/unit. Doubling the run does not double the same single setup cost, unless another setup is required.
## Process losses and equivalent units
Normal loss is expected under stated conditions and its net cost is normally borne by expected good output. Abnormal loss is identified separately. With £10,000 process cost, 1,000 input units and 10% normal loss with no scrap value, expected output is 900 units and normal cost £11.1111/good unit. If actual good output is 880 with no closing work in progress, 20 units are abnormal loss, valued under the specified method. Do not silently spread abnormal loss over 880 units and conceal it.
Equivalent units express incomplete work as complete-unit equivalents separately for materials and conversion. If 100 closing units have all materials but are 40% converted, they represent 100 material units and 40 conversion units. Opening work-in-progress treatment differs between FIFO and weighted-average methods; follow the question.
## Absorption versus marginal costing
Absorption inventory includes relevant fixed production overhead. Marginal inventory excludes fixed production overhead, which is expensed in the period. Contribution = sales − variable costs; it is not the final profit before fixed costs are deducted.
Production 1,000 units and sales 800 raises inventory by 200. At fixed production overhead £6/unit, absorption profit is £1,200 higher than marginal profit under constant-rate simple assumptions. If inventory falls, the direction reverses. Selling and administration overhead are not automatically production inventory costs.
## Alternative perspectives
Activity-based costing links overhead pools to causal drivers: £36,000 order-processing cost/900 orders = £40/order. Target costing works backward from market price less desired profit; lifecycle costing includes development and after-sale costs. These approaches influence decisions rather than replace every statutory inventory requirement.
## Practice
A delivery service spends £45,000 for 15,000 deliveries. What is average cost, and why might it mislead?
### Answer
£3/delivery. Different distances, parcel sizes and failed deliveries can consume different resources, so a single average may cross-subsidise customers and misinform pricing.`);
chapter('management','cvp-decisions','Contribution, break-even, limiting factors and relevant-cost decisions',`## Build the contribution model
Contribution per unit = selling price − variable cost per unit. Total contribution covers fixed costs; any excess is profit. Break-even units = fixed costs/contribution per unit, provided contribution is positive and the model assumptions hold. Required units for a target profit = (fixed costs + target profit)/unit contribution.
At price £25, variable cost £15 and fixed cost £30,000, contribution is £10 and break-even 3,000 units. Selling 4,000 units gives contribution £40,000 and profit £10,000. Margin of safety is 1,000 units, or 25% of actual/budgeted sales of 4,000. The contribution-to-sales ratio is 40%, so break-even revenue is £75,000.
CVP assumes a relevant range, sufficiently stable selling prices/cost rates and, for multiple products, an appropriate constant mix. A graph is not evidence these assumptions will hold.
## Scarce resources
Rank by contribution per unit of the binding resource, not contribution per product. A contributes £12 and uses three machine hours: £4/hour. B contributes £10 and uses one: £10/hour. Produce B first up to demand under a single binding constraint, then allocate remaining capacity. Multiple constraints can need a different optimisation method.
## Relevant costs
Include future cash flows that change between options and benefits forgone. Exclude sunk expenditure and unchanged allocations. Materials already owned can have replacement or resale opportunity cost. Spare capacity is relevant only if truly available without displacing useful work.
A special order pays £5,000, needs materials £2,800 and extra labour £1,000. With spare capacity, no other changes and no opportunity cost, incremental benefit is £1,200. A share of old equipment depreciation is not an extra cash cost. If the order displaces £1,500 contribution, the decision changes to a £300 disadvantage.
## Make or buy
Compare avoidable internal costs plus lost alternative benefits with total purchase-related costs. Fixed overhead allocated to a product is not necessarily saved by outsourcing. Consider quality, supplier reliability, know-how, security and transition costs before recommending the numerically cheaper option.
## Practice
Price is £40, variable cost £24, fixed cost £48,000. How many units earn £16,000 profit, and what if capacity is only 3,500?
### Answer
Contribution £16; required units (48,000+16,000)/16 = 4,000. At 3,500 units profit is £8,000. The target cannot be reached under the unchanged assumptions and capacity; management must assess price, cost, capacity or mix changes rather than present 4,000 as feasible.`);
chapter('management','budgets','Preparing budgets, cash forecasts and flexed comparisons',`## Start with the principal budget factor
A budget translates objectives into coordinated quantities and money. Demand is often limiting, but labour, materials or capacity can be the constraint. Start with the actual limiting factor, then reconcile sales, production, purchasing, staffing and financing assumptions. A forecast is an updated expectation; a budget can also authorise resources or set targets.
Production units = sales + desired closing finished goods − opening finished goods. Materials usage follows production; materials purchases = usage + desired closing raw materials − opening raw materials. Cash payments then depend on credit terms, not simply the purchase month.
## Worked sequence
Sales budget is 5,000 units; opening finished goods 500 and closing target 700. Production is 5,200 units. At 3 kg/unit, material usage is 15,600 kg. Opening raw material is 2,000 kg and closing target 2,300 kg, so purchases are 15,900 kg. At £4/kg, purchases cost £63,600 before other relevant costs.
Do not multiply sales directly by 3 kg and call that purchases: you would miss both inventory movements.
## Cash budget
Opening cash + receipts − payments = closing cash before new financing. Budget receipts by credit-sale timing and expected non-payment; budget supplier, wage, capital, tax and finance payments at their actual due dates. Depreciation is non-cash. A loan receipt is financing, not sales revenue.
If opening cash is £8,000, receipts £35,000 and payments £49,000, cash is £6,000 negative before financing. To preserve a £2,000 minimum balance requires £8,000 funding, not £6,000. Check whether interest, arrangement fees and repayment change later forecasts.
## Flexible budgets
A flexed budget restates expectations at actual activity. With £10,000 fixed cost and £4/unit at budget output 5,000, static cost is £30,000. At actual output 6,000, flexed cost is £34,000. Actual cost £35,500 gives £1,500 adverse against flexed budget; comparing only with £30,000 would mix activity and performance effects.
## Behaviour and review
Participation can improve information but create slack. Unrealistic targets can encourage gaming. Assign variance actions to owners, separate controllable effects and do not celebrate underspending caused by damaging quality or maintenance cuts.
## Practice
Forty percent of monthly sales are cash and sixty percent collected the next month. Last month's sales were £50,000 and this month's £60,000. What receipts arise this month, ignoring bad debts?
### Answer
£24,000 from current cash sales plus £30,000 from prior credit sales = £54,000. Current revenue of £60,000 is not the same as current cash receipts.`);
chapter('management','standards','Standard costs, variances and profit reconciliation',`## Standards need a defined basis
A standard describes expected input quantity and price for a defined output and operating conditions. An attainable standard allows normal unavoidable conditions; an ideal standard assumes perfect operation. Outdated standards can produce persistent variances unrelated to current staff performance.
Calculate standard input for actual output before assessing efficiency. If each unit should use 3 kg and actual output is 1,000 units, standard quantity allowed is 3,000 kg, regardless of budget output.
## Materials worked example
Standard price £5/kg; actual use 3,200 kg at £4.80. Standard material cost for actual output is £15,000; actual cost £15,360. Total variance is £360 adverse. Usage variance = (3,000−3,200)×5 = £1,000 adverse. Price variance on this used-quantity basis = 3,200×(5−4.80) = £640 favourable. Net £360 adverse reconciles.
Some questions calculate price variance at purchase rather than usage; state and follow the specified basis. Do not combine quantities inconsistently when reconciling.
## Labour and overhead
If standard labour for actual output is 500 hours at £18, and actual is 520 hours at £19, rate variance = 520×(18−19) = £520 adverse. Efficiency variance = (500−520)×18 = £360 adverse. Total cost variance £880 adverse. Idle-time treatment may be separated according to the question. Fixed and variable overhead variances use different cost behaviour and activity bases; an unchanged rate cannot remove a volume effect.
## Interpretation before blame
Cheaper materials can create favourable price but adverse usage, quality or labour effects. Higher paid skilled workers can improve efficiency. Assess connected causes and who controls the decision. A favourable cost variance may reflect underproduction or poor quality rather than success.
## Profit reconciliation
Start from budget profit, add favourable and subtract adverse variances using the required absorption or marginal method. Use contribution for marginal sales-volume effects; do not mix contribution and profit bases. Never include both a total variance and its components. Actual result should reconcile to the independent profit statement.
## Practice
Budget profit £40,000; favourable sales price £3,000; adverse material price £800; favourable usage £200; all other effects nil. What is actual profit?
### Answer
£42,400. The net materials effect is £600 adverse, not £1,000. Explain the economic causes rather than infer them solely from the signs. A reconciliation checks completeness and arithmetic but does not prove the underlying standards were fair.`);
chapter('management','investment-performance','Investment appraisal, financial mathematics and performance',`## Time value of money
Money now can earn a return and fund obligations. Compound future value = present amount×(1+r)^n; present value reverses this. Use compatible rates and periods. Nominal cash flows include price inflation; real cash flows exclude general inflation. Mixing nominal cash with a real rate creates inconsistency.
## A complete small appraisal
An asset costs £10,000 now and generates £4,000 at each of the next three year ends, with no residual value or other cash flows. At 10%, PVs are £3,636.36, £3,305.79 and £3,005.26: total £9,947.41 and NPV −£52.59. Under the model the project is slightly unattractive. Undiscounted payback is 2.5 years only if the final year's receipts arise evenly; with strict year-end receipts the recovery occurs at the third receipt. State timing assumptions.
NPV evaluates value at a required return. Payback focuses on recovery speed and ignores later cash flows; ARR uses accounting profit and the specified investment base, not cash flow. IRR is a discount rate giving zero NPV but can be problematic for unusual cash-flow signs or comparing projects of different scale. Use the method required and explain its limits.
## Relevant project cash
Include future incremental operating cash, working capital, disposal amounts and tax where required. Exclude sunk research and depreciation as direct cash, though tax allowances can create cash savings. A working-capital investment often releases at the end; do not forget either side. Test demand, price, cost and timing assumptions rather than assume one forecast is certain.
## Performance measures
ROI = relevant profit/investment; residual income = profit−capital×required return. Profit £150,000 on £1m gives ROI 15%; at required return 10%, RI is £50,000. A new project yielding 12% can lower the average ROI but improve RI and create value above the 10% requirement.
Non-financial measures cover service, quality, innovation and staff capability. Economy concerns input cost; efficiency output/input; effectiveness achievement of purpose. Public-service effectiveness is not established by a surplus alone.
## Practice
A division has 20% ROI and can add a project earning 15% against a 10% required return. Why might an ROI-only bonus lead to a poor decision?
### Answer
The project reduces average ROI, so the manager may reject it even though its return exceeds the required 10%. Use suitable value-based and strategic assessment alongside divisional ratios. Also check risk, funding and the reliability of forecasts.`);
