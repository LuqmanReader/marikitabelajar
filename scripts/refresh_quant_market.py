#!/usr/bin/env python3
"""Hourly QUANT historical-close snapshot. Only writes validated market data."""
import csv, io, json, math, pathlib, urllib.request, datetime
OUT=pathlib.Path("data/quant-sp500.json")
SOURCES=[
 ("FRED SP500","https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500"),
 ("Stooq ^SPX","https://stooq.com/q/d/l/?s=%5Espx&i=d"),
 ("Stooq PL ^SPX","https://stooq.pl/q/d/l/?s=%5Espx&i=d"),
]
def parse_csv(body):
 if body.lstrip().startswith("<"): raise ValueError("HTML instead of CSV")
 reader=csv.DictReader(io.StringIO(body))
 fields={k.lower():k for k in (reader.fieldnames or [])}
 date_column=fields.get("date") or fields.get("observation_date")
 if not date_column: raise ValueError("missing Date/observation_date column")
 value=fields.get("close") or fields.get("sp500")
 if not value: raise ValueError("missing Close/SP500 column")
 return [{"date":r[date_column],"close":float(r[value])} for r in reader if r.get(value) and r[value] not in (".","null")]
def validate(points):
 points=sorted({p["date"]:p for p in points if math.isfinite(p["close"]) and p["close"]>0}.values(),key=lambda p:p["date"])
 if len(points)<252: raise ValueError("fewer than 252 observations")
 if (datetime.date.today()-datetime.date.fromisoformat(points[-1]["date"])).days>14: raise ValueError("latest close older than 14 days")
 for a,b in zip(points[-757:-1],points[-756:]):
  if abs(math.log(b["close"]/a["close"]))>.35: raise ValueError("implausible price jump")
 return points[-756:]
errors=[]
for name,url in SOURCES:
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 LedgerPeer-educational-data-cache","Accept":"text/csv"})
  with urllib.request.urlopen(req,timeout=18) as r: body=r.read().decode("utf-8-sig")
  points=validate(parse_csv(body))
  OUT.parent.mkdir(parents=True,exist_ok=True)
  OUT.write_text(json.dumps({"source_name":name,"retrieved_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"points":points},separators=(",",":"))+"\n")
  print("Verified",name,len(points),points[-1]["date"])
  break
 except Exception as exc: errors.append(name+": "+str(exc))
else:
 print("No provider available; retaining prior verified snapshot:", " | ".join(errors))
 if not OUT.exists(): raise SystemExit("No verified cache exists yet")
