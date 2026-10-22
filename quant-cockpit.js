
(()=>{'use strict';
const el=id=>document.getElementById(id);
const fmt=(x,d=1)=>Number.isFinite(x)?x.toFixed(d):'—';
const norm=x=>{const t=1/(1+.2316419*Math.abs(x)),d=.3989422804*Math.exp(-x*x/2);const p=1-d*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x>=0?p:1-p};
const state={level:100,drift:.065,vol:.21,term:126,threshold:.10,live:false,modified:false,source:'ILLUSTRATIVE',date:null,sample:0,orbit:.57,pitch:.48,paths:[],selected:0,animated:true,seed:9911};
function rand(seed){let n=seed>>>0;return ()=>((n=Math.imul(1664525,n)+1013904223>>>0)/4294967296)}
function gaussian(random){return Math.sqrt(-2*Math.log(Math.max(random(),1e-8)))*Math.cos(2*Math.PI*random())}
function setMessage(message,type='info'){const box=el('modelMessage');if(box){box.textContent=message;box.dataset.type=type}}
function pathData(){
 const n=3000, steps=60, horizon=state.term,dt=horizon/252, drift=state.drift;
 const random=rand(state.seed);const paths=[];let negative=0;
 for(let p=0;p<n;p++){
   const arr=[0];let log=0;
   for(let t=1;t<=steps;t++){log+=drift*dt/steps+state.vol*Math.sqrt(dt/steps)*gaussian(random);arr.push(log)}
   if(log<=Math.log(1-state.threshold))negative++;
   paths.push({log:arr,tail:log,bad:log<=Math.log(1-state.threshold)});
 }
 state.paths=paths;
 const mu=state.drift*dt;
 const sd=Math.max(1e-9,state.vol*Math.sqrt(dt));
 const analytic=norm((Math.log(1-state.threshold)-mu)/sd);
 el('riskValue').textContent=fmt(analytic*100,1)+'%';
 el('volValue').textContent=fmt(state.vol*100,1)+'%';
 el('driftValue').textContent=(state.drift>=0?'+':'')+fmt(state.drift*100,1)+'%';
 el('levelValue').textContent=state.live?state.level.toLocaleString('en-US',{maximumFractionDigits:2}):'SIMULATED';
 el('riskDetail').textContent='Probability at '+state.term+' trading days; terminal decline ≥ '+fmt(state.threshold*100,0)+'%';
 el('sampleOutput').textContent='Monte Carlo: '+n+' seeded paths • '+negative+' paths beyond loss threshold';
 el('formulaText').textContent='Φ[(ln('+(1-state.threshold).toFixed(2)+') − μ·T) / (σ√T)] = '+fmt(analytic*100,2)+'%';
 el('dataMode').textContent=state.live?(state.modified?'MARKET BASELINE / USER-ADJUSTED':'CALIBRATED FROM OBSERVATIONS'):'ILLUSTRATIVE / NOT MARKET CALIBRATED';
 el('dataMode').style.color=state.live?'#6bf4c4':'#ffca66';
 el('activeSource').textContent=state.live?state.source+' · '+state.date:'Educational assumptions only';
}


function surfaceInit(){
 const node=el('quantSurface');
 if(!node)return;
 if(!window.Plotly){node.textContent='3D WebGL chart library could not load; the calculations remain available. Check the connection and refresh.';return}
 let redrawTimer=null,inFlight=false,queued=false,rendered=false,frame=null,axisLocked=true;
 let camera={eye:{x:1.72,y:-2.12,z:1.62},center:{x:0,y:0,z:0}};
 let orbitStep=-.88;
 const spectrum=[[0,'#152b45'],[.08,'#265789'],[.22,'#257fc0'],[.45,'#21bbce'],[.66,'#67eacb'],[.84,'#d6c0fd'],[1,'#ffe1aa']];
 const percentile=(t,z)=>(Math.exp(state.drift*t/252+z*state.vol*Math.sqrt(t/252))-1)*100;
 const roundSign=x=>(x>=0?'+':'')+fmt(x,1)+'%';
 const lowZ=-1.6448536269, highZ=1.6448536269;
 function updateSnapshots(){
   const ts=[state.term/6,state.term/2,state.term];
   const fullWidth=percentile(state.term,highZ)-percentile(state.term,lowZ);
   ['early','mid','late'].forEach((id,i)=>{
     const day=ts[i],lo=percentile(day,lowZ),hi=percentile(day,highZ);
     const dayEl=el('slice-'+id+'-day'),rangeEl=el('slice-'+id+'-range'),bar=el('slice-'+id+'-bar');
     if(dayEl)dayEl.textContent=fmt(day,0)+' TRADING DAYS';
     if(rangeEl)rangeEl.textContent=roundSign(lo)+' to '+roundSign(hi);
     if(bar)bar.style.width=fmt(Math.max(5,(hi-lo)/Math.max(.001,fullWidth)*100),1)+'%';
   });
 }
 function makeFigure(){
   const paths=state.paths,steps=paths[0].log.length-1, T=state.term/252;
   const lowLog=Math.min(-.12,state.drift*T-3.8*state.vol*Math.sqrt(T),Math.log(1-state.threshold)-.05);
   const highLog=Math.max(.12,state.drift*T+3.8*state.vol*Math.sqrt(T));
   const minReturn=Math.max(-99,(Math.exp(lowLog)-1)*100),maxReturn=(Math.exp(highLog)-1)*100;
   const rows=101,firstStep=Math.max(2,Math.ceil(steps*.065));
   const indices=Array.from({length:steps-firstStep+1},(_,i)=>i+firstStep);
   const times=indices.map(i=>i*state.term/steps);
   const returns=Array.from({length:rows},(_,i)=>minReturn+(maxReturn-minReturn)*i/(rows-1));
   const bin=(maxReturn-minReturn)/(rows-1),n=paths.length;
   const densities=indices.map(step=>{
     const histogram=new Float64Array(rows);
     let sum=0,sumSq=0;
     for(const path of paths){
       const v=(Math.exp(path.log[step])-1)*100;
       sum+=v;sumSq+=v*v;
       const idx=Math.floor((v-minReturn)/bin+.5);
       if(idx>=0&&idx<rows)histogram[idx]++;
     }
     const sd=Math.sqrt(Math.max(0,sumSq/n-(sum/n)**2));
     const bandwidth=Math.max(.65*bin,1.06*sd*Math.pow(n,-.2));
     const radius=Math.max(1,Math.min(14,Math.ceil(3*bandwidth/bin)));
     const smooth=new Float64Array(rows);
     for(let j=0;j<rows;j++){
       let v=0;
       for(let k=-radius;k<=radius;k++){
         const q=j+k;
         if(q<0||q>=rows)continue;
         v+=histogram[q]*Math.exp(-.5*(k*bin/bandwidth)**2);
       }
       smooth[j]=v;
     }
     const integral=smooth.reduce((a,b)=>a+b,0)*bin;
     return Array.from(smooth,v=>v/Math.max(integral,1e-10));
   });
   const maxDensity=Math.max(...densities.flat());
   const z=returns.map((_,i)=>densities.map(d=>d[i]));
   // Colour means concentration relative to each time slice; height remains true density.
   const peaks=densities.map(d=>Math.max(...d));
   const relativeColour=z.map(row=>row.map((v,j)=>v/Math.max(peaks[j],1e-10)));
   if(!frame){
      const yPad=(maxReturn-minReturn)*.075;
      frame={y:[minReturn-yPad,maxReturn+yPad],z:[0,maxDensity*1.3]};
   }
   const heightAt=(t,value)=>{
     const j=Math.max(0,Math.min(densities.length-1,Math.round(t/state.term*steps)-firstStep));
     const r=Math.max(0,Math.min(rows-1,Math.round((value-minReturn)/bin)));
     return densities[j][r]+maxDensity*.025;
   };
   const surface={type:'surface',name:'Simulated probability density',x:times,y:returns,z,surfacecolor:relativeColour,
      cmin:0,cmax:1,opacity:.97,showscale:false,colorscale:spectrum,
      lighting:{ambient:.60,diffuse:.91,specular:.30,roughness:.65,fresnel:.10},
      lightposition:{x:100,y:-90,z:165},
      contours:{z:{show:true,highlight:false,project:{z:true},color:'#486e88',width:1}},
      hovertemplate:'Time: %{x:.0f} trading days<br>Cumulative return: %{y:.1f}%<br>Estimated density: %{z:.4f} per 1% return<extra>DENSITY TERRAIN</extra>'};
   const bandLines=[{z:lowZ,name:'5th percentile',color:'#ff8296'},{z:0,name:'Median',color:'#7dffda'},{z:highZ,name:'95th percentile',color:'#ffd38b'}].map(p=>{
      const vals=times.map(t=>percentile(t,p.z));
      return {type:'scatter3d',mode:'lines',name:p.name,x:times,y:vals,z:vals.map((v,i)=>heightAt(times[i],v)),
         hovertemplate:p.name+'<br>Day %{x:.0f}<br>Return %{y:.1f}%<extra></extra>',
         line:{color:p.color,width:p.z===0?8:5},showlegend:true};
   });
   const sliceStops=[Math.max(firstStep,Math.round(steps/6)),Math.max(firstStep,Math.round(steps/2)),steps];
   const sliceColors=['#55b7ff','#dba8ff','#fff09b'];
   const ridges=sliceStops.map((step,i)=>{
      const j=step-firstStep,values=densities[j],day=times[j];
      return {type:'scatter3d',mode:'lines',name:'Day '+fmt(day,0)+' density',
         x:Array(rows).fill(day),y:returns,z:values.map(v=>v+maxDensity*.012),
         line:{color:sliceColors[i],width:i===2?7:5},showlegend:false,
         hovertemplate:'Day '+fmt(day,0)+'<br>Return %{y:.1f}%<br>Density %{z:.4f}<extra>TIME SLICE</extra>'};
   });
   const threshold={type:'scatter3d',mode:'lines',name:'Loss threshold',x:times,y:times.map(()=>-state.threshold*100),
      z:times.map(()=>maxDensity*.012),line:{color:'#ff5269',dash:'dash',width:4},
      hovertemplate:'Loss threshold: %{y:.0f}%<extra></extra>',showlegend:true};
   const guide=el('sampleOutput');
   if(guide)guide.textContent=n.toLocaleString('en-US')+' paths • '+indices.length+' time slices • seeded / reproducible';
   updateSnapshots();
   const clipped=axisLocked&&(percentile(state.term,lowZ)<frame.y[0]||percentile(state.term,highZ)>frame.y[1]||maxDensity>frame.z[1]);
   const notice=el('axisNotice');
   if(notice)notice.textContent=clipped?'LOCKED VIEW: Some values exceed this scale; use Auto-fit to inspect them.':axisLocked?'FIXED COMPARISON SCALE: axis limits remain stable while parameters change.':'AUTO-FIT: axes resize to include the latest distribution.';
   const axis={color:'#9ab5ca',gridcolor:'rgba(115,161,195,.27)',zerolinecolor:'#6bf4c4',showbackground:true,backgroundcolor:'#0c1b2a',
      tickfont:{size:10,color:'#a3c0d8'},titlefont:{size:11,color:'#bdd7ec'}};
   const layout={paper_bgcolor:'#091523',plot_bgcolor:'#091523',font:{family:'Consolas,monospace',color:'#cbdef0',size:11},
      margin:{l:0,r:0,t:0,b:0},showlegend:true,
      legend:{orientation:'h',x:.50,xanchor:'center',y:.012,yanchor:'bottom',font:{size:9,color:'#d3e3f4'},bgcolor:'rgba(8,19,34,.8)'},
      scene:{xaxis:{...axis,title:'TIME / TRADING DAYS',range:[0,state.term]},yaxis:{...axis,title:'CUMULATIVE RETURN / %',range:axisLocked?frame.y:[minReturn,maxReturn]},
         zaxis:{...axis,title:'DENSITY / 1% RETURN',range:axisLocked?frame.z:[0,maxDensity*1.22]},
         aspectmode:'manual',aspectratio:{x:1.7,y:1.20,z:1.05},camera,dragmode:'orbit'},
      uirevision:'quant-density-v2',autosize:true};
   return {data:[surface,...bandLines,...ridges,threshold],layout};
 }
 async function render(){
   if(inFlight){queued=true;return}
   inFlight=true;
   try{
     do{
       queued=false;
       const {data,layout}=makeFigure();
       if(rendered)await window.Plotly.react(node,data,layout,{displaylogo:false,responsive:true,scrollZoom:true});
       else {await window.Plotly.newPlot(node,data,layout,{displaylogo:false,responsive:true,scrollZoom:true});rendered=true}
     }while(queued);
   }catch(error){node.textContent='WebGL chart rendering failed: '+error.message;rendered=false}
   finally{inFlight=false}
 }
 state.draw=()=>{clearTimeout(redrawTimer);redrawTimer=setTimeout(render,100)};
 state.reframe=()=>{frame=null;state.draw()};
 const scaleButton=el('scaleMode');
 if(scaleButton)scaleButton.addEventListener('click',()=>{
   axisLocked=!axisLocked;
   scaleButton.textContent=axisLocked?'SCALE: LOCKED ↔':'SCALE: AUTO-FIT ⤢';
   state.draw();
 });
 const turn=el('rotateScene');
 if(turn)turn.addEventListener('click',()=>{
   orbitStep+=.55;
   camera={eye:{x:2.5*Math.cos(orbitStep),y:2.5*Math.sin(orbitStep),z:1.5},center:{x:0,y:0,z:0}};
   if(rendered)window.Plotly.relayout(node,{'scene.camera':camera});
 });
 render();
 if(node.on)node.on('plotly_relayout',event=>{if(event['scene.camera'])camera=event['scene.camera']});
}
function onSliders(){
 [['volControl','volOut',v=>v/100,'vol'],['driftControl','driftOut',v=>v/100,'drift'],['termControl','termOut',v=>v,'term'],['thresholdControl','thresholdOut',v=>v/100,'threshold']].forEach(([id,out,parse,field])=>{
  el(id).addEventListener('input',()=>{const raw=Number(el(id).value);state[field]=parse(raw);state.modified=state.live;el(out).textContent=(field==='term'?raw+' trading days':raw+'%');pathData();state.draw?.()});
 });
 el('resetScenario').addEventListener('click',()=>{state.drift=.065;state.vol=.21;state.term=126;state.threshold=.10;state.live=false;state.modified=false;state.source='ILLUSTRATIVE';
  [['volControl',21],['driftControl',6.5],['termControl',126],['thresholdControl',10]].forEach(([id,v])=>{el(id).value=String(v);el(id).dispatchEvent(new Event('input'))});
  state.reframe?.();
  setMessage('Scenario reset to educational assumptions. These are not live S&P 500 estimates.','info');
 });
 
}

function renderValidation(result){
 const b=result?.backtest,r=result?.historical_risk,chart=el('backtestChart');
 const ids=['btWindows','btEvents','btBrier','btBaseline','histVar','histEs','histDd','histN'];
 if(!b||!r||!Array.isArray(b.windows)||!b.windows.length){
   ids.forEach(id=>{if(el(id))el(id).textContent='—'});
   el('validationStatus').textContent='NO VERIFIED BACKTEST';
   el('walkforwardStatus').textContent='DATA UNAVAILABLE';
   el('walkforwardStatus').className='q-red';
   el('calibrationStatus').textContent='NOT VALIDATED';
   el('backtestConclusion').textContent='Forecast backtesting requires a successful authenticated market-data computation.';
   if(chart&&window.Plotly&&chart._fullLayout)window.Plotly.purge(chart);
   return;
 }
 const dec=(v,d=4)=>Number.isFinite(v)?Number(v).toFixed(d):'—';
 el('btWindows').textContent=String(b.forecasts);
 el('btEvents').textContent=String(b.events)+' / '+b.forecasts;
 el('btBrier').textContent=dec(b.brier_model);
 el('btBaseline').textContent=dec(b.brier_baseline);
 el('histVar').textContent=dec(r.var_95_1d_pct,2)+'%';
 el('histEs').textContent=dec(r.expected_shortfall_95_1d_pct,2)+'%';
 el('histDd').textContent=dec(r.max_drawdown_pct,2)+'%';
 el('histN').textContent=String(r.observations);
 el('validationStatus').textContent='OUT-OF-SAMPLE SCORED';
 el('walkforwardStatus').textContent='SCORED / LIMITED SAMPLE';
 el('walkforwardStatus').className='q-amber';
 el('calibrationStatus').textContent='SCORED / NOT YET VALIDATED';
 const edge=(b.brier_baseline-b.brier_model);
 const verdict=edge>0?'lower':edge<0?'higher':'equal';
 const verdictText=verdict==='lower'?'lower (better)':verdict==='higher'?'higher (worse)':'equal';
 el('backtestConclusion').textContent='Model Brier score '+dec(b.brier_model)+' versus historical-frequency baseline '+dec(b.brier_baseline)+' — '+verdictText+' over '+b.forecasts+' non-overlapping windows ('+b.events+' observed declines). This is an initial retrospective test, not evidence of a reliable trading edge. Overlapping training windows, small test count, and regime changes limit inference. Model fitting uses no prices later than each forecast date.';
 el('backtestConclusion').dataset.type='info';
 if(!chart||!window.Plotly)return;
 const x=b.windows.map(w=>w.forecast_date),a=b.windows.map(w=>w.predicted_pct),baseline=b.windows.map(w=>w.baseline_pct),observed=b.windows.map(w=>w.realized);
 const scale=Math.min(100,Math.max(15,Math.ceil(Math.max(...a,...baseline)*1.15/5)*5));
 const traces=[
 {type:'scatter',mode:'lines+markers',name:'MODEL PROBABILITY',x,y:a,line:{color:'#6bf4c4',width:2.5},marker:{size:6},hovertemplate:'Forecast: %{x}<br>Model: %{y:.2f}%<extra></extra>'},
 {type:'scatter',mode:'lines',name:'HISTORICAL BENCHMARK',x,y:baseline,line:{color:'#79b7ff',width:2,dash:'dot'},hovertemplate:'Forecast: %{x}<br>Benchmark: %{y:.2f}%<extra></extra>'},
 {type:'scatter',mode:'markers',name:'REALIZED 5%+ DROP',x,y:observed,marker:{size:9,symbol:observed.map(v=>v?'diamond':'circle-open'),color:observed.map(v=>v?'#ff7085':'#728aa5')},yaxis:'y2',hovertemplate:'Forecast: %{x}<br>Outcome: %{y} (1 = drop)<extra></extra>'}
 ];
 const layout={paper_bgcolor:'#0a1827',plot_bgcolor:'#0a1827',height:315,margin:{l:64,r:45,b:68,t:22},
 font:{family:'Consolas,monospace',size:10,color:'#b5cede'},
 xaxis:{title:'Historical forecast origin (trading date)',type:'date',gridcolor:'#24394e',tickfont:{size:10}},
 yaxis:{title:'Predicted event probability (%)',range:[0,scale],gridcolor:'#24394e',zeroline:false},
 yaxis2:{title:'Observed event',overlaying:'y',side:'right',range:[-.08,1.3],tickvals:[0,1],ticktext:['No','Yes'],showgrid:false},
 legend:{orientation:'h',y:-.32,x:0,font:{size:9}},margin:{l:61,r:50,b:74,t:15},showlegend:true,hovermode:'x unified',uirevision:'quant-walkforward-v1'};
 try{window.Plotly.react(chart,traces,layout,{responsive:true,displaylogo:false,scrollZoom:false}).catch(()=>{el('validationStatus').textContent='BACKTEST READY / CHART UNAVAILABLE'})}
 catch(e){el('validationStatus').textContent='BACKTEST READY / CHART UNAVAILABLE'}
}

function authenticate(){
 return new Promise(async resolve=>{
  const client=await window.PersonalHubAuth.init();
  const {data:{user}}=await client.auth.getUser();
  const login=el('crewLogin');
  const entry=async()=>{const {data:check,error}=await client.rpc('lp_quant_status');if(error)throw error;
   if(!check?.builder){el('denied').hidden=false;el('workspace').hidden=true;login.hidden=true;resolve(null);return}
   login.hidden=true;el('denied').hidden=true;el('workspace').hidden=false;resolve(client);
  };
  if(user){try{await entry()}catch(e){setMessage('Access check failed: '+e.message,'error');resolve(null)}return}
  el('loading').hidden=true;login.hidden=false;
  el('crewForm').addEventListener('submit',async e=>{
   e.preventDefault();const b=el('crewSubmit');b.disabled=true;el('crewError').textContent='Authenticating…';
   try{
    const {error}=await client.auth.signInWithPassword({email:el('crewEmail').value.trim(),password:el('crewPassword').value});if(error)throw error;
    el('crewPassword').value='';await entry();
   }catch(error){el('crewError').textContent=error.message}finally{b.disabled=false}
  });
 });
}
async function requestForecast(client){
 const btn=el('runForecast');btn.disabled=true;setMessage('Connecting to authenticated Quant compute service…');
 el('pipelineStatus').textContent='REQUESTING';
 try{
  const {data:{session}}=await client.auth.getSession();if(!session)throw Error('Builder session expired');
  const response=await fetch(window.RH_SUPABASE_URL+'/functions/v1/ledgerpeer-quant-forecast',{method:'POST',
    headers:{Authorization:'Bearer '+session.access_token,apikey:window.RH_SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:'{}'});
  const raw=await response.text();let result;try{result=JSON.parse(raw)}catch{throw Error('Forecast service returned a non-JSON response (HTTP '+response.status+'). Check Edge Function deployment.')}if(!response.ok)throw Error((result.error||'Computation service failed')+(Array.isArray(result.diagnostics)?' — '+result.diagnostics.join(' | '):''));
  if(!Number.isFinite(result.annual_volatility)||!Number.isFinite(result.annual_drift)||!Number.isFinite(result.market_level))throw Error('Malformed quantitative result');
  state.live=true;state.modified=false;state.level=result.market_level;state.vol=Math.max(.01,Math.min(.8,result.annual_volatility));state.drift=Math.max(-.8,Math.min(.8,result.annual_drift));
  state.source=result.source_name||'Unknown data provider';state.date=result.sample_end;
  el('volControl').value=state.vol*100;el('driftControl').value=state.drift*100;
  el('volOut').textContent=fmt(state.vol*100,1)+'%';el('driftOut').textContent=fmt(state.drift*100,1)+'%';
  el('pipelineStatus').textContent='CALCULATED';el('obsValue').textContent=result.observations??'—';
  el('asofValue').textContent=result.sample_end||'—';el('sourceValue').textContent=state.source;
  pathData();state.reframe?.();renderValidation(result);
  el('marketExplanation').textContent='MARKET DATA CONNECTED — '+result.observations+' historical S&P 500 closing prices, through '+result.sample_end+'. The three-dimensional terrain shows simulated probability densities calibrated from historical estimates, not observed future prices or guaranteed forecasts.';
  setMessage('Forecast computed from '+result.observations+' price observations. Scenario controls allow sensitivity analysis; changing them does not retrieve new data. Model: '+result.model_version+'.','ok');
 }catch(error){
  el('pipelineStatus').textContent='DATA FAILURE';el('sourceValue').textContent='No verified feed';
  state.live=false;state.source='ILLUSTRATIVE';state.date=null;state.level=100;state.vol=.21;state.drift=.065;
  el('obsValue').textContent='—';el('asofValue').textContent='—';
  el('volControl').value='21';el('driftControl').value='6.5';el('volOut').textContent='21%';el('driftOut').textContent='6.5%';
  pathData();state.reframe?.();renderValidation(null);
  el('marketExplanation').textContent='Current market calibration unavailable. The three-dimensional density terrain shows educational simulations, not observed S&P 500 prices.';
  setMessage('MARKET-DATA PIPELINE FAILURE: '+error.message+'\nThe 3D simulation remains available using clearly labelled educational assumptions. No live probability is being claimed.','error');
 }finally{btn.disabled=false}
}
window.addEventListener('DOMContentLoaded',async()=>{
 try{
  if(!window.PersonalHubAuth)throw Error('LedgerPeer authentication unavailable');
  const client=await authenticate();el('loading').hidden=true;
  if(!client)return;
  onSliders();pathData();surfaceInit();
  el('runForecast').addEventListener('click',()=>requestForecast(client));
  await requestForecast(client);
 }catch(error){el('loading').textContent='Failed to start research cockpit: '+error.message;el('loading').hidden=false}
});
})();
