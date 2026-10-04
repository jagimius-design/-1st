# TOOLKIT

The paid kit, the Sole Trader MTD Kit 2026-27: one records workbook, a printable UK invoice and a
PDF quick-start guide, zipped as `dist/sole-trader-mtd-kit-2026-27.zip`. Everything is generated;
`uv run python build.py` rebuilds it (`dist/` is not committed). `uv run pytest` checks the
formulas.

The templates must work in Excel, Google Sheets and LibreOffice, so formulas stick to functions all
three share (SUMIFS, INDEX/MATCH, IFERROR, DATE, TODAY): no XLOOKUP, FILTER, MAXIFS, LET, dynamic
arrays or table structured references. Lists are fixed-size ranges with the formulas pre-filled on
every row and returning `""` while the row is empty. Yellow fill marks input cells, except on the
printable invoice. The kit never claims to be "MTD-ready" or HMRC-approved.

The records workbook flows one way. Income, Expenses, Mileage and Use of Home feed MTD Quarters,
which holds cumulative SA103 totals in one fixed range for bridging software. Its full-year column
feeds Tax Estimate, and every rate comes from the Rates sheet. Invoices read what was paid from the
Income rows that carry their number, so money received is entered once.

- `build.py`: builds every part into `dist/` and zips them.
- `book.py`: assembles the records workbook from the sheet modules below, in sheet order.
- `layout.py`: sheet names, list row ranges and the Start settings cells that other sheets read.
- `start.py`: Start, which holds the settings, the "Am I in MTD?" check, headline figures and the
  monthly chart.
- `records.py`: Income, Expenses, Mileage (flat rate with the 10,000-mile step), Use of Home.
- `mtd.py`: MTD Quarters and the SA103 category list (HMRC field and box per row).
- `taxcalc.py`: Tax Estimate, covering income tax (UK or Scottish bands), the allowance taper,
  Class 4, payments on account and the full-year projection.
- `rates.py`: the Rates sheet with every 2026-27 figure and where to check it.
- `clients.py`: Clients, Projects, Time Log, Invoices.
- `sample.py`: the sample records the workbook ships with, which tests reuse as expected values.
- `invoice.py`: Invoice.xlsx.
- `guide.py`: Quick-Start-Guide.pdf (reportlab, A4).
- `style.py`: the palette, £ and date formats, and helpers for headers, banded tables, tiles,
  dropdowns and conditional colours.
- `docs/uk-rates-2026-27.md`: how each tax figure was confirmed, and the mapping choices.
- `tests/`: the `recalc` fixture in `conftest.py` computes values by round-tripping a built file,
  optionally edited first, through headless LibreOffice. It needs the `libreoffice-calc` package;
  tests skip without it. `test_taxcalc.py` checks the estimate against an independent Python
  calculation.
