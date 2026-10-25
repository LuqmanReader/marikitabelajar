/* Original LedgerPeer scenario bank. Not official ACCA questions.
   Every returned numerical answer is computed from its visible premises. */
(function(root){
'use strict';
const draw=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const n=x=>Number(x).toLocaleString('en-MY',{maximumFractionDigits:2});
const round=x=>Math.round((x+Number.EPSILON)*100)/100;
const money=x=>'RM'+n(x);
function problem(key,rng,index){
 const P=(family,prompt,answer,explanation,unit='RM')=>({family,prompt,answer:round(answer),explanation,unit});
 const R=(a,b)=>draw(rng,a,b),Z=v=>money(v);
 switch(key){
 case 'FA1:A1':case 'FA1:B3':case 'FA2:B1':{
  const assets=R(40,120)*1000,debts=R(10,30)*1000;return P('accounting-equation','A business has total assets of '+Z(assets)+' and total liabilities of '+Z(debts)+'. Calculate closing equity.',assets-debts,'Equity = assets − liabilities = '+Z(assets-debts)+'.');}
 case 'FA1:B1':case 'FA1:B2':case 'FA2:C1':{
  const sale=R(3,40)*100;return P('balanced-entry','Goods costing '+Z(sale)+' are purchased on credit and recorded with a debit to purchases/inventory. What amount must be credited to payables?',sale,'For double entry, the matching credit to payables equals '+Z(sale)+'.');}
 case 'FA1:D1':case 'MA1:D2':case 'MA2:B2':{
  const hours=R(32,48),rate=R(8,25),extra=R(2,8),deductions=R(45,120),gross=hours*rate+extra*rate*1.5;
  const family=index%3;
  return family===0?P('gross-wage','An employee works '+hours+' basic hours at RM'+rate+'/hour and '+extra+' overtime hours at 1.5 times basic rate. What is gross pay?',gross,'Gross pay = basic hours × rate + overtime hours × 1.5 × rate = '+Z(gross)+'.'):
  family===1?P('net-wage','An employee earns gross pay of '+Z(gross)+' and has employee deductions of '+Z(deductions)+'. Calculate net pay.',gross-deductions,'Net pay = gross pay − employee deductions = '+Z(gross-deductions)+'.'):
  P('basic-wage','An employee is paid RM'+rate+' per hour and works '+hours+' ordinary hours. What is basic pay before bonuses and deductions?',rate*hours,'Basic pay = hours × hourly rate = '+Z(rate*hours)+'.');
 }
 case 'FA1:E1':case 'FA1:G1':case 'FA2:C2':case 'FA2:D6':{
  const open=R(5,20)*1000,sales=R(4,15)*1000,received=R(1,8)*1000;
  if(index%3===1)return P('supplier-balance','Trade payables open at '+Z(open)+'. Credit purchases are '+Z(sales)+' and suppliers receive payments of '+Z(received)+'. What is the closing payable?',open+sales-received,'Opening payable + purchases − payments = '+Z(open+sales-received)+'.');
  if(index%3===2)return P('receivables-change','Receivables open at '+Z(open)+'. Credit sales are '+Z(sales)+'; customer receipts are '+Z(received)+'. By how much did receivables increase?',sales-received,'Increase = credit sales − cash receipts = '+Z(sales-received)+'.');
  return P('receivables-close','Opening trade receivables are '+Z(open)+'. Credit sales total '+Z(sales)+' and receipts from customers are '+Z(received)+'. What is the closing receivable?',open+sales-received,'Closing receivables = opening + credit sales − receipts = '+Z(open+sales-received)+'.');
 }
 case 'FA1:H1':case 'FA1:I3':case 'FA2:E2':{
  const opening=R(6,18)*1000,credit=R(2,14)*1000,pay=R(1,8)*1000,returns=R(1,3)*100;
  return P(index%2?'supplier-credit':'supplier-reconcile','Trade payables open at '+Z(opening)+'. Credit purchases are '+Z(credit)+', payments are '+Z(pay)+' and purchase returns are '+Z(returns)+'. What should the closing balance be?',opening+credit-pay-returns,'Closing payables = opening + credit purchases − payments − returns = '+Z(opening+credit-pay-returns)+'.');
 }
 case 'FA1:F1':case 'FA1:I2':case 'FA2:D2':case 'FA2:E1':{
  const book=R(4,25)*1000,deposit=R(1,5)*100,unpresented=R(1,5)*100;
  if(index%2)return P('bank-cash-book','A cash book shows a debit bank balance of '+Z(book)+'. An unrecorded bank fee of '+Z(deposit)+' and direct receipt of '+Z(unpresented)+' appear on the bank statement. What is the corrected cash book balance?',book-deposit+unpresented,'Corrected cash book = old balance − fee + direct receipt = '+Z(book-deposit+unpresented)+'.');
  return P('bank-timing','The corrected cash book balance is '+Z(book)+'. Unpresented cheques total '+Z(unpresented)+' and deposits not yet credited by the bank total '+Z(deposit)+'. What balance should the bank statement show?',book+unpresented-deposit,'Bank statement balance = corrected cash book + unpresented cheques − uncredited deposits = '+Z(book+unpresented-deposit)+'.');
 }
 case 'FA1:F2':{
  const float=R(2,10)*100,expenses=R(1,Math.max(1,float/100-1))*50;
  return P('imprest','An imprest petty cash float is '+Z(float)+'. Approved vouchers total '+Z(expenses)+'. What cash reimbursement restores the float?',expenses,'Imprest reimbursement equals authorised expenditure, '+Z(expenses)+'.');
 }
 case 'FA1:J1':case 'FA2:F1':{
  const debit=R(40,110)*1000,diff=R(1,12)*100;
  return P('trial-balance','A trial balance has debit balances totalling '+Z(debit)+' and credit balances of '+Z(debit-diff)+'. How much is the difference?',diff,'Difference = debit total − credit total = '+Z(diff)+'.');
 }
 case 'FA1:J2':case 'FA2:F2':{
  const amount=R(2,20)*100;
  return P('correction','A purchase expense of '+Z(amount)+' was debited correctly but its matching credit was omitted. How much credit needs to be entered to complete double entry?',amount,'The missing credit must equal the original debit: '+Z(amount)+'.');
 }
 case 'MA1:C1':case 'MA2:A3':{
  const l=R(100,200),h=l+R(50,140),vc=R(6,20),fixed=R(1000,5000),lo=vc*l+fixed,hi=vc*h+fixed;
  if(index%2)return P('high-low-fixed','Total cost is '+Z(lo)+' at '+l+' units and '+Z(hi)+' at '+h+' units. Using high-low, calculate fixed cost.',fixed,'Variable rate = ('+Z(hi)+' − '+Z(lo)+') ÷ ('+h+' − '+l+') = RM'+vc+'. Fixed cost = '+Z(fixed)+'.');
  return P('high-low-rate','Total cost is '+Z(lo)+' for '+l+' units and '+Z(hi)+' for '+h+' units. Using high-low, calculate variable cost per unit.',vc,'Rate = cost change ÷ activity change = RM'+vc+' per unit.','RM/unit');
 }
 case 'MA1:C2':case 'MA2:C5':{
  const tonnes=R(5,30),km=R(20,80),cost=R(2,14)*tonnes*km;
  return P(index%2?'composite-output':'service-unit','A carrier transports '+tonnes+' tonnes over '+km+' kilometres at a total trip cost of '+Z(cost)+'. What is cost per tonne-kilometre?',cost/(tonnes*km),'Tonne-kilometres = '+tonnes+' × '+km+'. Cost per tonne-km = '+Z(cost)+' ÷ '+(tonnes*km)+' = '+Z(cost/(tonnes*km))+'.','RM/tonne-km');
 }
 case 'MA1:D1':case 'MA2:B1':case 'FA2:D3':{
  const a=R(40,100),b=R(30,90),unit1=R(6,15),unit2=R(16,27),total=a*unit1+b*unit2;
  if(index%3===0)return P('materials-average','Opening inventory is '+a+' units at RM'+unit1+' each. A further '+b+' units are purchased at RM'+unit2+' each. Under periodic weighted average, what is the average unit cost?',total/(a+b),'Weighted average = total cost ÷ total units = '+Z(total)+' ÷ '+(a+b)+' = '+Z(round(total/(a+b)))+'.','RM/unit');
  if(index%3===1)return P('materials-fifo','Opening inventory is '+a+' units costing RM'+unit1+' each. A purchase of '+b+' units at RM'+unit2+' each follows. Under FIFO, what is the cost of issuing '+Math.min(a,30)+' units?',Math.min(a,30)*unit1,'FIFO issues oldest units first: '+Math.min(a,30)+' × RM'+unit1+' = '+Z(Math.min(a,30)*unit1)+'.');
  return P('materials-total','A store holds '+a+' units at RM'+unit1+' and receives '+b+' more units at RM'+unit2+'. What is the total material cost available?',total,'Total = ('+a+' × RM'+unit1+') + ('+b+' × RM'+unit2+') = '+Z(total)+'.');
 }
 case 'MA1:D3':case 'MA2:B3':case 'MA2:C1':{
  const hours=R(2,10)*1000,rate=R(4,20),oh=hours*rate,jobHours=R(5,20);
  if(index%2)return P('overhead-absorbed','Budgeted production overhead is '+Z(oh)+' for '+hours+' labour-hours. A particular job uses '+jobHours+' hours. How much overhead is absorbed by that job?',rate*jobHours,'Absorption rate = RM'+rate+' per hour; job charge = '+jobHours+' × RM'+rate+' = '+Z(rate*jobHours)+'.');
  return P('overhead-rate','Budgeted production overhead is '+Z(oh)+' for '+hours+' labour-hours. Find the overhead absorption rate.',rate,'Absorption rate = budgeted overhead ÷ budgeted activity = RM'+rate+' per hour.','RM/hour');
 }
 case 'MA1:D4':case 'MA2:C3':{
  const directMat=R(4,20)*100,directLab=R(4,16)*100,directExp=R(1,8)*100,overhead=R(4,15)*100;
  if(index%3===0)return P('prime-cost','Direct materials cost '+Z(directMat)+', direct labour '+Z(directLab)+' and direct expenses '+Z(directExp)+'. What is prime cost?',directMat+directLab+directExp,'Prime cost = direct materials + direct labour + direct expenses = '+Z(directMat+directLab+directExp)+'.');
  if(index%3===1)return P('production-cost','A job has direct materials '+Z(directMat)+', direct labour '+Z(directLab)+' and production overhead '+Z(overhead)+'. Assume no other costs. What is total production cost?',directMat+directLab+overhead,'Production cost = materials + labour + production overhead = '+Z(directMat+directLab+overhead)+'.');
  const cost=directMat+directLab+overhead,markup=R(1,4)*10;
  return P('job-markup','A job costs '+Z(cost)+' and is priced at a '+markup+'% mark-up ON COST. What is selling price?',cost*(1+markup/100),'Selling price = cost × (1 + mark-up) = '+Z(cost*(1+markup/100))+'.');
 }
 case 'FA2:D1':{
  const net=R(8,40)*100,rate=[5,8,10][R(0,2)],gross=net*(1+rate/100);
  return P(index%2?'sales-net':'purchase-net','An invoice is '+Z(gross)+' including '+rate+'% sales tax. Find the amount excluding tax.',net,'Net invoice = gross ÷ (1 + tax rate) = '+Z(net)+'.');
 }
 case 'FA2:D4':{
  const cost=R(20,80)*1000,residual=R(1,7)*1000,life=R(3,8);
  if(index%2)return P('asset-carrying-amount','A machine costs '+Z(cost)+', its residual value is '+Z(residual)+' and its useful life is '+life+' years. Assuming straight-line depreciation, what is carrying amount after one full year?',round(cost-(cost-residual)/life),'Carrying amount = cost − annual depreciation = '+Z(round(cost-(cost-residual)/life))+'.');
  return P('straight-line','An asset costs '+Z(cost)+', has an estimated residual value of '+Z(residual)+' and useful life of '+life+' years. What is annual straight-line depreciation?',round((cost-residual)/life),'Annual depreciation = (cost − residual value) ÷ useful life = '+Z(round((cost-residual)/life))+'.');
 }
 case 'FA2:D5':{
  const yearCost=R(12,32)*120,used=R(1,10);
  return P(index%2?'period-charge':'prepaid-balance','An insurance payment of '+Z(yearCost)+' covers 12 months. By the reporting date '+used+' months have been used. What is the prepayment?',round(yearCost*(12-used)/12),'Prepayment = payment × unused months ÷ total months = '+Z(round(yearCost*(12-used)/12))+'.');
 }
 case 'FA2:D7':{
  const original=R(20,60)*1000,draw=R(2,12)*1000,profit=R(6,25)*1000;
  return P('owner-equity','A sole trader opens the period with capital '+Z(original)+', earns profit of '+Z(profit)+' and takes drawings of '+Z(draw)+'. No new capital is introduced. Calculate closing capital.',original+profit-draw,'Closing capital = opening capital + profit − drawings = '+Z(original+profit-draw)+'.');
 }
 case 'FA2:G1':{
  const open=R(2,10)*1000,purchases=R(10,24)*1000,close=R(3,10)*1000,sales=R(25,60)*1000;
  if(index%2)return P('gross-profit','Revenue is '+Z(sales)+'. Opening inventory '+Z(open)+', purchases '+Z(purchases)+' and closing inventory '+Z(close)+'. What is gross profit?',sales-open-purchases+close,'Gross profit = sales − (opening inventory + purchases − closing inventory) = '+Z(sales-open-purchases+close)+'.');
  return P('cost-of-sales','Opening inventory is '+Z(open)+', purchases '+Z(purchases)+' and closing inventory '+Z(close)+'. No purchase returns. What is cost of sales?',open+purchases-close,'Cost of sales = opening + purchases − closing = '+Z(open+purchases-close)+'.');
 }
 case 'FA2:H1':case 'FA2:H2':case 'FA2:H3':{
  const total=R(12,50)*1000,share=R(1,4),other=5-share;
  return P('partner-ratio','Two partners share residual profits '+share+':'+other+'. The residual profit pool is '+Z(total)+'. Calculate the first partner’s share.',round(total*share/5),'First partner receives '+share+' / 5 of the pool = '+Z(round(total*share/5))+'.');
 }
 case 'MA2:C2':{
  const units=R(4,20)*100,variable=R(5,25),margin=R(6,24),selling=variable+margin;
  if(index%2)return P('contribution-unit','Selling price per unit is RM'+selling+' and variable cost is RM'+variable+'. What is contribution per unit?',margin,'Contribution per unit = selling price − variable cost = RM'+margin+'.','RM/unit');
  return P('contribution-total','Selling price is RM'+selling+' and variable cost RM'+variable+' per unit. If '+units+' units are sold, calculate total contribution.',units*margin,'Total contribution = (selling price − variable cost) × units = '+Z(units*margin)+'.');
 }
 case 'MA2:C4':{
  const input=R(8,20)*100,loss=R(4,10),actual=input-Math.round(input*loss/100),rate=R(3,12);
  return P('normal-loss','A process starts with '+input+' input units. Normal loss is '+loss+'% of input. Assuming the percentage produces a whole-unit loss, what is expected good output?',input-Math.round(input*loss/100),'Expected good output = input − normal loss = '+(input-Math.round(input*loss/100))+' units.','units');
 }
 case 'MA2:D1':{
  const vc=R(4,20),margin=R(6,18),price=vc+margin,fixed=R(10,50)*margin*100,breakeven=fixed/margin,budget=breakeven+R(10,60)*100;
  const fam=index%4;
  return fam===0?P('break-even','Fixed costs are '+Z(fixed)+'. A product sells for RM'+price+' and variable cost is RM'+vc+' per unit. Calculate break-even volume.',breakeven,'Contribution = RM'+margin+'; break-even units = fixed costs ÷ contribution = '+breakeven+' units.','units'):
  fam===1?P('margin-safety','Budget sales are '+budget+' units and break-even sales are '+breakeven+' units. What is the margin of safety?',budget-breakeven,'Margin of safety = budgeted units − break-even units = '+(budget-breakeven)+'.','units'):
  fam===2?P('cs-ratio','Selling price is RM'+price+' and variable cost is RM'+vc+' per unit. Calculate the C/S ratio as a percentage to TWO DECIMAL PLACES.',round(100*margin/price),'C/S ratio = contribution per unit ÷ selling price × 100 = '+round(100*margin/price)+'%.','%'):
  P('target-profit','Fixed costs are '+Z(fixed)+', contribution is RM'+margin+' per unit and the desired profit is '+Z(margin*1000)+'. How many units must be sold to earn that profit?',breakeven+1000,'Required volume = (fixed costs + target profit) ÷ contribution per unit = '+(breakeven+1000)+' units.','units');
 }
 case 'MA2:D2':{
  const incremental=R(10,45)*100,extra=R(4,20)*100,unavoidable=R(4,18)*100;
  return P('relevant-cost','A special order needs extra materials '+Z(incremental)+' and additional labour '+Z(extra)+'. A past design fee of '+Z(unavoidable)+' is sunk and cannot be recovered. What is the relevant incremental cost?',incremental+extra,'Relevant cost excludes sunk design fees = new materials + new labour = '+Z(incremental+extra)+'.');
 }
 case 'MA2:D3':{
  const investment=R(8,35)*1000,annual=R(3,10)*1000;
  return P('simple-payback','A project costs '+Z(investment)+' and generates equal annual NET cash inflows of '+Z(annual)+'. Ignoring discounting, calculate payback in years to TWO decimal places.',round(investment/annual),'Simple payback = initial investment ÷ annual net cash inflows = '+round(investment/annual)+' years.','years');
 }
 case 'MA2:E3':case 'MA2:E1':case 'MA2:E2':{
  const opening=R(5,30)*1000,income=R(8,28)*1000,out=R(9,35)*1000;
  return P('cash-forecast','Opening cash is '+Z(opening)+'. Planned receipts are '+Z(income)+' and payments total '+Z(out)+'. What is closing cash (enter a negative value for an overdraft)?',opening+income-out,'Closing cash = opening + receipts − payments = '+Z(opening+income-out)+'.');
 }
 case 'MA2:E4':{
  const principal=R(5,40)*1000,rate=R(2,12),years=R(1,4);
  return P('simple-interest','A loan of '+Z(principal)+' bears simple interest of '+rate+'% annually for '+years+' years. What total interest is payable (ignore fees)?',principal*rate/100*years,'Total interest = principal × annual rate × years = '+Z(principal*rate/100*years)+'.');
 }
 case 'FA2:A1':{
  const rent=R(12,48)*120,months=R(2,9),owing=R(2,16)*100,paid=R(3,15)*100;
  if(index%3===0)return P('period-recognition','An annual rent payment of '+Z(rent)+' covers 12 months. At the reporting date '+months+' months of that coverage remain unused. Calculate the prepayment.',rent*months/12,'Prepayment = total rent × months attributable to next year ÷ 12 = '+Z(rent*months/12)+'.');
  if(index%3===1)return P('accrual-principle','A business owes '+Z(owing)+' for utilities already consumed in the reporting period, but has not received the invoice. Calculate the expense to recognise under accrual accounting.',owing,'Record the utility expense when incurred: '+Z(owing)+'.');
  return P('accrual-cash-difference','A business collected '+Z(paid)+' in advance for services. At year-end, services worth '+Z(Math.floor(paid/100)*40)+' have been delivered. Calculate the amount remaining as a liability.',paid-Math.floor(paid/100)*40,'Deferred income = cash received − revenue earned = '+Z(paid-Math.floor(paid/100)*40)+'.');
 }
 case 'FA2:A2':case 'FA2:B2':{
  const cash=R(4,20)*1000,sales=R(3,12)*1000,returns=R(1,5)*100,receipts=R(2,9)*1000;
  if(index%3===0)return P('flow-of-records','The receivables ledger has an opening debit of '+Z(cash)+'. Credit sales invoices total '+Z(sales)+', credit notes '+Z(returns)+' and receipts '+Z(receipts)+'. What is the closing debit balance?',cash+sales-returns-receipts,'Receivables = opening + credit invoices − credit notes − customer receipts = '+Z(cash+sales-returns-receipts)+'.');
  if(index%3===1)return P('source-document-correction','An invoice of '+Z(sales)+' was posted twice to receivables and sales. What amount must be credited to receivables to correct the duplication?',sales,'Reversing one duplicate entry credits receivables by '+Z(sales)+'.');
  return P('posting-trial-balance','A journal contains debits of '+Z(cash)+' and '+Z(returns)+'. What total credits must be entered to balance the journal?',cash+returns,'Total credits must equal total debits = '+Z(cash+returns)+'.');
 }
 case 'FA2:A3':{
  const cost=R(12,70)*100,price=cost+R(8,20)*100,completion=R(1,12)*100,nrv=price-completion;
  if(index%3===0)return P('measurement-nrv','For one inventory item, estimated sale proceeds are '+Z(price)+' and selling/completion costs are '+Z(completion)+'. What is net realisable value?',nrv,'NRV = sale proceeds − costs to complete and sell = '+Z(nrv)+'.');
  if(index%3===1)return P('measurement-lower-of','One inventory item cost '+Z(cost)+'. Its estimated net realisable value is '+Z(nrv)+'. Under the lower-of-cost-and-NRV rule, at what amount is it recorded?',Math.min(cost,nrv),'Inventory measurement = lower of cost ('+Z(cost)+') and NRV ('+Z(nrv)+') = '+Z(Math.min(cost,nrv))+'.');
  return P('measurement-write-down','An inventory item has cost '+Z(cost)+' and NRV '+Z(nrv)+'. What is the required inventory write-down (enter zero when no write-down is needed)?',Math.max(0,cost-nrv),'Write-down = max(0, cost − NRV) = '+Z(Math.max(0,cost-nrv))+'.');
 }
 case 'MA2:A1':{
  const completed=R(40,90),outstanding=R(10,60),onTime=R(20,completed);
  if(index%3===0)return P('operational-completion','An operational report lists '+completed+' completed orders and '+outstanding+' outstanding orders. What percentage of all orders have been completed? Give TWO decimal places.',round(100*completed/(completed+outstanding)),'Completion rate = completed ÷ all orders × 100 = '+round(100*completed/(completed+outstanding))+'%.','%');
  if(index%3===1)return P('management-on-time','Of '+completed+' completed jobs, '+onTime+' were finished by their deadlines. What percentage were completed on time? Give TWO decimal places.',round(100*onTime/completed),'On-time performance = '+onTime+' ÷ '+completed+' × 100 = '+round(100*onTime/completed)+'%.','%');
  return P('management-backlog','An operations dashboard shows '+completed+' completed orders, '+outstanding+' still open and '+R(5,12)+' cancelled. How many orders are still outstanding?',outstanding,'Backlog is the number of outstanding orders = '+outstanding+'.','orders');
 }
 case 'MA2:A2':{
  const dm=R(4,18)*100,dl=R(3,15)*100,oh=R(1,9)*100,units=R(4,20)*10;
  if(index%3===0)return P('cost-system-production','A batch costs '+Z(dm)+' in direct materials, '+Z(dl)+' in direct labour and '+Z(oh)+' in production overhead. What is total production cost?',dm+dl+oh,'Total production cost = materials + labour + production overhead = '+Z(dm+dl+oh)+'.');
  if(index%3===1)return P('cost-system-direct','A job cost card lists direct materials '+Z(dm)+' and direct labour '+Z(dl)+'. What is prime cost, assuming no other direct expenses?',dm+dl,'Prime cost = direct materials + direct labour = '+Z(dm+dl)+'.');
  return P('cost-system-unit','A batch of '+units+' identical items has total production cost '+Z((dm+dl+oh)) +'. What is cost per item? Give TWO decimal places.',round((dm+dl+oh)/units),'Cost per item = total batch cost ÷ '+units+' = '+Z(round((dm+dl+oh)/units))+'.','RM/unit');
 }
 case 'MA2:A4':{
  const budget=R(30,120)*100,actual=budget+R(1,18)*100,target=R(50,90),achieved=R(35,95);
  if(index%3===0)return P('comparison-absolute','Budgeted spending was '+Z(budget)+' and actual spending was '+Z(actual)+'. By what amount was actual spending ABOVE budget?',actual-budget,'Adverse spending difference = actual − budget = '+Z(actual-budget)+'.');
  if(index%3===1)return P('comparison-percentage','Budgeted spending was '+Z(budget)+' and actual spending was '+Z(actual)+'. What was the percentage overspend relative to budget? Give TWO decimal places.',round(100*(actual-budget)/budget),'Overspend % = (actual − budget) ÷ budget × 100 = '+round(100*(actual-budget)/budget)+'%.','%');
  return P('comparison-output','The production target was '+target+' units and actual output was '+achieved+' units. Calculate the difference (actual minus target), allowing a negative number.',achieved-target,'Output variance in units = actual − target = '+(achieved-target)+' units.','units');
 }
 case 'MA2:A5':{
  const budget=R(20,90)*100,actual=budget-R(1,14)*100,entries=R(50,130),errors=R(1,18);
  if(index%3===0)return P('reporting-favourable','A management report compares budgeted cost of '+Z(budget)+' against actual cost of '+Z(actual)+'. Calculate the favourable cost variance in RM.',budget-actual,'Favourable cost difference = budget − actual = '+Z(budget-actual)+'.');
  if(index%3===1)return P('reporting-percentage','A report shows budgeted cost '+Z(budget)+' and actual cost '+Z(actual)+'. By what percentage is actual cost BELOW budget? Give TWO decimal places.',round((budget-actual)/budget*100),'Savings % = (budget − actual) ÷ budget × 100 = '+round((budget-actual)/budget*100)+'%.','%');
  return P('reporting-error-rate','Of '+entries+' transactions in an exception report, '+errors+' contain confirmed coding errors. What percentage contain errors? Give TWO decimal places.',round(100*errors/entries),'Exception error rate = error count ÷ total transactions × 100 = '+round(100*errors/entries)+'%.','%');
 }
 default:return null;
 }
}

/* Individually authored, answer-keyed objective examples by syllabus subtopic.
   [stem, correct choice, distractor 1, distractor 2, distractor 3, explanation] */
const CONCEPTS={
'FA1:A1':[["An owner pays RM4,000 of personal savings into a business bank account. Which effect should be recorded?","Assets and capital both increase","Sales revenue increases","A bank loan is recognised","An expense is recorded","Owner capital introduced increases both the bank asset and equity."]],
'FA1:A2':[["A customer returns faulty goods previously sold on credit. Which document should the seller normally issue?","Credit note","Purchase order","Goods received note","Statement of account","A credit note reduces the value owed on the earlier sales invoice."]],
'FA1:A3':[["Which sequence most accurately describes a normal bookkeeping audit trail?","Source document, journal/book of prime entry, ledger, trial balance","Trial balance, invoice, ledger, journal","Ledger, invoice, trial balance, authorisation","Financial statements, receipt, journal, invoice","Transaction evidence is recorded then posted and summarised before reporting."]],
'FA1:B1':[["An office buys furniture for cash. Which double entry records the purchase?","Dr furniture, Cr bank","Dr bank, Cr furniture","Dr expense, Cr sales","Dr receivables, Cr furniture","Buying an asset increases furniture and reduces the bank asset."]],
'FA1:B2':[["Which journal would correct rent mistakenly recorded as electricity expense?","Dr rent expense, Cr electricity expense","Dr bank, Cr electricity expense","Dr electricity expense, Cr rent expense","Dr rent expense, Cr bank","Reclassification shifts the cost between expense accounts without another payment."]],
'FA1:B3':[["Which statement presents assets, liabilities and equity at a specific reporting date?","Statement of financial position","Statement of profit or loss","Statement of changes in cash only","Sales day book","Financial position reports assets, liabilities and equity at a point in time."]],
'FA1:C1':[["Which item is independent evidence from the bank that helps verify cash-book entries?","Bank statement","Internal sales invoice","Petty-cash voucher","Customer purchase order","Bank statements are prepared by the bank, not the company."]],
'FA1:C2':[["A company converts paper invoices to searchable digital copies. What should it preserve?","Legibility, authorised access and an audit trail","Only file names","Only printed copies of the latest month","Unlimited access for every employee","Record retention depends on a usable audit trail and appropriate access controls."]],
'FA1:D1':[["Which item reduces an employee’s net pay without normally reducing their gross pay?","Employee payroll deduction","Employer-paid pension contribution","Customer payment","Factory depreciation","Employee deductions are taken from gross pay to calculate net pay."]],
'FA1:E1':[["In a normal trade receivables ledger account, an increase in amounts owed by customers is entered on which side?","Debit","Credit","Both sides equally","Neither side","Receivables are assets and generally increase on the debit side."]],
'FA1:F1':[["A company receives cash from a customer. How should its cash records reflect this?","Record a receipt supported by evidence","Record a cash payment","Create a supplier credit note","Exclude it until year-end","Cash records must capture receipts promptly with supporting documents."]],
'FA1:F2':[["Under an imprest petty-cash system, what normally equals the float replenishment?","Vouchers for authorised payments since the last replenishment","Original float plus receipts","Closing petty cash balance","Annual salary expense","Restoring the fixed imprest replaces the cash spent on authorised vouchers."]],
'FA1:G1':[["What is the effect of receiving payment from a credit customer?","Decrease trade receivables","Increase credit sales","Increase drawings","Increase trade payables","The settlement reduces the customer’s outstanding receivable."]],
'FA1:H1':[["A supplier issues a credit note for goods returned. What should happen to the related trade payable?","Decrease","Increase","Remain unchanged","Become sales revenue","Purchase returns reduce the amount owed to the supplier."]],
'FA1:I1':[["Which item is typically a timing difference rather than a cash-book error?","An unpresented cheque","A bank charge never entered in the cash book","A receipt posted twice to the cash book","An incorrect cash-book total","An unpresented cheque is already recorded in the cash book but not yet by the bank."]],
'FA1:I2':[["A cheque has been recorded as a payment in the cash book but has not cleared the bank. How is it treated?","Unpresented cheque in the reconciliation","A second cash-book payment","New trade receivable","Direct credit from bank","Do not record the same cheque payment twice."]],
'FA1:I3':[["A supplier statement includes an invoice missing from the payable ledger. What should the business do?","Investigate and record the genuine omitted invoice","Ignore all supplier statements","Add the amount to sales revenue","Delete the supplier ledger balance","Genuine omissions require correction rather than a permanent reconciling item."]],
'FA1:J1':[["Which error may still exist even when total trial-balance debits equal credits?","Complete omission of a transaction","One-sided debit posting","A debit total misaddition with no matching error","A credit recorded without a debit","A balanced trial balance does not detect a complete omission."]],
'FA1:J2':[["An expense is incorrectly debited to an asset account, with the credit posted correctly. Which type of error is this?","Error of principle","Error of original entry","Complete reversal","Transposition error","Posting an expense as an asset is a classification error of principle."]],
'MA1:A1':[["Which is the main audience for management accounting reports?","Internal managers","Only external shareholders","Only tax inspectors","Only statutory auditors","Management accounting is primarily designed for internal decisions."]],
'MA1:A2':[["A report arrives after the operational decision has already been made. Which quality has been most compromised?","Timeliness","Physical durability","Historical cost","Double-entry balance","Management information must be timely to be decision-useful."]],
'MA1:B1':[["Which control is most appropriate before a transaction enters an accounting system?","Validity and authorisation checks","Removal of audit trails","Using shared passwords","Disabling backups","Input controls help prevent invalid and unauthorised data."]],
'MA1:B2':[["A business labels first invoices 0001, 0002, 0003 in order. What coding method is this?","Sequential coding","Block coding","Hierarchical coding","Faceted coding","Sequential codes increase in order of issue."]],
'MA1:C1':[["Within the relevant range, how does total fixed cost normally behave as output rises?","Remains constant","Increases proportionately","Falls at the variable cost rate","Becomes zero after break-even","Fixed cost remains constant in total over the relevant activity range."]],
'MA1:C2':[["Which responsibility centre controls costs, revenues and the capital invested?","Investment centre","Cost centre only","Revenue centre only","Production unit of measure","Investment centres are evaluated with reference to invested capital as well as profits."]],
'MA1:D1':[["Under FIFO material costing, which inventory cost is normally issued first?","The earliest acquired cost","The latest acquired cost","The highest available price","The average of only the latest purchase","FIFO assumes the oldest costs are issued first."]],
'MA1:D2':[["Which record attributes an employee’s time to a specific production job?","Job card","Supplier statement","Customer remittance advice","Bank reconciliation","Job cards assign labour time to specific jobs."]],
'MA1:D3':[["Factory rent is normally classified as which type of cost?","Production overhead","Direct material","Selling expense","Owner drawings","Factory rent is an indirect production cost."]],
'MA1:D4':[["Which elements are included in prime cost?","Direct materials, direct labour and direct expenses","Direct materials plus selling expense","Production overhead plus finance cost","Selling price less profit","Prime cost is the total of the three direct production cost categories."]],
'MA1:E1':[["What is the usual relationship between a spreadsheet workbook and a worksheet?","A workbook can contain several worksheets","A worksheet contains many independent workbooks","A workbook is a chart only","Worksheet and workbook always refer to the same cell","Workbooks hold one or more worksheets."]],
'MA1:E2':[["What happens to an absolute reference such as $B$2 when a formula is copied?","The referenced row and column remain fixed","Both coordinates shift with the new position","It becomes a text label","Only the row shifts","Dollar signs lock the referenced row and column."]],
'MA1:E3':[["Which feature best improves the readability of a printed cost report?","Clear headings and labelled units","3D decoration without labels","Mixed currencies without explanation","Tiny print with columns cut off","Labelled units and appropriate print scaling support sound decisions."]],
'FA2:A1':[["Which situation most clearly creates a liability at the reporting date?","Electricity consumed but not yet paid","Rent prepaid for next year","Cash held in the bank","Inventory ready for sale","An unpaid expense for services already used creates an obligation."]],
'FA2:A2':[["Why should accounting transactions retain supporting evidence?","To allow authorised tracing and review","To conceal changes in ledger accounts","To replace all double-entry posting","To eliminate the need for reconciliations","Supporting evidence underpins a reliable audit trail."]],
'FA2:A3':[["Which pair describes the fundamental qualitative characteristics of useful financial information?","Relevance and faithful representation","Timeliness and sales growth","Comparability and liquidity","Profitability and leverage","Relevance and faithful representation are fundamental in the Conceptual Framework."]],
'FA2:B1':[
 ["Which item is normally reported as a current asset?","Rent paid in advance","Electricity expense owed but unpaid","Bank loan repayable next month","Customer advance payment","A prepayment represents a future economic benefit controlled by the entity."],
 ["A customer pays for goods that have not yet been delivered. What is the initial classification?","Liability (deferred income)","Revenue earned immediately","Owner capital","An expense","The business owes goods or services until the obligation is satisfied."],
 ["Which item represents equity rather than revenue?","Owner capital introduced","Fees charged to customers","Credit sales recognised","Interest income earned","Capital introduced is a contribution by an owner, not performance income."]
 ],
'FA2:B2':[["When goods are sold on credit, which pair of accounts is normally affected?","Trade receivables and sales revenue","Bank and sales revenue","Trade payables and sales revenue","Purchases and trade payables","Credit sales recognise the customer’s receivable and sales income."]],
'FA2:C1':[["To recognise an accrued electricity cost, which journal is appropriate?","Dr electricity expense, Cr accrual liability","Dr bank, Cr electricity income","Dr accrual liability, Cr electricity expense","Dr drawings, Cr bank","The expense is incurred now even though cash has not been paid."]],
'FA2:C2':[["Where is the opening balance of an asset normally brought down in its ledger account?","Debit side","Credit side","Both sides","Neither side","An asset normally has a debit balance."]],
'FA2:D1':[["Sales returns are also referred to as which of the following?","Returns inwards","Returns outwards","Purchase discounts","Drawings","Customer sales returns reduce sales revenue."]],
'FA2:D2':[["A cheque from a customer is dishonoured. Which cash-book adjustment is normally needed?","Reduce bank and restore the receivable","Increase sales revenue","Increase bank and reduce receivables","Record a purchase return","The bank receipt is reversed and the customer's debt is reinstated."]],
'FA2:D3':[["At reporting date, how should inventory normally be valued?","Lower of cost and net realisable value","Higher of cost and net realisable value","Always the retail selling price","Always the latest purchase price","Inventory is measured at the lower of cost and NRV."]],
'FA2:D4':[["Which expenditure is usually included in the initial cost of a new machine?","Necessary installation cost","Staff entertainment expense","General selling expense","Interest on an unrelated loan","Directly attributable installation is part of bringing the machine into working condition."]],
'FA2:D5':[["An annual insurance premium is paid in advance. The portion relating to next year is what?","Prepayment asset","Accrued expense liability","Deferred revenue","Current-year depreciation","A prepayment is a future benefit for which cash has already been paid."]],
'FA2:D6':[["When an irrecoverable receivable is written off, which account is normally credited?","Trade receivables","Sales revenue","Cash","Capital","Writing off the customer debt credits the receivables control or customer account."]],
'FA2:D7':[["A sole trader withdraws cash for personal use. Which treatment is correct?","Drawings reduce capital","Recognise an operating expense","Recognise a sales return","Recognise finance income","Drawings are distributions to the owner, not business expenses."]],
'FA2:E1':[["An unpresented cheque has been entered correctly in the cash book but not yet shown by the bank. What is it?","A reconciling timing difference","An accrued expense","A double-entry error requiring a second cash entry","Revenue not yet earned","Timing differences reconcile the two records without re-posting the cheque."]],
'FA2:E2':[["A supplier statement shows a credit note not recorded in the purchaser’s ledger. What should be checked?","Whether a genuine purchase return was omitted","Whether sales revenue is understated","Whether owner drawings increased","Whether bank interest is missing","Investigate credit notes and amend the supplier ledger if appropriate."]],
'FA2:F1':[["A trial balance agrees. Which conclusion is justified?","Debits equal credits, but other accounting errors may remain","Every transaction is necessarily correct","All asset values are accurate","There can be no omissions","Trial balance agreement checks arithmetical equality only."]],
'FA2:F2':[["Which type of error normally affects trial balance agreement?","A one-sided posting","A complete omission","An error of principle","A complete reversal","A one-sided entry leaves an unmatched debit or credit."]],
'FA2:G1':[["In a trading business, which calculation gives cost of sales before adjustments for returns?","Opening inventory + purchases − closing inventory","Sales − gross profit margin percentage","Opening inventory + closing inventory","Purchases − wages + drawings","Cost of sales includes opening inventory, purchases and the deduction for closing inventory."]],
'FA2:H1':[["Which provision of a partnership agreement directly affects how residual profit is shared?","Profit-sharing ratio","Inventory turnover","Bank reconciliation date","Debtor days","The partnership agreement specifies partners' shares of remaining profits."]],
'FA2:H2':[["Partner salary allowances are normally handled in which statement?","Partnership appropriation of profit","Trade receivables ledger","Bank reconciliation","Cost of sales","Partner salary allowances are profit appropriations, not ordinary employment wages."]],
'FA2:H3':[["When a partner joins halfway through the year, what must be considered when allocating profit?","Old and new profit-sharing arrangements for their respective periods","Only the year-end sharing ratio","Only the incoming partner's drawings","Only the opening bank balance","Profit is apportioned between the periods using the applicable partnership agreements."]],
'MA2:A1':[["Which information is most useful for operational production managers?","Frequent and detailed output and exception figures","Only five-year market projections","Only public financial statements","Unlabelled historic totals","Operational control needs timely, granular information."]],
'MA2:A2':[["Which costing approach is generally suitable for large quantities of homogeneous continuous output?","Process costing","Job costing for one bespoke item","Single-sale pricing","Partnership profit sharing","Process costing accumulates cost through continuous production processes."]],
'MA2:A3':[["A machine was purchased last year and the cost cannot be recovered. In a new make-or-buy decision, the original purchase price is usually what?","Sunk cost","Incremental cost","Opportunity cost","Avoidable variable cost","Unrecoverable past expenditure is not a relevant future cash flow."]],
'MA2:A4':[["When output volume changes sharply, what improves comparison of actual and budgeted production costs?","Adjusting for activity level","Comparing totals without adjustment","Ignoring activity measures","Treating all differences as efficiency problems","Volume changes should be separated from genuine performance effects."]],
'MA2:A5':[["Which improvement is most useful in a management variance report?","Highlight material variances and likely causes","Remove date and unit labels","Show every raw transaction without summary","Mix forecasts and actuals without headings","A manager needs clear, actionable exceptions."]],
'MA2:B1':[["Which inventory costing method uses the earliest purchase costs first?","FIFO","Periodic weighted average","Replacement cost method","Selling price valuation","FIFO treats the oldest inventory cost as issued first."]],
'MA2:B2':[["Which item is deducted from gross wages when calculating net pay?","Employee deduction","Employer factory rent","Machine depreciation","Customer receipt","Net pay is gross pay less employee deductions."]],
'MA2:B3':[["When is production overhead over-absorbed?","Absorbed overhead exceeds actual overhead","Actual overhead exceeds absorbed overhead","No overhead rate exists","Selling expenses are included","Over-absorption means more overhead was charged to production than actually incurred."]],
'MA2:C1':[["How is fixed production overhead treated under absorption costing?","Included in inventory cost per unit","Always charged fully as a period cost","Omitted from both inventory and profit","Treated as a sales commission","Absorption costing includes fixed manufacturing overhead in the production cost."]],
'MA2:C2':[["How is contribution per unit calculated?","Selling price minus variable cost per unit","Selling price minus fixed cost in total","Sales revenue minus drawings","Profit plus loan repayments","Contribution is the excess of sales over variable costs."]],
'MA2:C3':[["A job costs RM800 and earns a 25% mark-up on cost. Which selling price is correct?","RM1,000","RM640","RM1,067","RM825","Mark-up is applied to cost: RM800 × 1.25 = RM1,000."]],
'MA2:C4':[["Which loss is expected as an inherent part of a well-controlled production process?","Normal loss","Abnormal loss","Abnormal gain","Financial investment loss","Normal loss is anticipated in setting process costs."]],
'MA2:C5':[["Which composite cost unit is most appropriate for road freight carrying varying loads and distances?","Tonne-kilometres","Units of finished goods","Cost per invoice","Number of bank receipts","Tonne-kilometres combine weight moved and distance travelled."]],
'MA2:D1':[["A budget forecasts 4,000 sales units and break-even output is 2,700 units. What is margin of safety in units?","1,300","6,700","2,700","4,000","Margin of safety = budgeted sales − break-even sales = 1,300 units."]],
'MA2:D2':[["Which cost is relevant when using a scarce machine for one job prevents another profitable job?","Opportunity cost of the forgone contribution","Historic purchase price of the machine","Last year's factory rent","Irrecoverable prior training costs","The contribution foregone from the best alternative is an opportunity cost."]],
'MA2:D3':[["Which investment appraisal method explicitly discounts future cash flows?","Net present value","Simple payback","Accounting rate of return","Basic contribution analysis","NPV applies discount factors to future incremental cash flows."]],
'MA2:E1':[["Why can a company report a profit but experience a cash shortage?","Customers may not have paid their credit invoices yet","Profit always equals cash receipts","Depreciation always requires immediate cash payment","Cash balances determine sales revenue","Profit is accrual-based while customer receipts can occur later."]],
'MA2:E2':[["When choosing a short-term deposit for surplus cash, which trade-off is relevant?","Security, liquidity and return","Only the highest advertised interest rate","Only accounting profit","Only inventory volume","Cash investment considers preservation, availability and return."]],
'MA2:E3':[["What is included in a cash budget in the period paid rather than the period expensed?","A scheduled cash payment for capital equipment","Depreciation with no cash payment","Unpaid accrual only","Inventory valuation adjustment only","Cash budgets track actual receipts and payments at expected dates."]],
'MA2:E4':[["Which item is normally an example of short-term finance?","Bank overdraft","New long-term ordinary shares","A 20-year mortgage loan","Permanent share capital","Overdrafts support short-term funding needs."]]
};
function concept(key,rng,index){
 const bank=CONCEPTS[key];if(!bank?.length||index>=bank.length)return null;
 const [prompt,correct,a,b,c,explanation]=bank[index];
 const options=[correct,a,b,c];for(let i=options.length-1;i>0;i--){const j=draw(rng,0,i);[options[i],options[j]]=[options[j],options[i]];}
 return {family:'author-'+index,prompt,choices:options.map((label,i)=>({value:'C'+i,label})),
   correctValue:'C'+options.indexOf(correct),explanation};
}

root.LedgerExamScenarios={problem,concept};
if(typeof module!=='undefined'&&module.exports)module.exports={problem,concept};
})(typeof window!=='undefined'?window:globalThis);
