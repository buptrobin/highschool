/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1, G = null;

  /* 纯函数：激素剂量 d → 反应强度与边际收益。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var d = Math.max(1, Math.min(100, v));
    return { resp: 100 * d / (d + 10), gain: 1000 / ((d + 10) * (d + 10)) };
  }

  function geom() {
    var b = L.left;
    return { px0: b.x + 52, px1: b.x + b.w - 22, py0: b.y + 54, py1: b.y + b.h - 42 };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), d, resp, i, pts = [];
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 18, L.left.y + 30, "剂量—效应曲线（横轴剂量 d，纵轴反应强度）", "#5a6472", "start", 10, 700);

    /* 坐标轴与刻度 */
    el("line", { x1: G.px0, y1: G.py0, x2: G.px0, y2: G.py1, stroke: "#5a6472", "stroke-width": 1.2 }, gA);
    el("line", { x1: G.px0, y1: G.py1, x2: G.px1, y2: G.py1, stroke: "#5a6472", "stroke-width": 1.2 }, gA);
    for (i = 0; i <= 4; i++) {
      var ry = G.py1 - i / 4 * (G.py1 - G.py0);
      el("line", { x1: G.px0, y1: ry, x2: G.px1, y2: ry, stroke: "#e6e9ee", "stroke-width": 1 }, gA);
      tx(gA, G.px0 - 8, ry + 3.5, String(i * 25), "#5a6472", "end", 8.4, 400);
    }
    tx(gA, G.px0 - 8, G.py0 - 10, "resp/%", "#5a6472", "start", 8.4, 700);
    [1, 10, 50, 100].forEach(function (k) {
      var x = G.px0 + (k - 1) / 99 * (G.px1 - G.px0);
      tx(gA, x, G.py1 + 16, String(k), "#5a6472", "middle", 8.4, 400);
    });

    /* 饱和曲线 */
    for (d = 1; d <= 100; d += 1) {
      pts.push((G.px0 + (d - 1) / 99 * (G.px1 - G.px0)).toFixed(1) + "," + (G.py1 - calc(d).resp / 100 * (G.py1 - G.py0)).toFixed(1));
    }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#b8402f", "stroke-width": 2.2, "stroke-linejoin": "round" }, gA);

    /* 半最大效应标识（d=10） */
    var hx = G.px0 + 9 / 99 * (G.px1 - G.px0), hy = G.py1 - 0.5 * (G.py1 - G.py0);
    el("line", { x1: hx, y1: hy, x2: hx, y2: G.py1, stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    el("line", { x1: G.px0, y1: hy, x2: hx, y2: hy, stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    tx(gA, G.px0 + 4, hy - 6, "50% 半最大效应", "#b8791f", "start", 8.6, 700);

    /* 当前位置 */
    resp = s.resp;
    var cx = G.px0 + (A - 1) / 99 * (G.px1 - G.px0), cy = G.py1 - resp / 100 * (G.py1 - G.py0);
    el("line", { x1: cx, y1: cy, x2: cx, y2: G.py1, stroke: "#2b5f8f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: cx, cy: cy, r: 5, fill: "#2b5f8f" }, gA);
    var labx = cx > G.px1 - 90 ? cx - 10 : cx + 10, anch = cx > G.px1 - 90 ? "end" : "start";
    tx(gA, labx, cy - 10, "d=" + Math.round(A), "#2b5f8f", anch, 9, 700);
    tx(gA, labx, cy + 4, "resp=" + resp.toFixed(1) + "%", "#2b5f8f", anch, 8.6, 400);

    /* 右面板：两条量尺 + 结论 */
    var r = L.right, bx = r.x + 18, bw = r.w - 36, y0 = r.y + 70;
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 18, r.y + 30, "两条量尺：还要不要加剂量？", "#5a6472", "start", 10, 700);

    tx(gB, bx, y0 - 8, "① 反应强度 resp = " + resp.toFixed(1) + "%", "#b8402f", "start", 9.2, 700);
    el("rect", { x: bx, y: y0, width: bw, height: 18, rx: 5, fill: "#f3f1ee", stroke: "#e6e9ee" }, gB);
    el("rect", { x: bx, y: y0, width: Math.max(2, bw * resp / 100), height: 18, rx: 5, fill: "#b8402f", opacity: 0.82 }, gB);
    el("line", { x1: bx + bw / 2, y1: y0 - 4, x2: bx + bw / 2, y2: y0 + 22, stroke: "#b8791f", "stroke-width": 1.4 }, gB);
    tx(gB, bx + bw / 2 + 5, y0 + 34, "50%", "#b8791f", "start", 8.2, 700);

    tx(gB, bx, y0 + 68, "② 每加 1 单位换来的反应 = " + s.gain.toFixed(2), "#2f8a5b", "start", 9.2, 700);
    el("rect", { x: bx, y: y0 + 76, width: bw, height: 18, rx: 5, fill: "#f3f1ee", stroke: "#e6e9ee" }, gB);
    el("rect", { x: bx, y: y0 + 76, width: Math.max(2, bw * Math.min(1, s.gain / 8.3)), height: 18, rx: 5, fill: "#2f8a5b", opacity: 0.82 }, gB);

    var ny = y0 + 128;
    if (A < 5) {
      wrap(gB, bx, ny, "低剂量段：曲线很陡，加一点剂量反应就明显上升——激素微量高效，极少的量就够用。", bw, 9.2, "#3a3a35", 15);
    } else if (A <= 15) {
      wrap(gB, bx, ny, "已到半最大效应 d≈10：反应强度约 50%，再加剂量反应涨得越来越慢。", bw, 9.2, "#8a5a12", 15);
    } else {
      wrap(gB, bx, ny, "高剂量段：受体被占满、趋于饱和，加量收益很小——量多不等于效果好。", bw, 9.2, "#2b5f8f", 15);
    }
    wrap(gB, bx, ny + 52, "激素只起调节作用、不起催化作用，起作用后被灭活，所以需要持续分泌。", bw, 9, "#5a6472", 14);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.resp.toFixed(1);
    $("gxVc").textContent = s.gain.toFixed(2);
    if (A < 5) { st = "低剂量段"; col = "#b8402f"; bg = "#fbeae7"; sn = "反应随剂量快速上升"; }
    else if (A <= 15) { st = "半最大效应"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "d≈10，resp≈50%"; }
    else { st = "接近饱和"; col = "#b8791f"; bg = "#fdf3e0"; sn = "加量收益越来越小"; }
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 10 }, { t: 6.5, v: 10 }, { t: 9, v: 100 }, { t: 11, v: 60 }, { t: 13, v: 1 }],
    keys: [1, 10, 60, 100],
    value: A, min: 1, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1, eq: { resp: 9.09 } },
    { v: 10, eq: { resp: 50 } },
    { v: 100, eq: { resp: 90.9 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
