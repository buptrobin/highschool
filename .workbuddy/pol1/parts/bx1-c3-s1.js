/* 互动脚本本体（bx1-c3-s1 · 年份 → GDP 与阶段） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1978, G = null;

  /* 锚点：国家统计局年度数据（万亿元）。锚点之间线性插值，只为滑块连续 */
  var AN = [[1978, 0.37], [1990, 1.89], [2000, 10.0], [2010, 41.2], [2020, 101.6]];
  var PH = [
    { n: "改革探索期", r: "1978—1991" },
    { n: "市场经济体制建立", r: "1992—2000" },
    { n: "加入 WTO 后高速增长", r: "2001—2011" },
    { n: "新时代高质量发展", r: "2012 年以后" }
  ];

  function calc(v) {
    var y = Math.round(v);
    if (y < 1978) y = 1978; if (y > 2020) y = 2020;
    var g = AN[0][1], i;
    for (i = 0; i < AN.length - 1; i++) {
      if (y >= AN[i][0] && y <= AN[i + 1][0]) {
        var k = AN[i + 1][0] - AN[i][0];
        g = AN[i][1] + (AN[i + 1][1] - AN[i][1]) * (y - AN[i][0]) / k;
        break;
      }
    }
    var p = y < 1992 ? 0 : y <= 2000 ? 1 : y <= 2011 ? 2 : 3;
    return { year: y, gdp: g, ratio: g / 0.37, phase: p };
  }

  function pick() { return stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; }

  function geom() {
    var lf = L.left, rt = L.right, na = L === N, g;
    g = {
      na: na,
      cx0: lf.x + (na ? 42 : 56), cx1: lf.x + lf.w - (na ? 10 : 16),
      cy0: lf.y + (na ? 54 : 70), cy1: lf.y + lf.h - (na ? 70 : 58),
      ry0: rt.y + (na ? 30 : 56), rh: na ? 56 : 62, rg: na ? 8 : 10,
      rx0: rt.x + (na ? 14 : 20), rx1: rt.x + rt.w - (na ? 14 : 20),
      by: rt.y + rt.h - (na ? 52 : 40), bh: na ? 14 : 18
    };
    g.lo = Math.log(0.3); g.hi = Math.log(120);
    return g;
  }

  function xx(y) { return G.cx0 + (y - 1978) / 42 * (G.cx1 - G.cx0); }
  function yy(v) {
    var t = (Math.log(Math.max(v, 0.3)) - G.lo) / (G.hi - G.lo);
    return G.cy1 - Math.max(0, Math.min(1, t)) * (G.cy1 - G.cy0);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), p, i, pt = [], d, act;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 30, "GDP 长期曲线 · 万亿元（对数刻度）", "#5a6472", "start", 10.5, 700);

    /* 坐标轴 + 对数网格 */
    el("line", { x1: G.cx0, y1: G.cy0 - 6, x2: G.cx0, y2: G.cy1, stroke: "#dbe7ef" }, gA);
    el("line", { x1: G.cx0, y1: G.cy1, x2: G.cx1, y2: G.cy1, stroke: "#dbe7ef" }, gA);
    var gr = [1, 10, 100];
    for (i = 0; i < 3; i++) {
      el("line", { x1: G.cx0, y1: yy(gr[i]), x2: G.cx1, y2: yy(gr[i]), stroke: "#eef3f8" }, gA);
      tx(gA, G.cx0 - 6, yy(gr[i]) + 3, String(gr[i]), "#9aa6b2", "end", 8.6, 400);
    }
    /* 阶段分隔 */
    var cut = [1992, 2001, 2012];
    for (i = 0; i < 3; i++) el("line", { x1: xx(cut[i]), y1: G.cy0 - 6, x2: xx(cut[i]), y2: G.cy1, stroke: "#e6d9c4", "stroke-dasharray": "3 3" }, gA);

    for (i = 0; i <= 42; i++) pt.push(xx(1978 + i).toFixed(1) + "," + yy(calc(1978 + i).gdp).toFixed(1));
    el("polyline", { points: pt.join(" "), fill: "none", stroke: "#2f6fa8", "stroke-width": 2.2 }, gA);

    for (i = 0; i < AN.length; i++) {
      el("circle", { cx: xx(AN[i][0]), cy: yy(AN[i][1]), r: 3.2, fill: "#2f6fa8" }, gA);
      tx(gA, xx(AN[i][0]), yy(AN[i][1]) - 7, AN[i][0] === 2020 ? "101.6" : String(AN[i][1]), "#7a8593", "middle", 8.4, 400);
    }
    for (i = 0; i < 5; i++) {
      var yr = [1978, 1990, 2000, 2010, 2020][i];
      tx(gA, xx(yr), G.cy1 + 15, String(yr), "#7a8593", "middle", 8.6, 400);
    }
    tx(gA, G.cx1, G.cy0 - 16, "数据来源：国家统计局年度数据", "#9aa6b2", "end", 8.2, 400);

    /* 当前点 */
    p = calc(A).gdp;
    el("line", { x1: xx(A), y1: yy(p), x2: xx(A), y2: G.cy1, stroke: "#2f8a5b", "stroke-dasharray": "4 3" }, gA);
    el("circle", { cx: xx(A), cy: yy(p), r: 5.4, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 2.6 }, gA);
    var lx = xx(A), anc = "middle";
    if (A < 1986) { anc = "start"; lx = xx(A) + 9; } else if (A > 2013) { anc = "end"; lx = xx(A) - 9; }
    tx(gA, lx, yy(p) - 13, String(s.year) + " 年 · " + (p < 10 ? p.toFixed(2) : p.toFixed(1)) + " 万亿", "#1d5c3c", anc, 9.6, 700);

    /* 右：四个阶段 */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 30, "所处阶段（按年份判断）", "#5a6472", "start", 10.5, 700);
    for (i = 0; i < 4; i++) {
      act = i === s.phase;
      d = G.ry0 + i * (G.rh + G.rg);
      el("rect", { x: G.rx0, y: d, width: G.rx1 - G.rx0, height: G.rh, rx: 7, fill: act ? "#e6f6ee" : "#fbfcfd", stroke: act ? "#2f8a5b" : "#e6e9ee" }, gB);
      tx(gB, G.rx0 + 12, d + G.rh / 2 - 3, PH[i].n, act ? "#1d5c3c" : "#8a95a1", "start", 10.2, act ? 700 : 400);
      tx(gB, G.rx0 + 12, d + G.rh / 2 + 13, PH[i].r, "#9aa6b2", "start", 8.8, 400);
    }
    /* 倍数条 */
    tx(gB, G.rx0, G.by - 9, "相当于 1978 年", "#5a6472", "start", 9, 400);
    tx(gB, G.rx1, G.by - 9, "×" + s.ratio.toFixed(0), "#1d5c3c", "end", 11, 700);
    el("rect", { x: G.rx0, y: G.by, width: G.rx1 - G.rx0, height: G.bh, rx: G.bh / 2, fill: "#eef3f8" }, gB);
    el("rect", { x: G.rx0, y: G.by, width: Math.max(6, (G.rx1 - G.rx0) * Math.min(1, s.ratio / 275)), height: G.bh, rx: G.bh / 2, fill: "#2f8a5b" }, gB);
  }

  function render() {
    if (!G) { L = pick(); G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.year);
    $("gxVb").textContent = s.gdp < 10 ? s.gdp.toFixed(2) : s.gdp.toFixed(1);
    $("gxVc").textContent = "×" + s.ratio.toFixed(0);
    if (s.phase === 0) { st = "改革探索期"; col = "#b8791f"; bg = "#fdf3e0"; sn = "1978—1991 · 水平低、起步慢"; }
    else if (s.phase === 1) { st = "市场经济体制建立"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "1992—2000 · 十四大定目标"; }
    else if (s.phase === 2) { st = "加入 WTO 后高速增长"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "2001—2011 · 曲线最陡的一段"; }
    else { st = "新时代高质量发展"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "2012 年以后 · 基数大、增速稳"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = pick();
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
    loop: [{ t: 0, v: 1978 }, { t: 1.2, v: 1978 }, { t: 4, v: 2020 }, { t: 6.5, v: 2020 }, { t: 9, v: 2000 }, { t: 11, v: 2010 }, { t: 13, v: 1978 }],
    keys: [1978, 1990, 2000, 2010, 2020],
    value: A, min: 1978, max: 2020, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1978, eq: { gdp: 0.37 } },
    { v: 2000, eq: { gdp: 10 } },
    { v: 2020, eq: { gdp: 101.6 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
