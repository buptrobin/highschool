/* bx1-c2-s1 互动：年份 y → 距新中国成立年数 left / 阶段 stage */
document.addEventListener("DOMContentLoaded", function () {
"use strict";
var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$, stage = $("gxStage");
if (!stage || !window.AutoPilot) return;
var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
var L = W, A = 1840, G = null;
var ST = [
{ n: 1, name: "旧民主主义革命时期", col: "#b8402f", extra: "资产阶级领导，多次斗争屡遭失败" },
{ n: 2, name: "五四运动：新民主主义革命开端", col: "#b8791f", extra: "工人阶级登上政治舞台，领导阶级换人" },
{ n: 3, name: "新民主主义革命时期", col: "#2f8a5b", extra: "中国共产党成立，中国革命面貌焕然一新" },
{ n: 4, name: "解放战争，胜利前夜", col: "#2f8a5b", extra: "1949 年新中国成立，革命取得基本胜利" }
];
var TICKS = [{ y: 1840, up: false }, { y: 1919, up: false }, { y: 1921, up: true }, { y: 1945, up: true }, { y: 1949, up: false }];
var ROWS = [
{ y: 1840, t: "旧民主主义革命", s: "资产阶级领导" },
{ y: 1919, t: "五四运动·转折", s: "无产阶级登上舞台" },
{ y: 1921, t: "中国共产党成立", s: "面貌焕然一新" },
{ y: 1945, t: "解放战争", s: "胜利前夜" },
{ y: 1949, t: "新中国成立", s: "革命基本胜利" }
];
/* 唯一真值：年份 → 距新中国成立年数 + 阶段 */
function calc(v) { return { left: 1949 - v, stage: v < 1919 ? 1 : v < 1921 ? 2 : v < 1945 ? 3 : 4 }; }
function t(g, x, y, s, c, a, f, w) { tx(g, x, y, s, c, a || "start", f || 9, w || 400); }
function geom() {
var l = L.left, r = L.right, w = L === W, g = { w: w, l: l, r: r };
g.t1 = [l.x + 20, l.y + 30];
g.chipY = l.y + 60; g.chipH = 44;
g.ax0 = l.x + (w ? 30 : 20); g.ax1 = l.x + l.w - (w ? 30 : 20);
g.axY = l.y + (w ? 150 : 112);
g.pbY = g.axY + 34; g.pbH = w ? 12 : 10;
g.cx = l.x + (w ? 24 : 12); g.cy = l.y + (w ? 228 : 170);
g.cw = l.w - (w ? 48 : 24); g.ch = w ? 96 : 84;
g.lNoteY = l.y + (w ? 366 : 256);
g.lNoteLh = w ? 20 : 17;
g.rows = [];
for (var i = 0; i < 5; i++) g.rows.push({ x: r.x + (w ? 20 : 16), y: r.y + (w ? 52 : 42) + i * (w ? 56 : 48), w: r.w - (w ? 40 : 32), h: 44 });
g.rNoteY = r.y + (w ? 352 : 288);
g.rNoteLh = w ? 24 : 22;
return g;
}
function draw() {
var g = G, l = g.l, r = g.r, w = g.w, s = calc(A), st = ST[s.stage - 1], span = g.ax1 - g.ax0;
var gA = $("gxA"), gB = $("gxB"), i, k, x, p;
gA.textContent = ""; gB.textContent = "";
el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
t(gA, g.t1[0], g.t1[1], "年份轴：1840 ——————— 1949", "#5a6472", "start", 10.5, 700);
if (w) {
var CH = [["旧民主主义革命", "1840–1919"], ["五四转折", "1919–1921"], ["中共成立后", "1921–1945"], ["解放战争", "1945–1949"]];
var cwid = (g.ax1 - g.ax0 - 18) / 4;
for (i = 0; i < 4; i++) {
var cxp = g.ax0 + i * (cwid + 6);
el("rect", { x: cxp, y: g.chipY, width: cwid, height: g.chipH, rx: 7, fill: ST[i].col + "14", stroke: ST[i].col + "55" }, gA);
t(gA, cxp + cwid / 2, g.chipY + 18, CH[i][0], ST[i].col, "middle", 8.8, 700);
t(gA, cxp + cwid / 2, g.chipY + 33, CH[i][1], "#5a6472", "middle", 7.8);
}
}
el("line", { x1: g.ax0, y1: g.axY, x2: g.ax1, y2: g.axY, stroke: "#c9d4dc", "stroke-width": 1.6 }, gA);
for (i = 0; i < TICKS.length; i++) {
x = g.ax0 + (TICKS[i].y - 1840) / 109 * span;
el("line", { x1: x, y1: g.axY - 5, x2: x, y2: g.axY + 5, stroke: "#8a949e", "stroke-width": 1.2 }, gA);
t(gA, x, g.axY + (TICKS[i].up ? -13 : 18), String(TICKS[i].y), TICKS[i].y === 1919 ? "#b8791f" : "#7b8794", "middle", TICKS[i].y === 1919 ? 10 : 9, TICKS[i].y === 1919 ? 700 : 400);
}
for (k = 0; k < 4; k++) {
var a0 = k === 0 ? 1840 : k === 1 ? 1919 : k === 2 ? 1921 : 1945, a1 = k === 0 ? 1919 : k === 1 ? 1921 : k === 2 ? 1945 : 1949;
var bx0 = g.ax0 + (a0 - 1840) / 109 * span, bx1 = g.ax0 + (a1 - 1840) / 109 * span;
el("rect", { x: bx0, y: g.pbY, width: Math.max(2, bx1 - bx0), height: g.pbH, fill: ST[k].col + (s.stage > k + 1 ? "44" : "1c") }, gA);
}
p = Math.max(0.004, (A - 1840) / 109);
el("rect", { x: g.ax0, y: g.pbY, width: Math.max(2, span * p), height: g.pbH, fill: st.col + "88" }, gA);
var mx = g.ax0 + span * p;
el("line", { x1: mx, y1: g.axY - 30, x2: mx, y2: g.axY + 4, stroke: st.col, "stroke-width": 2 }, gA);
el("polygon", { points: mx + "," + (g.axY - 29) + " " + (mx - 5) + "," + (g.axY - 37) + " " + (mx + 5) + "," + (g.axY - 37), fill: st.col }, gA);
el("circle", { cx: mx, cy: g.pbY + g.pbH / 2, r: 6, fill: "#ffffff", stroke: st.col, "stroke-width": 2.4 }, gA);
if (w) {
t(gA, g.ax0, g.pbY + g.pbH + 18, "起点 1840 · 鸦片战争", "#9aa6b2", "start", 8.4);
t(gA, g.ax1, g.pbY + g.pbH + 18, "终点 1949 · 新中国成立", "#9aa6b2", "end", 8.4);
}
el("rect", { x: g.cx, y: g.cy, width: g.cw, height: g.ch, rx: 8, fill: "#ffffff", stroke: st.col + "55" }, gA);
t(gA, g.cx + 14, g.cy + (w ? 26 : 24), "y = " + Math.round(A) + " 年", st.col, "start", w ? 15 : 14, 700);
t(gA, g.cx + 14, g.cy + (w ? 48 : 44), "距新中国成立 left = " + Math.round(s.left) + " 年", "#151a21", "start", w ? 10.5 : 10, 700);
t(gA, g.cx + 14, g.cy + (w ? 66 : 60), "阶段 stage = " + s.stage + " · " + st.name, "#5a6472", "start", w ? 9.4 : 9);
t(gA, g.cx + 14, g.cy + (w ? 84 : 76), st.extra, st.col, "start", w ? 9 : 8.4);
if (w) {
t(gA, g.t1[0], g.lNoteY, "读法：拖年份 → 指针向右走，阶段数跳一格；", "#5a6472", "start", 9.2);
t(gA, g.t1[0], g.lNoteY + g.lNoteLh, "1919 那一格是「开端」，1949 那一格 left 归 0。", "#5a6472", "start", 9.2);
} else {
t(gA, g.t1[0], g.lNoteY, "1919 换领导阶级，1949 取得基本胜利。", "#5a6472", "start", 8.6);
}
el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
t(gB, r.x + 20, r.y + 30, "五个坐标：走到第几格", "#5a6472", "start", 10.5, 700);
for (i = 0; i < 5; i++) {
var row = g.rows[i], on = A >= ROWS[i].y, cur = s.stage === 4 ? i >= 3 : s.stage === i + 1, cy = row.y + row.h / 2;
var cl = cur ? ST[Math.min(s.stage, 4) - 1].col : on ? "#2f8a5b" : "#9aa6b2";
el("rect", { x: row.x, y: row.y, width: row.w, height: row.h, rx: 8, fill: cur ? "#fdf6ec" : on ? "#eefaf3" : "#ffffff", stroke: cur ? "#d8c39a" : on ? "#9ed3b8" : "#e2e8ee" }, gB);
el("circle", { cx: row.x + 24, cy: cy, r: 11, fill: cl }, gB);
t(gB, row.x + 24, cy + 3.5, String(i + 1), "#ffffff", "middle", 9, 700);
t(gB, row.x + 44, cy - 2, String(ROWS[i].y) + "　" + ROWS[i].t, "#151a21", "start", 9.8, 700);
t(gB, row.x + 44, cy + 12, ROWS[i].s, "#7b8794", "start", 8.4);
t(gB, row.x + row.w - 12, cy + 3, cur ? "当前" : on ? "已走过" : "未到", cur ? "#b8791f" : on ? "#1f6b47" : "#9aa6b2", "end", 8.6);
}
var rn = w ? ["left = 1949 − y：y 越大，离胜利越近。", "stage：y<1919 记 1，1919–1920 记 2，", "1921–1944 记 3，y≥1945 记 4。", "结论：1919 换领导阶级，1949 取得基本胜利。"] : ["left = 1949 − y。", "y<1919 → 1；1919–1920 → 2；", "1921–1944 → 3；y≥1945 → 4。", "1919 开端，1949 胜利。"];
for (i = 0; i < 4; i++) t(gB, r.x + 20, g.rNoteY + i * g.rNoteLh, rn[i], i === 3 ? "#8f2f21" : "#5a6472", "start", w ? 9 : 8.4, i === 3 ? 700 : 400);
}
function render() {
if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
var s = calc(A), st = ST[s.stage - 1], sn;
$("gxVa").textContent = String(Math.round(A));
$("gxVb").textContent = String(Math.round(s.left));
$("gxVc").textContent = String(s.stage);
if (s.stage === 1) sn = "资产阶级领导，革命屡遭失败";
else if (s.stage === 2) sn = "工人登上政治舞台，领导阶级换人";
else if (s.stage === 3) sn = "无产阶级领导，面貌焕然一新";
else sn = A >= 1949 ? "1949：新中国成立，革命基本胜利" : "胜利前夜，1949 年新中国成立";
$("gxVs").textContent = st.name;
$("gxVsn").textContent = sn;
$("gxStBox").style.background = st.col + "14";
$("gxStBox").style.borderColor = st.col + "44";
$("gxVs").style.color = st.col;
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
loop: [{ t: 0, v: 1840 }, { t: 1.2, v: 1840 }, { t: 4, v: 1919 }, { t: 6.5, v: 1919 }, { t: 9, v: 1949 }, { t: 11, v: 1921 }, { t: 13, v: 1840 }],
keys: [1840, 1919, 1921, 1949], value: A, min: 1840, max: 1949, step: 1, idle: 5000,
onChange: function (v) { A = v; render(); },
onMode: setMode
});
window.__ap = ap;
window.__model = { calc: calc, cases: [{ v: 1840, eq: { left: 109, stage: 1 } }, { v: 1919, eq: { left: 30, stage: 2 } }, { v: 1949, eq: { left: 0, stage: 4 } }] };
window.__bio = window.__model;
var tmr = null;
window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
layout();
});
