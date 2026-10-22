#!/usr/bin/env python3
"""Hourly QUANT historical-close snapshot. Only writes validated market data."""
import csv, io, json, math, pathlib, urllib.request, urllib.error, datetime, time
OUT=pathlib.Path("data/quant-sp500.json")
SOURCES=[
 ("FRED SP500","https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500"),
 ("FRED download","https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500&cosd=2022-01-01"),
 ("FRED table data","https://fred.stlouisfed.org/data/SP500.txt"),
 ("Stooq ^SPX","https://stooq.com/q/d/l/?s=%5Espx&i=d"),
 ("Stooq PL ^SPX","https://stooq.pl/q/d/l/?s=%5Espx&i=d"),
]
def parse_fred_table(body):
 import re
 points=[]
 for line in body.splitlines():
  match=re.match(r"^\\s*(\\d{4}-\\d{2}-\\d{2})\\s+([\\d.]+)\\s*$",line)
  if match and match.group(2)!=".": points.append({"date":match.group(1),"close":float(match.group(2))})
 return points

def parse_csv(body):
 if body.lstrip().startswith("<"): raise ValueError("provider returned HTML, not price data")
 reader=csv.DictReader(io.StringIO(body))
 fields={k.strip().lower():k for k in (reader.fieldnames or [])}
 date_column=fields.get("date") or fields.get("observation_date")
 if not date_column: raise ValueError("missing Date/observation_date column")
 value=fields.get("close") or fields.get("sp500")
 if not value: raise ValueError("missing Close/SP500 column")
 points=[]
 for r in reader:
  raw=(r.get(value) or "").strip()
  if raw in ("",".","null","N/A"): continue
  try: points.append({"date":r[date_column].strip(),"close":float(raw)})
  except (ValueError,TypeError,AttributeError): continue
 return points
def validate(points):
 points=sorted({p["date"]:p for p in points if math.isfinite(p["close"]) and p["close"]>0}.values(),key=lambda p:p["date"])
 if len(points)<252: raise ValueError("fewer than 252 observations")
 if (datetime.date.today()-datetime.date.fromisoformat(points[-1]["date"])).days>14: raise ValueError("latest close older than 14 days")
 for a,b in zip(points[-757:-1],points[-756:]):
  if abs(math.log(b["close"]/a["close"]))>.35: raise ValueError("implausible price jump")
 return points[-756:]
def parse_yahoo(body):
 if body.lstrip().startswith("<"): raise ValueError("provider returned HTML")
 chart=json.loads(body).get("chart",{})
 results=chart.get("result") or []
 if not results: raise ValueError("missing Yahoo chart results")
 item=results[0]
 times=item.get("timestamp") or []
 closes=((item.get("indicators") or {}).get("quote") or [{}])[0].get("close") or []
 return [{"date":datetime.datetime.fromtimestamp(t,datetime.timezone.utc).date().isoformat(),"close":float(v)} for t,v in zip(times,closes) if v is not None]

def download(url):
 req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; LedgerPeerMarketData/1.0)","Accept":"text/csv,application/json,text/plain"})
 with urllib.request.urlopen(req,timeout=18) as response:
  content_type=response.headers.get("Content-Type","").lower()
  body=response.read(2_000_000).decode("utf-8-sig")
  if "text/html" in content_type or body.lstrip().lower().startswith(("<!doctype html","<html")):
   raise ValueError("HTML error/maintenance page received; no prices to convert")
  return body

now=int(time.time())
SOURCES.append(("Yahoo chart JSON","https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1="+str(now-4*366*86400)+"&period2="+str(now)+"&interval=1d"))
errors=[]
for name,url in SOURCES:
 try:
  body=download(url)
  points=validate(parse_yahoo(body) if name=="Yahoo chart JSON" else parse_fred_table(body) if name=="FRED table data" else parse_csv(body))
  OUT.parent.mkdir(parents=True,exist_ok=True)
  OUT.write_text(json.dumps({"source_name":name,"retrieved_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"points":points},separators=(",",":"))+"\n")
  print("Verified",name,len(points),points[-1]["date"])
  break
 except Exception as exc: errors.append(name+": "+str(exc))
else:
 print("No provider available; retaining prior verified snapshot:", " | ".join(errors))
 if not OUT.exists(): raise SystemExit("No verified cache exists yet")
