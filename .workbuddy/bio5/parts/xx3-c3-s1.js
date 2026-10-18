document.addEventListener("DOMContentLoaded", function () {
"use strict";
var NS = "http://www.w3.org/2000/svg";
var stage = document.getElementById("gxStage");
var gA = document.getElementById("gxA"), gB = document.getElementById("gxB");
var sl = document.getElementById("gxSl");
if (!stage || !gA || !gB || !sl || !window.AutoPilot) return;
var va = document.getElementById("gxVa"), vb = document.getElementById("gxVb"), vc = document.getElementById("gxVc");
var vs = document.getElementById("gxVs"), vsn = document.getElementById("gxVsn"), stBox = document.getElementById("gxStBox");
var SUP = { 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸" };
var G = null, L = null;

function fmt(x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+$)/g, ","); }

/* 唯一真值：识别序列长度 n → 平均间距 gap、1 Mb 切点数 cuts */
function calc(v) {
  var n = Math.round(+v);
  if (!isFinite(n)) n = 6;
  if (n < 4) n = 4;
  if (n > 8) n = 8;
  var gap = Math.pow(4, n);
  var cuts = 1000000 / gap;
  var s, tone, note;
  if (n === 4) { s = "太密"; tone = "#b8402f"; note = "切点太密，基因组被切碎"; }
  else if (n === 5) { s = "偏密"; tone = "#b8791f"; note = "片段偏短，目的基因易被切断"; }
  else if (n === 6) { s = "合适"; tone = "#2f8a5b"; note = "常用酶的量级，片段约 4 kb"; }
  else if (n === 7) { s = "偏稀"; tone = "#b8791f"; note = "可操作，但可用的酶不多"; }
  else { s = "太稀"; tone = "#b8402f"; note = "切点太稀，难切成可操作片段"; }
  return { n: n, gap: gap, cuts: cuts, short: s, tone: tone, note: note };
}

function layout() {
  var w = stage.clientWidth || 880;
  return w >= 640 ? { m: "W", W: 880, H: 470 } : { m: "N", W: 360, H: 700 };
}

function geom() {
  if (L.m === "W") {
    return { m: "W", title1: [48, 44], bar: { x: 48, y: 64, w: 784, h: 38 }, tip: [48, 124],
      avg: [48, 152], recTitle: [48, 216], recX: 48, recY: 234, bw: 44, bh: 38, recNote: [48, 300],
      chTitle: [60, 322], chX: 60, chBase: 420, chW: 56, chGap: 24, chMax: 80, fs: 1 };
  }
  return { m: "N", title1: [24, 40], bar: { x: 24, y: 56, w: 312, h: 30 }, tip: [24, 108],
    avg: [24, 134], avg2: [24, 158], recTitle: [24, 200], recX: 24, recY: 218, bw: 36, bh: 34,
    recNote: [24, 282], recNote2: [24, 302], chTitle: [30, 362], chX: 30, chBase: 470,
    chW: 44, chGap: 16, chMax: 92, fs: 0.92 };
}

function el(p, t, a, txt) {
  var e = document.createElementNS(NS, t), k;
  for (k in a) e.setAttribute(k, a[k]);
  if (txt != null) e.textContent = txt;
  p.appendChild(e);
  return e;
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
function tx(g, x, y, s, size, fill, weight, anchor) {
  var e = el(g, "text", { x: x, y: y, "font-size": size || 10, fill: fill || "#3a3a35" }, s);
  if (weight) e.setAttribute("font-weight", weight);
  if (anchor) e.setAttribute("text-anchor", anchor);
  return e;
}

function render() {
  if (!G) { L = layout(); G = geom(); }
  var r = calc(sl.value), n = r.n, i, x, y, h, k, c;
  stage.setAttribute("viewBox", "0 0 " + L.W + " " + L.H);
  clear(gA); clear(gB);

  /* ---- ① 基因组切点条 ---- */
  var b = G.bar;
  el(gA, "rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 6, fill: "#eef4f8", stroke: "#cfdde7" });
  var drawn = Math.max(1, Math.min(Math.round(r.cuts), 120)), sw = b.w / drawn;
  for (i = 0; i < drawn; i++) {
    x = b.x + i * sw + sw / 2;
    el(gA, "line", { x1: x, y1: b.y + 2, x2: x, y2: b.y + b.h - 2, stroke: "#b8402f",
      "stroke-width": drawn > 70 ? 0.9 : 1.9, opacity: 0.85 });
  }
  tx(gA, G.title1[0], G.title1[1], "① 1 Mb 基因组：红线就是切点", 11.5, "#151a21", 700);
  tx(gA, G.tip[0], G.tip[1], "图上按比例缩略；切点越密，片段越短", 9, "#6b7580");
  tx(gA, G.avg[0], G.avg[1], "平均每 " + fmt(r.gap) + " bp 一个切点 → 片段长约 " + fmt(r.gap) + " bp", 11, "#1f6b4c", 700);
  if (G.avg2) tx(gA, G.avg2[0], G.avg2[1], "1 Mb 中约 " + fmt(r.cuts) + " 个切点", 10, "#3a3a35", 700);

  /* ---- ② 识别序列 ---- */
  tx(gA, G.recTitle[0], G.recTitle[1], "② 识别序列有多长：n = " + n + " bp", 11.5, "#151a21", 700);
  var seq = "GAATTCGA", bw = G.bw;
  for (i = 0; i < n; i++) {
    x = G.recX + i * bw;
    el(gA, "rect", { x: x + 2, y: G.recY, width: bw - 4, height: G.bh, rx: 4, fill: "#eaf5ef", stroke: "#7cc6a3" });
    tx(gA, x + bw / 2, G.recY + G.bh * 0.68, seq.charAt(i), 11, "#1f6b4c", 700, "middle");
  }
  tx(gA, G.recNote[0], G.recNote[1], "该特定序列在随机 DNA 中平均每 4" + SUP[n] + " = " + fmt(r.gap) + " bp 出现一次", 9.2);
  if (G.recNote2) tx(gA, G.recNote2[0], G.recNote2[1], "n 每加 1，切点密度降到原来的 1/4", 9.2, "#6b7580");

  /* ---- ③ 对数柱状图：n=4…8 的切点数 ---- */
  var base = G.chBase, maxH = G.chMax;
  tx(gB, G.chTitle[0], G.chTitle[1], "③ 1 Mb 中的切点数（对数刻度）", 10.4 * G.fs + 0.6, "#151a21", 700);
  for (i = 0; i < 5; i++) {
    k = 4 + i; c = calc(k).cuts;
    h = maxH * (Math.log10(c) - 1) / 2.6; if (h < 8) h = 8;
    x = G.chX + i * (G.chW + G.chGap);
    var on = (k === n);
    el(gB, "rect", { x: x, y: base - h, width: G.chW, height: h, rx: 4, fill: on ? "#2f8a5b" : "#cfe0ee" });
    tx(gB, x + G.chW / 2, base - h - 6, fmt(c), 8.6 * G.fs + 0.6, on ? "#2f8a5b" : "#6b7580", on ? 700 : 400, "middle");
    tx(gB, x + G.chW / 2, base + 16, "n=" + k, 9, on ? "#151a21" : "#6b7580", on ? 700 : 400, "middle");
  }
  el(gB, "line", { x1: G.chX - 6, y1: base, x2: G.chX + 5 * (G.chW + G.chGap) - G.chGap + 6, y2: base, stroke: "#cfdde7" });

  /* ---- 数值卡 ---- */
  va.textContent = n;
  vb.textContent = fmt(r.gap);
  vc.textContent = "≈ " + fmt(r.cuts);
  vs.textContent = r.short;
  vs.style.color = r.tone;
  vsn.textContent = r.note;
  if (stBox) stBox.style.borderLeftColor = r.tone;
}

/* ---- 自动演示 ---- */
function setMode(on) {
  var auto = !(on === false || on === "manual" || on === "paused" || on === "off");
  var txt = document.getElementById("gxApTxt");
  if (txt) txt.textContent = auto ? "自动演示中" : "手动拖动";
  var box = document.getElementById("gxAp");
  if (box) { if (auto) box.classList.add("is-auto"); else box.classList.remove("is-auto"); }
}

var LOOP = [{ t: 0, v: 4 }, { t: 1.2, v: 4 }, { t: 4, v: 6 }, { t: 6.5, v: 6 }, { t: 9, v: 8 }, { t: 11, v: 7 }, { t: 13, v: 4 }];

var ap = window.AutoPilot.create({
  mount: stage, follow: sl, loop: LOOP, keys: [4, 6, 7, 8],
  value: 6, min: 4, max: 8, step: 1, idle: 5000,
  onChange: function (v) { sl.value = v; render(); },
  onMode: setMode
});

sl.addEventListener("input", function () { render(); });
window.addEventListener("resize", function () { G = null; render(); });

window.__ap = ap;
window.__model = window.__bio = { calc: calc, cases: [
  { v: 4, eq: { gap: 256 } },
  { v: 6, eq: { gap: 4096 } },
  { v: 8, eq: { gap: 65536 } }
] };

render();
});
