"""Store cover (1280x720) and thumbnail (600x600) from the template screenshots in SITE/img/.

Run: uv run --with pillow python LAUNCH/cover.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
SHOTS = HERE.parent / "SITE" / "img"
NAVY, BLUE, PALE, CREAM = "#1F3A5F", "#3E7CB1", "#EEF3F8", "#FFF8DC"
FONTS = Path("/usr/share/fonts/truetype/dejavu")


def font(size, bold=False):
    return ImageFont.truetype(str(FONTS / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")),
                              size)


def card(name, width, crop_height=None):
    """A screenshot scaled to `width`, optionally cut to `crop_height`, with a drop shadow."""
    im = Image.open(SHOTS / f"{name}.png").convert("RGB")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    if crop_height:
        im = im.crop((0, 0, width, min(crop_height, im.height)))
    pad = 18
    out = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    shadow = Image.new("RGBA", out.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle((pad, pad + 6, pad + im.width, pad + im.height + 6),
                                     fill=(0, 0, 0, 110))
    out.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(9)))
    out.paste(im, (pad, pad))
    return out


def cover(path):
    im = Image.new("RGBA", (1280, 720), NAVY)
    d = ImageDraw.Draw(im)
    # Screenshots fanned on the right, back to front.
    im.alpha_composite(card("quarters", 600, 330), (650, 30))
    im.alpha_composite(card("start", 580, 290), (690, 400))
    im.alpha_composite(card("tax", 320, 420), (560, 200))
    x = 64
    d.text((x, 78), "UK SOLE TRADER", font=font(28, True), fill="#9DBEDD")
    d.text((x, 114), "MTD Kit", font=font(76, True), fill="white")
    d.text((x, 210), "2026-27 tax year", font=font(28), fill=CREAM)
    d.rectangle((x, 262, x + 90, 268), fill=CREAM)
    lines = ["SA103 records workbook", "Quarterly totals for", "bridging software",
             "Tax & Class 4 NI estimate", "Invoices & clients"]
    for i, t in enumerate(lines):
        d.text((x, 296 + i * 42), t, font=font(26, True), fill="white")
    d.text((x, 530), "No subscription  ·  no macros", font=font(22), fill="#C9D8E8")
    d.text((x, 566), "Excel  ·  Google Sheets  ·  LibreOffice", font=font(22), fill="#C9D8E8")
    im.convert("RGB").save(path, optimize=True)


def thumbnail(path):
    im = Image.new("RGBA", (600, 600), NAVY)
    d = ImageDraw.Draw(im)
    im.alpha_composite(card("quarters", 512, 250), (26, 318))
    d.text((44, 44), "UK SOLE TRADER", font=font(26, True), fill="#9DBEDD")
    d.text((44, 78), "MTD Kit", font=font(72, True), fill="white")
    d.text((44, 172), "2026-27", font=font(40, True), fill=CREAM)
    d.text((44, 230), "Spreadsheet records, no subscription", font=font(22), fill="#C9D8E8")
    im.convert("RGB").save(path, optimize=True)


if __name__ == "__main__":
    cover(HERE / "cover.png")
    thumbnail(HERE / "thumbnail.png")
