/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1, G = null;

  /* 纯函数：Δx=h → 数值。render() 与 __model.cases 都用它 */
  function calc(v) {
    var h = v, y1 = 1, y2 = (1 + h) * (1 + h);
    return { h: h, avg: (y2 - y1) / h, f1: 2, gap: (y2 - y1) / h - 2, y2: y2 };
  }

  function geom() {
    var padL = 44, padT = 50, padB = 40;
    return {
      px: L.left.x + padL, py: L.left.y + padT,
      pw: L.left.w - padL - 24, ph: L.left.h - padT - padB,
      xmax: 3.2, ymax: 9.6
    };
  }
  function mx(u) { return G.px + u / G.xmax * G.pw; }
  function my(u) { return G.py + G.ph - u / G.ymax * G.ph; }

  /* 直线 y=y0+m(x−x0) 落在绘图框内的那一段 */
  function clampSeg(m, x0, y0) {
    var cs = [0, G.xmax, x0 + (0 - y0) / m, x0 + (G.ymax - y0) / m], ok = [], i, x, y;
    for (i = 0; i < 4; i++) {
      x = cs[i];
      if (x < 0 || x > G.xmax) continue;
      y = y0 + m * (x - x0);
      if (y < 0 || y > G.ymax) continue;
      ok.push([x, y]);
    }
    if (ok.length < 2) return null;
    ok.sort(function (a, b) { return a[0] - b[0]; });
    return [ok[0], ok[ok.length - 1]];
  }
  function lineSeg(g, m, x0, y0, col, wd, dash) {
    var s = clampSeg(m, x0, y0);
    if (!s) return;
    var at = { x1: mx(s[0][0]), y1: my(s[0][1]), x2: mx(s[1][0]), y2: my(s[1][1]), stroke: col, "stroke-width": wd, "stroke-linecap": "round" };
    if (dash) at["stroke-dasharray"] = dash;
    el("line", at, g);
  }

  function drawLeft(g, s) {
    var lp = L.left, yb = G.py + G.ph, i, u;
    el("rect", { x: lp.x, y: lp.y, width: lp.w, height: lp.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, g);
    tx(g, lp.x + 18, lp.y + 26, "割线与切线：f(x)=x²，x₀=1", "#5a6472", "start", 10.5, 700);

    el("line", { x1: G.px - 8, y1: yb, x2: G.px + G.pw + 12, y2: yb, stroke: "#8a94a0", "stroke-width": 1.1 }, g);
    el("line", { x1: G.px, y1: yb + 8, x2: G.px, y2: G.py - 14, stroke: "#8a94a0", "stroke-width": 1.1 }, g);
    el("path", { d: "M" + (G.px + G.pw + 12) + " " + yb + " L" + (G.px + G.pw) + " " + (yb - 4) + " L" + (G.px + G.pw) + " " + (yb + 4) + " Z", fill: "#8a94a0" }, g);
    el("path", { d: "M" + G.px + " " + (G.py - 14) + " L" + (G.px - 4) + " " + (G.py - 3) + " L" + (G.px + 4) + " " + (G.py - 3) + " Z", fill: "#8a94a0" }, g);
    tx(g, G.px + G.pw + 10, yb + 16, "x", "#5a6472", "end", 9.5, 400);
    tx(g, G.px - 12, G.py - 6, "y", "#5a6472", "middle", 9.5, 400);

    for (i = 1; i <= 3; i++) {
      el("line", { x1: mx(i), y1: yb - 3, x2: mx(i), y2: yb + 3, stroke: "#8a94a0", "stroke-width": 1 }, g);
      tx(g, mx(i), yb + 15, String(i), "#8a94a0", "middle", 8.6, 400);
    }
    for (i = 1; i <= 8; i += 2) tx(g, G.px - 9, my(i) + 3, String(i), "#8a94a0", "end", 8.6, 400);

    /* 抛物线 */
    var d = "";
    for (u = 0; u <= 3.1; u += 0.1) {
      if (u * u > G.ymax) break;
      d += (d ? " L" : "M") + mx(u).toFixed(1) + " " + my(u * u).toFixed(1);
    }
    el("path", { d: d, fill: "none", stroke: "#2563eb", "stroke-width": 1.9 }, g);
    tx(g, mx(2.85), my(8.4), "y=x²", "#2563eb", "middle", 10, 700);

    lineSeg(g, 2, 1, 1, "#2f8a5b", 1.7);                     /* 切线 y=2x−1 */
    lineSeg(g, 2 + s.h, 1, 1, "#b8791f", 1.6, "6 4");         /* 割线 斜率 2+h */

    var x1 = 1 + s.h, y1 = s.y2;
    el("line", { x1: mx(1), y1: my(1), x2: mx(x1), y2: my(1), stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "4 3" }, g);
    el("line", { x1: mx(x1), y1: my(1), x2: mx(x1), y2: my(y1), stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "4 3" }, g);
    tx(g, (mx(1) + mx(x1)) / 2, my(1) + 15, "Δx=h", "#b8402f", "middle", 9, 700);
    tx(g, mx(x1) + 7, (my(1) + my(y1)) / 2 + 3, "Δy", "#b8402f", "start", 9, 400);

    el("circle", { cx: mx(1), cy: my(1), r: 4, fill: "#2f8a5b" }, g);
    el("circle", { cx: mx(x1), cy: my(y1), r: 4, fill: "#b8402f" }, g);

    tx(g, G.px + 10, G.py + 16, "切线 斜率 2（不动）", "#2f8a5b", "start", 9.4, 700);
    tx(g, G.px + 10, G.py + 32, "割线 斜率 " + (2 + s.h).toFixed(1), "#b8791f", "start", 9.4, 700);
    tx(g, G.px + 10, G.py + 48, "h 越小，割线越贴切线", "#5a6472", "start", 9, 400);
  }

  function drawRight(g, s) {
    var rp = L.right, bx = rp.x + 92, bw = rp.w - 190, bh = 24;
    var by1 = rp.y + rp.h * 0.30, by2 = rp.y + rp.h * 0.58;
    var l1 = Math.max(4, Math.min(1, s.avg / 4) * bw), l2 = s.f1 / 4 * bw;

    el("rect", { x: rp.x, y: rp.y, width: rp.w, height: rp.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, g);
    tx(g, rp.x + 18, rp.y + 26, "平均变化率 与 导数 差多少", "#5a6472", "start", 10.5, 700);

    el("line", { x1: bx - 4, y1: by1 - 12, x2: bx - 4, y2: by2 + bh + 12, stroke: "#e6e9ee", "stroke-width": 1 }, g);
    el("rect", { x: bx, y: by1, width: l1, height: bh, rx: 5, fill: "#2563eb" }, g);
    el("rect", { x: bx, y: by2, width: l2, height: bh, rx: 5, fill: "#2f8a5b" }, g);
    tx(g, bx - 10, by1 + 16, "平均变化率", "#2563eb", "end", 9, 700);
    tx(g, bx - 10, by2 + 16, "f′(1)", "#2f8a5b", "end", 9, 700);

    el("line", { x1: bx + l2, y1: by1 - 12, x2: bx + l2, y2: by2 + bh + 12, stroke: "#2f8a5b", "stroke-width": 1.2, "stroke-dasharray": "4 3" }, g);
    tx(g, bx + l1 + 7, by1 + 16, s.avg.toFixed(2), "#2563eb", "start", 9.4, 700);
    tx(g, bx + l2 + 7, by2 + 16, "2.00", "#2f8a5b", "start", 9.4, 700);

    var gy = (by1 + bh + by2) / 2, xa = bx + l2, xb2 = bx + l1;
    if (xb2 - xa > 3) {
      el("line", { x1: xa, y1: gy, x2: xb2, y2: gy, stroke: "#b8402f", "stroke-width": 1.2 }, g);
      el("path", { d: "M" + xa + " " + gy + " L" + (xa + 5) + " " + (gy - 3) + " L" + (xa + 5) + " " + (gy + 3) + " Z", fill: "#b8402f" }, g);
      el("path", { d: "M" + xb2 + " " + gy + " L" + (xb2 - 5) + " " + (gy - 3) + " L" + (xb2 - 5) + " " + (gy + 3) + " Z", fill: "#b8402f" }, g);
    }
    tx(g, (l1 + l2) / 2 + bx, gy - 7, "差 = h = " + s.h.toFixed(1), "#b8402f", "middle", 9.2, 700);

    tx(g, rp.x + 18, by2 + bh + 44, "h=0.1 时蓝条缩到 2.10，贴着绿线 2", "#5a6472", "start", 9.2, 400);
    tx(g, rp.x + 18, by2 + bh + 62, "但 Δx 仍≠0，两个数永远差一个 h", "#b8402f", "start", 9.2, 700);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A);
    gA.textContent = ""; gB.textContent = "";
    drawLeft(gA, s);
    drawRight(gB, s);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = s.h.toFixed(1);
    $("gxVb").textContent = s.avg.toFixed(2);
    $("gxVc").textContent = s.f1.toFixed(2);
    if (s.h <= 0.15) { st = "几乎重合"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "割线≈切线，Δx 仍≠0"; }
    else if (s.h <= 0.6) { st = "正在贴近"; col = "#b8791f"; bg = "#fdf3e0"; sn = "差 h=" + s.h.toFixed(1) + "，越来越小"; }
    else { st = "离切线较远"; col = "#b8402f"; bg = "#fbeae7"; sn = "差 h=" + s.h.toFixed(1) + "，割线偏"; }
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
    loop: [{ t: 0, v: 2 }, { t: 1.2, v: 2 }, { t: 4, v: 1 }, { t: 6.5, v: 0.5 }, { t: 9, v: 0.1 }, { t: 11.5, v: 0.1 }, { t: 13.5, v: 2 }],
    keys: [0.1, 0.5, 1, 2],
    value: A, min: 0.1, max: 2, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { avg: 3, f1: 2, gap: 1 } },
    { v: 0.5, eq: { avg: 2.5, f1: 2, gap: 0.5 } },
    { v: 0.1, eq: { avg: 2.1, f1: 2, gap: 0.1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
