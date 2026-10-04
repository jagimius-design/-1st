(function () {
  const KEY = "invoice-draft-v2";
  const form = document.getElementById("sheet");
  const body = document.getElementById("items");
  const tpl = document.getElementById("line");
  const currency = document.getElementById("currency");
  const { totals, money } = window.InvoiceCore;

  function today(offsetDays) {
    const d = new Date(Date.now() + (offsetDays || 0) * 864e5);
    return d.toISOString().slice(0, 10);
  }

  function addLine(item) {
    const tr = tpl.content.firstElementChild.cloneNode(true);
    if (item) tr.querySelectorAll("[data-k]").forEach((el) => { el.value = item[el.dataset.k] ?? ""; });
    body.appendChild(tr);
    return tr;
  }

  function readItems() {
    return [...body.rows].map((tr) => {
      const it = {};
      tr.querySelectorAll("[data-k]").forEach((el) => { it[el.dataset.k] = el.value; });
      return it;
    });
  }

  function state() {
    const s = Object.fromEntries(new FormData(form));
    s.items = readItems();
    s.currency = currency.value.trim().toUpperCase();
    return s;
  }

  function render() {
    const s = state();
    const cur = s.currency;
    [...body.rows].forEach((tr, i) => {
      const it = s.items[i];
      tr.querySelector(".amt").textContent = money((Number(it.qty) || 0) * (Number(it.price) || 0), cur);
    });
    const t = totals(s.items, s.taxRate, s.discount);
    document.getElementById("subtotal").textContent = money(t.subtotal, cur);
    document.getElementById("tax").textContent = money(t.tax, cur);
    document.getElementById("total").textContent = money(t.total, cur);
    // Rows left at zero are dropped from the printed invoice.
    document.querySelectorAll(".opt-discount").forEach((el) => el.classList.toggle("unused", !t.discount));
    document.querySelectorAll(".opt-tax").forEach((el) => el.classList.toggle("unused", !t.tax));
    document.querySelectorAll(".opt-vatno").forEach((el) => el.classList.toggle("unused", !s.vatNumber.trim()));
    // Date inputs display in the browser's locale; the printed invoice shows UK dates.
    document.querySelectorAll(".print-date").forEach((el) => {
      const v = s[el.dataset.for];
      el.textContent = v ? new Date(v + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
    });
    document.title = (s.number ? s.number + " " : "") + "Invoice";
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  function load(s) {
    body.innerHTML = "";
    form.reset();
    for (const [k, v] of Object.entries(s || {})) {
      if (form.elements[k] && typeof v === "string") form.elements[k].value = v;
    }
    if (s && s.currency) currency.value = s.currency;
    if (!form.elements.date.value) form.elements.date.value = today();
    if (!form.elements.due.value) form.elements.due.value = today(14);
    const items = (s && s.items && s.items.length) ? s.items : [null];
    items.forEach(addLine);
    render();
  }

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  load(saved);

  form.addEventListener("input", render);
  currency.addEventListener("input", render);
  body.addEventListener("click", (e) => {
    if (!e.target.closest(".del")) return;
    e.target.closest("tr").remove();
    if (!body.rows.length) addLine();
    render();
  });
  document.getElementById("add").addEventListener("click", () => {
    addLine().querySelector("input").focus();
    render();
  });
  document.getElementById("clear").addEventListener("click", () => {
    if (!confirm("Start a new invoice? Your sender and payment details are kept.")) return;
    const s = state();
    load({ from: s.from, vatNumber: s.vatNumber, payment: s.payment, currency: s.currency, taxRate: s.taxRate, title: s.title });
  });
  document.getElementById("print").addEventListener("click", () => window.print());
})();
