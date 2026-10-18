/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700（不硬缩） */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 },
            lp: { x: 76, y: 396, w: 336, h: 322 }, rp: { x: 512, y: 396, w: 316, h: 310 }, fs: 11, ts: 10, ds: 4.6 };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 },
            lp: { x: 56, y: 272, w: 280, h: 190 }, rp: { x: 56, y: 652, w: 280, h: 210 }, fs: 9.6, ts: 9, ds: 3.6 };
  var L = W, G = null, A = 15;
  var P0 = 10, P1 = 25, LMAX = 240, QMAX = 70;

  /* 唯一真值：售价 p → 销量 q、利润 L。render() 与 __model.cases 都用它 */
  function calc(v) {
    var q = 100 - 4 * v;
    return { q: q, L: (v - 10) * q };
  }

  function geom() {
    if (L === W) return W;
    return N;
  }

  function X(p) { return G.lp.x + (p - P0) / (P1 - P0) * G.lp.w; }
  function Y(l) { return G.lp.y - l / LMAX * G.lp.h; }
  function RX(p) { return G.rp.x + (p - P0) / (P1 - P0) * G.rp.w; }
  function RY(q) { return G.rp.y - q / QMAX * G.rp.h; }

  function arrow(g, x1, y1, x2, y2, col) {
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": 1.3 }, g);
    var a = Math.atan2(y2 - y1, x2 - x1), s = 5.6;
    var d = "M" + x2 + " " + y2 +
      " L" + (x2 - s * Math.cos(a - 0.38)).toFixed(1) + " " + (y2 - s * Math.sin(a - 0.38)).toFixed(1) +
      " L" + (x2 - s * Math.cos(a + 0.38)).toFixed(1) + " " + (y2 - s * Math.sin(a + 0.38)).toFixed(1) + " Z";
    el("path", { d: d, fill: col }, g);
  }

  function panel(g, b, title, fill) {
    el("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 10, fill: fill || "#f8fbfd", stroke: "#dbe7ef" }, g);
    tx(g, b.x + 12, b.y + 24, title, "#5a6472", "start", G.ts, 700);
  }

  function draw() {
    var g = G, gA = $("gxA"), gB = $("gxB"), s = calc(A);
    gA.textContent = ""; gB.textContent = "";
    var ink = "#5a6472", hot = "#b8402f", amber = "#b8791f";

    /* ---------- 左：利润曲线 ---------- */
    panel(gA, g.left, "① 利润曲线  L=(p−10)(100−4p)");
    var lp = g.lp;
    arrow(gA, lp.x - 14, lp.y, lp.x + lp.w + 16, lp.y, ink);
    arrow(gA, lp.x, lp.y + 14, lp.x, lp.y - lp.h - 14, ink);
    tx(gA, lp.x - 4, lp.y + 15, "O", ink, "end", G.ts, 400);
    tx(gA, lp.x + 8, lp.y - lp.h + 14, "L/元", ink, "start", G.ts, 400);
    tx(gA, lp.x, lp.y + 34, "p/元", ink, "start", G.ts, 400);
    [10, 15, 20, 25].forEach(function (p) {
      el("line", { x1: X(p), y1: lp.y, x2: X(p), y2: lp.y + 4, stroke: ink, "stroke-width": 1 }, gA);
      tx(gA, X(p), lp.y + 16, String(p), ink, "middle", G.ts, 400);
    });
    [100, 200].forEach(function (l) {
      el("line", { x1: lp.x - 4, y1: Y(l), x2: lp.x, y2: Y(l), stroke: ink, "stroke-width": 1 }, gA);
      tx(gA, lp.x - 8, Y(l) + 4, String(l), ink, "end", G.ts, 400);
    });
    var x10 = X(P0), x25 = X(P1), vy = Y(225), vx = X(17.5);
    el("path", { d: "M" + x10 + " " + lp.y + " Q" + vx + " " + (2 * vy - lp.y).toFixed(1) + " " + x25 + " " + lp.y,
      fill: "none", stroke: "#2563eb", "stroke-width": 2.2 }, gA);
    el("circle", { cx: vx, cy: vy, r: 3.4, fill: "#fff", stroke: amber, "stroke-width": 1.6 }, gA);
    tx(gA, vx + 8, vy - 10, "顶点 (17.5, 225)", amber, "start", G.ts, 700);

    var px = X(A), py = Y(s.L);
    el("line", { x1: px, y1: py, x2: px, y2: lp.y, stroke: hot, "stroke-width": 1.1, "stroke-dasharray": "4 3" }, gA);
    el("line", { x1: lp.x, y1: py, x2: px, y2: py, stroke: hot, "stroke-width": 1.1, "stroke-dasharray": "4 3" }, gA);
    el("circle", { cx: px, cy: py, r: g.ds + 0.6, fill: hot, stroke: "#fff", "stroke-width": 1.4 }, gA);
    var lx = px + 10, la = "start", ly = py + 18;
    if (px > lp.x + lp.w - 96) { lx = px - 10; la = "end"; }
    if (py > lp.y - 26) ly = py - 14;
    tx(gA, lx, ly, "p=" + A.toFixed(1) + "，L=" + Math.round(s.L), hot, la, G.ts, 700);

    /* ---------- 右：销量直线 ---------- */
    panel(gB, g.right, "② 销量直线  q=100−4p", "#ffffff");
    var rp = g.rp;
    arrow(gB, rp.x - 14, rp.y, rp.x + rp.w + 16, rp.y, ink);
    arrow(gB, rp.x, rp.y + 14, rp.x, rp.y - rp.h - 14, ink);
    tx(gB, rp.x - 4, rp.y + 15, "O", ink, "end", G.ts, 400);
    tx(gB, rp.x + 8, rp.y - rp.h + 14, "q/件", ink, "start", G.ts, 400);
    tx(gB, rp.x + rp.w - 40, rp.y - 8, "p/元", ink, "start", G.ts, 400);
    [10, 15, 20, 25].forEach(function (p) {
      el("line", { x1: RX(p), y1: rp.y, x2: RX(p), y2: rp.y + 4, stroke: ink, "stroke-width": 1 }, gB);
      tx(gB, RX(p), rp.y + 16, String(p), ink, "middle", G.ts, 400);
    });
    [30, 60].forEach(function (q) {
      el("line", { x1: rp.x - 4, y1: RY(q), x2: rp.x, y2: RY(q), stroke: ink, "stroke-width": 1 }, gB);
      tx(gB, rp.x - 8, RY(q) + 4, String(q), ink, "end", G.ts, 400);
    });
    el("line", { x1: RX(P0), y1: RY(60), x2: RX(P1), y2: RY(0), stroke: "#2563eb", "stroke-width": 2.2 }, gB);
    el("line", { x1: RX(P1), y1: RY(0), x2: RX(P1), y2: RY(52), stroke: hot, "stroke-width": 1.2, "stroke-dasharray": "4 3" }, gB);

    var qx = RX(A), qy = RY(s.q);
    el("line", { x1: qx, y1: qy, x2: qx, y2: rp.y, stroke: hot, "stroke-width": 1.1, "stroke-dasharray": "4 3" }, gB);
    el("line", { x1: rp.x, y1: qy, x2: qx, y2: qy, stroke: hot, "stroke-width": 1.1, "stroke-dasharray": "4 3" }, gB);
    el("circle", { cx: qx, cy: qy, r: g.ds + 0.6, fill: amber, stroke: "#fff", "stroke-width": 1.4 }, gB);
    var tx2 = qx + 10, an2 = "start";
    if (qx > rp.x + rp.w - 92) { tx2 = qx - 10; an2 = "end"; }
    tx(gB, tx2, qy - 10, "q=" + Math.round(s.q) + " 件", amber, an2, G.ts, 700);
    tx(gB, rp.x, rp.y + 30, "p≥25 时 q≤0，越界", hot, "start", G.ts, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = String(Math.round(s.q));
    $("gxVc").textContent = String(Math.round(s.L));
    if (A < 17.5 - 1e-9) { st = "涨价还能多赚"; col = "#2563eb"; bg = "#e8f0fe"; sn = "p<17.5，利润还在升"; }
    else if (Math.abs(A - 17.5) < 1e-9) { st = "利润最大 225"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "顶点：p=17.5"; }
    else { st = "涨价反而少赚"; col = "#b8402f"; bg = "#fbeae7"; sn = "p>17.5，已过顶点"; }
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
    loop: [{ t: 0, v: 15 }, { t: 1.2, v: 15 }, { t: 4, v: 17.5 }, { t: 6.5, v: 17.5 }, { t: 9, v: 20 }, { t: 11.5, v: 25 }, { t: 13.5, v: 15 }],
    keys: [15, 17.5, 20, 25],
    value: A, min: 15, max: 25, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 15, eq: { q: 40, L: 200 } },
    { v: 17.5, eq: { q: 30, L: 225 } },
    { v: 20, eq: { q: 20, L: 200 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
