#!/usr/bin/env python3
"""Daily discovery of new open-vocabulary 3D segmentation papers.

Queries arXiv, de-duplicates against the verified list, optionally enriches
venue metadata via Semantic Scholar, and appends new entries to
data/candidates.json. Numbers are never extracted here: a human/AI reviewer
verifies them against the paper before they enter data/papers.json.

Usage:
    python3 scripts/harvest.py                 # normal run
    python3 scripts/harvest.py --dry-run       # print what would be added
    python3 scripts/harvest.py --since 2026-10-01 --max 60
    python3 scripts/harvest.py --summary-json /tmp/harvest-summary.json

Exit codes: 0 success (including zero new papers), 2 network/parse failure.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
CST = timezone(timedelta(hours=8))
ATOM = "{http://www.w3.org/2005/Atom}"
ARXIV = "{http://arxiv.org/schemas/atom}"
UA = "ov3d-leaderboard/1.0 (research index; contact via GitHub)"

QUERIES = [
    'abs:"open-vocabulary" AND abs:"point cloud"',
    'abs:"open-vocabulary" AND abs:"3D semantic segmentation"',
    'abs:"zero-shot" AND abs:"3D semantic segmentation"',
    'abs:"language-driven" AND abs:"3D scene"',
    'abs:"open-vocabulary" AND abs:"3D scene understanding"',
]

RELEVANT = [
    "open-vocabulary", "open vocabulary", "open-vocab", "zero-shot", "zero shot",
    "language-driven", "text-driven", "open-world", "open world", "vision-language",
    "text query", "text prompt",
]
TASK = [
    "3d semantic segmentation", "semantic segmentation", "point cloud",
    "3d scene", "lidar", "scene understanding",
]
DATASETS = ["scannet", "nuscenes", "matterport"]
NEGATIVE = ["medical", "remote sensing", "aerial", "autonomous driving detection", "slam"]

# 关键词只用于“先抓进来待审”，不用于判断论文质量。
MIN_SCORE = 4


def now_cst() -> datetime:
    return datetime.now(CST)


def load_json(path: Path, default):
    if not path.exists():
        return default
    try:
        with path.open(encoding="utf-8") as fh:
            return json.load(fh)
    except json.JSONDecodeError:
        return default


def write_json(path: Path, payload) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    os.replace(tmp, path)


def fetch(url: str, timeout: int = 30) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", "replace")


def base_arxiv_id(raw: str) -> str:
    value = raw.rsplit("/abs/", 1)[-1]
    return re.sub(r"v\d+$", "", value)


def normalize_title(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", title.lower())


def score(entry: dict) -> tuple[int, list[str]]:
    text = (entry["title"] + " " + entry["abstract"]).lower()
    hits: list[str] = []
    total = 0
    for word in RELEVANT:
        if word in text:
            hits.append(word)
            total += 2
    for word in TASK:
        if word in text:
            total += 2
            break
    for name in DATASETS:
        if name in text:
            total += 1
            hits.append(name)
    for word in NEGATIVE:
        if word in text:
            total -= 2
    if any(word in text for word in ("point cloud", "3d scene", "3d semantic", "3d point")):
        total += 2
    return total, hits


def parse_arxiv(xml_text: str) -> list[dict]:
    root = ElementTree.fromstring(xml_text)
    entries = []
    for node in root.findall(ATOM + "entry"):
        title = " ".join((node.findtext(ATOM + "title") or "").split())
        summary = " ".join((node.findtext(ATOM + "summary") or "").split())
        raw_id = node.findtext(ATOM + "id") or ""
        published = (node.findtext(ATOM + "published") or "")[:10]
        authors = [
            (author.findtext(ATOM + "name") or "").strip()
            for author in node.findall(ATOM + "author")
        ]
        comment = " ".join((node.findtext(ARXIV + "comment") or "").split())
        journal = " ".join((node.findtext(ARXIV + "journal_ref") or "").split())
        entries.append(
            {
                "arxiv_id": base_arxiv_id(raw_id),
                "title": title,
                "abstract": summary,
                "published": published,
                "authors": [a for a in authors if a][:8],
                "comment": comment,
                "journal_ref": journal,
                "url": f"https://arxiv.org/abs/{base_arxiv_id(raw_id)}",
            }
        )
    return entries


def venue_hint(entry: dict) -> str:
    text = entry.get("comment") or entry.get("journal_ref") or ""
    match = re.search(
        r"(CVPR|ICCV|ECCV|NeurIPS|ICLR|ICML|AAAI|ACM MM|3DV|TPAMI|TIP|TGRS|RA-L|IROS|ICRA)\s*'?\s*(20\d{2})?",
        text,
        re.IGNORECASE,
    )
    if not match:
        return ""
    venue = match.group(1).upper() if len(match.group(1)) <= 5 else match.group(1)
    year = match.group(2) or ""
    return (venue + " " + year).strip()


def enrich_with_semantic_scholar(entry: dict) -> None:
    """Best-effort venue/DOI enrichment; failures are ignored."""
    query = urllib.parse.quote(entry["title"][:180])
    url = (
        "https://api.semanticscholar.org/graph/v1/paper/search"
        f"?query={query}&limit=1&fields=title,venue,year,externalIds"
    )
    try:
        payload = json.loads(fetch(url, timeout=20))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return
    papers = payload.get("data") or []
    if not papers:
        return
    paper = papers[0]
    if normalize_title(paper.get("title") or "") != normalize_title(entry["title"]):
        return
    if paper.get("venue"):
        entry["venue_hint"] = f"{paper['venue']} {paper.get('year') or ''}".strip()
    doi = (paper.get("externalIds") or {}).get("DOI")
    if doi:
        entry["doi"] = doi


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="抓取开放词汇 3D 分割新论文")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--since", help="起始日期 YYYY-MM-DD（默认按上次成功日期回退 7 天）")
    parser.add_argument("--max", type=int, default=120, help="每个查询取多少条")
    parser.add_argument("--summary-json", help="把本次运行摘要写到该路径")
    parser.add_argument("--no-enrich", action="store_true", help="跳过 Semantic Scholar 富化")
    args = parser.parse_args(argv)

    state = load_json(DATA / "state.json", {})
    papers = load_json(DATA / "papers.json", {"methods": []})
    candidates = load_json(DATA / "candidates.json", [])

    today = now_cst().date()
    if args.since:
        since = datetime.strptime(args.since, "%Y-%m-%d").date()
    else:
        cursor = state.get("last_success") or state.get("last_check") or ""
        try:
            since = datetime.strptime(cursor[:10], "%Y-%m-%d").date() - timedelta(days=7)
        except ValueError:
            since = today - timedelta(days=45)
        since = max(since, today - timedelta(days=180))

    known_ids = {m.get("paper", {}).get("arxiv_id") for m in papers.get("methods", [])}
    known_titles = {normalize_title(m.get("paper", {}).get("title", "")) for m in papers.get("methods", [])}
    existing_ids = {c.get("arxiv_id") for c in candidates}
    existing_titles = {normalize_title(c.get("title", "")) for c in candidates}

    fetched: list[dict] = []
    try:
        for query in QUERIES:
            url = (
                "https://export.arxiv.org/api/query?search_query="
                + urllib.parse.quote(query)
                + f"&start=0&max_results={args.max}&sortBy=submittedDate&sortOrder=descending"
            )
            fetched.extend(parse_arxiv(fetch(url)))
            time.sleep(3.2)  # arXiv 请求间隔要求
    except (urllib.error.URLError, TimeoutError, ElementTree.ParseError) as exc:
        message = f"arXiv 抓取失败：{exc}"
        print(f"[harvest] {message}", file=sys.stderr)
        state["last_error"] = message
        write_json(DATA / "state.json", state)
        return 2

    seen: set[str] = set()
    new_items: list[dict] = []
    skipped_old = 0
    for entry in fetched:
        key = entry["arxiv_id"]
        if key in seen:
            continue
        seen.add(key)
        try:
            published = datetime.strptime(entry["published"], "%Y-%m-%d").date()
        except ValueError:
            continue
        if published < since:
            skipped_old += 1
            continue
        if key in known_ids or key in existing_ids:
            continue
        if normalize_title(entry["title"]) in known_titles or normalize_title(entry["title"]) in existing_titles:
            continue
        value, hits = score(entry)
        if value < MIN_SCORE:
            continue
        # 只要与语义分割无关的 3D 任务（场景图、扩散策略等），先挡在队列外。
        if not any(word in (entry["title"] + " " + entry["abstract"]).lower()
                   for word in ("segment", "semantic", "label")):
            continue
        text = (entry["title"] + " " + entry["abstract"]).lower()
        mv_hits = any(word in text for word in (
            "multi-view", "multi view", "projection", "pixel-point", "2d-3d",
            "2d3d", "fusion", "superpoint", "lift",
        ))
        item = {
            "id": key,
            "tracks": ["ov", "multi_view"] if mv_hits else ["ov"],
            "arxiv_id": key,
            "title": entry["title"],
            "authors": entry["authors"],
            "published": entry["published"],
            "url": entry["url"],
            "venue_hint": venue_hint(entry),
            "matched_keywords": sorted(set(hits))[:6],
            "score": value,
            "found_at": now_cst().strftime("%Y-%m-%d %H:%M"),
            "status": "pending",
            "source": "arxiv",
            "abstract_snippet": entry["abstract"][:320],
        }
        new_items.append(item)
        existing_ids.add(key)

    new_items.sort(key=lambda item: item["published"], reverse=True)
    if not args.no_enrich:
        for item in new_items[:15]:
            enrich_with_semantic_scholar(item)
            time.sleep(1.1)

    summary = {
        "at": now_cst().strftime("%Y-%m-%d %H:%M"),
        "since": since.isoformat(),
        "fetched": len(fetched),
        "new": len(new_items),
        "skipped_old": skipped_old,
        "pending_total": len([c for c in candidates if c.get("status") == "pending"]) + len(new_items),
        "titles": [item["title"] for item in new_items],
    }

    if args.dry_run:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0

    if new_items:
        candidates = new_items + candidates
        write_json(DATA / "candidates.json", candidates)

    state.update(
        {
            "last_check": now_cst().strftime("%Y-%m-%d %H:%M"),
            "last_success": now_cst().strftime("%Y-%m-%d %H:%M"),
            "next_check": (now_cst() + timedelta(days=1)).strftime("%Y-%m-%d") + " 09:00",
            "last_error": None,
            "cursor_arxiv": today.isoformat(),
        }
    )
    write_json(DATA / "state.json", state)

    if args.summary_json:
        write_json(Path(args.summary_json), summary)

    print(
        f"[harvest] 抓取 {len(fetched)} 条，窗口自 {since}，新增待审 {len(new_items)} 条，"
        f"累计待审 {summary['pending_total']} 条"
    )
    for item in new_items[:10]:
        print(f"  + {item['published']}  {item['title'][:90]}  {item['url']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
