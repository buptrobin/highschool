/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 3, G = null;

  /* 纯函数：参数 t → 距离。render() 和 __model.cases 都用它 */
  function calc(v) {
    var t = Math.round(v * 2) / 2;
    var d = Math.abs(3 + t) / Math.sqrt(3);
    return { d: d, onPlane: Math.abs(3 + t) < 1e-9 ? 1 : 0, s: 3 + t };
  }

  function geom() {
    return { s: L === W ? 1 : 0.72, cx: L.left.x + L.left.w * 0.48, cy: L.left.y + L.left.h * 0.53 };
  }

  /* 3D → 屏幕：x 向右、y 向上、z 向左下（斜二测风格的示意投影） */
  function P3(x, y, z) {
    return { x: G.cx + (44 * x - 30 * z) * G.s, y: G.cy + (26 * z - 16 * x - 40 * y) * G.s };
  }
  function pt(p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }
  function line(g, a, b, col, w, dash) {
    var o = { x1: a.x.toFixed(1), y1: a.y.toFixed(1), x2: b.x.toFixed(1), y2: b.y.toFixed(1), stroke: col, "stroke-width": w };
    if (dash) o["stroke-dasharray"] = dash;
    el("line", o, g);
  }
  function dot(g, p, col, r) { el("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: r || 3, fill: col }, g); }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var t = A, d = Math.abs(3 + t) / Math.sqrt(3), lf = L.left, rt = L.right;

    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lf.x + 16, lf.y + 24, "平面 x+y+z=0 与点 P(1, t, 2)", "#5a6472", "start", 10.5, 700);

    /* 平面 α：x+y+z=0 上的一个平行四边形 */
    var c1 = P3(-2, 2, 0), c2 = P3(2, 0, -2), c3 = P3(2, -2, 0), c4 = P3(-2, 0, 2);
    el("polygon", { points: [c1, c2, c3, c4].map(pt).join(" "), fill: "#eef6fb", stroke: "#9dc3d8" }, gA);
    var tagA = P3(-1.5, 1.5, 0);
    tx(gA, tagA.x - 8, tagA.y + 4, "α", "#5a6472", "middle", 11, 700);

    /* 坐标轴（带箭头与单位刻度） */
    var O = P3(0, 0, 0), axes = [P3(2.6, 0, 0), P3(0, 2.6, 0), P3(0, 0, 2.6)], nms = ["x", "y", "z"], i, k;
    for (i = 0; i < 3; i++) {
      var e = axes[i], vx = e.x - O.x, vy = e.y - O.y, ln = Math.sqrt(vx * vx + vy * vy);
      var ux = vx / ln, uy = vy / ln;
      line(gA, O, e, "#b8c2cc", 1.2);
      el("polygon", { points: pt({ x: e.x + ux * 10 * G.s, y: e.y + uy * 10 * G.s }) + " " + pt({ x: e.x + ux * 7 * G.s - uy * 3.4, y: e.y + uy * 7 * G.s + ux * 3.4 }) + " " + pt({ x: e.x + ux * 7 * G.s + uy * 3.4, y: e.y + uy * 7 * G.s - ux * 3.4 }), fill: "#b8c2cc" }, gA);
      for (k = 1; k <= 2; k++) {
        var q = { x: O.x + vx * k / 2.6, y: O.y + vy * k / 2.6 };
        line(gA, { x: q.x + uy * 2.6, y: q.y - ux * 2.6 }, { x: q.x - uy * 2.6, y: q.y + ux * 2.6 }, "#b8c2cc", 1);
      }
      tx(gA, e.x + ux * 14 * G.s, e.y + uy * 14 * G.s + 3, nms[i], "#9aa6b2", "middle", 10, 400);
    }

    /* 法向量 n 与「点到平面的垂线段」都沿同一方向 */
    var nTip = P3(2.4, 2.4, 2.4);
    line(gA, O, nTip, "#2563eb", 1.8);
    var nu = { x: nTip.x - O.x, y: nTip.y - O.y }, nl = Math.sqrt(nu.x * nu.x + nu.y * nu.y);
    nu = { x: nu.x / nl, y: nu.y / nl };
    el("polygon", { points: pt({ x: nTip.x + nu.x * 9, y: nTip.y + nu.y * 9 }) + " " + pt({ x: nTip.x - nu.y * 4, y: nTip.y + nu.x * 4 }) + " " + pt({ x: nTip.x + nu.y * 4, y: nTip.y - nu.x * 4 }), fill: "#2563eb" }, gA);
    tx(gA, nTip.x + 12, nTip.y - 4, "n", "#2563eb", "start", 11, 700);

    var Pp = P3(1, t, 2), Hp = P3(-t / 3, (2 * t - 3) / 3, (3 - t) / 3);

    /* AP（A 取原点）与 PH */
    line(gA, O, Pp, "#7a8794", 1.2, "4 3");
    line(gA, Pp, Hp, "#b8402f", 2.2);
    dot(gA, O, "#151a21", 3);
    tx(gA, O.x - 12, O.y + 14, "A", "#5a6472", "middle", 10, 400);
    dot(gA, Pp, "#b8402f", 3.2);
    tx(gA, Pp.x + 11, Pp.y - 5, "P", "#b8402f", "start", 10, 700);
    dot(gA, Hp, "#b8402f", 2.8);
    tx(gA, Hp.x + 8, Hp.y + 13, "H", "#b8402f", "start", 10, 400);

    /* 垂足的直角标记 */
    var hu = { x: (Pp.x - Hp.x) / Math.max(1, Math.abs(Pp.y - Hp.y) + 1), y: (Pp.y - Hp.y) / Math.max(1, Math.abs(Pp.y - Hp.y) + 1) };
    var hlen = 9;
    var p1 = { x: Hp.x + hu.x * hlen, y: Hp.y + hu.y * hlen };
    line(gA, p1, { x: p1.x - 8, y: p1.y + 2 }, "#7a8794", 1);
    line(gA, { x: Hp.x - 8, y: Hp.y + 2 }, { x: Hp.x - 8 + hu.x * hlen, y: Hp.y + 2 + hu.y * hlen }, "#7a8794", 1);

    /* d 标注：取 PH 中点，往右下错开 */
    var mid = { x: (Pp.x + Hp.x) / 2 + 9, y: (Pp.y + Hp.y) / 2 };
    tx(gA, mid.x, mid.y, "d", "#b8402f", "start", 11, 700);
    tx(gA, lf.x + 16, lf.y + lf.h - 14, "A 在平面内，PH⊥α，|PH| 就是距离", "#7a8794", "start", 9.4, 400);

    /* 右侧数值面板 */
    el("rect", { x: rt.x, y: rt.y, width: rt.w, height: rt.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    var rx = rt.x + 20;
    tx(gB, rx, rt.y + 30, "数值与判断", "#5a6472", "start", 10.5, 700);
    tx(gB, rx, rt.y + 58, "平面 x+y+z=0，n=(1,1,1)", "#3a3a35", "start", 9.6, 400);
    tx(gB, rx, rt.y + 80, "AP·n = 3+t = " + (3 + t).toFixed(1), "#3a3a35", "start", 9.6, 400);
    tx(gB, rx, rt.y + 102, "|n| = √3 ≈ 1.732", "#3a3a35", "start", 9.6, 400);
    tx(gB, rx, rt.y + 124, "d = |3+t| ÷ |n|", "#3a3a35", "start", 9.6, 400);
    tx(gB, rx, rt.y + 160, "距离 d", "#7a8794", "start", 9.4, 400);
    tx(gB, rx, rt.y + 200, d.toFixed(3), d < 1e-9 ? "#2f8a5b" : "#2563eb", "start", 27, 700);

    /* 距离条：0 → 2√3 */
    var bx = rx, bw = rt.w - 60, by = rt.y + 246, maxD = 2 * Math.sqrt(3);
    el("rect", { x: bx, y: by, width: bw, height: 8, rx: 4, fill: "#eef1f4" }, gB);
    el("rect", { x: bx, y: by, width: Math.max(1, bw * d / maxD).toFixed(1), height: 8, rx: 4, fill: d < 1e-9 ? "#2f8a5b" : "#2563eb" }, gB);
    tx(gB, bx, by + 22, "0", "#9aa6b2", "start", 9, 400);
    tx(gB, bx + bw / 2, by + 22, "√3", "#9aa6b2", "middle", 9, 400);
    tx(gB, bx + bw, by + 22, "2√3", "#9aa6b2", "end", 9, 400);

    if (d < 1e-9) {
      tx(gB, rx, rt.y + 292, "点在平面内：3+t=0", "#2f8a5b", "start", 10, 700);
    } else {
      tx(gB, rx, rt.y + 292, "点在平面外，d 随 t 线性变", "#2563eb", "start", 10, 700);
    }
    tx(gB, rx, rt.y + 318, "t=−3 时 P 落在 α 上，d=0", "#7a8794", "start", 9.2, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var t = A, s = calc(t), d = s.d, onPlane = s.onPlane, st, col, bg, sn;
    $("gxVa").textContent = String(t);
    $("gxVb").textContent = String(3 + t);
    $("gxVc").textContent = d.toFixed(3);
    if (onPlane) { st = "点在平面内"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "3+t=0，P 满足平面方程"; }
    else { st = "点在平面外"; col = "#2563eb"; bg = "#e8f0fd"; sn = "3+t≠0，d 大于 0"; }
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
    loop: [{ t: 0, v: 3 }, { t: 1.2, v: 3 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: -3 }, { t: 11.5, v: -3 }, { t: 13.5, v: 3 }],
    keys: [3, 0, -3],
    value: A, min: -3, max: 3, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = Math.round(v * 2) / 2; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { d: 1.7321 } },
    { v: 3, eq: { d: 3.4641 } },
    { v: -3, eq: { d: 0, onPlane: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
