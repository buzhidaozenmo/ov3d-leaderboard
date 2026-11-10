#!/usr/bin/env python3
"""Unit tests for the leaderboard build pipeline (stdlib only).

Run: python3 scripts/test_build.py
"""

from __future__ import annotations

import copy
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import build  # noqa: E402


def method(mid: str, miou: float, group: str = "open_vocab", **kwargs) -> dict:
    item = {
        "id": mid,
        "method": mid,
        "group": group,
        "supervision": "zero_shot" if group == "open_vocab" else "fully_supervised",
        "paper": {
            "title": f"Paper {mid}",
            "authors": ["A. Author"],
            "year": 2025,
            "venue": "CVPR 2025",
            "venue_type": "conference",
            "url": "https://example.org/paper",
            "code_url": "https://github.com/example/repo",
            "open_source": "yes",
        },
        "protocol": {"family": "3d_only", "text_encoder": "LSeg", "notes": ""},
        "results": {
            "scannet_v2": {
                "miou": miou,
                "macc": 70.0,
                "source": "Tab.1",
                "source_kind": "primary",
                "locator": "p.1",
            }
        },
        "verified": True,
        "verified_at": "2026-11-09",
        "added_at": "2026-11-09",
        "tags": [],
    }
    item.update(kwargs)
    return item


def payload(methods: list[dict]) -> dict:
    return {
        "schema_version": 1,
        "updated_at": "2026-11-09",
        "methods": methods,
    }


class ValidateTests(unittest.TestCase):
    def test_valid_payload(self):
        self.assertEqual(build.validate(payload([method("a", 50.0)])), [])

    def test_duplicate_id(self):
        errors = build.validate(payload([method("a", 50.0), method("a", 40.0)]))
        self.assertTrue(any("重复" in e for e in errors))

    def test_bad_miou(self):
        item = method("a", 50.0)
        item["results"]["scannet_v2"]["miou"] = 0
        self.assertTrue(any("miou" in e for e in build.validate(payload([item]))))
        item["results"]["scannet_v2"]["miou"] = 100.1
        self.assertTrue(any("miou" in e for e in build.validate(payload([item]))))

    def test_open_source_needs_code(self):
        item = method("a", 50.0)
        item["paper"]["code_url"] = None
        errors = build.validate(payload([item]))
        self.assertTrue(any("code_url" in e for e in errors))

    def test_missing_source(self):
        item = method("a", 50.0)
        del item["results"]["scannet_v2"]["source"]
        self.assertTrue(any("source" in e for e in build.validate(payload([item]))))

    def test_unknown_dataset(self):
        item = method("a", 50.0)
        item["results"]["s3dis"] = dict(item["results"]["scannet_v2"])
        self.assertTrue(any("未知数据集" in e for e in build.validate(payload([item]))))


class MultiViewTests(unittest.TestCase):
    def test_multi_view_requires_metadata(self):
        item = method("mv", 60.0)
        item["tracks"] = ["ov", "multi_view"]
        errors = build.validate(payload([item]))
        self.assertTrue(any("mv.teacher_2d" in e for e in errors))

    def test_multi_view_valid(self):
        item = method("mv", 60.0)
        item["tracks"] = ["ov", "multi_view"]
        item["mv"] = {
            "teacher_2d": "LSeg", "correspondence": "投影", "fusion": "均值",
            "stage_3d": "2d3d_ensemble", "student_3d": "3D student",
        }
        self.assertEqual(build.validate(payload([item])), [])

    def test_mv_ranking_excludes_general_rows(self):
        general = method("a", 70.0)
        multi = method("b", 50.0)
        multi["tracks"] = ["ov", "multi_view"]
        multi["mv"] = {
            "teacher_2d": "LSeg", "correspondence": "投影", "fusion": "均值",
            "stage_3d": "3d_distill", "student_3d": "3D student",
        }
        ranks, best = build.rank_methods([general, multi], "multi_view")
        self.assertEqual(ranks["scannet_v2"], {"b": 1})
        self.assertEqual(best["scannet_v2"], 50.0)

    def test_payload_multi_view_counts(self):
        multi = method("b", 50.0)
        multi["tracks"] = ["ov", "multi_view"]
        multi["mv"] = {
            "teacher_2d": "LSeg", "correspondence": "投影", "fusion": "均值",
            "stage_3d": "3d_distill", "student_3d": "3D student",
        }
        out = build.build_payload(payload([multi, method("a", 70.0)]), {}, [])
        self.assertEqual(out["multi_view"]["counts"]["methods"], 1)
        self.assertEqual(out["multi_view"]["ranks"]["scannet_v2"], {"b": 1})


