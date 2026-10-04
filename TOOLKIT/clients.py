"""Clients, Projects, Time Log and Invoices. Invoices learn what was paid from the Income sheet."""

import sample
from layout import (CLIENTS, CL_FIRST, CL_LAST, INCOME, INC_FIRST, INC_LAST, INVOICES, IN_FIRST,
                    IN_LAST, PROJECTS, PR_FIRST, PR_LAST, TIMELOG, TL_FIRST, TL_LAST, col)
from style import (AMBER_BG, AMBER_FG, BLUE, DATE, GREEN_BG, GREEN_FG, HOURS, INPUT_NOTE, MONEY,
                   RED_BG, RED_FG, dropdown, header, highlight, negative_red, sheet,
                   status_colors, table, title)


def _lookup(value, sheet_name, key_col, out_col, first, last):
    return (f"INDEX({col(sheet_name, out_col, first, last)},"
            f"MATCH({value},{col(sheet_name, key_col, first, last)},0))")


def _clients(wb):
    ws = sheet(wb, CLIENTS, [3, 24, 18, 28, 13, 13, 14, 14, 14, 14, 28], tab=BLUE)
    title(ws, "Clients", "Your clients with their default rate and payment terms. Money columns"
          " come from the Invoices sheet. " + INPUT_NOTE)
    header(ws, CL_FIRST - 1, 2, ["Client", "Contact", "Email", "Hourly rate",
                                 "Payment terms (days)", "Invoiced", "Paid", "Unpaid",
                                 "Overdue", "Notes"])
    inv_client = col(INVOICES, "C", IN_FIRST, IN_LAST)

    def by_client(c, r, extra=""):
        return f'=IF(B{r}="","",SUMIFS({col(INVOICES, c, IN_FIRST, IN_LAST)},{inv_client},B{r}{extra}))'

    for r in range(CL_FIRST, CL_LAST + 1):
        i = r - CL_FIRST
        if i < len(sample.CLIENTS):
            for c, v in zip("BCDEF", sample.CLIENTS[i]):
                ws[f"{c}{r}"] = v
        ws[f"G{r}"] = by_client("G", r)
        ws[f"H{r}"] = by_client("H", r)
        ws[f"I{r}"] = f'=IF(B{r}="","",G{r}-H{r})'
        ws[f"J{r}"] = by_client("I", r, f',{col(INVOICES, "J", IN_FIRST, IN_LAST)},"Overdue"')
    table(ws, CL_FIRST, CL_LAST, {
        "B": (None, True, "left"), "C": (None, True, "left"), "D": (None, True, "left"),
        "E": (MONEY, True, "right"), "F": ("0", True, "center"), "G": (MONEY, False, "right"),
        "H": (MONEY, False, "right"), "I": (MONEY, False, "right"),
        "J": (MONEY, False, "right"), "K": (None, True, "left")})
    highlight(ws, f"J{CL_FIRST}:J{CL_LAST}", f"AND(ISNUMBER(J{CL_FIRST}),J{CL_FIRST}>0)", RED_BG,
              RED_FG)
    ws.freeze_panes = f"C{CL_FIRST}"


def _projects(wb):
    ws = sheet(wb, PROJECTS, [3, 30, 22, 13, 11, 12, 12, 12, 14, 12], tab=BLUE)
    title(ws, "Projects", "Leave Rate override empty to use the client's hourly rate. Hours"
          " and value come from the Time Log. " + INPUT_NOTE)
    header(ws, PR_FIRST - 1, 2, ["Project", "Client", "Rate override", "Rate", "Budget hours",
                                 "Hours logged", "Hours left", "Billable value", "Status"])
    tl_project = col(TIMELOG, "C", TL_FIRST, TL_LAST)
    for r in range(PR_FIRST, PR_LAST + 1):
        i = r - PR_FIRST
        if i < len(sample.PROJECTS):
            name, client, override, budget, status = sample.PROJECTS[i]
            ws[f"B{r}"], ws[f"C{r}"], ws[f"D{r}"], ws[f"F{r}"], ws[f"J{r}"] = (
                name, client, override, budget, status)
        rate = _lookup(f"C{r}", CLIENTS, "B", "E", CL_FIRST, CL_LAST)
        ws[f"E{r}"] = f'=IF(B{r}="","",IF(D{r}<>"",D{r},IF(C{r}="","",IFERROR({rate},""))))'
        ws[f"G{r}"] = (f'=IF(B{r}="","",SUMIFS({col(TIMELOG, "E", TL_FIRST, TL_LAST)},'
                       f'{tl_project},B{r}))')
        ws[f"H{r}"] = f'=IF(OR(B{r}="",F{r}=""),"",F{r}-G{r})'
        ws[f"I{r}"] = (f'=IF(B{r}="","",SUMIFS({col(TIMELOG, "H", TL_FIRST, TL_LAST)},'
                       f'{tl_project},B{r}))')
    table(ws, PR_FIRST, PR_LAST, {
        "B": (None, True, "left"), "C": (None, True, "left"), "D": (MONEY, True, "right"),
        "E": (MONEY, False, "right"), "F": (HOURS, True, "right"), "G": (HOURS, False, "right"),
        "H": (HOURS, False, "right"), "I": (MONEY, False, "right"), "J": (None, True, "center")})
    dropdown(ws, f"C{PR_FIRST}:C{PR_LAST}", col(CLIENTS, "B", CL_FIRST, CL_LAST))
    dropdown(ws, f"J{PR_FIRST}:J{PR_LAST}", '"Active,On hold,Done"')
    negative_red(ws, f"H{PR_FIRST}:H{PR_LAST}", f"H{PR_FIRST}")
    status_colors(ws, f"J{PR_FIRST}:J{PR_LAST}", f"J{PR_FIRST}",
                  {"Active": (GREEN_BG, GREEN_FG), "On hold": (AMBER_BG, AMBER_FG)})
    ws.freeze_panes = f"C{PR_FIRST}"


