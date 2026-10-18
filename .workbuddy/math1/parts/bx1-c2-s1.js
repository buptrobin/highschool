/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = {
    vb: "0 0 880 470",
    left: { x: 16, y: 16, w: 424, h: 438 },
    right: { x: 456, y: 16, w: 408, h: 438 },
    cx: 228, k: 11, axisY: 250, axisL: 46, axisR: 412
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 300 },
    right: { x: 8, y: 320, w: 344, h: 372 },
    cx: 180, k: 8, axisY: 170, axisL: 34, axisR: 326
  };
  var L = W, G = null, A = 2;

  /* 纯函数：c → 数值。render() 和 __model.cases 都用它 */
  function calc(c) {
    var ac = 3 * c, bc = 1 * c;
    return {
      a: 3, b: 1, c: c,
      ac: ac, bc: bc, diff: ac - bc,
      kind: c > 0 ? 1 : (c === 0 ? 0 : -1)   // 1 不变号、0 相等、−1 变号
    };
  }

  function fmt(n) { return String(Math.round(n * 100) / 100).replace("-", "−"); }

  function draw() {
    var s = calc(A);
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var pt = L.left, pr = L.right;

    /* ---------- 左：数轴，看 ac 与 bc 落在哪里 ---------- */
    el("rect", { x: pt.x, y: pt.y, width: pt.w, height: pt.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, pt.x + 20, pt.y + 30, "数轴：两个积落在哪里", "#5a6472", "start", 10.5, 700);
    el("line", { x1: L.axisL, y1: L.axisY, x2: L.axisR, y2: L.axisY, stroke: "#8a97a6", "stroke-width": 1.5 }, gA);
    el("polygon", {
      points: L.axisR + "," + L.axisY + " " + (L.axisR - 11) + "," + (L.axisY - 5) + " " + (L.axisR - 11) + "," + (L.axisY + 5),
      fill: "#8a97a6"
    }, gA);
    for (var v = -15; v <= 15; v += 5) {
      var xv = L.cx + L.k * v;
      el("line", { x1: xv, y1: L.axisY - 5, x2: xv, y2: L.axisY + 5, stroke: v === 0 ? "#8a97a6" : "#c2ccd6", "stroke-width": v === 0 ? 1.4 : 1 }, gA);
      tx(gA, xv, L.axisY + 20, fmt(v), "#6b7785", "middle", 8.4, 400);
    }

    var xac = L.cx + L.k * s.ac, xbc = L.cx + L.k * s.bc;
    el("line", { x1: xbc, y1: L.axisY + 6, x2: xbc, y2: L.axisY + 44, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("line", { x1: xac, y1: L.axisY - 6, x2: xac, y2: L.axisY - 44, stroke: "#2563eb", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: xbc, cy: L.axisY, r: 4, fill: "#b8402f" }, gA);
    el("circle", { cx: xac, cy: L.axisY, r: 4, fill: "#2563eb" }, gA);
    tx(gA, xac, L.axisY - 50, "ac=" + fmt(s.ac), "#2563eb", "middle", 9.4, 700);
    tx(gA, xbc, L.axisY + 60, "bc=" + fmt(s.bc), "#b8402f", "middle", 9.4, 700);

    var vc = s.kind > 0 ? ["c=" + fmt(A) + " > 0，方向不变", "#2f8a5b"]
          : (s.kind === 0 ? ["c=0，两积相等", "#b8791f"] : ["c=" + fmt(A) + " < 0，方向反转", "#b8402f"]);
    tx(gA, pt.x + 20, pt.y + pt.h - 26, "a=3、b=1 固定在右边，只动 c", "#6b7785", "start", 9.2, 400);
    tx(gA, pt.x + 20, pt.y + pt.h - 8, vc[0], vc[1], "start", 10.2, 700);

    /* ---------- 右：两个积的条形与大小关系 ---------- */
    el("rect", { x: pr.x, y: pr.y, width: pr.w, height: pr.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, pr.x + 20, pr.y + 28, "ac 与 bc 谁大", "#5a6472", "start", 10.5, 700);
    tx(gB, pr.x + 20, pr.y + 52, "已给 a=3 > b=1 固定不变", "#3a3a35", "start", 9.2, 400);
    tx(gB, pr.x + 20, pr.y + 70, "c = " + fmt(A) + (A > 0 ? "（正）" : (A === 0 ? "（零）" : "（负）")), vc[1], "start", 9.2, 700);

    var rel = s.kind > 0 ? "ac > bc" : (s.kind === 0 ? "ac = bc" : "ac < bc");
    tx(gB, pr.x + 20, pr.y + pr.h * 0.20, rel, vc[1], "start", 17, 700);

    var y0 = pr.y + pr.h * 0.60, bm = pr.h * 0.27, bw = pr.w * 0.14;
    var xs = [pr.x + pr.w * 0.30, pr.x + pr.w * 0.62];
    el("line", { x1: pr.x + 16, y1: y0, x2: pr.x + pr.w - 16, y2: y0, stroke: "#c2ccd6", "stroke-width": 1.2 }, gB);
    var vals = [s.ac, s.bc], cols = ["#2563eb", "#b8402f"], names = ["ac", "bc"];
    for (var i = 0; i < 2; i++) {
      var hh = Math.abs(vals[i]) / 15 * bm, up = vals[i] >= 0;
      el("rect", {
        x: xs[i] - bw / 2, y: up ? y0 - hh : y0, width: bw, height: Math.max(hh, 1), rx: 4,
        fill: cols[i], opacity: 0.85
      }, gB);
      tx(gB, xs[i], up ? y0 - hh - 9 : y0 + hh + 17, fmt(vals[i]), cols[i], "middle", 10, 700);
      tx(gB, xs[i], up ? y0 + 17 : y0 - 9, names[i], "#6b7785", "middle", 9, 400);
    }
    tx(gB, pr.x + 20, pr.y + pr.h - 34, "差 ac−bc = 3c−c = 2c = " + fmt(s.diff), "#3a3a35", "start", 9.2, 700);
    tx(gB, pr.x + 20, pr.y + pr.h - 16, "比较大小就是判这个差的正负", "#6b7785", "start", 9, 400);
  }

  function render() {
    if (!G) {
      L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
      G = { left: L.left, right: L.right };
      stage.setAttribute("viewBox", L.vb);
    }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = fmt(A);
    $("gxVb").textContent = fmt(s.ac);
    $("gxVc").textContent = fmt(s.bc);
    if (s.kind > 0) { st = "方向不变"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "ac−bc=2c>0"; }
    else if (s.kind === 0) { st = "不等式失效"; col = "#b8791f"; bg = "#fdf3e0"; sn = "ac−bc=0，两边相等"; }
    else { st = "方向反转"; col = "#b8402f"; bg = "#fbeae7"; sn = "ac−bc=2c<0"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = { left: L.left, right: L.right };
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
    loop: [{ t: 0, v: 2 }, { t: 1.2, v: 2 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: -2 }, { t: 11.5, v: -2 }, { t: 13.5, v: 3 }],
    keys: [2, 0, -2, 3],
    value: A, min: -5, max: 5, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 2, eq: { ac: 6, bc: 2, diff: 4 } },
    { v: 0, eq: { ac: 0, bc: 0, diff: 0 } },
    { v: -2, eq: { ac: -6, bc: -2, diff: -4 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
