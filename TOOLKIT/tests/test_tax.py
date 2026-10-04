from tax import INC_FIRST, Q_FIRST, RATES, SAMPLE, TAX_PAID

RATE = sum(r for _, r in RATES)


def _quarter(d):
    return (d.month - 1) // 3


def test_each_payment_gets_its_set_aside_and_quarter(recalc):
    ws = recalc("tax")["Income"]
    for i, (d, _, _, amount, _) in enumerate(SAMPLE):
        r = INC_FIRST + i
        assert ws[f"F{r}"].value == round(amount * RATE, 2)
        assert ws[f"G{r}"].value == f"Q{_quarter(d) + 1}"


def test_quarters_sum_income_set_aside_and_moved(recalc):
    ws = recalc("tax")["Summary"]
    balance = 0
    for q in range(4):
        r = Q_FIRST + q
        rows = [s for s in SAMPLE if _quarter(s[0]) == q]
        aside = sum(round(s[3] * RATE, 2) for s in rows)
        moved = sum(round(s[3] * RATE, 2) for s in rows if s[4] == "Yes")
        balance += moved - (TAX_PAID[q] or 0)
        assert ws[f"E{r}"].value == sum(s[3] for s in rows)
        assert abs(ws[f"F{r}"].value - aside) < 1e-9
        assert abs(ws[f"G{r}"].value - moved) < 1e-9
        assert abs(ws[f"H{r}"].value - (aside - moved)) < 1e-9
        assert abs(ws[f"K{r}"].value - balance) < 1e-9
