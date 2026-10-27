// Draws everything on the page from the bitmaps in pixels.js and wordmark.js: the
// wordmark, pixel headings and the garments. No images; every pixel is an SVG rect.
(function (root) {
  "use strict";

  // Text as a grid of 5 rows; glyphs are joined with one empty column.
  function textRows(text, font) {
    var rows = ["", "", "", "", ""];
    var chars = Array.from(text.toUpperCase());
    chars.forEach(function (ch, i) {
      var glyph = font[ch] || font[" "];
      for (var y = 0; y < 5; y++) rows[y] += glyph[y] + (i < chars.length - 1 ? "." : "");
    });
    return rows;
  }

  // Garment rows padded by one pixel, with an ink outline round the shape and
  // optional dither on the base fabric.
  function garmentRows(rows, texture) {
    var w = rows[0].length + 2;
    var pad = ".".repeat(w);
    var src = [pad].concat(rows.map(function (r) { return "." + r + "."; }), [pad]);
    var filled = function (x, y) { return src[y] && src[y][x] && src[y][x] !== "."; };
    return src.map(function (row, y) {
      return Array.from(row).map(function (c, x) {
        if (c === ".") {
          return filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1) ? "O" : ".";
        }
        if (c === "X" && texture === "dither" && x % 2 === 0 && y % 2 === 0) return "S";
        return c;
      }).join("");
    });
  }

  // One rect per horizontal run of a colour; "." is transparent.
  function rowsToSvg(rows, colorOf, label) {
    var h = rows.length, w = rows[0].length, rects = "";
    rows.forEach(function (row, y) {
      var x = 0;
      while (x < w) {
        var c = row[x], run = 1;
        while (x + run < w && row[x + run] === c) run++;
        if (c !== ".") {
          rects += '<rect x="' + x + '" y="' + y + '" width="' + run + '" height="1" fill="' + colorOf(c) + '"/>';
        }
        x += run;
      }
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h +
      '" shape-rendering="crispEdges" role="img" aria-label="' + label + '"' +
      ' style="width:calc(var(--px) * ' + w + ');height:calc(var(--px) * ' + h + ')">' +
      rects + "</svg>";
  }

  function textSvg(text, data) {
    return rowsToSvg(textRows(text, data.font), function () { return "currentColor"; }, text);
  }

  // The wordmark on one grid of base units: each letter's pixels are `unit` units
  // square, letters sit on a shared baseline, and the stray pixel is "A".
  function wordmarkRows(wm) {
    var x = 0, placed = [];
    wm.letters.forEach(function (l, i) {
      if (i === 3) x += wm.space;
      placed.push({ x: x, l: l });
      x += l.rows[0].length * l.unit + wm.gap;
    });
    var s = placed[placed.length - 1];
    var stray = {
      x: s.x + wm.stray.col * s.l.unit,
      y: wm.height - s.l.rows.length * s.l.unit + wm.stray.row * s.l.unit,
      size: s.l.unit
    };
    var w = Math.max(x - wm.gap, stray.x + stray.size);
    var grid = [];
    for (var y = 0; y < wm.height; y++) grid.push(new Array(w).fill("."));
    var fill = function (x0, y0, size, c) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) grid[y0 + yy][x0 + xx] = c;
    };
    placed.forEach(function (p) {
      var top = wm.height - p.l.rows.length * p.l.unit;
      p.l.rows.forEach(function (row, j) {
        Array.from(row).forEach(function (c, i) {
          if (c === "X") fill(p.x + i * p.l.unit, top + j * p.l.unit, p.l.unit, "X");
        });
      });
    });
    fill(stray.x, stray.y, stray.size, "A");
    return grid.map(function (r) { return r.join(""); });
  }

  function wordmarkSvg(data) {
    return rowsToSvg(wordmarkRows(data.wordmark), function (c) {
      return c === "A" ? data.palette.signal : "currentColor";
    }, "low res");
  }

  // One letter of the wordmark at its own resolution, scaled to the shared height.
  function letterSvg(letter, height) {
    var u = letter.unit;
    var rows = letter.rows.map(function (r) {
      return Array.from(r).map(function (c) { return c.repeat(u); }).join("");
    }).reduce(function (acc, r) { for (var i = 0; i < u; i++) acc.push(r); return acc; }, []);
    while (rows.length < height) rows.unshift(".".repeat(rows[0].length));
    return rowsToSvg(rows, function () { return "currentColor"; }, letter.char);
  }

  function garmentSvg(product, colorwayId, data) {
    var cw = data.colorways[colorwayId];
    var ink = data.palette.ink;
    return rowsToSvg(garmentRows(product.rows, product.texture), function (c) {
      return c === "O" ? ink : cw[c];
    }, product.name + ", " + cw.name);
  }

  var api = { textRows: textRows, garmentRows: garmentRows, rowsToSvg: rowsToSvg,
              textSvg: textSvg, wordmarkRows: wordmarkRows, wordmarkSvg: wordmarkSvg,
              letterSvg: letterSvg, garmentSvg: garmentSvg };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof document === "undefined") return;

  var data = root.LOWRES;

  function render() {
    // Pixel headings: one SVG per word so long lines wrap on small screens.
    document.querySelectorAll("[data-px]").forEach(function (el) {
      var text = el.getAttribute("data-px") || el.textContent.trim();
      el.setAttribute("aria-label", text);
      el.innerHTML = text.split(/\s+/).map(function (word) {
        return '<span aria-hidden="true">' + textSvg(word, data) + "</span>";
      }).join("");
      el.classList.add("px-text");
    });

    document.querySelectorAll("[data-wordmark]").forEach(function (el) {
      el.innerHTML = wordmarkSvg(data);
    });

    var anatomy = document.getElementById("anatomy");
    if (anatomy) {
      anatomy.innerHTML = data.wordmark.letters.map(function (l) {
        return "<figure>" + letterSvg(l, data.wordmark.height) +
          "<figcaption>" + l.rows[0].length + "×" + l.rows.length + "</figcaption></figure>";
      }).join("");
    }

    var grid = document.getElementById("drop");
    if (grid) {
      grid.innerHTML = data.products.map(function (p) {
        var swatches = p.colorways.map(function (id, i) {
          var cw = data.colorways[id];
          return '<button type="button" class="swatch" data-cw="' + id + '" aria-pressed="' + (i === 0) +
            '" aria-label="' + cw.name + '" title="' + cw.name + '" style="--sw:' + cw.X + '"></button>';
        }).join("");
        return '<article class="card" data-id="' + p.id + '">' +
          '<div class="card-art">' + garmentSvg(p, p.colorways[0], data) + "</div>" +
          '<div class="card-body">' +
            '<div class="card-head"><h3>' + p.name + '</h3><span class="price">$' + p.price + "</span></div>" +
            "<p>" + p.blurb + "</p>" +
            '<div class="card-foot"><div class="swatches">' + swatches + "</div>" +
            '<span class="spec">' + p.spec + "</span></div>" +
          "</div></article>";
      }).join("");

      grid.addEventListener("click", function (ev) {
        var btn = ev.target.closest(".swatch");
        if (!btn) return;
        var card = btn.closest(".card");
        var product = data.products.find(function (p) { return p.id === card.dataset.id; });
        card.querySelector(".card-art").innerHTML = garmentSvg(product, btn.dataset.cw, data);
        card.querySelectorAll(".swatch").forEach(function (s) { s.setAttribute("aria-pressed", s === btn); });
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})(typeof window !== "undefined" ? window : globalThis);
