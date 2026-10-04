"""The Tax Estimate sheet: 2026-27 income tax, Class 4 NI and payments on account.

Reads profit from the MTD Quarters full-year column and every rate from the Rates sheet.
"""

import mtd
from layout import SCOTTISH, TAX, YEAR
from rates import BANDS, REF, RUK_FIRST, SCOT_FIRST, band
from style import (BLUE, DATE, GRID, INPUT, INPUT_NOTE, MONEY, MUTED, NAVY, PALE, PCT, TOPLINE,
                   cell, dropdown, header, sheet, title)

BASIS, ALLOWANCE, PAYE_INCOME, PAYE_TAX, LAST_BILL, LAST_SOURCE = range(6, 12)  # inputs
MONTHS, INCOME, EXPENSES, PROFIT, TAXABLE_PROFIT, OTHER, TOTAL, PA, TAXABLE = range(14, 23)
PROJECTION = "Full-year projection"
BAND_HEAD = TAXABLE + 2
BAND_FIRST = BAND_HEAD + 1
BAND_LAST = BAND_FIRST + BANDS - 1
IT = BAND_LAST + 1
LESS_PAYE, C4_MAIN, C4_ADD, C2, BILL, SHARE_ROW, MONTHLY = range(IT + 1, IT + 8)
PAY_HEAD = MONTHLY + 3
POA1, POA2, BALANCE, NEXT1, NEXT2 = range(PAY_HEAD + 1, PAY_HEAD + 6)

SAMPLE_LAST_BILL = 4800
SHARE = f"'{TAX}'!$C${SHARE_ROW}"
BILL_REF = f"'{TAX}'!$C${BILL}"


