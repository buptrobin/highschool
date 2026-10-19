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
    plot: { x: 64, y: 66, w: 336, h: 306 }
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 316 },
    right: { x: 8, y: 336, w: 344, h: 356 },
    plot: { x: 52, y: 54, w: 276, h: 226 }
  };
  var L = W, A = 14;

  var DEM = "#0891b2", DEM_SOFT = "#ecfbff";
  var SUP = "#b8791f", SUP_SOFT = "#fffaf2";
  var RED = "#b8402f";

  /* 纯函数：价格 → 需求量、供给量、缺口 */
  function calc(v) {
    var p = Math.max(4, Math.min(16, +v));
    var demand = 120 - 6 * p;
    var supply = 6 * p;
    return { demand: demand, supply: supply, gap: supply - demand };
  }

  function stateOf(p) {
    if (p < 9.5) return { name: "供不应求", sn: "短缺 " + Math.round(calc(p).demand - calc(p).supply) + " 杯，价格有上涨压力", col: "#b8402f", bg: "#fbeae7" };
    if (p > 10.5) return { name: "供过于求", sn: "过剩 " + Math.round(calc(p).supply - calc(p).demand) + " 杯，价格有下跌压力", col: "#b8791f", bg: "#fdf3e0" };
    return { name: "供求均衡", sn: "供给量 = 需求量，价格稳定", col: "#2f8a5b", bg: "#e6f6ee" };
  }

  function panel(g, r, edge) {
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#f8fbfd", stroke: edge }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), st = stateOf(A);
    var l = L.left, r = L.right, pl = L.plot;

    /* ---------------- 左：供求曲线 ---------------- */
    panel(gA, l, "#dbe7ef");
    tx(gA, l.x + 20, l.y + 30, "一杯奶茶的市场：价格与供求", "#5a6472", "start", 11, 700);
    tx(gA, l.x + 20, l.y + 49, "纵轴价格 P，横轴数量 Q", "#9aa3ae", "start", 9.2, 400);

    var px = l.x + pl.x, py = l.y + pl.y, pw = pl.w, ph = pl.h;
    var xOf = function (q) { return px + q / 120 * pw; };
    var yOf = function (p) { return py + (16 - p) / 12 * ph; };

    /* 坐标轴与网格 */
    el("line", { x1: px, y1: py, x2: px, y2: py + ph, stroke: "#9aa3ae", "stroke-width": 1.2 }, gA);
    el("line", { x1: px, y1: py + ph, x2: px + pw, y2: py + ph, stroke: "#9aa3ae", "stroke-width": 1.2 }, gA);
    [4, 8, 10, 12, 16].forEach(function (p) {
      var yy = yOf(p);
      el("line", { x1: px - 4, y1: yy, x2: px, y2: yy, stroke: "#9aa3ae" }, gA);
      tx(gA, px - 9, yy + 3, String(p), "#6b7280", "end", 8.4);
    });
    [0, 30, 60, 90, 120].forEach(function (q) {
      var xx = xOf(q);
      el("line", { x1: xx, y1: py + ph, x2: xx, y2: py + ph + 4, stroke: "#9aa3ae" }, gA);
      tx(gA, xx, py + ph + 17, String(q), "#6b7280", "middle", 8.4);
    });
    tx(gA, px + 6, py + (L === W ? 12 : 30), "P（元）", "#5a6472", "start", 8.8, 700);
    tx(gA, px + pw, py + ph + 34, "Q（杯）", "#5a6472", "end", 8.8, 700);

    /* 需求曲线：Qd=120−6P */
    el("line", { x1: xOf(120 - 6 * 4), y1: yOf(4), x2: xOf(120 - 6 * 16), y2: yOf(16), stroke: DEM, "stroke-width": 2.2 }, gA);
    /* 供给曲线：Qs=6P */
    el("line", { x1: xOf(6 * 4), y1: yOf(4), x2: xOf(6 * 16), y2: yOf(16), stroke: SUP, "stroke-width": 2.2 }, gA);

    /* 曲线标签 */
    tx(gA, xOf(105) + 2, yOf(4.4) - 4, "需求 D", DEM, "start", 8.8, 700, true);
    tx(gA, xOf(98) + 2, yOf(15.2) + 4, "供给 S", SUP, "start", 8.8, 700, true);

    /* 均衡点 */
    var eqx = xOf(60), eqy = yOf(10);
    el("circle", { cx: eqx, cy: eqy, r: 5, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 2 }, gA);
    el("line", { x1: px, y1: eqy, x2: eqx, y2: eqy, stroke: "#2f8a5b", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("line", { x1: eqx, y1: eqy, x2: eqx, y2: py + ph, stroke: "#2f8a5b", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    tx(gA, eqx + 7, eqy - 7, L === W ? "均衡 E（10 元，60 杯）" : "均衡 E", "#1f6b47", "start", 8.4, 700, true);

    /* 当前价格横线 + 两个点 */
    var cy = yOf(A);
    el("line", { x1: px, y1: cy, x2: px + pw, y2: cy, stroke: RED, "stroke-width": 1.2, "stroke-dasharray": "5 3" }, gA);
    var qd = 120 - 6 * A, qs = 6 * A;
    el("circle", { cx: xOf(qd), cy: cy, r: 4.5, fill: DEM, stroke: "#ffffff", "stroke-width": 1.5 }, gA);
    el("circle", { cx: xOf(qs), cy: cy, r: 4.5, fill: SUP, stroke: "#ffffff", "stroke-width": 1.5 }, gA);
    tx(gA, xOf(qd) - 6, cy - 8, "Qd", DEM, "end", 8.4, 700, true);
    tx(gA, xOf(qs) + 6, cy - 8, "Qs", SUP, "start", 8.4, 700, true);

    /* 缺口括号 */
    if (Math.abs(qd - qs) > 4) {
      var gx1 = xOf(Math.min(qd, qs)), gx2 = xOf(Math.max(qd, qs));
      var gy = cy + 16;
      el("line", { x1: gx1, y1: gy, x2: gx2, y2: gy, stroke: "#8a5c14", "stroke-width": 1.2 }, gA);
      el("line", { x1: gx1, y1: gy - 4, x2: gx1, y2: gy + 4, stroke: "#8a5c14" }, gA);
      el("line", { x1: gx2, y1: gy - 4, x2: gx2, y2: gy + 4, stroke: "#8a5c14" }, gA);
      tx(gA, (gx1 + gx2) / 2, gy + 14, (qs > qd ? "过剩 " : "短缺 ") + Math.round(Math.abs(qs - qd)) + " 杯", "#8a5c14", "middle", 8.4, 700);
    }

    /* ---------------- 右：数量条 + 结论 ---------------- */
    panel(gB, r, "#e6e9ee");
    tx(gB, r.x + 20, r.y + 30, "把当前价格下的两个数量并排看", "#5a6472", "start", 11, 700);
    tx(gB, r.x + 20, r.y + 49, "条越长，数量越多；两条不等，就有缺口", "#9aa3ae", "start", 9.2, 400);

    var barX = r.x + 24, barW = r.w - 48, barY = r.y + 74, barH = 34;
    var maxQ = 120;
    [["需求量 Qd", qd, DEM, DEM_SOFT], ["供给量 Qs", qs, SUP, SUP_SOFT]].forEach(function (row, i) {
      var yy = barY + i * 82;
      tx(gB, barX, yy - 6, row[0], "#5a6472", "start", 9, 700);
      tx(gB, barX + barW, yy - 6, Math.round(row[1]) + " 杯", row[2], "end", 9.4, 700);
      el("rect", { x: barX, y: yy, width: barW, height: barH, rx: 6, fill: "#eef2f6", stroke: "#dbe7ef" }, gB);
      var w = Math.max(2, barW * row[1] / maxQ);
      el("rect", { x: barX, y: yy, width: w, height: barH, rx: 6, fill: row[3], stroke: row[2] }, gB);
    });

    /* 状态卡 */
    var sy = r.y + 250;
    el("rect", { x: r.x + 20, y: sy, width: r.w - 40, height: 92, rx: 8, fill: st.bg, stroke: st.col + "44" }, gB);
    tx(gB, r.x + 34, sy + 22, "市场信号", "#5a6472", "start", 8.8, 400);
    tx(gB, r.x + 34, sy + 48, st.name, st.col, "start", 15, 700);
    tx(gB, r.x + 34, sy + 70, st.sn, "#3a3a35", "start", 9, 400);
    tx(gB, r.x + 34, sy + 85, "缺口 = 供给量 − 需求量 = " + (s.gap > 0 ? "+" : "") + Math.round(s.gap) + " 杯", "#6b7280", "start", 8.6);

    /* 底部结论 */
    if (L === W) {
      tx(gB, r.x + 20, r.y + r.h - 40, "供不应求 → 价格上升 → 生产扩大、需求减少", "#6b7280", "start", 8.6);
      tx(gB, r.x + 20, r.y + r.h - 22, "供过于求 → 价格下降 → 生产缩小、需求增加", "#6b7280", "start", 8.6);
    }
  }

  function render() {
    var s = calc(A), st = stateOf(A);
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = Math.round(s.demand);
    $("gxVc").textContent = Math.round(s.supply);
    if (Math.abs(s.gap) < 0.5) $("gxVcS").textContent = "供求相等";
    else $("gxVcS").textContent = "缺口 " + (s.gap > 0 ? "+" : "−") + Math.round(Math.abs(s.gap)) + " 杯";
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
    loop: [{ t: 0, v: 14 }, { t: 1.2, v: 14 }, { t: 4, v: 10 }, { t: 6.5, v: 10 }, { t: 9, v: 6 }, { t: 11, v: 6 }, { t: 13, v: 14 }],
    keys: [14, 10, 6],
    value: A, min: 4, max: 16, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 4, eq: { demand: 96, supply: 24, gap: -72 } },
    { v: 10, eq: { demand: 60, supply: 60, gap: 0 } },
    { v: 14, eq: { demand: 36, supply: 84, gap: 48 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
