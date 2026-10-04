# UK figures for 2026-27: where they come from

Checked October 2026. gov.uk, gov.scot and most accountancy sites were blocked by the session's
proxy, so every figure was confirmed from web-search summaries of those pages, which agreed with
each other. The Rates sheet points the buyer at the gov.uk page for each figure.

| Figure | Value | Confirmed from |
|---|---|---|
| Personal allowance, taper | £12,570; £1 per £2 over £100,000 | Summaries of gov.uk income-tax-rates, truepotential, cintra (frozen to 2027-28 and beyond) |
| UK bands (taxable income) | 20% to £37,700; 40% to £125,140; 45% above | Same |
| Scottish bands (total income, full PA) | 19% £12,571-16,537; 20% to 29,526; 21% to 43,662; 42% to 75,000; 45% to 125,140; 48% above | gov.scot "Scottish income tax rates and bands 2026 to 2027" summary |
| Class 4 NI | 6% £12,570-£50,270, 2% above | freeagent, uktax.tools, betteraccount summaries |
| Class 2 NI | Not charged; small profits threshold £7,105; voluntary £3.65/week | bytestart, sparkreceipt summaries |
| Mileage, car or van | 55p first 10,000 miles, 25p after | Several 2026-27 guides: raised from 45p, announced by the Chancellor on 21 May 2026 and backdated to 6 April 2026. Recent and the least settled figure, so check it first |
| Mileage, motorcycle | 24p | Same |
| Use of home | £10 / £18 / £26 a month for 25-50 / 51-100 / 101+ hours | Summaries of gov.uk working-from-home simplified expenses |
| Payments on account | 50% each, 31 Jan and 31 Jul; none if last bill < £1,000 or 80%+ taxed at source | xero, ACCA summaries |
| MTD | £50k (2024-25) from Apr 2026, £30k (2025-26) from Apr 2027, £20k (2026-27) from Apr 2028; cumulative updates by 7 Aug, 7 Nov, 7 Feb, 7 May | MARKET/brief.md sources, taxassist, ICAEW summaries |

The Rates sheet stores Scottish bands as slices of taxable income, which is how the Tax Estimate
sheet applies them: 3,967 / 16,956 / 31,092 / 62,430 / 125,140. Each is the total-income limit
above minus £12,570, except the top threshold, which stays at £125,140 because the personal
allowance is gone by then.

The kit decided these points itself, without an authoritative source:

- The HMRC field names (`turnover`, `costOfGoods`, ..., `consolidatedExpenses`) and SA103F box
  numbers 15-31 are from the Self Employment Business API and the SA103F form as known before
  2026. They weren't re-read.
- The use-of-home flat rate is reported under Rent, rates, power and insurance, and mileage under
  Car, van and travel. No HMRC text confirming the first was found.
- Payments on account use the buyer's last-year bill. The 80% test compares tax at source with
  the bill plus tax at source.
