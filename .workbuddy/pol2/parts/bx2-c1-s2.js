/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = {
    vb: "0 0 880 470",
    left: { x: 16, y: 16, w: 424, h: 438 },
    right: { x: 456, y: 16, w: 408, h: 438 },
    cfg: { barTop: 128, base: 376, bw: 92, c1: 134, c2: 316,
           px0: 516, px1: 824, vBase: 346, vTop: 146 }
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 300 },
    right: { x: 8, y: 320, w: 344, h: 372 },
    cfg: { barTop: 88, base: 246, bw: 64, c1: 104, c2: 256,
           px0: 56, px1: 328, vBase: 600, vTop: 430 }
  };
  var L = W, A = 20;

  var PUB_FILL = "#b8e6f2", PUB_LINE = "#0891b2", PUB_COL = "#0b6580";
  var PRI_FILL = "#f0dcb4", PRI_LINE = "#b8791f", PRI_COL = "#8a5c14";

  /* 纯函数：政策分配 → 两条腿的活力与整体活力。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var x = Math.max(0, Math.min(100, +v));
    var pub = 100 - 0.8 * Math.max(0, x - 50);
    var pri = 100 - 0.8 * Math.max(0, 50 - x);
    return { pub: pub, pri: pri, total: (pub + pri) / 2 };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function panel(g, r, edge) {
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#f8fbfd", stroke: edge }, g);
  }

  function leg(g, cx, val, fill, line, col, label, c) {
    var h = (c.base - c.barTop) * val / 100;
    if (h < 2) h = 2;
    el("rect", { x: cx - c.bw / 2, y: c.base - h, width: c.bw, height: h, rx: 6,
                 fill: fill, stroke: line, "stroke-width": 1.2 }, g);
    tx(g, cx, c.base - h - 9, Math.round(val).toString(), col, "middle", 11, 700);
    tx(g, cx, c.base + 22, label, "#3a3a35", "middle", 10, 600);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var c = L.cfg, s = calc(A);

    /* ---------------- 左：两条腿的活力 ---------------- */
    panel(gA, L.left, "#dbe7ef");
    tx(gA, L.left.x + 20, L.left.y + 30, "两条腿的活力（满值 100）", "#5a6472", "start", 11, 700);
    tx(gA, L.left.x + 20, L.left.y + 49, "谁被冷落，谁的柱子就矮下去", "#9aa3ae", "start", 9.2, 400);

    el("line", { x1: L.left.x + 20, y1: c.barTop, x2: L.left.x + L.left.w - 24, y2: c.barTop,
                 stroke: "#dbe7ef", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    leg(gA, c.c1, s.pub, PUB_FILL, PUB_LINE, PUB_COL, "公有制经济", c);
    leg(gA, c.c2, s.pri, PRI_FILL, PRI_LINE, PRI_COL, "非公有制经济", c);

    tx(gA, L.left.x + L.left.w / 2, c.base + 52,
       "两条腿差 " + Math.abs(s.pub - s.pri).toFixed(1), "#6b7280", "middle", 9.4, 400);

    /* ---------------- 右：整体活力曲线 ---------------- */
    panel(gB, L.right, "#e6e9ee");
    tx(gB, L.right.x + 20, L.right.y + 30, "整体经济活力：均衡时最高", "#5a6472", "start", 11, 700);
    tx(gB, L.right.x + 20, L.right.y + 62, "整体活力 " + s.total.toFixed(1), PUB_COL, "start", 13, 700);

    /* 曲线（x=0…100 的折线） */
    var pts = [], i, xv, tv, py;
    for (i = 0; i <= 20; i++) {
      xv = i * 5;
      tv = calc(xv).total;
      py = c.vBase - (tv - 80) * (c.vBase - c.vTop) / 20;
      pts.push((c.px0 + xv / 100 * (c.px1 - c.px0)) + "," + py.toFixed(1));
    }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#0891b2", "stroke-width": 2.2,
                     "stroke-linejoin": "round" }, gB);

    el("line", { x1: c.px0, y1: c.vBase, x2: c.px1, y2: c.vBase, stroke: "#c9d2da", "stroke-width": 1 }, gB);
    tx(gB, c.px0 - 8, c.vBase + 4, "80", "#9aa3ae", "end", 8.6, 400);
    tx(gB, c.px0 - 8, c.vTop + 4, "100", "#9aa3ae", "end", 8.6, 400);
    tx(gB, c.px0, c.vBase + 18, "0", "#9aa3ae", "middle", 8.6, 400);
    tx(gB, (c.px0 + c.px1) / 2, c.vBase + 18, "50", "#9aa3ae", "middle", 8.6, 400);
    tx(gB, c.px1, c.vBase + 18, "100", "#9aa3ae", "middle", 8.6, 400);

    /* 均衡线 + 当前点 */
    var midX = (c.px0 + c.px1) / 2;
    el("line", { x1: midX, y1: c.vTop - 26, x2: midX, y2: c.vBase, stroke: "#f0dcb4",
                 "stroke-width": 1.2, "stroke-dasharray": "4 4" }, gB);
    tx(gB, midX, c.vTop - 34, "均衡 50", "#b8791f", "middle", 9, 700);

    var mx = c.px0 + A / 100 * (c.px1 - c.px0);
    var my = c.vBase - (s.total - 80) * (c.vBase - c.vTop) / 20;
    el("line", { x1: mx, y1: my, x2: mx, y2: c.vBase, stroke: "#9aa3ae", "stroke-width": 1,
                 "stroke-dasharray": "3 3" }, gB);
    el("circle", { cx: mx, cy: my, r: 5, fill: "#ffffff", stroke: "#0891b2", "stroke-width": 2.5 }, gB);
    tx(gB, mx, my - 12, "活力 " + s.total.toFixed(1), PUB_COL, "middle", 9.4, 700);

    /* 底部：状态与公式 */
    var st = stateOf(A);
    tx(gB, L.right.x + 20, c.vBase + 46, "x=" + Math.round(A) + "：" + st.name, st.col, "start", 9.6, 700);
    tx(gB, L.right.x + 20, c.vBase + 66, "整体活力＝(公有制＋非公有制)÷2", "#6b7280", "start", 8.8, 400);
  }

  function stateOf(x) {
    if (x < 35) return { name: "偏科：民营经济被冷落", col: "#b8402f", bg: "#fbeae7", sn: "非公有制经济这条腿变短了" };
    if (x > 65) return { name: "偏科：公有制经济被削弱", col: "#b8402f", bg: "#fbeae7", sn: "公有制经济这条腿变短了" };
    return { name: "两条腿走路", col: "#2f8a5b", bg: "#e6f6ee", sn: "两边都用力，整体活力最高" };
  }

  function render() {
    var s = calc(A), st = stateOf(A);
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.pub.toFixed(1);
    $("gxVc").textContent = s.pri.toFixed(1);
    $("gxVs").textContent = st.name;
    $("gxVsn").textContent = "整体活力 " + s.total.toFixed(1);
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.col + "44";
    $("gxVs").style.color = st.col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
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
    loop: [{ t: 0, v: 20 }, { t: 1.2, v: 20 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 80 }, { t: 11, v: 80 }, { t: 13, v: 20 }],
    keys: [20, 50, 80],
    value: A, min: 0, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 20, eq: { pub: 100, pri: 76, total: 88 } },
    { v: 50, eq: { pub: 100, pri: 100, total: 100 } },
    { v: 80, eq: { pub: 76, pri: 100, total: 88 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
