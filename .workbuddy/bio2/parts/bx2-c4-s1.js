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

  /* 纯函数：肽链氨基酸数 → 三个量。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var aa = Math.max(1, Math.round(v));
    return { mrna: aa * 3, trna: aa, water: aa - 1 };
  }

  function geom() {
    L = (stage.parentElement && stage.parentElement.getBoundingClientRect().width >= 640) ? W : N;
    stage.setAttribute("viewBox", L.vb);
    return { left: L.left };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), lb = L.left, rb = L.right, i, k;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: lb.x, y: lb.y, width: lb.w, height: lb.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lb.x + 18, lb.y + 26, "核糖体 · mRNA 带子 · 肽链", "#5a6472", "start", 10.5, 700);

    var bx = lb.x + 16, bw = lb.w - 32, bh = Math.round(lb.h * 0.14), by = lb.y + Math.round(lb.h * 0.6);
    var nS = A <= 10 ? A : 9, slots = nS + (A > 10 ? 1 : 0), cw = bw / slots;
    var cx = bx + bw / 2, rx = Math.min(cw * 1.1, 58), ry = Math.round(bh * 0.62);

    /* mRNA 带子：3 个碱基一格 */
    el("rect", { x: bx, y: by, width: bw, height: bh, rx: 8, fill: "#eaf6ff", stroke: "#a9cfe8" }, gA);
    for (i = 0; i < nS; i++) {
      var x0 = bx + i * cw;
      for (k = 1; k < 3; k++) el("line", { x1: x0 + cw * k / 3, y1: by + 3, x2: x0 + cw * k / 3, y2: by + bh - 3, stroke: "#cfe7f6", "stroke-width": 1 }, gA);
      el("rect", { x: x0, y: by, width: cw, height: bh, fill: "none", stroke: "#7fb3d5", "stroke-width": 1.2 }, gA);
    }
    if (A > 10) tx(gA, bx + nS * cw + cw / 2, by + bh * 0.7, "…", "#7fb3d5", "middle", 12, 700);

    /* 核糖体：跨过带子的两个半圆 */
    el("path", { d: "M " + (cx - rx) + " " + by + " A " + rx + " " + ry + " 0 0 1 " + (cx + rx) + " " + by, fill: "#fdf3e0", stroke: "#c98a3c", "stroke-width": 1.4 }, gA);
    el("path", { d: "M " + (cx - rx) + " " + (by + bh) + " A " + rx + " " + ry + " 0 0 0 " + (cx + rx) + " " + (by + bh), fill: "#fdf3e0", stroke: "#c98a3c", "stroke-width": 1.4 }, gA);

    /* tRNA 三叶草 + 反密码子格 */
    el("rect", { x: cx - 13, y: by + 5, width: 26, height: 10, rx: 3, fill: "#ffffff", stroke: "#7a5aa8", "stroke-width": 1.2 }, gA);
    el("line", { x1: cx, y1: by + 5, x2: cx, y2: by - 12, stroke: "#7a5aa8", "stroke-width": 1.2 }, gA);
    el("circle", { cx: cx - 7, cy: by - 18, r: 6, fill: "#efe8fa", stroke: "#7a5aa8", "stroke-width": 1.1 }, gA);
    el("circle", { cx: cx, cy: by - 22, r: 6, fill: "#efe8fa", stroke: "#7a5aa8", "stroke-width": 1.1 }, gA);
    el("circle", { cx: cx + 7, cy: by - 18, r: 6, fill: "#efe8fa", stroke: "#7a5aa8", "stroke-width": 1.1 }, gA);

    /* 肽链：圆圈个数 = 氨基酸个数（超过 8 个只画 8 个示意） */
    var nP = A <= 8 ? A : 8, gap = Math.min(24, (bw - 40) / Math.max(1, nP)), py = by - ry - Math.round(bh * 0.55);
    for (i = 0; i < nP; i++) {
      el("circle", { cx: cx + (i - (nP - 1) / 2) * gap, cy: py, r: 8, fill: "#e6f6ee", stroke: "#2f8a5b", "stroke-width": 1.2 }, gA);
    }
    el("line", { x1: cx, y1: py + 8, x2: cx, y2: by - ry, stroke: "#2f8a5b", "stroke-width": 1.2 }, gA);

    tx(gA, bx, by + bh + 20, "mRNA 带子", "#2f6fb8", "start", 9.4, 700);
    tx(gA, lb.x + 18, lb.y + lb.h - 14, "脱去 " + s.water + " 分子水（1 条肽链）", "#b8791f", "start", 9.6, 700);

    /* 右栏：三条按比例伸缩的柱子 */
    el("rect", { x: rb.x, y: rb.y, width: rb.w, height: rb.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rb.x + 20, rb.y + 26, "三个量都由 aa 决定", "#5a6472", "start", 10.5, 700);
    var rows = [
      { k: "mRNA 碱基数 = 3 × aa", v: s.mrna, m: 300, u: "个碱基", c: "#2f6fb8" },
      { k: "tRNA 搬运次数 = aa", v: s.trna, m: 100, u: "次", c: "#2f8a5b" },
      { k: "脱去水分子数 = aa − 1", v: s.water, m: 99, u: "分子", c: "#b8791f" }
    ];
    var bw2 = rb.w - 40, y0 = rb.y + 66, gp = (rb.h - 116) / 3;
    for (i = 0; i < rows.length; i++) {
      var r = rows[i], yy = y0 + i * gp, fw = Math.max(4, bw2 * Math.min(1, r.v / r.m)), vs = String(r.v);
      tx(gB, rb.x + 20, yy, r.k, "#5a6472", "start", 9.6, 400);
      el("rect", { x: rb.x + 20, y: yy + 10, width: bw2, height: 12, rx: 6, fill: "#eef2f6" }, gB);
      el("rect", { x: rb.x + 20, y: yy + 10, width: fw, height: 12, rx: 6, fill: r.c }, gB);
      tx(gB, rb.x + 20, yy + 44, vs, r.c, "start", 15, 700);
      tx(gB, rb.x + 26 + vs.length * 9, yy + 44, r.u, "#7a8593", "start", 9.6, 400);
    }
    tx(gB, rb.x + 20, rb.y + rb.h - 16, "1 条肽链 · 不含终止密码子", "#8a97a4", "start", 9.2, 400);
  }

  function render() {
    if (!G) { L = (stage.parentElement && stage.parentElement.getBoundingClientRect().width >= 640) ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = String(s.mrna);
    $("gxVc").textContent = String(s.trna);
    if (A < 20) { st = "短肽"; col = "#b8791f"; bg = "#fdf3e0"; }
    else if (A <= 60) { st = "中等肽"; col = "#2f8a5b"; bg = "#e6f6ee"; }
    else { st = "长肽"; col = "#2f8a5b"; bg = "#e6f6ee"; }
    sn = "脱水 " + s.water + " 分子";
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = (stage.parentElement && stage.parentElement.getBoundingClientRect().width >= 640) ? W : N;
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
    loop: [{ t: 0, v: 5 }, { t: 1.2, v: 5 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 100 }, { t: 11, v: 70 }, { t: 13, v: 5 }],
    keys: [5, 50, 70, 100],
    value: A, min: 5, max: 100, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 20, eq: { mrna: 60, trna: 20 } },
    { v: 50, eq: { mrna: 150, trna: 50 } },
    { v: 100, eq: { mrna: 300, water: 99 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
