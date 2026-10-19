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
    cfg: { barX: 26, barW: 372, barH: 44, y1: 96, y2: 186 }
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 316 },
    right: { x: 8, y: 336, w: 344, h: 356 },
    cfg: { barX: 18, barW: 308, barH: 38, y1: 78, y2: 156 }
  };
  var L = W, A = 10;

  var LOW = "#d9a79c", LOW_FILL = "#fbeae7";
  var MID = "#0891b2", MID_FILL = "#b8e6f2";
  var HIGH = "#b8791f", HIGH_FILL = "#f0dcb4";
  var GREEN = "#2f8a5b", RED = "#b8402f";

  /* 纯函数：再分配力度 → 基尼系数、中等收入群体占比、低收入群体收入占比 */
  function calc(v) {
    var r = Math.max(0, Math.min(100, +v));
    return { gini: 0.47 - 0.0017 * r, mid: 30 + 0.25 * r, low: 15 + 0.20 * r };
  }

  function stateOf(r) {
    if (r < 30) return { name: "差距较大", sn: "再分配力度不足，低收入者占比偏低", col: RED, bg: "#fbeae7" };
    if (r > 70) return { name: "分配格局较合理", sn: "中等收入群体扩大，注意兼顾效率", col: GREEN, bg: "#e6f6ee" };
    return { name: "差距缩小中", sn: "提低、扩中、调高正在见效", col: "#b8791f", bg: "#fdf3e0" };
  }

  function panel(g, r, edge) {
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#f8fbfd", stroke: edge }, g);
  }

  function seg(g, x, y, w, h, share, fill, line) {
    var sw = w * share / 100;
    if (sw < 1) return;
    el("rect", { x: x, y: y, width: sw, height: h, fill: fill, stroke: line, "stroke-width": 1 }, g);
  }

  function drawBar(g, x, y, w, h, s, title) {
    var high = 100 - s.mid - s.low;
    tx(g, x, y - 8, title, "#5a6472", "start", 9, 700);
    el("rect", { x: x, y: y, width: w, height: h, rx: 6, fill: "#eef2f6", stroke: "#c9d2da" }, g);
    var x1 = x, wLow = w * s.low / 100;
    var wMid = w * s.mid / 100;
    seg(g, x1, y, w, h, s.low, LOW_FILL, LOW);
    seg(g, x1 + wLow, y, w, h, s.mid, MID_FILL, MID);
    seg(g, x1 + wLow + wMid, y, w, h, high, HIGH_FILL, HIGH);
    /* 段内标签：够宽才放里面 */
    if (wLow > 46) tx(g, x1 + wLow / 2, y + h / 2 + 4, Math.round(s.low) + "%", "#8f2f21", "middle", 9, 700);
    if (wMid > 46) tx(g, x1 + wLow + wMid / 2, y + h / 2 + 4, Math.round(s.mid) + "%", "#0b6580", "middle", 9, 700);
    var wHigh = w - wLow - wMid;
    if (wHigh > 46) tx(g, x1 + wLow + wMid + wHigh / 2, y + h / 2 + 4, Math.round(high) + "%", "#8a5c14", "middle", 9, 700);
    return { low: wLow, mid: wMid, high: wHigh };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), st = stateOf(A), l = L.left, r = L.right, c = L.cfg;

    /* ---------------- 左：再分配前后两条堆叠条 ---------------- */
    panel(gA, l, "#dbe7ef");
    tx(gA, l.x + 20, l.y + 30, "同样一块蛋糕，再分配前后怎么分", "#5a6472", "start", 11, 700);
    tx(gA, l.x + 20, l.y + 49, "红＝低收入，蓝＝中等收入，黄＝高收入", "#9aa3ae", "start", 9.2, 400);

    var bx = l.x + c.barX;
    drawBar(gA, bx, l.y + c.y1, c.barW, c.barH, calc(0), "再分配前（r=0）");
    drawBar(gA, bx, l.y + c.y2, c.barW, c.barH, s, "再分配后（r=" + Math.round(A) + "）");

    /* 中间箭头与三句话 */
    var midY = l.y + (c.y1 + c.y2 + c.barH) / 2;
    tx(gA, l.x + l.w / 2, midY, "↓ 提低 · 扩中 · 调高 ↓", "#b8791f", "middle", 9.6, 700);

    /* 图例 */
    var ly = l.y + c.y2 + c.barH + 34;
    [["低收入", LOW_FILL, LOW], ["中等收入", MID_FILL, MID], ["高收入", HIGH_FILL, HIGH]].forEach(function (row, i) {
      var lx = bx + i * 112;
      el("rect", { x: lx, y: ly - 9, width: 12, height: 12, rx: 3, fill: row[1], stroke: row[2] }, gA);
      tx(gA, lx + 18, ly + 2, row[0], "#5a6472", "start", 8.8);
    });

    tx(gA, l.x + 20, l.y + l.h - 50, "基尼系数越低，收入差距越小；0 是绝对平均，1 是绝对不平均。", "#6b7280", "start", 8.6);
    tx(gA, l.x + 20, l.y + l.h - 28, "我国近年居民收入基尼系数大致在 0.46–0.47 附近。", "#6b7280", "start", 8.6);

    /* ---------------- 右：基尼系数仪表 + 中等收入群体 ---------------- */
    panel(gB, r, "#e6e9ee");
    tx(gB, r.x + 20, r.y + 30, "两个读数：差距和中间群体", "#5a6472", "start", 11, 700);
    tx(gB, r.x + 20, r.y + 52, "一个往下，一个往上", "#9aa3ae", "start", 9.2, 400);

    /* 基尼系数卡 */
    var compact = L === N;
    var cardY = r.y + (compact ? 64 : 70), cardH = compact ? 80 : 92;
    el("rect", { x: r.x + 20, y: cardY, width: r.w - 40, height: cardH, rx: 8, fill: "#ffffff", stroke: "#dbe7ef" }, gB);
    tx(gB, r.x + 34, cardY + 22, "基尼系数", "#5a6472", "start", 8.8);
    tx(gB, r.x + 34, cardY + (compact ? 56 : 60), s.gini.toFixed(2), st.col, "start", compact ? 25 : 28, 700);
    tx(gB, r.x + 140, cardY + (compact ? 42 : 48), st.name, st.col, "start", 12.5, 700);
    tx(gB, r.x + 140, cardY + (compact ? 62 : 68), "从 0.47 往 0.30 走", "#6b7280", "start", 8.6);

    /* 仪表：0.30–0.50 */
    var gx = r.x + 40, gw = r.w - 80, gy = cardY + cardH + (compact ? 26 : 30);
    el("line", { x1: gx, y1: gy, x2: gx + gw, y2: gy, stroke: "#dbe7ef", "stroke-width": 8, "stroke-linecap": "round" }, gB);
    var zp = Math.max(0, Math.min(1, (s.gini - 0.30) / 0.20));
    el("circle", { cx: gx + gw * zp, cy: gy, r: 7, fill: "#ffffff", stroke: st.col, "stroke-width": 3 }, gB);
    tx(gB, gx, gy + 20, "0.30", "#9aa3ae", "start", 8.2);
    tx(gB, gx + gw / 2, gy + 20, "0.40", "#9aa3ae", "middle", 8.2);
    tx(gB, gx + gw, gy + 20, "0.50", "#9aa3ae", "end", 8.2);

    /* 中等收入群体条 */
    var my = gy + (compact ? 52 : 60);
    tx(gB, r.x + 24, my, "中等收入群体占比", "#5a6472", "start", 9, 700);
    tx(gB, r.x + r.w - 24, my, Math.round(s.mid) + "%", MID, "end", 11, 700);
    el("rect", { x: r.x + 24, y: my + 10, width: r.w - 48, height: 20, rx: 5, fill: "#eef2f6" }, gB);
    el("rect", { x: r.x + 24, y: my + 10, width: (r.w - 48) * s.mid / 60, height: 20, rx: 5, fill: MID_FILL, stroke: MID }, gB);
    if (!compact) tx(gB, r.x + 24, my + 48, "目标：中间大、两头小的橄榄型", "#6b7280", "start", 8.6);

    /* 状态卡 */
    var sy = my + (compact ? 56 : 70);
    el("rect", { x: r.x + 20, y: sy, width: r.w - 40, height: compact ? 78 : 84, rx: 8, fill: st.bg, stroke: st.col + "44" }, gB);
    tx(gB, r.x + 34, sy + 20, "状态判断", "#5a6472", "start", 8.6);
    tx(gB, r.x + 34, sy + 43, st.name, st.col, "start", 13, 700);
    tx(gB, r.x + 34, sy + 65, st.sn, "#3a3a35", "start", 8.8);
  }

  function render() {
    var s = calc(A), st = stateOf(A);
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.gini.toFixed(2);
    $("gxVc").textContent = s.mid.toFixed(1) + "%";
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
    loop: [{ t: 0, v: 10 }, { t: 1.2, v: 10 }, { t: 4, v: 55 }, { t: 6.5, v: 55 }, { t: 9, v: 90 }, { t: 11, v: 90 }, { t: 13, v: 10 }],
    keys: [10, 55, 90],
    value: A, min: 0, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { gini: 0.47, mid: 30, low: 15 } },
    { v: 50, eq: { gini: 0.385, mid: 42.5, low: 25 } },
    { v: 100, eq: { gini: 0.3, mid: 55, low: 35 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
