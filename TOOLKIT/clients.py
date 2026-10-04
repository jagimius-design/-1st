"""Client-Project-Tracker.xlsx: clients, projects, a time log and invoices, with a dashboard."""

from datetime import date

from style import (AMBER_BG, AMBER_FG, BLUE, DATE, GREEN_BG, GREEN_FG, HOURS, INPUT_NOTE, MONEY,
                   MUTED, RED_BG, RED_FG, cell, dropdown, header, highlight, negative_red, sheet,
                   status_colors, table, tile, title, workbook)

Y = 2026
CLIENTS = [  # name, contact, email, hourly rate, payment terms (days)
    ("Acme Corp", "Jane Doe", "jane@acme.example", 85, 30),
    ("Northwind Studio", "Tom Reyes", "tom@northwind.example", 75, 14),
    ("Greenleaf Ltd", "Priya Shah", "priya@greenleaf.example", 90, 30),
    ("Bluebird Cafe", "Sam Lee", "sam@bluebird.example", 60, 7),
    ("Orbit Apps", "Mia Chen", "mia@orbit.example", 95, 30),
]
PROJECTS = [  # name, client, rate override, budget hours, status
    ("Acme - monthly retainer", "Acme Corp", None, 120, "Active"),
    ("Northwind - brand refresh", "Northwind Studio", None, 40, "Done"),
    ("Greenleaf - website", "Greenleaf Ltd", 95, 60, "Active"),
    ("Bluebird - seasonal menu", "Bluebird Cafe", None, 12, "Done"),
    ("Orbit - onboarding screens", "Orbit Apps", None, 30, "Active"),
    ("Portfolio update", None, None, 10, "On hold"),
]
TIME = [  # date, project index, task, hours, billable, invoice #
    (date(Y, 7, 1), 0, "Social graphics", 6, "Yes", "INV-0031"),
    (date(Y, 7, 8), 0, "Newsletter layout", 5.5, "Yes", "INV-0031"),
    (date(Y, 7, 14), 1, "Logo concepts", 8, "Yes", "INV-0032"),
    (date(Y, 7, 16), 1, "Logo refinements", 6, "Yes", "INV-0032"),
    (date(Y, 7, 21), 0, "Landing page banners", 7, "Yes", "INV-0031"),
    (date(Y, 7, 24), 1, "Brand guidelines", 10, "Yes", "INV-0032"),
    (date(Y, 7, 29), 0, "Client call", 1, "No", None),
    (date(Y, 8, 4), 2, "Sitemap and wireframes", 9, "Yes", "INV-0034"),
    (date(Y, 8, 6), 0, "Ad set, August", 6.5, "Yes", "INV-0033"),
    (date(Y, 8, 11), 2, "Homepage design", 8, "Yes", "INV-0034"),
    (date(Y, 8, 13), 3, "Menu layout", 5, "Yes", "INV-0035"),
    (date(Y, 8, 14), 3, "Print files", 2.5, "Yes", "INV-0035"),
    (date(Y, 8, 18), 2, "Inner page designs", 10, "Yes", "INV-0034"),
    (date(Y, 8, 20), 0, "Social graphics", 8, "Yes", "INV-0033"),
    (date(Y, 8, 27), 0, "Newsletter layout", 5, "Yes", "INV-0033"),
    (date(Y, 9, 2), 4, "User flow review", 4, "Yes", "INV-0037"),
    (date(Y, 9, 3), 0, "Ad set, September", 7, "Yes", "INV-0036"),
    (date(Y, 9, 8), 4, "Onboarding screens v1", 9, "Yes", "INV-0037"),
    (date(Y, 9, 9), 2, "Responsive layouts", 8.5, "Yes", "INV-0038"),
    (date(Y, 9, 15), 0, "Event poster", 6, "Yes", "INV-0036"),
    (date(Y, 9, 16), 5, "Case study write-up", 4, "No", None),
    (date(Y, 9, 17), 4, "Onboarding screens v2", 7, "Yes", "INV-0037"),
    (date(Y, 9, 22), 2, "Developer handoff", 6, "Yes", "INV-0038"),
    (date(Y, 9, 24), 0, "Newsletter layout", 5, "Yes", "INV-0036"),
    (date(Y, 9, 30), 2, "QA round", 3, "Yes", None),
    (date(Y, 10, 1), 0, "Ad set, October", 6, "Yes", None),
    (date(Y, 10, 2), 4, "Illustrations", 5.5, "Yes", None),
]
INVOICES = [  # number, project index, issue date, paid date, amount paid (None: in full)
    ("INV-0031", 0, date(Y, 7, 31), date(Y, 8, 25), None),
    ("INV-0032", 1, date(Y, 7, 31), date(Y, 8, 12), None),
    ("INV-0033", 0, date(Y, 8, 31), date(Y, 9, 28), None),
    ("INV-0034", 2, date(Y, 8, 31), date(Y, 9, 30), None),
    ("INV-0035", 3, date(Y, 8, 31), None, None),
    ("INV-0036", 0, date(Y, 9, 30), date(Y, 10, 2), 500),
    ("INV-0037", 4, date(Y, 9, 30), None, None),
    ("INV-0038", 2, date(Y, 9, 30), None, None),
]
CL_FIRST, CL_LAST = 5, 104
PR_FIRST, PR_LAST = 5, 204
TL_FIRST, TL_LAST = 5, 2004
IN_FIRST, IN_LAST = 5, 504


