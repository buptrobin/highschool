/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 40;
  var MARK = 50, TOTAL = 100, REAL = 500;

  /* 纯函数：重捕中带标记的个数 m → 估算总数 N 与相对误差。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var Nv = MARK * TOTAL / v;
    return { N: Nv, err: (Nv - REAL) / REAL * 100 };
  }

  /* 一次算清两套坐标的几何量 */
  function geom() {
    var g = {}, wide = L === W;
    g.cell = wide ? 24 : 20;
    g.r = wide ? 8 : 6.5;
    g.gx = L.left.x + (L.left.w - g.cell * 10) / 2;
    g.gy = L.left.y + (wide ? 78 : 56);
    g.bx = L.right.x + (wide ? 40 : 34);
    g.bw = L.right.w - (wide ? 80 : 68);
    g.by = L.right.y + (wide ? 110 : 96);
    g.bh = wide ? 46 : 40;
    g.maxN = 2500;
    return g;
  }

  function draw() {
    var g = G, s = calc(A), gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";

    /* 左：第二次重捕的 100 只，红色是带标记的 */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 30, "第二次重捕 n = 100 只", "#5a6472", "start", 10.5, 700);
    tx(gA, L.left.x + 20, L.left.y + 50, "红点＝带标记的个体，数出来就是 m", "#8a94a2", "start", 9.5, 400);
    for (var i = 0; i < 100; i++) {
      var rr = Math.floor(i / 10), cc = i % 10, on = ((i * 37) % 100) < A;
      el("circle", {
        cx: g.gx + cc * g.cell + g.cell / 2, cy: g.gy + rr * g.cell + g.cell / 2,
        r: on ? g.r : g.r - 1.5, fill: on ? "#c0392b" : "#cfe0ee"
      }, gA);
    }
    var off = L === W ? 28 : 22;
    tx(gA, L.left.x + 20, g.gy + 10 * g.cell + off, "m = " + A + " 只带标记，占重捕总数的 " + A + "%", "#3a3a35", "start", 10, 700);
    tx(gA, L.left.x + 20, g.gy + 10 * g.cell + off + 20, "这个比例 ≈ M ÷ N，所以 N ≈ M ÷ 比例", "#8a94a2", "start", 9.5, 400);

    /* 右：估算值条 vs 真实值 500 */
    var ry = L.right.y, col, bg, st, sn;
    if (A >= 10) { st = "估算稳定"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "m 够大，商稳，接近真值"; }
    else if (A >= 5) { st = "误差偏大"; col = "#b8791f"; bg = "#fdf3e0"; sn = "分母偏小，开始往上飘"; }
    else { st = "严重偏大"; col = "#b8402f"; bg = "#fbeae7"; sn = "m 太小，分母一小商就炸"; }

    el("rect", { x: L.right.x, y: ry, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, ry + 30, "估算值 N 与真实值 500 只", "#5a6472", "start", 10.5, 700);
    tx(gB, L.right.x + 20, ry + 56, "N = 50 × 100 ÷ " + A + " = " + Math.round(s.N) + " 只", "#151a21", "start", 10.5, 700);

    el("rect", { x: g.bx, y: g.by, width: g.bw, height: g.bh, rx: 6, fill: "#eef2f6" }, gB);
    el("rect", { x: g.bx, y: g.by, width: Math.max(4, Math.min(s.N, g.maxN) / g.maxN * g.bw), height: g.bh, rx: 6, fill: col }, gB);
    var txl = g.bx + REAL / g.maxN * g.bw;
    el("line", { x1: txl, y1: g.by - 12, x2: txl, y2: g.by + g.bh + 10, stroke: "#2f8a5b", "stroke-width": 1.4, "stroke-dasharray": "5 4" }, gB);
    tx(gB, txl, g.by + g.bh + 26, "真实值 500", "#2f8a5b", "middle", 9.5, 700);
    tx(gB, g.bx + g.bw, g.by - 10, Math.round(s.N) + " 只", col, "end", 10, 700);
    tx(gB, g.bx, g.by + g.bh + 26, "0", "#8a94a2", "start", 9, 400);
    tx(gB, g.bx, g.by + g.bh + 44, "相对误差 " + (s.err > 0 ? "+" : "") + s.err.toFixed(1) + "%", col, "start", 10, 700);
    tx(gB, g.bx, g.by + g.bh + 64, "分母越小，条越长：m 掉一半，条长一倍", "#8a94a2", "start", 9.5, 400);

    var byy = ry + (L === W ? 292 : 246);
    el("rect", { x: L.right.x + 20, y: byy, width: L.right.w - 40, height: 64, rx: 8, fill: bg, stroke: col + "44" }, gB);
    tx(gB, L.right.x + 36, byy + 26, A >= 10 ? "④ " + st : "④ " + st, col, "start", 14, 700);
    tx(gB, L.right.x + 36, byy + 47, sn, "#6b7280", "start", 9.5, 400);
    tx(gB, L.right.x + 20, byy + 88, "m = 10 是准点：50×100÷10 正好等于 500", "#8a94a2", "start", 9.5, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    if (A >= 10) { st = "估算稳定"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "m 够大，接近真值"; }
    else if (A >= 5) { st = "误差偏大"; col = "#b8791f"; bg = "#fdf3e0"; sn = "分母偏小，开始飘"; }
    else { st = "严重偏大"; col = "#b8402f"; bg = "#fbeae7"; sn = "m 太小，商炸了"; }
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = String(Math.round(s.N));
    $("gxVc").textContent = (s.err > 0 ? "+" : "") + s.err.toFixed(1) + "%";
    $("gxVc").style.color = col;
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

  var ap = window.AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: 40 }, { t: 1.2, v: 40 }, { t: 4, v: 10 }, { t: 6.5, v: 10 }, { t: 9, v: 2 }, { t: 11, v: 25 }, { t: 13, v: 40 }],
    keys: [2, 10, 25, 40],
    value: A, min: 2, max: 40, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 5, eq: { N: 1000 } },
    { v: 10, eq: { N: 500 } },
    { v: 25, eq: { N: 200 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
