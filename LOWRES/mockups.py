"""Clothing mockups for the bad-reception TV logo (options/tv06/05): flat product shots of tees,
hoodies, a cap, a tote and labels, with the logo printed on.

Writes options/mockups/NN-name.png and sheet.png. Run: python3 mockups.py
"""
import random
from dataclasses import replace
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

import tv

OUT = Path(__file__).parent / "options" / "mockups"
SS = 2                      # garments are drawn at 2x and scaled down, for smooth edges
CW, CH = 1200, 1400         # canvas
BACKDROP = (231, 224, 206)
KEY = (255, 0, 254)
FONT = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"

LOGO = tv.TV06[4]                                                     # bent antenna, bad reception
LOGO_CREAM = replace(LOGO, cabinet=(226, 220, 204), trim=(150, 146, 134), knob=tv.INK)
LOGO_ORANGE = replace(LOGO, cabinet=tv.SIGNAL, trim=(150, 48, 12), knob=tv.BONE)
LOGO_SQUARE = replace(LOGO, panel=False)


def logo(v, scale=1):
    """The TV on a transparent background, scaled by whole numbers."""
    img = tv.frame(replace(v, bg=KEY), tv.word_mask(v.word), random.Random(v.seed)).convert("RGBA")
    a = np.array(img)
    a[..., 3] = np.where((a[..., :3] == KEY).all(-1), 0, 255)
    img = Image.fromarray(a)
    img = img.crop(img.getbbox())
    return img.resize((img.width * scale, img.height * scale), Image.NEAREST)


def fit(img, width):
    """Scale to about `width` with nearest-neighbour, keeping the pixels square."""
    k = width / img.width
    return img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.NEAREST)


def garment(points, color, extra=(), folds=(), shade=0.24):
    """A garment shape with soft shading towards the edges. Returns (image, mask) at 1x."""
    s = lambda pts: [(x * SS, y * SS) for x, y in pts]
    mask = Image.new("L", (CW * SS, CH * SS), 0)
    d = ImageDraw.Draw(mask)
    d.polygon(s(points), fill=255)
    for kind, pts in extra:
        getattr(d, kind)(s(pts) if kind == "polygon" else [v * SS for v in pts], fill=255)
    mask = mask.resize((CW, CH), Image.LANCZOS)
    soft = np.array(mask.filter(ImageFilter.GaussianBlur(40)), float) / 255
    light = 1 - shade + shade * soft
    fold = Image.new("L", (CW, CH), 0)
    fd = ImageDraw.Draw(fold)
    for pts in folds:
        fd.line(pts, fill=255, width=18)
    fold = np.array(fold.filter(ImageFilter.GaussianBlur(14)), float) / 255
    light *= 1 - 0.12 * fold
    rgb = np.array(color, float) * light[..., None]
    grain = np.random.default_rng(1).normal(0, 3, (CH, CW, 1))
    img = Image.fromarray((rgb + grain).clip(0, 255).astype("uint8"))
    return img, mask, light


def print_on(img, light, art, x, y):
    """Prints the art onto the garment: it follows the garment's shading and keeps a little
    of the fabric grain."""
    base = img.copy()
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    layer.paste(art, (round(x), round(y)))
    a = np.array(layer, float)
    shade = light[..., None]
    rgb = a[..., :3] * (0.82 + 0.18 * shade)
    alpha = a[..., 3:] / 255 * 0.96
    out = np.array(base, float) * (1 - alpha) + rgb * alpha
    return Image.fromarray(out.clip(0, 255).astype("uint8"))


def stage(img, mask, title):
    """Garment on the backdrop with a soft drop shadow."""
    canvas = Image.new("RGB", (CW, CH), BACKDROP)
    shadow = mask.filter(ImageFilter.GaussianBlur(26)).point(lambda v: v * 0.35)
    canvas.paste((150, 142, 122), (14, 22), shadow)
    canvas.paste(img, (0, 0), mask)
    d = ImageDraw.Draw(canvas)
    d.text((48, CH - 70), title.upper(), font=ImageFont.truetype(FONT, 28), fill=tv.INK)
    return canvas


TEE = [(505, 165), (330, 215), (140, 440), (262, 515), (345, 450), (352, 1270), (848, 1270),
       (855, 450), (938, 515), (1060, 440), (870, 215), (695, 165), (650, 205), (600, 218), (550, 205)]
