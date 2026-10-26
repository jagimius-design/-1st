"""Exports the LOW RES logo, emblem and garments as PNG and SVG files in exports/.

Reads the same bitmaps the site draws from (pixels.js), so the files always match the page.
Run: python3 export.py
"""
import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).parent
OUT = HERE / "exports"


def load():
    src = (HERE / "pixels.js").read_text()
    return json.loads(src.split("=", 1)[1].strip().rstrip(";"))


def text_rows(text, font):
    glyphs = [font.get(c, font[" "]) for c in text.upper()]
    return [".".join(g[y] for g in glyphs) for y in range(5)]


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
                    f'width="{w * 20}" height="{h * 20}" shape-rendering="crispEdges">'
                    + "".join(rects) + "</svg>\n")


def lockup(data):
    """Emblem centred over the wordmark, as one bitmap with per-pixel colour keys."""
    emblem = data["emblem"]["rows"]
    word = text_rows("LOW RES", data["font"])
    w = max(len(emblem[0]), len(word[0]))
    centre = lambda r: [("." * ((w - len(r[0])) // 2) + line).ljust(w, ".") for line in r]
    word = [line.replace("X", "T") for line in centre(word)]
    return centre(emblem) + ["." * w] * 2 + word


def main():
    data = load()
    pal = data["palette"]
    OUT.mkdir(exist_ok=True)
    emblem_color = lambda c: pal[data["emblem"]["colors"][c]]

    word = text_rows("LOW RES", data["font"])
    for name, color in (("ink", pal["ink"]), ("bone", pal["bone"]), ("signal", pal["signal"])):
        to_png(word, lambda c: color, OUT / f"wordmark-{name}.png", 24, pad=2)
        to_svg(word, lambda c: color, OUT / f"wordmark-{name}.svg")

    to_png(data["emblem"]["rows"], emblem_color, OUT / "emblem.png", 32)
    to_svg(data["emblem"]["rows"], emblem_color, OUT / "emblem.svg")

    for name, ink in (("light", pal["ink"]), ("dark", pal["bone"])):
        rows = lockup(data)
        color = lambda c, ink=ink: ink if c == "T" else emblem_color(c)
        bg = pal["bone"] if name == "light" else pal["ink"]
        to_png(rows, color, OUT / f"lockup-{name}.png", 24, pad=4, bg=bg)
        to_svg(rows, color, OUT / f"lockup-{name}.svg")

    for p in data["products"]:
        rows = garment_rows(p["rows"], p.get("texture"))
        for cw_id in p["colorways"]:
            cw = data["colorways"][cw_id]
            to_png(rows, lambda c, cw=cw: pal["ink"] if c == "O" else cw[c],
                   OUT / f"{p['id']}-{cw_id}.png", 32, pad=2)
    print("wrote", len(list(OUT.iterdir())), "files to", OUT)


if __name__ == "__main__":
    main()
