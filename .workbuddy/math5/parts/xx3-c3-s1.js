/* 8.1 成对数据的统计相关性 · 互动脚本（build-page.mjs 会包进 <script>） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = -1, G = null, S = 2.25;

  /* 固定伪随机序列：24 组 x 与 noise（硬编码，不用 Math.random） */
  var XS = [-0.95, -0.82, -0.71, -0.63, -0.55, -0.47, -0.38, -0.30, -0.22, -0.14, -0.06, 0.02,
            0.10, 0.18, 0.26, 0.34, 0.43, 0.51, 0.59, 0.67, 0.75, 0.84, 0.91, 0.97];
  var NS = [0.62, -0.87, 0.34, 1.02, -0.41, 0.05, -0.93, 0.78, -0.26, 0.51, 1.14, -0.62,
            0.19, -0.84, 0.43, -0.31, 0.88, -0.55, 0.12, 1.06, -0.73, 0.29, -1.08, 0.66];

  function stat(a) {
    var i, m = 0, s = 0;
    for (i = 0; i < a.length; i++) m += a[i];
    m /= a.length;
    for (i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return { m: m, s: Math.sqrt(s / a.length) };
  }

  /* 把 noise 里与 x 同向的成分剥掉、再把长度调到与 x 相同：
     于是 y = r·x + √(1−r²)·noise 的样本相关系数恰好等于 r */
  var stX = stat(XS), stN = stat(NS), XC = [], NB = [], i0, n0 = 0, d0 = 0, k0, s2 = 0;
  for (i0 = 0; i0 < XS.length; i0++) { XC.push(XS[i0] - stX.m); NB.push(NS[i0] - stN.m); }
  for (i0 = 0; i0 < XC.length; i0++) { n0 += XC[i0] * NB[i0]; d0 += XC[i0] * XC[i0]; }
  for (i0 = 0; i0 < NB.length; i0++) { NB[i0] -= (n0 / d0) * XC[i0]; s2 += NB[i0] * NB[i0]; }
  k0 = Math.sqrt(d0 / s2);
  for (i0 = 0; i0 < NB.length; i0++) NB[i0] *= k0;

  /* 纯函数：r → 数值 */
  function calc(v) {
    var r2 = v * v;
    return { r: v, r2: r2, dir: v > 0.05 ? 1 : v < -0.05 ? -1 : 0 };
  }

  function fmt(v) { return (Math.round(v * 10) / 10).toFixed(1).replace("-", "−"); }

  function pts(v) {
    var q = Math.sqrt(Math.max(0, 1 - v * v)), out = [], i, y;
    for (i = 0; i < XC.length; i++) {
      y = v * XC[i] + q * NB[i];
      if (y > 2.2) y = 2.2; if (y < -2.2) y = -2.2;
      out.push([XC[i] / stX.s, y / stX.s]);
    }
    return out;
  }

  function geom() {
    var wide = (L === W), l = L.left, r = L.right, pad = wide ? 50 : 42, c = wide ? 15 : 12;
    return {
      px: l.x + pad, py: l.y + 56, pw: l.w - pad - 24, ph: l.h - 56 - 46,
      gx: r.x + (wide ? 26 : 20), gy: r.y + 58, cell: c
    };
  }

  function X(u) { return G.px + (u + S) / (2 * S) * G.pw; }
  function Y(v) { return G.py + G.ph - (v + S) / (2 * S) * G.ph; }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), wide = (L === W), i;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, L.left.x + 18, L.left.y + 30, "24 组成对数据 (xᵢ, yᵢ) 的散点图", "#5a6472", "start", 10.5, 700);
    tx(gB, L.right.x + 18, L.right.y + 30, "r² = 决定系数（解释比例）", "#5a6472", "start", 10.5, 700);

    el("rect", { x: G.px, y: G.py, width: G.pw, height: G.ph, rx: 6, fill: "#fbfdfe", stroke: "#eef2f6" }, gA);
    var x0 = X(0), y0 = Y(0);
    el("line", { x1: G.px, y1: y0, x2: G.px + G.pw, y2: y0, stroke: "#c3ccd6", "stroke-width": 1.1 }, gA);
    el("line", { x1: x0, y1: G.py, x2: x0, y2: G.py + G.ph, stroke: "#c3ccd6", "stroke-width": 1.1 }, gA);
    el("polygon", { points: (G.px + G.pw) + "," + y0 + " " + (G.px + G.pw - 8) + "," + (y0 - 4) + " " + (G.px + G.pw - 8) + "," + (y0 + 4), fill: "#c3ccd6" }, gA);
    el("polygon", { points: x0 + "," + G.py + " " + (x0 - 4) + "," + (G.py + 8) + " " + (x0 + 4) + "," + (G.py + 8), fill: "#c3ccd6" }, gA);
    for (i = -1; i <= 1; i++) {
      el("line", { x1: X(i), y1: y0 - 3, x2: X(i), y2: y0 + 3, stroke: "#c3ccd6" }, gA);
      el("line", { x1: x0 - 3, y1: Y(i), x2: x0 + 3, y2: Y(i), stroke: "#c3ccd6" }, gA);
      tx(gA, X(i), y0 + 15, String(i).replace("-", "−"), "#9aa6b2", "middle", 8.2, 400);
    }
    tx(gA, G.px + G.pw - 2, y0 - 8, "x", "#9aa6b2", "end", 9, 700);
    tx(gA, x0 + 8, G.py + 12, "y", "#9aa6b2", "start", 9, 700);

    /* 点的整体走向线 y = r·x：r=±1 时退化成一条直线 */
    el("line", { x1: X(-1.28), y1: Y(-1.28 * A), x2: X(1.28), y2: Y(1.28 * A), stroke: "#2563eb", "stroke-width": 1.3, "stroke-dasharray": "6 5", opacity: 0.45 }, gA);

    var P = pts(A), col = s.dir === 1 ? "#2f8a5b" : s.dir === -1 ? "#2563eb" : "#b8791f";
    for (i = 0; i < P.length; i++) {
      el("circle", { cx: X(P[i][0]), cy: Y(P[i][1]), r: 3, fill: col, opacity: 0.85 }, gA);
    }

    /* 右侧：r² 的 10×10 方格 */
    var n = Math.round(s.r2 * 100), c = G.cell, k = 0;
    for (var row = 0; row < 10; row++) {
      for (var cc = 0; cc < 10; cc++) {
        el("rect", {
          x: G.gx + cc * c, y: G.gy + row * c, width: c - 1.6, height: c - 1.6, rx: 2,
          fill: k < n ? "#2563eb" : "#eef2f6", opacity: k < n ? 0.78 : 1
        }, gB);
        k++;
      }
    }
    var tx0 = wide ? G.gx + 10 * c + 24 : L.right.x + 20;
    var ty0 = wide ? G.gy + 20 : G.gy + 10 * c + 28;
    tx(gB, tx0, ty0, "r = " + fmt(A), "#3a3a35", "start", 11.5, 700);
    tx(gB, tx0, ty0 + 22, "r² = " + s.r2.toFixed(2), "#2563eb", "start", 11.5, 700);
    tx(gB, tx0, ty0 + 42, "已是 " + n + "% 被线性解释", "#5a6472", "start", 9.4, 400);
    tx(gB, tx0, ty0 + 60, "方向：" + (s.dir === 1 ? "正相关" : s.dir === -1 ? "负相关" : "看不出线性关系"), col, "start", 9.4, 700);
    tx(gB, tx0, ty0 + 78, "r 无单位，−1 ≤ r ≤ 1", "#8b98a5", "start", 8.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn, ar = Math.abs(A), w;
    $("gxVa").textContent = fmt(A);
    $("gxVb").textContent = s.r2.toFixed(2);
    $("gxVc").textContent = s.dir === 1 ? "↗ 正相关" : s.dir === -1 ? "↘ 负相关" : "— 无线性";
    w = ar >= 0.75 ? "强" : ar >= 0.4 ? "中等" : "弱";
    if (s.dir === 1) { st = w + "正相关"; col = ar >= 0.75 ? "#2f8a5b" : "#b8791f"; bg = ar >= 0.75 ? "#e6f6ee" : "#fdf3e0"; sn = ar >= 0.75 ? "点云收得很紧" : "点云成带状"; }
    else if (s.dir === -1) { st = w + "负相关"; col = ar >= 0.75 ? "#2563eb" : "#b8791f"; bg = ar >= 0.75 ? "#e6f0fd" : "#fdf3e0"; sn = ar >= 0.75 ? "点云收得很紧" : "点云成带状"; }
    else { st = "看不出线性关系"; col = "#b8791f"; bg = "#fdf3e0"; sn = "没有线性趋势"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    G = geom();
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
    loop: [{ t: 0, v: -1 }, { t: 1.2, v: -1 }, { t: 4, v: 0.8 }, { t: 6.5, v: 0.8 }, { t: 9, v: 0 }, { t: 11.5, v: 0.5 }, { t: 13.5, v: -1 }],
    keys: [-1, 0, 0.8, 1],
    value: A, min: -1, max: 1, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0.8, eq: { r2: 0.64, dir: 1 } },
    { v: 0, eq: { r2: 0, dir: 0 } },
    { v: -0.9, eq: { r2: 0.81, dir: -1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
