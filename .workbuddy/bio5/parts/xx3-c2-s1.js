/* 互动脚本：r（生长素 ÷ 细胞分裂素）→ 生芽 / 生根倾向。比值高→生根，是教材方向 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0.25, G = null, KS = [0.25, 1, 4, 8];
  var CG = "#2f8a5b", CR = "#b8402f", CT = "#5a6472", CD = "#3a3a35";

  /* 纯函数：render() 与 __model.cases 共用 */
  function calc(v) { return { r: v, shoot: 100 / (1 + v), root: 100 * v / (1 + v) }; }

  function geom() {
    var l = L.left, p = L.right;
    return {
      lx: l.x, ly: l.y, lw: l.w, lh: l.h, rx: p.x, ry: p.y, rw: p.w, rh: p.h,
      cx: l.x + l.w * 0.30, cy: l.y + l.h * 0.56, rad: Math.min(l.w, l.h) * 0.095,
      upMax: l.h * 0.33, dnMax: l.h * 0.33,
      bx: p.x + 62, bw: p.w - 102, bh: Math.max(12, p.h * 0.042),
      by1: p.y + p.h * 0.26, by2: p.y + p.h * 0.36, sy: p.y + p.h * 0.64
    };
  }

  function bar(g, x, y, w, h, pct, col, bg) {
    el("rect", { x: x, y: y, width: w, height: h, rx: h / 2, fill: bg }, g);
    el("rect", { x: x, y: y, width: Math.max(3, w * pct / 100), height: h, rx: h / 2, fill: col }, g);
  }

  function draw() {
    var a = $("gxA"), b = $("gxB");
    a.textContent = ""; b.textContent = "";
    var s = calc(A), g = G, h1 = g.upMax * s.shoot / 100, h2 = g.dnMax * s.root / 100;
    var t1 = g.cy - g.rad - h1, t2 = g.cy + g.rad + h2, i, px, gx;

    el("rect", { x: g.lx, y: g.ly, width: g.lw, height: g.lh, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, a);
    tx(a, g.lx + 20, g.ly + 30, "愈伤组织：往哪边分化", CT, "start", 10.5, 700);
    tx(a, g.lx + 20, g.ly + 50, "比值 r 一变，丛芽与根此消彼长", CT, "start", 9.4, 400);

    /* 丛芽向上，长度 ∝ 生芽倾向 */
    el("path", { d: "M" + g.cx + " " + (g.cy - g.rad) + "V" + t1, stroke: CG, "stroke-width": 2, fill: "none" }, a);
    if (h1 > 12) el("path", { d: "M" + (g.cx - 14) + " " + (t1 + 10) + "L" + (g.cx - 3) + " " + (t1 + 2) + "M" + (g.cx + 14) + " " + (t1 + 10) + "L" + (g.cx + 3) + " " + (t1 + 2), stroke: CG, "stroke-width": 1.6, fill: "none" }, a);
    /* 根向下，长度 ∝ 生根倾向 */
    el("path", { d: "M" + g.cx + " " + (g.cy + g.rad) + "V" + t2, stroke: CR, "stroke-width": 2, fill: "none" }, a);
    if (h2 > 12) el("path", { d: "M" + g.cx + " " + (g.cy + g.rad + h2 * 0.4) + "L" + (g.cx - 12) + " " + (g.cy + g.rad + h2 * 0.92) + "M" + g.cx + " " + (g.cy + g.rad + h2 * 0.6) + "L" + (g.cx + 12) + " " + (g.cy + g.rad + h2) , stroke: CR, "stroke-width": 1.2, fill: "none" }, a);

    el("ellipse", { cx: g.cx, cy: g.cy, rx: g.rad * 1.2, ry: g.rad, fill: "#eef8f2", stroke: "#4a9d76", "stroke-width": 1.4 }, a);
    for (i = 0; i < 3; i++) el("circle", { cx: g.cx + [0.4, -0.35, 0.05][i] * g.rad, cy: g.cy + [0.1, 0.3, -0.4][i] * g.rad, r: g.rad * 0.17, fill: "#4a9d76", opacity: 0.7 }, a);
    tx(a, g.cx + g.rad * 1.7, t1 + 8, "丛芽 " + Math.round(s.shoot) + "%", CG, "start", 9.6, 700);
    tx(a, g.cx + g.rad * 1.7, t2, "根 " + Math.round(s.root) + "%", CR, "start", 9.6, 700);

    /* 右：两条进度条 + 比值刻度 */
    el("rect", { x: g.rx, y: g.ry, width: g.rw, height: g.rh, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, b);
    tx(b, g.rx + 20, g.ry + 30, "两类倾向，加起来永远是 100%", CT, "start", 10.5, 700);
    tx(b, g.rx + 16, g.by1 + g.bh * 0.72, "生芽", CD, "start", 9.8, 700);
    bar(b, g.bx, g.by1, g.bw, g.bh, s.shoot, CG, "#e6f6ee");
    tx(b, g.rx + g.rw - 16, g.by1 + g.bh * 0.72, Math.round(s.shoot) + "%", CG, "end", 9.8, 700);
    tx(b, g.rx + 16, g.by2 + g.bh * 0.72, "生根", CD, "start", 9.8, 700);
    bar(b, g.bx, g.by2, g.bw, g.bh, s.root, CR, "#fbeae7");
    tx(b, g.rx + g.rw - 16, g.by2 + g.bh * 0.72, Math.round(s.root) + "%", CR, "end", 9.8, 700);
    el("line", { x1: g.bx + g.bw * 0.5, y1: g.by1 - 6, x2: g.bx + g.bw * 0.5, y2: g.by2 + g.bh + 6, stroke: "#c9d6e0", "stroke-dasharray": "4 4" }, b);

    el("line", { x1: g.bx, y1: g.sy, x2: g.bx + g.bw, y2: g.sy, stroke: "#9db0bf", "stroke-width": 1.2 }, b);
    for (i = 0; i < KS.length; i++) {
      gx = g.bx + g.bw * (Math.log(KS[i] / 0.25) / Math.LN2 / 5);
      el("line", { x1: gx, y1: g.sy, x2: gx, y2: g.sy + 5, stroke: "#9db0bf" }, b);
      tx(b, gx, g.sy + 18, String(KS[i]), CT, "middle", 8.6, 400);
    }
    px = g.bx + g.bw * (Math.log(A / 0.25) / Math.LN2 / 5);
    el("polygon", { points: px + "," + (g.sy - 2) + " " + (px - 5) + "," + (g.sy - 10) + " " + (px + 5) + "," + (g.sy - 10), fill: "#151a21" }, b);
    tx(b, g.rx + 20, g.sy - 16, "生长素/细胞分裂素比值 r", CT, "start", 9.4, 400);
    tx(b, g.bx, g.sy + 36, "比值低 → 偏生芽", CT, "start", 9.2, 400);
    tx(b, g.bx + g.bw, g.sy + 36, "比值高 → 偏生根", CT, "end", 9.2, 400);
    tx(b, g.rx + 20, g.ry + g.rh - 18, "比值高→生根、比值低→生芽；r=1 时各 50%", CD, "start", 9.2, 400);
  }

  function render() {
    if (!G) { G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(2);
    $("gxVb").textContent = Math.round(s.shoot) + "%";
    $("gxVc").textContent = Math.round(s.root) + "%";
    if (A < 0.5) { st = "偏生芽"; col = "#b8791f"; bg = "#fdf3e0"; sn = "细胞分裂素占优，比值低"; }
    else if (A <= 2) { st = "平衡"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "比值≈1，两类倾向接近"; }
    else { st = "偏生根"; col = "#b8402f"; bg = "#fbeae7"; sn = "生长素占优，比值高"; }
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
    mount: stage, follow: $("gxSl"),
    loop: [{ t: 0, v: 0.25 }, { t: 1.0, v: 0.25 }, { t: 3.6, v: 1 }, { t: 6.1, v: 1 }, { t: 8.6, v: 8 }, { t: 10.6, v: 4 }, { t: 12.6, v: 0.25 }],
    keys: KS, value: A, min: 0.25, max: 8, step: 0.25, idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = window.__bio = { calc: calc, cases: [
    { v: 0.25, eq: { shoot: 80, root: 20 } },
    { v: 1, eq: { shoot: 50, root: 50 } },
    { v: 4, eq: { shoot: 20, root: 80 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
