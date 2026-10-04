// Pure invoice math, shared by invoice.js and the tests.
(function (root) {
  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function totals(items, taxRate, discount) {
    const subtotal = round2(
      items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0)
    );
    const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
    const taxable = round2(subtotal - disc);
    const tax = round2(taxable * (Number(taxRate) || 0) / 100);
    return { subtotal, discount: disc, tax, total: round2(taxable + tax) };
  }

  function money(n, currency) {
    try {
      return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);
    } catch (e) {
      return (currency ? currency + " " : "") + n.toFixed(2);
    }
  }

  const api = { round2, totals, money };
  if (typeof module !== "undefined") module.exports = api;
  else root.InvoiceCore = api;
})(this);
