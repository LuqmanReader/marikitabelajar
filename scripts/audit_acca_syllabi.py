#!/usr/bin/env python3
"""Extract ACCA syllabus topic headings and official exam format evidence.

Only publish a paper when extraction meets structural checks. Nothing is inferred
from generic accounting topic knowledge. No official PDF or complete syllabus => failed.
"""
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import fitz
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "acca-online-syllabus-audit.json"
DATA_OUT = ROOT / "acca-online-syllabi.json"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; LedgerPeer-ACCA-Syllabus-Verify/1.0)"}
SESSION = requests.Session()
SESSION.headers.update(HEADERS)
PREFIX="https://www.accaglobal.com/gb/en/student/exam-support-resources/"
F=PREFIX+"foundation-level-study-resources/"
A=PREFIX+"fundamentals-exams-study-resources/"
P=PREFIX+"professional-exams-study-resources/"
PAGES={
"FA1":F+"fa1/fa1-syllabus-study-guide.html",
"MA1":F+"ma1/ma1-syllabus-study-guide.htm.html",
"FA2":F+"fa2/fa2-syllabus-study-guide.html",
"MA2":F+"ma2/ma2-syllabus-study-guide.html",
"FBT":A+"f1/syllabus-study-guide.html",
"FMA":F+"fma/fma-syllabus-study-guide.html",
"FFA":F+"ffa/ffa-syllabus-study-guide.html",
"FAU":F+"fau/fau-syllabus-study-guide.html",
"FFM":F+"ffm/ffm-syllabus-study-guide.html",
"FTX":F+"ftx/ftx-syllabus-study-guide.html",
"BT":A+"f1/syllabus-study-guide.html",
"MA":A+"f2/syllabus-study-guide.html",
"FA":A+"f3/syllabus-study-guide.html",
"LW":A+"f4/acca-f4-syllabus-study-guide/f4-syllabus-and-study-guide-malaysia-mys.html",
"PM":A+"f5/syllabus-study-guide.html",
"TX":A+"f6/syllabus-study-guide/f6-syllabus-study-guide-malaysia-mys.html",
"FR":A+"f7/syllabus-study-guide.html",
"AA":A+"f8/syllabus-study-guide.html",
"FM":A+"f9/syllabus-study-guide.html",
"SBL":P+"strategic-business-leader/syllabus-study-guide.html",
"SBR":P+"strategic-business-reporting/syllabus-and-study-guide.html",
"AFM":P+"p4/syllabus-study-guide.html",
"APM":P+"p5/syllabus-study-guide.html",
"ATX":P+"p6/syllabus-study-guide/p6-syllabus-and-study-guide-malaysia-mys.html",
"AAA":P+"p7/syllabus-study-guide/p7-international-int-syllabus-study-guide.html"
}
ALIASES={"BT":"FBT","MA":"FMA","FA":"FFA"}
VARIANTS={"LW":"MYS","TX":"MYS","ATX":"MYS","FTX":"UK","AAA":"INT","SBR":"INT"}
YEAR_RE=re.compile(r"(2026|2027|26[-_ ]?J27|S26|J27)",re.I)
PDF_RE=re.compile(r"\.pdf(?:$|\?)",re.I)
SYL_RE=re.compile(r"(?:syllabus|study.?guide)",re.I)

def get(url):
    response=SESSION.get(url,timeout=25)
    response.raise_for_status()
    return response

