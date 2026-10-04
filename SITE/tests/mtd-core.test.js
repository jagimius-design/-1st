const test = require("node:test");
const assert = require("node:assert");
const { mtdStart } = require("../mtd-core.js");

test("income above the tested year's threshold starts MTD two tax years later", () => {
  const r = mtdStart(35000, 2025);
  assert.strictEqual(r.start, "2027-04-06");
  assert.strictEqual(r.firstDeadline, "2027-08-07");
  assert.strictEqual(r.finalDeclaration, "2029-01-31");
  assert.strictEqual(r.projected, false);
});

test("the threshold is a strict 'more than'", () => {
  assert.strictEqual(mtdStart(50000, 2024).applies, false);
  assert.strictEqual(mtdStart(50001, 2024).start, "2026-04-06");
});

test("steady income below this year's threshold projects to the first year it is above", () => {
  const r = mtdStart(25000, 2024, true);
  assert.deepStrictEqual([r.start, r.testedYear, r.projected], ["2028-04-06", "2026-27", true]);
});

test("income at or below the £20,000 floor never applies", () => {
  assert.strictEqual(mtdStart(20000, 2027, true).applies, false);
});
