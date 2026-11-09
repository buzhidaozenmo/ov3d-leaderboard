#!/usr/bin/env python3
"""Validate papers.json and build the static leaderboard payload.

Usage:
    python3 scripts/build.py            # build data/leaderboard.js and _site/
    python3 scripts/build.py --check    # validate only, no writes
    python3 scripts/build.py --serve    # build then serve _site/ on 127.0.0.1:8765

Only Python standard library is used so the repo works on a bare machine.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SITE = ROOT / "_site"
CST = timezone(timedelta(hours=8))

BENCHMARKS = [
    {
        "key": "scannet_v2",
        "label": "ScanNet v2",
        "short": "ScanNet",
        "classes": 20,
        "split": "val",
        "note": "室内 RGB-D 重建点云，20 类，val 划分",
    },
    {
        "key": "nuscenes",
        "label": "nuScenes",
        "short": "nuScenes",
        "classes": 16,
        "split": "val",
        "note": "室外 LiDAR，16 类，val 划分",
    },
    {
        "key": "matterport3d",
        "label": "Matterport3D",
        "short": "Matterport3D",
        "classes": 21,
        "split": "test",
        "note": "室内建筑重建，21 类，test 划分",
    },
]

GROUPS = ("open_vocab", "few_label", "fully_supervised", "transfer_baseline")
SUPERVISION = ("zero_shot", "few_label", "fully_supervised")
FAMILIES = ("3d_only", "2d3d_ensemble", "self_distill", "supervised")
VENUE_TYPES = ("conference", "journal", "preprint", "workshop")
OPEN_SOURCE = ("yes", "partial", "no", "unknown")
SOURCE_KINDS = ("primary", "secondary")


class DataError(Exception):
    pass


def now_cst() -> str:
    return datetime.now(CST).strftime("%Y-%m-%d %H:%M")


def today_cst() -> str:
    return datetime.now(CST).strftime("%Y-%m-%d")


def read_json(path: Path, default=None):
    if not path.exists():
        return default
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def load_papers() -> dict:
    path = DATA / "papers.json"
    if not path.exists():
        raise DataError("data/papers.json 不存在")
    try:
        return read_json(path)
    except json.JSONDecodeError as exc:
        raise DataError(f"data/papers.json 不是合法 JSON：{exc}") from exc


def validate(payload: dict) -> list[str]:
    errors: list[str] = []
    if payload.get("schema_version") != 1:
        errors.append("schema_version 必须为 1")
    methods = payload.get("methods")
    if not isinstance(methods, list) or not methods:
        errors.append("methods 必须是非空数组")
        return errors

    seen: set[str] = set()
    for index, item in enumerate(methods):
        where = f"methods[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{where} 不是对象")
            continue
        mid = item.get("id")
        if not mid or not isinstance(mid, str):
            errors.append(f"{where}.id 缺失")
        elif mid in seen:
            errors.append(f"{where}.id 重复：{mid}")
        else:
            seen.add(mid)
            where = f"{mid}"

        if not item.get("method"):
            errors.append(f"{where}: method 缺失")
        if item.get("group") not in GROUPS:
            errors.append(f"{where}: group 非法 {item.get('group')!r}")
        if item.get("supervision") not in SUPERVISION:
            errors.append(f"{where}: supervision 非法 {item.get('supervision')!r}")

        paper = item.get("paper") or {}
        if not paper.get("title"):
            errors.append(f"{where}: paper.title 缺失")
        if not isinstance(paper.get("year"), int):
            errors.append(f"{where}: paper.year 必须是整数")
        if not paper.get("venue"):
            errors.append(f"{where}: paper.venue 缺失")
        if paper.get("venue_type") not in VENUE_TYPES:
            errors.append(f"{where}: paper.venue_type 非法 {paper.get('venue_type')!r}")
        if paper.get("open_source") not in OPEN_SOURCE:
            errors.append(f"{where}: paper.open_source 非法 {paper.get('open_source')!r}")
        code_url = paper.get("code_url")
        if paper.get("open_source") == "yes" and not (
            isinstance(code_url, str) and code_url.startswith("http")
        ):
            errors.append(f"{where}: open_source=yes 但缺少 code_url")
        for key in ("url", "code_url"):
            value = paper.get(key)
            if value is not None and not (isinstance(value, str) and value.startswith("http")):
                errors.append(f"{where}: paper.{key} 必须是 http(s) 链接")

        protocol = item.get("protocol") or {}
        if protocol.get("family") not in FAMILIES:
            errors.append(f"{where}: protocol.family 非法 {protocol.get('family')!r}")
        if not protocol.get("text_encoder"):
            errors.append(f"{where}: protocol.text_encoder 缺失")

        results = item.get("results")
        if not isinstance(results, dict) or not results:
            errors.append(f"{where}: results 必须是非空对象")
            continue
        for ds_key, result in results.items():
            if ds_key not in {b["key"] for b in BENCHMARKS}:
                errors.append(f"{where}: 未知数据集 {ds_key}")
                continue
            if not isinstance(result, dict):
                errors.append(f"{where}.{ds_key}: 结果不是对象")
                continue
            miou = result.get("miou")
            if not isinstance(miou, (int, float)) or not (0 < miou <= 100):
                errors.append(f"{where}.{ds_key}: miou 必须在 (0,100] 内")
            macc = result.get("macc")
            if macc is not None and (
                not isinstance(macc, (int, float)) or not (0 < macc <= 100)
            ):
                errors.append(f"{where}.{ds_key}: macc 必须在 (0,100] 内或为 null")
            if result.get("source_kind") not in SOURCE_KINDS:
                errors.append(f"{where}.{ds_key}: source_kind 非法")
            for key in ("source", "locator"):
                if not result.get(key):
                    errors.append(f"{where}.{ds_key}: {key} 缺失")

        if item.get("verified") is not True and item.get("verified") is not False:
            errors.append(f"{where}: verified 必须是布尔值")
    return errors


def rank_methods(methods: list[dict]) -> tuple[dict[str, dict[str, int]], dict[str, float]]:
    """Competition ranking among verified open-vocabulary rows, per dataset."""
    ranks: dict[str, dict[str, int]] = {}
    best: dict[str, float] = {}
    for bench in BENCHMARKS:
        key = bench["key"]
        rows = []
        for item in methods:
            if not item.get("verified"):
                continue
            if item.get("group") != "open_vocab":
                continue
            result = (item.get("results") or {}).get(key)
            if result and isinstance(result.get("miou"), (int, float)):
                rows.append((float(result["miou"]), item["id"]))
        rows.sort(key=lambda pair: (-pair[0], pair[1]))
        ds_ranks: dict[str, int] = {}
        previous_value = None
        previous_rank = 0
        for position, (value, mid) in enumerate(rows, start=1):
            if previous_value is not None and value == previous_value:
                ds_ranks[mid] = previous_rank
            else:
                ds_ranks[mid] = position
                previous_rank = position
                previous_value = value
        ranks[key] = ds_ranks
        if rows:
            best[key] = rows[0][0]
    return ranks, best


def build_payload(papers: dict, state: dict, candidates: list[dict]) -> dict:
    methods = papers["methods"]
    ranks, best = rank_methods(methods)

    pending = [c for c in candidates if c.get("status") == "pending"]
    pending.sort(key=lambda c: c.get("found_at") or "", reverse=True)

    group_counts = {group: 0 for group in GROUPS}
    for item in methods:
        group_counts[item["group"]] = group_counts.get(item["group"], 0) + 1

    last_checked = state.get("last_check") or state.get("last_success") or papers.get("updated_at")
    next_check = state.get("next_check")
    last_error = state.get("last_error")

    return {
        "schema_version": 1,
        "generated_at": now_cst(),
        "data_updated_at": papers.get("updated_at"),
        "last_checked": last_checked,
        "next_check": next_check,
        "last_error": last_error,
        "benchmarks": BENCHMARKS,
        "methods": methods,
        "ranks": ranks,
        "best": best,
        "counts": {
            "papers": len(methods),
            "unique_papers": len({(m.get("paper") or {}).get("title", "") for m in methods}),
            "results": sum(len(item.get("results") or {}) for item in methods),
            "pending": len(pending),
            **group_counts,
        },
        "pending": [
            {
                "id": c.get("id"),
                "title": c.get("title"),
                "arxiv_id": c.get("arxiv_id"),
                "url": c.get("url"),
                "found_at": c.get("found_at"),
                "keywords": c.get("matched_keywords") or [],
                "venue_hint": c.get("venue_hint") or "",
            }
            for c in pending[:40]
        ],
        "changelog": (read_json(DATA / "changelog.json", []) or [])[:8],
    }


def write_outputs(payload: dict) -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    js = (
        "/* 本文件由 scripts/build.py 生成，请勿手工编辑。 */\n"
        "window.OV3D_DATA = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n"
    )
    (DATA / "leaderboard.js").write_text(js, encoding="utf-8")

    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir(parents=True)
    shutil.copy2(ROOT / "index.html", SITE / "index.html")
    ignore = shutil.ignore_patterns("._*", ".DS_Store", "__pycache__", "*.pyc")
    shutil.copytree(ROOT / "assets", SITE / "assets", ignore=ignore)
    (SITE / "data").mkdir()
    (SITE / "data" / "leaderboard.js").write_text(js, encoding="utf-8")
    for name in ("robots.txt", "sitemap.xml", ".nojekyll"):
        source = ROOT / name
        if source.exists():
            shutil.copy2(source, SITE / name)
    # exFAT 会在写入时生成 AppleDouble 文件，部署前清掉。
    for path in SITE.rglob("._*"):
        try:
            path.unlink()
        except OSError:
            pass
    for path in SITE.rglob(".DS_Store"):
        try:
            path.unlink()
        except OSError:
            pass


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="校验并构建开放词汇点云语义分割榜单")
    parser.add_argument("--check", action="store_true", help="只校验，不写文件")
    parser.add_argument("--serve", action="store_true", help="构建后启动本地服务器")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args(argv)

    try:
        papers = load_papers()
    except DataError as exc:
        print(f"[build] 失败：{exc}", file=sys.stderr)
        return 1

    errors = validate(papers)
    if errors:
        print(f"[build] 校验失败，共 {len(errors)} 个问题：", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    state = read_json(DATA / "state.json", {}) or {}
    candidates = read_json(DATA / "candidates.json", []) or []
    payload = build_payload(papers, state, candidates)

    if args.check:
        print(
            f"[build] 校验通过：{len(papers['methods'])} 条记录，"
            f"{payload['counts']['results']} 个结果，待审 {payload['counts']['pending']} 条"
        )
        return 0

    write_outputs(payload)
    print(
        f"[build] 已生成 data/leaderboard.js 与 _site/："
        f"{len(papers['methods'])} 条记录，待审 {payload['counts']['pending']} 条"
    )

    if args.serve:
        import http.server
        import socketserver

        handler = lambda *a, **kw: http.server.SimpleHTTPRequestHandler(  # noqa: E731
            *a, directory=str(SITE), **kw
        )
        with socketserver.TCPServer(("127.0.0.1", args.port), handler) as httpd:
            print(f"[build] 预览：http://127.0.0.1:{args.port}/  (Ctrl+C 退出)")
            httpd.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
