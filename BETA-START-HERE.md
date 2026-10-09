# Revision Hub 4-student beta — read before deployment

## What is implemented
- Supabase email/password sign-in on index.html, with existing visual design retained.
- Protected pages verify the signed-in account before displaying content.
- Per-account JSON snapshot stored in the existing public.user_documents table (RLS must be enabled).
- Sync attempts every 8 seconds, on tab hide and page exit; sync errors are shown on screen.
- Previous account's app data is cleared from localStorage on switching accounts or signing out.

## Before testing
1. Your Supabase SQL user_documents schema must already have been executed.
2. Supabase Auth: public sign-ups disabled; create/invite one test account.
3. Set Authentication > URL Configuration > Site URL to https://luqmanreader.github.io/marikitabelajar/ and allow redirects from that path.
4. Upload ALL files in this folder to your GitHub repository root (replace old files). Keep a backup of the original ZIP.
5. Supabase invitation emails may need a password setup / recovery flow. This beta package does NOT implement password recovery or invite-token handling. For first test, use Supabase Authentication > Users > Add user > Create new user with a temporary password and email auto-confirmed, then sign in using that password. Change to a secure password before real-user testing; never distribute a shared password.
6. Test two distinct accounts on two browsers and confirm records are separate in Table Editor > user_documents.

## Important beta limitations
- This is a PROTOTYPE, not a production-ready service. Data still resides in localStorage on each device as a working cache. Shared devices and browser extensions can read that cache. Avoid sensitive personal/financial data during the beta.
- Cloud synchronization is periodic whole-document replacement (last writer wins); concurrent editing from two devices may overwrite changes. Avoid simultaneous edits on two devices.
- Offline edits can be overwritten on reconnection; keep backups and do not treat cloud sync as a backup strategy.
- Supabase's hosted authentication library is loaded from a CDN. It needs internet access.
- Invitation links and password reset flows are not implemented. Add a proper auth callback and recovery flow before inviting real testers.
- Cloud storage includes localStorage keys from existing pages; large records may exceed practical JSON/HTTP limits.
- Calendar Google OAuth integration is independent and not changed.
- Review privacy and data retention requirements before collecting actual student records.
