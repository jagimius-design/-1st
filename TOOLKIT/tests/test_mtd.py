from datetime import date

import pytest

import mtd
import sample
from layout import MTD

START = date(2026, 4, 6)
Q_ENDS = [date(2026, 7, 5), date(2026, 10, 5), date(2027, 1, 5), date(2027, 4, 5)]
HOME_FROM = [date(2026, 4 + i, 6) for i in range(len(sample.HOME_HOURS))]


def home_rate(hours):
    return 26 if hours > 100 else 18 if hours > 50 else 10 if hours >= 25 else 0


def expected(category, end):
    total = sum(round(a * (b or 1), 2) for d, _, _, c, a, b in sample.EXPENSES
                if c == category and START <= d <= end)
    if category == mtd.MILEAGE_TO:  # the sample stays under 10,000 car miles
        total += sum(round(m * (0.24 if v == "Motorcycle" else 0.55), 2)
                     for d, _, _, v, m in sample.MILEAGE if START <= d <= end)
    if category == mtd.HOME_TO:
        total += sum(home_rate(h) for d, h in zip(HOME_FROM, sample.HOME_HOURS) if d <= end)
    return total


def test_income_is_cumulative_by_type(recalc):
    ws = recalc("book")[MTD]
    for q, c in enumerate(mtd.QUARTERS):
        for r, kind in [(mtd.TURNOVER, sample.TURNOVER), (mtd.OTHER, sample.OTHER)]:
            want = sum(row[5] for row in sample.income() if row[4] == kind and START <= row[0] <= Q_ENDS[q])
            assert ws[f"{c}{r}"].value == pytest.approx(want, abs=0.001)


def test_each_category_is_cumulative_with_mileage_and_home(recalc):
    ws = recalc("book")[MTD]
    for i, (category, *_) in enumerate(mtd.CATEGORIES):
        for q, c in enumerate(mtd.QUARTERS):
            assert ws[f"{c}{mtd.CAT_FIRST + i}"].value == pytest.approx(
                expected(category, Q_ENDS[q]), abs=0.001), (category, q)


def test_profit_excludes_disallowable_expenses(recalc):
    ws = recalc("book")[MTD]
    disallowed = sum(expected(c, Q_ENDS[3]) for c, _, _, ok in mtd.CATEGORIES if not ok)
    h = mtd.YEAR_COL
    assert ws[f"{h}{mtd.DISALLOWED}"].value == pytest.approx(disallowed, abs=0.001)
    assert ws[f"{h}{mtd.PROFIT}"].value == pytest.approx(
        ws[f"{h}{mtd.TOTAL_INCOME}"].value - ws[f"{h}{mtd.TOTAL_EXP}"].value + disallowed,
        abs=0.001)


def test_quarter_on_its_own_is_the_difference(recalc):
    ws = recalc("book")[MTD]
    q2_income = ws[f"F{mtd.SPLIT + 3}"].value
    assert q2_income == pytest.approx(
        ws[f"F{mtd.TOTAL_INCOME}"].value - ws[f"E{mtd.TOTAL_INCOME}"].value, abs=0.001)