def pdf_links(url,code):
    html=get(url).text
    soup=BeautifulSoup(html,"html.parser")
    if code in ("FA1","PM"):
        for phrase in ("2026 to June 2027","September 2026","S26","syllabus and study guide"):
            at=html.lower().find(phrase.lower())
            print("HTML SAMPLE",code,phrase,html[max(0,at-280):at+400].replace("\n"," ")[:680] if at>=0 else "NOT PRESENT")
        print("HTML links matching ACCA",[(a.get("href","")[:130],a.get_text(" ",strip=True)[:90]) for a in soup.find_all("a",href=True) if "syllabus" in a.get_text(" ",strip=True).lower() or "studyguides" in a.get("href","").lower()][:8])
        for tag in soup.find_all(string=re.compile("September 2026|MA1 Management Information|Performance Management - syllabus",re.I))[:3]:
            print("DOWNLOAD MARKUP",code,re.sub(r"\s+"," ",str(tag.parent.parent))[:1900])
        for phrase in ('.pdf','/content/dam','rf-download-panel'):
            print("DOC LINK RAW",code,phrase,len(re.findall(re.escape(phrase),html,re.I)))
    choices=[]
    for a in soup.find_all("a",href=True):
        onclick=a.get("onclick","")
        inline=re.search(r"""window\.open\(\s*['"]([^'"]+\.pdf)['"]""",onclick,re.I)
        href=inline.group(1) if inline else a["href"]
        u=urljoin(url,href)
        if not PDF_RE.search(urlparse(u).path) or "accaglobal.com" not in (urlparse(u).hostname or "").lower():continue
        label=" ".join(a.stripped_strings)
        target=(label+" "+u).lower()
        if not SYL_RE.search(target) and "study" not in label.lower():continue
        score=int(bool(YEAR_RE.search(label)))*25+int(bool(re.search(r"2026|s26|j27",label,re.I)))*40
        score+=int(bool(re.search(r"2026|s26|j27",u,re.I)))*25
        score+=int(bool(re.search(r"2027|j27",label+" "+u,re.I)))*15
        if code in ("LW","TX","ATX"):
            score+=(70 if "mys" in target or "malaysia" in target else -150)
        if code=="FTX":
            score+=(70 if "uk" in target or "united kingdom" in target else -130)
        if code in ("AAA","SBR"):
            score+=(60 if "int" in target or "international" in target else -150)
        # prefer explicit syllabus and study guide over changes or specimen PDF
        if "changes" in target or "specimen" in target or "interactive" in target:score-=100
        choices.append((score,u,label))
    choices.sort(reverse=True)
    return choices[:12]

def extract_pages(pdf):
    doc=fitz.open(stream=pdf,filetype="pdf")
    page_list=[]
    for page in doc:
        blocks=page.get_text("blocks")
        left,right=[],[]
        middle=page.rect.width/2
        for block in blocks:
            if len(block)<7 or block[6]!=0:continue
            x0,y0,x1,y1,txt,*rest=block
            if not str(txt).strip():continue
            # Preserve the two-column reading order. The normal PDF sort interleaves
            # financial syllabus headings from columns on the same Y coordinate.
            if x0<middle:left.append((y0,x0,str(txt)))
            else:right.append((y0,x0,str(txt)))
        left.sort(key=lambda b:(round(b[0]/3),b[1]))
        right.sort(key=lambda b:(round(b[0]/3),b[1]))
        page_list.append("\n".join(t for _,_,t in left)+"\n"+"\n".join(t for _,_,t in right))
    return page_list

def find_syllabus(pages):
    # Inspect body pages only; page 2's table of contents advertises the syllabus
    # without containing any of its actual official topic entries.
    for i,doc_text in enumerate(pages):
        if i<3:continue
        m=re.search(r"\b(?:4|5|6|7)\.\s+The\s+syllabus\b",doc_text,re.I)
        if not m:continue
        combined="\n".join(pages[i:i+3])
        start=re.search(r"\b(?:4|5|6|7)\.\s+The\s+syllabus\b",combined,re.I)
        if not start:continue
        tail=combined[start.end():]
        end=re.search(r"\b(?:5|6|7|8)\.\s+Detailed\s+study\s+guide\b",tail,re.I)
        if end:tail=tail[:end.start()]
        if len(re.findall(r"(?m)^\s*\d{1,2}\.\s+\S",tail))>=3:
            return tail
    raise ValueError("Could not isolate a complete syllabus section; manual verification required")

