/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 330 }, right: { x: 8, y: 340, w: 344, h: 352 } };
  var L = null, G = null, A = 75, MAX = 30;

  /* 纯函数：甲组有效人数 a → χ² 与显著性档位。render() 和 __model.cases 都用它 */
  function calc(v) {
    var a = Math.round(v), b = 100 - a, c = 60, d = 40, n = 200;
    var dif = a * d - b * c;
    var den = (a + b) * (c + d) * (a + c) * (b + d);
    var chi = n * dif * dif / den;
    var sig = chi >= 3.841 ? 1 : 0;
    var lv = chi >= 6.635 ? 2 : sig;
    return { a: a, b: b, c: c, d: d, n: n, dif: dif, chi: chi, sig: sig, lv: lv };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  /* 几何：由面板尺寸推出表格与数值条的位置 */
  function geom() {
    var p = L, wide = p === W, t, r;
    if (wide) {
      t = { x: p.left.x + 40, y: p.left.y + 46, w: 344, hh: 30, rh: 34 };
      r = { x: p.right.x + 24, y: p.right.y, w: p.right.w - 48 };
    } else {
      t = { x: p.left.x + 16, y: p.left.y + 42, w: 312, hh: 26, rh: 30 };
      r = { x: p.right.x + 16, y: p.right.y, w: p.right.w - 32 };
    }
    t.cw = t.w / 4;
    t.h = t.hh + 3 * t.rh;
    return { wide: wide, t: t, r: r };
  }

  var C = { blue: "#2563eb", green: "#2f8a5b", amber: "#b8791f", red: "#b8402f", gray: "#5a6472", ink: "#151a21", line: "#b9c8d6" };

  function draw() {
    var s = calc(A), t = G.t, r = G.r, wide = G.wide;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var fs = wide ? 13 : 11.5, fs2 = wide ? 10 : 8.6;

    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 30, "2×2 列联表（总计 200 人）", C.gray, "start", 10.5, 700);

    /* 四个格子：列＝有效/无效/合计，行＝甲/乙/合计 */
    var rows = [
      ["甲组", String(s.a), String(s.b), String(s.a + s.b)],
      ["乙组", String(s.c), String(s.d), String(s.c + s.d)],
      ["合计", String(s.a + s.c), String(s.b + s.d), "n=" + s.n]
    ];
    el("rect", { x: t.x + t.cw, y: t.y + t.hh, width: t.cw * 2, height: t.rh * 2, fill: "#e8f2ff" }, gA);
    el("rect", { x: t.x, y: t.y, width: t.w, height: t.hh, fill: "#eef3f8" }, gA);
    el("rect", { x: t.x, y: t.y + t.hh + 2 * t.rh, width: t.w, height: t.rh, fill: "#f4f7fa" }, gA);
    el("rect", { x: t.x, y: t.y, width: t.w, height: t.h, fill: "none", stroke: C.line, "stroke-width": 1.1 }, gA);
    var hd = ["组别", "有效", "无效", "合计"], i, j;
    for (i = 1; i < 4; i++) el("line", { x1: t.x + t.cw * i, y1: t.y, x2: t.x + t.cw * i, y2: t.y + t.h, stroke: C.line }, gA);
    for (i = 1; i < 4; i++) el("line", { x1: t.x, y1: t.y + t.hh + t.rh * (i - 1), x2: t.x + t.w, y2: t.y + t.hh + t.rh * (i - 1), stroke: C.line }, gA);
    for (i = 0; i < 4; i++) tx(gA, t.x + t.cw * (i + 0.5), t.y + t.hh * 0.66, hd[i], C.gray, "middle", fs2, 700);
    for (j = 0; j < 3; j++) {
      for (i = 0; i < 4; i++) {
        var isCore = (j < 2 && i > 0 && i < 3);
        var col = isCore ? C.blue : (j === 2 ? C.gray : "#3a3a35");
        tx(gA, t.x + t.cw * (i + 0.5), t.y + t.hh + t.rh * (j + 0.62), rows[j][i], col, "middle", isCore ? fs + 2 : fs - 0.5, isCore ? 700 : 400);
      }
    }

    var by = t.y + t.h + (wide ? 26 : 22);
    tx(gA, t.x - 4, by, "ad − bc = " + s.dif, s.dif === 0 ? C.gray : C.ink, "start", wide ? 11 : 9.6, 700);
    tx(gA, t.x - 4, by + (wide ? 17 : 15), "a×d − b×c，先算它再平方", C.gray, "start", wide ? 9.4 : 8.4, 400);

    /* 两组有效率对比条 */
    var ly = by + (wide ? 46 : 40), bw = t.w, bh = wide ? 14 : 11;
    var bars = [["甲组", s.a, C.blue], ["乙组", s.c, C.amber]];
    for (i = 0; i < 2; i++) {
      var yy = ly + i * (wide ? 34 : 30);
      tx(gA, t.x - 4, yy, bars[i][0], C.gray, "start", wide ? 9.4 : 8.6, 700);
      el("rect", { x: t.x, y: yy + 6, width: bw, height: bh, rx: 3, fill: "#eef3f8" }, gA);
      el("rect", { x: t.x, y: yy + 6, width: Math.max(2, bw * bars[i][1] / 100), height: bh, rx: 3, fill: bars[i][2] }, gA);
      tx(gA, t.x + bw * bars[i][1] / 100 + 6, yy + 6 + bh - 2, bars[i][1] + "%", bars[i][2], "start", wide ? 9 : 8.2, 700);
    }
    wrap(gA, t.x - 4, ly + (wide ? 96 : 72), "公式里的 n 是总人数 200，不是甲组的 100。", bw, wide ? 9.2 : 8.2, C.red, wide ? 14 : 12);
    wrap(gA, t.x - 4, ly + (wide ? 130 : 94), "两组有效率只差十几个百分点，差多少才算显著，要由 χ² 与临界值定。", bw, wide ? 9.2 : 8.2, C.gray, wide ? 14 : 12);

    /* 右面板：χ² 与两条临界值 */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x, L.right.y + 30, "χ² 统计量与临界值", C.gray, "start", 10.5, 700);
    var cy = L.right.y + (wide ? 96 : 84);
    tx(gB, r.x, cy, "χ² =", C.gray, "start", wide ? 16 : 13, 700);
    var chiCol = s.lv === 0 ? C.amber : (s.lv === 1 ? C.blue : C.green);
    tx(gB, r.x + (wide ? 52 : 42), cy, s.chi.toFixed(2), chiCol, "start", wide ? 34 : 26, 700);
    tx(gB, r.x, cy + (wide ? 26 : 21), "3.841 → 95%　6.635 → 99%", C.gray, "start", wide ? 9 : 8.2, 400);

    var bx = r.x, bwd = r.w, byy = L.right.y + (wide ? 150 : 130), bh2 = wide ? 22 : 18;
    el("rect", { x: bx, y: byy, width: bwd, height: bh2, rx: 4, fill: "#eef3f8" }, gB);
    var p1 = bwd * 3.841 / MAX, p2 = bwd * 6.635 / MAX;
    el("rect", { x: bx + p1, y: byy, width: bwd - p1, height: bh2, fill: "#eafaef" }, gB);
    el("rect", { x: bx, y: byy, width: Math.max(3, Math.min(bwd, bwd * s.chi / MAX)), height: bh2, rx: 4, fill: chiCol, opacity: 0.85 }, gB);
    el("line", { x1: bx + p1, y1: byy - 5, x2: bx + p1, y2: byy + bh2 + 5, stroke: C.amber, "stroke-width": 1.4 }, gB);
    el("line", { x1: bx + p2, y1: byy - 5, x2: bx + p2, y2: byy + bh2 + 5, stroke: C.green, "stroke-width": 1.4 }, gB);
    tx(gB, bx, byy + bh2 + (wide ? 20 : 17), "0", C.gray, "start", 8.4, 400);
    tx(gB, bx + p1 + 4, byy + bh2 + (wide ? 20 : 17), "3.841", C.amber, "start", 8.4, 700);
    tx(gB, bx + p2 + 4, byy + bh2 + (wide ? 20 : 17), "6.635", C.green, "start", 8.4, 700);
    tx(gB, bx + bwd, byy + bh2 + (wide ? 20 : 17), "30", C.gray, "end", 8.4, 400);

    var stTitle = s.lv === 0 ? "证据不足：不下「有关联」的结论" : (s.lv === 1 ? "越过 3.841：95% 的把握" : "越过 6.635：99% 的把握");
    var stBody = s.lv === 0
      ? "χ² 还不到 3.841，只能说「没有充分证据说明两个变量有关联」，不能说它们无关。"
      : (s.lv === 1
        ? "χ² 越过 3.841，有 95% 的把握认为两个变量有关联——是 95% 的把握，不是一定有关。"
        : "χ² 越过 6.635，有 99% 的把握认为两个变量有关联；把握更大，措辞仍是「有关联」，不是「一定有关」。");
    var sy = byy + bh2 + (wide ? 54 : 46);
    tx(gB, bx, sy, stTitle, chiCol, "start", wide ? 11 : 9.6, 700);
    wrap(gB, bx, sy + (wide ? 22 : 19), stBody, bwd, wide ? 10 : 9, "#3a3a35", wide ? 16 : 14);
    wrap(gB, bx, sy + (wide ? 80 : 68), "演示会在这两处停住：a=70 时 χ²≈2.20 还在线下，a=75 时 χ²≈5.13 刚越线。", bwd, wide ? 9.2 : 8.4, C.gray, wide ? 14 : 12);
    wrap(gB, bx, sy + (wide ? 116 : 96), "判定顺序：算 χ² → 和 3.841 / 6.635 比 → 把结论写成带「把握」的句子。", bwd, wide ? 9.2 : 8.4, C.blue, wide ? 14 : 12);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.chi.toFixed(2);
    $("gxVc").textContent = s.a + "%";
    if (s.lv === 0) { st = "没有充分证据"; col = "#b8791f"; bg = "#fdf3e0"; sn = "χ²<3.841，不能说无关"; }
    else if (s.lv === 1) { st = "有 95% 把握"; col = "#2563eb"; bg = "#eef4ff"; sn = "χ²≥3.841，不是一定有关"; }
    else { st = "有 99% 把握"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "χ²≥6.635，仍不是一定"; }
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
    loop: [{ t: 0, v: 60 }, { t: 1.2, v: 60 }, { t: 4, v: 75 }, { t: 6.5, v: 75 }, { t: 9, v: 90 }, { t: 11.5, v: 70 }, { t: 13.5, v: 60 }],
    keys: [60, 70, 75, 90],
    value: A, min: 0, max: 100, step: 5,
    idle: 5000,
    onChange: function (v) { A = Math.round(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 60, eq: { chi: 0, sig: 0 } },
    { v: 75, eq: { chi: 5.1282, sig: 1 } },
    { v: 90, eq: { chi: 24, sig: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
