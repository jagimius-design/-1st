"""Quick-Start-Guide.pdf: the buyer's short guide to the four templates."""

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (KeepTogether, ListFlowable, ListItem, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)

import mtd
from style import BLUE, INPUT, LINE, MUTED, NAVY, PALE

C = {k: colors.HexColor("#" + v) for k, v in
     dict(navy=NAVY, blue=BLUE, input=INPUT, line=LINE, muted=MUTED, pale=PALE).items()}
BODY = ParagraphStyle("body", fontName="Helvetica", fontSize=10, leading=14.5, alignment=TA_LEFT,
                      textColor=colors.HexColor("#1F2933"))
SMALL = ParagraphStyle("small", BODY, fontSize=8.5, leading=12, textColor=C["muted"])
H1 = ParagraphStyle("h1", BODY, fontName="Helvetica-Bold", fontSize=24, leading=29,
                    textColor=C["navy"])
H2 = ParagraphStyle("h2", BODY, fontName="Helvetica-Bold", fontSize=14, leading=18,
                    textColor=C["navy"], spaceBefore=16, spaceAfter=6)
LEAD = ParagraphStyle("lead", BODY, fontSize=12, leading=17, textColor=C["muted"])
CELL = ParagraphStyle("cell", BODY, fontSize=9.5, leading=13)
CELL_B = ParagraphStyle("cellb", CELL, fontName="Helvetica-Bold", textColor=C["navy"])

KIT = "Sole Trader MTD Kit 2026-27"
MTD_RANGE = f"{mtd.QUARTERS[0]}{mtd.TURNOVER}:{mtd.QUARTERS[-1]}{mtd.PROFIT}"
FILES = [
    ("Sole-Trader-Records-2026-27.xlsx",
     "One workbook for the tax year: Start (settings and headline figures), Income, Expenses, "
     "Mileage, Use of Home, MTD Quarters, Tax Estimate, Clients, Projects, Time Log, Invoices and "
     "Rates."),
    ("Invoice.xlsx", "A one-page UK invoice in pounds that adds up lines, discount and VAT, works "
                     "out the due date and exports cleanly to PDF."),
]
CALENDAR = [  # period, send by
    ("6 April to 5 July 2026", "7 August 2026"),
    ("6 April to 5 October 2026", "7 November 2026"),
    ("6 April 2026 to 5 January 2027", "7 February 2027"),
    ("6 April 2026 to 5 April 2027", "7 May 2027"),
    ("Final declaration for 2026-27", "31 January 2028"),
]
MTD_START = [("Over £50,000 in 2024-25", "6 April 2026"),
             ("Over £30,000 in 2025-26", "6 April 2027"),
             ("Over £20,000 in 2026-27", "6 April 2028")]
SECTIONS = [
    ("Keeping your records", [
        "<b>Income</b>: one row for every payment on the day it arrives. When it pays an invoice, "
        "pick the invoice number and the Invoices sheet marks it paid; that is the only place "
        "money received is entered. Put aside for tax shows what to move to savings.",
        "<b>Expenses</b>: one row per cost with its SA103 category. Set Business use below 100% "
        "for something partly private, such as a phone. Business entertainment is recorded but "
        "not allowed for tax.",
        "<b>Mileage</b>: business journeys in date order. The flat rate covers all running costs, "
        "so don't also claim fuel, insurance or repairs for that vehicle. Rates change when the "
        "car or van passes 10,000 business miles in the year.",
        "<b>Use of Home</b>: the hours you worked at home each month, for the flat rate (25 hours "
        "or more). Claim actual costs instead if they are higher.",
        "<b>Clients, Projects, Time Log, Invoices</b>: rates, hours against budget, unpaid and "
        "overdue balances. Status updates every day.",
    ]),
    ("Tax and NI estimate", [
        "<b>Tax Estimate</b> works out 2026-27 income tax (UK or Scottish bands, chosen on Start), "
        "the personal allowance taper above £100,000, and Class 4 National Insurance at 6% and "
        "2%. Class 2 is no longer charged.",
        "Choose Full-year projection to scale the months recorded so far up to a year, or Records "
        "so far. Add any salary or pension taxed under PAYE so the bands are right.",
        "Enter last year's Self Assessment bill to see your payments on account (31 January and "
        "31 July) and the balancing payment.",
        "Not included: student loan, High Income Child Benefit charge, pension and Gift Aid "
        "relief, savings and dividends, Marriage Allowance. It is an estimate to plan with, not "
        "tax advice.",
    ]),
    ("The Rates sheet", [
        "Every rate and threshold the workbook uses is on <b>Rates</b>, with the gov.uk page to "
        "check it against. Check them before you rely on the figures.",
        "Each April, copy the workbook for the new tax year, change the year on Start and update "
        "the Rates sheet; the formulas follow.",
    ]),
]
CAPACITY = [("Income", "1,000 payments"), ("Expenses", "2,000 expenses"),
            ("Mileage", "1,000 journeys"),
            ("Clients and work", "100 clients, 200 projects, 2,000 time entries, 500 invoices")]


