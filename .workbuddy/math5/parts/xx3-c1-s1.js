/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470" };
  var N = { vb: "0 0 360 700" };
  var L = W, G = null, A = 3;

  /* 纯函数：上衣件数 → 各量。render() 与 __model.cases 共用 */
  function calc(v) {
    var m = Math.max(1, Math.min(6, Math.round(v)));
    return { m: m, ways: m * 3, mix: m + 3, gap: m * 3 - (m + 3) };
  }

  function geom() {
    if (L === W) {
      return {
        left: { x: 16, y: 16, w: 424, h: 438 },
        right: { x: 456, y: 16, w: 408, h: 438 },
        gx: 44, gy: 92, cw: 92, ch: 46, cols: 3,
        bx: 548, bw: 96, baseline: 380, scale: 13.1,
        bx2: 704, tx2: 36
      };
    }
    return {
      left: { x: 8, y: 8, w: 344, h: 300 },
      right: { x: 8, y: 320, w: 344, h: 372 },
      gx: 40, gy: 70, cw: 76, ch: 34, cols: 3,
      bx: 100, bw: 76, baseline: 620, scale: 10.56,
      bx2: 226, tx2: 10
    };
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB");
    var Lp = G.left, Rp = G.right;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: Lp.x, y: Lp.y, width: Lp.w, height: Lp.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: Rp.x, y: Rp.y, width: Rp.w, height: Rp.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);

    /* 左：m 行（上衣）× 3 列（下装）的搭配网格 */
    tx(gA, Lp.x + 20, Lp.y + 30, "每一行是一件上衣，三个格子是它能配的下装", "#5a6472", "start", 10, 700);
    for (var j = 0; j < G.cols; j++) {
      tx(gA, G.gx + j * G.cw + G.cw / 2 - 4, G.gy - 10, "裤" + (j + 1), "#8a94a3", "middle", 8.6, 400);
    }
    for (var i = 0; i < s.m; i++) {
      tx(gA, G.gx - 8, G.gy + i * G.ch + G.ch / 2 + 3, "上" + (i + 1), "#5a6472", "end", 8.6, 400);
      for (var k = 0; k < G.cols; k++) {
        el("rect", {
          x: G.gx + k * G.cw + 3, y: G.gy + i * G.ch + 3,
          width: G.cw - 8, height: G.ch - 8, rx: 5,
          fill: ["#eef4ff", "#e6f6ee", "#fdf3e0"][k % 3],
          stroke: ["#b9cdf5", "#a9dcc2", "#e8cfa0"][k % 3]
        }, gA);
      }
      tx(gA, G.gx + G.cols * G.cw + 8, G.gy + i * G.ch + G.ch / 2 + 3, "3 种", "#2f8a5b", "start", 8.8, 700);
    }
    tx(gA, Lp.x + 20, Lp.y + Lp.h - 14, "共 " + s.m + " 件上衣，每件都有 3 条下装 → " + s.m + "×3 = " + s.ways + " 种", "#151a21", "start", 9.2, 700);

    /* 右：分步相乘与误用加法的柱状对照 */
    tx(gB, Rp.x + 20, Rp.y + 30, "两条柱：分步相乘 vs 误用加法", "#5a6472", "start", 10, 700);
    var base = G.baseline, sc = G.scale;
    var h1 = s.ways * sc, h2 = s.mix * sc;
    el("line", { x1: Rp.x + 24, y1: base, x2: Rp.x + Rp.w - 20, y2: base, stroke: "#c9d3dd", "stroke-width": 1 }, gB);
    tx(gB, Rp.x + 24, base + 14, "0", "#8a94a3", "start", 8);
    tx(gB, Rp.x + 24, base - 18 * sc + 2, "18", "#8a94a3", "start", 8);

    el("rect", { x: G.bx, y: base - h1, width: G.bw, height: h1, rx: 4, fill: "#2f8a5b", opacity: 0.86 }, gB);
    tx(gB, G.bx + G.bw / 2, base - h1 - 8, String(s.ways), "#2f8a5b", "middle", 13, 700);
    tx(gB, G.bx + G.bw / 2, base + 20, "分步 3m", "#2f8a5b", "middle", 9, 700);

    el("rect", { x: G.bx2, y: base - h2, width: G.bw, height: h2, rx: 4, fill: "#b8791f", opacity: 0.6 }, gB);
    tx(gB, G.bx2 + G.bw / 2, base - h2 - 8, String(s.mix), "#b8791f", "middle", 13, 700);
    tx(gB, G.bx2 + G.bw / 2, base + 20, "加法 m+3", "#b8791f", "middle", 9, 700);

    tx(gB, Rp.x + 20, base + 48, "差 " + s.gap + " 种：m 越大，加法漏算越多", "#5a6472", "start", 9);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.m);
    $("gxVb").textContent = String(s.ways);
    $("gxVc").textContent = String(s.mix);
    if (s.m === 3) { st = "分步·相乘"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "3×3=9，停留帧"; }
    else if (s.m === 1) { st = "分步·相乘"; col = "#b8791f"; bg = "#fdf3e0"; sn = "乘 1 不改结果"; }
    else if (s.m === 6) { st = "分步·相乘"; col = "#2563eb"; bg = "#eef4ff"; sn = "差最大 8 种"; }
    else { st = "分步·相乘"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "只选上衣没做完"; }
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 6 }, { t: 11.5, v: 4 }, { t: 13.5, v: 1 }],
    keys: [1, 3, 6],
    value: A, min: 1, max: 6, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { ways: 3 } },
    { v: 3, eq: { ways: 9 } },
    { v: 6, eq: { ways: 18 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
