"""Logo options for LOW RES, written to options/ as PNGs plus one contact sheet.

Each option is a different take on "low res written in low resolution". They all reuse the
letter shapes in wordmark.py. Run: python3 options.py
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from wordmark import ASC, SHAPES, XH, sample

HERE = Path(__file__).parent
OUT = HERE / "options"
INK, BONE, SIGNAL = "#15140F", "#F2EDE0", "#FF5A1F"
H = XH + ASC  # full letter height in units, ascender included


def expand(rows, unit):
    """Rows of unit-sized pixels as rows of base units."""
    return [("".join(c * unit for c in r)) for r in rows for _ in range(unit)]


def letter(ch, unit):
    return expand(sample(ch, unit), unit)


def banded(ch, bands):
    """A letter whose pixel size changes from top to bottom: bands are (y0, y1, unit)."""
    width, shape = SHAPES[ch]
    top = -ASC if ch == "l" else 0
    rows = [["."] * width for _ in range(XH - top)]
    for y0, y1, u in bands:
        y0 = max(y0, top)
        for cy in range(y0, y1, u):
            for cx in range(0, width, u):
                hits = sum(shape(cx + (a + .5) * u / 4, cy + (b + .5) * u / 4) for a in range(4) for b in range(4))
                if hits >= 8:
                    for yy in range(cy, min(cy + u, y1)):
                        for xx in range(cx, min(cx + u, width)):
                            rows[yy - top][xx] = "X"
    return ["".join(r) for r in rows]


def hjoin(grids, gap=6, space=16, space_before=3):
    """Glyph grids side by side, bottoms on one baseline."""
    h = max(len(g) for g in grids)
    out = [""] * h
    for i, g in enumerate(grids):
        if i:
            pad = "." * (gap + (space if i == space_before else 0))
            out = [r + pad for r in out]
        w = len(g[0])
        g = ["." * w] * (h - len(g)) + g
        out = [r + gr for r, gr in zip(out, g)]
    return out


def vjoin(grids, gap):
    w = max(len(g[0]) for g in grids)
    out = []
    for i, g in enumerate(grids):
        if i:
            out += ["." * w] * gap
        left = (w - len(g[0])) // 2
        out += [("." * left + r).ljust(w, ".") for r in g]
    return out


def put(grid, x, y, size, c):
    rows = [list(r) for r in grid]
    for yy in range(y, y + size):
        for xx in range(x, x + size):
            if 0 <= yy < len(rows) and 0 <= xx < len(rows[0]):
                rows[yy][xx] = c
    return ["".join(r) for r in rows]


def pad(grid, left=0, top=0, right=0, bottom=0):
    w = len(grid[0]) + left + right
    return ["." * w] * top + ["." * left + r + "." * right for r in grid] + ["." * w] * bottom


# --- the options -------------------------------------------------------------------------

def mixed():
    """Every letter on its own grid, and the s's top-right pixel has broken off."""
    units = {"l": 3, "o": 1, "w": 2, "r": 5, "e": 3, "s": 6}
    word = hjoin([letter(c, units[c]) for c in "lowres"])
    word = pad(word, right=8)
    s_top = H - XH
    word = put(word, len(word[0]) - 14, s_top, 6, ".")
    return put(word, len(word[0]) - 6, s_top - 12, 6, "A")


def fade():
    """Resolution drops letter by letter, like a picture failing to load."""
    units = {"l": 1, "o": 1, "w": 2, "r": 3, "e": 4, "s": 6}
    return hjoin([letter(c, units[c]) for c in "lowres"])


def split():
    """'low' is chunky, 'res' is crisp."""
    return hjoin([letter(c, {"l": 5, "o": 5, "w": 4}.get(c, 1)) for c in "lowres"])


def melt():
    """Crisp at the top, pixels get bigger towards the baseline."""
    bands = [(-ASC, 6, 1), (6, 10, 2), (10, 16, 3), (16, 24, 4), (24, 30, 6)]
    return hjoin([banded(c, bands) for c in "lowres"])


def dissolve():
    """The word is fine, then the s breaks up and drifts off to the right."""
    word = hjoin([letter(c, 2) for c in "lowre"] + [["." * 30] * XH])
    s = sample("s", 3)
    x0 = len(word[0]) - 30
    rng = random.Random(7)
    word = pad(word, right=60, top=0)
    for j, row in enumerate(s):
        for i, c in enumerate(row):
            if c != "X":
                continue
            x, y = x0 + i * 3, ASC + j * 3
            drift = max(0, i - 4)
            if drift and rng.random() < 0.25 + drift * 0.12:
                x += int(drift * rng.uniform(4, 9))
                y += rng.randint(-drift * 2, drift)
                word = put(word, x, max(0, min(H - 3, y)), 3, "A" if rng.random() < .35 else "X")
            else:
                word = put(word, x, y, 3, "X")
    return word


