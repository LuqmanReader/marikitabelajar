#!/usr/bin/env python3
"""Recompute directly extractable arithmetic equalities in 350 published lessons.
This is evidence of individual arithmetic identities, not verification of
conceptual assumptions, legal rates, journal direction or every working line.
"""
import ast, collections, hashlib, json, math, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
raw=json.loads((ROOT/"audit/first350-live-lessons-ci.json").read_text())
assert len(raw["rows"])==350
NUM=r"(?:\(?\s*[-+]?\s*[$£]?\s*[\d,]+(?:\.\d+)?\s*%?\s*\)?)"
OP=r"(?:[+\-*\/×÷−])"
FORMULA=re.compile(r"(?=((?:[-+−]?\s*[$£]?\s*\d|\()\s*[()$£\d\s,.\-+*/×÷−%^]{2,100})\s*=\s*([+\-−]?\s*[$£]?\s*[\d,]+(?:\.\d+)?\s*%?))")
ALLOWED=re.compile(r"^[\d.\s()+\-*/%]+$")
def clean(s):
    s=s.replace("$","").replace("£","").replace(",","").replace("×","*").replace("÷","/").replace("−","-").replace("^","**")
    s=re.sub(r"(\d+(?:\.\d+)?)%",r"(\1/100)",s)
    return s

def safe(expr):
    try:
        c=clean(expr)
        if not ALLOWED.fullmatch(c):return None
        tree=ast.parse(c,mode="eval")
        def calc(n):
            if isinstance(n,ast.Expression):return calc(n.body)
            if isinstance(n,ast.Constant) and isinstance(n.value,(int,float)):return float(n.value)
            if isinstance(n,ast.UnaryOp) and isinstance(n.op,(ast.UAdd,ast.USub)):
                return calc(n.operand)*(1 if isinstance(n.op,ast.UAdd) else -1)
            if isinstance(n,ast.BinOp):
                a,b=calc(n.left),calc(n.right)
                if isinstance(n.op,ast.Add):return a+b
                if isinstance(n.op,ast.Sub):return a-b
                if isinstance(n.op,ast.Mult):return a*b
                if isinstance(n.op,ast.Div):return a/b
                if isinstance(n.op,ast.Pow):
                    if abs(b)>8 or abs(a)>1e12:raise ValueError("unbounded power")
                    return a**b
            raise ValueError("unsupported math expression")
        v=calc(tree)
        return v if math.isfinite(v) and abs(v)<1e15 else None
    except (Exception,BaseException):
        return None

findings=[]
per_topic=[]
duplicate=collections.defaultdict(list)
for chapter in raw["rows"]:
    key=chapter["key"];valid=0;unparsed=0;issues=[]
    contentHash=hashlib.sha256(json.dumps({"s":chapter["sections"],"w":chapter["worked"]},sort_keys=True).encode()).hexdigest()
    duplicate[contentHash].append(key)
    for case_index,case in enumerate(chapter["worked"]):
        title,question,answer=case
        seen_rhs=set()
        # Overlapping candidates are needed: prose such as “invoice $10 = $40−$8+$10=$42”
        # must not swallow $40 before the full subsequent arithmetic equality.
        candidates=sorted(FORMULA.finditer(answer),key=lambda m:(m.end(2),-(m.end(2)-m.start(1))))
        for m in candidates:
            if m.end(2) in seen_rhs:continue
            seen_rhs.add(m.end(2))
            left=m.group(1).strip()
            # Skip intermediate sums in chained equalities (A+B=first part+second part=total).
            if re.match(r"\s*[+\-−×÷*/]",answer[m.end(2):]):continue
            # A subexpression preceded by an operator is not the full original equation.
            if re.search(r"[+\-−×÷*/]\s*$",answer[max(0,m.start()-6):m.start()]):continue
            # Retain only a plausible numeric calculation. The preceding prose is
            # not included by the regex; incomplete terms are not checked.
            if not re.search(r"\d\s*[%)]?\s*[+\-−×÷*/]\s*\(?\s*[$£]?\d",left):continue
            if len(left)>100 or len(left)<3:continue
            result=safe(left)
            if result is None:
                unparsed+=1;continue
            right=m.group(2).strip().replace("−","-").replace(",","").replace("$","").replace("£","")
            percentage=right.endswith("%")
            try:observed=float(right.rstrip("%"))/100 if percentage else float(right)
            except ValueError:continue
            # Two-decimal currency values are generally rounded to the cent;
            # whole numbers may be a stated whole-unit rounding.
            displayed=right.rstrip("%")
            decimal=len(displayed.split(".")[1]) if "." in displayed else 0
            tolerance=max(0.0101, 0.51*(10**(-decimal)))
            if percentage:tolerance/=100
            valid+=1
            good=abs(result-observed)<=tolerance
            # For adverse/favourable variances, books conventionally show a positive
            # magnitude plus the variance direction, not a negative amount.
            direction=re.match(r"\s*(?:adverse|favourable|favorable|A\b|F\b)",answer[m.end(2):],re.I)
            if not good and direction and abs(abs(result)-abs(observed))<=tolerance:
                good=True
            item={"chapter":key,"caseIndex":case_index+1,"caseTitle":title,
                  "expression":left,"reported":m.group(2),"calculated":round(result,8),
                  "absDifference":round(abs(result-observed),8),"tolerance":tolerance}
            if not good:
                item["status"]="ARITHMETIC_MISMATCH_REVIEW"
                issues.append(item)
            else:item["status"]="ARITHMETIC_IDENTITY_RECHECKED"
            findings.append(item)
    per_topic.append({"key":key,"paper":chapter["paper"],"workedCaseCount":len(chapter["worked"]),
                      "arithmeticalIdentitiesRechecked":valid,"unparsedPossibleExpressions":unparsed,
                      "arithmeticalMismatches":len(issues),"fullAcademicVerification":False})
