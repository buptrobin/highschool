/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null;

  /* 纯函数：参数 a → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var a = Math.round(v * 4) / 4, mx = a > 0 ? 2 * a * Math.sqrt(a) : 0;
    return { a: a, n: a > 0 ? 2 : 0, mx: mx, mn: -mx, s: Math.sqrt(a) };
  }
  function geom() {
    var l = L.left, r = L.right;
    return { cx: l.x + l.w / 2, cy: l.y + l.h * 0.56, hw: l.w * 0.40, hh: l.h * 0.32,
             rx: r.x + r.w / 2, ry: r.y + r.h * 0.40, rhw: r.w * 0.36, rhh: r.h * 0.24, rcy: r.y + r.h * 0.80 };
  }
  function pickU(m) { var c = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40], i; for (i = 0; i < c.length; i++) if (c[i] >= m) return c[i]; return 40; }
  function ln(p, x1, y1, x2, y2, c, w, d) { var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, "stroke-width": w || 1.1 }; if (d) a["stroke-dasharray"] = d; el("line", a, p); }
  function tip(p, x, y, d) { el("path", { d: "M" + x + " " + y + d, fill: "#9aa5b1" }, p); }

  function draw() {
    var g = G, s = calc(A), gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var l = L.left, r = L.right, i, k;

    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 16, l.y + 26, "f(x)=x³−3ax", "#5a6472", "start", 10.5, 700);
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 16, r.y + 26, "f′(x)=3x²−3a 的符号", "#5a6472", "start", 10.5, 700);

    var unit = pickU(Math.max(17.576 - 7.8 * s.a, s.mx) * 1.08);
    var sy = g.hh / unit, sx = g.hw / 2.6;
    var X = function (x) { return g.cx + x * sx; };
    var Y = function (y) { return g.cy - y * sy; };

    /* 坐标轴 + 箭头 */
    ln(gA, g.cx - g.hw - 14, g.cy, g.cx + g.hw + 20, g.cy, "#9aa5b1");
    tip(gA, g.cx + g.hw + 28, g.cy, " l-9 -4 v8 z");
    ln(gA, g.cx, g.cy + g.hh + 12, g.cx, g.cy - g.hh - 16, "#9aa5b1");
    tip(gA, g.cx, g.cy - g.hh - 24, " l-4 9 h8 z");
    tx(gA, g.cx + g.hw + 32, g.cy + 4, "x", "#7a8794", "start", 9.5, 400);
    tx(gA, g.cx + 6, g.cy - g.hh - 26, "y", "#7a8794", "start", 9.5, 400);

    for (i = 1; i <= 2; i++) for (k = -1; k <= 1; k += 2) {
      ln(gA, X(k * i), g.cy, X(k * i), g.cy + 5, "#9aa5b1");
      tx(gA, X(k * i), g.cy + 17, (k < 0 ? "−" : "") + i, "#7a8794", "middle", 8.6, 400);
    }
    var us = [unit / 2, unit];
    for (i = 0; i < 2; i++) for (k = -1; k <= 1; k += 2) {
      ln(gA, g.cx, Y(k * us[i]), g.cx - 4, Y(k * us[i]), "#9aa5b1");
      tx(gA, g.cx - 8, Y(k * us[i]) + 3, (k < 0 ? "−" : "") + (us[i] % 1 ? us[i].toFixed(1) : us[i]), "#7a8794", "end", 8.6, 400);
    }

    /* 曲线 y=x³−3ax */
    var pts = [];
    for (i = 0; i <= 64; i++) { var xx = -2.6 + 5.2 * i / 64; pts.push(X(xx).toFixed(1) + "," + Y(xx * xx * xx - 3 * s.a * xx).toFixed(1)); }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2b6cb0", "stroke-width": 2.2, "stroke-linejoin": "round" }, gA);

    /* 驻点 / 极值点 / 水平切线短线 */
    if (s.a > 0) {
      var rts = [{ x: -s.s, t: "极大", c: "#b8791f", dy: -9, an: "end" }, { x: s.s, t: "极小", c: "#2563eb", dy: 15, an: "start" }];
      for (i = 0; i < 2; i++) {
        var px = X(rts[i].x), py = Y(rts[i].x * rts[i].x * rts[i].x - 3 * s.a * rts[i].x);
        ln(gA, px - 0.42 * sx, py, px + 0.42 * sx, py, rts[i].c, 1.5, "5 3");
        el("circle", { cx: px, cy: py, r: 3.8, fill: rts[i].c }, gA);
        tx(gA, px + (rts[i].an === "end" ? -9 : 9), py + rts[i].dy, rts[i].t, rts[i].c, rts[i].an, 9.4, 700);
      }
    } else {
      ln(gA, X(-0.5), g.cy, X(0.5), g.cy, "#b8791f", 2, "6 3");
      el("circle", { cx: g.cx, cy: g.cy, r: 4.2, fill: "#b8791f" }, gA);
      tx(gA, g.cx, g.cy + g.hh * 0.62, "f′(0)=0，两侧同正 ⇒ 无极值", "#b8402f", "middle", 9.2, 700);
    }

    /* 右：导函数抛物线 + 符号条 */
    var syR = Math.min(g.rhh / Math.max(3 * 2.6 * 2.6 - 3 * s.a, 0.001), g.rhh * 0.36 / Math.max(3 * s.a, 0.001));
    var sxR = g.rhw / 2.6;
    var RX = function (x) { return g.rx + x * sxR; };
    var RY = function (y) { return g.ry - y * syR; };

    ln(gB, g.rx - g.rhw - 12, g.ry, g.rx + g.rhw + 16, g.ry, "#9aa5b1");
    tip(gB, g.rx + g.rhw + 24, g.ry, " l-9 -4 v8 z");
    ln(gB, g.rx, g.ry + g.rhh * 0.44, g.rx, g.ry - g.rhh - 12, "#9aa5b1");
    tip(gB, g.rx, g.ry - g.rhh - 20, " l-4 9 h8 z");

    var p2 = [];
    for (i = 0; i <= 48; i++) { var x2 = -2.6 + 5.2 * i / 48; p2.push(RX(x2).toFixed(1) + "," + RY(3 * x2 * x2 - 3 * s.a).toFixed(1)); }
    el("polyline", { points: p2.join(" "), fill: "none", stroke: "#b8791f", "stroke-width": 2.1, "stroke-linejoin": "round" }, gB);

    if (s.a > 0) {
      var rl = RX(-s.s), rr = RX(s.s);
      ln(gB, g.rx - g.rhw, g.rcy, rl, g.rcy, "#2f8a5b", 4);
      ln(gB, rl, g.rcy, rr, g.rcy, "#b8402f", 4);
      ln(gB, rr, g.rcy, g.rx + g.rhw, g.rcy, "#2f8a5b", 4);
      el("circle", { cx: rl, cy: g.ry, r: 3.4, fill: "#b8791f" }, gB);
      el("circle", { cx: rr, cy: g.ry, r: 3.4, fill: "#b8791f" }, gB);
      tx(gB, rl - 6, g.ry + 14, "−√a", "#b8791f", "end", 8.8, 400);
      tx(gB, rr + 6, g.ry + 14, "√a", "#b8791f", "start", 8.8, 400);
      tx(gB, (g.rx - g.rhw + rl) / 2, g.rcy - 8, "+", "#2f8a5b", "middle", 11, 700);
      tx(gB, (rl + rr) / 2, g.rcy - 8, "−", "#b8402f", "middle", 11, 700);
      tx(gB, (rr + g.rx + g.rhw) / 2, g.rcy - 8, "+", "#2f8a5b", "middle", 11, 700);
      tx(gB, g.rx, g.rcy + 24, "符号 + → − → + ⇒ 一个极大值、一个极小值", "#5a6472", "middle", 8.8, 400);
    } else {
      ln(gB, g.rx - g.rhw, g.rcy, g.rx + g.rhw, g.rcy, "#2f8a5b", 4);
      el("circle", { cx: g.rx, cy: g.ry, r: 3.4, fill: "#b8402f" }, gB);
      tx(gB, g.rx, g.ry + 14, "x=0", "#b8402f", "middle", 8.8, 400);
      tx(gB, g.rx - g.rhw * 0.55, g.rcy - 8, "+", "#2f8a5b", "middle", 11, 700);
      tx(gB, g.rx, g.rcy - 8, "0", "#b8402f", "middle", 11, 700);
      tx(gB, g.rx + g.rhw * 0.55, g.rcy - 8, "+", "#2f8a5b", "middle", 11, 700);
      tx(gB, g.rx, g.rcy + 24, "符号 + 0 + ⇒ 不变号，没有极值点", "#b8402f", "middle", 8.8, 400);
    }
    tx(gB, g.rx, g.ry + g.rhh * 0.36 + 40, "f′ 的符号管单调，变号才出极值", "#7a8794", "middle", 8.8, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    var at = s.a.toFixed(2).replace(/\.?0+$/, "");
    $("gxVa").textContent = at === "" ? "0" : at;
    $("gxVb").textContent = String(s.n);
    $("gxVc").textContent = s.mx.toFixed(2);
    if (s.a === 0) { st = "无极值"; col = "#b8791f"; bg = "#fdf3e0"; sn = "f′=0 但两侧同号"; }
    else { st = "有极值"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "极值点 x=±√a"; }
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
    loop: [{ t: 0, v: 0 }, { t: 2.2, v: 0 }, { t: 4.8, v: 1 }, { t: 6.3, v: 1 }, { t: 8.6, v: 2.25 }, { t: 10.6, v: 2.25 }, { t: 12.4, v: 0 }],
    keys: [0, 1, 2.25],
    value: A, min: 0, max: 3, step: 0.25,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { n: 0, mx: 0, mn: 0 } },
    { v: 1, eq: { n: 2, mx: 2, mn: -2 } },
    { v: 2.25, eq: { n: 2, mx: 6.75, mn: -6.75 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
