/* xx1-c3-s1 椭圆 · 互动：滑块 = 短半轴 b，长半轴 a = 5 固定 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 340 }, right: { x: 8, y: 356, w: 344, h: 336 } };
  var L = W, A = 3, G = null;

  /* 唯一真值：b → c、e */
  function calc(v) {
    var b = Number(v), a = 5;
    var c = Math.sqrt(Math.max(0, a * a - b * b));
    return { a: a, b: b, c: c, e: c / a };
  }
  function fmt(x) { return Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(1); }

  function ln(g, x1, y1, x2, y2, col, w, dash) {
    var o = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": w || 1.2 };
    if (dash) o["stroke-dasharray"] = dash;
    return el("line", o, g);
  }
  function dot(g, x, y, r, col) { return el("circle", { cx: x, cy: y, r: r, fill: col }, g); }

  function geom() {
    var lf = L.left, rt = L.right;
    var s = Math.min((lf.w - 96) / 10, (lf.h - 118) / 10);
    return { s: s, cx: lf.x + lf.w / 2, cy: lf.y + lf.h * 0.56, lf: lf, rt: rt };
  }

  function draw() {
    var d = calc(A), gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var lf = L.left, rt = L.right, s = G.s, cx = G.cx, cy = G.cy;
    var R = 5 * s;

    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lf.x + 20, lf.y + 28, "坐标轴 + 椭圆（a = 5 固定）", "#5a6472", "start", 10.5, 700);
    tx(gA, lf.x + 20, lf.y + 48, "b = " + fmt(d.b) + "　c = " + d.c.toFixed(2) + "　e = " + d.e.toFixed(3), "#8a94a6", "start", 9.6, 400);

    /* 坐标轴（带箭头与刻度） */
    ln(gA, cx - R - 18, cy, cx + R + 18, cy, "#9aa6b4", 1.1);
    ln(gA, cx, cy + R + 18, cx, cy - R - 18, "#9aa6b4", 1.1);
    el("polygon", { points: (cx + R + 26) + "," + cy + " " + (cx + R + 16) + "," + (cy - 4.5) + " " + (cx + R + 16) + "," + (cy + 4.5), fill: "#9aa6b4" }, gA);
    el("polygon", { points: cx + "," + (cy - R - 26) + " " + (cx - 4.5) + "," + (cy - R - 16) + " " + (cx + 4.5) + "," + (cy - R - 16), fill: "#9aa6b4" }, gA);
    tx(gA, cx + R + 26, cy - 8, "x", "#8a94a6", "middle", 10, 700);
    tx(gA, cx + 9, cy - R - 24, "y", "#8a94a6", "start", 10, 700);
    for (var i = 1; i <= 5; i++) {
      ln(gA, cx + i * s, cy - 3, cx + i * s, cy + 3, "#9aa6b4", 1);
      ln(gA, cx - i * s, cy - 3, cx - i * s, cy + 3, "#9aa6b4", 1);
    }
    tx(gA, cx + R, cy + 15, "5", "#8a94a6", "middle", 9, 400);
    tx(gA, cx - R, cy + 15, "−5", "#8a94a6", "middle", 9, 400);

    /* 极限：b→a 时的圆（虚线参考） */
    el("ellipse", { cx: cx, cy: cy, rx: R, ry: R, fill: "none", stroke: "#c8d2dc", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    /* 椭圆本身 */
    el("ellipse", { cx: cx, cy: cy, rx: R, ry: Math.max(2, d.b * s), fill: "rgba(37,99,235,.07)", stroke: "#2563eb", "stroke-width": 2 }, gA);
    /* 焦点 */
    dot(gA, cx - d.c * s, cy, 4, "#b8402f");
    dot(gA, cx + d.c * s, cy, 4, "#b8402f");
    tx(gA, cx - d.c * s - 6, cy + 20, "F₁", "#b8402f", "end", 9.6, 700);
    tx(gA, cx + d.c * s + 6, cy + 20, "F₂", "#b8402f", "start", 9.6, 700);
    dot(gA, cx, cy, 2.6, "#5a6472");
    tx(gA, cx - 7, cy - 7, "O", "#5a6472", "end", 9.4, 700);

    /* a、b、c 直角三角形：O(0,0)、B(0,b)、F(c,0) */
    var by = cy - d.b * s, fx = cx + d.c * s;
    ln(gA, cx, cy, cx, by, "#b8791f", 1.6);
    ln(gA, cx, cy, fx, cy, "#2f8a5b", 1.6);
    ln(gA, cx, by, fx, cy, "#2563eb", 1.6);
    ln(gA, cx, cy, cx + 11, cy, "#8a94a6", 1);
    ln(gA, cx + 11, cy, cx + 11, cy - 11, "#8a94a6", 1);
    tx(gA, cx - 8, (cy + by) / 2, "b", "#b8791f", "end", 10.5, 700);
    tx(gA, (cx + fx) / 2, cy + 15, "c", "#2f8a5b", "middle", 10.5, 700);
    tx(gA, (cx + fx) / 2 + 10, (cy + by) / 2 - 6, "a", "#2563eb", "start", 10.5, 700);
    tx(gA, cx + 6, by - 6, "B(0, b)", "#b8791f", "start", 8.8, 400);

    /* 右栏：离心率标尺 */
    el("rect", { x: rt.x, y: rt.y, width: rt.w, height: rt.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rt.x + 20, rt.y + 28, "离心率 e 标尺（0 < e < 1）", "#5a6472", "start", 10.5, 700);
    var x0 = rt.x + 48, x1 = rt.x + rt.w - 48, ry = rt.y + 108;
    ln(gB, x0, ry, x1, ry, "#c8d2dc", 1.4);
    ln(gB, x0, ry, x0 + (x1 - x0) * d.e, ry, "#b8402f", 3);
    ln(gB, x0, ry - 8, x0, ry + 8, "#9aa6b4", 1.2);
    ln(gB, x0 + (x1 - x0) / 2, ry - 6, x0 + (x1 - x0) / 2, ry + 6, "#9aa6b4", 1.2);
    ln(gB, x1, ry - 8, x1, ry + 8, "#9aa6b4", 1.2);
    tx(gB, x0, ry + 19, "0", "#8a94a6", "middle", 9, 400);
    tx(gB, x0 + (x1 - x0) / 2, ry + 19, "0.5", "#8a94a6", "middle", 9, 400);
    tx(gB, x1, ry + 19, "1", "#8a94a6", "middle", 9, 400);
    dot(gB, x0 + (x1 - x0) * d.e, ry, 5.4, "#b8402f");
    tx(gB, x0 + (x1 - x0) * d.e, ry - 16, "e = " + d.e.toFixed(3), "#b8402f", "middle", 10, 700);
    tx(gB, x0, ry + 42, "← 越左越圆", "#2f8a5b", "start", 9.2, 400);
    tx(gB, x1, ry + 42, "越扁 →", "#b8402f", "end", 9.2, 400);

    var ty = ry + 76;
    ln(gB, rt.x + 24, ty - 18, rt.x + rt.w - 24, ty - 18, "#eef1f4", 1);
    tx(gB, rt.x + 24, ty, "c = √(25 − b²) = " + d.c.toFixed(2), "#3a3a35", "start", 9.8, 400);
    tx(gB, rt.x + 24, ty + 20, "e = c / a = " + d.c.toFixed(2) + " / 5", "#3a3a35", "start", 9.8, 400);
    tx(gB, rt.x + 24, ty + 40, "2a = 10.00 ＞ 2c = " + (2 * d.c).toFixed(2), "#2f8a5b", "start", 9.8, 700);
    tx(gB, rt.x + 24, ty + 60, "b → a（4.5）时 c → 0，e → 0", "#5a6472", "start", 9.8, 400);
    tx(gB, rt.x + 24, ty + 80, "0 < e < 1：e 越大越扁", "#b8791f", "start", 9.8, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = fmt(s.b);
    $("gxVb").textContent = s.c.toFixed(2);
    $("gxVc").textContent = s.e.toFixed(3);
    if (s.b <= 2) { st = "很扁"; col = "#b8402f"; bg = "#fbeae7"; sn = "b 小 → c 大 → e 大，越扁"; }
    else if (s.b <= 3.5) { st = "偏扁"; col = "#b8791f"; bg = "#fdf3e0"; sn = "e 居中，椭圆被压着"; }
    else { st = "接近圆"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "b 逼近 a，e 趋近 0"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    G = geom();
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 4 }, { t: 6.5, v: 4 }, { t: 9, v: 4.5 }, { t: 11.5, v: 4.5 }, { t: 13, v: 2.5 }, { t: 14.5, v: 1 }],
    keys: [1, 2.5, 4, 4.5],
    value: A, min: 1, max: 4.5, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 3, eq: { c: 4, e: 0.8 } },
    { v: 4, eq: { c: 3, e: 0.6 } },
    { v: 4.5, eq: { c: 2.1794, e: 0.4359 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
