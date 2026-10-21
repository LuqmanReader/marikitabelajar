
(()=>{'use strict';
const el=id=>document.getElementById(id);
const fmt=(x,d=1)=>Number.isFinite(x)?x.toFixed(d):'—';
const norm=x=>{const t=1/(1+.2316419*Math.abs(x)),d=.3989422804*Math.exp(-x*x/2);const p=1-d*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x>=0?p:1-p};
const state={level:100,drift:.065,vol:.21,term:126,threshold:.10,live:false,source:'ILLUSTRATIVE',date:null,sample:0,orbit:.57,pitch:.48,paths:[],selected:0,animated:true,seed:9911};
function rand(seed){let n=seed>>>0;return ()=>((n=Math.imul(1664525,n)+1013904223>>>0)/4294967296)}
function gaussian(random){return Math.sqrt(-2*Math.log(Math.max(random(),1e-8)))*Math.cos(2*Math.PI*random())}
function setMessage(message,type='info'){const box=el('modelMessage');if(box){box.textContent=message;box.dataset.type=type}}
function pathData(){
 const n=100, horizon=state.term,dt=horizon/252, drift=state.drift;
 const random=rand(state.seed);const paths=[];let negative=0;
 for(let p=0;p<n;p++){
   const arr=[0];let log=0;
   for(let t=1;t<=126;t++){log+=drift*dt/126+state.vol*Math.sqrt(dt/126)*gaussian(random);arr.push(log)}
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
 el('sampleOutput').textContent='Monte Carlo visualisation: '+n+' paths • '+negative+' negative outcomes in this seeded draw';
 el('formulaText').textContent='Φ[(ln('+(1-state.threshold).toFixed(2)+') − μ·T) / (σ√T)] = '+fmt(analytic*100,2)+'%';
 el('dataMode').textContent=state.live?'CALIBRATED FROM OBSERVATIONS':'ILLUSTRATIVE / NOT MARKET CALIBRATED';
 el('dataMode').style.color=state.live?'#6bf4c4':'#ffca66';
 el('activeSource').textContent=state.live?state.source+' · '+state.date:'Educational assumptions only';
}
function canvasInit(){
 const canvas=el('quantCanvas'),ctx=canvas.getContext('2d');if(!ctx)return;
 let dragging=false,prevX=0,prevY=0;
 canvas.addEventListener('pointerdown',e=>{dragging=true;prevX=e.clientX;prevY=e.clientY;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointerup',()=>dragging=false);
 canvas.addEventListener('pointercancel',()=>dragging=false);
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;state.orbit+=(e.clientX-prevX)*.007;state.pitch=Math.min(1.15,Math.max(.18,state.pitch+(e.clientY-prevY)*.004));prevX=e.clientX;prevY=e.clientY;draw()});
 const resize=()=>{const rect=canvas.getBoundingClientRect();const scale=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(rect.width*scale);canvas.height=Math.round(rect.height*scale);ctx.setTransform(scale,0,0,scale,0,0);draw()};
 if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);
 function project(t,v,lane,w,h){
  // Perspective projection of genuine 3D coordinates: time axis, log-return axis and path-spread axis.
  const x=(t/126-.5)*7.0,y=v*5.0,z=lane*3.2;const a=state.orbit,c=Math.cos(a),s=Math.sin(a);
  const xr=x*c-z*s,zr=x*s+z*c;const cp=Math.cos(state.pitch),sp=Math.sin(state.pitch);
  const yr=y*cp-zr*sp, depth=y*sp+zr*cp;
  const perspective=13/(13+depth*.55);
  return [w*.49+xr*perspective*Math.min(w/9.8,70),h*.56-yr*perspective*Math.min(h/4.3,95),perspective];
 }
 function draw(){
  const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
  ctx.clearRect(0,0,w,h);
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#11283a');bg.addColorStop(1,'#081322');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  // floor grid
  for(let t=0;t<=126;t+=14)for(let axis=0;axis<1;axis++){
   const a=project(t,-.46,-1.5,w,h),b=project(t,-.46,1.5,w,h);
   ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle='rgba(112,173,201,.17)';ctx.lineWidth=1;ctx.stroke();
  }
  for(let lane=-1.5;lane<=1.5;lane+=.3){const a=project(0,-.46,lane,w,h),b=project(126,-.46,lane,w,h);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle='rgba(112,173,201,.13)';ctx.stroke()}
  // reference zero path and threshold
  for(const [y,color] of [[0,'rgba(107,244,196,.47)'],[Math.log(1-state.threshold),'rgba(255,112,133,.62)']]){
   const a=project(0,y,-1.45,w,h),b=project(126,y,-1.45,w,h);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=color;ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);
  }
  for(let i=0;i<state.paths.length;i++){
    const p=state.paths[i],lane=(i/99-.5)*1.75;ctx.beginPath();
    for(let t=0;t<=126;t+=2){const xy=project(t,p.log[t],lane,w,h);if(!t)ctx.moveTo(xy[0],xy[1]);else ctx.lineTo(xy[0],xy[1]);}
    ctx.strokeStyle=p.bad?'rgba(255,112,133,.39)':'rgba(100,208,248,.33)';ctx.lineWidth=p.bad?1.15:1;ctx.stroke();
  }
  const median=state.paths.map(x=>x.log[126]).sort((a,b)=>a-b)[50];
  const end=project(126,median,0,w,h);ctx.beginPath();ctx.arc(end[0],end[1],5,0,Math.PI*2);ctx.fillStyle='#6bf4c4';ctx.fill();
  ctx.fillStyle='#90b2c9';ctx.font='11px monospace';ctx.fillText('t = 0',14,h-19);ctx.fillText('HORIZON '+state.term+'D',Math.max(5,w-155),h-19);
 }
 state.draw=draw;resize();
}
function onSliders(){
 [['volControl','volOut',v=>v/100,'vol'],['driftControl','driftOut',v=>v/100,'drift'],['termControl','termOut',v=>v,'term'],['thresholdControl','thresholdOut',v=>v/100,'threshold']].forEach(([id,out,parse,field])=>{
  el(id).addEventListener('input',()=>{const raw=Number(el(id).value);state[field]=parse(raw);el(out).textContent=(field==='term'?raw+' trading days':raw+'%');pathData();state.draw?.()});
 });
 el('resetScenario').addEventListener('click',()=>{state.drift=.065;state.vol=.21;state.term=126;state.threshold=.10;state.live=false;state.source='ILLUSTRATIVE';
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
  const result=await response.json();if(!response.ok)throw Error((result.error||'Computation service failed')+(Array.isArray(result.diagnostics)?' — '+result.diagnostics.join(' | '):''));
  if(!Number.isFinite(result.annual_volatility)||!Number.isFinite(result.annual_drift)||!Number.isFinite(result.market_level))throw Error('Malformed quantitative result');
  state.live=true;state.level=result.market_level;state.vol=Math.max(.01,Math.min(.8,result.annual_volatility));state.drift=Math.max(-.8,Math.min(.8,result.annual_drift));
  state.source=result.source_name||'Unknown data provider';state.date=result.sample_end;
  el('volControl').value=state.vol*100;el('driftControl').value=state.drift*100;
  el('volOut').textContent=fmt(state.vol*100,1)+'%';el('driftOut').textContent=fmt(state.drift*100,1)+'%';
  el('pipelineStatus').textContent='CALCULATED';el('obsValue').textContent=result.observations??'—';
  el('asofValue').textContent=result.sample_end||'—';el('sourceValue').textContent=state.source;
  pathData();state.draw?.();
  setMessage('Forecast computed from '+result.observations+' price observations. Scenario controls allow sensitivity analysis; changing them does not retrieve new data. Model: '+result.model_version+'.','ok');
 }catch(error){
  el('pipelineStatus').textContent='DATA FAILURE';el('sourceValue').textContent='No verified feed';
  state.live=false;pathData();state.draw?.();
  setMessage('MARKET-DATA PIPELINE FAILURE: '+error.message+'\nThe 3D simulation remains available using clearly labelled educational assumptions. No live probability is being claimed.','error');
 }finally{btn.disabled=false}
}
window.addEventListener('DOMContentLoaded',async()=>{
 try{
  if(!window.PersonalHubAuth)throw Error('LedgerPeer authentication unavailable');
  const client=await authenticate();el('loading').hidden=true;
  if(!client)return;
  onSliders();pathData();canvasInit();
  el('runForecast').addEventListener('click',()=>requestForecast(client));
  await requestForecast(client);
 }catch(error){el('loading').textContent='Failed to start research cockpit: '+error.message;el('loading').hidden=false}
});
})();
