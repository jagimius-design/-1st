# LOWRES

LOW RES, a streetwear/outdoor clothing brand concept whose logo and display type are drawn in
low resolution. Brand book in `brand.md`.

- `pixels.js` — palette, the 5×5 pixel font for headings, garment colorways and the Drop 01
  products. Plain JSON after `window.LOWRES =`, so `export.py` can parse it; keep it that way.
- `wordmark.py` → `wordmark.js` — the logo: each letter of "low res" sampled from a geometric
  shape at its own pixel size (`UNITS`), plus the stray pixel. `wordmark.js` is generated.
- `lowres.js` — draws the bitmaps as SVG rects (`[data-wordmark]`, `[data-px]` headings, the
  per-letter breakdown, the product grid and colour swatches). Garments get an ink outline and optional dither.
  Also loadable from Node for tests.
- `index.html`, `style.css` — the lookbook page. Static, no build step; open the file directly.
  `--px` sets the size of one logo pixel per element.
- `export.py` — writes wordmark, icon and garment PNG/SVG files to `exports/` (needs Pillow).
  Rerun after changing `pixels.js` or `wordmark.js`.
- `options.py` → `options/` — logo directions A–H for choosing between (light and dark PNGs,
  plus `sheet.png` side by side). Not used by the site.
- `dissolve.py` → `options/dissolve/` — 20 variants of option E: soft grey mosaic blocks that
  break off the word and drift. Each is a `V(...)` config at the bottom of the file.
- `tests/` — `node --test LOWRES/tests/*.test.js`: bitmaps are rectangular, use known colours,
  and the stray pixel stays detached.

Not deployed: `.github/workflows/pages.yml` only publishes `SITE/`.
