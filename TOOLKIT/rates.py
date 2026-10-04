"""The Rates sheet: every 2026-27 figure the workbook uses, with where to check it.

Formulas elsewhere read these cells through REF / the band rows, so next April's update is
this one sheet. docs/uk-rates-2026-27.md records how each figure was confirmed.
"""

from layout import RATES
from style import (BLUE, GRID, INPUT, MONEY, MUTED, NAVY, PALE, cell, header, sheet, title)

GOV = "https://www.gov.uk"
ITEMS = [  # key, label, value, number format, check at, note
    ("pa", "Personal allowance", 12570, MONEY, f"{GOV}/income-tax-rates", ""),
    ("pa_limit", "Personal allowance taper starts at (income)", 100000, MONEY,
     f"{GOV}/income-tax-rates/income-over-100000", "Allowance falls £1 for every £2 above this."),
    ("c4_lower", "Class 4 NI lower profits limit", 12570, MONEY,
     f"{GOV}/self-employed-national-insurance-rates", ""),
    ("c4_upper", "Class 4 NI upper profits limit", 50270, MONEY,
     f"{GOV}/self-employed-national-insurance-rates", ""),
    ("c4_main", "Class 4 NI main rate", 0.06, "0%", f"{GOV}/self-employed-national-insurance-rates",
     "On profits between the two limits."),
    ("c4_add", "Class 4 NI rate above upper limit", 0.02, "0%",
     f"{GOV}/self-employed-national-insurance-rates", ""),
    ("c2_spt", "Class 2 NI small profits threshold", 7105, MONEY,
     f"{GOV}/self-employed-national-insurance-rates",
     "Class 2 is no longer charged; above this it is treated as paid."),
    ("trading", "Trading allowance", 1000, MONEY,
     f"{GOV}/guidance/tax-free-allowances-on-property-and-trading-income",
     "Can be claimed instead of actual expenses."),
    ("car1", "Mileage: car or van, first 10,000 miles", 0.55, '"£"0.00',
     f"{GOV}/simpler-income-tax-simplified-expenses/vehicles-",
     "Raised from 45p for 2026-27 (announced 21 May 2026, backdated to 6 April)."),
    ("car_miles", "Mileage: car or van threshold (miles a year)", 10000, "#,##0",
     f"{GOV}/simpler-income-tax-simplified-expenses/vehicles-", ""),
    ("car2", "Mileage: car or van, above the threshold", 0.25, '"£"0.00',
     f"{GOV}/simpler-income-tax-simplified-expenses/vehicles-", ""),
    ("moto", "Mileage: motorcycle", 0.24, '"£"0.00',
     f"{GOV}/simpler-income-tax-simplified-expenses/vehicles-", ""),
    ("home1", "Use of home: 25-50 hours in the month", 10, MONEY,
     f"{GOV}/simpler-income-tax-simplified-expenses/working-from-home", "Per month."),
    ("home2", "Use of home: 51-100 hours in the month", 18, MONEY,
     f"{GOV}/simpler-income-tax-simplified-expenses/working-from-home", "Per month."),
    ("home3", "Use of home: 101 hours or more in the month", 26, MONEY,
     f"{GOV}/simpler-income-tax-simplified-expenses/working-from-home", "Per month."),
    ("poa_min", "Payments on account: not due if last bill under", 1000, MONEY,
     f"{GOV}/understand-self-assessment-bill/payments-on-account", ""),
    ("poa_source", "... or if this share was taxed at source", 0.8, "0%",
     f"{GOV}/understand-self-assessment-bill/payments-on-account", ""),
    ("vat", "VAT registration threshold", 90000, MONEY, f"{GOV}/vat-registration",
     "Below it, MTD updates may send expenses as one total."),
    ("mtd26", "MTD from 6 April 2026 if 2024-25 qualifying income over", 50000, MONEY,
     f"{GOV}/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax",
     "Qualifying income: self-employment plus property turnover, before expenses."),
    ("mtd27", "MTD from 6 April 2027 if 2025-26 qualifying income over", 30000, MONEY,
     f"{GOV}/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax", ""),
    ("mtd28", "MTD from 6 April 2028 if 2026-27 qualifying income over", 20000, MONEY,
     f"{GOV}/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax", ""),
]
# Bands are slices of taxable income (after the personal allowance); None means no upper limit.
RUK_BANDS = [("Basic rate", 0.20, 37700), ("Higher rate", 0.40, 125140),
             ("Additional rate", 0.45, None)]
