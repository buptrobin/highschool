/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null;

  var CN = ["一", "二", "三", "四"];

  /* 纯函数：参数 → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var k = Math.round(v) % 8; if (k < 0) k += 8;
    var even = k % 2 === 0;
    var name = even ? "sin" : "cos";          /* k 偶名不变，k 奇 sin↔cos */
    var sign = k % 4 < 2 ? 1 : -1;            /* 看原函数 sin 在新象限的符号 */
    var val = sign * (even ? 0.5 : 0.866);
    return {
      k: k, name: name, even: even, sign: sign, val: val,
      ang: 30 + 90 * k, quad: (k % 4) + 1,
      delta: (90 * k) % 360
    };
  }

  function fmt(v) { return (v < 0 ? "−" : "") + (Math.abs(v) === 0.5 ? "0.5" : "0.866"); }
  function pt(cx, cy, r, deg) {
    var a = deg * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  }
  /* y 轴朝下 ⇒ 数学上的逆时针 = sweep-flag 0 */
  function arcD(cx, cy, r, a0, a1) {
    var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
    var large = (a1 - a0) > 180 ? 1 : 0;
    return "M" + p0.x.toFixed(2) + " " + p0.y.toFixed(2) + " A" + r + " " + r + " 0 " + large + " 0 " + p1.x.toFixed(2) + " " + p1.y.toFixed(2);
  }
  function arrow(g, x1, y1, x2, y2, col) {
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": 1.1 }, g);
    var a = Math.atan2(y2 - y1, x2 - x1), s = 6.5;
    var p1 = x2 + "," + y2;
    var p2 = (x2 - s * Math.cos(a - 0.42)).toFixed(1) + "," + (y2 - s * Math.sin(a - 0.42)).toFixed(1);
    var p3 = (x2 - s * Math.cos(a + 0.42)).toFixed(1) + "," + (y2 - s * Math.sin(a + 0.42)).toFixed(1);
    el("polygon", { points: p1 + " " + p2 + " " + p3, fill: col }, g);
  }

  function geom() {
    var p = L.left, wide = (L === W);
    var r = wide ? 118 : 86;
    var ax = wide ? 148 : 104;
    var cx = wide ? p.x + p.w / 2 - 6 : p.x + p.w / 2;
    var cy = wide ? p.y + 262 : p.y + 194;
    return { cx: cx, cy: cy, r: r, ax: ax };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), wide = (L === W);
    gA.textContent = ""; gB.textContent = "";
    var P = L.left, R = L.right, g = G, cx = g.cx, cy = g.cy, r = g.r, ax = g.ax;
    var fz = wide ? 10.4 : 9.5;

    el("rect", { x: P.x, y: P.y, width: P.w, height: P.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, P.x + 18, P.y + 28, "单位圆：α=30° 与 α+k·90°", "#5a6472", "start", 10.5, 700);

    /* 所在象限的扇形：sin 正着蓝、负着红 */
    var a0 = (s.quad - 1) * 90, q0 = pt(cx, cy, r, a0), q1 = pt(cx, cy, r, a0 + 90);
    el("path", {
      d: "M" + cx + " " + cy + " L" + q0.x.toFixed(2) + " " + q0.y.toFixed(2) + " A" + r + " " + r + " 0 0 0 " +
        q1.x.toFixed(2) + " " + q1.y.toFixed(2) + " Z",
      fill: s.sign < 0 ? "#fdeeec" : "#eef4ff", stroke: "none"
    }, gA);

    el("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: "#9fb3c6", "stroke-width": 1.2 }, gA);
    arrow(gA, cx - ax, cy, cx + ax, cy, "#8896a6");
    arrow(gA, cx, cy + ax, cx, cy - ax, "#8896a6");
    tx(gA, cx + ax + 4, cy + 13, "x", "#8896a6", "start", 9, 400);
    tx(gA, cx - 12, cy - ax - 4, "y", "#8896a6", "start", 9, 400);

    /* α 的终边（固定 30°）与 0° 到 α 的角度弧线 */
    var pa = pt(cx, cy, r, 30);
    el("path", { d: arcD(cx, cy, r, 0, 30), fill: "none", stroke: "#2563eb", "stroke-width": 1.6 }, gA);
    el("line", { x1: cx, y1: cy, x2: pa.x.toFixed(2), y2: pa.y.toFixed(2), stroke: "#2563eb", "stroke-width": 1.8 }, gA);
    el("circle", { cx: pa.x.toFixed(2), cy: pa.y.toFixed(2), r: 3.2, fill: "#2563eb" }, gA);

    /* α+k·90° 的终边与转过的角度弧线；k=0、4 时两条终边重合，只画一个标签 */
    var th = (30 + 90 * s.k) % 360, pm = pt(cx, cy, r, th);
    var same = (s.delta === 0), lm = pt(cx, cy, r + 18, th);
    var anchor = Math.cos(th * Math.PI / 180) < -0.15 ? "end" : "start";
    if (same) {
      if (s.k === 4) el("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: "#b8791f", "stroke-width": 2.2, "stroke-dasharray": "4 3" }, gA);
      tx(gA, lm.x, lm.y + 3, s.k === 0 ? "α（未转）" : "α（转满一圈）", "#1f6b45", anchor, 9.2, 700);
    } else {
      var la = pt(cx, cy, r + 16, 30);
      tx(gA, la.x, la.y + 3, "α", "#2563eb", "start", 9.5, 700);
      el("path", { d: arcD(cx, cy, r, 30, 30 + s.delta), fill: "none", stroke: s.sign < 0 ? "#b8402f" : "#2563eb", "stroke-width": 1.6 }, gA);
      el("line", { x1: cx, y1: cy, x2: pm.x.toFixed(2), y2: pm.y.toFixed(2), stroke: s.sign < 0 ? "#b8402f" : "#1f6b45", "stroke-width": 1.8 }, gA);
      el("circle", { cx: pm.x.toFixed(2), cy: pm.y.toFixed(2), r: 3.4, fill: s.sign < 0 ? "#b8402f" : "#1f6b45" }, gA);
      tx(gA, lm.x, lm.y + 3, "α+" + s.k + "·90°", s.sign < 0 ? "#b8402f" : "#1f6b45", anchor, 9.2, 700);
    }

    tx(gA, P.x + 18, P.y + 50, "30° + " + s.k + "×90° = " + s.ang + "°", "#2563eb", "start", fz, 700);
    if (wide) tx(gA, P.x + 18, P.y + P.h - 16, "逆时针为正；转一整圈回到原处，这就是公式一。", "#5a6472", "start", 9.2, 400);

    /* 右栏：k → 名 → 象限 → 号 */
    el("rect", { x: R.x, y: R.y, width: R.w, height: R.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    var x = R.x + 16, y = wide ? R.y + 40 : R.y + 26, lh = wide ? 27 : 21;
    tx(gB, x, y, "k 取 0~7，sin(30°+k·90°) 怎么变", "#5a6472", "start", 10.2, 700);
    y += lh + 4;
    tx(gB, x, y, "k = " + s.k + "（" + (s.even ? "偶" : "奇") + "）", "#2563eb", "start", fz + 1, 700);
    y += lh;
    tx(gB, x, y, "sin(30°+" + s.k + "·90°) = sin" + s.ang + "°", "#2b323c", "start", fz, 400);
    y += lh - 4;
    tx(gB, x, y, "= " + (s.val < 0 ? "−" : "") + s.name + "30° = " + fmt(s.val), "#1f2733", "start", fz + 1, 700);
    y += lh - 2;
    el("line", { x1: x, y1: y, x2: R.x + R.w - 16, y2: y, stroke: "#e6e9ee" }, gB);
    y += lh - 2;
    tx(gB, x, y, "① 名：k " + (s.even ? "偶 ⇒ 不变，仍写 sin" : "奇 ⇒ 改成 cos"), "#2b323c", "start", fz - 0.4, 400);
    y += lh - 3;
    tx(gB, x, y, "② 象限：" + (s.ang % 360) + "° 在第" + CN[s.quad - 1] + "象限", "#2b323c", "start", fz - 0.4, 400);
    y += lh - 3;
    tx(gB, x, y, "③ 号：sin 在那里为" + (s.sign < 0 ? "负 ⇒ 加 −" : "正 ⇒ 不加号"), "#2b323c", "start", fz - 0.4, 400);
    y += lh + 6;
    tx(gB, x, y, "奇偶看 k 不看 α 的大小", "#b8791f", "start", fz - 0.2, 700);
    y += lh - 3;
    tx(gB, x, y, "符号看的是原函数在该象限的符号", "#b8791f", "start", fz - 0.2, 700);
    y += lh - 3;
    tx(gB, x, y, "顺序：定 k → 定名 → 定象限 → 定号", "#5a6472", "start", fz - 0.8, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.k);
    $("gxVb").textContent = s.name;
    $("gxVc").textContent = fmt(s.val);
    if (s.even) { st = "名不变"; col = "#2563eb"; bg = "#eef4ff"; sn = "sin 还是 sin，号" + (s.sign < 0 ? "为负" : "为正"); }
    else { st = "名变 cos"; col = "#b8791f"; bg = "#fdf3e0"; sn = "k 奇，sin→cos，号" + (s.sign < 0 ? "为负" : "为正"); }
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
    loop: [{ t: 0, v: 0 }, { t: 0.8, v: 0 }, { t: 3.5, v: 1 }, { t: 6, v: 2 }, { t: 8.5, v: 2 }, { t: 11, v: 3 }, { t: 13, v: 0 }],
    keys: [0, 1, 2, 3],
    value: A, min: 0, max: 7, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { val: 0.5 } },
    { v: 1, eq: { val: 0.866 } },
    { v: 2, eq: { val: -0.5 } },
    { v: 3, eq: { val: -0.866 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
