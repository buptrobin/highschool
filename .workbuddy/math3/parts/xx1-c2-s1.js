/* 互动脚本本体（build-page.mjs 会包进 <script>，这里不写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null, KMAX = 3.5, BD = Math.atan(3.5) * 180 / Math.PI, C = "#9aa6b2";

  /* 纯函数：倾斜角 → 斜率。render() 与 __model.cases 都调它 */
  function calc(v) {
    var a = Math.round(v), rad = a * Math.PI / 180;
    var ok = (a === 90 || a === 180) ? 0 : 1;
    var k = ok ? Math.round(Math.tan(rad) * 1000) / 1000 : null;
    var dir = a === 180 ? "越界" : (a === 90 ? "竖直" : (a === 0 ? "水平" : (a < 90 ? "上升" : "下降")));
    return { a: a, k: k, ok: ok, dir: dir, st: a === 180 ? "越界" : (ok ? "存在" : "不存在"), rad: rad };
  }

  function fmt(k) {
    if (k === null) return "不存在";
    if (Math.abs(k) < 1e-9) return "0";
    var s = Math.abs(k) >= 10 ? k.toFixed(1) : k.toFixed(2);
    if (s.indexOf(".") >= 0) s = s.replace(/\.?0+$/, "");
    return s;
  }

  function geom() {
    var lf = L.left, rt = L.right, wd = (L === W), g = { wd: wd };
    g.ox = lf.x + lf.w / 2;
    g.oy = lf.y + lf.h - (wd ? 96 : 62);
    g.R = wd ? 146 : 88;
    g.axL = wd ? 172 : 126;
    g.axU = wd ? 292 : 188;
    g.axD = wd ? 72 : 48;
    g.x0 = rt.x + (wd ? 44 : 34);
    g.x1 = rt.x + rt.w - (wd ? 26 : 20);
    g.yc = rt.y + (wd ? 214 : 178);
    g.ys = wd ? 114 : 76;
    return g;
  }

  function Xa(a) { return G.x0 + (a / 180) * (G.x1 - G.x0); }
  function Yk(k) { return G.yc - (k / KMAX) * G.ys; }
  function P(a, k) { return Xa(a).toFixed(1) + "," + Yk(k).toFixed(1); }

  /* 带箭头的轴 */
  function arw(g, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: C, "stroke-width": 1.6 }, g);
    el("polygon", { points: (x2 + ux * 6) + "," + (y2 + uy * 6) + " " + (x2 - ux * 5 - uy * 4.5) + "," + (y2 - uy * 5 + ux * 4.5) + " " + (x2 - ux * 5 + uy * 4.5) + "," + (y2 - uy * 5 - ux * 4.5), fill: C }, g);
  }
  function tic(g, x, y, w) { el("line", { x1: x, y1: y - w, x2: x, y2: y + w, stroke: C, "stroke-width": 1.3 }, g); }

  function branch(lo, hi) {
    var p = [], a, k;
    for (a = lo; a <= hi; a += 3) {
      k = Math.tan(a * Math.PI / 180);
      if (Math.abs(k) > KMAX) break;
      p.push(P(a, k));
    }
    return p;
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), g = G, lf = L.left, rt = L.right, i, p, kk, a1;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: rt.x, y: rt.y, width: rt.w, height: rt.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, lf.x + 18, lf.y + 28, "倾斜角 α 在坐标系里", "#5a6472", "start", 10.5, 700);
    tx(gB, rt.x + 18, rt.y + 28, "k=tanα 的一段", "#5a6472", "start", 10.5, 700);

    /* 左：坐标系（箭头 + 刻度） */
    arw(gA, g.ox - g.axL, g.oy, g.ox + g.axL + 2, g.oy);
    arw(gA, g.ox, g.oy + g.axD, g.ox, g.oy - g.axU - 2);
    var st = g.wd ? 38 : 27;
    for (i = 1; i <= 4; i++) { tic(gA, g.ox + i * st, g.oy, 3.5); tic(gA, g.ox - i * st, g.oy, 3.5); }
    tx(gA, g.ox - 16, g.oy + 16, "O", "#5a6472", "middle", 9.6, 400);
    tx(gA, g.ox + g.axL + 4, g.oy + 18, "x", "#5a6472", "middle", 9.6, 700);
    tx(gA, g.ox + 13, g.oy - g.axU + 4, "y", "#5a6472", "middle", 9.6, 700);

    /* 左：直线（α=90° 的竖直线单独画粗、变红） */
    var dx = Math.cos(s.rad), dy = -Math.sin(s.rad), vert = s.a === 90;
    if (s.a === 180) { dx = 1; dy = 0; }
    el("line", {
      x1: g.ox - dx * g.R * 0.4, y1: g.oy - dy * g.R * 0.4, x2: g.ox + dx * g.R, y2: g.oy + dy * g.R,
      stroke: vert ? "#b8402f" : "#2563eb", "stroke-width": vert ? 2.8 : 2.2
    }, gA);
    if (s.a > 0) {
      var r = g.wd ? 56 : 42, ex = g.ox + r * dx, ey = g.oy + r * dy, mrad = s.rad / 2, mr = r + (g.wd ? 24 : 18);
      el("path", { d: "M" + (g.ox + r) + "," + g.oy + " A" + r + "," + r + " 0 0 0 " + ex.toFixed(1) + "," + ey.toFixed(1), fill: "none", stroke: "#b8791f", "stroke-width": 1.8 }, gA);
      tx(gA, g.ox + mr * Math.cos(mrad), g.oy - mr * Math.sin(mrad) + 4, "α=" + s.a + "°", "#b8791f", "middle", 10.5, 700);
    }
    if (vert) el("path", { d: "M" + (g.ox + 14) + "," + g.oy + " L" + (g.ox + 14) + "," + (g.oy - 14) + " L" + g.ox + "," + (g.oy - 14), fill: "none", stroke: "#b8791f", "stroke-width": 1.4 }, gA);
    tx(gA, lf.x + 18, lf.y + lf.h - 18,
      s.a === 180 ? "180° 不是倾斜角：它与 0° 是同一条线" : (s.ok ? "k=" + fmt(s.k) + "，符号定上升或下降" : "α=90°：斜率不存在，不是 0"),
      s.ok && s.a !== 180 ? "#2563eb" : "#b8402f", "start", 9.6, 700);

    /* 右：k=tanα 的一段 */
    arw(gB, g.x0 - 16, g.yc, g.x1 + 1, g.yc);
    el("line", { x1: g.x0, y1: g.yc + g.ys + 12, x2: g.x0, y2: g.yc - g.ys - 12, stroke: C, "stroke-width": 1.5 }, gB);
    tx(gB, g.x0 - 7, g.yc - g.ys - 10, "k", "#5a6472", "end", 9.6, 700);
    var labs = [0, 45, 90, 135, 180];
    for (i = 0; i < 5; i++) {
      p = Xa(labs[i]);
      tic(gB, p, g.yc, 3.5);
      if (i === 2) tx(gB, p - 5, g.yc - 7, "90°", "#5a6472", "end", 8.8, 400);
      else tx(gB, p, g.yc + 15, labs[i] + "°", "#5a6472", i === 0 ? "start" : (i === 4 ? "end" : "middle"), 8.8, 400);
    }
    el("line", { x1: Xa(90), y1: g.yc - g.ys - 10, x2: Xa(90), y2: g.yc + g.ys + 10, stroke: "#b8402f", "stroke-width": 1.4, "stroke-dasharray": "5 4" }, gB);
    p = branch(0, 89);
    p.push(P(BD, KMAX));
    el("polyline", { points: p.join(" "), fill: "none", stroke: "#2563eb", "stroke-width": 2.2 }, gB);
    p = branch(180 - BD, 180);
    p.unshift(P(180 - BD, -KMAX));
    if (p.length < 2) p.push(P(180, 0));
    el("polyline", { points: p.join(" "), fill: "none", stroke: "#2563eb", "stroke-width": 2.2 }, gB);

    /* 右：当前点 */
    if (s.ok) {
      if (Math.abs(s.k) <= KMAX) {
        el("line", { x1: Xa(s.a), y1: Yk(s.k), x2: Xa(s.a), y2: g.yc, stroke: "#c9d3dd", "stroke-width": 1, "stroke-dasharray": "3 3" }, gB);
        el("circle", { cx: Xa(s.a), cy: Yk(s.k), r: 8, fill: "none", stroke: "#2563eb", "stroke-opacity": 0.35 }, gB);
        el("circle", { cx: Xa(s.a), cy: Yk(s.k), r: 4.6, fill: "#2563eb" }, gB);
      } else {
        kk = s.k > 0 ? Yk(KMAX) : Yk(-KMAX);
        el("circle", { cx: Xa(s.a), cy: kk, r: 4.6, fill: "#b8791f" }, gB);
        tx(gB, Xa(s.a) + 7, s.k > 0 ? kk - 4 : kk + 12, "超出显示", "#b8791f", "start", 8.4, 400);
      }
    } else {
      var mx = s.a === 180 ? Xa(180) : Xa(90);
      el("line", { x1: mx - 6, y1: g.yc - 6, x2: mx + 6, y2: g.yc + 6, stroke: "#b8402f", "stroke-width": 2 }, gB);
      el("line", { x1: mx - 6, y1: g.yc + 6, x2: mx + 6, y2: g.yc - 6, stroke: "#b8402f", "stroke-width": 2 }, gB);
      tx(gB, s.a === 180 ? mx - 10 : mx + 9, g.yc - 12, s.a === 180 ? "180° 不是倾斜角" : "k 不存在", "#b8402f", s.a === 180 ? "end" : "start", 8.8, 700);
    }
    tx(gB, g.x1, g.yc - g.ys - 12, "k = " + fmt(s.k), s.ok ? (s.k > 0 ? "#2563eb" : (s.k < 0 ? "#b8791f" : "#2f8a5b")) : "#b8402f", "end", 12, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = s.a + "°";
    $("gxVb").textContent = s.ok ? fmt(s.k) : "不存在";
    $("gxVc").textContent = s.dir;
    if (s.a === 180) { st = "越界"; col = "#b8402f"; bg = "#fbeae7"; sn = "180° 不是倾斜角"; }
    else if (s.a === 90) { st = "不存在"; col = "#b8402f"; bg = "#fbeae7"; sn = "α=90°，tan 无定义"; }
    else if (s.a === 0) { st = "存在"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "k=0，水平线"; }
    else if (s.a < 90) { st = "存在"; col = "#2563eb"; bg = "#eaf1fe"; sn = "k>0，直线上升"; }
    else { st = "存在"; col = "#b8791f"; bg = "#fdf3e0"; sn = "k<0，直线下降"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    $("gxVb").style.color = s.ok ? "#151a21" : col;
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
    mount: stage, follow: $("gxSl"),
    loop: [{ t: 0, v: 0 }, { t: 0.9, v: 0 }, { t: 3.2, v: 45 }, { t: 4.7, v: 45 }, { t: 7.2, v: 90 }, { t: 9.9, v: 90 }, { t: 11.9, v: 135 }, { t: 13.5, v: 0 }],
    keys: [0, 45, 90, 135],
    value: A, min: 0, max: 180, step: 5, idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 45, eq: { k: 1, ok: 1 } },
    { v: 135, eq: { k: -1, ok: 1 } },
    { v: 90, eq: { ok: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
