/* xx1-c2-s3 互动：滑块 t → 点 P(t,0) 到 3x+4y−10=0 的距离 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", narrow: false, left: { x: 16, y: 16, w: 520, h: 438 }, right: { x: 552, y: 16, w: 312, h: 438 } };
  var N = { vb: "0 0 360 700", narrow: true, left: { x: 8, y: 8, w: 344, h: 320 }, right: { x: 8, y: 336, w: 344, h: 356 } };
  var L = W, A = 0, G = null;

  /* 唯一真值：t → 代值、距离、是否在线上 */
  function calc(v) {
    var f = 3 * v - 10;
    return { t: v, f: f, d: Math.abs(f) / 5, onLine: Math.abs(f) < 1e-9 ? 1 : 0 };
  }

  /* 数学坐标 → 屏幕坐标的换算，随容器宽度重建 */
  function geom() {
    var p = L.left;
    var s = Math.min((p.w - 56) / 11, (p.h - 26) / 9.6);
    return { s: s, x0: p.x + 28 + 5 * s, y0: p.y + 20 + 5.4 * s };
  }

  function fx(v) { return (Math.round(v * 100) / 100).toFixed(2); }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), S = calc(A);
    gA.textContent = ""; gB.textContent = "";
    var p = L.left, p2 = L.right, s = G.s, X = function (x) { return G.x0 + s * x; }, Y = function (y) { return G.y0 - s * y; };
    var fs = L.narrow ? 8.6 : 9.6;

    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, p.x + 16, p.y + 22, "P(t, 0) 到直线 l 的距离", "#5a6472", "start", L.narrow ? 9.6 : 10.5, 700);

    /* 网格 */
    for (var gx = -5; gx <= 6; gx++) el("line", { x1: X(gx), y1: Y(-4.2), x2: X(gx), y2: Y(5.4), stroke: "#eef3f7", "stroke-width": 1 }, gA);
    for (var gy = -4; gy <= 5; gy++) el("line", { x1: X(-5.2), y1: Y(gy), x2: X(6.3), y2: Y(gy), stroke: "#eef3f7", "stroke-width": 1 }, gA);

    /* 坐标轴 + 箭头 */
    el("line", { x1: X(-5.4), y1: Y(0), x2: X(6.5), y2: Y(0), stroke: "#b3c1cd", "stroke-width": 1.3 }, gA);
    el("polygon", { points: (X(6.9)) + "," + Y(0) + " " + (X(6.5) - 6) + "," + (Y(0) - 4) + " " + (X(6.5) - 6) + "," + (Y(0) + 4), fill: "#b3c1cd" }, gA);
    el("line", { x1: X(0), y1: Y(-4.4), x2: X(0), y2: Y(5.4), stroke: "#b3c1cd", "stroke-width": 1.3 }, gA);
    el("polygon", { points: X(0) + "," + Y(5.8) + " " + (X(0) - 4) + "," + (Y(5.4) + 6) + " " + (X(0) + 4) + "," + (Y(5.4) + 6), fill: "#b3c1cd" }, gA);
    tx(gA, X(6.6), Y(0) + 13, "x", "#5a6472", "middle", fs, 700);
    tx(gA, X(0) + 10, Y(5.5), "y", "#5a6472", "start", fs, 700);

    /* 整数刻度 */
    var xt = [-4, -3, -2, -1, 1, 2, 3, 4, 5], i;
    for (i = 0; i < xt.length; i++) {
      el("line", { x1: X(xt[i]), y1: Y(0), x2: X(xt[i]), y2: Y(0) - 4, stroke: "#b3c1cd", "stroke-width": 1.2 }, gA);
      if (xt[i] % 2 === 0) tx(gA, X(xt[i]), Y(0) - 8, String(xt[i]), "#8d99a6", "middle", L.narrow ? 8 : 8.8, 400);
    }
    var yt = [-3, -2, -1, 1, 2, 3, 4];
    for (i = 0; i < yt.length; i++) {
      el("line", { x1: X(0), y1: Y(yt[i]), x2: X(0) + 4, y2: Y(yt[i]), stroke: "#b3c1cd", "stroke-width": 1.2 }, gA);
      if (yt[i] % 2 !== 0 || yt[i] === 2) tx(gA, X(0) - 7, Y(yt[i]) + 3.4, String(yt[i]), "#8d99a6", "end", L.narrow ? 8 : 8.8, 400);
    }

    /* 直线 3x + 4y − 10 = 0：3x+4y=10 */
    var ax = -3.9, ay = (10 - 3 * ax) / 4, bx2 = 6.25, by2 = (10 - 3 * bx2) / 4;
    el("line", { x1: X(ax), y1: Y(ay), x2: X(bx2), y2: Y(by2), stroke: "#2563eb", "stroke-width": 2.2 }, gA);
    tx(gA, p.x + 16, p.y + p.h - 12, "l：3x + 4y − 10 = 0", "#2563eb", "start", fs + 0.4, 700);

    /* 点 P、垂足 H、垂线段 PH */
    var px = X(S.t), py = Y(0);
    var hx = S.t - 3 * S.f / 25, hy = -4 * S.f / 25;
    el("line", { x1: px, y1: py, x2: X(hx), y2: Y(hy), stroke: "#b8402f", "stroke-width": 2.4 }, gA);
    el("circle", { cx: X(hx), cy: Y(hy), r: 3.1, fill: "#7d8b99" }, gA);
    el("circle", { cx: px, cy: py, r: 4.2, fill: "#b8402f" }, gA);

    /* 直角标记（H 处） */
    var dx = X(hx) - px, dy = Y(hy) - py, dl = Math.sqrt(dx * dx + dy * dy);
    if (dl > 10) {
      var wx = dx / dl, wy = dy / dl, ux = 0.8, uy = 0.6, m = 11;
      el("path", {
        d: "M " + (X(hx) + ux * m) + " " + (Y(hy) + uy * m) + " L " + (X(hx) + (ux + wx) * m) + " " + (Y(hy) + (uy + wy) * m) + " L " + (X(hx) + wx * m) + " " + (Y(hy) + wy * m),
        fill: "none", stroke: "#7d8b99", "stroke-width": 1.4
      }, gA);
    }

    /* 标签 */
    var lx = Math.min(Math.max(px, p.x + 52), p.x + p.w - 58);
    tx(gA, lx, py + 20, "P(" + (Math.round(S.t * 10) / 10) + ", 0)", "#b8402f", "middle", fs + 0.6, 700, true);
    if (dl > 26) {
      var mxp = (px + X(hx)) / 2 + 16, myp = (py + Y(hy)) / 2 + 4;
      tx(gA, mxp, myp, "d", "#b8402f", "start", fs + 1.2, 700, true);
    }

    /* 右面板：代入过程 */
    el("rect", { x: p2.x, y: p2.y, width: p2.w, height: p2.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    var x1 = p2.x + 16, yy = p2.y + 30;
    tx(gB, x1, yy, "代入，一步都不跳", "#151a21", "start", fs + 1.1, 700);
    yy += 26;
    tx(gB, x1, yy, "A = 3　B = 4　C = −10", "#3a3a35", "start", fs, 400);
    yy += 24;
    tx(gB, x1, yy, "3t − 10 = " + (S.onLine ? "0" : fx(S.f)), "#3a3a35", "start", fs, 400);
    yy += 24;
    tx(gB, x1, yy, "|3t − 10| = " + (S.onLine ? "0" : fx(Math.abs(S.f))), "#b8791f", "start", fs, 700);
    yy += 24;
    tx(gB, x1, yy, "√(A² + B²) = √25 = 5", "#3a3a35", "start", fs, 400);
    yy += 26;
    tx(gB, x1, yy, "d = " + (S.onLine ? "0" : fx(Math.abs(S.f))) + " ÷ 5 = " + fx(S.d), S.onLine ? "#2f8a5b" : "#b8402f", "start", fs + 1.2, 700);

    /* 距离条 */
    var by = p2.y + (L.narrow ? 168 : 176), bw = p2.w - 32;
    tx(gB, x1, by - 8, "d 的长短（满格 4.4）", "#8d99a6", "start", fs - 0.6, 400);
    el("rect", { x: x1, y: by, width: bw, height: 10, rx: 5, fill: "#eef3f7" }, gB);
    el("rect", { x: x1, y: by, width: Math.max(3, bw * S.d / 4.4), height: 10, rx: 5, fill: S.onLine ? "#2f8a5b" : "#b8402f" }, gB);
    yy = by + 34;
    tx(gB, x1, yy, "t = 10/3 ≈ 3.33 时，代值 = 0", "#5a6472", "start", fs - 0.2, 400);
    yy += 20;
    tx(gB, x1, yy, S.onLine ? "P 落在直线上，d = 0" : (S.f < 0 ? "P 在直线下侧，代值 < 0" : "P 在直线上侧，代值 > 0"), S.onLine ? "#2f8a5b" : "#5a6472", "start", fs - 0.2, 400);
    yy += 28;
    tx(gB, x1, yy, "分子有绝对值，负号不影响 d", "#2563eb", "start", fs - 0.4, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var S = calc(A), st, col, bg, sn;
    $("gxVa").textContent = (Math.round(A * 10) / 10).toString();
    $("gxVb").textContent = S.d.toFixed(2);
    $("gxVc").textContent = S.onLine ? "0" : fx(S.f);
    if (S.onLine) { st = "点在直线上"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "代值 = 0，d = 0"; }
    else if (S.f < 0) { st = "点在直线外"; col = "#b8791f"; bg = "#fdf3e0"; sn = "代值 < 0，d > 0"; }
    else { st = "点在直线外"; col = "#b8402f"; bg = "#fbeae7"; sn = "代值 > 0，d > 0"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.0, v: 0 }, { t: 3.5, v: 2 }, { t: 6.5, v: 10 / 3 }, { t: 9.5, v: 10 / 3 }, { t: 11.5, v: 5 }, { t: 13.5, v: 0 }],
    keys: [0, 2, 5],
    value: A, min: -4, max: 6, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { d: 2 } },
    { v: 2, eq: { d: 0.8 } },
    { v: 5, eq: { d: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
