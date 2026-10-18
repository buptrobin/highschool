/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = -1, G = null;
  var CL = { ink: "#151a21", mut: "#7b8794", line: "#9aa6b2", pos: "#2563eb", zero: "#b8791f", neg: "#b8402f", ok: "#2f8a5b" };

  /* 纯函数：指数 α → 三个量。render() 和 __model.cases 都用它 */
  function calc(v) { return { y1: 1, y2: Math.pow(2, v), mono: v > 0 ? 1 : v === 0 ? 0 : -1 }; }
  function fmt(v) { return String(v).replace("-", "−"); }

  function geom() {
    var p = L.left, q = L.right, w = L === W;
    var t = p.y + (w ? 66 : 54), b = p.y + p.h - (w ? 30 : 18);
    var ox = p.x + (w ? 40 : 24), r = p.x + p.w - (w ? 22 : 14), ymax = 4.4, ymin = -1.6;
    var sy = (b - t) / (ymax - ymin);
    return { p: p, q: q, w: w, ox: ox, oy: t + ymax * sy, sx: (r - ox) / 4, sy: sy, top: t, bot: b, r: r, ymax: ymax, ymin: ymin };
  }

  function arrow(p, x1, y1, x2, y2) {
    var a = Math.atan2(y2 - y1, x2 - x1), s = 9, c = Math.cos, n = Math.sin;
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#5a6472", "stroke-width": 1.2 }, p);
    el("polygon", { points: x2 + "," + y2 + " " + (x2 - s * c(a - .42)).toFixed(1) + "," + (y2 - s * n(a - .42)).toFixed(1) + " " + (x2 - s * c(a + .42)).toFixed(1) + "," + (y2 - s * n(a + .42)).toFixed(1), fill: "#5a6472" }, p);
  }

  /* 取点：右支 x>0；左支只在 α 为整数时存在 */
  function segs(g, v, neg) {
    var out = [], cur = [], i, x, y;
    for (i = 0; i <= 400; i++) {
      x = neg ? -(0.02 + i * 0.01) : 0.02 + i * 0.01;
      if (!neg && x > 4) break;
      y = Math.pow(x, v);
      if (!isFinite(y) || y > g.ymax - .03 || y < g.ymin + .03) { if (cur.length > 1) out.push(cur); cur = []; continue; }
      cur.push((g.ox + x * g.sx).toFixed(1) + "," + (g.oy - y * g.sy).toFixed(1));
    }
    if (cur.length > 1) out.push(cur);
    return out;
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), g = G, s = calc(A), k;
    gA.textContent = ""; gB.textContent = "";
    var col = s.mono > 0 ? CL.pos : s.mono === 0 ? CL.zero : CL.neg;
    el("rect", { x: g.p.x, y: g.p.y, width: g.p.w, height: g.p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, g.p.x + 22, g.p.y + 30, "y = x^α 的图象　α = " + fmt(A), CL.ink, "start", 11, 700);

    /* 坐标轴：带箭头与单位刻度 */
    arrow(gA, g.ox - 16, g.oy, g.r + 18, g.oy);
    arrow(gA, g.ox, g.bot + 8, g.ox, g.top - 12);
    tx(gA, g.ox - 12, g.oy + 15, "O", CL.mut, "end", 9);
    tx(gA, g.r + 20, g.oy + 4, "x", CL.mut, "start", 9.5);
    tx(gA, g.ox + 6, g.top - 14, "y", CL.mut, "start", 9.5);
    for (k = 1; k <= 4; k++) {
      el("line", { x1: g.ox + k * g.sx, y1: g.oy, x2: g.ox + k * g.sx, y2: g.oy + 5, stroke: CL.line }, gA);
      tx(gA, g.ox + k * g.sx, g.oy + 17, String(k), CL.mut, "middle", 8.6);
      el("line", { x1: g.ox, y1: g.oy - k * g.sy, x2: g.ox - 5, y2: g.oy - k * g.sy, stroke: CL.line }, gA);
      tx(gA, g.ox - 9, g.oy - k * g.sy + 3.4, String(k), CL.mut, "end", 8.6);
    }
    el("line", { x1: g.ox, y1: g.oy + g.sy, x2: g.ox - 5, y2: g.oy + g.sy, stroke: CL.line }, gA);
    tx(gA, g.ox - 9, g.oy + g.sy + 3.4, "−1", CL.mut, "end", 8.6);

    function stroke(list, c) {
      for (var i = 0; i < list.length; i++) el("polyline", { points: list[i].join(" "), fill: "none", stroke: c, "stroke-width": 2.4, "stroke-linecap": "round" }, gA);
    }
    stroke(segs(g, A, false), col);
    if (A === Math.round(A)) stroke(segs(g, A, true), col);

    var p1x = g.ox + g.sx, p1y = g.oy - g.sy;
    el("circle", { cx: p1x, cy: p1y, r: 4.4, fill: CL.ink }, gA);
    tx(gA, p1x + 8, p1y - 6, "(1,1)", CL.ink, "start", 9.2, 700);
    var p2x = g.ox + 2 * g.sx, p2y = g.oy - s.y2 * g.sy;
    if (s.y2 <= g.ymax - .05 && s.y2 >= g.ymin + .05) {
      el("line", { x1: p2x, y1: p2y, x2: g.ox, y2: p2y, stroke: CL.line, "stroke-dasharray": "4 3" }, gA);
      el("line", { x1: p2x, y1: p2y, x2: p2x, y2: g.oy, stroke: CL.line, "stroke-dasharray": "4 3" }, gA);
      el("circle", { cx: p2x, cy: p2y, r: 4.4, fill: col }, gA);
      tx(gA, p2x + 8, p2y - 6, "2^α = " + s.y2.toFixed(2), col, "start", 9.2, 700);
    } else {
      tx(gA, g.p.x + g.p.w - 18, g.top + 6, "x=2 时 2^α=" + s.y2.toFixed(2) + "，已冲出画面", col, "end", 9, 700);
    }

    /* 右侧：三个量一起看 */
    el("rect", { x: g.q.x, y: g.q.y, width: g.q.w, height: g.q.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, g.q.x + 20, g.q.y + 32, "α = " + fmt(A) + " 时三个量一起看", "#5a6472", "start", 10.5, 700);
    var cx = g.q.x + (g.w ? 22 : 16), cw = g.q.w - (g.w ? 44 : 32);
    var cy = g.q.y + 62, ch = g.w ? 84 : 92, gap = g.w ? 100 : 104;
    var rows = [
      ["① 公共点 (1,1)", "必过，与 α 无关", "因为 1^α = 1 恒成立"],
      ["② x=2 处的值 2^α", s.y2.toFixed(2), "α=−1 时只有 0.50"],
      ["③ (0,+∞) 上的单调性", s.mono > 0 ? "递增" : s.mono === 0 ? "常函数" : "递减", s.mono > 0 ? "α>0：越往右越高" : s.mono === 0 ? "y=1（x≠0），不增不减" : "α<0：不过原点，以轴为渐近线"]
    ];
    var r, y0, ax, bwd = g.w ? 130 : 92;
    for (r = 0; r < 3; r++) {
      y0 = cy + r * gap;
      el("rect", { x: cx, y: y0, width: cw, height: ch, rx: 8, fill: "#f8fbfd", stroke: "#e6e9ee" }, gB);
      tx(gB, cx + 14, y0 + 22, rows[r][0], CL.mut, "start", 9.4);
      tx(gB, cx + 14, y0 + 50, rows[r][1], r === 2 ? col : r === 1 ? CL.ink : CL.ok, "start", g.w ? 17 : 14, 700);
      tx(gB, cx + 14, y0 + 70, rows[r][2], "#5a6472", "start", 8.8);
      if (r === 1) {
        el("rect", { x: cx + cw - bwd - 20, y: y0 + 58, width: bwd, height: 7, rx: 3.5, fill: "#eef1f4" }, gB);
        el("rect", { x: cx + cw - bwd - 20, y: y0 + 58, width: Math.max(4, bwd * Math.min(1, s.y2 / 4)), height: 7, rx: 3.5, fill: col }, gB);
      }
      if (r === 2) {
        ax = cx + cw - 26;
        if (s.mono > 0) arrow(gB, ax, y0 + 66, ax, y0 + 36);
        else if (s.mono < 0) arrow(gB, ax, y0 + 36, ax, y0 + 66);
        else el("line", { x1: ax - 14, y1: y0 + 51, x2: ax + 14, y2: y0 + 51, stroke: CL.zero, "stroke-width": 2, "stroke-dasharray": "5 3" }, gB);
      }
    }
    tx(gB, cx, g.q.y + g.q.h - 16, "曲线颜色 = 单调性：蓝增 / 琥珀常 / 红减", CL.mut, "start", 8.8);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = fmt(A);
    $("gxVb").textContent = s.y2.toFixed(2);
    $("gxVc").textContent = "1";
    if (s.mono > 0) { st = "(0,+∞) 递增"; col = CL.pos; bg = "#e8f0fe"; sn = "α>0：越往右越高"; }
    else if (s.mono === 0) { st = "常函数"; col = CL.zero; bg = "#fdf3e0"; sn = "y=1（x≠0），不增不减"; }
    else { st = "(0,+∞) 递减"; col = CL.neg; bg = "#fbeae7"; sn = "α<0：不过原点，以轴为渐近线"; }
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
    mount: stage, follow: $("gxSl"),
    loop: [{ t: 0, v: -2 }, { t: 1.2, v: -2 }, { t: 4, v: -1 }, { t: 6.5, v: 0.5 }, { t: 9, v: 2 }, { t: 11.5, v: 3 }, { t: 13.5, v: -2 }],
    keys: [-2, -1, 0.5, 2],
    value: A, min: -2, max: 3, step: 0.5, idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: -1, eq: { y2: 0.5, mono: -1 } },
    { v: 0.5, eq: { y2: 1.414, mono: 1 } },
    { v: 2, eq: { y2: 4, mono: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
