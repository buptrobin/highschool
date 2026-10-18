/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0.5, G = null;

  var XS = [1, 2, 3, 4, 5], YS = [2, 3, 5, 6, 8], C0 = 0.3, BX = 1.5, YMAX = 14;

  /* 纯函数：斜率 b → 残差平方和 Q。render() 和 __model.cases 都用它 */
  function qof(b) {
    var q = 0;
    for (var i = 0; i < 5; i++) { var e = YS[i] - C0 - b * XS[i]; q += e * e; }
    return q;
  }
  function calc(v) {
    var b = Math.round(v * 10) / 10;
    return { b: b, q: qof(b), yh: C0 + 3 * b, nobs: 5 };
  }

  function geom() {
    var l = L.left, r = L.right;
    return {
      sx: function (x) { return l.x + 52 + (x / 5.6) * (l.w - 72); },
      sy: function (y) { return l.y + l.h - 30 - (y / YMAX) * (l.h - 62); },
      bx: function (b) { return r.x + 56 + ((b - 0.5) / 2) * (r.w - 80); },
      qy: function (q) { return r.y + r.h - 36 - (q / 60) * (r.h - 70); }
    };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var l = L.left, r = L.right, s = calc(A), i;

    var defs = el("defs", {}, gA);
    var mk = el("marker", { id: "gxAr", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, defs);
    el("path", { d: "M0 0 L10 5 L0 10 z", fill: "#9aa7b4" }, mk);

    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 56, l.y + 24, "散点与直线 ŷ = 0.3 + b·x", "#5a6472", "start", 10.5, 700);

    el("line", { x1: G.sx(0), y1: G.sy(0), x2: G.sx(5.6), y2: G.sy(0), stroke: "#9aa7b4", "stroke-width": 1.2, "marker-end": "url(#gxAr)" }, gA);
    el("line", { x1: G.sx(0), y1: G.sy(0), x2: G.sx(0), y2: G.sy(YMAX), stroke: "#9aa7b4", "stroke-width": 1.2, "marker-end": "url(#gxAr)" }, gA);
    tx(gA, G.sx(0) - 14, G.sy(YMAX) + 4, "y", "#5a6472", "end", 10, 700);
    tx(gA, G.sx(5.6) + 2, G.sy(0) + 4, "x", "#5a6472", "start", 10, 700);
    for (i = 1; i <= 5; i++) tx(gA, G.sx(i), G.sy(0) + 15, String(i), "#5a6472", "middle", 9.2, 400);
    var yt = [2, 4, 6, 8, 10, 12];
    for (i = 0; i < yt.length; i++) {
      tx(gA, G.sx(0) - 6, G.sy(yt[i]) + 3, String(yt[i]), "#5a6472", "end", 9.2, 400);
      el("line", { x1: G.sx(0) - 3, y1: G.sy(yt[i]), x2: G.sx(0), y2: G.sy(yt[i]), stroke: "#c7d2dc", "stroke-width": 1 }, gA);
    }

    /* 当前直线（超出 0..YMAX 的部分截断，避免冲出画布） */
    var x1 = 0.4, x2 = Math.min(5.5, (YMAX - 0.4) / s.b);
    var y1 = C0 + s.b * x1, y2 = C0 + s.b * x2;
    el("line", { x1: G.sx(x1), y1: G.sy(y1), x2: G.sx(x2), y2: G.sy(y2), stroke: "#2563eb", "stroke-width": 2.2 }, gA);

    /* 残差：竖直小线段（观测 − 预测） */
    for (i = 0; i < 5; i++) {
      var px = G.sx(XS[i]), yh = C0 + s.b * XS[i];
      var py = G.sy(YMAX) + (G.sy(0) - G.sy(YMAX));
      el("line", { x1: px, y1: G.sy(YS[i]), x2: px, y2: Math.max(G.sy(yh), G.sy(YMAX)), stroke: "#b8791f", "stroke-width": 2.4, "stroke-dasharray": "3 2" }, gA);
      void py;
      el("circle", { cx: px, cy: G.sy(YS[i]), r: 4.2, fill: "#b8402f" }, gA);
    }

    var cx = G.sx(3), cy = G.sy(4.8);
    el("line", { x1: G.sx(0), y1: cy, x2: cx, y2: cy, stroke: "#2f8a5b", "stroke-width": 1, "stroke-dasharray": "4 3", opacity: 0.7 }, gA);
    el("line", { x1: cx, y1: G.sy(0), x2: cx, y2: cy, stroke: "#2f8a5b", "stroke-width": 1, "stroke-dasharray": "4 3", opacity: 0.7 }, gA);
    el("circle", { cx: cx, cy: cy, r: 6, fill: "none", stroke: "#2f8a5b", "stroke-width": 2 }, gA);
    tx(gA, cx + 9, cy - 6, "样本中心 (3,4.8)", "#2f8a5b", "start", 9, 700);

    /* 右：Q(b) 抛物线 */
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 16, r.y + 24, "Q(b)=Σ(yᵢ−0.3−b·xᵢ)²", "#5a6472", "start", 10.5, 700);
    el("line", { x1: G.bx(0.5), y1: G.qy(0), x2: r.x + r.w - 22, y2: G.qy(0), stroke: "#9aa7b4", "stroke-width": 1.2, "marker-end": "url(#gxAr)" }, gB);
    el("line", { x1: G.bx(0.5), y1: G.qy(0), x2: G.bx(0.5), y2: G.qy(60), stroke: "#9aa7b4", "stroke-width": 1.2, "marker-end": "url(#gxAr)" }, gB);
    tx(gB, G.bx(0.5) - 30, G.qy(60) + 4, "Q", "#5a6472", "end", 10, 700);
    tx(gB, G.bx(2.5) + 14, G.qy(0) + 4, "b", "#5a6472", "start", 10, 700);
    var bt = [0.5, 1.0, 1.5, 2.0, 2.5];
    for (i = 0; i < bt.length; i++) tx(gB, G.bx(bt[i]), G.qy(0) + 15, bt[i].toFixed(1), "#5a6472", "middle", 9.2, 400);
    var qt = [15, 30, 45, 60];
    for (i = 0; i < qt.length; i++) tx(gB, G.bx(0.5) - 6, G.qy(qt[i]) + 3, String(qt[i]), "#5a6472", "end", 9.2, 400);

    var pts = "";
    for (i = 0; i <= 20; i++) {
      var bb = 0.5 + i * 0.1;
      pts += G.bx(bb).toFixed(1) + "," + G.qy(qof(bb)).toFixed(1) + " ";
    }
    el("polyline", { points: pts, fill: "none", stroke: "#2563eb", "stroke-width": 2.2 }, gB);

    el("circle", { cx: G.bx(BX), cy: G.qy(0.3), r: 5, fill: "#2f8a5b" }, gB);
    el("line", { x1: G.bx(BX), y1: G.qy(0.3), x2: G.bx(BX), y2: G.qy(0), stroke: "#2f8a5b", "stroke-width": 1, "stroke-dasharray": "3 3" }, gB);
    tx(gB, G.bx(BX) - 8, G.qy(0.3) - 10, "b̂=1.5，Q=0.3", "#2f8a5b", "middle", 9.4, 700);

    el("circle", { cx: G.bx(s.b), cy: G.qy(s.q), r: 5.6, fill: "#b8402f" }, gB);
    el("line", { x1: G.bx(s.b), y1: G.qy(s.q), x2: G.bx(s.b), y2: G.qy(0), stroke: "#b8402f", "stroke-width": 1.2, "stroke-dasharray": "4 3" }, gB);
    tx(gB, r.x + r.w - 14, r.y + 24, "当前 Q=" + s.q.toFixed(1), "#b8402f", "end", 9.6, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn, d = Math.abs(s.b - BX);
    $("gxVa").textContent = s.b.toFixed(1);
    $("gxVb").textContent = s.q.toFixed(1);
    $("gxVc").textContent = s.yh.toFixed(1);
    if (d < 0.05) { st = "Q 最小"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "最小二乘 · 过 (3,4.8)"; }
    else if (d < 0.6) { st = "偏了一点"; col = "#b8791f"; bg = "#fdf3e0"; sn = "Q 正在变大"; }
    else { st = "偏离很远"; col = "#b8402f"; bg = "#fbeae7"; sn = "残差平方和很大"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
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
    loop: [{ t: 0, v: 0.5 }, { t: 1.2, v: 0.5 }, { t: 4, v: 1.5 }, { t: 6.5, v: 1.5 }, { t: 9, v: 2.5 }, { t: 11.5, v: 1 }, { t: 13.5, v: 0.5 }],
    keys: [0.5, 1, 1.5, 2.5],
    value: A, min: 0.5, max: 2.5, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = Math.round(v * 10) / 10; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0.5, eq: { q: 55.3 } },
    { v: 1.5, eq: { q: 0.3 } },
    { v: 2.5, eq: { q: 55.3 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
