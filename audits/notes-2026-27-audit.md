> **ARCHIVED AUDIT SNAPSHOT (BEFORE TEXTBOOK REWRITE).** Figures below describe the previous starter-note format. The Notes Library now has 74 separately authored textbook chapters across FA1, MA1, FA2 and MA2, plus 163 worked solutions and seven integrated cases. See [current textbook release](../TEXTBOOK_STATUS_2026-27.md). The remaining 626 headings are not yet rewritten in the same format.

# LedgerPeer 2026–27 Notes — Comprehensive Quality-Gate Audit

**Audit run:** 30 October 2026  
**Repository:** `LuqmanReader/marikitabelajar`  
**Scope:** full rendered Notes Library, all 25 paper indexes with the live UK notes-variant overrides  
**Verdict:** **NOT SYLLABUS-COMPLETE / CONTENT-VERIFICATION OPEN**

## Executive findings

- **700/700** indexed headings have starter notes; this proves *index presence only*.
- **8/700** are expanded into separately coded K/S outcomes; the **remaining 692 headings are NOT mapped to individual outcomes**.
- Those 8 expansions represent **72 authored individual outcomes and 17 additional worked examples**, based on verified **2025–26** FA2/MA2 guides. Their **2026–27 equivalence is unverified**, so **zero headings can honestly be certified as complete against the current detailed syllabus**.
- **700/700** contain fewer than 250 words of *standalone note content*, even when the website also links some headings to shared explanatory chapters. The 250-word threshold is only a depth-screening heuristic, **not** an official ACCA content minimum.
- **261** topic headings link to just **37 shared textbook chapters** in `fia-study-data-v2.js` (14,531 declared chapter words). Reused chapters can support overlapping material but do not establish complete treatment of distinct outcomes.
- Every heading was checked for the presence of a formula, example, self-check, common trap, individual outcome map and related shared chapter. Detailed results: [topic-by-topic CSV](notes-2026-27-topic-quality.csv).

## Results for every paper

| Paper | Variant | Indexed | Starter | Outcome-expanded | Mean starter words |
|:--|:--|--:|--:|--:|--:|
| FA1 | GLO | 19 | 19 | 0 | 109 |
| MA1 | GLO | 13 | 13 | 0 | 104 |
| FA2 | GLO | 22 | 22 | 3 | 136 |
| MA2 | GLO | 20 | 20 | 5 | 121 |
| FBT | GLO | 36 | 36 | 0 | 132 |
| FMA | GLO | 25 | 25 | 0 | 130 |
| FFA | GLO | 35 | 35 | 0 | 138 |
| FAU | GLO | 27 | 27 | 0 | 126 |
| FFM | GLO | 24 | 24 | 0 | 128 |
| FTX | UK | 40 | 40 | 0 | 136 |
| BT | GLO | 36 | 36 | 0 | 132 |
| MA | GLO | 25 | 25 | 0 | 130 |
| FA | GLO | 35 | 35 | 0 | 138 |
| LW | ENG | 20 | 20 | 0 | 140 |
| PM | GLO | 28 | 28 | 0 | 128 |
| TX | UK | 36 | 36 | 0 | 135 |
| FR | GLO | 26 | 26 | 0 | 134 |
| AA | GLO | 32 | 32 | 0 | 127 |
| FM | GLO | 31 | 31 | 0 | 130 |
| SBL | GLO | 42 | 42 | 0 | 122 |
| SBR | INT | 22 | 22 | 0 | 135 |
| AFM | GLO | 28 | 28 | 0 | 126 |
| APM | GLO | 20 | 20 | 0 | 121 |
| ATX | UK | 24 | 24 | 0 | 131 |
| AAA | INT | 34 | 34 | 0 | 123 |

**Interpretation:** A reported 100% in the *Starter* column only means a topic object exists. A percentage derived from topic objects is not a pass rate, teaching standard or proof of compliance.

## Material shortcomings confirmed

