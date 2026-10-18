/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1, G = null;

  var SQ2PI = Math.sqrt(2 * Math.PI);
  function pdf(x, s) { return Math.exp(-(x * x) / (2 * s * s)) / (s * SQ2PI); }

  /* 纯函数：σ → 数值。render() 与 __model.cases 共用 */
  function calc(v) {
    var s = Math.max(0.25, Number(v) || 1);
    return {
      peak: 1 / (SQ2PI * s),   // 峰值高度
      p1: 0.6827,              // P(|X|<σ)，恒定
      p2: 0.9545,              // P(|X|<2σ)，恒定
      p3: 0.9973               // P(|X|<3σ)，恒定
    };
  }

  function geom() {
    var wide = (L === W), p = L.left, q = L.right;
    var pad = wide ? 30 : 20;
    return {
      wide: wide,
      base: p.y + p.h - (wide ? 62 : 54),
      x0: p.x + p.w / 2,
      sc: (p.w - 2 * pad) / 9,
      k: wide ? 330 : 205
    };
  }

  function bellPoint(x, s) { return G.x0 + x * G.sc; }
  function bellY(x, s) { return G.base - pdf(x, s) * G.k; }

  function curvePath(s) {
    var d = [], i, x, n = 150;
    for (i = 0; i <= n; i++) {
      x = -4.5 + (9 * i) / n;
      d.push((i ? "L" : "M") + bellPoint(x).toFixed(1) + "," + bellY(x, s).toFixed(1));
    }
    return d.join(" ");
  }

  function bandPath(s, a) {
    var d = [], i, x, n = 48;
    for (i = 0; i <= n; i++) {
      x = -a + (2 * a * i) / n;
      d.push((i ? "L" : "M") + bellPoint(x).toFixed(1) + "," + bellY(x, s).toFixed(1));
    }
    d.push("L" + bellPoint(a).toFixed(1) + "," + G.base);
    d.push("L" + bellPoint(-a).toFixed(1) + "," + G.base + " Z");
    return d.join(" ");
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB"), p = L.left, q = L.right;
    var col = s < 0.95 ? "#2563eb" : (s > 1.05 ? "#2f8a5b" : "#1d4ed8");
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, p.x + 18, p.y + 28, "N(0, σ²) 的曲线与 μ±σ 段", "#5a6472", "start", 10.2, 700);

    /* 坐标轴 */
    el("line", { x1: G.x0, y1: G.base, x2: G.x0, y2: G.base - 300, stroke: "#9aa4b0" }, gA);
    el("polygon", { points: (G.x0) + "," + (G.base - 306) + " " + (G.x0 - 4) + "," + (G.base - 296) + " " + (G.x0 + 4) + "," + (G.base - 296), fill: "#9aa4b0" }, gA);
    var xl = G.x0 + 4.5 * G.sc;
    el("line", { x1: G.x0 - 4.5 * G.sc, y1: G.base, x2: xl - 6, y2: G.base, stroke: "#9aa4b0" }, gA);
    el("polygon", { points: (xl) + "," + G.base + " " + (xl - 9) + "," + (G.base - 3.5) + " " + (xl - 9) + "," + (G.base + 3.5), fill: "#9aa4b0" }, gA);
    tx(gA, xl - 2, G.base - 8, "x", "#5a6472", "end", 9, 400);

    var i, x;
    for (i = -3; i <= 3; i++) {
      if (i === 0) continue;
      x = bellPoint(i);
      el("line", { x1: x, y1: G.base, x2: x, y2: G.base + 5, stroke: "#9aa4b0" }, gA);
      tx(gA, x, G.base + 17, String(i), "#5a6472", "middle", 8.8, 400);
    }
    tx(gA, G.x0, G.base + 17, "μ=0", "#151a21", "middle", 8.8, 700);

    /* 阴影：μ±σ 段 */
    el("path", { d: bandPath(s, s), fill: "#cfe4fb", stroke: "none" }, gA);
    /* 2σ 虚线 */
    [-2, 2].forEach(function (t) {
      var xx = bellPoint(t * s);
      if (xx > G.x0 - 4.4 * G.sc && xx < xl) {
        el("line", { x1: xx, y1: G.base, x2: xx, y2: bellY(t * s, s), stroke: "#94a3b8", "stroke-dasharray": "3 3" }, gA);
      }
    });
    el("path", { d: curvePath(s), fill: "none", stroke: col, "stroke-width": 2.1 }, gA);

    var py = bellY(0, s), pk = 1 / (SQ2PI * s);
    el("circle", { cx: G.x0, cy: py, r: 2.6, fill: col }, gA);
    tx(gA, Math.min(G.x0 + 12, xl - 96), py - 7, "峰值 " + pk.toFixed(4), "#3a3a35", "start", 8.8, 700);
    tx(gA, p.x + 18, p.y + p.h - 10, "阴影 = μ±σ 段，面积恒为 0.6827（与 σ 无关）", "#5a6472", "start", 8.6, 400);

    /* 右面板：峰值柱 + 固定面积条 */
    el("rect", { x: q.x, y: q.y, width: q.w, height: q.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, q.x + 18, q.y + 28, "峰值随 σ 变，面积不变", "#5a6472", "start", 10.2, 700);
    var cands = [0.5, 1, 2, 3], maxP = 1 / (SQ2PI * 0.5);
    var bw = q.w * 0.66, bx = q.x + q.w * 0.17, gap = bw / 4;
    var baseY = q.y + q.h - (G.wide ? 168 : 148);
    var maxH = G.wide ? 190 : 150;
    tx(gB, q.x + 18, q.y + 48, "σ 取 0.5 / 1 / 2 / 3 时的峰值", "#8a929c", "start", 8.4, 400);
    cands.forEach(function (c, idx) {
      var hh = (1 / (SQ2PI * c)) / maxP * maxH;
      var cur = Math.abs(c - s) < 0.13;
      var cx = bx + idx * gap + gap * 0.24;
      el("rect", { x: cx, y: baseY - hh, width: gap * 0.52, height: hh, rx: 3, fill: cur ? "#2563eb" : "#dbe7ef" }, gB);
      tx(gB, cx + gap * 0.26, baseY + 13, "σ=", "#8a929c", "middle", 8, 400);
      tx(gB, cx + gap * 0.26, baseY + 25, String(c), "#5a6472", "middle", 8.4, 700);
      tx(gB, cx + gap * 0.26, baseY - hh - 4, (1 / (SQ2PI * c)).toFixed(3), "#3a3a35", "middle", 7.8, 400);
    });

    var areaY = baseY + (G.wide ? 58 : 52);
    tx(gB, bx, areaY - 6, "曲线下总面积（≡ 概率总量）", "#8a929c", "start", 8.4, 400);
    el("rect", { x: bx, y: areaY, width: bw, height: 15, rx: 4, fill: "#e8f1fd", stroke: "#9ec8f5" }, gB);
    tx(gB, bx + bw / 2, areaY + 11, "面积 = 1，σ 怎么变都是 1", "#1d4ed8", "middle", 8.6, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = Number(A).toFixed(2);
    $("gxVb").textContent = s.peak.toFixed(4);
    $("gxVc").textContent = s.p1.toFixed(4);
    if (A < 0.95) { st = "越高越瘦"; col = "#b8402f"; bg = "#fbeae7"; sn = "分布集中，面积仍是 1"; }
    else if (A <= 1.05) { st = "标准正态"; col = "#2563eb"; bg = "#e8f1fd"; sn = "峰值 0.3989，最好记的一格"; }
    else { st = "越矮越胖"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "分布分散，面积仍是 1"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw(A);
  }

  function layout() { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); render(); }

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
    loop: [{ t: 0, v: 0.5 }, { t: 1.2, v: 0.5 }, { t: 4, v: 1 }, { t: 6.5, v: 1 }, { t: 9, v: 3 }, { t: 11.5, v: 2 }, { t: 13.5, v: 0.5 }],
    keys: [0.5, 1, 2, 3],
    value: A, min: 0.5, max: 3, step: 0.25,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { peak: 0.3989, p1: 0.6827, p2: 0.9545 } },
    { v: 2, eq: { peak: 0.1995, p1: 0.6827, p3: 0.9973 } },
    { v: 0.5, eq: { peak: 0.7979, p1: 0.6827 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
