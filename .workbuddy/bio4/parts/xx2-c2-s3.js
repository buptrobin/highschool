(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  function boot() {
    var SL = $("gxSl"), STAGE = $("gxStage"), A = $("gxA"), B = $("gxB");
    if (!STAGE) { return; }
    var G = null, L = null, ap = null;

    var STG = [["裸岩阶段", 0, 10], ["地衣阶段", 10, 30], ["苔藓阶段", 30, 55],
               ["草本阶段", 55, 90], ["灌木阶段", 90, 140], ["森林阶段", 140, 200]];

    function calc(v) {
      var t = Math.max(0, Math.min(200, Number(v) || 0));
      var S = 5 + 60 * (1 - Math.exp(-t / 80));
      var r = 0.75 * Math.exp(-t / 80);
      var st = "演替早期，物种少", col = "#b8791f";
      if (t > 120) { st = "接近顶极，上升变慢"; col = "#2f8a5b"; }
      else if (t > 80) { st = "上升明显变慢"; col = "#2f8a5b"; }
      else if (t >= 20) { st = "快速上升期"; col = "#2f8a5b"; }
      return { t: t, S: Math.round(S * 10) / 10, rate: Math.round(r * 100) / 100,
               stage: st, color: col, gap: Math.round((65 - S) * 10) / 10 };
    }

    function layout() {
      var w = STAGE.clientWidth || (STAGE.parentNode ? STAGE.parentNode.clientWidth : 0);
      return w >= 640 ? "W" : "N";
    }

    function geom() {
      if (L === "W") {
        return { W: 880, H: 470, x0: 74, y0: 392, x1: 566, y1: 74,
                 rowX: 594, rowW: 262, rowH: 45, pY: 88, headY: 62, noteY: 386 };
      }
      return { W: 360, H: 700, x0: 44, y0: 356, x1: 332, y1: 60,
               rowX: 20, rowW: 320, rowH: 43, pY: 406, headY: 392, noteY: 674 };
    }

    function stageIdx(t) {
      for (var n = 0; n < STG.length; n++) { if (t >= STG[n][1] && t < STG[n][2]) { return n; } }
      return STG.length - 1;
    }

    function render(v) {
      if (!G) { L = layout(); G = geom(); }
      var d = calc(v), i, s = "", n, ry, on;
      STAGE.setAttribute("viewBox", "0 0 " + G.W + " " + G.H);
      var X = function (t) { return G.x0 + (t / 200) * (G.x1 - G.x0); };
      var Y = function (S) { return G.y0 - (S / 65) * (G.y0 - G.y1); };

      s += '<rect x="8" y="8" width="' + (G.W - 16) + '" height="' + (G.H - 16) + '" rx="12" fill="#f8fbfd" stroke="#dbe7ef"/>';
      if (L === "W") {
        s += '<text x="34" y="40" font-size="12" font-weight="700" fill="#151a21">物种丰富度 S 随演替年限 t 的变化</text>';
        s += '<text x="34" y="58" font-size="9.2" fill="#6b7a86">S = 5 + 60(1 − e^(−t/80))；模型上限 65 种</text>';
      } else {
        s += '<text x="20" y="34" font-size="11.5" font-weight="700" fill="#151a21">物种丰富度 S 随年限 t 的变化</text>';
        s += '<text x="20" y="52" font-size="9" fill="#6b7a86">S = 5 + 60(1 − e^(−t/80))</text>';
      }

      [20, 40, 60].forEach(function (S) {
        var y = Y(S);
        s += '<line x1="' + G.x0 + '" y1="' + y.toFixed(1) + '" x2="' + G.x1 + '" y2="' + y.toFixed(1) + '" stroke="#e6eef4" stroke-width="1" stroke-dasharray="3 4"/>';
        s += '<text x="' + (G.x0 - 7) + '" y="' + (y + 3).toFixed(1) + '" font-size="8.6" fill="#6b7a86" text-anchor="end">' + S + '</text>';
      });
      s += '<line x1="' + G.x0 + '" y1="' + Y(65).toFixed(1) + '" x2="' + G.x1 + '" y2="' + Y(65).toFixed(1) + '" stroke="#b8c8d4" stroke-width="1" stroke-dasharray="6 4"/>';
      s += '<text x="' + G.x1 + '" y="' + (Y(65) - 6).toFixed(1) + '" font-size="8.8" fill="#6b7a86" text-anchor="end">顶极 65 种</text>';
      s += '<line x1="' + G.x0 + '" y1="' + G.y0 + '" x2="' + G.x1 + '" y2="' + G.y0 + '" stroke="#9fb1bf" stroke-width="1.2"/>';
      s += '<line x1="' + G.x0 + '" y1="' + G.y0 + '" x2="' + G.x0 + '" y2="' + G.y1 + '" stroke="#9fb1bf" stroke-width="1.2"/>';
      s += '<text x="' + (G.x0 - 7) + '" y="' + (G.y0 + 3) + '" font-size="8.6" fill="#6b7a86" text-anchor="end">0</text>';

      [0, 50, 100, 150, 200].forEach(function (t) {
        s += '<text x="' + X(t).toFixed(1) + '" y="' + (G.y0 + 16) + '" font-size="8.6" fill="#6b7a86" text-anchor="middle">' + t + '</text>';
      });

      var pts = [];
      for (i = 0; i <= 200; i += 5) { pts.push(X(i).toFixed(1) + "," + Y(calc(i).S).toFixed(1)); }
      s += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#2f8a5b" stroke-width="2.2" stroke-linejoin="round"/>';

      var px = X(d.t), py = Y(d.S);
      s += '<line x1="' + px.toFixed(1) + '" y1="' + py.toFixed(1) + '" x2="' + px.toFixed(1) + '" y2="' + G.y0 + '" stroke="#b8791f" stroke-width="1" stroke-dasharray="4 4"/>';
      s += '<line x1="' + G.x0 + '" y1="' + py.toFixed(1) + '" x2="' + px.toFixed(1) + '" y2="' + py.toFixed(1) + '" stroke="#b8791f" stroke-width="1" stroke-dasharray="4 4" opacity="0.55"/>';
      s += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="5" fill="#ffffff" stroke="#b8791f" stroke-width="2.2"/>';
      var right = px > G.x1 - 150;
      s += '<text x="' + (px + (right ? -10 : 10)).toFixed(1) + '" y="' + (py - 12).toFixed(1) + '" font-size="9.2" fill="#b8791f" text-anchor="' + (right ? "end" : "start") + '">t = ' + d.t + '，S = ' + d.S.toFixed(1) + '</text>';

      var idx = stageIdx(d.t);
      var b = '<text x="' + G.rowX + '" y="' + G.headY + '" font-size="9.6" fill="#6b7a86">当前演替阶段（示意）</text>';
      for (n = 0; n < STG.length; n++) {
        ry = G.pY + n * G.rowH;
        on = (n === idx);
        b += '<rect x="' + G.rowX + '" y="' + ry + '" width="' + G.rowW + '" height="' + (G.rowH - 7) + '" rx="7" fill="' + (on ? "#e8f6ee" : "#ffffff") + '" stroke="' + (on ? "#2f8a5b" : "#dbe7ef") + '"' + (on ? ' stroke-width="1.6"' : '') + '/>';
        b += '<text x="' + (G.rowX + 12) + '" y="' + (ry + 21) + '" font-size="9.6" font-weight="' + (on ? "700" : "400") + '" fill="' + (on ? "#2f8a5b" : "#3a3a35") + '">' + STG[n][0] + '</text>';
        b += '<text x="' + (G.rowX + G.rowW - 12) + '" y="' + (ry + 21) + '" font-size="8.4" fill="#6b7a86" text-anchor="end">' + STG[n][1] + '–' + STG[n][2] + ' 年</text>';
      }
      b += '<text x="' + G.rowX + '" y="' + G.noteY + '" font-size="8.8" fill="#6b7a86">阶段边界为示意值，真实演替没有整齐分界。</text>';

      if (A) { A.innerHTML = s; }
      if (B) { B.innerHTML = b; }
      var va = $("gxVa"), vb = $("gxVb"), vc = $("gxVc"), vs = $("gxVs"), vn = $("gxVsn");
      if (va) { va.textContent = d.t; }
      if (vb) { vb.textContent = d.S.toFixed(1); }
      if (vc) { vc.textContent = d.rate.toFixed(2); }
      if (vs) { vs.textContent = d.stage; vs.style.color = d.color; }
      if (vn) { vn.textContent = "距顶极上限还差 " + d.gap.toFixed(1) + " 种"; }
    }

    function setMode(auto) {
      var t = $("gxApTxt"), box = $("gxAp");
      if (t) { t.textContent = auto ? "自动演示中" : "已暂停 · 可自己拖"; }
      if (box) { box.style.opacity = auto ? "1" : "0.72"; }
    }

    var LOOP = [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 2.2, v: 20 }, { t: 4.8, v: 200 },
                { t: 6.6, v: 50 }, { t: 8.6, v: 50 }, { t: 10.4, v: 200 }, { t: 11.8, v: 120 }, { t: 13.2, v: 0 }];

    function localLoop() {
      var raf = null, t0 = null, stopped = false;
      function tick(now) {
        if (stopped) { return; }
        if (t0 === null) { t0 = now; }
        var el = (now - t0) / 1000, total = LOOP[LOOP.length - 1].t, tt = el % total, i = 0;
        while (i < LOOP.length - 2 && LOOP[i + 1].t < tt) { i++; }
        var a = LOOP[i], c = LOOP[i + 1], k = c.t > a.t ? (tt - a.t) / (c.t - a.t) : 0;
        var val = Math.round((a.v + (c.v - a.v) * k) / 5) * 5;
        SL.value = val;
        render(val);
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      setMode(true);
      return {
        stop: function () { stopped = true; if (raf) { cancelAnimationFrame(raf); } setMode(false); },
        play: function () { stopped = false; t0 = null; raf = requestAnimationFrame(tick); setMode(true); }
      };
    }

    SL.addEventListener("input", function () { render(Number(SL.value)); });
    STAGE.addEventListener("click", function () {
      var keys = [0, 50, 120, 200], cur = Number(SL.value), nxt = 0, i;
      for (i = 0; i < keys.length; i++) { if (keys[i] > cur) { nxt = keys[i]; break; } }
      SL.value = nxt;
      render(nxt);
    });

    try {
      if (window.AutoPilot && typeof window.AutoPilot.create === "function") {
        ap = window.AutoPilot.create({
          mount: STAGE, follow: SL, loop: LOOP, keys: [0, 50, 120, 200],
          value: 0, min: 0, max: 200, step: 5, idle: 5000,
          onChange: function (v) { SL.value = v; render(v); },
          onMode: setMode
        });
      }
    } catch (e) { ap = null; }
    if (!ap) { ap = localLoop(); }
    window.__ap = ap;

    var MODEL = {
      calc: calc,
      render: render,
      cases: [{ v: 50, eq: { S: 32.9 } }, { v: 100, eq: { S: 47.8 } }, { v: 200, eq: { S: 60.1 } }]
    };
    window.__model = MODEL;
    window.__bio = MODEL;

    render(Number(SL.value));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
