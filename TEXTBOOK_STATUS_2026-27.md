# LedgerPeer FIA–ACCA Notes: 2026–27 release and quality status

**Release:** 31 October 2026 · Notes build `2026.10.31.38`  
**Repository:** `LuqmanReader/marikitabelajar`, main  
**Scope:** 25 paper and jurisdiction-variant indices; 700 syllabus topic headings

## Academic reconciliation progress (31 October 2026)

The first **350** student-visible lesson records (FA1:A1 through FA:G4) have been read from the actual Notes page source order and compared to **10 distinct dated official 2026–27 ACCA PDFs**, including separate exam cycles for FAU/FFM (December 2026–June 2027) and FTX-UK (June 2026–June 2027). The detailed syllabus extraction yielded **1,283 paper-specific lettered outcome candidates** across the 350 chapter headings. This is a source-to-content *screening*, **not 1,283 independent academic sign-offs**.

- **774** published worked cases were inventoried; **689** extractable arithmetic equalities recalculated without a reported mismatch. Remaining statements, accounting classifications and journals have not all been independently assessed.
- Official-source evidence still identifies **188 possible missing-detailed-outcome terminology flags** and **12 hands-on computer-skill assessment flags**. These flags are risk signals, not definitive failures or definitive passes.
- The lesson-depth gate still finds **244 low-text-depth reviews**, **53 fewer-than-two-worked-cases reviews**, **48 short-solution reviews** and **8 multiple-source definitions**. An editorial word count is not an ACCA threshold.
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
