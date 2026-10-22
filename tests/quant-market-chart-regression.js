// node tests/quant-market-chart-regression.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const market = require('../quant-market-chart.js');
const source = JSON.parse(fs.readFileSync('data/quant-sp500.json', 'utf8'));
const {points, source: provider} = market.normalizeSeries(source);
assert.equal(provider, source.source_name);
assert(points.length >= 504, 'Historical feed too short');
assert(points.every((p, i) => i === 0 || p.date > points[i - 1].date), 'History unsorted');
const ranges = market.RANGES;
assert.deepEqual(ranges, ['5D','1M','3M','6M','YTD','1Y','ALL']);
for (const period of ranges) {
  const slice = market.selectRange(points, period);
  assert(slice.length > 0 && slice.length <= points.length, period + ' returned invalid length');
  assert.equal(slice[slice.length - 1].date, points[points.length - 1].date, period + ' lost latest date');
  const perf = market.periodPerformance(slice);
  assert.equal(perf.percent, (slice[slice.length - 1].close / slice[0].close - 1) * 100);
}
assert.equal(market.selectRange(points, '5D').length, 6, '5D should show five changes across six closes');
assert.equal(market.selectRange(points, 'ALL').length, points.length);
const annual = market.selectRange(points, 'YTD');
assert(annual[0].date.slice(0,4) === points[points.length - 1].date.slice(0,4));
assert(market.selectRange(points, '1M').length < market.selectRange(points, '3M').length);
const sma = market.movingAverage(points, 20);
assert(sma.slice(0,19).every(p => p === null), 'Premature MA values');
const manual = points.slice(0,20).reduce((acc,p) => acc + p.close,0) / 20;
assert(Math.abs(sma[19] - manual) < 1e-8, 'Wrong rolling average');
assert.equal(sma.length, points.length);
assert.throws(() => market.normalizeSeries({...source,points:[points[0],points[0]]}),/unique and ascending/);
assert.throws(() => market.normalizeSeries({...source,points:[{date:'2026-99-99',close:100}]}),/invalid/);
assert.throws(() => market.normalizeSeries({...source,points:[{date:'2026-01-01',close:100},{date:'2026-01-02',close:-5}]}),/invalid/);
assert.throws(() => market.selectRange(points,'1D'),/Unknown/);
const html=fs.readFileSync('quant-model.html','utf8');
const js=fs.readFileSync('quant-cockpit.js','utf8');
assert(html.includes('id="sp500PriceChart"') && html.includes('src="quant-market-chart.js?v='), 'Chart missing from QUANT page');
assert(html.indexOf('id="sp500PriceChart"') < html.indexOf('id="quantSurface"'), 'Historical chart should precede forecast');
assert(js.includes('if(!client)return;') && js.includes('LedgerPeerMarketChart?.mount()'), 'Chart must mount after authorization');
console.log('S&P 500 CHART REGRESSION PASSED | closes:',points.length,'| latest:',points[points.length-1].date,'| 5D points:',market.selectRange(points,'5D').length);
