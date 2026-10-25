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
  const hours=R(2,10)*1000,rate=R(4,20),oh=hours*rate;
  if(index%2)return P('overhead-absorbed','Budgeted production overhead is '+Z(oh)+' with expected activity of '+hours+' labour-hours. A job uses '+R(5,20)+' hours. What is the absorption rate per labour-hour?',rate,'Rate = budgeted overhead ÷ budgeted hours = '+Z(oh)+' ÷ '+hours+' = RM'+rate+' per hour.','RM/hour');
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
  P('target-profit','Fixed costs are '+Z(fixed)+', contribution is RM'+margin+' per unit and target profit is '+Z(margin*R(5,30)*100)+'. What is break-even sales volume in units (not target-profit volume)?',breakeven,'Break-even ignores target profit: fixed costs ÷ contribution per unit = '+breakeven+' units.','units');
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
 default:return null;
 }
}
root.LedgerExamScenarios={problem};
if(typeof module!=='undefined'&&module.exports)module.exports={problem};
})(typeof window!=='undefined'?window:globalThis);
