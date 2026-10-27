"""Horizontal logo: "low res" pulled out of the bad-reception TV (options/tv06/05) and set to its
left, with the same distortion (orange speckled letters, a tracking band that slips sideways,
scanlines), next to a smaller TV showing only static.

Writes options/lockup/NN.png and sheet.png. Run: python3 lockup.py
"""
import random
from dataclasses import dataclass, replace
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

import tv
from options import hjoin, letter

OUT = Path(__file__).parent / "options" / "lockup"
KEY = (255, 0, 254)
BLUE = (43, 63, 214)
CREAM_SET = dict(cabinet=(226, 220, 204), trim=(150, 146, 134), knob=tv.INK)
ORANGE_SET = dict(cabinet=tv.SIGNAL, trim=(150, 48, 12), knob=tv.BONE)


@dataclass
class L:
    note: str
    bg: tuple = tv.BONE
    fill: str = "orange"          # letters: "orange", "ink", "bone" or "static"
    band_fill: str = None         # letters inside the slipped band, if different
    band: tuple = (8, 33, 16)     # rows of the word (top, bottom) and how far they slip, in units
    line: tuple = (165, 160, 146) # the tracking line above the band; None for none
    scope: str = "text"           # "text": only the word slips; "all": the TV slips with it
    wave: int = 0                 # ripple the band instead of a straight slip
    split: int = 0                # blue ghost of the letters, this many units left
    tv: dict = None               # overrides for the TV (colours, antenna)
    screen: int = 70              # TV screen width in units: the TV's size next to the word
    align: str = "base"           # TV "base" (sits on the baseline) or "centre"
    trail: int = 0                # orange pixels between the screen and the word
    corrupt: float = 0.06
    gap: int = 18                 # between the word and the set
    seed: int = 5


