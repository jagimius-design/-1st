from datetime import datetime

from invoice import FIRST, LAST, LINES


def with_discount_and_vat(wb):
    wb["Invoice"][f"D{LAST + 3}"] = 0.1
    wb["Invoice"][f"D{LAST + 4}"] = 0.2


def test_totals_follow_lines_discount_and_vat(recalc):
    ws = recalc("invoice", with_discount_and_vat)["Invoice"]
    subtotal = sum(q * p for _, q, p in LINES)
    discount = round(subtotal * 0.1, 2)
    total = round(subtotal - discount + round((subtotal - discount) * 0.2, 2), 2)
    t = LAST + 2
    assert ws[f"E{t}"].value == subtotal
    assert ws[f"E{t + 3}"].value == total
    assert ws[f"E{t + 5}"].value == total


def test_empty_lines_stay_blank(recalc):
    ws = recalc("invoice")["Invoice"]
    assert ws[f"E{FIRST + len(LINES)}"].value in (None, "")


def test_due_date_adds_payment_terms(recalc):
    assert recalc("invoice")["Invoice"]["E7"].value == datetime(2026, 10, 31)
