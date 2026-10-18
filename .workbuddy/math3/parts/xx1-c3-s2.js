/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 3, G = null;

  /* 纯函数：虚半轴 b → c、e、k（a=3 固定） */
  function calc(v) {
    var b = v, c = Math.sqrt(9 + b * b);
    return { a: 3, b: b, c: c, e: c / 3, k: b / 3 };
  }

  function one(v) { return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1); }

  function geom() {
    var p = L.left, wide = p.w >= 400;
    var padL = wide ? 44 : 38, padT = wide ? 58 : 50, padR = wide ? 22 : 14, padB = wide ? 22 : 14;
    var x0 = p.x + padL, y0 = p.y + padT, x1 = p.x + p.w - padR, y1 = p.y + p.h - padB;
    var s = Math.min((x1 - x0) / 12.6, (y1 - y0) / 12.2);
    return { x0: x0, y0: y0, x1: x1, y1: y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, s: s, hw: (x1 - x0) / 2 / s, hh: (y1 - y0) / 2 / s };
  }

  function X(x) { return G.cx + G.s * x; }
  function Y(y) { return G.cy - G.s * y; }

  function line(g, x1, y1, x2, y2, col, w, dash) {
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": w };
    if (dash) a["stroke-dasharray"] = dash;
    return el("line", a, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var p = L.left, r = L.right, s = calc(A), k = s.k, wide = p.w >= 400;

    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, p.x + 16, p.y + 26, "x²/9 − y²/b² = 1（a=3）", "#151a21", "start", 10.5, 700);
    tx(gA, p.x + p.w - 14, p.y + 26, "虚线＝渐近线", "#b8791f", "end", 9.2, 400);

    /* 坐标轴 + 箭头 */
    line(gA, G.x0, G.cy, G.x1, G.cy, "#9aa7b4", 1.1);
    el("polygon", { points: (G.x1 + 1) + "," + G.cy + " " + (G.x1 - 9) + "," + (G.cy - 4) + " " + (G.x1 - 9) + "," + (G.cy + 4), fill: "#9aa7b4" }, gA);
    line(gA, G.cx, G.y1, G.cx, G.y0, "#9aa7b4", 1.1);
    el("polygon", { points: G.cx + "," + (G.y0 - 10) + " " + (G.cx - 4) + "," + (G.y0 - 1) + " " + (G.cx + 4) + "," + (G.y0 - 1), fill: "#9aa7b4" }, gA);
    tx(gA, G.x1 - 3, G.cy - 8, "x", "#5a6472", "end", 10.5, 400);
    tx(gA, G.cx + 8, G.y0 + 12, "y", "#5a6472", "start", 10.5, 400);

    /* 单位刻度 */
    var i;
    for (i = 1; X(i) <= G.x1 - 6; i++) {
      line(gA, X(i), G.cy - 3.5, X(i), G.cy + 3.5, "#c9d4dd", 1);
      line(gA, X(-i), G.cy - 3.5, X(-i), G.cy + 3.5, "#c9d4dd", 1);
    }
    for (i = 1; Y(i) >= G.y0 + 6 && Y(-i) <= G.y1 - 6; i++) {
      line(gA, G.cx - 3.5, Y(i), G.cx + 3.5, Y(i), "#c9d4dd", 1);
      line(gA, G.cx - 3.5, Y(-i), G.cx + 3.5, Y(-i), "#c9d4dd", 1);
    }

    /* 两条渐近线 y=±(b/a)x，b 在分子 */
    var xa = Math.min(G.hw, G.hh / Math.max(k, 0.06));
    line(gA, X(-xa), Y(-k * xa), X(xa), Y(k * xa), "#b8791f", 1.5, "6 5");
    line(gA, X(-xa), Y(k * xa), X(xa), Y(-k * xa), "#b8791f", 1.5, "6 5");

    /* 两支：x=±3cosh t，y=b sinh t */
    var sign, j, tt, xx, yy, up, lo;
    for (sign = -1; sign <= 1; sign += 2) {
      up = []; lo = [];
      for (j = 0; j <= 60; j++) {
        tt = j * 0.05;
        xx = 3 * Math.cosh(tt); yy = A * Math.sinh(tt);
        if (xx > G.hw + 0.2 || yy > G.hh + 0.2) break;
        up.push(X(sign * xx).toFixed(1) + "," + Y(yy).toFixed(1));
        lo.push(X(sign * xx).toFixed(1) + "," + Y(-yy).toFixed(1));
      }
      el("polyline", { points: up.join(" "), fill: "none", stroke: "#2563eb", "stroke-width": 2.4, "stroke-linejoin": "round" }, gA);
      el("polyline", { points: lo.join(" "), fill: "none", stroke: "#2563eb", "stroke-width": 2.4, "stroke-linejoin": "round" }, gA);
    }

    /* 顶点、虚轴端点、焦点 */
    el("circle", { cx: X(3), cy: G.cy, r: 3, fill: "#2563eb" }, gA);
    el("circle", { cx: X(-3), cy: G.cy, r: 3, fill: "#2563eb" }, gA);
    el("circle", { cx: G.cx, cy: Y(A), r: 2.6, fill: "#2f8a5b" }, gA);
    tx(gA, G.cx + 7, Y(A) - 5, "b=" + one(A), "#2f8a5b", "start", 9.2, 700);
    tx(gA, X(1.5), G.cy - 9, "a=3", "#5a6472", "middle", 9, 400);
    if (s.c <= G.hw - 0.1) {
      el("circle", { cx: X(s.c), cy: G.cy, r: 3.8, fill: "#b8402f" }, gA);
      el("circle", { cx: X(-s.c), cy: G.cy, r: 3.8, fill: "#b8402f" }, gA);
      tx(gA, X(s.c), G.cy + 17, "F₂", "#b8402f", "middle", 10, 700);
      tx(gA, X(-s.c), G.cy + 17, "F₁", "#b8402f", "middle", 10, 700);
      tx(gA, X(s.c / 2), G.cy + 17, "c", "#b8402f", "middle", 9, 400);
    }

    /* 右面板：数值 */
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 20, r.y + 28, "随 b 变的三个数", "#5a6472", "start", 10.5, 700);
    var rows = [
      ["虚半轴 b", one(s.b), "#151a21"],
      ["半焦距 c", s.c.toFixed(3), "#2563eb"],
      ["离心率 e", s.e.toFixed(3), "#2f8a5b"],
      ["渐近线斜率 k", s.k.toFixed(3), "#b8791f"]
    ];
    var y0 = r.y + (wide ? 62 : 54), step = wide ? 30 : 26, m;
    for (m = 0; m < rows.length; m++) {
      var yy2 = y0 + m * step;
      tx(gB, r.x + 22, yy2, rows[m][0], "#5a6472", "start", 10, 400);
      tx(gB, r.x + r.w - 22, yy2, rows[m][1], rows[m][2], "end", 12, 700);
    }
    var divY = y0 + 4 * step + 6;
    line(gB, r.x + 22, divY, r.x + r.w - 22, divY, "#e6e9ee", 1);
    tx(gB, r.x + 22, divY + 30, "渐近线 y = ±" + k.toFixed(2) + "x", "#151a21", "start", 11.5, 700);
    tx(gB, r.x + 22, divY + 48, "b 在分子：b 大 → 更陡 → 张口开", "#b8402f", "start", 9.2, 400);

    /* e 的范围条：1 → 5/3 */
    var ex0 = r.x + 26, ex1 = r.x + r.w - 26, ey = divY + 94, ew = ex1 - ex0;
    tx(gB, r.x + 22, ey - 20, "e 的位置（越靠右张口越开）", "#5a6472", "start", 9.2, 400);
    line(gB, ex0, ey, ex1, ey, "#e2e8ee", 5);
    line(gB, ex0, ey, ex0 + ew * (s.e - 1) / (5 / 3 - 1), ey, "#2f8a5b", 5);
    line(gB, ex0, ey - 6, ex0, ey + 6, "#9aa7b4", 1.2);
    line(gB, ex0 + ew * 0.4142 / 0.6667, ey - 6, ex0 + ew * 0.4142 / 0.6667, ey + 6, "#9aa7b4", 1.2);
    line(gB, ex1, ey - 6, ex1, ey + 6, "#9aa7b4", 1.2);
    tx(gB, ex0, ey + 18, "1", "#5a6472", "middle", 9, 400);
    tx(gB, ex0 + ew * 0.6213, ey + 18, "√2", "#5a6472", "middle", 9, 400);
    tx(gB, ex1, ey + 18, "5/3", "#5a6472", "middle", 9, 400);
    el("polygon", { points: (ex0 + ew * (s.e - 1) / (5 / 3 - 1)).toFixed(1) + "," + (ey - 9) + " " + (ex0 + ew * (s.e - 1) / (5 / 3 - 1) + 5).toFixed(1) + "," + (ey - 17) + " " + (ex0 + ew * (s.e - 1) / (5 / 3 - 1) - 5).toFixed(1) + "," + (ey - 17), fill: "#2f8a5b" }, gB);

    /* 状态块 */
    var stY = ey + 32, stH = r.y + r.h - 14 - stY;
    el("rect", { x: r.x + 20, y: stY, width: r.w - 40, height: stH, rx: 8, fill: stBg, stroke: stCol + "55" }, gB);
    tx(gB, r.x + 34, stY + 24, stName, stCol, "start", 13, 700);
    tx(gB, r.x + 34, stY + 46, stSub, "#3a3a35", "start", 9.4, 400);
  }

  var stName = "", stSub = "", stCol = "#2f8a5b", stBg = "#e6f6ee";

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A);
    $("gxVa").textContent = one(A);
    $("gxVb").textContent = s.c.toFixed(3);
    $("gxVc").textContent = s.e.toFixed(3);
    if (A < 3 - 1e-9) { stName = "开口较窄"; stSub = "k=" + s.k.toFixed(2) + " <1，渐近线较平"; stCol = "#b8791f"; stBg = "#fdf3e0"; }
    else if (Math.abs(A - 3) < 1e-9) { stName = "等轴双曲线"; stSub = "k=1，两渐近线互相垂直，e=√2"; stCol = "#2f8a5b"; stBg = "#e6f6ee"; }
    else { stName = "开口较开"; stSub = "k=" + s.k.toFixed(2) + " >1，渐近线较陡"; stCol = "#2563eb"; stBg = "#e8effd"; }
    $("gxVs").textContent = stName;
    $("gxVsn").textContent = stSub;
    $("gxStBox").style.background = stBg;
    $("gxStBox").style.borderColor = stCol + "44";
    $("gxVs").style.color = stCol;
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 4 }, { t: 11.5, v: 2 }, { t: 13.5, v: 1 }],
    keys: [1, 2, 3, 4],
    value: A, min: 1, max: 4, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { c: 3.1623, e: 1.0541 } },
    { v: 3, eq: { c: 4.2426, e: 1.4142 } },
    { v: 4, eq: { c: 5, e: 1.6667 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
