/* bx1-c1-s2 集合间的基本关系：n 元集合的子集 / 真子集 / 非空真子集 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", narrow: false, left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", narrow: true, left: { x: 8, y: 8, w: 344, h: 304 }, right: { x: 8, y: 324, w: 344, h: 368 } };
  var L = W, G = null, A = 3;
  var SUB = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈"];

  /* 纯函数：n → 三档计数 */
  function calc(v) {
    var n = Math.round(v);
    if (!isFinite(n) || n < 0) n = 0;
    if (n > 8) n = 8;
    var sub = Math.pow(2, n);
    return { n: n, sub: sub, proper: sub - 1, nep: n >= 1 ? sub - 2 : 0 };
  }

  /* 几何量：两套布局共用 */
  function geom() {
    var l = L.left, gap = 8, cols = 4;
    return {
      cols: cols, gap: gap,
      cw: (l.w - 40 - gap * (cols - 1)) / cols,
      ch: L.narrow ? 34 : 36,
      x0: l.x + 20,
      y0: l.y + (L.narrow ? 40 : 58)
    };
  }

  function subStr(n, mask) {
    var t = [], i;
    for (i = 0; i < n; i++) if (mask & (1 << i)) t.push("x" + SUB[i + 1]);
    return t.length ? "{" + t.join(",") + "}" : "∅";
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), i, k, cx, cy;
    gA.textContent = ""; gB.textContent = "";
    var l = L.left, r = L.right;

    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 20, l.y + 26, "每个元素两条路：取 / 不取", "#5a6472", "start", 10.5, 700);

    if (s.n === 0) {
      tx(gA, l.x + 20, l.y + 76, "没有元素可选，只有一种情况：", "#3a3a35", "start", 10, 400);
      tx(gA, l.x + 20, l.y + 98, "一个也不取 ⇒ 子集只有 ∅。", "#3a3a35", "start", 10, 400);
      tx(gA, l.x + 20, l.y + 120, "∅ 是它自己的唯一子集。", "#2563eb", "start", 9.4, 400);
    } else {
      for (i = 0; i < s.n; i++) {
        cx = G.x0 + (i % G.cols) * (G.cw + G.gap);
        cy = G.y0 + Math.floor(i / G.cols) * (G.ch + 12);
        el("rect", { x: cx, y: cy, width: G.cw, height: G.ch, rx: 7, fill: "#ffffff", stroke: "#b8e6d0" }, gA);
        tx(gA, cx + G.cw / 2, cy + 16, "x" + SUB[i + 1], "#151a21", "middle", 11, 700);
        tx(gA, cx + G.cw / 2, cy + 29, "取 / 不取", "#5a6472", "middle", 8.2, 400);
      }
    }

    var fy = L.narrow ? l.y + 152 : l.y + 198, fstr, parts = [];
    if (s.n === 0) fstr = "2⁰ = 1";
    else if (s.n <= 4) {
      for (i = 0; i < s.n; i++) parts.push("2");
      fstr = parts.join(" × ") + " = " + s.sub;
    } else fstr = "2 × 2 × ⋯ × 2（" + s.n + " 个）= " + s.sub;
    tx(gA, l.x + 20, fy, fstr, "#2563eb", "start", L.narrow ? 12 : 13, 700);
    tx(gA, l.x + 20, fy + 20, "子集 " + s.sub + " 个 · 真子集 " + s.proper + " 个 · 非空真子集 " + s.nep + " 个", "#5a6472", "start", 8.8, 400);

    if (!L.narrow && s.n >= 1 && s.n <= 3) {
      var all = [], m, txt, cut;
      for (m = 0; m < s.sub; m++) all.push(subStr(s.n, m));
      txt = all.join("、");
      cut = txt.lastIndexOf("、", Math.ceil(txt.length / 2));
      tx(gA, l.x + 20, fy + 48, "n=" + s.n + " 时 " + s.sub + " 个子集：", "#3a3a35", "start", 9.2, 700);
      tx(gA, l.x + 20, fy + 66, txt.slice(0, cut), "#5a6472", "start", 9.2, 400);
      tx(gA, l.x + 20, fy + 84, txt.slice(cut + 1), "#5a6472", "start", 9.2, 400);
    }

    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 20, r.y + 26, "三个数只差 1", "#5a6472", "start", 10.5, 700);

    var rows = [
      { k: "① 子集 2ⁿ", v: s.sub, col: "#2563eb", w: 1, tag: "含 ∅ 与集合本身" },
      { k: "② 真子集 2ⁿ−1", v: s.proper, col: "#2f8a5b", w: s.sub ? s.proper / s.sub : 0, tag: "少的那一个是：集合本身" },
      { k: "③ 非空真子集 2ⁿ−2", v: s.nep, col: "#b8791f", w: s.sub ? s.nep / s.sub : 0, tag: "再少一个：空集 ∅" }
    ];
    var rowY = r.y + (L.narrow ? 58 : 64), gapY = L.narrow ? 92 : 108, bw;
    for (k = 0; k < rows.length; k++) {
      var y = rowY + k * gapY;
      tx(gB, r.x + 20, y, rows[k].k, "#3a3a35", "start", 9.8, 700);
      tx(gB, r.x + r.w - 20, y, String(rows[k].v), rows[k].col, "end", 19, 700);
      el("rect", { x: r.x + 20, y: y + 14, width: r.w - 40, height: 10, rx: 5, fill: "#eef1f5" }, gB);
      bw = (r.w - 40) * rows[k].w;
      if (bw < 4) bw = 4;
      el("rect", { x: r.x + 20, y: y + 14, width: bw, height: 10, rx: 5, fill: rows[k].col }, gB);
      tx(gB, r.x + 20, y + 38, rows[k].tag, "#5a6472", "start", 8.6, 400);
    }
    tx(gB, r.x + 20, r.y + r.h - 16, "n=0 时只有 ∅ 一个子集，没有真子集", "#b8402f", "start", 8.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = String(s.sub);
    $("gxVc").textContent = String(s.proper);
    if ($("gxVd")) $("gxVd").textContent = String(s.nep);
    if (s.n === 0) { st = "只剩 ∅"; col = "#b8791f"; bg = "#fdf3e0"; sn = "没有真子集，也没有非空真子集"; }
    else { st = "三档都成立"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "真子集少 1 个，非空真子集少 2 个"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = geom();
    stage.setAttribute("viewBox", L.vb);
    render();
  }

  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    if (!apBadge) return;
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  var ap = AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 5 }, { t: 11.5, v: 8 }, { t: 13.5, v: 0 }],
    keys: [0, 3, 5, 8],
    value: A, min: 0, max: 8, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { sub: 1, proper: 0, nep: 0 } },
    { v: 3, eq: { sub: 8, proper: 7, nep: 6 } },
    { v: 8, eq: { sub: 256, proper: 255, nep: 254 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
