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

  /* 纯函数：指数 k → 真数与三个对数。render() 和 __model.cases 都用它 */
  function calc(v) {
    var k = Math.max(0, Math.min(10, Math.round(v)));
    var n = Math.pow(2, k);
    return { k: k, n: n, lg: k, lg2n: k + 1, lg2sq: 2 * k };
  }

  /* 几何：按当前 L 算一次，缓存在 G 里 */
  function geom() {
    var wide = L.left.h >= 400;
    return {
      baseY: L.left.y + L.left.h - 40,
      topY: L.left.y + 70,
      bx: L.left.x + Math.round(L.left.w * 0.07),
      bw: Math.round(L.left.w * 0.38),
      rx: L.right.x + 20,
      rw: L.right.w - 40,
      r0: L.right.y + 60,
      rh: wide ? 56 : 46,
      rg: wide ? 14 : 10,
      rf: wide ? 14 : 13
    };
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), i, j, y;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 18, L.left.y + 28, "指数式 2^k = N：翻 k 次倍", "#5a6472", "start", 10.5, 700);
    tx(gA, L.left.x + 18, L.left.y + 46, "一块 = 乘一次 2；块数就是对数", "#8a94a2", "start", 8.6, 400);

    var hb = s.k > 0 ? Math.min(30, (G.baseY - G.topY) / s.k) : 0;
    el("line", { x1: G.bx - 8, y1: G.baseY, x2: G.bx + G.bw + 118, y2: G.baseY, stroke: "#9aa7b4", "stroke-width": 1 }, gA);
    for (j = 1; j <= s.k; j++) {
      y = G.baseY - j * hb;
      el("rect", { x: G.bx, y: y, width: G.bw, height: hb - 1, rx: 3, fill: j === s.k ? "#eef6ff" : "#ffffff", stroke: j === s.k ? "#2563eb" : "#cfe0f6" }, gA);
      tx(gA, G.bx + 7, y + hb / 2 + 2.8, "×2", "#2563eb", "start", 7.6, 700);
      tx(gA, G.bx + G.bw + 8, y + hb / 2 + 2.8, "2^" + j + " = " + Math.pow(2, j), "#3a3a35", "start", 8, 400);
    }
    if (s.k === 0) tx(gA, G.bx, G.baseY - 14, "k=0：还没开始翻倍，N=1", "#b8791f", "start", 8.6, 700);
    tx(gA, G.bx, G.baseY + 22, "真数 N = 2^" + s.k + " = " + s.n, "#151a21", "start", 10.4, 700);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, G.rx, L.right.y + 28, "四个对数一起看：乘变加、乘方变倍", "#5a6472", "start", 10.5, 700);
    var rows = [
      ["真数 N = 2^k（恒为正）", "N = " + s.n, "#2563eb", "#eef6ff"],
      ["log₂N = k：翻几次倍", "log₂" + s.n + " = " + s.lg, "#2f8a5b", "#e6f6ee"],
      ["log₂(2N) = k+1：再翻一倍", "log₂" + (2 * s.n) + " = " + s.lg2n, "#b8791f", "#fdf3e0"],
      ["log₂(N²) = 2k：平方即乘方", "log₂" + (s.n * s.n) + " = " + s.lg2sq, "#3f6fa8", "#eef3f9"]
    ];
    for (i = 0; i < 4; i++) {
      y = G.r0 + i * (G.rh + G.rg);
      el("rect", { x: G.rx, y: y, width: G.rw, height: G.rh, rx: 8, fill: rows[i][3], stroke: rows[i][2] + "44" }, gB);
      tx(gB, G.rx + 12, y + (G.rh >= 50 ? 18 : 16), rows[i][0], "#5a6472", "start", 8.6, 700);
      tx(gB, G.rx + 12, y + G.rh - (G.rh >= 50 ? 12 : 10), rows[i][1], rows[i][2], "start", G.rf, 700);
    }
    y = G.r0 + 4 * (G.rh + G.rg) - G.rg + 22;
    tx(gB, G.rx, y, "2^k 恒大于 0 ⇒ 真数 N 一定大于 0", "#b8402f", "start", 8.8, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.k);
    $("gxVb").textContent = String(s.n);
    $("gxVc").textContent = String(s.lg);
    if (s.k === 0) { st = "对数为 0"; col = "#b8791f"; bg = "#fdf3e0"; sn = "N=1，一次都没翻"; }
    else { st = "翻倍 " + s.k + " 次"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "每翻一倍，对数加 1"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 6 }, { t: 11.5, v: 10 }, { t: 13.5, v: 0 }],
    keys: [0, 3, 6, 10],
    value: A, min: 0, max: 10, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { n: 1, lg: 0 } },
    { v: 3, eq: { n: 8, lg: 3 } },
    { v: 10, eq: { n: 1024, lg: 10 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
