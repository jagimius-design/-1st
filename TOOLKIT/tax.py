"""Tax-Set-Aside.xlsx: income log with the share to put aside, and a quarterly view."""

from datetime import date

from style import (AMBER_BG, AMBER_FG, BLUE, DATE, GREEN_BG, GREEN_FG, INPUT, INPUT_NOTE, MONEY,
                   MUTED, NAVY, PALE, PCT, TOPLINE, cell, dropdown, header, negative_red, sheet,
                   status_colors, table, tile, title, workbook)

YEAR, START_MONTH = 2026, 1
RATES = [("Income tax", 0.15), ("Social security / self-employment", 0.12),
         ("State / local / other", 0.03)]
TAX_PAID = [3800, 4100, 4400, None]
DUE = [date(YEAR, 4, 15), date(YEAR, 6, 15), date(YEAR, 9, 15), date(YEAR + 1, 1, 15)]
SAMPLE = [  # date, client, description, amount, moved to tax account
    (date(YEAR, 1, 9), "Northwind Studio", "Brand refresh - deposit", 2400, "Yes"),
    (date(YEAR, 1, 30), "Acme Corp", "Monthly retainer - January", 3200, "Yes"),
    (date(YEAR, 2, 14), "Northwind Studio", "Brand refresh - final", 3600, "Yes"),
    (date(YEAR, 2, 27), "Acme Corp", "Monthly retainer - February", 3200, "Yes"),
    (date(YEAR, 3, 18), "Bluebird Cafe", "Menu and signage design", 1150, "Yes"),
    (date(YEAR, 3, 31), "Acme Corp", "Monthly retainer - March", 3200, "Yes"),
    (date(YEAR, 4, 22), "Greenleaf Ltd", "Website - milestone 1", 4500, "Yes"),
    (date(YEAR, 4, 30), "Acme Corp", "Monthly retainer - April", 3200, "Yes"),
    (date(YEAR, 5, 29), "Acme Corp", "Monthly retainer - May", 3200, "Yes"),
    (date(YEAR, 6, 12), "Greenleaf Ltd", "Website - milestone 2", 4500, "Yes"),
    (date(YEAR, 6, 30), "Acme Corp", "Monthly retainer - June", 3200, "Yes"),
    (date(YEAR, 7, 15), "Orbit Apps", "App onboarding screens", 2750, "Yes"),
    (date(YEAR, 7, 31), "Acme Corp", "Monthly retainer - July", 3200, "Yes"),
    (date(YEAR, 8, 20), "Greenleaf Ltd", "Website - final payment", 3000, "Yes"),
    (date(YEAR, 8, 31), "Acme Corp", "Monthly retainer - August", 3200, "Yes"),
    (date(YEAR, 9, 10), "Bluebird Cafe", "Seasonal menu", 680, "No"),
    (date(YEAR, 9, 30), "Acme Corp", "Monthly retainer - September", 3200, "No"),
]
INC_FIRST, INC_LAST = 5, 1004
Q_FIRST = 18  # first quarter row on Summary
RATE = "Summary!$E$11"


def _income(wb):
    ws = sheet(wb, "Income", [3, 13, 24, 34, 14, 14, 12, 15, 28], tab=BLUE)
    title(ws, "Income", "Log every payment you receive. Move the amount in the Set aside column"
          " to a separate tax savings account, then mark it moved. " + INPUT_NOTE)
    header(ws, INC_FIRST - 1, 2, ["Date received", "Client / source", "Description", "Amount",
                                  "Set aside", "Quarter", "Moved to tax account", "Notes"])
    for r in range(INC_FIRST, INC_LAST + 1):
        i = r - INC_FIRST
        if i < len(SAMPLE):
            d, client, desc, amount, moved = SAMPLE[i]
            ws[f"B{r}"], ws[f"C{r}"], ws[f"D{r}"], ws[f"E{r}"], ws[f"H{r}"] = (
                d, client, desc, amount, moved)
        ws[f"F{r}"] = f'=IF(E{r}="","",ROUND(E{r}*{RATE},2))'
        n = f"((YEAR(B{r})-Summary!$E$6)*12+MONTH(B{r})-Summary!$E$7)"
        ws[f"G{r}"] = f'=IF(B{r}="","",IF(OR({n}<0,{n}>11),"Other year","Q"&(INT({n}/3)+1)))'
    table(ws, INC_FIRST, INC_LAST, {
        "B": (DATE, True, "center"), "C": (None, True, "left"), "D": (None, True, "left"),
        "E": (MONEY, True, "right"), "F": (MONEY, False, "right"), "G": (None, False, "center"),
        "H": (None, True, "center"), "I": (None, True, "left")})
    dropdown(ws, f"H{INC_FIRST}:H{INC_LAST}", '"Yes,No"')
    status_colors(ws, f"H{INC_FIRST}:H{INC_LAST}", f"H{INC_FIRST}",
                  {"Yes": (GREEN_BG, GREEN_FG), "No": (AMBER_BG, AMBER_FG)})
    ws.freeze_panes = f"C{INC_FIRST}"
    ws.auto_filter.ref = f"B{INC_FIRST - 1}:I{INC_LAST}"


