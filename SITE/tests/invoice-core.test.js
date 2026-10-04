const test = require("node:test");
const assert = require("node:assert");
const { totals, money } = require("../invoice-core.js");

test("totals sums lines, applies discount before tax, rounds to cents", () => {
  const t = totals([{ qty: 3, price: 33.333 }, { qty: 1, price: 10 }], 20, 10);
  assert.deepStrictEqual(t, { subtotal: 110, discount: 10, tax: 20, total: 120 });
});

test("totals treats blank fields as zero and caps the discount at the subtotal", () => {
  const t = totals([{ qty: "", price: "5" }, { qty: 2, price: 5 }], "", 50);
  assert.deepStrictEqual(t, { subtotal: 10, discount: 10, tax: 0, total: 0 });
});

test("money falls back to a plain amount for an unknown currency code", () => {
  assert.strictEqual(money(5, "NOT A CODE"), "NOT A CODE 5.00");
});
