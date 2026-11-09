#!/usr/bin/env python3
"""Print the pending review queue in a compact, copy-friendly form."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    parser = argparse.ArgumentParser(description="查看待审候选论文")
    parser.add_argument("--json", action="store_true", help="输出 JSON")
    parser.add_argument("--limit", type=int, default=0, help="最多显示多少条（0 表示全部）")
    args = parser.parse_args()

    path = ROOT / "data" / "candidates.json"
    if not path.exists():
        print("data/candidates.json 不存在，先运行 scripts/harvest.py")
        return 1
    candidates = json.loads(path.read_text(encoding="utf-8"))
    pending = [c for c in candidates if c.get("status", "pending") == "pending"]
    pending.sort(key=lambda c: c.get("published") or c.get("found_at") or "", reverse=True)
    if args.limit:
        pending = pending[: args.limit]

    if args.json:
        print(json.dumps(pending, ensure_ascii=False, indent=2))
        return 0

    print(f"待审 {len(pending)} 条\n")
    for index, item in enumerate(pending, start=1):
        venue = item.get("venue_hint") or "venue 未定"
        keywords = " / ".join(item.get("matched_keywords") or [])
        print(f"{index:>3}. [{item.get('published', '?')}] {item.get('title', '')}")
        print(f"     {venue} · {item.get('url', '')}")
        if keywords:
            print(f"     命中：{keywords}")
        print()
    if pending:
        print("核实后写入 data/papers.json，再运行：python3 scripts/build.py --check")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
