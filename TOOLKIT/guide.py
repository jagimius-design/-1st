"""Quick-Start-Guide.pdf: the buyer's short guide to the four templates."""

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (KeepTogether, ListFlowable, ListItem, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)

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

FILES = [
    ("Invoice.xlsx", "A one-page invoice that adds up lines, discount and tax, works out the due "
                     "date and prints or exports cleanly to PDF."),
    ("Expense-Tracker.xlsx", "An expense log with your own categories and budgets, and a summary "
                             "by month and category, with tax-deductible totals."),
    ("Tax-Set-Aside.xlsx", "Log each payment you receive and see how much to put aside for tax, "
                           "quarter by quarter, and what is already in your tax account."),
    ("Client-Project-Tracker.xlsx", "Clients, projects, a time log and invoices in one file: "
                                    "hours against budget, unpaid and overdue balances, work "
                                    "not yet invoiced."),
]

SECTIONS = [
    ("Invoice", [
        "Replace the placeholder business details and payment details once, then save the file "
        "as your own master copy.",
        "For each new invoice, duplicate the sheet (right-click the tab, then Duplicate or Move "
        "or Copy) and change the invoice number, date, client and lines.",
        "Payment terms set the due date. Set Discount or Tax / VAT to 0% if you don't use them, "
        "and change the currency code next to Currency.",
        "Export the sheet as PDF to send it: File > Export / Save as PDF in Excel and LibreOffice, "
        "File > Download > PDF in Google Sheets. If a client pays part, enter it in Amount paid.",
    ]),
    ("Expense tracker", [
        "Start on <b>Categories</b>: rename, add or remove categories and set a monthly budget for "
        "each (leave it blank for no budget).",
        "Log every expense on <b>Expenses</b>: date, description, category from the dropdown, "
        "amount, and whether it is tax deductible.",
        "<b>Summary</b> shows the year in the Year cell, by category and month, against budget. "
        "Red means over budget.",
        "\"Not in a category\" should read zero; if not, an expense has a blank or misspelled "
        "category.",
    ]),
    ("Tax set-aside", [
        "On <b>Summary</b>, enter your tax year, the month it starts (1 for January, 4 for "
        "April) and your rates. The rates are a rule of thumb, not tax advice: ask an accountant "
        "or use last year's bill to pick them.",
        "Log every payment you receive on <b>Income</b>. The Set aside column tells you how much to "
        "move to a separate savings account; do it, then set Moved to tax account to Yes.",
        "Enter each tax payment and its due date in the quarterly table. Tax account balance is "
        "what should be in that account now; red means you paid more than you put aside.",
    ]),
    ("Client & project tracker", [
        "Fill the sheets in order: <b>Clients</b> (hourly rate and payment terms), "
        "<b>Projects</b> (client and budget hours; a rate override if this project is priced "
        "differently), then the <b>Time Log</b> as you work.",
        "When you bill, add a row to <b>Invoices</b> and write its number on the time log rows it "
        "covers. Record payments in Amount paid and Paid date.",
        "Status (Open, Overdue, Paid) and Days overdue update every day. The <b>Dashboard</b> "
        "sums up what is invoiced, paid, outstanding, overdue and not yet invoiced.",
    ]),
]

CAPACITY = [("Expense tracker", "1,000 expenses, 30 categories"),
            ("Tax set-aside", "1,000 payments"),
            ("Client & project tracker",
             "100 clients, 200 projects, 2,000 time entries, 500 invoices")]


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
    canvas.rect(0, LETTER[1] - 0.22 * inch, LETTER[0], 0.22 * inch, stroke=0, fill=1)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(C["muted"])
    canvas.drawString(doc.leftMargin, 0.5 * inch, "Freelancer Finance Kit  ·  Quick-start guide")
    canvas.drawRightString(LETTER[0] - doc.rightMargin, 0.5 * inch, str(doc.page))
    canvas.restoreState()


def build(path):
    doc = SimpleDocTemplate(str(path), pagesize=LETTER, leftMargin=0.9 * inch,
                            rightMargin=0.9 * inch, topMargin=0.8 * inch,
                            bottomMargin=0.85 * inch, author="Freelancer Finance Kit",
                            title="Freelancer Finance Kit - Quick-start guide")
    width = LETTER[0] - 1.8 * inch
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
        Paragraph("Freelancer Finance Kit", H1),
        Spacer(1, 4),
        Paragraph("Quick-start guide: get each template working in a few minutes.", LEAD),
        Spacer(1, 14),
        convention,
        Paragraph("What's inside", H2),
        _table(FILES, [2.1 * inch, width - 2.1 * inch]),
        Paragraph("Before you start", H2),
        _bullets([
            "The files work in <b>Microsoft Excel</b> (2010 or later, Windows and Mac, and Excel "
            "for the web), <b>Google Sheets</b> (upload to Drive, then Open with Google Sheets) "
            "and <b>LibreOffice Calc</b>.",
            "Keep the original download and work on a copy.",
            "Every file comes with sample data so you can see it working. To start fresh, select "
            "the yellow sample cells and press Delete. Don't delete whole rows or the white "
            "formula cells.",
            "Dates follow your computer's or account's regional settings; amounts carry no "
            "currency symbol, so they suit any currency.",
        ]),
    ]
    for name, steps in SECTIONS:
        story.append(KeepTogether([Paragraph(name, H2), _bullets(steps)]))
    story += [
        KeepTogether([
            Paragraph("Tips", H2),
            Paragraph("Room in each list:", BODY),
            Spacer(1, 2),
            _table(CAPACITY, [2.1 * inch, width - 2.1 * inch]),
            Spacer(1, 6),
            _bullets([
                "Need more rows? Insert them above the last row of the list, then copy the white "
                "formula cells down from the row above. Totals pick the new rows up.",
                "New year: save a copy of the file, clear the yellow sample or old entries, and "
                "change the Year cell.",
                "The log sheets have filters: use the arrows in the header row to show one "
                "client, category or project.",
            ]),
        ]),
        Spacer(1, 18),
        Paragraph("These templates help you organise your numbers; they are not tax, legal or "
                  "accounting advice. Licensed for use by the buyer in their own work and "
                  "business; please don't resell or share the files. Questions or a problem? "
                  "Reply through the store where you bought the kit.", SMALL),
    ]
    doc.build(story, onFirstPage=_page, onLaterPages=_page)