mismatches=[r for r in findings if r["status"]=="ARITHMETIC_MISMATCH_REVIEW"]
groups=[{"keys":keys,"sameVisibleMaterial":True} for keys in duplicate.values() if len(keys)>1]
paper_stats=collections.defaultdict(lambda:{"topics":0,"cases":0,"equationsRecomputed":0,"mismatches":0})
for row in per_topic:
    v=paper_stats[row["paper"]]
    v["topics"]+=1;v["cases"]+=row["workedCaseCount"];v["equationsRecomputed"]+=row["arithmeticalIdentitiesRechecked"]
    v["mismatches"]+=row["arithmeticalMismatches"]
report={"date":"2026-10-31","scope":"First 350 published LedgerPeer lessons",
    "method":"Arithmetic equation extraction and independent safe arithmetic recomputation",
    "caveats":["Extractable equations only; a case may contain numbers never checked",
               "No automatic verification of IFRS, tax rules, assumptions or ledger posting direction",
               "Math mismatch flags require expert inspection because text parsing can be ambiguous"],
    "totalTopics":350,"totalWorkedCases":sum(r["workedCaseCount"] for r in per_topic),
    "equationsRecomputed":len(findings),"equationsFlagged":len(mismatches),
    "topicsWithNoMachineReadableEquation":sum(r["arithmeticalIdentitiesRechecked"]==0 for r in per_topic),
    "duplicatedPublishedLessonGroups":groups,
    "paperStats":dict(paper_stats),"mismatches":mismatches,"topics":per_topic,
    "individualChecks":findings,"fullAcademicSignoffs":0}
path=ROOT/"audit/first350-arithmetic-evidence-ci.json"
path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
lines=["# 350-lesson independent arithmetic audit","","**This is an arithmetic expression audit, NOT certification of any chapter.**",
       "","- Topics: 350","- Worked examples: "+str(report["totalWorkedCases"]),
       "- Extractable arithmetic identities recomputed: "+str(report["equationsRecomputed"]),
       "- Flagged arithmetic identities requiring inspection: "+str(len(mismatches)),
       "- Lessons without extractable arithmetic identities: "+str(report["topicsWithNoMachineReadableEquation"]),
       "- Shared/identical published chapter groups: "+str(len(groups)),
       "","## Paper results","|Paper|Lessons|Examples|Identity checks|Flags|","|---|---:|---:|---:|---:|"]
for p,v in paper_stats.items():
    lines.append("|"+p+"|"+str(v["topics"])+"|"+str(v["cases"])+"|"+str(v["equationsRecomputed"])+"|"+str(v["mismatches"])+"|")
lines+=["","## First 50 mismatches requiring manual reconciliation"]
for r in mismatches[:50]:
    lines.append("- "+r["chapter"]+" / "+r["caseTitle"]+": "+r["expression"]+" = "+r["reported"]+"; recalculated "+str(r["calculated"]))
lines+=["","## Qualification","Math equality verification cannot replace official syllabus outcome verification, independent professional technical review, or audit of every statement and journal."]
(ROOT/"audit/first350-arithmetic-evidence-ci.md").write_text("\n".join(lines)+"\n")
print("AUDIT_350_ARITHMETIC",json.dumps({"lessons":350,"cases":report["totalWorkedCases"],
        "identities":report["equationsRecomputed"],"flags":len(mismatches),
        "examples":mismatches[:12]},ensure_ascii=False),flush=True)
