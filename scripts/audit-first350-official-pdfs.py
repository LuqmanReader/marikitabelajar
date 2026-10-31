#!/usr/bin/env python3
"""First-350 source-to-chapter evidence using the 2026–27 primary ACCA PDFs.
A heading match, outcome token match and numerical spot check are never sign-off.
No ACCA text is republished; only short title anchors, page numbers and hashes.
"""
import difflib
import hashlib
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import fitz
import requests

ROOT=Path(__file__).resolve().parents[1]
INPUT=ROOT/"audit/first350-live-lessons-ci.json"
OUTPUT=ROOT/"audit/first350-official-syllabus-evidence-ci.json"
OUTPUT_MD=ROOT/"audit/first350-official-syllabus-evidence-ci.md"
data=json.loads(INPUT.read_text())
rows=data["rows"]
assert len(rows)==350 and rows[0]["key"]=="FA1:A1" and rows[-1]["key"]=="FA:G4"
session=requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 LedgerPeer academic evidence review/1.0"})

def normalize(s):
    s=s.lower().replace("–","-").replace("’","'").replace("ﬁ","fi")
    s=re.sub(r"[^a-z0-9]+"," ",s)
    return " ".join(s.split())

def similarity(a,b):
    a=normalize(a);b=normalize(b)
    if not a or not b:return 0
    if a==b:return 1.0
    if a in b or b in a:return min(len(a),len(b))/max(len(a),len(b))*.25+.72
    at=set(a.split());bt=set(b.split())
    token=len(at&bt)/max(1,len(at|bt))
    return max(difflib.SequenceMatcher(None,a,b).ratio()*.8,token*.95)

def find_detailed(doc):
    for i in range(3,len(doc)):
        txt=doc[i].get_text("text",sort=True)
        if re.search(r"(?:6|7)\.\s*Detailed study guide",txt,re.I):
            return i
    for i in range(3,len(doc)):
        txt=doc[i].get_text("text",sort=True)
        if "Detailed study guide" in txt and re.search(r"\ba\)\s*",txt,re.I):
            return i
    return None

def columns(doc,start):
    result=[]
    for p in range(start,min(len(doc),start+32)):
        page=doc[p]
        txt=page.get_text("text",sort=True)
        if p>start+1 and re.search(r"^\s*\d+\.\s*(?:Summary of changes|Approach to examining)",txt,re.I|re.M):
            break
        width,height=page.rect.width,page.rect.height
        for half in [0,1]:
            clip=fitz.Rect(0 if half==0 else width/2,0,width/2 if half==0 else width,height)
            result.append({"page":p+1,"column":half+1,"text":page.get_text("text",sort=True,clip=clip)})
    return result

def candidates(column):
    lines=column["text"].splitlines()
    out=[]
    for i,line in enumerate(lines):
        z=line.strip()
        mm=re.match(r"^(\d{1,2})(?:\.\s*|\s+)(.*)$",z)
        if not mm and re.fullmatch(r"\d{1,2}\.?",z):mm=re.match(r"^(\d{1,2})",z)
        if not mm: continue
        no=int(mm.group(1))
        if no>20: continue
        for n in [1,2,3,4,5]:
            v=" ".join([(mm.group(2) if mm.lastindex and mm.lastindex>=2 else "")]+lines[i+1:i+n]).strip()
            if not v:continue
            out.append({"n":no,"start":i,"width":n,"text":v,"page":column["page"],"column":column["column"],"lines":lines})
    return out

sources={}
for row in rows:
    sources.setdefault(row["sourceUrl"],{"papers":set(),"rows":[]})
    sources[row["sourceUrl"]]["papers"].add(row["paper"])
    sources[row["sourceUrl"]]["rows"].append(row)

