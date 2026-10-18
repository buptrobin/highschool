/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 430, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 }, cx: 231, cy: 240, r: 148 };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 }, cx: 172, cy: 170, r: 112 };
  var L = W, A = 0, G = null;
  function geom() { return L; }

  /* 纯函数：角 α（度）→ 三个函数值与象限。render() 和 __model.cases 共用 */
  function calc(v) {
    var a = ((v % 360) + 360) % 360;
    var rad = a * Math.PI / 180;
    var sn = Math.sin(rad), cs = Math.cos(rad);
    if (Math.abs(sn) < 1e-9) sn = 0;
    if (Math.abs(cs) < 1e-9) cs = 0;
    return { a: a, sin: sn, cos: cs, tan: cs === 0 ? null : sn / cs, q: Math.floor(a / 90) + 1 };
  }

  function pt(cx, cy, r, deg) {
    var t = deg * Math.PI / 180;
    return [cx + r * Math.cos(t), cy - r * Math.sin(t)];
  }

  /* y 轴朝下：数学上的逆时针 = sweep-flag 0 */
  function arcPath(cx, cy, r, deg) {
    if (deg < 1) return "";
    var p0 = pt(cx, cy, r, 0), p1 = pt(cx, cy, r, deg), big = deg > 180 ? 1 : 0;
    return "M " + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " A " + r + " " + r + " 0 " + big + " 0 " + p1[0].toFixed(1) + " " + p1[1].toFixed(1);
  }

  function arrow(g, x1, y1, x2, y2, col, w) {
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": w || 1.2 }, g);
    var t = Math.atan2(y2 - y1, x2 - x1), h = 8, k = 0.42;
    var a1 = x2 - h * Math.cos(t - k), b1 = y2 - h * Math.sin(t - k);
    var a2 = x2 - h * Math.cos(t + k), b2 = y2 - h * Math.sin(t + k);
    el("polygon", { points: x2 + "," + y2 + " " + a1.toFixed(1) + "," + b1.toFixed(1) + " " + a2.toFixed(1) + "," + b2.toFixed(1), fill: col }, g);
  }

  function num(x) { return (Math.abs(x) < 5e-4 ? 0 : x).toFixed(2); }
  function sgn(x) { return Math.abs(x) < 5e-4 ? "0" : (x > 0 ? "+" : "−"); }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), p = L.left, q = L.right;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, p.x + 20, p.y + 28, "单位圆 · α 的终边与圆交于 P", "#5a6472", "start", 10.5, 700);

    var cx = L.cx, cy = L.cy, R = L.r;
    el("circle", { cx: cx, cy: cy, r: R, fill: "#ffffff", stroke: "#b8c9d8" }, gA);
    arrow(gA, cx - R - 26, cy, cx + R + 26, cy, "#5a6472");
    arrow(gA, cx, cy + R + 26, cx, cy - R - 26, "#5a6472");
    tx(gA, cx + R + 30, cy + 4, "x", "#5a6472", "start", 10, 400);
    tx(gA, cx + 7, cy - R - 28, "y", "#5a6472", "start", 10, 400);
    tx(gA, cx + 5, cy + 14, "O", "#8a94a3", "start", 9.5, 400);

    var qs = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ"], cs = ["#2f8a5b", "#b8791f", "#5b4a9e", "#2563eb"];
    for (var i = 0; i < 4; i++) {
      var pos = pt(cx, cy, R * 0.54, 45 + i * 90), on = (s.q === i + 1);
      tx(gA, pos[0], pos[1] + 4, qs[i], on ? cs[i] : "#b0bac6", "middle", on ? 13 : 11, on ? 700 : 400);
    }

    var P = pt(cx, cy, R, s.a);
    var d = arcPath(cx, cy, R * 0.3, s.a);
    if (d) el("path", { d: d, fill: "none", stroke: "#b8791f", "stroke-width": 1.5 }, gA);
    var la = pt(cx, cy, R * 0.42, Math.max(12, s.a / 2));
    tx(gA, la[0], la[1] + 4, "α", "#b8791f", "middle", 11, 700);

    el("line", { x1: P[0], y1: P[1], x2: P[0], y2: cy, stroke: "#8a94a3", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    el("line", { x1: cx, y1: P[1], x2: P[0], y2: P[1], stroke: "#8a94a3", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    arrow(gA, cx, cy, P[0], P[1], "#2563eb", 1.7);
    el("circle", { cx: P[0], cy: P[1], r: 3.6, fill: "#2563eb" }, gA);
    tx(gA, P[0] + (s.cos >= 0 ? 9 : -9), P[1] - 7, "P", "#2563eb", s.cos >= 0 ? "start" : "end", 11.5, 700);
    if (Math.abs(s.cos) > 0.12) tx(gA, cx + (P[0] - cx) / 2, cy + 16, "x=" + num(s.cos), "#2f8a5b", "middle", 9.5, 400);
    if (Math.abs(s.sin) > 0.12) tx(gA, P[0] + (s.cos >= 0 ? 8 : -8), (P[1] + cy) / 2, "y=" + num(s.sin), "#b8791f", s.cos >= 0 ? "start" : "end", 9.5, 400);

    el("rect", { x: q.x, y: q.y, width: q.w, height: q.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, q.x + 20, q.y + 30, "函数值与符号", "#5a6472", "start", 10.5, 700);
    var top = q.y + 52, gap = 8, ch = (q.h - 150) / 3;
    var rows = [
      ["sinα", s.sin, "= y（纵坐标）", "#2f8a5b", "#eaf6ef", "#bfe3cd"],
      ["cosα", s.cos, "= x（横坐标）", "#2563eb", "#e8f0fd", "#c7d9f7"],
      ["tanα", s.tan, "= y/x（x ≠ 0）", "#b8791f", "#fdf3e0", "#eede9f"]
    ];
    for (var j = 0; j < 3; j++) {
      var y = top + j * (ch + gap), r0 = rows[j], bad = (r0[1] === null);
      el("rect", { x: q.x + 16, y: y, width: q.w - 32, height: ch, rx: 8, fill: bad ? "#fbeae7" : r0[4], stroke: bad ? "#efc4bd" : r0[5] }, gB);
      tx(gB, q.x + 32, y + 24, r0[0], r0[3], "start", 11.5, 700);
      tx(gB, q.x + q.w - 32, y + 22, r0[2], "#8a94a3", "end", 9.4, 400);
      if (bad) {
        tx(gB, q.x + 32, y + ch - 14, "无意义", "#b8402f", "start", 17, 700);
        tx(gB, q.x + q.w - 32, y + ch - 14, "x = 0", "#b8402f", "end", 12, 700);
      } else {
        tx(gB, q.x + 32, y + ch - 14, num(r0[1]), r0[3], "start", 18, 700);
        tx(gB, q.x + q.w - 32, y + ch - 14, sgn(r0[1]), r0[3], "end", 15, 700);
      }
    }
    tx(gB, q.x + 20, q.y + q.h - 42, "一全正 · 二正弦 · 三正切 · 四余弦", "#8a94a3", "start", 9.6, 400);
    tx(gB, q.x + 20, q.y + q.h - 24, "α = " + Math.round(A) + "°，终边在第 " + s.q + " 象限", "#5a6472", "start", 9.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = Math.round(A) + "°";
    $("gxVb").textContent = num(s.sin);
    $("gxVc").textContent = num(s.cos);
    if (s.cos === 0) { st = "tan 无意义"; col = "#b8402f"; bg = "#fbeae7"; sn = "x = 0，tanα 分母为零"; }
    else if (s.q === 1) { st = "全正"; col = "#2f8a5b"; bg = "#eaf6ef"; sn = "sin + cos + tan +"; }
    else if (s.q === 2) { st = "正弦正"; col = "#b8791f"; bg = "#fdf3e0"; sn = "只有 sin 正，cos、tan 都负"; }
    else if (s.q === 3) { st = "正切正"; col = "#2563eb"; bg = "#e8f0fd"; sn = "只有 tan 正，sin、cos 都负"; }
    else { st = "余弦正"; col = "#b8791f"; bg = "#fdf3e0"; sn = "只有 cos 正，sin、tan 都负"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 90 }, { t: 6.5, v: 90 }, { t: 9, v: 180 }, { t: 11.5, v: 270 }, { t: 13.5, v: 0 }],
    keys: [0, 90, 180, 270],
    value: A, min: 0, max: 360, step: 15,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 30, eq: { sin: 0.5, cos: 0.866, tan: 0.577 } },
    { v: 120, eq: { sin: 0.866, cos: -0.5, tan: -1.732 } },
    { v: 210, eq: { sin: -0.5, cos: -0.866, tan: 0.577 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
