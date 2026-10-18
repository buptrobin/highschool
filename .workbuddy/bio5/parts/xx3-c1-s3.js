/* 互动脚本：发酵时间 t → 产物相对量 P（S 形）与增长速率 r。t=20 h 为拐点（50%、r 最大） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = {
    vb: "0 0 880 470", wide: 1,
    left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 },
    px0: 68, px1: 412, py0: 390, py1: 92,
    qx0: 500, qx1: 844, qy0: 300, qy1: 84,
    fs: 9.6, ts: 8.6, tt: 10.5, rmax: 6.6, gap: 28, ty: 344
  };
  var N = {
    vb: "0 0 360 700", wide: 0,
    left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 },
    px0: 46, px1: 334, py0: 252, py1: 74,
    qx0: 46, qx1: 334, qy0: 566, qy1: 388,
    fs: 8.4, ts: 7.8, tt: 9.4, rmax: 6.6, gap: 24, ty: 612
  };
  var L = W, A = 20, G = null;
  var CG = "#2f8a5b", CA = "#b8791f", CB = "#3a5f88", CR = "#b8402f";
  var CT = "#5a6472", CD = "#3a3a35", CL = "#7a8494";

  /* 唯一真值：render() 与 __model.cases 共用 */
  function calc(v) {
    var p = 100 / (1 + Math.exp(-(v - 20) / 4));
    return { prod: p, rate: p * (1 - p / 100) / 4 };
  }

  function geom() {
    var l = L.left, m = L.right;
    return {
      lx: l.x, ly: l.y, lw: l.w, lh: l.h, rx: m.x, ry: m.y, rw: m.w, rh: m.h,
      px0: L.px0, px1: L.px1, py0: L.py0, py1: L.py1,
      qx0: L.qx0, qx1: L.qx1, qy0: L.qy0, qy1: L.qy1,
      fs: L.fs, ts: L.ts, tt: L.tt, rmax: L.rmax, gap: L.gap, ty: L.ty
    };
  }

  function X(t) { return G.px0 + (G.px1 - G.px0) * t / 40; }
  function Y(p) { return G.py0 - (G.py0 - G.py1) * p / 100; }
  function RX(t) { return G.qx0 + (G.qx1 - G.qx0) * t / 40; }
  function RY(r) { return G.qy0 - (G.qy0 - G.qy1) * r / G.rmax; }

  function ln(g, x1, y1, x2, y2, c, w, d) {
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, "stroke-width": w || 1, "stroke-dasharray": d || "none" }, g);
  }

  function pathOf(f, fx, fy, g) {
    var d = "", i;
    for (i = 0; i <= 40; i++) d += (i ? " L " : "M ") + fx(i).toFixed(1) + " " + fy(f(i)).toFixed(2);
    el("path", { d: d, fill: "none", stroke: CG, "stroke-width": 2.4 }, g);
  }

  function drawLeft(a) {
    var s = calc(A);
    el("rect", { x: G.lx, y: G.ly, width: G.lw, height: G.lh, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, a);
    tx(a, G.lx + 16, G.ly + (G.wide ? 28 : 20), "产物的 S 形曲线（相对量 %）", CT, "start", G.tt, 700);

    var b1 = X(10), b2 = X(32);
    el("rect", { x: X(0), y: G.py1, width: b1 - X(0), height: G.py0 - G.py1, fill: "#fdf6e6" }, a);
    el("rect", { x: b1, y: G.py1, width: b2 - b1, height: G.py0 - G.py1, fill: "#eaf7f0" }, a);
    el("rect", { x: b2, y: G.py1, width: X(40) - b2, height: G.py0 - G.py1, fill: "#eaf2fb" }, a);

    ln(a, X(0), Y(50), X(40), Y(50), "#cfd9e2", 1, "4 4");
    ln(a, X(0), Y(0), X(40), Y(0), "#9aa7b4", 1.2);
    ln(a, X(0), Y(0), X(0), Y(100), "#9aa7b4", 1.2);

    tx(a, (X(0) + b1) / 2, G.py1 + 14, "延滞期", "#8a5a11", "middle", G.ts, 700);
    tx(a, (b1 + b2) / 2, G.py1 + 14, "对数期", "#1d6b4a", "middle", G.ts, 700);
    tx(a, (b2 + X(40)) / 2, G.py1 + 14, "稳定期", "#3a5f88", "middle", G.ts, 700);

    tx(a, X(0) - 6, Y(0) + 3, "0", CL, "end", G.ts, 400);
    tx(a, X(0) - 6, Y(50) + 3, "50", CL, "end", G.ts, 400);
    tx(a, X(0) - 6, Y(100) + 3, "100", CL, "end", G.ts, 400);
    tx(a, X(0), G.py0 + 14, "0", CL, "middle", G.ts, 400);
    tx(a, X(20), G.py0 + 14, "20", CL, "middle", G.ts, 400);
    tx(a, X(40), G.py0 + 14, "40", CL, "middle", G.ts, 400);
    tx(a, X(20), G.py0 + (G.wide ? 32 : 28), "发酵时间 t / h", CL, "middle", G.ts, 400);

    pathOf(function (t) { return calc(t).prod; }, X, Y, a);

    var mx = X(A), my = Y(s.prod), right = A <= 22;
    ln(a, mx, my, mx, Y(0), CR, 1, "4 4");
    el("circle", { cx: mx, cy: my, r: 4.6, fill: CR, stroke: "#ffffff", "stroke-width": 1.4 }, a);
    tx(a, right ? mx + 9 : mx - 9, my < G.py1 + 26 ? my + 17 : my - 9,
      "P=" + s.prod.toFixed(1) + "%", CR, right ? "start" : "end", G.fs, 700);
  }

  function drawRight(b) {
    var s = calc(A);
    el("rect", { x: G.rx, y: G.ry, width: G.rw, height: G.rh, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, b);
    tx(b, G.rx + 16, G.ry + (G.wide ? 28 : 20), "增长速率 r（%/h，示意）", CT, "start", G.tt, 700);

    ln(b, RX(0), RY(0), RX(40), RY(0), "#9aa7b4", 1.2);
    ln(b, RX(0), RY(0), RX(0), RY(G.rmax), "#9aa7b4", 1.2);
    tx(b, RX(0) - 6, RY(0) + 3, "0", CL, "end", G.ts, 400);
    tx(b, RX(0) - 6, RY(6.25) + 3, "6.25", CL, "end", G.ts, 400);

    var i, d = "";
    for (i = 0; i <= 40; i++) d += (i ? " L " : "M ") + RX(i).toFixed(1) + " " + RY(calc(i).rate).toFixed(2);
    el("path", { d: d, fill: "none", stroke: CA, "stroke-width": 2.2 }, b);

    ln(b, RX(20), RY(6.25), RX(20), RY(0), "#d8c49a", 1, "3 4");
    el("circle", { cx: RX(20), cy: RY(6.25), r: 3.4, fill: "#ffffff", stroke: CA, "stroke-width": 1.6 }, b);
    tx(b, RX(20), RY(6.25) - 9, "峰值 6.25（t=20）", CA, "middle", G.ts, 700);

    var mx = RX(A), my = RY(s.rate);
    ln(b, mx, my, mx, RY(0), CR, 1, "4 4");
    el("circle", { cx: mx, cy: my, r: 4.4, fill: CR, stroke: "#ffffff", "stroke-width": 1.4 }, b);
    tx(b, mx, my - 9, s.rate.toFixed(2), CR, "middle", G.ts, 700);

    tx(b, G.rx + 16, G.ty, "t < 10 h　延滞期：菌体少，产物很少", "#8a5a11", "start", G.fs, 400);
    tx(b, G.rx + 16, G.ty + G.gap, "10–30 h　对数期：产物快速积累", "#1d6b4a", "start", G.fs, 400);
    tx(b, G.rx + 16, G.ty + G.gap * 2, "t > 32 h　稳定期：趋于饱和", CB, "start", G.fs, 400);
    tx(b, G.rx + 16, G.ty + G.gap * 3 + (G.wide ? 6 : 4), "r 峰值在 t=20 h：这一段加料、控温收益最高", CD, "start", G.fs, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.prod.toFixed(1);
    $("gxVc").textContent = s.rate.toFixed(2);
    if (A < 10) { st = "延滞期"; col = "#b8791f"; bg = "#fdf6e6"; sn = "菌体少，产物很少"; }
    else if (A < 32) { st = "对数期"; col = "#2f8a5b"; bg = "#eaf7f0"; sn = "产物快速积累"; }
    else { st = "稳定期"; col = "#3a5f88"; bg = "#eaf2fb"; sn = "趋于饱和"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    var a = $("gxA"), b = $("gxB");
    a.textContent = "";
    b.textContent = "";
    drawLeft(a);
    drawRight(b);
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    G = null;
    render();
  }

  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    if (!apBadge) return;
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  /* loop 必须是 {t,v} 对象数组：停留帧 v=20（t=20 h，50%，增长最快） */
  var ap = AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 20 }, { t: 6.5, v: 20 }, { t: 9, v: 40 }, { t: 11, v: 30 }, { t: 13, v: 0 }],
    keys: [0, 10, 20, 40],
    value: A, min: 0, max: 40, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;

  window.__model = window.__bio = {
    calc: calc,
    cases: [
      { v: 10, eq: { prod: 7.6 } },
      { v: 20, eq: { prod: 50 } },
      { v: 30, eq: { prod: 92.4 } }
    ]
  };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