def project_rate(i):
    _, client, override, _, _ = PROJECTS[i]
    if override:
        return override
    return next((c[3] for c in CLIENTS if c[0] == client), None)


def invoice_amount(number):
    """Sample invoices bill exactly the time logged against them."""
    return sum(h * project_rate(p) for _, p, _, h, _, inv in TIME if inv == number)


def _rng(sheet_name, col, first, last):
    return f"'{sheet_name}'!${col}${first}:${col}${last}"


def _lookup(value, sheet_name, key_col, out_col, first, last):
    return (f"INDEX({_rng(sheet_name, out_col, first, last)},"
            f"MATCH({value},{_rng(sheet_name, key_col, first, last)},0))")


def _clients(wb):
    ws = sheet(wb, "Clients", [3, 24, 18, 28, 13, 13, 14, 14, 14, 14, 28], tab=BLUE)
    title(ws, "Clients", "Your clients with their default rate and payment terms. Money columns"
          " come from the Invoices sheet. " + INPUT_NOTE)
    header(ws, CL_FIRST - 1, 2, ["Client", "Contact", "Email", "Hourly rate",
                                 "Payment terms (days)", "Invoiced", "Paid", "Unpaid",
                                 "Overdue", "Notes"])
    inv_client = _rng("Invoices", "C", IN_FIRST, IN_LAST)
    for r in range(CL_FIRST, CL_LAST + 1):
        i = r - CL_FIRST
        if i < len(CLIENTS):
            for col, v in zip("BCDEF", CLIENTS[i]):
                ws[f"{col}{r}"] = v
        ws[f"G{r}"] = (f'=IF(B{r}="","",SUMIFS({_rng("Invoices", "G", IN_FIRST, IN_LAST)},'
                       f'{inv_client},B{r}))')
        ws[f"H{r}"] = (f'=IF(B{r}="","",SUMIFS({_rng("Invoices", "H", IN_FIRST, IN_LAST)},'
                       f'{inv_client},B{r}))')
        ws[f"I{r}"] = f'=IF(B{r}="","",G{r}-H{r})'
        ws[f"J{r}"] = (f'=IF(B{r}="","",SUMIFS({_rng("Invoices", "J", IN_FIRST, IN_LAST)},'
                       f'{inv_client},B{r},{_rng("Invoices", "K", IN_FIRST, IN_LAST)},"Overdue"))')
    table(ws, CL_FIRST, CL_LAST, {
        "B": (None, True, "left"), "C": (None, True, "left"), "D": (None, True, "left"),
        "E": (MONEY, True, "right"), "F": ("0", True, "center"), "G": (MONEY, False, "right"),
        "H": (MONEY, False, "right"), "I": (MONEY, False, "right"),
        "J": (MONEY, False, "right"), "K": (None, True, "left")})
    highlight(ws, f"J{CL_FIRST}:J{CL_LAST}", f"AND(ISNUMBER(J{CL_FIRST}),J{CL_FIRST}>0)", RED_BG,
              RED_FG)
    ws.freeze_panes = f"C{CL_FIRST}"


