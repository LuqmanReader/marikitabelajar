(function(){
  'use strict';
  const KEY='rh_finance_v1', DASH_KEY='rh_finance_dashboard_v1';
  const sections=['cash','saving','investment','gold'];
  const assetFields=[['cash','Cash'],['stocks','Stocks / equity funds'],['bonds','Bonds / sukuk'],['property','Real estate'],['gold','Gold'],['otherInvestments','Other investments'],['otherAssets','Other assets']];
  const debtFields=[['mortgage','Mortgage'],['carLoan','Car loans'],['creditCard','Credit cards'],['otherDebt','Other debt']];
  const defaults={savingsTarget:20,monthlyBudget:0,emergencyMonths:3,essentialMonthly:0,annualExpenses:0,fiMultiple:25,taxAccount:'EPF',taxTarget:0};
  const number=x=>Number.isFinite(Number(x))?Number(x):0;
  const sum=(rows,key='amount')=>rows.reduce((n,r)=>n+number(r[key]),0);
  const money=x=>'RM'+number(x).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dateValid(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''))return false;const t=new Date(d+'T12:00:00Z');return !isNaN(t)&&t.toISOString().slice(0,10)===d;}
  function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function load(storage=localStorage){const raw=storage.getItem(KEY);if(!raw)return {cash:[],saving:[],investment:[],gold:[]};const state=JSON.parse(raw);if(!state||typeof state!=='object'||Array.isArray(state))throw Error('Saved tracker data is not a valid ledger.');sections.forEach(s=>{if(state[s]==null)state[s]=[];if(!Array.isArray(state[s]))throw Error('Saved '+s+' records are not a list.');});return state;}
  function loadDashboard(storage=localStorage){const raw=storage.getItem(DASH_KEY);if(!raw)return {snapshots:[],goals:[],settings:{...defaults}};const state=JSON.parse(raw);if(!state||!Array.isArray(state.snapshots))throw Error('Saved dashboard data is invalid.');return {snapshots:state.snapshots,goals:Array.isArray(state.goals)?state.goals:[],settings:{...defaults,...state.settings}};}
  function shiftMonth(month,by){const [y,m]=month.split('-').map(Number);const d=new Date(Date.UTC(y,m-1+by,1));return d.toISOString().slice(0,7);}
  function monthsEnding(month,count=12){return Array.from({length:count},(_,i)=>shiftMonth(month,i-count+1));}
  function monthRows(state,type,month){return state[type].filter(r=>dateValid(r.date)&&r.date.slice(0,7)===month);}
  function totals(state,month){const cash=monthRows(state,'cash',month),income=sum(cash.filter(r=>r.type==='Income')),expense=sum(cash.filter(r=>r.type==='Expense')),surplus=income-expense;return {month,income,expense,surplus,rate:income>0?surplus/income*100:null,saving:sum(monthRows(state,'saving',month)),investment:sum(monthRows(state,'investment',month)),gold:sum(monthRows(state,'gold',month)),grams:sum(monthRows(state,'gold',month),'grams'),count:sections.reduce((n,s)=>n+monthRows(state,s,month).length,0)};}
  function group(rows,key,value='amount'){const map=Object.create(null);rows.forEach(r=>{const label=typeof key==='function'?key(r):r[key]||'Unclassified';map[label]=(map[label]||0)+number(typeof value==='function'?value(r):r[value]);});return Object.entries(map).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);}
  function snapshotTotals(s){if(!s)return null;const assets=assetFields.reduce((n,[key])=>n+number(s[key]),0),liabilities=debtFields.reduce((n,[key])=>n+number(s[key]),0);return {assets,liabilities,netWorth:assets-liabilities,portfolio:number(s.stocks)+number(s.bonds)+number(s.gold)+number(s.otherInvestments),emergencyCash:Math.min(number(s.emergencyCash),number(s.cash))};}
  function latestSnapshot(snapshots,month){return snapshots.filter(s=>dateValid(s.date)&&s.date.slice(0,7)<=month).sort((a,b)=>a.date.localeCompare(b.date)).at(-1)||null;}
  function holdings(state,month){return state.investment.filter(r=>!dateValid(r.date)||r.date.slice(0,7)<=month);}
  function fees(rows){let total=0,covered=0,annual=0;rows.forEach(r=>{const value=r.value!=null&&r.value!==''?number(r.value):number(r.amount);total+=value;if(r.feeRate!=null&&r.feeRate!==''&&Number.isFinite(Number(r.feeRate))){covered+=value;annual+=value*number(r.feeRate)/100;}});return {total,covered,annual,rate:covered>0?annual/covered*100:null,coverage:total>0?covered/total*100:null};}
  function delta(current,previous){return {amount:current-previous,percent:previous!==0?(current-previous)/Math.abs(previous)*100:null};}
  function analyze(state,dashboard,month){const months=monthsEnding(month),monthly=months.map(m=>totals(state,m)),selected=totals(state,month),previous=totals(state,shiftMonth(month,-1));const snapshot=latestSnapshot(dashboard.snapshots,month),wealth=snapshotTotals(snapshot),settings=dashboard.settings;const rows=monthRows(state,'cash',month).filter(r=>r.type==='Expense'),investments=holdings(state,month),known=investments.filter(r=>r.value!=null&&r.value!==''),fee=fees(investments);const year=month.slice(0,4),taxRows=state.investment.filter(r=>dateValid(r.date)&&r.date.slice(0,4)===year&&r.date.slice(0,7)<=month&&r.taxAccount===settings.taxAccount);return {months,monthly,selected,previous,snapshot,wealth,settings,expenses:rows,investments,known,fees:fee,taxContribution:sum(taxRows),undated:sections.reduce((n,s)=>n+state[s].filter(r=>!dateValid(r.date)).length,0),emergencyMonths:wealth&&settings.essentialMonthly>0?wealth.emergencyCash/settings.essentialMonthly:null,fiTarget:settings.annualExpenses>0?settings.annualExpenses*settings.fiMultiple:null,fiProgress:wealth&&settings.annualExpenses>0?wealth.portfolio/(settings.annualExpenses*settings.fiMultiple)*100:null,knownGain:sum(known,'value')-sum(known)};}
  function validateBackup(backup){
    if(!backup||backup.format!=='personal-hub-finance'||backup.version!==1||!backup.tracker||typeof backup.tracker!=='object')throw Error('Choose a Personal Hub finance backup.');
    const tracker=JSON.parse(JSON.stringify(backup.tracker));
    sections.forEach(type=>{
      if(!Array.isArray(tracker[type]))throw Error('The backup has invalid tracker lists.');
      tracker[type].forEach(r=>{
        if(!r||!Number.isFinite(Number(r.id))||!Number.isFinite(Number(r.amount))||Number(r.amount)<0)throw Error('The backup has an invalid record.');
        r.id=Number(r.id);r.amount=Number(r.amount);
        if(type==='cash'&&!['Income','Expense'].includes(r.type))throw Error('Cash entries must be Income or Expense.');
        for(const k of ['value','grams','feeRate'])if(r[k]!=null&&r[k]!==''){
          if(!Number.isFinite(Number(r[k]))||Number(r[k])<0||k==='feeRate'&&Number(r[k])>100)throw Error('The backup has an invalid numeric value.');r[k]=Number(r[k]);
        }
      });
    });
    let dashboard=null;
    if(backup.dashboard){
      dashboard=JSON.parse(JSON.stringify(backup.dashboard));
      if(!Array.isArray(dashboard.snapshots)||!dashboard.settings||typeof dashboard.settings!=='object')throw Error('The dashboard backup is invalid.'); dashboard.goals=Array.isArray(dashboard.goals)?dashboard.goals:[];
      dashboard.settings={...defaults,...dashboard.settings};
      for(const key of Object.keys(defaults).filter(k=>k!=='taxAccount')){
        if(!Number.isFinite(Number(dashboard.settings[key]))||Number(dashboard.settings[key])<0)throw Error('Dashboard targets must be non-negative numbers.');dashboard.settings[key]=Number(dashboard.settings[key]);
      }
      const cfg=dashboard.settings;
      if(cfg.savingsTarget>100||cfg.emergencyMonths<1||cfg.emergencyMonths>60||cfg.fiMultiple<1||cfg.fiMultiple>100||!['EPF','PRS','401(k)','IRA','Other'].includes(cfg.taxAccount))throw Error('Dashboard targets are out of range.');
      dashboard.snapshots.forEach(s=>{
        if(!s||!dateValid(s.date)||!Number.isFinite(Number(s.id)))throw Error('Snapshot date or ID is invalid.');
        s.id=Number(s.id);
        for(const key of assetFields.concat(debtFields).map(x=>x[0]).concat('emergencyCash')){
          if(s[key]==null)s[key]=0;if(!Number.isFinite(Number(s[key]))||Number(s[key])<0)throw Error('Snapshot balances must be non-negative numbers.');s[key]=Number(s[key]);
        }
        if(s.emergencyCash>s.cash)throw Error('Emergency cash cannot exceed total cash assets.');
      });
    }
    return {tracker,dashboard};
  }
  window.FinanceCore={KEY,DASH_KEY,sections,assetFields,debtFields,defaults,number,sum,money,esc,dateValid,today,load,loadDashboard,shiftMonth,monthsEnding,monthRows,totals,group,snapshotTotals,latestSnapshot,holdings,fees,delta,analyze,validateBackup};
})();
