/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 50, G = null;

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var b = Math.max(0, Math.min(100, Number(v) || 0));
    var enter = 100 - b;
    return { enter: enter, remain: enter * 0.1 };
  }

  function geom() {
    var l = L.left, r = L.right, h = l.h;
    return {
      x0: l.x + 14, x1: l.x + l.w - 14, cx: l.x + l.w / 2,
      tY: l.y + Math.round(h * 0.085),
      wT: l.y + Math.round(h * 0.26),
      wH: Math.max(14, Math.round(h * 0.058)),
      b2: l.y + Math.round(h * 0.48),
      bH: Math.max(24, Math.round(h * 0.11)),
      b3: l.y + Math.round(h * 0.66),
      ft: l.y + Math.round(h * 0.93),
      bw: r.w - 82,
      rY: r.y + Math.round(r.h * 0.20),
      rH: Math.round(r.h * 0.20)
    };
  }

  function wall(x, w, gA) {
    if (w <= 1) return;
    el("rect", { x: x, y: G.wT, width: w, height: G.wH, rx: 4, fill: "#dbeef8", stroke: "#a9cfe3" }, gA);
    el("line", { x1: x + 2, y1: G.wT + G.wH / 2, x2: x + w - 2, y2: G.wT + G.wH / 2, stroke: "#b9d9ea", "stroke-width": 1 }, gA);
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, G.x0, G.tY, "第一道防线：一堵有缺口的墙", "#5a6472", "start", 10.5, 700);

    /* 墙：缺口宽度 ∝ enter */
    var span = G.x1 - G.x0;
    var gapW = s.enter <= 0 ? 0 : Math.max(6, span * (s.enter / 100) * 0.88);
    var g0 = G.cx - gapW / 2, g1 = G.cx + gapW / 2;
    wall(G.x0, g0 - G.x0, gA);
    wall(g1, G.x1 - g1, gA);
    if (g0 > G.x0 + 1) tx(gA, G.x0 + 6, G.wT - 8, "皮肤、黏膜", "#2f7fa8", "start", 9.2, 700);
    if (gapW > 40) tx(gA, G.cx, G.wT + G.wH / 2 + 3, "缺口 " + s.enter.toFixed(0) + "%", "#b8402f", "middle", 9, 700);

    /* 病原体：数量 ∝ enter，穿过缺口落入体内 */
    var n = Math.round(s.enter / 17), k, px;
    for (k = 0; k < n; k++) {
      px = gapW > 12 ? g0 + gapW * (k + 1) / (n + 1) : G.cx + (k - n / 2) * 8;
      el("circle", { cx: px, cy: G.wT - 16, r: 3.2, fill: "#b8402f" }, gA);
      el("line", { x1: px, y1: G.wT - 11, x2: px, y2: G.b2 - 6, stroke: "#b8402f", "stroke-width": 1 }, gA);
    }

    el("rect", { x: G.x0, y: G.b2, width: span, height: G.bH, rx: 6, fill: "#e9f7f0", stroke: "#a8ddc4" }, gA);
    tx(gA, G.x0 + 10, G.b2 + G.bH * 0.42, "第二道：杀菌物质 + 吞噬细胞", "#2f8a5b", "start", 9.4, 700);
    tx(gA, G.x0 + 10, G.b2 + G.bH * 0.78, "非特异性，顶掉进入量的约九成", "#5a6472", "start", 8.8, 400);
    el("rect", { x: G.x0, y: G.b3, width: span, height: G.bH, rx: 6, fill: "#fdf5e6", stroke: "#e8cf9a" }, gA);
    tx(gA, G.x0 + 10, G.b3 + G.bH * 0.42, "第三道：特异性免疫", "#b8791f", "start", 9.4, 700);
    tx(gA, G.x0 + 10, G.b3 + G.bH * 0.78, "抗体 + 细胞毒性 T 细胞，专杀残余", "#5a6472", "start", 8.8, 400);

    /* 残余病原体 */
    var m = Math.round(s.remain / 2), q;
    for (q = 0; q < m; q++) el("circle", { cx: G.cx + (q - m / 2) * 9, cy: G.b3 - 9, r: 2.8, fill: "#b8791f" }, gA);
    tx(gA, G.x0, G.ft, "b 越小 → 缺口越宽 → 后两道负担越重", "#5a6472", "start", 9, 400);

    /* 右：各道防线承担的量 */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 16, G.rY - 26, "各道防线承担的量（占病原体总量 %）", "#5a6472", "start", 10, 700);
    var rows = [
      { t: "① 进入体内 enter", v: s.enter, c: "#b8402f" },
      { t: "② 第二道清掉（九成）", v: s.enter - s.remain, c: "#2f8a5b" },
      { t: "③ 残余 → 第三道", v: s.remain, c: "#b8791f" }
    ], a, ry, rw;
    for (a = 0; a < rows.length; a++) {
      ry = G.rY + a * G.rH; rw = Math.max(0, G.bw * rows[a].v / 100);
      tx(gB, L.right.x + 16, ry, rows[a].t, "#3a3a35", "start", 9.2, 400);
      el("rect", { x: L.right.x + 16, y: ry + 7, width: G.bw, height: 12, rx: 3, fill: "#eef2f6" }, gB);
      el("rect", { x: L.right.x + 16, y: ry + 7, width: rw, height: 12, rx: 3, fill: rows[a].c }, gB);
      tx(gB, L.right.x + 24 + G.bw, ry + 17, rows[a].v.toFixed(1) + "%", rows[a].c, "start", 9, 700);
    }
    var axY = G.rY + 3 * G.rH + 4, axX = L.right.x + 16;
    el("line", { x1: axX, y1: axY, x2: axX + G.bw, y2: axY, stroke: "#c9d6e0", "stroke-width": 1 }, gB);
    tx(gB, axX, axY + 14, "0", "#8b97a4", "middle", 8.5, 400);
    tx(gB, axX + G.bw / 2, axY + 14, "50", "#8b97a4", "middle", 8.5, 400);
    tx(gB, axX + G.bw, axY + 14, "100", "#8b97a4", "middle", 8.5, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.enter.toFixed(0);
    $("gxVc").textContent = s.remain.toFixed(1);
    if (A >= 80) { st = "第一道基本完好"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "进入量不足两成"; }
    else if (A >= 50) { st = "有破损，第二道负担加重"; col = "#b8791f"; bg = "#fdf3e0"; sn = "靠第二道顶住"; }
    else { st = "大量病原体进入"; col = "#b8402f"; bg = "#fbeae7"; sn = "必须依赖特异性免疫"; }
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
    loop: [{ t: 0, v: 100 }, { t: 1.2, v: 100 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 0 }, { t: 11, v: 25 }, { t: 13, v: 100 }],
    keys: [0, 25, 50, 100],
    value: A, min: 0, max: 100, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 100, eq: { enter: 0, remain: 0 } },
    { v: 50, eq: { enter: 50, remain: 5 } },
    { v: 0, eq: { enter: 100, remain: 10 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
