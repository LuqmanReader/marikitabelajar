# FIA–ACCA notes expansion

The notes library maps all 700 top-level syllabus headings across the 25 selected papers to core lesson entries. It previously contained 89 lesson entries. Each entry has an introduction, teaching points, a formula or decision rule, an example, an exam trap and a self-check with an answer. Content is original; shared concepts are reused across related papers and recorded with adaptedFrom where applicable.

## Scope and review status

This is complete **top-level topic mapping**, not a verified complete textbook. A heading can contain many separate detailed learning outcomes. The short core lessons, including those reused at advanced levels, do not establish complete treatment of those outcomes. Newly authored material is explicitly pending editorial review. Exam-standard question practice, current tax tables, all relevant exceptions, and a qualified content review remain necessary before representing the site as sufficient on its own. A 700/700 counter must not be described as exam readiness or mastery.

## Variants and edition

- LW uses England (ENG), September 2026–June 2027.
- TX and ATX use UK, June 2026–June 2027, Finance Act 2025 / tax year 2025–26.
- FTX retains the UK source in the existing catalog.
- SBR and AAA retain INT; other papers retain their existing catalog variants.
- notes-uk-syllabi.js provides notes-only overrides. The original LedgerPublishedSyllabi and all historical revision classifications remain unchanged.
- Illustrative tax computations use explicitly supplied assumptions, not a full replacement for session tax tables.

## Sources

Each paper links to its official ACCA syllabus PDF in the data bundle. The UK overrides were checked against:

- https://www.accaglobal.com/content/dam/acca/global/PDF-students/acca/f4/studyguides/lw_eng_s26_j27_syllabus_and_study_guide.pdf
- https://www.accaglobal.com/content/dam/acca/global/PDF-students/acca/f6/studyguides/tx_uk_j26_j27_syllabus_and_study_guide.pdf
- https://www.accaglobal.com/content/dam/acca/global/PDF-students/acca/p6/studyguides/atx_uk_j26_j27_syllabus_and_study_guide.pdf

Other syllabus headings retain the existing official-source catalog. Current reporting/audit requirements must be checked against the session-specific examinable documents, not simply their real-world effective dates:

- https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f7/examinable-documents.html
- https://www.accaglobal.com/gb/en/student/exam-support-resources/professional-exams-study-resources/p7/examinable-documents.html

## Implementation

Static, buildless files. Load notes-uk-syllabi.js and notes-expanded-data.js after the existing catalog and lesson data and before notes-page.js. New lessons load into the DOM only when their topic is opened. Authentication and account data are not modified. The coverage map lists paper variants and maps directly to paper deep links.

## Validation

Run:

```
node --check notes-expanded-data.js
node --check notes-uk-syllabi.js
node --check notes-page.js
node tests/fia-notes-regression.js
node tests/notes-coverage-regression.js
node tests/notes-reader-regression.js
```

The reader test uses a minimal DOM and mocked authentication; it checks rendering, lazy loading, filters, empty states, deep links and rejection before authentication. It does not verify real Supabase sign-in or browser layout.
