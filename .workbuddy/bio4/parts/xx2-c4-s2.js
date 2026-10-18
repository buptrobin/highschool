(function () {
  "use strict";
  if (window.__bioReady) return;
  window.__bioReady = true;

  var S0 = 100, Z = 0.25;
  var $ = function (id) { return document.getElementById(id); };
  var G = null, L = null, stage = null, ap = null;

  function calc(loss) {
    var a = (100 - loss) / 100;
    return { loss: loss, S: S0 * Math.pow(a, Z) };
  }

  function stateOf(loss) {
    if (loss < 30) return { t: "下降不多", c: "#2f8a5b", sub: "loss < 30%" };
    if (loss <= 70) return { t: "明显下降", c: "#b8791f", sub: "30% – 70%" };
    if (loss <= 85) return { t: "持续下降", c: "#b8791f", sub: "70% – 85%" };
    return { t: "损失过半", c: "#b8402f", sub: "loss > 85%" };
  }

  function layout() {
    var w = stage && stage.parentNode ? stage.parentNode.clientWidth : window.innerWidth;
    return w >= 640 ? "W" : "N";
  }

  function geom() {
    if (L === "W") {
      stage.setAttribute("viewBox", "0 0 880 470");
      return {
        w: 880, h: 470,
        px: 70, py: 100, pw: 360, ph: 290,
        gx: 470, gy: 120, cell: 34, n: 8,
        t: 42, note: 430
      };
    }
    stage.setAttribute("viewBox", "0 0 360 700");
    return {
      w: 360, h: 700,
      px: 44, py: 64, pw: 280, ph: 230,
      gx: 64, gy: 376, cell: 28, n: 8,
      t: 26, note: 330
    };
  }

  function xOf(loss) { return G.px + (loss / 90) * G.pw; }
  function yOf(S) { return G.py + G.ph - ((S - 40) / 60) * G.ph; }

  function plotSVG(c) {
    var s = "";
    s += '<text x="' + G.px + '" y="' + G.t + '" font-size="11.5" font-weight="700" fill="#151a21">栖息地损失 → 剩余物种数</text>';
    // 网格与坐标轴
    s += '<line x1="' + G.px + '" y1="' + (G.py + G.ph) + '" x2="' + (G.px + G.pw) + '" y2="' + (G.py + G.ph) + '" stroke="#9aa7b1"/>';
    s += '<line x1="' + G.px + '" y1="' + (G.py + G.ph) + '" x2="' + G.px + '" y2="' + G.py + '" stroke="#9aa7b1"/>';
    var ticks = [0, 30, 60, 90], i;
    for (i = 0; i < ticks.length; i++) {
      var x = xOf(ticks[i]);
      s += '<text x="' + x + '" y="' + (G.py + G.ph + 18) + '" font-size="10" fill="#6b6b60" text-anchor="middle">' + ticks[i] + '</text>';
    }
    var ys = [40, 55, 70, 85, 100];
    for (i = 0; i < ys.length; i++) {
      var y = yOf(ys[i]);
      s += '<line x1="' + G.px + '" y1="' + y + '" x2="' + (G.px + G.pw) + '" y2="' + y + '" stroke="#e6edf2"/>';
      s += '<text x="' + (G.px - 8) + '" y="' + (y + 3.5) + '" font-size="10" fill="#6b6b60" text-anchor="end">' + ys[i] + '</text>';
    }
    // 曲线 S = 100 * ((100-loss)/100)^0.25
    var pts = [], l;
    for (l = 0; l <= 90; l += 3) pts.push(xOf(l).toFixed(1) + "," + yOf(calc(l).S).toFixed(1));
    s += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#2f8a5b" stroke-width="2.4"/>';
    // 端点标注
    s += '<circle cx="' + xOf(50) + '" cy="' + yOf(calc(50).S) + '" r="3.2" fill="#b8791f"/>';
    s += '<text x="' + (xOf(50) + 8) + '" y="' + (yOf(calc(50).S) - 8) + '" font-size="10.5" fill="#8a5a10">50% → 84.1</text>';
    s += '<circle cx="' + xOf(90) + '" cy="' + yOf(calc(90).S) + '" r="3.2" fill="#b8402f"/>';
    s += '<text x="' + (xOf(90) - 6) + '" y="' + (yOf(calc(90).S) + 22) + '" font-size="10.5" fill="#b8402f" text-anchor="end">90% → 56.2</text>';
    // 当前点
    s += '<line x1="' + xOf(c.loss) + '" y1="' + yOf(c.S) + '" x2="' + xOf(c.loss) + '" y2="' + (G.py + G.ph) + '" stroke="#b8402f" stroke-dasharray="3 3" opacity="0.6"/>';
    s += '<circle cx="' + xOf(c.loss) + '" cy="' + yOf(c.S) + '" r="5.5" fill="#ffffff" stroke="#b8402f" stroke-width="2.4"/>';
    s += '<text x="' + (G.px + G.pw / 2) + '" y="' + (G.py + G.ph + 40) + '" font-size="10" fill="#22495e" text-anchor="middle">曲线越往右越平：物种数不等比例减少</text>';
    return s;
  }

  function gridSVG(c) {
    var s = "", i, j, k = 0;
    var lost = Math.round(G.n * G.n * c.loss / 100);
    s += '<text x="' + G.gx + '" y="' + (G.gy - 14) + '" font-size="11.5" font-weight="700" fill="#151a21">栖息地 ' + (100 - c.loss) + '% 尚存</text>';
    for (j = 0; j < G.n; j++) {
      for (i = 0; i < G.n; i++) {
        var x = G.gx + i * G.cell, y = G.gy + j * G.cell;
        var isLost = k >= G.n * G.n - lost;
        s += '<rect x="' + x + '" y="' + y + '" width="' + (G.cell - 2) + '" height="' + (G.cell - 2) + '" rx="2" fill="' + (isLost ? "#e9cdbd" : "#b8e6d0") + '" stroke="#ffffff"/>';
        k++;
      }
    }
    var gy2 = G.gy + G.n * G.cell;
    s += '<text x="' + G.gx + '" y="' + (gy2 + 22) + '" font-size="10" fill="#8a6a58">浅红格 = 已损失的栖息地（示意）</text>';
    s += '<text x="' + G.gx + '" y="' + (gy2 + 44) + '" font-size="13" font-weight="700" fill="#b8402f">剩余物种数 S = ' + c.S.toFixed(1) + ' 种</text>';
    s += '<text x="' + G.gx + '" y="' + (gy2 + 64) + '" font-size="10" fill="#6b6b60">S₀ = 100 种，z = 0.25（示意值）</text>';
    return s;
  }

  function render() {
    if (!G) { L = layout(); G = geom(); }
    var v = parseFloat($("gxSl").value) || 0;
    var c = calc(v);
    var st = stateOf(v);
    $("gxA").innerHTML = plotSVG(c);
    $("gxB").innerHTML = gridSVG(c);
    $("gxVa").textContent = v + "%";
    $("gxVb").textContent = c.S.toFixed(1);
    $("gxVc").textContent = (100 - c.S).toFixed(1);
    $("gxVs").textContent = st.t;
    $("gxVs").style.color = st.c;
    $("gxVsn").textContent = st.sub;
    $("gxStBox").style.borderColor = st.c;
  }

  function setMode(m) {
    var badge = $("gxAp"), txt = $("gxApTxt");
    if (badge) {
      badge.classList.toggle("is-auto", m === "auto");
      badge.classList.toggle("is-manual", m !== "auto");
    }
    if (txt) txt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  function init() {
    stage = $("gxStage");
    if (!stage) return;
    render();

    var sl = $("gxSl");
    sl.addEventListener("input", function () { render(); });

    window.addEventListener("resize", function () { G = null; render(); });

    if (window.AutoPilot && window.AutoPilot.create) {
      ap = window.AutoPilot.create({
        mount: stage,
        follow: sl,
        loop: [
          { t: 0, v: 0 }, { t: 1.2, v: 0 },
          { t: 3.6, v: 50 }, { t: 5.4, v: 50 },
          { t: 8, v: 90 }, { t: 10.5, v: 90 },
          { t: 12, v: 75 }, { t: 13.5, v: 0 }
        ],
        keys: [0, 50, 75, 90],
        value: 0, min: 0, max: 90, step: 1,
        idle: 5000,
        onChange: function (v) { render(); },
        onMode: setMode
      });
      window.__ap = ap;
    }

    // 例题分步
    var steps = $("gxSteps") ? $("gxSteps").querySelectorAll(".step") : [];
    var idx = 0;
    $("gxNext").addEventListener("click", function () {
      if (idx < steps.length - 1) {
        steps[idx + 1].hidden = false;
        idx++;
        $("gxCnt").textContent = (idx + 1) + " / " + steps.length;
        if (idx === steps.length - 1) {
          $("gxAns").hidden = false;
          this.textContent = "看完了";
          this.disabled = true;
        }
      }
    });
  }

  window.__bio = {
    calc: calc,
    cases: [
      { v: 0, eq: { S: 100 } },
      { v: 50, eq: { S: 84.1 } },
      { v: 90, eq: { S: 56.2 } }
    ]
  };
  window.__model = window.__bio;
  window.__bioInit = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