SCOT_BANDS = [("Starter rate", 0.19, 3967), ("Basic rate", 0.20, 16956),
              ("Intermediate rate", 0.21, 31092), ("Higher rate", 0.42, 62430),
              ("Advanced rate", 0.45, 125140), ("Top rate", 0.48, None)]
SCOT_SOURCE = ("https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/"
               "pages/2026-to-2027/")

FIRST = 6
REF = {key: f"'{RATES}'!$C${FIRST + i}" for i, (key, *_) in enumerate(ITEMS)}
BANDS = 6  # band rows the Tax Estimate sheet walks; the UK list is padded with empty rows
RUK_FIRST = FIRST + len(ITEMS) + 3
SCOT_FIRST = RUK_FIRST + BANDS + 3


def band(regime_first, i, column):
    """Cell of band i (0-based) on the Rates sheet: column B name, C rate, D upper limit."""
    return f"'{RATES}'!${column}${regime_first + i}"


def build(wb):
    ws = sheet(wb, RATES, [3, 50, 14, 62, 60], tab=BLUE)
    title(ws, "Rates and allowances 2026-27", "Every figure the workbook uses. Check each one on"
          " gov.uk before relying on it, and update this sheet each April.")
    cell(ws, "B4", "England, Wales and Northern Ireland unless marked Scotland. Figures are"
         " for the 2026-27 tax year (6 April 2026 to 5 April 2027).", size=9, color=MUTED,
         italic=True)
    header(ws, FIRST - 1, 2, ["Item", "2026-27", "Check at", "Note"])
    for i, (_, label, value, fmt, url, note) in enumerate(ITEMS):
        r = FIRST + i
        cell(ws, f"B{r}", label, border=GRID)
        cell(ws, f"C{r}", value, fmt, bg=INPUT, align="right", border=GRID)
        cell(ws, f"D{r}", url, size=9, color=BLUE, border=GRID)
        cell(ws, f"E{r}", note, size=9, color=MUTED, border=GRID)

    for first, name, bands, url in [
            (RUK_FIRST, "Income tax bands: England, Wales and Northern Ireland", RUK_BANDS,
             f"{GOV}/income-tax-rates"),
            (SCOT_FIRST, "Income tax bands: Scotland", SCOT_BANDS, SCOT_SOURCE)]:
        cell(ws, f"B{first - 2}", name, bold=True, color=NAVY)
        header(ws, first - 1, 2, ["Band", "Rate", "Up to (taxable income)", "Check at"])
        for i in range(BANDS if first == RUK_FIRST else len(bands)):
            r = first + i
            label, rate, upper = bands[i] if i < len(bands) else (None, None, None)
            cell(ws, f"B{r}", label, border=GRID, bg=None if label else PALE)
            cell(ws, f"C{r}", rate, "0%", bg=INPUT if label else PALE, align="right",
                 border=GRID)
            cell(ws, f"D{r}", upper, MONEY, bg=INPUT if label else PALE, align="right",
                 border=GRID)
            cell(ws, f"E{r}", url if i == 0 else None, size=9, color=BLUE, border=GRID)
    last = SCOT_FIRST + len(SCOT_BANDS)
    cell(ws, f"B{last + 1}", "Taxable income is income after the personal allowance. An empty"
         " Up to means no upper limit.", size=9, color=MUTED, italic=True)
    ws.freeze_panes = f"A{FIRST}"
