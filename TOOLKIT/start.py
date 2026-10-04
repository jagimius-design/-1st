"""The Start sheet: settings, the MTD start-date check, headline figures and a monthly chart."""

from openpyxl.chart import BarChart, Reference

import mtd
from layout import (EXPENSES, EXP_FIRST, EXP_LAST, HOME, HOME_FIRST, HOME_LAST, INCOME, INC_FIRST,
                    INC_LAST, INVOICES, IN_FIRST, IN_LAST, MILEAGE, MIL_FIRST, MIL_LAST, START,
                    YEAR, col)
from rates import REF
from style import (BLUE, DATE, GRID, INPUT, MONEY, MUTED, NAVY, cell, dropdown, header, sheet,
                   tile, title)
from taxcalc import BILL_REF

QUALIFYING = [("2024-25 qualifying income", 38000), ("2025-26 qualifying income", 41500),
              ("2026-27 qualifying income", 44000)]
MONTH_FIRST = 17


def build(wb):
    ws = sheet(wb, START, [3, 22, 22, 22, 22, 22, 22, 3])
    title(ws, "Sole trader records 2026-27", "Income, expenses and MTD quarterly totals for one"
          " tax year, with a tax and NI estimate. Yellow cells are yours to fill in.")

    cell(ws, "B5", "SETTINGS", bold=True, size=9, color=BLUE)
    settings = [(6, "Business name", "Your Business Name", None),
                (7, "Tax year starting April", 2026, "0"),
                (8, "Tax year", f'={YEAR}&"-"&RIGHT({YEAR}+1,2)', None),
                (9, "Scottish taxpayer?", "No", None)]
    for r, label, value, fmt in settings:
        ws.merge_cells(f"B{r}:C{r}")
        cell(ws, f"B{r}", label, border=GRID)
        is_input = not str(value).startswith("=")
        cell(ws, f"D{r}", value, fmt, bold=not is_input, bg=INPUT if is_input else None,
             align="center", border=GRID)
    dropdown(ws, "D9", '"Yes,No"')

    cell(ws, "F5", "AM I IN MAKING TAX DIGITAL?", bold=True, size=9, color=BLUE)
    for i, (label, value) in enumerate(QUALIFYING):
        cell(ws, f"F{6 + i}", label, border=GRID)
        cell(ws, f"G{6 + i}", value, MONEY, bg=INPUT, align="right", border=GRID)
    cell(ws, "F9", "MTD applies from", bold=True, color=NAVY, border=GRID)
    cell(ws, "G9", f'=IF(G6>{REF["mtd26"]},"6 April 2026",IF(G7>{REF["mtd27"]},"6 April 2027",'
         f'IF(G8>{REF["mtd28"]},"6 April 2028","Not yet")))', bold=True, color=NAVY,
         align="center", border=GRID)
    cell(ws, "B10", "Qualifying income is self-employment plus property turnover before"
         " expenses, from each year's tax return. Thresholds on the Rates sheet; some people are"
         " exempt, so check gov.uk.", size=9, color=MUTED, italic=True)

    sends = [mtd.ref(mtd.SEND_BY, c) for c in mtd.QUARTERS]
    next_due = "=" + "".join(f"IF(TODAY()<={s},{s}," for s in sends) + \
        f"DATE({YEAR}+2,1,31)" + ")" * len(sends)
    tiles = [("INCOME SO FAR", f"={mtd.ref(mtd.TOTAL_INCOME)}", MONEY),
             ("ALLOWABLE EXPENSES", f"={mtd.ref(mtd.ALLOWABLE)}", MONEY),
             ("PROFIT SO FAR", f"={mtd.ref(mtd.PROFIT)}", MONEY),
             ("TAX AND NI, YEAR ESTIMATE", f"={BILL_REF}", MONEY),
             ("UNPAID INVOICES", f"=SUM({col(INVOICES, 'I', IN_FIRST, IN_LAST)})", MONEY),
             ("NEXT MTD DEADLINE", next_due, DATE)]
    for i, (label, formula, fmt) in enumerate(tiles):
        tile(ws, 12, 2 + i, label, formula, fmt)
    cell(ws, "B14", "After the fourth update, the next deadline is the final declaration on"
         " 31 January.", size=9, color=MUTED, italic=True)

    header(ws, MONTH_FIRST - 1, 2, ["Tax month from", "Income", "Expenses", "Profit"])
    for i in range(12):
        r = MONTH_FIRST + i
        start, end = f"DATE({YEAR},{4 + i},6)", f"DATE({YEAR},{5 + i},5)"

        def total(sheet_name, amount_col, first, last, date_col="B"):
            dates = col(sheet_name, date_col, first, last)
            return (f'SUMIFS({col(sheet_name, amount_col, first, last)},{dates},">="&{start},'
                    f'{dates},"<="&{end})')
        cell(ws, f"B{r}", f"={start}", "mmm yyyy", align="center", border=GRID)
        cell(ws, f"C{r}", f"={total(INCOME, 'G', INC_FIRST, INC_LAST)}", MONEY, align="right",
             border=GRID)
        cell(ws, f"D{r}", f"={total(EXPENSES, 'H', EXP_FIRST, EXP_LAST)}"
             f"+{total(MILEAGE, 'G', MIL_FIRST, MIL_LAST)}+{total(HOME, 'E', HOME_FIRST, HOME_LAST)}",
             MONEY, align="right", border=GRID)
        cell(ws, f"E{r}", f"=C{r}-D{r}", MONEY, align="right", border=GRID)
    last = MONTH_FIRST + 11

    chart = BarChart()
    chart.title = "Income and expenses by month"
    chart.style = 10
    chart.y_axis.numFmt = "#,##0"
    chart.y_axis.majorGridlines = None
    chart.add_data(Reference(ws, min_col=3, max_col=4, min_row=MONTH_FIRST - 1, max_row=last),
                   titles_from_data=True)
    chart.set_categories(Reference(ws, min_col=2, min_row=MONTH_FIRST, max_row=last))
    for s, color in zip(chart.series, ["3E7CB1", "9DB3C9"]):
        s.graphicalProperties.solidFill = color
        s.graphicalProperties.line.solidFill = color
    chart.height, chart.width = 8, 15
    chart.legend.position = "b"
    ws.add_chart(chart, f"F{MONTH_FIRST - 1}")
