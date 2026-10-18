/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 0;

  /* 纯函数：保温时间 t(min) → 两组沉淀物放射性占比%。render 和 __bio.cases 共用 */
  function calc(v) {
    var t = Math.max(0, Math.min(30, Math.round(v)));
    return { t: t, p32: t <= 15 ? 20 + 4 * t : 80 - 2 * (t - 15), p35: 20 };
  }

  /* 几何：左面板两支离心管，右面板曲线区 */
  function geom() {
    var o = {};
    if (L === W) {
      o.tube = { y: 64, h: 282, w: 100 };
      o.tubes = [{ x: 46, name: "32P 组", sub: "标记 DNA", key: "p32" }, { x: 176, name: "35S 组", sub: "标记蛋白质", key: "p35" }];
      o.note = { x: 304, y: 104 };
      o.plot = { x0: 512, x1: 826, y0: 320, y1: 90 };
      o.foot = { x: 476, y: 366, lh: 19 };
    } else {
      o.tube = { y: 64, h: 190, w: 84 };
      o.tubes = [{ x: 62, name: "32P 组", sub: "标记 DNA", key: "p32" }, { x: 200, name: "35S 组", sub: "标记蛋白质", key: "p35" }];
      o.note = null;
      o.plot = { x0: 56, x1: 336, y0: 556, y1: 372 };
      o.foot = { x: 28, y: 606, lh: 18 };
    }
    return o;
  }

  function tube(g, tp, pct) {
    var t = G.tube, x = tp.x, y = t.y, w = t.w, h = t.h;
    el("rect", { x: x, y: y, width: w, height: h, rx: 12, fill: "#ffffff", stroke: "#b8c4cf", "stroke-width": 1.4 }, g);
    var iy = y + 8, ih = h - 16;
    el("rect", { x: x + 8, y: iy, width: w - 16, height: ih, rx: 8, fill: "#eef4f9" }, g);
    var ph = Math.max(6, Math.round(ih * pct / 100)), py = iy + ih - ph;
    el("rect", { x: x + 8, y: py, width: w - 16, height: ph, rx: 6, fill: "#f6d7d0", stroke: "#b8402f", "stroke-width": 1 }, g);
    tx(g, x + w / 2, iy + 16, "上清 " + (100 - pct) + "%", "#6b7480", "middle", 9, 700);
    if (ph > 26) tx(g, x + w / 2, py + 15, "沉淀 " + pct + "%", "#b8402f", "middle", 9, 700);
    if (ph > 40) {
      el("ellipse", { cx: x + w / 2 - 16, cy: py + ph - 12, rx: 12, ry: 5, fill: "none", stroke: "#b8402f", "stroke-width": 1, opacity: 0.8 }, g);
      el("ellipse", { cx: x + w / 2 + 16, cy: py + ph - 12, rx: 12, ry: 5, fill: "none", stroke: "#b8402f", "stroke-width": 1, opacity: 0.8 }, g);
    }
    tx(g, x + w / 2, y + h + 18, tp.name, "#151a21", "middle", 9.6, 700);
    tx(g, x + w / 2, y + h + 33, tp.sub, "#8b949e", "middle", 8.8, 400);
  }

  function draw() {
    var p = calc(A), gA = $("gxA"), gB = $("gxB"), lp = L.left, rp = L.right;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: lp.x, y: lp.y, width: lp.w, height: lp.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lp.x + 20, lp.y + 28, "离心后：上清液 vs 沉淀物", "#5a6472", "start", 10.5, 700);
    tx(gA, lp.x + 20, lp.y + 46, "管底沉淀物 = 大肠杆菌", "#8b949e", "start", 9, 400);

    for (var i = 0; i < G.tubes.length; i++) tube(gA, G.tubes[i], p[G.tubes[i].key]);

    if (G.note) {
      var nx = G.note.x, ny = G.note.y;
      tx(gA, nx, ny, "红 = 放射性", "#3a3a35", "start", 9, 700);
      tx(gA, nx, ny + 18, "32P：DNA 进菌体", "#3a3a35", "start", 9, 400);
      tx(gA, nx, ny + 33, "→ 沉淀物高", "#b8402f", "start", 9, 700);
      tx(gA, nx, ny + 60, "35S：外壳在外面", "#3a3a35", "start", 9, 400);
      tx(gA, nx, ny + 75, "→ 上清液高", "#2f8a5b", "start", 9, 700);
    }

    el("rect", { x: rp.x, y: rp.y, width: rp.w, height: rp.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rp.x + 20, rp.y + 28, "32P 组：沉淀物放射性占比", "#5a6472", "start", 10.5, 700);
    var P = G.plot, X = P.x1 - P.x0, Y = P.y0 - P.y1;
    function px(t) { return P.x0 + (t / 30) * X; }
    function py(v) { return P.y0 - (v / 100) * Y; }

    el("line", { x1: P.x0, y1: P.y0, x2: P.x1, y2: P.y0, stroke: "#9aa6b2", "stroke-width": 1.2 }, gB);
    el("line", { x1: P.x0, y1: P.y0, x2: P.x0, y2: P.y1, stroke: "#9aa6b2", "stroke-width": 1.2 }, gB);
    tx(gB, P.x0 - 8, P.y1 - 6, "占比%", "#8b949e", "end", 9, 700);
    var tl = [[0, "0"], [15, "15"], [30, "30"]];
    for (var k = 0; k < tl.length; k++) tx(gB, px(tl[k][0]), P.y0 + 16, tl[k][1], "#8b949e", "middle", 9, 400);
    var yl = [[0, "0"], [40, "40"], [80, "80"], [100, "100"]];
    for (var m = 0; m < yl.length; m++) tx(gB, P.x0 - 8, py(yl[m][0]) + 3, yl[m][1], "#8b949e", "end", 9, 400);
    tx(gB, (P.x0 + P.x1) / 2, P.y0 + 32, "保温时间 t / min", "#6b7480", "middle", 9, 700);

    var d32 = "", d35 = "";
    for (var t = 0; t <= 30; t++) {
      d32 += (t ? " " : "") + px(t).toFixed(1) + "," + py(calc(t).p32).toFixed(1);
      d35 += (t ? " " : "") + px(t).toFixed(1) + "," + py(20).toFixed(1);
    }
    el("polyline", { points: d35, fill: "none", stroke: "#2f8a5b", "stroke-width": 2, "stroke-dasharray": "6 4" }, gB);
    el("polyline", { points: d32, fill: "none", stroke: "#b8402f", "stroke-width": 2.4 }, gB);

    var cx = px(p.t), cy = py(p.p32);
    el("line", { x1: cx, y1: cy, x2: cx, y2: P.y0, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0.7 }, gB);
    el("circle", { cx: cx, cy: cy, r: 4.6, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2.2 }, gB);
    var lb = "t=" + p.t + "，沉淀 " + p.p32 + "%", right = cx > P.x1 - 120;
    tx(gB, right ? cx - 10 : cx + 10, cy - 10, lb, "#b8402f", right ? "end" : "start", 9.2, 700);

    var f = G.foot;
    tx(gB, f.x, f.y, "峰值 t=15：80%，侵染完成、未裂解", "#3a3a35", "start", 9, 700);
    tx(gB, f.x, f.y + f.lh, "过短→DNA 未进入；过长→细菌裂解", "#3a3a35", "start", 9, 400);
    tx(gB, f.x, f.y + f.lh * 2, "两头都让上清液放射性升高", "#b8402f", "start", 9, 700);
    tx(gB, f.x, f.y + f.lh * 3, "35S 组沉淀物恒 20%（绿虚线）", "#2f8a5b", "start", 9, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; stage.setAttribute("viewBox", L.vb); G = geom(); }
    var p = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(p.t);
    $("gxVb").textContent = String(p.p32);
    $("gxVc").textContent = String(p.p35);
    if (p.t < 10) { st = "侵染不充分"; col = "#b8402f"; bg = "#fbeae7"; sn = "DNA 还没进菌体，上清液偏高"; }
    else if (p.t <= 22) { st = "最适窗口"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "侵染完成、细菌未裂解"; }
    else { st = "细菌裂解"; col = "#b8791f"; bg = "#fdf3e0"; sn = "子代噬菌体释放，上清液又升高"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 15 }, { t: 6.5, v: 15 }, { t: 9, v: 30 }, { t: 11, v: 24 }, { t: 13, v: 0 }],
    keys: [0, 15, 24, 30],
    value: A, min: 0, max: 30, step: 2,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { p32: 20 } },
    { v: 15, eq: { p32: 80 } },
    { v: 30, eq: { p32: 50 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