def glitch():
    """One band of scanlines slips sideways and turns orange."""
    units = {"l": 2, "o": 2, "w": 2, "r": 2, "e": 2, "s": 2}
    word = pad(hjoin([letter(c, units[c]) for c in "lowres"]), left=10, right=10)
    w = len(word[0])
    shift = lambda r, d: (r[-d:] + r[:-d]) if d > 0 else (r[-d:] + r[:-d])
    out = []
    for y, r in enumerate(word):
        if 24 <= y < 30:
            out.append(shift(r, 8).replace("X", "A"))
        else:
            out.append(r)
    assert all(len(r) == w for r in out)
    return out


def tiny_glyphs():
    return {
        "l": ["X", "X", "X", "X", "X", "X", "X"],
        "o": [".XX.", "X..X", "X..X", "X..X", ".XX."],
        "w": ["X...X", "X...X", "X.X.X", "X.X.X", ".X.X."],
        "r": ["X.XX", "XX..", "X...", "X...", "X..."],
        "e": [".XX.", "X..X", "XXXX", "X...", ".XXX"],
        "s": [".XXX", "X...", ".XX.", "...X", "XXX."],
    }


def tiny():
    """The whole word in a 7-pixel-tall font. As low as it goes and still reads."""
    g = tiny_glyphs()
    return hjoin([g[c] for c in "lowres"], gap=1, space=2)


def stack():
    """'low' over 'res' in a square badge, for labels and patches."""
    units = {"l": 3, "o": 1, "w": 2, "r": 5, "e": 3, "s": 6}
    low = hjoin([letter(c, units[c]) for c in "low"])
    res = hjoin([letter(c, units[c]) for c in "res"], space_before=-1)
    body = vjoin([low, res], gap=8)
    side = max(len(body), len(body[0])) + 24
    body = pad(body, left=(side - len(body[0])) // 2, top=(side - len(body)) // 2)
    body = [r.ljust(side, ".") for r in body] + ["." * side] * (side - len(body))
    t = 6
    framed = []
    for y, r in enumerate(body):
        if y < t or y >= side - t:
            framed.append("X" * side)
        else:
            framed.append("X" * t + r[t:side - t] + "X" * t)
    return put(framed, side - t, side - t, t, "A")


OPTIONS = [
    ("A", "Mixed", "every letter its own resolution, one stray pixel", mixed, 4),
    ("B", "Fade", "resolution drops letter by letter", fade, 4),
    ("C", "Split", "'low' chunky, 'res' crisp", split, 4),
    ("D", "Melt", "crisp at the top, blocky at the bottom", melt, 4),
    ("E", "Dissolve", "the s breaks up and drifts away", dissolve, 4),
    ("F", "Glitch", "one band of scanlines slips, in orange", glitch, 4),
    ("G", "Tiny", "7 pixels tall, blown up", tiny, 24),
    ("H", "Badge", "stacked in a square, for labels", stack, 3),
]


def render(rows, scale, ink=INK, bg=BONE, accent=SIGNAL, margin=40):
    w, h = len(rows[0]) * scale, len(rows) * scale
    img = Image.new("RGB", (w + margin * 2, h + margin * 2), bg)
    d = ImageDraw.Draw(img)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c != ".":
                x0, y0 = margin + x * scale, margin + y * scale
                d.rectangle([x0, y0, x0 + scale - 1, y0 + scale - 1], fill=accent if c == "A" else ink)
    return img


def main():
    OUT.mkdir(exist_ok=True)
    tiles = []
    for key, name, note, make, scale in OPTIONS:
        rows = make()
        light = render(rows, scale)
        dark = render(rows, scale, ink=BONE, bg=INK)
        light.save(OUT / f"{key}-{name.lower()}.png")
        dark.save(OUT / f"{key}-{name.lower()}-dark.png")
        tiles.append((key, name, note, light))

    font = ImageFont.truetype("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf", 26)
    small = ImageFont.truetype("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf", 20)
    tw, th, label = 1100, 360, 70
    sheet = Image.new("RGB", (tw * 2 + 60, (th + label) * 4 + 60), "#E7E0CE")
    d = ImageDraw.Draw(sheet)
    for n, (key, name, note, img) in enumerate(tiles):
        x, y = 20 + (n % 2) * (tw + 20), 20 + (n // 2) * (th + label + 10)
        tile = Image.new("RGB", (tw, th), BONE)
        im = img.copy()
        im.thumbnail((tw - 40, th - 40), Image.NEAREST)
        tile.paste(im, ((tw - im.width) // 2, (th - im.height) // 2))
        sheet.paste(tile, (x, y))
        d.text((x, y + th + 10), f"{key}  {name.upper()}", font=font, fill=INK)
        d.text((x, y + th + 42), note, font=small, fill="#5B574C")
    sheet.save(OUT / "sheet.png")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
