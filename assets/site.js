/* 首页 + 科目目录页逻辑（数据来自 assets/data.js） */
(function () {
  "use strict";

  var PREFIX = "hs.done.";
  var mem = {};

  function lsOk() {
    try {
      localStorage.setItem("__hs_t", "1");
      localStorage.removeItem("__hs_t");
      return true;
    } catch (e) { return false; }
  }
  var OK = lsOk();

  function get(k) {
    try { return OK ? localStorage.getItem(k) : (mem[k] || null); } catch (e) { return mem[k] || null; }
  }
  function set(k, v) {
    try { if (OK) localStorage.setItem(k, v); else mem[k] = v; } catch (e) { mem[k] = v; }
  }

  /** 已复习的条目集合：{ "geo/bx1-c1-s1": 1 } */
  function doneMap() {
    var out = {};
    try {
      if (OK && localStorage) {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf(PREFIX) === 0 && localStorage.getItem(k) === "1") {
            out[k.slice(PREFIX.length)] = 1;
          }
        }
        return out;
      }
    } catch (e) { /* ignore */ }
    for (var m in mem) {
      if (m.indexOf(PREFIX) === 0 && mem[m] === "1") out[m.slice(PREFIX.length)] = 1;
    }
    return out;
  }

  function countDone(sid, map) {
    var n = 0, pre = sid + "/";
    for (var k in map) if (k.indexOf(pre) === 0) n++;
    return n;
  }

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ============================ 首页 ============================ */

  function renderHome() {
    var host = document.getElementById("subjects");
    if (!host || !window.SUBJECTS) return;
    var map = doneMap();
    var totalAll = 0, doneAll = 0;

    window.SUBJECTS.forEach(function (s) {
      var total = s.stat.total;
      var done = countDone(s.id, map);
      totalAll += total; doneAll += done;
      var pct = total ? Math.round(done / total * 100) : 0;

      var a = el("a", "subject-card");
      a.href = "subject.html?s=" + s.id;
      a.style.setProperty("--accent", s.color);
      a.style.setProperty("--accent-soft", s.soft);
      a.innerHTML =
        '<span class="sc-badge">' + esc(s.name.charAt(0)) + "</span>" +
        '<div class="sc-main">' +
          "<h2>" + esc(s.name) + "</h2>" +
          '<div class="sc-desc">' + s.stat.books + " 册 · " + s.stat.chapters + " 章 · " + total + " 节" +
            (s.stat.extras ? " · " + s.stat.extras + " 专题" : "") + "</div>" +
        "</div>" +
        '<div class="sc-right">' +
          '<div class="sc-count">' + (done ? pct + "%" : "未开始") + "</div>" +
          '<div class="sc-bar"><i style="width:' + pct + '%"></i></div>' +
        "</div>";
      host.appendChild(a);
    });

    var foot = document.getElementById("siteFoot");
    if (foot) {
      foot.innerHTML = "共 " + window.SUBJECTS.length + " 科 · " + totalAll + " 个条目 · 已复习 " +
        doneAll + " 个（" + (totalAll ? Math.round(doneAll / totalAll * 100) : 0) + "%）";
    }
  }

  /* ============================ 科目页 ============================ */

  function getSubject() {
    var m = location.search.match(/[?&]s=([^&]+)/);
    var sid = m ? decodeURIComponent(m[1]) : "";
    if (!window.SUBJECTS) return null;
    for (var i = 0; i < window.SUBJECTS.length; i++) {
      if (window.SUBJECTS[i].id === sid) return window.SUBJECTS[i];
    }
    return null;
  }

  function renderSubject(s) {
    var map = doneMap();
    var done = countDone(s.id, map);

    document.body.style.setProperty("--accent", s.color);
    document.body.style.setProperty("--accent-soft", s.soft);
    document.title = s.name + " · 俯瞰太阳系";

    document.getElementById("shBadge").textContent = s.name.charAt(0);
    document.getElementById("shName").textContent = s.name;
    document.getElementById("shMeta").textContent =
      s.stat.books + " 册 · " + s.stat.chapters + " 章 · " + s.stat.total + " 个条目 · " + s.desc;

    var prog = document.getElementById("shProgress");
    var pct = s.stat.total ? Math.round(done / s.stat.total * 100) : 0;
    prog.innerHTML =
      '<div class="sh-bar"><i style="width:' + pct + '%"></i></div>' +
      '<span class="sh-pct">已复习 ' + done + " / " + s.stat.total + " · " + pct + "%</span>";

    /* --- 特别知识点 --- */
    if (s.extras && s.extras.length) {
      var box = el("section", "extras");
      var head = '<h2>特别知识点 <span class="n">' + s.extras.length + "</span></h2>";
      var chips = s.extras.map(function (e) {
        var isDone = map[s.id + "/" + e.slug] ? " is-done" : "";
        return '<a class="chip' + isDone + '" href="' + e.href + '" data-s="' + esc(e.title.toLowerCase()) + '">' + esc(e.title) + "</a>";
      }).join("");
      box.innerHTML = head + '<div class="chips">' + chips + "</div>";
      document.getElementById("extrasHost").appendChild(box);
    }

    /* --- 册 / 章 / 节 --- */
    var host = document.getElementById("booksHost");
    s.books.forEach(function (b, bi) {
      var det = el("details", "book");
      if (bi === 0) det.open = true;

      var nodeCount = 0;
      b.chapters.forEach(function (c) { nodeCount += c.items.length; });

      var sum = el("summary");
      sum.innerHTML =
        '<span class="bk-title">' + esc(b.title) + "</span>" +
        '<span class="bk-count">' + b.chapters.length + " 章 · " + nodeCount + " 节</span>" +
        '<span class="bk-arrow">›</span>';
      det.appendChild(sum);

      var body = el("div", "book-body");
      b.chapters.forEach(function (c) {
        var ch = el("div", "chapter");
        ch.dataset.t = c.title.toLowerCase();
        var h = el("div", "ch-head");
        h.innerHTML = "<span>" + esc(c.title) + "</span>";
        ch.appendChild(h);

        c.items.forEach(function (it) {
          var a = el("a", "item" + (it.kind === "research" ? " item--research" : ""));
          if (map[s.id + "/" + it.slug]) a.className += " is-done";
          a.href = it.href;
          a.dataset.s = ((it.label || "") + " " + it.title).toLowerCase();
          a.innerHTML =
            (it.label ? '<span class="it-label">' + esc(it.label) + "</span>" : "") +
            '<span class="it-title">' + esc(it.title) + "</span>" +
            '<span class="it-go">›</span>';
          ch.appendChild(a);
        });
        body.appendChild(ch);
      });

      det.appendChild(body);
      host.appendChild(det);
    });

    setupSearch();
  }

  function setupSearch() {
    var input = document.getElementById("search");
    if (!input) return;
    var books = Array.prototype.slice.call(document.querySelectorAll(".book"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

    function apply() {
      var q = input.value.trim().toLowerCase();
      document.body.classList.toggle("is-searching", !!q);

      books.forEach(function (bk) {
        var bookHit = false;
        Array.prototype.forEach.call(bk.querySelectorAll(".chapter"), function (ch) {
          var chHit = !q || (ch.dataset.t || "").indexOf(q) > -1;
          var any = chHit;
          Array.prototype.forEach.call(ch.querySelectorAll(".item"), function (it) {
            var hit = chHit || (it.dataset.s || "").indexOf(q) > -1;
            it.style.display = hit ? "" : "none";
            if (hit) any = true;
          });
          ch.classList.toggle("has-hit", any);
          if (any) bookHit = true;
        });
        bk.classList.toggle("has-hit", bookHit);
        if (q) bk.open = true;
      });

      chips.forEach(function (c) {
        var hit = !q || (c.dataset.s || "").indexOf(q) > -1;
        c.style.display = hit ? "" : "none";
      });
    }

    input.addEventListener("input", apply);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; apply(); input.blur(); }
    });
  }

  /* ============================ 启动 ============================ */

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    if (body.classList.contains("page")) return;  // 内容页自己处理
    var sid = getSubject();
    if (sid) { renderSubject(sid); return; }
    if (document.getElementById("subjects")) { renderHome(); return; }
    // subject.html 但 s 参数无效
    if (document.getElementById("booksHost")) {
      document.getElementById("booksHost").innerHTML =
        '<div class="search-empty" style="display:block">没有找到这个科目，<a href="index.html">回到首页</a>。</div>';
    }
  });

  window.HS = { doneMap: doneMap, countDone: countDone, get: get, set: set, PREFIX: PREFIX };
})();
