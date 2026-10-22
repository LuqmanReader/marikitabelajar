/* LedgerPeer QUANT — observed S&P 500 close-price explorer.
   Source: the same validated FRED SP500 snapshot used by the forecast Edge Function.
   No intraday, OHLC, or trading-volume data is represented. */
(function (root) {
  'use strict';

  const RANGES = ['5D', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'];
  const DAY_MS = 86400000;
  const atUtc = value => new Date(value + 'T00:00:00Z');

  function normalizeSeries(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.points) || typeof snapshot.source_name !== 'string') {
      throw Error('Invalid verified market snapshot');
    }
    const points = snapshot.points.map(p => ({ date: p.date, close: Number(p.close) }));
    if (points.length < 2 || !points.every(p =>
      /^\d{4}-\d{2}-\d{2}$/.test(p.date) &&
      Number.isFinite(atUtc(p.date).getTime()) &&
      atUtc(p.date).toISOString().slice(0, 10) === p.date &&
      Number.isFinite(p.close) && p.close > 0)) {
      throw Error('Missing or invalid daily close observations');
    }
    for (let i = 1; i < points.length; i++) {
      if (points[i].date <= points[i - 1].date) throw Error('Market dates must be unique and ascending');
      if (Math.abs(Math.log(points[i].close / points[i - 1].close)) > 0.35) {
        throw Error('Implausible index-price discontinuity');
      }
    }
    return { points, source: snapshot.source_name, retrievedAt: snapshot.retrieved_at || null };
  }

  function selectRange(points, range) {
    if (!RANGES.includes(range)) throw Error('Unknown price-chart range');
    if (range === 'ALL') return points.slice();
    if (range === '5D') return points.slice(-6); // 5 daily changes, 6 closes
    const end = atUtc(points[points.length - 1].date);
    let start;
    if (range === 'YTD') {
      start = new Date(Date.UTC(end.getUTCFullYear(), 0, 1));
    } else {
      const months = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 }[range];
      const y = end.getUTCFullYear(), m = end.getUTCMonth(), day = end.getUTCDate();
      start = new Date(Date.UTC(y, m - months, 1));
      const targetMonth = start.getUTCMonth(), targetYear = start.getUTCFullYear();
      const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
      start.setUTCDate(Math.min(day, lastDay));
    }
    const selected = points.filter(p => atUtc(p.date) >= start);
    return selected.length ? selected : points.slice(-1);
  }

  function movingAverage(points, span) {
    if (!Number.isInteger(span) || span < 2) throw Error('Invalid moving-average lookback');
    const result = new Array(points.length).fill(null);
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      sum += points[i].close;
      if (i >= span) sum -= points[i - span].close;
      if (i >= span - 1) result[i] = sum / span;
    }
    return result;
  }

  function periodPerformance(points) {
    if (!points.length) throw Error('Empty date selection');
    const first = points[0].close, last = points[points.length - 1].close;
    return { points: last - first, percent: (last / first - 1) * 100 };
  }

  const core = { RANGES, normalizeSeries, selectRange, movingAverage, periodPerformance };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document === 'undefined') return;

  const byId = id => document.getElementById(id);
  const format = (v, digits = 2) => Number(v).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const signed = (v, digits = 2) => (v > 0 ? '+' : '') + format(v, digits);
  const model = { loaded: false, points: [], source: '', retrievedAt: null, range: '1Y', show20: true, show50: false };

  function setStatus(message, type) {
    const label = byId('sp500ChartStatus');
    if (!label) return;
    label.textContent = message;
    label.dataset.type = type || 'info';
  }

  async function draw() {
    const chart = byId('sp500PriceChart');
    if (!chart) return;
    if (!root.Plotly) {
      chart.textContent = 'Interactive chart unavailable: chart library failed to load. Check your connection and reload.';
      setStatus('CHART LIBRARY UNAVAILABLE', 'error');
      return;
    }
    const points = model.points;
    const filtered = selectRange(points, model.range);
    const first = filtered[0], last = filtered[filtered.length - 1], prior = points[points.length - 2];
    const dayMove = last.close - prior.close, dayPct = (last.close / prior.close - 1) * 100;
    const perf = periodPerformance(filtered);
    const up = perf.points >= 0;
    const color = up ? '#6bf4c4' : '#ff7085';
    byId('sp500Last').textContent = format(last.close);
    byId('sp500Daily').textContent = signed(dayMove) + ' (' + signed(dayPct) + '%)';
    byId('sp500Daily').className = 'q-market-stat ' + (dayMove >= 0 ? 'q-green' : 'q-red');
    byId('sp500Period').textContent = signed(perf.percent) + '%';
    byId('sp500Period').className = 'q-market-stat ' + (up ? 'q-green' : 'q-red');
    byId('sp500AsOf').textContent = last.date;
    byId('sp500PeriodLabel').textContent = model.range + ' PERIOD RETURN';
    byId('sp500Source').textContent = model.source + ' · ' + points.length + ' daily closing prices · through ' + last.date;
    const daysOld = Math.floor((Date.now() - atUtc(last.date).getTime()) / DAY_MS);
    setStatus(daysOld > 14 ? 'STALE HISTORICAL SNAPSHOT' : 'VERIFIED HISTORICAL CLOSES', daysOld > 14 ? 'warning' : 'ok');
    byId('sp500ChartNote').textContent =
      'Observed S&P 500 index closes, not simulated prices. Returns use the first and last closes displayed. ' +
      'Daily move compares the two latest trading closes. No intraday quotes, OHLC candles, or volume are available in this dataset.' +
      (daysOld > 14 ? ' NOTE: the last closing price is older than 14 calendar days.' : '');
    const dates = filtered.map(p => p.date), values = filtered.map(p => p.close);
    const traces = [{
      type: 'scatter', mode: 'lines', name: 'S&P 500 / CLOSE',
      x: dates, y: values, line: { color, width: 2.8 },
      hovertemplate: '%{x|%d %b %Y}<br>Close: %{y:,.2f} index points<extra>S&P 500</extra>'
    }, {
      type: 'scatter', mode: 'markers', name: 'LATEST CLOSE',
      x: [last.date], y: [last.close], marker: { color, size: 9, line: { color: '#081523', width: 2 } },
      hovertemplate: '%{x|%d %b %Y}<br>Close: %{y:,.2f}<extra>Latest observed</extra>',
      showlegend: false
    }];
    const rangeStart = points.length - filtered.length;
    for (const [span, enabled, lineColor] of [[20, model.show20, '#ffca66'], [50, model.show50, '#87b5ff']]) {
      if (!enabled) continue;
      const ma = movingAverage(points, span).slice(rangeStart);
      traces.push({
        type: 'scatter', mode: 'lines', name: span + '-DAY SMA',
        x: dates, y: ma, line: { color: lineColor, width: 1.7, dash: 'dot' },
        hovertemplate: '%{x|%d %b %Y}<br>SMA ' + span + ': %{y:,.2f}<extra></extra>'
      });
    }
    const min = Math.min(...values), max = Math.max(...values);
    const pad = Math.max(10, (max - min) * .08);
    const layout = {
      autosize: true, height: 405,
      paper_bgcolor: '#0a1827', plot_bgcolor: '#0a1827',
      margin: { l: 66, r: 25, t: 22, b: 55 },
      font: { family: 'Consolas,monospace', color: '#b5cede', size: 11 },
      xaxis: {
        type: 'date', title: { text: 'HISTORICAL TRADING DATE', font: { size: 10, color: '#8faac2' }, standoff: 12 },
        gridcolor: 'rgba(82,118,146,.13)', linecolor: '#315068',
        showspikes: true, spikemode: 'across', spikesnap: 'cursor', spikecolor: '#839bb1',
        tickfont: { size: 10 }, automargin: true
      },
      yaxis: {
        title: { text: 'INDEX POINTS', font: { size: 10, color: '#8faac2' }, standoff: 10 },
        tickformat: ',.0f', range: [Math.max(0, min - pad), max + pad], zeroline: false,
        gridcolor: 'rgba(105,146,177,.18)', automargin: true
      },
      legend: { orientation: 'h', y: 1.11, x: 0, font: { size: 10, color: '#b5cede' }, bgcolor: 'rgba(0,0,0,0)' },
      hovermode: 'x unified', dragmode: 'zoom', uirevision: 'sp500-' + model.range
    };
    await root.Plotly.react(chart, traces, layout, {
      responsive: true, displaylogo: false, scrollZoom: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d']
    });
  }

  function updateControls() {
    document.querySelectorAll('[data-sp500-range]').forEach(btn => {
      const active = btn.dataset.sp500Range === model.range;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    for (const [id, enabled] of [['sp500Ma20', model.show20], ['sp500Ma50', model.show50]]) {
      const btn = byId(id);
      if (btn) { btn.classList.toggle('active', enabled); btn.setAttribute('aria-pressed', String(enabled)); }
    }
  }

  async function refresh() {
    if (historicalFetching) return;
    historicalFetching = true;
    setStatus('LOADING HISTORICAL PRICES', 'info');
    const node = byId('sp500PriceChart');
    if (node && !model.loaded) node.textContent = 'Retrieving verified historical close data…';
    const button = byId('sp500Refresh');
    if (button) button.disabled = true;
    try {
      const res = await fetch('data/quant-sp500.json', { cache: 'no-store' });
      if (!res.ok) throw Error('Snapshot request returned HTTP ' + res.status);
      const raw = await res.json();
      const checked = normalizeSeries(raw);
      historicalLastChecked = Date.now();
      model.points = checked.points;
      model.source = checked.source;
      model.retrievedAt = checked.retrievedAt;
      model.loaded = true;
      await draw();
    } catch (error) {
      setStatus('MARKET CHART ERROR', 'error');
      if (node) node.textContent = 'Historical price chart unavailable: ' + error.message +
        '. Check the market snapshot and retry.';
      byId('sp500ChartNote').textContent = 'The chart does not fabricate prices when verified data is unavailable.';
    } finally {
      historicalFetching = false;
      if (button) button.disabled = false;
    }
  }


  // Streaming provider chart is strictly separated from FRED-calibrated research data.
  // The third-party widget manages its own quote updates and may be delayed.
  const STREAM_WIDGET_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
  const CLOSE_REFRESH_MS = 5 * 60 * 1000;
  let liveInitialized = false, historicalLastChecked = 0, historicalFetching = false, historyRefreshTimer = null;

  function updateViewButtons(view) {
    for (const [id, active] of [['sp500LiveToggle', view === 'live'], ['sp500HistoryToggle', view === 'history']]) {
      const btn = byId(id);
      if (!btn) continue;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    }
  }

  function initStreamingChart(reconnect = false) {
    if (liveInitialized && !reconnect) return;
    const container = byId('sp500LiveChart');
    if (!container) return;
    container.replaceChildren();
    liveInitialized = true;
    const shell = document.createElement('div');
    shell.className = 'tradingview-widget-container';
    shell.style.width = '100%';
    shell.style.height = '100%';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.width = '100%';
    widget.style.height = 'calc(100% - 32px)';
    shell.appendChild(widget);
    const credit = document.createElement('div');
    credit.className = 'tradingview-widget-copyright';
    credit.style.cssText = 'height:32px;display:flex;align-items:center;gap:5px;padding:0 15px;font:11px Arial,sans-serif;color:#9bb4c9;';
    const link = document.createElement('a');
    link.href = 'https://www.tradingview.com/symbols/SPX/?exchange=TVC';
    link.target = '_blank';
    link.rel = 'noopener noreferrer nofollow';
    link.style.color = '#6bf4c4';
    link.textContent = 'S&P 500-based index chart';
    credit.append(link, document.createTextNode('by TradingView'));
    shell.appendChild(credit);
    container.appendChild(shell);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = STREAM_WIDGET_SRC;
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol: 'TVC:SPX',
      interval: '5',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#0a1827',
      gridColor: 'rgba(90,131,162,0.14)',
      hide_top_toolbar: false,
      hide_side_toolbar: true,
      hide_legend: false,
      hide_volume: true,
      allow_symbol_change: false,
      withdateranges: true,
      details: false,
      hotlist: false,
      calendar: false,
      save_image: true
    });
    script.addEventListener('error', () => {
      if (!shell.isConnected) return;
      if (model.view === 'live') setStatus('STREAMING PROVIDER UNAVAILABLE', 'error');
      widget.textContent = 'The streaming chart could not load. Check your connection or open the provider directly.';
      widget.classList.add('q-market-live-error');
    });
    script.addEventListener('load', () => {
      if (!shell.isConnected) return;
      if (model.view === 'live') setStatus('PROVIDER WIDGET LOADED / DATA MAY BE DELAYED', 'ok');
    });
    shell.appendChild(script);
    setStatus('CONNECTING TO EXTERNAL MARKET PROVIDER', 'info');
  }

  function showChartView(view) {
    model.view = view;
    const live = byId('sp500LiveView');
    const history = byId('sp500HistoryView');
    if (!live || !history) return;
    live.hidden = view !== 'live';
    history.hidden = view !== 'history';
    updateViewButtons(view);
    if (view === 'live') {
      initStreamingChart();
    } else {
      if (!model.loaded || Date.now() - historicalLastChecked >= CLOSE_REFRESH_MS) {
        void refresh();
      } else {
        void draw();
      }
    }
  }

  let mounted = false;
  function mount() {
    if (mounted || !byId('sp500PriceChart')) return;
    mounted = true;
    document.querySelectorAll('[data-sp500-range]').forEach(btn => btn.addEventListener('click', async () => {
      model.range = btn.dataset.sp500Range;
      updateControls();
      if (model.loaded) await draw();
    }));
    for (const [id, field] of [['sp500Ma20', 'show20'], ['sp500Ma50', 'show50']]) {
      const btn = byId(id);
      if (btn) btn.addEventListener('click', async () => {
        model[field] = !model[field];
        updateControls();
        if (model.loaded) await draw();
      });
    }
    byId('sp500Refresh')?.addEventListener('click', refresh);
    byId('sp500LiveToggle')?.addEventListener('click', () => showChartView('live'));
    byId('sp500HistoryToggle')?.addEventListener('click', () => showChartView('history'));
    byId('sp500LiveReload')?.addEventListener('click', () => {
      if (model.view === 'live') initStreamingChart(true);
    });
    updateControls();
    showChartView('live');
    // Only FRED historical closes are polled. Streaming updates belong to the provider widget.
    historyRefreshTimer = root.setInterval(() => {
      if (model.view === 'history' && document.visibilityState !== 'hidden' &&
          !historicalFetching && Date.now() - historicalLastChecked >= CLOSE_REFRESH_MS) {
        void refresh();
      }
    }, CLOSE_REFRESH_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && model.view === 'history' &&
          Date.now() - historicalLastChecked >= CLOSE_REFRESH_MS) void refresh();
    });
  }

  root.LedgerPeerMarketChart = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
