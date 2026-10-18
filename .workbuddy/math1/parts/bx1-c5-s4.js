document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;
  var W = {
    vb: "0 0 880 470",
    left: { x: 16, y: 16, w: 424, h: 438 },
    right: { x: 456, y: 16, w: 408, h: 438 },
    cx: 228, cy: 258, r: 138,
    px0: 500, px1: 840, py: 250, amp: 90
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 300 },
    right: { x: 8, y: 320, w: 344, h: 372 },
    cx: 160, cy: 170, r: 92,
    px0: 44, px1: 336, py: 505, amp: 62
  };
  var L = W, G = null, A = 0;

  function calc(v) {
    var t = v * Math.PI / 180;
    return { sin: Number(Math.sin(t).toFixed(4)), cos: Number(Math.cos(t).toFixed(4)) };
  }

  function geom() { return L; }

  function status(v) {
    if (v === 90) return { t: "sin 到峰顶 1", sn: "x=90°，cos 同时为 0", col: "#2f8a5b", bg: "#e6f6ee" };
    if (v === 270) return { t: "sin 到谷底 −1", sn: "x=270°，cos 同时为 0", col: "#b8402f", bg: "#fbeae7" };
    if (v === 180) return { t: "sin 递减", sn: "x=180°：sin 从 1 掉到 0，cos 到 −1", col: "#b8791f", bg: "#fdf3e0" };
    if (v === 0 || v === 360) return { t: "sin = 0，cos = 1", sn: "0° 与 360° 对应同一个点", col: "#2563eb", bg: "#e8f0fe" };
    if (v < 90 || v > 270) return { t: "sin 递增", sn: "x 在 (0°,90°) 或 (270°,360°) 内，sin 上升", col: "#2563eb", bg: "#e8f0fe" };
    return { t: "sin 递减", sn: "x 在 (90°,270°) 内，sin 从 1 掉到 −1", col: "#b8791f", bg: "#fdf3e0" };
  }

  function draw() {
    var L = G, gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var th = A * Math.PI / 180;
    var px = L.cx + L.r * Math.cos(th), py = L.cy - L.r * Math.sin(th);

    /* 单位圆 */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 28, "单位圆：角 x 的终边", "#5a6472", "start", 10.5, 700);
    el("line", { x1: L.cx - L.r - 28, y1: L.cy, x2: L.cx + L.r + 24, y2: L.cy, stroke: "#8d98a6", "stroke-width": 1.1 }, gA);
    el("polygon", { points: (L.cx + L.r + 24) + "," + L.cy + " " + (L.cx + L.r + 14) + "," + (L.cy - 4) + " " + (L.cx + L.r + 14) + "," + (L.cy + 4), fill: "#8d98a6" }, gA);
    el("line", { x1: L.cx, y1: L.cy + L.r + 28, x2: L.cx, y2: L.cy - L.r - 22, stroke: "#8d98a6", "stroke-width": 1.1 }, gA);
    el("polygon", { points: L.cx + "," + (L.cy - L.r - 22) + " " + (L.cx - 4) + "," + (L.cy - L.r - 12) + " " + (L.cx + 4) + "," + (L.cy - L.r - 12), fill: "#8d98a6" }, gA);
    el("circle", { cx: L.cx, cy: L.cy, r: L.r, fill: "#ffffff", stroke: "#c3ccd6", "stroke-width": 1.2 }, gA);
    var rr = L.r * 0.42;
    if (A >= 360) {
      el("circle", { cx: L.cx, cy: L.cy, r: rr, fill: "none", stroke: "#b8791f", "stroke-width": 2 }, gA);
    } else if (th > 0.0001) {
      var ex = L.cx + rr * Math.cos(th), ey = L.cy - rr * Math.sin(th);
      el("path", { d: "M " + (L.cx + rr) + " " + L.cy + " A " + rr + " " + rr + " 0 " + (th > Math.PI ? 1 : 0) + " 0 " + ex + " " + ey, fill: "none", stroke: "#b8791f", "stroke-width": 2 }, gA);
    }
    el("line", { x1: L.cx, y1: L.cy, x2: px, y2: L.cy, stroke: "#2f8a5b", "stroke-width": 5, "stroke-opacity": 0.35 }, gA);
    el("line", { x1: px, y1: L.cy, x2: px, y2: py, stroke: "#2563eb", "stroke-width": 2.2, "stroke-dasharray": "5 4" }, gA);
    el("line", { x1: L.cx, y1: L.cy, x2: px, y2: py, stroke: "#151a21", "stroke-width": 1.6 }, gA);
    el("circle", { cx: px, cy: py, r: 4.6, fill: "#b8791f" }, gA);
    tx(gA, L.cx + L.r + 10, L.cy + 4, "1", "#5a6472", "start", 9, 400);
    tx(gA, L.cx - L.r - 10, L.cy + 4, "−1", "#5a6472", "end", 9, 400);
    tx(gA, L.cx - 14, L.cy + 15, "O", "#5a6472", "end", 9, 400);
    if (Math.abs(px - L.cx) > 34) tx(gA, (L.cx + px) / 2, L.cy + 15, "cos x", "#2f8a5b", "middle", 8.8, 700);
    if (Math.abs(py - L.cy) > 34) tx(gA, px + 9, (L.cy + py) / 2, "sin x", "#2563eb", "start", 8.8, 700);
    tx(gA, L.cx, L.cy + L.r + 26, "x = " + A + "°", "#b8791f", "middle", 11, 700);

    /* 曲线 */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 28, "一个周期：sin x（蓝）、cos x（绿）", "#5a6472", "start", 10.5, 700);
    el("line", { x1: L.px0 - 14, y1: L.py, x2: L.px1 + 10, y2: L.py, stroke: "#8d98a6", "stroke-width": 1.1 }, gB);
    el("line", { x1: L.px0, y1: L.py + L.amp + 16, x2: L.px0, y2: L.py - L.amp - 16, stroke: "#8d98a6", "stroke-width": 1.1 }, gB);
    var ps = "", pc = "", d;
    for (d = 0; d <= 360; d += 5) {
      var xx = L.px0 + (L.px1 - L.px0) * d / 360;
      ps += (d === 0 ? "M" : "L") + xx.toFixed(1) + " " + (L.py - L.amp * Math.sin(d * Math.PI / 180)).toFixed(1) + " ";
      pc += (d === 0 ? "M" : "L") + xx.toFixed(1) + " " + (L.py - L.amp * Math.cos(d * Math.PI / 180)).toFixed(1) + " ";
    }
    el("path", { d: ps, fill: "none", stroke: "#2563eb", "stroke-width": 2.1 }, gB);
    el("path", { d: pc, fill: "none", stroke: "#2f8a5b", "stroke-width": 2.1 }, gB);
    var qx = L.px0 + (L.px1 - L.px0) * A / 360;
    el("line", { x1: qx, y1: L.py - L.amp - 10, x2: qx, y2: L.py + L.amp + 10, stroke: "#b8791f", "stroke-width": 1.1, "stroke-dasharray": "4 3" }, gB);
    el("circle", { cx: qx, cy: L.py - L.amp * Math.sin(th), r: 4.2, fill: "#2563eb" }, gB);
    el("circle", { cx: qx, cy: L.py - L.amp * Math.cos(th), r: 4.2, fill: "#2f8a5b" }, gB);
    var marks = [0, 90, 180, 270, 360];
    for (var i = 0; i < marks.length; i++) {
      var mx = L.px0 + (L.px1 - L.px0) * marks[i] / 360;
      tx(gB, mx, L.py + 17, marks[i] + "°", "#5a6472", "middle", 8.4, 400);
    }
    tx(gB, L.px0 - 8, L.py - L.amp + 4, "1", "#5a6472", "end", 8.4, 400);
    tx(gB, L.px0 - 8, L.py + L.amp + 4, "−1", "#5a6472", "end", 8.4, 400);
    var ly = L.py + L.amp + (L.right.h > 400 ? 62 : 44);
    tx(gB, L.right.x + 24, ly + 4, "sin x", "#2563eb", "start", 9.6, 700);
    tx(gB, L.right.x + 84, ly + 4, "cos x", "#2f8a5b", "start", 9.6, 700);
    tx(gB, L.right.x + 24, ly + 24, "sin 周期 2π = 360°；tan 才是 π", "#5a6472", "start", 8.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st = status(A);
    $("gxVa").textContent = A + "°";
    $("gxVb").textContent = s.sin.toFixed(2);
    $("gxVc").textContent = s.cos.toFixed(2);
    $("gxVs").textContent = st.t;
    $("gxVsn").textContent = st.sn;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.col + "44";
    $("gxVs").style.color = st.col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 90 }, { t: 6.5, v: 180 }, { t: 9, v: 180 }, { t: 11.5, v: 270 }, { t: 13.5, v: 0 }],
    keys: [0, 90, 180, 270],
    value: A, min: 0, max: 360, step: 15,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 30, eq: { sin: 0.5, cos: 0.866 } },
    { v: 90, eq: { sin: 1, cos: 0 } },
    { v: 180, eq: { sin: 0, cos: -1 } },
    { v: 270, eq: { sin: -1, cos: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
