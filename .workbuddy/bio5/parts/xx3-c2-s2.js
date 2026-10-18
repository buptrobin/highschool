/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var $ = function (i) { return document.getElementById(i); };
  var stage = $("gxStage"), sl = $("gxSl"), gA = $("gxA"), gB = $("gxB");
  if (!stage || !sl || !gA || !gB || !window.AutoPilot) return;
  var Va = $("gxVa"), Vb = $("gxVb"), Vc = $("gxVc"), Vs = $("gxVs"), Vsn = $("gxVsn"), St = $("gxStBox");
  var A = 0, L = null, G = null;

  /* 纯函数：克隆化培养代数 p → 抗体相对产量 */
  function calc(v) {
    var p = Math.round(+v);
    if (!(p > 0)) p = 0;
    if (p > 20) p = 20;
    var ab = 100 / (1 + Math.exp(-(p - 8) / 2));
    var st = p < 5 ? "刚扩增，产量低" : p <= 12 ? "快速上升" : p <= 14 ? "上升变缓，接近饱和" : "接近饱和，可收集抗体";
    return { p: p, ab: ab, gap: 100 - ab, st: st, low: p < 5, top: p > 14 };
  }

  function mk(t, a, p) { var e = document.createElementNS(NS, t), k; for (k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function tx(p, x, y, s, o) {
    o = o || {};
    var e = mk("text", { x: x, y: y, "font-size": o.fs || 10, fill: o.f || "#3a3a35", "text-anchor": o.ta || "start", "font-weight": o.fw || 400 }, p);
    e.textContent = s; return e;
  }

  function geom() {
    var W = L === "W";
    stage.setAttribute("viewBox", W ? "0 0 880 470" : "0 0 360 700");
    gA.textContent = ""; gB.textContent = "";
    var x0 = W ? 58 : 46, x1 = W ? 502 : 312, y0 = W ? 80 : 104, y1 = W ? 382 : 326;
    var g = { x0: x0, x1: x1, y0: y0, y1: y1, rows: [] };
    g.X = function (p) { return x0 + p / 20 * (x1 - x0); };
    g.Y = function (a) { return y1 - a / 100 * (y1 - y0); };
    var S = gA, i, b;
    mk("rect", { x: 14, y: 14, width: W ? 852 : 332, height: W ? 442 : 672, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, S);
    tx(S, W ? 34 : 24, 44, "抗体相对产量随克隆化培养代数的变化", { fs: W ? 12 : 10.6, fw: 700, f: "#151a21" });
    var bands = [[0, 5, "#fdf6ec"], [5, 12, "#eef7f1"], [12, 20, "#f2f5fa"]];
    for (i = 0; i < 3; i++) {
      b = bands[i];
      mk("rect", { x: g.X(b[0]), y: y0, width: g.X(b[1]) - g.X(b[0]), height: y1 - y0, fill: b[2] }, S);
    }
    tx(S, g.X(2.5), y0 + 15, "刚扩增", { fs: 8.4, ta: "middle", f: "#b8791f", fw: 700 });
    tx(S, g.X(8.5), y0 + 15, "快速上升", { fs: 8.4, ta: "middle", f: "#2f8a5b", fw: 700 });
    tx(S, g.X(16), y0 + 15, "接近饱和", { fs: 8.4, ta: "middle", f: "#5b6673", fw: 700 });
    var ys = [0, 25, 50, 75, 100];
    for (i = 0; i < 5; i++) {
      mk("line", { x1: x0, y1: g.Y(ys[i]), x2: x1, y2: g.Y(ys[i]), stroke: ys[i] === 50 ? "#9fb3c4" : "#e2ebf2", "stroke-dasharray": ys[i] === 50 ? "5 4" : "3 3" }, S);
      tx(S, x0 - 5, g.Y(ys[i]) + 3, ys[i] + "%", { fs: 8.2, ta: "end", f: "#7b8794" });
    }
    var ps = [0, 4, 8, 12, 16, 20];
    for (i = 0; i < 6; i++) tx(S, g.X(ps[i]), y1 + 14, "" + ps[i], { fs: 8.4, ta: "middle", f: "#7b8794" });
    tx(S, (x0 + x1) / 2, y1 + 28, "克隆化培养代数 p（代）", { fs: 8.8, ta: "middle", f: "#5b6673" });
    var d = "", p, av;
    for (p = 0; p <= 20.001; p += 0.5) {
      av = 100 / (1 + Math.exp(-(p - 8) / 2));
      d += (d ? "L" : "M") + g.X(p).toFixed(1) + "," + g.Y(av).toFixed(1);
    }
    mk("path", { d: d, fill: "none", stroke: "#2f8a5b", "stroke-width": 2.4, "stroke-linejoin": "round" }, S);
    tx(S, g.X(8) + 7, g.Y(50) - 8, "p=8 → 50%", { fs: 8.6, fw: 700, f: "#2f8a5b" });
    g.vl = mk("line", { x1: 0, y1: y0, x2: 0, y2: y1, stroke: "#b8791f", "stroke-width": 1.1, "stroke-dasharray": "4 3" }, S);
    g.hl = mk("line", { x1: x0, y1: 0, x2: 0, y2: 0, stroke: "#b8791f", "stroke-width": 1.1, "stroke-dasharray": "4 3" }, S);
    g.dot = mk("circle", { cx: 0, cy: 0, r: 6, fill: "#b8791f", stroke: "#ffffff", "stroke-width": 2 }, S);
    g.dt = tx(S, 0, 0, "", { fs: 9.6, fw: 700, f: "#b8791f" });

    mk("rect", { x: W ? 528 : 22, y: W ? 80 : 364, width: W ? 320 : 316, height: W ? 302 : 272, rx: 8, fill: "#ffffff", stroke: "#dbe7ef" }, gB);
    tx(gB, W ? 544 : 34, W ? 102 : 386, "p 落在哪一段", { fs: W ? 10 : 9.6, fw: 700, f: "#151a21" });
    var rows = [["p < 5", "刚扩增，抗体产量低"], ["5 ≤ p ≤ 12", "快速上升，斜率最大"], ["12 < p ≤ 14", "上升变缓，逼近平台"], ["p > 14", "接近饱和，可收集抗体"]];
    var ry = W ? [120, 162, 204, 246] : [394, 430, 466, 502];
    var rh = W ? 38 : 30;
    for (i = 0; i < 4; i++) {
      var bg = mk("rect", { x: W ? 540 : 30, y: ry[i], width: 296, height: rh, rx: 6, fill: "#f4f7f9", stroke: "#e2ebf2" }, gB);
      var lab = tx(gB, W ? 552 : 38, ry[i] + (W ? 16 : 12), rows[i][0], { fs: W ? 9.4 : 8.8, fw: 700, f: "#5b6673" });
      tx(gB, W ? 552 : 38, ry[i] + (W ? 30 : 24), rows[i][1], { fs: W ? 8.4 : 8, f: "#7b8794" });
      g.rows.push({ bg: bg, lb: lab });
    }
    tx(gB, W ? 546 : 34, W ? 306 : 560, "ab = 100 ÷ [1 + e^(−(p−8)/2)]", { fs: W ? 8.6 : 8.4, f: "#3a3a35" });
    tx(gB, W ? 546 : 34, W ? 326 : 580, "p=8 → 50%（半效点）", { fs: W ? 8.8 : 8.4, f: "#2f8a5b", fw: 700 });
    tx(gB, W ? 546 : 34, W ? 346 : 598, "曲线形状示意，不对应实测值", { fs: W ? 8.2 : 7.8, f: "#7b8794" });
    return g;
  }

  function render() {
    if (!stage) return;
    var w = stage.parentElement ? stage.parentElement.getBoundingClientRect().width : 880;
    var nl = w >= 640 ? "W" : "N";
    if (!G || nl !== L) { L = nl; G = geom(); }
    var s = calc(A), px = G.X(s.p), py = G.Y(s.ab), i, on;
    G.vl.setAttribute("x1", px); G.vl.setAttribute("x2", px);
    G.hl.setAttribute("y1", py); G.hl.setAttribute("y2", py); G.hl.setAttribute("x2", px);
    G.dot.setAttribute("cx", px); G.dot.setAttribute("cy", py);
    G.dt.setAttribute("x", Math.min(px + 10, G.x1 - 44));
    G.dt.setAttribute("y", Math.max(py - 10, G.y0 + 16));
    G.dt.textContent = s.ab.toFixed(1) + "%";
    var act = s.p < 5 ? 0 : s.p <= 12 ? 1 : s.p <= 14 ? 2 : 3;
    for (i = 0; i < G.rows.length; i++) {
      on = i === act;
      G.rows[i].bg.setAttribute("fill", on ? "#eef7f1" : "#f4f7f9");
      G.rows[i].bg.setAttribute("stroke", on ? "#b8e6d0" : "#e2ebf2");
      G.rows[i].lb.setAttribute("fill", on ? "#2f8a5b" : "#5b6673");
    }
    if (Va) Va.textContent = s.p + " 代";
    if (Vb) Vb.textContent = s.ab.toFixed(1) + "%";
    if (Vc) Vc.textContent = s.gap.toFixed(1);
    if (Vs) Vs.textContent = s.st;
    if (Vsn) Vsn.textContent = s.low ? "还在适应，别急着收集" : s.top ? "再加代数也换不来产量" : "每代增幅最大，值得扩增";
    if (St) {
      var col = s.low ? "#b8791f" : s.top ? "#2f8a5b" : "#2f8a5b";
      St.style.background = s.low ? "#fdf3e0" : "#e6f6ee";
      St.style.borderColor = col + "44";
      if (Vs) Vs.style.color = col;
    }
  }

  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    if (!apBadge) return;
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  sl.addEventListener("input", function () { A = +sl.value; render(); });
  stage.addEventListener("click", function () {
    var k = [0, 4, 8, 20], i;
    for (i = 0; i < 4; i++) if (k[i] > A) { A = k[i]; sl.value = k[i]; render(); return; }
    A = 0; sl.value = 0; render();
  });
  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { A = Math.min(20, A + 1); sl.value = A; render(); e.preventDefault(); }
    if (e.key === "ArrowLeft") { A = Math.max(0, A - 1); sl.value = A; render(); e.preventDefault(); }
  });

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(render, 150); });

  var ap = AutoPilot.create({
    mount: stage,
    follow: sl,
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 8 }, { t: 6.5, v: 8 }, { t: 9, v: 20 }, { t: 11, v: 16 }, { t: 13, v: 0 }],
    keys: [0, 4, 8, 20],
    value: A, min: 0, max: 20, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; sl.value = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 4, eq: { ab: 11.9 } },
    { v: 8, eq: { ab: 50 } },
    { v: 16, eq: { ab: 98.2 } }
  ] };

  render();
});
