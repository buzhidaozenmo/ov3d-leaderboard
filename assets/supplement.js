/* 多视角 2D→3D · 补充结果（其他数据集，不排名） */
(function () {
  "use strict";

  var DATA = window.OV3D_DATA;
  var SUP = (DATA && DATA.supplement) || { entries: [] };
  var CODE_LABEL = { yes: "开源", partial: "部分开源", no: "未开源", unknown: "未确认" };
  var CODE_CLASS = { yes: "yes", partial: "partial", no: "no", unknown: "unknown" };

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function fmt(value) { return Number(value).toFixed(1); }
  function venueText(paper) {
    var venue = paper.venue || "";
    if (/\b(19|20)\d{2}\b/.test(venue)) return venue;
    return (venue + " " + (paper.year || "")).trim();
  }
  function codeBadge(paper) {
    var status = CODE_CLASS[paper.open_source] || "unknown";
    var node = paper.code_url && (paper.open_source === "yes" || paper.open_source === "partial")
      ? el("a", "code " + status)
      : el("span", "code " + status);
    if (node.tagName === "A") {
      node.href = paper.code_url;
      node.target = "_blank";
      node.rel = "noopener";
    }
    node.appendChild(el("i", "dot"));
    node.appendChild(el("span", "", CODE_LABEL[paper.open_source] || "未确认"));
    return node;
  }

  function render() {
    var body = $("supp-body");
    if (!body) return;
    clear(body);
    var count = 0;
    SUP.entries.forEach(function (entry) {
      var paper = entry.paper || {};
      (entry.results || []).forEach(function (result) {
        var tr = el("tr", "row");
        var methodCell = el("td", "c-method");
        methodCell.appendChild(el("span", "supp-method", entry.method));
        if (entry.note) methodCell.appendChild(el("span", "supp-note", entry.note));
        tr.appendChild(methodCell);

        var venueCell = el("td", "c-venue");
        var venue = el("span", "venue");
        var va = el("a", "", venueText(paper));
        va.href = paper.url;
        va.target = "_blank";
        va.rel = "noopener";
        venue.appendChild(va);
        venueCell.appendChild(venue);
        tr.appendChild(venueCell);

        tr.appendChild(el("td", "c-dataset", result.dataset));
        tr.appendChild(el("td", "c-classes", result.classes ? result.classes + " 类" : "—"));

        var miouCell = el("td", "c-suppmiou");
        miouCell.appendChild(el("span", "number", fmt(result.value)));
        miouCell.firstChild.appendChild(el("small", "", "%"));
        tr.appendChild(miouCell);

        tr.appendChild(el("td", "c-source", result.source + " · " + result.locator));

        var codeCell = el("td", "c-code");
        codeCell.appendChild(codeBadge(paper));
        tr.appendChild(codeCell);
        body.appendChild(tr);
        count += 1;
      });
    });
    $("supp-empty").hidden = count > 0;
    $("supp-empty").textContent = count > 0 ? "" : "暂无补充结果。";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
