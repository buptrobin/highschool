/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = {
    vb: "0 0 880 470", wide: true,
    left: { x: 16, y: 16, w: 424, h: 438 },
    right: { x: 456, y: 16, w: 408, h: 438 }
  };
  var N = {
    vb: "0 0 360 700", wide: false,
    left: { x: 8, y: 8, w: 344, h: 300 },
    right: { x: 8, y: 320, w: 344, h: 372 }
  };
  var L = W, A = -80;

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var ad = 100 + 0.5 * v;
    var gap = ad - 100;
    var inf = 0.3 * gap;
    return { ad: ad, gap: gap, inf: inf };
  }

  function fmt(v, d) {
    if (Math.abs(v) < Math.pow(10, -d) / 2) v = 0;
    var s = v.toFixed(d);
    return (v > 0 ? "+" : "") + s.replace("-", "−");
  }
  function sfmt(v) { return (v > 0 ? "+" : "") + String(Math.round(v)).replace("-", "−"); }
  function line(g, x1, y1, x2, y2, col, w, dash, op) {
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": w || 1 };
    if (dash) a["stroke-dasharray"] = dash;
    if (op) a["stroke-opacity"] = op;
    return el("line", a, g);
  }
  function rect(g, x, y, w, h, fill, stroke, rx) {
    return el("rect", { x: x, y: y, width: w, height: h, rx: rx || 8, fill: fill, stroke: stroke || "none" }, g);
  }
  function circle(g, cx, cy, r, fill, stroke, sw) {
    return el("circle", { cx: cx, cy: cy, r: r, fill: fill, stroke: stroke, "stroke-width": sw || 1 }, g);
  }

  function drawLeft() {
    var g = $("gxA"), p = L.left, wide = L.wide;
    g.textContent = "";
    rect(g, p.x, p.y, p.w, p.h, "#f8fbfd", "#dbe7ef", 10);
    tx(g, p.x + 20, p.y + 28, wide ? "总需求 vs 潜在产出" : "总需求与潜在产出", "#5a6472", "start", 10.5, 700);

    /* 图例 */
    var ly = p.y + (wide ? 62 : 50);
    var lx = p.x + (wide ? 280 : 188);
    line(g, lx, ly - 3, lx + 18, ly - 3, "#be123c", 2);
    tx(g, lx + 23, ly, "总需求", "#5a6472", "start", 8.4);
    var lx2 = lx + 56;
    line(g, lx2, ly - 3, lx2 + 18, ly - 3, "#8a8f98", 1.6, "4 3");
    tx(g, lx2 + 23, ly, "潜在产出", "#5a6472", "start", 8.4);

    var px0 = p.x + (wide ? 48 : 44);
    var px1 = p.x + p.w - (wide ? 16 : 8);
    var py0 = p.y + (wide ? 72 : 62);
    var py1 = p.y + p.h - (wide ? 118 : 72);
    rect(g, px0, py0, px1 - px0, py1 - py0, "#ffffff", "#eef2f5", 6);

    function sx(s) { return px0 + (s + 100) / 200 * (px1 - px0); }
    function yad(a) { return py1 - (a - 40) / 120 * (py1 - py0); }

    var ticks = [50, 100, 150], i, t, ty;
    for (i = 0; i < ticks.length; i++) {
      t = ticks[i]; ty = yad(t);
      line(g, px0, ty, px0 + 5, ty, "#c9d3dc", 1);
      tx(g, px0 - 7, ty + 3.5, String(t), "#7a8494", "end", wide ? 8.6 : 8.2);
    }

    var potY = yad(100);
    line(g, px0, potY, px1, potY, "#8a8f98", 1.4, "5 4");
    tx(g, px0 + 6, potY - 6, "潜在产出 100", "#7a8494", "start", wide ? 8.6 : 8.2);

    var xs = [-100, 0, 100];
    for (i = 0; i < xs.length; i++) {
      t = sx(xs[i]);
      line(g, t, py1, t, py1 + 4, "#c9d3dc", 1);
      tx(g, t, py1 + 16, xs[i] < 0 ? "−100" : (xs[i] > 0 ? "+100" : "0"), "#7a8494", "middle", wide ? 8.6 : 8.2);
    }
    tx(g, (px0 + px1) / 2, py1 + 32, wide ? "财政刺激力度 s：紧缩 ← 0 → 扩张" : "紧缩 ← s → 扩张", "#7a8494", "middle", 8.6);

    line(g, sx(-100), yad(50), sx(100), yad(150), "#be123c", 2.2);

    var s = calc(A);
    var cx = sx(A), ptY = yad(s.ad), gap = s.gap;
    var col = gap > 0 ? "#b8791f" : (gap < 0 ? "#be123c" : "#9aa3ae");
    if (Math.abs(gap) >= 0.5) {
      line(g, cx, potY, cx, ptY, col, 4, null, ".3");
      line(g, cx - 5, potY, cx + 5, potY, col, 1.4);
      line(g, cx - 5, ptY, cx + 5, ptY, col, 1.4);
    }

    var lx3 = cx + 8, anc = "start";
    if (cx > px0 + (px1 - px0) * 0.7) { lx3 = cx - 8; anc = "end"; }
    if (Math.abs(gap) >= 8) {
      tx(g, lx3, (ptY + potY) / 2 + 3, "缺口 " + fmt(gap, 1), col, anc, 8.4, 700, true);
    }
    circle(g, cx, ptY, 4.2, "#ffffff", "#be123c", 2);
    tx(g, lx3, gap >= 0 ? ptY - 10 : ptY + 18, "总需求 " + s.ad.toFixed(1), "#9f1239", anc, wide ? 9.2 : 8.6, 700, true);

    var label, recipe;
    if (gap < -5) { label = "需求不足"; recipe = "扩张性财政政策，必要时配合宽松货币政策"; }
    else if (gap > 5) { label = "经济过热"; recipe = "紧缩性财政政策，必要时配合紧缩货币政策"; }
    else { label = "供求基本平衡"; recipe = "保持中性，财政收支与货币条件基本稳定"; }

    var by1 = p.y + p.h - (wide ? 56 : 22);
    tx(g, px0, by1, "s = " + sfmt(A) + "：总需求 " + s.ad.toFixed(1) + "，潜在产出 100", "#5a6472", "start", wide ? 9.2 : 8.3);
    tx(g, px0, by1 + (wide ? 16 : 14), "缺口 " + fmt(gap, 1) + "，物价 " + fmt(s.inf, 1) + "%：" + label, col, "start", wide ? 9.2 : 8.3, 700);
    if (wide) tx(g, px0, by1 + 32, "药方：" + recipe, "#5a6472", "start", 9.2);
  }

  function drawRight() {
    var g = $("gxB"), p = L.right, wide = L.wide;
    g.textContent = "";
    rect(g, p.x, p.y, p.w, p.h, "#ffffff", "#e6e9ee", 10);
    tx(g, p.x + 20, p.y + 28, "物价涨幅（%）", "#5a6472", "start", 10.5, 700);

    var px0 = p.x + (wide ? 60 : 44);
    var px1 = p.x + p.w - (wide ? 20 : 8);
    var py0 = p.y + (wide ? 70 : 50);
    var py1 = p.y + p.h - (wide ? 148 : 150);
    rect(g, px0, py0, px1 - px0, py1 - py0, "#fbfcfd", "#eef2f5", 6);

    function sx(s) { return px0 + (s + 100) / 200 * (px1 - px0); }
    function yin(v) { return py1 - (v + 18) / 36 * (py1 - py0); }

    var zeroY = yin(0);
    line(g, px0, zeroY, px1, zeroY, "#c9d3dc", 1.2, "5 4");
    tx(g, px1 - 4, zeroY - 5, "物价稳定线", "#7a8494", "end", 8.2);

    var ticks = [-15, 0, 15], i, t, ty;
    for (i = 0; i < ticks.length; i++) {
      t = ticks[i]; ty = yin(t);
      line(g, px0, ty, px0 + 5, ty, "#c9d3dc", 1);
      tx(g, px0 - 7, ty + 3.5, t < 0 ? "−15" : (t > 0 ? "+15" : "0"), "#7a8494", "end", wide ? 8.6 : 8.2);
    }

    var xs = [-100, 0, 100];
    for (i = 0; i < xs.length; i++) {
      t = sx(xs[i]);
      line(g, t, py1, t, py1 + 4, "#c9d3dc", 1);
      tx(g, t, py1 + 16, xs[i] < 0 ? "−100" : (xs[i] > 0 ? "+100" : "0"), "#7a8494", "middle", wide ? 8.6 : 8.2);
    }
    tx(g, (px0 + px1) / 2, py1 + 32, "财政刺激力度 s", "#7a8494", "middle", 8.6);

    line(g, sx(-100), yin(-15), sx(100), yin(15), "#b8791f", 2.2);

    var s = calc(A);
    var cx = sx(A), ptY = yin(s.inf);
    circle(g, cx, ptY, 4.2, "#ffffff", "#b8791f", 2);

    var lx = cx + 8, anc = "start";
    if (cx > px0 + (px1 - px0) * 0.7) { lx = cx - 8; anc = "end"; }
    tx(g, lx, s.inf > 8 ? ptY + 18 : ptY - 10, "物价 " + fmt(s.inf, 1) + "%", "#8a5c14", anc, wide ? 9.2 : 8.6, 700, true);

    var bx = p.x + (wide ? 20 : 12);
    var by = p.y + p.h - (wide ? 102 : 102);
    var bw = p.w - (wide ? 40 : 24);
    var bh = wide ? 90 : 92;
    rect(g, bx, by, bw, bh, "#ffffff", "#e6e9ee", 8);
    tx(g, bx + 12, by + (wide ? 18 : 16), "方向速记", "#5a6472", "start", 9.2, 700);
    tx(g, bx + 12, by + (wide ? 36 : 34), "s > 0：踩油门，总需求↑，物价↑", "#b8791f", "start", wide ? 9 : 8.8);
    tx(g, bx + 12, by + (wide ? 54 : 52), "s < 0：踩刹车，总需求↓，物价↓", "#b8402f", "start", wide ? 9 : 8.8);
    tx(g, bx + 12, by + (wide ? 72 : 70), "s = 0：总需求 = 潜在产出，物价稳定", "#2f8a5b", "start", wide ? 9 : 8.8);
  }

  function render() {
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = sfmt(A);
    $("gxVb").textContent = s.ad.toFixed(1);
    $("gxVc").textContent = fmt(s.gap, 1);
    $("gxVcs").textContent = "物价 " + fmt(s.inf, 1) + "%";
    if (s.gap < -5) { st = "需求不足"; col = "#b8402f"; bg = "#fbeae7"; sn = "应扩张：减税、增支、降息"; }
    else if (s.gap > 5) { st = "经济过热"; col = "#b8791f"; bg = "#fdf3e0"; sn = "应紧缩：增税、减支、加息"; }
    else { st = "供求基本平衡"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "物价稳定，政策保持中性"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    drawLeft();
    drawRight();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
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
    loop: [{ t: 0, v: -80 }, { t: 1.2, v: -80 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: 80 }, { t: 11, v: 80 }, { t: 13, v: -80 }],
    keys: [-80, 0, 80],
    value: A, min: -100, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: -100, eq: { ad: 50, gap: -50, inf: -15 } },
    { v: 0, eq: { ad: 100, gap: 0, inf: 0 } },
    { v: 60, eq: { ad: 130, gap: 30, inf: 9 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
