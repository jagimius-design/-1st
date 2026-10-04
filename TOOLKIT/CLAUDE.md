# TOOLKIT

The paid kit: four .xlsx templates and a PDF quick-start guide, zipped as
`dist/freelancer-finance-kit.zip`. Everything is generated; `uv run python build.py` rebuilds it
(`dist/` is not committed). `uv run pytest` checks the formulas.

The templates must work in Excel, Google Sheets and LibreOffice, so formulas stick to functions all
three share (SUMIFS, INDEX/MATCH, IFERROR, DATE, TODAY): no XLOOKUP, FILTER, LET, dynamic arrays
or table structured references. Lists are fixed-size ranges with the formulas pre-filled on every
row and returning `""` while the row is empty. Yellow fill marks input cells, except on the
printable invoice.

- `build.py` — builds every part into `dist/` and zips them under one folder.
- `style.py` — palette, number formats and helpers (headers, banded tables, KPI tiles, dropdowns,
  conditional colours) shared by the templates.
- `invoice.py` — Invoice.xlsx.
- `expenses.py` — Expense-Tracker.xlsx: Summary (category x month, budgets, chart), Expenses,
  Categories.
- `tax.py` — Tax-Set-Aside.xlsx: Summary (rates, quarterly view), Income.
- `clients.py` — Client-Project-Tracker.xlsx: Dashboard, Clients, Projects, Time Log, Invoices.
- `guide.py` — Quick-Start-Guide.pdf (reportlab).
- `tests/` — one module per template plus the bundle; the `recalc` fixture in `conftest.py` gets
  computed values by round-tripping a file through headless LibreOffice, which needs the
  `libreoffice-calc` package (tests skip without it).

Each template module keeps its sample data as module constants, which the tests reuse as the
expected figures.
