/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 10, G = null;

  /* 纯函数：致病基因频率 q → 患病率 / 携带者比例 / 二者比值。render() 和 __bio.cases 都用它。
     滑块一格 = 0.01，A 是格数，q = A / 100 */
  function calc(q) {
    var disease = q * q;
    var carrier = 2 * q * (1 - q);
    return { q: q, disease: disease, carrier: carrier, normal: (1 - q) * (1 - q), ratio: disease > 0 ? carrier / disease : 0 };
  }

  /* 所有版式坐标一次算清，窄屏宽屏共用同一套绘制代码 */
  function geom() {
    var l = L.left, r = L.right;
    return {
      base: l.y + l.h - 46,
      maxH: l.h - 130,
      bw: Math.min(84, l.w * 0.17),
      x1: l.x + l.w * 0.30,
      x2: l.x + l.w * 0.66,
      ax: r.x + 46, ay: r.y + 58,
      aw: r.w - 74, ah: r.h - 120
    };
  }

  function draw() {
    var s = calc(A / 100), gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var b = G;

    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 28, "群体构成（按 100% 示意，柱高按 0.35 封顶）", "#5a6472", "start", 10.5, 700);

    var h1 = Math.max(1.5, s.disease / 0.35 * b.maxH);
    var h2 = Math.max(1.5, s.carrier / 0.35 * b.maxH);
    el("line", { x1: L.left.x + 24, y1: b.base, x2: L.left.x + L.left.w - 24, y2: b.base, stroke: "#cfd8e0" }, gA);
    el("rect", { x: b.x1 - b.bw / 2, y: b.base - h1, width: b.bw, height: h1, rx: 4, fill: "#f0b6ab", stroke: "#c0715f" }, gA);
    el("rect", { x: b.x2 - b.bw / 2, y: b.base - h2, width: b.bw, height: h2, rx: 4, fill: "#9ec9e8", stroke: "#5f93bd" }, gA);
    tx(gA, b.x1, b.base - h1 - 8, (s.disease * 100).toFixed(2) + "%", "#b8402f", "middle", 10.5, 700);
    tx(gA, b.x2, b.base - h2 - 8, (s.carrier * 100).toFixed(1) + "%", "#2c6c9a", "middle", 10.5, 700);
    tx(gA, b.x1, b.base + 20, "患病 aa", "#3a3a35", "middle", 10);
    tx(gA, b.x2, b.base + 20, "携带者 Aa", "#3a3a35", "middle", 10);
    tx(gA, b.x1, b.base + 36, "q²", "#8a949e", "middle", 9.4);
    tx(gA, b.x2, b.base + 36, "2q(1−q)", "#8a949e", "middle", 9.4);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 28, "携带者 ÷ 患者（倍）随 q 的变化", "#5a6472", "start", 10.5, 700);
    el("line", { x1: b.ax, y1: b.ay, x2: b.ax, y2: b.ay + b.ah, stroke: "#cfd8e0" }, gB);
    el("line", { x1: b.ax, y1: b.ay + b.ah, x2: b.ax + b.aw, y2: b.ay + b.ah, stroke: "#cfd8e0" }, gB);
    tx(gB, b.ax - 6, b.ay + 4, "198", "#8a949e", "end", 9);
    tx(gB, b.ax - 6, b.ay + b.ah + 4, "0", "#8a949e", "end", 9);
    tx(gB, b.ax, b.ay + b.ah + 18, "q=0.01", "#8a949e", "start", 9);
    tx(gB, b.ax + b.aw, b.ay + b.ah + 18, "q=0.2", "#8a949e", "end", 9);

    var pts = [], i, q, rt, X, Y;
    for (i = 0; i <= 40; i++) {
      q = 0.01 + i * 0.19 / 40;
      rt = 2 * (1 - q) / q;
      X = b.ax + b.aw * i / 40;
      Y = b.ay + b.ah - Math.min(rt, 198) / 198 * b.ah;
      pts.push(X.toFixed(1) + "," + Y.toFixed(1));
    }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#5f93bd", "stroke-width": 2 }, gB);

    var px = b.ax + (A - 1) / 19 * b.aw;
    var py = b.ay + b.ah - Math.min(s.ratio, 198) / 198 * b.ah;
    el("line", { x1: px, y1: py, x2: px, y2: b.ay + b.ah, stroke: "#b8791f", "stroke-dasharray": "3 3" }, gB);
    el("circle", { cx: px, cy: py, r: 5, fill: "#b8791f", stroke: "#ffffff", "stroke-width": 2 }, gB);
    tx(gB, Math.min(px + 10, b.ax + b.aw - 4), Math.max(py - 8, b.ay + 12), Math.round(s.ratio) + " 倍", "#b8791f", "start", 10.5, 700);
    tx(gB, b.ax, b.ay + b.ah + 34, "q 越小，携带者相对越多，越难发现", "#8a949e", "start", 9);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A / 100), st, col, bg, sn;
    $("gxVa").textContent = (A / 100).toFixed(2);
    $("gxVb").textContent = (s.disease * 100).toFixed(2) + "%";
    $("gxVc").textContent = (s.carrier * 100).toFixed(1) + "%";
    if (A <= 3) { st = Math.round(s.ratio) + " 倍"; col = "#b8402f"; bg = "#fbeae7"; sn = "携带者极多，患者极少，难发现"; }
    else if (A <= 12) { st = Math.round(s.ratio) + " 倍"; col = "#b8791f"; bg = "#fdf3e0"; sn = "q=0.1 时携带者是患者 18 倍"; }
    else { st = Math.round(s.ratio) + " 倍"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "q 变大，比值缩小，相对易发现"; }
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
    loop: [{ t: 0, v: 1 }, { t: 2.2, v: 1 }, { t: 4.8, v: 20 }, { t: 7, v: 20 }, { t: 8.6, v: 10 }, { t: 11, v: 10 }, { t: 13, v: 1 }],
    keys: [1, 20, 10],
    value: A, min: 1, max: 20, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0.01, eq: { disease: 0.0001, carrier: 0.0198 } },
    { v: 0.1, eq: { disease: 0.01, carrier: 0.18 } },
    { v: 0.2, eq: { disease: 0.04, carrier: 0.32 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
