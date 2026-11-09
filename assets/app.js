/* 开放词汇点云语义分割榜单 — 渲染逻辑（无依赖，file:// 与 Pages 通用） */
(function () {
  "use strict";

  var DATA = window.OV3D_DATA;
  var DATASETS = ["scannet_v2", "nuscenes", "matterport3d"];
  var GROUP_LABEL = {
    open_vocab: "开放词汇 / Zero-shot",
    few_label: "少量标签参考",
    fully_supervised: "全监督参考",
    transfer_baseline: "迁移基线参考"
  };
  var GROUP_ORDER = ["open_vocab", "few_label", "fully_supervised", "transfer_baseline"];
  var FAMILY_LABEL = {
    "3d_only": "3D-only",
    "2d3d_ensemble": "2D-3D Ens.",
    "self_distill": "Self-distill",
    "supervised": "Sup."
  };
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
  function fmt(value, digits) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return Number(value).toFixed(digits === undefined ? 1 : digits);
  }
  function venueText(paper) {
    var venue = paper.venue || "";
    if (/\b(19|20)\d{2}\b/.test(venue)) return venue;
    return (venue + " " + (paper.year || "")).trim();
  }
  function findBench(key) {
    for (var i = 0; i < DATA.benchmarks.length; i++) if (DATA.benchmarks[i].key === key) return DATA.benchmarks[i];
    return null;
  }

  var state = {
    dataset: "scannet_v2",
    view: "table",
    query: "",
    onlyOpen: false,
    only3d: false,
    sort: "miou",
    expanded: {}
  };

  function readHash() {
    var raw = (window.location.hash || "").replace(/^#/, "");
    if (raw === "matrix") { state.view = "matrix"; return; }
    if (DATASETS.indexOf(raw) >= 0) state.dataset = raw;
  }

  function applyHash() {
    var hash = state.view === "matrix" ? "matrix" : state.dataset;
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + hash);
    }
  }

  function resultOf(item, key) {
    return (item.results || {})[key] || null;
  }

  function matchesQuery(item, q) {
    if (!q) return true;
    var hay = [item.method, item.paper && item.paper.title, item.paper && item.paper.venue]
      .filter(Boolean).join(" ").toLowerCase();
    return hay.indexOf(q.toLowerCase()) >= 0;
  }

  function passesFilters(item) {
    if (!matchesQuery(item, state.query)) return false;
    if (state.onlyOpen && item.paper.open_source !== "yes") return false;
    if (state.only3d && item.protocol.family !== "3d_only") return false;
    return true;
  }

  function sortRows(rows, key) {
    rows.sort(function (a, b) {
      if (state.sort === "name") return a.method.localeCompare(b.method);
      if (state.sort === "year") {
        return (b.paper.year || 0) - (a.paper.year || 0) || a.method.localeCompare(b.method);
      }
      var av = resultOf(a, key), bv = resultOf(b, key);
      var am = av && typeof av.miou === "number" ? av.miou : -1;
      var bm = bv && typeof bv.miou === "number" ? bv.miou : -1;
      return bm - am || a.method.localeCompare(b.method);
    });
    return rows;
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

  function chipsFor(item, result) {
    var wrap = el("div", "chips");
    var family = FAMILY_LABEL[item.protocol.family] || item.protocol.family;
    if (family) wrap.appendChild(el("span", "chip", family));
    if (result && result.source_kind === "secondary") wrap.appendChild(el("span", "chip warn", "转引"));
    if (item.group === "few_label") wrap.appendChild(el("span", "chip warn", "少量标签"));
    (item.tags || []).forEach(function (tag) {
      if (tag && tag !== "ensemble") wrap.appendChild(el("span", "chip", tag));
    });
    return wrap;
  }

  function buildRow(item, key, best) {
    var result = resultOf(item, key);
    var value = result && typeof result.miou === "number" ? result.miou : null;
    var rank = (DATA.ranks[key] || {})[item.id];
    var isBest = value !== null && best !== null && value === best;
    var tr = el("tr", "row");
    tr.dataset.id = item.id;
    tr.dataset.label = item.method;
    tr.tabIndex = 0;
    tr.setAttribute("aria-expanded", state.expanded[item.id] ? "true" : "false");

    var rankCell = el("td", "c-rank");
    if (item.group === "open_vocab") {
      var rankNode = el("div", "rank" + (rank === 1 ? " first" : ""), rank ? rank : "—");
      if (rank) rankNode.setAttribute("title", "开放词汇第 " + rank + " 名");
      rankCell.appendChild(rankNode);
    } else {
      rankCell.appendChild(el("div", "rank", "·"));
    }
    tr.appendChild(rankCell);

    var methodCell = el("td");
    methodCell.appendChild(el("span", "method-name", item.method));
    var tags = el("div", "method-tags");
    if (item.group !== "open_vocab") tags.appendChild(el("span", "chip", item.supervision === "few_label" ? "少量标签" : "参考"));
    methodCell.appendChild(tags);
    tr.appendChild(methodCell);

    var venueCell = el("td", "c-venue");
    var venue = el("span", "venue");
    var venueLink = el("a", "", venueText(item.paper));
    venueLink.href = item.paper.url;
    venueLink.target = "_blank";
    venueLink.rel = "noopener";
    venue.appendChild(venueLink);
    if (item.paper.venue_type === "preprint") venue.appendChild(el("small", "", "预印本 · 未经同行评审"));
    venueCell.appendChild(venue);
    tr.appendChild(venueCell);

    var miouCell = el("td", "c-miou");
    var number = el("span", "number" + (isBest && item.group === "open_vocab" ? " best" : ""), fmt(value));
    if (value !== null) number.appendChild(el("small", "", "%"));
    miouCell.appendChild(number);
    if (value !== null) {
      var bar = el("span", "bar");
      var fill = el("i");
      fill.style.width = Math.max(2, Math.round((value / Math.max(best || value, 1)) * 100)) + "%";
      bar.appendChild(fill);
      miouCell.appendChild(bar);
    }
    tr.appendChild(miouCell);

    var maccCell = el("td", "c-macc");
    maccCell.appendChild(el("span", "macc", result && result.macc ? fmt(result.macc) : "—"));
    tr.appendChild(maccCell);

    var protoCell = el("td", "c-proto");
    protoCell.appendChild(chipsFor(item, result));
    tr.appendChild(protoCell);

    var codeCell = el("td", "c-code");
    codeCell.appendChild(codeBadge(item));
    tr.appendChild(codeCell);

    var moreCell = el("td", "c-more");
    var button = el("button", "more", state.expanded[item.id] ? "−" : "+");
    button.type = "button";
    button.setAttribute("aria-label", (state.expanded[item.id] ? "收起 " : "展开 ") + item.method + " 详情");
    button.setAttribute("aria-expanded", state.expanded[item.id] ? "true" : "false");
    moreCell.appendChild(button);
    tr.appendChild(moreCell);

    tr.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;
      toggleDetails(item.id);
    });
    tr.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDetails(item.id);
      }
    });
    return tr;
  }

  function detailRow(item) {
    var tr = el("tr", "details");
    var td = el("td");
    td.colSpan = 8;
    var inner = el("div", "details-inner");

    var left = el("div");
    left.appendChild(el("h4", "", "论文"));
    left.appendChild(el("p", "title", item.paper.title));
    var authors = (item.paper.authors || []).join("、");
    left.appendChild(el("p", "", authors));
    left.appendChild(el("p", "", venueText(item.paper) +
      (item.paper.venue_type === "preprint" ? "（预印本）" : "")));
    left.appendChild(el("p", "", "口径：" + (FAMILY_LABEL[item.protocol.family] || item.protocol.family) +
      " · 文本编码器 " + (item.protocol.text_encoder || "未记录") +
      (item.protocol.notes ? " · " + item.protocol.notes : "")));
    if (item.discrepancy) left.appendChild(el("p", "", "数值分歧：" + item.discrepancy));
    left.appendChild(el("p", "", "核验：" + (item.verified_at || "—") + " · 收录：" + (item.added_at || "—")));
    var links = el("div", "links");
    if (item.paper.url) links.appendChild(linkNode("论文 / 出版页", item.paper.url));
    if (item.paper.arxiv_id) links.appendChild(linkNode("arXiv:" + item.paper.arxiv_id, "https://arxiv.org/abs/" + item.paper.arxiv_id));
    if (item.paper.code_url) links.appendChild(linkNode("官方代码", item.paper.code_url));
    if (item.paper.doi) links.appendChild(linkNode("DOI", "https://doi.org/" + item.paper.doi));
    left.appendChild(links);

    var right = el("div");
    right.appendChild(el("h4", "", "逐数据集出处"));
    var table = el("table", "srctable");
    var head = el("tr");
    ["数据集", "mIoU", "mAcc", "来源", "位置"].forEach(function (label) {
      head.appendChild(el("th", "", label));
    });
    var thead = el("thead"); thead.appendChild(head); table.appendChild(thead);
    var tbody = el("tbody");
    DATA.benchmarks.forEach(function (bench) {
      var result = resultOf(item, bench.key);
      var row = el("tr");
      row.appendChild(el("td", "", bench.label));
      row.appendChild(el("td", "num", result ? fmt(result.miou) : "—"));
      row.appendChild(el("td", "num", result && result.macc ? fmt(result.macc) : "—"));
      var sourceCell = el("td", "", result ? result.source : "未报告");
      if (result && result.source_kind === "secondary") {
        sourceCell.appendChild(el("div", "secondary-flag", "转引自对照表"));
      }
      row.appendChild(sourceCell);
      row.appendChild(el("td", "", result ? result.locator : "—"));
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    right.appendChild(table);
    right.appendChild(el("p", "", "注：数值为论文报告值，未在本地重新评测。"));

    inner.appendChild(left);
    inner.appendChild(right);
    td.appendChild(inner);
    tr.appendChild(td);
    return tr;
  }

  function linkNode(label, href) {
    var a = el("a", "", label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  function toggleDetails(id) {
    state.expanded[id] = !state.expanded[id];
    renderTable();
  }

  function groupRows(items, key) {
    var groups = {};
    GROUP_ORDER.forEach(function (group) { groups[group] = []; });
    items.forEach(function (item) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }

  function renderTable() {
    var key = state.dataset;
    var bench = findBench(key);
    var best = typeof DATA.best[key] === "number" ? DATA.best[key] : null;
    var body = $("board-body");
    clear(body);

    var visible = DATA.methods.filter(passesFilters);
    var groups = groupRows(visible, key);
    var rendered = 0;

    GROUP_ORDER.forEach(function (group, index) {
      var rows = groups[group] || [];
      if (!rows.length) return;
      sortRows(rows, key);
      if (index > 0) {
        var sep = el("tr", "separator");
        var td = el("td");
        td.colSpan = 8;
        td.appendChild(el("span", "", GROUP_LABEL[group]));
        td.appendChild(el("span", "sep-note",
          group === "open_vocab" ? "" : "不参与开放词汇排名，仅作对照"));
        sep.appendChild(td);
        body.appendChild(sep);
      }
      rows.forEach(function (item) {
        body.appendChild(buildRow(item, key, best));
        if (state.expanded[item.id]) body.appendChild(detailRow(item));
        rendered += 1;
      });
    });

    $("empty").hidden = rendered > 0;

    var ovCount = (groups.open_vocab || []).filter(function (item) {
      return resultOf(item, key);
    }).length;
    $("table-caption").textContent = bench.label + " · 开放词汇 mIoU";
    $("table-sub").textContent = ovCount + " 个开放词汇结果 · " + DATA.counts.papers +
      " 条记录 / " + (DATA.counts.unique_papers || DATA.counts.papers) +
      " 篇论文 · 最近核实 " + (DATA.data_updated_at || "—");
  }

  function meanMiou(item) {
    var values = [];
    DATASETS.forEach(function (key) {
      var result = resultOf(item, key);
      if (result && typeof result.miou === "number") values.push(result.miou);
    });
    if (!values.length) return -1;
    return values.reduce(function (a, b) { return a + b; }, 0) / values.length;
  }

  function renderMatrix() {
    var body = $("matrix-body");
    clear(body);
    var rows = DATA.methods.slice().filter(function (item) {
      return DATASETS.some(function (key) { return resultOf(item, key); }) && passesFilters(item);
    });
    function activeValue(item) {
      var result = resultOf(item, state.dataset);
      return result && typeof result.miou === "number" ? result.miou : -1;
    }
    rows.sort(function (a, b) {
      var ga = GROUP_ORDER.indexOf(a.group), gb = GROUP_ORDER.indexOf(b.group);
      return ga - gb || activeValue(b) - activeValue(a) || a.method.localeCompare(b.method);
    });
    $("matrix-sub").textContent = "按 " + findBench(state.dataset).label +
      " 排序；各列最高值以红色下划线标出。";

    var currentGroup = null;
    rows.forEach(function (item) {
      if (item.group !== currentGroup && currentGroup !== null) {
        var sep = el("tr", "separator");
        var td = el("td");
        td.colSpan = 6;
        td.appendChild(el("span", "", GROUP_LABEL[item.group]));
        sep.appendChild(td);
        body.appendChild(sep);
      }
      currentGroup = item.group;

      var tr = el("tr", "row");
      var nameCell = el("td");
      nameCell.appendChild(el("span", "m-name", item.method));
      var meta = el("span", "m-meta", (FAMILY_LABEL[item.protocol.family] || "") +
        (item.paper.open_source === "yes" ? " · 开源" : ""));
      nameCell.appendChild(meta);
      tr.appendChild(nameCell);

      var venueCell = el("td", "c-venue");
      venueCell.appendChild(el("span", "venue", venueText(item.paper)));
      tr.appendChild(venueCell);

      DATASETS.forEach(function (key) {
        var cell = el("td", "c-miou");
        var result = resultOf(item, key);
        var value = result && typeof result.miou === "number" ? result.miou : null;
        var isBest = value !== null && DATA.best[key] === value && item.group === "open_vocab";
        var node = el("span", "num" + (isBest ? " best" : "") + (value === null ? " dash" : ""),
          value === null ? "—" : fmt(value));
        cell.appendChild(node);
        tr.appendChild(cell);
      });

      var codeCell = el("td", "c-code");
      codeCell.appendChild(codeBadge(item));
      tr.appendChild(codeCell);
      body.appendChild(tr);
    });
  }

  function renderPending() {
    var list = $("pending-list");
    clear(list);
    if (!DATA.pending || !DATA.pending.length) {
      var empty = el("li", "pending-empty", "本周期暂无新候选。最近抓取：" + (DATA.last_checked || "—"));
      list.appendChild(empty);
      return;
    }
    DATA.pending.forEach(function (item) {
      var li = el("li");
      li.appendChild(el("span", "date", (item.found_at || "").slice(0, 10)));
      var title = el("span", "ptitle");
      var a = linkNode(item.title || item.id || "未命名", item.url || ("https://arxiv.org/abs/" + item.arxiv_id));
      title.appendChild(a);
      li.appendChild(title);
      li.appendChild(el("span", "kw", (item.keywords || []).slice(0, 2).join(" · ")));
      list.appendChild(li);
    });
  }

  function renderStats() {
    $("stat-papers").textContent = DATA.counts.unique_papers || DATA.counts.papers;
    $("stat-pending").textContent = DATA.counts.pending;
    $("stat-check").textContent = DATA.last_checked || "—";
    $("stat-updated").textContent = DATA.data_updated_at || "—";
    $("foot-generated").textContent = DATA.generated_at || "—";
    $("foot-checked").textContent = DATA.last_checked || "—";
    $("cite-date").textContent = new Date().toISOString().slice(0, 10);
    $("kicker-year").textContent = new Date().getFullYear();
    $("foot-year").textContent = new Date().getFullYear();
    if (DATA.last_error) {
      var err = $("foot-error");
      err.hidden = false;
      err.textContent = "最近一次抓取失败：" + DATA.last_error;
    }
    var counts = {};
    DATASETS.forEach(function (key) {
      counts[key] = DATA.methods.filter(function (item) {
        return item.group === "open_vocab" && item.verified && resultOf(item, key);
      }).length;
    });
    document.querySelectorAll(".tab").forEach(function (tab) {
      var key = tab.dataset.dataset;
      var count = counts[key] || 0;
      var sup = tab.querySelector("sup");
      if (sup) sup.textContent = count + " 项";
    });
  }

  function renderTabs() {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.setAttribute("aria-selected", tab.dataset.dataset === state.dataset ? "true" : "false");
      tab.onclick = function () {
        state.dataset = tab.dataset.dataset;
        syncView();
        renderTable();
        if (state.view === "matrix") renderMatrix();
        renderTabs();
        applyHash();
      };
    });
    document.querySelectorAll("[data-view]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.view === state.view ? "true" : "false");
      button.onclick = function () {
        state.view = button.dataset.view;
        syncView();
        if (state.view === "matrix") renderMatrix();
        renderTabs();
        applyHash();
      };
    });
  }

  function syncView() {
    var isMatrix = state.view === "matrix";
    $("view-table").hidden = isMatrix;
    $("view-matrix").hidden = !isMatrix;
  }

  function bindToolbar() {
    $("search").addEventListener("input", function (event) {
      state.query = event.target.value.trim();
      renderTable();
      renderMatrix();
    });
    $("only-open").addEventListener("change", function (event) {
      state.onlyOpen = event.target.checked;
      renderTable();
      renderMatrix();
    });
    $("only-3d").addEventListener("change", function (event) {
      state.only3d = event.target.checked;
      renderTable();
      renderMatrix();
    });
    $("sort").addEventListener("change", function (event) {
      state.sort = event.target.value;
      renderTable();
    });
    window.addEventListener("hashchange", function () {
      readHash();
      syncView();
      renderTable();
      renderMatrix();
      renderTabs();
    });
  }

  function fail(message) {
    var body = $("board-body");
    if (body) {
      clear(body);
      var tr = el("tr");
      var td = el("td");
      td.colSpan = 8;
      td.appendChild(el("p", "empty", message));
      tr.appendChild(td);
      body.appendChild(tr);
    }
    var pending = $("pending-list");
    if (pending) {
      clear(pending);
      var li = el("li", "pending-empty", message);
      pending.appendChild(li);
    }
  }

  function init() {
    if (!DATA) {
      fail("数据未生成：请先运行 python3 scripts/build.py，然后刷新页面。");
      return;
    }
    readHash();
    syncView();
    renderStats();
    bindToolbar();
    renderTabs();
    renderTable();
    renderMatrix();
    renderPending();
    applyHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
