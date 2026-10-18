/* 互动脚本本体：启动子甲基化 m → 基因表达量 → 性状（由 build-page.mjs 包进 <script>） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 60, G = null;

  /* 纯函数：甲基化程度 → 表达量 / 性状 */
  function calc(v) {
    var m = Math.max(0, Math.min(100, v));
    var expr = 100 - m;
    return { m: m, expr: expr, pheno: expr >= 50 ? 1 : 0, meth: Math.round(m / 100 * 8) };
  }

  function geom() {
    var l = L.left, r = L.right, w = (L === W), g = { wide: w, l: l, r: r };
    g.sqN = 8; g.sqW = w ? 15 : 10; g.sqGap = w ? 3 : 2; g.sqH = w ? 26 : 20;
    var span = g.sqN * (g.sqW + g.sqGap);
    g.sqX = l.x + (w ? 40 : 20); g.sqY = l.y + (w ? 148 : 114);
    g.geneX = g.sqX + span + (w ? 12 : 8); g.geneY = g.sqY; g.geneH = g.sqH; g.geneW = 196;
    g.pmCX = g.sqX + span / 2; g.gnCX = g.geneX + g.geneW / 2;
    g.labelY = g.sqY - (w ? 26 : 18); g.dotY = g.sqY - (w ? 12 : 10);
    g.sub2Y = l.y + (w ? 72 : 62); g.sub3Y = l.y + (w ? 88 : 78);
    g.legY = g.sqY + g.sqH + (w ? 18 : 14);
    g.chainW = 200; g.chainX = l.x + l.w / 2 - 100; g.cx = l.x + l.w / 2; g.boxH = w ? 26 : 22;
    g.mrnaY = l.y + (w ? 216 : 168);
    g.protY = g.mrnaY + g.boxH + (w ? 28 : 10);
    g.phenoY = g.protY + g.boxH + (w ? 28 : 10);
    g.noteY = g.phenoY + g.boxH + (w ? 24 : 20);
    g.barX = r.x + (w ? 54 : 46); g.barW = w ? 64 : 56; g.barH = 200;
    g.barTop = r.y + (w ? 76 : 60); g.numX = g.barX + g.barW + 26;
    g.card = { x: r.x + 20, y: r.y + (w ? 344 : 300), w: r.w - 40, h: w ? 56 : 46 };
    return g;
  }

  function drawDNA(g, s) {
    for (var i = 0; i < G.sqN; i++) {
      var x = G.sqX + i * (G.sqW + G.sqGap);
      el("rect", { x: x, y: G.sqY, width: G.sqW, height: G.sqH, fill: "#ffffff", stroke: "#b8791f" }, g);
      if (i < s.meth) {
        el("circle", { cx: x + G.sqW / 2, cy: G.dotY, r: G.wide ? 3.6 : 3, fill: "#b8402f" }, g);
        el("line", { x1: x + G.sqW / 2, y1: G.dotY + 3, x2: x + G.sqW / 2, y2: G.sqY, stroke: "#b8402f", "stroke-width": 1 }, g);
      }
    }
    el("rect", { x: G.geneX, y: G.geneY, width: G.geneW, height: G.geneH, rx: 4, fill: "#eef3fa", stroke: "#cfe0f0" }, g);
    tx(g, G.pmCX, G.labelY, "启动子", "#8a5a10", "middle", G.wide ? 9.4 : 8.8, 700);
    tx(g, G.gnCX, G.labelY, "基因（转录区）", "#3a5a86", "middle", G.wide ? 9.4 : 8.8, 700);
    var ok = s.expr >= 50;
    tx(g, G.gnCX, G.geneY + G.geneH / 2 + 4, ok ? "转录正常" : "转录受阻", ok ? "#2f8a5b" : "#b8402f", "middle", G.wide ? 9 : 8.4, 500);
    tx(g, G.sqX, G.legY, "甲基化位点 " + s.meth + " / 8（小圆点 = CH₃）", "#6b7684", "start", G.wide ? 8.8 : 8.2, 400);
  }

  function drawChain(g, s) {
    var ys = [G.mrnaY, G.protY, G.phenoY], op = 0.35 + 0.65 * s.expr / 100;
    var label = [
      "mRNA（相对量 " + Math.round(s.expr) + "）",
      "酶 或 结构蛋白",
      s.pheno ? "性状：正常" : "性状：异常"
    ];
    for (var i = 0; i < 3; i++) {
      var last = i === 2, fill = last ? (s.pheno ? "#e6f6ee" : "#fbeae7") : "#ffffff";
      var stroke = last ? (s.pheno ? "#b8e6d0" : "#e8bdb6") : "#cfe0f0";
      el("rect", { x: G.chainX, y: ys[i], width: G.chainW, height: G.boxH, rx: 6, fill: fill, stroke: stroke, "fill-opacity": last ? 1 : op }, g);
      tx(g, G.chainX + 12, ys[i] + G.boxH / 2 + 4, label[i], "#3a3a35", "start", G.wide ? 9.4 : 8.8, 500);
      if (i < 2) {
        el("line", { x1: G.cx, y1: ys[i] + G.boxH, x2: G.cx, y2: ys[i + 1] - 4, stroke: "#8aa0b4", "stroke-width": 1.2 }, g);
        el("polygon", { points: (G.cx - 4) + "," + (ys[i + 1] - 4) + " " + (G.cx + 4) + "," + (ys[i + 1] - 4) + " " + G.cx + "," + ys[i + 1], fill: "#8aa0b4" }, g);
        tx(g, G.cx + 8, ys[i] + G.boxH + 14, i === 0 ? "转录" : "翻译", "#8aa0b4", "start", 8, 400);
      }
    }
    tx(g, G.chainX, G.noteY, "表达量 = 100 − m，表达越低，下游产物越少", "#6b7684", "start", G.wide ? 8.8 : 8.2, 400);
  }

  function drawBar(g, s) {
    var bx = G.barX, bw = G.barW, top = G.barTop, bot = top + G.barH;
    var col = s.expr >= 50 ? "#2f8a5b" : (s.expr > 0 ? "#b8791f" : "#b8402f");
    el("rect", { x: bx, y: top, width: bw, height: G.barH, rx: 4, fill: "#f2f6fa", stroke: "#dde4ea" }, g);
    var ph = G.barH * s.expr / 100;
    if (ph > 0.5) el("rect", { x: bx, y: bot - ph, width: bw, height: ph, fill: col, opacity: 0.78 }, g);
    el("line", { x1: bx - 8, y1: top + G.barH / 2, x2: bx + bw + 8, y2: top + G.barH / 2, stroke: "#b8402f", "stroke-width": 1.2, "stroke-dasharray": "4 3" }, g);
    tx(g, bx - 8, top + 4, "100", "#6b7684", "end", 8.6, 400);
    tx(g, bx - 8, top + G.barH / 2 + 4, "50", "#b8402f", "end", 8.6, 700);
    tx(g, bx - 8, bot + 4, "0", "#6b7684", "end", 8.6, 400);
    tx(g, G.numX, top + 58, String(Math.round(s.expr)), col, "start", 30, 700);
    tx(g, G.numX, top + 78, "基因表达量", "#5a6472", "start", 9, 400);
    tx(g, G.numX, top + 94, "= 100 − m", "#8a94a0", "start", 8.6, 400);
    tx(g, G.r.x + 20, bot + 32, "甲基化程度 m = " + Math.round(s.m) + " %", "#3a3a35", "start", 9.4, 500);
    tx(g, G.r.x + 20, bot + 50, "被甲基化的位点 " + s.meth + " / 8", "#6b7684", "start", 8.6, 400);
    var c = G.card;
    el("rect", { x: c.x, y: c.y, width: c.w, height: c.h, rx: 8, fill: s.expr >= 50 ? "#e6f6ee" : (s.expr > 0 ? "#fdf3e0" : "#fbeae7"), stroke: col + "55" }, g);
    tx(g, c.x + 16, c.y + 26, s.expr >= 50 ? "表达基本正常" : (s.expr > 0 ? "表达不足，性状改变" : "完全沉默"), col, "start", G.wide ? 12.5 : 11, 700);
    tx(g, c.x + 16, c.y + (G.wide ? 46 : 40), "判据：表达量 ≥ 50 正常，< 50 异常", "#5a6472", "start", 8.6, 400);
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), l = G.l, r = G.r;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 20, l.y + 30, "启动子上插甲基 → 基因被关小", "#5a6472", "start", G.wide ? 10.5 : 9.6, 700);
    tx(gA, l.x + 20, G.sub2Y, "启动子：RNA 聚合酶结合、启动转录的一小段 DNA", "#8a94a0", "start", G.wide ? 8.6 : 8.2, 400);
    tx(gA, l.x + 20, G.sub3Y, "甲基（CH₃）加到启动子上 → 转录受阻 → 表达下降", "#8a94a0", "start", G.wide ? 8.6 : 8.2, 400);
    drawDNA(gA, s);
    drawChain(gA, s);
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 20, r.y + 30, "读出表达量，判断性状", "#5a6472", "start", G.wide ? 10.5 : 9.6, 700);
    drawBar(gB, s);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    if (s.expr >= 50) { st = "表达基本正常"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "表达量 ≥ 50，性状正常"; }
    else if (s.expr > 0) { st = "表达不足，性状改变"; col = "#b8791f"; bg = "#fdf3e0"; sn = "表达量 < 50，性状异常"; }
    else { st = "完全沉默"; col = "#b8402f"; bg = "#fbeae7"; sn = "表达量为 0，基因关闭"; }
    $("gxVa").textContent = String(Math.round(s.m));
    $("gxVb").textContent = String(Math.round(s.expr));
    $("gxVc").textContent = s.meth + " / 8";
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 60 }, { t: 6.5, v: 60 }, { t: 9, v: 100 }, { t: 11, v: 30 }, { t: 13, v: 0 }],
    keys: [0, 30, 60, 100],
    value: A, min: 0, max: 100, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { expr: 100, pheno: 1 } },
    { v: 60, eq: { expr: 40, pheno: 0 } },
    { v: 100, eq: { expr: 0, pheno: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
