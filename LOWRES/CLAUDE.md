# LOWRES

LOW RES, a streetwear/outdoor clothing brand concept whose logo and display type are drawn in
low resolution. Brand book in `brand.md`.

- `pixels.js` — the single source of every bitmap: palette, the 5×5 pixel font, the emblem,
  garment colorways and the Drop 01 products. Plain JSON after `window.LOWRES =`, so
  `export.py` can parse it; keep it that way.
- `lowres.js` — draws the bitmaps as SVG rects (wordmark, `[data-px]` headings, `[data-emblem]`,
  the product grid and colour swatches). Garments get an ink outline and optional dither.
  Also loadable from Node for tests.
- `index.html`, `style.css` — the lookbook page. Static, no build step; open the file directly.
  `--px` sets the size of one logo pixel per element.
- `export.py` — writes logo, lockup, emblem and garment PNG/SVG files to `exports/` (needs
  Pillow). Rerun after changing `pixels.js`.
- `tests/` — `node --test LOWRES/tests/*.test.js`: bitmaps are rectangular and use known colours.

Not deployed: `.github/workflows/pages.yml` only publishes `SITE/`.
