/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", narrow: false, left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", narrow: true, left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 3;

  /* 纯函数：血糖浓度 → 两种激素的相对分泌量（%） */
  function ins(g) { return 100 / (1 + Math.exp(-(g - 5.5) / 0.6)); }
  function calc(v) { var i = ins(v); return { g: v, ins: i, glu: 100 - i }; }

  function geom() {
    var n = L.narrow;
    return {
      x0: L.left.x + (n ? 46 : 58),
      x1: L.left.x + L.left.w - (n ? 18 : 26),
      y0: L.left.y + (n ? 56 : 60),
      y1: L.left.y + L.left.h - (n ? 48 : 46)
    };
  }
  function X(g) { return G.x0 + (g - 3) / 7 * (G.x1 - G.x0); }
  function Y(v) { return G.y1 - v / 100 * (G.y1 - G.y0); }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A);
    gA.textContent = ""; gB.textContent = "";
    var lf = L.left, rt = L.right, n = L.narrow;
    var g, c, pi = [], pg = [];

    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lf.x + 16, lf.y + 24, "分泌量 / %", "#5a6472", "start", 10.5, 700);
    el("rect", { x: lf.x + 16, y: lf.y + 34, width: 8, height: 8, rx: 2, fill: "#2f8a5b" }, gA);
    tx(gA, lf.x + 28, lf.y + 42, "胰岛素", "#1f6b45", "start", 9, 400);
    el("rect", { x: lf.x + 92, y: lf.y + 34, width: 8, height: 8, rx: 2, fill: "#b8791f" }, gA);
    tx(gA, lf.x + 104, lf.y + 42, "胰高血糖素", "#8a5a12", "start", 9, 400);

    el("rect", { x: X(3.9), y: G.y0, width: X(6.1) - X(3.9), height: G.y1 - G.y0, fill: "#e6f6ee", opacity: 0.9 }, gA);
    tx(gA, (X(3.9) + X(6.1)) / 2, G.y1 - 7, "正常 3.9–6.1", "#1f6b45", "middle", 8, 700);
    el("line", { x1: G.x0 - 4, y1: G.y0, x2: G.x0 - 4, y2: G.y1, stroke: "#9aa6b4", "stroke-width": 1.2 }, gA);
    el("line", { x1: G.x0 - 4, y1: G.y1, x2: G.x1 + 10, y2: G.y1, stroke: "#9aa6b4", "stroke-width": 1.2 }, gA);
    el("line", { x1: G.x0 - 4, y1: Y(50), x2: G.x1 + 6, y2: Y(50), stroke: "#c9d6e2", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    tx(gA, G.x0 - 8, Y(50) + 3, "50", "#7b8694", "end", 8.4, 400);
    tx(gA, G.x0 - 8, G.y1 + 3, "0", "#7b8694", "end", 8.4, 400);
    tx(gA, G.x0 - 8, G.y0 + 3, "100", "#7b8694", "end", 8.4, 700);

    for (g = 3; g <= 10.05; g += 0.25) {
      c = calc(g);
      pi.push(X(g).toFixed(1) + "," + Y(c.ins).toFixed(1));
      pg.push(X(g).toFixed(1) + "," + Y(c.glu).toFixed(1));
    }
    el("polyline", { points: pg.join(" "), fill: "none", stroke: "#b8791f", "stroke-width": 2 }, gA);
    el("polyline", { points: pi.join(" "), fill: "none", stroke: "#2f8a5b", "stroke-width": 2 }, gA);

    el("line", { x1: X(A), y1: G.y0 - 4, x2: X(A), y2: G.y1, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: X(A), cy: Y(s.ins), r: 4.5, fill: "#2f8a5b" }, gA);
    el("circle", { cx: X(A), cy: Y(s.glu), r: 4.5, fill: "#b8791f" }, gA);

    tx(gA, X(3), G.y1 + 15, "3", "#5a6472", "middle", 8.6, 400);
    tx(gA, X(5.5), G.y1 + 15, "5.5", "#b8402f", "middle", 8.6, 700);
    tx(gA, X(10), G.y1 + 15, "10", "#5a6472", "middle", 8.6, 400);
    tx(gA, G.x1 + 6, G.y1 + 30, "血糖 G /（mmol·L⁻¹）", "#7b8694", "end", 8.6, 400);

    el("rect", { x: rt.x, y: rt.y, width: rt.w, height: rt.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rt.x + 16, rt.y + 24, "当前血糖下的读数", "#5a6472", "start", 10.5, 700);
    var bx = rt.x + (n ? 78 : 98), bw = rt.w - (n ? 100 : 126);
    var b1 = rt.y + (n ? 54 : 62), b2 = b1 + (n ? 48 : 56);

    tx(gB, rt.x + 16, b1 + 15, "胰岛素", "#1f6b45", "start", 9.4, 700);
    el("rect", { x: bx, y: b1, width: bw, height: 22, rx: 5, fill: "#eef2f6" }, gB);
    el("rect", { x: bx, y: b1, width: Math.max(1, bw * s.ins / 100), height: 22, rx: 5, fill: "#8fceb0" }, gB);
    tx(gB, bx + bw - 6, b1 + 15, s.ins.toFixed(0) + "%", "#1f6b45", "end", 9.6, 700);

    tx(gB, rt.x + 16, b2 + 15, "胰高血糖素", "#8a5a12", "start", 9.4, 700);
    el("rect", { x: bx, y: b2, width: bw, height: 22, rx: 5, fill: "#eef2f6" }, gB);
    el("rect", { x: bx, y: b2, width: Math.max(1, bw * s.glu / 100), height: 22, rx: 5, fill: "#e8c58d" }, gB);
    tx(gB, bx + bw - 6, b2 + 15, s.glu.toFixed(0) + "%", "#8a5a12", "end", 9.6, 700);

    var cx = rt.x + rt.w / 2, ny = b2 + (n ? 62 : 68), hw = (rt.w - (n ? 76 : 104)) / 2;
    var d = (s.ins - s.glu) / 100, w2 = Math.abs(d) * hw;
    el("line", { x1: cx, y1: ny - 6, x2: cx, y2: ny + 26, stroke: "#9aa6b4", "stroke-width": 1 }, gB);
    el("rect", { x: d >= 0 ? cx - w2 : cx, y: ny, width: Math.max(1, w2), height: 20, rx: 4, fill: d >= 0 ? "#2f8a5b" : "#b8791f", opacity: 0.75 }, gB);
    tx(gB, cx - hw, ny - 12, "← 降血糖", "#1f6b45", "start", 8.4, 400);
    tx(gB, cx + hw, ny - 12, "升血糖 →", "#8a5a12", "end", 8.4, 400);

    var cap = d > 0.02 ? "净效应：胰岛素占优，血糖被拉低" : (d < -0.02 ? "净效应：胰高血糖素占优，血糖被拉高" : "净效应：两者势均力敌，守在调定点");
    tx(gB, cx, ny + 42, cap, d >= 0 ? "#1f6b45" : "#8a5a12", "middle", 9.4, 700);

    var ex = rt.x + 16, ew = rt.w - 32;
    wrap(gB, ex, ny + 72, "胰岛素降血糖、胰高血糖素升血糖，方向相反", ew, 9, "#5a6472", 15);
    wrap(gB, ex, ny + 106, "交点 G=5.5：两种激素各 50%，正处调定点", ew, 9, "#5a6472", 15);
    wrap(gB, ex, ny + 140, "G 偏离 → 比值偏向一边 → 把血糖拉回", ew, 9, "#5a6472", 15);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = s.ins.toFixed(1);
    $("gxVc").textContent = s.glu.toFixed(1);
    if (A < 3.9) { st = "低血糖"; col = "#b8402f"; bg = "#fbeae7"; sn = "胰高血糖素占优"; }
    else if (A <= 6.1) { st = "正常范围"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "二者平衡"; }
    else { st = "血糖偏高"; col = "#b8791f"; bg = "#fdf3e0"; sn = "胰岛素占优"; }
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
    loop: [{ t: 0, v: 3 }, { t: 1.2, v: 3 }, { t: 4, v: 5.5 }, { t: 6.5, v: 5.5 }, { t: 9, v: 10 }, { t: 11, v: 8 }, { t: 13, v: 3 }],
    keys: [3, 5.5, 8, 10],
    value: A, min: 3, max: 10, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = Math.round(v * 10) / 10; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 4, eq: { ins: 7.59 } },
    { v: 5.5, eq: { ins: 50 } },
    { v: 8, eq: { ins: 98.47 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
