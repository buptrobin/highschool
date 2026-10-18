/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var G = null, L = W, A = 1;
  var NAME = ["感受器", "传入神经", "神经中枢", "传出神经", "效应器"];
  var SUB = ["感觉神经末梢", "把冲动送向中枢", "脊髓或脑中神经元群", "把冲动送向效应器", "末梢＋肌肉或腺体"];

  function geom() { return stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; }

  /* 纯函数：被损伤的环节 → 三个判定。render() 和 __bio.cases 都用它 */
  function calc(seg) {
    var s = Math.round(seg);
    return { ok: s <= 0 ? 1 : 0, sense: (s === 1 || s === 2) ? 0 : 1, eff: s === 5 ? 0 : 1 };
  }

  /* 中文按字数换行，避免长句冲出面板；返回行数 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
    return lines.length;
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var nar = (G === N), lx = G.left.x, ly = G.left.y, lw = G.left.w, lh = G.left.h;
    el("rect", { x: lx, y: ly, width: lw, height: lh, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lx + 16, ly + (nar ? 22 : 28), nar ? "五段串联 · 红叉＝损伤" : "反射弧五段串联 · 红叉＝被损伤的环节", "#5a6472", "start", nar ? 9.6 : 10.5, 700);

    var rx = lx + (nar ? 12 : 20), rw = lw - (nar ? 24 : 40);
    var rowH = nar ? 48 : 66, gap = nar ? 3 : 9, sy = ly + (nar ? 38 : 52);
    for (var i = 0; i < 5; i++) {
      var seg = i + 1, dmg = seg === A;
      var ry = sy + i * (rowH + gap), cx = rx + (nar ? 22 : 28), cy = ry + rowH / 2;
      el("rect", { x: rx, y: ry, width: rw, height: rowH, rx: 8, fill: dmg ? "#fbeae7" : "#ffffff", stroke: dmg ? "#b8402f" : "#dbe7ef", "stroke-width": dmg ? 1.8 : 1 }, gA);
      el("circle", { cx: cx, cy: cy, r: nar ? 11 : 13, fill: dmg ? "#fbeae7" : "#f2f8fd", stroke: dmg ? "#b8402f" : "#c9e0f2" }, gA);
      if (dmg) {
        var d = nar ? 5 : 6;
        el("line", { x1: cx - d, y1: cy - d, x2: cx + d, y2: cy + d, stroke: "#b8402f", "stroke-width": 2.4, "stroke-linecap": "round" }, gA);
        el("line", { x1: cx + d, y1: cy - d, x2: cx - d, y2: cy + d, stroke: "#b8402f", "stroke-width": 2.4, "stroke-linecap": "round" }, gA);
      } else {
        tx(gA, cx, cy + 4, String(seg), "#5a6472", "middle", nar ? 8.4 : 9.4, 700);
      }
      tx(gA, rx + (nar ? 42 : 54), cy - (nar ? 4 : 5), seg + " " + NAME[i], dmg ? "#b8402f" : "#151a21", "start", nar ? 9.4 : 10.4, 700);
      tx(gA, rx + (nar ? 42 : 54), cy + (nar ? 11 : 13), SUB[i], "#5a6472", "start", nar ? 7.6 : 8.4, 400);
      var rs = (seg <= 2) ? 0 : 1, re = (seg === 5) ? 0 : 1;
      tx(gA, rx + rw - 10, cy - (nar ? 4 : 5), rs ? "感觉 有" : "感觉 无", rs ? "#2f8a5b" : "#b8402f", "end", nar ? 7.8 : 8.4, 600);
      tx(gA, rx + rw - 10, cy + (nar ? 11 : 13), re ? "效应器 可" : "效应器 不可", re ? "#2f8a5b" : "#b8402f", "end", nar ? 7.8 : 8.4, 600);
      if (i < 4) el("line", { x1: cx, y1: ry + rowH, x2: cx, y2: ry + rowH + gap, stroke: "#9fb6c8", "stroke-width": 1.2 }, gA);
    }

    var px = G.right.x, py = G.right.y, pw = G.right.w, s2 = calc(A), fs = nar ? 8.6 : 9.2, n;
    el("rect", { x: px, y: py, width: pw, height: G.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    if (nar) {
      tx(gB, px + 14, py + 22, "同一刺激 · 结果对照", "#5a6472", "start", 10, 700);
      el("rect", { x: px + 10, y: py + 32, width: pw - 20, height: 140, rx: 8, fill: "#f8fbfd", stroke: "#e6e9ee" }, gB);
      tx(gB, px + 22, py + 52, "判 据", "#5a6472", "start", 8.6, 700);
      n = wrap(gB, px + 22, py + 70, "反射完成 = 感受器 ∧ 传入神经 ∧ 神经中枢 ∧ 传出神经 ∧ 效应器", pw - 44, fs, "#3a3a35", 15);
      wrap(gB, px + 22, py + 70 + n * 15, "有反应 ≠ 有反射", pw - 44, fs, "#b8402f", 15);
      el("rect", { x: px + 10, y: py + 180, width: pw - 20, height: 108, rx: 8, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
      tx(gB, px + 22, py + 200, "seg=" + A + " · " + NAME[A - 1], "#151a21", "start", 9.4, 700);
      tx(gB, px + 22, py + 220, "反射：不能完成", "#b8402f", "start", fs, 600);
      tx(gB, px + 22, py + 238, "感觉：" + (s2.sense ? "有" : "无"), s2.sense ? "#2f8a5b" : "#b8402f", "start", fs, 600);
      tx(gB, px + 22, py + 256, "效应器：" + (s2.eff ? "可被直接刺激" : "不能被刺激"), s2.eff ? "#2f8a5b" : "#b8402f", "start", fs, 600);
      el("rect", { x: px + 10, y: py + 300, width: pw - 20, height: 62, rx: 8, fill: "#fdf3e0", stroke: "#ecd5a8" }, gB);
      tx(gB, px + 22, py + 320, "关键一格：seg=3", "#8a5a12", "start", 9, 700);
      tx(gB, px + 22, py + 338, "有感觉、无反射", "#8a5a12", "start", 9, 600);
      tx(gB, px + 22, py + 354, "两条路不同，不能互推", "#8a5a12", "start", 8.4, 400);
    } else {
      tx(gB, px + 18, py + 26, "同一刺激：断在哪一段，结果差在哪", "#5a6472", "start", 10.5, 700);
      el("rect", { x: px + 16, y: py + 44, width: pw - 32, height: 88, rx: 8, fill: "#f8fbfd", stroke: "#e6e9ee" }, gB);
      tx(gB, px + 30, py + 66, "判 据", "#5a6472", "start", 9.2, 700);
      n = wrap(gB, px + 30, py + 86, "反射完成 = 感受器 ∧ 传入神经 ∧ 神经中枢 ∧ 传出神经 ∧ 效应器", pw - 60, fs, "#3a3a35", 18);
      wrap(gB, px + 30, py + 86 + n * 18, "有反应 ≠ 有反射（肌肉被直接刺激也会收缩）", pw - 60, fs, "#b8402f", 18);
      el("rect", { x: px + 16, y: py + 144, width: pw - 32, height: 176, rx: 8, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
      tx(gB, px + 30, py + 168, "当前：seg = " + A + " · " + NAME[A - 1], "#151a21", "start", 10, 700);
      tx(gB, px + 30, py + 196, "反射：不能完成", "#b8402f", "start", fs, 600);
      tx(gB, px + 30, py + 220, s2.sense ? "感觉：有 —— 传入神经与上行传导束未断" : "感觉：无 —— 传入通路断了，传不到大脑皮层", s2.sense ? "#2f8a5b" : "#b8402f", "start", fs, 600);
      tx(gB, px + 30, py + 244, s2.eff ? "效应器：仍可被直接刺激而收缩" : "效应器：损伤，直接刺激也不能收缩", s2.eff ? "#2f8a5b" : "#b8402f", "start", fs, 600);
      wrap(gB, px + 30, py + 272, "反射要求五段全通；感觉只要求「感受器→传入神经→脊髓→上行→大脑皮层」这一路通。", pw - 60, 8.8, "#5a6472", 16);
      el("rect", { x: px + 16, y: py + 332, width: pw - 32, height: 90, rx: 8, fill: "#fdf3e0", stroke: "#ecd5a8" }, gB);
      tx(gB, px + 30, py + 356, "关键一格：seg = 3（神经中枢损伤）", "#8a5a12", "start", 9.2, 700);
      wrap(gB, px + 30, py + 376, "有感觉、不能完成反射 —— 这一格把「有感觉」和「有反射」彻底分开。", pw - 60, 8.8, "#8a5a12", 16);
    }
  }

  function render() {
    if (!G) { L = geom(); G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(A);
    $("gxVaS").textContent = NAME[A - 1];
    $("gxVb").textContent = s.ok ? "能" : "不能";
    $("gxVc").textContent = s.sense ? "有" : "无";
    if (A <= 2) { st = "无感觉、无反射"; col = "#b8402f"; bg = "#fbeae7"; sn = "传入通路断了，信号到不了大脑"; }
    else if (A === 5) { st = "有感觉、无反射"; col = "#b8402f"; bg = "#fbeae7"; sn = "效应器本身也不能被直接刺激"; }
    else { st = "有感觉、无反射"; col = "#b8791f"; bg = "#fdf3e0"; sn = "效应器仍可被直接刺激"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    G = geom(); L = G;
    stage.setAttribute("viewBox", G.vb);
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 5 }, { t: 11, v: 4 }, { t: 13, v: 1 }],
    keys: [1, 3, 5],
    value: A, min: 1, max: 5, step: 1,
    idle: 5000,
    onChange: function (v) { A = Math.max(1, Math.min(5, Math.round(v))); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1, eq: { ok: 0, sense: 0 } },
    { v: 3, eq: { ok: 0, sense: 1 } },
    { v: 5, eq: { ok: 0, eff: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
