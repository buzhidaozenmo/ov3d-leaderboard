/* 本文件由 scripts/build.py 生成，请勿手工编辑。 */
window.OV3D_DATA = {
  "schema_version": 1,
  "generated_at": "2026-11-12 15:57",
  "data_updated_at": "2026-11-10",
  "last_checked": "2026-11-12 15:57",
  "next_check": "2026-11-13 09:00",
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
      "tags": [],
      "tracks": [
        "ov",
        "multi_view"
      ],
      "mv": {
        "teacher_2d": "LSeg + SEEM",
        "correspondence": "点-像素投影 + 超点",
        "fusion": "不确定度加权的超点聚合",
        "stage_3d": "3d_distill",
        "student_3d": "冻结 3D backbone + 适配器",
        "variant_note": "SAS* 特征；论文声明不使用耗时自蒸馏"
      }
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
      ],
      "tracks": [
        "ov",
        "multi_view"
      ],
      "mv": {
        "teacher_2d": "LSeg + SEEM",
        "correspondence": "点-像素投影 + 超点",
        "fusion": "多教师能力加权的特征融合",
        "stage_3d": "self_distill",
        "student_3d": "3D 学生网络（原论文）",
        "variant_note": "stage2 为最终模型；stage1 为 59.2 / 45.4 / 46.3"
      }
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
      ],
      "tracks": [
        "ov"
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
      "tags": [],
      "tracks": [
        "ov",
        "multi_view"
      ],
      "mv": {
        "teacher_2d": "LSeg",
        "correspondence": "点-像素投影 + 多视角可见性",
        "fusion": "多视角特征均值 + 2D-3D logits 集成",
        "stage_3d": "2d3d_ensemble",
        "student_3d": "MinkowskiNet（3D 分支）",
        "variant_note": "LSeg 集成；OpenSeg 集成见同页另一行，3D distill 见总榜"
      }
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
      "tags": [],
      "tracks": [
        "ov",
        "multi_view"
      ],
      "mv": {
        "teacher_2d": "OpenSeg",
        "correspondence": "点-像素投影 + 多视角可见性",
        "fusion": "多视角特征均值 + 2D-3D logits 集成",
        "stage_3d": "2d3d_ensemble",
        "student_3d": "MinkowskiNet（3D 分支）",
        "variant_note": "OpenSeg 集成；nuScenes 优于 LSeg 变体"
      }
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov",
        "multi_view"
      ],
      "mv": {
        "teacher_2d": "LSeg",
        "correspondence": "点-像素投影",
        "fusion": "几何引导的像素-点蒸馏",
        "stage_3d": "self_distill",
        "student_3d": "3D 学生网络（原论文）",
        "variant_note": "最终模型；2D 投影基线 50.0 / 32.3 未单列"
      }
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
      "tags": [],
      "tracks": [
        "ov",
        "multi_view"
      ],
      "mv": {
        "teacher_2d": "LSeg + DINOv2 + Stable Diffusion",
        "correspondence": "点-像素投影",
        "fusion": "跨模态不确定度聚合",
        "stage_3d": "2d3d_ensemble",
        "student_3d": "3D 分支 + 2D3D 集成（原论文）",
        "variant_note": "2D3D 变体；3D 变体为 54.1 / 41.3，不单列"
      }
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      ],
      "tracks": [
        "ov",
        "multi_view"
      ],
      "mv": {
        "teacher_2d": "LSeg",
        "correspondence": "点-像素投影 + 几何关系",
        "fusion": "几何引导池化 / 关系蒸馏",
        "stage_3d": "few_label",
        "student_3d": "3D 学生网络（原论文）",
        "variant_note": "约 1.5% 三维标签，仅作参考，不参与排名"
      }
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
      "tags": [],
      "tracks": [
        "ov"
      ]
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
  "multi_view": {
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
        "tags": [],
        "tracks": [
          "ov",
          "multi_view"
        ],
        "mv": {
          "teacher_2d": "LSeg + SEEM",
          "correspondence": "点-像素投影 + 超点",
          "fusion": "不确定度加权的超点聚合",
          "stage_3d": "3d_distill",
          "student_3d": "冻结 3D backbone + 适配器",
          "variant_note": "SAS* 特征；论文声明不使用耗时自蒸馏"
        }
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
        ],
        "tracks": [
          "ov",
          "multi_view"
        ],
        "mv": {
          "teacher_2d": "LSeg + SEEM",
          "correspondence": "点-像素投影 + 超点",
          "fusion": "多教师能力加权的特征融合",
          "stage_3d": "self_distill",
          "student_3d": "3D 学生网络（原论文）",
          "variant_note": "stage2 为最终模型；stage1 为 59.2 / 45.4 / 46.3"
        }
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
        "tags": [],
        "tracks": [
          "ov",
          "multi_view"
        ],
        "mv": {
          "teacher_2d": "LSeg",
          "correspondence": "点-像素投影 + 多视角可见性",
          "fusion": "多视角特征均值 + 2D-3D logits 集成",
          "stage_3d": "2d3d_ensemble",
          "student_3d": "MinkowskiNet（3D 分支）",
          "variant_note": "LSeg 集成；OpenSeg 集成见同页另一行，3D distill 见总榜"
        }
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
        "tags": [],
        "tracks": [
          "ov",
          "multi_view"
        ],
        "mv": {
          "teacher_2d": "OpenSeg",
          "correspondence": "点-像素投影 + 多视角可见性",
          "fusion": "多视角特征均值 + 2D-3D logits 集成",
          "stage_3d": "2d3d_ensemble",
          "student_3d": "MinkowskiNet（3D 分支）",
          "variant_note": "OpenSeg 集成；nuScenes 优于 LSeg 变体"
        }
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
        "tags": [],
        "tracks": [
          "ov",
          "multi_view"
        ],
        "mv": {
          "teacher_2d": "LSeg",
          "correspondence": "点-像素投影",
          "fusion": "几何引导的像素-点蒸馏",
          "stage_3d": "self_distill",
          "student_3d": "3D 学生网络（原论文）",
          "variant_note": "最终模型；2D 投影基线 50.0 / 32.3 未单列"
        }
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
        "tags": [],
        "tracks": [
          "ov",
          "multi_view"
        ],
        "mv": {
          "teacher_2d": "LSeg + DINOv2 + Stable Diffusion",
          "correspondence": "点-像素投影",
          "fusion": "跨模态不确定度聚合",
          "stage_3d": "2d3d_ensemble",
          "student_3d": "3D 分支 + 2D3D 集成（原论文）",
          "variant_note": "2D3D 变体；3D 变体为 54.1 / 41.3，不单列"
        }
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
        ],
        "tracks": [
          "ov",
          "multi_view"
        ],
        "mv": {
          "teacher_2d": "LSeg",
          "correspondence": "点-像素投影 + 几何关系",
          "fusion": "几何引导池化 / 关系蒸馏",
          "stage_3d": "few_label",
          "student_3d": "3D 学生网络（原论文）",
          "variant_note": "约 1.5% 三维标签，仅作参考，不参与排名"
        }
      }
    ],
    "ranks": {
      "scannet_v2": {
        "geoguide": 1,
        "sas-stage2": 2,
        "ggsd": 3,
        "cua-o3d": 4,
        "openscene-ls-ensemble": 5,
        "openscene-os-ensemble": 6
      },
      "nuscenes": {
        "geoguide": 1,
        "sas-stage2": 2,
        "ggsd": 3,
        "openscene-os-ensemble": 4,
        "openscene-ls-ensemble": 5
      },
      "matterport3d": {
        "geoguide": 1,
        "sas-stage2": 2,
        "openscene-ls-ensemble": 3,
        "openscene-os-ensemble": 4,
        "cua-o3d": 5,
        "ggsd": 6
      }
    },
    "best": {
      "scannet_v2": 64.8,
      "nuscenes": 50.3,
      "matterport3d": 51.9
    },
    "counts": {
      "methods": 7,
      "pending": 1
    }
  },
  "instance": {
    "datasets": [
      {
        "key": "scannet200",
        "label": "ScanNet200",
        "classes": 200,
        "split": "val",
        "note": "200 类长尾实例分割"
      },
      {
        "key": "scannetpp",
        "label": "ScanNet++",
        "classes": 0,
        "split": "val",
        "note": "高保真室内扫描"
      },
      {
        "key": "replica",
        "label": "Replica",
        "classes": 0,
        "split": "val",
        "note": "合成室内场景"
      },
      {
        "key": "scannet_v2",
        "label": "ScanNet v2",
        "classes": 18,
        "split": "val",
        "note": "18 类实例分割"
      },
      {
        "key": "matterport3d",
        "label": "Matterport3D",
        "classes": 0,
        "split": "val",
        "note": "建筑级室内场景"
      }
    ],
    "methods": [
      {
        "id": "sam2object",
        "method": "SAM2Object",
        "task": "instance",
        "setting": "zero_shot",
        "online": false,
        "paper": {
          "title": "SAM2Object: Consolidating View Consistency via SAM2 for Zero-Shot 3D Instance Segmentation",
          "authors": [
            "J. Zhao et al."
          ],
          "year": 2025,
          "venue": "CVPR 2025",
          "venue_type": "conference",
          "arxiv_id": null,
          "doi": null,
          "url": "https://openaccess.thecvf.com/content/CVPR2025/html/Zhao_SAM2Object_Consolidating_View_Consistency_via_SAM2_for_Zero-Shot_3D_Instance_CVPR_2025_paper.html",
          "code_url": "https://github.com/jihuaizhaohd/SAM2Object",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "SAM2",
          "correspondence": "跨帧 mask 跟踪 + 3D 几何先验",
          "fusion": "视图一致性合并 + mask 质量过滤",
          "proposal_3d": "超点 / 几何基元"
        },
        "results": {
          "scannet200": {
            "ap": 13.3,
            "ap50": 19.0,
            "ap25": 23.8,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "原论文未在本地打开表格，ScanNet200 数值转引自 OpenTrack3D 对照表。"
      },
      {
        "id": "sai3d",
        "method": "SAI3D",
        "task": "instance",
        "setting": "zero_shot",
        "online": false,
        "paper": {
          "title": "SAI3D: Segment Any Instance in 3D Scenes",
          "authors": [
            "Y. Yin et al."
          ],
          "year": 2024,
          "venue": "CVPR 2024",
          "venue_type": "conference",
          "arxiv_id": "2312.11557",
          "doi": null,
          "url": "https://arxiv.org/abs/2312.11557",
          "code_url": "https://github.com/yd-yin/SAI3D",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "SAM",
          "correspondence": "多视图 mask 投影到 3D 几何基元",
          "fusion": "跨视图 mask 合并 + 3D 基元增长",
          "proposal_3d": "几何基元 / 区域增长"
        },
        "results": {
          "scannet_v2": {
            "ap": 30.8,
            "ap50": 50.5,
            "ap25": 70.6,
            "source": "SAI3D, CVPR 2024, Tab.8",
            "source_kind": "primary",
            "locator": "Table 8"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "ScanNet v2 18 类设置。"
      },
      {
        "id": "openmask3d",
        "method": "OpenMask3D",
        "task": "instance",
        "setting": "open_vocab",
        "online": false,
        "paper": {
          "title": "OpenMask3D: Open-Vocabulary 3D Instance Segmentation",
          "authors": [
            "A. Takmaz et al."
          ],
          "year": 2023,
          "venue": "NeurIPS 2023",
          "venue_type": "conference",
          "arxiv_id": "2306.13631",
          "doi": null,
          "url": "https://arxiv.org/abs/2306.13631",
          "code_url": "https://github.com/OpenMask3D/openmask3d",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "Mask3D 类无关 3D 掩码 + 多视图 CLIP 特征",
          "correspondence": "3D 掩码投影到多视图",
          "fusion": "多视图 CLIP 特征池化",
          "proposal_3d": "类别无关 3D 实例掩码"
        },
        "results": {
          "scannet200": {
            "ap": 15.0,
            "ap50": 19.7,
            "ap25": 23.1,
            "source": "OpenMask3D, NeurIPS 2023, Tab.4",
            "source_kind": "primary",
            "locator": "Table 4"
          },
          "replica": {
            "ap": 13.1,
            "ap50": 18.4,
            "ap25": 24.2,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "使用在 3D 上训练过的类无关掩码，属开放词汇而非训练-free。"
      },
      {
        "id": "maskclustering",
        "method": "MaskClustering",
        "task": "instance",
        "setting": "zero_shot",
        "online": false,
        "paper": {
          "title": "MaskClustering: View Consensus based Mask Graph Clustering for Open-Vocabulary 3D Instance Segmentation",
          "authors": [
            "M. Yan et al."
          ],
          "year": 2024,
          "venue": "CVPR 2024",
          "venue_type": "conference",
          "arxiv_id": "2401.07745",
          "doi": null,
          "url": "https://arxiv.org/abs/2401.07745",
          "code_url": "https://github.com/PKU-EPIC/MaskClustering",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "SAM + CLIP",
          "correspondence": "相邻视图 mask 关联",
          "fusion": "视图共识 mask 图聚类",
          "proposal_3d": "3D 超点 / 掩码"
        },
        "results": {
          "scannetpp": {
            "ap": 7.8,
            "ap50": 10.7,
            "ap25": 12.1,
            "source": "MaskClustering, CVPR 2024, Tab.3",
            "source_kind": "primary",
            "locator": "Table 3"
          },
          "matterport3d": {
            "ap": 11.1,
            "ap50": 21.1,
            "ap25": 31.2,
            "source": "MaskClustering, CVPR 2024, Tab.3",
            "source_kind": "primary",
            "locator": "Table 3"
          },
          "scannet200": {
            "ap": 12.0,
            "ap50": 23.3,
            "ap25": 30.1,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "Table 3 的 semantic 列；class-agnostic 列更高但不与语义 AP 混排。"
      },
      {
        "id": "sampro3d",
        "method": "SAMPro3D",
        "task": "instance",
        "setting": "zero_shot",
        "online": false,
        "paper": {
          "title": "SAMPro3D: Locating SAM Prompts in 3D for Zero-Shot Instance Segmentation",
          "authors": [
            "M. Xu et al."
          ],
          "year": 2025,
          "venue": "3DV 2025",
          "venue_type": "conference",
          "arxiv_id": "2311.17707",
          "doi": null,
          "url": "https://arxiv.org/abs/2311.17707",
          "code_url": "https://github.com/GAP-LAB-CUHK-SZ/SAMPro3D",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "SAM",
          "correspondence": "3D 提示定位 + 跨视图像素提示对齐",
          "fusion": "视图一致的 mask 合并",
          "proposal_3d": "超点 / 3D 掩码"
        },
        "results": {
          "scannet_v2": {
            "ap": 24.3,
            "ap50": 45.7,
            "ap25": 67.7,
            "source": "SAMPro3D, 3DV 2025, Tab.1",
            "source_kind": "primary",
            "locator": "Table 1"
          },
          "scannet200": {
            "ap": 26.3,
            "ap50": 47.2,
            "ap25": 68.6,
            "source": "SAMPro3D, 3DV 2025, Tab.1",
            "source_kind": "primary",
            "locator": "Table 1"
          },
          "scannetpp": {
            "ap": 20.3,
            "ap50": 35.6,
            "ap25": 53.2,
            "source": "SAMPro3D, 3DV 2025, Tab.1",
            "source_kind": "primary",
            "locator": "Table 1"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": ""
      },
      {
        "id": "openyolo3d",
        "method": "Open-YOLO 3D",
        "task": "instance",
        "setting": "open_vocab",
        "online": false,
        "paper": {
          "title": "Open-YOLO 3D: Towards Fast and Accurate Open-Vocabulary 3D Instance Segmentation",
          "authors": [
            "A. Boudjoghra et al."
          ],
          "year": 2025,
          "venue": "ICLR 2025",
          "venue_type": "conference",
          "arxiv_id": "2406.02548",
          "doi": null,
          "url": "https://arxiv.org/abs/2406.02548",
          "code_url": "https://github.com/aminebdj/OpenYOLO3D",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "YOLOv8 + CLIP",
          "correspondence": "2D 检测/掩码投影到 3D",
          "fusion": "多视图 2D 检测投票",
          "proposal_3d": "3D 掩码网络"
        },
        "results": {
          "scannet200": {
            "ap": 21.9,
            "ap50": 28.3,
            "ap25": 31.7,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          },
          "replica": {
            "ap": 23.7,
            "ap50": 28.6,
            "ap25": 34.8,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "使用 ScanNet200 训练 3D 掩码网络，属开放词汇而非训练-free。"
      },
      {
        "id": "open3dis",
        "method": "Open3DIS",
        "task": "instance",
        "setting": "zero_shot",
        "online": false,
        "paper": {
          "title": "Open3DIS: Open-Vocabulary 3D Instance Segmentation with 2D Mask Guidance",
          "authors": [
            "P. Nguyen et al."
          ],
          "year": 2024,
          "venue": "CVPR 2024",
          "venue_type": "conference",
          "arxiv_id": "2312.10671",
          "doi": null,
          "url": "https://arxiv.org/abs/2312.10671",
          "code_url": "https://github.com/VinAIResearch/Open3DIS",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "SAM 2D 掩码",
          "correspondence": "2D 掩码投影 + 3D 提案",
          "fusion": "2D mask guidance 与 3D 超点合并",
          "proposal_3d": "3D 实例提案"
        },
        "results": {
          "scannet200": {
            "ap": 18.2,
            "ap50": 26.1,
            "ap25": 31.4,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          },
          "replica": {
            "ap": 18.2,
            "ap50": 25.9,
            "ap25": 31.0,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "无 3D mask 监督的 zero-shot 行；带 3D mask 监督的变体更高，不与本行混排。"
      },
      {
        "id": "any3dis",
        "method": "Any3DIS",
        "task": "instance",
        "setting": "zero_shot",
        "online": false,
        "paper": {
          "title": "Any3DIS: Class-Agnostic 3D Instance Segmentation by 2D Mask Tracking",
          "authors": [
            "P. Nguyen et al."
          ],
          "year": 2025,
          "venue": "CVPR 2025",
          "venue_type": "conference",
          "arxiv_id": "2411.16183",
          "doi": null,
          "url": "https://arxiv.org/abs/2411.16183",
          "code_url": null,
          "open_source": "unknown"
        },
        "pipeline": {
          "mask_2d": "SAM 2D mask tracking",
          "correspondence": "2D 掩码跟踪 + 3D 关联",
          "fusion": "跨帧 mask 跟踪与层次合并",
          "proposal_3d": "3D 实例提案"
        },
        "results": {
          "scannet200": {
            "ap": 19.1,
            "ap50": null,
            "ap25": null,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "仅查到 AP；AP50/AP25 未在该表列出。"
      },
      {
        "id": "detailsmatter",
        "method": "Details Matter",
        "task": "instance",
        "setting": "zero_shot",
        "online": false,
        "paper": {
          "title": "Details Matter for Indoor Open-vocabulary 3D Instance Segmentation",
          "authors": [
            "S. Zhu et al."
          ],
          "year": 2025,
          "venue": "ICCV 2025",
          "venue_type": "conference",
          "arxiv_id": "2507.23134",
          "doi": null,
          "url": "https://arxiv.org/abs/2507.23134",
          "code_url": null,
          "open_source": "unknown"
        },
        "pipeline": {
          "mask_2d": "SAM + Alpha-CLIP",
          "correspondence": "2D 掩码投影 + 3D 提案",
          "fusion": "SMS filtering + 多视图特征",
          "proposal_3d": "3D 实例提案"
        },
        "results": {
          "scannet200": {
            "ap": 21.5,
            "ap50": 31.2,
            "ap25": 37.7,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          },
          "replica": {
            "ap": 20.8,
            "ap50": 32.4,
            "ap25": 38.5,
            "source": "OpenTrack3D, Tab.2",
            "source_kind": "secondary",
            "locator": "Table 2"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "零样本行；原论文另有更高配置，不与本行混排。"
      },
      {
        "id": "opentrack3d",
        "method": "OpenTrack3D",
        "task": "instance",
        "setting": "zero_shot",
        "online": false,
        "paper": {
          "title": "OpenTrack3D: Towards Accurate and Generalizable Open-Vocabulary 3D Instance Segmentation",
          "authors": [
            "OpenTrack3D authors"
          ],
          "year": 2025,
          "venue": "arXiv preprint 2025",
          "venue_type": "preprint",
          "arxiv_id": "2512.03532",
          "doi": null,
          "url": "https://arxiv.org/abs/2512.03532",
          "code_url": null,
          "open_source": "unknown"
        },
        "pipeline": {
          "mask_2d": "2D mask tracking + MLLM 分类",
          "correspondence": "2D 掩码跟踪到 3D",
          "fusion": "track 级 mask 合并 + 多视图分类",
          "proposal_3d": "3D 实例掩码"
        },
        "results": {
          "scannet200": {
            "ap": 26.0,
            "ap50": 37.7,
            "ap25": 45.4,
            "source": "OpenTrack3D, arXiv 2025, Tab.2",
            "source_kind": "primary",
            "locator": "Table 2"
          },
          "replica": {
            "ap": 23.9,
            "ap50": 36.4,
            "ap25": 47.6,
            "source": "OpenTrack3D, arXiv 2025, Tab.2",
            "source_kind": "primary",
            "locator": "Table 2"
          },
          "scannetpp": {
            "ap": 20.6,
            "ap50": 34.2,
            "ap25": 43.4,
            "source": "OpenTrack3D, arXiv 2025, Tab.6",
            "source_kind": "primary",
            "locator": "Table 6"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": ""
      },
      {
        "id": "embodiedsam",
        "method": "EmbodiedSAM",
        "task": "instance",
        "setting": "zero_shot",
        "online": true,
        "paper": {
          "title": "EmbodiedSAM: Online Segment Any 3D Thing in Real Time",
          "authors": [
            "X. Xu et al."
          ],
          "year": 2025,
          "venue": "ICLR 2025",
          "venue_type": "conference",
          "arxiv_id": "2408.11811",
          "doi": null,
          "url": "https://arxiv.org/abs/2408.11811",
          "code_url": "https://github.com/xuxw98/ESAM",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "SAM2 在线跟踪",
          "correspondence": "在线 2D 到 3D 掩码提升",
          "fusion": "在线 mask 跟踪 + 3D 查询",
          "proposal_3d": "在线 3D 实例查询"
        },
        "results": {
          "scannet200": {
            "ap": 28.8,
            "ap50": 52.2,
            "ap25": 69.3,
            "source": "EmbodiedSAM, ICLR 2025, Tab.11",
            "source_kind": "primary",
            "locator": "Table 11"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "在线设置；ScanNet200→SceneNN 跨域表中的 ScanNet200 列。"
      },
      {
        "id": "onlineanyseg",
        "method": "OnlineAnySeg",
        "task": "instance",
        "setting": "zero_shot",
        "online": true,
        "paper": {
          "title": "OnlineAnySeg: Online Zero-Shot 3D Segmentation by Visual Foundation Model Guided 2D Mask Merging",
          "authors": [
            "Y. Tang et al."
          ],
          "year": 2025,
          "venue": "CVPR 2025",
          "venue_type": "conference",
          "arxiv_id": "2503.01309",
          "doi": null,
          "url": "https://arxiv.org/abs/2503.01309",
          "code_url": "https://github.com/yjtang249/OnlineAnySeg",
          "open_source": "yes"
        },
        "pipeline": {
          "mask_2d": "SAM2 在线",
          "correspondence": "在线 2D mask 合并到 3D",
          "fusion": "VFM 引导的 2D mask 合并",
          "proposal_3d": "在线 3D 实例"
        },
        "results": {
          "scannet200": {
            "ap": 18.6,
            "ap50": 36.1,
            "ap25": 53.5,
            "source": "OnlineAnySeg, CVPR 2025, Tab.5",
            "source_kind": "primary",
            "locator": "Table 5"
          }
        },
        "verified": true,
        "verified_at": "2026-11-10",
        "added_at": "2026-11-10",
        "notes": "在线设置。"
      }
    ],
    "ranks": {
      "scannet200": {
        "embodiedsam": 1,
        "sampro3d": 2,
        "opentrack3d": 3,
        "openyolo3d": 4,
        "detailsmatter": 5,
        "any3dis": 6,
        "onlineanyseg": 7,
        "open3dis": 8,
        "openmask3d": 9,
        "sam2object": 10,
        "maskclustering": 11
      },
      "scannetpp": {
        "opentrack3d": 1,
        "sampro3d": 2,
        "maskclustering": 3
      },
      "replica": {
        "opentrack3d": 1,
        "openyolo3d": 2,
        "detailsmatter": 3,
        "open3dis": 4,
        "openmask3d": 5
      },
      "scannet_v2": {
        "sai3d": 1,
        "sampro3d": 2
      },
      "matterport3d": {
        "maskclustering": 1
      }
    },
    "best": {
      "scannet200": 28.8,
      "scannetpp": 20.6,
      "replica": 23.9,
      "scannet_v2": 30.8,
      "matterport3d": 11.1
    },
    "counts": {
      "methods": 12,
      "results": 22
    }
  },
  "counts": {
    "papers": 23,
    "unique_papers": 19,
    "results": 50,
    "pending": 2,
    "open_vocab": 17,
    "few_label": 1,
    "fully_supervised": 4,
    "transfer_baseline": 1
  },
  "pending": [
    {
      "id": "2611.10821",
      "title": "AmodalBox: Automated 3D Bounding Box Annotation under Partial Visibility",
      "arxiv_id": "2611.10821",
      "url": "https://arxiv.org/abs/2611.10821",
      "found_at": "2026-11-10 15:59",
      "keywords": [
        "nuscenes",
        "open-vocab",
        "open-vocabulary"
      ],
      "venue_hint": "",
      "tracks": [
        "ov"
      ]
    },
    {
      "id": "2611.10379",
      "title": "RefineSplat: Reconstruction-Guided Object-Centric Gaussian Splatting for Open-Vocabulary Querying",
      "arxiv_id": "2611.10379",
      "url": "https://arxiv.org/abs/2611.10379",
      "found_at": "2026-11-10 15:59",
      "keywords": [
        "open-vocab",
        "open-vocabulary"
      ],
      "venue_hint": "",
      "tracks": [
        "ov",
        "multi_view"
      ]
    }
  ],
  "changelog": [
    {
      "at": "2026-11-10 09:45",
      "kind": "page",
      "summary": "多视角 2D→3D 子榜扩展：语义 mIoU 6 个方法 + 实例 AP 12 个零样本/开放词汇方法（含 SAM2Object、SAI3D、SAMPro3D、OpenTrack3D、EmbodiedSAM 等）。"
    },
    {
      "at": "2026-11-09 17:50",
      "kind": "init",
      "summary": "首批收录 23 条记录：17 条开放词汇、1 条少量标签参考、1 条迁移基线、4 条全监督参考；逐条记录论文表格与位置。"
    }
  ]
};
