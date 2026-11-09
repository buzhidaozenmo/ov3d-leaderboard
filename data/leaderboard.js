/* 本文件由 scripts/build.py 生成，请勿手工编辑。 */
window.OV3D_DATA = {
  "schema_version": 1,
  "generated_at": "2026-11-09 18:01",
  "data_updated_at": "2026-11-09",
  "last_checked": "2026-11-09 18:01",
  "next_check": "2026-11-10 09:00",
  "last_error": null,
  "benchmarks": [
    {
      "key": "scannet_v2",
      "label": "ScanNet v2",
      "short": "ScanNet",
      "classes": 20,
      "split": "val",
      "note": "室内 RGB-D 重建点云，20 类，val 划分"
    },
    {
      "key": "nuscenes",
      "label": "nuScenes",
      "short": "nuScenes",
      "classes": 16,
      "split": "val",
      "note": "室外 LiDAR，16 类，val 划分"
    },
    {
      "key": "matterport3d",
      "label": "Matterport3D",
      "short": "Matterport3D",
      "classes": 21,
      "split": "test",
      "note": "室内建筑重建，21 类，test 划分"
    }
  ],
  "methods": [
    {
      "id": "geoguide",
      "method": "GeoGuide",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "GeoGuide: Hierarchical Geometric Guidance for Open-Vocabulary 3D Semantic Segmentation",
        "authors": [
          "Tao et al."
        ],
        "year": 2026,
        "venue": "CVPR 2026",
        "venue_type": "conference",
        "arxiv_id": "2603.26260",
        "doi": null,
        "url": "https://openaccess.thecvf.com/content/CVPR2026/papers/Tao_GeoGuide_Hierarchical_Geometric_Guidance_for_Open-Vocabulary_3D_Semantic_Segmentation_CVPR_2026_paper.pdf",
        "code_url": null,
        "open_source": "unknown"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "LSeg+SEEM（SAS* 特征）",
        "notes": "纯 3D 推理；按论文声明不使用耗时自蒸馏，使用与 SAS 相同的 2D 特征"
      },
      "results": {
        "scannet_v2": {
          "miou": 64.8,
          "macc": 77.3,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "primary",
          "locator": "Table 1, p.6"
        },
        "nuscenes": {
          "miou": 50.3,
          "macc": 74.2,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "primary",
          "locator": "Table 1, p.6"
        },
        "matterport3d": {
          "miou": 51.9,
          "macc": 66.3,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "primary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "sas-stage2",
      "method": "SAS (stage2)",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "SAS: Segment Any 3D Scene with Integrated 2D Priors",
        "authors": [
          "Zhuoyuan Li",
          "Jiahao Lu",
          "Jiacheng Deng",
          "Hanzhi Chang",
          "Lifan Wu",
          "Yanzhe Liang",
          "Tianzhu Zhang"
        ],
        "year": 2025,
        "venue": "ICCV 2025",
        "venue_type": "conference",
        "arxiv_id": "2503.08512",
        "doi": null,
        "url": "https://openaccess.thecvf.com/content/ICCV2025/html/Li_SAS_Segment_Any_3D_Scene_with_Integrated_2D_Priors_ICCV_2025_paper.html",
        "code_url": "https://github.com/peoplelu/SAS",
        "open_source": "yes"
      },
      "protocol": {
        "family": "self_distill",
        "text_encoder": "LSeg+SEEM",
        "notes": "两阶段训练；stage2 为最终模型。数值转引自 GeoGuide 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 61.9,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "nuscenes": {
          "miou": 47.5,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "matterport3d": {
          "miou": 48.6,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": [
        "stage2"
      ]
    },
    {
      "id": "sas-stage1",
      "method": "SAS (stage1)",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "SAS: Segment Any 3D Scene with Integrated 2D Priors",
        "authors": [
          "Zhuoyuan Li",
          "Jiahao Lu",
          "Jiacheng Deng",
          "Hanzhi Chang",
          "Lifan Wu",
          "Yanzhe Liang",
          "Tianzhu Zhang"
        ],
        "year": 2025,
        "venue": "ICCV 2025",
        "venue_type": "conference",
        "arxiv_id": "2503.08512",
        "doi": null,
        "url": "https://openaccess.thecvf.com/content/ICCV2025/html/Li_SAS_Segment_Any_3D_Scene_with_Integrated_2D_Priors_ICCV_2025_paper.html",
        "code_url": "https://github.com/peoplelu/SAS",
        "open_source": "yes"
      },
      "protocol": {
        "family": "self_distill",
        "text_encoder": "LSeg+SEEM",
        "notes": "第一阶段模型；数值转引自 GeoGuide 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 59.2,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "nuscenes": {
          "miou": 45.4,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "matterport3d": {
          "miou": 46.3,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": [
        "stage1"
      ]
    },
    {
      "id": "openscene-ls-ensemble",
      "method": "OpenScene (LS, 2D-3D Ens.)",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "OpenScene: 3D Scene Understanding with Open Vocabularies",
        "authors": [
          "Songyou Peng",
          "Kyle Genova",
          "Chiyu Jiang",
          "Andrea Tagliasacchi",
          "Marc Pollefeys",
          "Thomas Funkhouser"
        ],
        "year": 2023,
        "venue": "CVPR 2023",
        "venue_type": "conference",
        "arxiv_id": "2211.15654",
        "doi": null,
        "url": "https://openaccess.thecvf.com/content/CVPR2023/html/Peng_OpenScene_3D_Scene_Understanding_With_Open_Vocabularies_CVPR_2023_paper.html",
        "code_url": "https://github.com/pengsongyou/openscene",
        "open_source": "yes"
      },
      "protocol": {
        "family": "2d3d_ensemble",
        "text_encoder": "LSeg",
        "notes": "2D-3D 集成推理，OpenScene Table 5 / Table 7 的 Ensemble 行"
      },
      "results": {
        "scannet_v2": {
          "miou": 54.2,
          "macc": 66.6,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "primary",
          "locator": "Table 5, p.6"
        },
        "nuscenes": {
          "miou": 36.7,
          "macc": 42.7,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "primary",
          "locator": "Table 5, p.6"
        },
        "matterport3d": {
          "miou": 43.4,
          "macc": 53.5,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "primary",
          "locator": "Table 5, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "openscene-os-ensemble",
      "method": "OpenScene (OS, 2D-3D Ens.)",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "OpenScene: 3D Scene Understanding with Open Vocabularies",
        "authors": [
          "Songyou Peng",
          "Kyle Genova",
          "Chiyu Jiang",
          "Andrea Tagliasacchi",
          "Marc Pollefeys",
          "Thomas Funkhouser"
        ],
        "year": 2023,
        "venue": "CVPR 2023",
        "venue_type": "conference",
        "arxiv_id": "2211.15654",
        "doi": null,
        "url": "https://openaccess.thecvf.com/content/CVPR2023/html/Peng_OpenScene_3D_Scene_Understanding_With_Open_Vocabularies_CVPR_2023_paper.html",
        "code_url": "https://github.com/pengsongyou/openscene",
        "open_source": "yes"
      },
      "protocol": {
        "family": "2d3d_ensemble",
        "text_encoder": "OpenSeg",
        "notes": "2D-3D 集成推理，OpenScene Table 5 / Table 7 的 Ensemble 行"
      },
      "results": {
        "scannet_v2": {
          "miou": 47.5,
          "macc": 70.7,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "primary",
          "locator": "Table 5, p.6"
        },
        "nuscenes": {
          "miou": 42.1,
          "macc": 61.8,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "primary",
          "locator": "Table 5, p.6"
        },
        "matterport3d": {
          "miou": 42.6,
          "macc": 59.2,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "primary",
          "locator": "Table 5, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "openscene-ls-3d",
      "method": "OpenScene (LS, 3D Distill)",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "OpenScene: 3D Scene Understanding with Open Vocabularies",
        "authors": [
          "Songyou Peng",
          "Kyle Genova",
          "Chiyu Jiang",
          "Andrea Tagliasacchi",
          "Marc Pollefeys",
          "Thomas Funkhouser"
        ],
        "year": 2023,
        "venue": "CVPR 2023",
        "venue_type": "conference",
        "arxiv_id": "2211.15654",
        "doi": null,
        "url": "https://openaccess.thecvf.com/content/CVPR2023/html/Peng_OpenScene_3D_Scene_Understanding_With_Open_Vocabularies_CVPR_2023_paper.html",
        "code_url": "https://github.com/pengsongyou/openscene",
        "open_source": "yes"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "LSeg",
        "notes": "3D 蒸馏模型，推理仅 3D；论文未报告 nuScenes"
      },
      "results": {
        "scannet_v2": {
          "miou": 52.9,
          "macc": 63.2,
          "source": "OpenScene, CVPR 2023, Tab.7",
          "source_kind": "primary",
          "locator": "Table 7, p.6"
        },
        "matterport3d": {
          "miou": 41.9,
          "macc": 51.2,
          "source": "OpenScene, CVPR 2023, Tab.7",
          "source_kind": "primary",
          "locator": "Table 7, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "openscene-os-3d",
      "method": "OpenScene (OS, 3D Distill)",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "OpenScene: 3D Scene Understanding with Open Vocabularies",
        "authors": [
          "Songyou Peng",
          "Kyle Genova",
          "Chiyu Jiang",
          "Andrea Tagliasacchi",
          "Marc Pollefeys",
          "Thomas Funkhouser"
        ],
        "year": 2023,
        "venue": "CVPR 2023",
        "venue_type": "conference",
        "arxiv_id": "2211.15654",
        "doi": null,
        "url": "https://openaccess.thecvf.com/content/CVPR2023/html/Peng_OpenScene_3D_Scene_Understanding_With_Open_Vocabularies_CVPR_2023_paper.html",
        "code_url": "https://github.com/pengsongyou/openscene",
        "open_source": "yes"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "OpenSeg",
        "notes": "3D 蒸馏模型，推理仅 3D；论文未报告 nuScenes"
      },
      "results": {
        "scannet_v2": {
          "miou": 46.0,
          "macc": 66.3,
          "source": "OpenScene, CVPR 2023, Tab.7",
          "source_kind": "primary",
          "locator": "Table 7, p.6"
        },
        "matterport3d": {
          "miou": 41.3,
          "macc": 55.1,
          "source": "OpenScene, CVPR 2023, Tab.7",
          "source_kind": "primary",
          "locator": "Table 7, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "ov3d",
      "method": "OV3D",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "Open-Vocabulary 3D Semantic Segmentation with Foundation Models",
        "authors": [
          "L. Jiang",
          "S. Shi",
          "B. Schiele"
        ],
        "year": 2024,
        "venue": "CVPR 2024",
        "venue_type": "conference",
        "arxiv_id": null,
        "doi": "10.1109/CVPR52733.2024.02011",
        "url": "https://doi.org/10.1109/CVPR52733.2024.02011",
        "code_url": null,
        "open_source": "unknown"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "未记录",
        "notes": "基础模型驱动的 3D 开放词汇分割；数值转引自 GeoGuide 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 57.3,
          "macc": 72.9,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "nuscenes": {
          "miou": 44.6,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "matterport3d": {
          "miou": 45.8,
          "macc": 62.4,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "pgov3d",
      "method": "PGOV3D",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "PGOV3D: Open-Vocabulary 3D Semantic Segmentation with Partial-to-Global Curriculum",
        "authors": [
          "S. Zhang et al."
        ],
        "year": 2025,
        "venue": "ACM MM 2025",
        "venue_type": "conference",
        "arxiv_id": "2506.23607",
        "doi": null,
        "url": "https://arxiv.org/abs/2506.23607",
        "code_url": null,
        "open_source": "unknown"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "未记录",
        "notes": "部分到全局课程学习；原论文仅报告 ScanNet"
      },
      "results": {
        "scannet_v2": {
          "miou": 59.5,
          "macc": 73.2,
          "source": "PGOV3D, ACM MM 2025, Tab.5",
          "source_kind": "primary",
          "locator": "Table 5"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "geoze",
      "method": "GeoZe",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "Geometrically-driven Aggregation for Zero-shot 3D Point Cloud Understanding",
        "authors": [
          "G. Mei",
          "L. Riz",
          "Y. Wang",
          "F. Poiesi"
        ],
        "year": 2024,
        "venue": "CVPR 2024",
        "venue_type": "conference",
        "arxiv_id": "2312.02244",
        "doi": null,
        "url": "https://arxiv.org/abs/2312.02244",
        "code_url": null,
        "open_source": "unknown"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "未记录",
        "notes": "几何驱动的零样本聚合；数值转引自 GeoGuide 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 55.8,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "ggsd",
      "method": "GGSD",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "Open Vocabulary 3D Scene Understanding via Geometry Guided Self-Distillation",
        "authors": [
          "P. Wang et al."
        ],
        "year": 2024,
        "venue": "ECCV 2024",
        "venue_type": "conference",
        "arxiv_id": "2407.13362",
        "doi": null,
        "url": "https://arxiv.org/abs/2407.13362",
        "code_url": "https://github.com/Wang-pengfei/GGSD",
        "open_source": "yes"
      },
      "protocol": {
        "family": "self_distill",
        "text_encoder": "LSeg",
        "notes": "几何引导自蒸馏；Matterport3D 取自原论文 Matterport21 设置"
      },
      "results": {
        "scannet_v2": {
          "miou": 56.5,
          "macc": 68.6,
          "source": "GGSD, ECCV 2024, Tab.6",
          "source_kind": "primary",
          "locator": "Table 6"
        },
        "nuscenes": {
          "miou": 46.1,
          "macc": 59.2,
          "source": "GGSD, ECCV 2024, Tab.6",
          "source_kind": "primary",
          "locator": "Table 6"
        },
        "matterport3d": {
          "miou": 40.1,
          "macc": 54.4,
          "source": "GGSD, ECCV 2024, Tab.8",
          "source_kind": "primary",
          "locator": "Table 8"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "cua-o3d",
      "method": "CUA-O3D",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "Cross-Modal and Uncertainty-Aware Agglomeration for Open-Vocabulary 3D Scene Understanding",
        "authors": [
          "J. Li",
          "C. Saltori",
          "F. Poiesi",
          "N. Sebe"
        ],
        "year": 2025,
        "venue": "CVPR 2025",
        "venue_type": "conference",
        "arxiv_id": "2503.16707",
        "doi": null,
        "url": "https://arxiv.org/abs/2503.16707",
        "code_url": "https://github.com/TyroneLi/CUA_O3D",
        "open_source": "yes"
      },
      "protocol": {
        "family": "2d3d_ensemble",
        "text_encoder": "LSeg + DINOv2 + Stable Diffusion",
        "notes": "2D3D 变体；原论文未报告 nuScenes"
      },
      "results": {
        "scannet_v2": {
          "miou": 55.3,
          "macc": 65.6,
          "source": "CUA-O3D, CVPR 2025, Tab.12",
          "source_kind": "primary",
          "locator": "Table 12"
        },
        "matterport3d": {
          "miou": 42.2,
          "macc": 50.9,
          "source": "CUA-O3D, CVPR 2025, Tab.12",
          "source_kind": "primary",
          "locator": "Table 12"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "dma-os",
      "method": "DMA (OS)",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "Dense Multimodal Alignment for Open-Vocabulary 3D Scene Understanding",
        "authors": [
          "R. Li et al."
        ],
        "year": 2024,
        "venue": "ECCV 2024",
        "venue_type": "conference",
        "arxiv_id": "2407.09781",
        "doi": null,
        "url": "https://arxiv.org/abs/2407.09781",
        "code_url": "https://github.com/lslrh/DMA",
        "open_source": "yes"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "OpenSeg",
        "notes": "DMA(OS) 变体；数值转引自 GeoGuide 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 53.3,
          "macc": 70.3,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "nuscenes": {
          "miou": 45.1,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "matterport3d": {
          "miou": 45.1,
          "macc": 57.6,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "diff2scene",
      "method": "Diff2Scene",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "Open-Vocabulary 3D Semantic Segmentation with Text-to-Image Diffusion Models",
        "authors": [
          "X. Zhu et al."
        ],
        "year": 2024,
        "venue": "ECCV 2024",
        "venue_type": "conference",
        "arxiv_id": "2407.13642",
        "doi": null,
        "url": "https://arxiv.org/abs/2407.13642",
        "code_url": null,
        "open_source": "unknown"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "Stable Diffusion",
        "notes": "扩散模型文本到图像先验；数值转引自 GeoGuide 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 48.6,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "matterport3d": {
          "miou": 45.5,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "clip-fo3d",
      "method": "CLIP-FO3D",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "CLIP-FO3D: Learning Free Open-world 3D Scene Representations from 2D Dense CLIP",
        "authors": [
          "J. Zhang et al."
        ],
        "year": 2023,
        "venue": "CVPR 2023",
        "venue_type": "conference",
        "arxiv_id": "2303.04748",
        "doi": null,
        "url": "https://arxiv.org/abs/2303.04748",
        "code_url": null,
        "open_source": "unknown"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "CLIP（dense）",
        "notes": "原论文只报告 ScanNet / S3DIS"
      },
      "results": {
        "scannet_v2": {
          "miou": 30.2,
          "macc": 49.1,
          "source": "CLIP-FO3D, CVPR 2023, Tab.4",
          "source_kind": "primary",
          "locator": "Table 4"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "clip2scene",
      "method": "CLIP2Scene",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "CLIP2Scene: Towards Label-efficient 3D Scene Understanding by CLIP",
        "authors": [
          "R. Chen et al."
        ],
        "year": 2023,
        "venue": "CVPR 2023",
        "venue_type": "conference",
        "arxiv_id": "2301.04926",
        "doi": null,
        "url": "https://arxiv.org/abs/2301.04926",
        "code_url": "https://github.com/runnanchen/CLIP2Scene",
        "open_source": "yes"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "CLIP",
        "notes": "数值转引自 GeoGuide 对照表（ScanNet 零样本设置）"
      },
      "results": {
        "scannet_v2": {
          "miou": 25.1,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "pla",
      "method": "PLA",
      "group": "open_vocab",
      "supervision": "zero_shot",
      "paper": {
        "title": "PLA: Language-Driven Open-Vocabulary 3D Scene Understanding",
        "authors": [
          "R. Ding et al."
        ],
        "year": 2023,
        "venue": "CVPR 2023",
        "venue_type": "conference",
        "arxiv_id": "2211.16312",
        "doi": null,
        "url": "https://openaccess.thecvf.com/content/CVPR2023/html/Ding_PLA_Language-Driven_Open-Vocabulary_3D_Scene_Understanding_CVPR_2023_paper.html",
        "code_url": "https://github.com/CVMI-Lab/PLA",
        "open_source": "yes"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "CLIP + 生成图像",
        "notes": "数值转引自 GeoGuide 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 17.7,
          "macc": 33.5,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "geopurify",
      "method": "GeoPurify",
      "group": "few_label",
      "supervision": "few_label",
      "paper": {
        "title": "GeoPurify: A Data-Efficient Geometric Distillation Framework for Open-Vocabulary 3D Segmentation",
        "authors": [
          "GeoPurify authors"
        ],
        "year": 2026,
        "venue": "ICLR 2026",
        "venue_type": "conference",
        "arxiv_id": "2510.02186",
        "doi": null,
        "url": "https://arxiv.org/abs/2510.02186",
        "code_url": "https://github.com/tj12323/GeoPurify",
        "open_source": "yes"
      },
      "protocol": {
        "family": "3d_only",
        "text_encoder": "LSeg（按原论文）",
        "notes": "约 1.5% 三维语义标签，不是零样本；仅作参考，不参与开放词汇排名"
      },
      "results": {
        "scannet_v2": {
          "miou": 55.1,
          "macc": 72.5,
          "source": "GeoPurify, ICLR 2026, Tab.8",
          "source_kind": "primary",
          "locator": "Table 8"
        },
        "matterport3d": {
          "miou": 40.2,
          "macc": 62.4,
          "source": "GeoPurify, ICLR 2026, Tab.8",
          "source_kind": "primary",
          "locator": "Table 8"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": [
        "1.5% labels"
      ]
    },
    {
      "id": "mseg",
      "method": "MSeg Voting",
      "group": "transfer_baseline",
      "supervision": "fully_supervised",
      "paper": {
        "title": "MSeg: A Composite Dataset for Multi-domain Semantic Segmentation",
        "authors": [
          "J. Lambert et al."
        ],
        "year": 2022,
        "venue": "CVPR 2022",
        "venue_type": "conference",
        "arxiv_id": "2112.13762",
        "doi": null,
        "url": "https://arxiv.org/abs/2112.13762",
        "code_url": null,
        "open_source": "unknown"
      },
      "protocol": {
        "family": "supervised",
        "text_encoder": "—",
        "notes": "监督模型投票的迁移基线，不是开放词汇方法；数值取自 OpenScene 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 45.6,
          "macc": 54.4,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        },
        "nuscenes": {
          "miou": 31.0,
          "macc": 36.9,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        },
        "matterport3d": {
          "miou": 33.4,
          "macc": 39.0,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "minkowskinet",
      "method": "MinkowskiNet",
      "group": "fully_supervised",
      "supervision": "fully_supervised",
      "paper": {
        "title": "4D Spatio-Temporal ConvNets: Minkowski Convolutional Neural Networks",
        "authors": [
          "C. Choy",
          "J. Gwak",
          "S. Savarese"
        ],
        "year": 2019,
        "venue": "CVPR 2019",
        "venue_type": "conference",
        "arxiv_id": "1904.08755",
        "doi": null,
        "url": "https://arxiv.org/abs/1904.08755",
        "code_url": "https://github.com/NVIDIA/MinkowskiEngine",
        "open_source": "yes"
      },
      "protocol": {
        "family": "supervised",
        "text_encoder": "—",
        "notes": "全监督参考；数值取自 OpenScene 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 69.0,
          "macc": 77.5,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        },
        "nuscenes": {
          "miou": 78.0,
          "macc": 83.7,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        },
        "matterport3d": {
          "miou": 54.2,
          "macc": 64.6,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "ptv3",
      "method": "PTv3",
      "group": "fully_supervised",
      "supervision": "fully_supervised",
      "paper": {
        "title": "Point Transformer V3: Simpler, Faster, Stronger",
        "authors": [
          "X. Wu et al."
        ],
        "year": 2024,
        "venue": "CVPR 2024",
        "venue_type": "conference",
        "arxiv_id": "2312.00732",
        "doi": null,
        "url": "https://arxiv.org/abs/2312.00732",
        "code_url": "https://github.com/Pointcept/PointTransformerV3",
        "open_source": "yes"
      },
      "protocol": {
        "family": "supervised",
        "text_encoder": "—",
        "notes": "全监督参考；数值转引自 GeoGuide 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 77.5,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        },
        "nuscenes": {
          "miou": 80.4,
          "macc": null,
          "source": "GeoGuide, CVPR 2026, Tab.1",
          "source_kind": "secondary",
          "locator": "Table 1, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "mix3d",
      "method": "Mix3D",
      "group": "fully_supervised",
      "supervision": "fully_supervised",
      "paper": {
        "title": "Mix3D: Out-of-Context Data Augmentation for 3D Scenes",
        "authors": [
          "A. Nekrasov et al."
        ],
        "year": 2021,
        "venue": "3DV 2021",
        "venue_type": "conference",
        "arxiv_id": "2110.01517",
        "doi": null,
        "url": "https://arxiv.org/abs/2110.01517",
        "code_url": "https://github.com/kumuji/mix3d",
        "open_source": "yes"
      },
      "protocol": {
        "family": "supervised",
        "text_encoder": "—",
        "notes": "全监督参考；数值取自 OpenScene 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 73.6,
          "macc": null,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    },
    {
      "id": "vmnet",
      "method": "VMNet",
      "group": "fully_supervised",
      "supervision": "fully_supervised",
      "paper": {
        "title": "VMNet: Voxel-Mesh Network for Geodesic-Aware 3D Semantic Segmentation",
        "authors": [
          "W. Hu et al."
        ],
        "year": 2021,
        "venue": "ICCV 2021",
        "venue_type": "conference",
        "arxiv_id": "2108.08839",
        "doi": null,
        "url": "https://arxiv.org/abs/2108.08839",
        "code_url": "https://github.com/hzykent/VMNet",
        "open_source": "yes"
      },
      "protocol": {
        "family": "supervised",
        "text_encoder": "—",
        "notes": "全监督参考；数值取自 OpenScene 对照表"
      },
      "results": {
        "scannet_v2": {
          "miou": 73.2,
          "macc": null,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        },
        "matterport3d": {
          "miou": 67.2,
          "macc": null,
          "source": "OpenScene, CVPR 2023, Tab.5",
          "source_kind": "secondary",
          "locator": "Table 5, p.6"
        }
      },
      "verified": true,
      "verified_at": "2026-11-09",
      "added_at": "2026-11-09",
      "tags": []
    }
  ],
  "ranks": {
    "scannet_v2": {
      "geoguide": 1,
      "sas-stage2": 2,
      "pgov3d": 3,
      "sas-stage1": 4,
      "ov3d": 5,
      "ggsd": 6,
      "geoze": 7,
      "cua-o3d": 8,
      "openscene-ls-ensemble": 9,
      "dma-os": 10,
      "openscene-ls-3d": 11,
      "diff2scene": 12,
      "openscene-os-ensemble": 13,
      "openscene-os-3d": 14,
      "clip-fo3d": 15,
      "clip2scene": 16,
      "pla": 17
    },
    "nuscenes": {
      "geoguide": 1,
      "sas-stage2": 2,
      "ggsd": 3,
      "sas-stage1": 4,
      "dma-os": 5,
      "ov3d": 6,
      "openscene-os-ensemble": 7,
      "openscene-ls-ensemble": 8
    },
    "matterport3d": {
      "geoguide": 1,
      "sas-stage2": 2,
      "sas-stage1": 3,
      "ov3d": 4,
      "diff2scene": 5,
      "dma-os": 6,
      "openscene-ls-ensemble": 7,
      "openscene-os-ensemble": 8,
      "cua-o3d": 9,
      "openscene-ls-3d": 10,
      "openscene-os-3d": 11,
      "ggsd": 12
    }
  },
  "best": {
    "scannet_v2": 64.8,
    "nuscenes": 50.3,
    "matterport3d": 51.9
  },
  "counts": {
    "papers": 23,
    "unique_papers": 19,
    "results": 50,
    "pending": 0,
    "open_vocab": 17,
    "few_label": 1,
    "fully_supervised": 4,
    "transfer_baseline": 1
  },
  "pending": [],
  "changelog": [
    {
      "at": "2026-11-09 17:50",
      "kind": "init",
      "summary": "首批收录 23 条记录：17 条开放词汇、1 条少量标签参考、1 条迁移基线、4 条全监督参考；逐条记录论文表格与位置。"
    }
  ]
};
