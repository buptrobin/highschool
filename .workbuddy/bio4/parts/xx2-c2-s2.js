/* 互动：年降水量 P → 植被盖度与群落类型（示意模型） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", narrow: false, left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", narrow: true, left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 500;

  /* 唯一真值：P（mm）→ 盖度%、类型 1/2/3、相对分界的差值 */
  function calc(v) {
    var cover = Math.min(100, v / 10);
    var kind = v < 300 ? 1 : v < 600 ? 2 : 3;
    var bd = v > 600 ? 600 : 300;
    return { cover: cover, kind: kind, gap: v - bd };
  }

  function geom() {
    var l = L.left, r = L.right, n = L.narrow;
    return {
      n: n,
      axX0: l.x + (n ? 24 : 40),
      axX1: l.x + l.w - (n ? 24 : 40),
      axY: l.y + l.h * 0.36,
      cvY: l.y + l.h * 0.72,
      baseY: r.y + r.h * 0.72,
      ax0: r.x + (n ? 14 : 20),
      ax1: r.x + r.w - (n ? 14 : 20)
    };
  }

  function px(p) { return G.axX0 + (p / 1000) * (G.axX1 - G.axX0); }

  function drawLeft(s) {
    var g = $("gxA"), geo = G, n = geo.n, l = L.left, fs = n ? 9 : 10;
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, g);
    tx(g, l.x + (n ? 16 : 20), l.y + (n ? 26 : 30), "降水轴：0–1000 mm", "#5a6472", "start", n ? 9.5 : 10.5, 700);

    var top = geo.axY - 14, hh = 28;
    el("rect", { x: px(0), y: top, width: px(300) - px(0), height: hh, rx: 4, fill: "#f6e3c4" }, g);
    el("rect", { x: px(300), y: top, width: px(600) - px(300), height: hh, fill: "#e3efc9" }, g);
    el("rect", { x: px(600), y: top, width: px(1000) - px(600), height: hh, rx: 4, fill: "#cfe8d8" }, g);
    tx(g, (px(0) + px(300)) / 2, top + 18, "荒漠", "#8a5a1f", "middle", fs, 700);
    tx(g, (px(300) + px(600)) / 2, top + 18, "草原", "#4d7a2a", "middle", fs, 700);
    tx(g, (px(600) + px(1000)) / 2, top + 18, "森林", "#2f7a52", "middle", fs, 700);

    el("line", { x1: px(0), y1: top + hh + 6, x2: px(1000), y2: top + hh + 6, stroke: "#a9b6c2", "stroke-width": 1 }, g);
    el("line", { x1: px(300), y1: top + hh + 2, x2: px(300), y2: top + hh + 11, stroke: "#b8402f", "stroke-width": 1.4 }, g);
    el("line", { x1: px(600), y1: top + hh + 2, x2: px(600), y2: top + hh + 11, stroke: "#b8791f", "stroke-width": 1.4 }, g);
    tx(g, px(0), top + hh + 24, "0", "#5a6472", "middle", fs - 1, 400);
    tx(g, px(300), top + hh + 24, "300", "#b8402f", "middle", fs - 1, 700);
    tx(g, px(600), top + hh + 24, "600", "#b8791f", "middle", fs - 1, 700);
    tx(g, px(1000), top + hh + 24, "1000", "#5a6472", "middle", fs - 1, 400);

    var mx = px(A);
    el("polygon", { points: (mx - 5) + "," + (top - 10) + " " + (mx + 5) + "," + (top - 10) + " " + mx + "," + (top - 2), fill: "#3d4a57" }, g);
    tx(g, mx, top - 20, "P=" + Math.round(A), "#151a21", "middle", n ? 10 : 11.5, 700);

    var cw = geo.axX1 - geo.axX0, fy = geo.cvY, fh = n ? 12 : 16;
    var col = s.kind === 1 ? "#b8402f" : s.kind === 2 ? "#b8791f" : "#2f8a5b";
    tx(g, geo.axX0, (top + hh + 24 + fy - 14) / 2 + 3, "P 落在哪条色带，就属于哪类群落", "#8a939e", "start", fs - 0.5, 400);
    tx(g, geo.axX0, fy - 14, "植被盖度", "#5a6472", "start", fs, 700);
    tx(g, geo.axX1, fy - 14, Math.round(s.cover) + "%", col, "end", fs, 700);
    el("rect", { x: geo.axX0, y: fy, width: cw, height: fh, rx: fh / 2, fill: "#e9eef2" }, g);
    el("rect", { x: geo.axX0, y: fy, width: Math.max(2, cw * s.cover / 100), height: fh, rx: fh / 2, fill: col, opacity: 0.85 }, g);
    tx(g, geo.axX0, fy + fh + (n ? 24 : 28), "盖度 = min(100, P/10)", "#8a939e", "start", n ? 8.5 : 9.5, 400);
    tx(g, geo.axX0, fy + fh + (n ? 42 : 48), "色带 = 类型；三角 = 当前 P", "#8a939e", "start", n ? 8.5 : 9.5, 400);
  }

  function drawRight(s) {
    var g = $("gxB"), geo = G, n = geo.n, r = L.right, base = geo.baseY, fs = n ? 9 : 10;
    var x0 = geo.ax0, w = geo.ax1 - geo.ax0, i, x, k;
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, g);
    var names = ["", "① 荒漠生物群落", "② 草原生物群落", "③ 森林生物群落"];
    var tips = ["", "年降水不足 300 mm：水分最少", "年降水 300–600 mm：水分居中", "年降水超过 600 mm：水分最多"];
    tx(g, r.x + (n ? 16 : 20), r.y + (n ? 28 : 34), names[s.kind], "#151a21", "start", n ? 10.5 : 12, 700);
    tx(g, r.x + (n ? 16 : 20), r.y + (n ? 48 : 56), tips[s.kind], "#5a6472", "start", fs - 0.5, 400);

    for (i = 0; i < 40; i++) {
      x = x0 + (w * i) / 40;
      el("line", { x1: x, y1: base, x2: x, y2: base + (n ? 7 : 9), stroke: "#c9a06a", "stroke-width": 1 }, g);
    }
    el("line", { x1: x0, y1: base, x2: x0 + w, y2: base, stroke: "#a9a08a", "stroke-width": 1.6 }, g);
    var labY = base + (n ? 30 : 36);

    if (s.kind === 1) {
      el("rect", { x: x0, y: base - (n ? 116 : 146), width: w, height: n ? 20 : 26, fill: "#f2f5f8", stroke: "#c9d2da", "stroke-dasharray": "6 4" }, g);
      tx(g, x0 + 8, base - (n ? 124 : 154), "无乔木层，植株稀疏", "#5a6472", "start", fs, 700);
      tx(g, x0 + w / 2, base - (n ? 102 : 128), "该层不存在", "#9aa8b4", "middle", fs - 0.5, 400);
      var sx = x0 + w * 0.78, sy = base - (n ? 186 : 222), sr = n ? 17 : 24;
      el("circle", { cx: sx, cy: sy, r: sr, fill: "none", stroke: "#d19a3f", "stroke-width": 1.6 }, g);
      for (k = 0; k < 8; k++) {
        var a = k * Math.PI / 4;
        el("line", {
          x1: sx + Math.cos(a) * (sr + 1), y1: sy + Math.sin(a) * (sr + 1),
          x2: sx + Math.cos(a) * (sr + 6), y2: sy + Math.sin(a) * (sr + 6),
          stroke: "#d19a3f", "stroke-width": 1.4
        }, g);
      }
      var fr = [0.1, 0.33, 0.54];
      for (i = 0; i < 3; i++) {
        x = x0 + w * fr[i];
        var hgt = n ? 22 : 30;
        el("rect", { x: x - 3.5, y: base - hgt, width: 7, height: hgt, rx: 3.4, fill: "#9aa87a" }, g);
        el("rect", { x: x - (n ? 9 : 12), y: base - hgt * 0.62, width: n ? 8 : 10, height: 4.6, rx: 2.3, fill: "#9aa87a" }, g);
        el("rect", { x: x + 2, y: base - hgt * 0.42, width: n ? 8 : 10, height: 4.6, rx: 2.3, fill: "#9aa87a" }, g);
      }
      tx(g, x0, labY, "盖度常在 10% 以下", "#b8402f", "start", fs, 700);
      tx(g, x0, labY + (n ? 20 : 24), "植株稀疏矮小，地表大片裸露", "#3a3a35", "start", fs, 400);
      tx(g, x0, labY + (n ? 36 : 44), "深根、小叶、气孔昼闭：对缺水的适应", "#3a3a35", "start", fs, 400);
    } else if (s.kind === 2) {
      el("rect", { x: x0, y: base - (n ? 150 : 200), width: w, height: n ? 24 : 30, fill: "#f2f5f8", stroke: "#b9c4ce", "stroke-dasharray": "6 4" }, g);
      tx(g, x0 + 8, base - (n ? 158 : 208), "乔木层缺失：水分不足以维持乔木", "#5a6472", "start", fs, 700);
      tx(g, x0 + w / 2, base - (n ? 134 : 182), "该层不存在", "#9aa8b4", "middle", fs - 0.5, 400);
      for (i = 0; i < 16; i++) {
        x = x0 + (w * (i + 0.5)) / 16;
        var h2 = (n ? 36 : 50) + (i % 3) * (n ? 6 : 10);
        el("path", { d: "M" + x + " " + base + " q" + (i % 2 ? -5 : 5) + " " + (-h2 * 0.6) + " 0 " + (-h2), stroke: "#7fa04e", "stroke-width": 1.7, fill: "none" }, g);
      }
      for (i = 0; i < 6; i++) {
        x = x0 + (w * (i + 0.5)) / 6;
        el("path", { d: "M" + x + " " + base + " q4 " + (n ? 12 : 15) + " 2 " + (n ? 18 : 22), stroke: "#a9a06a", "stroke-width": 1.1, fill: "none" }, g);
      }
      tx(g, x0, labY, "无乔木层，草本连片", "#b8791f", "start", fs, 700);
      tx(g, x0, labY + (n ? 20 : 24), "季相变化明显，优势种随季节更替", "#3a3a35", "start", fs, 400);
      tx(g, x0, labY + (n ? 36 : 44), "水分不足以维持乔木，只能长草", "#3a3a35", "start", fs, 400);
    } else {
      var tr = [0.18, 0.5, 0.8];
      for (i = 0; i < 3; i++) {
        x = x0 + w * tr[i];
        var th = (n ? 118 : 166) + (i === 1 ? (n ? 18 : 24) : 0);
        var tw = n ? 5 : 7;
        el("rect", { x: x - tw / 2, y: base - th, width: tw, height: th + (n ? 6 : 8), fill: "#8a6a45" }, g);
        el("circle", { cx: x, cy: base - th - (n ? 8 : 10), r: n ? 26 : 34, fill: "#8fc7a6", opacity: 0.85 }, g);
        if (i !== 1) el("circle", { cx: x + (n ? 14 : 18), cy: base - th + (n ? 8 : 10), r: n ? 17 : 22, fill: "#a6d4b8", opacity: 0.8 }, g);
      }
      el("circle", { cx: x0 + w * 0.34, cy: base - (n ? 30 : 42), r: n ? 15 : 20, fill: "#cfe0a8" }, g);
      for (i = 0; i < 8; i++) {
        x = x0 + (w * (i + 0.5)) / 8;
        el("path", { d: "M" + x + " " + base + " q4 " + (n ? -12 : -16) + " 0 " + (n ? -20 : -26), stroke: "#7fa04e", "stroke-width": 1.6, fill: "none" }, g);
      }
      tx(g, x0, labY, "乔木层 · 灌木层 · 草本层", "#2f8a5b", "start", fs, 700);
      tx(g, x0, labY + (n ? 20 : 24), "三层齐全，林冠截住大部分光照", "#3a3a35", "start", fs, 400);
      tx(g, x0, labY + (n ? 36 : 44), "水分充足，能维持高大乔木", "#3a3a35", "start", fs, 400);
    }
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = String(Math.round(s.cover));
    $("gxVc").textContent = (s.gap > 0 ? "+" : "") + Math.round(s.gap);
    if (s.kind === 1) { st = "荒漠"; col = "#b8402f"; bg = "#fbeae7"; sn = "P 不足 300 mm，水分最少"; }
    else if (s.kind === 2) { st = "草原"; col = "#b8791f"; bg = "#fdf3e0"; sn = "300–600 mm，水分居中"; }
    else { st = "森林"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "P 超过 600 mm，水分最多"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    drawLeft(s);
    drawRight(s);
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    G = null;
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
    loop: [{ t: 0, v: 100 }, { t: 1.2, v: 100 }, { t: 4, v: 500 }, { t: 6.5, v: 500 }, { t: 9, v: 1000 }, { t: 11, v: 700 }, { t: 13, v: 100 }],
    keys: [100, 500, 700, 1000],
    value: A, min: 100, max: 1000, step: 10,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 200, eq: { cover: 20, kind: 1 } },
    { v: 500, eq: { cover: 50, kind: 2 } },
    { v: 900, eq: { cover: 90, kind: 3 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
