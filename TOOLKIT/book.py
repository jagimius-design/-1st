"""The main workbook: every sheet, in the order the buyer meets them."""

import clients
import mtd
import rates
import records
import start
import taxcalc
from style import workbook


def build(path):
    wb = workbook()
    start.build(wb)
    records.build(wb)
    mtd.build(wb)
    taxcalc.build(wb)
    clients.build(wb)
    rates.build(wb)
    wb.save(path)
