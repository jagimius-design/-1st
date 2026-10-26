const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");

global.window = {};
require(path.join(__dirname, "..", "pixels.js"));
const data = global.window.LOWRES;
const lowres = require(path.join(__dirname, "..", "lowres.js"));

const rectangular = (rows) => rows.every((r) => r.length === rows[0].length);

test("every glyph is 5 rows of one width", () => {
  for (const [ch, rows] of Object.entries(data.font)) {
    assert.strictEqual(rows.length, 5, ch);
    assert.ok(rectangular(rows), ch);
  }
});

test("emblem is rectangular and every colour is in the palette", () => {
  const e = data.emblem;
  assert.ok(rectangular(e.rows));
  for (const c of new Set(e.rows.join(""))) assert.ok(data.palette[e.colors[c]], c);
});

test("products are rectangular and use only colorway keys", () => {
  for (const p of data.products) {
    assert.ok(rectangular(p.rows), p.id);
    for (const c of new Set(p.rows.join(""))) assert.ok(c === "." || "XSDAL".includes(c), p.id + " " + c);
    for (const id of p.colorways) assert.ok(data.colorways[id], p.id + " " + id);
  }
});

test("wordmark is 39 pixels wide", () => {
  const rows = lowres.textRows("LOW RES", data.font);
  assert.strictEqual(rows[0].length, 39);
  assert.ok(rectangular(rows));
});

test("garments get a one-pixel ink outline", () => {
  const rows = lowres.garmentRows(["X"]);
  assert.deepStrictEqual(rows, [".O.", "OXO", ".O."]);
});
