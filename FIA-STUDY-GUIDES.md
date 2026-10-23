# Expanded FIA study guides — edition 2

This update responds to the short topic cards with 37 original teaching chapters containing 14,531 words, shared across ten FIA reading routes. Chapters contain explanatory sections, complete workings for illustrative cases, independent practice and explained answers. They are available in fia-study.html and inline within related FIA topics in notes.html.

## Find the change

Open `fia-study.html` directly. Its new URL, new asset filenames and visible edition banner distinguish it from the previous page. The notes page has a prominent launch panel and newly versioned assets. Homepage workspace navigation links to the guide. A user reporting no change should have their exact URL checked; successful repository deployment alone does not prove which URL or cached page their browser displayed.

## Scope

This is a substantial revision-guide expansion, not certification that every detailed FIA learning outcome is fully taught. The 261-topic mapping selects **related reading**, not a claim that a whole chapter is exclusive to or sufficient for each heading. Shared accounting and management chapters are reused explicitly across related papers. New material remains pending editorial review. Do not represent word count, chapter count or route mapping as mastery, completeness or a complete question bank.

## Authoring

Edit the original chapter source in `fia-authoring/`. Run `node fia-authoring/build.cjs` from the repository root to compile `fia-study-data-v2.js`. The compiled file, not the authoring source, is loaded by the browser. The CI workflow verifies that compiled data matches the tracked source.

The original lesson cards remain available. `fia-study-content-v2.js` safely inserts longer related chapters inline using text nodes. `fia-study-reader-v2.js` provides paper selection, chapter navigation, search, full-route reading and print. No authentication implementation or account data is changed.

## FTX basis and sources

FTX uses UK Finance Act 2025 and tax year 2025/26 for June 2026, December 2026 and June 2027 examinations. Source links appear in the reader:

- https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/ftx/examdocs/ftx_uk_tax_rates_j26_j27.pdf
- https://www.accaglobal.com/gb/en/student/exam-support-resources/foundation-level-study-resources/ftx/ftx-technical-articles/finance-act-2025.html
- https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/ftx/examdocs/ftx_uk_j26_j27_examinable_docs_fa2025.pdf

Other paper syllabus links retain the existing official-source catalog. Original explanations and examples are not reproduced textbooks.

## Verification

Data and reader tests check all ten paper routes, 261 related-reading links, answer sections, search, navigation, deep links, print invocation and unsigned access. The inline notes-reader test also verifies that longer chapters are actually rendered in FIA topic cards. These tests use a minimal DOM and mocked authentication, not a real browser or student account. Live browser layout and actual sign-in remain unverified. Direct live-page verification was interrupted at the network-permission step; deployment must be confirmed separately through GitHub Actions.
