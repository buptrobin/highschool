document.addEventListener("DOMContentLoaded", function () {
"use strict";
var $ = function (i) { return document.getElementById(i); };
var G, L, booted = false;
function calc(v) {
v = Math.max(0, Math.min(40, Number(v) || 0));
return { v: v, delta: v * 0.5, alarm: v > 20 ? 1 : 0, excess: Math.max(0, v - 20) };
}
function fmt(n) { n = Math.round(n * 10) / 10; return n % 1 ? n.toFixed(1) : String(n); }
function layout() {
var s = $("gxStage"), w = 880;
if (s) w = s.clientWidth || s.getBoundingClientRect().width || 880;
return { w: w };
}
function geom() { return L && L.w >= 640 ? { wide: 1, W: 880, H: 470 } : { wide: 0, W: 360, H: 700 }; }
function t(x, y, s, fs, c, w, a) {
return '<text x="' + x + '" y="' + y + '" font-size="' + (fs || 9.4) + '"' + (w ? ' font-weight="700"' : "") + (a ? ' text-anchor="' + a + '"' : "") + ' fill="' + (c || "#3a3a35") + '">' + s + "</text>";
}
function r(x, y, w, h, f, s) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="9" fill="' + f + '" stroke="' + s + '"/>'; }
function n(x1, y1, x2, y2, c, m) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || "#5b6b78") + '"' + (m ? ' marker-end="url(#' + m + ')"' : "") + "/>"; }
function df(id, c) { return '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + c + '"/></marker></defs>'; }
function wideA(d) {
var tone = d.alarm ? "#b8402f" : "#2f8a5b", s = df("a1", "#5b6b78");
s += r(16, 16, 848, 438, "#f8fbfd", "#dbe7ef");
s += t(40, 46, "人类每年排放碳 E → 大气 CO₂ 年增量 Δ", 12, "#151a21", 1);
s += t(40, 66, "示意口径：自然吸收约一半，另一半留在大气", 9.4, "#5b6b78");
s += r(40, 92, 180, 84, "#fdf3e3", "#e8d3ae");
s += t(56, 120, "化石燃料燃烧", 10.5, "#151a21", 1);
s += t(56, 142, "E = " + fmt(d.v) + " Gt C/年", 10, "#8a5a12");
s += t(56, 162, "人为排放", 9.4, "#5b6b78");
s += n(220, 134, 292, 134, "#5b6b78", "a1");
s += r(300, 86, 250, 100, "#eef6fb", "#b8d6ea");
s += t(316, 114, "大气 CO₂", 10.5, "#2f5f7a", 1);
s += t(316, 138, "年增量 Δ = " + fmt(d.delta) + " ppm", 10, "#151a21");
s += t(316, 160, "状态：" + (d.alarm ? "净累积" : "基本平衡"), 9.4, tone);
s += n(425, 186, 425, 272, "#5b6b78", "a1");
s += t(437, 232, "自然吸收", 9.4, "#5b6b78");
s += r(300, 276, 250, 92, "#ffffff", "#b8e6d0");
s += t(316, 304, "自然吸收（陆地、海洋）", 10.5, "#151a21", 1);
s += t(316, 328, "约 " + fmt(d.v * 0.5) + " Gt C/年", 10, "#2f8a5b");
s += t(316, 350, "吸收率约 50%（示意）", 9.4, "#5b6b78");
return s;
}
function wideB(d) {
var h = Math.max(0, Math.min(280, d.delta * 14)), tone = d.alarm ? "#b8402f" : "#2f8a5b", i;
var s = t(640, 98, "Δ（ppm/年）", 10, "#151a21", 1);
s += n(676, 112, 676, 400, "#9bb0bd") + n(676, 400, 790, 400, "#9bb0bd");
s += '<line x1="676" y1="260" x2="806" y2="260" stroke="#b8402f" stroke-dasharray="4 3"/>';
s += t(810, 264, "E=20", 9, "#b8402f");
var ticks = [20, 15, 10, 5, 0];
for (i = 0; i < 5; i++) s += t(668, 124 + i * 70, String(ticks[i]), 9, "#5b6b78", 0, "end");
s += r(676, 400 - h, 70, h, tone, tone);
s += t(711, 390 - h, fmt(d.delta), 10, tone, 1, "middle");
return s;
}
function narrow(d) {
var tone = d.alarm ? "#b8402f" : "#2f8a5b", w = Math.max(0, Math.min(280, d.delta * 14)), i;
var s = df("a2", "#5b6b78");
s += r(12, 12, 336, 676, "#f8fbfd", "#dbe7ef");
s += t(26, 42, "排放碳 E → 大气 CO₂ 年增量", 11.5, "#151a21", 1);
s += r(26, 66, 308, 80, "#fdf3e3", "#e8d3ae");
s += t(40, 94, "化石燃料燃烧", 10.5, "#151a21", 1);
s += t(40, 116, "E = " + fmt(d.v) + " Gt C/年", 10, "#8a5a12");
s += t(40, 136, "人为排放", 9.4, "#5b6b78");
s += n(180, 146, 180, 176, "#5b6b78", "a2");
s += r(26, 176, 308, 96, "#eef6fb", "#b8d6ea");
s += t(40, 204, "大气 CO₂", 10.5, "#2f5f7a", 1);
s += t(40, 226, "年增量 Δ = " + fmt(d.delta) + " ppm", 10, "#151a21");
s += t(40, 248, "状态：" + (d.alarm ? "净累积" : "基本平衡"), 9.4, tone);
s += n(180, 272, 180, 304, "#5b6b78", "a2");
s += t(192, 294, "自然吸收", 9.4, "#5b6b78");
s += r(26, 304, 308, 80, "#ffffff", "#b8e6d0");
s += t(40, 330, "自然吸收（陆地、海洋）", 10.5, "#151a21", 1);
s += t(40, 352, "约 " + fmt(d.v * 0.5) + " Gt C/年", 10, "#2f8a5b");
s += t(40, 372, "吸收率约 50%（示意）", 9.4, "#5b6b78");
s += t(40, 428, "大气 CO₂ 年增量 Δ", 10.5, "#151a21", 1);
s += n(40, 490, 320, 490, "#9bb0bd") + n(40, 428, 40, 490, "#9bb0bd");
s += '<line x1="180" y1="420" x2="180" y2="490" stroke="#b8402f" stroke-dasharray="4 3"/>';
s += t(180, 414, "E=20 临界", 9, "#b8402f", 0, "middle");
s += '<rect x="40" y="440" width="' + w + '" height="50" fill="' + tone + '" opacity="0.85"/>';
var ticks = [0, 5, 10, 15, 20];
for (i = 0; i < 5; i++) s += t(40 + i * 70, 508, String(ticks[i]), 9, "#5b6b78", 0, "middle");
s += t(40, 548, "Δ = " + fmt(d.delta) + " ppm/年", 12, tone, 1);
s += t(40, 578, "E 超过 20 Gt 后，Δ 继续变大，", 9.4, "#5b6b78");
s += t(40, 596, "自然吸收跟不上，大气 CO₂ 净累积。", 9.4, "#5b6b78");
return s;
}
function render(v) {
if (!G) { L = layout(); G = geom(); }
var d = calc(v), stage = $("gxStage");
if (stage) stage.setAttribute("viewBox", "0 0 " + G.W + " " + G.H);
var a = $("gxA"), b = $("gxB");
if (a) a.innerHTML = G.wide ? wideA(d) : narrow(d);
if (b) b.innerHTML = G.wide ? wideB(d) : "";
var sl = $("gxSl");
if (sl && String(sl.value) !== String(d.v)) sl.value = String(d.v);
if ($("gxVa")) $("gxVa").textContent = fmt(d.v);
if ($("gxVb")) $("gxVb").textContent = fmt(d.delta);
if ($("gxVc")) $("gxVc").textContent = fmt(d.excess);
var box = $("gxStBox"), vs = $("gxVs"), vsn = $("gxVsn");
if (box) {
box.style.background = d.alarm ? "#fdf0ee" : "#eef7f2";
box.style.borderColor = d.alarm ? "#b8402f" : "#2f8a5b";
}
if (vs) { vs.textContent = d.alarm ? "超载" : "未超载"; vs.style.color = d.alarm ? "#b8402f" : "#2f8a5b"; }
if (vsn) vsn.textContent = d.alarm ? "净累积，大气 CO₂ 持续上升" : "自然吸收还能消化大部分";
}
function setMode(m) {
var el = $("gxApTxt");
if (el) el.textContent = (m === true || m === 1 || m === "auto" || m === "play" || m === "autoplay") ? "自动演示中" : "手动调节";
}
function boot() {
if (booted) return;
booted = true;
var model = { calc: calc, cases: [{ v: 10, eq: { delta: 5 } }, { v: 20, eq: { delta: 10 } }, { v: 40, eq: { delta: 20 } }] };
window.__bio = model;
window.__model = model;
render(20);
var sl = $("gxSl");
if (sl) sl.addEventListener("input", function () { render(+sl.value); });
var stage = $("gxStage");
if (stage && typeof AutoPilot !== "undefined" && AutoPilot && AutoPilot.create) {
window.__ap = AutoPilot.create({
mount: stage, follow: sl,
loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 20 }, { t: 6.5, v: 20 }, { t: 9, v: 40 }, { t: 11, v: 30 }, { t: 13, v: 0 }],
keys: [0, 20, 30, 40], value: 20, min: 0, max: 40, step: 1, idle: 5000,
onChange: function (v) { render(v); },
onMode: setMode
});
}
}
boot();
});
