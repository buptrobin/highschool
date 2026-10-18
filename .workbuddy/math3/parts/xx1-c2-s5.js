/* 互动：滑块 d = 圆心到直线的距离，r = 5 固定 */
document.addEventListener("DOMContentLoaded", function () {
"use strict";
var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
var stage = $("gxStage");
if (!stage || !window.AutoPilot) return;

var R = 5;
var W = { vb: "0 0 880 470", mobile: false, left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
var N = { vb: "0 0 360 700", mobile: true, left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
var L = W, A = 3, G = null;

/* 纯函数：d → 弦长、半弦、状态（0 相交 / 1 相切 / 2 相离） */
function calc(v) {
var d = Math.round(v * 2) / 2, inside = d <= R + 1e-9;
var half = inside ? Math.sqrt(Math.max(0, R * R - d * d)) : 0;
var state = d < R - 1e-9 ? 0 : (d < R + 1e-9 ? 1 : 2);
return { d: d, half: half, chord: 2 * half, state: state };
}

function geom() {
var g = {};
g.cx = L.left.x + L.left.w / 2;
g.cy = L.left.y + (L.mobile ? 152 : 206);
g.sc = L.mobile ? 14 : 18;
g.r = R * g.sc;
g.x0 = L.right.x + (L.mobile ? 46 : 58);
g.x1 = L.right.x + L.right.w - 26;
g.y0 = L.right.y + (L.mobile ? 246 : 330);
g.y1 = L.right.y + (L.mobile ? 62 : 76);
return g;
}

function draw(s) {
var gA = $("gxA"), gB = $("gxB");
gA.textContent = ""; gB.textContent = "";
var x0 = G.x0, x1 = G.x1, y0 = G.y0, y1 = G.y1, ly = G.cy + s.d * G.sc, i, k, xv, yv, lv, dd;

/* 左：圆、直线、弦、垂线段 */
el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
tx(gA, L.left.x + 18, L.left.y + (L.mobile ? 24 : 30), "圆 O：r = 5，直线到 O 的距离 d", "#5a6472", "start", 10.5, 700);
el("circle", { cx: G.cx, cy: G.cy, r: G.r, fill: "#eef5ff", stroke: "#2563eb", "stroke-width": 1.8 }, gA);
el("line", { x1: L.left.x + 22, y1: ly, x2: L.left.x + L.left.w - 22, y2: ly, stroke: "#5a6472", "stroke-width": 1.6 }, gA);
if (s.state === 0) {
var hw = s.half * G.sc;
el("line", { x1: G.cx - hw, y1: ly, x2: G.cx + hw, y2: ly, stroke: "#2563eb", "stroke-width": 4.5, "stroke-linecap": "round" }, gA);
el("circle", { cx: G.cx - hw, cy: ly, r: 3.4, fill: "#ffffff", stroke: "#2563eb", "stroke-width": 2 }, gA);
el("circle", { cx: G.cx + hw, cy: ly, r: 3.4, fill: "#ffffff", stroke: "#2563eb", "stroke-width": 2 }, gA);
tx(gA, G.cx - hw - 6, ly - 10, "A", "#2563eb", "end", 10, 700);
tx(gA, G.cx + hw + 6, ly - 10, "B", "#2563eb", "start", 10, 700);
el("line", { x1: G.cx, y1: G.cy, x2: G.cx - hw, y2: ly, stroke: "#2f8a5b", "stroke-width": 1.6, "stroke-dasharray": "5 4" }, gA);
}
if (s.d > 0.01) {
el("line", { x1: G.cx, y1: G.cy, x2: G.cx, y2: ly, stroke: "#b8791f", "stroke-width": 2, "stroke-dasharray": "6 4" }, gA);
el("path", { d: "M" + G.cx + "," + (ly - 9) + " L" + (G.cx + 9) + "," + (ly - 9) + " L" + (G.cx + 9) + "," + ly, fill: "none", stroke: "#b8791f", "stroke-width": 1.3 }, gA);
el("circle", { cx: G.cx, cy: ly, r: 3, fill: "#b8791f" }, gA);
tx(gA, G.cx - 6, ly + 16, "M", "#b8791f", "end", 9.8, 700);
tx(gA, G.cx + 14, G.cy + (ly - G.cy) / 2 + 4, "d = " + s.d.toFixed(1), "#b8791f", "start", 9.8, 700);
} else {
tx(gA, G.cx + 16, G.cy + 18, "d = 0：直线过圆心", "#b8791f", "start", 9.4, 700);
}
el("circle", { cx: G.cx, cy: G.cy, r: 3.2, fill: "#2563eb" }, gA);
tx(gA, G.cx - 8, G.cy - 9, "O", "#2563eb", "end", 10.5, 700);
tx(gA, G.cx - G.r - 8, G.cy + 4, "r = 5", "#2f8a5b", "end", 9.6, 700);
var cap = s.state === 0 ? "相交：d < r，两个公共点，l = 2√(25−d²)"
: (s.state === 1 ? "相切：d = r，一个公共点，弦长为 0" : "相离：d > r，没有公共点，不能求弦长");
tx(gA, L.left.x + 18, L.left.y + L.left.h - 14, cap, s.state === 2 ? "#b8402f" : (s.state === 1 ? "#b8791f" : "#2563eb"), "start", 9.4, 700);

/* 右：弦长随 d 的曲线 */
el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
tx(gB, L.right.x + 18, L.right.y + (L.mobile ? 24 : 30), "弦长 l 随 d 变化：l = 2√(25−d²)", "#5a6472", "start", 10.5, 700);
el("line", { x1: x0, y1: y0, x2: x1, y2: y0, stroke: "#9aa4b1", "stroke-width": 1.3 }, gB);
el("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: "#9aa4b1", "stroke-width": 1.3 }, gB);
el("path", { d: "M" + x1 + "," + y0 + " l-8,-4.5 l0,9 z", fill: "#9aa4b1" }, gB);
el("path", { d: "M" + x0 + "," + y1 + " l-4.5,8 l9,0 z", fill: "#9aa4b1" }, gB);
tx(gB, x1 - 2, y0 - 8, "d", "#5a6472", "end", 10, 700);
tx(gB, x0 - 8, y1 - 12, "l", "#5a6472", "end", 10, 700);
for (i = 0; i <= 8; i += 2) {
xv = x0 + (i / 8) * (x1 - x0);
el("line", { x1: xv, y1: y0, x2: xv, y2: y0 + 4, stroke: "#9aa4b1" }, gB);
tx(gB, xv, y0 + 15, String(i), "#8a94a3", "middle", 8.5, 400);
}
for (i = 0; i <= 10; i += 5) {
yv = y0 - (i / 10) * (y0 - y1);
el("line", { x1: x0 - 4, y1: yv, x2: x0, y2: yv, stroke: "#9aa4b1" }, gB);
tx(gB, x0 - 8, yv + 3.5, String(i), "#8a94a3", "end", 8.5, 400);
}
var pts = [];
for (k = 0; k <= 20; k++) {
dd = k * 0.25;
lv = 2 * Math.sqrt(Math.max(0, R * R - dd * dd));
pts.push((x0 + (dd / 8) * (x1 - x0)).toFixed(1) + "," + (y0 - (lv / 10) * (y0 - y1)).toFixed(1));
}
el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2563eb", "stroke-width": 2.6 }, gB);
el("line", { x1: x0 + (5 / 8) * (x1 - x0), y1: y0, x2: x1, y2: y0, stroke: "#b8402f", "stroke-width": 2.4, "stroke-dasharray": "7 4" }, gB);
var md = x0 + (s.d / 8) * (x1 - x0), ml = y0 - (s.chord / 10) * (y0 - y1);
el("line", { x1: md, y1: y0, x2: md, y2: ml, stroke: "#b8791f", "stroke-width": 1.2, "stroke-dasharray": "4 3" }, gB);
el("circle", { cx: md, cy: ml, r: 5.5, fill: "#ffffff", stroke: "#b8791f", "stroke-width": 2.6 }, gB);
var rt = md > x0 + 0.72 * (x1 - x0);
tx(gB, md + (rt ? -9 : 9), ml - 9, "l = " + s.chord.toFixed(1), "#b8791f", rt ? "end" : "start", 9.8, 700);
tx(gB, L.right.x + 18, L.right.y + L.right.h - (L.mobile ? 52 : 60), "d = 5 是分界：相切，弦长为 0", "#b8791f", "start", 9.4, 700);
tx(gB, L.right.x + 18, L.right.y + L.right.h - (L.mobile ? 34 : 40), "d > 5 相离：红虚线，l 恒为 0", "#b8402f", "start", 9.4, 400);
tx(gB, L.right.x + 18, L.right.y + L.right.h - (L.mobile ? 16 : 20), "d = 3 时半弦 4、弦长 8（3-4-5）", "#2563eb", "start", 9.4, 700);
}

function render() {
if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
var s = calc(A), st, col, bg, sn;
$("gxVa").textContent = s.d.toFixed(1);
$("gxVb").textContent = s.chord.toFixed(1);
$("gxVc").textContent = s.half.toFixed(2);
if (s.state === 0) { st = "相交"; col = "#2563eb"; bg = "#e8f0fe"; sn = "d<r，两个公共点"; }
else if (s.state === 1) { st = "相切"; col = "#b8791f"; bg = "#fdf3e0"; sn = "d=r，弦长为 0"; }
else { st = "相离"; col = "#b8402f"; bg = "#fbeae7"; sn = "d>r，没有公共点"; }
$("gxVs").textContent = st;
$("gxVsn").textContent = sn;
$("gxStBox").style.background = bg;
$("gxStBox").style.borderColor = col + "44";
$("gxVs").style.color = col;
draw(s);
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
loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 5 }, { t: 11.5, v: 7 }, { t: 13.5, v: 0 }],
keys: [0, 3, 5, 7],
value: A, min: 0, max: 8, step: 0.5,
idle: 5000,
onChange: function (v) { A = v; render(); },
onMode: setMode
});
window.__ap = ap;
window.__model = { calc: calc, cases: [
{ v: 0, eq: { chord: 10, state: 0 } },
{ v: 3, eq: { chord: 8, state: 0 } },
{ v: 5, eq: { chord: 0, state: 1 } },
{ v: 7, eq: { chord: 0, state: 2 } }
] };

var tmr = null;
window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
layout();
});
