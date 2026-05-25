# 项目进度

## 当前版本 v3.1 (upgrade-fixes)
上次工作: 2026-05-25

### 已完成
- v2: 胎元/命宫/身宫 + 十二长生 + 人元司令 + 流月流日流时 + Canvas四柱图 + 运势报告 + 古籍引证 + 名人库(67人) + 起名推荐 + 五运六气
- UI: 色系回归金色 + 四柱独立卡片 + 卡片三级视图 + 时间轴切换器(流年/流月/流日/流时)
- 五行色: 全区域着色(四柱/大运/流年/流月/流日/流时) + 金土颜色互换

### v3.1 Bug修复 & 性能优化 (2026-05-25)
- **严重**: 流日table双style属性冲突(cursor:pointer被静默丢弃) 已修复 → 合并为一个style
- **严重**: 时间轴事件监听器泄漏(每次切流日视图累加) 已修复 → data-listener守卫
- **中等**: wuyun-liuqi.js加载顺序修复(移bazi-engine.js后加载)
- **中等**: CELEBRITY_CITIES合并入CITIES，名人太阳时矫正现在生效
- **中等**: 暗黑模式下分析卡片(五行/神煞)恢复可见(加border+bg)
- **中等**: CSS pillar-stem/branch/hidden两处重复定义已合并
- **中等**: doZeri()增加typeof Lunar检查，避免CDN未加载时报错
- **UI**: 平板768px响应式断点 + meta标签补全(description/theme-color/apple-mobile)
- **UI**: 加载遮罩(显示"八字排盘 加载中..."，CDN就绪后淡出)
- **UI**: 所有inline onclick/oninput/onchange迁移为addEventListener
- **UI**: 打印机适配: 打印仅显示当前active tab(非只限tab-bazi)

### 已知未完成
- v4: AI解读 / 紫微斗数 / 云端存储（需后端，暂缓）
- 名人库alert()改为inline提示
- CDN加载失败增加fallback CDN
- 流年/流日/流时计算结果缓存
- 合盘city选择器增加默认提示
