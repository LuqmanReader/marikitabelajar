# LedgerPeer — Local-first autosave update

## What changed

- **Save to Cloud button removed.** Any feature that already writes to browser storage now saves locally immediately, with background Supabase sync attempted automatically.
- **Newly imported attempts open immediately.** After clicking **Save attempt & open debrief**, you no longer have to wait for cloud verification.
- **Debriefs persist locally first.** Applying an AI debrief doesn't block on cloud access.
- **Safer reloads.** LedgerPeer retains un-synced changes on the same browser and signed-in account instead of replacing them with an older cloud snapshot.
- **Conflict protection.** If the remote record changed since the last verified backup, LedgerPeer preserves the local copy and pauses cloud writes instead of silently overwriting either version.
- **Live sync indicator.** Bottom-left status explains whether work is locally saved, remotely verified, offline, or conflicting.
- **Sign-out protection.** If an upload cannot be verified, sign-out is blocked to avoid erasing locally saved work.

## Deploy (recommended)

Back up your existing GitHub repository, then extract **LedgerPeer-AutoSave-Small-Update.zip** and replace these three root files:

1. `auth.js`
2. `attempt-entry.js`
3. `debrief-workflow.js`

This update does **not** require changing Supabase SQL tables or your existing site's design files.

## Test safely

Use a *new* test attempt first:

1. Sign in on your usual browser and import one marked attempt.
2. Click **Save attempt & open debrief** and verify that its questions are visible.
3. Refresh the page; confirm the attempt is still there.
4. Apply AI feedback; refresh again and check the explanations and charts.
5. Watch the status: **Saved on this device** means local browser storage is updated; **Auto-saved on device and cloud ✓** means the remote copy has been verified.

**Important limits:** Saving on this device is NOT a substitute for an independent backup. Private/incognito windows, cleared site storage, browser resets, or switching browsers/devices may remove local data. Cross-device syncing requires a successful Supabase backup, and authentication may still require network access. Avoid making simultaneous edits to the same attempt on different devices. Existing missing attempts cannot be recovered from this code update alone.
