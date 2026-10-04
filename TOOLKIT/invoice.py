"""Invoice.xlsx: a one-page printable invoice. No input shading, since the sheet is what prints."""

from datetime import date


from style import (BLUE, DATE, GRID, MUTED, NAVY, PALE, PCT, TOPLINE, UNDERLINE, cell, header,
                   sheet, workbook)

LINES = [  # description, qty, unit price
    ("Website redesign - discovery workshop", 1, 650),
    ("UI design, 6 page templates", 6, 280),
    ("Front-end development (hours)", 22.5, 75),
    ("Content migration", 1, 320),
]
FIRST, LAST = 17, 31  # line item rows
DISCOUNT, TAX = 0.05, 0.08
PLAIN_MONEY = "#,##0.00"


def build(path):
    wb = workbook()
    ws = sheet(wb, "Invoice", [3, 50, 12, 17, 19, 3])

    ws.row_dimensions[2].height = 36
    cell(ws, "B2", "Your Business Name", bold=True, size=18, color=NAVY)
    cell(ws, "E2", "INVOICE", bold=True, size=26, color=NAVY, align="right")
    for r, text in enumerate(["123 Main Street", "City, Postcode, Country",
                              "hello@yourbusiness.com", "+1 555 0100 · yourbusiness.com",
                              "Tax / VAT ID: (optional)"], start=3):
        cell(ws, f"B{r}", text, color=MUTED)

    details = [("Invoice #", "INV-0042", None), ("Invoice date", date(2026, 10, 1), DATE),
               ("Payment terms (days)", 14, "0"), ("Due date", "=E5+E6", DATE),
               ("Currency", "USD", None)]
    for r, (label, value, fmt) in enumerate(details, start=4):
        cell(ws, f"D{r}", label, color=MUTED, align="right")
        cell(ws, f"E{r}", value, fmt, bold=str(value).startswith("="), align="right")

    cell(ws, "B10", "BILL TO", bold=True, size=9, color=BLUE)
    for r, text in enumerate(["Client Name", "Client Company Ltd", "45 Market Road, City",
                              "accounts@clientcompany.com"], start=11):
        cell(ws, f"B{r}", text, bold=r == 11)

    header(ws, FIRST - 1, 2, ["Description", "Qty", "Unit price", "Amount"])
    for i, r in enumerate(range(FIRST, LAST + 1)):
        desc, qty, price = LINES[i] if i < len(LINES) else (None, None, None)
        for col, value, fmt, align in [("B", desc, None, "left"), ("C", qty, "General", "center"),
                                       ("D", price, PLAIN_MONEY, "right")]:
            cell(ws, f"{col}{r}", value, fmt, align=align, border=GRID)
        cell(ws, f"E{r}", f'=IF(OR(C{r}="",D{r}=""),"",C{r}*D{r})', PLAIN_MONEY, align="right",
             border=GRID, bg=PALE)
        ws.row_dimensions[r].height = 18

    t = LAST + 2  # first totals row
    rows = [
        ("Subtotal", None, f"=SUM(E{FIRST}:E{LAST})"),
        ("Discount", DISCOUNT, f"=-ROUND(E{t}*D{t + 1},2)"),
        ("Tax / VAT", TAX, f"=ROUND((E{t}+E{t + 1})*D{t + 2},2)"),
        (f'="Total ("&E8&")"', None, f"=E{t}+E{t + 1}+E{t + 2}"),
        ("Amount paid", None, 0),
        ("Balance due", None, f"=E{t + 3}-E{t + 4}"),
    ]
    for i, (label, rate, value) in enumerate(rows):
        r = t + i
        cell(ws, f"C{r}", label, color=MUTED, align="right")
        if rate is not None:
            cell(ws, f"D{r}", rate, PCT, align="right")
        cell(ws, f"E{r}", value, PLAIN_MONEY, align="right")
        if rate is None:
            ws.merge_cells(f"C{r}:D{r}")
    for col in "CDE":
        cell(ws, f"{col}{t + 3}", bold=True, size=12, color="FFFFFF", bg=NAVY, align="right")
        ws[f"{col}{t + 3}"].border = TOPLINE
        cell(ws, f"{col}{t + 5}", bold=True, size=12, color=NAVY, align="right",
             border=UNDERLINE)
    for r in range(t, t + 6):
        ws.row_dimensions[r].height = 22

    cell(ws, f"B{t}", "PAYMENT DETAILS", bold=True, size=9, color=BLUE)
    for i, text in enumerate(["Bank: Your Bank", "Account name: Your Business Name",
                              "IBAN / Account #: 0000 0000 0000",
                              "SWIFT / Routing #: XXXXXXXX",
                              "Please use the invoice number as the payment reference."], 1):
        cell(ws, f"B{t + i}", text, color=MUTED)

    end = t + 8
    ws.merge_cells(f"B{end}:E{end}")
    cell(ws, f"B{end}", "Thank you for your business!", italic=True, size=11, color=NAVY,
         align="center")
    for col in "BCDE":
        ws[f"{col}{end - 1}"].border = UNDERLINE

    cell(ws, "H2", "Overwrite the placeholder text. Amounts, totals and the due date calculate;"
         " set Discount or Tax to 0% if unused. Only columns A-F print.", italic=True, size=9,
         color=MUTED)
    ws.print_area = f"A1:F{end + 1}"
    ws.page_setup.orientation = "portrait"
    ws.page_setup.fitToHeight = 1
    ws.print_options.horizontalCentered = True
    ws.page_margins.left = ws.page_margins.right = 0.5
    ws.page_margins.top = ws.page_margins.bottom = 0.6

    wb.save(path)
