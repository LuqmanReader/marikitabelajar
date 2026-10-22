import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS"};
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
type Point={date:string;close:number};
function csv(data:string,label:string):Point[]{if(/^\s*</.test(data))throw Error(label+": HTML instead of CSV");const lines=data.trim().split(/\r?\n/);const cols=(lines.shift()||"").replace(/^\uFEFF/,"").split(",").map(s=>s.trim().toLowerCase());const d=cols.findIndex(s=>s==="date"||s==="observation_date"),c=cols.findIndex(s=>s==="close"||s==="sp500");if(d<0||c<0)throw Error(label+": invalid CSV columns");return lines.map(line=>{const row=line.split(",");return {date:row[d]?.trim()||"",close:Number(row[c])}})}
function validate(raw:Point[],label:string):Point[]{const clean=raw.filter(p=>/^\d{4}-\d{2}-\d{2}$/.test(p.date)&&Number.isFinite(p.close)&&p.close>0).sort((a,b)=>a.date.localeCompare(b.date));const unique=clean.filter((p,i)=>i===0||p.date!==clean[i-1].date);if(unique.length<252)throw Error(label+": insufficient observations");const latest=Date.parse(unique[unique.length-1].date+"T00:00:00Z");if(Date.now()-latest>14*86400000)throw Error(label+": stale observation");const recent=unique.slice(-756);for(let i=1;i<recent.length;i++)if(Math.abs(Math.log(recent[i].close/recent[i-1].close))>.35)throw Error(label+": implausible daily change");return recent}
function fredTable(body:string):Point[]{if(/^\s*</.test(body))throw Error("FRED table returned HTML");const out:Point[]=[];for(const line of body.split(/\r?\n/)){const m=line.match(/^\s*(\d{4}-\d{2}-\d{2})\s+([\d.]+)\s*$/);if(m&&m[2]!==".")out.push({date:m[1],close:Number(m[2])})}return out}
async function get(url:string){const c=new AbortController(),timer=setTimeout(()=>c.abort(),9000);try{const r=await fetch(url,{signal:c.signal,headers:{"Accept":"text/csv,text/plain,application/json"}});if(!r.ok)throw Error("HTTP "+r.status);return await r.text()}finally{clearTimeout(timer)}}
async function load():Promise<{points:Point[];source:string;diagnostics:string[]}>{const diagnostics:string[]=[];
// Prefer the validated GitHub Actions snapshot. This avoids scraping blocked providers on every page view.
try{const raw=await get("https://raw.githubusercontent.com/LuqmanReader/marikitabelajar/main/data/quant-sp500.json");const snapshot=JSON.parse(raw);if(!Array.isArray(snapshot.points)||typeof snapshot.source_name!=="string")throw Error("invalid snapshot format");return {points:validate(snapshot.points,"GitHub verified snapshot"),source:snapshot.source_name+" (hourly-checked cache)",diagnostics}}catch(e){diagnostics.push("Verified cache: "+(e instanceof Error?e.message:"unavailable"))}
const sources=[
{name:"FRED SP500",read:async()=>csv(await get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500"),"FRED")},
{name:"FRED plain-text table",read:async()=>fredTable(await get("https://fred.stlouisfed.org/data/SP500.txt"))},
{name:"Stooq ^SPX",read:async()=>csv(await get("https://stooq.com/q/d/l/?s=%5Espx&i=d"),"Stooq")},
{name:"Yahoo Finance ^GSPC",read:async()=>{const end=Math.floor(Date.now()/1000),start=end-4*366*86400;const raw=await get("https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1="+start+"&period2="+end+"&interval=1d");if(/^\s*</.test(raw))throw Error("HTML response");const q=JSON.parse(raw).chart?.result?.[0];const times=q?.timestamp,closes=q?.indicators?.quote?.[0]?.close;if(!Array.isArray(times)||!Array.isArray(closes))throw Error("missing quote series");return times.map((t:number,i:number)=>({date:new Date(t*1000).toISOString().slice(0,10),close:Number(closes[i])}))}}
];for(const s of sources){try{return {points:validate(await s.read(),s.name),source:s.name,diagnostics}}catch(e){diagnostics.push(s.name+": "+(e instanceof Error?e.message:"unavailable"))}}throw Error(diagnostics.join(" | ")) }
function normalCdf(z){const t=1/(1+0.2316419*Math.abs(z));const d=0.3989422804*Math.exp(-z*z/2);const p=1-d*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return Math.min(1,Math.max(0,z>=0?p:1-p))}
function analyzeResearch(points:Point[]){
 const train=252,horizon=21,threshold=0.05,returns=points.slice(1).map((p,i)=>Math.log(p.close/points[i].close));
 const windows=[];let score=0,baseScore=0,events=0;
 for(let t=train;t+horizon<points.length;t+=horizon){
  const sample=returns.slice(t-train,t);
  const mean=sample.reduce((a,b)=>a+b,0)/sample.length;
  const variance=sample.reduce((a,b)=>a+(b-mean)**2,0)/(sample.length-1);
  const stdev=Math.max(1e-9,Math.sqrt(variance));
  const probability=normalCdf((Math.log(1-threshold)-mean*horizon)/(stdev*Math.sqrt(horizon)));
  let baselineEvents=0,baselineWindows=0;
  for(let i=t-train;i+horizon<=t;i++){baselineWindows++;if(points[i+horizon].close/points[i].close<=1-threshold)baselineEvents++}
  const benchmark=(baselineEvents+1)/(baselineWindows+2);
  const event=Number(points[t+horizon].close/points[t].close<=1-threshold);
  events+=event;score+=(probability-event)**2;baseScore+=(benchmark-event)**2;
  windows.push({forecast_date:points[t].date,outcome_date:points[t+horizon].date,predicted_pct:100*probability,baseline_pct:100*benchmark,realized:event});
 }
 const losses=returns.map(x=>100*(1-Math.exp(x))).sort((a,b)=>b-a);
 const n=Math.max(1,Math.ceil(losses.length*0.05));
 const var95=losses[n-1],es95=losses.slice(0,n).reduce((a,b)=>a+b,0)/n;
 let peak=points[0].close,maxDrawdown=0;
 for(const p of points){peak=Math.max(peak,p.close);maxDrawdown=Math.max(maxDrawdown,(peak-p.close)/peak*100)}
 const brier=windows.length?score/windows.length:null,baselineBrier=windows.length?baseScore/windows.length:null;
 return {backtest:{horizon_days:horizon,threshold_pct:5,training_returns:train,step_days:horizon,forecasts:windows.length,events,brier_model:brier,brier_baseline:baselineBrier,skill:baselineBrier>0?1-brier/baselineBrier:null,windows},historical_risk:{var_95_1d_pct:Math.max(0,var95),expected_shortfall_95_1d_pct:Math.max(0,es95),max_drawdown_pct:maxDrawdown,observations:returns.length}};
}
Deno.serve(async req=>{if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});if(req.method!=="POST")return reply({error:"Method not allowed"},405);try{const token=req.headers.get("Authorization")?.replace(/^Bearer\s+/i,"");if(!token)return reply({error:"Authentication required"},401);const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_ANON_KEY")||Deno.env.get("SUPABASE_PUBLISHABLE_KEY");if(!url||!key)throw Error("Supabase configuration missing");const client=createClient(url,key,{global:{headers:{Authorization:"Bearer "+token}},auth:{persistSession:false}});const {data:user,error:authErr}=await client.auth.getUser(token);if(authErr||!user.user)return reply({error:"Invalid session"},401);const {data:access,error:accessErr}=await client.rpc("lp_quant_status");if(accessErr)throw Error("Builder authorization unavailable");if(access?.builder!==true)return reply({error:"Builder access required"},403);const {points,source}=await load();const returns=points.slice(1).map((p,i)=>Math.log(p.close/points[i].close));const mean=returns.reduce((a,b)=>a+b,0)/returns.length;const variance=returns.reduce((a,b)=>a+(b-mean)**2,0)/(returns.length-1);return reply({...analyzeResearch(points),source_name:source,observations:points.length,sample_start:points[0].date,sample_end:points[points.length-1].date,market_level:points[points.length-1].close,annual_drift:mean*252,annual_volatility:Math.sqrt(variance*252),model_version:"historical-log-return-backtest-v2",data_status:"verified_historical",note:"Historical calibration, not live trading advice"})}catch(e){return reply({error:e instanceof Error?e.message:"Forecast computation failed"},503)}});