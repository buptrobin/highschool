/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 90;

  /* 纯函数：血浆蛋白浓度 c → 胶体渗透压、水肿指数。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var op = 25 * v / 70;
    var edema = Math.max(0, (70 - v) / 70);
    return { op: op, edema: edema };
  }

  function stateOf(c) {
    if (c >= 65) return { t: "回流正常", col: "#2f8a5b", bg: "#e6f6ee", sn: "胶渗压够，水被留在血管内" };
    if (c >= 45) return { t: "回流偏少", col: "#b8791f", bg: "#fdf3e0", sn: "组织液开始堆积，轻度水肿" };
    return { t: "明显水肿", col: "#b8402f", bg: "#fbeae7", sn: "胶渗压过低，水留在组织液" };
  }

  /* 坐标全由面板尺寸算，宽窄两套都不硬缩 */
  function geom() {
    var l = L.left, r = L.right, g = {};
    g.vessel = { x: l.x + 24, y: l.y + 52, w: l.w - 48, h: 44 };
    g.tissue = { x: l.x + 24, y: g.vessel.y + g.vessel.h + 40, w: l.w - 48, h: 0 };
    g.tissue.h = (l.y + l.h - 34) - g.tissue.y;
    g.px = r.x + 48; g.py = r.y + 54; g.pw = r.w - 84; g.ph = r.h - 172;
    g.bar1 = { x: g.px, y: g.py + g.ph + 40, w: g.pw, h: 13 };
    g.bar2 = { x: g.px, y: g.bar1.y + 40, w: g.pw, h: 13 };
    return g;
  }

  function xOf(c) { return G.px + (c - 30) / 60 * G.pw; }
  function yOf(op) { return G.py + G.ph - Math.min(op, 34) / 34 * G.ph; }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), st = stateOf(A), l = L.left, r = L.right, g = G;

    /* ---------- 左：毛细血管（两根平行线）+ 组织液 ---------- */
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 20, l.y + 30, "血管与组织液（示意）", "#5a6472", "start", 10.5, 700);

    var v = g.vessel;
    el("rect", { x: v.x, y: v.y, width: v.w, height: v.h, fill: "#fdf1f1" }, gA);
    el("line", { x1: v.x, y1: v.y, x2: v.x + v.w, y2: v.y, stroke: "#c98b8b", "stroke-width": 2 }, gA);
    el("line", { x1: v.x, y1: v.y + v.h, x2: v.x + v.w, y2: v.y + v.h, stroke: "#c98b8b", "stroke-width": 2 }, gA);
    tx(gA, v.x + 10, v.y + v.h / 2 + 4, "血浆", "#b8402f", "start", 10.5, 700);
    tx(gA, v.x, v.y - 8, "● 越多 = 血浆蛋白越多", "#b8402f", "start", 8.5, 400);

    var n = Math.max(3, Math.round(A / 6)), cols = 5, dx = 26, dy = 14, i, cx, cy;
    for (i = 0; i < n; i++) {
      cx = v.x + v.w - 22 - (i % cols) * dx;
      cy = v.y + 14 + Math.floor(i / cols) * dy;
      if (cy < v.y + v.h - 6) el("circle", { cx: cx, cy: cy, r: 2.8, fill: "#b8402f", opacity: 0.8 }, gA);
    }

    /* 组织液：水面高度随水肿指数上升 */
    var t = g.tissue, lv = Math.min(1, 0.10 + (s.edema / 0.5714) * 0.9);
    el("rect", { x: t.x, y: t.y, width: t.w, height: t.h, rx: 6, fill: "#ffffff", stroke: "#cfe0ea" }, gA);
    el("rect", { x: t.x, y: t.y + t.h * (1 - lv), width: t.w, height: t.h * lv, fill: "#cfe6f7" }, gA);
    tx(gA, t.x + 10, t.y + 20, "组织液", "#2f6f9f", "start", 10.5, 700);
    tx(gA, t.x + 10, t.y + t.h - 10, "水面越高 = 水积得越多", "#1f4e6b", "start", 8.5, 400);

    /* 两个箭头：向上的回流（越粗越强）、向下的渗出 */
    var x1 = v.x + v.w * 0.28, x2 = v.x + v.w * 0.68;
    var wUp = 1 + 3.6 * (A / 90), topY = v.y + v.h + 6, botY = t.y - 6;
    el("line", { x1: x1, y1: botY, x2: x1, y2: topY + 8, stroke: "#2f6f9f", "stroke-width": wUp }, gA);
    el("polygon", { points: x1 + "," + topY + " " + (x1 - wUp * 1.9) + "," + (topY + 10) + " " + (x1 + wUp * 1.9) + "," + (topY + 10), fill: "#2f6f9f" }, gA);
    el("line", { x1: x2, y1: topY + 2, x2: x2, y2: botY - 8, stroke: "#b8791f", "stroke-width": 1.2 }, gA);
    el("polygon", { points: x2 + "," + botY + " " + (x2 - 4) + "," + (botY - 9) + " " + (x2 + 4) + "," + (botY - 9), fill: "#b8791f" }, gA);
    tx(gA, v.x + 2, v.y + v.h + 20, "↑ 回流量", "#2f6f9f", "start", 8.5, 700);
    tx(gA, v.x + 2, v.y + v.h + 36, "↓ 渗出量", "#b8791f", "start", 8.5, 400);

    /* ---------- 右：op–c 曲线 + 两根指示条 ---------- */
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 20, r.y + 30, "胶体渗透压 op 随 c 变化", "#5a6472", "start", 10.5, 700);

    el("line", { x1: g.px, y1: g.py + g.ph, x2: g.px + g.pw, y2: g.py + g.ph, stroke: "#cfd8e0" }, gB);
    el("line", { x1: g.px, y1: g.py, x2: g.px, y2: g.py + g.ph, stroke: "#cfd8e0" }, gB);
    el("line", { x1: g.px, y1: yOf(25), x2: g.px + g.pw, y2: yOf(25), stroke: "#e8c4c4", "stroke-dasharray": "4 4" }, gB);
    el("line", { x1: xOf(65), y1: g.py, x2: xOf(65), y2: g.py + g.ph, stroke: "#b8791f", "stroke-dasharray": "4 4" }, gB);
    tx(gB, g.px + g.pw - 4, yOf(25) - 6, "25 mmHg", "#b8402f", "end", 8.5, 400);
    tx(gB, xOf(65) + 6, g.py + 14, "c=65 起回流偏少", "#b8791f", "start", 8.5, 400);

    var c30 = calc(30), c90 = calc(90);
    el("polyline", { points: xOf(30) + "," + yOf(c30.op) + " " + xOf(90) + "," + yOf(c90.op), fill: "none", stroke: "#2f6f9f", "stroke-width": 2 }, gB);
    el("circle", { cx: xOf(A), cy: yOf(s.op), r: 4.6, fill: st.col }, gB);

    tx(gB, g.px, g.py + g.ph + 16, "30", "#8a929c", "middle", 8.5, 400);
    tx(gB, xOf(50), g.py + g.ph + 16, "50", "#8a929c", "middle", 8.5, 400);
    tx(gB, xOf(70), g.py + g.ph + 16, "70", "#8a929c", "middle", 8.5, 400);
    tx(gB, g.px + g.pw, g.py + g.ph + 16, "90 g/L", "#8a929c", "middle", 8.5, 400);
    tx(gB, g.px - 8, g.py + g.ph + 3, "0", "#8a929c", "end", 8.5, 400);

    var b1 = g.bar1, b2 = g.bar2;
    tx(gB, b1.x, b1.y - 7, "胶体渗透压 op（mmHg）", "#5a6472", "start", 8.5, 400);
    el("rect", { x: b1.x, y: b1.y, width: b1.w, height: b1.h, rx: 4, fill: "#eef2f6" }, gB);
    el("rect", { x: b1.x, y: b1.y, width: Math.max(2, b1.w * Math.min(1, s.op / 34)), height: b1.h, rx: 4, fill: "#b8402f" }, gB);
    tx(gB, b1.x + b1.w, b1.y - 7, s.op.toFixed(1), "#b8402f", "end", 9, 700);

    tx(gB, b2.x, b2.y - 7, "水肿指数 edema（0–1）", "#5a6472", "start", 8.5, 400);
    el("rect", { x: b2.x, y: b2.y, width: b2.w, height: b2.h, rx: 4, fill: "#eef2f6" }, gB);
    el("rect", { x: b2.x, y: b2.y, width: Math.max(2, b2.w * Math.min(1, s.edema / 0.5714)), height: b2.h, rx: 4, fill: "#b8791f" }, gB);
    tx(gB, b2.x + b2.w, b2.y - 7, s.edema.toFixed(2), "#b8791f", "end", 9, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st = stateOf(A);
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.op.toFixed(1);
    $("gxVc").textContent = s.edema.toFixed(2);
    $("gxVs").textContent = st.t;
    $("gxVsn").textContent = st.sn;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.col + "44";
    $("gxVs").style.color = st.col;
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
    loop: [{ t: 0, v: 90 }, { t: 1.2, v: 90 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 30 }, { t: 11, v: 40 }, { t: 13, v: 90 }],
    keys: [30, 50, 70, 90],
    value: A, min: 30, max: 90, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 70, eq: { op: 25, edema: 0 } },
    { v: 50, eq: { op: 17.857, edema: 0.2857 } },
    { v: 30, eq: { op: 10.714, edema: 0.5714 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
