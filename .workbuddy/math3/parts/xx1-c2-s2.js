/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, B = -4;

  /* 纯函数：纵截距 b → 两个截距与所过象限。render() 和 __model.cases 都用它 */
  function calc(v) {
    var b = Math.round(v);
    var x0 = -b / 2;
    var quad = b > 0 ? "123" : (b === 0 ? "13" : "134");
    return { b: b, x0: x0, y0: b, quad: quad };
  }

  function fmt(v) {
    var s = Math.abs(v).toFixed(2);
    if (s.indexOf(".") >= 0) { s = s.replace(/0+$/, "").replace(/\.$/, ""); }
    return (v < 0 ? "−" : "") + s;
  }

  function geom() {
    var l = L.left;
    return { cx: l.x + l.w / 2, cy: l.y + l.h / 2, sx: (l.w - 52) / 9, sy: (l.h - 46) / 10 };
  }
  function px(x) { return G.cx + x * G.sx; }
  function py(y) { return G.cy - y * G.sy; }

  /* 只取落在视窗内的一段（y = 2x + b 很陡，必须裁到 ±5） */
  function seg(b) {
    var first = null, last = null, x, y;
    for (x = -4.6; x <= 4.6; x += 0.02) {
      y = 2 * x + b;
      if (Math.abs(y) <= 5) { if (first === null) first = x; last = x; }
    }
    if (first === null) return null;
    return [px(first), py(2 * first + b), px(last), py(2 * last + b)];
  }

  function roundRect(g, x, y, w, h, r, fill, stroke) {
    el("rect", { x: x, y: y, width: w, height: h, rx: r, fill: fill, stroke: stroke }, g);
  }

  function drawLeft(g, s) {
    var l = L.left, i, k = Math.min(1, (l.w - 40) / 384);
    roundRect(g, l.x, l.y, l.w, l.h, 10, "#f8fbfd", "#dbe7ef");
    tx(g, l.x + 18, l.y + 26, "y = 2x + b 的图像", "#5a6472", "start", 10.5 * k, 700);
    tx(g, l.x + 18, l.y + 44, "当前 b = " + fmt(s.b), "#94a1ae", "start", 9.6 * k, 400);

    var defs = el("defs", {}, g);
    var mk = el("marker", { id: "gxax", markerWidth: 9, markerHeight: 9, refX: 7, refY: 3.2, orient: "auto" }, defs);
    el("path", { d: "M0,0 L7,3.2 L0,6.4 Z", fill: "#98a4b0" }, mk);

    tx(g, px(2.4), py(3.5), "Ⅰ", "#d4dde5", "middle", 14, 700);
    tx(g, px(-2.5), py(3.5), "Ⅱ", "#d4dde5", "middle", 14, 700);
    tx(g, px(-2.5), py(-3.5), "Ⅲ", "#d4dde5", "middle", 14, 700);
    tx(g, px(2.4), py(-3.5), "Ⅳ", "#d4dde5", "middle", 14, 700);

    el("line", { x1: l.x + 18, y1: G.cy, x2: l.x + l.w - 14, y2: G.cy, stroke: "#98a4b0", "stroke-width": 1.2, "marker-end": "url(#gxax)" }, g);
    el("line", { x1: G.cx, y1: l.y + l.h - 10, x2: G.cx, y2: l.y + 16, stroke: "#98a4b0", "stroke-width": 1.2, "marker-end": "url(#gxax)" }, g);
    tx(g, l.x + l.w - 14, G.cy + 16, "x", "#98a4b0", "middle", 10, 400);
    tx(g, G.cx + 12, l.y + 20, "y", "#98a4b0", "start", 10, 400);

    for (i = -4; i <= 4; i++) {
      if (i === 0) continue;
      el("line", { x1: px(i), y1: G.cy - 4, x2: px(i), y2: G.cy + 4, stroke: "#c3ccd6", "stroke-width": 1 }, g);
      el("line", { x1: G.cx - 4, y1: py(i), x2: G.cx + 4, y2: py(i), stroke: "#c3ccd6", "stroke-width": 1 }, g);
      tx(g, px(i), G.cy + 16, fmt(i), "#94a1ae", "middle", 8.2, 400);
      tx(g, G.cx - 9, py(i) + 3, fmt(i), "#94a1ae", "end", 8.2, 400);
    }
    tx(g, G.cx - 8, G.cy + 15, "O", "#8a95a1", "end", 9, 400);

    var sg = seg(s.b);
    if (sg) el("line", { x1: sg[0], y1: sg[1], x2: sg[2], y2: sg[3], stroke: "#2563eb", "stroke-width": 2.4, "stroke-linecap": "round" }, g);

    if (s.b === 0) {
      el("circle", { cx: G.cx, cy: G.cy, r: 9, fill: "none", stroke: "#b8791f", "stroke-width": 1.4, "stroke-dasharray": "4 3" }, g);
      el("circle", { cx: G.cx, cy: G.cy, r: 3.4, fill: "#b8791f" }, g);
      tx(g, G.cx + 16, G.cy + 36, "过原点：两个截距都是 0", "#b8791f", "start", 9.2, 700);
      tx(g, G.cx + 16, G.cy + 51, "截距式 x/a + y/b = 1 失效", "#b8791f", "start", 9, 400);
    } else {
      el("circle", { cx: px(0), cy: py(s.y0), r: 4, fill: "#2f8a5b" }, g);
      el("circle", { cx: px(s.x0), cy: G.cy, r: 4, fill: "#b8791f" }, g);
      var lx = px(0) + 10, ly = py(s.y0) + (s.b > 0 ? 16 : -9);
      tx(g, lx, ly, "(0, " + fmt(s.b) + ")", "#2f8a5b", "start", 9.2, 700);
      tx(g, px(s.x0), G.cy + 34, "(" + fmt(s.x0) + ", 0)", "#b8791f", "middle", 9.2, 700);
      el("line", { x1: px(s.x0), y1: G.cy + 5, x2: px(s.x0), y2: G.cy + 25, stroke: "#b8791f", "stroke-width": 0.8, "stroke-dasharray": "3 2" }, g);
    }
  }

  function drawRight(g, s) {
    var R = L.right, rx = R.x + 20, iw = R.w - 40, k = Math.min(1, iw / 344);
    var y1 = R.y + 26, y2 = y1 + 30, y3 = y2 + 14, y4 = y3 + 22, y5 = y4 + 22,
        y6 = y5 + 28, y7 = y6 + 22, y8 = y7 + 12, y9 = y8 + 20, y10 = y9 + 28,
        y11 = y10 + 14, y12 = y11 + 20, y13 = y12 + 21, y14 = y13 + 34;
    var col = s.b > 0 ? "#2f8a5b" : (s.b === 0 ? "#b8791f" : "#2563eb");

    roundRect(g, R.x, R.y, R.w, R.h, 10, "#ffffff", "#e6e9ee");
    tx(g, rx, y1, "当前方程", "#94a1ae", "start", 9.8 * k, 400);
    tx(g, rx, y2, "y = 2x" + (s.b === 0 ? "" : (s.b > 0 ? " + " + s.b : " − " + Math.abs(s.b))), "#151a21", "start", 19 * k, 700);
    el("line", { x1: rx, y1: y3, x2: rx + iw, y2: y3, stroke: "#eef2f6", "stroke-width": 1 }, g);

    tx(g, rx, y4, "与 y 轴交点 (0, b)", "#5a6472", "start", 9.6 * k, 400);
    tx(g, rx, y5, "(0, " + fmt(s.y0) + ")", "#2f8a5b", "start", 13 * k, 700);
    tx(g, rx, y6, "与 x 轴交点 (−b/2, 0)", "#5a6472", "start", 9.6 * k, 400);
    tx(g, rx, y7, "(" + fmt(s.x0) + ", 0)", "#b8791f", "start", 13 * k, 700);

    el("line", { x1: rx, y1: y8, x2: rx + iw, y2: y8, stroke: "#eef2f6", "stroke-width": 1 }, g);
    tx(g, rx, y9, "这条直线经过哪些象限", "#5a6472", "start", 9.6 * k, 400);
    tx(g, rx, y10, s.b > 0 ? "第一、二、三象限" : (s.b === 0 ? "过原点（只在第一、三象限）" : "第一、三、四象限"), col, "start", 14 * k, 700);

    el("line", { x1: rx, y1: y11, x2: rx + iw, y2: y11, stroke: "#eef2f6", "stroke-width": 1 }, g);
    tx(g, rx, y12, "截距式 x/a + y/b = 1", "#5a6472", "start", 9.4 * k, 400);
    tx(g, rx, y13, s.b === 0 ? "✗ 不能用：b = 0，分母为 0" : "✓ 能用：两个截距都不为 0", s.b === 0 ? "#b8402f" : "#2f8a5b", "start", 9.6 * k, 700);

    tx(g, rx, y14 - 16, "b 从 −4 走到 4（0 是临界格）", "#94a1ae", "start", 9 * k, 400);
    var step = iw / 8, i, bx;
    el("line", { x1: rx, y1: y14, x2: rx + iw, y2: y14, stroke: "#c3ccd6", "stroke-width": 1.2 }, g);
    for (i = 0; i <= 8; i++) {
      bx = rx + i * step;
      el("line", { x1: bx, y1: y14 - 4, x2: bx, y2: y14 + 4, stroke: i === 4 ? "#b8402f" : "#c3ccd6", "stroke-width": i === 4 ? 1.8 : 1 }, g);
      tx(g, bx, y14 + 16, fmt(i - 4), i === 4 ? "#b8402f" : "#94a1ae", "middle", 8.4 * k, 400);
    }
    el("circle", { cx: rx + (s.b + 4) * step, cy: y14, r: 5, fill: col, stroke: "#ffffff", "stroke-width": 1.4 }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(B);
    drawLeft(gA, s);
    drawRight(gB, s);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(B), col, bg;
    if (s.b > 0) { col = "#2f8a5b"; bg = "#e6f6ee"; }
    else if (s.b === 0) { col = "#b8791f"; bg = "#fdf3e0"; }
    else { col = "#2563eb"; bg = "#eaf1fd"; }
    $("gxVa").textContent = fmt(s.b);
    $("gxVb").textContent = fmt(s.x0);
    $("gxVc").textContent = fmt(s.y0);
    $("gxVs").textContent = s.b > 0 ? "过 1、2、3 象限" : (s.b === 0 ? "过原点" : "过 1、3、4 象限");
    $("gxVsn").textContent = s.b > 0 ? "b > 0，交 y 轴正半轴" : (s.b === 0 ? "b = 0，截距式失效" : "b < 0，交 y 轴负半轴");
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
    loop: [{ t: 0, v: -4 }, { t: 1.2, v: -4 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: 4 }, { t: 11.5, v: 2 }, { t: 13.5, v: -4 }],
    keys: [-4, 0, 2, 4],
    value: B, min: -4, max: 4, step: 1,
    idle: 5000,
    onChange: function (v) { B = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: -2, eq: { x0: 1, y0: -2 } },
    { v: 0, eq: { x0: 0, y0: 0 } },
    { v: 4, eq: { x0: -2, y0: 4 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
