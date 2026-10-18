/* 群落的结构 · 生态位重叠度 → 竞争强度 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", P: { x: 16, y: 16, w: 424, h: 438 }, Q: { x: 456, y: 16, w: 408, h: 438 },
    pad: 40, axW: 344, rowA: { y: 104, h: 56 }, rowB: { y: 180, h: 56 },
    axisY: 262, gaugeY: 368, gaugeH: 16, plot: { x0: 500, x1: 820, y0: 300, y1: 90 } };
  var N = { vb: "0 0 360 700", P: { x: 8, y: 8, w: 344, h: 300 }, Q: { x: 8, y: 320, w: 344, h: 372 },
    pad: 32, axW: 280, rowA: { y: 72, h: 42 }, rowB: { y: 124, h: 42 },
    axisY: 188, gaugeY: 264, gaugeH: 14, plot: { x0: 44, x1: 328, y0: 580, y1: 420 } };

  var G = null, L = null, A = 20;

  /* 唯一真值：重叠度 o(%) → 竞争强度、能否共存 */
  function calc(v) {
    var o = Math.max(0, Math.min(100, v));
    var comp = o / 100;
    return { o: o, comp: comp, coexist: comp < 0.8 ? 1 : 0, gap: Math.max(0, 80 - o) };
  }

  function geom() {
    var b = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    return { vb: b.vb, P: b.P, Q: b.Q, pad: b.pad, axW: b.axW, rowA: b.rowA, rowB: b.rowB,
      axisY: b.axisY, gaugeY: b.gaugeY, gaugeH: b.gaugeH, plot: b.plot };
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var P = G.P, Q = G.Q, pt = G.plot, fs = G.axW > 300 ? 9.6 : 9;
    el("rect", { x: P.x, y: P.y, width: P.w, height: P.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: Q.x, y: Q.y, width: Q.w, height: Q.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);

    var ax0 = P.x + G.pad, ax1 = ax0 + G.axW, bw = Math.round(G.axW * 0.45);
    var ov = bw * s.comp, bx = ax0 + bw - ov;

    tx(gA, P.x + 18, P.y + 28, "两个物种的生态位在资源轴上重叠", "#5a6472", "start", 10.2, 700);
    tx(gA, ax0, G.rowA.y - 8, "物种 A", "#1e5c3f", "start", 9.4, 700);
    tx(gA, ax0, G.rowB.y - 8, "物种 B", "#2c4a7a", "start", 9.4, 700);
    el("rect", { x: ax0, y: G.rowA.y, width: bw, height: G.rowA.h, rx: 6, fill: "#e8f4ec", stroke: "#2f8a5b" }, gA);
    el("rect", { x: bx, y: G.rowB.y, width: bw, height: G.rowB.h, rx: 6, fill: "#eef2fb", stroke: "#2c4a7a" }, gA);
    if (ov > 1) {
      el("rect", { x: bx, y: G.rowA.y, width: ov, height: G.rowB.y + G.rowB.h - G.rowA.y,
        fill: "#b8402f", "fill-opacity": 0.16, stroke: "#b8402f", "stroke-dasharray": "3 2" }, gA);
    }
    var cy = G.rowB.y + G.rowB.h + 16, cx = Math.min(Math.max(bx + ov / 2, ax0 + 24), ax1 - 24);
    tx(gA, cx, cy, ov > 1 ? "重叠区" : "无重叠", "#b8402f", "middle", 9, 700);

    el("line", { x1: ax0, y1: G.axisY, x2: ax1, y2: G.axisY, stroke: "#8a97a3", "stroke-width": 1.2 }, gA);
    tx(gA, ax0, G.axisY + 16, "0", "#5a6470", "middle", 9, 400);
    tx(gA, (ax0 + ax1) / 2, G.axisY + 16, "资源（食物大小）", "#5a6470", "middle", 9, 400);
    tx(gA, ax1, G.axisY + 16, "宽", "#5a6470", "middle", 9, 400);
    tx(gA, ax0, G.axisY + 34, "重叠宽度 = o% × 生态位宽度", "#3a3a35", "start", fs, 400);

    tx(gA, ax0, G.gaugeY - 10, "竞争强度", "#5a6472", "start", 9.4, 700);
    el("rect", { x: ax0, y: G.gaugeY, width: G.axW, height: G.gaugeH, rx: 4, fill: "#eef1f4", stroke: "#dde4ea" }, gA);
    el("rect", { x: ax0, y: G.gaugeY, width: Math.max(2, G.axW * s.comp), height: G.gaugeH, rx: 4,
      fill: s.comp < 0.8 ? "#2f8a5b" : "#b8402f" }, gA);
    var thr = ax0 + G.axW * 0.8;
    el("line", { x1: thr, y1: G.gaugeY - 4, x2: thr, y2: G.gaugeY + G.gaugeH + 4, stroke: "#b8402f", "stroke-width": 1.4, "stroke-dasharray": "4 3" }, gA);
    tx(gA, thr, G.gaugeY + G.gaugeH + 16, "0.8 临界", "#b8402f", "middle", 8.6, 700);

    /* 右面板：竞争强度 = o ÷ 100 */
    tx(gB, Q.x + 18, Q.y + 30, "竞争强度 = 重叠度 ÷ 100", "#5a6472", "start", 10.2, 700);
    el("line", { x1: pt.x0, y1: pt.y0, x2: pt.x1, y2: pt.y0, stroke: "#8a97a3", "stroke-width": 1.2 }, gB);
    el("line", { x1: pt.x0, y1: pt.y0, x2: pt.x0, y2: pt.y1, stroke: "#8a97a3", "stroke-width": 1.2 }, gB);
    el("line", { x1: pt.x0, y1: pt.y0, x2: pt.x1, y2: pt.y1, stroke: "#2c4a7a", "stroke-width": 2 }, gB);
    var tx8 = pt.x0 + (pt.x1 - pt.x0) * 0.8, ty8 = pt.y0 - (pt.y0 - pt.y1) * 0.8;
    el("line", { x1: tx8, y1: pt.y1, x2: tx8, y2: pt.y0, stroke: "#b8402f", "stroke-width": 1.3, "stroke-dasharray": "5 4" }, gB);
    tx(gB, Q.x + 18, pt.y1 - 6, "竞争强度 0–1", "#5a6470", "start", 9, 400);
    tx(gB, tx8, pt.y1 - 6, "o>80", "#b8402f", "middle", 8.8, 700);
    tx(gB, pt.x0, pt.y0 + 16, "0", "#5a6470", "middle", 9, 400);
    tx(gB, pt.x1, pt.y0 + 16, "100", "#5a6470", "middle", 9, 400);
    tx(gB, (pt.x0 + pt.x1) / 2, pt.y0 + 34, "生态位重叠度 o / %", "#3a3a35", "middle", 9.2, 400);

    var cx2 = pt.x0 + (pt.x1 - pt.x0) * s.comp, cy2 = pt.y0 - (pt.y0 - pt.y1) * s.comp;
    el("circle", { cx: cx2, cy: cy2, r: 4.4, fill: "#b8402f" }, gB);
    tx(gB, pt.x0, pt.y0 + 58, "o = " + Math.round(s.o) + "%  →  竞争强度 " + s.comp.toFixed(2), "#3a3a35", "start", 9.6, 700);
    tx(gB, pt.x0, pt.y0 + 78, s.coexist ? "判据：竞争强度 < 0.8，可长期共存" : "判据：竞争强度 ≥ 0.8，难长期共存", s.coexist ? "#2f8a5b" : "#b8402f", "start", 9.4, 700);
  }

  function state(s) {
    if (s.o < 30) return { t: "几乎不竞争", c: "#2f8a5b", bg: "#e6f6ee", n: "重叠小，容易共存" };
    if (s.o <= 80) return { t: "部分重叠", c: "#b8791f", bg: "#fdf3e0", n: "已出现明显资源竞争" };
    return { t: "严重重叠", c: "#b8402f", bg: "#fbeae7", n: "通常一方被排除或分化" };
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    stage.setAttribute("viewBox", G.vb);
    var s = calc(A), st = state(s);
    $("gxVa").textContent = String(Math.round(s.o));
    $("gxVb").textContent = s.comp.toFixed(2);
    $("gxVc").textContent = (80 - Math.round(s.o) > 0 ? "+" : "") + (80 - Math.round(s.o));
    $("gxVs").textContent = st.t;
    $("gxVsn").textContent = st.n;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.c + "44";
    $("gxVs").style.color = st.c;
    draw(s);
  }

  function layout() { G = null; render(); }

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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 100 }, { t: 11, v: 70 }, { t: 13, v: 0 }],
    keys: [0, 50, 70, 100],
    value: A, min: 0, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = window.__bio = {
    calc: calc,
    cases: [
      { v: 0, eq: { comp: 0 } },
      { v: 50, eq: { comp: 0.5 } },
      { v: 90, eq: { comp: 0.9 } }
    ]
  };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
