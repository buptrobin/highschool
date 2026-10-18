/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1.5, G = null;
  var X0 = 1.3247;

  /* 纯函数：参数 → 数值。render() 和 __model.cases 都用它 */
  function calc(x) {
    return { f: x * x * x - x - 1, d: Math.abs(x - X0) };
  }

  /* 几何：数据坐标 → 画布坐标（画布 y 轴朝下） */
  function geom() {
    var g = { xmin: -0.15, xmax: 2.15, ymin: -2, ymax: 6.4 };
    if (L === W) { g.px = L.left.x + 56; g.py = L.left.y + 52; g.pw = L.left.w - 84; g.ph = L.left.h - 96; }
    else { g.px = L.left.x + 34; g.py = L.left.y + 44; g.pw = L.left.w - 56; g.ph = L.left.h - 80; }
    g.sx = function (x) { return g.px + (x - g.xmin) / (g.xmax - g.xmin) * g.pw; };
    g.sy = function (y) { return g.py + g.ph - (y - g.ymin) / (g.ymax - g.ymin) * g.ph; };
    return g;
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function drawLeft(s) {
    var gA = $("gxA"), g = G, y0 = g.sy(0), x0 = g.sx(0), xEnd = g.px + g.pw;
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 26, "f(x)=x³−x−1 的图象", "#5a6472", "start", 10.5, 700);
    el("line", { x1: g.px - 10, y1: y0, x2: xEnd, y2: y0, stroke: "#8a97a4", "stroke-width": 1.1 }, gA);
    el("polygon", { points: xEnd + "," + (y0 - 4) + " " + (xEnd + 12) + "," + y0 + " " + xEnd + "," + (y0 + 4), fill: "#8a97a4" }, gA);
    el("line", { x1: x0, y1: g.py + g.ph + 6, x2: x0, y2: g.py - 4, stroke: "#8a97a4", "stroke-width": 1.1 }, gA);
    el("polygon", { points: (x0 - 4) + "," + (g.py - 4) + " " + x0 + "," + (g.py - 14) + " " + (x0 + 4) + "," + (g.py - 4), fill: "#8a97a4" }, gA);
    var xt = L === W ? [0.5, 1, 1.5, 2] : [1, 2], i, j, xx, yy;
    for (i = 0; i < xt.length; i++) {
      xx = g.sx(xt[i]);
      el("line", { x1: xx, y1: y0 - 3, x2: xx, y2: y0 + 3, stroke: "#8a97a4", "stroke-width": 1 }, gA);
      tx(gA, xx, y0 + 14, String(xt[i]), "#5a6472", "middle", 9, 400);
    }
    var yt = L === W ? [-2, 2, 4, 6] : [2, 4];
    for (j = 0; j < yt.length; j++) {
      yy = g.sy(yt[j]);
      el("line", { x1: x0 - 3, y1: yy, x2: x0 + 3, y2: yy, stroke: "#8a97a4", "stroke-width": 1 }, gA);
      tx(gA, x0 - 6, yy + 3, String(yt[j]), "#5a6472", "end", 9, 400);
    }
    tx(gA, x0 - 6, y0 + 14, "O", "#5a6472", "end", 9, 400);
    var ax = g.sx(A), az = g.sx(X0);
    el("rect", { x: Math.min(ax, az), y: y0 - 3, width: Math.max(3, Math.abs(ax - az)), height: 6, fill: "#d9f0e4" }, gA);
    var d = "", k, t, px, py;
    for (k = 0; k <= 60; k++) {
      t = 0.02 + k * (2.08 / 60);
      px = g.sx(t); py = g.sy(t * t * t - t - 1);
      d += (k ? " L" : "M") + px.toFixed(1) + "," + py.toFixed(1);
    }
    el("path", { d: d, fill: "none", stroke: "#2563eb", "stroke-width": 2.1 }, gA);
    el("line", { x1: az, y1: y0 - 4, x2: az, y2: y0 + 14, stroke: "#2f8a5b", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: az, cy: y0, r: 4.2, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 2 }, gA);
    tx(gA, az, y0 + 29, "x₀", "#2f8a5b", "middle", 10, 700);
    px = g.sx(A); py = g.sy(s.f);
    el("line", { x1: px, y1: py, x2: px, y2: y0, stroke: "#2563eb", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("line", { x1: px, y1: py, x2: x0, y2: py, stroke: "#2563eb", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: px, cy: py, r: 4.4, fill: "#2563eb" }, gA);
    tx(gA, px + 8, py - 7, "P", "#2563eb", "start", 9.5, 700);
  }

  function drawRight(s) {
    var gB = $("gxB"), r = L.right, wide = (L === W);
    var mx0 = r.x + (wide ? 46 : 34), span = r.w - (wide ? 92 : 68);
    var my = r.y + (wide ? 108 : 96), fs = wide ? 10.4 : 10, step = wide ? 22 : 21;
    function mx(t) { return mx0 + (t - 1) * span; }
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 20, r.y + 26, "零点在哪一边？判符号", "#5a6472", "start", 10.5, 700);
    tx(gB, r.x + 20, r.y + 46, "f(1)<0，f(2)>0，零点在 (1,2) 内", "#8a97a4", "start", 9.4, 400);
    var zx = mx(X0);
    el("line", { x1: mx0 - 4, y1: my, x2: mx0 + span, y2: my, stroke: "#8a97a4", "stroke-width": 1.2 }, gB);
    el("polygon", { points: (mx0 + span) + "," + (my - 4) + " " + (mx0 + span + 9) + "," + my + " " + (mx0 + span) + "," + (my + 4), fill: "#8a97a4" }, gB);
    el("line", { x1: mx0, y1: my - 4, x2: mx0, y2: my + 4, stroke: "#8a97a4", "stroke-width": 1 }, gB);
    tx(gB, mx0, my + 16, "1", "#5a6472", "middle", 9.4, 400);
    el("line", { x1: mx0 + span, y1: my - 4, x2: mx0 + span, y2: my + 4, stroke: "#8a97a4", "stroke-width": 1 }, gB);
    tx(gB, mx0 + span, my + 16, "2", "#5a6472", "middle", 9.4, 400);
    el("circle", { cx: zx, cy: my, r: 4, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 1.8 }, gB);
    tx(gB, zx, my + 16, "x₀", "#2f8a5b", "middle", 9.5, 700);
    var cx = mx(A);
    el("line", { x1: cx, y1: my - 24, x2: cx, y2: my, stroke: "#2563eb", "stroke-width": 1, "stroke-dasharray": "3 3" }, gB);
    el("circle", { cx: cx, cy: my - 24, r: 4.4, fill: "#2563eb" }, gB);
    tx(gB, cx, my - 34, "x=" + A.toFixed(2), "#2563eb", "middle", 9.5, 700);
    var yS = my + 36;
    el("rect", { x: mx0, y: yS, width: zx - mx0, height: 16, fill: "#fbeae7", stroke: "#e8c4bc" }, gB);
    el("rect", { x: zx, y: yS, width: mx0 + span - zx, height: 16, fill: "#e6f6ee", stroke: "#b8e6d0" }, gB);
    tx(gB, (mx0 + zx) / 2, yS + 12, "f<0", "#b8402f", "middle", 9, 700);
    tx(gB, (zx + mx0 + span) / 2, yS + 12, "f>0", "#2f8a5b", "middle", 9, 700);
    tx(gB, zx, yS + 30, "零点左边 f<0，右边 f>0", "#5a6472", "middle", 9, 400);
    var bx = r.x + 20, by = yS + (wide ? 56 : 50);
    tx(gB, bx, by, "f(x)=x³−x−1", "#151a21", "start", fs, 700);
    tx(gB, bx, by + step, "f(" + A.toFixed(2) + ") = " + s.f.toFixed(3), s.f < 0 ? "#b8402f" : "#2f8a5b", "start", fs, 700);
    tx(gB, bx, by + step * 2, s.f < 0 ? "⇒ 零点在 (" + A.toFixed(2) + ", 2.00)" : (s.f > 0 ? "⇒ 零点在 (1.00, " + A.toFixed(2) + ")" : "⇒ x 就是零点"), "#2f8a5b", "start", fs, 400);
    var len = s.f < 0 ? 2 - A : A - 1;
    tx(gB, bx, by + step * 3, "剩余区间长度 " + len.toFixed(2), "#3a3a35", "start", fs, 400);
    tx(gB, bx, by + step * 4, "再二分一次 → " + (len / 2).toFixed(2), "#3a3a35", "start", fs, 400);
    if (wide) {
      tx(gB, bx, by + step * 5 + 18, "定理只保证「至少一个」；", "#b8791f", "start", 9.6, 400);
      tx(gB, bx, by + step * 5 + 36, "f 在 [1,2] 上单调递增 ⇒ 恰好一个", "#b8791f", "start", 9.6, 400);
    } else {
      wrap(gB, bx, by + step * 5 + 16, "定理只保证「至少一个」；f 在 [1,2] 上单调递增 ⇒ 恰好一个", r.w - 40, 9.6, "#b8791f", 16);
    }
  }

  function draw(s) {
    $("gxA").textContent = ""; $("gxB").textContent = "";
    drawLeft(s);
    drawRight(s);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(2);
    $("gxVb").textContent = s.f.toFixed(3);
    $("gxVc").textContent = s.d.toFixed(3);
    if (s.f < -0.0005) { st = "零点在右边"; col = "#2563eb"; bg = "#e8f0fe"; sn = "f(x)<0，x 偏左"; }
    else if (s.f > 0.0005) { st = "零点在左边"; col = "#b8791f"; bg = "#fdf3e0"; sn = "f(x)>0，x 偏右"; }
    else { st = "找到了"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "f(x)=0，x 就是零点"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw(s);
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
    loop: [{ t: 0, v: 1 }, { t: 2.2, v: 1 }, { t: 4.8, v: 2 }, { t: 7, v: 2 }, { t: 9, v: 1.5 }, { t: 11.5, v: 1.5 }, { t: 13, v: 1 }],
    keys: [1, 1.25, 1.5, 2],
    value: A, min: 1, max: 2, step: 0.05,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { f: -1, d: 0.3247 } },
    { v: 1.25, eq: { f: -0.2969, d: 0.0747 } },
    { v: 1.5, eq: { f: 0.875, d: 0.1753 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
