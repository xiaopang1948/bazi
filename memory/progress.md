# 项目进度

## 当前版本 v3.2 (component-refactor)
上次工作: 2026-05-25

### v3.2 组件重构 + v3.5 新功能 (2026-05-25)
- **重构**: app.js 从 4500 行瘦身至 177 行（纯初始化入口），所有渲染逻辑拆分为 8 个独立组件文件
- **组件拆分**: patterns.js / dayun.js / timeline.js / hepan.js / zeri.js / celebrity.js / history.js / wuyun.js
- **CDN fallback**: lunar-javascript CDN 加载失败自动 fallback 到 cdnjs
- **合盘city**: 增加 disabled 默认提示选项 "— 请选择城市 —"
- **名人库**: alert() 改为 inline error div，4秒自动消失
- **流年缓存**: _liuNianCache (Map) 避免重复计算，keyed by birthYear+name，新排盘时清空
- **compactInfo**: doCalc 中增加 `display:grid` 确保显示

### v3.5 新功能
- **袁天罡称骨**: 60甲子+月+日+时全套权重表 + 51首判词，排盘结果首张卡片展示
- **日运评分 + 周趋势图**: Canvas 折线图，基于干支生克合冲计算每日0-100评分，支持上周/下周切换
- **人生K线图**: 基于大运的 Canvas 蜡烛图，每步大运一个蜡烛（含最高/最低/开盘/收盘运势），颜色区分吉凶

### 已知未完成
- v4: AI解读 / 紫微斗数 / 云端存储（需后端，暂缓）
- CSS 变量化合并（仍有部分重复颜色定义）
- 新组件命名不一致（pillars.js 用 BaziComponents 命名空间，其余用全局函数）
