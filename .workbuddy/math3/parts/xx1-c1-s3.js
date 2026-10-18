/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 316, w: 344, h: 376 } };
  var L = W, G = null, A = 0;

  /* 纯函数：t → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var t = Number(v);
    return {
      dot: t,
      perp: t === 0 ? 1 : 0,
      absB: Math.sqrt(t * t + 1),
      cos: t / (Math.SQRT2 * Math.sqrt(t * t + 1))
    };
  }

  function geom() {
    var narrow = L === N;
    return {
      narrow: narrow,
      s: narrow ? 42 : 62,
      ox: narrow ? 172 : 218,
      oy: narrow ? 246 : 372,
      rx: L.right.x + 18,
      ry: L.right.y + 58,
      lh: narrow ? 25 : 30,
      fs: narrow ? 9.2 : 10.2
    };
  }

  /* 空间点 → 屏幕点：x 向右，y 向右上（进深），z 向上 */
  function P3(x, y, z) {
    return { x: G.ox + x * G.s + y * G.s * 0.55, y: G.oy - z * G.s - y * G.s * 0.45 };
  }

  function seg(g, p, q, col, w, dash) {
    var a = { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: col, "stroke-width": w || 1.4 };
    if (dash) a["stroke-dasharray"] = dash;
    el("line", a, g);
  }

  function head(g, p, q, col) {
    var an = Math.atan2(q.y - p.y, q.x - p.x), h = 9;
    el("polygon", {
      points: q.x + "," + q.y + " " +
        (q.x - h * Math.cos(an - 0.42)) + "," + (q.y - h * Math.sin(an - 0.42)) + " " +
        (q.x - h * Math.cos(an + 0.42)) + "," + (q.y - h * Math.sin(an + 0.42)),
      fill: col
    }, g);
  }

  function arrow(g, p, q, col, w) {
    seg(g, p, q, col, w || 2.4);
    head(g, p, q, col);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), lf = L.left, rg = L.right;

    /* 左：坐标系 + 两个向量 */
    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lf.x + 18, lf.y + 24, "空间直角坐标系中的 a 与 b", "#5a6472", "start", 10.5, 700);

    var O = P3(0, 0, 0), ax = P3(2.6, 0, 0), ay = P3(0, 2.2, 0), az = P3(0, 0, 2);
    arrow(gA, O, ax, "#5a6472", 1.3);
    arrow(gA, O, ay, "#5a6472", 1.3);
    arrow(gA, O, az, "#5a6472", 1.3);
    tx(gA, ax.x + 6, ax.y + 4, "x", "#5a6472", "start", 10.5, 700);
    tx(gA, ay.x + 5, ay.y - 6, "y", "#5a6472", "start", 10.5, 700);
    tx(gA, az.x - 6, az.y - 8, "z", "#5a6472", "end", 10.5, 700);
    tx(gA, O.x - 8, O.y + 16, "O", "#5a6472", "end", 10, 700);

    var u, q;
    for (u = 1; u <= 2; u++) {
      q = P3(u, 0, 0);
      seg(gA, { x: q.x, y: q.y - 4 }, { x: q.x, y: q.y + 4 }, "#9aa7b4", 1);
      q = P3(0, u, 0);
      seg(gA, { x: q.x - 2.6, y: q.y - 2.1 }, { x: q.x + 2.6, y: q.y + 2.1 }, "#9aa7b4", 1);
      q = P3(0, 0, u);
      seg(gA, { x: q.x - 4, y: q.y }, { x: q.x + 4, y: q.y }, "#9aa7b4", 1);
    }

    var pa = P3(1, 1, 0), pb = P3(A, 0, 1), foot = P3(A, 0, 0);
    seg(gA, pb, foot, "#9aa7b4", 1, "4 3");
    seg(gA, O, pa, "#2563eb", 2.4);
    head(gA, O, pa, "#2563eb");
    seg(gA, O, pb, "#2f8a5b", 2.4);
    head(gA, O, pb, "#2f8a5b");
    el("circle", { cx: foot.x, cy: foot.y, r: 2.6, fill: "#9aa7b4" }, gA);
    tx(gA, pa.x + 10, pa.y - 7, "a", "#2563eb", "start", 11.5, 700);
    tx(gA, pb.x + (A >= 0 ? 10 : -18), pb.y - 7, "b", "#2f8a5b", "start", 11.5, 700);
    tx(gA, lf.x + 18, lf.y + lf.h - 16, "a=(1,1,0) 固定；b=(t,0,1) 随 t 变", "#5a6472", "start", 9.2, 400);

    if (s.perp) {
      tx(gA, lf.x + lf.w - 20, lf.y + 46, "a ⊥ b（数量积为 0）", "#2563eb", "end", 10.5, 700);
    } else {
      tx(gA, lf.x + lf.w - 20, lf.y + 46, "a 与 b 不垂直", "#b8791f", "end", 10.5, 700);
    }

    /* 右：数值口径 */
    el("rect", { x: rg.x, y: rg.y, width: rg.w, height: rg.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, G.rx, rg.y + 28, "数值：一个实数 + 一个状态", "#5a6472", "start", 10.5, 700);

    var y = G.ry;
    tx(gB, G.rx, y, "a = (1, 1, 0)", "#3a3a35", "start", G.fs, 400);
    y += G.lh;
    tx(gB, G.rx, y, "b = (t, 0, 1)，t = " + A.toFixed(1), "#3a3a35", "start", G.fs, 400);
    y += G.lh;
    tx(gB, G.rx, y, "a·b = 1·t + 1·0 + 0·1 = " + s.dot.toFixed(1), "#2563eb", "start", G.fs, 700);
    y += G.lh;
    tx(gB, G.rx, y, "|b| = √(t²+1) = " + s.absB.toFixed(3), "#3a3a35", "start", G.fs, 400);
    y += G.lh;
    tx(gB, G.rx, y, "cos θ = t / (√2·√(t²+1))", "#3a3a35", "start", G.fs, 400);
    y += G.lh;
    tx(gB, G.rx + 20, y, "= " + s.cos.toFixed(3), "#3a3a35", "start", G.fs, 400);

    y += G.lh;
    seg(gB, { x: G.rx, y: y - 12 }, { x: rg.x + rg.w - 18, y: y - 12 }, "#e6e9ee", 1);

    if (s.perp) {
      tx(gB, G.rx, y, "a·b = 0 ⇒ a ⊥ b", "#2563eb", "start", G.fs + 0.4, 700);
    } else {
      tx(gB, G.rx, y, "a·b ≠ 0 ⇒ 不垂直", "#b8791f", "start", G.fs, 700);
    }
    y += G.lh;
    tx(gB, G.rx, y, "垂直 ⇔ 数量积为 0", "#5a6472", "start", G.fs - 0.4, 400);

    /* t 的数轴 */
    var rl = rg.x + 30, rr = rg.x + rg.w - 30, ry = rg.y + rg.h - 62;
    seg(gB, { x: rl, y: ry }, { x: rr, y: ry }, "#c8d2db", 1.4);
    var ks = [-2, -1, 0, 1, 2], k, mx;
    for (k = 0; k < ks.length; k++) {
      u = ks[k];
      mx = rl + (u + 2) / 4 * (rr - rl);
      seg(gB, { x: mx, y: ry - 4 }, { x: mx, y: ry + 4 }, "#c8d2db", 1.2);
      tx(gB, mx, ry + 18, String(u), "#9aa7b4", "middle", 8.6, 400);
    }
    mx = rl + (A + 2) / 4 * (rr - rl);
    el("circle", { cx: mx, cy: ry, r: 5, fill: s.perp ? "#2563eb" : "#b8791f" }, gB);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute('viewBox', L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = s.dot.toFixed(1);
    $("gxVc").textContent = s.cos.toFixed(3);
    if (s.perp) { st = "垂直"; col = "#2563eb"; bg = "#eef6ff"; sn = "数量积为 0"; }
    else { st = "不垂直"; col = "#b8791f"; bg = "#fdf3e0"; sn = "数量积不为 0"; }
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
    loop: [{ t: 0, v: -2 }, { t: 1.2, v: -2 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: 2 }, { t: 11.5, v: 1 }, { t: 13.5, v: -2 }],
    keys: [-2, 0, 1, 2],
    value: A, min: -2, max: 2, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = parseFloat(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { dot: 0, perp: 1, cos: 0 } },
    { v: 1, eq: { dot: 1, perp: 0, cos: 0.5 } },
    { v: -2, eq: { dot: -2, perp: 0, cos: -0.6325 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
