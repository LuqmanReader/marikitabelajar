/* Original LedgerPeer integrated case studies for FA2 / MA2.
 * Each case combines two or more distinct syllabus headings in one calculation.
 * No copyrighted ACCA or Kaplan examination questions are reproduced.
 * Editorially authored practice; official syllabus outcome certification is NOT implied.
 */
(function(root){
'use strict';
const r=(rng,a,b)=>a+Math.floor(rng()*(b-a+1));
const m=x=>'$'+Number(x).toLocaleString('en-GB',{maximumFractionDigits:2});
const round=x=>Math.round((x+Number.EPSILON)*100)/100;
const item=(family,topics,prompt,answer,explanation,unit='$')=>({family,topics,prompt,answer:round(answer),explanation,unit,difficulty:'hard'});
const cases={
FA2:[
 rng=>{const opening=r(rng,35,55)*1000,sales=r(rng,12,22)*1000,cash=r(rng,5,11)*1000,direct=r(rng,1,5)*1000,writeoff=r(rng,1,3)*1000,pct=r(rng,3,6),gross=opening+sales-cash-direct-writeoff,net=round(gross*(100-pct)/100);
  return item('bank-receipt-and-allowance',['D6','E1'],'A business starts with gross trade receivables of '+m(opening)+'. Credit sales are '+m(sales)+' and recorded customer receipts '+m(cash)+'. Its bank statement also shows an UNRECORDED direct customer payment of '+m(direct)+'. Write off a confirmed irrecoverable debt of '+m(writeoff)+' and provide an allowance of '+pct+'% of the remaining gross receivables. What NET receivables should appear at the reporting date?',net,'First record the direct payment in the cash book and receivables ledger. Remaining gross receivables = '+m(opening)+' + '+m(sales)+' − '+m(cash)+' − '+m(direct)+' − '+m(writeoff)+' = '+m(gross)+'. Net after '+pct+'% allowance = '+m(net)+'.');},
 rng=>{const profit=r(rng,42,77)*1000,cost=r(rng,24,48)*1000,residual=r(rng,2,5)*1000,life=[4,5,6][r(rng,0,2)],electric=r(rng,4,14)*100,dep=round((cost-residual)/life),correct=round(profit-dep-electric);
  return item('depreciation-and-year-end-expense',['D4','D5','G1'],'Draft annual profit before year-end adjustments is '+m(profit)+'. A machine costing '+m(cost)+' with residual value '+m(residual)+' has been used for one whole year and depreciates straight-line over '+life+' years; NO depreciation is recorded. Electricity of '+m(electric)+' incurred this year also remains unrecorded. What corrected annual PROFIT should be reported?',correct,'Annual depreciation = ('+m(cost)+' − '+m(residual)+') / '+life+' = '+m(dep)+'. Recognise both depreciation and the outstanding electricity accrual as current expenses. Profit = '+m(profit)+' − '+m(dep)+' − '+m(electric)+' = '+m(correct)+'.');},
 rng=>{const sales=r(rng,75,125)*1000,opening=r(rng,8,15)*1000,buy=r(rng,27,47)*1000,closingCost=r(rng,10,20)*1000,damage=r(rng,2,6)*1000,nrv=closingCost-damage,cos=opening+buy-nrv,gp=sales-cos;
  return item('inventory-nrv-and-gross-profit',['D3','G1'],'A retailer reports sales of '+m(sales)+', opening inventory '+m(opening)+' and net purchases '+m(buy)+'. Closing inventory COST is '+m(closingCost)+', but its NET REALISABLE VALUE is only '+m(nrv)+' because of damaged goods. Assuming no other cost of sales, calculate corrected GROSS PROFIT.',gp,'Closing inventory is measured at the LOWER of cost '+m(closingCost)+' and NRV '+m(nrv)+'. Correct cost of sales = '+m(opening)+' + '+m(buy)+' − '+m(nrv)+' = '+m(cos)+'. Gross profit = '+m(sales)+' − '+m(cos)+' = '+m(gp)+'.');},
 rng=>{const open=r(rng,6,14)*1000,invoice=r(rng,10,22)*1000,credit=r(rng,2,5)*1000,paid=r(rng,4,12)*1000,rate=10,closing=round(open+(invoice-credit)*(1+rate/100)-paid);
  return item('sales-tax-credit-note-receivable',['D1','D6'],'Trade receivables open at '+m(open)+'. The company issues a credit sales invoice for '+m(invoice)+' EXCLUDING '+rate+'% sales tax, then a credit note for returned goods of '+m(credit)+' EXCLUDING the same tax. Customer payments total '+m(paid)+'. Both invoice and credit note require tax. What closing GROSS trade receivables balance is owed?',closing,'Invoice including tax = '+m(round(invoice*1.1))+'. Credit note including tax = '+m(round(credit*1.1))+'. Receivables = opening '+m(open)+' + invoice inclusive tax − credit note inclusive tax − receipts '+m(paid)+' = '+m(closing)+'.');},
 rng=>{const bank=r(rng,15,32)*1000,charge=r(rng,1,5)*100,standing=r(rng,2,7)*100,unpresented=r(rng,3,9)*100,deposit=r(rng,1,7)*100,book=bank-charge-standing,statement=book+unpresented-deposit;
  return item('bank-fees-payables-and-reconciliation',['E1','D5'],'The cash book has a DEBIT bank balance of '+m(bank)+'. An automatic direct-debit electricity payment of '+m(standing)+' and bank charges of '+m(charge)+' are not yet entered in the cash book. Unpresented cheques total '+m(unpresented)+' and deposits in transit '+m(deposit)+'. Assuming the electricity expense was not otherwise recorded, what BANK STATEMENT balance reconciles the cash book?',statement,'First record the electricity expense and bank fees. Corrected cash book = '+m(bank)+' − '+m(standing)+' − '+m(charge)+' = '+m(book)+'. Bank statement = corrected cash book + unpresented cheques − deposits in transit = '+m(statement)+'.');},
 rng=>{const draft=r(rng,27,53)*1000,insurance=r(rng,3,9)*1200,unused=r(rng,2,7),utilities=r(rng,4,12)*100,pre=insurance*unused/12,correct=draft+pre-utilities;
  return item('prepayment-accrual-profit-adjustment',['D5','G1'],'Draft profit is '+m(draft)+' after the company EXPENSED a 12-month insurance premium of '+m(insurance)+' in full. '+unused+' months of cover remain unused at year-end. Electricity of '+m(utilities)+' relating to this year has not been accrued. Calculate corrected PROFIT.',correct,'Reverse the insurance portion relating to the future: prepayment = '+m(insurance)+' × '+unused+'/12 = '+m(pre)+'. Accrue electricity '+m(utilities)+'. Correct profit = '+m(draft)+' + '+m(pre)+' − '+m(utilities)+' = '+m(correct)+'.');},
 rng=>{const reported=r(rng,34,62)*1000,cost=r(rng,19,34)*1000,accum=r(rng,5,14)*1000,proceeds=r(rng,8,18)*1000,carrying=cost-accum,correct=reported-carrying,gain=proceeds-carrying;
  return item('disposal-recorded-as-sales-error',['D4','F2','G1'],'Draft profit is '+m(reported)+'. The draft incorrectly treats proceeds of '+m(proceeds)+' from selling a machine as ordinary SALES REVENUE, with no removal of its carrying amount. The machine cost '+m(cost)+' and accumulated depreciation was '+m(accum)+'. All other entries are correct. What corrected PROFIT results from properly recording the disposal?',correct,'Carrying amount = '+m(cost)+' − '+m(accum)+' = '+m(carrying)+'. Reverse the incorrect sale credit of '+m(proceeds)+' and recognise disposal gain/loss = proceeds − carrying amount = '+m(gain)+'. Net effect on draft profit is −'+m(carrying)+', giving '+m(correct)+'.');},
 rng=>{const draft=r(rng,25,49)*1000,invoice=r(rng,2,7)*1000;return item('missing-supplier-invoice-gross-profit',['E2','G1'],'A business calculated draft gross profit of '+m(draft)+'. A supplier statement discloses an omitted purchase invoice for '+m(invoice)+' for goods received and SOLD before year end. Neither the purchase expense nor the supplier liability was recorded, and no related inventory remains. What corrected GROSS PROFIT follows?',draft-invoice,'The valid purchase invoice increases purchases/cost of sales by '+m(invoice)+' and trade payables by the same amount. Closing inventory is unaffected because the goods were sold. Gross profit = '+m(draft)+' − '+m(invoice)+' = '+m(draft-invoice)+'.');},
 rng=>{const profit=r(rng,55,100)*1000,salary=r(rng,8,18)*1000,share=2,residual=profit-salary,first=round(salary+residual*share/5);
  return item('partnership-salary-and-residual-profit',['H1','H2','H3'],'Two partners share residual profits 2:3 after a salary allowance to the FIRST partner. Total profit before appropriation is '+m(profit)+', and the first partner is entitled to a salary allowance of '+m(salary)+'. How much TOTAL appropriated profit is credited to the first partner?',first,'Deduct the first partner salary allowance from distributable profit: '+m(profit)+' − '+m(salary)+' = '+m(residual)+'. Allocate the residual at 2:3: first partner residual share = 2/5 × '+m(residual)+'. Add salary allowance to obtain '+m(first)+'.');},
 rng=>{const writeoff=r(rng,1,4)*1000,allowance=r(rng,1,3)*1000,pre=r(rng,3,7)*1000,accrued=r(rng,1,5)*1000,impact=pre-writeoff-allowance-accrued;
  return item('combined-net-current-assets-adjustment',['D6','D5'],'Before year-end adjustments, net current assets are reported on a draft statement. A confirmed receivable of '+m(writeoff)+' must be written off; a NEW additional receivables allowance of '+m(allowance)+' is required; a prepaid insurance asset of '+m(pre)+' must be recognised; and an electricity accrual liability of '+m(accrued)+' is omitted. What is the NET CHANGE in current assets less current liabilities?',impact,'Write-off reduces current assets by '+m(writeoff)+'; allowance reduces them by another '+m(allowance)+'; prepayment increases assets by '+m(pre)+'; electricity accrual increases liabilities by '+m(accrued)+'. Total change = '+m(impact)+'.');},
 rng=>{const preprofit=r(rng,25,49)*1000,taxable=r(rng,10,25)*1000,rate=10,tax=taxable*rate/100,correct=preprofit-tax;
  return item('sales-tax-misstated-income',['D1','G1'],'Draft profit of '+m(preprofit)+' includes a credit sales invoice recorded entirely as revenue at '+m(taxable+tax)+'. The correct invoice consideration was '+m(taxable)+' EXCLUDING sales tax of '+rate+'%; the tax portion is payable to the tax authority, not revenue. Ignoring other adjustments, what corrected profit should be reported?',correct,'Sales revenue and profit were overstated by the sales tax = '+m(taxable)+' × '+rate+'% = '+m(tax)+'. Recognise a tax liability for that amount and reduce draft profit to '+m(correct)+'.');},
 rng=>{const draft=r(rng,20,46)*1000,machine=r(rng,15,29)*1000,life=[3,5][r(rng,0,1)],dep=machine/life,correct=round(draft+machine-dep);
  return item('capital-expenditure-misposted-profit',['D4','F2','G1'],'Draft annual profit of '+m(draft)+' includes the entire '+m(machine)+' cost of a newly acquired machine as a maintenance EXPENSE. The machine was ready for use at the start of the year, has no residual value and depreciates straight-line over '+life+' years. The purchase was paid from bank and recorded there correctly. What is corrected annual PROFIT?',correct,'Reverse the incorrect expense by increasing profit '+m(machine)+' and recognise one year depreciation '+m(round(dep))+'. The bank payment remains correct. Corrected profit = '+m(draft)+' + '+m(machine)+' − '+m(round(dep))+' = '+m(correct)+'.');},
 rng=>{const draft=r(rng,25,58)*1000,advance=r(rng,4,11)*1000,earned=r(rng,2,8)*1000,adjusted=draft-advance+earned;
  return item('deferred-customer-income-and-accrual',['D5','D6','G1'],'Draft profit includes '+m(advance)+' RECEIVED from a customer for services that will ONLY be provided next year. Separate completed consulting services worth '+m(earned)+' have been earned this year but neither invoiced nor recorded. Draft profit before these corrections is '+m(draft)+'. What is corrected PROFIT under accrual accounting?',adjusted,'Remove unearned customer advance '+m(advance)+' from income and recognise a liability. Recognise earned but unbilled revenue '+m(earned)+' as accrued income/receivable. Correct profit = '+m(draft)+' − '+m(advance)+' + '+m(earned)+' = '+m(adjusted)+'.');},
 rng=>{const start=r(rng,9,18)*1000,receipt=r(rng,5,12)*1000,fee=r(rng,1,5)*100,interest=r(rng,2,6)*100,expense=r(rng,5,14)*100,bank=start+receipt-fee+interest-expense;
  return item('bank-updates-and-expense-accrual',['E1','D5','G1'],'A cash book starts with a debit bank balance of '+m(start)+'. A customer bank transfer of '+m(receipt)+', bank interest of '+m(interest)+', bank charges of '+m(fee)+' and a direct-debit electricity payment of '+m(expense)+' all appear on the bank statement but have NOT been recorded in the cash book or expense accounts. What is the corrected CASH BOOK balance?',bank,'The customer transfer and interest increase cash; bank charges and electricity reduce it and create expenses. Corrected cash book = '+m(start)+' + '+m(receipt)+' + '+m(interest)+' − '+m(fee)+' − '+m(expense)+' = '+m(bank)+'.');},
 rng=>{const oldProfit=r(rng,20,40)*1000,omitted=r(rng,2,7)*1000,entry=r(rng,1,5)*1000,updated=oldProfit-omitted-entry;
  return item('trial-balance-and-omitted-expenses',['F1','F2','G1'],'Draft profit is '+m(oldProfit)+'. An unpaid supplier invoice for administrative services of '+m(omitted)+' was omitted from BOTH the expense and payable accounts, so it did not disturb trial-balance equality. A second expense of '+m(entry)+' was credited to bank correctly but the DEBIT expense entry was omitted, leaving an unmatched credit. Neither expense relates to inventory. What corrected profit should be reported?',updated,'A complete omission can preserve trial-balance agreement but still understate liabilities and expenses. A one-sided posting creates an imbalance. Both omitted expenses reduce profit: '+m(oldProfit)+' − '+m(omitted)+' − '+m(entry)+' = '+m(updated)+'.');},
 rng=>{const cost=r(rng,18,39)*1000,acc=r(rng,5,12)*1000,proceeds=r(rng,12,24)*1000,openingOther=r(rng,6,13)*1000,paid=r(rng,2,6)*1000,receivables=openingOther+proceeds-paid;
  return item('noncurrent-disposal-credit-receivable',['D4','D6'],'A company disposes of equipment ON CREDIT for '+m(proceeds)+'. The asset originally cost '+m(cost)+' and its accumulated depreciation is '+m(acc)+'. Separately, other customer receivables were '+m(openingOther)+' and cash of '+m(paid)+' is collected against them. The disposal receivable has not yet been settled. What TOTAL receivables (trade and disposal) should remain after these events?',receivables,'On credit disposal, recognise proceeds receivable '+m(proceeds)+' and derecognise machine carrying amount '+m(cost-acc)+'. Customer balances remaining = '+m(openingOther)+' − '+m(paid)+'. Add separate disposal debtor '+m(proceeds)+' to report total receivables of '+m(receivables)+'.');},
 rng=>{const revenue=r(rng,80,135)*1000,opening=r(rng,8,20)*1000,buy=r(rng,30,55)*1000,closing=r(rng,7,15)*1000,writeoff=r(rng,2,6)*1000,allowance=r(rng,1,3)*1000,profit=revenue-opening-buy+closing-writeoff-allowance;
  return item('inventory-gross-profit-and-bad-debts',['D3','D6','G1'],'A trader has sales '+m(revenue)+', opening inventory '+m(opening)+', net purchases '+m(buy)+' and closing inventory '+m(closing)+'. Apart from cost of sales, the only current-year expense adjustments are an irrecoverable customer debt of '+m(writeoff)+' and an ADDITIONAL allowance expense of '+m(allowance)+'. What PROFIT after these two receivable adjustments should be reported?',profit,'Cost of sales = '+m(opening)+' + '+m(buy)+' − '+m(closing)+' = '+m(opening+buy-closing)+'. Gross profit = '+m(revenue-opening-buy+closing)+'. Deduct write-off '+m(writeoff)+' and additional allowance '+m(allowance)+' = '+m(profit)+'.');},
 rng=>{const premium=r(rng,6,15)*1000,unused=r(rng,2,8),invoice=r(rng,3,9)*1000,advance=r(rng,1,4)*1000,pre=round(premium*unused/12),nca=pre+advance-invoice;
  return item('prepayment-and-supplier-credit-adjustment',['D5','E2'],'An entity has already EXPENSED a 12-month insurance premium of '+m(premium)+', of which '+unused+' months remain unused. A valid supplier invoice of '+m(invoice)+' for services received before year end has not been recorded in expenses/payables. A previously recorded supplier payable of '+m(advance)+' is also cancelled by a genuine CREDIT NOTE that has not been posted. What is the NET CHANGE in current assets less current liabilities after all three corrections?',nca,'Insurance prepayment increases current assets by '+m(pre)+'. The omitted service invoice increases current liabilities '+m(invoice)+'. The supplier credit note reduces payables '+m(advance)+'. Net current assets change = '+m(pre)+' − '+m(invoice)+' + '+m(advance)+' = '+m(nca)+'.');},
 rng=>{const profit=r(rng,55,92)*1000,expense=r(rng,2,9)*1000,salA=r(rng,5,11)*1000,salB=r(rng,2,8)*1000,remaining=profit-expense-salA-salB,partnerB=round(salB+remaining*3/5);
  return item('partnership-profit-after-accrued-expense',['H1','H2','D5'],'Two partners share RESIDUAL profit 2:3 after salary allowances. Draft profit of '+m(profit)+' omits an accrued business expense of '+m(expense)+'. Salary allowances are '+m(salA)+' for Partner A and '+m(salB)+' for Partner B. After adjusting profit for the omitted expense, calculate TOTAL amount allocated to Partner B.',partnerB,'Adjusted distributable profit = '+m(profit)+' − accrued expense '+m(expense)+' = '+m(profit-expense)+'. After salary allowances '+m(salA)+' and '+m(salB)+', residual profit is '+m(remaining)+'. Partner B receives salary '+m(salB)+' plus 3/5 of residual = '+m(partnerB)+'.');},
 rng=>{const revenue=r(rng,80,110)*1000,opening=r(rng,9,17)*1000,purchases=r(rng,26,49)*1000,returns=r(rng,1,5)*1000,carriage=r(rng,2,8)*1000,closing=r(rng,8,15)*1000,profit=revenue-(opening+purchases-returns+carriage-closing);
  return item('supplier-credit-inwards-carriage-cos',['E2','G1','D3'],'For a trader, annual sales are '+m(revenue)+'. Opening stock is '+m(opening)+', gross credit purchases '+m(purchases)+' and authorised supplier CREDIT NOTES for purchase returns '+m(returns)+'. Carriage INWARDS is '+m(carriage)+' and closing inventory is '+m(closing)+'. All items are properly evidenced. What GROSS PROFIT remains after adjusting purchases and inventory?',profit,'Net purchases = '+m(purchases)+' − '+m(returns)+'. Cost of sales = opening '+m(opening)+' + net purchases + carriage inwards '+m(carriage)+' − closing inventory '+m(closing)+' = '+m(revenue-profit)+'. Sales '+m(revenue)+' less cost of sales = '+m(profit)+'.');}
],
MA2:[
 rng=>{const u=r(rng,2,5)*100,p=r(rng,3,7),next=r(rng,2,5),issue=u+r(rng,1,3)*100,labour=r(rng,2,6)*1000,overhead=r(rng,1,5)*1000,material=u*p+(issue-u)*(p+next),total=material+labour+overhead;
  return item('fifo-materials-full-job-cost',['B1','C3'],'A custom job uses '+issue+' units of material. FIFO stock comprises '+u+' opening units at $'+p+' each, followed by new purchases at $'+(p+next)+' each; enough new stock is available. Direct labour for this job is '+m(labour)+' and absorbed factory overhead '+m(overhead)+'. What TOTAL production COST is assigned to the job?',total,'FIFO material issue cost = '+u+' × $'+p+' + '+(issue-u)+' × $'+(p+next)+' = '+m(material)+'. Add job direct labour '+m(labour)+' and absorbed production overhead '+m(overhead)+' to obtain '+m(total)+'.');},
 rng=>{const base=r(rng,9,17),hours=r(rng,30,40),ot=r(rng,3,9),overheadRate=r(rng,5,13),jobHours=hours+ot,gross=base*hours+ot*base*1.5,foh=jobHours*overheadRate,job=gross+foh;
  return item('overtime-and-overhead-job',['B2','C1'],'A worker spends '+hours+' normal hours and '+ot+' overtime hours on one job. The basic wage rate is $'+base+'/hour; overtime is paid at time-and-a-half. ALL the hours are direct labour, and production overhead is absorbed at $'+overheadRate+' per actual labour hour. Ignore other costs. What labour PLUS absorbed overhead cost should the job receive?',job,'Direct gross labour cost = '+hours+' × $'+base+' + '+ot+' × $'+base+' × 1.5 = '+m(gross)+'. Absorbed overhead = '+jobHours+' hours × $'+overheadRate+' = '+m(foh)+'. Combined job cost = '+m(job)+'.');},
 rng=>{const actual=r(rng,32,55)*1000,rate=r(rng,7,15),hours=r(rng,3,5)*1000,absorbed=hours*rate,diff=actual-absorbed;
  return item('absorption-rate-overhead-difference',['B3','C1'],'Factory overheads are absorbed into production at a predetermined rate of $'+rate+' per machine hour. During the period, actual machine hours were '+hours+' and actual production overhead was '+m(actual)+'. Calculate the UNDER-ABSORBED amount; enter a NEGATIVE value for OVER-absorption.',diff,'Total absorbed overhead = '+hours+' × $'+rate+' = '+m(absorbed)+'. Compare actual overhead '+m(actual)+' with absorbed amount to find actual − absorbed = '+m(diff)+'. A negative value indicates over-absorption.');},
 rng=>{const u1=r(rng,2,5)*100,p1=r(rng,4,8),u2=r(rng,3,6)*100,p2=p1+r(rng,2,6),price=r(rng,25,44),lab=r(rng,3,8),avg=round((u1*p1+u2*p2)/(u1+u2)),contrib=round(price-avg-lab);
  return item('weighted-material-cost-to-contribution',['B1','C2'],'A product uses one unit of material per unit produced. Periodic weighted-average inventory consists of '+u1+' units at $'+p1+' and '+u2+' units at $'+p2+'. Each finished unit sells for $'+price+' and needs variable labour of $'+lab+'; assume no other variable costs. Using material cost per unit rounded to TWO decimal places, calculate CONTRIBUTION per finished unit.',contrib,'Material weighted-average cost = ('+u1+' × $'+p1+' + '+u2+' × $'+p2+') / '+(u1+u2)+' = $'+avg+' per unit (rounded). Contribution = selling price $'+price+' − material $'+avg+' − labour $'+lab+' = $'+contrib+'.','$/unit');},
 rng=>{const input=r(rng,9,16)*100,loss=[5,10][r(rng,0,1)],material=r(rng,10,24)*1000,labour=r(rng,6,12)*1000,scrap=r(rng,1,3),normal=input*loss/100,good=input-normal,netCost=material+labour-normal*scrap,unit=round(netCost/good);
  return item('process-normal-loss-unit-cost',['C4','C1'],'A process has '+input+' input units and normal loss of '+loss+'% of input. Production material costs are '+m(material)+' and conversion labour costs '+m(labour)+'. Every normal-loss unit can be sold for SCRAP at $'+scrap+' per unit. There is no WIP, no abnormal loss and all expected good output is finished. Calculate cost per expected good unit to TWO decimal places.',unit,'Expected normal loss = '+normal+' units, leaving '+good+' good units. Credit normal-loss scrap proceeds of '+m(normal*scrap)+' against process costs. Good production cost = '+m(netCost)+'; divide by '+good+' expected good units = $'+unit+' per unit.','$/unit');},
 rng=>{const price=r(rng,32,49),variable=r(rng,15,27),hours=r(rng,2,5),alternative=r(rng,3,8),contrib=price-variable,net=round(contrib-alternative*hours);
  return item('special-order-opportunity-contribution',['C2','D2'],'A special job would earn sales revenue of $'+price+' per unit and incur incremental variable cost of $'+variable+' per unit. It uses '+hours+' scarce machine hours which could otherwise earn contribution of $'+alternative+' PER HOUR. Fixed overhead will not change. What NET INCREMENTAL CONTRIBUTION per unit would accepting the special job generate after the opportunity cost?',net,'Incremental contribution before opportunity cost = $'+price+' − $'+variable+' = $'+contrib+'. Forgone contribution = '+hours+' × $'+alternative+' = '+m(alternative*hours)+'. Net benefit = $'+contrib+' − '+m(alternative*hours)+' = $'+net+' per unit.','$/unit');},
 rng=>{const price=r(rng,34,56),variable=r(rng,13,23),newVariable=variable+r(rng,2,6),fixed=r(rng,28,58)*1000,target=r(rng,5,20)*1000,c=price-newVariable,units=Math.ceil((fixed+target)/c);
  return item('target-profit-after-cost-increase',['C2','D1'],'A business sells a unit for $'+price+'. Variable cost was $'+variable+' but increases by $'+(newVariable-variable)+' per unit next year. Fixed costs are '+m(fixed)+' and management wants PROFIT of '+m(target)+'. How many WHOLE units must be sold at the new cost to achieve the target?',units,'New variable cost = $'+newVariable+'; contribution per unit = $'+price+' − $'+newVariable+' = $'+c+'. Required units = (fixed costs '+m(fixed)+' + target profit '+m(target)+') / $'+c+', rounded UP = '+units+' units.','units');},
 rng=>{const before=r(rng,11,24)*1000,lastMonth=r(rng,10,22)*1000,thisMonth=r(rng,12,28)*1000,receipts=r(rng,15,36)*1000,wages=r(rng,4,10)*1000,closing=before+receipts-lastMonth-wages;
  return item('inventory-purchase-payment-timing',['B1','E3'],'A retailer forecasts opening cash of '+m(before)+' and cash receipts of '+m(receipts)+' next month. Goods purchased LAST month for '+m(lastMonth)+' are paid for next month under a one-month credit agreement; planned purchases NEXT month of '+m(thisMonth)+' will be paid in the month after. Wages paid next month are '+m(wages)+'. Ignore all other cash items. What is next month closing CASH balance?',closing,'Cash budget includes payments only when actually made, irrespective of inventory purchases being recognised earlier. Pay LAST month purchases '+m(lastMonth)+', not next month purchases '+m(thisMonth)+'. Closing cash = '+m(before)+' + '+m(receipts)+' − '+m(lastMonth)+' − '+m(wages)+' = '+m(closing)+'.');},
 rng=>{const budgetUnits=r(rng,5,8)*1000,actualUnits=budgetUnits+r(rng,2,5)*100,variable=r(rng,4,9),fixed=r(rng,8,14)*1000,actualCost=actualUnits*variable+fixed+r(rng,2,8)*1000,flex=actualUnits*variable+fixed,variance=actualCost-flex;
  return item('flexed-budget-cost-variance',['A4','B3'],'An overhead budget assumes '+budgetUnits+' units, variable overhead $'+variable+' per unit and fixed overhead '+m(fixed)+'. Actual output is '+actualUnits+' units, and ACTUAL TOTAL overhead is '+m(actualCost)+'. Calculate the ADVERSE cost variance using a FLEXED budget at the actual activity level.',variance,'Flexed budget = actual volume '+actualUnits+' × variable overhead $'+variable+' + fixed overhead '+m(fixed)+' = '+m(flex)+'. Actual overhead '+m(actualCost)+' − flexed budget '+m(flex)+' = '+m(variance)+' adverse.');},
 rng=>{const mat=r(rng,8,16),lab=r(rng,5,11),allocated=r(rng,4,9),supplier=r(rng,26,39),alt=r(rng,3,7),make=mat+lab+alt,buy=supplier,saving=make-buy;
  return item('make-buy-with-opportunity-cost',['D2','C3'],'A component can be made in-house using incremental materials of $'+mat+' and labour of $'+lab+' per unit. The accounting job sheet also allocates unavoidable fixed factory overhead of $'+allocated+' per unit. Making it would occupy capacity that otherwise earns contribution of $'+alt+' per unit. A supplier offers a PURCHASE price of $'+supplier+' per unit. How much is the relevant COST SAVING from BUYING rather than making? Enter a negative amount if buying costs more.',saving,'Relevant make cost is incremental materials $'+mat+' + labour $'+lab+' + foregone contribution $'+alt+' = $'+make+'. Ignore unavoidable allocated overhead of $'+allocated+'. Saving from buying = relevant make cost $'+make+' − supplier price $'+buy+' = $'+saving+'.','$/unit');},
 rng=>{const invest=r(rng,15,28)*1000,inflow=r(rng,11,21)*1000,operating=r(rng,3,7)*1000,salvage=r(rng,2,6)*1000,df1=0.91,df2=0.83,net=inflow-operating,npv=round(net*df1+(net+salvage)*df2-invest);
  return item('cash-forecast-to-discounted-npv',['D3','E3'],'An investment costs '+m(invest)+' immediately. It generates gross annual CASH receipts of '+m(inflow)+' and annual CASH operating payments of '+m(operating)+' for TWO years. At the end of Year 2, additional disposal proceeds are '+m(salvage)+'. Use discount factors 0.91 and 0.83 for Years 1 and 2. What is the NET PRESENT VALUE?',npv,'Annual net cash receipts after operating payments = '+m(net)+'. Year 2 adds disposal proceeds '+m(salvage)+'. NPV = −'+m(invest)+' + '+m(net)+' × 0.91 + '+m(net+salvage)+' × 0.83 = '+m(npv)+'.');},
 rng=>{const made=r(rng,40,80)*100,sold=made-r(rng,6,14)*100,rate=r(rng,4,12),over=r(rng,2,8)*1000,diff=(made-sold)*rate;
  return item('inventory-movement-absorption-profit',['C2','B3'],'A business produces '+made+' units and sells '+sold+' units during a period with no opening stock. Fixed production overhead is ABSORBED at $'+rate+' per produced unit. Actual factory overhead exceeds absorbed overhead by '+m(over)+' and any under-absorption is adjusted consistently in both profit presentations. Ignoring all other differences, by how much does absorption-costing profit EXCEED marginal-costing profit?',diff,'The difference comes from fixed overhead carried forward in INVENTORY, not from the under-absorption adjustment common to both methods. Inventory increase = '+(made-sold)+' units; absorption profit exceeds marginal profit by '+(made-sold)+' × $'+rate+' = '+m(diff)+'.');},
 rng=>{const open=r(rng,2,5)*100,price=r(rng,4,8),newUnits=r(rng,2,5)*100,newPrice=price+r(rng,2,5),used=r(rng,4,7)*100,labourHours=r(rng,15,32),wage=r(rng,9,16),overhead=r(rng,2,5)*100,stockCost=round((open*price+newUnits*newPrice)/(open+newUnits)),materials=round(used*stockCost),labour=labourHours*wage,job=round(materials+labour+overhead);
  return item('weighted-material-labour-overhead-job',['B1','B2','C3'],'A job uses '+used+' units of material from periodic weighted-average stock: '+open+' units at 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+price+' and '+newUnits+' units at 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+newPrice+'. Material unit cost is rounded to TWO decimal places before valuing issues. Direct labour is '+labourHours+' hours at 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+wage+'/hour and production overhead absorbed is '+m(overhead)+'. Calculate TOTAL job cost, including all three components.',job,'Weighted-average material cost per unit = ('+open+' × 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+price+' + '+newUnits+' × 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+newPrice+') / '+(open+newUnits)+' = 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+stockCost+'. Material issue cost = '+used+' × 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+stockCost+' = '+m(materials)+'. Direct labour '+m(labour)+' plus overhead '+m(overhead)+' gives '+m(job)+'.');},
 rng=>{const plan=r(rng,4,8)*1000,actual=plan+r(rng,2,6)*100,variable=r(rng,5,10),fixed=r(rng,11,19)*1000,actualCost=actual*variable+fixed+r(rng,1,7)*1000,budget=actual*variable+fixed,diff=actualCost-budget;
  return item('activity-flex-and-overhead-variance',['A4','B3','D1'],'Management budgets '+plan+' units, variable production overhead of 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+variable+' per unit and fixed overhead '+m(fixed)+'. Actual output is '+actual+' units and actual overhead spending is '+m(actualCost)+'. For a fair performance comparison, calculate the ADVERSE total overhead cost variance against the FLEXED budget rather than the original output plan.',diff,'The volume-adjusted budget is '+actual+' units × 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+variable+' + fixed overhead '+m(fixed)+' = '+m(budget)+'. Compare actual overhead '+m(actualCost)+' with flexed budget '+m(budget)+': adverse overspend '+m(diff)+'.');},
 rng=>{const input=r(rng,9,18)*100,loss=[5,10][r(rng,0,1)],unitPrice=r(rng,26,44),varGood=r(rng,13,22),fixed=r(rng,4,12)*1000,normal=input*loss/100,good=input-normal,contrib=(unitPrice-varGood)*good-fixed;
  return item('process-normal-loss-contribution',['C4','C2','D1'],'A production run starts with '+input+' units and incurs NORMAL process loss of '+loss+'% of the input. The remaining good units can be sold at 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+unitPrice+' each, with variable finishing and delivery costs of 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+varGood+' per GOOD unit. Run-specific avoidable fixed setup cost is '+m(fixed)+'. Assume no other costs. What is the run CONTRIBUTION AFTER this avoidable setup cost?',contrib,'Normal loss = '+normal+' units; saleable good output = '+good+'. Contribution before setup = ('+unitPrice+' − '+varGood+') × '+good+' = '+m((unitPrice-varGood)*good)+'. Deduct avoidable setup '+m(fixed)+' = '+m(contrib)+'.');},
 rng=>{const price=r(rng,29,48),material=r(rng,9,19),labour=r(rng,5,12),allocated=r(rng,3,9),opportunity=r(rng,3,8),net=price-material-labour-opportunity;
  return item('special-order-absorbed-overhead-irrelevant',['C1','D2'],'A special order earns selling price 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+price+' per unit. It requires NEW material 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+material+' and incremental labour 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+labour+' per unit and uses capacity that could earn alternative contribution of 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+opportunity+' per unit. The job costing system allocates unavoidable fixed overhead of 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+allocated+' per unit, which will NOT change if the order is taken. What NET relevant contribution PER UNIT arises from accepting this order?',net,'Exclude the absorbed fixed overhead because it does not change. Relevant contribution = revenue 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+price+' − new material 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+material+' − incremental labour 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+labour+' − lost opportunity contribution 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+opportunity+' = 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+net+' per unit.','$/unit');},
 rng=>{const nov=r(rng,25,49)*1000,dec=r(rng,32,58)*1000,cashShare=[20,30,40][r(rng,0,2)],varPercent=[50,60,70][r(rng,0,2)],cash=round(nov*(100-cashShare)/100+dec*cashShare/100),contrib=round(dec*(100-varPercent)/100);
  return item('credit-sales-collections-and-contribution',['E3','C2'],'A wholesaler records November credit sales of '+m(nov)+' and December credit sales of '+m(dec)+'. Customers pay '+cashShare+'% in the month of sale and the remainder in the following month. December variable costs are '+varPercent+'% of December SALES; no other adjustments apply. Calculate DECEMBER CONTRIBUTION (not December cash receipts).',contrib,'December contribution is based on sales earned, not when customers pay: December sales '+m(dec)+' − variable costs '+varPercent+'% × '+m(dec)+' = '+m(contrib)+'. December cash receipts of '+m(cash)+' are a separate cash-budget matter.');},
 rng=>{const investment=r(rng,14,29)*1000,price=r(rng,27,44),variable=r(rng,12,23),units=r(rng,2,5)*1000,annualFixed=r(rng,3,8)*1000,discount=.9,net=units*(price-variable)-annualFixed,npv=round(net*discount-investment);
  return item('cvp-contribution-to-investment-npv',['D1','D3'],'A ONE-YEAR expansion requires an immediate investment of '+m(investment)+'. It is expected to sell '+units+' units at 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+price+' each, with variable cost 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+variable+' per unit. Incremental cash fixed operating costs are '+m(annualFixed)+' at year-end. There is no residual value. Using the single-year discount factor 0.90, calculate NPV of this expansion.',npv,'Annual incremental cash contribution = '+units+' × (
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+price+' − 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+variable+') = '+m(units*(price-variable))+'. Less fixed cash outlay '+m(annualFixed)+' gives annual net cash flow '+m(net)+'. Present value = '+m(net)+' × 0.90; subtract immediate investment '+m(investment)+' to obtain NPV '+m(npv)+'.');},
 rng=>{const budgetHours=r(rng,7,13)*1000,budgetRate=r(rng,9,17),actualHours=budgetHours+r(rng,-900,900),actualRate=budgetRate+r(rng,1,4),cost=actualHours*actualRate,expected=actualHours*budgetRate,variance=cost-expected;
  return item('labour-rate-variance-flexed-hours',['B2','A4'],'Budget direct labour rate is 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+budgetRate+' per labour hour with budgeted labour hours of '+budgetHours+'. Actual labour hours are '+actualHours+' and workers were paid at an actual rate of 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+actualRate+' per hour. Ignoring overtime premiums and all efficiency effects, calculate the ADVERSE LABOUR RATE VARIANCE using ACTUAL hours.',variance,'Actual labour cost = '+actualHours+' × 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+actualRate+' = '+m(cost)+'. Standard labour cost for ACTUAL hours = '+actualHours+' × 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+budgetRate+' = '+m(expected)+'. Difference attributable to rate is '+m(variance)+' adverse.');},
 rng=>{const tonnes=r(rng,10,24),distance=r(rng,40,75),rate=r(rng,3,8),markup=[20,25,30][r(rng,0,2)],cost=tonnes*distance*rate,selling=round(cost*(1+markup/100));
  return item('freight-tonne-km-markup-pricing',['C5','C3'],'A road-freight job moves '+tonnes+' tonnes of goods over '+distance+' km. The appropriate composite cost unit is TONNE-KILOMETRES and the service cost is 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+rate+' per tonne-km. Management prices the job with a '+markup+'% MARK-UP ON COST. Calculate the quoted JOB SELLING PRICE.',selling,'Composite workload = '+tonnes+' tonnes × '+distance+' km = '+tonnes*distance+' tonne-km. Cost = '+tonnes*distance+' × 
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
+rate+' = '+m(cost)+'. Add '+markup+'% mark-up on cost to quote '+m(selling)+'.');}
]
};
root.LedgerIntegratedCases={papers:cases,get(paper,rng,index){
 const list=cases[paper]||[];
 if(index<0||index>=list.length)return null;
 const q=list[index](rng);
 return {...q,topicKeys:q.topics.map(code=>paper+':'+code),integrated:true};
},counts:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,v.length]))};
})(typeof window!=='undefined'?window:globalThis);
