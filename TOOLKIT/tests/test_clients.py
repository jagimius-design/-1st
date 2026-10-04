from datetime import date, timedelta

import pytest

import sample
from layout import CLIENTS, CL_FIRST, INVOICES, IN_FIRST, PROJECTS, PR_FIRST


def paid(number):
    return sum(row[5] for row in sample.income() if row[2] == number)


def test_invoices_are_paid_from_income_records(recalc):
    ws = recalc("book")[INVOICES]
    for i, (number, *_) in enumerate(sample.INVOICES):
        r = IN_FIRST + i
        assert ws[f"H{r}"].value == pytest.approx(paid(number))
        assert ws[f"I{r}"].value == pytest.approx(sample.invoice_amount(number) - paid(number))


def test_status_follows_balance_and_due_date(recalc):
    ws = recalc("book")[INVOICES]
    terms = {c[0]: c[4] for c in sample.CLIENTS}
    for i, (number, p, issued, _) in enumerate(sample.INVOICES):
        due = issued + timedelta(days=terms[sample.PROJECTS[p][1]])
        balance = sample.invoice_amount(number) - paid(number)
        want = "Paid" if balance <= 0 else "Overdue" if date.today() > due else "Open"
        assert ws[f"J{IN_FIRST + i}"].value == want, number


def test_client_unpaid_balance(recalc):
    ws = recalc("book")[CLIENTS]
    for i, (name, *_) in enumerate(sample.CLIENTS):
        unpaid = sum(sample.invoice_amount(n) - paid(n) for n, p, _, _ in sample.INVOICES
                     if sample.PROJECTS[p][1] == name)
        assert ws[f"I{CL_FIRST + i}"].value == pytest.approx(unpaid)


def test_project_rate_uses_override_else_client_rate(recalc):
    ws = recalc("book")[PROJECTS]
    for i in range(len(sample.PROJECTS)):
        assert ws[f"E{PR_FIRST + i}"].value in (sample.project_rate(i), "", None)
    assert ws[f"E{PR_FIRST + 2}"].value == 95  # override over the client's 90
