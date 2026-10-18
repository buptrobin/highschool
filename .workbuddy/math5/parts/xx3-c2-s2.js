/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，禁止写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 330 }, right: { x: 8, y: 348, w: 344, h: 344 } };
  var L = W, G = null, A = 0.1;

  /* 纯函数：成功概率 p → 两点分布的分布列。render 与 __model.cases 共用 */
  function calc(v) {
    var p = Math.round(v * 100) / 100;
    var p0 = 1 - p, p1 = p;
    return { p: p, p0: p0, p1: p1, sum: p0 + p1, cdf0: p0 };
  }

  /* 几何：表格 / 柱子 / 右栏的分层坐标 */
  function geom() {
    var nar = L === N, l = L.left, g = {};
    g.nar = nar;
    g.labelW = nar ? 62 : 72;
    g.tw = Math.min(l.w - 28, nar ? 300 : 340);
    g.tx = l.x + (l.w - g.tw) / 2;
    g.dataW = (g.tw - g.labelW) / 2;
    g.rowY = l.y + (nar ? 54 : 72);
    g.rowH = nar ? 46 : 52;
    g.c0 = g.tx + g.labelW + g.dataW / 2;
    g.c1 = g.tx + g.labelW + g.dataW * 1.5;
    g.base = l.y + l.h - (nar ? 26 : 62);
    g.maxH = Math.min(nar ? 104 : 132, g.base - (g.rowY + 2 * g.rowH) - 30);
    g.bw = nar ? 74 : 90;
    g.rx = L.right.x + 18;
    g.rw = L.right.w - 36;
    g.barY = L.right.y + (nar ? 46 : 52);
    g.barH = nar ? 30 : 36;
    g.lineY = g.barY + g.barH + (nar ? 50 : 58);
    g.step = nar ? 24 : 26;
    return g;
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), g = G, p0 = s.p0, p1 = s.p1, f = function (v) { return v.toFixed(2); };

    /* 左：分布列两行表格 + 对齐的柱形 */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 30, "X ~ 两点分布：上行取值，下行概率", "#5a6472", "start", 10.5, 700);
    el("rect", { x: g.tx, y: g.rowY, width: g.tw, height: 2 * g.rowH, rx: 6, fill: "#ffffff", stroke: "#c9d6e2" }, gA);
    el("path", { d: "M" + (g.tx + g.labelW) + " " + g.rowY + " V " + (g.rowY + 2 * g.rowH) +
      " M" + (g.tx + g.labelW + g.dataW) + " " + g.rowY + " V " + (g.rowY + 2 * g.rowH) +
      " M" + g.tx + " " + (g.rowY + g.rowH) + " H " + (g.tx + g.tw), stroke: "#dbe7ef", fill: "none" }, gA);
    tx(gA, g.tx + g.labelW / 2, g.rowY + g.rowH / 2 + 5, "X", "#151a21", "middle", 12.5, 700);
    tx(gA, g.c0, g.rowY + g.rowH / 2 + 5, "0", "#3a3a35", "middle", 12, 400);
    tx(gA, g.c1, g.rowY + g.rowH / 2 + 5, "1", "#3a3a35", "middle", 12, 400);
    tx(gA, g.tx + g.labelW / 2, g.rowY + g.rowH * 1.5 + 5, "P", "#151a21", "middle", 12.5, 700);
    tx(gA, g.c0, g.rowY + g.rowH * 1.5 + 5, f(p0), "#2f8a5b", "middle", 12, 700);
    tx(gA, g.c1, g.rowY + g.rowH * 1.5 + 5, f(p1), "#2f8a5b", "middle", 12, 700);

    el("path", { d: "M" + (g.tx - 10) + " " + g.base + " H " + (g.tx + g.tw + 4), stroke: "#8f9aa8", "stroke-width": 1.4, fill: "none" }, gA);
    el("polygon", { points: (g.tx + g.tw + 4) + "," + (g.base - 4) + " " + (g.tx + g.tw + 14) + "," + g.base + " " + (g.tx + g.tw + 4) + "," + (g.base + 4) }, gA).setAttribute("fill", "#8f9aa8");
    var hs = [{ c: g.c0, v: p0, k: "0" }, { c: g.c1, v: p1, k: "1" }];
    for (var i = 0; i < hs.length; i++) {
      var h = Math.max(2, g.maxH * hs[i].v);
      el("rect", { x: hs[i].c - g.bw / 2, y: g.base - h, width: g.bw, height: h, rx: 3, fill: "#2563eb", "fill-opacity": 0.85 }, gA);
      tx(gA, hs[i].c, g.base - h - 9, hs[i].v.toFixed(2), "#2563eb", "middle", 10, 700);
      tx(gA, hs[i].c, g.base + 18, "X = " + hs[i].k, "#5a6472", "middle", 10, 400);
    }
    tx(gA, g.tx, g.rowY - 12, "分布列（两行表格）", "#8f9aa8", "start", 9.4, 400);

    /* 右：和恰为 1 的堆叠条 + 自检结论 */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 30, "自检：概率和恰为 1", "#5a6472", "start", 10.5, 700);
    tx(gB, g.rx, g.barY - 10, "P(X=0) + P(X=1)", "#8f9aa8", "start", 9.4, 400);
    el("rect", { x: g.rx, y: g.barY, width: g.rw * p0, height: g.barH, rx: 4, fill: "#2563eb", "fill-opacity": 0.85 }, gB);
    el("rect", { x: g.rx + g.rw * p0, y: g.barY, width: Math.max(0, g.rw * p1), height: g.barH, rx: 4, fill: "#93b8f0" }, gB);
    if (g.rw * p0 > 56) tx(gB, g.rx + g.rw * p0 / 2, g.barY + g.barH / 2 + 4, f(p0), "#ffffff", "middle", 10, 700);
    if (g.rw * p1 > 56) tx(gB, g.rx + g.rw * p0 + g.rw * p1 / 2, g.barY + g.barH / 2 + 4, f(p1), "#1b3a63", "middle", 10, 700);
    tx(gB, g.rx, g.barY + g.barH + 18, "两段拼满整条 ⇒ 概率和恰好为 1.00", "#2f8a5b", "start", 9.6, 700);

    var x0 = L.right.x + 20, ly = g.lineY, st = g.step;
    tx(gB, x0, ly, "p₀ = P(X=0) = 1 − p = " + f(p0), "#3a3a35", "start", 10.4, 400);
    tx(gB, x0, ly + st, "p₁ = P(X=1) = p = " + f(p1), "#3a3a35", "start", 10.4, 400);
    tx(gB, x0, ly + st * 2, "p₀ + p₁ = " + f(p0 + p1) + "（恒为 1）", "#2f8a5b", "start", 10.4, 700);
    tx(gB, x0, ly + st * 3, "P(X≤0) = p₀ = " + f(p0), "#2563eb", "start", 10.4, 700);

    var wy = ly + st * 3 + (g.nar ? 34 : 42);
    wrap(gB, x0, wy, "分布列要列全所有取值：X 只取 0、1 两个值，漏一个概率和就不为 1。", L.right.w - 40, g.nar ? 9.2 : 9.6, "#5a6472", 15);
    wrap(gB, x0, wy + (g.nar ? 40 : 54), "概率不能为负：p 在 0.1–0.9 之间，两个概率都 ≥ 0。", L.right.w - 40, g.nar ? 9.2 : 9.6, "#5a6472", 15);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A);
    $("gxVa").textContent = s.p.toFixed(2);
    $("gxVb").textContent = s.p0.toFixed(2);
    $("gxVc").textContent = s.p1.toFixed(2);
    $("gxVs").textContent = "和为 1";
    $("gxVsn").textContent = "p₀+p₁=" + (s.p0 + s.p1).toFixed(2) + " 恒成立";
    $("gxStBox").style.background = "#e6f6ee";
    $("gxStBox").style.borderColor = "#2f8a5b44";
    $("gxVs").style.color = "#2f8a5b";
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
    loop: [{ t: 0, v: 0.1 }, { t: 1.2, v: 0.1 }, { t: 4, v: 0.5 }, { t: 6.5, v: 0.5 }, { t: 9, v: 0.9 }, { t: 11.5, v: 0.7 }, { t: 13.5, v: 0.1 }],
    keys: [0.1, 0.5, 0.9],
    value: A, min: 0.1, max: 0.9, step: 0.05,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0.3, eq: { p0: 0.7, p1: 0.3, sum: 1 } },
    { v: 0.5, eq: { p0: 0.5, p1: 0.5, sum: 1 } },
    { v: 0.9, eq: { p0: 0.1, p1: 0.9, sum: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
