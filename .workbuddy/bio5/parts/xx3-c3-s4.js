/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470" }, N = { vb: "0 0 360 700" };
  var L = W, A = 0, G = null;

  /* 纯函数：n 个定点突变位点 → 酶相对活性（%），上限 200% */
  function calc(n) {
    return { act: 100 * (2 - Math.exp(-n / 2)), gain: 100 * (1 - Math.exp(-n / 2)) };
  }

  /* 布局相关的全部坐标集中在这里，render 里只读 G */
  function geom() {
    if (L === W) {
      return {
        panelA: [16, 16, 424, 438], panelB: [456, 16, 408, 438],
        blob: [56, 96, 336, 200], pocket: [224, 196, 30],
        sites: [[104, 136], [168, 124], [248, 122], [316, 138], [330, 214], [108, 232]],
        siteR: 13, numFs: 7.6,
        bars: { x0: 512, gap: 46, w: 26, base: 360, scale: 1.3, x1: 836, labelY: 382 },
        wide: true
      };
    }
    return {
      panelA: [8, 8, 344, 300], panelB: [8, 320, 344, 372],
      blob: [30, 52, 300, 160], pocket: [180, 132, 22],
      sites: [[58, 80], [110, 68], [180, 66], [250, 78], [262, 140], [58, 150]],
      siteR: 10.5, numFs: 6.6,
      bars: { x0: 51, gap: 43, w: 24, base: 620, scale: 1.2, x1: 340, labelY: 642 },
      wide: false
    };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), i, p, v, y, cx, b = G.bars;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: G.panelA[0], y: G.panelA[1], width: G.panelA[2], height: G.panelA[3], rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: G.panelB[0], y: G.panelB[1], width: G.panelB[2], height: G.panelB[3], rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    if (G.wide) {
      tx(gA, 36, 46, "酶的结构：定点突变改了哪几个位点", "#5a6472", "start", 10.5, 700);
      tx(gA, 36, 64, "红色位点 = 已改造；改造越多，结构偏离越大", "#8b95a1", "start", 8.4, 400);
      tx(gB, 476, 46, "酶相对活性（%）：先陡后平", "#5a6472", "start", 10.5, 700);
    } else {
      tx(gA, 24, 32, "酶的结构：改造了哪几个位点", "#5a6472", "start", 9.4, 700);
      tx(gB, 24, 344, "酶相对活性（%）：先陡后平", "#5a6472", "start", 9.4, 700);
    }
    el("rect", { x: G.blob[0], y: G.blob[1], width: G.blob[2], height: G.blob[3], rx: 24, fill: "#eef7fd", stroke: "#b8d9ee" }, gA);
    el("circle", { cx: G.pocket[0], cy: G.pocket[1], r: G.pocket[2], fill: "#ffffff", stroke: "#b9c6d1", "stroke-dasharray": "4 3" }, gA);
    tx(gA, G.pocket[0], G.pocket[1] + 2.6, "活性中心", "#8b95a1", "middle", G.wide ? 7.8 : 7, 400);
    for (i = 0; i < 6; i++) {
      p = G.sites[i];
      el("circle", { cx: p[0], cy: p[1], r: G.siteR, fill: i < A ? "#f3c98b" : "#ffffff", stroke: i < A ? "#b8791f" : "#b9c6d1", "stroke-width": i < A ? 1.5 : 1 }, gA);
      tx(gA, p[0], p[1] + 2.8, String(i + 1), i < A ? "#8a5a12" : "#8b95a1", "middle", G.numFs, i < A ? 700 : 400);
    }
    if (G.wide) {
      el("circle", { cx: 62, cy: 328, r: 5, fill: "#f3c98b", stroke: "#b8791f" }, gA);
      tx(gA, 72, 332, "已改造", "#3a3a35", "start", 8.4, 400);
      el("circle", { cx: 132, cy: 328, r: 5, fill: "#ffffff", stroke: "#b9c6d1" }, gA);
      tx(gA, 142, 332, "未改造", "#8b95a1", "start", 8.4, 400);
      el("rect", { x: 56, y: 348, width: 336, height: 86, rx: 8, fill: "#ffffff", stroke: "#e6e9ee" }, gA);
      tx(gA, 68, 372, "活性 = 100 ×（2 − e^(−n/2)）", "#2b6a8f", "start", 9, 700);
      tx(gA, 68, 392, "n=0 → 100%　n=3 → 177.7%　上限 200%", "#3a3a35", "start", 8.4, 400);
      tx(gA, 68, 412, "改造的是基因，改变的是结构。", "#8a5a12", "start", 8.4, 400);
      tx(gA, 68, 428, "n>4 后继续加位点，风险大于收益。", "#b8402f", "start", 8.4, 400);
    } else {
      tx(gA, 28, 236, "● 已改造　○ 未改造", "#5a6472", "start", 8, 400);
      tx(gA, 28, 262, "活性 = 100×(2−e^(−n/2))", "#2b6a8f", "start", 8, 700);
      tx(gA, 28, 280, "n=0 → 100%；n=3 → 177.7%", "#3a3a35", "start", 7.8, 400);
      tx(gA, 28, 297, "上限 200%，位点不是越多越好", "#b8402f", "start", 7.6, 400);
    }
    /* 右：柱状图 */
    for (i = 0; i <= 6; i++) {
      v = calc(i).act;
      y = b.base - v * b.scale;
      cx = b.x0 + i * b.gap;
      el("rect", { x: cx - b.w / 2, y: y, width: b.w, height: b.base - y, fill: i === A ? "#f3c98b" : "#d5eaf6", stroke: i === A ? "#b8791f" : "#a9cfe4", "stroke-width": i === A ? 1.4 : 0.9 }, gB);
      tx(gB, cx, y - 6, v.toFixed(1), i === A ? "#8a5a12" : "#5a6472", "middle", G.wide ? 7 : 6.4, i === A ? 700 : 400);
      tx(gB, cx, b.labelY, String(i), i === A ? "#b8402f" : "#8b95a1", "middle", G.wide ? 8.4 : 7.6, i === A ? 700 : 400);
    }
    el("line", { x1: b.x0 - 30, y1: b.base, x2: b.x1, y2: b.base, stroke: "#b9c6d1", "stroke-width": 1.2 }, gB);
    if (G.wide) {
      tx(gB, b.x0 - 34, b.base + 3, "0", "#8b95a1", "end", 7.6, 400);
      tx(gB, b.x0 - 34, b.base + 20, "n（个）", "#8b95a1", "end", 7.6, 400);
      tx(gB, 760, 94, "收益递减区", "#8a5a12", "middle", 7.6, 700);
      tx(gB, 476, 420, "n=3：177.7%　n=6：约195%　模型上限 200%", "#3a3a35", "start", 8.4, 400);
      tx(gB, 476, 438, "每多一个位点，增量越来越小。", "#8b95a1", "start", 8.4, 400);
    } else {
      tx(gB, 24, 664, "n=3 → 177.7%，之后收益递减", "#3a3a35", "start", 7.8, 400);
      tx(gB, 24, 682, "位点越多，越可能破坏结构。", "#b8402f", "start", 7.8, 400);
    }
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; stage.setAttribute("viewBox", L.vb); G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = s.act.toFixed(1);
    $("gxVc").textContent = s.gain.toFixed(1);
    if (A === 0) { st = "原酶"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "未改造，活性 100%"; }
    else if (A <= 4) { st = "明显提升"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = A === 4 ? "再改收益变小" : "结构仍稳定"; }
    else { st = "接近上限"; col = "#b8791f"; bg = "#fdf3e0"; sn = "继续改造风险增大"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() { G = null; render(); }

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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 6 }, { t: 11, v: 4 }, { t: 13, v: 0 }],
    keys: [0, 1, 3, 6],
    value: A, min: 0, max: 6, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { act: 100 } },
    { v: 1, eq: { act: 139.4 } },
    { v: 3, eq: { act: 177.7 } }
  ] };
  window.__model = window.__bio;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
