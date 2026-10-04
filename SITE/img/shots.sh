#!/bin/sh
# Regenerates the template screenshots in this folder from a fresh TOOLKIT build:
# full-size .png for store listings, smaller .webp for the site.
# Needs uv, LibreOffice (soffice), poppler (pdftoppm) and ImageMagick (convert).
set -e
here=$(cd "$(dirname "$0")" && pwd)
kit="$here/../../TOOLKIT"
tmp=$(mktemp -d)
(cd "$kit" && uv run python build.py >/dev/null)
soffice --headless --convert-to pdf --outdir "$tmp" "$kit"/dist/*.xlsx >/dev/null 2>&1
cp "$kit/dist/Quick-Start-Guide.pdf" "$tmp/"
# First page of each PDF is the template's front sheet.
for pair in Invoice:invoice Expense-Tracker:expenses Tax-Set-Aside:tax \
            Client-Project-Tracker:clients Quick-Start-Guide:guide; do
  src=${pair%%:*}; out=${pair#*:}
  pdftoppm -r 200 -png -f 1 -l 1 -singlefile "$tmp/$src.pdf" "$tmp/$out"
  convert "$tmp/$out.png" -trim +repage -bordercolor white -border 40 \
    -resize '1400x>' -strip "$here/$out.png"
  convert "$here/$out.png" -resize '900x>' -quality 82 "$here/$out.webp"
done
rm -rf "$tmp"
