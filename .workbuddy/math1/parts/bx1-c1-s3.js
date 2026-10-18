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

  /* 纯函数：k = A∩B 的元素个数 → 三个量。render() 与 __model.cases 共用 */
  function calc(v) {
    var k = Math.round(v);
    return { k: k, union: 12 - k, onlyA: 6 - k, comp: 10 - 6 };
  }

  function geom() {
    var lb = L.left, rb = L.right, pad = 16;
    var u = { x: lb.x + pad, y: lb.y + 44, w: lb.w - 2 * pad, h: lb.h - 62 };
    var R = Math.min(u.h * 0.30, u.w * 0.19);
    var bar = { x: rb.x + 26, y: rb.y + 74, w: rb.w - 152, h: 14, gap: (rb.h - 150) / 3 };
    return { u: u, R: R, cx: u.x + u.w / 2, cy: u.y + u.h * 0.50, bar: bar };
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var u = G.u, R = G.R, cy = G.cy;
    /* 两个集合各 6 个元素：k 越大、圆心越靠近，k=6 时两圆重合（B⊆A） */
    var d = 2 * R * (1 - s.k / 6);
    var ax = G.cx - d / 2, bx = G.cx + d / 2;

    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 18, L.left.y + 28, "全集 U 有 10 个元素（外框）", "#5a6472", "start", 10.5, 700);
    el("rect", { x: u.x, y: u.y, width: u.w, height: u.h, rx: 8, fill: "#ffffff", stroke: "#cfd8e3" }, gA);
    el("circle", { cx: bx, cy: cy, r: R, fill: "#eaf2fd", stroke: "#2563eb", "stroke-width": 1.4 }, gA);
    el("circle", { cx: ax, cy: cy, r: R, fill: "#eaf2fd", stroke: "#2563eb", "stroke-width": 1.4 }, gA);
    var h = Math.sqrt(Math.max(0, R * R - d * d / 4)), mx = (ax + bx) / 2;
    el("path", {
      d: "M" + mx + " " + (cy - h) + " A" + R + " " + R + " 0 0 1 " + mx + " " + (cy + h) +
        " A" + R + " " + R + " 0 0 1 " + mx + " " + (cy - h) + " Z",
      fill: "#b9d4f8", stroke: "#2563eb", "stroke-width": 1.1
    }, gA);
    tx(gA, ax, cy - R - 9, "A", "#2563eb", "middle", 11, 700);
    tx(gA, bx, cy - R - 9, "B", "#2563eb", "middle", 11, 700);
    if (s.onlyA > 0) {
      tx(gA, ax - R * 0.48, cy + 4, String(s.onlyA), "#1e4fa3", "middle", 13, 700);
      tx(gA, bx + R * 0.48, cy + 4, String(s.onlyA), "#1e4fa3", "middle", 13, 700);
    }
    tx(gA, mx, cy + 4, String(s.k), "#151a21", "middle", 14, 700);
    tx(gA, u.x + 12, u.y + u.h - 11, "∁ᵤA：4 个，与 k 无关", "#b8791f", "start", 9.6, 700);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 18, L.right.y + 28, "三个数怎么跟着 k 变", "#5a6472", "start", 10.5, 700);
    var rows = [
      { lab: "|A∪B|", v: s.union, tot: 12, col: "#2563eb", sub: "12 − k" },
      { lab: "只属于 A", v: s.onlyA, tot: 12, col: "#2f8a5b", sub: "6 − k" },
      { lab: "∁ᵤA 的个数", v: s.comp, tot: 10, col: "#b8791f", sub: "10 − 6" }
    ];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], y = G.bar.y + i * G.bar.gap;
      tx(gB, G.bar.x, y - 7, r.lab + "（" + r.sub + "）", "#3a3a35", "start", 9.8, 700);
      el("rect", { x: G.bar.x, y: y, width: G.bar.w, height: G.bar.h, rx: 4, fill: "#eef2f6" }, gB);
      el("rect", { x: G.bar.x, y: y, width: Math.max(2, G.bar.w * r.v / r.tot), height: G.bar.h, rx: 4, fill: r.col }, gB);
      tx(gB, G.bar.x + G.bar.w + 14, y + 12, String(r.v), r.col, "start", 12, 700);
    }
    tx(gB, L.right.x + 18, L.right.y + L.right.h - 40, "|A∪B| = 12 − k 条条在缩，∁ᵤA 那条不动", "#151a21", "start", 9.6, 700);
    tx(gB, L.right.x + 18, L.right.y + L.right.h - 18, "k 取 0、3、6 三格看跳变", "#7d8896", "start", 9.2, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.k);
    $("gxVb").textContent = String(s.union);
    $("gxVc").textContent = String(s.onlyA);
    if (s.k === 0) { st = "不相交"; col = "#b8791f"; bg = "#fdf3e0"; sn = "两圈分离，并集 12"; }
    else if (s.k === 6) { st = "B⊆A"; col = "#2563eb"; bg = "#eaf1fd"; sn = "B 被 A 吞掉，并集 6"; }
    else { st = "部分重叠"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "重叠 k 个，并集 12 − k"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 6 }, { t: 11.5, v: 6 }, { t: 13.5, v: 0 }],
    keys: [0, 3, 6],
    value: A, min: 0, max: 6, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { union: 12, comp: 4 } },
    { v: 3, eq: { union: 9, onlyA: 3 } },
    { v: 6, eq: { union: 6, onlyA: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
