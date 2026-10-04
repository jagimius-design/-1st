"""The record sheets: Income, Expenses, Mileage and Use of Home, the digital records MTD asks for."""

import sample
from layout import (CAR, EXPENSES, EXP_FIRST, EXP_LAST, HOME, HOME_FIRST, HOME_LAST, INCOME,
                    INCOME_TYPES, INC_FIRST, INC_LAST, INVOICES, IN_FIRST, IN_LAST, MILEAGE,
                    MIL_FIRST, MIL_LAST, MOTORCYCLE, YEAR, col)
from mtd import CATEGORY_LIST
from rates import REF
from style import (BLUE, DATE, INPUT_NOTE, MONEY, MUTED, cell, dropdown, header, sheet, table,
                   title)
from taxcalc import SHARE


def _income(wb):
    ws = sheet(wb, INCOME, [3, 13, 24, 12, 34, 22, 14, 14, 26], tab=BLUE)
    title(ws, "Income", "Every payment your business receives, on the day it arrives. Give the"
          " invoice number when it pays an invoice. " + INPUT_NOTE)
    header(ws, INC_FIRST - 1, 2, ["Date received", "From", "Invoice #", "Description", "Type",
                                  "Amount", "Put aside for tax", "Notes"])
    rows = sample.income()
    for r in range(INC_FIRST, INC_LAST + 1):
        i = r - INC_FIRST
        if i < len(rows):
            for c, v in zip("BCDEFG", rows[i]):
                ws[f"{c}{r}"] = v
        ws[f"H{r}"] = f'=IF(G{r}="","",ROUND(G{r}*{SHARE},2))'
    table(ws, INC_FIRST, INC_LAST, {
        "B": (DATE, True, "center"), "C": (None, True, "left"), "D": (None, True, "center"),
        "E": (None, True, "left"), "F": (None, True, "left"), "G": (MONEY, True, "right"),
        "H": (MONEY, False, "right"), "I": (None, True, "left")})
    dropdown(ws, f"D{INC_FIRST}:D{INC_LAST}", col(INVOICES, "B", IN_FIRST, IN_LAST))
    dropdown(ws, f"F{INC_FIRST}:F{INC_LAST}", '"' + ",".join(INCOME_TYPES) + '"')
    ws.freeze_panes = f"C{INC_FIRST}"
    ws.auto_filter.ref = f"B{INC_FIRST - 1}:I{INC_LAST}"


def _expenses(wb):
    ws = sheet(wb, EXPENSES, [3, 13, 22, 32, 44, 13, 11, 14, 24], tab=BLUE)
    title(ws, "Expenses", "Every business cost, with its SA103 category. Business use below 100%"
          " claims only that share (a phone also used privately, say). " + INPUT_NOTE)
    header(ws, EXP_FIRST - 1, 2, ["Date paid", "Supplier", "Description", "SA103 category",
                                  "Amount paid", "Business use", "Business amount", "Notes"])
    for r in range(EXP_FIRST, EXP_LAST + 1):
        i = r - EXP_FIRST
        if i < len(sample.EXPENSES):
            for c, v in zip("BCDEFG", sample.EXPENSES[i]):
                ws[f"{c}{r}"] = v
        ws[f"H{r}"] = f'=IF(F{r}="","",ROUND(F{r}*IF(G{r}="",1,G{r}),2))'
    table(ws, EXP_FIRST, EXP_LAST, {
        "B": (DATE, True, "center"), "C": (None, True, "left"), "D": (None, True, "left"),
        "E": (None, True, "left"), "F": (MONEY, True, "right"), "G": ("0%", True, "center"),
        "H": (MONEY, False, "right"), "I": (None, True, "left")})
    dropdown(ws, f"E{EXP_FIRST}:E{EXP_LAST}", CATEGORY_LIST)
    ws.freeze_panes = f"C{EXP_FIRST}"
    ws.auto_filter.ref = f"B{EXP_FIRST - 1}:I{EXP_LAST}"


def _mileage(wb):
    ws = sheet(wb, MILEAGE, [3, 13, 36, 28, 14, 10, 14], tab=BLUE)
    title(ws, "Mileage", "Business journeys at HMRC's flat rate per mile, in date order. If you"
          " claim this, don't also claim the vehicle's fuel or running costs. " + INPUT_NOTE)
    header(ws, MIL_FIRST - 1, 2, ["Date", "Journey", "Purpose", "Vehicle", "Miles", "Claim"])
    for r in range(MIL_FIRST, MIL_LAST + 1):
        i = r - MIL_FIRST
        if i < len(sample.MILEAGE):
            for c, v in zip("BCDEF", sample.MILEAGE[i]):
                ws[f"{c}{r}"] = v
        # car miles before this row decide how many of this row's miles are still at the high rate
        before = f'SUMIFS(F${MIL_FIRST - 1}:F{r - 1},E${MIL_FIRST - 1}:E{r - 1},"{CAR}")'
        high = f"MAX(0,MIN(F{r},{REF['car_miles']}-{before}))"
        ws[f"G{r}"] = (f'=IF(F{r}="","",IF(E{r}="{MOTORCYCLE}",ROUND(F{r}*{REF["moto"]},2),'
                       f'ROUND({high}*{REF["car1"]}+(F{r}-{high})*{REF["car2"]},2)))')
    table(ws, MIL_FIRST, MIL_LAST, {
        "B": (DATE, True, "center"), "C": (None, True, "left"), "D": (None, True, "left"),
        "E": (None, True, "center"), "F": ("#,##0", True, "right"),
        "G": (MONEY, False, "right")})
    dropdown(ws, f"E{MIL_FIRST}:E{MIL_LAST}", f'"{CAR},{MOTORCYCLE}"')
    ws.freeze_panes = f"C{MIL_FIRST}"


def _home(wb):
    ws = sheet(wb, HOME, [3, 13, 13, 18, 14], tab=BLUE)
    title(ws, "Use of home", "Hours you worked at home each month, for HMRC's flat rate"
          " (covers heating, lighting and power). " + INPUT_NOTE)
    cell(ws, "B4", "Under 25 hours in a month claims nothing; claim actual costs instead of"
         " this if they are higher.", size=9, color=MUTED, italic=True)
    header(ws, HOME_FIRST - 1, 2, ["From", "To", "Hours worked at home", "Flat-rate claim"])
    for i, r in enumerate(range(HOME_FIRST, HOME_LAST + 1)):
        ws[f"B{r}"] = f"=DATE({YEAR},{4 + i},6)"
        ws[f"C{r}"] = f"=DATE({YEAR},{5 + i},5)"
        if i < len(sample.HOME_HOURS):
            ws[f"D{r}"] = sample.HOME_HOURS[i]
        ws[f"E{r}"] = (f'=IF(D{r}="","",IF(D{r}>100,{REF["home3"]},IF(D{r}>50,{REF["home2"]},'
                       f'IF(D{r}>=25,{REF["home1"]},0))))')
    table(ws, HOME_FIRST, HOME_LAST, {
        "B": (DATE, False, "center"), "C": (DATE, False, "center"), "D": ("0", True, "center"),
        "E": (MONEY, False, "right")})
    total = HOME_LAST + 1
    cell(ws, f"D{total}", "Year", bold=True, align="right")
    cell(ws, f"E{total}", f"=SUM(E{HOME_FIRST}:E{HOME_LAST})", MONEY, bold=True, align="right")


def build(wb):
    _income(wb)
    _expenses(wb)
    _mileage(wb)
    _home(wb)
