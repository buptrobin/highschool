/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 0.5;

  var PI = Math.PI, TAU = 2 * PI;
  var AMP = 2;            /* A = 2 固定 */
  var X_MAX = 3 * TAU;    /* 横轴画 0 → 6π，保证 ω≥0.5 时能看到两个相邻波峰 */

  /* 纯函数：参数 → 数值。render() 和 __model.cases 都用它 */
  function calc(w) {
    var T = 2 * PI / w;
    return { T: T, f: 1 / T, max: AMP, min: -AMP };
  }

  /* 由布局 L 推出几何参数（首帧兜底时会从这里重建） */
  function geom() {
    var p = L.left;
    var x0 = p.x + 28, x1 = p.x + p.w - 22;
    var ay = p.y + p.h * 0.56;
    var amp = Math.min(p.h * 0.20, 92);
    var span = x1 - x0;
    return {
      x0: x0, x1: x1, ay: ay, amp: amp,
      X: function (t) { return x0 + t * span / X_MAX; }
    };
  }

  function curve(g, w) {
    var d = "", n = 170, i, t, y;
    for (i = 0; i <= n; i++) {
      t = X_MAX * i / n;
      y = g.ay - g.amp * Math.sin(w * t);
      d += (i ? "L" : "M") + g.X(t).toFixed(1) + " " + y.toFixed(1);
    }
    return d;
  }

  function arrowH(parent, x1, x2, y, col) {
    el("path", { d: "M" + x1 + " " + y + " L" + x2 + " " + y, stroke: col, "stroke-width": 1.1, fill: "none" }, parent);
    var dir = x2 > x1 ? 1 : -1;
    el("path", { d: "M" + x2 + " " + y + " L" + (x2 - 6 * dir) + " " + (y - 3.6) + " L" + (x2 - 6 * dir) + " " + (y + 3.6) + " Z", fill: col }, parent);
  }

  function draw() {
    if (!G) return;
    var g = G, s = calc(A);
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var p = L.left, pn = L.right;

    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, p.x + 20, p.y + 26, "y = 2sin(ωx)：ω 只动疏密，不动高度", "#5a6472", "start", 10.5, 700);
    tx(gA, p.x + 20, p.y + 44, "灰虚线 = y=2sinx（ω=1，T=2π）", "#9aa4b2", "start", 8.6, 400);
    tx(gA, p.x + 20, p.y + 58, "蓝实线 = y=2sin(ωx)，A=2 不变", "#2563eb", "start", 8.6, 400);

    /* 坐标轴 */
    el("path", { d: "M" + g.x0 + " " + g.ay + " L" + (g.x1 + 12) + " " + g.ay, stroke: "#8a94a2", "stroke-width": 1.1, fill: "none" }, gA);
    el("path", { d: "M" + (g.x1 + 12) + " " + g.ay + " L" + (g.x1 + 5) + " " + (g.ay - 3.6) + " L" + (g.x1 + 5) + " " + (g.ay + 3.6) + " Z", fill: "#8a94a2" }, gA);
    var yt = g.ay - g.amp - 26, yb = g.ay + g.amp + 20;
    el("path", { d: "M" + g.x0 + " " + yb + " L" + g.x0 + " " + yt, stroke: "#8a94a2", "stroke-width": 1.1, fill: "none" }, gA);
    el("path", { d: "M" + g.x0 + " " + yt + " L" + (g.x0 - 3.6) + " " + (yt + 7) + " L" + (g.x0 + 3.6) + " " + (yt + 7) + " Z", fill: "#8a94a2" }, gA);
    tx(gA, g.x0 - 10, g.ay - g.amp + 4, "2", "#5a6472", "end", 8.6, 400);
    tx(gA, g.x0 - 10, g.ay + g.amp + 4, "−2", "#5a6472", "end", 8.6, 400);

    /* x 轴刻度 */
    var k, xt, lab, anc;
    for (k = 0; k <= 3; k++) {
      xt = g.X(k * TAU);
      el("path", { d: "M" + xt + " " + (g.ay - 4) + " L" + xt + " " + (g.ay + 4), stroke: "#8a94a2", "stroke-width": 1 }, gA);
      lab = k === 0 ? "0" : (k === 1 ? "2π" : (k === 2 ? "4π" : "6π"));
      anc = k === 0 ? "start" : (k === 3 ? "end" : "middle");
      tx(gA, xt, g.ay + 16, lab, "#5a6472", anc, 8.8, 400);
    }

    /* 两条曲线 */
    el("path", { d: curve(g, 1), stroke: "#9aa4b2", "stroke-width": 1.2, "stroke-dasharray": "4 3", fill: "none" }, gA);
    el("path", { d: curve(g, A), stroke: "#2563eb", "stroke-width": 2, fill: "none" }, gA);

    /* 两个相邻波峰 + 周期括号 */
    var p1 = PI / (2 * A), p2 = p1 + TAU / A;
    var q1 = g.X(p1), q2 = g.X(p2), top = g.ay - g.amp;
    el("path", { d: "M" + q1 + " " + top + " L" + q1 + " " + g.ay, stroke: "#b8791f", "stroke-width": 0.9, "stroke-dasharray": "3 3", fill: "none" }, gA);
    el("path", { d: "M" + q2 + " " + top + " L" + q2 + " " + g.ay, stroke: "#b8791f", "stroke-width": 0.9, "stroke-dasharray": "3 3", fill: "none" }, gA);
    el("circle", { cx: q1, cy: top, r: 3.2, fill: "#b8791f" }, gA);
    el("circle", { cx: q2, cy: top, r: 3.2, fill: "#b8791f" }, gA);
    var by = g.ay + g.amp + 44;
    arrowH(gA, q1, q2, by, "#b8791f");
    var mid = (q1 + q2) / 2;
    mid = Math.max(q1 + 34, Math.min(mid, g.x1 - 34));
    tx(gA, mid, by - 7, "T = " + s.T.toFixed(3), "#b8791f", "middle", 9, 700);

    /* 右面板：数值 */
    el("rect", { x: pn.x, y: pn.y, width: pn.w, height: pn.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, pn.x + 20, pn.y + pn.h * 0.06, "读数：ω 只动周期和频率", "#5a6472", "start", 10.5, 700);
    tx(gB, pn.x + 20, pn.y + pn.h * 0.16, "ω", "#151a21", "start", 11, 700);
    tx(gB, pn.x + 44, pn.y + pn.h * 0.16, A.toFixed(1), "#2563eb", "start", 20, 700);
    tx(gB, pn.x + 20, pn.y + pn.h * 0.26, "T = 2π/ω = " + s.T.toFixed(4), "#151a21", "start", 12, 700);
    tx(gB, pn.x + 20, pn.y + pn.h * 0.33, "f = 1/T = ω/(2π) = " + s.f.toFixed(4), "#151a21", "start", 12, 700);
    tx(gB, pn.x + 20, pn.y + pn.h * 0.40, "最大值 = A = 2（不随 ω 变）", "#2f8a5b", "start", 11, 700);
    tx(gB, pn.x + 20, pn.y + pn.h * 0.46, "最小值 = −A = −2", "#2f8a5b", "start", 11, 700);

    /* T 的长度尺：0 → 4π */
    var bx0 = pn.x + 30, bx1 = pn.x + pn.w - 40, bw = bx1 - bx0;
    var base = pn.y + pn.h * 0.62;
    tx(gB, bx0, base - 32, "T 的长度（同一条尺，满格 4π）", "#5a6472", "start", 9, 400);
    tx(gB, bx0, base - 14, "T = " + s.T.toFixed(3), "#b8791f", "start", 10, 700);
    el("path", { d: "M" + bx0 + " " + base + " L" + bx1 + " " + base, stroke: "#c3ccd6", "stroke-width": 1 }, gB);
    var bl = Math.min(bw, s.T / (2 * TAU) * bw);
    el("rect", { x: bx0, y: base - 20, width: bl, height: 20, rx: 4, fill: "#fdf3e0", stroke: "#b8791f" }, gB);
    el("path", { d: "M" + (bx0 + bw / 2) + " " + (base - 26) + " L" + (bx0 + bw / 2) + " " + (base + 6), stroke: "#2563eb", "stroke-width": 1.1, "stroke-dasharray": "3 3", fill: "none" }, gB);
    var tk, tv, tl;
    for (k = 0; k <= 4; k++) {
      tv = k * PI; tk = bx0 + (tv / (2 * TAU)) * bw;
      el("path", { d: "M" + tk + " " + base + " L" + tk + " " + (base + 5), stroke: "#8a94a2", "stroke-width": 1 }, gB);
      tl = k === 0 ? "0" : (k === 1 ? "π" : (k === 2 ? "2π" : (k === 3 ? "3π" : "4π")));
      tx(gB, tk, base + 17, tl, "#8a94a2", k === 0 ? "start" : (k === 4 ? "end" : "middle"), 8.4, 400);
    }
    tx(gB, bx0 + bw / 2, base + 30, "蓝虚线 = 2π，即 ω=1 的位置", "#2563eb", "middle", 8.6, 400);

    /* 状态块 */
    var sy = pn.y + pn.h * 0.74, sh = pn.h * 0.18;
    var st, col, bg, sn;
    if (A > 1.001) { st = "周期变短，图象被压扁"; col = "#b8791f"; bg = "#fdf3e0"; sn = "ω>1 ⇒ T=2π/ω<2π，横方向压缩"; }
    else if (A < 0.999) { st = "周期变长，图象被拉宽"; col = "#2563eb"; bg = "#eaf1fd"; sn = "0<ω<1 ⇒ T=2π/ω>2π，横方向拉伸"; }
    else { st = "T = 2π，最朴素的一条"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "ω=1 ⇒ 就是 y=2sinx"; }
    el("rect", { x: pn.x + 18, y: sy, width: pn.w - 36, height: sh, rx: 8, fill: bg, stroke: col + "55" }, gB);
    tx(gB, pn.x + 30, sy + sh * 0.42, st, col, "start", 12, 700);
    tx(gB, pn.x + 30, sy + sh * 0.76, sn, col, "start", 8.8, 400);
    tx(gB, pn.x + 20, pn.y + pn.h * 0.965, "端点：ω=0.5 时 T=4π，ω=4 时 T=π/2；最大值恒为 2。", "#5a6472", "start", 8.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = s.T.toFixed(3);
    $("gxVc").textContent = s.f.toFixed(3);
    if (A > 1.001) { st = "压扁"; col = "#b8791f"; bg = "#fdf3e0"; sn = "ω>1：T 变短"; }
    else if (A < 0.999) { st = "拉宽"; col = "#2563eb"; bg = "#eaf1fd"; sn = "0<ω<1：T 变长"; }
    else { st = "T=2π"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "ω=1：最朴素"; }
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
    loop: [{ t: 0, v: 0.5 }, { t: 1.2, v: 0.5 }, { t: 4, v: 1 }, { t: 6.5, v: 1 }, { t: 9, v: 2 }, { t: 11.5, v: 4 }, { t: 13.5, v: 0.5 }],
    keys: [0.5, 1, 2, 4],
    value: A, min: 0.5, max: 4, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { T: 6.2832, f: 0.1592 } },
    { v: 2, eq: { T: 3.1416, f: 0.3183 } },
    { v: 0.5, eq: { T: 12.566, f: 0.0796 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
