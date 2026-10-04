// When MTD for Income Tax starts for someone, from their qualifying income in one tax year.
// Qualifying income is gross self-employment plus property income, before expenses. HMRC tests the
// tax return for year Y and starts MTD on 6 April two years after Y begins.
(function (root) {
  // First year of the tested tax year -> threshold income must be above (announced to 2028).
  const THRESHOLDS = [[2024, 50000], [2025, 30000], [2026, 20000]];
  const FLOOR = 20000;

  function threshold(year) {
    if (year < THRESHOLDS[0][0]) return null;
    const row = THRESHOLDS.find(([y]) => y === year);
    return row ? row[1] : FLOOR;
  }

  function label(year) {
    return year + "-" + String((year + 1) % 100).padStart(2, "0");
  }

  // income: qualifying income for the tax year starting in `year` (e.g. 2025 for 2025-26).
  // Returns the start, the first quarterly deadline and the first final declaration, or a reason
  // it does not apply. With `assumeSteady`, later years are assumed to have the same income.
  function mtdStart(income, year, assumeSteady) {
    income = Number(income) || 0;
    for (let y = year; y <= (assumeSteady ? Math.max(year, THRESHOLDS.at(-1)[0]) : year); y++) {
      const t = threshold(y);
      if (t === null || income <= t) continue;
      const s = y + 2;
      return {
        applies: true,
        testedYear: label(y),
        threshold: t,
        startYear: label(s),
        start: s + "-04-06",
        firstDeadline: s + "-08-07",
        finalDeclaration: (s + 2) + "-01-31",
        projected: y !== year,
      };
    }
    return { applies: false, threshold: threshold(year), floor: FLOOR };
  }

  const api = { threshold, label, mtdStart };
  if (typeof module !== "undefined") module.exports = api;
  else root.MtdCore = api;
})(this);
