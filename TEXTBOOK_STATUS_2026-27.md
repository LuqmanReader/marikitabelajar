# LedgerPeer FIA–ACCA Notes: 2026–27 release and quality status

**Release:** 31 October 2026 · Notes build `2026.10.31.43`  
**Repository:** `LuqmanReader/marikitabelajar`, main  
**Scope:** 25 paper and jurisdiction-variant indices; 700 syllabus topic headings

## Full-scope outcome and technical review register — 31 October 2026

Merged [PR #25](https://github.com/LuqmanReader/marikitabelajar/pull/25) and [PR #26](https://github.com/LuqmanReader/marikitabelajar/pull/26). The [full-register CI run](https://github.com/LuqmanReader/marikitabelajar/actions/runs/41210006858) and subsequent [practical-skill approval-gate CI run](https://github.com/LuqmanReader/marikitabelajar/actions/runs/41210506594) both passed.

- **2,357/2,357** official detailed outcomes and practical-skill requirements indexed with page links, source and lesson fingerprints, candidate explanations, applications, domain flags and review decisions.
- **1,489/1,489** published worked questions/solutions inventoried individually, linked to candidate ACCA outcomes, formula recomputations, debit/credit balance results, technical topics and explicit outstanding checks.
- **1,107** extractable equations recalculated, no detected arithmetic discrepancy; **183** parseable debit/credit groups balance. **12** journal posting statements remain ambiguous.
- **415** outcome rows have no automatically suggested teaching section; **995** outcome rows have no automatically suggested worked application; **859** worked examples have no extractable equation. These are evidence gaps, not conclusive proof of incorrect content. A conceptual worked example may correctly have no numerical equation.
- Official **2026–27 ACCA PDF sources: 22/22**; source headings matched for **700/700** lesson records; 358 possible outcome terminology mismatches and 56 practical computer-based requirements remain in the review queue.

The reproducible outputs are `audit/all700-academic-outcome-review-ci.json`, `audit/all700-academic-outcome-review-ci.csv`, `audit/all700-technical-worked-answer-review-ci.json`, `audit/all700-technical-worked-answer-review-ci.csv` and `audit/all700-full-review-summary-ci.md`, published as GitHub Actions artifacts `ledgerpeer-full-2026-27-academic-review`. A six-tab review spreadsheet is available in the associated ChatGPT conversation.

**Release benchmark:** Ordinary development CI may pass while substantive academic/technical reviews remain incomplete. The separate `.github/workflows/notes-academic-release.yml` is intentionally fail-closed until ALL **700/700** current lesson/source hashes, complete outcomes, worked answers, standards/jurisdictions, visual evidence and qualified independent reviews are documented. It also requires actual computer-based exam demonstrations for practical-skill entries.

**Accreditation / independent academic sign-off remains 0/700.** The register provides full review *coverage*, not completion of the professional verification itself; LedgerPeer is not ACCA-affiliated or ACCA-certified.

## Debit-credit accounting audit (31 October 2026)

The all-700 journal verifier `scripts/audit-all700-journals.py` and its regression were merged via [PR #23](https://github.com/LuqmanReader/marikitabelajar/pull/23), commit `aeda50d49d042176b4483bfb979f830c179a13f7`. [Notes quality gate run 41207524912](https://github.com/LuqmanReader/marikitabelajar/actions/runs/41207524912) **passed** and archived an itemised journal-balance artifact.

The run reconstructed **183 uniquely parseable debit/credit posting groups**, all with equal totals, and separately reported **12 ambiguous/alternative posting groups** for manual review. The mathematical expression audit still reported **1,107 extractable identities / zero mismatches** across **1,489 worked cases**. These two checks confirm specified arithmetic identities and entry balances; they do not prove account selection, financial reporting compliance or the full validity of each worked solution.

**Academic outcome-by-outcome sign-off remains outstanding**; 0/700 lessons are independently certified. Avoid representing automated arithmetic as a completed academic audit.

## Latest tested release — full-library verification pipeline (31 October 2026)

**Deployment:** Merged [PR #22](https://github.com/LuqmanReader/marikitabelajar/pull/22), commit `04d5fea9405c1ac78261ce5ff304f25179025ae5`. The updated source is on `main`.

**Verified CI execution:** [Notes quality gate run 41207123972](https://github.com/LuqmanReader/marikitabelajar/actions/runs/41207123972) passed, as did the FIA and Classroom regressions from the same PR revision.

**Measured outputs:** 700/700 actual published chapters; **1,489** worked cases inventoried; **1,107** extractable arithmetic identities recalculated with zero flagged mismatches; all **22** official ACCA 2026–27 source PDFs downloaded and dated; **700/700** official headings aligned; **2,301** candidate detailed outcomes extracted. The source matcher explicitly handles cross-column outcomes, direct unlettered UK tax objectives, and an AFM F4 numbering anomaly in ACCA's guide.

The current whole-library review queue still reports **358 possible detailed-outcome terminology discrepancies**, **56 practical computer-skill review flags**, and other source-extraction qualifications. These flags are not confirmed wrong lessons. **0/700** chapters have documented independent academic sign-off; machine-check results must not be represented as full verification or external ACCA approval.

**Substantive repair:** `FR:B9` now covers all six lettered ACCA 2026–27 topic outcomes at the instructional level, including IFRS 5, IAS 8, IAS 33 EPS calculations and IFRS S1, with worked exam-style examples. The mapped internal crosswalk is `audit/academic-reviews/fr-b9-2026-27.json`, explicitly not an independent professional certification.

## Full 700-topic audit execution — evidence-backed update (31 October 2026)

The repaired GitHub Notes quality workflow **passed** in [run 41206233388](https://github.com/LuqmanReader/marikitabelajar/actions/runs/41206233388), including the full library export, official syllabus source comparison, calculations, cross-reconciled evidence docket, academic approval anti-forgery tests and earlier targeted regressions. The independent student-facing [FIA notes library regression](https://github.com/LuqmanReader/marikitabelajar/actions/runs/41206233486) passed for the same tested revision. More recent curriculum-extraction and FR B9 corrections require their own CI evidence before treating them as tested.

The checked revision provided: **700/700 reader-visible chapters**, **1,484 worked cases**, **22/22 official ACCA 2026–27 PDFs**, **700/700 heading matches**, **2,279 candidate lettered outcomes**, and **1,096 extractable arithmetic calculations with zero detected mismatches**. The candidate-outcome extraction now distinguishes practical computer-based skills from lettered outcomes and documents the unusual AFM F4 official source numbering conflict. The reviewer docket still contained **356 possible detailed-outcome terminology flags** and additional extraction/practical competency review flags. These remain *potential issues*, not demonstrated missing teaching or technical correctness.

A focused substantive correction to **FR B9** has since added 2026–27 IAS 33 EPS (bonus, rights, convertibles, options), IFRS 5 held-for-sale/discontinued operations, IAS 8 policy/estimate/error distinctions, and IFRS S1 disclosures, with revised exam-style worked applications and dedicated test coverage. See the current pull request's CI results for the tested version.

**Important:** full independent academic sign-off is **0/700**. Passing a structural/content-screening pipeline does not independently establish that all 2026–27 learning outcomes, every IFRS/ISA/UK tax rule, every journal, and every worked example have been verified. Do not claim ACCA endorsement.

## Full-library audit repair (31 October 2026, after the first-350 snapshot)

The repository now includes `scripts/export-all700-live-lessons.cjs`, `tests/notes-all700-evidence.cjs`, `scripts/audit-all700-arithmetic.py`, and `scripts/audit-all700-official-pdfs.py`. The Notes quality workflow is configured to export each **reader-visible** chapter with a SHA-256 fingerprint, record the winning source for duplicate definitions, recalculate machine-extractable arithmetic, and compare syllabus headings with **22 distinct official 2026–27 ACCA PDF URLs** covering all 25 papers/variants. New full-library evidence artifacts are configured for upload. **Their successful end-to-end CI execution has not yet been confirmed here.**

A separate direct source preflight retrieved **all 97 lesson JavaScript files** (2,042,943 characters) and recalculated **49 unambiguous printed percentage-multiplication identities, with zero detected mismatches**. The same files had no matches for the narrow `Indonesia` or `RM [number]` patterns. These are strictly limited checks and should not be taken as proof of all worked-answer accuracy, proper accounting journal classification, current law/IFRS/ISA compliance, syllabus depth or visual usability.

A specific FA1:A1 settlement-discount syllabus-scope issue was corrected, a new credit-purchase discount journal application was added, and a regression guard was committed. The Notes reader no longer describes a **2025–26** reference as “verified” for the current syllabus. The build regression was corrected to match published build **.43**, and superseded GitHub Actions jobs now cancel to reduce wasted runs. The previous test had incorrectly expected build **.42**.

**Sign-off gate stays closed:** 0/700 fully evidenced academic approvals. The whole-700 automated suite creates a prioritized review queue; it is not an automatic examiner or ACCA accreditation. See [open full-academic-review blocker #20](https://github.com/LuqmanReader/marikitabelajar/issues/20).

## Academic reconciliation progress (31 October 2026)

The first **350** student-visible lesson records (FA1:A1 through FA:G4) have been read from the actual Notes page source order and compared to **10 distinct dated official 2026–27 ACCA PDFs**, including separate exam cycles for FAU/FFM (December 2026–June 2027) and FTX-UK (June 2026–June 2027). The detailed syllabus extraction yielded **1,283 paper-specific lettered outcome candidates** across the 350 chapter headings. This is a source-to-content *screening*, **not 1,283 independent academic sign-offs**.

- In the last completed first-350 CI snapshot, **838** published worked cases were inventoried and **797** extractable arithmetic identities recalculated without a reported mismatch. One additional FA1:A1 worked case has subsequently been committed; current totals must be refreshed from the next artifact. Remaining statements, accounting classifications and journals have not all been independently assessed.
- Official-source evidence still identifies **174 possible missing-detailed-outcome terminology flags** and **12 hands-on computer-skill assessment flags**. These flags are risk signals, not definitive failures or definitive passes.
- The lesson-depth gate still finds **224 low-text-depth reviews**, **51 fewer-than-two-worked-cases reviews**, **48 short-solution reviews** and **8 multiple-source definitions**. An editorial word count is not an ACCA threshold.
- Additional direct syllabus reconciliation and worked applications have been committed for **22 first-half lesson records** in the current revision, including FA1 A1–A3, FA/FFA A1/A3/A4, MA1 A1/A2/C1/C2/E1–E3, MA2 E1–E4, and FFM D4/F4. Earlier corrections for FA/FFA C/D sections and other topics remain part of the release.
- GitHub Notes academic-evidence regression **passed** on [the first-350 gate run](https://github.com/LuqmanReader/marikitabelajar/actions/runs/41191921970). The full audit evidence is available as that run's source matching, arithmetic, and student-visible lesson artifacts.

**Academic verification status: NOT COMPLETE.** In particular, no independently signed outcome-by-outcome review has been recorded for all first 350 chapters; **0/350** are eligible for an independent technical certification claim. The site must not represent structural tests, source matches, keyword presence or brief numerical checks as professional approval or ACCA endorsement.

## What is complete

- All **700 indexed topics now have separately authored teaching chapters**, including worked applications. No syllabus topic is limited to the earlier generated structured teaching draft.
- The audited source index records **97 source files**, **700 unique topic keys**, and **eight pre-existing duplicate source definitions**; where these overlap, the reader's merge order controls which chapter is displayed. The duplicate definitions concern FA1, MA1, FA2, and MA2—not missing syllabus topics.
- This release rewrote the remaining **102 previously draft-only topics**: **FTX-UK 33, TX-UK 30, ATX-UK 18, AAA-INT 20 and SBL 1**. The earlier 598 chapters were already individually authored.
- The Notes page loads the edited chapters before the reader; it contains dedicated 2026–27 supplements for IFRS 18 (FA2, FA/FFA, FR, SBR), amended PM/APM learning outcomes, and overseas tax under Finance Act 2025 (ATX-UK A1–A3).
- FIA and ACCA still have separate qualification filters, while selected numerical and visual bookkeeping resources remain available.

## What is NOT certified or verified

**Chapter count is not learning-outcome certification.** The structural tests show 700 unique authored chapter keys. They cannot independently establish that every paragraph and numerical answer is technically correct, or that all nested a/b/c ACCA learning outcomes are taught to the examination's intellectual level. **Full detailed outcome review remains outstanding for all 700 topics**, except for selected requirements investigated in the 2026–27 change supplements. This is **not an ACCA-endorsed or ACCA-accredited study text**.

Jurisdiction matters: the library uses **LW-ENG, TX-UK, FTX-UK, ATX-UK, SBR-INT, AAA-INT**. The UK tax papers cover **June 2026–June 2027** and the examinable **Finance Act 2025 / 2025–26 tax year**; most other session exams use a September 2026–June 2027 guide. Students should match their actual exam date and jurisdiction to the official guide.

## Quality gates and source references

1. `node tests/notes-all700-teaching.cjs` — syllabus keys and authored-versus-draft chapter count.
2. `node tests/notes-depth-regression.cjs` — chapter section and worked-example shape, plus page loader checks.
3. `node tests/notes-2026-curriculum.cjs` — 700 paper-specific syllabus headings and 16 targeted change supplements, with the full-review limitation explicitly recorded.
4. `node tests/notes-release-regression.cjs` — build marker and cache refresh.
5. `audit/authored-chapter-index.json` — source file/key inventory.
6. `audit/notes-2026-27-review-matrix.json` — 700 individual review entries and outstanding evidence for full sign-off.

The GitHub Actions workflow `.github/workflows/notes-quality.yml` is configured to run these tests when relevant files change. **A configured check is not evidence it passed.** Before any verified status is applied, record the actual test run, source/learning-outcome comparison, mathematical reconciliation and reviewer evidence.

**Official references:** ACCA paper-specific syllabus/study guides, [ACCA 2026/27 syllabus changes](https://www.accaglobal.com/content/dam/ACCA_Global/Students/resourceFinder/acca-syllabus-changes.pdf), [FA2/FA/FFA examinable documents](https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/fa2_ffa_s26_j27_examinable_docs.pdf), and [ACCA Study Hub](https://www.accaglobal.com/my/en/student/your-study-options/studyhub.html).

## Required criteria before a full learning-outcome sign-off

For **each** topic: compare every detailed learning outcome and its intellectual level with the correct official 2026–27 guide; verify the exact legal/IFRS/ISA provisions and their examinable period; manually recompute every worked answer and investigate any contradiction; ensure concepts, exceptions, interpretation and realistic exam application are present; check language, formatting, accessibility and visual integrity. Record source page, date and a reviewer decision. None of those requirements is satisfied merely by a chapter's existence or word count.
