document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null;

  var BLUE = "#2563eb", GREEN = "#2f8a5b", PURPLE = "#7c3aed", AMBER = "#b8791f", GRAY = "#94a3b8", INK = "#151a21";

  function calc(v) {
    var t = v * Math.PI / 180;
    var dot = 6 * Math.cos(t);
    return { dot: dot, sum2: 13 + 2 * dot, dif2: 13 - 2 * dot };
  }

  function geom() {
    var p = L.left;
    return {
      p: p, cx: p.x + p.w * 0.5, cy: p.y + p.h * 0.60,
      k: (L === W ? 40 : 24), r: (L === W ? 38 : 26),
      ax: { x: p.x + 36, y: p.y + p.h - 40 }
    };
  }

  function head(g, x, y, ang, col, size) {
    var a1 = ang - 0.42, a2 = ang + 0.42;
    var d = "M" + x + "," + y +
      " L" + (x - size * Math.cos(a1)) + "," + (y - size * Math.sin(a1)) +
      " L" + (x - size * Math.cos(a2)) + "," + (y - size * Math.sin(a2)) + " Z";
    el("path", { d: d, fill: col, stroke: col, "stroke-width": 0.6 }, g);
  }

  function vec(g, x1, y1, x2, y2, col, w, dash) {
    el("path", {
      d: "M" + x1 + "," + y1 + " L" + x2 + "," + y2,
      fill: "none", stroke: col, "stroke-width": w,
      "stroke-dasharray": dash || "none"
    }, g);
    head(g, x2, y2, Math.atan2(y2 - y1, x2 - x1), col, w > 2.2 ? 9 : 7.5);
  }

  function line(g, x1, y1, x2, y2, col, w, dash) {
    el("path", { d: "M" + x1 + "," + y1 + " L" + x2 + "," + y2, fill: "none", stroke: col, "stroke-width": w, "stroke-dasharray": dash || "none" }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), p = G.p, k = G.k, O = { x: G.cx, y: G.cy };
    var rad = A * Math.PI / 180, co = Math.cos(rad), si = Math.sin(rad);
    var Ax = O.x + 2 * k, Bay = O.y - 3 * k * si, Bx = O.x + 3 * k * co;
    var Sx = Bx + 2 * k, Sy = Bay;

    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, p.x + 18, p.y + 26, "共起点：对角线是 a+b", "#5a6472", "start", 10.5, 700);
    tx(gA, p.x + 18, p.y + 44, "蓝：a、b    绿：a+b    紫虚线：a−b", "#7a8698", "start", 9, 400);

    el("path", {
      d: "M" + O.x + "," + O.y + " L" + Ax + "," + O.y + " L" + Sx + "," + Sy + " L" + Bx + "," + Bay + " Z",
      fill: "#eaf2fb", opacity: 0.65, stroke: "none"
    }, gA);

    vec(gA, Bx, Bay, Ax, O.y, PURPLE, 2, "6 4");
    vec(gA, O.x, O.y, Ax, O.y, BLUE, 2.4);
    vec(gA, O.x, O.y, Bx, Bay, BLUE, 2.4);
    vec(gA, O.x, O.y, Sx, Sy, GREEN, 2.6);
    el("circle", { cx: O.x, cy: O.y, r: 3.4, fill: INK }, gA);
    tx(gA, O.x - 12, O.y + 16, "O", INK, "end", 10.5, 700);

    if (A > 8) {
      var ex = O.x + G.r * co, ey = O.y - G.r * si;
      el("path", { d: "M" + (O.x + G.r) + "," + O.y + " A" + G.r + "," + G.r + " 0 0 0 " + ex + "," + ey, fill: "none", stroke: AMBER, "stroke-width": 1.5 }, gA);
      tx(gA, O.x + (G.r + 15) * Math.cos(rad / 2), O.y - (G.r + 15) * Math.sin(rad / 2), "θ", AMBER, "middle", 10.5, 700);
    }

    tx(gA, O.x + 1.5 * k, O.y + 18, "a", BLUE, "middle", 12, 700);
    tx(gA, O.x + 1.5 * k * co + 12 * si, O.y - 1.5 * k * si - 10, "b", BLUE, "middle", 12, 700);
    tx(gA, O.x + 1.15 * k + 2 * k * co, O.y + 0.6 * k - 1.6 * k * si, "a+b", GREEN, "middle", 11, 700);

    var T = G.ax, al = (L === W ? 52 : 40);
    line(gA, T.x, T.y, T.x + al, T.y, GRAY, 1.4);
    head(gA, T.x + al, T.y, 0, GRAY, 6.5);
    line(gA, T.x, T.y, T.x, T.y - al, GRAY, 1.4);
    head(gA, T.x, T.y - al, -Math.PI / 2, GRAY, 6.5);
    line(gA, T.x, T.y, T.x + al * 0.66, T.y - al * 0.54, GRAY, 1.4);
    head(gA, T.x + al * 0.66, T.y - al * 0.54, Math.atan2(-al * 0.54, al * 0.66), GRAY, 6.5);
    tx(gA, T.x + al + 4, T.y + 4, "x", GRAY, "start", 9, 700);
    tx(gA, T.x, T.y - al - 6, "z", GRAY, "middle", 9, 700);
    tx(gA, T.x + al * 0.66 + 6, T.y - al * 0.54, "y", GRAY, "start", 9, 700);

    var q = L.right;
    el("rect", { x: q.x, y: q.y, width: q.w, height: q.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, q.x + 18, q.y + 26, "a·b = 6cosθ 的图像", "#5a6472", "start", 10.5, 700);

    var cx0 = q.x + 56, cx1 = q.x + q.w - 30, top = q.y + 66, hgt = (L === W ? 196 : 148), bot = top + hgt, midY = (top + bot) / 2;
    var X = function (t) { return cx0 + t / 180 * (cx1 - cx0); };
    var Y = function (d) { return midY - d / 6 * (hgt / 2); };

    line(gB, cx0, midY, cx1, midY, "#dfe5ec", 1.2);
    line(gB, cx0, top, cx0, bot, "#dfe5ec", 1.2, "4 4");
    line(gB, X(90), top, X(90), bot, "#eef2f6", 1, "3 4");
    line(gB, X(180), top, X(180), bot, "#eef2f6", 1, "3 4");

    var d = "M" + X(0) + "," + Y(6);
    for (var i = 1; i <= 36; i++) { var t = i * 5; d += " L" + X(t) + "," + Y(6 * Math.cos(t * Math.PI / 180)); }
    el("path", { d: d, fill: "none", stroke: BLUE, "stroke-width": 2.2 }, gB);

    line(gB, X(A), top, X(A), bot, AMBER, 1.2, "5 4");
    el("circle", { cx: X(A), cy: Y(s.dot), r: 4.6, fill: AMBER, stroke: "#ffffff", "stroke-width": 1.4 }, gB);
    tx(gB, cx0 - 8, top + 4, "6", "#8b96a5", "end", 9, 400);
    tx(gB, cx0 - 8, midY + 4, "0", "#8b96a5", "end", 9, 400);
    tx(gB, cx0 - 8, bot + 4, "−6", "#8b96a5", "end", 9, 400);
    tx(gB, cx0, bot + 18, "0°", "#8b96a5", "middle", 9, 400);
    tx(gB, X(90), bot + 18, "90°", "#8b96a5", "middle", 9, 400);
    tx(gB, cx1, bot + 18, "180°", "#8b96a5", "middle", 9, 400);

    var ty = bot + 46;
    tx(gB, q.x + 18, ty, "θ = " + A + "°", INK, "start", 11.5, 700);
    tx(gB, q.x + 18, ty + 24, "a·b = " + s.dot.toFixed(2) + "（一个数）", "#33506b", "start", 10.5, 400);
    tx(gB, q.x + 18, ty + 46, "|a+b| = " + Math.sqrt(s.sum2).toFixed(2) + "，|a−b| = " + Math.sqrt(s.dif2).toFixed(2), "#33506b", "start", 10.5, 400);
    tx(gB, q.x + 18, ty + 68, "|a+b|² = " + s.sum2.toFixed(2) + "，|a−b|² = " + s.dif2.toFixed(2), "#33506b", "start", 10.5, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A + "°";
    $("gxVb").textContent = s.dot.toFixed(2);
    $("gxVc").textContent = s.sum2.toFixed(2);
    if (A < 90) { st = "a·b > 0"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "锐角，投影为正"; }
    else if (A === 90) { st = "a·b = 0"; col = "#b8791f"; bg = "#fdf3e0"; sn = "两向量垂直，|a+b| 最小"; }
    else { st = "a·b < 0"; col = "#2563eb"; bg = "#e8effa"; sn = "钝角，投影反方向"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 90 }, { t: 6.5, v: 90 }, { t: 9, v: 180 }, { t: 11.5, v: 120 }, { t: 13.5, v: 0 }],
    keys: [0, 90, 180],
    value: A, min: 0, max: 180, step: 15,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = {
    calc: calc,
    cases: [
      { v: 0, eq: { dot: 6, sum2: 25 } },
      { v: 90, eq: { dot: 0, sum2: 13 } },
      { v: 180, eq: { dot: -6, sum2: 1 } }
    ]
  };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
