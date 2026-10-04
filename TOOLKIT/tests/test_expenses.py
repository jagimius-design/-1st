from expenses import CATEGORIES, SAMPLE, SUM_FIRST, CAT_FIRST, CAT_LAST


def _rows(ws):
    last = SUM_FIRST + CAT_LAST - CAT_FIRST
    return {ws[f"B{r}"].value: r for r in range(SUM_FIRST, last + 4)}


def test_category_by_month_matches_the_log(recalc):
    ws = recalc("expenses")["Summary"]
    rows = _rows(ws)
    for name, _ in CATEGORIES:
        for m in range(1, 13):
            expected = sum(a for d, _, c, a, _, _ in SAMPLE if c == name and d.month == m)
            got = ws.cell(rows[name], 2 + m).value
            assert abs(got - expected) < 1e-9, (name, m)


def test_totals_and_deductible(recalc):
    ws = recalc("expenses")["Summary"]
    rows = _rows(ws)
    assert abs(ws[f"O{rows['Total']}"].value - sum(r[3] for r in SAMPLE)) < 1e-9
    deductible = sum(r[3] for r in SAMPLE if r[5] == "Yes")
    assert abs(ws[f"O{rows['Tax-deductible']}"].value - deductible) < 1e-9
    assert ws[f"O{rows['Not in a category']}"].value == 0


def test_budget_left_is_year_budget_minus_spent(recalc):
    ws = recalc("expenses")["Summary"]
    r = _rows(ws)["Equipment"]
    budget = dict(CATEGORIES)["Equipment"] * 12
    spent = sum(x[3] for x in SAMPLE if x[2] == "Equipment")
    assert abs(ws[f"Q{r}"].value - (budget - spent)) < 1e-9
