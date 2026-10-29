# LedgerPeer TYMBAFlex Bridge (Chrome / Edge)
This is an **independent, read-only companion**, not an official TYMBAFlex integration.

## Install
1. Download this extension folder to your computer (download the repository ZIP, then extract `extension/tymbaflex-bridge`).
2. Go to `chrome://extensions` or `edge://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the extracted `tymbaflex-bridge` folder.
3. Sign in to `https://flex.tymbaedu.com/` normally. Chrome/Edge may remember your password in their built-in password manager — LedgerPeer does not store it.
4. Open your FA2 / MA2 course tabs (Moodle) and keep TYMBAFlex **Home** open.
5. Visit `https://luqmanreader.github.io/marikitabelajar/tymbaflex-bridge.html`, sign in to LedgerPeer and click **Sync Open Tabs**.
6. Tick the ownership/permission confirmation. Your TYMBAFlex email may differ from your LedgerPeer email. Click Sync Open Tabs; only your own visible course list and activity links are saved to your private Supabase account.

## Course diagnostic — ILE + Group B (Chrome extension v0.3.0)

The same **LedgerPeer TYMBAFlex Bridge** extension now supports all four course pages:

| Paper | Site | Course URL |
| --- | --- | --- |
| MA2 Videos & Notes | ILE | `https://ile.flex.tymbaedu.com/course/view.php?id=5` |
| FA2 Videos & Notes | ILE | `https://ile.flex.tymbaedu.com/course/view.php?id=11` |
| Group B MA2 | TwoFive | `https://twofive.flex.tymbaedu.com/course/view.php?id=757` |
| Group B FA2 | TwoFive | `https://twofive.flex.tymbaedu.com/course/view.php?id=758` |

### Update and run
1. Download the **latest** extension ZIP under the GitHub Actions workflow's **Artifacts** section. Extract it to a local folder containing `manifest.json`.
2. If you installed the previous unpacked extension, replace the extension files in that *same local folder*, then open `chrome://extensions` and click **Reload**. Alternatively, remove the previous version and **Load unpacked** from the extracted updated folder. The version displayed should be **0.3.0**.
3. Sign in to TYMBAFlex using your existing browser session; open any of the course URLs above.
4. Click the Chrome extension icon and **SCAN CURRENT COURSE**. It inspects the *currently active* course tab only, including quiz names, tutorial names, chapter sets, tests, and visible Moodle `Done`, `To do`, or `Unknown` completion indicators.
5. Choose a category in the dropdown or click **EXPORT JSON** to save a local sanitized report. Repeat on another course tab as needed.

The diagnostic recognises `Tutorial Chapter` quizzes, `Chapter N set M` quizzes (including Group B), progress tests, mocks and dated quizzes such as `Quiz 29/9/26`. Those that do not clearly belong to a category are still listed as *Other quizzes*.

### What the saved course pages established (29 October 2026)
- MA2 ILE had 23 named tutorials; four displayed `Done` and 19 displayed `To do`.
- FA2 ILE had 42 quizzes including chapter sets, progress tests and mocks.
- Group B MA2 and Group B FA2 course overview pages contain quiz activities with their own Group B links; this diagnostic reads those links directly from the open page.

These are historic snapshots, not verified current live counts. A Moodle activity showing `Done` is not necessarily a quiz pass, and `Unknown` does not mean unfinished.

### Troubleshooting
- If the popup cannot read the page, refresh the course tab **after** reloading or installing v0.3.0.
- Make sure the active tab is `/course/view.php?id=...` on the ILE or TwoFive Moodle host, not a quiz attempt, login, grade or dashboard page.
- Review `chrome://extensions` for browser installation errors.

This is a read-only in-page diagnostic. It does not request protected endpoints, automate login, capture passwords or tokens, inspect quiz attempts, or retrieve marks.

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