def _time_log(wb):
    ws = sheet(wb, TIMELOG, [3, 13, 30, 30, 9, 10, 12, 13, 22, 13, 13], tab=BLUE)
    title(ws, "Time log", 'Log hours per project. Set Billable to "No" for unpaid time; fill'
          " Invoice # once the hours are billed. " + INPUT_NOTE)
    header(ws, TL_FIRST - 1, 2, ["Date", "Project", "Task", "Hours", "Billable", "Rate",
                                 "Amount", "Client", "Invoice #", "Not yet invoiced"])
    for r in range(TL_FIRST, TL_LAST + 1):
        i = r - TL_FIRST
        if i < len(sample.TIME):
            d, p, task, hours, billable, inv = sample.TIME[i]
            ws[f"B{r}"], ws[f"C{r}"], ws[f"D{r}"], ws[f"E{r}"], ws[f"F{r}"], ws[f"J{r}"] = (
                d, sample.PROJECTS[p][0], task, hours, billable, inv)
        rate = _lookup(f"C{r}", PROJECTS, "B", "E", PR_FIRST, PR_LAST)
        client = _lookup(f"C{r}", PROJECTS, "B", "C", PR_FIRST, PR_LAST)
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
    dropdown(ws, f"C{TL_FIRST}:C{TL_LAST}", col(PROJECTS, "B", PR_FIRST, PR_LAST))
    dropdown(ws, f"F{TL_FIRST}:F{TL_LAST}", '"Yes,No"')
    ws.freeze_panes = f"C{TL_FIRST}"
    ws.auto_filter.ref = f"B{TL_FIRST - 1}:K{TL_LAST}"


def _invoices(wb):
    ws = sheet(wb, INVOICES, [3, 13, 22, 28, 13, 13, 13, 13, 13, 11, 10], tab=BLUE)
    title(ws, "Invoices", "One row per invoice sent. Payments come from the Income sheet rows"
          " that carry the invoice number, so record money there only. " + INPUT_NOTE)
    header(ws, IN_FIRST - 1, 2, ["Invoice #", "Client", "Project", "Issue date", "Due date",
                                 "Amount", "Paid", "Balance", "Status", "Days overdue"])
    paid_by = col(INCOME, "G", INC_FIRST, INC_LAST)
    paid_for = col(INCOME, "D", INC_FIRST, INC_LAST)
    for r in range(IN_FIRST, IN_LAST + 1):
        i = r - IN_FIRST
        if i < len(sample.INVOICES):
            number, p, issued, _ = sample.INVOICES[i]
            ws[f"B{r}"], ws[f"C{r}"], ws[f"D{r}"], ws[f"E{r}"], ws[f"G{r}"] = (
                number, sample.PROJECTS[p][1], sample.PROJECTS[p][0], issued,
                sample.invoice_amount(number))
        terms = _lookup(f"C{r}", CLIENTS, "B", "F", CL_FIRST, CL_LAST)
        ws[f"F{r}"] = f'=IF(E{r}="","",E{r}+IFERROR({terms},30))'
        ws[f"H{r}"] = f'=IF(B{r}="","",SUMIFS({paid_by},{paid_for},B{r}))'
        ws[f"I{r}"] = f'=IF(G{r}="","",G{r}-N(H{r}))'
        ws[f"J{r}"] = (f'=IF(G{r}="","",IF(I{r}<=0,"Paid",IF(F{r}="","Open",'
                       f'IF(TODAY()>F{r},"Overdue","Open"))))')
        ws[f"K{r}"] = f'=IF(J{r}="Overdue",TODAY()-F{r},"")'
    table(ws, IN_FIRST, IN_LAST, {
        "B": (None, True, "center"), "C": (None, True, "left"), "D": (None, True, "left"),
        "E": (DATE, True, "center"), "F": (DATE, False, "center"), "G": (MONEY, True, "right"),
        "H": (MONEY, False, "right"), "I": (MONEY, False, "right"),
        "J": (None, False, "center"), "K": ("0", False, "center")})
    dropdown(ws, f"C{IN_FIRST}:C{IN_LAST}", col(CLIENTS, "B", CL_FIRST, CL_LAST))
    dropdown(ws, f"D{IN_FIRST}:D{IN_LAST}", col(PROJECTS, "B", PR_FIRST, PR_LAST))
    status_colors(ws, f"J{IN_FIRST}:J{IN_LAST}", f"J{IN_FIRST}",
                  {"Paid": (GREEN_BG, GREEN_FG), "Open": (AMBER_BG, AMBER_FG),
                   "Overdue": (RED_BG, RED_FG)})
    ws.freeze_panes = f"C{IN_FIRST}"
    ws.auto_filter.ref = f"B{IN_FIRST - 1}:K{IN_LAST}"


def build(wb):
    _clients(wb)
    _projects(wb)
    _time_log(wb)
    _invoices(wb)
