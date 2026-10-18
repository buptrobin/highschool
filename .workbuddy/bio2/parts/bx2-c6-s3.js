/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = null, G = null, A = 0.5;

  function geom() {
    return stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
  }

  /* 纯函数：p → 三个基因型频率。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var p = Math.max(0, Math.min(1, Number(v) || 0));
    var q = 1 - p;
    return { p: p, q: q, AA: p * p, Aa: 2 * p * q, aa: q * q };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), l = L.left, r = L.right, wide = l.h > 350;

    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 18, l.y + 26, "种群与基因库（球色 = 等位基因）", "#5a6472", "start", 10.5, 700);

    /* 一群个体 */
    var n = 5, ir = wide ? 24 : 15;
    var gap = (l.w - 36 - ir * 2) / (n - 1);
    var cy = l.y + (wide ? 92 : 58);
    for (var i = 0; i < n; i++) {
      var cx = l.x + 18 + ir + i * gap;
      el("circle", { cx: cx, cy: cy, r: ir, fill: "#ffffff", stroke: "#c9d4de", "stroke-width": 1.2 }, gA);
      var c1 = ((i * 37) % 100) / 100 < s.p ? "#c0392b" : "#2f6fb3";
      var c2 = ((i * 61 + 17) % 100) / 100 < s.p ? "#c0392b" : "#2f6fb3";
      var dr = wide ? 6 : 4;
      el("circle", { cx: cx - dr, cy: cy, r: dr, fill: c1 }, gA);
      el("circle", { cx: cx + dr, cy: cy, r: dr, fill: c2 }, gA);
    }
    tx(gA, l.x + 18, cy + ir + 14, "5 个个体，每个个体 2 个等位基因", "#7b8794", "start", 9, 400);

    /* 基因库：一堆小球 */
    var cols = 5, rows = 4, cnt = cols * rows;
    var cell = wide ? 44 : 30, br = wide ? 11 : 7.5;
    var top = cy + ir + (wide ? 40 : 34);
    var sx = l.x + (l.w - (cols - 1) * cell) / 2;
    tx(gA, l.x + 18, top - 10, "基因库：全部等位基因", "#5a6472", "start", 9.5, 700);
    var redN = Math.round(s.p * cnt);
    for (var k = 0; k < cnt; k++) {
      var cc = k % cols, rr = Math.floor(k / cols);
      var isRed = ((k * 7) % cnt) < redN;
      el("circle", { cx: sx + cc * cell, cy: top + rr * cell, r: br, fill: isRed ? "#c0392b" : "#2f6fb3" }, gA);
    }

    var ny = l.y + l.h - (wide ? 88 : 56);
    tx(gA, l.x + 18, ny, "红球 = A，蓝球 = a；红球占比就是 p。", "#5a6472", "start", 9, 400);
    tx(gA, l.x + 18, ny + 22, "当前 p = " + s.p.toFixed(2) + "（红球 " + Math.round(s.p * 100) + "%）", "#5a6472", "start", 9, 400);

    /* 右：三个基因型频率 */
    var base = r.y + r.h - (wide ? 122 : 102), maxH = wide ? 200 : 160;
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 18, r.y + 26, "基因型频率（哈代-温伯格平衡）", "#5a6472", "start", 10.5, 700);
    el("rect", { x: r.x + 36, y: base, width: r.w - 62, height: 1.2, fill: "#c9d4de" }, gB);

    var bw = wide ? 54 : 46;
    var bars = [
      { c: r.x + (wide ? 90 : 84), f: s.AA, col: "#c0392b", k: "AA = p²" },
      { c: r.x + (wide ? 204 : 172), f: s.Aa, col: "#b8791f", k: "Aa = 2pq" },
      { c: r.x + (wide ? 318 : 260), f: s.aa, col: "#2f6fb3", k: "aa = q²" }
    ];
    for (var j = 0; j < bars.length; j++) {
      var b = bars[j], h = Math.max(2, b.f * maxH);
      el("rect", { x: b.c - bw / 2, y: base - h, width: bw, height: h, rx: 4, fill: b.col }, gB);
      tx(gB, b.c, base - h - 9, Math.round(b.f * 100) + "%", b.col, "middle", 10, 700);
      tx(gB, b.c, base + 20, b.k, "#5a6472", "middle", wide ? 9.5 : 8.6, 400);
    }

    tx(gB, r.x + r.w / 2, r.y + r.h - 58, "p² + 2pq + q² = 1", "#5a6472", "middle", 11.5, 700);
    tx(gB, r.x + r.w / 2, r.y + r.h - 32, "当前 p = " + s.p.toFixed(2) + "，q = " + s.q.toFixed(2), "#7b8794", "middle", 9.2, 400);
  }

  function render() {
    if (!G) { L = geom(); G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = s.p.toFixed(2);
    $("gxVb").textContent = Math.round(s.Aa * 100) + "%";
    $("gxVc").textContent = Math.round(s.AA * 100) + "% / " + Math.round(s.aa * 100) + "%";
    if (s.p < 0.001 || s.p > 0.999) { st = "多样性为 0"; col = "#b8402f"; bg = "#fbeae7"; sn = "只剩一个等位基因"; }
    else if (Math.abs(s.p - 0.5) < 0.001) { st = "杂合子最多"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "p = 0.5，Aa = 50%"; }
    else { st = "偏离 0.5"; col = "#b8791f"; bg = "#fdf3e0"; sn = "Aa = " + Math.round(s.Aa * 100) + "%，低于 50%"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = geom(); G = L;
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
    loop: [{ t: 0, v: 0 }, { t: 1, v: 0 }, { t: 4.8, v: 0.5 }, { t: 7, v: 0.5 }, { t: 9.4, v: 1 }, { t: 11.4, v: 0.8 }, { t: 13, v: 0 }],
    keys: [0, 0.25, 0.5, 0.75, 1],
    value: A, min: 0, max: 1, step: 0.05,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0.2, eq: { AA: 0.04, Aa: 0.32 } },
    { v: 0.5, eq: { AA: 0.25, Aa: 0.5 } },
    { v: 0.8, eq: { AA: 0.64, Aa: 0.32 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
