/* LedgerPeer original reasoning-diversity extensions for FA2 and MA2.
 * These are NOT copied from an ACCA or commercial exam kit.
 * Each family changes the operation students must reason through, not just values.
 * Distinct families have both MCQ and numerical forms; the quality engine
 * caps each family to one appearance per sitting.
 */
(function(root){
'use strict';
const bank=root.LedgerExamScenarios;
if(!bank||typeof bank.problem!=='function')return;
const previous=bank.problem.bind(bank);
const R=(rng,a,b)=>a+Math.floor(rng()*(b-a+1));
const money=n=>'$'+Number(n).toLocaleString('en-GB',{maximumFractionDigits:2});
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
const Q=(family,prompt,answer,explanation,unit='$',difficulty='moderate')=>({
 family,prompt,answer:round(answer),explanation,unit,difficulty
});
const authors={
 'FA2:D4':[
  r=>{const c=R(r,30,75)*1000,rate=R(r,10,35)/100,year=round(c*(1-rate)*rate);
   return Q('reducing-balance-year-two','A machine was acquired for '+money(c)+' at the start of Year 1. Depreciation is charged at '+(rate*100).toFixed(0)+'% per year on the reducing-balance basis. What is the depreciation EXPENSE for Year 2?',year,
    'Year 1 depreciation = '+money(round(c*rate))+'. Year 2 starts at carrying amount '+money(round(c*(1-rate)))+'; Year 2 expense = that carrying amount × '+(rate*100).toFixed(0)+'% = '+money(year)+'.');},
  r=>{const c=R(r,24,48)*1000,install=R(r,2,6)*500,training=R(r,1,4)*300;
   return Q('capitalised-cost-versus-training','A manufacturer buys production machinery for '+money(c)+'. Necessary installation and testing cost '+money(install)+'. Optional training for staff who will use the machine costs '+money(training)+'. Assume the machine is ready for use after testing and the training does not enhance it. What INITIAL machine cost should be capitalised?',c+install,
     'Capitalise the purchase cost '+money(c)+' and directly attributable installation/testing '+money(install)+', giving '+money(c+install)+'. Staff training '+money(training)+' is expensed, not added to the machine cost.');},
  r=>{const c=R(r,24,60)*1000,residual=R(r,1,4)*1000,life=R(r,4,8),months=[3,6,9][R(r,0,2)],charge=round((c-residual)/life*months/12);
   return Q('part-year-depreciation','Equipment costs '+money(c)+' with residual value '+money(residual)+' and '+life+' years of useful life. It was available for use '+months+' months before the year end. Under straight-line depreciation and a monthly pro-rata policy, what is the current-year depreciation charge?',charge,
    'Full-year straight-line charge = ('+money(c)+' − '+money(residual)+') ÷ '+life+'. Multiply by '+months+'/12 months to obtain '+money(charge)+'.');},
  r=>{const c=R(r,18,50)*1000,acc=R(r,4,13)*1000,gain=R(r,1,6)*500,proceeds=c-acc+gain;
   return Q('disposal-proceeds-from-gain','An item of equipment originally cost '+money(c)+' and has accumulated depreciation of '+money(acc)+' at disposal. The business recognises a gain on disposal of '+money(gain)+'. What CASH PROCEEDS were received?',proceeds,
    'Carrying amount = original cost − accumulated depreciation = '+money(c-acc)+'. Disposal proceeds = carrying amount + gain '+money(gain)+' = '+money(proceeds)+'.');}
 ],
 'FA2:D5':[
  r=>{const monthly=R(r,3,11)*100,months=R(r,2,5),owing=monthly*months;
   return Q('outstanding-expense-accrual','Electricity is billed at an estimated '+money(monthly)+' per month. At year end, '+months+' months of services have been consumed but no invoice or payment has been recorded. What accrual liability should be recognised?',owing,
    'Accrual = cost for months already consumed but not recorded = '+money(monthly)+' × '+months+' = '+money(owing)+'. The same amount increases the expense for this year.');},
  r=>{const annual=R(r,24,72)*100,used=R(r,2,10),expense=round(annual*used/12);
   return Q('prepaid-expense-current-year-charge','An insurance premium of '+money(annual)+' covers exactly 12 months beginning this reporting year. The insurance has been used for '+used+' whole months at year end. Assuming the whole premium was initially recorded as an expense, what insurance expense remains in profit or loss after the year-end adjustment?',expense,
    'Expense relates to months used: '+money(annual)+' × '+used+'/12 = '+money(expense)+'. The unused '+(12-used)+' months become a prepayment asset.');},
  r=>{const q=R(r,12,36)*100,earned=R(r,1,3),received=R(r,0,earned-1)*100,accrued=q*earned-received;
   return Q('accrued-income-recognition','A consultant earns '+money(q)+' for each completed month of services. At the reporting date '+earned+' months are completed, and cash receipts for those services total '+money(received)+'. No related revenue has previously been recorded. How much accrued income/receivable remains after recognising the earned revenue?',accrued,
    'Total earned revenue = '+money(q)+' × '+earned+' = '+money(q*earned)+'. Less receipts '+money(received)+' leaves accrued income '+money(accrued)+'.');}
 ],
 'FA2:D6':[
  r=>{const opening=R(r,7,17)*1000,sales=R(r,6,15)*1000,returns=R(r,3,12)*100,receipts=R(r,4,10)*1000,closing=opening+sales-returns-receipts;
   return Q('receivables-return-and-cash','Receivables open at '+money(opening)+'. Credit sales are '+money(sales)+', customers return goods worth '+money(returns)+', and customer payments are '+money(receipts)+'. No other transactions occur. Find closing gross trade receivables.',closing,
    'Closing receivables = opening '+money(opening)+' + credit sales '+money(sales)+' − returns '+money(returns)+' − receipts '+money(receipts)+' = '+money(closing)+'.');},
  r=>{const gross=R(r,20,50)*1000,rate=R(r,3,7),old=R(r,3,7)*500,required=gross*rate/100,change=round(required-old);
   return Q('allowance-increase-or-reversal','At year end, gross trade receivables are '+money(gross)+'. The required allowance is '+rate+'% of receivables. The existing allowance has a credit balance of '+money(old)+'. What is the adjustment to the irrecoverable debt expense? Enter a NEGATIVE amount for an expense reversal.',change,
     'Required allowance = '+money(gross)+' × '+rate+'% = '+money(required)+'. Adjustment = required allowance − existing credit balance '+money(old)+' = '+money(change)+'. A negative answer represents a reversal of expense.');},
  r=>{const bal=R(r,15,35)*1000,writeoff=R(r,5,20)*100,allowance=R(r,4,13)*100,net=bal-writeoff-allowance;
   return Q('net-receivables-after-writeoff','A company reports gross receivables of '+money(bal)+' before removing a specifically irrecoverable debt of '+money(writeoff)+'. After this write-off, the REQUIRED closing allowance is '+money(allowance)+'. What NET trade receivables should be reported?',net,
    'Gross receivables after write-off = '+money(bal-writeoff)+'. Subtract the required closing allowance '+money(allowance)+' to report '+money(net)+' net receivables.');},
  r=>{const opening=R(r,4,10)*1000,newSales=R(r,6,14)*1000,payment=R(r,2,6)*1000,returned=R(r,1,5)*500,dishonoured=R(r,1,3)*500,bal=opening+newSales-payment-returned+dishonoured;
   return Q('dishonoured-receipt-restatement','A customer has opening receivables of '+money(opening)+'. Further credit sales are '+money(newSales)+', cash received '+money(payment)+' and credit notes '+money(returned)+'. A previously recorded receipt of '+money(dishonoured)+' is now dishonoured and must be reinstated. What is the closing receivable?',bal,
    'Opening '+money(opening)+' + sales '+money(newSales)+' − receipts '+money(payment)+' − credit notes '+money(returned)+' + dishonoured receipt '+money(dishonoured)+' = '+money(bal)+'.');}
 ],
 'FA2:E1':[
  r=>{const cash=R(r,10,30)*1000,charge=R(r,1,8)*100,interest=R(r,1,5)*100,standing=R(r,2,9)*100,revised=cash-charge+interest-standing;
   return Q('cash-book-three-unrecorded-items','Before reconciliation, the cash book shows a DEBIT bank balance of '+money(cash)+'. The bank statement shows unrecorded bank charges '+money(charge)+', bank interest received '+money(interest)+' and a standing order payment '+money(standing)+'. What is the corrected cash book balance?',revised,
    'Correct cash book = '+money(cash)+' − bank charges '+money(charge)+' + bank interest '+money(interest)+' − standing order '+money(standing)+' = '+money(revised)+'.');},
  r=>{const corrected=R(r,12,30)*1000,outstanding=R(r,1,7)*500,deposit=R(r,2,8)*500,statement=corrected+outstanding-deposit;
   return Q('deposit-in-transit-reconciliation','The corrected cash book has a DEBIT balance of '+money(corrected)+'. Unpresented cheques total '+money(outstanding)+'. The bank statement balance is '+money(statement)+'. What amount of deposits not yet credited by the bank reconciles the balances?',deposit,
    'Bank statement = cash book + unpresented cheques − deposits in transit. Rearrange to deposits = '+money(corrected)+' + '+money(outstanding)+' − '+money(statement)+' = '+money(deposit)+'.');}
 ],
 'FA2:G1':[
  r=>{const sales=R(r,25,75)*1000,margin=[20,25,30,40][R(r,0,3)],profit=sales*margin/100;
   return Q('gross-margin-from-revenue','Sales revenue is '+money(sales)+' and gross profit MARGIN is '+margin+'% of sales. What gross profit should be recognised?',profit,
    'Gross profit margin uses SALES as denominator: '+money(sales)+' × '+margin+'% = '+money(profit)+'. Do not treat the percentage as a mark-up on cost.');},
  r=>{const opening=R(r,5,12)*1000,purchases=R(r,20,55)*1000,returns=R(r,1,6)*1000,carriage=R(r,3,12)*100,closing=R(r,3,9)*1000,cos=opening+purchases-returns+carriage-closing;
   return Q('cost-of-sales-returns-and-carriage','Opening inventory is '+money(opening)+', purchases '+money(purchases)+', purchase returns '+money(returns)+', carriage INWARDS '+money(carriage)+' and closing inventory '+money(closing)+'. Calculate cost of sales.',cos,
    'Cost of sales = opening inventory + purchases − purchase returns + carriage inwards − closing inventory = '+money(cos)+'.');}
 ],
 'MA2:B1':[
  r=>{const oldUnits=R(r,2,6)*100,oldCost=R(r,4,9),newUnits=R(r,3,7)*100,newCost=oldCost+R(r,2,6),issue=oldUnits+R(r,1,newUnits/100)*100,cost=oldUnits*oldCost+(issue-oldUnits)*newCost;
   return Q('fifo-two-batches-issue-value','Opening inventory consists of '+oldUnits+' units at $'+oldCost+' each. A new purchase brings '+newUnits+' units at $'+newCost+' each. A subsequent issue to production is '+issue+' units. Under FIFO, what is the COST of the issue?',cost,
    'FIFO issues oldest stock first: '+oldUnits+' × $'+oldCost+' + '+(issue-oldUnits)+' × $'+newCost+' = '+money(cost)+'.');},
  r=>{const u1=R(r,2,6)*100,p1=R(r,4,9),u2=R(r,2,5)*100,p2=p1+R(r,1,5),avg=round((u1*p1+u2*p2)/(u1+u2));
   return Q('weighted-average-inventory-unit-cost','Inventory has '+u1+' units costing $'+p1+' each and another '+u2+' units costing $'+p2+' each. Using the periodic weighted-average method, what is average cost PER UNIT to two decimal places?',avg,
    'Weighted-average cost per unit = ('+u1+' × $'+p1+' + '+u2+' × $'+p2+') / '+(u1+u2)+' = $'+avg+' per unit.','$/unit');}
 ],
 'MA2:B2':[
  r=>{const staffStart=R(r,40,80),staffEnd=staffStart+R(r,-6,6),leavers=R(r,4,15),rate=round(100*leavers/((staffStart+staffEnd)/2));
   return Q('labour-turnover-leavers-rate','A business starts the period with '+staffStart+' employees and ends with '+staffEnd+'. During the period '+leavers+' employees leave. Using the average-workforce method, calculate the labour turnover rate to TWO decimal places.',rate,
    'Average workforce = ('+staffStart+' + '+staffEnd+') / 2 = '+(staffStart+staffEnd)/2+'. Labour turnover = '+leavers+' leavers / average workforce × 100 = '+rate+'%.','%');},
  r=>{const regular=R(r,32,40),overtime=R(r,3,10),rate=R(r,8,16),factor=1.5,gross=regular*rate+overtime*rate*factor;
   return Q('overtime-premium-gross-pay','An employee works '+regular+' ordinary hours at $'+rate+' per hour and '+overtime+' overtime hours at TIME-AND-A-HALF. What gross pay should be recorded before deductions?',gross,
    'Ordinary pay = '+regular+' × $'+rate+'. Overtime pay = '+overtime+' × $'+rate+' × 1.5. Total = '+money(gross)+'.');}
 ],
 'MA2:B3':[
  r=>{const actual=R(r,28,52)*1000,rate=R(r,5,15),hours=R(r,2,5)*1000,absorbed=rate*hours,variance=round(actual-absorbed);
   return Q('overhead-under-absorption','Actual production overhead is '+money(actual)+'. Production absorbed '+hours+' machine hours at $'+rate+' per machine hour. Calculate the UNDER-absorption amount. Enter a negative answer for OVER-absorption.',variance,
    'Absorbed overhead = '+hours+' × $'+rate+' = '+money(absorbed)+'. Actual overhead − absorbed overhead = '+money(variance)+'. A negative difference means over-absorption.');}
 ],
 'MA2:C2':[
  r=>{const produced=R(r,35,70)*100,sold=produced+R(r,4,12)*100,foh=R(r,3,15),diff=(produced-sold)*foh;
   return Q('absorption-profit-lower-inventory-reduction','A manufacturer makes '+produced+' units and sells '+sold+' units during the period, drawing down opening inventory. Fixed production overhead absorbed is $'+foh+' per unit. Assume no over/under absorption or other differences. By how much does ABSORPTION costing profit exceed MARGINAL costing profit? Enter a negative value if absorption profit is lower.',diff,
    'Change in inventory = '+produced+' production − '+sold+' sales = '+(produced-sold)+' units. Absorption minus marginal profit = inventory change × fixed overhead rate = '+money(diff)+'.');},
  r=>{const sell=R(r,30,80),mat=R(r,6,15),lab=R(r,5,12),com=R(r,2,8),units=R(r,3,12)*100,contrib=(sell-mat-lab-com)*units;
   return Q('multiple-variable-cost-contribution','A product sells for $'+sell+' per unit. Variable materials are $'+mat+', variable labour $'+lab+' and variable sales commission $'+com+' per unit. Calculate TOTAL contribution at '+units+' units sold.',contrib,
    'Contribution per unit = selling price − all variable costs = $'+sell+' − $'+mat+' − $'+lab+' − $'+com+' = $'+(sell-mat-lab-com)+'. Multiply by '+units+' units to get '+money(contrib)+'.');}
 ],
 'MA2:C4':[
  r=>{const input=R(r,8,20)*100,normal=R(r,4,12),actualLoss=R(r,3,13)*10,expected=Math.round(input*normal/100),actualOutput=input-actualLoss,abnormal=actualOutput-(input-expected);
   return Q('process-abnormal-gain-or-loss','A production process has '+input+' input units and normal loss of '+normal+'%. Actual loss is '+actualLoss+' units. What is the ABNORMAL GAIN in units? Enter a negative amount if there is an abnormal LOSS.',abnormal,
    'Expected good output = '+input+' − '+expected+' = '+(input-expected)+' units. Actual good output = '+input+' − '+actualLoss+' = '+actualOutput+' units. Actual minus expected = '+abnormal+' units.');}
 ],
 'MA2:D1':[
  r=>{const price=R(r,35,65),variable=R(r,12,25),fixed=R(r,30,65)*1000,priceDrop=R(r,2,7),extraFixed=R(r,5,15)*1000,c=price-priceDrop-variable,units=Math.ceil((fixed+extraFixed)/c);
   return Q('break-even-after-price-and-fixed-change','A business has selling price $'+price+', variable cost $'+variable+' per unit and fixed costs '+money(fixed)+'. It plans to CUT the selling price by $'+priceDrop+' per unit and incur '+money(extraFixed)+' additional annual fixed costs. What is the NEW break-even volume, rounded UP to whole units?',units,
    'Revised contribution per unit = $'+price+' − $'+priceDrop+' − $'+variable+' = $'+c+'. Revised fixed cost = '+money(fixed+extraFixed)+'. New break-even = '+money(fixed+extraFixed)+' / $'+c+' = '+units+' whole units, rounding up.','units','hard');},
  r=>{const budget=R(r,12,30)*1000,bep=R(r,5,11)*1000,m=round(100*(budget-bep)/budget);
   return Q('margin-of-safety-percentage','Budgeted sales are '+budget+' units and break-even output is '+bep+' units. Calculate margin of safety AS A PERCENTAGE OF BUDGETED SALES to two decimal places.',m,
    'Margin of safety = '+(budget-bep)+' units. Percentage = ('+(budget-bep)+' / '+budget+') × 100 = '+m+'%.','%');},
  r=>{const fixed=R(r,20,60)*1000,target=R(r,5,30)*1000,cs=[20,25,40,50][R(r,0,3)],rev=round((fixed+target)/(cs/100));
   return Q('target-revenue-using-cs-ratio','An entity has fixed costs '+money(fixed)+', target profit '+money(target)+' and a contribution-to-sales ratio of '+cs+'%. What sales REVENUE is required to achieve the target profit?',rev,
    'Required sales revenue = (fixed costs + target profit) / C/S ratio = ('+money(fixed)+' + '+money(target)+') / '+cs+'% = '+money(rev)+'.');}
 ],
 'MA2:D2':[
  r=>{const cost=R(r,8,19),price=R(r,25,44),hours=R(r,1,4),contrib=price-cost,rate=round(contrib/hours);
   return Q('limiting-factor-contribution-per-hour','Product A sells for $'+price+' per unit, with variable cost $'+cost+' per unit and uses '+hours+' scarce machine hours per unit. What is contribution per SCARCE MACHINE HOUR?',rate,
    'Contribution per unit = $'+price+' − $'+cost+' = $'+contrib+'. Divide by '+hours+' hours = $'+rate+' contribution per scarce hour.','$/hour');},
  r=>{const materials=R(r,3,9)*100,labour=R(r,2,7)*100,alternative=R(r,4,12)*100,increment=materials+labour+alternative;
   return Q('relevant-cost-with-opportunity','A one-off job requires additional materials '+money(materials)+' and labour '+money(labour)+'. It also uses capacity that would otherwise earn contribution of '+money(alternative)+' from an alternative order. Previous design fees are sunk. What is the MINIMUM relevant cost of accepting the new job?',increment,
    'Relevant cost = incremental material '+money(materials)+' + incremental labour '+money(labour)+' + opportunity cost of lost contribution '+money(alternative)+' = '+money(increment)+'.');}
 ],
 'MA2:D3':[
  r=>{const invest=R(r,8,20)*1000,one=R(r,8,18)*1000,two=R(r,5,15)*1000,df1=0.9,df2=0.8,npv=one*df1+two*df2-invest;
   return Q('two-period-npv-with-factors','An investment costs '+money(invest)+' now. It produces net cash inflows of '+money(one)+' at the end of Year 1 and '+money(two)+' at the end of Year 2. Use PRESENT VALUE FACTORS 0.90 and 0.80 respectively. What is its net present value?',npv,
    'NPV = ('+money(one)+' × 0.90) + ('+money(two)+' × 0.80) − '+money(invest)+' = '+money(npv)+'.','$', 'hard');}
 ],
 'MA2:E3':[
  r=>{const nov=R(r,20,50)*1000,dec=R(r,30,60)*1000,pct=R(r,3,6)*10,receipts=round(nov*(1-pct/100)+dec*pct/100);
   return Q('cash-receipts-collection-delay','A company makes credit sales of '+money(nov)+' in November and '+money(dec)+' in December. '+pct+'% is collected in the month of sale and the remaining '+(100-pct)+'% the following month. No other cash flows arise. How much is collected from CREDIT CUSTOMERS in December?',receipts,
    'December receipts = '+(100-pct)+'% of November credit sales + '+pct+'% of December credit sales = '+money(receipts)+'.');},
  r=>{const open=R(r,5,20)*1000,receipts=R(r,15,35)*1000,wages=R(r,5,13)*1000,suppliers=R(r,3,12)*1000,machine=R(r,4,10)*1000,close=open+receipts-wages-suppliers-machine;
   return Q('cash-budget-with-capital-outlay','A cash budget begins with '+money(open)+', expects cash receipts '+money(receipts)+', staff cash payments '+money(wages)+', supplier cash payments '+money(suppliers)+' and purchase of a machine for CASH '+money(machine)+'. What is the closing cash balance?',close,
    'Closing cash = opening '+money(open)+' + receipts '+money(receipts)+' − wages '+money(wages)+' − suppliers '+money(suppliers)+' − equipment cash outlay '+money(machine)+' = '+money(close)+'.');}
 ]
};
bank.problem=function(key,rng,index){
 if(index<70)return previous(key,rng,index);
 const variations=authors[key];
 if(!variations)return null;
 const position=Math.floor((index-70)/2);
 if(position<0||position>=variations.length)return null;
 return variations[position](rng);
};
root.LedgerQuizDiversityBank={topics:Object.keys(authors),families:Object.fromEntries(Object.entries(authors).map(([key,items])=>[key,items.length]))};
root.LedgerExamScenarios=bank;
})(typeof window!=='undefined'?window:globalThis);
