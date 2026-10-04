# LAUNCH

What puts the kit on sale: the store listing, the launch posts and the store images, for the UK
Sole Trader MTD Kit (`MARKET/brief.md`). Copy is written against what TOOLKIT ships and what SITE
offers; when either changes, the claims here change with it. No "MTD-ready" or HMRC-approved claim
until a bridging tool has read the quarterly sheet.

- `listing.md` — Gumroad listing (price, name, summary, additional details, description, images,
  tags), what to check before publishing, and the Etsy version.
- `posts.md` — launch posts for Reddit, X, Indie Hackers and Product Hunt, each within that
  community's self-promotion limits.
- `cover.py` — renders `cover.png` (1280x720) and `thumbnail.png` (600x600) from `SITE/img/*.png`:
  `uv run --with pillow python LAUNCH/cover.py`.
