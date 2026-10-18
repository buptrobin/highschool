/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 1;

  /* 纯函数：参数 p → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    return { p: v, coef: 2 * v, fx: v / 2, dir: -v / 2, r1: 1 + v / 2 };
  }

  function n(x) {
    return Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(1);
  }

  function geom() {
    var wide = (L === W), lf = L.left;
    var k = wide ? 22 : 16;
    return {
      k: k,
      ox: lf.x + (wide ? 150 : 130),
      oy: lf.y + lf.h * 0.5,
      x0: lf.x + 10, x1: lf.x + lf.w - 10,
      y0: lf.y + 10, y1: lf.y + lf.h - 10
    };
  }

  function arrowX(g, x, y) {
    el("line", { x1: x - 9, y1: y - 4, x2: x, y2: y, stroke: "#5a6472", "stroke-width": 1.2 }, g);
    el("line", { x1: x - 9, y1: y + 4, x2: x, y2: y, stroke: "#5a6472", "stroke-width": 1.2 }, g);
  }
  function arrowY(g, x, y) {
    el("line", { x1: x - 4, y1: y + 9, x2: x, y2: y, stroke: "#5a6472", "stroke-width": 1.2 }, g);
    el("line", { x1: x + 4, y1: y + 9, x2: x, y2: y, stroke: "#5a6472", "stroke-width": 1.2 }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), g = G, lf = L.left, rb = L.right;
    var X = function (u) { return g.ox + u * g.k; };
    var Y = function (v) { return g.oy - v * g.k; };

    /* ---------- 左：抛物线本体 ---------- */
    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lf.x + 18, lf.y + 26, "y²=2px", "#5a6472", "start", 11, 700);

    var uMax = (g.x1 - g.ox) / g.k;
    var vMax = Math.min((g.oy - g.y0) / g.k, (g.y1 - g.oy) / g.k);

    /* 坐标轴 + 单位刻度 */
    el("line", { x1: g.x0, y1: g.oy, x2: g.x1 - 2, y2: g.oy, stroke: "#5a6472", "stroke-width": 1.2 }, gA);
    el("line", { x1: g.ox, y1: g.y1, x2: g.ox, y2: g.y0 + 2, stroke: "#5a6472", "stroke-width": 1.2 }, gA);
    arrowX(gA, g.x1, g.oy); arrowY(gA, g.ox, g.y0);
    tx(gA, g.x1 - 8, g.oy + 16, "x", "#5a6472", "start", 10, 400);
    tx(gA, g.ox + 8, g.y0 + 10, "y", "#5a6472", "start", 10, 400);
    var u, v;
    for (u = 2; u <= uMax - 1.6; u += 2) {
      el("line", { x1: X(u), y1: g.oy - 3, x2: X(u), y2: g.oy + 3, stroke: "#8a94a3", "stroke-width": 1 }, gA);
      tx(gA, X(u), g.oy + 15, String(u), "#8a94a3", "middle", 8.5, 400);
    }
    for (v = 2; v <= vMax - 0.4; v += 2) {
      el("line", { x1: g.ox - 3, y1: Y(v), x2: g.ox + 3, y2: Y(v), stroke: "#8a94a3", "stroke-width": 1 }, gA);
      tx(gA, g.ox - 6, Y(v) + 3, String(v), "#8a94a3", "end", 8.5, 400);
      el("line", { x1: g.ox - 3, y1: Y(-v), x2: g.ox + 3, y2: Y(-v), stroke: "#8a94a3", "stroke-width": 1 }, gA);
      tx(gA, g.ox - 6, Y(-v) + 3, "−" + String(v), "#8a94a3", "end", 8.5, 400);
    }

    /* 准线（虚线，带负号） */
    var dx = X(s.dir);
    el("line", { x1: dx, y1: g.y0 + 12, x2: dx, y2: g.y1 - 10, stroke: "#b8402f", "stroke-width": 1.5, "stroke-dasharray": "6 4" }, gA);
    tx(gA, dx + 5, g.y0 + 30, "x=−" + n(Math.abs(s.dir)), "#b8402f", "start", 9.5, 700);

    /* 抛物线 */
    var vLim = Math.min(vMax, Math.sqrt(2 * A * uMax));
    var pts = [], i, t;
    for (i = 0; i <= 42; i++) {
      t = -vLim + 2 * vLim * i / 42;
      pts.push(n(X(t * t / (2 * A))) + "," + n(Y(t)));
    }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2563eb", "stroke-width": 2.4 }, gA);

    /* 顶点、焦点 */
    el("circle", { cx: g.ox, cy: g.oy, r: 3.2, fill: "#2f8a5b" }, gA);
    tx(gA, g.ox - 14, g.oy + 17, "O", "#2f8a5b", "middle", 9.5, 700);
    el("circle", { cx: X(s.fx), cy: g.oy, r: 3.6, fill: "#b8402f" }, gA);
    tx(gA, X(s.fx) + 6, g.oy - 7, "F(" + n(s.fx) + ",0)", "#b8402f", "start", 9.5, 700);

    /* 点 (1,y₀) 的焦半径 */
    var py = Math.sqrt(2 * A);
    if (py < vLim - 0.05) {
      var px = X(1), pyy = Y(py);
      el("line", { x1: px, y1: pyy, x2: X(s.fx), y2: g.oy, stroke: "#2563eb", "stroke-width": 2 }, gA);
      el("circle", { cx: px, cy: pyy, r: 3.2, fill: "#2563eb" }, gA);
      tx(gA, px + 6, pyy - 7, "P", "#2563eb", "start", 9.5, 700);
      tx(gA, px, g.oy + 15, "1", "#8a94a3", "middle", 8.5, 400);
    }

    /* ---------- 右：数值面板 ---------- */
    el("rect", { x: rb.x, y: rb.y, width: rb.w, height: rb.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rb.x + 22, rb.y + 30, "p 一变，四个量一起变", "#5a6472", "start", 11, 700);
    var cm = "#3a3a35";
    tx(gB, rb.x + 22, rb.y + 62, "系数 2p = " + n(s.coef), cm, "start", 10.5, 400);
    tx(gB, rb.x + 22, rb.y + 88, "参数 p = 2p ÷ 2 = " + n(s.p), cm, "start", 10.5, 400);
    tx(gB, rb.x + 22, rb.y + 114, "焦点 F(p/2,0) = (" + n(s.fx) + ",0)", "#b8402f", "start", 10.5, 700);
    tx(gB, rb.x + 22, rb.y + 140, "准线 x = −p/2，即 x=−" + n(Math.abs(s.dir)), "#b8402f", "start", 10.5, 700);
    tx(gB, rb.x + 22, rb.y + 166, "焦半径 1+p/2 = " + n(s.r1), "#2563eb", "start", 10.5, 700);

    var bx0 = rb.x + 24, bw = rb.w - 48, by0 = rb.y + 206;
    el("line", { x1: bx0, y1: by0, x2: bx0 + bw, y2: by0, stroke: "#e6e9ee", "stroke-width": 1.6 }, gB);
    el("line", { x1: bx0 + bw, y1: by0 - 8, x2: bx0 + bw, y2: by0 + 8, stroke: "#e6e9ee", "stroke-width": 1.6 }, gB);
    el("rect", { x: bx0, y: by0 - 9, width: Math.max(3, bw * s.r1 / 5), height: 18, rx: 4, fill: "#2563eb" }, gB);
    tx(gB, bx0, by0 + 24, "0", "#8a94a3", "start", 8.5, 400);
    tx(gB, bx0 + bw, by0 + 24, "5", "#8a94a3", "end", 8.5, 400);
    tx(gB, rb.x + 22, by0 + 48, "焦半径刻度条（p=8 时最长，为 5）", "#5a6472", "start", 9.5, 400);
    tx(gB, rb.x + 22, by0 + 74, "p=4 是停留帧：" + "F(2,0)、x=−2、焦半径 3", "#2f8a5b", "start", 9.5, 700);
    tx(gB, rb.x + 22, by0 + 98, "焦点与准线始终关于顶点对称", "#2f8a5b", "start", 9.5, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = n(A);
    $("gxVb").textContent = n(s.fx);
    $("gxVc").textContent = n(s.r1);
    if (A < 3) { st = "开口偏窄"; col = "#b8791f"; bg = "#fdf3e0"; sn = "焦点离顶点很近"; }
    else if (A <= 5.5) { st = "开口适中"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "焦点 (p/2,0) 已过 2"; }
    else { st = "开口很宽"; col = "#2563eb"; bg = "#e8effd"; sn = "焦点随 p 一起外移"; }
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 4 }, { t: 6.5, v: 4 }, { t: 9, v: 8 }, { t: 11.5, v: 2 }, { t: 13.5, v: 1 }],
    keys: [1, 2, 4, 8],
    value: A, min: 1, max: 8, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 2, eq: { p: 2, coef: 4, fx: 1, dir: -1, r1: 2 } },
    { v: 4, eq: { p: 4, coef: 8, fx: 2, dir: -2, r1: 3 } },
    { v: 8, eq: { p: 8, coef: 16, fx: 4, dir: -4, r1: 5 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
