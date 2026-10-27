const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");

global.window = {};
require(path.join(__dirname, "..", "pixels.js"));
require(path.join(__dirname, "..", "wordmark.js"));
const data = global.window.LOWRES;
const lowres = require(path.join(__dirname, "..", "lowres.js"));

const rectangular = (rows) => rows.every((r) => r.length === rows[0].length);

test("every glyph is 5 rows of one width", () => {
  for (const [ch, rows] of Object.entries(data.font)) {
    assert.strictEqual(rows.length, 5, ch);
    assert.ok(rectangular(rows), ch);
  }
});

test("wordmark letters each have their own resolution and share a baseline height", () => {
  const wm = data.wordmark;
  assert.deepStrictEqual(wm.letters.map((l) => l.char).join(""), "lowres");
  for (const l of wm.letters) {
    assert.ok(rectangular(l.rows), l.char);
    assert.ok(l.rows.length * l.unit <= wm.height, l.char);
  }
  assert.strictEqual(wm.letters[0].rows.length * wm.letters[0].unit, wm.height);
});

test("wordmark has exactly one stray pixel, detached from the s", () => {
  const rows = lowres.wordmarkRows(data.wordmark);
  assert.ok(rectangular(rows));
  assert.strictEqual(rows.length, data.wordmark.height);
  const u = data.wordmark.letters[5].unit;
  const stray = rows.join("").split("").filter((c) => c === "A").length;
  assert.strictEqual(stray, u * u);
  const y = rows.findIndex((r) => r.includes("A"));
  const x = rows[y].indexOf("A");
  for (let dy = -1; dy <= u; dy++) {
    for (let dx = -1; dx <= u; dx++) {
      const c = (rows[y + dy] || "")[x + dx];
      assert.ok(c !== "X", "stray pixel touches a letter");
    }
  }
});

test("products are rectangular and use only colorway keys", () => {
  for (const p of data.products) {
    assert.ok(rectangular(p.rows), p.id);
    for (const c of new Set(p.rows.join(""))) assert.ok(c === "." || "XSDAL".includes(c), p.id + " " + c);
    for (const id of p.colorways) assert.ok(data.colorways[id], p.id + " " + id);
  }
});

test("pixel text is 5 rows and rectangular", () => {
  const rows = lowres.textRows("LOW RES", data.font);
  assert.strictEqual(rows.length, 5);
  assert.ok(rectangular(rows));
});

test("garments get a one-pixel ink outline", () => {
  const rows = lowres.garmentRows(["X"]);
  assert.deepStrictEqual(rows, [".O.", "OXO", ".O."]);
});
