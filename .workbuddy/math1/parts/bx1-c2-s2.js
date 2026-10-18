/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;
  /* 两套坐标：宽屏 880×470，窄屏独立 360×700（重排，不是缩图） */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 },
    seg: { x0: 56, y: 140, px: 34 }, rect: { x: 70, y: 400, px: 13 },
    g: { ox: 520, oy: 404, px: 32, py: 5.6, ax: 846, ay: 84 }, fs: { t: 10.5, l: 9.6, s: 9 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 },
    seg: { x0: 34, y: 120, px: 27 }, rect: { x: 44, y: 256, px: 9 },
    g: { ox: 58, oy: 660, px: 28, py: 12, ax: 346, ay: 344 }, fs: { t: 9.6, l: 9, s: 8.4 } };
  var L = W, G = null, A = 1;

  /* 纯函数：a → 其余三个量。render() 与 __model.cases 共用 */
  function calc(v) { var b = 10 - v, prod = v * b; return { a: v, b: b, prod: prod, gap: 25 - prod }; }

  function pts(C) {
    var out = [], g = C.g, a;
    for (a = 0; a < 10.001; a += 0.25) out.push((g.ox + a * g.px).toFixed(1) + "," + (g.oy - a * (10 - a) * g.py).toFixed(1));
    return out.join(" ");
  }

  function draw() {
    var C = G, gA = $("gxA"), gB = $("gxB"), s = calc(A), g = C.g, sp = C.seg, r = C.rect, i, x;
    var peakY = g.oy - 25 * g.py, px = g.ox + s.a * g.px, py = g.oy - s.prod * g.py, right = s.a > 6.5;
    var xa = sp.x0 + s.a * sp.px, xe = sp.x0 + 10 * sp.px, w = s.a * r.px, h = s.b * r.px;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: C.left.x, y: C.left.y, width: C.left.w, height: C.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, C.left.x + 20, C.left.y + 30, "矩形：长 a、宽 b，a + b = 10", "#5a6472", "start", C.fs.t, 700);
    tx(gA, C.left.x + 20, C.left.y + 52, "周长固定为 20，面积就是积 ab", "#8a94a3", "start", C.fs.s, 400);
    el("line", { x1: sp.x0, y1: sp.y, x2: xe, y2: sp.y, stroke: "#c9d4e0", "stroke-width": 8, "stroke-linecap": "round" }, gA);
    el("line", { x1: sp.x0, y1: sp.y, x2: xa, y2: sp.y, stroke: "#2563eb", "stroke-width": 8, "stroke-linecap": "round" }, gA);
    el("line", { x1: xa, y1: sp.y - 14, x2: xa, y2: sp.y + 14, stroke: "#151a21", "stroke-width": 1.4 }, gA);
    tx(gA, (sp.x0 + xa) / 2, sp.y - 8, "a = " + s.a.toFixed(1), "#2563eb", "middle", C.fs.l, 700);
    tx(gA, (xa + xe) / 2, sp.y + 20, "b = " + s.b.toFixed(1), "#b8791f", "middle", C.fs.l, 700);
    el("rect", { x: r.x, y: r.y - h, width: w, height: h, fill: "#eaf2ff", stroke: "#2563eb", "stroke-width": 1.4 }, gA);
    tx(gA, r.x, r.y + 22, "面积 ab = " + s.prod.toFixed(2), "#2563eb", "start", C.fs.l, 700);
    tx(gA, r.x, r.y + 40, "与最大值 25 相差 " + s.gap.toFixed(2), "#8a94a3", "start", C.fs.s, 400);

    el("rect", { x: C.right.x, y: C.right.y, width: C.right.w, height: C.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, C.right.x + 20, C.right.y + 30, "积 ab 随 a 的变化", "#5a6472", "start", C.fs.t, 700);
    el("line", { x1: g.ox, y1: g.oy, x2: g.ax, y2: g.oy, stroke: "#5a6472", "stroke-width": 1.3 }, gB);
    el("polygon", { points: (g.ax - 9) + "," + (g.oy - 4) + " " + (g.ax + 1) + "," + g.oy + " " + (g.ax - 9) + "," + (g.oy + 4), fill: "#5a6472" }, gB);
    el("line", { x1: g.ox, y1: g.oy + 16, x2: g.ox, y2: g.ay, stroke: "#5a6472", "stroke-width": 1.3 }, gB);
    el("polygon", { points: (g.ox - 4) + "," + (g.ay + 9) + " " + g.ox + "," + (g.ay - 1) + " " + (g.ox + 4) + "," + (g.ay + 9), fill: "#5a6472" }, gB);
    var ticks = [2, 5, 8];
    for (i = 0; i < ticks.length; i++) {
      x = g.ox + ticks[i] * g.px;
      el("line", { x1: x, y1: g.oy - 5, x2: x, y2: g.oy + 5, stroke: "#5a6472", "stroke-width": 1.2 }, gB);
      tx(gB, x, g.oy + 18, String(ticks[i]), "#3a3a35", "middle", C.fs.s, 400);
    }
    el("line", { x1: g.ox - 5, y1: peakY, x2: g.ox + 5, y2: peakY, stroke: "#5a6472", "stroke-width": 1.2 }, gB);
    tx(gB, g.ox - 8, peakY + 4, "25", "#b8402f", "end", C.fs.s, 400);
    el("line", { x1: g.ox + 5 * g.px, y1: peakY, x2: g.ox + 5 * g.px, y2: g.oy, stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gB);
    el("line", { x1: g.ox, y1: peakY, x2: g.ox + 5 * g.px, y2: peakY, stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gB);
    el("polyline", { points: pts(C), fill: "none", stroke: "#2563eb", "stroke-width": 2 }, gB);
    if (s.gap > 0.001) {
      el("line", { x1: px, y1: py, x2: px, y2: peakY, stroke: "#b8402f", "stroke-width": 1.4, "stroke-dasharray": "3 3" }, gB);
      tx(gB, px + (right ? -8 : 8), (py + peakY) / 2 + 3, "差 " + s.gap.toFixed(2), "#b8402f", right ? "end" : "start", C.fs.s, 700);
    }
    el("circle", { cx: px, cy: py, r: 5, fill: "#b8402f", stroke: "#ffffff", "stroke-width": 1.5 }, gB);
    tx(gB, px + (right ? -10 : 10), py - 8, "ab = " + s.prod.toFixed(2), "#151a21", right ? "end" : "start", C.fs.l, 700);
    tx(gB, g.ox + 10, g.ay + 22, "a = b = 5 时 ab 取到最大 25", "#b8791f", "start", C.fs.s, 700);
    tx(gB, g.ax - 6, g.oy + 22, "a", "#5a6472", "end", C.fs.s, 400);
    tx(gB, g.ox + 8, g.ay + 8, "ab", "#5a6472", "start", C.fs.s, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = s.a.toFixed(1);
    $("gxVb").textContent = s.b.toFixed(1);
    $("gxVc").textContent = s.prod.toFixed(2);
    if (Math.abs(s.gap) < 0.001) { st = "等号成立"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "a = b，积取到最大 25"; }
    else { st = "没取到最大值"; col = "#b8791f"; bg = "#fdf3e0"; sn = "差 25 − ab = " + s.gap.toFixed(2); }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function geom() { return L; }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = null;
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
    mount: stage, follow: $("gxSl"),
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 5 }, { t: 6.5, v: 5 }, { t: 9, v: 9 }, { t: 11.5, v: 1 }, { t: 13.5, v: 1 }],
    keys: [1, 3, 5, 9], value: A, min: 0.5, max: 9.5, step: 0.5, idle: 5000,
    onChange: function (v) { A = v; render(); }, onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { b: 9, prod: 9 } }, { v: 5, eq: { b: 5, prod: 25 } }, { v: 9, eq: { b: 1, prod: 9 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
