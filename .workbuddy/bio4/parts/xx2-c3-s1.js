/* 互动脚本本体：营养级数 n → 第 n 营养级可得能量（10% 传递效率） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var sl = $("gxSl");
  var W = { vb: "0 0 880 470", wide: true, x0: 150, base: 352, step: 50, bh: 36, maxw: 500, minw: 44, labelX: 138, noteY: 392 };
  var N = { vb: "0 0 360 700", wide: false, x0: 40, base: 566, step: 92, bh: 50, maxw: 190, minw: 26, labelX: 40, noteY: 596 };
  var L = W, G = null, A = 2;

  /* 纯函数：参数 → 数值。render() 和 __model.cases 都用它 */
  function calc(n) {
    n = Math.min(5, Math.max(2, Math.round(n)));
    var gain = Math.pow(0.1, n - 1) * 100;
    return {
      n: n,
      gain: gain,
      loss: 100 - gain,
      level: n === 2 ? "一级消费者" : (n === 3 ? "二级消费者" : "能量已不足千分之一"),
      tone: n >= 4 ? "#b8402f" : (n === 3 ? "#b8791f" : "#2f8a5b"),
      bg: n >= 4 ? "#fbeae7" : (n === 3 ? "#fdf3e0" : "#e6f6ee"),
      hint: n >= 4 ? "第 4、5 级养不活种群" : (n === 3 ? "只剩 1%，已到临界" : "能量尚可维持")
    };
  }

  function pct(p) { return String(Math.round(p * 1000) / 1000) + "%"; }
  function fmtp(p) { return p >= 1 ? p.toFixed(1) + "%" : (p >= 0.01 ? p.toFixed(2) + "%" : p.toFixed(3) + "%"); }
  function fmtl(v) { return (v < 99.9 ? v.toFixed(1) : (v < 99.99 ? v.toFixed(2) : v.toFixed(3))) + "%"; }

  /* 宽窄两套坐标下的条形宽度换算（对数压缩，n=5 也看得见） */
  function geom() {
    return { w: function (k) { return L.minw + (L.maxw - L.minw) * Math.pow(k, 0.3); } };
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB"), i, k, gain, w, y, fill, strk, col;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: 8, y: 8, width: L.wide ? 864 : 344, height: L.wide ? 454 : 684, rx: 12, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, 30, 44, "能量沿食物链逐级递减", "#151a21", "start", L.wide ? 12 : 10.5, 700);
    tx(gA, 30, 66, "第 n 级可得 = 100 × 0.1^(n−1) %", "#6b7280", "start", L.wide ? 9.4 : 8.8, 400);
    for (i = 1; i <= s.n; i++) {
      k = Math.pow(0.1, i - 1); gain = k * 100; w = G.w(k);
      y = L.base - (i - 1) * L.step - L.bh;
      fill = gain >= 10 ? "#e6f6ee" : (gain >= 1 ? "#fdf3e0" : "#fbeae7");
      strk = gain >= 10 ? "#b8e6d0" : (gain >= 1 ? "#f0d9b8" : "#e6c9c9");
      col = gain >= 10 ? "#2f8a5b" : (gain >= 1 ? "#b8791f" : "#b8402f");
      el("rect", { x: L.x0, y: y, width: w, height: L.bh, rx: 6, fill: fill, stroke: strk }, gA);
      if (L.wide) {
        tx(gA, L.labelX, y + L.bh / 2 + 4, "第 " + i + " 营养级", "#3a3a35", "end", 9.6, 400);
        tx(gA, L.x0 + w + 10, y + L.bh / 2 + 4, pct(gain), col, "start", 10.5, 700);
      } else {
        tx(gA, L.x0, y - 7, "第 " + i + " 营养级", "#3a3a35", "start", 9, 400);
        tx(gA, L.x0 + w + 8, y + L.bh / 2 + 4, pct(gain), col, "start", 9.6, 700);
      }
    }
    var nx = L.wide ? 24 : 16, ny = L.noteY, nw = L.wide ? 832 : 328, nh = L.wide ? 54 : 78;
    el("rect", { x: nx, y: ny, width: nw, height: nh, rx: 8, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, nx + 14, ny + 19, "n = " + s.n + "：第 " + s.n + " 营养级只拿到生产者的 " + pct(s.gain), "#151a21", "start", L.wide ? 9.6 : 8.6, 700);
    tx(gB, nx + 14, ny + 37, s.hint, s.tone, "start", L.wide ? 9.4 : 8.4, 400);
    tx(gB, nx + 14, ny + 53, "传递效率取 10%（课本给 10%–20%），只算流到这一级的比例", "#6b7280", "start", 8.4, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(+sl.value);
    A = s.n;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = fmtp(s.gain);
    $("gxVc").textContent = fmtl(s.loss);
    $("gxVs").textContent = s.level;
    $("gxVsn").textContent = s.hint;
    $("gxVs").style.color = s.tone;
    $("gxStBox").style.background = s.bg;
    $("gxStBox").style.borderColor = s.tone + "44";
    draw(s);
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
    follow: sl,
    loop: [{ t: 0, v: 2 }, { t: 1.9, v: 2 }, { t: 2.8, v: 3 }, { t: 5.6, v: 3 }, { t: 7.2, v: 5 }, { t: 8.6, v: 5 }, { t: 10, v: 4 }, { t: 11.2, v: 2 }, { t: 13, v: 2 }],
    keys: [2, 3, 4, 5],
    value: A, min: 2, max: 5, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; sl.value = String(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;

  var model = {
    calc: calc,
    cases: [
      { v: 2, eq: { gain: 10 } },
      { v: 3, eq: { gain: 1 } },
      { v: 4, eq: { gain: 0.1 } },
      { v: 5, eq: { gain: 0.01 } }
    ]
  };
  window.__bio = model;
  window.__model = model;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
