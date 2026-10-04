"""Builds the kit into dist/: the workbook, the invoice, the guide, and the zip buyers download."""

import sys
import zipfile
from pathlib import Path

import book
import guide
import invoice

PARTS = [  # file name, builder
    ("Sole-Trader-Records-2026-27.xlsx", book.build),
    ("Invoice.xlsx", invoice.build),
    ("Quick-Start-Guide.pdf", guide.build),
]
ZIP_NAME = "sole-trader-mtd-kit-2026-27.zip"
FOLDER = guide.KIT  # top folder inside the zip


def build(dist):
    dist = Path(dist)
    dist.mkdir(parents=True, exist_ok=True)
    zip_path = dist / ZIP_NAME
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for name, make in PARTS:
            make(dist / name)
            z.write(dist / name, f"{FOLDER}/{name}")
    return zip_path


if __name__ == "__main__":
    print(build(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).parent / "dist"))