1. **Not outcome-exact:** The official study guides enumerate lettered individual learning outcomes and knowledge/skill levels. Almost all LedgerPeer topics stop at the broader A1, D4 etc heading.
2. **Explanations are too condensed to serve as standalone learning textbooks:** Sampled FA2 D1, D3, G1; MA2 C3, C4, E3; FA D4, FR C3, AA C3 and SBR C1. They typically include three summary steps, one short numerical illustration and one question. They omit essential multi-step journal/accounting procedures or scenarios.
3. **FA2 D1 sales taxes:** The starter note only teaches a simple gross-to-net calculation, while the official detailed guide also expects discounts, sales-tax reporting, return elements and tax records (subject to the latest edition's exact scope).
4. **FA2 D3 inventories:** The starter note refers to periodic weighted average but lacks a comprehensive independent set of FIFO, perpetual AVCO, continuous/periodic comparisons and ledger workings.
5. **FA2 G1 incomplete records:** The starter note does not teach full accounts preparation from an adjusted trial balance or complete reconstruction using receivable/payable control accounts and margin/mark-up.
6. **MA2 C3/C4:** The short examples do not independently teach all job/batch costing or process-costing calculations, loss/gain accounting and treatment of work in progress.
7. **MA2 E3:** The single-period cash-budget illustration omits a complete multi-period receipts/payments timetable.
8. **Some advanced notes are adapted from lower-level papers:** e.g. FA D4 from FA2 D4 and AA C3 from FAU C3. Overlap is legitimate, but higher-level examiner depth, standards and question requirements must be audited separately.
9. **Jurisdiction-specific papers must not be presented as universal:** Current Notes variant overrides use LW (ENG), TX/FTX/ATX (UK) while the underlying subject catalogue can have different jurisdiction defaults. Students must be told which variant they are reading.
10. **Accounting standards/current source edition:** ACCA's **2026–27** examinable documents explicitly include **IFRS 18** for both FA2 and FA/FFA, alongside IAS 2, IAS 16, IAS 37, IFRS 15 and the Conceptual Framework. Prior code linked FA2/MA2 readers chiefly to the older 2025–26 study guides. Official 2026–27 paper landing pages are now linked; the older PDFs remain *only* clearly labelled reference material for the eight prior expansions.
11. **No content QA guarantee:** Syntax checks, existence of notes, worked examples and shared chapters do not establish accounting accuracy, completeness, examinable depth or correctness of every answer.

## Specific high-priority topic backlog

**FA2:** A1–A3 (framework, concepts, financial records), D1 (sales, returns, discounts and tax), D3 (FIFO/AVCO/IAS 2), E1 (bank recon), E2 (payables recon), F1–F2 (trial balance, correcting errors), G1 (sole-trader statements and incomplete records), H1–H3 (partnerships). The D4–D6 expansions require 2026–27 source recheck.

**MA2:** A1–A3, A5, B1 and B3 (cost measurement and recording); C3–C5 (jobs, processes, services); D2–D3 (relevant costing and investment appraisal); E1–E4 (cash management and finance). A4, B2, C1, C2 and D1 expansions require 2026–27 source recheck.

**FA/FFA and MA/FMA:** Validate paper-specific outcomes, multi-task questions and treatments. A topic shared with FA2 or MA2 cannot automatically be marked complete for the higher FIA paper.

**FR/AA/PM/FM/SBR/SBL and advanced options:** Re-author material against each paper's exact detailed outcomes, scope, applied professional skills and current standards; generic foundation examples are insufficient.

**Law/tax:** Complete jurisdiction- and legislation-specific checks before claiming exam readiness, especially where publication and applicable examination windows differ.

## Non-negotiable completion gates

A topic shall be **COMPLETE** only if all these are individually checked:

1. Paper code, jurisdiction/variant and exam-effective syllabus match the official ACCA release.
2. All original detailed learning outcomes (a,b,c etc), nested subpoints and K/S designations are recorded with traceable page references.
3. Every outcome has its **own complete explanation**, underlying assumptions, calculations, applicable journal/T-account and statement entries, examples and boundary cases as relevant.
4. Calculations and disclosures have independently verified answers, and standards/tax-law references match the correct examinable-documents list.
5. At least one diagnostic formative question is linked to the exact outcome, with explanation and plausible distractors where appropriate.
6. A second reviewer or a verified source-based mathematical/accounting check validates the teaching.
7. Subject-specific assessment formats and examiner expectations are tested, including multi-task responses where relevant.

**No current LedgerPeer note satisfies a documented completion gate for the 2026–27 detailed study guide.** This is an audit-status statement, *not* proof that every existing explanation is wrong.

## Verified external reference points

- FA2 2026–27 official ACCA page: https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/fa2/fa2-syllabus-study-guide.html
- MA2 2026–27 official ACCA page: https://www.accaglobal.com/my/en/student/exam-support-resources/foundation-level-study-resources/ma2/ma2-syllabus-study-guide.html
- FA/FFA 2026–27 official syllabus PDF: https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/fa_ffa_s26_j27_syllabus_and_study_guide.pdf
- MA/FMA 2026–27 official syllabus PDF: https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/ma_fma_s26_j27_syllabus_and_study_guide.pdf
- FA2 and FA/FFA 2026–27 examinable IFRS list: https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/fa2_ffa_s26_j27_examinable_docs.pdf
- FA2 last directly inspected individual-outcome guide (2025–26): https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/FA2%20S25-A26%20syllabus%20and%20study%20guide%20-%20final.pdf

## Important evidence limitation

Official ACCA pages verify that 2026–27 FA2 and MA2 syllabus PDFs are published, but their full 2026–27 PDF contents could not be retrieved using this audit's available access. Consequently no claim of exact letter-by-letter mapping to those two current PDFs is made. Other 2026–27 detailed guides were not fully compared outcome-by-outcome in this run. This report is a repository-wide **structure and content-depth audit plus targeted official cross-checks**, not a completed 25-paper content certification.

**Artifacts:** This report and its CSV live on the quality-gate audit branch, with the same counts and auditable topic inventory.
