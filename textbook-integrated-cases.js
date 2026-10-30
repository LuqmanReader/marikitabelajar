/* Original LedgerPeer integrated accounting case studies; independently authored. */
(function(root){'use strict';root.LedgerMasterCases={
  "FA1:B1": {
    "title": "From transaction evidence to a balanced trial balance",
    "context": "A new sole-trader business begins with no balances. During its first week it receives owner capital RM30,000 into bank, buys equipment RM8,000 cash, buys inventory RM6,000 on credit, sells goods on credit for RM9,000 (ignore sales tax), pays supplier RM2,000, and pays rent RM1,000. The cost of goods sold is not provided, so inventory has not yet been adjusted for the sale; this is a journal-entry and unadjusted trial-balance demonstration rather than a full trading account.",
    "steps": [
      "1. Capital: Dr bank 30,000 / Cr owner capital 30,000. Assets/equity rise together; capital is not revenue.",
      "2. Equipment purchase: Dr equipment 8,000 / Cr bank 8,000. This exchanges assets, not an expense under the given facts.",
      "3. Credit inventory purchase: Dr inventory 6,000 / Cr payables 6,000. An invoice increases a supplier debt even though no cash leaves.",
      "4. Credit sale: Dr receivables 9,000 / Cr revenue 9,000. The inventory cost-of-sale journal is omitted by express assumption; in a real perpetual system it is also necessary if the related cost is known.",
      "5. Supplier settlement: Dr payables 2,000 / Cr bank 2,000. Do not Dr purchases again.",
      "6. Rent: Dr rent expense 1,000 / Cr bank 1,000. Rent reduces profit and bank."
    ],
    "reconciliation": "Bank = 30,000−8,000−2,000−1,000 = RM19,000 Dr. Debits: bank 19,000; equipment 8,000; inventory 6,000; receivables 9,000; rent 1,000 = RM43,000. Credits: payables 4,000; capital 30,000; revenue 9,000 = RM43,000. Trial balance agrees. Since no cost of goods sold is supplied, no complete financial statements can be prepared from this scenario; this is deliberately a book-entry demonstration.",
    "pitfall": "A balanced TB does not prove that the missing cost of goods sold was handled; a real end-of-period valuation and matching adjustment is needed."
  },
  "FA2:D1": {
    "title": "Credit sales, returns and sales-tax control case",
    "context": "Entity sells goods at list RM10,000 less 10% trade discount, exclusive of assumed 8% sales tax; customer later returns 20% of the net goods invoiced. Supplier purchases (a separate transaction) are RM4,000 net plus 8% recoverable input tax. Assume all amounts legally taxable and tax is recoverable for the question.",
    "steps": [
      "1. Trade-discounted sales base =10,000×90%=RM9,000, not RM10,000. Output tax RM720; gross receivable RM9,720.",
      "2. Credit-sale journal: Dr trade receivables 9,720; Cr sales 9,000; Cr output tax payable 720.",
      "3. Customer return: 20%×9,000=RM1,800 revenue reversal; tax 8%×1,800=RM144; credit note gross RM1,944. Journal Dr sales returns 1,800; Dr output tax payable 144; Cr trade receivables 1,944.",
      "4. Purchase journal: Dr inventory/purchases 4,000; Dr recoverable input tax 320; Cr trade payables 4,320.",
      "5. Compute net figures: net sales 9,000−1,800=RM7,200; remaining receivable 9,720−1,944=RM7,776; net output tax 720−144=RM576; recoverable input tax RM320.",
      "6. If the regime permits full offset, net sales-tax liability =576−320=RM256. This is not sales income and should not be included in gross profit."
    ],
    "reconciliation": "Debits equal credits in each entry; customer receivable RM7,776 agrees with net sales RM7,200 plus tax RM576. Supplier payable RM4,320 agrees with inventory RM4,000 plus input tax RM320. Tax paid to authority under stated simple offset assumption RM256.",
    "pitfall": "A trade discount is removed before calculating tax; do not assume real-world Malaysia/UK tax rules from this illustrative 8% rate."
  },
  "FA2:D4": {
    "title": "Asset purchase, depreciation, disposal and replacement",
    "context": "A business bought a machine for RM60,000 on 1 January Year 1. Residual value RM6,000; five-year life; straight-line annual depreciation. It sells machine 30 June Year 3 for RM32,000, using monthly depreciation with a charge in year of sale. It simultaneously purchases a new machine costing RM80,000 for cash.",
    "steps": [
      "1. Annual depreciation=(60,000−6,000)/5=RM10,800. Year 1 RM10,800; Year 2 RM10,800; six months of Year 3 RM5,400.",
      "2. Total accumulated depreciation at sale =10,800+10,800+5,400=RM27,000. Year 3 Dr depreciation expense 5,400 / Cr accum depreciation 5,400.",
      "3. Carrying amount on disposal=60,000−27,000=RM33,000. Sale proceeds RM32,000, therefore loss RM1,000.",
      "4. Disposal account: Dr disposal 60,000 / Cr original machine cost 60,000; Dr accumulated depreciation 27,000 / Cr disposal 27,000; Dr bank 32,000 / Cr disposal 32,000.",
      "5. Disposal account has debit RM60,000 versus credits RM59,000; close RM1,000 loss by Dr loss on disposal 1,000 / Cr disposal 1,000.",
      "6. New machine journal Dr new machine 80,000 / Cr bank 80,000. New asset is recorded independently at full cost; calculate its own depreciation starting from availability-for-use date using stipulated assumptions."
    ],
    "reconciliation": "Net bank effect from sale and replacement =+32,000−80,000=−RM48,000. Old cost and old accumulated depreciation no longer appear; loss reduces this year's profit RM1,000 in addition to depreciation RM5,400.",
    "pitfall": "Do not use the sale proceeds as the disposal gain and do not omit depreciation from start of Year 3 to sale date."
  },
  "FA2:G1": {
    "title": "End-to-end adjusted profit statement from an incomplete draft",
    "context": "For the year ended 31 December, unadjusted figures include sales RM160,000, sales returns RM5,000, opening inventory RM20,000, purchases RM85,000, purchase returns RM4,000, carriage inwards RM3,000, wages RM22,000, rent RM12,000, and insurance payment RM6,000 on 1 October for a full 12 months. Closing stock RM24,000. Annual machinery depreciation RM7,000. Trade receivables RM52,000 before writing off RM2,000; opening allowance RM1,200 credit; new allowance 3% of surviving debt. Interest cost not applicable. Assume all sales/purchases amounts are net of any tax.",
    "steps": [
      "1. Net revenue =sales 160,000−returns 5,000=RM155,000.",
      "2. Net purchases=85,000−4,000=RM81,000. Cost of sales=opening stock 20,000 +81,000+carriage 3,000−closing stock 24,000=RM80,000.",
      "3. Gross profit =155,000−80,000=RM75,000.",
      "4. Insurance period used October–December =3/12×6,000=RM1,500. Closing insurance prepayment=RM4,500; Dr prepayment / Cr expense RM4,500 if all RM6,000 was initially expensed.",
      "5. Write off RM2,000 irrecoverable debt; receivables surviving=52,000−2,000=RM50,000. Required allowance=50,000×3%=RM1,500; increase from opening RM1,200 =RM300.",
      "6. Expenses: wages RM22,000, rent RM12,000, insurance RM1,500, depreciation RM7,000, debt write-off RM2,000, allowance increase RM300; sum=RM44,800.",
      "7. Final profit=75,000−44,800=RM30,200. Net receivables after allowance=50,000−1,500=RM48,500.",
      "8. Statement of financial position would also require actual bank, equipment cost/accum depreciation, payables, loans and capital figures. Do not invent these from the profit statement alone."
    ],
    "reconciliation": "Gross profit RM75,000, total expenses RM44,800, net profit RM30,200. Closing stock RM24,000, prepayment RM4,500 and net receivables RM48,500 flow to assets. Depreciation reduces equipment carrying value, and write-off plus allowance reduce receivables. Profit raises closing equity before owner drawings.",
    "pitfall": "Insurance RM6,000 is a 12-month payment, not wholly current-year expense; the receivables allowance is 3% of RM50,000 after the actual write-off, and the charge is the increase of RM300, not RM1,500 again."
  },
  "MA2:C1": {
    "title": "Departmental allocation, absorption and product quotation",
    "context": "A factory has production departments Cutting and Assembly plus service department Maintenance. Shared rent RM24,000 is apportioned by floor area: Cutting 500m², Assembly 300m², Maintenance 200m². Maintenance has its own direct expense RM8,000 and is reallocated 70% Cutting/30% Assembly. Other direct departmental overheads: Cutting RM20,000; Assembly RM10,000. Cutting budgeted 4,000 machine hours, Assembly 6,000 labour hours. Job X uses 30 Cutting machine hours and 50 Assembly labour hours plus RM2,000 direct materials and RM1,500 direct labour.",
    "steps": [
      "1. Total space 1,000m². Apportion rent: Cutting RM12,000; Assembly RM7,200; Maintenance RM4,800.",
      "2. Maintenance service cost=own RM8,000+rent RM4,800=RM12,800. Reallocate Cutting 70%=RM8,960; Assembly 30%=RM3,840.",
      "3. Cutting production overhead=direct 20,000+rent12,000+maintenance8,960=RM40,960. Assembly production overhead=direct10,000+rent7,200+maintenance3,840=RM21,040.",
      "4. Total production overhead=40,960+21,040=RM62,000. Verify against original 24,000 rent +8,000 maintenance direct +20,000 Cutting +10,000 Assembly =RM62,000.",
      "5. Cutting OAR=40,960/4,000=RM10.24/machine hour. Assembly OAR=21,040/6,000≈RM3.5066667/labour hour.",
      "6. Job X absorbed overhead=30×10.24 +50×(21,040/6,000)=307.20+175.3333=RM482.53.",
      "7. Production cost of Job X=direct materials 2,000+direct labour 1,500+absorbed overhead 482.53=RM3,982.53.",
      "8. A 25% markup quotation would be 3,982.53×1.25≈RM4,978.17; a 25% margin on sales instead would be 3,982.53/0.75≈RM5,310.04. State how intermediate rounding is handled."
    ],
    "reconciliation": "All rent and Maintenance costs are absorbed exactly once; department overhead totals RM62,000. Rates apply to department-specific activity, not combined labour/machine hours. A quote includes actual job resource usage, not annual factory overhead in full.",
    "pitfall": "Do not divide combined overhead by only Cutting hours or use RM8,000 maintenance without its shared rent portion."
  },
  "MA2:C4": {
    "title": "Process account with abnormal loss and scrap",
    "context": "Input 1,000 units at total process cost RM18,100. Normal loss is 10% of input and normal-loss scrap value RM1 per lost unit. Actual good output is 860 units and 140 units are lost, all losses have RM1/unit scrap recovery. No opening or closing WIP.",
    "steps": [
      "1. Expected normal loss=1,000×10%=100 units; expected good production=900 units.",
      "2. Actual loss=1,000−860=140; abnormal loss=140−100=40 units.",
      "3. Normal loss credit to process: 100×RM1 scrap proceeds=RM100. Cost spread across expected good output = (18,100−100)/900 =RM20/unit.",
      "4. Good output transferred=860×20=RM17,200.",
      "5. Abnormal loss charged at full process rate=40×20=RM800 (debit abnormal-loss account, credit process account).",
      "6. Normal loss scrap credited at RM100. Process account credits reconcile 17,200+800+100=RM18,100 equal debit cost.",
      "7. Abnormal loss scrap proceeds RM40 (40×RM1) reduce abnormal loss charge from RM800 to net RM760, assuming salvage proceeds are realised; debit bank/scrap account and credit abnormal loss.",
      "8. Net RM760 abnormal-loss expense is recognised in profit or loss under stated assumptions. The normal loss is absorbed by good output; it is not charged again as an independent operating expense."
    ],
    "reconciliation": "Units: input1,000 =good860 + normal loss100 + abnormal loss40. Process cost: debit RM18,100 =good output RM17,200 + normal scrap RM100 + abnormal loss RM800. Abnormal loss net of its own salvage =RM760.",
    "pitfall": "Do not cost abnormal loss at scrap value RM1/unit; it is valued at process cost and then reduced by scrap recovery."
  },
  "MA2:E3": {
    "title": "Three-period cash budget with an overdraft",
    "context": "Cash opens 1 January at RM5,000. Credit sales December RM10,000, January RM20,000, February RM30,000 and March RM24,000. Collections are 40% in sale month and 60% the next month. Payments are RM17,000 in January, RM31,000 in February and RM22,000 in March. Assume no bad debts, other receipts or additional financing.",
    "steps": [
      "1. January cash receipts =40% of Jan sales (8,000) +60% December sales (6,000) =RM14,000.",
      "2. February cash receipts =40% of Feb sales (12,000)+60% Jan sales (12,000)=RM24,000.",
      "3. March receipts =40% of Mar sales (9,600)+60% Feb sales (18,000)=RM27,600.",
      "4. January close =opening 5,000+receipts14,000−payments17,000 =RM2,000.",
      "5. February opening =January closing RM2,000. Feb close =2,000+24,000−31,000 =−RM5,000 (overdraft).",
      "6. March opening =−RM5,000. March close =−5,000+27,600−22,000=RM600.",
      "7. Maximum expected financing gap =RM5,000 at end February. A positive closing March balance does not eliminate the February funding requirement.",
      "8. If some customers delay collection into a second month, revise each receipt schedule and calculate worst-case borrowing, not just one year's total revenue."
    ],
    "reconciliation": "Cash budgets reconcile month to month: openings 5,000/2,000/−5,000 and closings 2,000/−5,000/600. Receipts total RM65,600; payments total RM70,000; opening 5,000 leaves final cash RM600.",
    "pitfall": "Do not place credit sales into cash receipts automatically in the same month; the settlement pattern controls the timetable."
  }
};})(window);
