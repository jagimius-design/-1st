# SITE

The free static site, deployed to GitHub Pages by `.github/workflows/pages.yml` (tests, then the
top-level files of this folder, on push to `main`). No build step, no external requests: plain
HTML/CSS/JS, offline through a service worker.

- `index.html` — landing page selling the kit; every `[data-buy]` link gets the store URL.
- `invoice.html` — the invoice generator. The form is the invoice: print CSS hides the controls,
  so "Download / print PDF" is the browser's print dialog. Draft lives in `localStorage`.
- `config.js` — `storeUrl`, the one value to set when the store exists.
- `invoice-core.js` — invoice math and money formatting, loadable by browser and Node.
- `invoice.js` — the generator's page logic.
- `style.css` — both pages; theme tokens, mobile and print rules.
- `sw.js`, `register-sw.js` — offline cache; bump `VERSION` in `sw.js` when its file list changes.
- `manifest.webmanifest`, `icon.svg` — installable app metadata and icon.
- `tests/` — `node --test SITE/tests/*.test.js`.