def extract_topics(syllabus):
    text=re.sub(r"\u00a0"," ",syllabus)
    lines=[re.sub(r"\s+"," ",x).strip() for x in text.splitlines()]
    topics=[]
    current=None
    seen=set()
    for i,line in enumerate(lines):
        if not line or line.startswith("© ACCA") or line.startswith("All rights reserved"):continue
        a=re.match(r"^([A-I])\s{1,}([A-Za-z][\w\s,()&/\-–]+)$",line)
        if a and not re.match(r"^\d",a.group(2)):
            current=a.group(1)
            continue
        if re.fullmatch(r"[A-I]",line):
            current=line
            continue
        item=re.match(r"^(\d{1,2})\s*[.]\s+(.+)$",line)
        if not item or not current:continue
        num=int(item.group(1))
        if num<1 or num>25:continue
        topic=re.sub(r"\s+"," ",item.group(2)).strip(" .")
        key=f"{current}{num}"
        if key not in seen and len(topic)>=8 and len(topic)<=119:
            topics.append({"code":key,"name":topic,"area":current})
            seen.add(key)
    count_area=len(set(item["area"] for item in topics))
    if len(topics)<8 or len(topics)>100 or count_area<2:
        raise ValueError(f"Unreliable topic extraction: {len(topics)} topics across {count_area} areas")
    return topics

def find_approach(pages):
    joined="\n".join(pages)
    matches=list(re.finditer(r"(?m)^\s*(?:7|8|9)\.\s+Approach to examining the syllabus\s*$",joined,re.I))
    if not matches:return []
    text=joined[matches[-1].end():]
    nxt=re.search(r"(?m)^\s*(?:8|9|10)\.\s+",text)
    if nxt:text=text[:nxt.start()]
    signals=[]
    for line in text.splitlines():
        value=line.strip()
        if re.search(r"section [A-C]|minutes|three.hours|two.hours|100 marks|50 questions|objective test|constructed response|professional skills|multi.task|case.study|questions are compulsory",value,re.I):
            value=re.sub(r"\s+"," ",value)
            if len(value)>30 and len(value)<240 and value not in signals:signals.append(value)
    return signals[:12]

def main():
    out={"generated_at":datetime.now(timezone.utc).isoformat(),"purpose":"ACCA source audit; unverified extraction must NOT be used for scoring", "papers":{}}
    data={"generated_at":out["generated_at"],"source":"ACCA syllabus and study guides","papers":{}}
    count=0
    for code,url in PAGES.items():
        row={"source_page":url,"variant":VARIANTS.get(code,"GLO"),"status":"failed","attempted":[]}
        try:
            links=pdf_links(url,code)
            print("DEBUG",code,"candidate PDF anchors:",[(round(score),link[-130:],label[:100]) for score,link,label in links[:3]])
            if not links:raise ValueError("No PDF links found at official landing page")
            for score,link,label in links[:5]:
                try:
                    if score<0:continue
                    raw=get(link)
                    if not raw.content.startswith(b"%PDF"):raise ValueError("Downloaded file is not PDF")
                    pages=extract_pages(raw.content)
                    try:
                        syllabus=find_syllabus(pages)
                    except Exception as failure:
                        if code in ("FA1","FA2","FBT","PM","SBL"):
                            for pi,content in enumerate(pages[:15]):
                                if re.search(r"the syllabus|detailed study guide",content,re.I):
                                    excerpt=re.sub(r"\s+"," ",content[:540])
                                    print("PDF PAGE PREFIX",code,pi+1,repr(excerpt))
                        raise failure
                    topics=extract_topics(syllabus)
                    approach=find_approach(pages)
                    row.update(status="parsed",pdf_url=link,pdf_label=label,pages=len(pages),topics=len(topics),areas=len(set(t["area"] for t in topics)),exam_approach_evidence=approach)
                    data["papers"][code]={"topics":[t["code"]+" · "+t["name"] for t in topics],"source":link,"source_page":url,"variant":row["variant"],"edition":label,"approach_evidence":approach}
                    count+=1;break
                except Exception as exc:
                    row["attempted"].append({"url":link,"error":str(exc)[:170]})
            if row["status"]!="parsed":raise ValueError("No PDF passed structural checks")
        except Exception as exc:
            row["error"]=str(exc)[:250]
        if row["attempted"]:print("DEBUG",code,"failed candidates:",row["attempted"][:2])
        out["papers"][code]=row
        print(code,row["status"],row.get("topics",""),row.get("pdf_label","")[:100],row.get("error",""))
        sys.stdout.flush()
    OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
    DATA_OUT.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
    print("PARSED",count,"OF",len(PAGES),"FILES",OUT,DATA_OUT)
    if count<25:sys.exit(2)
if __name__=="__main__":main()
