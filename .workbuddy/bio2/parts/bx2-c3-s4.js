/* bx2-c3-s4 互动脚本（不带 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var C = { ink: "#151a21", mut: "#5a6472", dim: "#7a8794", blue: "#2f6f9e", light: "#e8f2fa", edge: "#b8d7e9", green: "#2f8a5b", amber: "#b8791f", red: "#b8402f" };

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", pa: { x: 16, y: 16, w: 424, h: 438 }, pb: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", pa: { x: 8, y: 8, w: 344, h: 300 }, pb: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 900, G = null;

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var aa = v / 3;
    return { aa: aa, mrna: v, water: aa - 1 };
  }

  /* 布局几何：只在 layout() 和 render() 兜底时算一次 */
  function geom() {
    var wide = (L === W), pa = L.pa, pb = L.pb;
    var band = {
      x: pa.x + (wide ? 20 : 16),
      y: pa.y + (wide ? 150 : 120),
      w: wide ? 384 : 312,
      h: wide ? 34 : 26
    };
    var bx = pb.x + (wide ? 24 : 16), bw = wide ? 360 : 312;
    var ys = wide ? [92, 190, 288] : [72, 148, 224];
    var bh = wide ? 20 : 18, bars = [];
    for (var i = 0; i < 3; i++) bars.push({ x: bx, y: pb.y + ys[i], w: bw, h: bh });
    return { wide: wide, pa: pa, pb: pb, band: band, bars: bars, bw: bw };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var wide = G.wide, pa = G.pa, pb = G.pb, b = G.band, s = calc(A);

    el("rect", { x: pa.x, y: pa.y, width: pa.w, height: pa.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: pb.x, y: pb.y, width: pb.w, height: pb.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, pa.x + 20, pa.y + 30, "一个 DNA 分子（长带子）", C.mut, "start", wide ? 10.5 : 9.6, 700);
    tx(gB, pb.x + 24, pb.y + 30, "mRNA 与多肽（按比例）", C.mut, "start", wide ? 10.5 : 9.6, 700);

    /* 左：带子 + 深色基因段 */
    el("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 6, fill: C.light, stroke: C.edge }, gA);
    var gw = Math.max(42, Math.round(b.w * (0.16 + 0.62 * (A - 300) / 2700)));
    el("rect", { x: b.x + 2, y: b.y + 2, width: gw, height: b.h - 4, rx: 4, fill: C.blue }, gA);
    tx(gA, b.x + gw / 2, b.y + b.h / 2 + 3.6, "基因", "#ffffff", "middle", wide ? 10 : 9, 700);
    tx(gA, b.x, b.y - 10, "L = " + Math.round(A) + " 个碱基对", C.mut, "start", wide ? 9.4 : 8.8, 400);
    tx(gA, b.x + b.w, b.y - 10, "非基因片段", C.dim, "end", 8.6, 400);
    tx(gA, b.x, b.y + b.h + 22, "基因只是带子上的一段", C.mut, "start", wide ? 9.4 : 8.6, 400);

    var l1 = b.y + b.h + 40, l2 = l1 + 22, l3 = l1 + 54;
    el("rect", { x: b.x, y: l1 - 10, width: 22, height: 12, rx: 3, fill: C.blue }, gA);
    tx(gA, b.x + 30, l1, "基因：有遗传效应的片段", C.ink, "start", wide ? 9.4 : 8.8, 400);
    el("rect", { x: b.x, y: l2 - 10, width: 22, height: 12, rx: 3, fill: C.light, stroke: C.edge }, gA);
    tx(gA, b.x + 30, l2, "非基因片段：没有遗传效应", C.ink, "start", wide ? 9.4 : 8.8, 400);
    tx(gA, b.x, l3, "每 3 个碱基对 → 1 个氨基酸", C.blue, "start", wide ? 9.4 : 8.8, 700);
    tx(gA, b.x, l3 + (wide ? 26 : 24), "深色只是一小段，非基因片段可以很长", C.dim, "start", wide ? 9 : 8.4, 400);

    /* 右：三条按比例的长条 */
    var rows = [
      { n: "mRNA 碱基数", v: s.mrna, max: 3000, c: C.blue },
      { n: "最多氨基酸数", v: s.aa, max: 1000, c: C.green },
      { n: "脱水数", v: s.water, max: 1000, c: C.amber }
    ];
    for (var i = 0; i < 3; i++) {
      var r = G.bars[i], rw = Math.max(4, r.w * rows[i].v / rows[i].max);
      tx(gB, r.x, r.y - 8, rows[i].n, C.mut, "start", wide ? 9.4 : 8.8, 400);
      tx(gB, r.x + r.w, r.y - 8, Math.round(rows[i].v) + " 个", C.ink, "end", wide ? 10 : 9.2, 700);
      el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 4, fill: "#eef2f6" }, gB);
      el("rect", { x: r.x, y: r.y, width: rw, height: r.h, rx: 4, fill: rows[i].c }, gB);
    }
    var f1 = pb.y + (wide ? 342 : 272);
    tx(gB, G.bars[0].x, f1, "氨基酸数 = L ÷ 3", C.mut, "start", wide ? 9.4 : 8.6, 400);
    tx(gB, G.bars[0].x, f1 + (wide ? 24 : 22), "mRNA 碱基数 = L；脱水数 = aa − 1", C.mut, "start", wide ? 9.4 : 8.6, 400);
    tx(gB, G.bars[0].x, f1 + (wide ? 48 : 44), "L = 900 时最多 300 个氨基酸", C.green, "start", wide ? 9.4 : 8.6, 700);
    tx(gB, G.bars[0].x, f1 + (wide ? 72 : 66), "真核基因有内含子 → 实际更少", C.red, "start", wide ? 9.4 : 8.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = String(Math.round(s.mrna));
    $("gxVc").textContent = String(Math.round(s.aa));
    $("gxVc").nextElementSibling.textContent = "脱水数 " + Math.round(s.water);
    if (A < 900) { st = "偏短"; col = "#b8791f"; bg = "#fdf3e0"; sn = "编码的氨基酸少于 300 个"; }
    else if (A <= 2100) { st = "典型长度"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "L = 900 是最标准的一格"; }
    else { st = "长基因"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "编码的氨基酸超过 700 个"; }
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
    loop: [{ t: 0, v: 300 }, { t: 1.2, v: 300 }, { t: 4, v: 900 }, { t: 6.5, v: 900 }, { t: 9, v: 3000 }, { t: 11, v: 1500 }, { t: 13, v: 300 }],
    keys: [300, 900, 1500, 3000],
    value: A, min: 300, max: 3000, step: 100,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 300, eq: { aa: 100 } },
    { v: 900, eq: { aa: 300 } },
    { v: 3000, eq: { aa: 1000 } }
  ] };
  window.__model = window.__bio;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
