/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null;

  var N0 = 10, LAM = 1.5, K = 1000, R = 0.5, TMAX = 15, YMAX = 4600;

  function J(t) { return N0 * Math.pow(LAM, t); }
  function S(t) { return K / (1 + (K - N0) / N0 * Math.exp(-R * t)); }

  /* 纯函数：时间 t → 两个模型的数量。render() 和 __bio.cases 都用它 */
  function calc(v) {
    return { t: v, J: J(v), S: S(v) };
  }

  function geom() {
    var a = L.left, b = L.right;
    var px = a.x + 46, py = a.y + 48, pw = a.w - 62, ph = a.h - 92;
    var rb = { x: b.x + 16, y: b.y + 46, w: b.w - 32, h: b.h - 70 };
    var lab = b.w >= 380 ? 46 : 34;
    return {
      px: px, py: py, pw: pw, ph: ph,
      bt: py + ph,
      x: function (t) { return px + t / TMAX * pw; },
      y: function (n) { return py + ph - Math.min(n, YMAX) / YMAX * ph; },
      rb: rb,
      ax: rb.x + lab,
      len: Math.max(40, rb.w - lab - 58)
    };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function num(n) { return n >= 1000 ? String(Math.round(n)) : String(Math.round(n * 10) / 10); }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var a = L.left, b = L.right, s = calc(A), i, p, pts;

    /* ---- 左：两条曲线 ---- */
    el("rect", { x: a.x, y: a.y, width: a.w, height: a.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, a.x + 16, a.y + 26, "两种增长模型：N 随 t 变化", "#5a6472", "start", 10.5, 700);
    tx(gA, a.x + 16, a.y + 42, "N₀=10，J 形 λ=1.5，S 形 K=1000、r=0.5", "#8a939e", "start", 8.6, 400);

    el("line", { x1: G.px, y1: G.py, x2: G.px, y2: G.bt, stroke: "#b8c4cf", "stroke-width": 1.1 }, gA);
    el("line", { x1: G.px, y1: G.bt, x2: G.px + G.pw, y2: G.bt, stroke: "#b8c4cf", "stroke-width": 1.1 }, gA);
    tx(gA, G.px - 8, G.py + 4, "N", "#8a939e", "end", 8.6, 700);
    tx(gA, G.px + G.pw - 4, G.bt + 34, "t/代", "#8a939e", "end", 8.6, 400);
    for (i = 0; i <= 4; i++) {
      var nv = i * 1000, yy = G.y(nv);
      el("line", { x1: G.px, y1: yy, x2: G.px + G.pw, y2: yy, stroke: "#e6edf3", "stroke-width": 1 }, gA);
      tx(gA, G.px - 8, yy + 3, String(nv), "#8a939e", "end", 8, 400);
    }
    for (i = 0; i <= 3; i++) tx(gA, G.x(i * 5), G.bt + 16, String(i * 5), "#8a939e", "middle", 8, 400);

    /* K 与 K/2 参考线 */
    el("line", { x1: G.px, y1: G.y(K), x2: G.px + G.pw, y2: G.y(K), stroke: "#2f8a5b", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    tx(gA, G.px + G.pw, G.y(K) - 5, "K=1000", "#2f8a5b", "end", 8.4, 700);
    el("line", { x1: G.px, y1: G.y(K / 2), x2: G.px + G.pw, y2: G.y(K / 2), stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    tx(gA, G.px + G.pw, G.y(K / 2) - 5, "K/2=500", "#b8791f", "end", 8.4, 400);

    /* 曲线 */
    pts = [];
    for (i = 0; i <= 60; i++) { var t0 = i * TMAX / 60; pts.push(G.x(t0).toFixed(1) + "," + G.y(J(t0)).toFixed(1)); }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#b8402f", "stroke-width": 2.2 }, gA);
    pts = [];
    for (i = 0; i <= 60; i++) { var t1 = i * TMAX / 60; pts.push(G.x(t1).toFixed(1) + "," + G.y(S(t1)).toFixed(1)); }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2f8a5b", "stroke-width": 2.2 }, gA);

    /* 当前 t 的竖线与两点 */
    var cx = G.x(s.t), yJ = G.y(s.J), yS = G.y(s.S);
    el("line", { x1: cx, y1: G.py, x2: cx, y2: G.bt, stroke: "#c9d2db", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: cx, cy: yJ, r: 4, fill: "#b8402f" }, gA);
    el("circle", { cx: cx, cy: yS, r: 4, fill: "#2f8a5b" }, gA);
    tx(gA, cx + 9, yJ - 7, "J " + num(s.J), "#b8402f", "start", 8.8, 700);
    tx(gA, cx + 9, yS + 15, "S " + num(s.S), "#2f8a5b", "start", 8.8, 700);

    /* ---- 右：同一 t 的两个读数 ---- */
    el("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, b.x + 16, b.y + 26, "同一个 t，两个模型的差值", "#5a6472", "start", 10.5, 700);
    tx(gB, b.x + 16, b.y + 42, "条形长度按 √N 画，只为看清 0–15 代的差别", "#8a939e", "start", 8.2, 400);

    var y1 = G.rb.y + 96, y2 = y1 + 66, bh = 24;
    var lenK = Math.sqrt(K / YMAX) * G.len, lenH = Math.sqrt(K / 2 / YMAX) * G.len;
    el("line", { x1: G.ax + lenK, y1: y1 - 34, x2: G.ax + lenK, y2: y2 + 34, stroke: "#2f8a5b", "stroke-width": 1, "stroke-dasharray": "4 3" }, gB);
    tx(gB, G.ax + lenK, y1 - 40, "K", "#2f8a5b", "middle", 9, 700);
    el("line", { x1: G.ax + lenH, y1: y1 - 34, x2: G.ax + lenH, y2: y2 + 34, stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gB);
    tx(gB, G.ax + lenH, y1 - 40, "K/2", "#b8791f", "middle", 9, 400);
    el("line", { x1: G.ax, y1: y1 - 30, x2: G.ax, y2: y2 + 30, stroke: "#d5dbe2", "stroke-width": 1.2 }, gB);

    var lj = Math.sqrt(s.J / YMAX) * G.len, ls = Math.sqrt(s.S / YMAX) * G.len;
    tx(gB, G.ax - 8, y1 + 16, "J 形", "#b8402f", "end", 9.4, 700);
    el("rect", { x: G.ax, y: y1, width: lj, height: bh, rx: 4, fill: "#f6d5ce", stroke: "#b8402f", "stroke-width": 1 }, gB);
    tx(gB, G.ax + lj + 7, y1 + 16, num(s.J), "#b8402f", "start", 9, 700);
    tx(gB, G.ax - 8, y2 + 16, "S 形", "#2f8a5b", "end", 9.4, 700);
    el("rect", { x: G.ax, y: y2, width: ls, height: bh, rx: 4, fill: "#d6efe2", stroke: "#2f8a5b", "stroke-width": 1 }, gB);
    tx(gB, G.ax + ls + 7, y2 + 16, num(s.S), "#2f8a5b", "start", 9, 700);

    var ratio = s.S > 0 ? s.J / s.S : 1;
    tx(gB, b.x + 16, y2 + 70, "J ÷ S = ×" + ratio.toFixed(2) + (ratio > 1.05 ? "（J 已甩开 S）" : "（两条线还挨着）"), "#3a3a35", "start", 9.2, 700);
    tx(gB, b.x + 16, y2 + 94, "J 形是理想条件：λ 恒定，没有上限", "#b8402f", "start", 9, 400);
    tx(gB, b.x + 16, y2 + 112, "S 形在 K/2 时增长速率最大，到 K 时为 0", "#2f8a5b", "start", 9, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A * 10) / 10);
    $("gxVb").textContent = num(s.J);
    $("gxVc").textContent = num(s.S);
    if (A <= 5) { st = "两条线还挨着"; sn = "差别小于 10%"; col = "#2f8a5b"; bg = "#e6f6ee"; }
    else if (A < 8) { st = "开始分岔"; sn = "J 形开始甩开 S 形"; col = "#b8791f"; bg = "#fdf3e0"; }
    else { st = "J 形继续翻倍"; sn = "S 形趋向 K"; col = "#b8402f"; bg = "#fbeae7"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 10 }, { t: 6.5, v: 10 }, { t: 9, v: 15 }, { t: 11, v: 7 }, { t: 13, v: 0 }],
    keys: [0, 7, 10, 15],
    value: A, min: 0, max: 15, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 5, eq: { J: 75.9, S: 109.5 } },
    { v: 10, eq: { J: 576.7, S: 600 } },
    { v: 15, eq: { J: 4378.9, S: 999.9 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
