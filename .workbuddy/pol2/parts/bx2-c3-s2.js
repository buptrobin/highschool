/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = {
    vb: "0 0 880 470",
    left: { x: 16, y: 16, w: 424, h: 438 },
    right: { x: 456, y: 16, w: 408, h: 438 },
    plot: { x: 64, y: 74, w: 336, h: 288 }
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 316 },
    right: { x: 8, y: 336, w: 344, h: 356 },
    plot: { x: 52, y: 62, w: 272, h: 202 }
  };
  var L = W, A = 50;

  var BLUE = "#0891b2", BLUE_SOFT = "#ecfbff";
  var AMBER = "#b8791f", AMBER_SOFT = "#fdf3e0";
  var GREEN = "#2f8a5b", GREEN_SOFT = "#e6f6ee";
  var RED = "#b8402f";

  /* 纯函数：产业链位置 → 附加值指数（微笑曲线） */
  function calc(v) {
    var p = Math.max(0, Math.min(100, +v));
    var value = 20 + 80 * Math.pow((p - 50) / 50, 2);
    return { value: value, gap: value - 20 };
  }

  function stateOf(p) {
    if (p < 20) return { name: "研发端", sn: "技术含量高，附加值高", col: BLUE, bg: BLUE_SOFT };
    if (p > 80) return { name: "品牌服务端", sn: "品牌、设计、服务带来高附加值", col: GREEN, bg: GREEN_SOFT };
    return { name: "组装制造", sn: "处在曲线谷底，附加值低", col: AMBER, bg: AMBER_SOFT };
  }

  function panel(g, r, edge) {
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#f8fbfd", stroke: edge }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), st = stateOf(A);
    var l = L.left, r = L.right, pl = L.plot;

    /* ---------------- 左：微笑曲线 ---------------- */
    panel(gA, l, "#dbe7ef");
    tx(gA, l.x + 20, l.y + 30, "微笑曲线：两端高，中间低", "#5a6472", "start", 11, 700);
    tx(gA, l.x + 20, l.y + 49, "纵轴附加值，横轴产业链位置", "#9aa3ae", "start", 9.2, 400);

    var px = l.x + pl.x, py = l.y + pl.y, pw = pl.w, ph = pl.h;
    var xOf = function (p) { return px + p / 100 * pw; };
    var yOf = function (v) { return py + ph - v / 100 * ph; };

    /* 三段背景 */
    el("rect", { x: xOf(0), y: py, width: xOf(20) - xOf(0), height: ph, fill: BLUE_SOFT }, gA);
    el("rect", { x: xOf(20), y: py, width: xOf(80) - xOf(20), height: ph, fill: AMBER_SOFT }, gA);
    el("rect", { x: xOf(80), y: py, width: xOf(100) - xOf(80), height: ph, fill: GREEN_SOFT }, gA);

    /* 轴 */
    el("line", { x1: px, y1: py, x2: px, y2: py + ph, stroke: "#9aa3ae", "stroke-width": 1.2 }, gA);
    el("line", { x1: px, y1: py + ph, x2: px + pw, y2: py + ph, stroke: "#9aa3ae", "stroke-width": 1.2 }, gA);
    [0, 20, 50, 80, 100].forEach(function (p) {
      tx(gA, xOf(p), py + ph + 17, String(p), "#6b7280", "middle", 8.4);
    });
    [20, 50, 80, 100].forEach(function (v) {
      tx(gA, px - 8, yOf(v) + 3, String(v), "#6b7280", "end", 8.4);
      el("line", { x1: px - 4, y1: yOf(v), x2: px, y2: yOf(v), stroke: "#9aa3ae" }, gA);
    });
    tx(gA, px + 6, py + 12, "附加值", "#5a6472", "start", 8.6, 700);
    tx(gA, px + pw, py + ph + 34, "产业链位置", "#5a6472", "end", 8.6, 700);

    /* 曲线 */
    var d = "";
    for (var i = 0; i <= 50; i++) {
      var p = i * 2, v = calc(p).value;
      d += (i ? " L " : "M ") + xOf(p).toFixed(1) + " " + yOf(v).toFixed(1);
    }
    el("path", { d: d, fill: "none", stroke: "#8a5c14", "stroke-width": 2.4, "stroke-linejoin": "round" }, gA);

    /* 三段标签 */
    tx(gA, xOf(10), py + 20, "研发", BLUE, "middle", 9.2, 700);
    tx(gA, xOf(50), py + 20, "组装制造", AMBER, "middle", 9.2, 700);
    tx(gA, xOf(90), py + 20, "品牌服务", GREEN, "middle", 9.2, 700);

    /* 当前点 */
    var cx = xOf(A), cy = yOf(s.value);
    el("line", { x1: cx, y1: cy, x2: cx, y2: py + ph, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("line", { x1: px, y1: cy, x2: cx, y2: cy, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: cx, cy: cy, r: 5.5, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2.4 }, gA);
    tx(gA, cx + (A < 50 ? 8 : -8), cy - 10, "附加值 " + s.value.toFixed(0), "#b8402f", A < 50 ? "start" : "end", 8.8, 700, true);
    tx(gA, cx, py + ph + 33, "你现在在这里", "#b8402f", "middle", 8.6, 700);

    if (L === W) tx(gA, l.x + 20, l.y + l.h - 22, "谷底：组装代工；两端：研发、品牌、服务。", "#6b7280", "start", 8.8);

    /* ---------------- 右：读数 ---------------- */
    panel(gB, r, "#e6e9ee");
    tx(gB, r.x + 20, r.y + 30, "你所在的位置值多少附加值", "#5a6472", "start", 11, 700);
    tx(gB, r.x + 20, r.y + 52, "数值越高，越靠近两端", "#9aa3ae", "start", 9.2, 400);

    el("rect", { x: r.x + 20, y: r.y + 70, width: r.w - 40, height: 88, rx: 8, fill: st.bg, stroke: st.col + "44" }, gB);
    tx(gB, r.x + 34, r.y + 94, "附加值指数", "#5a6472", "start", 8.8);
    tx(gB, r.x + 34, r.y + 132, s.value.toFixed(1), st.col, "start", 28, 700);
    tx(gB, r.x + 146, r.y + 120, st.name, st.col, "start", 12.5, 700);
    tx(gB, r.x + 146, r.y + 140, "满分 100", "#6b7280", "start", 8.8);

    /* 三个参照条 */
    var barX = r.x + 84, barW = r.w - 170, barY = r.y + 186;
    [["谷底（组装）", 20, AMBER], ["当前", s.value, RED], ["两端（研发/品牌）", 100, GREEN]].forEach(function (row, i) {
      var yy = barY + i * 56;
      tx(gB, r.x + 24, yy + 12, row[0], "#5a6472", "start", 8.8);
      el("rect", { x: barX, y: yy, width: barW, height: 18, rx: 4, fill: "#eef2f6" }, gB);
      el("rect", { x: barX, y: yy, width: barW * row[1] / 100, height: 18, rx: 4, fill: row[2], opacity: 0.85 }, gB);
      tx(gB, r.x + r.w - 26, yy + 14, row[1].toFixed(0), row[2], "end", 9.4, 700);
    });

    /* 公式与结论 */
    var compact = L === N;
    tx(gB, r.x + 24, r.y + (compact ? 324 : 360), "附加值 = 20 + 80 × ((位置 − 50) ÷ 50)²", "#6b7280", "start", 8.6);
    tx(gB, r.x + 24, r.y + (compact ? 344 : 382), "同样一双鞋，代工赚几块，品牌和研发赚几百。", "#3a3a35", "start", 8.8);
    if (L === W) tx(gB, r.x + 24, r.y + 404, "转型方向：向研发端、品牌服务端延伸。", GREEN, "start", 8.8, 700);
  }

  function render() {
    var s = calc(A), st = stateOf(A);
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.value.toFixed(1);
    $("gxVc").textContent = s.gap.toFixed(1);
    $("gxVs").textContent = st.name;
    $("gxVsn").textContent = st.sn;
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
    loop: [{ t: 0, v: 50 }, { t: 1.2, v: 50 }, { t: 4, v: 10 }, { t: 6.5, v: 10 }, { t: 9, v: 90 }, { t: 11, v: 90 }, { t: 13, v: 50 }],
    keys: [50, 10, 90],
    value: A, min: 0, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 10, eq: { value: 71.2, gap: 51.2 } },
    { v: 50, eq: { value: 20, gap: 0 } },
    { v: 90, eq: { value: 71.2, gap: 51.2 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
