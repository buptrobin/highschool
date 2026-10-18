/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = {
    vb: "0 0 880 470",
    L: { x: 16, y: 16, w: 424, h: 438 }, lin: { x0: 64, y0: 396, x1: 408, y1: 64 },
    R: { x: 456, y: 16, w: 408, h: 438 }, rin: { x0: 504, y0: 396, x1: 840, y1: 72 }
  };
  var N = {
    vb: "0 0 360 700",
    L: { x: 8, y: 8, w: 344, h: 308 }, lin: { x0: 52, y0: 276, x1: 324, y1: 52 },
    R: { x: 8, y: 324, w: 344, h: 368 }, rin: { x0: 52, y0: 660, x1: 324, y1: 360 }
  };
  var L = W, A = 1, G = null;

  var A1 = 2, D = 3, NMAX = 12;
  var AMAX = A1 + (NMAX - 1) * D;                       /* 35 */
  var SMAX = NMAX * (2 * A1 + (NMAX - 1) * D) / 2;      /* 222 */

  /* 纯函数：序号 n → 通项、前 n 项和、中项检验。render() 与 __model.cases 都用它 */
  function calc(v) {
    var n = Math.round(v);
    if (!isFinite(n) || n < 1) n = 1;
    if (n > NMAX) n = NMAX;
    var an = A1 + D * (n - 1);
    var sn = n * (A1 + an) / 2;
    return { n: n, an: an, sn: sn, mid: 2 * (A1 + D) - A1 - (A1 + 2 * D) };
  }

  function geom() {
    var li = L.lin, ri = L.rin;
    return {
      lx: function (n) { return li.x0 + (n - 1) * (li.x1 - li.x0) / (NMAX - 1); },
      ly: function (a) { return li.y0 - (a - A1) * (li.y0 - li.y1) / (AMAX - A1); },
      rx: function (n) { return ri.x0 + (n - 1) * (ri.x1 - ri.x0) / (NMAX - 1); },
      ry: function (s) { return ri.y0 - s * (ri.y0 - ri.y1) / SMAX; }
    };
  }

  function axesBox(g, x0, y0, x1, y1) {
    el("line", { x1: x0, y1: y0, x2: x1, y2: y0, stroke: "#8a97a6", "stroke-width": 1.2 }, g);
    el("polygon", { points: x1 + "," + y0 + " " + (x1 - 9) + "," + (y0 - 4) + " " + (x1 - 9) + "," + (y0 + 4), fill: "#8a97a6" }, g);
    el("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: "#8a97a6", "stroke-width": 1.2 }, g);
    el("polygon", { points: x0 + "," + y1 + " " + (x0 - 4) + "," + (y1 + 9) + " " + (x0 + 4) + "," + (y1 + 9), fill: "#8a97a6" }, g);
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.L.x, y: L.L.y, width: L.L.w, height: L.L.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.L.x + 16, L.L.y + 28, "aₙ = 2 + 3(n − 1)：点列共线，斜率 = d", "#5a6472", "start", 10.5, 700);
    var li = L.lin;
    axesBox(gA, li.x0, li.y0, li.x1 + 10, li.y1 - 8);
    tx(gA, li.x1 + 10, li.y0 + 20, "n", "#5a6472", "middle", 10, 700);
    tx(gA, li.x0, li.y0 + 34, "相邻两项固定加 3 ⇒ 斜率就是 d", "#8a97a6", "start", 9, 400);
    var li2 = L.lin, i, px, py;
    for (i = 1; i <= NMAX; i++) {
      px = G.lx(i);
      el("line", { x1: px, y1: li2.y0 - 3, x2: px, y2: li2.y0 + 3, stroke: "#8a97a6", "stroke-width": 0.9 }, gA);
      if (i === 1 || i === 5 || i === 10) tx(gA, px, li2.y0 + 17, String(i), "#5a6472", "middle", 9, 400);
    }
    tx(gA, li2.x0 - 8, li2.y0 + 4, "2", "#5a6472", "end", 9, 400);
    tx(gA, li2.x0 - 8, G.ly(AMAX) + 4, String(AMAX), "#5a6472", "end", 9, 400);
    el("line", { x1: G.lx(1), y1: G.ly(2), x2: G.lx(NMAX), y2: G.ly(AMAX), stroke: "#2563eb", "stroke-width": 1, "stroke-dasharray": "5 4", opacity: 0.5 }, gA);
    for (i = 1; i <= NMAX; i++) {
      el("circle", { cx: G.lx(i), cy: G.ly(A1 + D * (i - 1)), r: 3.4, fill: "#2563eb" }, gA);
    }
    px = G.lx(s.n); py = G.ly(s.an);
    el("line", { x1: px, y1: py, x2: px, y2: li2.y0, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    el("circle", { cx: px, cy: py, r: 6, fill: "#b8402f" }, gA);
    if (px > li2.x1 - 90) tx(gA, px - 11, py - 10, "aₙ = " + s.an, "#b8402f", "end", 9.6, 700);
    else tx(gA, px + 11, py - 10, "aₙ = " + s.an, "#b8402f", "start", 9.6, 700);

    el("rect", { x: L.R.x, y: L.R.y, width: L.R.w, height: L.R.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.R.x + 16, L.R.y + 28, "Sₙ 与 n：过原点的抛物线", "#5a6472", "start", 10.5, 700);
    var ri = L.rin;
    axesBox(gB, ri.x0, ri.y0, ri.x1 + 10, ri.y1 - 8);
    tx(gB, ri.x1 + 10, ri.y0 + 20, "n", "#5a6472", "middle", 10, 700);
    if (L === W) tx(gB, ri.x0, ri.y0 + 34, "n 每加 1，Sₙ 的增加量越来越大", "#8a97a6", "start", 9, 400);
    for (i = 1; i <= NMAX; i++) {
      px = G.rx(i);
      el("line", { x1: px, y1: ri.y0 - 3, x2: px, y2: ri.y0 + 3, stroke: "#8a97a6", "stroke-width": 0.9 }, gB);
      if (i === 1 || i === 5 || i === 10) tx(gB, px, ri.y0 + 17, String(i), "#5a6472", "middle", 9, 400);
    }
    var pts = [];
    for (i = 1; i <= NMAX; i++) {
      pts.push(G.rx(i) + "," + G.ry(A1 * i + i * (i - 1) * D / 2));
    }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2563eb", "stroke-width": 1.4, opacity: 0.8 }, gB);
    for (i = 1; i <= NMAX; i++) {
      el("circle", { cx: G.rx(i), cy: G.ry(A1 * i + i * (i - 1) * D / 2), r: 3.4, fill: "#2563eb" }, gB);
    }
    el("circle", { cx: G.rx(0), cy: G.ry(0), r: 4.2, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 1.6 }, gB);
    tx(gB, G.rx(0), ri.y0 + 17, "S₀ = 0", "#2f8a5b", "middle", 8.6, 700);
    px = G.rx(s.n); py = G.ry(s.sn);
    el("line", { x1: px, y1: py, x2: px, y2: ri.y0, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "4 4" }, gB);
    el("circle", { cx: px, cy: py, r: 6, fill: "#b8402f" }, gB);
    if (px > ri.x1 - 80) tx(gB, px - 11, py - 9, "Sₙ = " + s.sn, "#b8402f", "end", 9.6, 700);
    else tx(gB, px + 11, py - 9, "Sₙ = " + s.sn, "#b8402f", "start", 9.6, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = String(s.an);
    $("gxVc").textContent = String(s.sn);
    if (s.n === 1) { st = "首项"; col = "#2563eb"; bg = "#e8f0fd"; sn = "S₁ = a₁ = 2"; }
    else { st = "累加中"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "Sₙ = n(2 + aₙ)/2"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw(s);
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 5 }, { t: 6.5, v: 5 }, { t: 9, v: 10 }, { t: 11.5, v: 7 }, { t: 13.5, v: 1 }],
    keys: [1, 5, 10],
    value: A, min: 1, max: NMAX, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { an: 2, sn: 2 } },
    { v: 5, eq: { an: 14, sn: 40 } },
    { v: 10, eq: { an: 29, sn: 155 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
