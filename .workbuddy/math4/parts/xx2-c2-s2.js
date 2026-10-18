/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0.5, G = null;

  var XMIN = 0, XMAX = 4.5, YMIN = -20, YMAX = 80;

  /* 纯函数：切点横坐标 → 导数、切线截距 */
  function calc(v) {
    var x = v;
    var d = 3 * x * x + 2;
    var fx = x * x * x + 2 * x;
    return { d: d, b: fx - d * x, fx: fx };
  }

  function geom() {
    L.small = L.left.w < 400;
    var p = L.left, padL = L.small ? 34 : 46, padR = 16, padT = L.small ? 38 : 46, padB = 30;
    var x0 = p.x + padL, x1 = p.x + p.w - padR;
    var y0 = p.y + padT, y1 = p.y + p.h - padB;
    var sx = (x1 - x0) / (XMAX - XMIN), sy = (y1 - y0) / (YMAX - YMIN);
    return {
      x0: x0, y0: y0, x1: x1, y1: y1, sx: sx, sy: sy,
      X: function (v) { return this.x0 + (v - XMIN) * this.sx; },
      Y: function (v) { return this.y1 - (v - YMIN) * this.sy; }
    };
  }

  function fmt(v) {
    var r = Math.round(v * 100) / 100;
    if (r === 0) r = 0;
    return String(r).replace(/\.0+$/, "");
  }

  function drawCurve(g, d) {
    var cur = "", started = false;
    for (var x = 0; x <= XMAX + 0.001; x += 0.04) {
      var y = x * x * x + 2 * x;
      if (y > YMAX) break;
      cur += (started ? " L " : "M ") + G.X(x).toFixed(1) + " " + G.Y(y).toFixed(1);
      started = true;
    }
    el("path", { d: cur, fill: "none", stroke: "#2563eb", "stroke-width": 2.2, "stroke-linecap": "round" }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), small = L.small, fs = small ? 8.4 : 9.4, lf = small ? 9.2 : 10.2;

    /* 左：坐标系 + 曲线 + 切线 */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 16, L.left.y + 24, "y = x³ + 2x 与它在 P 点的切线", "#5a6472", "start", lf, 700);

    el("line", { x1: G.x0, y1: G.Y(0), x2: G.x1, y2: G.Y(0), stroke: "#9fb0bf", "stroke-width": 1.2 }, gA);
    el("line", { x1: G.X(0), y1: G.y1, x2: G.X(0), y2: G.y0, stroke: "#9fb0bf", "stroke-width": 1.2 }, gA);
    el("polygon", { points: (G.x1 + 2) + "," + G.Y(0) + " " + (G.x1 - 7) + "," + (G.Y(0) - 3.5) + " " + (G.x1 - 7) + "," + (G.Y(0) + 3.5), fill: "#9fb0bf" }, gA);
    el("polygon", { points: G.X(0) + "," + (G.y0 - 2) + " " + (G.X(0) - 3.5) + "," + (G.y0 + 7) + " " + (G.X(0) + 3.5) + "," + (G.y0 + 7), fill: "#9fb0bf" }, gA);
    tx(gA, G.x1 - 4, G.Y(0) + 14, "x", "#5a6472", "end", fs, 700);
    tx(gA, G.X(0) - 8, G.y0 + 12, "y", "#5a6472", "end", fs, 700);

    for (var i = 1; i <= 4; i++) {
      el("line", { x1: G.X(i), y1: G.Y(0), x2: G.X(i), y2: G.Y(0) + 4, stroke: "#9fb0bf", "stroke-width": 1 }, gA);
      tx(gA, G.X(i), G.Y(0) + 14, String(i), "#7a8492", "middle", fs, 400);
    }
    for (var j = 20; j <= 60; j += 20) {
      el("line", { x1: G.X(0) - 4, y1: G.Y(j), x2: G.X(0), y2: G.Y(j), stroke: "#9fb0bf", "stroke-width": 1 }, gA);
      tx(gA, G.X(0) - 6, G.Y(j) + 3, String(j), "#7a8492", "end", fs, 400);
    }

    drawCurve(gA, s);

    /* 切线：先解出它在视野内的两端 */
    var d = s.d, b = s.b;
    var xa = Math.max(XMIN, (YMIN - b) / d), xb = Math.min(XMAX, (YMAX - b) / d);
    if (xb > xa) {
      el("line", { x1: G.X(xa), y1: G.Y(d * xa + b), x2: G.X(xb), y2: G.Y(d * xb + b), stroke: "#b8791f", "stroke-width": 2 }, gA);
    }

    var px = G.X(A), py = G.Y(s.fx);
    el("line", { x1: px, y1: py, x2: px, y2: G.Y(0), stroke: "#c2ccd6", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: px, cy: py, r: 5, fill: "#b8402f", stroke: "#ffffff", "stroke-width": 1.6 }, gA);
    var lab = "P(" + fmt(A) + ", " + fmt(s.fx) + ")";
    var right = px > (L.left.x + L.left.w - 108);
    tx(gA, px + (right ? -9 : 9), py + (right ? -9 : -9), lab, "#b8402f", right ? "end" : "start", lf, 700);
    tx(gA, G.x1 - 6, G.y1 - 6, "斜率 k = " + fmt(d) + "，截距 b = " + fmt(b), "#b8791f", "end", fs, 400);

    /* 右：读数与方程 */
    var q = L.right, rx = q.x + 16, ry = q.y + 24;
    el("rect", { x: q.x, y: q.y, width: q.w, height: q.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rx, ry, "读数与切线方程", "#5a6472", "start", lf, 700);

    var y = q.y + (small ? 54 : 58);
    tx(gB, rx, y, "f(x) = x³ + 2x", "#151a21", "start", small ? 10 : 11, 400);
    y += small ? 24 : 26;
    tx(gB, rx, y, "f′(x) = 3x² + 2   （切线斜率）", "#151a21", "start", small ? 10 : 11, 400);

    y += small ? 34 : 40;
    tx(gB, rx, y, "切点 P", "#7a8492", "start", fs, 400);
    tx(gB, rx + 46, y, "(" + fmt(A) + ", " + fmt(s.fx) + ")", "#b8402f", "start", small ? 13 : 15, 700);

    y += small ? 30 : 34;
    tx(gB, rx, y, "斜率 k = f′(" + fmt(A) + ")", "#7a8492", "start", fs, 400);
    tx(gB, rx + (small ? 108 : 120), y, "= " + fmt(d), "#2563eb", "start", small ? 13 : 15, 700);

    y += small ? 30 : 34;
    tx(gB, rx, y, "截距 b = f(x) − f′(x)·x", "#7a8492", "start", fs, 400);
    tx(gB, rx + (small ? 128 : 142), y, "= " + fmt(b), "#2563eb", "start", small ? 13 : 15, 700);

    y += small ? 40 : 48;
    el("rect", { x: q.x + 12, y: y - 22, width: q.w - 24, height: 34, rx: 8, fill: "#fdf7ec", stroke: "#f0dfbf" }, gB);
    tx(gB, rx, y, "切线 y = " + fmt(d) + "x " + (b >= 0 ? "+ " : "− ") + fmt(Math.abs(b)), "#b8791f", "start", small ? 11 : 12.5, 700);

    y += small ? 40 : 46;
    tx(gB, rx, y, "切点在曲线上，斜率由导数值给出", "#7a8492", "start", fs, 400);
    y += small ? 18 : 20;
    tx(gB, rx, y, "曲线与切线只在这一处相切", "#7a8492", "start", fs, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;

    $("gxVa").textContent = fmt(A);
    $("gxVb").textContent = fmt(s.d);
    $("gxVc").textContent = fmt(s.b);

    if (s.d > 10) { st = "曲线上升"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "切线很陡，k ≥ 10"; }
    else if (s.d > 0) { st = "曲线上升"; col = "#b8791f"; bg = "#fdf3e0"; sn = "切线较平缓，k 小"; }
    else { st = "切线水平"; col = "#2563eb"; bg = "#e8eefc"; sn = "k = 0，导数为零"; }
    if (Math.abs(A - 2) < 0.125) { st = "曲线上升"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "停留帧：k = 14"; }

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
    loop: [{ t: 0, v: 0.5 }, { t: 1.2, v: 0.5 }, { t: 4, v: 2 }, { t: 6.5, v: 2 }, { t: 9, v: 4 }, { t: 11.5, v: 3 }, { t: 13.5, v: 0.5 }],
    keys: [0.5, 2, 3, 4],
    value: A, min: 0.5, max: 4, step: 0.25,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { d: 5, b: -2, fx: 3 } },
    { v: 2, eq: { d: 14, b: -16, fx: 12 } },
    { v: 3, eq: { d: 29, b: -54, fx: 33 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
