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
    plot: { x: 64, y: 70, w: 336, h: 292 }
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 316 },
    right: { x: 8, y: 336, w: 344, h: 356 },
    plot: { x: 50, y: 58, w: 276, h: 206 }
  };
  var L = W, A = 20;

  var BLUE = "#0891b2", BLUE_SOFT = "#ecfbff";
  var AMBER = "#b8791f", AMBER_SOFT = "#fdf3e0";
  var GREEN = "#2f8a5b", GREEN_SOFT = "#e6f6ee";
  var RED = "#b8402f", RED_SOFT = "#fbeae7";

  /* 纯函数：保障水平 → 覆盖效果与财政负担 */
  function calc(v) {
    var lv = Math.max(0, Math.min(100, +v));
    return { cover: 100 * (1 - Math.exp(-lv / 30)), burden: 0.7 * lv + 0.005 * lv * lv };
  }

  function stateOf(lv) {
    if (lv < 40) return { name: "保障不足", sn: "网还没织密，部分人缺少兜底", col: RED, bg: RED_SOFT };
    if (lv > 70) return { name: "财政压力过大", sn: "负担曲线变陡，可持续性受考验", col: AMBER, bg: AMBER_SOFT };
    return { name: "与经济发展水平基本适应", sn: "覆盖不错，负担还可承受", col: GREEN, bg: GREEN_SOFT };
  }

  function panel(g, r, edge) {
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#f8fbfd", stroke: edge }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), st = stateOf(A);
    var l = L.left, r = L.right, pl = L.plot;
    var yMax = 120;

    /* ---------------- 左：两条曲线 ---------------- */
    panel(gA, l, "#dbe7ef");
    tx(gA, l.x + 20, l.y + 30, "保障水平往上加，会发生两件事", "#5a6472", "start", 11, 700);
    tx(gA, l.x + 20, l.y + 49, "蓝线：覆盖效果；黄线：财政负担", "#9aa3ae", "start", 9.2, 400);

    var px = l.x + pl.x, py = l.y + pl.y, pw = pl.w, ph = pl.h;
    var xOf = function (v) { return px + v / 100 * pw; };
    var yOf = function (v) { return py + ph - v / yMax * ph; };

    /* 三段背景 */
    el("rect", { x: xOf(0), y: py, width: xOf(40) - xOf(0), height: ph, fill: RED_SOFT }, gA);
    el("rect", { x: xOf(40), y: py, width: xOf(70) - xOf(40), height: ph, fill: GREEN_SOFT }, gA);
    el("rect", { x: xOf(70), y: py, width: xOf(100) - xOf(70), height: ph, fill: AMBER_SOFT }, gA);

    /* 轴 */
    el("line", { x1: px, y1: py, x2: px, y2: py + ph, stroke: "#9aa3ae", "stroke-width": 1.2 }, gA);
    el("line", { x1: px, y1: py + ph, x2: px + pw, y2: py + ph, stroke: "#9aa3ae", "stroke-width": 1.2 }, gA);
    [0, 20, 40, 60, 80, 100].forEach(function (v) {
      tx(gA, xOf(v), py + ph + 17, String(v), "#6b7280", "middle", 8.2);
    });
    [0, 30, 60, 90, 120].forEach(function (v) {
      tx(gA, px - 8, yOf(v) + 3, String(v), "#6b7280", "end", 8.2);
      el("line", { x1: px - 4, y1: yOf(v), x2: px, y2: yOf(v), stroke: "#9aa3ae" }, gA);
    });
    tx(gA, px + 6, py + 12, "指数", "#5a6472", "start", 8.4, 700);
    tx(gA, px + pw, py + ph + 33, "保障水平", "#5a6472", "end", 8.4, 700);

    /* 曲线 */
    var d1 = "", d2 = "", i, v;
    for (i = 0; i <= 50; i++) {
      v = i * 2;
      d1 += (i ? " L " : "M ") + xOf(v).toFixed(1) + " " + yOf(calc(v).cover).toFixed(1);
      d2 += (i ? " L " : "M ") + xOf(v).toFixed(1) + " " + yOf(calc(v).burden).toFixed(1);
    }
    el("path", { d: d1, fill: "none", stroke: BLUE, "stroke-width": 2.4, "stroke-linejoin": "round" }, gA);
    el("path", { d: d2, fill: "none", stroke: AMBER, "stroke-width": 2.4, "stroke-linejoin": "round" }, gA);
    tx(gA, xOf(96), yOf(calc(96).cover) + 14, "覆盖效果", BLUE, "end", 8.8, 700, true);
    tx(gA, xOf(96), yOf(calc(96).burden) - 8, "财政负担", AMBER, "end", 8.8, 700, true);

    /* 三段标签 */
    tx(gA, xOf(20), py + 20, "不足", RED, "middle", 9, 700);
    tx(gA, xOf(55), py + 20, "适度", GREEN, "middle", 9, 700);
    tx(gA, xOf(85), py + 20, "压力大", AMBER, "middle", 9, 700);

    /* 当前竖线与点 */
    var cx = xOf(A);
    el("line", { x1: cx, y1: py, x2: cx, y2: py + ph, stroke: "#6b7280", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: cx, cy: yOf(s.cover), r: 4.5, fill: BLUE, stroke: "#ffffff", "stroke-width": 1.5 }, gA);
    el("circle", { cx: cx, cy: yOf(s.burden), r: 4.5, fill: AMBER, stroke: "#ffffff", "stroke-width": 1.5 }, gA);
    tx(gA, cx, py + ph + 33, "L=" + Math.round(A), "#3a3a35", "middle", 8.4, 700);

    if (L === W) tx(gA, l.x + 20, l.y + l.h - 22, "读法：先看覆盖效果涨得快不快，再看财政负担什么时候变陡。", "#6b7280", "start", 8.8);

    /* ---------------- 右：两个读数 + 状态 ---------------- */
    panel(gB, r, "#e6e9ee");
    tx(gB, r.x + 20, r.y + 30, "当前位置的两个读数", "#5a6472", "start", 11, 700);
    tx(gB, r.x + 20, r.y + 52, "一个涨得越来越慢，一个涨得越来越快", "#9aa3ae", "start", 8.8, 400);

    var compact = L === N;
    var c1y = r.y + (compact ? 64 : 70), ch = compact ? 70 : 78;
    el("rect", { x: r.x + 20, y: c1y, width: r.w - 40, height: ch, rx: 8, fill: "#ffffff", stroke: BLUE + "55" }, gB);
    tx(gB, r.x + 34, c1y + 21, "覆盖效果", "#5a6472", "start", 8.8);
    tx(gB, r.x + 34, c1y + ch - 14, s.cover.toFixed(1), BLUE, "start", compact ? 20 : 23, 700);
    tx(gB, r.x + 150, c1y + ch - 14, "先快后慢，接近上限", "#6b7280", "start", 8.4);

    var c2y = c1y + ch + 14;
    el("rect", { x: r.x + 20, y: c2y, width: r.w - 40, height: ch, rx: 8, fill: "#ffffff", stroke: AMBER + "55" }, gB);
    tx(gB, r.x + 34, c2y + 21, "财政负担指数", "#5a6472", "start", 8.8);
    tx(gB, r.x + 34, c2y + ch - 14, s.burden.toFixed(1), AMBER, "start", compact ? 20 : 23, 700);
    tx(gB, r.x + 170, c2y + ch - 14, "越往后越陡", "#6b7280", "start", 8.4);

    var sy = c2y + ch + 22;
    el("rect", { x: r.x + 20, y: sy, width: r.w - 40, height: compact ? 74 : 92, rx: 8, fill: st.bg, stroke: st.col + "44" }, gB);
    tx(gB, r.x + 34, sy + 21, "状态判断", "#5a6472", "start", 8.6);
    tx(gB, r.x + 34, sy + 44, st.name, st.col, "start", compact ? 11.5 : 13, 700);
    tx(gB, r.x + 34, sy + (compact ? 64 : 66), st.sn, "#3a3a35", "start", 8.6);

    if (!compact) tx(gB, r.x + 24, sy + 116, "社会保障水平要与经济社会发展水平相适应。", GREEN, "start", 8.8, 700);
  }

  function render() {
    var s = calc(A), st = stateOf(A);
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.cover.toFixed(1);
    $("gxVc").textContent = s.burden.toFixed(1);
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
    loop: [{ t: 0, v: 20 }, { t: 1.2, v: 20 }, { t: 4, v: 55 }, { t: 6.5, v: 55 }, { t: 9, v: 95 }, { t: 11, v: 95 }, { t: 13, v: 20 }],
    keys: [20, 55, 95],
    value: A, min: 0, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { cover: 0, burden: 0 } },
    { v: 50, eq: { cover: 81.1, burden: 47.5 } },
    { v: 100, eq: { cover: 96.4, burden: 120 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
