document.addEventListener("DOMContentLoaded", function () {
"use strict";
var X = window.GX, el = X.el, tx = X.tx, $ = X.$, stage = $("gxStage");
if (!stage || !window.AutoPilot) return;
/* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
var L = W, G = null, A = 0, DMAX = 1000;

/* 纯函数：距离 d(m) → 漂移率(%)，render 与 cases 共用 */
function calc(v) {
  var d = Math.max(0, Math.min(DMAX, v));
  return { d: d, drift: 100 * Math.exp(-d / 200) };
}
function T(p, x, y, s, c, a, f, w) { tx(p, x, y, s, c || "#3a3a35", a || "start", f || 9, w || 400); }
function B(p, x, y, w, h, f, s, r) { el("rect", { x: x, y: y, width: w, height: h, rx: r || 8, fill: f, stroke: s }, p); }

function geom() {
  var lp = L.left, rp = L.right, fy = lp.y + lp.h * 0.19, fh = lp.h * 0.26;
  return { lp: lp, rp: rp, fy: fy, fh: fh, fx: lp.x + lp.w * 0.06, fw: lp.w * 0.26,
    wx0: lp.x + lp.w * 0.44, wx1: lp.x + lp.w * 0.80, ww: lp.w * 0.16,
    arrowY: fy + fh + lp.h * 0.10, y0: fy + fh + lp.h * 0.24,
    ax0: rp.x + rp.w * 0.17, ax1: rp.x + rp.w * 0.94, ay0: rp.y + rp.h * 0.20, ay1: rp.y + rp.h * 0.74 };
}
function px(g, d) { return g.ax0 + (d / DMAX) * (g.ax1 - g.ax0); }
function py(g, r) { return g.ay1 - (r / 100) * (g.ay1 - g.ay0); }

function draw(g, s) {
  var gA = $("gxA"), gB = $("gxB"), lp = g.lp, rp = g.rp, i, d, pts = [];
  var wx = g.wx0 + (A / DMAX) * (g.wx1 - g.wx0);
  var n = Math.max(0, Math.min(9, Math.round(s.drift / 100 * 9)));
  gA.textContent = ""; gB.textContent = "";
  B(gA, lp.x, lp.y, lp.w, lp.h, "#f8fbfd", "#dbe7ef", 10);
  T(gA, lp.x + 20, lp.y + 28, "种植区 ← 距离 d → 野生近缘种", "#5a6472", "start", 10.5, 700);
  B(gA, g.fx, g.fy, g.fw, g.fh, "#f4fbf7", "#cfe9db");
  T(gA, g.fx + g.fw / 2, g.fy + g.fh * 0.40, "转基因作物", "#2f8a5b", "middle", 10, 700);
  T(gA, g.fx + g.fw / 2, g.fy + g.fh * 0.40 + 17, "供体 · 产生花粉", "#6b6b63", "middle", 9);
  B(gA, wx, g.fy, g.ww, g.fh, "#fdf8ee", "#ecd9b8");
  T(gA, wx + g.ww / 2, g.fy + g.fh * 0.40, "野生近缘种", "#b8791f", "middle", 10, 700);
  T(gA, wx + g.ww / 2, g.fy + g.fh * 0.40 + 17, "受体 · 接花粉", "#6b6b63", "middle", 9);
  var bx0 = g.fx + g.fw + 14, gap = wx - 14 - bx0;
  for (i = 0; i < n; i++) el("circle", { cx: bx0 + gap * (i + 0.5) / n, cy: g.fy + g.fh * 0.25 + (i % 3) * g.fh * 0.24, r: 3.2, fill: "#2f8a5b", opacity: 0.75 }, gA);
  if (!n) T(gA, (g.fx + g.fw + wx) / 2, g.fy + g.fh * 0.5, "花粉几乎到不了", "#6b6b63", "middle", 9);
  el("line", { x1: g.fx + g.fw, y1: g.arrowY, x2: wx, y2: g.arrowY, stroke: "#9db4c4", "stroke-width": 1.4, "stroke-dasharray": "4 3" }, gA);
  el("line", { x1: wx, y1: g.arrowY - 6, x2: wx, y2: g.arrowY + 6, stroke: "#9db4c4", "stroke-width": 1.4 }, gA);
  T(gA, (g.fx + g.fw + wx) / 2, g.arrowY + 18, "d = " + Math.round(s.d) + " m", "#1c4f6e", "middle", 10, 700);
  T(gA, lp.x + 20, g.y0, "外源基因漂移率 " + s.drift.toFixed(1) + " %", "#b8402f", "start", 10, 700);

  B(gB, rp.x, rp.y, rp.w, rp.h, "#ffffff", "#e6e9ee", 10);
  T(gB, rp.x + 20, rp.y + 28, "漂移率随距离的指数下降", "#5a6472", "start", 10.5, 700);
  T(gB, g.ax0, rp.y + rp.h * 0.13, "d = " + Math.round(s.d) + " m → " + s.drift.toFixed(1) + " %", "#1c4f6e", "start", 9.6, 700);
  el("path", { d: "M" + g.ax0 + " " + g.ay0 + "L" + g.ax0 + " " + g.ay1 + "L" + g.ax1 + " " + g.ay1, fill: "none", stroke: "#9db4c4", "stroke-width": 1.3 }, gB);
  T(gB, g.ax0 - 8, g.ay0 + 4, "100", "#9aa2ab", "end", 8.6);
  T(gB, g.ax0 - 8, g.ay1 + 3, "0", "#9aa2ab", "end", 8.6);
  for (d = 0; d <= DMAX; d += 40) pts.push(px(g, d).toFixed(1) + "," + py(g, 100 * Math.exp(-d / 200)).toFixed(1));
  el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2f8a5b", "stroke-width": 2.2 }, gB);
  T(gB, g.ax1, g.ay1 + 18, "距离 d / 1000 m", "#9aa2ab", "end", 9);
  T(gB, px(g, 200) + 10, py(g, 36.8) - 8, "36.8%", "#b8791f", "start", 9.2, 700);
  el("circle", { cx: px(g, 200), cy: py(g, 36.8), r: 3.4, fill: "#b8791f" }, gB);
  el("line", { x1: px(g, s.d), y1: py(g, s.drift), x2: px(g, s.d), y2: g.ay1, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0.7 }, gB);
  el("circle", { cx: px(g, s.d), cy: py(g, s.drift), r: 4.4, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2 }, gB);
  T(gB, g.ax1, g.ay1 + 46, "贴轴但不触轴：风险低 ≠ 零", "#b8402f", "end", 9);
}

function render() {
  if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; stage.setAttribute("viewBox", L.vb); G = geom(); }
  var s = calc(A), st, col, bg, sn;
  draw(G, s);
  $("gxVa").textContent = String(Math.round(A));
  $("gxVb").textContent = s.drift.toFixed(1) + " %";
  $("gxVc").textContent = (100 - s.drift).toFixed(1) + " %";
  if (A < 100) { st = "漂移率高"; col = "#b8402f"; bg = "#fbeae7"; sn = "距离太近，风险大"; }
  else if (A <= 400) { st = "明显下降"; col = "#b8791f"; bg = "#fdf3e0"; sn = "但仍有可观漂移"; }
  else { st = "风险很低"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "但漂移率不为 0"; }
  $("gxVs").textContent = st; $("gxVsn").textContent = sn;
  $("gxStBox").style.background = bg;
  $("gxStBox").style.borderColor = col + "44";
  $("gxVs").style.color = col;
}
function layout() { G = null; render(); }

var apBadge = $("gxAp"), apTxt = $("gxApTxt");
function setMode(m) {
  if (!apBadge) return;
  apBadge.classList.toggle("is-auto", m === "auto");
  apBadge.classList.toggle("is-manual", m !== "auto");
  if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
}

window.__ap = AutoPilot.create({
  mount: stage, follow: $("gxSl"),
  loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 200 }, { t: 6.5, v: 200 }, { t: 9, v: 1000 }, { t: 11, v: 600 }, { t: 13, v: 0 }],
  keys: [0, 200, 600, 1000], value: A, min: 0, max: DMAX, step: 20, idle: 5000,
  onChange: function (v) { A = v; render(); }, onMode: setMode
});
window.__bio = { calc: calc, cases: [
  { v: 0, eq: { drift: 100 } }, { v: 200, eq: { drift: 36.8 } }, { v: 600, eq: { drift: 5 } }
] };
window.__model = window.__bio;

var steps = document.querySelectorAll("#gxSteps .step"), si = 0;
var cnt = $("gxCnt"), ans = $("gxAns"), next = $("gxNext");
function sync() {
  if (cnt) cnt.textContent = (si + 1) + " / " + steps.length;
  if (si >= steps.length - 1) {
    if (ans) ans.hidden = false;
    if (next) { next.disabled = true; next.textContent = "已是最后一步"; }
  }
}
if (next) next.addEventListener("click", function () {
  if (si < steps.length - 1) { si += 1; steps[si].hidden = false; sync(); }
});
sync();

var tmr = null;
window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
layout();
});
