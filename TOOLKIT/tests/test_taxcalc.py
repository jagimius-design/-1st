"""The tax estimate against an independent 2026-27 calculation (figures from
docs/uk-rates-2026-27.md, typed here rather than read from rates.py)."""

from datetime import date

import pytest

import taxcalc as T
from conftest import clear_records
from layout import INCOME, INC_FIRST, START, TAX

RUK = [(37700, 0.20), (125140, 0.40), (None, 0.45)]
SCOT = [(3967, 0.19), (16956, 0.20), (31092, 0.21), (62430, 0.42), (125140, 0.45), (None, 0.48)]


def reference(profit, scottish=False, paye_income=0, paye_tax=0):
    taxable_profit = max(0, profit)
    total = taxable_profit + paye_income
    pa = max(0, 12570 - max(0, total - 100000) / 2)
    taxable = max(0, total - pa)
    tax, lower = 0, 0
    for upper, rate in SCOT if scottish else RUK:
        top = taxable if upper is None else min(taxable, upper)
        tax += round(max(0, top - lower) * rate, 2)
        lower = upper or lower
    c4 = round(0.06 * max(0, min(taxable_profit, 50270) - 12570), 2)
    c4 += round(0.02 * max(0, taxable_profit - 50270), 2)
    return round(tax - paye_tax + c4, 2)


def scenario(turnover, scottish=False, paye_income=0, paye_tax=0, allowance="No",
             last_bill=0, last_source=0):
    def edit(wb):
        clear_records(wb)
        ws = wb[INCOME]
        ws[f"B{INC_FIRST}"], ws[f"F{INC_FIRST}"], ws[f"G{INC_FIRST}"] = (
            date(2026, 5, 1), "Turnover", turnover)
        wb[START]["D9"] = "Yes" if scottish else "No"
        t = wb[TAX]
        t[f"C{T.BASIS}"], t[f"C{T.ALLOWANCE}"] = "Records so far", allowance
        t[f"C{T.PAYE_INCOME}"], t[f"C{T.PAYE_TAX}"] = paye_income, paye_tax
        t[f"C{T.LAST_BILL}"], t[f"C{T.LAST_SOURCE}"] = last_bill, last_source
    edit.__name__ = (f"tax_{turnover}_{scottish}_{paye_income}_{paye_tax}_{allowance}_"
                     f"{last_bill}_{last_source}")
    return edit


@pytest.mark.parametrize("turnover,scottish,paye_income,paye_tax", [
    (8000, False, 0, 0),        # under the personal allowance
    (30000, False, 0, 0),       # basic rate
    (62000, False, 0, 0),       # higher rate, Class 4 above the upper limit
    (110000, False, 0, 0),      # inside the personal allowance taper
    (150000, False, 0, 0),      # additional rate, no allowance
    (45000, True, 0, 0),        # Scottish intermediate and higher
    (110000, True, 0, 0),       # Scottish advanced rate with the taper
    (20000, False, 30000, 3486),  # salary uses the allowance and basic band first
])
def test_bill_matches_reference(recalc, turnover, scottish, paye_income, paye_tax):
    ws = recalc("book", scenario(turnover, scottish, paye_income, paye_tax))[TAX]
    assert ws[f"C{T.BILL}"].value == pytest.approx(
        reference(turnover, scottish, paye_income, paye_tax), abs=0.011)


def test_trading_allowance_replaces_expenses(recalc):
    ws = recalc("book", scenario(1800, allowance="Yes"))[TAX]
    assert ws[f"C{T.EXPENSES}"].value == 1000
    assert ws[f"C{T.PROFIT}"].value == 800


def test_payments_on_account_from_last_bill(recalc):
    ws = recalc("book", scenario(40000, last_bill=4000))[TAX]
    bill = reference(40000)
    assert ws[f"C{T.POA1}"].value == 2000
    assert ws[f"C{T.BALANCE}"].value == pytest.approx(bill - 4000, abs=0.011)
    assert ws[f"C{T.NEXT1}"].value == pytest.approx(bill / 2, abs=0.011)


@pytest.mark.parametrize("last_bill,last_source", [(900, 0), (2000, 9000)])
def test_no_payments_on_account_under_1000_or_mostly_taxed_at_source(recalc, last_bill,
                                                                      last_source):
    ws = recalc("book", scenario(40000, last_bill=last_bill, last_source=last_source))[TAX]
    assert ws[f"C{T.POA1}"].value == 0


def test_projection_scales_records_to_twelve_months(recalc):
    ws = recalc("book")[TAX]
    months = ws[f"C{T.MONTHS}"].value
    from mtd import TOTAL_INCOME
    recorded = recalc("book")["MTD Quarters"][f"H{TOTAL_INCOME}"].value
    assert ws[f"C{T.INCOME}"].value == pytest.approx(recorded * 12 / months, abs=0.011)
