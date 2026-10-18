/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 340 }, right: { x: 8, y: 356, w: 344, h: 336 } };
  var L = W, G = null, A = 0.2;
  var PB_A = 0.8, PB_nA = 0.3;

  /* 纯函数：P(A) → 各个量。render() 与 __model.cases 都用它 */
  function calc(v) {
    var p = Math.max(0.2, Math.min(0.9, v));
    var pA = p, pnA = 1 - pA;
    var p1 = pA * PB_A;          /* P(AB)=P(A)·P(B|A) */
    var p2 = pnA * PB_nA;        /* P(ĀB)=P(Ā)·P(B|Ā) */
    return { pA: pA, pnA: pnA, p1: p1, p2: p2, pb: p1 + p2 };
  }

  /* 几何：全部由 L 推出来，两套坐标共用同一份绘制代码 */
  function geom() {
    var l = L.left, r = L.right;
    var nX = l.x + l.w * 0.42, lfX = l.x + l.w * 0.68;
    return {
      root: { x: l.x + 26, y: l.y + l.h * 0.5 },
      a: { x: nX, y: l.y + l.h * 0.26 },
      na: { x: nX, y: l.y + l.h * 0.74 },
      lv: [
        { x: lfX, y: l.y + l.h * 0.13 },
        { x: lfX, y: l.y + l.h * 0.38 },
        { x: lfX, y: l.y + l.h * 0.62 },
        { x: lfX, y: l.y + l.h * 0.87 }
      ],
      bx: r.x + 24, bw: r.w - 48,
      y1: r.y + r.h * 0.24,
      y2: r.y + r.h * 0.52
    };
  }

  function edge(g, p, q) {
    el("line", { x1: p.x, y1: p.y, x2: q.x - 16, y2: q.y, stroke: "#8a97a6", "stroke-width": 1.5 }, g);
  }
  function node(g, p, label, col, bg) {
    el("circle", { cx: p.x, cy: p.y, r: 15, fill: bg, stroke: col, "stroke-width": 1.4 }, g);
    tx(g, p.x, p.y + 4, label, col, "middle", 10, 700);
  }

  function draw() {
    var s = calc(A), g = G;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var l = L.left, r = L.right;

    /* ---------------- 左：树形图 ---------------- */
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 16, l.y + 24, "树形图：枝上概率随 P(A) 变", "#5a6472", "start", 10.5, 700);

    edge(gA, g.root, g.a); edge(gA, g.root, g.na);
    edge(gA, g.a, g.lv[0]); edge(gA, g.a, g.lv[1]);
    edge(gA, g.na, g.lv[2]); edge(gA, g.na, g.lv[3]);

    node(gA, g.root, "Ω", "#5a6472", "#eef2f6");
    node(gA, g.a, "A", "#2563eb", "#e8f0fe");
    node(gA, g.na, "Ā", "#b8402f", "#fdf1ee");

    tx(gA, (g.root.x + g.a.x) / 2, (g.root.y + g.a.y) / 2 - 8, "P(A)=" + s.pA.toFixed(2), "#1b3f8f", "middle", 9.4, 700);
    tx(gA, (g.root.x + g.na.x) / 2, (g.root.y + g.na.y) / 2 + 16, "P(Ā)=" + s.pnA.toFixed(2), "#8f2b1b", "middle", 9.4, 700);

    tx(gA, (g.a.x + g.lv[0].x) / 2, (g.a.y + g.lv[0].y) / 2 - 6, "0.8", "#2563eb", "middle", 9.2, 700);
    tx(gA, (g.a.x + g.lv[1].x) / 2, (g.a.y + g.lv[1].y) / 2 + 13, "0.2", "#2563eb", "middle", 9.2, 700);
    tx(gA, (g.na.x + g.lv[2].x) / 2, (g.na.y + g.lv[2].y) / 2 - 6, "0.3", "#b8402f", "middle", 9.2, 700);
    tx(gA, (g.na.x + g.lv[3].x) / 2, (g.na.y + g.lv[3].y) / 2 + 13, "0.7", "#b8402f", "middle", 9.2, 700);

    var names = ["AB", "AB̄", "ĀB", "ĀB̄"];
    var vals = [s.p1, s.pA * 0.2, s.p2, s.pnA * 0.7];
    var cols = ["#1b3f8f", "#7b8aa0", "#8f2b1b", "#a98b84"];
    for (var i = 0; i < 4; i++) {
      el("circle", { cx: g.lv[i].x, cy: g.lv[i].y, r: 4.5, fill: cols[i] }, gA);
      tx(gA, g.lv[i].x + 10, g.lv[i].y + 3.5, names[i] + " " + vals[i].toFixed(2), cols[i], "start", 9.2, 700);
    }
    tx(gA, l.x + 16, l.y + l.h - 26, "乘在枝上：每层枝上概率相乘，得一条路径的概率", "#5a6472", "start", 9.2, 400);
    tx(gA, l.x + 16, l.y + l.h - 10, "加在根上：含 B 的两条路径相加，就是 P(B)", "#5a6472", "start", 9.2, 400);

    /* ---------------- 右：区间与组成 ---------------- */
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 16, r.y + 24, "P(B) 被夹在 0.3 与 0.8 之间", "#5a6472", "start", 10.5, 700);

    var x0 = g.bx, bw = g.bw;
    el("rect", { x: x0 + bw * 0.3, y: g.y1, width: bw * 0.5, height: 22, fill: "#eef4ff", stroke: "#b8cfe8" }, gB);
    el("line", { x1: x0, y1: g.y1 + 11, x2: x0 + bw, y2: g.y1 + 11, stroke: "#c9d4e0", "stroke-width": 1 }, gB);
    el("line", { x1: x0 + bw * 0.3, y1: g.y1 - 4, x2: x0 + bw * 0.3, y2: g.y1 + 30, stroke: "#b8402f", "stroke-width": 1.2, "stroke-dasharray": "3 3" }, gB);
    el("line", { x1: x0 + bw * 0.8, y1: g.y1 - 4, x2: x0 + bw * 0.8, y2: g.y1 + 30, stroke: "#2563eb", "stroke-width": 1.2, "stroke-dasharray": "3 3" }, gB);
    tx(gB, x0 + bw * 0.3, g.y1 + 42, "0.3", "#b8402f", "middle", 9, 700);
    tx(gB, x0 + bw * 0.8, g.y1 + 42, "0.8", "#2563eb", "middle", 9, 700);
    var mx = x0 + bw * s.pb;
    el("path", { d: "M" + (mx - 6) + "," + (g.y1 - 6) + " L" + (mx + 6) + "," + (g.y1 - 6) + " L" + mx + "," + (g.y1 + 4) + " Z", fill: "#2f8a5b" }, gB);
    tx(gB, mx, g.y1 - 12, "P(B)=" + s.pb.toFixed(3), "#2f8a5b", "middle", 9.2, 700);
    tx(gB, x0, g.y1 - 18, "P(B|Ā)", "#b8402f", "start", 8.8, 700);
    tx(gB, x0 + bw, g.y1 - 18, "P(B|A)", "#2563eb", "end", 8.8, 700);

    var w1 = bw * s.p1, w2 = bw * s.p2;
    el("rect", { x: x0, y: g.y2, width: Math.max(0.5, w1), height: 24, fill: "#bcd0f7", stroke: "#2563eb" }, gB);
    el("rect", { x: x0 + w1, y: g.y2, width: Math.max(0.5, w2), height: 24, fill: "#f2c9bf", stroke: "#b8402f" }, gB);
    tx(gB, x0 + w1 / 2, g.y2 + 16, s.p1.toFixed(3), "#1b3f8f", "middle", 9, 700);
    tx(gB, x0 + w1 + w2 / 2, g.y2 + 16, s.p2.toFixed(3), "#8f2b1b", "middle", 9, 700);
    tx(gB, x0, g.y2 - 8, "P(AB)", "#2563eb", "start", 8.8, 700);
    tx(gB, x0 + bw, g.y2 - 8, "P(ĀB)", "#b8402f", "end", 8.8, 700);

    tx(gB, x0, g.y2 + 52, "P(B)=" + s.p1.toFixed(3) + "+" + s.p2.toFixed(3) + "=" + s.pb.toFixed(3), "#151a21", "start", 10, 700);
    tx(gB, x0, g.y2 + 70, "=P(A)×0.8 + P(Ā)×0.3", "#5a6472", "start", 9.2, 400);
    tx(gB, x0, g.y2 + 88, "两段互斥，所以能直接相加；", "#5a6472", "start", 9.2, 400);
    tx(gB, x0, g.y2 + 104, "漏一段就等于漏一类情形。", "#5a6472", "start", 9.2, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = s.pA.toFixed(2);
    $("gxVb").textContent = s.p1.toFixed(2) + "+" + s.p2.toFixed(2);
    $("gxVc").textContent = s.pb.toFixed(3);
    if (s.pb <= 0.45) { st = "贴近 0.3"; col = "#b8402f"; bg = "#fbeae7"; sn = "P(A) 太小，权重压在乙线"; }
    else if (s.pb < 0.545) { st = "偏向 0.3"; col = "#b8791f"; bg = "#fdf3e0"; sn = "P(Ā) 更大，结果靠近 0.3"; }
    else if (s.pb < 0.655) { st = "正中间"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "P(A)=0.5，加权平均正好居中"; }
    else { st = "贴近 0.8"; col = "#2563eb"; bg = "#e8f0fe"; sn = "P(A) 更大，结果靠近 0.8"; }
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
    loop: [{ t: 0, v: 0.2 }, { t: 1, v: 0.2 }, { t: 4.6, v: 0.9 }, { t: 6.5, v: 0.9 }, { t: 8.5, v: 0.5 }, { t: 11, v: 0.5 }, { t: 13, v: 0.2 }],
    keys: [0.2, 0.5, 0.9],
    value: A, min: 0.2, max: 0.9, step: 0.05,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0.2, eq: { pb: 0.4, p1: 0.16, p2: 0.24 } },
    { v: 0.5, eq: { pb: 0.55, p1: 0.4, p2: 0.15 } },
    { v: 0.9, eq: { pb: 0.75, p1: 0.72, p2: 0.03 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