TEE_BACK = [(505, 165), (330, 215), (140, 440), (262, 515), (345, 450), (352, 1270), (848, 1270),
            (855, 450), (938, 515), (1060, 440), (870, 215), (695, 165), (600, 180)]
TEE_FOLDS = [[(420, 600), (470, 900), (430, 1200)], [(780, 640), (740, 1000)], [(250, 450), (320, 470)]]


def tee(color, title, art=None, at=(600, 330), width=430, back=False):
    pts = TEE_BACK if back else TEE
    collar = ("line", [])
    img, mask, light = garment(pts, color, folds=TEE_FOLDS)
    d = ImageDraw.Draw(img)
    rib = tuple(int(c * 0.8) for c in color)
    if back:
        d.line([(505, 168), (600, 182), (695, 168)], fill=rib, width=12)
    else:
        d.line([(505, 168), (550, 207), (600, 220), (650, 207), (695, 168)], fill=rib, width=16, joint="curve")
    if art is not None:
        art = fit(art, width)
        img = print_on(img, light, art, at[0] - art.width / 2, at[1])
    return stage(img, mask, title)


HOODIE = [(470, 250), (300, 300), (120, 520), (60, 1150), (170, 1180), (300, 620), (330, 1250),
          (870, 1250), (900, 620), (1030, 1180), (1140, 1150), (1080, 520), (900, 300), (730, 250)]


def hoodie(color, title, art, width=420):
    hood = ("ellipse", [430, 90, 770, 330])
    img, mask, light = garment(HOODIE, color, extra=[hood],
                               folds=[[(420, 700), (450, 1000)], [(790, 720), (760, 1050)], [(180, 700), (140, 1000)],
                                      [(1020, 700), (1060, 1000)]])
    d = ImageDraw.Draw(img)
    dark = tuple(int(c * 0.72) for c in color)
    rib = tuple(int(c * 0.86) for c in color)
    d.ellipse([480, 150, 720, 320], fill=dark)                       # hood opening
    d.line([(560, 300), (548, 470)], fill=(230, 226, 214), width=8)  # drawstrings
    d.line([(640, 300), (652, 470)], fill=(230, 226, 214), width=8)
    d.rectangle([330, 1190, 870, 1250], fill=rib)                    # hem rib
    d.polygon([(70, 1100), (172, 1124), (166, 1182), (60, 1150)], fill=rib)  # cuffs
    d.polygon([(1130, 1100), (1028, 1124), (1034, 1182), (1140, 1150)], fill=rib)
    d.line([(420, 1180), (450, 900), (750, 900), (780, 1180)], fill=dark, width=6)  # pocket
    art = fit(art, width)
    img = print_on(img, light, art, 600 - art.width / 2, 470)
    return stage(img, mask, title)


def cap(color, title, art):
    img = Image.new("RGB", (CW, CH), color)
    mask = Image.new("L", (CW * SS, CH * SS), 0)
    d = ImageDraw.Draw(mask)
    d.pieslice([220 * SS, 280 * SS, 980 * SS, 1040 * SS], 180, 360, fill=255)      # crown
    d.ellipse([290 * SS, 560 * SS, 910 * SS, 840 * SS], fill=255)                   # brim, curving towards us
    mask = mask.resize((CW, CH), Image.LANCZOS)
    soft = np.array(mask.filter(ImageFilter.GaussianBlur(50)), float) / 255
    light = 0.72 + 0.28 * soft
    img = Image.fromarray((np.array(color, float) * light[..., None]).clip(0, 255).astype("uint8"))
    d = ImageDraw.Draw(img)
    seam = tuple(int(c * 0.75) for c in color)
    under = tuple(int(c * 0.6) for c in color)
    d.chord([290, 640, 910, 840], 0, 180, fill=under)                               # brim underside
    d.arc([290, 560, 910, 840], 0, 180, fill=seam, width=4)
    d.line([(220, 660), (980, 660)], fill=seam, width=5)                            # sweatband line
    d.line([(600, 280), (600, 660)], fill=seam, width=4)
    d.arc([400, 280, 800, 1040], 180, 360, fill=seam, width=4)
    d.ellipse([580, 266, 620, 296], fill=seam)                                       # button
    art = fit(art, 230)
    img = print_on(img, light, art, 600 - art.width / 2, 420)
    return stage(img, mask, title)


