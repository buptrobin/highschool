/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", lp: { x: 16, y: 16, w: 424, h: 438 }, rp: { x: 456, y: 16, w: 408, h: 438 }, plot: { x0: 56, x1: 404, yt: 56, yb: 396 } };
  var N = { vb: "0 0 360 700", lp: { x: 8, y: 8, w: 344, h: 300 }, rp: { x: 8, y: 320, w: 344, h: 372 }, plot: { x0: 30, x1: 330, yt: 52, yb: 268 } };
  var L = null, G = null, A = 0.5;

  /* 纯函数：底数 a → 三个数 + 单调性。render() 和 __model.cases 都用它 */
  function calc(v) {
    var a = Math.round(v * 10) / 10;
    return { a: a, y1: a, y0: 1, yn: 1 / a, mono: Math.abs(a - 1) < 0.05 ? 0 : (a > 1 ? 1 : -1) };
  }

  function geom() {
    var p = L.plot, xmin = -2.6, xmax = 3.4, ymin = -0.8, ymax = 6.8;
    var sx = (p.x1 - p.x0) / (xmax - xmin), sy = (p.yb - p.yt) / (ymax - ymin);
    return { sy: sy, sx: sx, ox: p.x0 - xmin * sx, oy: p.yb + ymin * sy, xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
  }
  function px(x) { return G.ox + x * G.sx; }
  function py(y) { return G.oy - y * G.sy; }
  function T(g, x, y, s, col, an, fs, w) { tx(g, x, y, s, col, an || "start", fs || 9.4, w || 400); }
  function fmt(v) { return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2); }

  /* 曲线：按 y=a^x 采样，超出纵向窗口就断开，不画到坐标轴外 */
  function curve(a, g, col, w) {
    var d = "", pen = false, i, x, y;
    for (i = 0; i <= 170; i++) {
      x = G.xmin + (G.xmax - G.xmin) * i / 170;
      y = Math.pow(a, x);
      if (!isFinite(y) || y < G.ymin || y > G.ymax) { pen = false; continue; }
      d += (pen ? " L" : " M") + px(x).toFixed(1) + "," + py(y).toFixed(1);
      pen = true;
    }
    el("path", { d: d, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round" }, g);
  }

  function drawGraph(s) {
    var g = $("gxA"); g.textContent = "";
    var lp = L.lp, ax = py(0), de = s.mono === 0;
    el("rect", { x: lp.x, y: lp.y, width: lp.w, height: lp.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, g);
    T(g, lp.x + 20, lp.y + 24, "y = a^x 的图象", "#5a6472", "start", 10.5, 700);
    /* 横轴与箭头 */
    el("path", { d: "M" + L.plot.x0 + "," + ax + " L" + (L.plot.x1 - 10) + "," + ax, stroke: "#8a94a3", "stroke-width": 1.3, fill: "none" }, g);
    el("path", { d: "M" + L.plot.x1 + "," + ax + " L" + (L.plot.x1 - 13) + "," + (ax - 5) + " L" + (L.plot.x1 - 13) + "," + (ax + 5) + " Z", fill: "#8a94a3" }, g);
    /* 纵轴与箭头 */
    el("path", { d: "M" + px(0) + "," + (ax + 12) + " L" + px(0) + "," + (py(G.ymax) + 12), stroke: "#8a94a3", "stroke-width": 1.3, fill: "none" }, g);
    el("path", { d: "M" + px(0) + "," + py(G.ymax) + " L" + (px(0) - 5) + "," + (py(G.ymax) + 13) + " L" + (px(0) + 5) + "," + (py(G.ymax) + 13) + " Z", fill: "#8a94a3" }, g);
    T(g, L.plot.x1 + 2, ax + 15, "x", "#5a6472", "start", 9.6, 400);
    T(g, px(0) + 7, py(G.ymax) + 4, "y", "#5a6472", "start", 9.6, 400);
    /* 刻度 */
    var i, v, X, Y;
    for (i = -2; i <= 3; i++) {
      if (i === 0) continue;
      X = px(i);
      el("path", { d: "M" + X + "," + (ax - 3) + " L" + X + "," + (ax + 3), stroke: "#8a94a3", "stroke-width": 1.1 }, g);
      T(g, X, ax + 15, i < 0 ? "−" + (-i) : String(i), "#5a6472", "middle", 8.8, 400);
    }
    for (i = 1; i <= 6; i++) {
      Y = py(i);
      el("path", { d: "M" + (px(0) - 3) + "," + Y + " L" + (px(0) + 3) + "," + Y, stroke: "#8a94a3", "stroke-width": 1.1 }, g);
      T(g, px(0) - 7, Y + 3, String(i), "#5a6472", "end", 8.8, 400);
    }
    T(g, px(0) - 8, ax + 15, "O", "#5a6472", "end", 9, 400);
    /* y=1 参照线 */
    el("path", { d: "M" + L.plot.x0 + "," + py(1) + " L" + L.plot.x1 + "," + py(1), stroke: "#cbd5e1", "stroke-width": 1, "stroke-dasharray": "3 4" }, g);
    T(g, L.plot.x1 - 2, py(1) - 5, "y=1", "#a9b4c2", "end", 8.4, 400);
    curve(s.a, g, de ? "#b8402f" : "#2563eb", 2.3);
    /* 定点 (0,1) */
    var fx = px(0), fy = py(1);
    el("circle", { cx: fx, cy: fy, r: 4.4, fill: "#151a21", stroke: "#ffffff", "stroke-width": 1.4 }, g);
    T(g, fx + 9, fy - 7, "(0,1)", "#151a21", "start", 9.4, 700);
    T(g, L.plot.x1 - 2, lp.y + 42, "a = " + s.a.toFixed(1), de ? "#b8402f" : "#2563eb", "end", 10, 700);
    if (de) T(g, L.plot.x0 + 4, py(0) - 10, "y=1 是水平线，a=1 不是指数函数", "#b8402f", "start", 8.6, 700);
  }

  function drawRight(s) {
    var g = $("gxB"); g.textContent = "";
    var r = L.rp, cx = r.x + 20, t = r.y + 30, cw = (r.w - 70) / 5, k, i, v;
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, g);
    T(g, cx, t, "y=a^x 上取五个点", "#151a21", "start", 10.4, 700);
    for (i = 0; i < 5; i++) {
      k = cx + 30 + i * cw;
      T(g, k, t + 28, i - 2 < 0 ? "−" + (2 - i) : String(i - 2), "#5a6472", "middle", 9, 400);
      T(g, k, t + 54, fmt(Math.pow(s.a, i - 2)), i === 2 ? "#b8402f" : "#2563eb", "middle", 9.2, i === 2 ? 700 : 400);
    }
    T(g, cx, t + 28, "x", "#5a6472", "start", 9, 700);
    T(g, cx, t + 54, "y", "#5a6472", "start", 9, 700);
    el("path", { d: "M" + cx + "," + (t + 70) + " L" + (r.x + r.w - 20) + "," + (t + 70), stroke: "#eef1f5", "stroke-width": 1 }, g);
    T(g, cx, t + 92, "a^0 = 1 恒成立，与 a 取几无关：", "#3a3a35", "start", 9.2, 400);
    T(g, cx, t + 108, "所以图象都过 (0,1)，不是 (1,0)。", "#3a3a35", "start", 9.2, 700);
    var col = s.mono > 0 ? "#2f8a5b" : s.mono === 0 ? "#b8402f" : "#b8791f";
    var bg = s.mono > 0 ? "#e6f6ee" : s.mono === 0 ? "#fbeae7" : "#fdf3e0";
    el("rect", { x: cx, y: t + 122, width: r.w - 40, height: 62, rx: 9, fill: bg, stroke: col + "55" }, g);
    T(g, cx + 12, t + 146, "a^1 = " + fmt(s.y1), col, "start", 10, 700);
    T(g, cx + 12, t + 166, "a^(−1) = 1/a = " + fmt(s.yn), col, "start", 10, 700);
    var rows = [
      ["a>1　递增，图象上升", s.mono > 0, "#2f8a5b"],
      ["a=1　常函数 y=1，不是指数函数", s.mono === 0, "#b8402f"],
      ["0<a<1　递减，图象下降", s.mono < 0, "#b8791f"]
    ];
    for (i = 0; i < 3; i++) {
      v = t + 206 + i * 24;
      if (rows[i][1]) el("rect", { x: cx - 6, y: v - 13, width: r.w - 28, height: 20, rx: 6, fill: rows[i][2] + "1a" }, g);
      T(g, cx, v, rows[i][0], rows[i][1] ? rows[i][2] : "#8a94a3", "start", 9.2, rows[i][1] ? 700 : 400);
    }
    T(g, cx, t + 282, "底数越远离 1，曲线越陡。", "#6b7280", "start", 8.8, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    if (s.mono > 0) { st = "递增 ↗"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "a>1，图象上升"; }
    else if (s.mono === 0) { st = "不是指数函数"; col = "#b8402f"; bg = "#fbeae7"; sn = "a=1，y=1 是常函数"; }
    else { st = "递减 ↘"; col = "#b8791f"; bg = "#fdf3e0"; sn = "0<a<1，图象下降"; }
    $("gxVa").textContent = s.a.toFixed(1);
    $("gxVb").textContent = fmt(s.y1);
    $("gxVc").textContent = fmt(s.yn);
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    drawGraph(s); drawRight(s);
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
    loop: [{ t: 0, v: 0.5 }, { t: 1.0, v: 0.5 }, { t: 3.6, v: 2 }, { t: 6.1, v: 2 }, { t: 8.3, v: 1 }, { t: 10.5, v: 1 }, { t: 12.3, v: 3 }, { t: 13.8, v: 0.5 }],
    keys: [0.5, 1, 2, 3],
    value: A, min: 0.1, max: 3, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0.5, eq: { y1: 0.5, yn: 2 } },
    { v: 1, eq: { y1: 1, yn: 1 } },
    { v: 2, eq: { y1: 2, yn: 0.5 } },
    { v: 3, eq: { y1: 3, yn: 0.333 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
