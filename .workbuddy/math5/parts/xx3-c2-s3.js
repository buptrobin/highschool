/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 2, G = null;

  /* 纯函数：倍数 a → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var a = v, ex = 2, dx = 2 / 3;
    return { a: a, ex: ex, dx: dx, ey: a * ex, dy: a * a * dx, sy: Math.sqrt(a * a * dx) };
  }

  /* 几何：由当前 L 算出所有坐标，render 的兜底也用它 */
  function geom() {
    var lf = L.left, rt = L.right, g = {};
    g.x0 = lf.x + 28;
    g.x1 = lf.x + lf.w - 28;
    g.vmax = 13;
    g.yb = lf.y + (L === W ? 256 : 178);
    g.cy = g.yb - 30;
    g.base = rt.y + (L === W ? 330 : 250);
    g.maxH = L === W ? 210 : 150;
    return g;
  }
  function X(v) { return G.x0 + (v / G.vmax) * (G.x1 - G.x0); }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), lf = L.left, rt = L.right;
    gA.textContent = ""; gB.textContent = "";

    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lf.x + 18, lf.y + 28, "Y = aX 的分布：点越散，方差越大", "#5a6472", "start", 10.5, 700);
    el("line", { x1: G.x0 - 12, y1: G.yb, x2: G.x1 + 6, y2: G.yb, stroke: "#8a94a3", "stroke-width": 1.2 }, gA);
    el("path", { d: "M" + (G.x1 + 12) + "," + G.yb + " l-8,-4 l0,8 z", fill: "#8a94a3" }, gA);

    for (var i = 1; i <= 3; i++) {
      var v = i * s.a, px = X(v);
      el("line", { x1: px, y1: G.cy + 8, x2: px, y2: G.yb, stroke: "#c3ccd6", "stroke-dasharray": "3 3" }, gA);
      el("line", { x1: px, y1: G.yb, x2: px, y2: G.yb + 6, stroke: "#8a94a3" }, gA);
      el("circle", { cx: px, cy: G.cy, r: 5.5, fill: "#b8791f" }, gA);
      tx(gA, px, G.cy - 14, i === 1 ? "a" : i === 2 ? "2a" : "3a", "#151a21", "middle", 9, 700);
    }

    var pa = X(s.a), pc = X(3 * s.a);
    el("line", { x1: pa, y1: G.cy - 42, x2: pc, y2: G.cy - 42, stroke: "#7fb0dc" }, gA);
    el("line", { x1: pa, y1: G.cy - 46, x2: pa, y2: G.cy - 38, stroke: "#7fb0dc" }, gA);
    el("line", { x1: pc, y1: G.cy - 46, x2: pc, y2: G.cy - 38, stroke: "#7fb0dc" }, gA);
    tx(gA, (pa + pc) / 2, G.cy - 50, "跨度 = 2a = " + (2 * s.a).toFixed(1), "#2563eb", "middle", 9, 700);

    var mx = X(s.ey);
    el("path", { d: "M" + mx + "," + (G.yb + 3) + " L" + (mx - 14) + "," + (G.yb + 32) + " L" + (mx + 14) + "," + (G.yb + 32) + " Z", fill: "#f2c9a0", stroke: "#cf8b4a" }, gA);
    tx(gA, mx, G.yb + 50, "支点 E(Y) = " + s.ey.toFixed(1), "#b8791f", "middle", 9.4, 700);

    el("rect", { x: rt.x, y: rt.y, width: rt.w, height: rt.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rt.x + 18, rt.y + 30, "均值 ×a，方差 ×a²", "#5a6472", "start", 10.5, 700);
    tx(gB, rt.x + 18, rt.y + 54, "E(Y) = a·E(X) = " + s.ey.toFixed(2), "#2563eb", "start", 9.4, 700);
    tx(gB, rt.x + 18, rt.y + 74, "D(Y) = a²·D(X) = " + s.dy.toFixed(2), "#b8791f", "start", 9.4, 700);

    var bw = 54, x1b = rt.x + rt.w * 0.32, x2b = rt.x + rt.w * 0.70;
    var h1 = Math.max(6, (s.a / 16) * G.maxH), h2 = Math.max(6, (s.a * s.a / 16) * G.maxH);
    el("line", { x1: x1b - bw / 2 - 10, y1: G.base, x2: x2b + bw / 2 + 10, y2: G.base, stroke: "#c3ccd6" }, gB);
    el("rect", { x: x1b - bw / 2, y: G.base - h1, width: bw, height: h1, rx: 4, fill: "#cfe3f7", stroke: "#7fb0dc" }, gB);
    el("rect", { x: x2b - bw / 2, y: G.base - h2, width: bw, height: h2, rx: 4, fill: "#fbe3c8", stroke: "#cf8b4a" }, gB);
    tx(gB, x1b, G.base - h1 - 8, "×" + s.a.toFixed(1), "#2563eb", "middle", 9.4, 700);
    tx(gB, x2b, G.base - h2 - 8, "×" + (s.a * s.a).toFixed(1), "#b8791f", "middle", 9.4, 700);
    tx(gB, x1b, G.base + 18, "均值倍数 a", "#2563eb", "middle", 9, 700);
    tx(gB, x2b, G.base + 18, "方差倍数 a²", "#b8791f", "middle", 9, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn, sq = s.a * s.a;
    $("gxVa").textContent = s.a.toFixed(1);
    $("gxVb").textContent = s.ey.toFixed(2);
    $("gxVc").textContent = s.dy.toFixed(2);
    if (Math.abs(s.a - 1) < 1e-9) {
      st = "原样"; col = "#2563eb"; bg = "#e8f0fd"; sn = "a=1：E=2、D=0.667 都没动";
    } else if (Math.abs(s.a - 2) < 1e-9) {
      st = "方差 ×4"; col = "#b8791f"; bg = "#fdf3e0"; sn = "均值只 ×2 到 4，方差已 ×4 到 2.667";
    } else {
      st = "方差 ×" + sq.toFixed(1); col = "#2f8a5b"; bg = "#e6f6ee"; sn = "均值 ×" + s.a.toFixed(1) + "，方差 ×" + sq.toFixed(1);
    }
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 2 }, { t: 6.5, v: 2 }, { t: 9, v: 4 }, { t: 11.5, v: 3 }, { t: 13.5, v: 1 }],
    keys: [1, 2, 3, 4],
    value: A, min: 1, max: 4, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { ey: 2, dy: 0.6667 } },
    { v: 2, eq: { ey: 4, dy: 2.6667 } },
    { v: 3.5, eq: { ey: 7, dy: 8.1667 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
