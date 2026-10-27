"""Exports the LOW RES wordmark, icon and garments as PNG and SVG files in exports/.

Reads the same bitmaps the site draws from (pixels.js, wordmark.js), so the files always
match the page.
Run: python3 export.py
"""
import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).parent
OUT = HERE / "exports"


def read_json(name):
    src = (HERE / name).read_text()
    return json.loads(src.split("=", 1)[1].strip().rstrip(";"))


def load():
    data = read_json("pixels.js")
    data["wordmark"] = read_json("wordmark.js")
    return data


def wordmark_rows(wm, letters=None):
    """Letters on one grid of base units, bottoms on the baseline; the stray pixel is "A".

    `letters` picks a subset by index (for the icon); the stray pixel follows the "s".
    """
    picked = list(enumerate(wm["letters"]))
    if letters is not None:
        picked = [(i, l) for i, l in picked if i in letters]
    x, placed = 0, []
    for i, l in picked:
        if i == 3 and placed:
            x += wm["space"]
        placed.append((x, l))
        x += len(l["rows"][0]) * l["unit"] + wm["gap"]
    sx, s = placed[-1]
    u = s["unit"]
    stray_x = sx + wm["stray"]["col"] * u
    stray_y = wm["height"] - len(s["rows"]) * u + wm["stray"]["row"] * u
    w, h = max(x - wm["gap"], stray_x + u), wm["height"]
    grid = [["."] * w for _ in range(h)]

    def fill(x0, y0, size, c):
        for yy in range(size):
            for xx in range(size):
                grid[y0 + yy][x0 + xx] = c

    for x0, l in placed:
        top = h - len(l["rows"]) * l["unit"]
        for j, row in enumerate(l["rows"]):
            for i, c in enumerate(row):
                if c == "X":
                    fill(x0 + i * l["unit"], top + j * l["unit"], l["unit"], "X")
    fill(stray_x, stray_y, u, "A")
    rows = ["".join(r) for r in grid]
    while rows and set(rows[0]) == {"."}:  # the icon has no ascender
        rows.pop(0)
    return rows


def garment_rows(rows, texture=None):
    w = len(rows[0]) + 2
    src = ["." * w] + ["." + r + "." for r in rows] + ["." * w]

    def filled(x, y):
        return 0 <= y < len(src) and 0 <= x < w and src[y][x] != "."

    out = []
    for y, row in enumerate(src):
        line = ""
        for x, c in enumerate(row):
            if c == ".":
                near = filled(x - 1, y) or filled(x + 1, y) or filled(x, y - 1) or filled(x, y + 1)
                c = "O" if near else "."
            elif c == "X" and texture == "dither" and x % 2 == 0 and y % 2 == 0:
                c = "S"
            line += c
        out.append(line)
    return out


def hex_rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def to_png(rows, color_of, path, scale, pad=0, bg=None):
    w, h = len(rows[0]), len(rows)
    img = Image.new("RGBA", (w + pad * 2, h + pad * 2), hex_rgb(bg) if bg else (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, c in enumerate(row):
            if c != ".":
                img.putpixel((x + pad, y + pad), hex_rgb(color_of(c)))
    img.resize((img.width * scale, img.height * scale), Image.NEAREST).save(path)


def to_svg(rows, color_of, path):
    w, h = len(rows[0]), len(rows)
    rects = []
    for y, row in enumerate(rows):
        x = 0
        while x < w:
            c, run = row[x], 1
            while x + run < w and row[x + run] == c:
                run += 1
            if c != ".":
                rects.append(f'<rect x="{x}" y="{y}" width="{run}" height="1" fill="{color_of(c)}"/>')
            x += run
    path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
                    f'width="{w * 4}" height="{h * 4}" shape-rendering="crispEdges">'
                    + "".join(rects) + "</svg>\n")


def main():
    data = load()
    pal = data["palette"]
    OUT.mkdir(exist_ok=True)
    word = wordmark_rows(data["wordmark"])
    icon = wordmark_rows(data["wordmark"], letters={5})
    # (name, letter colour, stray-pixel colour, background)
    schemes = (("ink", pal["ink"], pal["signal"], pal["bone"]),
               ("bone", pal["bone"], pal["signal"], pal["ink"]),
               ("signal", pal["signal"], pal["ink"], pal["bone"]))
    for name, ink, stray, bg in schemes:
        color = lambda c, ink=ink, stray=stray: stray if c == "A" else ink
        to_png(word, color, OUT / f"wordmark-{name}.png", 4, pad=12)
        to_png(word, color, OUT / f"wordmark-{name}-on-bg.png", 4, pad=24, bg=bg)
        to_svg(word, color, OUT / f"wordmark-{name}.svg")
        to_png(icon, color, OUT / f"icon-{name}.png", 12, pad=6, bg=bg)
        to_svg(icon, color, OUT / f"icon-{name}.svg")

    for p in data["products"]:
        rows = garment_rows(p["rows"], p.get("texture"))
        for cw_id in p["colorways"]:
            cw = data["colorways"][cw_id]
            to_png(rows, lambda c, cw=cw: pal["ink"] if c == "O" else cw[c],
                   OUT / f"{p['id']}-{cw_id}.png", 32, pad=2)
    print("wrote", len(list(OUT.iterdir())), "files to", OUT)


if __name__ == "__main__":
    main()
