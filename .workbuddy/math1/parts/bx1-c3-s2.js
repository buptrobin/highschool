/* 互动脚本本体：f(x)=x²−2ax，滑块 = 参数 a ∈ [−2,2]，步长 0.5
   （由 build-page.mjs 包进 <script>，这里不写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏 360×700（独立几何，不硬缩） */
  var W = {
    vb: "0 0 880 470", ox: 240, oy: 268, ux: 36, uy: 22, fs: 12.5, lh: 27,
    left: { x: 16, y: 16, w: 440, h: 438 },
    right: { x: 456, y: 16, w: 408, h: 438 }
  };
  var N = {
    vb: "0 0 360 700", ox: 178, oy: 178, ux: 33, uy: 14, fs: 11.5, lh: 31,
    left: { x: 8, y: 8, w: 344, h: 300 },
    right: { x: 8, y: 320, w: 344, h: 372 }
  };
  var L = W, G = null, A = -2;

  /* 唯一真值：a → 对称轴与最小值 */
  function calc(a) {
    a = Math.round(a * 2) / 2;
    return { axis: a, min: -(a * a), a: a };
  }

  function fmt(v) {
    var r = Math.round(v * 2) / 2, s = Math.abs(r);
    return (r < 0 ? "−" : "") + (s % 1 === 0 ? s.toFixed(0) : s.toFixed(1));
  }

  function geom() { return { ox: L.ox, oy: L.oy, ux: L.ux, uy: L.uy }; }
  function px(x) { return G.ox + x * G.ux; }
  function py(y) { return G.oy - y * G.uy; }

  /* 抛物线 y = x² − 2ax，只保留视窗内的一段，超出就断开 */
  function curve(a) {
    var d = "", pen = false, i, x, y;
    for (i = -46; i <= 46; i++) {
      x = i / 10;
      y = x * x - 2 * a * x;
      if (y > 8.95 || y < -4.9) { pen = false; continue; }
      d += (pen ? " L " : " M ") + px(x).toFixed(1) + " " + py(y).toFixed(1);
      pen = true;
    }
    return d;
  }

  function draw(a) {
    var gA = $("gxA"), gB = $("gxB"), s = calc(a), i, x, y;
    gA.textContent = ""; gB.textContent = "";
    var defs = el("defs", {}, gA);
    var mk = el("marker", { id: "gxMk", markerWidth: "9", markerHeight: "9", refX: "7", refY: "3", orient: "auto" }, defs);
    el("path", { d: "M0,0 L7,3 L0,6 Z", fill: "#8a949e" }, mk);

    /* 左：图象 */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 18, L.left.y + 28, "f(x)=x²−2ax 的图象", "#5a6472", "start", 11, 700);
    el("line", { x1: px(-4.55), y1: py(0), x2: px(4.6), y2: py(0), stroke: "#8a949e", "stroke-width": 1.2, "marker-end": "url(#gxMk)" }, gA);
    el("line", { x1: px(0), y1: py(-4.9), x2: px(0), y2: py(9), stroke: "#8a949e", "stroke-width": 1.2, "marker-end": "url(#gxMk)" }, gA);
    var xt = [-4, -2, 2, 4], yt = [-4, -2, 2, 4, 6, 8];
    for (i = 0; i < xt.length; i++) {
      x = xt[i];
      el("line", { x1: px(x), y1: py(0) - 3, x2: px(x), y2: py(0) + 3, stroke: "#8a949e" }, gA);
      tx(gA, px(x), py(0) + 15, fmt(x), "#6b7480", "middle", 9.2, 400);
    }
    for (i = 0; i < yt.length; i++) {
      y = yt[i];
      el("line", { x1: px(0) - 3, y1: py(y), x2: px(0) + 3, y2: py(y), stroke: "#8a949e" }, gA);
      tx(gA, px(0) - 8, py(y) + 3, fmt(y), "#6b7480", "end", 9.2, 400);
    }
    tx(gA, px(0) - 7, py(0) + 17, "O", "#6b7480", "end", 9.6, 400);

    el("path", { d: curve(a), fill: "none", stroke: "#2563eb", "stroke-width": 2.4 }, gA);
    /* 对称轴虚线 + 顶点 */
    el("line", { x1: px(a), y1: py(9), x2: px(a), y2: py(-4.9), stroke: "#b8402f", "stroke-width": 1.3, "stroke-dasharray": "6 4" }, gA);
    el("circle", { cx: px(a), cy: py(s.min), r: 4, fill: "#b8402f" }, gA);
    tx(gA, px(a) + 9, py(8.6), "x=" + fmt(a), "#b8402f", "start", 10.2, 700);
    tx(gA, px(a) + 9, py(s.min) + 4, "(" + fmt(a) + "," + fmt(s.min) + ")", "#b8402f", "start", 10, 400);
    tx(gA, px(a) - 26, py(s.min) - 16, "减", "#2f8a5b", "middle", 10.5, 700);
    tx(gA, px(a) + 24, py(s.min) - 16, "增", "#2f8a5b", "middle", 10.5, 700);

    /* 右：读数 */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 22, L.right.y + 32, "读数与三句话", "#5a6472", "start", 11, 700);
    var lines = [
      "f(x)=x²−2ax",
      "对称轴 x=" + fmt(a) + "（直线）",
      "最小值 −a²=" + fmt(s.min),
      "减区间 (−∞," + fmt(a) + ")",
      "增区间 (" + fmt(a) + ",+∞)",
      a === 0 ? "f(−x)=f(x)，此时是偶函数" : "a≠0，既不是奇函数也不是偶函数",
      "a 就是对称轴左右平移的位移"
    ];
    for (i = 0; i < lines.length; i++) {
      tx(gB, L.right.x + 24, L.right.y + 70 + i * L.lh, lines[i], i === 0 ? "#151a21" : "#3a3a35", "start", L.fs, i === 0 ? 700 : 400);
    }
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var a = Math.round(A * 2) / 2, s = calc(a), st, col, bg, sn;
    $("gxVa").textContent = fmt(a);
    $("gxVb").textContent = "x=" + fmt(a);
    $("gxVc").textContent = fmt(s.min);
    if (a === 0) { st = "偶函数"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "对称轴是 y 轴，f(−x)=f(x)"; }
    else if (a > 0) { st = "对称轴右移"; col = "#b8791f"; bg = "#fdf3e0"; sn = "减区间 (−∞," + fmt(a) + ")，最小值 " + fmt(s.min); }
    else { st = "对称轴左移"; col = "#2563eb"; bg = "#e8eefc"; sn = "减区间 (−∞," + fmt(a) + ")，最小值 " + fmt(s.min); }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw(a);
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
    loop: [{ t: 0, v: -2 }, { t: 1.2, v: -2 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: 2 }, { t: 11.5, v: 2 }, { t: 13.5, v: -2 }],
    keys: [-2, 0, 2],
    value: A, min: -2, max: 2, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { axis: 0, min: 0 } },
    { v: 1, eq: { axis: 1, min: -1 } },
    { v: 2, eq: { axis: 2, min: -4 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
