""""low res" on a snowy old TV: a pixel-art CRT with rabbit ears, the screen full of static,
the word coming through the snow.

Writes options/tv/NN.png, NN.gif (the snow moving) and sheet.png. Run: python3 tv.py
"""
import math
import random
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from options import expand, hjoin, letter, tiny_glyphs

OUT = Path(__file__).parent / "options" / "tv"
INK, BONE, SIGNAL = (21, 20, 15), (242, 237, 224), (255, 90, 31)
WOOD, WOOD_DARK = (120, 74, 40), (82, 50, 27)


@dataclass
class TV:
    note: str
    cabinet: tuple = INK
    trim: tuple = (58, 56, 48)       # bezel round the screen
    knob: tuple = BONE
    bg: tuple = BONE
    text: tuple = BONE
    word: str = "big"                # "big" (2px letters) or "tiny" (7px font)
    block: int = 4                   # pixel size of the TV body
    snow: int = 3                    # pixel size of the static
    snow_amount: float = 1.0         # 0 = clean dark screen, 1 = full static
    corrupt: float = 0.18            # chance a text pixel is lost to the static
    halo: bool = True                # the static dims round the letters, so they read
    dissolve: float = 0.0            # >0: the end of the word breaks into big blocks of snow
    tracking: bool = False           # a rolling band shifts part of the picture
    scanlines: bool = True
    bars: bool = False               # colour bars under the word
    antenna: bool = True
    seed: int = 3


def word_mask(kind):
    if kind == "tiny":
        g = tiny_glyphs()
        rows = expand(hjoin([g[c] for c in "lowres"], gap=1, space=2), 2)
    else:
        rows = hjoin([letter(c, 2) for c in "lowres"])
    return np.array([[c == "X" for c in r] for r in rows])


def rounded(x0, y0, x1, y1, r):
    def inside(x, y):
        if not (x0 <= x < x1 and y0 <= y < y1):
            return False
        cx = min(max(x, x0 + r), x1 - r)
        cy = min(max(y, y0 + r), y1 - r)
        return math.hypot(x - cx, y - cy) <= r
    return inside


def disc(cx, cy, r):
    return lambda x, y: math.hypot(x - cx, y - cy) <= r


def line(xa, ya, xb, yb, t):
    def inside(x, y):
        dx, dy = xb - xa, yb - ya
        k = max(0, min(1, ((x - xa) * dx + (y - ya) * dy) / (dx * dx + dy * dy)))
        return math.hypot(x - xa - k * dx, y - ya - k * dy) <= t / 2
    return inside


def paint(img, shape, color, b):
    """Fills the shape on a grid of b-sized pixels: chunky on purpose."""
    h, w, _ = img.shape
    for y in range(0, h, b):
        for x in range(0, w, b):
            if shape(x + b / 2, y + b / 2):
                img[y:y + b, x:x + b] = color