def _projects(wb):
    ws = sheet(wb, "Projects", [3, 30, 22, 13, 11, 12, 12, 12, 14, 12], tab=BLUE)
    title(ws, "Projects", "Leave Rate override empty to use the client's hourly rate. Hours"
          " and value come from the Time Log. " + INPUT_NOTE)
    header(ws, PR_FIRST - 1, 2, ["Project", "Client", "Rate override", "Rate", "Budget hours",
                                 "Hours logged", "Hours left", "Billable value", "Status"])
    for r in range(PR_FIRST, PR_LAST + 1):
        i = r - PR_FIRST
        if i < len(PROJECTS):
            name, client, override, budget, status = PROJECTS[i]
            ws[f"B{r}"], ws[f"C{r}"], ws[f"D{r}"], ws[f"F{r}"], ws[f"J{r}"] = (
                name, client, override, budget, status)
        rate = _lookup(f"C{r}", "Clients", "B", "E", CL_FIRST, CL_LAST)
        ws[f"E{r}"] = f'=IF(B{r}="","",IF(D{r}<>"",D{r},IF(C{r}="","",IFERROR({rate},""))))'
        tl_project = _rng("Time Log", "C", TL_FIRST, TL_LAST)
        ws[f"G{r}"] = (f'=IF(B{r}="","",SUMIFS({_rng("Time Log", "E", TL_FIRST, TL_LAST)},'
                       f'{tl_project},B{r}))')
        ws[f"H{r}"] = f'=IF(OR(B{r}="",F{r}=""),"",F{r}-G{r})'
        ws[f"I{r}"] = (f'=IF(B{r}="","",SUMIFS({_rng("Time Log", "H", TL_FIRST, TL_LAST)},'
                       f'{tl_project},B{r}))')
    table(ws, PR_FIRST, PR_LAST, {
        "B": (None, True, "left"), "C": (None, True, "left"), "D": (MONEY, True, "right"),
        "E": (MONEY, False, "right"), "F": (HOURS, True, "right"), "G": (HOURS, False, "right"),
        "H": (HOURS, False, "right"), "I": (MONEY, False, "right"), "J": (None, True, "center")})
    dropdown(ws, f"C{PR_FIRST}:C{PR_LAST}", _rng("Clients", "B", CL_FIRST, CL_LAST))
    dropdown(ws, f"J{PR_FIRST}:J{PR_LAST}", '"Active,On hold,Done"')
    negative_red(ws, f"H{PR_FIRST}:H{PR_LAST}", f"H{PR_FIRST}")
    status_colors(ws, f"J{PR_FIRST}:J{PR_LAST}", f"J{PR_FIRST}",
                  {"Active": (GREEN_BG, GREEN_FG), "On hold": (AMBER_BG, AMBER_FG)})
    ws.freeze_panes = f"C{PR_FIRST}"


def _time_log(wb):
    ws = sheet(wb, "Time Log", [3, 13, 30, 30, 9, 10, 12, 13, 22, 13, 13], tab=BLUE)
    title(ws, "Time log", 'Log hours per project. Set Billable to "No" for unpaid time; fill'
          " Invoice # once the hours are billed. " + INPUT_NOTE)
    header(ws, TL_FIRST - 1, 2, ["Date", "Project", "Task", "Hours", "Billable", "Rate",
                                 "Amount", "Client", "Invoice #", "Not yet invoiced"])
    for r in range(TL_FIRST, TL_LAST + 1):
        i = r - TL_FIRST
        if i < len(TIME):
            d, p, task, hours, billable, inv = TIME[i]
            ws[f"B{r}"], ws[f"C{r}"], ws[f"D{r}"], ws[f"E{r}"], ws[f"F{r}"], ws[f"J{r}"] = (
                d, PROJECTS[p][0], task, hours, billable, inv)
        rate = _lookup(f"C{r}", "Projects", "B", "E", PR_FIRST, PR_LAST)
        client = _lookup(f"C{r}", "Projects", "B", "C", PR_FIRST, PR_LAST)
        ws[f"G{r}"] = f'=IF(C{r}="","",IFERROR({rate},""))'
        ws[f"H{r}"] = f'=IF(OR(E{r}="",G{r}=""),"",IF(F{r}="No",0,E{r}*G{r}))'
        # ""& turns the lookup of an empty client cell into "" rather than 0
        ws[f"I{r}"] = f'=IF(C{r}="","",IFERROR(""&{client},""))'
        ws[f"K{r}"] = f'=IF(AND(ISNUMBER(H{r}),J{r}=""),H{r},"")'
    table(ws, TL_FIRST, TL_LAST, {
        "B": (DATE, True, "center"), "C": (None, True, "left"), "D": (None, True, "left"),
        "E": (HOURS, True, "right"), "F": (None, True, "center"), "G": (MONEY, False, "right"),
        "H": (MONEY, False, "right"), "I": (None, False, "left"), "J": (None, True, "center"),
        "K": (MONEY, False, "right")})
    dropdown(ws, f"C{TL_FIRST}:C{TL_LAST}", _rng("Projects", "B", PR_FIRST, PR_LAST))
    dropdown(ws, f"F{TL_FIRST}:F{TL_LAST}", '"Yes,No"')
    ws.freeze_panes = f"C{TL_FIRST}"
    ws.auto_filter.ref = f"B{TL_FIRST - 1}:K{TL_LAST}"


