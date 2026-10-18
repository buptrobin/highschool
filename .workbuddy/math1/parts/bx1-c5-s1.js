/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 452, y: 16, w: 412, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 322 }, right: { x: 8, y: 338, w: 344, h: 354 } };
  var L = W, A = 30, G = null;

  /* 纯函数：角 θ（度）→ 弧度 / 最小正角 / 象限。render() 与 __model.cases 都用它 */
  function calc(v) {
    var th = Math.round(v);
    var rad = th * Math.PI / 180;
    var cot = ((th % 360) + 360) % 360;          /* 终边相同的最小正角 */
    var quad = cot % 90 === 0 ? 0 : Math.floor(cot / 90) + 1;   /* 0 表示轴线角 */
    return { th: th, rad: rad, cot: cot, quad: quad, turns: Math.floor(th / 360) };
  }

  function geom() {
    var lo = L.left;
    var cx = lo.x + lo.w / 2, cy = lo.y + lo.h / 2 + 8;
    var R = Math.min(lo.w, lo.h) / 2 - 48;
    return { cx: cx, cy: cy, R: R, ar: R * 0.34 };
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB"), i, t, byy, col = s.quad === 0 ? "#b8791f" : "#2f8a5b";
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    var cx = G.cx, cy = G.cy, R = G.R;
    tx(gA, L.left.x + 18, L.left.y + 26, "单位圆：终边只看余角", "#5a6472", "start", 10.5, 700);

    /* 单位圆 + 坐标轴（带箭头与 1/2 刻度） */
    el("circle", { cx: cx, cy: cy, r: R, fill: "#ffffff", stroke: "#cfd8e3", "stroke-width": 1.2 }, gA);
    el("line", { x1: cx - R - 18, y1: cy, x2: cx + R + 18, y2: cy, stroke: "#8a97a6", "stroke-width": 1.2 }, gA);
    el("polygon", { points: (cx + R + 26) + "," + cy + " " + (cx + R + 15) + "," + (cy - 4.5) + " " + (cx + R + 15) + "," + (cy + 4.5), fill: "#8a97a6" }, gA);
    el("line", { x1: cx, y1: cy + R + 18, x2: cx, y2: cy - R - 18, stroke: "#8a97a6", "stroke-width": 1.2 }, gA);
    el("polygon", { points: cx + "," + (cy - R - 26) + " " + (cx - 4.5) + "," + (cy - R - 15) + " " + (cx + 4.5) + "," + (cy - R - 15), fill: "#8a97a6" }, gA);
    for (i = -1; i <= 1; i += 2) {
      t = cx + R * 0.5 * i;
      el("line", { x1: t, y1: cy - 4, x2: t, y2: cy + 4, stroke: "#8a97a6", "stroke-width": 1 }, gA);
      t = cy + R * 0.5 * i;
      el("line", { x1: cx - 4, y1: t, x2: cx + 4, y2: t, stroke: "#8a97a6", "stroke-width": 1 }, gA);
    }
    tx(gA, cx + R + 8, cy + 17, "x", "#5a6472", "start", 9.6, 400);
    tx(gA, cx + 8, cy - R - 8, "y", "#5a6472", "start", 9.6, 400);
    tx(gA, cx - 14, cy + 16, "O", "#6b7280", "start", 9.4, 400);

    /* 象限标注（罗马数字，浅灰底） */
    var qn = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ"], qx = [1, -1, -1, 1], qy = [-1, -1, 1, 1];
    for (i = 0; i < 4; i++) tx(gA, cx + qx[i] * R * 0.58, cy + qy[i] * R * 0.58 + 5, qn[i], "#c3ccd6", "middle", 14, 700);

    /* 终边（数学逆时针：y 轴朝下，故屏幕坐标 sy = cy − R·sinθ） */
    var a = s.cot * Math.PI / 180, ct = Math.cos(a), st = Math.sin(a);
    var ex = cx + R * ct, ey = cy - R * st, ux = ct, uy = -st, px = -uy, py = ux, h = 9;
    el("line", { x1: cx, y1: cy, x2: ex, y2: ey, stroke: "#2563eb", "stroke-width": 2.4 }, gA);
    el("polygon", {
      points: ex + "," + ey + " " + (ex - ux * h + px * h * 0.55) + "," + (ey - uy * h + py * h * 0.55) + " "
        + (ex - ux * h - px * h * 0.55) + "," + (ey - uy * h - py * h * 0.55), fill: "#2563eb"
    }, gA);
    /* 角度弧线：逆时针 sweep-flag = 0 */
    if (s.cot > 0) {
      el("path", {
        d: "M " + (cx + G.ar) + " " + cy + " A " + G.ar + " " + G.ar + " 0 " + (s.cot > 180 ? 1 : 0) + " 0 "
          + (cx + G.ar * ct) + " " + (cy - G.ar * st), fill: "none", stroke: "#b8791f", "stroke-width": 1.8
      }, gA);
    }
    var ma = s.cot / 2 * Math.PI / 180, lr = G.ar + 20;
    tx(gA, cx + lr * Math.cos(ma), cy - lr * Math.sin(ma) + 4, s.cot + "°", "#b8791f", "middle", 10, 700);
    tx(gA, L.left.x + 18, L.left.y + L.left.h - 14, "已转 " + s.turns + " 整圈，余角 " + s.cot + "°", "#5a6472", "start", 10, 400);

    /* 右栏：数值与化简 */
    var rx = L.right.x + 24, ry = L.right.y + 28, rw = L.right.w - 48;
    tx(gB, rx, ry, "数值与化简", "#5a6472", "start", 10.5, 700);
    var by = ry + 36, bx0 = rx + 4, bx1 = rx + rw - 10;
    el("line", { x1: bx0, y1: by, x2: bx1, y2: by, stroke: "#cfd8e3", "stroke-width": 2 }, gB);
    for (i = 0; i <= 4; i++) {
      t = bx0 + (bx1 - bx0) * i / 4;
      el("line", { x1: t, y1: by - 4, x2: t, y2: by + 4, stroke: "#8a97a6", "stroke-width": 1 }, gB);
      tx(gB, t, by + 17, String(i * 180) + "°", "#8a97a6", "middle", 8.5, 400);
    }
    el("circle", { cx: bx0 + (bx1 - bx0) * (s.th / 720), cy: by, r: 5, fill: "#2563eb" }, gB);

    var ly = by + 44;
    tx(gB, rx, ly, "θ = " + s.th + "° → " + s.rad.toFixed(4) + " rad", "#3a3a35", "start", 10, 400);
    tx(gB, rx, ly + 17, "整圈数 " + s.turns + "，余角 " + s.cot + "°", "#3a3a35", "start", 10, 400);
    tx(gB, rx, ly + 34, "终边相同的角：β = " + s.cot + "° + k·360°，k∈Z", "#3a3a35", "start", 10, 400);
    tx(gB, rx, ly + 51, "θ 每加 360°，弧度加 2π，余角不变", "#7a8794", "start", 9.4, 400);

    /* 关键帧对照（弧度换算） */
    var rby = ly + 76, rows = [["0°", "0 rad", "轴线角"], ["30°", "π/6", "第 1 象限"], ["90°", "π/2", "轴线角"], ["390°", "13π/6", "与 30° 同终边"]];
    tx(gB, rx, rby, "关键帧对照", "#5a6472", "start", 10, 700);
    for (i = 0; i < rows.length; i++) {
      t = rby + 18 + i * 16;
      tx(gB, rx, t, rows[i][0], "#3a3a35", "start", 9.4, 700);
      tx(gB, rx + 46, t, rows[i][1], "#1d4ed8", "start", 9.4, 400);
      tx(gB, rx + 110, t, rows[i][2], "#7a8794", "start", 9.4, 400);
    }

    /* 状态判断块 */
    byy = Math.min(rby + 104, L.right.y + L.right.h - 88);
    el("rect", { x: rx - 10, y: byy, width: rw + 20, height: 76, rx: 8, fill: s.quad === 0 ? "#fdf3e0" : "#e6f6ee", stroke: col + "55" }, gB);
    tx(gB, rx, byy + 26, s.quad === 0 ? "轴线角" : "第 " + s.quad + " 象限角", col, "start", 13, 700);
    tx(gB, rx, byy + 46, s.quad === 0 ? "终边压在坐标轴上，不算任何象限" : "终边落在第 " + s.quad + " 象限内部", "#5a6472", "start", 9.4, 400);
    tx(gB, rx, byy + 64, "判据：先减整圈，看余角落在哪", "#7a8794", "start", 9.4, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = s.th + "°";
    $("gxVb").textContent = s.rad.toFixed(4);
    $("gxVc").textContent = s.cot + "°";
    if (s.quad === 0) { st = "轴线角"; col = "#b8791f"; bg = "#fdf3e0"; sn = "终边在坐标轴上，不算象限"; }
    else { st = "第 " + s.quad + " 象限角"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "终边落在第 " + s.quad + " 象限内部"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw(s);
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
    loop: [{ t: 0, v: 30 }, { t: 1.2, v: 30 }, { t: 4, v: 180 }, { t: 6.5, v: 180 }, { t: 9, v: 390 }, { t: 11.5, v: 390 }, { t: 13.5, v: 30 }],
    keys: [30, 180, 390],
    value: A, min: 0, max: 720, step: 15,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 30, eq: { rad: 0.5236, cot: 30, quad: 1 } },
    { v: 390, eq: { rad: 6.8068, cot: 30, quad: 1 } },
    { v: 180, eq: { rad: 3.1416, cot: 180, quad: 0 } },
    { v: 720, eq: { rad: 12.5664, cot: 0, quad: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
