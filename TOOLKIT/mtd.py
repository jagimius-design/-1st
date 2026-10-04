"""The MTD Quarters sheet: cumulative SA103 totals per update period, one fixed range for bridging.

HMRC's quarterly updates are cumulative from 6 April, so each column is the year so far.
"""

from layout import (EXPENSES, EXP_FIRST, EXP_LAST, HOME, HOME_FIRST, HOME_LAST, INCOME, INC_FIRST,
                    INC_LAST, MILEAGE, MIL_FIRST, MIL_LAST, MTD, TAX_YEAR_START, YEAR, col)
from style import (BLUE, GRID, MONEY, MUTED, NAVY, PALE, DATE, TOPLINE, cell, header, sheet,
                   title)

INCOME_ROWS = [("Turnover", "turnover", "15"), ("Other business income", "other", "16")]
CATEGORIES = [  # SA103 category, HMRC API field, SA103F box, allowable
    ("Cost of goods bought for resale or goods used", "costOfGoods", "17", True),
    ("Construction industry: payments to subcontractors", "paymentsToSubcontractors", "18", True),
    ("Wages, salaries and other staff costs", "wagesAndStaffCosts", "19", True),
    ("Car, van and travel expenses", "carVanTravelExpenses", "20", True),
    ("Rent, rates, power and insurance costs", "premisesRunningCosts", "21", True),
    ("Repairs and maintenance of property and equipment", "maintenanceCosts", "22", True),
    ("Phone, fax, stationery and other office costs", "adminCosts", "23", True),
    ("Advertising costs", "advertisingCosts", "24", True),
    ("Business entertainment costs", "businessEntertainmentCosts", "24", False),
    ("Interest on bank and other loans", "interestOnBankOtherLoans", "25", True),
    ("Bank, credit card and other financial charges", "financeCharges", "26", True),
    ("Irrecoverable debts written off", "irrecoverableDebts", "27", True),
    ("Accountancy, legal and other professional fees", "professionalFees", "28", True),
    ("Depreciation and loss/profit on sale of assets", "depreciation", "29", False),
    ("Other business expenses", "otherExpenses", "30", True),
]
MILEAGE_TO = "Car, van and travel expenses"
HOME_TO = "Rent, rates, power and insurance costs"

ENDS, SEND_BY = 6, 7  # rows
TURNOVER, OTHER, TOTAL_INCOME = 8, 9, 10
CAT_FIRST = 11
CAT_LAST = CAT_FIRST + len(CATEGORIES) - 1
TOTAL_EXP, DISALLOWED, ALLOWABLE, PROFIT = CAT_LAST + 1, CAT_LAST + 2, CAT_LAST + 3, CAT_LAST + 4
QUARTERS = "EFGH"
YEAR_COL = "H"  # Q4 is the whole tax year
SPLIT = PROFIT + 4  # first row of the quarter-on-its-own block
CATEGORY_LIST = f"'{MTD}'!$B${CAT_FIRST}:$B${CAT_LAST}"


def ref(row, column=YEAR_COL):
    return f"'{MTD}'!${column}${row}"


