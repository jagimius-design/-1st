"""Sample data the workbook ships with: a designer's first half of the 2026-27 tax year.

The tests reuse it as their expected figures.
"""

from datetime import date

Y = 2026
TURNOVER, OTHER = "Turnover", "Other business income"
CAR = "Car or van"

CLIENTS = [  # name, contact, email, hourly rate, payment terms (days)
    ("Acme Ltd", "Jane Doe", "jane@acme.example", 85, 30),
    ("Northwind Studio", "Tom Reyes", "tom@northwind.example", 75, 14),
    ("Greenleaf Ltd", "Priya Shah", "priya@greenleaf.example", 90, 30),
    ("Bluebird Cafe", "Sam Lee", "sam@bluebird.example", 60, 7),
    ("Orbit Apps", "Mia Chen", "mia@orbit.example", 95, 30),
]
PROJECTS = [  # name, client, rate override, budget hours, status
    ("Acme - monthly retainer", "Acme Ltd", None, 120, "Active"),
    ("Northwind - brand refresh", "Northwind Studio", None, 40, "Done"),
    ("Greenleaf - website", "Greenleaf Ltd", 95, 60, "Active"),
    ("Bluebird - seasonal menu", "Bluebird Cafe", None, 12, "Done"),
    ("Orbit - onboarding screens", "Orbit Apps", None, 30, "Active"),
    ("Portfolio update", None, None, 10, "On hold"),
]
TIME = [  # date, project index, task, hours, billable, invoice #
    (date(Y, 7, 1), 0, "Social graphics", 6, "Yes", "INV-0031"),
    (date(Y, 7, 8), 0, "Newsletter layout", 5.5, "Yes", "INV-0031"),
    (date(Y, 7, 14), 1, "Logo concepts", 8, "Yes", "INV-0032"),
    (date(Y, 7, 16), 1, "Logo refinements", 6, "Yes", "INV-0032"),
    (date(Y, 7, 21), 0, "Landing page banners", 7, "Yes", "INV-0031"),
    (date(Y, 7, 24), 1, "Brand guidelines", 10, "Yes", "INV-0032"),
    (date(Y, 7, 29), 0, "Client call", 1, "No", None),
    (date(Y, 8, 4), 2, "Sitemap and wireframes", 9, "Yes", "INV-0034"),
    (date(Y, 8, 6), 0, "Ad set, August", 6.5, "Yes", "INV-0033"),
    (date(Y, 8, 11), 2, "Homepage design", 8, "Yes", "INV-0034"),
    (date(Y, 8, 13), 3, "Menu layout", 5, "Yes", "INV-0035"),
    (date(Y, 8, 14), 3, "Print files", 2.5, "Yes", "INV-0035"),
    (date(Y, 8, 18), 2, "Inner page designs", 10, "Yes", "INV-0034"),
    (date(Y, 8, 20), 0, "Social graphics", 8, "Yes", "INV-0033"),
    (date(Y, 8, 27), 0, "Newsletter layout", 5, "Yes", "INV-0033"),
    (date(Y, 9, 2), 4, "User flow review", 4, "Yes", "INV-0037"),
    (date(Y, 9, 3), 0, "Ad set, September", 7, "Yes", "INV-0036"),
    (date(Y, 9, 8), 4, "Onboarding screens v1", 9, "Yes", "INV-0037"),
    (date(Y, 9, 9), 2, "Responsive layouts", 8.5, "Yes", "INV-0038"),
    (date(Y, 9, 15), 0, "Event poster", 6, "Yes", "INV-0036"),
    (date(Y, 9, 16), 5, "Case study write-up", 4, "No", None),
    (date(Y, 9, 17), 4, "Onboarding screens v2", 7, "Yes", "INV-0037"),
    (date(Y, 9, 22), 2, "Developer handoff", 6, "Yes", "INV-0038"),
    (date(Y, 9, 24), 0, "Newsletter layout", 5, "Yes", "INV-0036"),
    (date(Y, 9, 30), 2, "QA round", 3, "Yes", None),
    (date(Y, 10, 1), 0, "Ad set, October", 6, "Yes", None),
    (date(Y, 10, 2), 4, "Illustrations", 5.5, "Yes", None),
]
INVOICES = [  # number, project index, issue date, amount (None: the time logged against it)
    ("INV-0025", 0, date(Y, 4, 30), 1530),
    ("INV-0026", 1, date(Y, 5, 12), 2100),
    ("INV-0027", 0, date(Y, 5, 31), 1445),
    ("INV-0028", 3, date(Y, 6, 9), 540),
    ("INV-0029", 0, date(Y, 6, 30), 1700),
    ("INV-0030", 2, date(Y, 6, 30), 2850),
    ("INV-0031", 0, date(Y, 7, 31), None),
    ("INV-0032", 1, date(Y, 7, 31), None),
    ("INV-0033", 0, date(Y, 8, 31), None),
    ("INV-0034", 2, date(Y, 8, 31), None),
    ("INV-0035", 3, date(Y, 8, 31), None),
    ("INV-0036", 0, date(Y, 9, 30), None),
    ("INV-0037", 4, date(Y, 9, 30), None),
    ("INV-0038", 2, date(Y, 9, 30), None),
]
PAYMENTS = [  # date received, invoice #, amount (None: in full)
    (date(Y, 5, 26), "INV-0025", None), (date(Y, 5, 22), "INV-0026", None),
    (date(Y, 6, 29), "INV-0027", None), (date(Y, 6, 15), "INV-0028", None),
    (date(Y, 7, 30), "INV-0029", None), (date(Y, 7, 20), "INV-0030", None),
    (date(Y, 8, 25), "INV-0031", None), (date(Y, 8, 12), "INV-0032", None),
    (date(Y, 9, 28), "INV-0033", None), (date(Y, 9, 30), "INV-0034", None),
    (date(Y, 10, 2), "INV-0036", 500),
]
OTHER_INCOME = [  # date, from, description, type, amount
    (date(Y, 4, 14), "Template marketplace", "Template sales payout", TURNOVER, 186.40),
    (date(Y, 6, 13), "Template marketplace", "Template sales payout", TURNOVER, 212.75),
    (date(Y, 8, 3), "PrintCo", "Referral commission", OTHER, 150),
    (date(Y, 9, 12), "Template marketplace", "Template sales payout", TURNOVER, 240.10),
]
OFFICE = "Phone, fax, stationery and other office costs"
PREMISES = "Rent, rates, power and insurance costs"
EXPENSES = [  # date, supplier, description, SA103 category, amount, business use (None: 100%)
    (date(Y, 4, 20), "Smith & Co Accountants", "2025-26 tax return",
     "Accountancy, legal and other professional fees", 450, None),
    (date(Y, 5, 4), "Hiscox", "Professional indemnity insurance", "Other business expenses", 240,
     None),
    (date(Y, 6, 18), "Trainline", "Train to client workshop", "Car, van and travel expenses",
     64.30, None),
    (date(Y, 7, 9), "Meta", "Portfolio ads", "Advertising costs", 120, None),
    (date(Y, 8, 21), "Dishoom", "Lunch with prospective client", "Business entertainment costs",
     58.20, None),
    (date(Y, 8, 28), "Stocksy", "Stock photos for client work",
     "Cost of goods bought for resale or goods used", 89, None),
    (date(Y, 9, 10), "Viking", "Printer ink and paper", OFFICE, 34.99, None),
]
for _m in range(4, 10):
    EXPENSES += [
        (date(Y, _m, 10), "Adobe", "Design software subscription", OFFICE, 56.98, None),
        (date(Y, _m, 8), "EE", "Mobile phone contract", OFFICE, 30, 0.6),
        (date(Y, _m, 15), "Huckletree", "Coworking day passes", PREMISES, 120, None),
        (date(Y, _m, 28), "Stripe", "Card payment fees",
         "Bank, credit card and other financial charges", 6.40 + _m, None),
    ]
