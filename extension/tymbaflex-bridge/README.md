# LedgerPeer TYMBAFlex Bridge (Chrome / Edge)
This is an **independent, read-only companion**, not an official TYMBAFlex integration.

## Install
1. Download this extension folder to your computer (download the repository ZIP, then extract `extension/tymbaflex-bridge`).
2. Go to `chrome://extensions` or `edge://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the extracted `tymbaflex-bridge` folder.
3. Sign in to `https://flex.tymbaedu.com/` normally. Chrome/Edge may remember your password in their built-in password manager — LedgerPeer does not store it.
4. Open your FA2 / MA2 course tabs (Moodle) and keep TYMBAFlex **Home** open.
5. Visit `https://luqmanreader.github.io/marikitabelajar/tymbaflex-bridge.html`, sign in to LedgerPeer and click **Sync Open Tabs**.
6. Tick the ownership/permission confirmation. Your TYMBAFlex email may differ from your LedgerPeer email. Click Sync Open Tabs; only your own visible course list and activity links are saved to your private Supabase account.

## ILE Chrome diagnostic (FA2 and MA2)

This extension now has a **TYMBAFlex ILE Diagnostic** popup.

1. In Chrome, open `chrome://extensions`, enable Developer mode, and **Reload** this extension (or install it using Load unpacked).
2. Open **MA2**: `https://ile.flex.tymbaedu.com/course/view.php?id=5`, while signed in to your own TYMBAFlex account.
3. Click the **LedgerPeer TYMBAFlex Bridge** extension icon in Chrome (pin it if needed), then click **SCAN CURRENT ILE TAB**.
4. The report separates **Tutorial Chapters** (MA2) from **Chapter Sets, Progress Tests and Mock Examinations** (FA2). It also counts the Moodle course-page `Done`, `To do` and `Unknown` indicators.
5. Open **FA2**: `https://ile.flex.tymbaedu.com/course/view.php?id=11`, then repeat the scan.
6. Click **EXPORT JSON** only if you want a local, sanitized diagnostic report; this does not send the report anywhere. Don't export account pages or attempt pages.

### Findings from the supplied saved HTML pages (29 October 2026)
- **MA2 course 5:** 23 `Tutorial Chapter` quizzes. Four display `Done` and 19 display `To do`.
- **FA2 course 11:** 38 chapter-set quizzes, two progress tests, and two mock examinations (42 quizzes in total).
- The saved FA2 course page does not display a recognisable completion button for these 42 quiz items, so their completion is reported as **Unknown**, not incomplete.
- `Done` is Moodle course-activity completion, **not** an exam grade and not necessarily a pass.

### Troubleshooting
- If the popup says **Refresh the ILE page**, reload that course tab after reloading or installing the extension, then scan again.
- If Chrome can't open the extension, check `chrome://extensions` for an error.
- If the page has been updated since the saved HTML was captured, the current scan may differ from the historical findings above.
- No password, session token, arbitrary institutional endpoint, quiz attempt text, or grade is collected by this diagnostic.

## Exactly what this reads
- Portal: account **email only for comparison**, course titles, IDs, course group and LMS domain (never passwords, SSO links, tokens, raw HTML, invoices or grades).
- Open Moodle **course overview pages only**: activity names, section headings, whitelisted module URLs, visible completion indicators.
- Does **not** open new tabs, login on your behalf, run hidden queries, access assignments or exam attempts, or read other students' content.
- Does not persist data inside Chrome extension storage; clicking Sync sends the sanitized snapshot only to the matching LedgerPeer page. LedgerPeer stores it under the signed-in user with RLS.

## Limitations
- TYMBAFlex's saved HTML does not prove its private endpoints are a public or authorized API.
- An email match is a linking check, not single sign-on.
- A different portal and LedgerPeer email is allowed only for a user-confirmed, read-only course-data import. This does not link TYMBAFlex credentials or authorize silent account login.
- The course pages show activity links, but may not show marks or full attempted-question results.
- No auto-login or password capture. Password autofill is the browser's responsibility.