def build(wb):
    ws = sheet(wb, MTD, [3, 46, 27, 9, 15, 15, 15, 15])
    title(ws, "MTD quarterly totals", "What each quarterly update sends to HMRC: income and"
          " expenses from 6 April to the end of each quarter. Nothing to fill in here.")
    cell(ws, "B4", f"Bridging software: map E{TURNOVER}:H{PROFIT} on this sheet; column C names"
         " the HMRC field for each row.", size=9, color=MUTED, italic=True)
    header(ws, 5, 2, ["", "HMRC field", "SA103F box", "Q1", "Q2", "Q3", "Q4 (full year)"])
    ends = [(0, 7, 5), (0, 10, 5), (1, 1, 5), (1, 4, 5)]
    sends = [(0, 8, 7), (0, 11, 7), (1, 2, 7), (1, 5, 7)]
    cell(ws, f"B{ENDS}", "Covers 6 April to", bold=True, color=NAVY)
    cell(ws, f"B{SEND_BY}", "Send update by", bold=True, color=NAVY)
    for q, c in enumerate(QUARTERS):
        dy, m, d = ends[q]
        cell(ws, f"{c}{ENDS}", f"=DATE({YEAR}+{dy},{m},{d})", DATE, bold=True, align="center",
             border=GRID)
        dy, m, d = sends[q]
        cell(ws, f"{c}{SEND_BY}", f"=DATE({YEAR}+{dy},{m},{d})", DATE, color=BLUE,
             align="center", border=GRID)

    def window(sheet_name, date_col, first, last, c):
        dates = col(sheet_name, date_col, first, last)
        return f'{dates},">="&{TAX_YEAR_START},{dates},"<="&{c}${ENDS}'

    def line(r, label, api, box, formula_for, bold=False, bg=None):
        cell(ws, f"B{r}", label, bold=bold, color=NAVY if bold else None, bg=bg, border=GRID)
        cell(ws, f"C{r}", api, size=9, color=MUTED, bg=bg, border=GRID)
        cell(ws, f"D{r}", box, align="center", size=9, color=MUTED, bg=bg, border=GRID)
        for c in QUARTERS:
            cell(ws, f"{c}{r}", formula_for(c), MONEY, bold=bold, bg=bg, align="right",
                 border=GRID)

    amounts = col(INCOME, "G", INC_FIRST, INC_LAST)
    types = col(INCOME, "F", INC_FIRST, INC_LAST)
    for r, (label, api, box) in zip((TURNOVER, OTHER), INCOME_ROWS):
        line(r, label, api, box, lambda c, label=label: (
            f'=ROUND(SUMIFS({amounts},{types},"{label}",'
            f'{window(INCOME, "B", INC_FIRST, INC_LAST, c)}),2)'))
    line(TOTAL_INCOME, "Total income", "", "", lambda c: f"={c}{TURNOVER}+{c}{OTHER}",
         bold=True, bg=PALE)

    exp_amounts = col(EXPENSES, "H", EXP_FIRST, EXP_LAST)
    exp_cats = col(EXPENSES, "E", EXP_FIRST, EXP_LAST)
    for i, (label, api, box, _) in enumerate(CATEGORIES):
        r = CAT_FIRST + i

        def formula(c, r=r, label=label):
            f = f"SUMIFS({exp_amounts},{exp_cats},$B{r},{window(EXPENSES, 'B', EXP_FIRST, EXP_LAST, c)})"
            if label == MILEAGE_TO:
                f += (f"+SUMIFS({col(MILEAGE, 'G', MIL_FIRST, MIL_LAST)},"
                      f"{window(MILEAGE, 'B', MIL_FIRST, MIL_LAST, c)})")
            if label == HOME_TO:
                f += (f"+SUMIFS({col(HOME, 'E', HOME_FIRST, HOME_LAST)},"
                      f"{window(HOME, 'B', HOME_FIRST, HOME_LAST, c)})")
            return f"=ROUND({f},2)"
        line(r, label, api, box, formula)
    disallowed = [CAT_FIRST + i for i, c in enumerate(CATEGORIES) if not c[3]]
    line(TOTAL_EXP, "Total expenses", "consolidatedExpenses", "31",
         lambda c: f"=SUM({c}{CAT_FIRST}:{c}{CAT_LAST})", bold=True, bg=PALE)
    line(DISALLOWED, "of which not allowable for tax", "", "",
         lambda c: "=" + "+".join(f"{c}{r}" for r in disallowed))
    line(ALLOWABLE, "Allowable expenses", "", "",
         lambda c: f"={c}{TOTAL_EXP}-{c}{DISALLOWED}", bold=True, bg=PALE)
    line(PROFIT, "Net profit (loss)", "", "", lambda c: f"={c}{TOTAL_INCOME}-{c}{ALLOWABLE}",
         bold=True, bg=PALE)
    for c in "BCDEFGH":
        ws[f"{c}{PROFIT}"].border = TOPLINE

    cell(ws, f"B{PROFIT + 1}", "Mileage (Mileage sheet) is in Car, van and travel; the use-of-home"
         " flat rate (Use of Home sheet) is in Rent, rates, power and insurance. Business"
         " entertainment and depreciation are reported but not allowable.", size=9,
         color=MUTED, italic=True)
    cell(ws, f"B{PROFIT + 2}", "With turnover under the VAT threshold you may send Total"
         " expenses alone (consolidatedExpenses) instead of each category.", size=9,
         color=MUTED, italic=True)

    cell(ws, f"B{SPLIT - 1}", "Each quarter on its own (for checking; not what you send)",
         bold=True, color=NAVY)
    header(ws, SPLIT, 2, ["", "", "", "Q1", "Q2", "Q3", "Q4"])
    for k, r in enumerate([TURNOVER, OTHER, TOTAL_INCOME, TOTAL_EXP, ALLOWABLE, PROFIT]):
        s = SPLIT + 1 + k
        bold = r in (TOTAL_INCOME, PROFIT)
        cell(ws, f"B{s}", f"=B{r}", bold=bold, border=GRID)
        for q, c in enumerate(QUARTERS):
            prev = QUARTERS[q - 1] if q else None
            f = f"={c}{r}-{prev}{r}" if prev else f"={c}{r}"
            cell(ws, f"{c}{s}", f, MONEY, bold=bold, align="right", border=GRID)
    ws.freeze_panes = "C6"
