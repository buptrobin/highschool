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

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var k = Math.max(0, Math.min(100, Math.round(v)));
    return { control: k, vol: k >= 60 ? 1 : 0 };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
    return lines.length;
  }

  function geom() {
    var nw = (L === N), lf = L.left, rt = L.right, g = { nw: nw };
    g.cx = lf.x + lf.w / 2;
    g.cortex = { x: lf.x + 20, y: lf.y + (nw ? 40 : 54), w: lf.w - 40, h: nw ? 60 : 72 };
    g.spine = { x: lf.x + 34, y: nw ? lf.y + 196 : lf.y + 232, w: lf.w - 68, h: nw ? 56 : 66 };
    g.bl = { x: g.cx - 84, y: 352, w: 168, h: 52 };
    g.bar = { x: rt.x + 24, y: rt.y + (nw ? 62 : 84), w: rt.w - 48, h: 26 };
    g.thr = g.bar.x + g.bar.w * 0.6;
    g.lampY = rt.y + (nw ? 268 : 276);
    g.lampW = (rt.w - 48) / 2;
    return g;
  }

  function line(p, x1, y1, x2, y2, col, w, dash) {
    var o = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": w, "stroke-linecap": "round" };
    if (dash) o["stroke-dasharray"] = dash;
    el("line", o, p);
  }
  function poly(p, pts, col) { el("polygon", { points: pts, fill: col }, p); }
  function T(p, x, y, s, col, a, fs, w) { tx(p, x, y, s, col || "#3a3a35", a || "start", fs || 9.4, w || 400); }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), g = G, k = s.control, nw = g.nw;
    gA.textContent = ""; gB.textContent = "";
    var col = s.vol ? "#2f8a5b" : "#b8402f";

    /* ---- 左：分级层次（上：大脑皮层 / 下：脊髓 / 中间：抑制调控箭头） ---- */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    T(gA, L.left.x + 18, L.left.y + 28, "分级层次：皮层在上，脊髓在下", "#5a6472", "start", 10.5, 700);

    el("rect", { x: g.cortex.x, y: g.cortex.y, width: g.cortex.w, height: g.cortex.h, rx: 9, fill: "#eef7f2", stroke: "#b8e6d0" }, gA);
    T(gA, g.cortex.x + 14, g.cortex.y + 22, "大脑皮层 · 最高级中枢", "#1f5c41", "start", 10.2, 700);
    T(gA, g.cortex.x + 14, g.cortex.y + 40, "排尿反射高级中枢", "#3a3a35", "start", 9.2, 400);
    T(gA, g.cortex.x + 14, g.cortex.y + 56, "抑制强度 k = " + k + "%", col, "start", 9.2, 700);

    el("rect", { x: g.spine.x, y: g.spine.y, width: g.spine.w, height: g.spine.h, rx: 9, fill: "#ffffff", stroke: "#cfd8e3" }, gA);
    T(gA, g.spine.x + 14, g.spine.y + 22, "脊髓 · 低级中枢", "#2a3b4d", "start", 10.2, 700);
    T(gA, g.spine.x + 14, g.spine.y + 40, "排尿反射低级中枢，反射弧完整", "#3a3a35", "start", 9.2, 400);
    T(gA, g.spine.x + 14, g.spine.y + 56, s.vol ? "被高级中枢压住" : "自行其是", col, "start", 9.2, 700);

    var y1 = g.cortex.y + g.cortex.h, y2 = g.spine.y, aw = 1.6 + k * 0.072;
    line(gA, g.cx, y1 + 2, g.cx, y2 - 12, col, aw);
    poly(gA, g.cx + "," + (y2 - 2) + " " + (g.cx - 7) + "," + (y2 - 14) + " " + (g.cx + 7) + "," + (y2 - 14), col);
    T(gA, g.cx + 12, (y1 + y2) / 2 + 4, "抑制 / 调控", col, "start", 9.6, 700);
    T(gA, g.cx + 12, (y1 + y2) / 2 + 20, "下行通路", "#5a6472", "start", 8.8, 400);

    if (!nw) {
      line(gA, g.cx - 60, g.spine.y + g.spine.h, g.cx - 60, g.bl.y - 2, "#2a3b4d", 2.4);
      poly(gA, (g.cx - 60) + "," + g.bl.y + " " + (g.cx - 66) + "," + (g.bl.y - 10) + " " + (g.cx - 54) + "," + (g.bl.y - 10), "#2a3b4d");
      T(gA, g.cx - 52, g.spine.y + g.spine.h + 20, "传入 / 传出神经", "#5a6472", "start", 8.8, 400);
      el("rect", { x: g.bl.x, y: g.bl.y, width: g.bl.w, height: g.bl.h, rx: 9, fill: "#ffffff", stroke: "#cfd8e3" }, gA);
      T(gA, g.bl.x + 14, g.bl.y + 22, "膀胱（效应器）", "#2a3b4d", "start", 9.8, 700);
      T(gA, g.bl.x + 14, g.bl.y + 40, "充盈则反射", "#5a6472", "start", 8.8, 400);
    }

    /* ---- 右：控制力条 + 阈值 ---- */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    T(gB, L.right.x + 20, L.right.y + 32, "控制力 control 与 60% 阈值", "#5a6472", "start", 10.5, 700);
    el("rect", { x: g.bar.x, y: g.bar.y, width: g.bar.w, height: g.bar.h, rx: 6, fill: "#eef1f5", stroke: "#dde4ea" }, gB);
    el("rect", { x: g.bar.x, y: g.bar.y, width: Math.max(3, g.bar.w * k / 100), height: g.bar.h, rx: 6, fill: col, opacity: 0.85 }, gB);
    line(gB, g.thr, g.bar.y - 10, g.thr, g.bar.y + g.bar.h + 10, "#b8402f", 1.6, "5 4");
    T(gB, g.bar.x, g.bar.y + g.bar.h + 20, "0%", "#5a6472", "start", 8.6, 400);
    T(gB, g.bar.x + g.bar.w, g.bar.y + g.bar.h + 20, "100%", "#5a6472", "end", 8.6, 400);
    T(gB, g.thr, g.bar.y + g.bar.h + 20, "60% 阈值", "#b8402f", "middle", 8.6, 700);

    T(gB, g.bar.x, g.bar.y - 14, "control = k = " + k + "%", "#2a3b4d", "start", 9.4, 700);

    var ty = g.bar.y + g.bar.h + 48, mw = L.right.w - 40;
    if (s.vol) {
      wrap(gB, g.bar.x, ty, "抑制强度已过阈值：大脑皮层的下行抑制压得住脊髓排尿中枢。", mw, 9.4, "#3a3a35", 16);
      wrap(gB, g.bar.x, ty + 40, "可以憋到合适时机再排尿 —— 反应按环境来。", mw, 9.4, "#2f8a5b", 16);
    } else {
      wrap(gB, g.bar.x, ty, "抑制不足：脊髓排尿中枢没被压住，膀胱充盈就完成排尿反射。", mw, 9.4, "#3a3a35", 16);
      wrap(gB, g.bar.x, ty + 40, "控制力不够就会「憋不住」—— 婴儿就是这样。", mw, 9.4, "#b8402f", 16);
    }

    var on = s.vol;
    el("rect", { x: g.bar.x, y: g.lampY, width: g.lampW, height: 46, rx: 8, fill: on ? "#e6f6ee" : "#ffffff", stroke: on ? "#2f8a5b" : "#dde4ea" }, gB);
    T(gB, g.bar.x + g.lampW / 2, g.lampY + 28, "能自主控制", on ? "#2f8a5b" : "#9aa4b0", "middle", 9.6, 700);
    el("rect", { x: g.bar.x + g.lampW + 10, y: g.lampY, width: g.lampW, height: 46, rx: 8, fill: on ? "#ffffff" : "#fbeae7", stroke: on ? "#dde4ea" : "#b8402f" }, gB);
    T(gB, g.bar.x + g.lampW + 10 + g.lampW / 2, g.lampY + 28, "憋不住", on ? "#9aa4b0" : "#b8402f", "middle", 9.6, 700);
  }

  function render() {
    if (!G) { L = (stage.parentElement && stage.parentElement.getBoundingClientRect().width >= 640) ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.control.toFixed(1);
    $("gxVc").textContent = (s.control - 60).toFixed(1);
    if (s.vol) { st = "能自主控制"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "k ≥ 60：皮层抑制得住"; }
    else { st = "憋不住"; col = "#b8402f"; bg = "#fbeae7"; sn = "k < 60：低级中枢自行其是"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 60 }, { t: 6.5, v: 60 }, { t: 9, v: 100 }, { t: 11, v: 80 }, { t: 13, v: 0 }],
    keys: [0, 60, 80, 100],
    value: A, min: 0, max: 100, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = window.__model = { calc: calc, cases: [
    { v: 0, eq: { control: 0, vol: 0 } },
    { v: 60, eq: { control: 60, vol: 1 } },
    { v: 100, eq: { control: 100, vol: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