def _summary(wb):
    ws = sheet(wb, "Summary", [3] + [15] * 10)
    title(ws, "Tax set-aside", "Put a share of every payment aside so the tax bill is never a"
          " surprise. " + INPUT_NOTE)

    cell(ws, "B5", "SETTINGS", bold=True, size=9, color=BLUE)
    settings = [("Tax year", YEAR, "0"), ("Tax year starts in month (1-12)", START_MONTH, "0")]
    settings += [(label, rate, PCT) for label, rate in RATES]
    for r, (label, value, fmt) in enumerate(settings, start=6):
        ws.merge_cells(f"B{r}:D{r}")
        cell(ws, f"B{r}", label)
        cell(ws, f"E{r}", value, fmt, bg=INPUT, align="center")
    ws.merge_cells("B11:D11")
    cell(ws, "B11", "Total share to set aside", bold=True, color=NAVY, border=TOPLINE)
    cell(ws, "E11", "=SUM(E8:E10)", PCT, bold=True, color=NAVY, align="center", border=TOPLINE)
    cell(ws, "G6", "Rates are a rule of thumb, not tax advice. Pick rates that cover your",
         size=9, color=MUTED, italic=True)
    cell(ws, "G7", "income tax and contributions after expenses; an accountant can tell",
         size=9, color=MUTED, italic=True)
    cell(ws, "G8", "you the right figure. Quarters follow the tax year start month.",
         size=9, color=MUTED, italic=True)

    last = Q_FIRST + 3
    total = last + 1
    tile(ws, 13, 2, "INCOME THIS TAX YEAR", f"=E{total}", span=2)
    tile(ws, 13, 4, "TO SET ASIDE", f"=F{total}", span=2)
    tile(ws, 13, 6, "MOVED SO FAR", f"=G{total}", span=2)
    tile(ws, 13, 8, "STILL TO MOVE", f"=H{total}", span=2)
    tile(ws, 13, 10, "IN TAX ACCOUNT NOW", f"=K{total}", span=2)

    header(ws, Q_FIRST - 1, 2, ["Quarter", "From", "To", "Income", "To set aside",
                                "Moved to tax account", "Still to move", "Tax paid",
                                "Payment due", "Tax account balance"])
    inc = f"Income!$B${INC_FIRST}:$B${INC_LAST}"
    amt = f"Income!$E${INC_FIRST}:$E${INC_LAST}"
    aside = f"Income!$F${INC_FIRST}:$F${INC_LAST}"
    moved = f"Income!$H${INC_FIRST}:$H${INC_LAST}"
    for q in range(1, 5):
        r = Q_FIRST + q - 1
        window = f'{inc},">="&$C{r},{inc},"<="&$D{r}'
        ws[f"B{r}"] = f"Q{q}"
        ws[f"C{r}"] = f"=DATE($E$6,$E$7+{3 * (q - 1)},1)"
        ws[f"D{r}"] = f"=DATE($E$6,$E$7+{3 * q},1)-1"
        ws[f"E{r}"] = f"=SUMIFS({amt},{window})"
        ws[f"F{r}"] = f"=SUMIFS({aside},{window})"
        ws[f"G{r}"] = f'=SUMIFS({aside},{window},{moved},"Yes")'
        ws[f"H{r}"] = f"=F{r}-G{r}"
        ws[f"I{r}"] = TAX_PAID[q - 1]
        ws[f"J{r}"] = DUE[q - 1]
        ws[f"K{r}"] = f"=SUM($G${Q_FIRST}:G{r})-SUM($I${Q_FIRST}:I{r})"
    table(ws, Q_FIRST, last, {
        "B": (None, False, "center"), "C": (DATE, False, "center"), "D": (DATE, False, "center"),
        "E": (MONEY, False, "right"), "F": (MONEY, False, "right"), "G": (MONEY, False, "right"),
        "H": (MONEY, False, "right"), "I": (MONEY, True, "right"), "J": (DATE, True, "center"),
        "K": (MONEY, False, "right")})
    for col in "BCDEFGHIJK":
        f = {"B": "Year", "K": f"=G{total}-I{total}"}.get(col)
        if col in "EFGHI":
            f = f"=SUM({col}{Q_FIRST}:{col}{last})"
        cell(ws, f"{col}{total}", f, MONEY, bold=True, color=NAVY, bg=PALE, border=TOPLINE,
             align="center" if col == "B" else "right")
    negative_red(ws, f"K{Q_FIRST}:K{total}", f"K{Q_FIRST}")
    cell(ws, f"B{total + 2}", "Still to move: set-aside amounts not yet marked as moved on the"
         " Income sheet. Tax account balance: moved so far minus tax paid; red means you paid"
         " more than you put aside.", size=9, color=MUTED, italic=True)


def build(path):
    wb = workbook()
    _summary(wb)
    _income(wb)
    wb.save(path)
