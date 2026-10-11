# LedgerPeer SEO update — 11 October 2026

This edition is based on the most recent complete LedgerPeer Yellow Logo Update ZIP.

## What changed
- index.html: descriptive page title, meta description, canonical link, Open Graph, WebSite JSON-LD, and a public SEO-friendly overview of the site's actual tools.
- about.html: a public, indexable explanation of the FIA/ACCA revision and student finance workspace.
- sitemap.xml: lists ONLY the public homepage and About page. Do not list student-only private pages.
- Eight protected pages: a `noindex,follow` meta tag to avoid search results leading to private login-only tools.
- No auth.js, supabase-config.js, finance, productivity scripts, images or account data were modified.

## Deploy to GitHub Pages
1. Back up your repository (Code → Download ZIP).
2. Extract the COMPLETE ZIP and upload its contents into the existing marikitabelajar repository root, replacing files with identical names.
3. Keep the existing folder structure. Commit and allow Pages to publish.
4. Confirm https://luqmanreader.github.io/marikitabelajar/about.html and https://luqmanreader.github.io/marikitabelajar/sitemap.xml open publicly.
5. In Google Search Console, select the property https://luqmanreader.github.io/marikitabelajar/ and submit `sitemap.xml` under Sitemaps.
6. Inspect the exact homepage URL, select Test Live URL, then Request Indexing if available and not already requested for this updated version. Inspect about.html if desired.

Google may take days or weeks to update cached titles and descriptions. Neither a sitemap nor a recrawl request guarantees rankings. Private routes remain behind Supabase auth.

NOTE: Google Pages project-site robots.txt files do not control the domain-root robots.txt, so no misleading project-folder robots.txt file is included.
