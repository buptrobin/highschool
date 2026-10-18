/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 }, narrow: false };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 330 }, right: { x: 8, y: 346, w: 344, h: 346 }, narrow: true };
  var L = W, A = 0, G = null, R0 = 3, TH = 100 * (1 - 1 / R0); /* 66.67 */
  function ln(g, o) { el("line", o, g); }
  function T(g, x, y, s, c, a, f, w) { tx(g, x, y, s, c, a || "start", f || 9, w || 400); }

  /* 纯函数：人群免疫比例 p(%) → 有效传染数 R 与是否达到群体免疫 */
  function calc(v) {
    var p = Math.max(0, Math.min(100, v));
    return { p: p, R: R0 * (1 - p / 100), herd: p >= 66.7 ? 1 : 0, gap: 66.7 - p };
  }

  /* 30 个小人（10×3），阈值线在第 2 排之下 = 20/30 = 66.7% */
  function geom() {
    var n = L.narrow;
    return {
      x0: L.left.x + (n ? 26 : 30), sp: n ? 31 : 36,
      rows: n ? [100, 152, 204] : [108, 168, 228],
      lineY: (n ? 152 : 168) - 13,
      plot: n ? { x0: 52, y0: 404, x1: 330, y1: 634 } : { x0: 500, y0: 80, x1: 830, y1: 380 }
    };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var n = L.narrow, s = calc(A), i, x, y, on, col, pts = [], p, mx, my, P = G.plot;
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    T(gA, L.left.x + 20, L.left.y + 30, "人群：涂色＝有免疫力，留白＝无免疫力", "#5a6472", "start", n ? 10 : 10.5, 700);
    T(gA, L.left.x + 20, L.left.y + 48, "已免疫 " + Math.round(A * 0.3) + " / 30 人（示意）", "#8a94a0", "start", 9.4);

    for (i = 0; i < 30; i++) {
      on = i < Math.round(A * 0.3);
      x = G.x0 + (i % 10) * G.sp;
      y = G.rows[(i / 10) | 0];
      var f = on ? "#2f8a5b" : "#ffffff";
      el("circle", { cx: x, cy: y, r: n ? 5.4 : 6.2, fill: f, stroke: "#2f8a5b", "stroke-width": 1.2 }, gA);
      el("rect", { x: x - (n ? 7 : 8), y: y + (n ? 7 : 8), width: n ? 14 : 16, height: n ? 15 : 17, rx: 4, fill: f, stroke: "#2f8a5b", "stroke-width": 1.2 }, gA);
    }

    ln(gA, { x1: L.left.x + 24, y1: G.lineY, x2: L.left.x + L.left.w - 24, y2: G.lineY, stroke: "#b8402f", "stroke-width": 1.4, "stroke-dasharray": "6 4" });
    T(gA, L.left.x + 24, G.lineY - 6, "阈值 66.7%（1 − 1/R₀）", "#b8402f", "start", 9.2, 700);
    var yy = L.left.y + L.left.h - 66;
    T(gA, L.left.x + 24, yy, "R = 3 × (1 − p/100)", "#3a3a35", "start", 9.6);
    T(gA, L.left.x + 24, yy + 19, s.R > 1.005 ? "p < 66.7%：R > 1，还能继续传播" : "p ≥ 66.7%：R < 1，传播开始萎缩", s.R > 1.005 ? "#b8402f" : "#2f8a5b", "start", 9.6, 700);
    T(gA, L.left.x + 24, yy + 37, "群体免疫需要足够比例，不是一部分人打了就行", "#5a6472", "start", 9.2);

    T(gB, L.right.x + 20, L.right.y + 30, "有效传染数 R（R₀ = 3）", "#5a6472", "start", n ? 10 : 10.5, 700);
    ln(gB, { x1: P.x0, y1: P.y1, x2: P.x1, y2: P.y1, stroke: "#c9d3dc", "stroke-width": 1.2 });
    ln(gB, { x1: P.x0, y1: P.y0, x2: P.x0, y2: P.y1, stroke: "#c9d3dc", "stroke-width": 1.2 });
    var yOne = P.y1 - (1 / 3) * (P.y1 - P.y0);
    ln(gB, { x1: P.x0, y1: yOne, x2: P.x1, y2: yOne, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "5 4" });
    T(gB, P.x0 + 4, yOne - 7, "R = 1（临界）", "#b8402f", "start", 9, 700);
    var xTh = P.x0 + (TH / 100) * (P.x1 - P.x0);
    ln(gB, { x1: xTh, y1: P.y0, x2: xTh, y2: P.y1, stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "4 4" });
    T(gB, xTh, P.y1 + 16, "66.7%", "#b8791f", "middle", 9, 700);
    T(gB, P.x0, P.y1 + 16, "0", "#8a94a0", "middle");
    T(gB, P.x0 + (P.x1 - P.x0) / 2, P.y1 + 16, "50", "#8a94a0", "middle");
    T(gB, P.x1, P.y1 + 16, "100", "#8a94a0", "middle");
    T(gB, P.x0 - 6, P.y0 + 2, "R", "#8a94a0", "end", 9.4, 700);

    for (p = 0; p <= 100; p += 5) {
      pts.push((P.x0 + (p / 100) * (P.x1 - P.x0)) + "," + (P.y1 - ((R0 * (1 - p / 100)) / 3) * (P.y1 - P.y0)));
    }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2f6f8f", "stroke-width": 2, "stroke-linejoin": "round" }, gB);

    mx = P.x0 + (A / 100) * (P.x1 - P.x0);
    my = P.y1 - (s.R / 3) * (P.y1 - P.y0);
    col = s.R > 1.005 ? "#b8402f" : "#2f8a5b";
    ln(gB, { x1: mx, y1: my, x2: mx, y2: P.y1, stroke: col, "stroke-width": 1, "stroke-dasharray": "3 3" });
    el("circle", { cx: mx, cy: my, r: 4.6, fill: col, stroke: "#ffffff", "stroke-width": 1.6 }, gB);
    T(gB, A > 66.7 ? mx - 8 : mx + 8, my - 8, "R = " + s.R.toFixed(2), col, A > 66.7 ? "end" : "start", 9.4, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.R.toFixed(2);
    $("gxVc").textContent = (A < 66.7 ? "还差 " : "已超 ") + Math.abs(66.7 - A).toFixed(1);
    if (s.R > 1.005) { st = "还能传播"; col = "#b8402f"; bg = "#fbeae7"; sn = "R > 1，疫情扩大"; }
    else if (s.R > 0.99) { st = "临界"; col = "#b8791f"; bg = "#fdf3e0"; sn = "R ≈ 1，刚好压住"; }
    else { st = "传播萎缩"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "R < 1，达到群体免疫"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    G = null;
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
    loop: [{ t: 0, v: 0 }, { t: 1, v: 0 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 100 }, { t: 11, v: 67 }, { t: 13.5, v: 67 }, { t: 15, v: 0 }],
    keys: [0, 50, 67, 100],
    value: A, min: 0, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { R: 3, herd: 0 } },
    { v: 50, eq: { R: 1.5, herd: 0 } },
    { v: 80, eq: { R: 0.6, herd: 1 } }
  ] };
  window.__model = { calc: calc, cases: window.__bio.cases };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
