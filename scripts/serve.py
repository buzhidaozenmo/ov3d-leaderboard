#!/usr/bin/env python3
"""Serve the built site locally with caching disabled.

Usage: python3 scripts/serve.py [--port 8765]
"""

from __future__ import annotations

import argparse
import http.server
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "_site"


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter logs
        if "404" in (fmt % args):
            super().log_message(fmt, *args)


def main() -> int:
    parser = argparse.ArgumentParser(description="本地预览榜单")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8765")))
    args = parser.parse_args()
    if not (SITE / "index.html").exists():
        print("_site/ 不存在，先运行：python3 scripts/build.py")
        return 1
    with http.server.ThreadingHTTPServer(("127.0.0.1", args.port), NoCacheHandler) as httpd:
        print(f"预览：http://127.0.0.1:{args.port}/  (Ctrl+C 退出)")
        httpd.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
