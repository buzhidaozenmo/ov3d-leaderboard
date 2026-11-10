# 开放词汇点云语义分割榜单

**在线地址：<https://buzhidaozenmo.github.io/ov3d-leaderboard/>**

- [开放词汇总榜](https://buzhidaozenmo.github.io/ov3d-leaderboard/)：所有开放词汇 3D 语义分割方法
- [多视角 2D→3D 子榜](https://buzhidaozenmo.github.io/ov3d-leaderboard/multiview.html)：只收「多视角 2D 对应 → 融合 → 投影到 3D」这条管线的方法

[![Build and deploy](https://github.com/buzhidaozenmo/ov3d-leaderboard/actions/workflows/pages.yml/badge.svg)](https://github.com/buzhidaozenmo/ov3d-leaderboard/actions/workflows/pages.yml)
[![Daily harvest](https://github.com/buzhidaozenmo/ov3d-leaderboard/actions/workflows/daily.yml/badge.svg)](https://github.com/buzhidaozenmo/ov3d-leaderboard/actions/workflows/daily.yml)

在 **ScanNet v2 / nuScenes / Matterport3D** 三个数据集上，汇总**开放词汇（open-vocabulary / zero-shot）3D 语义分割**的 mIoU。每条记录写明：

- 发表年份与会议/期刊（未正式发表标 `arXiv 预印本`）
- 论文全名、作者与链接
- 是否开源（官方代码链接；未确认与明确不开源分开标注）
- mIoU / mAcc，以及**表号/页码**级别的出处
- 评测口径：文本编码器、是否 2D-3D 集成、是否自蒸馏、类别数与划分

界面为瑞士国际主义（Swiss Style）风格：12 栏网格、Helvetica Neue、黑白 + 瑞士红、细线分隔、无圆角无阴影。

## 两个页面

| 页面 | 收录 | 额外列 |
| --- | --- | --- |
| `index.html` 总榜 | 所有开放词汇/少量标签/全监督参考方法 | 口径、矩阵视图 |
| `multiview.html` 多视角子榜 | 语义：多视角 2D 特征 → 像素-点对应 → 融合 → 3D 蒸馏/集成；实例：多视角 2D mask → 视图一致性/跟踪 → 3D 实例 | 2D 教师/掩码、对应/融合、3D 阶段；实例为 AP/AP50/AP25、设定、3D 提案 |

多视角子榜包含两个任务：

- **语义分割（mIoU）**：ScanNet v2 / nuScenes / Matterport3D；严格收多视角 2D 投影融合方法。
- **实例分割（AP）**：ScanNet200 / ScanNet++ / Replica / ScanNet v2 / Matterport3D；收零样本/开放词汇、从多视角 2D mask 提升到 3D 实例的方法（SAM2Object、SAI3D、SAMPro3D、OpenTrack3D、EmbodiedSAM 等）。

排除 PLA、RegionPLC、CLIP2Scene、CLIP-FO3D、Diff2Scene、PGOV3D、GeoZe、DMA、OV3D 与纯 3D/全监督实例方法；排除理由写在页面「收录与排除」。

## 排名规则

1. **只对开放词汇方法排名**：`group=open_vocab`、`verified=true`、当前数据集有数值，按 mIoU 降序；并列同名次；缺值显示「—」且不参与排名。
2. **参考组不占名次**：全监督、少量标签（如 GeoPurify 的 ~1.5% 标签设定）、迁移基线（MSeg Voting）在同表下方以横线分隔，并标注「参考」。
3. **变体拆行**：同一方法的 LSeg / OpenSeg、2D-3D ensemble / 3D distill、stage1 / stage2 分别成行，不取平均、不互相替代。可用「严格口径（3D-only）」筛选。
4. **数字来源优先一手论文**：原论文未报告时才转引他文对照表，界面显示「转引」。
5. **跨论文数字并非严格可比**：文本编码器、训练预算、教师模型不同。页面常驻说明，请结合口径阅读。

> 本榜单只收**论文报告值**，不做本地复现；本地实验数值不进入排名。

## 每日更新

```
09:00 (Asia/Shanghai)  GitHub Actions
  arXiv / Semantic Scholar 抓取
        ↓
  data/candidates.json（待审队列，不入榜）
        ↓
  build.py → data/leaderboard.js → GitHub Pages 自动部署
        ↓
  有新候选时，开/更新一条 GitHub Issue「待核实候选」
        ↓
维护者（或 DSH 会话每日 10:00）
  按 docs/数据核实规范.md 核对论文表格
        ↓
  data/papers.json → build.py --check → commit/push → Pages 自动重新部署
```

- **发现自动、入榜人工**：自动抽取数字不可靠，所以 Actions 只负责发现与部署；数字必须核对原文后写入。
- 抓取失败不会破坏已有数据：`papers.json` 只在人工核实后变化，`state.json` 会记录最近错误并显示在页面页脚。
- 待审队列可在本地查看：

```bash
python3 scripts/review_queue.py
```

## 本地使用

只需要 Python 3.11+，无第三方依赖。

```bash
# 校验数据并生成 _site/
python3 scripts/build.py

# 直接双击打开（数据已内嵌，file:// 可用）
open _site/index.html

# 或起本地服务器
python3 scripts/serve.py          # http://127.0.0.1:8765/
```

只校验不写文件：

```bash
python3 scripts/build.py --check
python3 scripts/test_build.py
```

## 手动添加一篇论文

1. 按 [`docs/数据核实规范.md`](docs/数据核实规范.md) 核对论文表格，拿到 mIoU、表号与页面。
2. 在 `data/papers.json` 的 `methods` 数组里新增一条：

```jsonc
{
  "id": "method-2026-variant",
  "method": "MethodName (variant)",
  "group": "open_vocab",              // open_vocab | few_label | fully_supervised | transfer_baseline
  "supervision": "zero_shot",         // zero_shot | few_label | fully_supervised
  "paper": {
    "title": "Paper title",
    "authors": ["A. Author"],
    "year": 2026, "venue": "CVPR 2026", "venue_type": "conference",
    "arxiv_id": "2601.00000", "doi": null,
    "url": "https://...", "code_url": "https://github.com/...",
    "open_source": "yes"              // yes | partial | no | unknown
  },
  "protocol": {
    "family": "3d_only",              // 3d_only | 2d3d_ensemble | self_distill | supervised
    "text_encoder": "LSeg",
    "notes": "口径补充说明"
  },
  "results": {
    "scannet_v2": {
      "miou": 60.0, "macc": 70.0,
      "source": "Paper, CVPR 2026, Tab.2",
      "source_kind": "primary",       // primary | secondary
      "locator": "Table 2, p.5"
    }
  },
  "verified": true,
  "verified_at": "2026-11-10",
  "added_at": "2026-11-10",
  "tags": []
}
```

3. 校验、重建、提交：

```bash
python3 scripts/build.py --check
python3 scripts/build.py
git add data && git commit -m "data: add MethodName" && git push
```

`open_source=yes` 必须带 `code_url`；每条结果必须有 `source` 与 `locator`，否则构建失败。

## 目录

| 路径 | 用途 |
| --- | --- |
| `index.html` | 页面结构（源文件，构建时复制到 `_site/`） |
| `assets/` | Swiss Style 样式、渲染逻辑、favicon |
| `data/papers.json` | 语义榜唯一真源：已核实的论文与数值 |
| `data/instance.json` | 实例榜唯一真源：AP/AP50/AP25、设定与 2D→3D 管线 |
| `data/candidates.json` | Actions 抓取的待审队列 |
| `data/leaderboard.js` | 构建产物，页面读取 |
| `data/state.json` | 最近抓取/成功/失败时间 |
| `data/changelog.json` | 人工维护的更新记录（页面展示最近 5 条） |
| `scripts/build.py` | 校验、排名、生成 `_site/` |
| `scripts/harvest.py` | 每日 arXiv / Semantic Scholar 抓取与筛选 |
| `scripts/review_queue.py` | 终端查看待审队列 |
| `scripts/serve.py` | 本地预览服务器 |
| `scripts/test_build.py` | 单元测试（stdlib unittest） |
| `.github/workflows/pages.yml` | push 后校验、构建、部署 Pages |
| `.github/workflows/daily.yml` | 每日抓取、重建、提交、部署、Issue 提醒 |
| `docs/数据核实规范.md` | 收录标准与出处记录规范 |

## 网络排障（仅本地开发）

如果本机访问 `github.com` 超时、但 `api.github.com` 正常（部分网络会这样），GitHub Actions 不受影响，
本地 `git pull/push` 可以走仓库自带的本地代理：

```bash
bash scripts/local_git.sh pull --rebase
bash scripts/local_git.sh push
```

该脚本会按需启动 `scripts/github_proxy.py`（把 `github.com` 的 CONNECT 请求转发到可用的 GitHub IP）。
只在本地开发时使用，部署与抓取都在 GitHub Actions 中完成。

## 免责声明

- 论文与代码版权归原作者；本仓库只做研究索引。
- 数值均为论文报告值，未在本地复测；引用请以原论文为准。
- 如发现数字或出处错误，欢迎开 Issue 或直接 PR 修改 `data/papers.json`。

## 相关项目

- [Open-Vocabulary Segmentation Atlas](https://buzhidaozenmo.github.io/Open-Vocabulary-Segmentation-Atlas/)：同一维护者的开放词汇分割研究地图（方法路线、论文笔记、数据集协议）。

## License

代码以 MIT 发布；`data/` 中的论文元数据与数值仅用于学术索引，引用请遵循原论文许可。
