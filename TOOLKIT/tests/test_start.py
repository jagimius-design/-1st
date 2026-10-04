from datetime import date, datetime

from layout import START

DEADLINES = [date(2026, 8, 7), date(2026, 11, 7), date(2027, 2, 7), date(2027, 5, 7),
             date(2028, 1, 31)]


def test_mtd_start_from_qualifying_income(recalc):
    assert recalc("book")[START]["G9"].value == "6 April 2027"  # 41,500 in 2025-26


def test_next_deadline(recalc):
    want = next(d for d in DEADLINES if date.today() <= d or d == DEADLINES[-1])
    assert recalc("book")[START]["G13"].value == datetime.combine(want, datetime.min.time())