def _bullets(items):
    return ListFlowable([ListItem(Paragraph(t, BODY), leftIndent=14, spaceAfter=3)
                         for t in items], bulletType="bullet", start="•", leftIndent=14,
                        bulletColor=C["blue"], bulletFontSize=9, spaceBefore=2)


def _table(rows, widths, header=None):
    data = ([[Paragraph(h, CELL_B) for h in header]] if header else []) + [
        [Paragraph(a, CELL_B), Paragraph(b, CELL)] for a, b in rows]
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, C["line"]),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def _page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(C["navy"])
    canvas.rect(0, A4[1] - 0.22 * inch, A4[0], 0.22 * inch, stroke=0, fill=1)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(C["muted"])
    canvas.drawString(doc.leftMargin, 0.5 * inch, f"{KIT}  ·  Quick-start guide")
    canvas.drawRightString(A4[0] - doc.rightMargin, 0.5 * inch, str(doc.page))
    canvas.restoreState()


def build(path):
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=0.85 * inch,
                            rightMargin=0.85 * inch, topMargin=0.8 * inch,
                            bottomMargin=0.85 * inch, author="Sole Trader MTD Kit",
                            title=f"{KIT} - Quick-start guide")
    width = A4[0] - 1.7 * inch
    two = [2.6 * inch, width - 2.6 * inch]
    swatch = Table([[""]], colWidths=[0.28 * inch], rowHeights=[0.18 * inch],
                   style=[("BACKGROUND", (0, 0), (-1, -1), C["input"]),
                          ("BOX", (0, 0), (-1, -1), 0.5, C["line"])])
    convention = Table([[swatch, Paragraph(
        "<b>Yellow cells are yours to fill in.</b> Every other cell is a label or a formula, so "
        "leave it alone and it keeps calculating.", BODY)]],
        colWidths=[0.45 * inch, width - 0.45 * inch],
        style=[("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("BACKGROUND", (0, 0), (-1, -1), C["pale"]),
               ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
               ("LEFTPADDING", (0, 0), (-1, -1), 9)])

    story = [
        Paragraph(KIT, H1),
        Spacer(1, 4),
        Paragraph("Quick-start guide: records, quarterly totals and a tax estimate for UK sole "
                  "traders, in a spreadsheet.", LEAD),
        Spacer(1, 14),
        convention,
        Paragraph("What's inside", H2),
        _table(FILES, two),
        Paragraph("Before you start", H2),
        _bullets([
            "The files work in <b>Microsoft Excel</b> (2010 or later, Windows and Mac, and Excel "
            "for the web), <b>Google Sheets</b> (upload to Drive, then Open with Google Sheets) "
            "and <b>LibreOffice Calc</b>. Keep the original download and work on a copy.",
            "In Google Sheets, set File > Settings > Locale to United Kingdom so dates you type "
            "read as day/month/year.",
            "On <b>Start</b>, enter your business name, the tax year and whether you pay Scottish "
            "income tax.",
            "The workbook comes with sample records so you can see it working. To start fresh, "
            "select the yellow sample cells and press Delete. Don't delete whole rows or the "
            "white formula cells.",
        ]),
        KeepTogether([
            Paragraph("Am I in Making Tax Digital?", H2),
            Paragraph("MTD for Income Tax depends on your <b>qualifying income</b>: self-employment "
                      "and property income added together, before expenses, as shown on your "
                      "Self Assessment return for the year named below.", BODY),
            Spacer(1, 6),
            _table(MTD_START, two, header=["Qualifying income", "MTD applies from"]),
            Spacer(1, 6),
            _bullets([
                "Enter your figures in the check on the Start sheet to see your date.",
                "Some people are exempt or can apply to be. HMRC's checker is at "
                "gov.uk/guidance/check-if-youre-eligible-for-making-tax-digital-for-income-tax.",
                "Not in MTD yet? The same records give you the SA103 totals for your normal "
                "Self Assessment return.",
            ]),
        ]),
    ]
    for name, steps in SECTIONS[:1]:
        story.append(KeepTogether([Paragraph(name, H2), _bullets(steps)]))
    story += [
        KeepTogether([
            Paragraph("Quarterly updates and bridging software", H2),
            Paragraph("Each quarterly update is cumulative: it covers the tax year from 6 April "
                      "to the end of the quarter. The <b>MTD Quarters</b> sheet holds those "
                      "totals for each SA103 category, one column per update.", BODY),
            Spacer(1, 6),
            _table(CALENDAR, two, header=["Update covers", "Send by"]),
            Spacer(1, 4),
            Paragraph("These are the 2026-27 dates, for people in MTD from April 2026. If you "
                      "join in April 2027, your first update covers 6 April to 5 July 2027 and is "
                      "due by 7 August 2027.", SMALL),
            Spacer(1, 6),
            _bullets([
                "HMRC doesn't accept spreadsheets directly. You need <b>bridging software</b> "
                "that reads your spreadsheet and sends the update. HMRC lists the products that "
                "work with MTD at gov.uk/guidance/find-software-thats-compatible-with-making-"
                "tax-digital-for-income-tax; filter for bridging software.",
                "Sign up for MTD for Income Tax with HMRC, then connect the bridging tool to "
                "your HMRC account as its instructions describe.",
                f"Point the tool at the <b>MTD Quarters</b> sheet, cells <b>{MTD_RANGE}</b>: one column "
                "per quarter, with HMRC's field name for each row in column C. Check that the "
                "figures the tool shows match the sheet before you submit.",
                "With turnover under the VAT threshold (£90,000) you may send Total expenses as "
                "one figure instead of each category.",
                "After the fourth update, the final declaration confirms the year by 31 January.",
            ]),
            Paragraph("The kit hasn't been certified by HMRC or by any bridging software "
                      "provider. Your bridging tool sends the update, and you are responsible for "
                      "checking the figures before you submit.", SMALL),
        ]),
    ]
    for name, steps in SECTIONS[1:]:
        story.append(KeepTogether([Paragraph(name, H2), _bullets(steps)]))
    story += [
        KeepTogether([
            Paragraph("Tips", H2),
            Paragraph("Room in each list:", BODY),
            Spacer(1, 2),
            _table(CAPACITY, two),
            Spacer(1, 6),
            _bullets([
                "Need more rows? Insert them above the last row of the list, then copy the white "
                "formula cells down from the row above. Totals pick the new rows up.",
                "The record sheets have filters: use the arrows in the header row to show one "
                "client, category or month.",
            ]),
        ]),
        Spacer(1, 18),
        Paragraph("These spreadsheets help you keep records and plan; they are not tax, legal or "
                  "accounting advice, and rates and dates should be checked on gov.uk. Licensed "
                  "for use by the buyer in their own business; please don't resell or share the "
                  "files. Questions or a problem? Reply through the store where you bought the "
                  "kit.", SMALL),
    ]
    doc.build(story, onFirstPage=_page, onLaterPages=_page)
