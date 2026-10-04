from datetime import datetime

from invoice import DISCOUNT, FIRST, LAST, LINES, TAX


def test_totals_follow_lines_discount_and_tax(recalc):
    ws = recalc("invoice")["Invoice"]
    subtotal = sum(q * p for _, q, p in LINES)
    discount = round(subtotal * DISCOUNT, 2)
    total = subtotal - discount + round((subtotal - discount) * TAX, 2)
    t = LAST + 2
    assert ws[f"E{t}"].value == subtotal
    assert ws[f"E{t + 3}"].value == round(total, 2)
    assert ws[f"E{t + 5}"].value == round(total, 2)


def test_empty_lines_stay_blank(recalc):
    ws = recalc("invoice")["Invoice"]
    assert ws[f"E{FIRST + len(LINES)}"].value in (None, "")


def test_due_date_adds_payment_terms(recalc):
    assert recalc("invoice")["Invoice"]["E7"].value == datetime(2026, 10, 15)