def build(wb):
    ws = sheet(wb, TAX, [3, 58, 16, 16, 10, 16, 3])
    title(ws, "Tax estimate 2026-27", "Income tax and Class 4 National Insurance on your"
          " profit, from your records so far or projected to a full year. " + INPUT_NOTE)

    cell(ws, "B5", "YOUR SITUATION", bold=True, size=9, color=BLUE)
    inputs = [
        (BASIS, "Estimate from", PROJECTION, None),
        (ALLOWANCE, "Claim the £1,000 trading allowance instead of expenses?", "No", None),
        (PAYE_INCOME, "Other income taxed under PAYE this year (salary, pension)", 0, MONEY),
        (PAYE_TAX, "Tax already deducted from that income", 0, MONEY),
        (LAST_BILL, "Last year's (2025-26) Self Assessment bill, income tax and Class 4",
         SAMPLE_LAST_BILL, MONEY),
        (LAST_SOURCE, "Last year's tax deducted at source (PAYE)", 0, MONEY),
    ]
    for r, label, value, fmt in inputs:
        cell(ws, f"B{r}", label, border=GRID)
        cell(ws, f"C{r}", value, fmt, bg=INPUT, align="right", border=GRID)
    dropdown(ws, f"C{BASIS}", f'"Records so far,{PROJECTION}"')
    dropdown(ws, f"C{ALLOWANCE}", '"Yes,No"')
    cell(ws, f"D{BASIS}", "Projection: records so far scaled up to twelve months.", size=9,
         color=MUTED, italic=True)
    cell(ws, f"D{ALLOWANCE}", f'=IF({SCOTTISH}="Yes","Scottish income tax rates (Start sheet)",'
         f'"UK income tax rates (Start sheet)")', size=9, color=MUTED, italic=True)

    header(ws, MONTHS - 1, 2, ["Estimate", "Amount"])
    yes_allowance = f'$C${ALLOWANCE}="Yes"'
    elapsed = (f"(YEAR(TODAY())-{YEAR})*12+MONTH(TODAY())-4+IF(DAY(TODAY())>=6,1,0)")
    scale = f'IF($C${BASIS}="{PROJECTION}",12/C{MONTHS},1)'
    lines = [
        (MONTHS, "Tax months covered so far", f"=MIN(12,MAX(1,{elapsed}))"),
        (INCOME, "Business income (MTD Quarters)",
         f"=ROUND({mtd.ref(mtd.TOTAL_INCOME)}*{scale},2)"),
        (EXPENSES, f'=IF({yes_allowance},"Trading allowance","Allowable expenses")',
         f"=IF({yes_allowance},MIN(MAX(C{INCOME},0),{REF['trading']}),"
         f"ROUND({mtd.ref(mtd.ALLOWABLE)}*{scale},2))"),
        (PROFIT, "Profit (loss)", f"=C{INCOME}-C{EXPENSES}"),
        (TAXABLE_PROFIT, "Taxable profit", f"=MAX(0,C{PROFIT})"),
        (OTHER, "Other income taxed under PAYE", f"=C{PAYE_INCOME}"),
        (TOTAL, "Total income", f"=C{TAXABLE_PROFIT}+C{OTHER}"),
        (PA, "Personal allowance (reduced above £100,000)",
         f"=MAX(0,{REF['pa']}-MAX(0,C{TOTAL}-{REF['pa_limit']})/2)"),
        (TAXABLE, "Taxable income", f"=MAX(0,C{TOTAL}-C{PA})"),
    ]
    for r, label, f in lines:
        bold = r in (PROFIT, TAXABLE)
        cell(ws, f"B{r}", label, bold=bold, color=NAVY if bold else None, border=GRID)
        cell(ws, f"C{r}", f, "0" if r == MONTHS else MONEY, bold=bold, align="right",
             border=GRID)

    header(ws, BAND_HEAD, 2, ["Income tax band", "Tax", "Income in band", "Rate",
                              "Up to (taxable)"])
    scot = f'{SCOTTISH}="Yes"'
    for i in range(BANDS):
        r = BAND_FIRST + i

        def pick(column, i=i):
            ruk = band(RUK_FIRST, i, column)
            return f"IF({scot},{band(SCOT_FIRST, i, column)},{ruk})"
        # ""& keeps an empty band name empty instead of 0
        cell(ws, f"B{r}", f'=""&{pick("B")}', border=GRID)
        cell(ws, f"E{r}", f'=IF(B{r}="","",{pick("C")})', "0%", align="right", border=GRID)
        cell(ws, f"F{r}", f'=IF(OR(B{r}="",N({pick("D")})=0),"",{pick("D")})', MONEY,
             align="right", border=GRID)
        lower = "0" if i == 0 else f"N(F{r - 1})"
        cell(ws, f"D{r}", f'=IF(B{r}="","",MAX(0,IF(F{r}="",C{TAXABLE},'
                          f'MIN(C{TAXABLE},F{r}))-{lower}))', MONEY, align="right", border=GRID)
        cell(ws, f"C{r}", f'=IF(B{r}="","",ROUND(D{r}*E{r},2))', MONEY, align="right",
             border=GRID)

    nic = [
        (IT, "Income tax", f"=SUM(C{BAND_FIRST}:C{BAND_LAST})", None),
        (LESS_PAYE, "Less tax already deducted under PAYE", f"=-C{PAYE_TAX}", None),
        (C4_MAIN, "Class 4 NI at the main rate",
         f"=ROUND({REF['c4_main']}*MAX(0,MIN(C{TAXABLE_PROFIT},{REF['c4_upper']})"
         f"-{REF['c4_lower']}),2)", None),
        (C4_ADD, "Class 4 NI above the upper profits limit",
         f"=ROUND({REF['c4_add']}*MAX(0,C{TAXABLE_PROFIT}-{REF['c4_upper']}),2)", None),
        (C2, "Class 2 NI", 0,
         f'=IF(C{TAXABLE_PROFIT}>={REF["c2_spt"]},"Treated as paid at no cost",'
         f'"Profit under the threshold: voluntary Class 2 protects your NI record")'),
        (BILL, "Estimated Self Assessment bill", f"=SUM(C{IT}:C{C2})", None),
        (SHARE_ROW, "Share of business income to put aside",
         f"=IF(C{INCOME}>0,MAX(0,C{BILL})/C{INCOME},0)", None),
        (MONTHLY, "Put aside each month (bill / 12)", f"=MAX(0,C{BILL})/12", None),
    ]
    for r, label, f, note in nic:
        bold = r in (IT, BILL)
        cell(ws, f"B{r}", label, bold=bold, color=NAVY if bold else None,
             bg=PALE if r == BILL else None, border=GRID)
        cell(ws, f"C{r}", f, PCT if r == SHARE_ROW else MONEY, bold=bold, align="right",
             bg=PALE if r == BILL else None, border=GRID)
        if note:
            cell(ws, f"D{r}", note, size=9, color=MUTED, italic=True)
    for c in "BC":
        ws[f"{c}{BILL}"].border = TOPLINE
    cell(ws, f"B{BILL}", bold=True, size=12, color=NAVY, bg=PALE, border=TOPLINE)
    cell(ws, f"C{BILL}", bold=True, size=12, color=NAVY, bg=PALE, border=TOPLINE,
         fmt=MONEY, align="right")

    cell(ws, f"B{PAY_HEAD - 1}", "WHEN TO PAY", bold=True, size=9, color=BLUE)
    header(ws, PAY_HEAD, 2, ["Payment", "Amount", "Due"])
    poa_last = (f"AND($C${LAST_BILL}>={REF['poa_min']},"
                f"$C${LAST_SOURCE}<{REF['poa_source']}*($C${LAST_BILL}+$C${LAST_SOURCE}))")
    poa_this = (f"AND($C${BILL}>={REF['poa_min']},"
                f"$C${PAYE_TAX}<{REF['poa_source']}*($C${BILL}+$C${PAYE_TAX}))")
    payments = [
        (POA1, "1st payment on account for 2026-27 (half of last year's bill)",
         f"=IF({poa_last},ROUND($C${LAST_BILL}/2,2),0)", f"=DATE({YEAR}+1,1,31)"),
        (POA2, "2nd payment on account for 2026-27", f"=C{POA1}", f"=DATE({YEAR}+1,7,31)"),
        (BALANCE, "Balancing payment for 2026-27 (negative: refund due)",
         f"=C{BILL}-C{POA1}-C{POA2}", f"=DATE({YEAR}+2,1,31)"),
        (NEXT1, "1st payment on account for 2027-28 (half of this year's bill)",
         f"=IF({poa_this},ROUND($C${BILL}/2,2),0)", f"=DATE({YEAR}+2,1,31)"),
        (NEXT2, "2nd payment on account for 2027-28", f"=C{NEXT1}", f"=DATE({YEAR}+2,7,31)"),
    ]
    for r, label, f, due in payments:
        cell(ws, f"B{r}", label, border=GRID)
        cell(ws, f"C{r}", f, MONEY, align="right", border=GRID)
        cell(ws, f"D{r}", due, DATE, align="center", border=GRID)
    notes = [
        "Payments on account are not due if last year's bill was under £1,000 or 80% or more"
        " of your tax was taken at source.",
        "Not included: last year's balancing payment, student loan, High Income Child Benefit"
        " charge, pension and Gift Aid relief, savings and dividend income, Marriage Allowance.",
        "An estimate to plan with, not tax advice. Check the Rates sheet against gov.uk.",
    ]
    for k, text in enumerate(notes):
        cell(ws, f"B{NEXT2 + 2 + k}", text, size=9, color=MUTED, italic=True)
