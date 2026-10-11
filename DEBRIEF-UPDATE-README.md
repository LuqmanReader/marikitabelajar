# LedgerPeer · Unified AI Debrief (2026-10-11)

## New workflow

1. Add a marked attempt in Add Exam (unchanged).
2. Open the attempt review: click **Analyze all questions with AI** if your Supabase Edge Function `analyze-attempt` is installed, OR click **Copy AI request**, paste it into ChatGPT, paste the complete JSON reply into LedgerPeer.
3. Click **Apply debrief & update graphs**. LedgerPeer checks the question numbers, keeps original marks/answers, stores feedback and topic labels, and rebuilds strengths/weaknesses and graphs from original results.

**The manual path works without a Gemini API or external server.** The in-app Analyze button REQUIRES the existing Supabase `analyze-attempt` Edge Function and AI credentials configured server-side; this ZIP does not install the backend. If Gemini fails, use ChatGPT manual copy/paste.

## Why graphs agree with exam results

The AI no longer produces topic rankings or numeric scores. `ChapterAnalysis` aggregates the original marked results by the AI-assigned primary topic. Topics with fewer than three graded questions are not categorized as strong/weak (but still appear in graphs). All attempts remain separate; importing a debrief updates the same attempt, not a duplicate.

## Files changed

- `revision-flow.js`: shorter AI request retaining the existing `personal-hub-debrief-v2` JSON format and attempt signature.
- `debrief-workflow.js`: streamlined automatic/manual controls, optional preview, completeness warnings, and one-click import.
- `revision-flow.css`: visual polish matching neobrutalism.
- `add-exam.html`, `hub.html`: matching 3-stage workflow labels.

## Future chatbot (NOT part of this update)

An authenticated student tutor could answer questions about a specific attempt, cite Q numbers, and use weak topics to suggest practice. It needs its own Supabase Edge Function, per-user authorization, rate limits, and securely stored AI API credentials. Never expose API keys in GitHub Pages JavaScript.

## Deployment / smoke test

Back up the live repository first. Upload the extracted ZIP contents to the GitHub repository root (not the ZIP itself). Preserve any newer code deployed since this archive. Try a new marked attempt in a test account. Copy the prompt into ChatGPT and verify that the returned JSON imports, topic coverage rises, and `hub.html#analysis` updates. Check Supabase sync status before switching devices.
