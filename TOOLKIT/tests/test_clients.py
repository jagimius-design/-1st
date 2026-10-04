from datetime import date

from clients import (CL_FIRST, CLIENTS, INVOICES, PR_FIRST, PROJECTS, TIME, TL_FIRST,
                     invoice_amount, project_rate)


def test_project_rate_uses_override_else_client_rate(recalc):
    ws = recalc("clients")["Projects"]
    for i in range(len(PROJECTS)):
        assert ws[f"E{PR_FIRST + i}"].value in (project_rate(i), "", None)
    assert ws[f"E{PR_FIRST + 2}"].value == 95  # override over the client's 90


def test_project_hours_logged(recalc):
    ws = recalc("clients")["Projects"]
    for i in range(len(PROJECTS)):
        assert ws[f"G{PR_FIRST + i}"].value == sum(t[3] for t in TIME if t[1] == i)


def test_non_billable_time_is_worth_nothing(recalc):
    ws = recalc("clients")["Time Log"]
    for i, t in enumerate(TIME):
        if t[4] == "No" and project_rate(t[1]):
            assert ws[f"H{TL_FIRST + i}"].value == 0


def test_client_balances_and_overdue(recalc):
    ws = recalc("clients")["Clients"]
    for i, (name, *_, terms) in enumerate(CLIENTS):
        unpaid = overdue = 0
        for number, p, issued, paid_on, paid in INVOICES:
            if PROJECTS[p][1] != name:
                continue
            due = date.fromordinal(issued.toordinal() + terms)
            balance = invoice_amount(number) - (paid or invoice_amount(number) if paid_on else 0)
            unpaid += balance
            overdue += balance if balance > 0 and date.today() > due else 0
        assert abs(ws[f"I{CL_FIRST + i}"].value - unpaid) < 1e-9
        assert abs(ws[f"J{CL_FIRST + i}"].value - overdue) < 1e-9


def test_dashboard_not_yet_invoiced(recalc):
    ws = recalc("clients")["Dashboard"]
    expected = sum(h * project_rate(p) for _, p, _, h, b, inv in TIME
                   if b == "Yes" and inv is None and project_rate(p))
    assert ws["E9"].value == expected