out=[]
pdfs=[]
for url,item in sources.items():
    papers=sorted(item["papers"])
    entry={"url":url,"papers":papers,"fetched":False,"periodConfirmed":False,
           "sha256":None,"pages":None,"error":None}
    extracted=[]
    try:
        if urlparse(url).hostname!="www.accaglobal.com" or not url.lower().endswith(".pdf"):
            raise ValueError("Not official ACCA PDF path")
        response=session.get(url,timeout=35)
        response.raise_for_status()
        if not response.content.startswith(b"%PDF"):raise ValueError("Not a PDF response")
        entry["fetched"]=True
        entry["sha256"]=hashlib.sha256(response.content).hexdigest()
        doc=fitz.open(stream=response.content,filetype="pdf")
        entry["pages"]=len(doc)
        cover=" ".join(doc[p].get_text("text") for p in range(min(3,len(doc)))).lower()
        entry["periodConfirmed"]=bool("2026" in cover and "2027" in cover)
        if not entry["periodConfirmed"]:raise ValueError("Cover does not show 2026–2027 exam period")
        start=find_detailed(doc)
        if start is None:raise ValueError("Cannot find actual Detailed study guide (not TOC)")
        entry["detailedStartPdfPage"]=start+1
        extracted=columns(doc,start)
    except Exception as e:
        entry["error"]=str(e)[:240]
    pdfs.append(entry)
    cand=[c for col in extracted for c in candidates(col)]
    for row in item["rows"]:
        key=row["key"];topicNo=int(key.split(":")[1][1:])
        same=[x for x in cand if x["n"]==topicNo]
        expectedDetailedTitle="Key principles and concepts of accounting" if key in ("FA:B1","FFA:B1") else row["title"]
        ranked=sorted(same,key=lambda c:similarity(expectedDetailedTitle,c["text"]),reverse=True)
        best=ranked[0] if ranked else None
        matchScore=round(similarity(expectedDetailedTitle,best["text"]),3) if best else 0
        matched=bool(best and matchScore>=.75)
        note=[]
        if entry["error"]:note.append("OFFICIAL_PDF_UNAVAILABLE_OR_INVALID")
        if not matched:note.append("TOPIC_HEADING_NOT_RELIABLY_MATCHED")
        # Candidate outcomes only, not guaranteed: extract until next topic-number heading.
        outcomes=[]
        if matched:
            ls=best["lines"];start=best["start"]+max(best["width"],1)
            end=min(len(ls),start+90)
            for i in range(start,end):
                v=ls[i].strip()
                if re.match(r"^\d{1,2}\.\s+\w",v):
                    end=i;break
            chunk="\n".join(ls[start:end])
            for m in re.finditer(r"(?m)^\s*([a-z])\)\s*(.*)",chunk):
                tail=chunk[m.start():m.start()+250].splitlines()
                phrase=" ".join(tail[:3])[:180]
                outcomes.append({"letter":m.group(1),"sha256":hashlib.sha256(phrase.encode()).hexdigest()[:16],
                                 "anchorWords":normalize(phrase).split()[:8]})
            if not outcomes:note.append("DETAILED_OUTCOME_LETTERS_NOT_EXTRACTED")
        teaching=" ".join([x[1] for x in row["sections"]]+[x[1]+" "+x[2] for x in row["worked"]])
        lessonTokens=set(normalize(teaching).split())
        matchedKeywords=[]
        if outcomes:
            stop={"and","that","which","with","from","the","for","this","different","describe","explain","identify",
                  "apply","calculate","prepare","state","account","record","including","information","using"}
            for o in outcomes:
                terms=[w for w in o["anchorWords"] if w not in stop and len(w)>=5]
                intersection=[w for w in terms if w in lessonTokens]
                matchedKeywords.append({"letter":o["letter"],"hits":len(intersection),"tested":len(terms),
                                        "score":round(len(intersection)/len(terms),2) if terms else None})
            if any(z["score"] is not None and z["score"]<.25 for z in matchedKeywords):
                note.append("POSSIBLE_MISSING_DETAILED_OUTCOME_TERMINOLOGY")
        # Metadata includes SHA-256 of the entire actual student-visible lesson, not an assertion of correct content.
        out.append({"key":key,"paper":row["paper"],"title":row["title"],"edition":row["examEdition"],
            "variant":row["variant"],"officialPdf":url,"pdfSha256":entry["sha256"],
            "officialPdfCurrentPeriod":entry["periodConfirmed"],
            "officialTopicPdfPage":best["page"] if matched else None,
            "topicHeadingMatchScore":matchScore,
            "acccOverviewDetailedGuideLabelConflict":key in ("FA:B1","FFA:B1"),
            "detailedGuideTitleUsed":expectedDetailedTitle,
            "nearestOfficialHeadingCandidate":best["text"][:130] if best else None,
            "nearestOfficialHeadingCandidatePdfPage":best["page"] if best else None,
            "officialDetailedOutcomeCandidates":outcomes,
            "outcomeTokenComparison":matchedKeywords,
            "lessonSha256":row["contentSha256"],"publishedWorkedCases":row["publishedWorkedCount"],
            "flags":note,"academicSignoff":False,
            "verificationLevel":"SOURCE_SCREENING_ONLY_NOT_INDEPENDENT_ACADEMIC_VERIFICATION"})
    print("PAPER_SOURCE",",".join(papers),"PDF",entry["fetched"],"PERIOD",entry["periodConfirmed"],
          "MATCHED",sum(1 for x in out if x["paper"] in papers and x["officialTopicPdfPage"]),
          "ERROR",entry["error"],flush=True)

