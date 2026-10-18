/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 318, w: 344, h: 374 } };
  var L = W, A = 3, G = null;

  /* 唯一真值：时间 t（小时）→ 潮高 h（米） */
  function calc(t) {
    var h = 3 * Math.sin(Math.PI * t / 6) + 5;
    return { h: h, ph: Math.PI * t / 6 };
  }

  function state(t) {
    var h = calc(t).h;
    if (h > 7.999) return { n: "高潮", sn: "t = 3 + 12k，h 最大", c: "#b8402f", bg: "#fbeae7" };
    if (h < 2.001) return { n: "低潮", sn: "t = 9 + 12k，h 最小", c: "#2563eb", bg: "#e8f0fe" };
    if (Math.cos(Math.PI * t / 6) > 0) return { n: "涨潮", sn: "sin 在增大，水位上升", c: "#2f8a5b", bg: "#e6f6ee" };
    return { n: "落潮", sn: "sin 在减小，水位下降", c: "#b8791f", bg: "#fdf3e0" };
  }

  function geom() {
    var lo = L.left, ro = R();
    var x0 = lo.x + 44, x1 = lo.x + lo.w - 24, y0 = lo.y + lo.h - 52, y1 = lo.y + 50;
    var gy0 = ro.y + ro.h - 82, gy1 = ro.y + 76;
    return {
      x0: x0, x1: x1, y0: y0, y1: y1,
      gx: ro.x + 72, gy0: gy0, gy1: gy1, rx: ro.x, ry: ro.y, rw: ro.w, rh: ro.h,
      x: function (t) { return x0 + (x1 - x0) * t / 24; },
      y: function (h) { return y0 - (y0 - y1) * h / 9; },
      gy: function (h) { return gy0 - (gy0 - gy1) * h / 9; }
    };
  }
  function R() { return L.right; }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var i, t, d = "", X, Y, res = calc(A), h = res.h, st = state(A), lo = L.left, ro = L.right;

    el("rect", { x: lo.x, y: lo.y, width: lo.w, height: lo.h, rx: 12, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lo.x + 18, lo.y + 24, "潮汐曲线 h = 3sin(πt/6)+5", "#5a6472", "start", 10.4, 700);
    el("line", { x1: G.x0, y1: G.y0, x2: G.x1 + 4, y2: G.y0, stroke: "#8b97a6", "stroke-width": 1.2 }, gA);
    el("polygon", { points: (G.x1 + 14) + "," + G.y0 + " " + (G.x1 + 4) + "," + (G.y0 - 3.5) + " " + (G.x1 + 4) + "," + (G.y0 + 3.5), fill: "#8b97a6" }, gA);
    el("line", { x1: G.x0, y1: G.y0 + 4, x2: G.x0, y2: G.y1 - 4, stroke: "#8b97a6", "stroke-width": 1.2 }, gA);
    el("polygon", { points: G.x0 + "," + (G.y1 - 14) + " " + (G.x0 - 3.5) + "," + (G.y1 - 4) + " " + (G.x0 + 3.5) + "," + (G.y1 - 4), fill: "#8b97a6" }, gA);
    tx(gA, G.x0 - 7, G.y1 - 8, "h/m", "#5a6472", "end", 9, 400);
    tx(gA, G.x1 + 2, G.y0 - 9, "t/h", "#5a6472", "end", 9, 400);

    [[8, "#b8402f"], [5, "#b8791f"], [2, "#2f8a5b"]].forEach(function (p) {
      el("line", { x1: G.x0, y1: G.y(p[0]), x2: G.x1, y2: G.y(p[0]), stroke: p[1], "stroke-width": 1, "stroke-dasharray": "5 4", opacity: 0.55 }, gA);
      tx(gA, G.x0 - 8, G.y(p[0]) + 3.5, String(p[0]), p[1], "end", 9.2, 700);
    });
    tx(gA, G.x0 - 8, G.y0 + 4, "0", "#5a6472", "end", 9, 400);
    [0, 6, 12, 18, 24].forEach(function (k) {
      tx(gA, G.x(k), G.y0 + 16, String(k), "#5a6472", "middle", 9, 400);
    });

    for (i = 0; i <= 48; i++) {
      t = i * 0.5;
      d += (i ? "L" : "M") + G.x(t).toFixed(1) + "," + G.y(calc(t).h).toFixed(1) + " ";
    }
    el("path", { d: d, fill: "none", stroke: "#2563eb", "stroke-width": 2 }, gA);
    [3, 15].forEach(function (k) { el("circle", { cx: G.x(k), cy: G.y(8), r: 3, fill: "#b8402f" }, gA); });
    [9, 21].forEach(function (k) { el("circle", { cx: G.x(k), cy: G.y(2), r: 3, fill: "#2f8a5b" }, gA); });

    X = G.x(A); Y = G.y(h);
    el("line", { x1: X, y1: Y, x2: X, y2: G.y0, stroke: "#8b97a6", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    el("circle", { cx: X, cy: Y, r: 5.5, fill: "#ffffff", stroke: "#2563eb", "stroke-width": 2.4 }, gA);

    /* 右侧：水位标尺 + 三个关键高度 */
    el("rect", { x: ro.x, y: ro.y, width: ro.w, height: ro.h, rx: 12, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, ro.x + 18, ro.y + 24, "水位标尺（米）", "#5a6472", "start", 10.4, 700);
    el("line", { x1: G.gx, y1: G.gy0 + 4, x2: G.gx, y2: G.gy1 - 4, stroke: "#8b97a6", "stroke-width": 1.2 }, gB);
    el("polygon", { points: G.gx + "," + (G.gy1 - 14) + " " + (G.gx - 3.5) + "," + (G.gy1 - 4) + " " + (G.gx + 3.5) + "," + (G.gy1 - 4), fill: "#8b97a6" }, gB);
    for (i = 0; i <= 9; i++) {
      el("line", { x1: G.gx + 22, y1: G.gy(i), x2: G.gx + 28, y2: G.gy(i), stroke: "#c9d3dd", "stroke-width": 1 }, gB);
    }
    el("rect", { x: G.gx - 20, y: G.gy(h), width: 40, height: Math.max(0, G.gy0 - G.gy(h)), rx: 4, fill: st.bg, stroke: st.c, "stroke-width": 1.2 }, gB);
    [[8, "#b8402f"], [5, "#b8791f"], [2, "#2f8a5b"]].forEach(function (p) {
      el("line", { x1: G.gx - 26, y1: G.gy(p[0]), x2: G.gx + 30, y2: G.gy(p[0]), stroke: p[1], "stroke-width": 1, "stroke-dasharray": "5 4", opacity: 0.6 }, gB);
      tx(gB, G.gx - 8, G.gy(p[0]) + 3.5, String(p[0]), p[1], "end", 9.2, 700);
    });
    tx(gB, G.gx - 8, G.gy0 + 4, "0", "#5a6472", "end", 9, 400);

    tx(gB, G.gx + 40, ro.y + 82, "中位线 b = 5", "#b8791f", "start", 9.8, 700);
    tx(gB, G.gx + 40, ro.y + 106, "最高 8（t = 3）", "#b8402f", "start", 9.8, 400);
    tx(gB, G.gx + 40, ro.y + 130, "最低 2（t = 9）", "#2f8a5b", "start", 9.8, 400);
    tx(gB, G.gx + 40, ro.y + 154, "周期 T = 12 小时", "#5a6472", "start", 9.8, 400);

    tx(gB, ro.x + 18, ro.y + ro.h - 58, st.n, st.c, "start", 13, 700);
    tx(gB, ro.x + 18, ro.y + ro.h - 36, "t = " + A.toFixed(1) + " 小时", "#151a21", "start", 10.5, 400);
    tx(gB, ro.x + 18, ro.y + ro.h - 18, "h = " + h.toFixed(1) + " 米，相位 " + res.ph.toFixed(2) + " rad", "#5a6472", "start", 9.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st = state(A);
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = s.h.toFixed(1);
    $("gxVc").textContent = s.ph.toFixed(2);
    $("gxVs").textContent = st.n;
    $("gxVsn").textContent = st.sn;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.c + "44";
    $("gxVs").style.color = st.c;
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 9 }, { t: 11.5, v: 12 }, { t: 13.5, v: 0 }],
    keys: [0, 3, 9, 12],
    value: A, min: 0, max: 24, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { h: 5 } },
    { v: 3, eq: { h: 8 } },
    { v: 6, eq: { h: 5 } },
    { v: 9, eq: { h: 2 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
