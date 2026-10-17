/* 内容页：把 <script type="text/markdown"> 里的 Markdown 渲染成正文 */
(function () {
  "use strict";

  var PREFIX = "hs.done.";
  var mem = {};
  var OK = (function () {
    try { localStorage.setItem("__hs_t", "1"); localStorage.removeItem("__hs_t"); return true; }
    catch (e) { return false; }
  })();

  function get(k) {
    try { return OK ? localStorage.getItem(k) : (mem[k] || null); } catch (e) { return mem[k] || null; }
  }
  function set(k, v) {
    try { if (OK) localStorage.setItem(k, v); else mem[k] = v; } catch (e) { mem[k] = v; }
  }
  function del(k) {
    try { if (OK) localStorage.removeItem(k); else delete mem[k]; } catch (e) { delete mem[k]; }
  }

  function esc(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function inline(t) {
    var codes = [];
    t = t.replace(/`([^`]+)`/g, function (_, c) {
      codes.push(c);
      return "\u0001" + (codes.length - 1) + "\u0001";
    });
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, src) {
      return '<img alt="' + alt + '" src="' + src + '" style="max-width:100%;border-radius:8px">';
    });
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    t = t.replace(/\u0001(\d+)\u0001/g, function (_, i) { return "<code>" + codes[+i] + "</code>"; });
    return t;
  }

  function splitRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (s) { return s.trim(); });
  }

  function md(src) {
    var lines = src.replace(/\r\n?/g, "\n").split("\n");
    var out = [], para = [], i = 0, n = lines.length;
    function flush() {
      if (para.length) { out.push("<p>" + inline(esc(para.join(" "))) + "</p>"); para = []; }
    }

    while (i < n) {
      var line = lines[i], m;

      if (/^\s*```/.test(line)) {
        flush();
        var buf = [];
        i++;
        while (i < n && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out.push("<pre><code>" + esc(buf.join("\n")) + "</code></pre>");
        continue;
      }
      if (/^\s*$/.test(line)) { flush(); i++; continue; }

      if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
        flush();
        var lv = Math.min(Math.max(m[1].length, 2), 4);  // # / ## 都从 h2 起（h1 是页面标题）
        out.push("<h" + lv + ">" + inline(esc(m[2])) + "</h" + lv + ">");
        i++;
        continue;
      }
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flush(); out.push("<hr>"); i++; continue; }

      if (/^\s*>\s?/.test(line)) {
        flush();
        var q = [];
        while (i < n && /^\s*>\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
        out.push("<blockquote>" + md(q.join("\n")) + "</blockquote>");
        continue;
      }

      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < n && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        flush();
        var head = splitRow(line);
        i += 2;
        var rows = [];
        while (i < n && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
        var html = "<table><thead><tr>" + head.map(function (c) { return "<th>" + inline(esc(c)) + "</th>"; }).join("") + "</tr></thead><tbody>";
        rows.forEach(function (r) {
          html += "<tr>" + r.map(function (c) { return "<td>" + inline(esc(c)) + "</td>"; }).join("") + "</tr>";
        });
        out.push(html + "</tbody></table>");
        continue;
      }

      if (/^\s*([-+*]|\d+[.)])\s+/.test(line)) {
        flush();
        var ordered = /^\s*\d+[.)]/.test(line);
        var re = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-+*]\s+(.*)$/;
        var items = [];
        while (i < n) {
          var mm = lines[i].match(re);
          if (mm) { items.push(mm[1]); i++; }
          else if (/^\s{2,}\S/.test(lines[i]) && items.length) { items[items.length - 1] += " " + lines[i].trim(); i++; }
          else break;
        }
        var tag = ordered ? "ol" : "ul";
        out.push("<" + tag + ">" + items.map(function (t) { return "<li>" + inline(esc(t)) + "</li>"; }).join("") + "</" + tag + ">");
        continue;
      }

      para.push(line.trim());
      i++;
    }
    flush();
    return out.join("\n");
  }

  function renderContent() {
    var host = document.getElementById("content");
    var srcEl = document.getElementById("md");
    if (!host) return;
    var src = srcEl ? srcEl.textContent.replace(/^\s*\n/, "").replace(/\s+$/, "") : "";

    if (!src) {
      host.innerHTML =
        '<div class="empty">' +
          '<div class="em-icon">✎</div>' +
          '<div class="em-title">这一节的内容还没开始整理</div>' +
          '<div class="em-tip">用任意编辑器打开本页文件，把内容写进文件末尾<br>' +
            '<code>&lt;script type="text/markdown"&gt;</code> 与 <code>&lt;/script&gt;</code> 之间，刷新即可自动排版。</div>' +
        "</div>";
      return;
    }
    if (/^\s*</.test(src) && /<\/(div|p|section|table|h\d)>/i.test(src)) {
      host.innerHTML = src;  // 直接写了 HTML 时原样输出
    } else {
      host.innerHTML = md(src);
    }
  }

  function setupDone() {
    var btn = document.getElementById("doneBtn");
    if (!btn) return;
    var key = PREFIX + btn.dataset.id;

    function paint() {
      var on = get(key) === "1";
      btn.classList.toggle("is-on", on);
      btn.querySelector(".done-txt").textContent = on ? "已复习" : "标记已复习";
    }
    btn.addEventListener("click", function () {
      if (get(key) === "1") del(key); else set(key, "1");
      paint();
    });
    paint();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderContent();
    setupDone();
  });
})();