assert len(out)==350,len(out)
print("UNMATCHED_2026_SOURCE",json.dumps([{"key":r["key"],"title":r["title"],"nearest":r["nearestOfficialHeadingCandidate"],"candidatePage":r["nearestOfficialHeadingCandidatePdfPage"],"score":r["topicHeadingMatchScore"]} for r in out if not r["officialTopicPdfPage"]],ensure_ascii=False),flush=True)
counts={}
for r in out:
    for flag in r["flags"]:counts[flag]=counts.get(flag,0)+1
byPaper={}
for r in out:
    rec=byPaper.setdefault(r["paper"],{"chapters":0,"headings":0,"detailedOutcomeCandidates":0,"flags":0})
    rec["chapters"]+=1
    rec["headings"]+=bool(r["officialTopicPdfPage"])
    rec["detailedOutcomeCandidates"]+=len(r["officialDetailedOutcomeCandidates"])
    rec["flags"]+=bool(r["flags"])
report={"asOf":"2026-10-31","scope":"First 350/700 live LedgerPeer lessons",
        "method":"2026-27 official ACCA PDF fetch, cover edition verification, heading-to-PDF page match and screening for detailed outcome evidence",
        "warning":"THIS IS NOT A FULL ACADEMIC VERIFICATION. Fuzzy title and word presence do not prove syllabus proficiency, correctness of calculations or adequacy of teaching.",
        "fullAcademicSignoffs":0,"totalChapters":350,
        "downloadedPdfs":sum(p["fetched"] for p in pdfs),
        "datedPdfs":sum(p["periodConfirmed"] for p in pdfs),
        "distinctPdfs":len(pdfs),"matchedTopicHeadings":sum(bool(r["officialTopicPdfPage"]) for r in out),
        "totalOutcomeLetterCandidates":sum(len(r["officialDetailedOutcomeCandidates"]) for r in out),
        "flags":counts,"byPaper":byPaper,"sources":pdfs,"chapters":out}
OUTPUT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
md=["# First 350 — direct 2026–27 ACCA PDF evidence scan","",
    "**NOT a full academic sign-off.** This report verifies source editions and screens chapter alignment.",
    "","- Distinct official PDFs: "+str(len(pdfs)),
    "- PDFs with correct edition: "+str(report["datedPdfs"]),
    "- Chapter heading/page candidates matched: "+str(report["matchedTopicHeadings"])+"/350",
    "- Extracted detailed-outcome letter candidates: "+str(report["totalOutcomeLetterCandidates"]),
    "- Full academically signed-off chapters: **0**","","## Flags"]
md += ["- "+k+": "+str(v) for k,v in sorted(counts.items())]
md += ["","## By paper","|Paper|Records|Heading/page matches|Outcome candidates|Flagged|",
       "|---|---:|---:|---:|---:|"]
md += ["|"+k+"|"+str(v["chapters"])+"|"+str(v["headings"])+"|"+str(v["detailedOutcomeCandidates"])+"|"+str(v["flags"])+"|" for k,v in byPaper.items()]
md += ["","## Cannot sign off on this evidence alone",
       "Full independent academic verification must cross-check every official nested K/S sub-outcome, all technical rules and exam variants, every numerical journal and its assumptions, and visual readability. The underlying syllabus PDF page and lesson hash are stored by chapter in the JSON.",
       ""]
OUTPUT_MD.write_text("\n".join(md))
print("AUDIT_350_SOURCE",json.dumps({"pdf":len(pdfs),"valid":report["datedPdfs"],
        "matched":report["matchedTopicHeadings"],"outcomes":report["totalOutcomeLetterCandidates"],
        "flags":counts}),flush=True)
