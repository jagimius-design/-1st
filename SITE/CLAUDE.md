# SITE

The free static site, deployed to GitHub Pages by `.github/workflows/pages.yml` (tests, then the
top-level files and `img/*.webp`, on push to `main`). No build step, no external requests: plain
HTML/CSS/JS, offline through a service worker.

Positioned for UK sole traders under Making Tax Digital (`MARKET/brief.md`): copy, £ and UK dates.

- `index.html` — landing page selling the kit; every `[data-buy]` link gets the store URL.
- `mtd.html`, `mtd.js` — the "Am I in MTD?" checker.
- `mtd-core.js` — MTD start date and deadlines from income and tax year; the thresholds table is
  the one place to update when HMRC announces a new one.
- `invoice.html` — the invoice generator. The form is the invoice: print CSS hides the controls,
  so "Download / print PDF" is the browser's print dialog. Draft lives in `localStorage`.
- `config.js` — `storeUrl`, the one value to set when the store exists.
- `invoice-core.js` — invoice math and £-style money formatting, loadable by browser and Node.
- `invoice.js` — the generator's page logic.
- `style.css` — both pages; theme tokens, mobile and print rules.
- `sw.js`, `register-sw.js` — offline cache; bump `VERSION` in `sw.js` when its file list changes.
- `manifest.webmanifest`, `icon.svg` — installable app metadata and icon.
- `img/` — kit screenshots from the built TOOLKIT: `.png` full size (store listings), `.webp`
  for the site. `img/shots.sh` regenerates them.
- `tests/` — `node --test SITE/tests/*.test.js`.