def frame(v, mask, rng):
    mh, mw = mask.shape
    m = max(10, mw // 12)
    sw = mw + 2 * m
    sh = round(sw * 0.66)
    side = round(sw * 0.3)
    pad = round(sw * 0.07)
    ant = round(sw * 0.3) if v.antenna else 0
    W = sw + side + pad * 3 + 40
    H = sh + pad * 2 + ant + 40 + round(sw * 0.05)
    img = np.zeros((H, W, 3), float)
    img[:] = v.bg
    cx0, cy0 = 20, 20 + ant
    cx1, cy1 = cx0 + sw + side + pad * 3, cy0 + sh + pad * 2
    b = v.block

    if v.antenna:
        top = (cx0 + cx1) / 2 - side / 2
        paint(img, line(top, cy0, top - sw * 0.28, 22, max(3, b)), v.cabinet, b)
        paint(img, line(top, cy0, top + sw * 0.32, 26, max(3, b)), v.cabinet, b)
        paint(img, disc(top - sw * 0.28, 22, b * 1.6), v.cabinet, b)
        paint(img, disc(top + sw * 0.32, 26, b * 1.6), v.cabinet, b)
        paint(img, disc(top, cy0, sw * 0.07), v.cabinet, b)
    # legs
    leg = round(sw * 0.05)
    paint(img, lambda x, y: cy1 <= y < cy1 + leg and (cx0 + pad < x < cx0 + pad * 2.5 or cx1 - pad * 2.5 < x < cx1 - pad), v.cabinet, b)
    # cabinet, bezel
    paint(img, rounded(cx0, cy0, cx1, cy1, pad * 1.4), v.cabinet, b)
    sx0, sy0 = cx0 + pad, cy0 + pad
    paint(img, rounded(sx0 - b, sy0 - b, sx0 + sw + b, sy0 + sh + b, pad * 1.3), v.trim, b)
    # side panel: two knobs and a speaker grille
    kx = sx0 + sw + pad + side / 2
    for ky in (sy0 + sh * 0.18, sy0 + sh * 0.45):
        paint(img, disc(kx, ky, side * 0.26), v.knob, b)
        if side * 0.26 >= b * 4:  # too few pixels for a pointer on a chunky or tiny set
            paint(img, line(kx, ky, kx + side * 0.18, ky - side * 0.12, b), v.cabinet, b)
    for i in range(4):
        gy = sy0 + sh * 0.68 + i * b * 2.5
        paint(img, lambda x, y, gy=gy: kx - side * .3 < x < kx + side * .3 and gy <= y < gy + b, v.trim, b)

    # the screen
    screen = rounded(sx0, sy0, sx0 + sw, sy0 + sh, pad * 1.1)
    n = v.snow
    ys, xs = np.mgrid[0:sh, 0:sw]
    noise = np.kron(np.array([[rng.random() for _ in range(-(-sw // n))] for _ in range(-(-sh // n))]),
                    np.ones((n, n)))[:sh, :sw]
    val = 0.08 + noise ** 1.4 * 0.8 * v.snow_amount
    # the word
    wx, wy = (sw - mw) // 2, (sh - mh) // 2 - (round(sh * 0.08) if v.bars else 0)
    text = np.zeros((sh, sw), bool)
    text[wy:wy + mh, wx:wx + mw] = mask
    if v.halo:
        r = 3 if v.word == "big" else 2
        near = np.zeros_like(text)
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                near |= np.roll(np.roll(text, dy, 0), dx, 1)
        val[near] *= 0.3
    lost = np.array([[rng.random() < v.corrupt for _ in range(sw)] for _ in range(sh)])
    if v.dissolve:
        start = wx + int(mw * (1 - v.dissolve))
        bb = 8
        for x in range(start, wx + mw, bb):
            t = (x - start) / max(1, wx + mw - start)
            for y in range(wy, wy + mh, bb):
                cell = text[y:y + bb, x:x + bb]
                tone = cell.mean()
                text[y:y + bb, x:x + bb] = False
                if tone and rng.random() > t * 0.6:
                    ox = int(rng.uniform(0, 3) * bb * t)
                    oy = int(rng.uniform(-1, 1) * bb * t)
                    yy, xx = min(max(y + oy, 0), sh - bb), min(max(x + ox, 0), sw - bb)
                    val[yy:yy + bb, xx:xx + bb] = np.maximum(val[yy:yy + bb, xx:xx + bb], 0.35 + tone * 0.6)
    color = np.ones((sh, sw, 3)) * val[..., None] * 255
    on = text & ~lost
    color[on] = np.array(v.text) * (0.85 + 0.15 * noise[on])[:, None]
    if v.bars:
        bars = [(242, 237, 224), (255, 201, 60), (168, 213, 226), (62, 91, 58), (194, 55, 142), (255, 90, 31), (43, 63, 214)]
        by0, by1 = round(sh * 0.74), round(sh * 0.86)
        bw = sw / len(bars)
        for i, c in enumerate(bars):
            color[by0:by1, round(i * bw):round((i + 1) * bw)] = c
    if v.tracking:
        y0, y1 = round(sh * 0.42), round(sh * 0.56)
        color[y0:y1] = np.roll(color[y0:y1], round(sw * 0.06), axis=1)
        color[y0 - 2:y0] = 230
    if v.scanlines:
        color[(ys // 2) % 2 == 1] *= 0.82
    # CRT vignette
    d = np.hypot((xs - sw / 2) / (sw / 2), (ys - sh / 2) / (sh / 2))
    color *= (1 - 0.45 * np.clip(d - 0.55, 0, 1))[..., None]
    for y in range(sh):
        for x in range(sw):
            if screen(sx0 + x + .5, sy0 + y + .5):
                img[sy0 + y, sx0 + x] = color[y, x]
    return Image.fromarray(img.clip(0, 255).astype("uint8"))


VARIANTS = [
    TV("classic: black set, grey snow, white type"),
    TV("70s wood cabinet", cabinet=WOOD, trim=WOOD_DARK, knob=(214, 180, 120)),
    TV("heavy snow, the word barely comes through", corrupt=0.45, snow=2, halo=False),
    TV("the word dissolves into the static", dissolve=0.35),
    TV("tracking band rolls through", tracking=True),
    TV("orange signal on the snow", text=SIGNAL, corrupt=0.12),
    TV("dark set on dark, sparse snow", bg=INK, cabinet=(46, 44, 38), trim=(30, 29, 24), snow_amount=0.45),
    TV("colour bars under the word", bars=True, snow_amount=0.7),
    TV("chunky set (8px), fine snow", block=8, snow=2),
    TV("bone-white set, no antenna", cabinet=(226, 220, 204), trim=(150, 146, 134), knob=INK, antenna=False),
    TV("tiny 7px word, for labels and patches", word="tiny", block=3, snow=1, corrupt=0.05),
    TV("tiny word, orange, wood set", word="tiny", block=3, snow=1, text=SIGNAL, corrupt=0.05,
       cabinet=WOOD, trim=WOOD_DARK, knob=(214, 180, 120)),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf", 22)
    tiles = []
    for i, v in enumerate(VARIANTS, 1):
        mask = word_mask(v.word)
        scale = 3 if v.word == "big" else 6
        frames = [frame(v, mask, random.Random(v.seed + k)) for k in range(6)]
        frames = [f.resize((f.width * scale, f.height * scale), Image.NEAREST) for f in frames]
        frames[0].save(OUT / f"{i:02d}.png")
        frames[0].save(OUT / f"{i:02d}.gif", save_all=True, append_images=frames[1:], duration=90, loop=0)
        tiles.append((v.note, frames[0]))

    tw, th, lab, cols = 760, 640, 44, 4
    rows = -(-len(tiles) // cols)
    sheet = Image.new("RGB", (cols * (tw + 16) + 16, rows * (th + lab + 12) + 16), (231, 224, 206))
    d = ImageDraw.Draw(sheet)
    for i, (note, img) in enumerate(tiles):
        tile = Image.new("RGB", (tw, th), img.getpixel((2, 2)))
        im = img.copy()
        im.thumbnail((tw - 30, th - 30), Image.LANCZOS)
        tile.paste(im, ((tw - im.width) // 2, (th - im.height) // 2))
        x, y = 16 + (i % cols) * (tw + 16), 16 + (i // cols) * (th + lab + 12)
        sheet.paste(tile, (x, y))
        d.text((x, y + th + 10), f"{i + 1:02d}  {note}", font=font, fill=INK)
    sheet.save(OUT / "sheet.png")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
