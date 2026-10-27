"""Twenty takes on option E, "dissolve": the word breaks into big, soft mosaic blocks that
come loose and drift away. Blocks take the average ink under them, so edges go grey and vague
like a censored photo, not crisp like pixel art.

Writes options/dissolve/NN.png (+ -dark) and options/dissolve/sheet.png. Run: python3 dissolve.py
"""
import random
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from options import hjoin, letter

OUT = Path(__file__).parent / "options" / "dissolve"
INK, BONE, SIGNAL = (21, 20, 15), (242, 237, 224), (255, 90, 31)
PAD_L, PAD_R, PAD_Y = 30, 220, 90


@dataclass
class V:
    note: str
    start: float = 0.75          # where the breakup starts, as a fraction of the word's width
    end: float = 1.0             # where it stops (for bands that resolve again)
    block: tuple = (6, 6)        # block size at the start and at the far right
    aspect: tuple = (1, 1)       # block width and height multipliers
    levels: int = 0              # tone steps for mosaic blocks; 0 = continuous grey
    drop: float = 0.35           # chance a block comes loose, at the far right
    dx: tuple = (0.5, 4.0)       # drift in blocks, scaled by how far right the block is
    dy: tuple = (-1.0, 1.0)
    fade: float = 0.0            # loose blocks lose this much tone at the far right
    accent: float = 0.0          # chance a loose block is orange
    band: tuple = None           # (y0, y1) in units from the top: only pixelate this strip
    ghost: int = 0               # block size of a pale mosaic echo behind the word
    reverse: bool = False        # pixelate from the left instead
    seed: int = 1
    unit: int = 2                # pixel size of the crisp letters


def word(unit):
    rows = hjoin([letter(c, unit) for c in "lowres"])
    return np.array([[c == "X" for c in r] for r in rows], dtype=float)


def make(v):
    w = word(v.unit)
    h, ww = w.shape
    H, W = h + PAD_Y * 2, ww + PAD_L + PAD_R
    ink = np.zeros((H, W))
    acc = np.zeros((H, W))
    ink[PAD_Y:PAD_Y + h, PAD_L:PAD_L + ww] = w
    rng = random.Random(v.seed)

    if v.ghost:
        g = v.ghost
        ghost = np.zeros_like(ink)
        for y in range(0, H - g, g):
            for x in range(0, W - g, g):
                ghost[y:y + g, x:x + g] = ink[y:y + g, x:x + g].mean()
        sh = g // 2
        ghost = np.roll(np.roll(ghost, sh, 0), sh, 1) * 0.28
        ink = np.maximum(ink, ghost)

    x0 = PAD_L + int(ww * v.start)
    x1 = PAD_L + int(ww * v.end)
    top, bottom = PAD_Y, PAD_Y + h
    if v.band:
        top, bottom = PAD_Y + v.band[0], PAD_Y + v.band[1]

    src = ink.copy()
    x = x0
    while x < x1:
        t = (x - x0) / max(1, x1 - x0)
        if v.reverse:
            t = 1 - t
        b = v.block[0] + (v.block[1] - v.block[0]) * t
        bw, bh = max(1, round(b * v.aspect[0])), max(1, round(b * v.aspect[1]))
        y = bottom
        while y > top:
            y0 = max(top, y - bh)
            cell = src[y0:y, x:x + bw]
            tone = cell.mean() if cell.size else 0
            if v.levels and tone > 0:
                tone = round(tone * v.levels) / v.levels
            ink[y0:y, x:x + bw] = 0
            if tone > 0.04:
                if rng.random() < v.drop * t:
                    nx = x + int(bw * rng.uniform(*v.dx) * (0.3 + t))
                    ny = y0 + int(bh * rng.uniform(*v.dy) * (0.3 + t))
                    nx, ny = min(max(nx, 0), W - bw), min(max(ny, 0), H - bh)
                    tone *= 1 - v.fade * t
                    target = acc if rng.random() < v.accent else ink
                    target[ny:ny + bh, nx:nx + bw] = np.maximum(target[ny:ny + bh, nx:nx + bw], tone)
                else:
                    ink[y0:y, x:x + bw] = np.maximum(ink[y0:y, x:x + bw], tone)
            y -= bh
        x += bw
    return ink, acc


