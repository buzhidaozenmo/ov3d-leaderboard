/* 多视角 2D→3D 子榜单 · 实例分割（AP） */
(function () {
  "use strict";

  var DATA = window.OV3D_DATA;
  var INST = (DATA && DATA.instance) || { datasets: [], methods: [], ranks: {}, best: {}, counts: {} };
  var SETTING_LABEL = { zero_shot: "零样本", open_vocab: "开放词汇" };
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
  function fmt(value) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return Number(value).toFixed(1);
  }
  function venueText(paper) {
    var venue = paper.venue || "";
    if (/\b(19|20)\d{2}\b/.test(venue)) return venue;
    return (venue + " " + (paper.year || "")).trim();
  }
  function linkNode(label, href) {
    var a = el("a", "", label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }
  function codeBadge(item) {
    var paper = item.paper;
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

  var state = {
    dataset: (INST.datasets[0] || {}).key || "scannet200",
    query: "",
    onlyOpen: false,
    onlyZero: false,
    sort: "ap",
    expanded: {}
  };

  function datasetMeta(key) {
    for (var i = 0; i < INST.datasets.length; i++) if (INST.datasets[i].key === key) return INST.datasets[i];
    return { label: key, classes: 0 };
  }
  function resultOf(item, key) { return (item.results || {})[key] || null; }

  function passes(item) {
    if (state.onlyOpen && item.paper.open_source !== "yes") return false;
    if (state.onlyZero && item.setting !== "zero_shot") return false;
    if (!state.query) return true;
    var hay = [item.method, item.paper.title, item.paper.venue, (item.pipeline || {}).mask_2d]
      .filter(Boolean).join(" ").toLowerCase();
    return hay.indexOf(state.query.toLowerCase()) >= 0;
  }

  function sortRows(rows, key) {
    rows.sort(function (a, b) {
      if (state.sort === "name") return a.method.localeCompare(b.method);
      if (state.sort === "year") return (b.paper.year || 0) - (a.paper.year || 0) || a.method.localeCompare(b.method);
      var av = resultOf(a, key), bv = resultOf(b, key);
      var aa = av && typeof av.ap === "number" ? av.ap : -1;
      var bb = bv && typeof bv.ap === "number" ? bv.ap : -1;
      return bb - aa || a.method.localeCompare(b.method);
    });
    return rows;
  }

  function buildRow(item, key, best) {
    var result = resultOf(item, key);
    var value = result && typeof result.ap === "number" ? result.ap : null;
    var rank = (INST.ranks[key] || {})[item.id];
    var isBest = value !== null && best !== null && value === best;
    var pipe = item.pipeline || {};

    var tr = el("tr", "row");
    tr.tabIndex = 0;

    var rankCell = el("td", "c-rank");
    rankCell.appendChild(el("div", "rank" + (rank === 1 ? " first" : ""), rank || "—"));
    tr.appendChild(rankCell);

    var methodCell = el("td", "c-method");
    methodCell.appendChild(el("span", "method-name", item.method));
    var tags = el("div", "method-tags");
    if (item.online) tags.appendChild(el("span", "chip warn", "在线"));
    if (result && result.source_kind === "secondary") tags.appendChild(el("span", "chip warn", "转引"));
    methodCell.appendChild(tags);
    tr.appendChild(methodCell);

    var venueCell = el("td", "c-venue");
    var venue = el("span", "venue");
    var va = el("a", "", venueText(item.paper));
    va.href = item.paper.url;
    va.target = "_blank";
    va.rel = "noopener";
    venue.appendChild(va);
    if (item.paper.venue_type === "preprint") venue.appendChild(el("small", "", "预印本"));
    venueCell.appendChild(venue);
    tr.appendChild(venueCell);

    var apCell = el("td", "c-ap");
    var number = el("span", "number" + (isBest ? " best" : ""), fmt(value));
    apCell.appendChild(number);
    if (value !== null) {
      var bar = el("span", "bar");
      var fill = el("i");
      fill.style.width = Math.max(2, Math.round((value / Math.max(best || value, 1)) * 100)) + "%";
      bar.appendChild(fill);
      apCell.appendChild(bar);
    }
    tr.appendChild(apCell);

    var ap50Cell = el("td", "c-ap50");
    ap50Cell.appendChild(el("span", "macc", result ? fmt(result.ap50) : "—"));
    tr.appendChild(ap50Cell);

    var ap25Cell = el("td", "c-ap25");
    ap25Cell.appendChild(el("span", "macc", result ? fmt(result.ap25) : "—"));
    tr.appendChild(ap25Cell);

    var settingCell = el("td", "c-setting");
    settingCell.appendChild(el("span", "chip" + (item.setting === "zero_shot" ? "" : " warn"),
      SETTING_LABEL[item.setting] || item.setting));
    tr.appendChild(settingCell);

    var maskCell = el("td", "c-mask");
    maskCell.appendChild(el("span", "cell-small", pipe.mask_2d || "未记录"));
    tr.appendChild(maskCell);

    var corrCell = el("td", "c-corr");
    var stack = el("div", "stack");
    stack.appendChild(el("span", "", pipe.correspondence || "未记录"));
    stack.appendChild(el("span", "muted", pipe.fusion || ""));
    corrCell.appendChild(stack);
    tr.appendChild(corrCell);

    var proposalCell = el("td", "c-proposal");
    proposalCell.appendChild(el("span", "cell-small", pipe.proposal_3d || "未记录"));
    tr.appendChild(proposalCell);

    var codeCell = el("td", "c-code");
    codeCell.appendChild(codeBadge(item));
    tr.appendChild(codeCell);

    var moreCell = el("td", "c-more");
    var button = el("button", "more", state.expanded[item.id] ? "−" : "+");
    button.type = "button";
    button.setAttribute("aria-label", "展开 " + item.method + " 详情");
    moreCell.appendChild(button);
    tr.appendChild(moreCell);

    tr.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;
      toggle(item.id);
    });
    tr.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle(item.id);
      }
    });
    return tr;
  }

  function detailRow(item) {
    var pipe = item.pipeline || {};
    var tr = el("tr", "details");
    var td = el("td");
    td.colSpan = 12;
    var inner = el("div", "details-inner");

    var left = el("div");
    left.appendChild(el("h4", "", "论文"));
    left.appendChild(el("p", "title", item.paper.title));
    left.appendChild(el("p", "", (item.paper.authors || []).join("、")));
    left.appendChild(el("p", "", venueText(item.paper) + (item.paper.venue_type === "preprint" ? "（预印本）" : "")));
    left.appendChild(el("p", "", "设定：" + (SETTING_LABEL[item.setting] || item.setting) + (item.online ? " · 在线" : "")));
    left.appendChild(el("p", "", "2D 掩码：" + (pipe.mask_2d || "未记录")));
    left.appendChild(el("p", "", "对应：" + (pipe.correspondence || "未记录")));
    left.appendChild(el("p", "", "融合：" + (pipe.fusion || "未记录")));
    left.appendChild(el("p", "", "3D 提案：" + (pipe.proposal_3d || "未记录")));
    if (item.notes) left.appendChild(el("p", "", "备注：" + item.notes));
    left.appendChild(el("p", "", "核验：" + (item.verified_at || "—") + " · 收录：" + (item.added_at || "—")));
    var links = el("div", "links");
    if (item.paper.url) links.appendChild(linkNode("论文 / 出版页", item.paper.url));
    if (item.paper.arxiv_id) links.appendChild(linkNode("arXiv:" + item.paper.arxiv_id, "https://arxiv.org/abs/" + item.paper.arxiv_id));
    if (item.paper.code_url) links.appendChild(linkNode("官方代码", item.paper.code_url));
    left.appendChild(links);

    var right = el("div");
    right.appendChild(el("h4", "", "逐数据集出处"));
    var table = el("table", "srctable");
    var head = el("tr");
    ["数据集", "AP", "AP50", "AP25", "来源", "位置"].forEach(function (label) { head.appendChild(el("th", "", label)); });
    var thead = el("thead"); thead.appendChild(head); table.appendChild(thead);
    var tbody = el("tbody");
    INST.datasets.forEach(function (ds) {
      var result = resultOf(item, ds.key);
      var row = el("tr");
      row.appendChild(el("td", "", ds.label));
      row.appendChild(el("td", "num", result ? fmt(result.ap) : "—"));
      row.appendChild(el("td", "num", result ? fmt(result.ap50) : "—"));
      row.appendChild(el("td", "num", result ? fmt(result.ap25) : "—"));
      var sourceCell = el("td", "", result ? result.source : "未报告");
      if (result && result.source_kind === "secondary") sourceCell.appendChild(el("div", "secondary-flag", "转引自对照表"));
      row.appendChild(sourceCell);
      row.appendChild(el("td", "", result ? result.locator : "—"));
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    right.appendChild(table);
    right.appendChild(el("p", "", "注：AP 为论文报告值，未在本地重新评测。"));

    inner.appendChild(left);
    inner.appendChild(right);
    td.appendChild(inner);
    tr.appendChild(td);
    return tr;
  }

  function toggle(id) {
    state.expanded[id] = !state.expanded[id];
    render();
  }

  function renderTabs() {
    var wrap = $("inst-tabs");
    clear(wrap);
    INST.datasets.forEach(function (ds) {
      var button = el("button", "tab" + (ds.key === state.dataset ? "" : ""), ds.label);
      button.type = "button";
      button.dataset.dataset = ds.key;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", ds.key === state.dataset ? "true" : "false");
      if (ds.classes) button.appendChild(el("sup", "", ds.classes + " 类"));
      button.onclick = function () {
        state.dataset = ds.key;
        renderTabs();
        render();
      };
      wrap.appendChild(button);
    });
  }

  function render() {
    var key = state.dataset;
    var meta = datasetMeta(key);
    var best = typeof INST.best[key] === "number" ? INST.best[key] : null;
    var body = $("inst-body");
    clear(body);

    var rows = INST.methods.filter(function (item) {
      return item.verified && resultOf(item, key) && passes(item);
    });
    sortRows(rows, key);

    rows.forEach(function (item) {
      body.appendChild(buildRow(item, key, best));
      if (state.expanded[item.id]) body.appendChild(detailRow(item));
    });
    $("inst-empty").hidden = rows.length > 0;

    $("instance-caption").textContent = meta.label + (meta.classes ? " · " + meta.classes + " 类" : "") + " · 实例分割 AP";
    $("instance-sub").textContent = rows.length + " 个结果 · " + INST.methods.length +
      " 篇论文 · 最近核实 " + (DATA.data_updated_at || "—");
  }

  function bind() {
    $("inst-search").addEventListener("input", function (e) { state.query = e.target.value.trim(); render(); });
    $("inst-only-open").addEventListener("change", function (e) { state.onlyOpen = e.target.checked; render(); });
    $("inst-only-zero").addEventListener("change", function (e) { state.onlyZero = e.target.checked; render(); });
    $("inst-sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  }

  function init() {
    if (!DATA || !DATA.instance || !DATA.instance.datasets.length) {
      $("inst-body").appendChild(el("p", "empty", "实例数据未生成：请先运行 python3 scripts/build.py。"));
      return;
    }
    if (!datasetMeta(state.dataset).key) state.dataset = INST.datasets[0].key;
    bind();
    renderTabs();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
