/* bx1-c1-s1 互动：p → 剩余产品率 / 阶级 */
document.addEventListener("DOMContentLoaded", function () {
"use strict";
var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$, stage = $("gxStage");
if (!stage || !window.AutoPilot) return;
var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 288 }, right: { x: 8, y: 300, w: 344, h: 388 } };
var L = W, A = 10, G = null;
var Z = [[10, 30, "无剩余产品", "#eef2f6"], [30, 45, "私有制萌芽", "#fdf3e0"], [45, 100, "阶级社会", "#fbeae7"]];
function calc(v) { return { surplus: Math.max(0, (v - 30) / 70) * 100, cls: v > 45 ? 1 : 0, gap: v - 45 }; }
function t(g, x, y, s, c, a, f, w) { tx(g, x, y, s, c, a || "start", f || 9, w || 400); }
function R(g, x, y, w, h, f, s, r) { el("rect", { x: x, y: y, width: w, height: h, rx: r || 0, fill: f, stroke: s || "none" }, g); }
function geom() {
var l = L.left, r = L.right, w = L === W, g = { w: w, l: l, r: r };
g.sx = l.x + (w ? 22 : 16); g.sw = l.w - (w ? 44 : 32);
g.sy = l.y + (w ? 56 : 44); g.sh = w ? 40 : 32;
g.bY = l.y + (w ? 158 : 110); g.bH = w ? 20 : 18;
g.aY = w ? [l.y + 206, l.y + 272] : [l.y + 152, l.y + 206];
g.aW = w ? 184 : 148; g.aH = w ? 60 : 46;
g.aX = [g.sx, g.sx + g.aW + 12];
g.lab = w ? 18 : 16; g.val = w ? 42 : 34;
g.rows = [];
for (var i = 0; i < 5; i++) g.rows.push({ x: r.x + (w ? 20 : 16), y: r.y + (w ? 52 : 50) + i * (w ? 56 : 52), w: r.w - (w ? 40 : 32), h: w ? 44 : 42 });
return g;
}
function draw() {
var g = G, l = g.l, r = g.r, w = g.w, s = calc(A), rate = s.surplus, has = rate > 0, cls = !!s.cls;
var gA = $("gxA"), gB = $("gxB"), i, k, j;
gA.textContent = ""; gB.textContent = "";
R(gA, l.x, l.y, l.w, l.h, "#f8fbfd", "#dbe7ef", 10);
t(gA, l.x + 20, l.y + 30, "社会状态：生产力 → 剩余产品 → 私有制", "#5a6472", "start", 10.5, 700);
var acc = 0, zw;
for (i = 0; i < 3; i++) {
zw = (Z[i][1] - Z[i][0]) / 90 * g.sw;
R(gA, g.sx + acc, g.sy, zw, g.sh, Z[i][3], "#dbe7ef");
t(gA, g.sx + acc + zw / 2, g.sy + g.sh / 2 + 3, Z[i][2], "#5a6472", "middle", 8);
acc += zw;
}
var ty = g.sy + g.sh + 13;
t(gA, g.sx + 20 / 90 * g.sw, ty, "30", "#9aa6b2", "middle", 7.8);
t(gA, g.sx + 35 / 90 * g.sw, ty, "45", "#9aa6b2", "middle", 7.8);
t(gA, g.sx + g.sw, ty, "100", "#9aa6b2", "end", 7.8);
var mx = g.sx + (A - 10) / 90 * g.sw;
el("polygon", { points: mx + "," + (g.sy + 5) + " " + (mx - 5) + "," + (g.sy - 6) + " " + (mx + 5) + "," + (g.sy - 6), fill: "#b8402f" }, gA);
t(gA, g.sx, g.bY - 8, "剩余产品率", "#5a6472", "start", 9.2);
t(gA, g.sx + g.sw, g.bY - 8, rate.toFixed(1) + "%", "#b8791f", "end", 9.2, 700);
R(gA, g.sx, g.bY, g.sw, g.bH, "#eef2f6", "#e2e8ee", 4);
if (rate > 0) R(gA, g.sx, g.bY, Math.max(2, g.sw * rate / 100), g.bH, "#d8a24a", "none", 4);
var box = [["剩余产品", has ? "有" : "没有", has], ["生产资料所有制", has ? "家庭私有" : "氏族公有", has], ["阶级", cls ? "已出现" : "没有", cls], ["国家", cls ? "已产生" : "没有", cls]], bx, by, sc, tc;
for (k = 0; k < 4; k++) {
bx = g.aX[k % 2]; by = g.aY[k < 2 ? 0 : 1];
sc = k < 2 ? (has ? "#e6cf9a" : "#dbe7ef") : (cls ? "#d9a79c" : "#dbe7ef");
tc = k < 2 ? (has ? "#8a6a1f" : "#1f6b47") : (cls ? "#8f2f21" : "#1f6b47");
R(gA, bx, by, g.aW, g.aH, "#ffffff", sc, 8);
t(gA, bx + 12, by + g.lab, box[k][0], "#7b8794", "start", 8.4);
t(gA, bx + 12, by + g.val, box[k][1], tc, "start", w ? 11 : 10.5, 700);
}
if (w) t(gA, g.sx, l.y + 400, "读法：色条定位 → 剩余产品率是否离开 0 → 阶级、国家两格是否变色", "#5a6472", "start", 9.2);
R(gB, r.x, r.y, r.w, r.h, "#ffffff", "#e6e9ee", 10);
t(gB, r.x + 20, r.y + 30, "因果链：亮到第几环", "#5a6472", "start", 10.5, 700);
var ch = [["生产力发展", true, "水平 p=" + Math.round(A)], ["剩余产品", has, has ? "已出现" : "未出现"], ["私有制", has, has ? "家庭私有" : "氏族公有"], ["阶级", cls, cls ? "已出现" : "未出现"], ["国家", cls, cls ? "已产生" : "未产生"]], row, on, red, cy;
for (j = 0; j < 5; j++) {
row = g.rows[j]; on = ch[j][1]; red = j === 4 && on; cy = row.y + row.h / 2;
R(gB, row.x, row.y, row.w, row.h, red ? "#fbeae7" : (on ? "#eefaf3" : "#ffffff"), red ? "#d9a79c" : (on ? "#9ed3b8" : "#e2e8ee"), 8);
el("circle", { cx: row.x + 24, cy: cy, r: 11, fill: red ? "#b8402f" : (on ? "#2f8a5b" : "#9aa6b2") }, gB);
t(gB, row.x + 24, cy + 3.5, String(j + 1), "#ffffff", "middle", 9, 700);
t(gB, row.x + 44, cy + 4, ch[j][0], "#151a21", "start", 10, 700);
t(gB, row.x + row.w - 12, cy + 3, ch[j][2], red ? "#8f2f21" : (on ? "#1f6b47" : "#9aa6b2"), "end", 8.6);
if (j < 4) t(gB, row.x + row.w / 2, row.y + row.h + 9, "▼", "#b8c4ce", "middle", 7.2);
}
var notes = w ? ["p ≤ 30：原始社会，没有剩余产品。", "30 < p ≤ 45：剩余产品出现，私有制萌芽。", "p > 45：阶级出现，国家随之产生。", "结论：阶级产生的根本原因是生产力发展。"] : ["p≤30：没有剩余产品。", "30–45：私有制萌芽；p>45：阶级与国家出现。", "根本原因：生产力发展。"];
for (i = 0; i < notes.length; i++) t(gB, r.x + 20, r.y + (w ? 352 : 320) + i * (w ? 24 : 22), notes[i], i === notes.length - 1 ? "#8f2f21" : "#5a6472", "start", 9, i === notes.length - 1 ? 700 : 400);
}
function render() {
if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
var s = calc(A), rate = s.surplus, gap = Math.round(s.gap), col, bg, st, sn;
$("gxVa").textContent = String(Math.round(A));
$("gxVb").textContent = rate.toFixed(1) + "%";
$("gxVc").textContent = (gap > 0 ? "+" + gap : String(gap)).replace("-", "−");
if (A <= 30) { st = "没有剩余产品"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "生产资料氏族公有，没有阶级"; }
else if (A <= 45) { st = "私有制萌芽"; col = "#b8791f"; bg = "#fdf3e0"; sn = "剩余产品出现，阶级未出现"; }
else { st = "阶级社会"; col = "#b8402f"; bg = "#fbeae7"; sn = "阶级出现，国家随之产生"; }
$("gxVs").textContent = st; $("gxVsn").textContent = sn;
$("gxStBox").style.background = bg;
$("gxStBox").style.borderColor = col + "44";
$("gxVs").style.color = col;
draw();
}
function layout() {
G = null;
stage.setAttribute("viewBox", stage.parentElement.getBoundingClientRect().width >= 640 ? W.vb : N.vb);
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
loop: [{ t: 0, v: 10 }, { t: 1.2, v: 10 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 100 }, { t: 11, v: 72 }, { t: 13, v: 10 }],
keys: [10, 50, 72, 100], value: A, min: 10, max: 100, step: 1, idle: 5000,
onChange: function (v) { A = v; render(); },
onMode: setMode
});
window.__ap = ap;
window.__model = { calc: calc, cases: [{ v: 20, eq: { surplus: 0, cls: 0 } }, { v: 50, eq: { surplus: 28.57, cls: 1 } }, { v: 90, eq: { surplus: 85.71, cls: 1 } }] };
window.__bio = window.__model;
var tmr = null;
window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
layout();
});
