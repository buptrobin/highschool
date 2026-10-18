/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 2, G = null;

  /* 纯函数：底数 a → 两个对数值与单调性 */
  function calc(v) {
    var a = Math.round(v * 10) / 10;
    if (a < 0.2) a = 0.2;
    if (a > 5) a = 5;
    var ok = Math.abs(a - 1) > 0.05;
    var l2 = ok ? Math.log(2) / Math.log(a) : NaN;
    return { a: a, ok: ok, l2: l2, l4: 2 * l2, mono: a > 1 ? 1 : (a < 1 ? -1 : 0) };
  }

  function geom() {
    var lp = L.left, rp = L.right, wide = L === W;
    var r1 = rp.y + (wide ? 92 : 86);
    return {
      ox: lp.x + (wide ? 52 : 44),
      oy: lp.y + lp.h * 0.56,
      xu: (lp.w - (wide ? 76 : 64)) / 9,
      yu: wide ? 42 : 26,
      zx: rp.x + rp.w * 0.5,
      sc: (rp.w * 0.5 - 34) / 2.5,
      r1: r1,
      r2: r1 + (wide ? 96 : 92)
    };
  }

  function curve(g, a, col, wd) {
    if (!a || Math.abs(a - 1) < 0.04) return;
    var d = "", on = false, i, x, y;
    for (i = 0; i <= 140; i++) {
      x = 0.02 * Math.pow(450, i / 140);
      y = Math.log(x) / Math.log(a);
      if (!isFinite(y) || y < -3 || y > 3) { on = false; continue; }
      d += (on ? "L" : "M") + (G.ox + x * G.xu).toFixed(1) + " " + (G.oy - y * G.yu).toFixed(1) + " ";
      on = true;
    }
    if (d) el("path", { d: d, fill: "none", stroke: col, "stroke-width": wd, "stroke-linecap": "round" }, g);
  }

  function dot(g, x, y, col, r) {
    el("circle", { cx: x, cy: y, r: r || 3.6, fill: "#ffffff", stroke: col, "stroke-width": 2 }, g);
  }

  function bar(g, name, v, y, ok, col) {
    var zx = G.zx, good = ok && isFinite(v), w = good ? Math.max(-2.5, Math.min(2.5, v)) * G.sc : 0;
    tx(g, L.right.x + 18, y - 14, name + (good ? " = " + v.toFixed(2) : " = —"), col, "start", 10, 700);
    el("rect", { x: Math.min(zx, zx + w), y: y, width: Math.max(2, Math.abs(w)), height: 20, rx: 4, fill: col, opacity: 0.16 }, g);
    el("rect", { x: Math.min(zx, zx + w), y: y, width: Math.max(2, Math.abs(w)), height: 20, rx: 4, fill: "none", stroke: col, "stroke-width": 1 }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), lp = L.left, rp = L.right, wide = L === W;

    el("rect", { x: lp.x, y: lp.y, width: lp.w, height: lp.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: rp.x, y: rp.y, width: rp.w, height: rp.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, lp.x + 18, lp.y + 26, "y = log_a x 的图象", "#5a6472", "start", 10.5, 700);
    tx(gB, rp.x + 18, rp.y + 26, "log_a 4 = 2·log_a 2", "#5a6472", "start", 10.5, 700);

    var ax = G.ox + 9 * G.xu, ay = G.oy - 3 * G.yu - 6;
    el("line", { x1: G.ox - 22, y1: G.oy, x2: ax - 8, y2: G.oy, stroke: "#8b95a3", "stroke-width": 1.1 }, gA);
    el("path", { d: "M" + ax + " " + G.oy + " L" + (ax - 10) + " " + (G.oy - 4.5) + " L" + (ax - 10) + " " + (G.oy + 4.5) + " Z", fill: "#8b95a3" }, gA);
    el("line", { x1: G.ox, y1: G.oy + 26, x2: G.ox, y2: ay + 11, stroke: "#8b95a3", "stroke-width": 1.1 }, gA);
    el("path", { d: "M" + G.ox + " " + ay + " L" + (G.ox - 4.5) + " " + (ay + 10) + " L" + (G.ox + 4.5) + " " + (ay + 10) + " Z", fill: "#8b95a3" }, gA);
    tx(gA, ax - 2, G.oy - 7, "x", "#5a6472", "end", 10, 700);
    tx(gA, G.ox + 7, ay + 10, "y", "#5a6472", "start", 10, 700);

    /* 参照曲线 + 当前曲线 */
    curve(gA, 2, "#cfe0f7", 2.6);
    curve(gA, 0.5, "#f7d6d0", 2.6);
    var col = s.mono > 0 ? "#2563eb" : (s.mono < 0 ? "#b8402f" : "#b8791f");
    curve(gA, s.a, col, 2.6);

    /* 恒过 (1,0) */
    var p1x = G.ox + G.xu, p0y = G.oy;
    el("line", { x1: p1x - 5, y1: p0y, x2: p1x + 5, y2: p0y, stroke: "#151a21", "stroke-width": 0.8 }, gA);
    el("line", { x1: p1x, y1: p0y - 5, x2: p1x, y2: p0y + 5, stroke: "#151a21", "stroke-width": 0.8 }, gA);
    dot(gA, p1x, p0y, "#151a21", 3.4);
    tx(gA, p1x + 9, p0y + (wide ? 20 : 17), "(1,0)", "#151a21", "start", 9.4, 700);

    /* x=2、x=4 处的两个对数值 */
    if (s.ok && isFinite(s.l2)) {
      var pts = [{ x: 2, v: s.l2, t: "log_a 2" }, { x: 4, v: s.l4, t: "log_a 4" }];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (Math.abs(p.v) > 2.85) continue;
        var X = G.ox + p.x * G.xu, Y = G.oy - p.v * G.yu;
        el("line", { x1: X, y1: G.oy, x2: X, y2: Y, stroke: col, "stroke-width": 0.9, "stroke-dasharray": "3 3", opacity: 0.7 }, gA);
        dot(gA, X, Y, col, 3.4);
        tx(gA, X + 7, Y - 8, p.t + " = " + p.v.toFixed(2), col, "start", 9, 700);
      }
    }
    if (!s.ok) {
      tx(gA, G.ox + 2 * G.xu, G.oy - G.yu * 1.4, "a = 1：对数不存在", "#b8402f", "start", 9.6, 700);
    }

    /* 右栏：两个数条形对照 */
    el("line", { x1: G.zx, y1: G.r1 - 26, x2: G.zx, y2: G.r2 + 46, stroke: "#c9d2dd", "stroke-width": 1 }, gB);
    tx(gB, G.zx, G.r2 + 44, "0", "#8b95a3", "middle", 8.6, 400);
    bar(gB, "log_a 2", s.l2, G.r1, s.ok, "#2563eb");
    bar(gB, "log_a 4", s.l4, G.r2, s.ok, "#2f8a5b");
    var by = G.r2 + (wide ? 76 : 70);
    tx(gB, rp.x + 18, by, "a=2：log₂2=1、log₂4=2", "#3a3a35", "start", 9.4, 400);
    tx(gB, rp.x + 18, by + 18, "真数翻倍 ⇒ 对数值加 1", "#3a3a35", "start", 9.4, 400);
    if (!s.ok) tx(gB, rp.x + 18, by + 40, "a=1 时底数不合法，两个数都没意义", "#b8402f", "start", 9.2, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = s.a.toFixed(1);
    $("gxVb").textContent = s.ok ? s.l2.toFixed(2) : "—";
    $("gxVc").textContent = s.ok ? s.l4.toFixed(2) : "—";
    if (!s.ok) { st = "a=1 无意义"; col = "#b8402f"; bg = "#fbeae7"; sn = "底数不能等于 1"; }
    else if (s.mono > 0) { st = "递增"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "a>1，真数越大值越大"; }
    else { st = "递减"; col = "#b8791f"; bg = "#fdf3e0"; sn = "0<a<1，真数越大值越小"; }
    if (s.ok) { st = s.mono > 0 ? "递增 · 过 (1,0)" : "递减 · 过 (1,0)"; }
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
    loop: [{ t: 0, v: 0.5 }, { t: 1.2, v: 0.5 }, { t: 4, v: 2 }, { t: 6.5, v: 2 }, { t: 9, v: 4 }, { t: 11.5, v: 0.5 }, { t: 13.5, v: 0.5 }],
    keys: [0.5, 2, 4],
    value: A, min: 0.2, max: 5, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 2, eq: { l2: 1, l4: 2 } },
    { v: 0.5, eq: { l2: -1, l4: -2 } },
    { v: 4, eq: { l2: 0.5, l4: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
