#!/usr/bin/env python3
"""Conservative debit/credit arithmetic check of all published worked examples.
Checks only groups where each Dr/Cr amount is explicitly recoverable.
Balanced journals can STILL be posted to the wrong account or be inappropriate:
DO NOT use this test as an academic sign-off.
"""
import json,re
from collections import defaultdict
from decimal import Decimal, InvalidOperation
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
lesson_json=json.loads((ROOT/"audit/all700-live-lessons-ci.json").read_text())
assert len(lesson_json["rows"])==700
token=re.compile(r"\b(Dr|Cr)\b",re.I)
money=re.compile(r"\$\s*((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)")
after_equals=re.compile(r"=\s*\$\s*((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)")
segments=re.compile(r";|\n|\.(?=\s+[A-Z])")
results=[];ambiguous=[];alternatives=[];per_paper=defaultdict(lambda:{"checked":0,"balanced":0,"mismatches":0,"unparsed":0})
for chapter in lesson_json["rows"]:
 for case_index,case in enumerate(chapter["worked"],1):
  if not isinstance(case,(list,tuple)) or len(case)<3:continue
  title,question,answer=case[:3]
  for segment_index,segment in enumerate(segments.split(str(answer)),1):
   markers=list(token.finditer(segment))
   sides={m.group(1).lower() for m in markers}
   if not {"dr","cr"}.issubset(sides):continue
   key=chapter["key"]
   base={"key":key,"paper":chapter["paper"],"caseIndex":case_index,"caseTitle":title,
         "segmentIndex":segment_index,"excerpt":segment.strip()[:240]}
   optional=re.search(r"\(\s*or\s+(?:Dr|Cr)\s+[^)]*\)",segment,re.I)
   if optional:
    # A parenthesised alternative is a different account presentation, NOT
    # an additional debit/credit that belongs in the primary posting group.
    alternatives.append({**base,"reason":"Alternative account requires substantive review",
                         "alternativeText":optional.group(0)})
    segment=segment[:optional.start()]
    markers=list(token.finditer(segment))
   elif re.search(r"\bor\s+(?:Dr|Cr)\b",segment,re.I):
    ambiguous.append({**base,"reason":"Multiple alternative postings need manual interpretation"})
    per_paper[chapter["paper"]]["unparsed"]+=1
    continue
   postings=[];narrative_extras=[]
   for i,m in enumerate(markers):
    clause=segment[m.end():markers[i+1].start() if i+1<len(markers) else len(segment)]
    amounts=list(money.finditer(clause))
    reported=after_equals.search(clause)
    if reported:amount_text=reported.group(1)
    elif len(amounts)==1:amount_text=amounts[0].group(1)
    elif len(amounts)>1 and re.match(r"^\s*,\s*(?:leaving|giving|resulting|meaning|representing|so\s+that|which|with)\b",
                                        clause[amounts[0].end():],re.I):
     # The FIRST amount is the entry. Later amounts describe its effect.
     amount_text=amounts[0].group(1)
     narrative_extras.append(clause[amounts[0].end():].strip()[:100])
    else:break
    try:amount=Decimal(amount_text.replace(",",""))
    except InvalidOperation:break
    postings.append({"side":m.group(1).lower(),"amount":amount})
   if len(postings)!=len(markers):
    ambiguous.append({**base,"reason":"One or more posting amounts not uniquely recoverable"})
    per_paper[chapter["paper"]]["unparsed"]+=1
    continue
   debits=sum((v["amount"] for v in postings if v["side"]=="dr"),Decimal("0"))
   credits=sum((v["amount"] for v in postings if v["side"]=="cr"),Decimal("0"))
   discrepancy=abs(debits-credits)
   result={**base,"debits":str(debits),"credits":str(credits),
           "absoluteDifference":str(discrepancy),"postingCount":len(postings),
           "narrativeFiguresExcluded":narrative_extras,
           "alternativeAccountPresentation":bool(optional),
           "status":"BALANCED" if discrepancy<=Decimal("0.01") else "IMBALANCE_REQUIRES_REVIEW"}
   results.append(result);rec=per_paper[chapter["paper"]]
   rec["checked"]+=1
   if result["status"]=="BALANCED":rec["balanced"]+=1
   else:rec["mismatches"]+=1
summary={"scope":"All 700 reader-visible lessons, explicitly formatted debit/credit arithmetic groups",
 "limitations":["Balanced Dr and Cr figures do not prove correct account classification or IFRS compliance",
                "Alternative, missing, or ambiguous postings are excluded and flagged for manual review",
                "Journal groups are extracted from scenario answers, not every narrative statement"],
 "lessons":700,"checkedGroups":len(results),
 "balanced":sum(r["status"]=="BALANCED" for r in results),
 "reviewFlags":sum(r["status"]!="BALANCED" for r in results),
 "ambiguousGroups":len(ambiguous),"alternativeAccountGroups":len(alternatives),
 "alternativePresentations":alternatives,"perPaper":dict(per_paper),
 "mismatches":[r for r in results if r["status"]!="BALANCED"],
 "unparsed":ambiguous,"checks":results,"academicSignoffs":0}
out=ROOT/"audit/all700-journal-balance-ci.json"
out.write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n")
md=["# 700-lesson debit/credit mathematical checks","",
 "**No independent academic sign-off.** A balanced journal can still have wrong account classification.",
 "", "- Explicit journal posting groups checked: "+str(summary["checkedGroups"]),
 "- Balanced groups: "+str(summary["balanced"]),
 "- Unbalanced groups to investigate: "+str(summary["reviewFlags"]),
 "- Ambiguous or incomplete posting groups: "+str(summary["ambiguousGroups"]),
 "- Alternative-account explanations retained for technical review: "+str(summary["alternativeAccountGroups"]),
 "", "## By paper", "|Paper|Groups|Balanced|Unbalanced|Ambiguous|",
 "|---|---:|---:|---:|---:|"]
for paper,rec in sorted(per_paper.items()):
 md.append(f"|{paper}|{rec['checked']}|{rec['balanced']}|{rec['mismatches']}|{rec['unparsed']}|")
md+=["","## Limitations",*("- "+x for x in summary["limitations"])]
(ROOT/"audit/all700-journal-balance-ci.md").write_text("\n".join(md)+"\n")
print("AUDIT_700_JOURNALS "+json.dumps({k:summary[k] for k in ("lessons","checkedGroups","balanced","reviewFlags","ambiguousGroups","alternativeAccountGroups")}))
if summary["reviewFlags"]:
 raise SystemExit("Possible unbalanced journals detected: inspect audit/all700-journal-balance-ci.json")
