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
TRACKS = ("ov", "multi_view")
STAGES_3D = ("3d_distill", "self_distill", "2d3d_ensemble", "few_label")
INSTANCE_SETTINGS = ("zero_shot", "open_vocab")


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

        tracks = item.get("tracks", ["ov"])
        if not isinstance(tracks, list) or not tracks or any(t not in TRACKS for t in tracks):
            errors.append(f"{where}: tracks 必须是 {TRACKS} 的非空子集")
        elif "multi_view" in tracks:
            mv = item.get("mv") or {}
            for key in ("teacher_2d", "correspondence", "fusion", "student_3d"):
                if not mv.get(key):
                    errors.append(f"{where}: mv.{key} 缺失")
            if mv.get("stage_3d") not in STAGES_3D:
                errors.append(f"{where}: mv.stage_3d 非法 {mv.get('stage_3d')!r}")

        if item.get("verified") is not True and item.get("verified") is not False:
            errors.append(f"{where}: verified 必须是布尔值")
    return errors


def rank_methods(
    methods: list[dict], track: str | None = None
) -> tuple[dict[str, dict[str, int]], dict[str, float]]:
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
            if track and track not in (item.get("tracks") or ["ov"]):
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


def load_instance() -> dict:
    path = DATA / "instance.json"
    if not path.exists():
        return {"schema_version": 1, "datasets": [], "methods": []}
    try:
        return read_json(path)
    except json.JSONDecodeError as exc:
        raise DataError(f"data/instance.json 不是合法 JSON：{exc}") from exc


def validate_instance(payload: dict) -> list[str]:
    errors: list[str] = []
    if payload.get("schema_version") != 1:
        errors.append("instance: schema_version 必须为 1")
    datasets = payload.get("datasets")
    if not isinstance(datasets, list) or not datasets:
        errors.append("instance: datasets 必须是非空数组")
        return errors
    ds_keys = set()
    for index, ds in enumerate(datasets):
        key = ds.get("key") if isinstance(ds, dict) else None
        if not key:
            errors.append(f"instance.datasets[{index}].key 缺失")
        elif key in ds_keys:
            errors.append(f"instance: 数据集重复 {key}")
        else:
            ds_keys.add(key)
        if not ds.get("label"):
            errors.append(f"instance.datasets[{index}].label 缺失")

    methods = payload.get("methods")
    if not isinstance(methods, list) or not methods:
        errors.append("instance.methods 必须是非空数组")
        return errors

    seen = set()
    for index, item in enumerate(methods):
        where = f"instance.methods[{index}]"
        mid = item.get("id") if isinstance(item, dict) else None
        if not mid:
            errors.append(f"{where}.id 缺失")
            continue
        if mid in seen:
            errors.append(f"instance: id 重复 {mid}")
            continue
        seen.add(mid)
        where = f"instance.{mid}"
        if item.get("task") != "instance":
            errors.append(f"{where}: task 必须是 instance")
        if item.get("setting") not in INSTANCE_SETTINGS:
            errors.append(f"{where}: setting 非法 {item.get('setting')!r}")
        if not isinstance(item.get("online"), bool):
            errors.append(f"{where}: online 必须是布尔值")
        paper = item.get("paper") or {}
        for key in ("title", "venue"):
            if not paper.get(key):
                errors.append(f"{where}: paper.{key} 缺失")
        if not isinstance(paper.get("year"), int):
            errors.append(f"{where}: paper.year 必须是整数")
        if paper.get("venue_type") not in VENUE_TYPES:
            errors.append(f"{where}: paper.venue_type 非法")
        if paper.get("open_source") not in OPEN_SOURCE:
            errors.append(f"{where}: paper.open_source 非法")
        if paper.get("open_source") == "yes" and not str(paper.get("code_url") or "").startswith("http"):
            errors.append(f"{where}: open_source=yes 但缺少 code_url")
        if not str(paper.get("url") or "").startswith("http"):
            errors.append(f"{where}: paper.url 缺失")
        pipeline = item.get("pipeline") or {}
        for key in ("mask_2d", "correspondence", "fusion", "proposal_3d"):
            if not pipeline.get(key):
                errors.append(f"{where}: pipeline.{key} 缺失")
        results = item.get("results")
        if not isinstance(results, dict) or not results:
            errors.append(f"{where}: results 必须是非空对象")
            continue
        for ds_key, result in results.items():
            if ds_key not in ds_keys:
                errors.append(f"{where}: 未知实例数据集 {ds_key}")
                continue
            ap = result.get("ap")
            if not isinstance(ap, (int, float)) or not (0 < ap <= 100):
                errors.append(f"{where}.{ds_key}: ap 必须在 (0,100] 内")
            for key in ("ap50", "ap25"):
                value = result.get(key)
                if value is not None and (not isinstance(value, (int, float)) or not (0 < value <= 100)):
                    errors.append(f"{where}.{ds_key}: {key} 必须在 (0,100] 内或为 null")
            if result.get("source_kind") not in SOURCE_KINDS:
                errors.append(f"{where}.{ds_key}: source_kind 非法")
            for key in ("source", "locator"):
                if not result.get(key):
                    errors.append(f"{where}.{ds_key}: {key} 缺失")
        if not isinstance(item.get("verified"), bool):
            errors.append(f"{where}: verified 必须是布尔值")
    return errors


