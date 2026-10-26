# LOW RES — brand book

**LOW RES Supply Co.** Lo-fi gear for hi-def places.

Streetwear cut for the outdoors. We took a streetwear silhouette (boxy, heavy, a big logo) and
gave it an outdoor brand's conscience: repair it for free, buy less, give back to the places
you wear it.

## The idea

A low-res picture keeps only the detail it needs. LOW RES does the same with clothes: plain
shapes, heavy fabric, few seams, no trend details that date. Less detail, more life.

- **Tagline:** Lower resolution. Higher quality.
- **Sign-off:** Lo-fi gear for hi-def places.
- **Campaign line:** Don't upscale. (Buy less. Repair what you have.)

## Logo

Everything is drawn on a pixel grid and is never smoothed, blurred or anti-aliased.

- **Wordmark:** "LOW RES" in our 5×5 pixel face, 39 × 5 px. Always set in one line.
- **Emblem, "The Render":** a 20 × 14 px sunset. Pixel peak, pixel sun, dithered sky bands
  in CRT blue, dusk, signal and sun, on a moss ground. Our nod to the outdoor-label tradition,
  drawn at the lowest resolution that still reads as a mountain.
- **Lockup:** emblem centred over the wordmark, two pixels apart.
- **The resolution ladder:** the wordmark can be shown at several pixel sizes in a row, labelled
  1080P → 144P. The lower the label, the bigger the pixels.

Rules:
- Scale only by whole numbers, with nearest-neighbour sampling (`image-rendering: pixelated`).
  Never at a size where one logo pixel isn't a whole number of screen or print pixels.
- Never redraw the letters in a smooth font.
- Clear space: five logo pixels on every side.

Files are in `exports/` (PNG and SVG). `python3 export.py` regenerates them.

## Colour

| Name      | Hex       | Use                                   |
|-----------|-----------|---------------------------------------|
| Ink       | `#15140F` | Type, outlines, the mountain          |
| Bone      | `#F2EDE0` | Background, snow                      |
| Signal    | `#FF5A1F` | Accent, buttons, hang tags            |
| Sun       | `#FFC93C` | Emblem sun                            |
| CRT Blue  | `#2B3FD6` | Emblem sky, colorway                  |
| Dusk      | `#C2378E` | Emblem sky                            |
| Moss      | `#3E5B3A` | Ground, colorway                      |
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

Details that recur on every piece: a woven pixel-emblem label at the hem, a hang tag that lists
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
