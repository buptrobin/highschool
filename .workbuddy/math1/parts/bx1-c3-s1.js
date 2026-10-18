/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = -3, G = null;

  /* 纯函数：x → 函数值与所用段号。render() 和 __model.cases 都用它 */
  function calc(v) {
    var y = v < 0 ? v * v : v < 2 ? 2 * v : 4 - v;
    var seg = v < 0 ? 0 : v < 2 ? 1 : 2;
    return { y: y, seg: seg };
  }

  function fmt(n) {
    var a = Math.abs(n), s = String(Math.round(a * 100) / 100);
    return (n < -1e-9 ? "−" : "") + s;
  }

  function geom(lay) {
    if (lay === W) return { ox: 182, oy: 344, ux: 46, uy: 32 };
    return { ox: 139, oy: 231, ux: 39, uy: 21 };
  }
  function px(x) { return G.ox + x * G.ux; }
  function py(y) { return G.oy - y * G.uy; }

  /* 抛物线 y=x² 按点采样成折线，避免手调贝塞尔偏差 */
  function arcPath(a, b, n) {
    var p = [], i, x;
    for (i = 0; i <= n; i++) { x = a + (b - a) * i / n; p.push(px(x).toFixed(1) + "," + py(x * x).toFixed(1)); }
    return "M" + p.join(" L");
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), i;
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), f = L === W ? 1 : 0.92, rows, ry, rh, act, by, ax, ay;
    var col = ["#2563eb", "#2f8a5b", "#b8791f"][s.seg], x0 = G.ox, y0 = G.oy;

    /* ---------- 左：图象 ---------- */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 30, "图象：三段拼成一条曲线", "#5a6472", "start", 10.5, 700);

    el("line", { x1: px(-3.3), y1: y0, x2: px(5) + 4, y2: y0, stroke: "#5a6472", "stroke-width": 1.2 }, gA);
    el("path", { d: "M" + (px(5) + 14) + "," + y0 + " L" + (px(5) + 3) + "," + (y0 - 4) + " L" + (px(5) + 3) + "," + (y0 + 4) + " Z", fill: "#5a6472" }, gA);
    el("line", { x1: x0, y1: py(-1.5), x2: x0, y2: py(9) - 6, stroke: "#5a6472", "stroke-width": 1.2 }, gA);
    el("path", { d: "M" + x0 + "," + (py(9) - 14) + " L" + (x0 - 4) + "," + (py(9) - 5) + " L" + (x0 + 4) + "," + (py(9) - 5) + " Z", fill: "#5a6472" }, gA);
    tx(gA, px(5) + 18, y0 + 16, "x", "#5a6472", "end", 9.5, 700);
    tx(gA, x0 + 8, py(9) - 10, "y", "#5a6472", "start", 9.5, 700);
    tx(gA, x0 - 9, y0 + 15, "O", "#8a949f", "end", 8.6, 400);

    for (i = -3; i <= 5; i++) {
      if (i === 0) continue;
      el("line", { x1: px(i), y1: y0 - 3.5, x2: px(i), y2: y0 + 3.5, stroke: "#8a949f" }, gA);
      tx(gA, px(i), y0 + 15, String(i).replace("-", "−"), "#5a6472", "middle", 8.6, 400);
    }
    for (i = 1; i <= 8; i++) {
      el("line", { x1: x0 - 3.5, y1: py(i), x2: x0 + 3.5, y2: py(i), stroke: "#8a949f" }, gA);
      if (i % 2 === 0) tx(gA, x0 - 8, py(i) + 3, String(i), "#8a949f", "end", 8.2, 400);
    }

    el("path", { d: arcPath(-3, -0.04, 14), fill: "none", stroke: "#2563eb", "stroke-width": s.seg === 0 ? 3.4 : 2.2, "stroke-linecap": "round" }, gA);
    el("line", { x1: px(0), y1: py(0), x2: px(2), y2: py(4), stroke: "#2f8a5b", "stroke-width": s.seg === 1 ? 3.4 : 2.2, "stroke-linecap": "round" }, gA);
    el("line", { x1: px(2), y1: py(2), x2: px(5), y2: py(-1), stroke: "#b8791f", "stroke-width": s.seg === 2 ? 3.4 : 2.2, "stroke-linecap": "round" }, gA);
    el("circle", { cx: px(0), cy: py(0), r: 3.6, fill: "#2f8a5b" }, gA);
    el("circle", { cx: px(2), cy: py(4), r: 4.2, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 1.8 }, gA);
    el("circle", { cx: px(2), cy: py(2), r: 3.6, fill: "#b8791f" }, gA);
    el("line", { x1: px(2), y1: py(4) + 6, x2: px(2), y2: py(2) - 6, stroke: "#b8402f", "stroke-width": 1.2, "stroke-dasharray": "4 3" }, gA);
    tx(gA, px(-2.7), py(7.4), "y = x²", "#2563eb", "start", 9.2 * f, 400);
    tx(gA, px(0.9), py(3.2), "y = 2x", "#2f8a5b", "start", 9.2 * f, 400);
    tx(gA, px(3.2), py(1.5), "y = 4−x", "#b8791f", "start", 9.2 * f, 400);
    tx(gA, px(2.15), py(3.6), "空心 (2,4)", "#b8402f", "start", 8.4 * f, 400);
    tx(gA, px(2.15), py(1.9), "实心 (2,2)", "#b8402f", "start", 8.4 * f, 400);

    /* 动点与两条虚线投影 */
    ax = px(A); ay = py(s.y);
    el("line", { x1: ax, y1: ay, x2: ax, y2: y0, stroke: "#b8402f", "stroke-width": 1.1, "stroke-dasharray": "4 3" }, gA);
    if (Math.abs(s.y) > 0.05) el("line", { x1: ax, y1: ay, x2: x0, y2: ay, stroke: "#b8402f", "stroke-width": 1.1, "stroke-dasharray": "4 3" }, gA);
    el("circle", { cx: ax, cy: ay, r: 5.5, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2.2 }, gA);
    var ly = ay - 10; if (ly < L.left.y + 54) ly = ay + 18;
    if (A > 2.6) tx(gA, ax - 10, ly, "(" + fmt(A) + ", " + fmt(s.y) + ")", "#b8402f", "end", 9 * f, 700);
    else tx(gA, ax + 10, ly, "(" + fmt(A) + ", " + fmt(s.y) + ")", "#b8402f", "start", 9 * f, 700);

    /* ---------- 右：三段对照 ---------- */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 30, "现在走的是第 " + (s.seg + 1) + " 段", "#5a6472", "start", 10.5 * f, 700);
    rows = [["x < 0", "f(x) = x²"], ["0 ≤ x < 2", "f(x) = 2x"], ["x ≥ 2", "f(x) = 4 − x"]];
    ry = L.right.y + 50; rh = 40;
    for (i = 0; i < 3; i++) {
      act = i === s.seg;
      el("rect", { x: L.right.x + 20, y: ry + i * (rh + 8), width: L.right.w - 40, height: rh, rx: 8, fill: act ? "#eaf1fd" : "#fbfcfd", stroke: act ? "#2563eb" : "#e6e9ee" }, gB);
      tx(gB, L.right.x + 32, ry + i * (rh + 8) + 17, rows[i][0], "#3a3a35", "start", 9.6 * f, act ? 700 : 400);
      tx(gB, L.right.x + 32, ry + i * (rh + 8) + 32, rows[i][1], act ? "#2563eb" : "#8a949f", "start", 9.6 * f, 400);
      if (act) el("circle", { cx: L.right.x + L.right.w - 34, cy: ry + i * (rh + 8) + 20, r: 4, fill: "#2563eb" }, gB);
    }
    by = ry + 3 * (rh + 8) + 16;
    el("rect", { x: L.right.x + 20, y: by, width: L.right.w - 40, height: 72, rx: 8, fill: "#f8fbfd", stroke: "#dbe7ef" }, gB);
    tx(gB, L.right.x + 34, by + 24, "x = " + fmt(A), "#5a6472", "start", 10 * f, 400);
    tx(gB, L.right.x + 34, by + 54, "f(x) = " + fmt(s.y), "#b8402f", "start", 15 * f, 700);
    tx(gB, L.right.x + 140, by + 53, "第 " + (s.seg + 1) + " 段算出", "#5a6472", "start", 9.2 * f, 400);
    tx(gB, L.right.x + 22, by + 100, "分界点 x = 2 归第三段：", "#b8402f", "start", 9.2 * f, 700);
    tx(gB, L.right.x + 22, by + 118, "f(2) = 4 − 2 = 2，第二段算到 4 但取不到", "#3a3a35", "start", 9.2 * f, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(L); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = fmt(A);
    $("gxVb").textContent = fmt(s.y);
    $("gxVc").textContent = String(s.seg + 1);
    if (A < 0) { st = "第一段 x²"; col = "#2563eb"; bg = "#eaf1fd"; sn = "x<0，取 x²"; }
    else if (A < 2) { st = "第二段 2x"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "0≤x<2，取 2x"; }
    else if (A === 2) { st = "分界点 · 第三段"; col = "#b8402f"; bg = "#fbeae7"; sn = "x=2 归 4−x，得 2"; }
    else { st = "第三段 4−x"; col = "#b8791f"; bg = "#fdf3e0"; sn = "x≥2，取 4−x"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = geom(L);
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
    loop: [{ t: 0, v: -3 }, { t: 1.2, v: -3 }, { t: 4, v: 0 }, { t: 6.5, v: 1 }, { t: 9, v: 2 }, { t: 11.5, v: 2 }, { t: 13, v: 3 }, { t: 14.5, v: -3 }],
    keys: [-3, 0, 1, 2, 3],
    value: A, min: -3, max: 5, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: -2, eq: { y: 4, seg: 0 } },
    { v: 1, eq: { y: 2, seg: 1 } },
    { v: 3, eq: { y: 1, seg: 2 } },
    { v: 2, eq: { y: 2, seg: 2 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
