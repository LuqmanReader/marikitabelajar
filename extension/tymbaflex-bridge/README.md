# LedgerPeer TYMBAFlex Bridge (Chrome / Edge)
This is an **independent, read-only companion**, not an official TYMBAFlex integration.

## Install
1. Download this extension folder to your computer (download the repository ZIP, then extract `extension/tymbaflex-bridge`).
2. Go to `chrome://extensions` or `edge://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the extracted `tymbaflex-bridge` folder.
3. Sign in to `https://flex.tymbaedu.com/` normally. Chrome/Edge may remember your password in their built-in password manager — LedgerPeer does not store it.
4. Open your FA2 / MA2 course tabs (Moodle) and keep TYMBAFlex **Home** open.
5. Visit `https://luqmanreader.github.io/marikitabelajar/tymbaflex-bridge.html`, sign in to LedgerPeer and click **Sync Open Tabs**.
6. Only if the TYMBAFlex portal email matches your LedgerPeer account email will your course list and visible activity links be saved to your private Supabase account.

## Exactly what this reads
- Portal: account **email only for comparison**, course titles, IDs, course group and LMS domain (never passwords, SSO links, tokens, raw HTML, invoices or grades).
- Open Moodle **course overview pages only**: activity names, section headings, whitelisted module URLs, visible completion indicators.
- Does **not** open new tabs, login on your behalf, run hidden queries, access assignments or exam attempts, or read other students' content.
- Does not persist data inside Chrome extension storage; clicking Sync sends the sanitized snapshot only to the matching LedgerPeer page. LedgerPeer stores it under the signed-in user with RLS.

## Limitations
- TYMBAFlex's saved HTML does not prove its private endpoints are a public or authorized API.
- An email match is a linking check, not single sign-on.
- If the portal and LedgerPeer emails differ, syncing is blocked; use a verified account or request an institutional integration.
- The course pages show activity links, but may not show marks or full attempted-question results.
- No auto-login or password capture. Password autofill is the browser's responsibility.
