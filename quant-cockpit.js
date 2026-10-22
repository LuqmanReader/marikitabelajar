
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
 if(!window.Plotly){node.textContent='3D WebGL chart library could not load. Market forecasts and risk calculations remain available; check your connection and refresh.';return}
 let redrawTimer=null,inFlight=false,queued=false,rendered=false;
 let camera={eye:{x:1.8,y:-2.05,z:1.35},center:{x:0,y:0,z:0}};
 let orbitStep=-.85;
 const spectrum=[[0,'#102a40'],[.08,'#1e5180'],[.22,'#277bbd'],[.45,'#21c4d6'],[.67,'#8d92ff'],[.85,'#dc86fc'],[1,'#ffd27d']];
 const percentile=(t,z)=>(Math.exp(state.drift*t/252+z*state.vol*Math.sqrt(t/252))-1)*100;
 function makeFigure(){
   const paths=state.paths,steps=paths[0].log.length-1,lowLog=Math.min(-.12,state.drift*state.term/252-4*state.vol*Math.sqrt(state.term/252),Math.log(1-state.threshold)-.05);
   const highLog=Math.max(.12,state.drift*state.term/252+4*state.vol*Math.sqrt(state.term/252));
   const minReturn=Math.max(-99,(Math.exp(lowLog)-1)*100),maxReturn=(Math.exp(highLog)-1)*100;
   const rows=73,firstStep=Math.max(2,Math.ceil(steps*.065));
   const indices=Array.from({length:steps-firstStep+1},(_,i)=>i+firstStep);
   const times=indices.map(i=>i*state.term/steps);
   const returns=Array.from({length:rows},(_,i)=>minReturn+(maxReturn-minReturn)*i/(rows-1));
   const bin=(maxReturn-minReturn)/(rows-1),n=paths.length;
   const densities=indices.map(step=>{
      const histogram=new Float64Array(rows);
      for(const path of paths){
        const value=(Math.exp(path.log[step])-1)*100;
        const index=Math.floor((value-minReturn)/bin+.5);
        if(index>=0&&index<rows)histogram[index]++;
      }
      let smoothed=histogram;
      for(let pass=0;pass<3;pass++){
        const next=new Float64Array(rows);
        for(let j=0;j<rows;j++){
          let weight=0,sum=0;
          for(let k=-3;k<=3;k++){const q=j+k;if(q>=0&&q<rows){const w=[1,6,15,20,15,6,1][k+3];sum+=smoothed[q]*w;weight+=w}}
          next[j]=sum/weight;
        }
        smoothed=next;
      }
      return Array.from(smoothed,v=>v/(n*bin));
   });
   const z=returns.map((_,i)=>densities.map(d=>d[i]));
   const maxDensity=Math.max(...densities.flat());
   const heightAt=(t,value)=>{
      const idx=Math.min(densities.length-1,Math.max(0,Math.round(t/state.term*steps)-firstStep));
      const iy=Math.max(0,Math.min(rows-1,Math.round((value-minReturn)/bin)));
      return densities[idx][iy]+maxDensity*.03;
   };
   const main={type:'surface',x:times,y:returns,z,opacity:.94,showscale:false,
      colorscale:spectrum,lighting:{ambient:.56,diffuse:.91,specular:.32,roughness:.65,fresnel:.10},lightposition:{x:110,y:-95,z:170},
      contours:{z:{show:true,highlight:false,project:{z:true},color:'#42617c',width:1}},
      hovertemplate:'Time: %{x:.0f} trading days<br>Cumulative return: %{y:.1f}%<br>Density: %{z:.4f} per 1% return<extra>MONTE CARLO DENSITY</extra>',
      name:'Simulated distribution'};
   const bands=[{z:-1.6448536269,name:'5th percentile',color:'#ff8296'},{z:0,name:'Median',color:'#7dffda'},{z:1.6448536269,name:'95th percentile',color:'#ffd38b'}];
   const lines=bands.map(p=>{
     const values=times.map(t=>percentile(t,p.z));
     return {type:'scatter3d',mode:'lines',x:times,y:values,z:values.map((v,i)=>heightAt(times[i],v)),
        name:p.name,hovertemplate:p.name+'<br>Day %{x:.0f}<br>Return %{y:.1f}%<extra></extra>',
        line:{color:p.color,width:p.z===0?8:5},showlegend:true};
   });
   const thresholdReturn=-state.threshold*100;
   const threshold={type:'scatter3d',mode:'lines',name:'Loss threshold',
      x:times,y:times.map(()=>thresholdReturn),z:times.map(()=>maxDensity*.015),
      line:{color:'#ff566f',dash:'dash',width:4},hovertemplate:'Loss threshold: %{y:.0f}%<extra></extra>',showlegend:true};
   const guide=el('sampleOutput');if(guide)guide.textContent=n.toLocaleString('en-US')+' simulations • '+indices.length+' density slices • seeded / reproducible';
   const axis={color:'#9ab5ca',gridcolor:'rgba(115,161,195,.21)',zerolinecolor:'#6bf4c4',showbackground:true,backgroundcolor:'#0c1b2a',
      tickfont:{size:10,color:'#a3c0d8'},titlefont:{size:11,color:'#bdd7ec'}};
   const layout={paper_bgcolor:'#091523',plot_bgcolor:'#091523',font:{family:'Consolas,monospace',color:'#cbdef0',size:11},
      margin:{l:0,r:0,t:0,b:0},showlegend:true,
      legend:{orientation:'h',x:.5,xanchor:'center',y:.015,yanchor:'bottom',font:{size:10,color:'#d3e3f4'},bgcolor:'rgba(8,19,34,.78)'},
      scene:{xaxis:{...axis,title:'TIME / TRADING DAYS',range:[0,state.term]},yaxis:{...axis,title:'CUMULATIVE RETURN / %',range:[minReturn,maxReturn]},
         zaxis:{...axis,title:'PROBABILITY DENSITY / 1% RETURN',range:[0,maxDensity*1.12]},
         aspectmode:'manual',aspectratio:{x:1.6,y:1.15,z:.95},camera,dragmode:'orbit'},
      uirevision:'quant-density-v1',autosize:true};
   return {data:[main,...lines,threshold],layout};
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
   }catch(error){node.textContent='WebGL density chart could not be rendered: '+error.message;rendered=false}
   finally{inFlight=false}
 }
 state.draw=()=>{clearTimeout(redrawTimer);redrawTimer=setTimeout(render,90)};
 const turn=el('rotateScene');
 if(turn)turn.addEventListener('click',()=>{
   orbitStep+=.55;
   camera={eye:{x:2.4*Math.cos(orbitStep),y:2.4*Math.sin(orbitStep),z:1.30},center:{x:0,y:0,z:0}};
   if(rendered)window.Plotly.relayout(node,{'scene.camera':camera});
 });
 node.on?.('plotly_relayout',event=>{
   if(event['scene.camera'])camera=event['scene.camera'];
 });
 render();
}
function onSliders(){
 [['volControl','volOut',v=>v/100,'vol'],['driftControl','driftOut',v=>v/100,'drift'],['termControl','termOut',v=>v,'term'],['thresholdControl','thresholdOut',v=>v/100,'threshold']].forEach(([id,out,parse,field])=>{
  el(id).addEventListener('input',()=>{const raw=Number(el(id).value);state[field]=parse(raw);state.modified=state.live;el(out).textContent=(field==='term'?raw+' trading days':raw+'%');pathData();state.draw?.()});
 });
 el('resetScenario').addEventListener('click',()=>{state.drift=.065;state.vol=.21;state.term=126;state.threshold=.10;state.live=false;state.modified=false;state.source='ILLUSTRATIVE';
  [['volControl',21],['driftControl',6.5],['termControl',126],['thresholdControl',10]].forEach(([id,v])=>{el(id).value=String(v);el(id).dispatchEvent(new Event('input'))});
  setMessage('Scenario reset to educational assumptions. These are not live S&P 500 estimates.','info');
 });
 el('rotateScene').addEventListener('click',()=>{state.orbit+=.45;state.draw?.()});
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
  pathData();state.draw?.();
  el('marketExplanation').textContent='MARKET DATA CONNECTED — '+result.observations+' historical S&P 500 closing prices, through '+result.sample_end+'. The 3D curves are simulated possible futures using historical volatility and return estimates; they are not observed future prices or guaranteed forecasts.';
  setMessage('Forecast computed from '+result.observations+' price observations. Scenario controls allow sensitivity analysis; changing them does not retrieve new data. Model: '+result.model_version+'.','ok');
 }catch(error){
  el('pipelineStatus').textContent='DATA FAILURE';el('sourceValue').textContent='No verified feed';
  state.live=false;state.source='ILLUSTRATIVE';state.date=null;state.level=100;state.vol=.21;state.drift=.065;
  el('obsValue').textContent='—';el('asofValue').textContent='—';
  el('volControl').value='21';el('driftControl').value='6.5';el('volOut').textContent='21%';el('driftOut').textContent='6.5%';
  pathData();state.draw?.();
  el('marketExplanation').textContent='Current market calibration unavailable. The 3D paths shown here are educational simulations, not observed S&P 500 prices.';
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
