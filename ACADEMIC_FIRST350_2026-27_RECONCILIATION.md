# LedgerPeer academic reconciliation — first 350 topics, 2026–27

**Audit date:** 31 October 2026  
**Scope:** First 350 LedgerPeer Notes lessons, FA1:A1 through FA:G4, across 13 paper codes and 10 distinct official ACCA syllabus guides.  
**Decision:** **WHOLE-COHORT OFFICIAL-SOURCE SCREENING COMPLETED. FULL ACADEMIC VERIFICATION REMAINS OPEN.**

## Evidence and reproducibility

Every first-half student-visible lesson was exported using the **same source merge/override order as the live Notes reader**. The live corpus contains **730 worked-example entries** as of the documented source scan. All 10 relevant official ACCA PDF guides were downloaded directly in CI and the cover/examinable period checked. **350/350 chapter topic headings matched official syllabus page candidates**. Approximate text matching alone is not evidence that every nested outcome is covered or that every explanation is correct.

The source audit screened the official detailed study-guide content for **1,283 candidate lettered outcomes** after removal of Roman-numeral subitems, cross-page handling and a special note for practical exam technology skills. It recorded **197 topics with possible missing terminology** for substantive review and **12 practical computer-based competency topics requiring hands-on evaluation**. These are review queues; a lexical mismatch can be a false positive and a lexical match does not establish technical accuracy.

The independent arithmetic scanner inspected **730 published worked cases**, recomputed **650 machine-extractable arithmetic identities**, and found **no mismatches in those extractable identities** at the last successful run. This is **NOT** independent recomputation of every worked solution or proof that assumptions, accounting entries and tax rules are sound. It cannot assess equations that are not machine readable, narrative qualitative questions, journals or legal details.

## 13 papers included

| Paper | Topic records | Applicable syllabus variant |
|---|---:|---|
| FA1 | 19 | Global / September 2026–June 2027 |
| MA1 | 13 | Global / September 2026–June 2027 |
| FA2 | 22 | Global / September 2026–June 2027 |
| MA2 | 20 | Global / September 2026–June 2027 |
| FBT | 36 | Global / September 2026–June 2027 |
| FMA | 25 | Global / September 2026–June 2027 |
| FFA | 35 | Global / September 2026–June 2027 |
| FAU | 27 | Global / December 2026–June 2027 |
| FFM | 24 | Global / December 2026–June 2027 |
| FTX | 40 | UK / June 2026–June 2027 |
| BT | 36 | Global / September 2026–June 2027 |
| MA | 25 | Global / September 2026–June 2027 |
| FA | 28 | Global / September 2026–June 2027 |
| **Total** | **350** | **10 official PDFs** |

## Specific substantive content defects corrected

1. **FA:B1 and FFA:B1 — major syllabus mismatch:** These chapters duplicated B2 qualitative characteristics and did not teach detailed B1's ten fundamental accounting principles. Both were replaced with complete original teaching and worked applications including going concern, accruals, materiality, offsetting, consistency, prudence, duality, business entity, historical cost/current value and substance over form.
2. **MA1:D2 — labour accounting:** Added time versus piece pay, unit labour cost, productivity, overtime, idle time, gross and net labour calculations.
3. **MA1:D3 — overheads:** Added predetermined overhead absorption rates, over/under absorption, cost-centre apportionment and nonreciprocal service-department distribution.
4. **MA1:D4 — product costing:** Added job-card, batch-cost, process normal and abnormal loss/gain techniques and scenario-specific cost selection.
5. **MA2:D3 — investment appraisal:** Corrected a real NPV rounding discrepancy from $2,276.49 to **$2,276.48**, using the full precision annuity calculation.
6. **FA2:D1 — sales, purchases, returns and sales tax:** Added registration, invoice requirements, taxable-supply classifications, cash versus invoice reporting, penalties and return reconciliation, plus IFRS 15 settlement-discount treatment and three additional worked cases.
7. **BT:F2 and FBT:F2 — professional ethics:** Added the five official detailed requirements on IESBA/ACCA codes, professional body responsibilities, profession attributes, accountant ethical responsibilities and protected escalation of suspected illegal/unethical conduct.
8. **FMA:F2 and MA:F2 — applied performance measurement:** Replaced narrow margins/days coverage with Balanced Scorecard, economy/efficiency/effectiveness, efficiency/capacity/activity, ROI, residual income, resource utilisation, quality and TQM with quantified applications.
9. **FMA:F3 and MA:F3 — cost reduction and value analysis:** Added explicit differentiation between cost control and sustained reduction, method evaluation, value analysis and further worked scenarios.
10. **MA:B2 and FMA:B2 — analytical forecasting:** Replaced a single high–low case with eight original teaching sections and eight application scenarios per paper, covering step costs, scatter/regression, correlation and r², time-series and seasonal forecasting, inflation, Laspeyres/Paasche indices and product lifecycle limits.

These are **15 chapter records improved in this review cycle**, covering multiple paper codes, in addition to the previously committed FA/FFA C1–D5 work and the FA2:D4 disposal-account correction. The latest Notes release is **2026.10.31.35** with versioned asset refreshes so students obtain revised content.

## Source and proof chain

- [Official BT/FBT guide](https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/bt_fbt_s26_j27_syllabus_and_study_guide.pdf), detailed F2 outcomes on printed page 15.
- [Official MA/FMA guide](https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/ma_fma_s26_j27_syllabus_and_study_guide.pdf), detailed F2 and F3 on printed pages 11–12.
- [Official FA/FFA guide](https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/fa_ffa_s26_j27_syllabus_and_study_guide.pdf), detailed B1 and C1–D5. **Important:** its B1 overview label conflicts with the detailed B1 teaching outcomes; the detailed outcomes are authoritative for chapter coverage.
- [Official FA2 syllabus page](https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/fa2/fa2-syllabus-study-guide.html), leading to the current 2026–27 guide.
- Scripts: `scripts/export-first350-live-lessons.cjs`, `scripts/audit-first350-official-pdfs.py`, `scripts/audit-first350-arithmetic.py`.
- Regression: `tests/notes-2026-academic-corrections.cjs`, `tests/notes-first350-substantive-reconciliation.cjs`, `tests/notes-fa-ffa-academic-crosswalk.cjs`.
- [GitHub Actions evidence and full 350-record reports](https://github.com/LuqmanReader/marikitabelajar/actions/workflows/notes-quality.yml), download **notes-first350-official-source-review**, **notes-first350-maths-review**, and **notes-first350-evidence**.
- [FA/FFA detailed academic crosswalk](ACADEMIC_RECONCILIATION_FA_FFA_2026-27.md) for the 14 deeper-reconciled FA/FFA chapter records.

## Material limitations and next work required before full academic sign-off

**Neither 350/350 heading matching nor 650 correct arithmetic identities is full academic verification.** The 197 potential detailed-outcome gaps remain for review (some may be extraction false positives). Twelve computer-application competencies need practical exam simulations. A qualified independent reviewer has not separately approved every rule, explanation, answer, effective standard, legislation provision, exam variant, visual or case. The repository's 700-topic review matrix therefore correctly retains `NOT_VERIFIED` statuses and **0 full independent academic sign-offs**, rather than falsely certifying material for students.

A full sign-off must individually check every nested K/S objective against source text, ensure appropriate depth and pedagogical examples, recompute each applicable result and journal, verify legal/effective dates and visuals, and record reviewer evidence for each lesson. The unresolved cases are not declared safe or certified just because the automated CI passes.
