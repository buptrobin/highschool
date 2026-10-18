document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null;

  /* 纯函数：发育天数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var d = Math.max(0, Math.min(7, Math.round(v || 0)));
    var cells = Math.pow(2, d);
    var si = d === 0 ? 1 : d <= 3 ? 2 : d <= 4 ? 3 : 4;
    var names = ["", "受精卵", "卵裂期", "桑葚胚", "囊胚及以后"];
    return { d: d, cells: cells, stage: si, name: names[si], vol: 100 - 0.55 * d };
  }

  function geom() {
    var lp = L.left;
    return { lx: lp.x + lp.w / 2, ly: lp.y + lp.h * 0.56, lR: Math.min(lp.w, lp.h) * 0.36 };
  }

  function drawLeft(g, s) {
    var p = L.left, cx = G.lx, cy = G.ly, R = G.lR, i, k, sp, row, col, rows;
    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, g);
    tx(g, p.x + 18, p.y + 28, "胚胎外形：透明带内，几乎不长大", "#5a6472", "start", 10.5, 700);
    el("circle", { cx: cx, cy: cy, r: R + 5, fill: "none", stroke: "#cfe0ec", "stroke-dasharray": "3 4" }, g);
    el("circle", { cx: cx, cy: cy, r: R, fill: "#ffffff", stroke: "#9fc0d6", "stroke-width": 1.6 }, g);
    if (s.d >= 5) {
      el("circle", { cx: cx + R * 0.26, cy: cy, r: R * 0.52, fill: "#eaf3fa", stroke: "#2b6cb0" }, g);
      tx(g, cx + R * 0.26, cy + 4, "囊胚腔", "#2b6cb0", "middle", 9, 700);
      var m = Math.min(s.cells, 18);
      k = Math.ceil(Math.sqrt(m)); sp = R * 0.16; rows = Math.ceil(m / k);
      for (i = 0; i < m; i++) {
        row = Math.floor(i / k); col = i % k;
        el("circle", { cx: cx - R * 0.5 + (col - (k - 1) / 2) * sp, cy: cy + (row - (rows - 1) / 2) * sp, r: sp * 0.42, fill: "#e6f3ea", stroke: "#2f8a5b" }, g);
      }
      tx(g, cx - R * 0.5, cy + R * 0.44, "内细胞团", "#2f8a5b", "middle", 8.4, 700);
    } else {
      k = Math.ceil(Math.sqrt(s.cells)); sp = (R * 1.72) / k; rows = Math.ceil(s.cells / k);
      for (i = 0; i < s.cells; i++) {
        row = Math.floor(i / k); col = i % k;
        el("circle", { cx: cx + (col - (k - 1) / 2) * sp, cy: cy + (row - (rows - 1) / 2) * sp, r: Math.max(1.8, sp * 0.4), fill: "#e6f3ea", stroke: "#2f8a5b", "stroke-width": 0.8 }, g);
      }
    }
    tx(g, cx, p.y + p.h - 14, "细胞数 = 2ᵈ：d=0 时 1 个 → d=7 时 128 个（示意）", "#7a848f", "middle", 8.6, 400);
  }

  function drawRight(g, s) {
    var p = L.right, i, sc = s.stage >= 4 ? { col: "#b8791f", bg: "#fdf7ec" } : { col: "#2f8a5b", bg: "#e6f6ee" }, cw = 116, cx0, by, base, hMax, gw, step, h;
    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, g);
    tx(g, p.x + 18, p.y + 28, "读数：细胞数 vs 胚胎总体积", "#5a6472", "start", 10.5, 700);
    tx(g, p.x + 18, p.y + 84, String(s.cells), "#151a21", "start", 36, 700);
    tx(g, p.x + 18, p.y + 105, "个细胞 · 第 " + s.d + " 天", "#5a6472", "start", 10.5, 400);
    cx0 = p.x + p.w - 18 - cw;
    el("rect", { x: cx0, y: p.y + 54, width: cw, height: 38, rx: 8, fill: sc.bg, stroke: sc.col }, g);
    tx(g, cx0 + cw / 2, p.y + 79, s.name, sc.col, "middle", 12.5, 700);

    by = p.y + 132;
    tx(g, p.x + 18, by, "胚胎总体积（相对值）", "#5a6472", "start", 9.4, 400);
    tx(g, p.x + p.w - 18, by, s.vol.toFixed(0) + "%", "#b8791f", "end", 10.5, 700);
    el("rect", { x: p.x + 18, y: by + 8, width: p.w - 36, height: 10, rx: 5, fill: "#eef2f5" }, g);
    el("rect", { x: p.x + 18, y: by + 8, width: (p.w - 36) * s.vol / 100, height: 10, rx: 5, fill: "#d8a355" }, g);

    gw = p.w - 36; step = gw / 8; base = p.y + p.h - 62; hMax = Math.min(100, base - by - 46);
    tx(g, p.x + 18, base - hMax - 10, "细胞数（对数刻度）", "#5a6472", "start", 9, 400);
    for (i = 0; i < 8; i++) {
      h = 10 + (hMax - 10) * i / 7;
      el("rect", {
        x: p.x + 18 + i * step + step * 0.16, y: base - h, width: step * 0.68, height: h, rx: 3,
        fill: i === s.d ? "#2f8a5b" : "#dcecf4", stroke: i === s.d ? "#2f8a5b" : "#c8dbe8"
      }, g);
      tx(g, p.x + 18 + i * step + step * 0.5, base + 12, String(i), i === s.d ? "#2f8a5b" : "#8b96a1", "middle", 8, i === s.d ? 700 : 400);
    }
    tx(g, p.x + 18, p.y + p.h - 18, "细胞数 ↑，总体积 →（基本不变）", "#8a5a12", "start", 9.2, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; stage.setAttribute("viewBox", L.vb); G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.d);
    $("gxVb").textContent = String(s.cells);
    $("gxVc").textContent = s.name;
    if (s.d === 0) { st = "受精卵"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "1 个细胞，尚未卵裂"; }
    else if (s.d <= 3) { st = "卵裂期"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "细胞多而体积不变"; }
    else if (s.d === 4) { st = "桑葚胚"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "16 个细胞，仍无腔"; }
    else if (s.d === 5) { st = "囊胚"; col = "#b8791f"; bg = "#fdf7ec"; sn = "出现囊胚腔，开始分化"; }
    else { st = "囊胚后期"; col = "#b8791f"; bg = "#fdf7ec"; sn = "分割窗口已过，宜移植"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    drawLeft(gA, s); drawRight(gB, s);
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 4 }, { t: 6.5, v: 4 }, { t: 9, v: 7 }, { t: 11, v: 6 }, { t: 13, v: 0 }],
    keys: [0, 2, 4, 7],
    value: A, min: 0, max: 7, step: 1,
    idle: 5000,
    onChange: function (v) { A = Math.round(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 2, eq: { cells: 4 } },
    { v: 4, eq: { cells: 16 } },
    { v: 7, eq: { cells: 128 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(function () { G = null; render(); }, 150); });
  render();
});
