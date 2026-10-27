# LOW RES — brand book

**LOW RES Supply Co.** Lo-fi gear for hi-def places.

Streetwear cut for the outdoors. We took a streetwear silhouette (boxy, heavy, a big logo) and
gave it the conscience of the best outdoor brands: repair it for free, buy less, give back to the places
you wear it.

## The idea

A low-res picture keeps only the detail it needs. LOW RES does the same with clothes: plain
shapes, heavy fabric, few seams, no trend details that date. Less detail, more life.

- **Tagline:** Lower resolution. Higher quality.
- **Sign-off:** Lo-fi gear for hi-def places.
- **Campaign line:** Don't upscale. (Buy less. Repair what you have.)

## Logo

The logo is the word **low res**, lowercase, and nothing else. Every letter is drawn on its own
pixel grid, so each one has a different resolution:

| Letter | Grid    | Pixel size |
|--------|---------|------------|
| l      | 6×15    | 3          |
| o      | 30×30   | 1 (smooth) |
| w      | 19×15   | 2          |
| r      | 6×6     | 5          |
| e      | 10×10   | 3          |
| s      | 5×5     | 6 (chunky) |

The letters share one x-height and baseline, so the word holds together while the pixels jump
around. The "o" is almost smooth and the "s" is almost a Lego brick.

**The stray pixel.** The top-right pixel of the "s" has broken off and floats above it in signal
orange. It's the one bit of colour in the logo. On screen it hops now and then.

- **Icon:** the "s" and its stray pixel on their own. Use it for avatars, woven labels, the
  hang-tag punch-out.
- **Display type:** headlines use the LOW RES 5×5 pixel face (uppercase), which is separate
  from the logo.

Rules:
- Scale only by whole numbers, with nearest-neighbour sampling (`image-rendering: pixelated`).
- Never smooth the letters or "fix" them onto one grid. The mismatch is the logo.
- The stray pixel is always signal orange, or ink when the letters are orange.
- Clear space: one "s" pixel on every side.

`wordmark.py` draws the letters from simple shapes and samples each at its own pixel size; change
`UNITS` there to re-pixelate a letter. Files are in `exports/` (PNG and SVG):
`python3 wordmark.py && python3 export.py` regenerates them.

## Colour

| Name      | Hex       | Use                                   |
|-----------|-----------|---------------------------------------|
| Ink       | `#15140F` | Logo, type, outlines                  |
| Bone      | `#F2EDE0` | Background                            |
| Signal    | `#FF5A1F` | The stray pixel, buttons, hang tags   |
| CRT Blue  | `#2B3FD6` | Colorway                              |
| Moss      | `#3E5B3A` | Colorway                              |
| Glacier   | `#A8D5E2` | Colorway                              |

Garment colorways: Ink, Bone, Moss, Signal, Glacier, CRT Blue.

## Type

- **Display:** the LOW RES 5×5 pixel face (in `pixels.js`). Headlines and labels only, all caps.
- **Text:** any plain monospace. Body copy reads like a spec sheet.

## Voice

Dry, plain and a bit nerdy. Uses tech language about clothes, never outdoor-hero language.
Short sentences. We'd rather tell you not to buy something than oversell it.

- Yes: "Rain still loads slower than you."
- Yes: "Anti-aliasing not included."
- No: "Conquer the elements."

## Drop 01: FIELD 144P

| Piece               | Price | Fabric                                        | Colorways              |
|---------------------|-------|-----------------------------------------------|------------------------|
| Artifact Tee        | $38   | 240gsm organic cotton, boxy, dropped shoulder | Bone, Ink, Signal      |
| Compression Hoodie  | $98   | 450gsm brushed loopback, double-layer hood    | Moss, Ink, Glacier     |
| Dither Pile Fleece  | $148  | Recycled high-loft pile, snap chest pocket    | Bone, Signal, CRT Blue |
| Buffer Shell        | $289  | 3-layer recycled nylon, pit zips, taped seams | Signal, Glacier, Ink   |
| 240p Cargo          | $118  | Organic cotton canvas, bellows pockets        | Moss, Bone, Ink        |
| Alias Beanie        | $32   | Responsible wool rib, woven pixel patch       | Signal, Moss, CRT Blue |
| Thumbnail Tote      | $28   | Deadstock canvas offcuts                      | Bone, Ink              |

Details that recur on every piece: a woven "low res" label at the hem, a hang tag that lists
every fibre, and a single signal-orange "pixel" (a square bar-tack or pull tab).

## What we stand for

1. **Built for 10,000 wears.** Heavy fabric, bar-tacked stress points, no throwaway trends.
2. **Recycled or organic, all of it.** Every fibre is listed on the hang tag.
3. **1% to wild places.** One percent of sales, off the top, to groups protecting public land,
   trails and rivers.
4. **Small drops, no sales.** Make what will sell, keep prices steady, nothing marked down and
   dumped.

### Re-Render

Free repairs for anything we've made, for as long as you own it. Each repair is a square patch
cut from offcuts, so every fix adds a pixel. Worn-out pieces come back for credit and get cut
into patches.
