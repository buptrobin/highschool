/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = {
    vb: "0 0 880 470",
    left: { x: 16, y: 16, w: 424, h: 438, k: 70, ox: 95, oy: 352, lab: [244, 340] },
    right: { x: 456, y: 16, w: 408, h: 438 }
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 300, k: 44, ox: 130, oy: 253, lab: [236, 242] },
    right: { x: 8, y: 320, w: 344, h: 372 }
  };
  var L = W, A = 0, G = null;

  /* 三个不共面的基向量（示意，非真实夹角） */
  var VA = [1, 0, 0], VB = [0.5, 0.87, 0], VC = [0.25, 0.15, 0.96];
  var C_A = "#b8402f", C_B = "#2563eb", C_C = "#b8791f", C_P = "#1d4ed8";

  function fmt(v) {
    var r = Math.round(v * 10) / 10;
    return (r === 0 ? 0 : r).toString();
  }

  /* 纯函数：参数 → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var z = Math.round(Number(v) * 10) / 10 || 0;
    return { x: 1, y: 2, z: z, coef: [1, 2, z], inPlane: z === 0 ? 1 : 0, d: Math.abs(z) };
  }

  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function geom() { return L; }
  function pr(q) {
    var k = G.left.k, ox = G.left.ox, oy = G.left.oy;
    return [ox + k * (0.86 * q[0] + 0.42 * q[1]), oy - k * (0.5 * q[1] + 0.86 * q[2])];
  }
  function arrow(g, p0, p1, col, w, dash) {
    el("line", { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-dasharray": dash || "none" }, g);
    var dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= d; dy /= d;
    var bx = p1[0] - dx * 10, by = p1[1] - dy * 10;
    el("polygon", { points: p1[0] + "," + p1[1] + " " + (bx - dy * 4.4) + "," + (by + dx * 4.4) + " " + (bx + dy * 4.4) + "," + (by - dx * 4.4), fill: col }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), P = G.left, R = G.right, z = s.z;
    el("rect", { x: P.x, y: P.y, width: P.w, height: P.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, P.x + 18, P.y + 26, "三个不共面的基向量与 p", "#5a6472", "start", 10.5, 700);

    var O = pr([0, 0, 0]), Pa = pr(VA), Pb = pr(VB), Pc = pr(VC);
    var Pab = pr([2, 1.74, 0]), Pp = pr([2 + 0.25 * z, 1.74 + 0.15 * z, 0.96 * z]);

    /* a、b 张成的平面 */
    var cs = [[-0.2, -0.2], [2.2, -0.2], [2.2, 2.4], [-0.2, 2.4]], pts = [];
    for (var i = 0; i < 4; i++) { var q = pr([cs[i][0] + 0.5 * cs[i][1], 0.87 * cs[i][1], 0]); pts.push(q[0] + "," + q[1]); }
    el("polygon", { points: pts.join(" "), fill: "#e8f1fb", stroke: "#a9c8e8", "stroke-width": 1 }, gA);
    tx(gA, P.lab[0], P.lab[1], "平面：a、b 张成", "#7b8794", "end", 9.4, 400);

    /* 分解链：O → a → a+2b → +z c = p */
    el("line", { x1: Pa[0], y1: Pa[1], x2: Pab[0], y2: Pab[1], stroke: "#9aa3ad", "stroke-width": 1.1, "stroke-dasharray": "5 4" }, gA);
    if (z !== 0) el("line", { x1: Pab[0], y1: Pab[1], x2: Pp[0], y2: Pp[1], stroke: C_C, "stroke-width": 1.8, "stroke-dasharray": "5 4" }, gA);

    arrow(gA, O, Pa, C_A, 2.2);
    arrow(gA, O, Pb, C_B, 2.2);
    arrow(gA, O, Pc, C_C, 1.8, "5 4");
    arrow(gA, O, Pp, C_P, 2.8);

    el("circle", { cx: O[0], cy: O[1], r: 3, fill: "#151a21" }, gA);
    tx(gA, Pa[0] + 10, Pa[1] + 16, "a", C_A, "start", 12.5, 700);
    tx(gA, Pb[0] + 11, Pb[1] - 4, "b", C_B, "start", 12.5, 700);
    tx(gA, Pc[0] - 7, Pc[1] + 2, "c", C_C, "end", 12.5, 700);
    tx(gA, O[0] - 9, O[1] + 15, "O", "#5a6472", "end", 11, 400);
    tx(gA, Pp[0] + 11, Pp[1] - 3, "p", C_P, "start", 13, 700);
    if (Math.abs(z) >= 0.5) {
      tx(gA, (Pab[0] + Pp[0]) / 2 + 9, (Pab[1] + Pp[1]) / 2, "z c", C_C, "start", 10.5, 700);
    }

    /* 右栏：有序实数组 + 三个系数的条形图 */
    el("rect", { x: R.x, y: R.y, width: R.w, height: R.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, R.x + 18, R.y + 30, "p 的有序实数组 (x, y, z)", "#5a6472", "start", 10.5, 700);
    tx(gB, R.x + 18, R.y + 72, "(" + s.x + ", " + s.y + ", " + fmt(z) + ")", C_P, "start", 21, 700);

    var tall = R.h > 400, y0 = R.y + (tall ? 122 : 112), gap = tall ? 40 : 38;
    var tX = R.x + 40, tW = R.w - 96, cx = tX + tW / 2, half = tW / 2, maxA = 2.2;
    var rows = [[s.x, "x", C_B], [s.y, "y", C_B], [z, "z", z === 0 ? "#9aa3ad" : C_C]];
    for (var r = 0; r < 3; r++) {
      var yy = y0 + r * gap, val = rows[r][0];
      tx(gB, R.x + 16, yy + 4, rows[r][1], "#3a3a35", "start", 11, 700);
      el("rect", { x: tX, y: yy - 7, width: tW, height: 14, rx: 7, fill: "#f1f4f7" }, gB);
      el("line", { x1: cx, y1: yy - 10, x2: cx, y2: yy + 10, stroke: "#c9d2da", "stroke-width": 1 }, gB);
      var len = Math.min(Math.abs(val) / maxA, 1) * half;
      if (len > 0.8) {
        el("rect", { x: val >= 0 ? cx : cx - len, y: yy - 7, width: len, height: 14, rx: 4, fill: rows[r][2] }, gB);
      }
      tx(gB, R.x + R.w - 16, yy + 4, fmt(val), "#3a3a35", "end", 11.5, 700);
    }

    var sy = R.y + (tall ? 262 : 240), ok = s.inPlane === 1;
    el("line", { x1: R.x + 18, y1: sy - 16, x2: R.x + R.w - 18, y2: sy - 16, stroke: "#e6e9ee" }, gB);
    tx(gB, R.x + 18, sy, ok ? "z = 0 ⇒ p 落在平面内" : "z ≠ 0 ⇒ p 挑出平面", ok ? "#2f8a5b" : "#b8791f", "start", 12, 700);
    wrap(gB, R.x + 18, sy + 22, ok
      ? "此时 p = 1a + 2b，c 的系数是 0：两个基向量 a、b 就够用，基底在 p 身上退化成两个。"
      : "此时 p 不在 a、b 张成的平面内，三个基向量都得用上，少一个就分解不出来。",
      R.w - 36, 9.6, "#3a3a35", 15);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), ok = s.inPlane === 1;
    $("gxVa").textContent = fmt(s.z);
    $("gxVb").textContent = "(1, 2, " + fmt(s.z) + ")";
    $("gxVc").textContent = s.d.toFixed(1);
    $("gxVs").textContent = ok ? "两个够用" : "三个都用";
    $("gxVsn").textContent = ok ? "p 与 a、b 共面" : "p 挑出平面";
    $("gxVs").style.color = ok ? "#2f8a5b" : "#b8791f";
    $("gxStBox").style.background = ok ? "#e6f6ee" : "#fdf3e0";
    $("gxStBox").style.borderColor = (ok ? "#2f8a5b" : "#b8791f") + "44";
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 1 }, { t: 6.5, v: 1 }, { t: 9, v: -2 }, { t: 11.5, v: 2 }, { t: 13.5, v: 0 }],
    keys: [0, 1, -2, 2],
    value: A, min: -2, max: 2, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { inPlane: 1, z: 0 } },
    { v: 1, eq: { inPlane: 0, z: 1 } },
    { v: -2, eq: { inPlane: 0, z: -2 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
