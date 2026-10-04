"""Builds the kit into dist/: the four templates, the guide, and the zip buyers download."""

import sys
import zipfile
from pathlib import Path

import clients
import expenses
import guide
import invoice
import tax

PARTS = [  # file name, builder
    ("Invoice.xlsx", invoice.build),
    ("Expense-Tracker.xlsx", expenses.build),
    ("Tax-Set-Aside.xlsx", tax.build),
    ("Client-Project-Tracker.xlsx", clients.build),
    ("Quick-Start-Guide.pdf", guide.build),
]
ZIP_NAME = "freelancer-finance-kit.zip"
FOLDER = "Freelancer Finance Kit"  # top folder inside the zip


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
