/* 互动脚本本体（bx2-c6-s4：物种数 S → Shannon / Simpson） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 6, G = null;

  /* 每个物种一种形状＋一种颜色；个体数用个数表示（这里各 3 个） */
  var SHAPE = ["circle", "square", "triangle", "diamond", "hex", "star"];
  var COLOR = ["#7fb3d5", "#e0a35c", "#8fb98a", "#c78ab0", "#8c9ec0", "#d98a6a",
    "#6fae9e", "#b0a0c8", "#d9b44a", "#7f9ad0", "#c98a8a", "#87b57a"];

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var S = Math.max(2, Math.min(12, Math.round(v)));
    return { s: S, h: Math.log(S), sim: 1 - 1 / S };
  }

  function shape(g, kind, cx, cy, r, fill) {
    var st = { fill: fill, stroke: "#3a4a5a", "stroke-width": 0.9 };
    if (kind === "circle") { st.cx = cx; st.cy = cy; st.r = r; el("circle", st, g); return; }
    if (kind === "square") { st.x = cx - r; st.y = cy - r; st.width = 2 * r; st.height = 2 * r; st.rx = 1.4; el("rect", st, g); return; }
    var p;
    if (kind === "triangle") { p = cx + "," + (cy - r) + " " + (cx + r * 0.9) + "," + (cy + r * 0.62) + " " + (cx - r * 0.9) + "," + (cy + r * 0.62); }
    else if (kind === "diamond") { p = cx + "," + (cy - r) + " " + (cx + r) + "," + cy + " " + cx + "," + (cy + r) + " " + (cx - r) + "," + cy; }
    else if (kind === "hex") { p = cx + "," + (cy - r) + " " + (cx + r * 0.9) + "," + (cy - r * 0.5) + " " + (cx + r * 0.9) + "," + (cy + r * 0.5) + " " + cx + "," + (cy + r) + " " + (cx - r * 0.9) + "," + (cy + r * 0.5) + " " + (cx - r * 0.9) + "," + (cy - r * 0.5); }
    else { p = ""; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.46 : r; p += (cx + rr * Math.cos(a)) + "," + (cy + rr * Math.sin(a)) + " "; } }
    st.points = p; el("polygon", st, g);
  }

  function geom() {
    var p = L.left, cols = 3;
    return { cols: cols, cellW: (p.w - 26) / cols, cellH: (p.h - 96) / 4, x0: p.x + 13, y0: p.y + 62 };
  }

  function drawCells(g, s) {
    for (var i = 0; i < s; i++) {
      var col = i % 3, row = Math.floor(i / 3);
      var cx = G.x0 + G.cellW * (col + 0.5), cy = G.y0 + G.cellH * (row + 0.5);
      tx(g, G.x0 + G.cellW * col + 1, cy - G.cellH * 0.36, "物种" + (i + 1), COLOR[i % 12], "start", 8, 700);
      for (var j = 0; j < 3; j++) shape(g, SHAPE[i % 6], cx + (j - 1) * Math.min(24, G.cellW * 0.27), cy + 5, 6.2, COLOR[i % 12]);
    }
  }

  function drawCurve(g, s) {
    var r = L.right, px0 = r.x + 46, px1 = r.x + r.w - 18, py0 = r.y + 58, py1 = r.y + r.h - 44;
    var X = function (S) { return px0 + (S - 2) / 10 * (px1 - px0); };
    var Y = function (v) { return py1 - v / 2.6 * (py1 - py0); };
    el("line", { x1: px0, y1: py1, x2: px1, y2: py1, stroke: "#9aa7b4", "stroke-width": 1.2 }, g);
    el("line", { x1: px0, y1: py1, x2: px0, y2: py0 - 6, stroke: "#9aa7b4", "stroke-width": 1.2 }, g);
    tx(g, px0 - 8, py1 + 3, "0", "#5a6472", "end", 8.4, 400);
    tx(g, px0 - 8, Y(1) + 3, "1.0", "#5a6472", "end", 8.4, 400);
    tx(g, px0 - 8, Y(2) + 3, "2.0", "#5a6472", "end", 8.4, 400);
    for (var S = 2; S <= 12; S += 2) tx(g, X(S), py1 + 14, String(S), "#5a6472", "middle", 8.4, 400);
    tx(g, px1, py1 + 28, "物种数 S", "#5a6472", "end", 8.6, 400);
    tx(g, px0 - 30, py0 - 6, "指数", "#5a6472", "start", 8.6, 400);

    var pa = "", pb = "", k, c;
    for (k = 2; k <= 12; k++) {
      c = calc(k);
      pa += X(k) + "," + Y(c.h).toFixed(1) + " ";
      pb += X(k) + "," + Y(c.sim).toFixed(1) + " ";
    }
    el("polyline", { points: pa, fill: "none", stroke: "#2f8a5b", "stroke-width": 2.1 }, g);
    el("polyline", { points: pb, fill: "none", stroke: "#c2703a", "stroke-width": 2.1 }, g);

    var c0 = calc(s), xm = X(c0.s);
    el("line", { x1: xm, y1: py0 - 2, x2: xm, y2: py1, stroke: "#b8402f", "stroke-width": 0.9, "stroke-dasharray": "4 4" }, g);
    el("circle", { cx: xm, cy: Y(c0.h), r: 3.6, fill: "#2f8a5b" }, g);
    el("circle", { cx: xm, cy: Y(c0.sim), r: 3.6, fill: "#c2703a" }, g);
    tx(g, xm, py0 - 8, "S = " + c0.s, "#b8402f", "middle", 9.2, 700);

    tx(g, px1 - 4, py1 - 8, "Simpson = 1 − 1/S", "#8a4a20", "end", 8.6, 400);
    tx(g, px1 - 4, py1 - 22, "H′ = lnS", "#1f6b45", "end", 8.6, 700);
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 16, L.left.y + 28, "群落：共 " + s + " 个物种（形状＋颜色各不相同）", "#5a6472", "start", 10, 700);
    tx(gA, L.left.x + 16, L.left.y + 46, "每个物种画 3 个个体，个数＝个体数（假设相等）", "#8792a0", "start", 8.4, 400);
    drawCells(gA, s);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 16, L.right.y + 28, "物种数 → 多样性指数", "#5a6472", "start", 10, 700);
    drawCurve(gB, s);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    stage.setAttribute("viewBox", L.vb);
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.s);
    $("gxVb").textContent = s.h.toFixed(2);
    $("gxVc").textContent = s.sim.toFixed(2);
    if (s.s <= 3) { st = "低 · 物种太少"; col = "#b8402f"; bg = "#fbeae7"; sn = "S 小，H′ 只有 " + s.h.toFixed(2); }
    else if (s.s <= 5) { st = "偏低 · 接近临界"; col = "#b8791f"; bg = "#fdf3e0"; sn = "物种数偏少，指数偏低"; }
    else if (s.s <= 8) { st = "中等 · 典型群落"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "S=6 是中等群落的典型值"; }
    else { st = "高 · 物种丰富"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "S 再大，H′ 也只是对数式上升"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw(s.s);
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
    loop: [{ t: 0, v: 2 }, { t: 1.2, v: 2 }, { t: 4.6, v: 6 }, { t: 6.8, v: 6 },
      { t: 9.8, v: 12 }, { t: 11.4, v: 8 }, { t: 13.4, v: 2 }],
    keys: [2, 6, 8, 12],
    value: A, min: 2, max: 12, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = {
    calc: calc, cases: [
      { v: 2, eq: { h: 0.6931, sim: 0.5 } },
      { v: 6, eq: { h: 1.7918, sim: 0.8333 } },
      { v: 12, eq: { h: 2.4849, sim: 0.9167 } }
    ]
  };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