class RankingTests(unittest.TestCase):
    def test_descending_and_competition_rank(self):
        methods = [method("a", 60.0), method("b", 70.0), method("c", 60.0), method("d", 40.0)]
        ranks, best = build.rank_methods(methods)
        self.assertEqual(best["scannet_v2"], 70.0)
        self.assertEqual(ranks["scannet_v2"], {"b": 1, "a": 2, "c": 2, "d": 4})

    def test_reference_groups_are_not_ranked(self):
        methods = [method("a", 60.0), method("fs", 90.0, group="fully_supervised")]
        ranks, best = build.rank_methods(methods)
        self.assertNotIn("fs", ranks["scannet_v2"])
        self.assertEqual(best["scannet_v2"], 60.0)

    def test_unverified_excluded(self):
        methods = [method("a", 60.0), method("b", 90.0, verified=False)]
        ranks, best = build.rank_methods(methods)
        self.assertNotIn("b", ranks["scannet_v2"])
        self.assertEqual(best["scannet_v2"], 60.0)

    def test_missing_dataset(self):
        item = method("a", 60.0)
        del item["results"]["scannet_v2"]
        item["results"]["nuscenes"] = {
            "miou": 40.0,
            "macc": None,
            "source": "Tab.1",
            "source_kind": "primary",
            "locator": "p.1",
        }
        ranks, best = build.rank_methods([item])
        self.assertEqual(ranks["scannet_v2"], {})
        self.assertEqual(ranks["nuscenes"], {"a": 1})
        self.assertNotIn("scannet_v2", best)


class PayloadTests(unittest.TestCase):
    def test_counts_and_pending(self):
        papers = payload([method("a", 60.0), method("b", 50.0, group="fully_supervised")])
        candidates = [
            {"id": "x", "status": "pending", "title": "X", "found_at": "2026-11-09"},
            {"id": "y", "status": "ignored", "title": "Y", "found_at": "2026-11-08"},
        ]
        out = build.build_payload(papers, {"last_check": "2026-11-09 09:00"}, candidates)
        self.assertEqual(out["counts"]["papers"], 2)
        self.assertEqual(out["counts"]["open_vocab"], 1)
        self.assertEqual(out["counts"]["pending"], 1)
        self.assertEqual(out["pending"][0]["id"], "x")
        self.assertEqual(out["last_checked"], "2026-11-09 09:00")

    def test_deep_copy_not_mutated(self):
        papers = payload([method("a", 60.0)])
        before = copy.deepcopy(papers)
        build.build_payload(papers, {}, [])
        self.assertEqual(papers, before)


class OutputTests(unittest.TestCase):
    def test_generated_js_is_parseable(self):
        data = build.build_payload(payload([method("a", 60.0)]), {}, [])
        js = (
            "/* generated */\nwindow.OV3D_DATA = "
            + json.dumps(data, ensure_ascii=False, indent=2)
            + ";\n"
        )
        self.assertTrue(js.startswith("/* generated */"))
        body = js.split("window.OV3D_DATA = ", 1)[1].rstrip().rstrip(";")
        parsed = json.loads(body)
        self.assertEqual(parsed["counts"]["papers"], 1)
        self.assertEqual(parsed["ranks"]["scannet_v2"], {"a": 1})


if __name__ == "__main__":
    unittest.main(verbosity=2)
