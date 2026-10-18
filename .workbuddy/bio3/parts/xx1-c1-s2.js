/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 10;

  /* 纯函数：乳酸量 L(mmol/L) → 两种情况的 pH。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var buf = 7.40 - 0.005 * v, nob = 7.40 - 0.040 * v;
    return { buf: Math.round(buf * 1000) / 1000, nobuf: Math.round(nob * 1000) / 1000, d: Math.round((buf - nob) * 1000) / 1000 };
  }

  /* 把版式换算成绘图坐标（画布尺寸变化时重建） */
  function geom() {
    var l = L.left, r = L.right;
    var px = l.x + 54, py = l.y + 58, ph = l.h - 130, pw = l.w - 74;
    var g = { px: px, py: py, pw: pw, ph: ph, top: 7.55, bot: 6.45, l: l, r: r };
    g.y = function (v) { return py + (g.top - v) / (g.top - g.bot) * ph; };
    g.x = function (v) { return px + v / 20 * pw; };
    g.tkY = py + ph + 14;
    g.lg1 = py + ph + 40;
    g.lg2 = py + ph + 58;
    g.ry = r.y + 64;
    g.bx0 = r.x + 20; g.bx1 = r.x + r.w - 20;
    g.bp = function (v) { return g.bx0 + (v - 6.4) / 1.2 * (g.bx1 - g.bx0); };
    return g;
  }

  function drawLeft(g, s) {
    var gA = $("gxA"), l = g.l, i, v;
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 20, l.y + 30, "血浆 pH 随乳酸量 L 的变化", "#5a6472", "start", 10.5, 700);
    tx(gA, l.x + 20, l.y + 46, "纵轴 pH，横轴 L（mmol/L）", "#8a97a4", "start", 8.6, 400);

    el("rect", { x: g.px, y: g.y(7.45), width: g.pw, height: g.y(7.35) - g.y(7.45), fill: "#e6f6ee" }, gA);
    tx(gA, g.px + g.pw - 6, g.y(7.40) + 3.1, "正常范围 7.35–7.45", "#2f8a5b", "end", 8.4, 700);

    el("line", { x1: g.px, y1: g.py, x2: g.px, y2: g.py + g.ph, stroke: "#9fb0bf", "stroke-width": 1.2 }, gA);
    el("line", { x1: g.px, y1: g.py + g.ph, x2: g.px + g.pw, y2: g.py + g.ph, stroke: "#9fb0bf", "stroke-width": 1.2 }, gA);

    var ticks = [7.45, 7.35, 7.20, 7.00, 6.80, 6.60];
    for (i = 0; i < ticks.length; i++) {
      var ty = g.y(ticks[i]);
      el("line", { x1: g.px - 4, y1: ty, x2: g.px, y2: ty, stroke: "#9fb0bf", "stroke-width": 1 }, gA);
      tx(gA, g.px - 8, ty + 3.1, ticks[i].toFixed(2), "#5a6472", "end", 8.4, 400);
    }
    var xs = [0, 5, 10, 15, 20];
    for (i = 0; i < xs.length; i++) tx(gA, g.x(xs[i]), g.tkY, String(xs[i]), "#5a6472", "middle", 8.4, 400);

    var pb = [], pn = [];
    for (v = 0; v <= 20; v += 2) {
      var c = calc(v);
      pb.push(g.x(v) + "," + g.y(c.buf));
      pn.push(g.x(v) + "," + g.y(c.nobuf));
    }
    el("polyline", { points: pb.join(" "), fill: "none", stroke: "#2f8a5b", "stroke-width": 2.2 }, gA);
    el("polyline", { points: pn.join(" "), fill: "none", stroke: "#b8402f", "stroke-width": 2.2 }, gA);

    var mx = g.x(A);
    el("line", { x1: mx, y1: g.y(7.40), x2: mx, y2: g.y(s.nobuf), stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: mx, cy: g.y(s.buf), r: 3.6, fill: "#2f8a5b" }, gA);
    el("circle", { cx: mx, cy: g.y(s.nobuf), r: 3.6, fill: "#b8402f" }, gA);
    var an = A > 13 ? "end" : "start", ax = A > 13 ? mx - 8 : mx + 8;
    tx(gA, ax, g.y(s.buf) - 7, s.buf.toFixed(2), "#2f8a5b", an, 8.8, 700);
    tx(gA, ax, g.y(s.nobuf) + 13, s.nobuf.toFixed(2), "#b8402f", an, 8.8, 700);

    el("line", { x1: l.x + 20, y1: g.lg1, x2: l.x + 42, y2: g.lg1, stroke: "#2f8a5b", "stroke-width": 2.2 }, gA);
    tx(gA, l.x + 48, g.lg1 + 3, "有缓冲对：变化很小", "#3a3a35", "start", 8.4, 400);
    el("line", { x1: l.x + 20, y1: g.lg2, x2: l.x + 42, y2: g.lg2, stroke: "#b8402f", "stroke-width": 2.2 }, gA);
    tx(gA, l.x + 48, g.lg2 + 3, "无缓冲：下降很快", "#3a3a35", "start", 8.4, 400);
  }

  /* 右侧一根 pH 位置条：浅绿段＝正常范围，竖线＝当前值 */
  function bar(p, g, y, label, val, col) {
    tx(p, g.r.x + 20, y, label, "#5a6472", "start", 9.2, 700);
    tx(p, g.bx1, y, val.toFixed(2), col, "end", 11, 700);
    el("rect", { x: g.bx0, y: y + 10, width: g.bx1 - g.bx0, height: 12, rx: 6, fill: "#eef1f4" }, p);
    el("rect", { x: g.bp(7.35), y: y + 10, width: g.bp(7.45) - g.bp(7.35), height: 12, fill: "#d9f0e3" }, p);
    el("rect", { x: g.bp(val) - 1.6, y: y + 7, width: 3.2, height: 18, rx: 1.6, fill: col }, p);
  }

  function drawRight(g, s) {
    var gB = $("gxB"), r = g.r, i, inR = s.buf >= 7.35 && s.buf <= 7.45;
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 20, r.y + 30, "同量乳酸，两种 pH", "#5a6472", "start", 10.5, 700);
    bar(gB, g, g.ry, "有缓冲对的 pH", s.buf, "#2f8a5b");
    bar(gB, g, g.ry + 64, "无缓冲的 pH", s.nobuf, "#b8402f");
    tx(gB, r.x + 20, g.ry + 100, "两条线相差 ΔpH = " + s.d.toFixed(2), "#3a3a35", "start", 9.2, 700);

    var lines = ["① 乳酸 + NaHCO₃ → 乳酸钠 + H₂CO₃", "② H₂CO₃ 分解为 CO₂，由肺排出", "③ 神经—体液—免疫调节网络同时参与", "④ pH 仍会小幅下降，只是被减弱"];
    for (i = 0; i < lines.length; i++) tx(gB, r.x + 20, g.ry + 122 + i * 18, lines[i], "#5a6472", "start", 8.6, 400);

    var by = r.y + r.h - 96;
    el("rect", { x: r.x + 20, y: by, width: r.w - 40, height: 80, rx: 8, fill: "#fbf6e8", stroke: "#e8d9b4" }, gB);
    tx(gB, r.x + 34, by + 24, "L = " + A + " mmol/L 时的对比", "#8a6a3a", "start", 9.2, 700);
    tx(gB, r.x + 34, by + 44, "有缓冲对 " + s.buf.toFixed(2) + (inR ? "，仍在范围内" : "，已跌出正常范围"), "#2f8a5b", "start", 8.6, 400);
    tx(gB, r.x + 34, by + 62, "无缓冲 " + s.nobuf.toFixed(2) + "，相差 " + s.d.toFixed(2), "#b8402f", "start", 8.6, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    if (s.buf >= 7.35 && s.buf <= 7.45) { st = "在正常范围内"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "在 7.35–7.45 之间"; }
    else if (s.buf < 7.35) { st = "酸中毒方向"; col = "#b8402f"; bg = "#fbeae7"; sn = "低于 7.35，已出带"; }
    else { st = "碱中毒方向"; col = "#b8791f"; bg = "#fdf3e0"; sn = "高于 7.45，已出带"; }
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = s.buf.toFixed(2);
    $("gxVc").textContent = s.nobuf.toFixed(2);
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    $("gxA").textContent = "";
    $("gxB").textContent = "";
    drawLeft(G, s);
    drawRight(G, s);
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 10 }, { t: 6.5, v: 10 }, { t: 9, v: 20 }, { t: 11, v: 15 }, { t: 13, v: 0 }],
    keys: [0, 10, 15, 20],
    value: A, min: 0, max: 20, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { buf: 7.4, nobuf: 7.4 } },
    { v: 10, eq: { buf: 7.35, nobuf: 7.0 } },
    { v: 20, eq: { buf: 7.3, nobuf: 6.6 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
