/* 多视角 2D→3D 子榜单 — 渲染逻辑（无依赖，file:// 与 Pages 通用） */
(function () {
  "use strict";

  var DATA = window.OV3D_DATA;
  var DATASETS = ["scannet_v2", "nuscenes", "matterport3d"];
  var STAGE_LABEL = {
    "3d_distill": "3D 蒸馏",
    "self_distill": "自蒸馏",
    "2d3d_ensemble": "2D-3D 集成",
    "few_label": "少量标签"
  };
  var CODE_LABEL = { yes: "开源", partial: "部分开源", no: "未开源", unknown: "未确认" };
  var CODE_CLASS = { yes: "yes", partial: "partial", no: "no", unknown: "unknown" };
  var GROUP_LABEL = { open_vocab: "开放词汇", few_label: "少量标签参考" };

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
  function findBench(key) {
    for (var i = 0; i < DATA.benchmarks.length; i++) if (DATA.benchmarks[i].key === key) return DATA.benchmarks[i];
    return null;
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

  var MV = (DATA && DATA.multi_view) || { methods: [], ranks: {}, best: {}, counts: { methods: 0, pending: 0 } };
  var state = {
    dataset: "scannet_v2",
    query: "",
    onlyOpen: false,
    stage: "all",
    sort: "miou",
    expanded: {}
  };

  function readHash() {
    var raw = (window.location.hash || "").replace(/^#/, "");
    if (DATASETS.indexOf(raw) >= 0) state.dataset = raw;
  }
  function applyHash() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + state.dataset);
    }
  }

  function resultOf(item, key) { return (item.results || {})[key] || null; }

  function passes(item) {
    if (state.onlyOpen && item.paper.open_source !== "yes") return false;
    var stage = (item.mv || {}).stage_3d;
    if (state.stage !== "all" && stage !== state.stage) return false;
    if (!state.query) return true;
    var hay = [item.method, item.paper.title, item.paper.venue, (item.mv || {}).teacher_2d]
      .filter(Boolean).join(" ").toLowerCase();
    return hay.indexOf(state.query.toLowerCase()) >= 0;
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

  function buildRow(item, key, best) {
    var result = resultOf(item, key);
    var value = result && typeof result.miou === "number" ? result.miou : null;
    var rank = (MV.ranks[key] || {})[item.id];
    var isBest = value !== null && best !== null && value === best;
    var mv = item.mv || {};
    var tr = el("tr", "row");
    tr.tabIndex = 0;
    tr.setAttribute("aria-expanded", state.expanded[item.id] ? "true" : "false");

    var rankCell = el("td", "c-rank");
    if (item.group === "open_vocab") {
      rankCell.appendChild(el("div", "rank" + (rank === 1 ? " first" : ""), rank || "—"));
    } else {
      rankCell.appendChild(el("div", "rank", "·"));
    }
    tr.appendChild(rankCell);

    var methodCell = el("td", "c-method");
    methodCell.appendChild(el("span", "method-name", item.method));
    var tags = el("div", "method-tags");
    if (item.group === "few_label") tags.appendChild(el("span", "chip warn", "参考"));
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

    var teacherCell = el("td", "c-teacher");
    teacherCell.appendChild(el("span", "cell-small", mv.teacher_2d || "未记录"));
    tr.appendChild(teacherCell);

    var corrCell = el("td", "c-corr");
    var stack = el("div", "stack");
    stack.appendChild(el("span", "", mv.correspondence || "未记录"));
    stack.appendChild(el("span", "muted", mv.fusion || ""));
    corrCell.appendChild(stack);
    tr.appendChild(corrCell);

    var stageCell = el("td", "c-stage");
    stageCell.appendChild(el("span", "chip warn", STAGE_LABEL[mv.stage_3d] || mv.stage_3d || "未记录"));
    tr.appendChild(stageCell);

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
    var mv = item.mv || {};
    var tr = el("tr", "details");
    var td = el("td");
    td.colSpan = 10;
    var inner = el("div", "details-inner");

    var left = el("div");
    left.appendChild(el("h4", "", "论文"));
    left.appendChild(el("p", "title", item.paper.title));
    left.appendChild(el("p", "", (item.paper.authors || []).join("、")));
    left.appendChild(el("p", "", venueText(item.paper) + (item.paper.venue_type === "preprint" ? "（预印本）" : "")));
    left.appendChild(el("p", "", "2D 教师：" + (mv.teacher_2d || "未记录")));
    left.appendChild(el("p", "", "对应：" + (mv.correspondence || "未记录")));
    left.appendChild(el("p", "", "融合：" + (mv.fusion || "未记录")));
    left.appendChild(el("p", "", "3D 阶段：" + (STAGE_LABEL[mv.stage_3d] || mv.stage_3d || "未记录") + " · 学生：" + (mv.student_3d || "未记录")));
    if (mv.variant_note) left.appendChild(el("p", "", "变体说明：" + mv.variant_note));
    if (item.discrepancy) left.appendChild(el("p", "", "数值分歧：" + item.discrepancy));
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
    ["数据集", "mIoU", "mAcc", "来源", "位置"].forEach(function (label) { head.appendChild(el("th", "", label)); });
    var thead = el("thead"); thead.appendChild(head); table.appendChild(thead);
    var tbody = el("tbody");
    DATA.benchmarks.forEach(function (bench) {
      var result = resultOf(item, bench.key);
      var row = el("tr");
      row.appendChild(el("td", "", bench.label));
      row.appendChild(el("td", "num", result ? fmt(result.miou) : "—"));
      row.appendChild(el("td", "num", result && result.macc ? fmt(result.macc) : "—"));
      var sourceCell = el("td", "", result ? result.source : "未报告");
      if (result && result.source_kind === "secondary") sourceCell.appendChild(el("div", "secondary-flag", "转引自对照表"));
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

  function toggle(id) {
    state.expanded[id] = !state.expanded[id];
    renderTable();
  }

  function renderTable() {
    var key = state.dataset;
    var bench = findBench(key);
    var best = typeof MV.best[key] === "number" ? MV.best[key] : null;
    var body = $("board-body");
    clear(body);

    var rows = MV.methods.filter(passes);
    var groups = { open_vocab: [], few_label: [] };
    rows.forEach(function (item) { (groups[item.group] || (groups[item.group] = [])).push(item); });

    var rendered = 0;
    ["open_vocab", "few_label"].forEach(function (group, index) {
      var list = groups[group] || [];
      if (!list.length) return;
      sortRows(list, key);
      if (index > 0) {
        var sep = el("tr", "separator");
        var td = el("td");
        td.colSpan = 10;
        td.appendChild(el("span", "", GROUP_LABEL[group] + "（不参与排名）"));
        sep.appendChild(td);
        body.appendChild(sep);
      }
      list.forEach(function (item) {
        body.appendChild(buildRow(item, key, best));
        if (state.expanded[item.id]) body.appendChild(detailRow(item));
        rendered += 1;
      });
    });

    $("empty").hidden = rendered > 0;
    var count = (groups.open_vocab || []).filter(function (item) { return resultOf(item, key); }).length;
    $("table-caption").textContent = bench.label + " · " + bench.classes + " 类 · 多视角 2D→3D mIoU";
    $("table-sub").textContent = count + " 个开放词汇结果 · " + MV.methods.length +
      " 个收录方法 · 最近核实 " + (DATA.data_updated_at || "—");
  }

  function renderStats() {
    $("stat-methods").textContent = MV.counts.methods || MV.methods.length;
    $("stat-pending").textContent = MV.counts.pending || 0;
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
      counts[key] = MV.methods.filter(function (item) {
        return item.group === "open_vocab" && item.verified && resultOf(item, key);
      }).length;
    });
    document.querySelectorAll(".tab").forEach(function (tab) {
      var sup = tab.querySelector("sup");
      if (sup) sup.textContent = (counts[tab.dataset.dataset] || 0) + " 项";
    });
  }

  function renderTabs() {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.setAttribute("aria-selected", tab.dataset.dataset === state.dataset ? "true" : "false");
      tab.onclick = function () {
        state.dataset = tab.dataset.dataset;
        renderTable();
        renderTabs();
        applyHash();
      };
    });
  }

  function renderPending() {
    var list = $("pending-list");
    clear(list);
    var pending = (DATA.pending || []).filter(function (item) {
      return (item.tracks || ["ov"]).indexOf("multi_view") >= 0;
    });
    if (!pending.length) {
      list.appendChild(el("li", "pending-empty", "本周期没有命中多视角管线的候选。最近抓取：" + (DATA.last_checked || "—")));
      return;
    }
    pending.forEach(function (item) {
      var li = el("li");
      li.appendChild(el("span", "date", (item.found_at || "").slice(0, 10)));
      var title = el("span", "ptitle");
      title.appendChild(linkNode(item.title || "未命名", item.url || ("https://arxiv.org/abs/" + item.arxiv_id)));
      li.appendChild(title);
      li.appendChild(el("span", "kw", (item.keywords || []).slice(0, 2).join(" · ")));
      list.appendChild(li);
    });
  }

  function renderChangelog() {
    var list = $("changelog-list");
    if (!list) return;
    clear(list);
    var entries = DATA.changelog || [];
    if (!entries.length) {
      list.appendChild(el("li", "log-empty", "暂无更新记录。"));
      return;
    }
    entries.forEach(function (entry) {
      var li = el("li");
      li.appendChild(el("span", "log-date", entry.at || "—"));
      var body = el("span", "log-body");
      body.appendChild(el("strong", "", entry.summary || ""));
      if (entry.kind) body.appendChild(el("span", "log-kind", entry.kind));
      li.appendChild(body);
      list.appendChild(li);
    });
  }

  function bindToolbar() {
    $("search").addEventListener("input", function (e) {
      state.query = e.target.value.trim();
      renderTable();
    });
    $("only-open").addEventListener("change", function (e) {
      state.onlyOpen = e.target.checked;
      renderTable();
    });
    $("stage-filter").addEventListener("change", function (e) {
      state.stage = e.target.value;
      renderTable();
    });
    $("sort").addEventListener("change", function (e) {
      state.sort = e.target.value;
      renderTable();
    });
    window.addEventListener("hashchange", function () {
      readHash();
      renderTable();
      renderTabs();
    });
  }

  function fail(message) {
    var body = $("board-body");
    clear(body);
    var tr = el("tr");
    var td = el("td");
    td.colSpan = 10;
    td.appendChild(el("p", "empty", message));
    tr.appendChild(td);
    body.appendChild(tr);
  }

  function init() {
    if (!DATA || !DATA.multi_view) {
      fail("多视角数据未生成：请先运行 python3 scripts/build.py。");
      return;
    }
    readHash();
    renderStats();
    bindToolbar();
    renderTabs();
    renderTable();
    renderPending();
    renderChangelog();
    applyHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
