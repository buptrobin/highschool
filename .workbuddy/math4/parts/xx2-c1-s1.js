/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 5;
  var NMAX = 10, AMAX = 19, SMAX = 100;

  /* 纯函数：序号 n → aₙ、Sₙ、Sₙ − Sₙ₋₁。render() 和 __model.cases 都用它 */
  function calc(v) {
    var n = Math.round(v);
    if (n < 1) n = 1;
    if (n > NMAX) n = NMAX;
    var an = 2 * n - 1, sn = n * n;
    var prev = n >= 2 ? (n - 1) * (n - 1) : null;
    var gap = n >= 2 ? sn - prev : an;
    return { n: n, an: an, sn: sn, prev: prev, gap: gap };
  }

  function geom() {
    var narrow = L === N, l = L.left, r = L.right;
    var g = {};
    g.lx = l.x + (narrow ? 46 : 50);
    g.ly = l.y + l.h - (narrow ? 56 : 62);
    g.lw = l.w - (narrow ? 76 : 96);
    g.lh = l.h - (narrow ? 110 : 126);
    g.rx = r.x + (narrow ? 46 : 50);
    g.ry = r.y + r.h - (narrow ? 56 : 64);
    g.rw = r.w - (narrow ? 76 : 96);
    g.rh = r.h - (narrow ? 110 : 130);
    return g;
  }
  var px = function (n) { return G.lx + n * G.lw / NMAX; };
  var py = function (a) { return G.ly - a * G.lh / AMAX; };
  var sy = function (s) { return G.ry - s * G.rh / SMAX; };

  function arrow(g, x1, y1, x2, y2, col) {
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": 1.1 }, g);
  }
  function tip(g, x, y, dir, col) {
    var d = dir === "r" ? "M" + x + " " + y + " L" + (x - 8) + " " + (y - 4) + " L" + (x - 8) + " " + (y + 4) + " Z"
      : "M" + x + " " + y + " L" + (x - 4) + " " + (y + 8) + " L" + (x + 4) + " " + (y + 8) + " Z";
    el("path", { d: d, fill: col }, g);
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), l = L.left, r = L.right, i, n, cx, cy;
    gA.textContent = ""; gB.textContent = "";

    /* 左：aₙ 的点列（横轴序号 n，纵轴 aₙ，只画点不连线） */
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 16, l.y + 26, "点列：横轴序号 n，纵轴项 aₙ", "#5a6472", "start", 10, 700);
    arrow(gA, G.lx, G.ly, G.lx + G.lw + 16, G.ly, "#5a6472");
    tip(gA, G.lx + G.lw + 16, G.ly, "r", "#5a6472");
    arrow(gA, G.lx, G.ly, G.lx, G.ly - G.lh - 12, "#5a6472");
    tip(gA, G.lx, G.ly - G.lh - 12, "u", "#5a6472");
    tx(gA, G.lx + G.lw + 10, G.ly - 8, "n", "#5a6472", "end", 9.5, 400);
    tx(gA, G.lx - 12, G.ly - G.lh - 6, "aₙ", "#5a6472", "start", 9.5, 400);
    for (i = 1; i <= NMAX; i++) {
      if (L === N && i % 2 === 1) continue;
      tx(gA, px(i), G.ly + 14, String(i), "#5a6472", "middle", 8.6, 400);
    }
    for (i = 5; i <= 15; i += 5) {
      tx(gA, G.lx - 6, py(i) + 3, String(i), "#5a6472", "end", 8.6, 400);
    }
    for (i = 1; i <= NMAX; i++) {
      cx = px(i); cy = py(2 * i - 1);
      if (i === s.n) {
        el("line", { x1: cx, y1: cy, x2: cx, y2: G.ly, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
        el("circle", { cx: cx, cy: cy, r: 4.6, fill: "#b8402f" }, gA);
      } else {
        el("circle", { cx: cx, cy: cy, r: 3.1, fill: "#2563eb" }, gA);
      }
    }
    tx(gA, px(s.n) + (s.n > 8 ? -8 : 8), py(s.an) - 8, "aₙ =" + s.an, "#b8402f", s.n > 8 ? "end" : "start", 9.2, 700);

    /* 右：Sₙ 的柱高，相邻两柱之差就是 aₙ */
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 16, r.y + 26, "Sₙ = n² 的柱高", "#5a6472", "start", 10, 700);
    tx(gB, r.x + 16, r.y + 44, "相邻两柱高度差 = aₙ", "#8b95a3", "start", 9, 400);
    arrow(gB, G.rx, G.ry, G.rx + G.rw + 16, G.ry, "#5a6472");
    tip(gB, G.rx + G.rw + 16, G.ry, "r", "#5a6472");
    arrow(gB, G.rx, G.ry, G.rx, G.ry - G.rh - 12, "#5a6472");
    tip(gB, G.rx, G.ry - G.rh - 12, "u", "#5a6472");
    tx(gB, G.rx + G.rw + 10, G.ry - 8, "n", "#5a6472", "end", 9.5, 400);
    tx(gB, G.rx - 8, G.ry - G.rh - 6, "Sₙ", "#5a6472", "start", 9.5, 400);
    tx(gB, G.rx - 6, sy(100) + 3, "100", "#5a6472", "end", 8.6, 400);
    tx(gB, G.rx - 6, sy(50) + 3, "50", "#5a6472", "end", 8.6, 400);
    var slot = G.rw / NMAX, bw = slot * 0.58;
    for (i = 1; i <= NMAX; i++) {
      n = i * i;
      el("rect", {
        x: G.rx + (i - 1) * slot + (slot - bw) / 2, y: sy(n), width: bw, height: G.ry - sy(n),
        rx: 2, fill: i === s.n ? "#b8402f" : "#a9c9f2", stroke: "none"
      }, gB);
      if (!(L === N) || i % 2 === 0) tx(gB, G.rx + (i - 0.5) * slot, G.ry + 14, String(i), "#5a6472", "middle", 8.6, 400);
    }
    if (s.n >= 2) {
      el("line", { x1: G.rx, y1: sy(s.prev), x2: G.rx + G.rw, y2: sy(s.prev), stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gB);
      var xm = G.rx + (s.n - 0.5) * slot;
      el("line", { x1: xm, y1: sy(s.prev) - 2, x2: xm, y2: sy(s.sn) + 2, stroke: "#b8402f", "stroke-width": 1.2 }, gB);
      tx(gB, G.rx + 4, G.ry + 38, "Sₙ − Sₙ₋₁ = " + s.sn + " − " + s.prev + " = " + s.gap + " = aₙ", "#b8402f", "start", 9.4, 700);
    } else {
      tx(gB, G.rx + 4, G.ry + 38, "n = 1：a₁ = S₁ = 1，S₀ 无定义", "#b8402f", "start", 9.4, 700);
      tx(gB, G.rx + 4, G.ry + 54, "所以 n = 1 不能相减", "#8b95a3", "start", 9, 400);
    }
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = String(s.an);
    $("gxVc").textContent = String(s.sn);
    if (s.n === 1) { st = "a₁ = S₁"; col = "#b8402f"; bg = "#fbeae7"; sn = "不能减 S₀"; }
    else { st = "aₙ = Sₙ − Sₙ₋₁"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "n ≥ 2 可相减"; }
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 5 }, { t: 6.5, v: 5 }, { t: 9, v: 10 }, { t: 11.5, v: 7 }, { t: 13.5, v: 1 }],
    keys: [1, 5, 10],
    value: A, min: 1, max: NMAX, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 3, eq: { an: 5, sn: 9 } },
    { v: 5, eq: { an: 9, sn: 25, gap: 9 } },
    { v: 10, eq: { an: 19, sn: 100 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
