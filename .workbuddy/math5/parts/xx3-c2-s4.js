/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 10, G = null, P = 0.4;

  function geom() { G = { ready: 1 }; return G; }

  function comb(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1, i;
    for (i = 0; i < k; i++) r = r * (n - i) / (i + 1);
    return r;
  }
  function pmf(n, k) { return comb(n, k) * Math.pow(P, k) * Math.pow(1 - P, n - k); }

  /* 纯函数：试验次数 n → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var n = Math.max(5, Math.min(20, Math.round(v)));
    var e = n * P;
    var d = n * P * (1 - P);
    return { n: n, e: e, d: d, sd: Math.sqrt(d), peak: Math.round(e) };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), n = s.n, k, i;

    /* ---------- 左：二项分布直方图 ---------- */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 30, "X~B(" + n + ", 0.4) 的概率直方图", "#151a21", "start", 11, 700);
    tx(gA, L.left.x + 20, L.left.y + 49, "横轴 k＝成功次数，纵轴 P(X=k)", "#5a6472", "start", 9, 400);

    var px0 = L.left.x + 50, pw = L.left.w - 72;
    var base = L.left.y + L.left.h - 70, top = L.left.y + 64, hR = base - top;
    var maxP = 0.37, slot = pw / (n + 1), bw = Math.max(3, slot * 0.66);

    el("line", { x1: px0 - 6, y1: base, x2: px0 + pw + 8, y2: base, stroke: "#b9c6d2", "stroke-width": 1 }, gA);
    el("line", { x1: px0 - 6, y1: base, x2: px0 - 6, y2: top - 10, stroke: "#b9c6d2", "stroke-width": 1 }, gA);
    el("path", { d: "M" + (px0 - 6) + " " + (top - 12) + " L" + (px0 - 10) + " " + (top - 3) + " L" + (px0 - 2) + " " + (top - 3) + " Z", fill: "#b9c6d2" }, gA);
    tx(gA, px0 - 14, top + 2, "P", "#5a6472", "end", 9, 700);

    for (k = 0; k <= n; k++) {
      var h = pmf(n, k) / maxP * hR;
      if (h < 0.6) h = 0.6;
      var bx = px0 + slot * k + (slot - bw) / 2;
      var isPeak = (k === s.peak);
      el("rect", {
        x: bx, y: base - h, width: bw, height: h, rx: 1,
        fill: isPeak ? "#2563eb" : "#9ec5f5", stroke: isPeak ? "#1e40af" : "#9db4cc"
      }, gA);
    }
    var stp = n <= 12 ? 1 : 5;
    for (k = 0; k <= n; k += stp) {
      tx(gA, px0 + slot * k + slot / 2, base + 15, String(k), "#5a6472", "middle", 8.4, 400);
    }
    tx(gA, px0 + pw + 10, base + 15, "k", "#5a6472", "start", 9, 700);

    var xe = px0 + slot * (s.e + 0.5);
    el("line", { x1: xe, y1: top - 4, x2: xe, y2: base, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    tx(gA, xe + 4, top + 6, "np=" + s.e.toFixed(1), "#b8402f", "start", 8.6, 700);
    tx(gA, L.left.x + 20, base + 34, "峰值在 k=" + s.peak + " 附近，n 越大柱子越多、越矮、越圆", "#3a3a35", "start", 8.6, 400);

    /* ---------- 右：E、D 随 n 增长 ---------- */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 30, "E(X) 与 D(X) 随 n 同步增长", "#151a21", "start", 11, 700);
    tx(gB, L.right.x + 20, L.right.y + 49, "p=0.4：E=0.4n 是直线，D=0.24n 也是直线", "#5a6472", "start", 9, 400);

    var x0 = L.right.x + 48, xw = L.right.w - 76;
    var y0 = L.right.y + L.right.h - 64, yh = L.right.h - 124, vmax = 9;
    var fx = function (v) { return x0 + v / 20 * xw; };
    var fy = function (v) { return y0 - v / vmax * yh; };

    el("line", { x1: x0, y1: y0, x2: x0 + xw + 8, y2: y0, stroke: "#b9c6d2" }, gB);
    el("line", { x1: x0, y1: y0, x2: x0, y2: y0 - yh - 12, stroke: "#b9c6d2" }, gB);
    for (i = 0; i <= 20; i += 5) tx(gB, fx(i), y0 + 14, String(i), "#5a6472", "middle", 8.4, 400);
    for (i = 2; i <= 8; i += 2) {
      tx(gB, x0 - 6, fy(i) + 3, String(i), "#5a6472", "end", 8.4, 400);
      el("line", { x1: x0 - 3, y1: fy(i), x2: x0, y2: fy(i), stroke: "#c8d4de" }, gB);
    }
    tx(gB, x0 + xw + 10, y0 + 14, "n", "#5a6472", "start", 9, 700);

    el("line", { x1: fx(0), y1: fy(0), x2: fx(20), y2: fy(8), stroke: "#2563eb", "stroke-width": 2 }, gB);
    el("line", { x1: fx(0), y1: fy(0), x2: fx(20), y2: fy(4.8), stroke: "#b8791f", "stroke-width": 2 }, gB);
    tx(gB, fx(19.4), fy(8.3) + 2, "E=np", "#2563eb", "end", 9, 700);
    tx(gB, fx(19.4), fy(4.9) + 4, "D=np(1−p)", "#b8791f", "end", 9, 700);

    el("line", { x1: fx(s.n), y1: y0, x2: fx(s.n), y2: fy(s.e), stroke: "#b8402f", "stroke-dasharray": "3 3" }, gB);
    el("circle", { cx: fx(s.n), cy: fy(s.e), r: 4.2, fill: "#2563eb", stroke: "#ffffff", "stroke-width": 1.5 }, gB);
    el("circle", { cx: fx(s.n), cy: fy(s.d), r: 4.2, fill: "#b8791f", stroke: "#ffffff", "stroke-width": 1.5 }, gB);
    tx(gB, L.right.x + 20, y0 + 36, "σ=√D=" + s.sd.toFixed(2) + "　D 始终在 E 下方", "#3a3a35", "start", 8.6, 400);
    tx(gB, L.right.x + 20, y0 + 52, "p 固定 0.4，n 从 5 到 20：E、D 都按比例变", "#5a6472", "start", 8.4, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = s.e.toFixed(2);
    $("gxVc").textContent = s.d.toFixed(2);
    if (s.n <= 9) { st = "右偏"; col = "#b8791f"; bg = "#fdf3e0"; sn = "峰在左，右边拖尾"; }
    else if (s.n <= 14) { st = "接近钟形"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "本页停留帧 n=10"; }
    else { st = "钟形·柱更矮"; col = "#2563eb"; bg = "#e8f0fe"; sn = "轮廓最圆但峰值摊薄"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = G || geom();
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
    loop: [{ t: 0, v: 5 }, { t: 1.2, v: 5 }, { t: 4, v: 10 }, { t: 6.5, v: 10 }, { t: 9, v: 20 }, { t: 11.5, v: 15 }, { t: 13.5, v: 5 }],
    keys: [5, 10, 15, 20],
    value: A, min: 5, max: 20, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 5, eq: { e: 2, d: 1.2 } },
    { v: 10, eq: { e: 4, d: 2.4 } },
    { v: 20, eq: { e: 8, d: 4.8 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