def _invoices(wb):
    ws = sheet(wb, "Invoices", [3, 13, 22, 28, 13, 13, 13, 13, 13, 13, 11, 10], tab=BLUE)
    title(ws, "Invoices", "One row per invoice sent. The due date follows the client's payment"
          " terms; record payments as they arrive. " + INPUT_NOTE)
    header(ws, IN_FIRST - 1, 2, ["Invoice #", "Client", "Project", "Issue date", "Due date",
                                 "Amount", "Amount paid", "Paid date", "Balance", "Status",
                                 "Days overdue"])
    for r in range(IN_FIRST, IN_LAST + 1):
        i = r - IN_FIRST
        if i < len(INVOICES):
            number, p, issued, paid_on, paid = INVOICES[i]
            ws[f"B{r}"], ws[f"C{r}"], ws[f"D{r}"], ws[f"E{r}"] = (
                number, PROJECTS[p][1], PROJECTS[p][0], issued)
            ws[f"G{r}"] = invoice_amount(number)
            if paid_on:
                ws[f"H{r}"], ws[f"I{r}"] = paid or invoice_amount(number), paid_on
        terms = _lookup(f"C{r}", "Clients", "B", "F", CL_FIRST, CL_LAST)
        ws[f"F{r}"] = f'=IF(E{r}="","",E{r}+IFERROR({terms},30))'
        ws[f"J{r}"] = f'=IF(G{r}="","",G{r}-N(H{r}))'
        ws[f"K{r}"] = (f'=IF(G{r}="","",IF(J{r}<=0,"Paid",IF(F{r}="","Open",'
                       f'IF(TODAY()>F{r},"Overdue","Open"))))')
        ws[f"L{r}"] = f'=IF(K{r}="Overdue",TODAY()-F{r},"")'
    table(ws, IN_FIRST, IN_LAST, {
        "B": (None, True, "center"), "C": (None, True, "left"), "D": (None, True, "left"),
        "E": (DATE, True, "center"), "F": (DATE, False, "center"), "G": (MONEY, True, "right"),
        "H": (MONEY, True, "right"), "I": (DATE, True, "center"), "J": (MONEY, False, "right"),
        "K": (None, False, "center"), "L": ("0", False, "center")})
    dropdown(ws, f"C{IN_FIRST}:C{IN_LAST}", _rng("Clients", "B", CL_FIRST, CL_LAST))
    dropdown(ws, f"D{IN_FIRST}:D{IN_LAST}", _rng("Projects", "B", PR_FIRST, PR_LAST))
    status_colors(ws, f"K{IN_FIRST}:K{IN_LAST}", f"K{IN_FIRST}",
                  {"Paid": (GREEN_BG, GREEN_FG), "Open": (AMBER_BG, AMBER_FG),
                   "Overdue": (RED_BG, RED_FG)})
    ws.freeze_panes = f"C{IN_FIRST}"
    ws.auto_filter.ref = f"B{IN_FIRST - 1}:L{IN_LAST}"


def _dashboard(wb):
    ws = sheet(wb, "Dashboard", [3, 13, 13, 3, 13, 13, 3, 13, 13])
    title(ws, "Client & project tracker", "Live totals from the other sheets.")
    def inv(col):
        return _rng("Invoices", col, IN_FIRST, IN_LAST)

    def tl(col):
        return _rng("Time Log", col, TL_FIRST, TL_LAST)

    month = "DATE(YEAR(TODAY()),MONTH(TODAY()),1)"
    next_month = "DATE(YEAR(TODAY()),MONTH(TODAY())+1,1)"
    tiles = [
        ("INVOICED", f"=SUM({inv('G')})", MONEY), ("PAID", f"=SUM({inv('H')})", MONEY),
        ("OUTSTANDING", f"=SUM({inv('J')})", MONEY),
        ("OVERDUE", f'=SUMIFS({inv("J")},{inv("K")},"Overdue")', MONEY),
        ("NOT YET INVOICED", f"=SUM({tl('K')})", MONEY),
        ("HOURS THIS MONTH",
         f'=SUMIFS({tl("E")},{tl("B")},">="&{month},{tl("B")},"<"&{next_month})', HOURS),
    ]
    for i, (label, formula, fmt) in enumerate(tiles):
        row, col = 5 + 3 * (i // 3), 2 + 3 * (i % 3)
        tile(ws, row, col, label, formula, fmt, span=2)
    cell(ws, "B12", "Outstanding: invoiced but not yet paid. Overdue: the part of it past the"
         " due date.", size=9, color=MUTED, italic=True)
    cell(ws, "B13", "Not yet invoiced: billable time on the Time Log with no invoice number.",
         size=9, color=MUTED, italic=True)
    cell(ws, "B14", "Per-client balances are on the Clients sheet.", size=9, color=MUTED,
         italic=True)


def build(path):
    wb = workbook()
    _dashboard(wb)
    _clients(wb)
    _projects(wb)
    _time_log(wb)
    _invoices(wb)
    wb.save(path)
