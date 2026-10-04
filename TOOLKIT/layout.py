"""Sheet names and the fixed cell addresses one sheet's formulas read from another.

Every list is a fixed block of pre-filled rows; FIRST/LAST are its first and last data rows.
"""

START, INCOME, EXPENSES, MILEAGE, HOME = "Start", "Income", "Expenses", "Mileage", "Use of Home"
MTD, TAX, RATES = "MTD Quarters", "Tax Estimate", "Rates"
CLIENTS, PROJECTS, TIMELOG, INVOICES = "Clients", "Projects", "Time Log", "Invoices"

# Start: settings
BUSINESS = f"'{START}'!$D$6"
YEAR = f"'{START}'!$D$7"  # the calendar year the tax year starts in
SCOTTISH = f"'{START}'!$D$9"
TAX_YEAR_START = f"DATE({YEAR},4,6)"
TAX_YEAR_END = f"DATE({YEAR}+1,4,5)"

INC_FIRST, INC_LAST = 5, 1004
EXP_FIRST, EXP_LAST = 5, 2004
MIL_FIRST, MIL_LAST = 5, 1004
HOME_FIRST, HOME_LAST = 6, 17  # the twelve tax months
CL_FIRST, CL_LAST = 5, 104
PR_FIRST, PR_LAST = 5, 204
TL_FIRST, TL_LAST = 5, 2004
IN_FIRST, IN_LAST = 5, 504

INCOME_TYPES = ["Turnover", "Other business income"]
CAR, MOTORCYCLE = "Car or van", "Motorcycle"


def col(sheet, letter, first, last):
    """An absolute single-column range on another sheet."""
    return f"'{sheet}'!${letter}${first}:${letter}${last}"
