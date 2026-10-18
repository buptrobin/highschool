(function () {
  "use strict";
  function boot() {
    var stage = document.getElementById("gxStage");
    var gA = document.getElementById("gxA");
    var gB = document.getElementById("gxB");
    var sl = document.getElementById("gxSl");
    var boxA = document.getElementById("gxVa");
    var boxB = document.getElementById("gxVb");
    var boxC = document.getElementById("gxVc");
    var boxS = document.getElementById("gxVs");
    var boxSn = document.getElementById("gxVsn");
    var badge = document.getElementById("gxAp");
    var apTxt = document.getElementById("gxApTxt");
    if (!stage || !gA || !gB) return;
    var SVGNS = "http://www.w3.org/2000/svg";
    var G = null;
    var L = 880;
    var A = 50;

    function calc(v) {
      var rr = Math.max(0, Math.min(90, +v));
      var net = 1000 * (1 - rr / 100);
      var toNxt = net * 0.1;
      var level = rr < 40 ? 0 : (rr <= 70 ? 1 : 2);
      var st = level === 0 ? "剩余多" : (level === 1 ? "典型情况" : "传递很少");
      var sn = level === 0 ? "呼吸消耗少，净生产多，能传给下一级的也多"
             : (level === 1 ? "约一半被呼吸消耗，剩一半用于生长繁殖"
             : "大部分被呼吸消耗，向上传递很少");
      return { rr: rr, net: net, toNxt: toNxt, level: level, st: st, sn: sn };
    }

    function fmt(x) {
      var n = Math.round(x * 10) / 10;
      return (n % 1 === 0) ? String(n) : n.toFixed(1);
    }

    function geom() {
      if (L >= 640) {
        return {
          W: 880, H: 470, x: 40, bw: 700,
          t: { x: 40, y: 44 }, s: { x: 40, y: 62 },
          l1: { x: 40, y: 86 }, b1: { y: 96, h: 46 },
          l2: { x: 40, y: 182 }, b2: { y: 192, h: 34 },
          l3: { x: 40, y: 278 }, b3: { y: 288, h: 34 },
          ax: { y: 352 }, nt: { x: 40, y: 404 }, f1: 10.5, f2: 9.6
        };
      }
      return {
        W: 360, H: 700, x: 20, bw: 320,
        t: { x: 20, y: 34 }, s: { x: 20, y: 52 },
        l1: { x: 20, y: 78 }, b1: { y: 88, h: 44 },
        l2: { x: 20, y: 196 }, b2: { y: 206, h: 34 },
        l3: { x: 20, y: 300 }, b3: { y: 310, h: 34 },
        ax: { y: 384 }, nt: { x: 20, y: 440 }, f1: 11, f2: 9.8
      };
    }

    function el(tag, attrs, text, gp) {
      var n = document.createElementNS(SVGNS, tag);
      for (var k in attrs) { if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]); }
      if (text != null) n.textContent = text;
      (gp || gA).appendChild(n);
      return n;
    }

    function render() { if (!G) { L = (stage.parentElement && stage.parentElement.getBoundingClientRect().width >= 640) ? 880 : 360; G = geom(); }
      var d = calc(A);
      var g = G, x = g.x, w = g.bw;
      gA.textContent = ""; gB.textContent = "";
      stage.setAttribute("viewBox", "0 0 " + g.W + " " + g.H);
      var rrW = w * d.rr / 100, netW = w * d.net / 1000, toW = w * d.toNxt / 1000;

      el("text", { x: g.t.x, y: g.t.y, "font-size": 13, "font-weight": 700, fill: "#151a21" }, "同化量固定 1000 kJ：呼吸拿走多少？");
      el("text", { x: g.s.x, y: g.s.y, "font-size": g.f2, fill: "#5a6a75" }, "三条柱同用 0–1000 kJ 量程，直接比长短");

      el("text", { x: g.l1.x, y: g.l1.y, "font-size": g.f1, "font-weight": 700, fill: "#b8402f" }, "① 呼吸散失 " + fmt(1000 * d.rr / 100) + " kJ（rr=" + fmt(d.rr) + "%）");
      el("text", { x: g.l1.x + w, y: g.l1.y, "font-size": g.f1, "font-weight": 700, fill: "#2f8a5b", "text-anchor": "end" }, "净生产 " + fmt(d.net) + " kJ");
      el("rect", { x: x, y: g.b1.y, width: w, height: g.b1.h, rx: 6, fill: "#ffffff", stroke: "#dbe7ef" });
      if (rrW > 0.5) el("rect", { x: x, y: g.b1.y, width: Math.max(rrW, 1.5), height: g.b1.h, rx: 4, fill: "#f4dcd4", stroke: "#dda895" });
      if (netW > 0.5) el("rect", { x: x + rrW, y: g.b1.y, width: Math.max(netW, 1.5), height: g.b1.h, rx: 4, fill: "#dff0e7", stroke: "#8fbfa5" });
      if (rrW > 100) el("text", { x: x + rrW / 2, y: g.b1.y + g.b1.h / 2 + 4, "text-anchor": "middle", "font-size": g.f2, "font-weight": 700, fill: "#b8402f" }, "呼吸 " + fmt(d.rr) + "%");
      if (netW > 150) el("text", { x: x + rrW + netW / 2, y: g.b1.y + g.b1.h / 2 + 4, "text-anchor": "middle", "font-size": g.f2, "font-weight": 700, fill: "#2f8a5b" }, "净生产 " + fmt(d.net));

      el("text", { x: g.l2.x, y: g.l2.y, "font-size": g.f1, "font-weight": 700, fill: "#151a21" }, "② 生长、发育和繁殖 = 1000 − 呼吸 = " + fmt(d.net) + " kJ");
      el("rect", { x: x, y: g.b2.y, width: w, height: g.b2.h, rx: 5, fill: "#ffffff", stroke: "#dbe7ef" });
      el("rect", { x: x, y: g.b2.y, width: Math.max(netW, 1.5), height: g.b2.h, rx: 5, fill: "#cfe9db", stroke: "#8fbfa5" });

      el("text", { x: g.l3.x, y: g.l3.y, "font-size": g.f1, "font-weight": 700, fill: "#b8791f" }, "③ 传给下一级 = 净生产 × 10% = " + fmt(d.toNxt) + " kJ");
      el("rect", { x: x, y: g.b3.y, width: w, height: g.b3.h, rx: 5, fill: "#ffffff", stroke: "#dbe7ef" });
      el("rect", { x: x, y: g.b3.y, width: Math.max(toW, 1.5), height: g.b3.h, rx: 5, fill: "#f6e6c8", stroke: "#d9b264" });
      el("text", { x: x + Math.max(toW, 2) + 8, y: g.b3.y + g.b3.h / 2 + 4, "font-size": g.f2, "font-weight": 700, fill: "#b8791f" }, fmt(d.toNxt) + " kJ → 下一级");

      for (var i = 0; i <= 4; i++) {
        var tx = x + w * i / 4;
        el("line", { x1: tx, y1: g.ax.y, x2: tx, y2: g.ax.y + 6, stroke: "#b9c7d1" }, gB);
        el("text", { x: tx, y: g.ax.y + 20, "text-anchor": "middle", "font-size": 9.5, fill: "#7a8a96" }, String(250 * i), gB);
      }
      el("line", { x1: x, y1: g.ax.y, x2: x + w, y2: g.ax.y, stroke: "#dbe7ef" }, gB);
      el("text", { x: g.nt.x, y: g.nt.y, "font-size": g.f2, "font-weight": 700, fill: "#151a21" }, "净生产 = 1000 × (1 − rr/100)", gB);
      el("text", { x: g.nt.x, y: g.nt.y + 20, "font-size": g.f2, fill: "#5a6a75" }, "传给下一级 = 净生产 × 10%，柱子再短一截", gB);
      el("text", { x: g.nt.x, y: g.nt.y + 40, "font-size": g.f2, fill: "#5a6a75" }, "同化量不变，变的是「留多少、传多少」", gB);

      if (boxA) boxA.textContent = fmt(d.rr) + " %";
      if (boxB) boxB.textContent = fmt(d.net);
      if (boxC) boxC.textContent = fmt(d.toNxt);
      if (boxS) { boxS.textContent = d.st; boxS.style.color = d.level === 0 ? "#2f8a5b" : (d.level === 1 ? "#b8791f" : "#b8402f"); }
      if (boxSn) boxSn.textContent = d.sn;
      if (boxS && boxS.parentElement) {
        var col = d.level === 0 ? "#2f8a5b" : (d.level === 1 ? "#b8791f" : "#b8402f");
        boxS.parentElement.style.borderColor = col + "55";
        boxS.parentElement.style.background = d.level === 0 ? "#e6f6ee" : (d.level === 1 ? "#fdf3e0" : "#fbeae7");
      }
    }

    function setMode(m) {
      if (badge) {
        badge.classList.toggle("is-auto", m === "auto");
        badge.classList.toggle("is-manual", m !== "auto");
      }
      if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
    }

    function onSlider() { A = Number(sl.value); render(); }
    if (sl) { sl.addEventListener("input", onSlider); sl.addEventListener("change", onSlider); }

    var tmr = null;
    window.addEventListener("resize", function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () { G = null; render(); }, 150);
    });

    var ap = null;
    try {
      if (window.AutoPilot && typeof window.AutoPilot.create === "function") {
        ap = window.AutoPilot.create({
          mount: stage, follow: sl,
          loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 90 }, { t: 11, v: 70 }, { t: 13, v: 0 }],
          keys: [0, 50, 70, 90], value: A, min: 0, max: 90, step: 5, idle: 5000,
          onChange: function (v) { A = v; render(); },
          onMode: setMode
        });
      }
    } catch (e) { ap = null; }

    if (ap) {
      window.__ap = ap;
    } else {
      var KC = [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 90 }, { t: 11, v: 70 }, { t: 13, v: 0 }];
      var mode = "auto", idle = 0, t0 = Date.now(), last = t0;
      var api = {
        take: function () { mode = "manual"; idle = 0; setMode("manual"); },
        release: function () { mode = "auto"; setMode("auto"); },
        setValue: function (v) { A = +v; if (sl) sl.value = String(A); render(); }
      };
      var kc = 0;
      stage.addEventListener("click", function () {
        api.take(); kc = (kc + 1) % 4;
        api.setValue([0, 50, 70, 90][kc]);
      });
      (function loop() {
        var now = Date.now(), dt = (now - last) / 1000;
        last = now;
        if (mode === "manual") { idle += dt * 1000; if (idle >= 5000) api.release(); }
        else {
          var t = ((now - t0) / 1000) % 13, v = 0, i;
          for (i = 0; i < KC.length - 1; i++) {
            if (t >= KC[i].t && t <= KC[i + 1].t) {
              var span = KC[i + 1].t - KC[i].t;
              v = span <= 0 ? KC[i + 1].v : KC[i].v + (KC[i + 1].v - KC[i].v) * (t - KC[i].t) / span;
              break;
            }
          }
          A = Math.round(v / 5) * 5;
          if (sl && document.activeElement !== sl) sl.value = String(A);
          render();
        }
        setTimeout(loop, 80);
      })();
      window.__ap = {
        take: api.take, release: api.release, setValue: api.setValue,
        get mode() { return mode; }, get value() { return A; }, get decimals() { return 0; }
      };
    }

    var steps = [].slice.call(document.querySelectorAll("#gxSteps .step"));
    var cnt = document.getElementById("gxCnt");
    var btn = document.getElementById("gxNext");
    var ans = document.getElementById("gxAns");
    var idx = 0;
    if (btn && steps.length) {
      btn.addEventListener("click", function () {
        if (idx < steps.length - 1) {
          idx++;
          steps[idx].removeAttribute("hidden");
          if (cnt) cnt.textContent = (idx + 1) + " / " + steps.length;
          if (idx === steps.length - 1) {
            if (ans) ans.removeAttribute("hidden");
            btn.textContent = "已全部展开";
          }
        }
      });
      if (cnt) cnt.textContent = "1 / " + steps.length;
    }

    window.__bio = {
      calc: calc,
      cases: [
        { v: 50, eq: { net: 500, toNxt: 50 } },
        { v: 80, eq: { net: 200, toNxt: 20 } },
        { v: 0, eq: { net: 1000, toNxt: 100 } }
      ]
    };

    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