def word_layer(v, rng):
    rows = hjoin([letter(c, 2) for c in "lowres"])
    mask = np.array([[c == "X" for c in r] for r in rows])
    h, w = mask.shape
    noise = np.kron(np.array([[rng.random() for _ in range(-(-w // 3))] for _ in range(-(-h // 3))]),
                    np.ones((3, 3)))[:h, :w]
    lost = np.array([[rng.random() < v.corrupt for _ in range(w)] for _ in range(h)])
    on = mask & ~lost

    def paint(fill, rows_sel):
        sel = on & rows_sel
        if fill == "static":
            g = 40 + noise[sel] ** 1.2 * 200
            out[sel, :3] = np.stack([g, g, g], -1)
        else:
            c = {"orange": tv.SIGNAL, "ink": tv.INK, "bone": tv.BONE}[fill]
            out[sel, :3] = np.array(c) * (0.85 + 0.15 * noise[sel])[:, None]
        out[sel, 3] = 255

    out = np.zeros((h, w, 4))
    if v.split:
        ghost = np.roll(on, -v.split, axis=1) & ~on
        out[ghost] = (*BLUE, 255)
    rows_all = np.ones((h, w), bool)
    in_band = np.zeros((h, w), bool)
    in_band[v.band[0]:v.band[1]] = True
    paint(v.fill, rows_all if not v.band_fill else ~in_band)
    if v.band_fill:
        paint(v.band_fill, in_band)
    out[1::4, :, :3] *= 0.82   # scanlines, two units on, two off
    out[2::4, :, :3] *= 0.82
    return out


def tv_layer(v, rng):
    base = replace(tv.TV06[4], bg=KEY, block=2, snow=2, tracking=True, **(v.tv or {}))
    img = tv.frame(base, np.zeros((10, v.screen), bool), rng)
    a = np.array(img.convert("RGBA"), float)
    a[..., 3] = np.where((a[..., :3] == KEY).all(-1), 0, 255)
    ys, xs = np.nonzero(a[..., 3])
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def make(v):
    rng = random.Random(v.seed)
    word = word_layer(v, rng)
    set_ = tv_layer(v, rng)
    wh, ww = word.shape[:2]
    th, tw = set_.shape[:2]
    gap, pad = v.gap, 30
    H = max(wh, th) + pad * 2
    W = ww + gap + tw + pad * 2 + v.band[2]
    base = pad + max(wh, th)                 # baseline of the word
    wx, wy = pad, base - wh
    tx = pad + ww + gap + v.band[2] // 2
    ty = base - th if v.align == "base" else base - wh // 2 - th // 2
    if v.align == "base":
        ty += round(th * 0.04)               # the legs stand a touch below the baseline
    H = max(H, ty + th + pad)
    text_l = np.zeros((H, W, 4))
    tv_l = np.zeros((H, W, 4))
    text_l[wy:wy + wh, wx:wx + ww] = word
    tv_l[ty:ty + th, tx:tx + tw] = set_

    y0, y1, shift = wy + v.band[0], wy + v.band[1], v.band[2]
    layers = [text_l] + ([tv_l] if v.scope == "all" else [])
    for layer in layers:
        if v.wave:
            for y in range(y0, y1):
                k = round(v.wave * np.sin((y - y0) / (y1 - y0) * np.pi * 2))
                layer[y] = np.roll(layer[y], k, axis=0)
        else:
            layer[y0:y1] = np.roll(layer[y0:y1], shift, axis=1)

    img = np.zeros((H, W, 3))
    img[:] = v.bg
    for layer in (tv_l, text_l):
        a = layer[..., 3:] / 255
        img = img * (1 - a) + layer[..., :3] * a
    if v.line and not v.wave:
        x_end = wx + ww + shift if v.scope == "text" else tx + tw
        img[y0 - 2:y0, wx - 4:x_end] = v.line
    if v.trail:
        sx, sy = tx + tw * 0.25, ty + th * 0.55
        ex, ey = wx + ww + shift + 2, wy + wh * 0.5
        for k in range(v.trail):
            t = (k + 1) / (v.trail + 1)
            size = 2 + round(3 * (1 - t))
            x = round(sx + (ex - sx) * t + rng.uniform(-1, 1))
            y = round(sy + (ey - sy) * t - np.sin(t * np.pi) * 10 + rng.uniform(-2, 2))
            img[y:y + size, x:x + size] = tv.SIGNAL
    out = Image.fromarray(img.clip(0, 255).astype("uint8"))
    return out


VARIANTS = [
    L("the word, then the set"),
    L("compact: the set no taller than the word", screen=42, tv=dict(antenna=False)),
    L("one tracking band through word and set", scope="all", screen=60),
    L("ink letters, only the slipped band orange", fill="ink", band_fill="orange"),
    L("letters full of static, orange band", fill="static", band_fill="orange"),
    L("blue/orange colour split", split=4, line=None),
    L("ink letters, orange set", fill="ink", tv=ORANGE_SET),
    L("the band ripples instead of slipping", wave=4),
    L("for dark grounds", bg=tv.INK, tv=CREAM_SET, line=(90, 87, 78)),
    L("pixels trail from the screen to the word", trail=8, line=None, align="centre", screen=56, gap=48),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf", 22)
    tiles = []
    for i, v in enumerate(VARIANTS, 1):
        img = make(v)
        img = img.resize((img.width * 4, img.height * 4), Image.NEAREST)
        img.save(OUT / f"{i:02d}.png")
        tiles.append((v, img))
    tw, th, lab, cols = 1100, 380, 44, 2
    rows = -(-len(tiles) // cols)
    sheet = Image.new("RGB", (cols * (tw + 16) + 16, rows * (th + lab + 12) + 16), (231, 224, 206))
    d = ImageDraw.Draw(sheet)
    for i, (v, img) in enumerate(tiles):
        tile = Image.new("RGB", (tw, th), v.bg)
        im = img.copy()
        im.thumbnail((tw - 40, th - 40), Image.LANCZOS)
        tile.paste(im, ((tw - im.width) // 2, (th - im.height) // 2))
        x, y = 16 + (i % cols) * (tw + 16), 16 + (i // cols) * (th + lab + 12)
        sheet.paste(tile, (x, y))
        d.text((x, y + th + 10), f"{i + 1:02d}  {v.note}", font=font, fill=tv.INK)
    sheet.save(OUT / "sheet.png")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
