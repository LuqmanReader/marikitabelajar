# LEDGERPEER — LATEST REPOSITORY UNIFIED THEME (11 OCT 2026)

SOURCE: the ZIP supplied in this conversation: `marikitabelajar-main (3)(1).zip`.
This build is based directly on your latest ZIP, not an earlier GitHub version.

WHAT WAS CHANGED
- Rebuilt only homepage `index.html` to remove owner visual editor + checkerboard, while retaining the original authentication flow, links, and mascots.
- Added exactly ONE shared stylesheet, `ledgerpeer-theme.css` to all 9 main HTML pages; original existing CSS is still present for page layout and features.
- Added the `data-lp-page` selector to the html element of each page, allowing context-specific tweaks in the shared stylesheet.
- Restored older Revision Hub typography: `Arial Black` for headings and `ui-monospace`/`JetBrains Mono`/`Space Mono` fallbacks for general UI text.
- Used saturated yellow, red, blue, green, orange, purple; thick black borders and sharp offset shadows. No checkerboard/dot-grid backgrounds.
- Fixed the accidental Markdown triple-backtick wrapper on `hub.html` if one was present in the uploaded archive.
- Removed the duplicate `index (1).html` (an obsolete extra homepage) to avoid deployment confusion.

PRESERVED
- Every original JS file, including `auth.js`, finance, dashboard, calendar, planner and exam processing, is byte-identical to the uploaded ZIP.
- The original Supabase configuration file and images remain unchanged.
- No database operations are performed by this packaging process.
- Login/signup/password reset remains on the homepage; student records are not bundled in the ZIP.

PAGES COVERED
index.html, hub.html, view.html, add-exam.html, financial-manager.html, financial-dashboard.html,
calendar.html, achievements.html, study-planner.html.

HOW TO DEPLOY TO GITHUB PAGES
1. Back up your current repository first.
2. Extract this ZIP: its top level contains `index.html` and all files, with no extra nested folder.
3. Upload/replace the contents in your existing repository ROOT, preserving filenames.
4. Commit. On the website, hard refresh (Ctrl+F5).
5. Test login, exam attempt save/reload, Financial Manager record save/reload, calendar, planner and mobile.

FUTURE DESIGN TWEAKS
Edit brand colours and fonts at the top of `ledgerpeer-theme.css`, then commit the CSS alone.
Existing page-specific legacy CSS remains for layout/functionality and is overridden where needed.

VERIFICATION LIMITS
Automated local syntax, cross-file link, and visual tests can be performed on these files. Full end-to-end Supabase/cloud account flows require testing against the live deployed site using your account; none are claimed in this archive.