def render(ink, acc, scale, fg=INK, bg=BONE, margin=24):
    ys, xs = np.nonzero((ink > 0.02) | (acc > 0.02))
    ink = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    acc = acc[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    fg, bg, sg = (np.array(c, float) for c in (fg, bg, SIGNAL))
    rgb = bg * (1 - ink[..., None]) + fg * ink[..., None]
    rgb = rgb * (1 - acc[..., None]) + sg * acc[..., None]
    img = Image.fromarray(rgb.clip(0, 255).astype("uint8"))
    img = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    out = Image.new("RGB", (img.width + margin * 2, img.height + margin * 2), tuple(int(c) for c in bg))
    out.paste(img, (margin, margin))
    return out


VARIANTS = [
    V("the s breaks into soft grey blocks", start=0.82, block=(6, 9)),
    V("all of 'res' goes, blocks grow to the right", start=0.55, block=(4, 10), drop=0.45),
    V("whole word, 2px on the left to 11px on the right", start=0.0, block=(2, 11), drop=0.3),
    V("one huge step: the s is three blocks wide", start=0.83, block=(12, 12), drop=0.5, dx=(0.4, 2.0)),
    V("pixels float up and away", start=0.6, block=(6, 12), dx=(0.2, 1.5), dy=(-4, -0.5), drop=0.5),
    V("pixels fall below the baseline", start=0.6, block=(6, 12), dx=(0, 1), dy=(0.5, 4), drop=0.5),
    V("fades out as it drifts, vague at the edge", start=0.6, block=(5, 13), drop=0.6, fade=0.85),
    V("orange sparks in the drift", start=0.65, block=(6, 12), drop=0.5, accent=0.3),
    V("censor bar across the middle", start=0.0, block=(9, 9), band=(22, 37), drop=0.12, dy=(-.3, .3)),
    V("starts blurry, comes into focus", start=0.0, end=0.55, block=(3, 14), reverse=True, drop=0.0),
    V("wind: wide pixels streak right", start=0.55, block=(5, 10), aspect=(2.2, 0.6), drop=0.55, dx=(1, 5), dy=(-.2, .2)),
    V("rain: tall pixels drip down", start=0.5, block=(5, 10), aspect=(0.6, 2.0), drop=0.5, dx=(0, .4), dy=(.5, 3)),
    V("three tones only: ink, grey, pale", start=0.5, block=(6, 14), levels=3, drop=0.4),
    V("pale mosaic echo behind the word", start=0.8, block=(7, 10), ghost=12, drop=0.4),
    V("explodes from the e and s", start=0.68, block=(6, 10), drop=0.7, dx=(-1, 5), dy=(-3, 3), seed=4),
    V("crisper letters (1px), big soft s", start=0.83, block=(10, 14), unit=1, drop=0.45),
    V("chunky letters (3px), huge drift", start=0.55, block=(9, 18), unit=3, drop=0.5, fade=0.4),
    V("barely there: just the tail of the s lets go", start=0.9, block=(8, 10), drop=0.6, fade=0.5, accent=0.15),
    V("everything mosaic, nothing crisp", start=0.0, block=(5, 8), levels=4, drop=0.18, dx=(.5, 2.5)),
    V("long trail with orange and fade", start=0.45, block=(4, 16), drop=0.55, fade=0.7, accent=0.18, dx=(1, 6), seed=9),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf", 22)
    tw, th, lab, cols = 900, 300, 44, 4
    rows = (len(VARIANTS) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (tw + 16) + 16, rows * (th + lab + 12) + 16), (231, 224, 206))
    d = ImageDraw.Draw(sheet)
    for i, v in enumerate(VARIANTS, 1):
        ink, acc = make(v)
        light = render(ink, acc, 4)
        render(ink, acc, 4, fg=BONE, bg=INK).save(OUT / f"{i:02d}-dark.png")
        light.save(OUT / f"{i:02d}.png")
        tile = Image.new("RGB", (tw, th), BONE)
        im = light.copy()
        im.thumbnail((tw - 24, th - 24), Image.LANCZOS)
        tile.paste(im, ((tw - im.width) // 2, (th - im.height) // 2))
        x, y = 16 + ((i - 1) % cols) * (tw + 16), 16 + ((i - 1) // cols) * (th + lab + 12)
        sheet.paste(tile, (x, y))
        d.text((x, y + th + 10), f"{i:02d}  {v.note}", font=font, fill=INK)
    sheet.save(OUT / "sheet.png")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
