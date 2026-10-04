from datetime import date

import pytest

import sample
from conftest import clear_records
from layout import EXPENSES, EXP_FIRST, INCOME, INC_FIRST, MILEAGE, MIL_FIRST, TAX
from taxcalc import SHARE_ROW


def long_drives(wb):
    clear_records(wb)
    ws = wb[MILEAGE]
    rows = [(date(2026, 5, 1), "Car or van", 9000), (date(2026, 6, 1), "Motorcycle", 100),
            (date(2026, 7, 1), "Car or van", 2000), (date(2026, 8, 1), "Car or van", 50)]
    for i, (d, vehicle, miles) in enumerate(rows):
        r = MIL_FIRST + i
        ws[f"B{r}"], ws[f"E{r}"], ws[f"F{r}"] = d, vehicle, miles


def test_car_rate_drops_after_10000_miles(recalc):
    ws = recalc("book", long_drives)[MILEAGE]
    claims = [ws[f"G{MIL_FIRST + i}"].value for i in range(4)]
    assert claims == pytest.approx([9000 * 0.55, 100 * 0.24, 1000 * 0.55 + 1000 * 0.25, 50 * 0.25])


def test_business_use_share_of_an_expense(recalc):
    ws = recalc("book")[EXPENSES]
    for i, (*_, amount, share) in enumerate(sample.EXPENSES):
        assert ws[f"H{EXP_FIRST + i}"].value == pytest.approx(round(amount * (share or 1), 2))


def test_put_aside_is_the_tax_share_of_each_payment(recalc):
    wb = recalc("book")
    share = wb[TAX][f"C{SHARE_ROW}"].value
    for i, row in enumerate(sample.income()):
        assert wb[INCOME][f"H{INC_FIRST + i}"].value == pytest.approx(round(row[5] * share, 2))