def rank_instance(instance: dict) -> tuple[dict[str, dict[str, int]], dict[str, float]]:
    ranks: dict[str, dict[str, int]] = {}
    best: dict[str, float] = {}
    datasets = instance.get("datasets") or []
    methods = instance.get("methods") or []
    for ds in datasets:
        key = ds["key"]
        rows = []
        for item in methods:
            if not item.get("verified"):
                continue
            result = (item.get("results") or {}).get(key)
            if result and isinstance(result.get("ap"), (int, float)):
                rows.append((float(result["ap"]), item["id"]))
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
    mv_ranks, mv_best = rank_methods(methods, "multi_view")
    mv_methods = [m for m in methods if "multi_view" in (m.get("tracks") or ["ov"])]
    instance = load_instance()
    instance_errors = validate_instance(instance)
    if instance_errors:
        raise DataError("data/instance.json 校验失败：\n  - " + "\n  - ".join(instance_errors))
    inst_ranks, inst_best = rank_instance(instance)

    pending = [c for c in candidates if c.get("status") == "pending"]
    pending.sort(key=lambda c: c.get("found_at") or "", reverse=True)
    mv_pending = [c for c in pending if "multi_view" in (c.get("tracks") or ["ov"])]

    group_counts = {group: 0 for group in GROUPS}
    for item in methods:
        group_counts[item["group"]] = group_counts.get(item["group"], 0) + 1

    last_checked = state.get("last_check") or state.get("last_success") or papers.get("updated_at")
    data_updated = max(
        [value for value in (papers.get("updated_at"), instance.get("updated_at")) if value] or [""]
    )
    next_check = state.get("next_check")
    last_error = state.get("last_error")

    return {
        "schema_version": 1,
        "generated_at": now_cst(),
        "data_updated_at": data_updated,
        "last_checked": last_checked,
        "next_check": next_check,
        "last_error": last_error,
        "benchmarks": BENCHMARKS,
        "methods": methods,
        "ranks": ranks,
        "best": best,
        "multi_view": {
            "methods": mv_methods,
            "ranks": mv_ranks,
            "best": mv_best,
            "counts": {"methods": len(mv_methods), "pending": len(mv_pending)},
        },
        "instance": {
            "datasets": instance.get("datasets") or [],
            "methods": instance.get("methods") or [],
            "ranks": inst_ranks,
            "best": inst_best,
            "counts": {
                "methods": len(instance.get("methods") or []),
                "results": sum(len(m.get("results") or {}) for m in instance.get("methods") or []),
            },
        },
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
                "tracks": c.get("tracks") or ["ov"],
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
    for page in ("index.html", "multiview.html"):
        shutil.copy2(ROOT / page, SITE / page)
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
    instance = load_instance()
    instance_errors = validate_instance(instance)
    if instance_errors:
        print("[build] 实例数据校验失败：", file=sys.stderr)
        for error in instance_errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    try:
        payload = build_payload(papers, state, candidates)
    except DataError as exc:
        print(f"[build] 失败：{exc}", file=sys.stderr)
        return 1

    if args.check:
        print(
            f"[build] 校验通过：{len(papers['methods'])} 条语义记录，"
            f"{len(instance.get('methods') or [])} 条实例记录，"
            f"{payload['counts']['results']} 个语义结果，"
            f"待审 {payload['counts']['pending']} 条"
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
