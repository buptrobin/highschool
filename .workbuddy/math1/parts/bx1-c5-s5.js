/* 互动脚本：滑块 α(0°–90°，step 5°) → sin2α、cos2α、sin²α+cos²α */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套独立坐标：宽屏 880×470，窄屏 360×700 */
  var W = { vb: "0 0 880 470", ro: 1, left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 },
    ci: { x: 150, y: 250, r: 92 }, pl: { x0: 530, x1: 830, y0: 235, k: 118, t: 95, b: 375, lx: 522, ty: 106 } };
  var N = { vb: "0 0 360 700", ro: 0, left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 },
    ci: { x: 180, y: 150, r: 72 }, pl: { x0: 70, x1: 326, y0: 520, k: 76, t: 404, b: 628, lx: 62, ty: 432 } };
  var L = W, A = 0, G = null;

  /* 纯函数：唯一真值来源 */
  function calc(v) {
    var r = v * Math.PI / 180, s = Math.sin(r), c = Math.cos(r);
    return { a: v, s2: Math.sin(2 * r), c2: Math.cos(2 * r), one: s * s + c * c };
  }
  function f3(n) { return n.toFixed(3); }
  function seg(g, x1, y1, x2, y2, c, w, d) {
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, "stroke-width": w, "stroke-dasharray": d || "none" }, g);
  }
  function head(g, x, y, u) {
    el("polygon", { points: u ? x + "," + (y - 8) + " " + (x - 3.6) + "," + y + " " + (x + 3.6) + "," + y
      : (x + 8) + "," + y + " " + x + "," + (y - 3.6) + " " + x + "," + (y + 3.6), fill: "#9aa6b2" }, g);
  }
  function arc(g, c, rr, deg) {
    var e = deg * Math.PI / 180;
    el("path", { d: "M" + (c.x + rr) + "," + c.y + " A" + rr + "," + rr + " 0 " + (deg > 180 ? 1 : 0) + " 0 " +
      (c.x + rr * Math.cos(e)).toFixed(1) + "," + (c.y - rr * Math.sin(e)).toFixed(1),
      fill: "none", stroke: "#2563eb", "stroke-width": 1.4 }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), r = A * Math.PI / 180, c = L.ci, p = L.pl;
    gA.textContent = ""; gB.textContent = "";

    /* ---------- 左：单位圆 ---------- */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 26, "单位圆：α 与 2α 的终边", "#5a6472", "start", 10.5, 700);
    seg(gA, c.x - c.r - 26, c.y, c.x + c.r + 26, c.y, "#9aa6b2", 1); head(gA, c.x + c.r + 26, c.y);
    seg(gA, c.x, c.y + c.r + 26, c.x, c.y - c.r - 26, "#9aa6b2", 1); head(gA, c.x, c.y - c.r - 26, 1);
    el("circle", { cx: c.x, cy: c.y, r: c.r, fill: "none", stroke: "#c9d6e0", "stroke-width": 1.4 }, gA);
    tx(gA, c.x - 10, c.y + 14, "O", "#8a94a0", "end", 8.6, 400);
    tx(gA, c.x + c.r + 16, c.y - 6, "x", "#8a94a0", "start", 8.6, 400);
    tx(gA, c.x + 6, c.y - c.r - 16, "y", "#8a94a0", "start", 8.6, 400);

    var xa = c.x + c.r * Math.cos(r), ya = c.y - c.r * Math.sin(r);
    seg(gA, c.x, c.y, c.x + c.r * Math.cos(2 * r), c.y - c.r * Math.sin(2 * r), "#b8402f", 1.3, "4 3");
    seg(gA, c.x, c.y, xa, ya, "#2563eb", 1.8);
    seg(gA, xa, ya, xa, c.y, "#b9c9d8", 1, "2 3");
    seg(gA, xa, ya, c.x, ya, "#b9c9d8", 1, "2 3");
    el("circle", { cx: xa, cy: ya, r: 4, fill: "#2563eb" }, gA);
    arc(gA, c, 30, A);
    arc(gA, c, 48, 2 * A);
    tx(gA, c.x + 40 * Math.cos(r / 2), c.y - 40 * Math.sin(r / 2) + 3, "α", "#2563eb", "middle", 9.4, 700);
    tx(gA, c.x + 62 * Math.cos(r), c.y - 62 * Math.sin(r) + 3, "2α", "#b8402f", "middle", 9.4, 700);

    if (L.ro) {
      var rx = L.left.x + 264, ry = L.left.y + 132;
      tx(gA, rx, ry, "此刻读数", "#5a6472", "start", 9.6, 700);
      tx(gA, rx, ry + 26, "α = " + A + "°，2α = " + (2 * A) + "°", "#3a3a35", "start", 9.4, 400);
      tx(gA, rx, ry + 50, "sinα = " + f3(Math.sin(r)), "#3a3a35", "start", 9.4, 400);
      tx(gA, rx, ry + 74, "cosα = " + f3(Math.cos(r)), "#3a3a35", "start", 9.4, 400);
      tx(gA, rx, ry + 100, "sin2α = " + f3(s.s2), "#2563eb", "start", 9.4, 400);
      tx(gA, rx, ry + 124, "cos2α = " + f3(s.c2), "#2f8a5b", "start", 9.4, 400);
      tx(gA, rx, ry + 150, "sin²α + cos²α = " + f3(s.one), "#2563eb", "start", 9.4, 700);
    } else {
      var by = c.y + c.r + 26;
      tx(gA, L.left.x + 14, by, "α = " + A + "°，2α = " + (2 * A) + "°", "#3a3a35", "start", 9, 400);
      tx(gA, L.left.x + 14, by + 20, "sin2α = " + f3(s.s2) + "　cos2α = " + f3(s.c2), "#3a3a35", "start", 9, 400);
      tx(gA, L.left.x + 14, by + 40, "sin²α + cos²α = " + f3(s.one), "#2563eb", "start", 9, 700);
    }

    /* ---------- 右：两条曲线 ---------- */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 30, "曲线：sin2α 与 cos2α（0°–90°）", "#5a6472", "start", 10.5, 700);
    seg(gB, p.x0 - 16, p.y0, p.x1 + 8, p.y0, "#9aa6b2", 1); head(gB, p.x1 + 8, p.y0);
    seg(gB, p.x0, p.b, p.x0, p.t - 8, "#9aa6b2", 1); head(gB, p.x0, p.t - 8, 1);

    var vs = [1, 0, -1], i, yv;
    for (i = 0; i < 3; i++) {
      yv = p.y0 - vs[i] * p.k;
      seg(gB, p.x0 - 4, yv, p.x0, yv, "#c9d6e0", 1);
      tx(gB, p.lx, yv + 3, vs[i] === 1 ? "1" : (vs[i] === 0 ? "0" : "−1"), "#8a94a0", "end", 8.6, 400);
    }
    var ds = [0, 30, 45, 60, 90], j, xd;
    for (j = 0; j < 5; j++) {
      xd = p.x0 + ds[j] / 90 * (p.x1 - p.x0);
      seg(gB, xd, p.y0 - 4, xd, p.y0 + 4, "#c9d6e0", 1);
      tx(gB, xd, p.y0 + 20, ds[j] + "°", "#8a94a0", "middle", 8.6, 400);
    }

    var ps = "", pc = "", d, x, y1, y2;
    for (d = 0; d <= 90; d += 2) {
      x = p.x0 + d / 90 * (p.x1 - p.x0);
      y1 = p.y0 - Math.sin(2 * d * Math.PI / 180) * p.k;
      y2 = p.y0 - Math.cos(2 * d * Math.PI / 180) * p.k;
      ps += (d === 0 ? "M" : "L") + x.toFixed(1) + "," + y1.toFixed(1);
      pc += (d === 0 ? "M" : "L") + x.toFixed(1) + "," + y2.toFixed(1);
    }
    el("path", { d: ps, fill: "none", stroke: "#2563eb", "stroke-width": 1.8 }, gB);
    el("path", { d: pc, fill: "none", stroke: "#2f8a5b", "stroke-width": 1.8 }, gB);

    /* 45° 停留帧：sin2α 峰值 1，cos2α 过 0 */
    var x45 = p.x0 + 0.5 * (p.x1 - p.x0);
    seg(gB, x45, p.y0 - p.k, x45, p.y0 + p.k, "#e0b4ac", 1, "3 3");
    tx(gB, x45 + 6, p.y0 - p.k - 8, "峰值 sin2α = 1", "#2563eb", "start", 8.8, 700);
    tx(gB, x45 + 6, p.y0 - 14, "cos2α = 0", "#2f8a5b", "start", 8.8, 700);
    seg(gB, p.x0 + 14, p.ty, p.x0 + 32, p.ty, "#2563eb", 2);
    tx(gB, p.x0 + 38, p.ty + 3, "sin2α", "#2563eb", "start", 8.8, 700);
    seg(gB, p.x0 + 14, p.ty + 18, p.x0 + 32, p.ty + 18, "#2f8a5b", 2);
    tx(gB, p.x0 + 38, p.ty + 21, "cos2α", "#2f8a5b", "start", 8.8, 700);

    var xc = p.x0 + A / 90 * (p.x1 - p.x0);
    seg(gB, xc, p.y0 - s.s2 * p.k, xc, p.y0, "#b9c9d8", 1, "2 3");
    el("circle", { cx: xc, cy: p.y0 - s.s2 * p.k, r: 4, fill: "#2563eb" }, gB);
    el("circle", { cx: xc, cy: p.y0 - s.c2 * p.k, r: 4, fill: "#2f8a5b" }, gB);

    tx(gB, L.right.x + 20, L.right.y + L.right.h - 56, "sin²α + cos²α = " + f3(s.one) + "（恒为 1）", "#2563eb", "start", 9.4, 700);
    tx(gB, L.right.x + 20, L.right.y + L.right.h - 34, "α = " + A + "°，2α = " + (2 * A) + "°", "#3a3a35", "start", 9.4, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = 1; stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A + "°";
    $("gxVb").textContent = f3(s.s2);
    $("gxVc").textContent = f3(s.c2);
    if (A < 45) { st = "cos2α > 0"; col = "#2563eb"; bg = "#eaf2fe"; sn = "2α < 90°，仍在第一象限"; }
    else if (A === 45) { st = "cos2α = 0"; col = "#b8791f"; bg = "#fdf3e0"; sn = "2α = 90°，sin2α 取到最大值 1"; }
    else { st = "cos2α < 0"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "2α > 90°，余弦转负"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = 1;
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 45 }, { t: 6.5, v: 45 }, { t: 9, v: 60 }, { t: 11.5, v: 90 }, { t: 13.5, v: 0 }],
    keys: [0, 30, 45, 60],
    value: A, min: 0, max: 90, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 30, eq: { s2: 0.866, c2: 0.5 } },
    { v: 45, eq: { s2: 1, c2: 0 } },
    { v: 60, eq: { s2: 0.866, c2: -0.5 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
