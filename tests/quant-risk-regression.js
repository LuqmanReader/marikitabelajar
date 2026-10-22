// Run: node tests/quant-risk-regression.js
// This verifies the exact pure research functions extracted from the deployed Edge Function source.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const text=fs.readFileSync('supabase/functions/ledgerpeer-quant-forecast/index.ts','utf8');
const start=text.indexOf('function normalCdf('),end=text.indexOf('Deno.serve(');
assert(start>=0&&end>start,'Research function missing from Edge Function');
const pure=text.slice(start,end).replace('function analyzeResearch(points:Point[])','function analyzeResearch(points)');
const sandbox={};vm.runInNewContext(pure+';this.calc=analyzeResearch;this.cdf=normalCdf',sandbox);
assert(Math.abs(sandbox.cdf(0)-.5)<1e-6,'Normal CDF centre invalid');
const snapshot=JSON.parse(fs.readFileSync('data/quant-sp500.json','utf8'));
assert(snapshot.points.length>=504,'Insufficient cached history');
const result=sandbox.calc(snapshot.points);
const b=result.backtest,r=result.historical_risk;
assert(b.forecasts===b.windows.length&&b.forecasts>=10,'No meaningful holdout windows');
assert(b.windows.every((w,i)=>i===0||w.forecast_date>=b.windows[i-1].outcome_date),'Overlapping evaluation windows');
assert(b.events===b.windows.reduce((n,w)=>n+w.realized,0),'Event counts wrong');
assert(b.windows.every(w=>w.predicted_pct>=0&&w.predicted_pct<=100&&w.baseline_pct>=0&&w.baseline_pct<=100),'Probabilities out of bounds');
assert(b.brier_model>=0&&b.brier_model<=1&&b.brier_baseline>=0&&b.brier_baseline<=1,'Invalid Brier score');
assert(r.expected_shortfall_95_1d_pct>=r.var_95_1d_pct&&r.max_drawdown_pct>=0,'Invalid historical tail risk');
// The prediction at a forecast origin must not change if later prices change.
const modified=snapshot.points.map(p=>({...p}));
modified[modified.length-1].close*=.8;
const altered=sandbox.calc(modified);
assert.equal(altered.backtest.windows[0].predicted_pct,b.windows[0].predicted_pct,'Future data contaminated historical forecast');
assert.equal(altered.backtest.windows[0].baseline_pct,b.windows[0].baseline_pct,'Future data contaminated historical baseline');
console.log('QUANT regression PASSED | holdout windows:',b.forecasts,'| events:',b.events,'| model Brier:',b.brier_model.toFixed(4),'| historical VaR:',r.var_95_1d_pct.toFixed(2)+'%');
