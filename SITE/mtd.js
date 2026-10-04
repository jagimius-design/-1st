(function () {
  const form = document.getElementById("checker");
  const out = document.getElementById("result");
  const { mtdStart, label } = window.MtdCore;
  const gbp = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
  const date = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  function el(tag, text, cls) {
    const e = document.createElement(tag);
    e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const income = Number(form.income.value);
    const year = Number(form.year.value);
    const r = mtdStart(income, year, form.steady.checked);
    out.replaceChildren();
    out.hidden = false;
    if (!r.applies) {
      out.append(el("h3", "Not from this income"));
      out.append(el("p", income > r.floor
        ? `${gbp(income)} is not more than the ${gbp(r.threshold)} threshold for ${label(year)}. Check again with a later year's income.`
        : `${gbp(income)} is not more than ${gbp(r.floor)}, the lowest threshold announced. You can still join voluntarily.`));
      return;
    }
    const started = new Date(r.start) <= new Date();
    out.append(el("h3", started ? `You've been in MTD since ${date(r.start)}` : `MTD starts for you on ${date(r.start)}`));
    out.append(el("p", r.projected
      ? `${gbp(income)} is under the threshold for ${label(year)}, but if your ${r.testedYear} income is the same, it is more than that year's ${gbp(r.threshold)} threshold. MTD then applies from the ${r.startYear} tax year.`
      : `Your ${r.testedYear} income is more than the ${gbp(r.threshold)} threshold, so MTD applies from the ${r.startYear} tax year.`));
    const dl = document.createElement("dl");
    for (const [k, v] of [
      ["First quarterly update", date(r.firstDeadline)],
      ["Then each year by", "7 Nov, 7 Feb, 7 May, 7 Aug"],
      ["First final declaration", date(r.finalDeclaration)],
    ]) { dl.append(el("dt", k), el("dd", v)); }
    out.append(dl);
  });
})();