EXPENSES.sort(key=lambda e: e[0])
MILEAGE = [  # date, journey, purpose, vehicle, miles
    (date(Y, 4, 22), "Home - Greenleaf office, Reading", "Kick-off meeting", CAR, 84),
    (date(Y, 5, 13), "Home - Northwind Studio, Bristol", "Brand workshop", CAR, 236),
    (date(Y, 6, 10), "Home - Bluebird Cafe", "Menu photo shoot", CAR, 18),
    (date(Y, 7, 15), "Home - Greenleaf office, Reading", "Design review", CAR, 84),
    (date(Y, 8, 14), "Home - PrintCo", "Press check", "Motorcycle", 22),
    (date(Y, 9, 22), "Home - Greenleaf office, Reading", "Developer handoff", CAR, 84),
]
HOME_HOURS = [60, 72, 48, 80, 30, 104]  # hours worked at home in the first six tax months


def project_rate(i):
    _, client, override, _, _ = PROJECTS[i]
    if override:
        return override
    return next((c[3] for c in CLIENTS if c[0] == client), None)


def invoice_amount(number):
    _, p, _, fixed = next(i for i in INVOICES if i[0] == number)
    if fixed is not None:
        return fixed
    return sum(h * project_rate(q) for _, q, _, h, _, inv in TIME if inv == number)


def income():
    """Every income record: (date, from, invoice #, description, type, amount), by date."""
    rows = []
    for d, number, amount in PAYMENTS:
        _, p, _, _ = next(i for i in INVOICES if i[0] == number)
        rows.append((d, PROJECTS[p][1], number, f"Payment for {number}", TURNOVER,
                     amount if amount is not None else invoice_amount(number)))
    rows += [(d, who, None, desc, kind, amount) for d, who, desc, kind, amount in OTHER_INCOME]
    return sorted(rows, key=lambda r: r[0])
