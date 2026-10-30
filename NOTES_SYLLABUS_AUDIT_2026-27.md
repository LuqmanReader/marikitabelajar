# LedgerPeer FIA–ACCA Notes: syllabus coverage audit

Audit date: 30 October 2026. Repository: `LuqmanReader/marikitabelajar`.

## Scope and source certainty

The website loads `acca-published-data.js` followed by `notes-uk-syllabi.js`, `notes-data.js` and `notes-expanded-data.js`. Its displayed topic inventory therefore **must be audited after** the notes-only UK syllabus overrides. The raw catalogue without overrides is not the live result.

The repository contains putative 2026–27 PDF references, but at audit time the FA2 and MA2 2026–27 guides could not be independently retrieved from ACCA. For those papers the directly inspected and verified official publications were:

- **FA2 (September 2025–August 2026):** https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/FA2%20S25-A26%20syllabus%20and%20study%20guide%20-%20final.pdf
- **MA2 (September 2025–August 2026):** https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/MA2%20S25-A26%20syllabus%20and%20study%20guide%20-%20final.pdf

**Do not claim these FA2/MA2 materials are verified against the 2026–27 edition.** Recheck the official release once accessible. Other FIA/ACCA paper-specific editions and variants likewise need independent content-level verification before awarding a "complete" label.

## Actual note index (after the live override)

| Paper | Indexed headings | Headings with introductory notes |
|---|---:|---:|
| FA1 | 19 | 19 |
| MA1 | 13 | 13 |
| FA2 | 22 | 22 |
| MA2 | 20 | 20 |
| FBT | 36 | 36 |
| FMA | 25 | 25 |
| FFA | 35 | 35 |
| FAU | 27 | 27 |
| FFM | 24 | 24 |
| FTX | 40 | 40 |
| BT | 36 | 36 |
| MA | 25 | 25 |
| FA | 35 | 35 |
| LW (notes variant) | 20 | 20 |
| PM | 28 | 28 |
| TX (notes variant) | 36 | 36 |
| FR | 26 | 26 |
| AA | 32 | 32 |
| FM | 31 | 31 |
| SBL | 42 | 42 |
| SBR | 22 | 22 |
| AFM | 28 | 28 |
| APM | 20 | 20 |
| ATX (notes variant) | 24 | 24 |
| AAA | 34 | 34 |
| **Total** | **700** | **700** |

The raw catalogue without variant overrides instead contains 704 headings and 695 associated note entries; its unmatched IDs are LW:G2; TX:A7, TX:D5, TX:F4; ATX:A7, ATX:B6, ATX:B7, ATX:B8, ATX:C6. **These are NOT nine missing headings on the actual live Notes page.** They result from comparing the wrong jurisdiction/index layer. Always distinguish these configurations in reporting.

## Defects found

1. **Heading coverage is not learning-outcome coverage.** The old coverage panel treated the presence of a note object as a lesson count, even when the topic contained ten or more official a/b/c learning outcomes. A heading count of 100% was easily mistaken for completeness.
2. **Core note format is too short.** The FA2 and MA2 base lessons generally contain a 100–240-character summary, three teaching bullet points, a short illustrative example and one self-check, not thorough syllabus-level treatment.
3. **Shared chapters are not topic-complete.** `fia-study-data-v2.js` maps 261 topics into 37 shared chapters. The same chapter can serve unrelated learning outcomes; its text is not a per-outcome checklist.
4. **No clear K/S outcome display.** ACCA distinguishes knowledge [K] and skill [S]; the old Notes page did not show individual outcome codes or these assessment levels.
5. **Source-edition mismatch risk.** The source index advertises 2026–27 guides, while FA2/MA2 latest directly retrievable official documents were 2025–26. Do not silently relabel those as 2026–27 compliant.
6. **Misleading filter choices.** With notes under all 700 effective headings, "Topics needing lessons" showed none, even though detailed outcome teaching was largely unreviewed.

## Specific gaps identified from official, directly verified FA2/MA2 guides

| Topic | Verified 2025–26 individual study-guide outcomes | Existing note deficiency |
|---|---|---|
| FA2:D4 Tangible non-current assets and depreciation | 15 (a–o) | No separate teaching for part exchange, non-current asset register and reconciliation; too little ledger practice |
| FA2:D5 Accruals, prepayments, accrued and deferred income | 6 (a–f) | Four adjustment types compressed into one short summary |
| FA2:D6 Receivables, payables and provisions | 11 (a–k) | Gross/net receivables example but no full contra or provision workflow |
| MA2:A4 Information for comparison | 10 (a–j) | Lacked a complete fixed-versus-flexed budget working and exception-reporting discussion |
| MA2:B2 Accounting for labour | 8 (a–h) | No clear worked efficiency/capacity/production-volume/idle-time ratio breakdown |
| MA2:C1 Absorption costing | 10 (a–j) | Lacked allocation, apportionment, service-centre step-down and over/under absorption workings |
| MA2:C2 Marginal costing | 6 (a–f) | No full profit-statement structure or inventory-change profit reconciliation |
| MA2:D1 CVP analysis | 6 (a–f) | Brief break-even formula without a worked sensitivity and target-profit example |

## Changes on this branch

- New `notes-outcome-lessons.js` contains independent, original teaching at **72 individually coded K/S outcomes** across the eight topics above and **17 further worked examples**.
- `notes-page.js` renders each distinct learning outcome with its own code, explanation and calculations, in addition to older related teaching.
- The Notes view shows **starter coverage and outcome-expanded coverage separately**, with a current-edition warning. A "starter" or "outcome-expanded" flag is **not ACCA certification**.
- `notes.html` includes the new content before the Notes renderer, adjusts the introductory language, and fixes filters for expanded versus pending topics.
- `notes.css` displays outcome cards and worked examples in a legible mobile-friendly format.
- FA2/MA2 source buttons point to the last directly verified official 2025–26 guides until their 2026–27 sources can be checked.

## Remaining work (not claimed complete)

- Independently retrieve and compare *each* paper's actual 2026–27 official detailed study guide and examinable documents, including paper/jurisdiction-specific effective dates.
- Build a proper paper → major syllabus section → topic → a/b/c outcomes database for every paper (not just topic headings).
- Review the remaining **692 effective headings** for individual learning-outcome completeness; many already have useful shared lessons but have not passed this audit.
- For each outcome add rigorous narrative explanations, justified workings, multi-step exams, common traps and question-to-outcome tagging. Verify legal/tax and other jurisdiction-dependent material separately.
- Subject-matter review for all numerical examples and ledger entries; add automated content validation and link checks.
- Do not present an outcome-expanded note as fully exam-ready until it passes both content review and current-edition check.

This is an **actual code-and-content improvement with explicitly bounded scope**, not a claim to have completed 25 syllabuses.
