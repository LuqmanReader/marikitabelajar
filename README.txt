PERSONAL HUB — REVISION AND FINANCE
=================================

DEPLOY
Extract and upload all 25 files together to your GitHub Pages repository root.
Replace existing files; index.html belongs at the top level. After deployment,
hard refresh the browser. This ZIP does not change your live website itself.

GUIDED REVISION FLOW
1. Add a Set / Test Attempt. Choose a subject, Chapter set, Progress Test or
   Mock Test, its number and attempt date. Chapter sets need a chapter name.
   Total sets is optional and can differ per chapter. Retakes are separate attempts.
2. Upload marked attempt-review HTML or questions JSON. Preview and save.
   The website immediately builds your answer review from the original results.
3. On the saved attempt, select Copy AI request and paste it into ChatGPT.
   The readable request includes questions, answers and results. Add your textbook
   chapter list to guide its tags if needed. No API is required.
4. Paste the AI response into the site, or upload its JSON/TXT file. Select
   Preview feedback, check the chapter tags and explanations, then Save debrief
   & update analysis. Reasoning, Calculation and Justification appear separately,
   with practice focus where supplied. You can also edit chapter tags manually.

The copied request asks AI for structured JSON. The importer checks attempt
identity and question numbers, retains original questions, answers and marks,
and previews warnings. Partial responses preserve omitted fields. Topic rankings
are computed by the website from original scored answers and chapter tags.

ANALYSIS
Topic Progress Line Graph plots chronological attempt accuracy, with separate
Chapter set, Progress Test and Mock Test series. Select subject, attempt type
and topic. Missing attempts are not drawn as zero; genuine zero scores are shown.
Swipe horizontally on small screens, or expand the plotted-attempt table.

Topic Ranking runs strongest to weakest, using question-weighted accuracy across
active attempts. Strengths and Practice Priorities use the same subject/type:
  Strong: at least 80%, with at least 3 scored tagged answers.
  Needs Work: below 60%, with at least 3 scored tagged answers.
  Developing: 60% to below 80%, with at least 3 scored tagged answers.
  More evidence needed: fewer than 3 scored tagged answers.
These describe recorded performance, not proof of long-term mastery.

Set coverage counts distinct set numbers per chapter. A retake adds evidence but
does not count as another completed set. Unscored or untagged answers are reported
and excluded from topic percentages. Overall Test Score Trend uses the latest
attempt per numbered Progress Test or Mock Test. Debrief reviews do not change marks.
Reset Analysis excludes existing attempts while retaining saved attempts,
debriefs, chapter lists and financial records. New attempts start fresh analysis.

DATA AND FINANCE
Records live in this browser's localStorage. Devices, browsers and website origins
have separate data. Download an attempt backup and use finance backup controls.
Clearing browser storage can erase records. The static password lock is a browser
convenience, not server-side access control. Financial Tracker and Financial
Dashboard remain available. Records and wealth snapshots are entered manually.
No market-price, bank-sync or OpenAI API is configured.

VALIDATION
Verified the complete upload, AI preview/save and analysis flow in Chromium on
desktop and mobile. Checked all three attempt types, rankings, graph filters,
retakes, varied chapter set totals, partial/legacy imports, original mark
preservation, invalid-response rejection, sanitization and reset preservation.
