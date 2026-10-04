#!/bin/sh
# Regenerates the kit screenshots in this folder from a fresh TOOLKIT build:
# full-size .png for store listings, smaller .webp for the site.
# Needs uv, LibreOffice (soffice), poppler (pdftoppm) and ImageMagick (convert).
set -e
here=$(cd "$(dirname "$0")" && pwd)
kit="$here/../../TOOLKIT"
tmp=$(mktemp -d)
(cd "$kit" && uv run python build.py >/dev/null)
# One PDF page per sheet, so page N is sheet N of the records workbook.
soffice --headless --convert-to 'pdf:calc_pdf_Export:{"SinglePageSheets":{"type":"boolean","value":"true"}}' \
  --outdir "$tmp" "$kit"/dist/*.xlsx >/dev/null 2>&1
cp "$kit/dist/Quick-Start-Guide.pdf" "$tmp/"
records=$(basename "$kit"/dist/Sole-Trader-Records-*.xlsx .xlsx)

# name pdf page crop-width crop-height, in points (0 = whole page); pages follow the sheet order.
while read -r out pdf page width crop; do
  set -- -r 200 -png -f "$page" -l "$page" -singlefile
  [ "$width" -gt 0 ] && set -- "$@" -W $((width * 200 / 72))
  [ "$crop" -gt 0 ] && set -- "$@" -H $((crop * 200 / 72))
  pdftoppm "$@" "$tmp/$pdf.pdf" "$tmp/$out"
  convert "$tmp/$out.png" -trim +repage -bordercolor white -border 40 \
    -resize '1400x>' -strip "$here/$out.png"
  convert "$here/$out.png" -resize '900x>' -quality 82 "$here/$out.webp"
done <<LIST
start $records 1 0 0
quarters $records 6 0 452
tax $records 7 0 0
invoices $records 11 0 284
invoice Invoice 1 690 0
guide Quick-Start-Guide 1 0 0
LIST
rm -rf "$tmp"
