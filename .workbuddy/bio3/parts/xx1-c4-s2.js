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

  /* 纯函数：距首次接触的天数 → 抗体相对量。render() 和 __bio.cases 都用它 */
  function calc(d) {
    var v1 = d <= 10 ? 100 * Math.pow(d / 10, 2) : Math.max(0, 100 - (d - 10) * 6);
    var v2 = d >= 14 ? 600 * Math.exp(-Math.pow(d - 17, 2) / 8) : 0;
    var v = Math.max(v1, v2);
    return { v: Math.round(v * 10) / 10, k: Math.round(v / 100 * 100) / 100 };
  }

  function geom() {
    var p = L.left, q = L.right, rh = q.h - 32;
    return {
      px: p.x + 46, py: p.y + 46, pw: p.w - 66, ph: p.h - 92,
      rx: q.x + 20, ry: q.y + 16, rw: q.w - 40, rh: rh,
      m: Math.min(1.2, rh / 340), barMax: 680,
      bx: p.x, by: p.y, bw: p.w, bh: p.h
    };
  }

  function X(d) { return G.px + d / 40 * G.pw; }
  function Y(v) { return G.py + G.ph - v / 650 * G.ph; }
  function R(y) { return G.ry + y * G.m; }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), i, pts = [], d, v;
    gA.textContent = ""; gB.textContent = "";

    el("rect", { x: G.bx, y: G.by, width: G.bw, height: G.bh, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, G.bx + 20, G.by + 30, "抗体相对量 v 随天数 d 变化", "#5a6472", "start", 10.5, 700);
    el("line", { x1: G.px, y1: G.py, x2: G.px, y2: G.py + G.ph, stroke: "#8fa3b3", "stroke-width": 1.2 }, gA);
    el("line", { x1: G.px, y1: G.py + G.ph, x2: G.px + G.pw, y2: G.py + G.ph, stroke: "#8fa3b3", "stroke-width": 1.2 }, gA);
    el("line", { x1: G.px, y1: Y(100), x2: G.px + G.pw, y2: Y(100), stroke: "#c8d6e0", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    el("line", { x1: G.px, y1: Y(600), x2: G.px + G.pw, y2: Y(600), stroke: "#c8d6e0", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    tx(gA, G.px - 8, Y(600) + 4, "600", "#5a6472", "end", 8.4, 400);
    tx(gA, G.px - 8, Y(100) + 4, "100", "#5a6472", "end", 8.4, 400);
    tx(gA, G.px - 8, Y(0) + 4, "0", "#5a6472", "end", 8.4, 400);

    for (d = 0; d <= 40.001; d += 0.5) { pts.push(X(d).toFixed(1) + "," + Y(calc(d).v).toFixed(1)); }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2f8a5b", "stroke-width": 2.2, "stroke-linejoin": "round" }, gA);

    el("line", { x1: X(14), y1: G.py + G.ph, x2: X(14), y2: Y(600), stroke: "#c9a24a", "stroke-width": 1.1, "stroke-dasharray": "5 4" }, gA);
    tx(gA, X(14), G.py + G.ph + 32, "第 14 天再接触", "#b8791f", "middle", 8.2, 400);
    tx(gA, X(40), G.py + G.ph + 32, "d（天）", "#5a6472", "end", 8.4, 400);
    tx(gA, X(10), Y(100) - 8, "初次峰", "#2f8a5b", "middle", 8.2, 700);
    tx(gA, X(17), Y(600) - 8, "二次峰", "#b8402f", "middle", 8.2, 700);
    for (i = 0; i <= 40; i += 10) {
      el("line", { x1: X(i), y1: G.py + G.ph, x2: X(i), y2: G.py + G.ph + 4, stroke: "#8fa3b3", "stroke-width": 1 }, gA);
      tx(gA, X(i), G.py + G.ph + 15, String(i), "#5a6472", "middle", 8.2, 400);
    }

    v = s.v;
    el("line", { x1: X(A), y1: Y(0), x2: X(A), y2: Y(v), stroke: "#b8402f", "stroke-width": 1.6 }, gA);
    el("circle", { cx: X(A), cy: Y(v), r: 4, fill: "#b8402f", stroke: "#ffffff", "stroke-width": 1.2 }, gA);
    if (X(A) > G.px + G.pw - 78) tx(gA, X(A) - 9, Y(v) - 8, "v=" + s.v.toFixed(1), "#b8402f", "end", 8.4, 700);
    else tx(gA, X(A) + 9, Y(v) - 8, "v=" + s.v.toFixed(1), "#b8402f", "start", 8.4, 700);

    var bh = 20 * G.m, w1 = G.rw * 100 / G.barMax, w2 = G.rw * Math.min(600, v) / G.barMax;
    el("rect", { x: G.rx, y: G.ry, width: G.rw, height: G.rh, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, G.rx + 16, R(22), "两次应答的峰值对比", "#5a6472", "start", 10.5, 700);
    tx(gB, G.rx + 16, R(56), "初次免疫峰值（第 10 天）", "#5a6472", "start", 8.8, 400);
    el("rect", { x: G.rx + 16, y: R(64), width: G.rw - 32, height: bh, rx: 4, fill: "#eef2f5" }, gB);
    el("rect", { x: G.rx + 16, y: R(64), width: w1, height: bh, rx: 4, fill: "#8fc7a8" }, gB);
    tx(gB, G.rx + 22 + w1, R(64) + bh * 0.74, "100", "#2f8a5b", "start", 8.8, 700);
    tx(gB, G.rx + 16, R(108), "当前 d = " + A + " 天", "#5a6472", "start", 8.8, 400);
    el("rect", { x: G.rx + 16, y: R(116), width: G.rw - 32, height: bh, rx: 4, fill: "#eef2f5" }, gB);
    el("rect", { x: G.rx + 16, y: R(116), width: w2, height: bh, rx: 4, fill: "#d98b7c" }, gB);
    tx(gB, G.rx + 22 + w2, R(116) + bh * 0.74, s.v.toFixed(1), "#b8402f", "start", 8.8, 700);

    tx(gB, G.rx + 16, R(160), "倍数 v ÷ 100 = " + s.k.toFixed(1) + "×", "#151a21", "start", 9.4, 700);
    tx(gB, G.rx + 16, R(184), "浆细胞不能识别抗原，只分泌抗体", "#3a3a35", "start", 8.4, 400);
    tx(gB, G.rx + 16, R(202), "抗体在体液中起作用", "#3a3a35", "start", 8.4, 400);
    tx(gB, G.rx + 16, G.ry + G.rh - 22, "记忆细胞：留存 → 迅速增殖分化", "#b8791f", "start", 8.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = s.v.toFixed(1);
    $("gxVc").textContent = s.k.toFixed(1) + "×";
    if (A < 7) { st = "初次应答上升中"; col = "#b8791f"; bg = "#fdf3e0"; sn = "B 细胞增殖分化，抗体刚出现"; }
    else if (A < 10) { st = "接近初次峰"; col = "#b8791f"; bg = "#fdf3e0"; sn = "第 10 天到达峰值 100"; }
    else if (A === 10) { st = "初次峰（100）"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "抗体相对量达到 100"; }
    else if (A < 14) { st = "初次应答下降"; col = "#b8791f"; bg = "#fdf3e0"; sn = "抗体减少，记忆细胞留存"; }
    else { st = "二次应答：更快更高"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "记忆细胞迅速增殖分化"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.0, v: 0 }, { t: 3.2, v: 10 }, { t: 5.0, v: 10 }, { t: 7.0, v: 17 }, { t: 9.5, v: 17 }, { t: 11.0, v: 20 }, { t: 13.0, v: 0 }],
    keys: [0, 10, 14, 17],
    value: A, min: 0, max: 40, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 5, eq: { v: 25 } },
    { v: 10, eq: { v: 100 } },
    { v: 17, eq: { v: 600 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
