/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = -3, G = null;

  /* 画面固定窗口：xm∈[−1.2,3.2]，ym∈[−4.5,7] */
  var XMIN = -1.2, XMAX = 3.2, YMIN = -4.5, YMAX = 7;

  /* 纯函数：参数 → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var c = v, disc = 4 - 4 * c;
    var roots = disc > 0 ? 2 : disc === 0 ? 1 : 0;
    var s = Math.sqrt(Math.max(0, 1 - c));
    return { c: c, disc: disc, roots: roots, r1: 1 - s, r2: 1 + s };
  }

  function fnum(n) {
    var v = Math.round(n * 100) / 100;
    return String(v);
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function geom() {
    var p = L.left, r = L.right;
    var px = p.x + 48, pw = p.w - 68, py = p.y + 56, ph = p.h - 100;
    return {
      px: px, pw: pw, py: py, ph: ph,
      X0: px + (0 - XMIN) / (XMAX - XMIN) * pw,
      Y0: py + (YMAX - 0) / (YMAX - YMIN) * ph,
      nx: r.x + 20, nw: r.w - 40,
      ny: r.y + (L === W ? 128 : 92),
      fs: L === W ? 10.5 : 9
    };
  }

  function draw() {
    var s = calc(A), g = G, gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var X = function (xm) { return g.px + (xm - XMIN) / (XMAX - XMIN) * g.pw; };
    var Y = function (ym) { return g.py + (YMAX - ym) / (YMAX - YMIN) * g.ph; };

    /* ── 左：抛物线 ── */
    var p = L.left;
    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, p.x + 18, p.y + 28, "y=x²−2x+c 的图象", "#5a6472", "start", 10.5, 700);

    el("line", { x1: g.px - 6, y1: g.Y0, x2: g.px + g.pw, y2: g.Y0, stroke: "#8a97a4", "stroke-width": 1.2 }, gA);
    el("path", { d: "M" + (g.px + g.pw) + " " + (g.Y0 - 4) + "L" + (g.px + g.pw + 9) + " " + g.Y0 + "L" + (g.px + g.pw) + " " + (g.Y0 + 4) + "z", fill: "#8a97a4" }, gA);
    el("line", { x1: g.X0, y1: g.py + g.ph - 8, x2: g.X0, y2: g.py + 2, stroke: "#8a97a4", "stroke-width": 1.2 }, gA);
    el("path", { d: "M" + (g.X0 - 4) + " " + (g.py + 2) + "L" + g.X0 + " " + (g.py - 6) + "L" + (g.X0 + 4) + " " + (g.py + 2) + "z", fill: "#8a97a4" }, gA);
    tx(gA, g.px + g.pw + 8, g.Y0 + 14, "x", "#5a6472", "start", 9, 400);
    tx(gA, g.X0 + 7, g.py + 8, "y", "#5a6472", "start", 9, 400);
    tx(gA, g.X0 - 9, g.Y0 + 13, "O", "#5a6472", "end", 8.6, 400);

    var xm, tick;
    for (xm = -1; xm <= 3.01; xm += 1) {
      tick = X(xm);
      el("line", { x1: tick, y1: g.Y0 - 2.5, x2: tick, y2: g.Y0 + 2.5, stroke: "#8a97a4", "stroke-width": 1 }, gA);
      if (xm !== 0) tx(gA, tick, g.Y0 + 13, String(xm).replace("-", "−"), "#5a6472", "middle", 8.2, 400);
    }
    for (var ym = -4; ym <= 6.01; ym += 2) {
      if (ym === 0) continue;
      el("line", { x1: g.X0 - 2.5, y1: Y(ym), x2: g.X0 + 2.5, y2: Y(ym), stroke: "#8a97a4", "stroke-width": 1 }, gA);
      tx(gA, g.X0 - 6, Y(ym) + 3, String(ym).replace("-", "−"), "#5a6472", "end", 8.2, 400);
    }

    var d = "";
    for (xm = XMIN; xm <= XMAX + 0.001; xm += 0.08) {
      d += (d ? "L" : "M") + X(xm).toFixed(1) + " " + Y(xm * xm - 2 * xm + A).toFixed(1);
    }
    el("path", { d: d, fill: "none", stroke: "#2563eb", "stroke-width": 2.1, "stroke-linecap": "round" }, gA);
    el("circle", { cx: X(1), cy: Y(A - 1), r: 3.2, fill: "#2563eb" }, gA);

    if (s.roots === 2) {
      el("circle", { cx: X(s.r1), cy: g.Y0, r: 3.6, fill: "#b8402f" }, gA);
      el("circle", { cx: X(s.r2), cy: g.Y0, r: 3.6, fill: "#b8402f" }, gA);
      tx(gA, X(s.r1), g.Y0 - 8, "x₁", "#b8402f", "middle", 8.6, 700);
      tx(gA, X(s.r2), g.Y0 - 8, "x₂", "#b8402f", "middle", 8.6, 700);
    } else if (s.roots === 1) {
      el("circle", { cx: X(1), cy: g.Y0, r: 4, fill: "#b8791f" }, gA);
      tx(gA, X(1), g.Y0 - 10, "x₀", "#b8791f", "middle", 8.8, 700);
      tx(gA, X(1) + 7, g.Y0 - 22, "顶点落在 x 轴上", "#b8791f", "start", 8.2, 400);
    } else {
      tx(gA, X(1) + 8, g.Y0 - 14, "与 x 轴不碰", "#b8402f", "start", 8.2, 400);
    }

    /* ── 右：数轴上的解集 ── */
    var r = L.right;
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 18, r.y + 28, "数轴上 x²−2x+c>0 的解集", "#5a6472", "start", 10.5, 700);

    var XN = function (t) { return g.nx + (t + 3.5) / 9 * g.nw; };
    el("line", { x1: g.nx - 4, y1: g.ny, x2: g.nx + g.nw, y2: g.ny, stroke: "#8a97a4", "stroke-width": 1.2 }, gB);
    el("path", { d: "M" + (g.nx + g.nw) + " " + (g.ny - 4) + "L" + (g.nx + g.nw + 9) + " " + g.ny + "L" + (g.nx + g.nw) + " " + (g.ny + 4) + "z", fill: "#8a97a4" }, gB);
    var t;
    for (t = -3; t <= 5.01; t += 1) {
      el("line", { x1: XN(t), y1: g.ny - 2.5, x2: XN(t), y2: g.ny + 2.5, stroke: "#8a97a4", "stroke-width": 1 }, gB);
      tx(gB, XN(t), g.ny + 15, String(t).replace("-", "−"), "#5a6472", "middle", 8.2, 400);
    }

    if (s.roots === 2) {
      el("line", { x1: g.nx, y1: g.ny, x2: XN(s.r1), y2: g.ny, stroke: "#b8402f", "stroke-width": 5, "stroke-linecap": "round" }, gB);
      el("line", { x1: XN(s.r2), y1: g.ny, x2: g.nx + g.nw, y2: g.ny, stroke: "#b8402f", "stroke-width": 5, "stroke-linecap": "round" }, gB);
      el("circle", { cx: XN(s.r1), cy: g.ny, r: 4.2, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2 }, gB);
      el("circle", { cx: XN(s.r2), cy: g.ny, r: 4.2, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2 }, gB);
    } else {
      el("line", { x1: g.nx, y1: g.ny, x2: g.nx + g.nw, y2: g.ny, stroke: "#b8402f", "stroke-width": 5, "stroke-linecap": "round" }, gB);
      if (s.roots === 1) el("circle", { cx: XN(1), cy: g.ny, r: 4.4, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2 }, gB);
    }

    var c1 = s.roots === 1 ? "#b8791f" : s.roots === 0 ? "#2f8a5b" : "#b8402f";
    var l1 = "Δ = 4 − 4c = " + s.disc.toFixed(1) + "，交点 " + s.roots + " 个";
    var l2, l3;
    if (s.roots === 2) {
      l2 = "解集 {x|x<" + fnum(s.r1) + " 或 x>" + fnum(s.r2) + "}";
      l3 = "两根 x = 1 ± √(1−c)：" + fnum(s.r1) + " 与 " + fnum(s.r2);
    } else if (s.roots === 1) {
      l2 = "顶点相切：解集 {x|x≠1}";
      l3 = "不是空集，只挖掉顶点那一个点";
    } else {
      l2 = "图象全在 x 轴上方，解集是 R";
      l3 = "x²−2x+c>0 对任意实数 x 恒成立";
    }
    wrap(gB, r.x + 18, g.ny + 44, l1, r.w - 36, g.fs, "#5a6472", 18);
    wrap(gB, r.x + 18, g.ny + 68, l2, r.w - 36, g.fs, c1, 18);
    wrap(gB, r.x + 18, g.ny + 92, l3, r.w - 36, g.fs, "#5a6472", 18);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = s.disc.toFixed(1);
    $("gxVc").textContent = String(s.roots);
    if (A < 0.999) { st = "两交点"; col = "#2563eb"; bg = "#e8f0fd"; sn = "Δ>0，>0 取两边"; }
    else if (A < 1.001) { st = "相切"; col = "#b8791f"; bg = "#fdf3e0"; sn = "Δ=0，解集 x≠1"; }
    else { st = "无交点"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "Δ<0，解集是 R"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    G = geom();
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
    loop: [{ t: 0, v: -3 }, { t: 1.2, v: -3 }, { t: 4, v: 1 }, { t: 6.5, v: 1 }, { t: 9, v: 2 }, { t: 11.5, v: 2 }, { t: 13.5, v: -3 }],
    keys: [-3, 0, 1, 2],
    value: A, min: -3, max: 3, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { disc: 4, roots: 2 } },
    { v: 1, eq: { disc: 0, roots: 1 } },
    { v: 2, eq: { disc: -4, roots: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