def tote(color, title, art):
    pts = [(250, 420), (950, 420), (970, 1260), (230, 1260)]
    img, mask, light = garment(pts, color, folds=[[(400, 500), (380, 1200)]], shade=0.18)
    strap = Image.new("L", (CW * SS, CH * SS), 0)
    sd = ImageDraw.Draw(strap)
    for x0 in (360, 690):
        sd.arc([x0 * SS, 120 * SS, (x0 + 150) * SS, 720 * SS], 180, 360, fill=255, width=46 * SS)
    strap = strap.resize((CW, CH), Image.LANCZOS)
    dark = tuple(int(c * 0.8) for c in color)
    img.paste(dark, (0, 0), strap)
    mask = ImageChops.lighter(mask, strap)
    art = fit(art, 560)
    img = print_on(img, light, art, 600 - art.width / 2, 620)
    return stage(img, mask, title)


def labels(title):
    canvas = Image.new("RGB", (CW, CH), BACKDROP)
    d = ImageDraw.Draw(canvas)
    small = fit(logo(LOGO_SQUARE), 150)
    # woven neck label on a folded collar
    d.rectangle([150, 200, 1050, 520], fill=(36, 35, 30))
    d.rectangle([150, 200, 1050, 230], fill=(26, 25, 21))
    d.rectangle([420, 230, 780, 500], fill=tv.BONE)
    for y in range(232, 500, 4):
        d.line([(420, y), (780, y)], fill=(230, 224, 210), width=1)
    canvas.paste(small, (600 - small.width // 2, 245), small)
    f = ImageFont.truetype(FONT, 22)
    d.text((600, 478), "M  ·  ORGANIC COTTON", font=f, fill=tv.INK, anchor="mm")
    # hang tag on a string
    d.line([(600, 560), (600, 640)], fill=(120, 110, 90), width=4)
    d.rounded_rectangle([370, 640, 830, 1300], radius=24, fill=tv.SIGNAL)
    d.ellipse([585, 670, 615, 700], fill=BACKDROP)
    tag = fit(logo(LOGO), 380)
    canvas.paste(tag, (600 - tag.width // 2, 740), tag)
    big = ImageFont.truetype(FONT, 34)
    d.text((600, 1110), "LOW RES SUPPLY CO.", font=big, fill=tv.INK, anchor="mm")
    d.text((600, 1160), "NO SIGNAL. NO PROBLEM.", font=f, fill=tv.INK, anchor="mm")
    d.text((600, 1230), "ARTIFACT TEE  ·  $38", font=f, fill=tv.INK, anchor="mm")
    d.text((48, CH - 70), title.upper(), font=ImageFont.truetype(FONT, 28), fill=tv.INK)
    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    black, cream, orange, square = logo(LOGO), logo(LOGO_CREAM), logo(LOGO_ORANGE), logo(LOGO_SQUARE)
    shots = [
        ("bone-tee", tee((236, 230, 214), "Artifact Tee · Bone · chest print", black)),
        ("black-tee-back", tee((30, 29, 26), "Artifact Tee · Ink · back print", cream, at=(600, 290), width=480, back=True)),
        ("black-tee-orange", tee((30, 29, 26), "Artifact Tee · Ink · orange set", orange)),
        ("bone-tee-pocket", tee((236, 230, 214), "Artifact Tee · Bone · small chest", square, at=(735, 330), width=150)),
        ("moss-hoodie", hoodie((74, 101, 68), "Compression Hoodie · Moss", black)),
        ("grey-hoodie", hoodie((172, 170, 162), "Compression Hoodie · Heather", black)),
        ("cap", cap((30, 29, 26), "Signal Cap · Ink", square)),
        ("tote", tote((226, 216, 192), "Thumbnail Tote · Canvas", black)),
        ("labels", labels("Neck label and hang tag")),
    ]
    for i, (name, img) in enumerate(shots, 1):
        img.save(OUT / f"{i:02d}-{name}.png")
    tw, th, cols = 600, 700, 3
    sheet = Image.new("RGB", (cols * tw + (cols + 1) * 16, 3 * th + 4 * 16), (214, 206, 186))
    for i, (_, img) in enumerate(shots):
        sheet.paste(img.resize((tw, th), Image.LANCZOS), (16 + (i % cols) * (tw + 16), 16 + (i // cols) * (th + 16)))
    sheet.save(OUT / "sheet.png")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
