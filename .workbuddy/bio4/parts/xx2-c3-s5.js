/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 13, G = null;

  /* 纯函数：物种丰富度 S → 两种稳定性。render() 和 __bio.cases 都用它 */
  function calc(v) {
    return { resist: 1 - Math.exp(-v / 15), recov: Math.exp(-v / 25) };
  }

  /* 布局相关的几何量，只在 layout() 或首帧算一次 */
  function geom() {
    var wide = (L === W), l = L.left, r = L.right, ry = r.y;
    return {
      wide: wide,
      P: {
        x0: l.x + (wide ? 62 : 48), x1: l.x + l.w - (wide ? 26 : 22),
        y0: l.y + (wide ? 84 : 50), y1: l.y + l.h - (wide ? 98 : 56)
      },
      rx: r.x + 20, rw: r.w - 40,
      r1t: ry + 64, r1b: ry + 72, r1v: ry + 108,
      r2t: ry + 144, r2b: ry + 152, r2v: ry + 188,
      rd: ry + 212, rs: ry + 238, rn: ry + 308
    };
  }

  function sx(g, S) { return g.P.x0 + (S - 5) / 45 * (g.P.x1 - g.P.x0); }
  function sy(g, v) { return g.P.y1 - v * (g.P.y1 - g.P.y0); }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
    return lines.length;
  }

  function draw() {
    var g = G, P = g.P, gA = $("gxA"), gB = $("gxB"), s = calc(A), i, S, rp = [], cp = [];
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 32, "两条曲线的走向：一条升、一条降", "#5a6472", "start", 11, 700);
    el("rect", { x: L.left.x + 20, y: L.left.y + 46, width: 11, height: 3, rx: 1.5, fill: "#1f6fa8" }, gA);
    tx(gA, L.left.x + 37, L.left.y + 50, "抵抗力稳定性", "#1f6fa8", "start", 9.6, 700);
    el("rect", { x: L.left.x + 118, y: L.left.y + 46, width: 11, height: 3, rx: 1.5, fill: "#b8791f" }, gA);
    tx(gA, L.left.x + 135, L.left.y + 50, "恢复力稳定性", "#b8791f", "start", 9.6, 700);

    el("line", { x1: P.x0, y1: P.y0, x2: P.x0, y2: P.y1, stroke: "#c9d4de", "stroke-width": 1.1 }, gA);
    el("line", { x1: P.x0, y1: P.y1, x2: P.x1, y2: P.y1, stroke: "#c9d4de", "stroke-width": 1.1 }, gA);
    tx(gA, P.x0 - 9, P.y0 + 4, "1", "#8a94a3", "end", 8.6, 400);
    tx(gA, P.x0 - 9, P.y1 + 4, "0", "#8a94a3", "end", 8.6, 400);
    for (i = 0; i < 46; i++) {
      S = 5 + i; rp.push(sx(g, S) + "," + sy(g, calc(S).resist).toFixed(1));
      cp.push(sx(g, S) + "," + sy(g, calc(S).recov).toFixed(1));
    }
    el("line", { x1: sx(g, 13), y1: P.y0, x2: sx(g, 13), y2: P.y1, stroke: "#8a94a3", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    el("polyline", { points: rp.join(" "), fill: "none", stroke: "#1f6fa8", "stroke-width": 2.2 }, gA);
    el("polyline", { points: cp.join(" "), fill: "none", stroke: "#b8791f", "stroke-width": 2.2 }, gA);
    el("circle", { cx: sx(g, 13), cy: sy(g, calc(13).resist), r: 3.6, fill: "#8a94a3" }, gA);
    el("line", { x1: sx(g, A), y1: sy(g, s.resist) + 8, x2: sx(g, A), y2: sy(g, s.recov) - 8, stroke: "#b8402f", "stroke-width": 1.4, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: sx(g, A), cy: sy(g, s.resist), r: 4.4, fill: "#1f6fa8", stroke: "#ffffff", "stroke-width": 1.4 }, gA);
    el("circle", { cx: sx(g, A), cy: sy(g, s.recov), r: 4.4, fill: "#b8791f", stroke: "#ffffff", "stroke-width": 1.4 }, gA);

    tx(gA, P.x0, P.y1 + 18, "5", "#8a94a3", "middle", 8.8, 400);
    tx(gA, sx(g, 13), P.y1 + 18, "13", "#8a94a3", "middle", 8.8, 400);
    tx(gA, sx(g, 20), P.y1 + 18, "20", "#8a94a3", "middle", 8.8, 400);
    tx(gA, sx(g, 35), P.y1 + 18, "35", "#8a94a3", "middle", 8.8, 400);
    tx(gA, P.x1, P.y1 + 18, "50", "#8a94a3", "middle", 8.8, 400);
    tx(gA, P.x0, P.y1 + 40, "物种丰富度 S", "#5a6472", "start", 9.2, 700);
    tx(gA, P.x1, P.y1 + 40, "S≈13 两线交叉", "#8a94a3", "end", 9.2, 400);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, g.rx, L.right.y + 30, "当下的数值与判断", "#5a6472", "start", 11, 700);
    tx(gB, g.rx, g.r1t, "① 抵抗力稳定性 resist", "#1f6fa8", "start", 10, 700);
    el("rect", { x: g.rx, y: g.r1b, width: g.rw, height: 18, rx: 9, fill: "#eef1f5" }, gB);
    el("rect", { x: g.rx, y: g.r1b, width: Math.max(3, g.rw * s.resist), height: 18, rx: 9, fill: "#1f6fa8" }, gB);
    tx(gB, g.rx, g.r1v, s.resist.toFixed(2), "#1f6fa8", "start", 15, 700);
    tx(gB, g.rx + g.rw, g.r1t + 4, "越高越抗干扰", "#8a94a3", "end", 9, 400);
    tx(gB, g.rx, g.r2t, "② 恢复力稳定性 recov", "#b8791f", "start", 10, 700);
    el("rect", { x: g.rx, y: g.r2b, width: g.rw, height: 18, rx: 9, fill: "#eef1f5" }, gB);
    el("rect", { x: g.rx, y: g.r2b, width: Math.max(3, g.rw * s.recov), height: 18, rx: 9, fill: "#b8791f" }, gB);
    tx(gB, g.rx, g.r2v, s.recov.toFixed(2), "#b8791f", "start", 15, 700);
    tx(gB, g.rx + g.rw, g.r2t + 4, "越高越回得快", "#8a94a3", "end", 9, 400);
    el("line", { x1: g.rx, y1: g.rd, x2: g.rx + g.rw, y2: g.rd, stroke: "#e6e9ee", "stroke-width": 1 }, gB);
    var st = A < 10 ? "恢复力强、抵抗力弱（荒漠型）" : (A <= 16 ? "两者大致相当（交叉点附近）" : "抵抗力强、恢复力弱（森林型）");
    var col = (A >= 10 && A <= 16) ? "#2f8a5b" : "#b8791f";
    wrap(gB, g.rx, g.rs, st, g.rw, 10.4, col, 17);
    tx(gB, g.rx, g.rn, "绿色条长 = 抗体力高", "#8a94a3", "start", 9, 400);
    tx(gB, g.rx, g.rn + 16, "橙色条长 = 恢复力高", "#8a94a3", "start", 9, 400);
    tx(gB, g.rx, g.rn + 32, "两种稳定性往往负相关", "#8a94a3", "start", 9, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), col, bg, sn, st;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.resist.toFixed(2);
    $("gxVc").textContent = s.recov.toFixed(2);
    if (A < 10) { st = "恢复力强"; col = "#b8791f"; bg = "#fdf3e0"; sn = "抵抗力弱（荒漠型）"; }
    else if (A <= 16) { st = "两者相当"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "两线在 S≈13 交叉"; }
    else { st = "抵抗力强"; col = "#b8791f"; bg = "#fdf3e0"; sn = "恢复力弱（森林型）"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    G = null;
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
    loop: [{ t: 0, v: 5 }, { t: 1, v: 5 }, { t: 3, v: 13 }, { t: 5.5, v: 13 }, { t: 7.5, v: 20 }, { t: 9.5, v: 20 }, { t: 11, v: 35 }, { t: 12.5, v: 50 }, { t: 14.5, v: 5 }],
    keys: [5, 13, 20, 35, 50],
    value: A, min: 5, max: 50, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 5, eq: { resist: 0.283, recov: 0.819 } },
    { v: 20, eq: { resist: 0.736, recov: 0.449 } },
    { v: 50, eq: { resist: 0.964, recov: 0.135 } }
  ] };
  window.__model = window.__bio;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
