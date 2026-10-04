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
    im.alpha_composite(card("expenses", 560, 400), (690, 40))
    im.alpha_composite(card("tax", 520), (740, 430))
    im.alpha_composite(card("invoice", 330, 470), (560, 150))
    x = 64
    d.text((x, 92), "FREELANCER", font=font(30, True), fill="#9DBEDD")
    d.text((x, 130), "Finance Kit", font=font(70, True), fill="white")
    d.rectangle((x, 232, x + 90, 238), fill=CREAM)
    lines = ["Invoice", "Expense tracker", "Tax set-aside", "Client & project tracker",
             "+ Quick-start guide (PDF)"]
    for i, t in enumerate(lines):
        d.text((x, 270 + i * 44), t, font=font(27, i < 4), fill="white" if i < 4 else "#C9D8E8")
    d.text((x, 556), "Excel  ·  Google Sheets  ·  LibreOffice", font=font(22), fill="#C9D8E8")
    im.convert("RGB").save(path, optimize=True)


def thumbnail(path):
    im = Image.new("RGBA", (600, 600), NAVY)
    d = ImageDraw.Draw(im)
    im.alpha_composite(card("invoice", 300, 340), (262, 236))
    d.text((44, 52), "FREELANCER", font=font(26, True), fill="#9DBEDD")
    d.text((44, 86), "Finance Kit", font=font(56, True), fill="white")
    d.rectangle((44, 170, 114, 175), fill=CREAM)
    for i, t in enumerate(["Invoice", "Expenses", "Tax set-aside", "Clients"]):
        d.text((44, 262 + i * 46), t, font=font(28, True), fill="white")
    im.convert("RGB").save(path, optimize=True)


if __name__ == "__main__":
    cover(HERE / "cover.png")
    thumbnail(HERE / "thumbnail.png")
