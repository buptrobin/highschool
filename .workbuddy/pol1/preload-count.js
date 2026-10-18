(function () {
  window.__ns = 0;
  window.__raf = 0;
  var c = document.createElementNS.bind(document);
  document.createElementNS = function (ns, t) { window.__ns++; return c(ns, t); };
  var r = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) { window.__raf++; return r(cb); };
  var a = Node.prototype.appendChild;
  Node.prototype.appendChild = function (kid) {
    if (kid && kid.namespaceURI === "http://www.w3.org/2000/svg") {
      window.__lastParent = this;
      window.__lastParentInfo = { tag: this.tagName, id: this.id || "", connected: this.isConnected, cls: this.getAttribute ? (this.getAttribute("class") || "") : "" };
    }
    return a.call(this, kid);
  };
})();
