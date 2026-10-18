(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let G = null, L = null, stage = null;

  /* 唯一真值：再利用率 r → 外部投入 / 排放 */
  function calc(r) {
    r = Math.max(0, Math.min(90, Number(r) || 0));
    return { r, input: 100 - r, output: 100 - r };
  }

  const ST = [
    { t: "线性经济", c: "#b8402f", s: "r < 30：高投入高排放" },
    { t: "部分循环", c: "#b8791f", s: "30–70：部分回用" },
    { t: "接近循环经济", c: "#2f8a5b", s: "r > 70：投入排放都低" }
  ];
  const stateOf = (r) => ST[r < 30 ? 0 : r <= 70 ? 1 : 2];
  const layout = () => ((stage.parentNode ? stage.parentNode.clientWidth : innerWidth) >= 640 ? "W" : "N");

  function geom() {
    const W = L === "W";
    stage.setAttribute("viewBox", W ? "0 0 880 470" : "0 0 360 700");
    return W
      ? { lp: [16,16,424,438], rp: [456,16,408,438], bw: 150, bh: 46, ct: [239,214], big: [239,434],
          bx: [[60,96],[268,96],[268,320],[60,320]], barX: 476, barW: 340, barH: 24, ly: [92,164,236],
          ty: [100,172,244], dyn: [332,354,376], fs: 10.4, tfs: 11, bf: 10 }
      : { lp: [8,8,344,300], rp: [8,320,344,372], bw: 126, bh: 38, ct: [176,130], big: [176,288],
          bx: [[30,52],[196,52],[196,196],[30,196]], barX: 26, barW: 296, barH: 22, ly: [386,440,494],
          ty: [394,448,502], dyn: [562,586,610], fs: 8.8, tfs: 9.2, bf: 9.2 };
  }

  const rc = (p, w, h, f, s, rx = 8) =>
    `<rect x="${p[0]}" y="${p[1]}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}"/>`;
  const tx = (x, y, fs, f, t, a = "") => `<text x="${x}" y="${y}" font-size="${fs}" fill="${f}"${a}>${t}</text>`;

  function arrow(x1, y1, x2, y2, c) {
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d,
      px = -uy, py = ux, h = 7, w = 4;
    return `<line x1="${x1}" y1="${y1}" x2="${x2 - h * 0.9 * ux}" y2="${y2 - h * 0.9 * uy}" stroke="${c}" stroke-width="2"/>`
      + `<polygon points="${x2},${y2} ${x2 - h * ux + w * px},${y2 - h * uy + w * py} ${x2 - h * ux - w * px},${y2 - h * uy - w * py}" fill="${c}"/>`;
  }

  function leftSVG(c) {
    const g = G, [A, B, C, D] = g.bx;
    const T = ["桑树（生产者）", "家蚕", "鱼", "塘泥"], S = ["固定光能", "食桑叶", "食蚕沙", "分解肥桑"];
    const F = ["#e6f6ee", "#ffffff", "#ffffff", "#fdf3e0"], K = ["#8ecfae", "#dbe7ef", "#dbe7ef", "#e6c993"];
    const I = ["#146b3a", "#151a21", "#151a21", "#8a5a10"];
    let s = rc(g.lp, g.lp[2], g.lp[3], "#f8fbfd", "#dbe7ef", 10)
      + tx(g.lp[0] + 20, g.lp[1] + 28, g.tfs, "#5a6472", "物质在系统内循环", ' font-weight="700"');
    g.bx.forEach((b, i) => {
      s += rc(b, g.bw, g.bh, F[i], K[i])
        + tx(b[0] + 10, b[1] + 18, g.bf, I[i], T[i], ' font-weight="700"')
        + tx(b[0] + 10, b[1] + 33, g.fs, "#3a3a35", S[i]);
    });
    s += arrow(A[0] + g.bw, A[1] + g.bh / 2, B[0], B[1] + g.bh / 2, "#0f8a5f")
      + arrow(B[0] + g.bw / 2, B[1] + g.bh, C[0] + g.bw / 2, C[1], "#b8791f")
      + arrow(C[0], C[1] + g.bh / 2, D[0] + g.bw, D[1] + g.bh / 2, "#b8791f")
      + arrow(D[0] + g.bw / 2, D[1], A[0] + g.bw / 2, A[1] + g.bh, "#0f8a5f");
    (L === "W" ? ["桑叶养蚕 → 蚕沙喂鱼", "废弃物 = 下一环原料"] : ["桑叶养蚕 → 蚕沙喂鱼"])
      .forEach((t, i) => { s += tx(g.ct[0], g.ct[1] + i * 20, g.fs, "#22495e", t, ' text-anchor="middle"'); });
    const m = Math.round(c.r), v = Math.round(c.input);
    return s + tx(g.big[0], g.big[1], g.tfs + 0.5, "#146b3a",
      `回用 ${m}% → 投入 ${v}、排放 ${v}`, ' font-weight="700" text-anchor="middle"');
  }

  function rightSVG(c) {
    const g = G, V = [c.input, c.output, c.r];
    const LAB = ["外部输入 = 100 − r", "排放 = 100 − r", "循环再用 r"];
    const CL = ["#b8791f", "#b8402f", "#2f8a5b"];
    let s = rc(g.rp, g.rp[2], g.rp[3], "#ffffff", "#e6e9ee", 10)
      + tx(g.barX, g.rp[1] + 32, g.tfs, "#5a6472", "投入与排放（相对值）", ' font-weight="700"');
    for (let i = 0; i < 3; i++) {
      s += tx(g.barX, g.ly[i], g.fs, "#3a3a35", LAB[i])
        + tx(g.barX + g.barW, g.ly[i], g.tfs, CL[i], Math.round(V[i]), ' font-weight="700" text-anchor="end"')
        + `<rect x="${g.barX}" y="${g.ty[i]}" width="${g.barW}" height="${g.barH}" rx="4" fill="#eef2f5"/>`
        + `<rect x="${g.barX}" y="${g.ty[i]}" width="${g.barW * V[i] / 100}" height="${g.barH}" rx="4" fill="${CL[i]}"/>`;
    }
    const m = Math.round(c.r), v = Math.round(c.input);
    const d = ["投入 = 排放 = " + v, "r=50 各减半（停留点）", `r=${m}%：省投入少排污`];
    for (let i = 0; i < 3; i++) {
      s += tx(g.barX, g.dyn[i], g.fs, i === 2 ? "#146b3a" : "#5a6472", d[i]);
    }
    return s;
  }

  function render() {
    if (!G) { L = layout(); G = geom(); }
    const sl = $("gxSl"), r = sl ? parseFloat(sl.value) : 50;
    if (!isFinite(r)) r = 50;
    const c = calc(r), st = stateOf(r), box = $("gxStBox");
    $("gxA").innerHTML = leftSVG(c);
    $("gxB").innerHTML = rightSVG(c);
    $("gxVa").textContent = Math.round(r) + "%";
    $("gxVb").textContent = String(Math.round(c.input));
    $("gxVc").textContent = String(Math.round(c.output));
    $("gxVs").textContent = st.t;
    $("gxVsn").textContent = st.s;
    $("gxVs").style.color = st.c;
    if (box) {
      box.style.borderColor = st.c + "55";
      box.style.background = st.c === "#2f8a5b" ? "#e6f6ee" : st.c === "#b8791f" ? "#fdf3e0" : "#fbeae7";
    }
  }

  function setMode(m) {
    const b = $("gxAp"), t = $("gxApTxt");
    if (b) { b.classList.toggle("is-auto", m === "auto"); b.classList.toggle("is-manual", m !== "auto"); }
    if (t) t.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  function init() {
    stage = $("gxStage");
    if (!stage) return;
    render();
    const sl = $("gxSl");
    if (sl) sl.addEventListener("input", render);
    addEventListener("resize", () => { G = null; render(); });
    if (window.AutoPilot && window.AutoPilot.create) {
      window.__ap = window.AutoPilot.create({
        mount: stage, follow: sl,
        loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 50 }, { t: 6.5, v: 50 },
          { t: 9, v: 90 }, { t: 11, v: 70 }, { t: 13, v: 0 }],
        keys: [0, 50, 70, 90], value: 0, min: 0, max: 90, step: 5, idle: 5000,
        onChange: render, onMode: setMode
      });
    }
    const steps = $("gxSteps") ? $("gxSteps").querySelectorAll(".step") : [];
    let idx = 0;
    const next = $("gxNext");
    if (next) {
      next.addEventListener("click", function () {
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
  }

  window.__bio = {
    calc,
    cases: [
      { v: 0, eq: { input: 100, output: 100 } },
      { v: 50, eq: { input: 50, output: 50 } },
      { v: 90, eq: { input: 10, output: 10 } }
    ]
  };
  window.__model = window.__bio;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
