# 八字排盘 SPA — 项目进度

> 每会话结束时更新此文件。
> 格式：`- [x]` 完成 / `- [~]` 进行中 / `- [ ]` 待办
> 项目位置：E:\bazi

---

## 已完成

### V2.8 (2026-06-03) — AI 小卦助手
- [x] AI 小卦助手模块集成 — 右下角浮动触发，八字数据实时推送至状态栏 + System Prompt
- [x] XiaoGua 类封装（IIFE），公开 API: setBaziData / open / close / destroy
- [x] 拖拽边界约束 — 不可拖出视口，顶部 60px 安全区避开太极图
- [x] 手机端响应式增强 — touch-action、间距收缩、≤380px 文字始终可见
- [x] 八字显示 bug 修复 — pillars.ganzhi → stem+branch 拼接
- [x] API 迁移：DeepSeek → Agnes AI（免费无限量），模型 agnes-2.0-flash
- [x] 修复 close 按钮 bug + 备份清理
- [x] Playwright 7 项自动化测试全部通过
- [x] 版本号 V2.7 → V2.8

### V2.7 (2026-06-03)
- [x] 版本号自动填充 — 左上角/loading/页面标题从 version-history.js 第一条自动读取
- [x] lessons.md 版本号规则更新 — 只需改 version-history.js

### V2.6 (2026-06-02)
- [x] 流月节气拼音→中文映射 — JIE_QI_NAME_MAP 转中文显示

### V2.5 (2026-06-02)
- [x] 流月改为节气列 — timeline.js + getJiePeriods()，12 列对应 12 节
- [x] 流时时辰标签偏移修复 — 子时 23-1，午时 11-13，标准化 SHI_CHEN 表
- [x] 大运起运天数 DST 安全化 — Solar.fromDate().subtract() 替代裸时间戳
- [x] nextDay(1) 显式传参 + 空 periods 防御保护
- [x] 版本号 V2.4 → V2.5

### V2.4 (2026-06-01)
- [x] 品牌统一为"卦卦" — 纯黑 + 霓虹绿 + 零圆角设计语言
- [x] Hero 着陆页 — 太极 SVG + "开始探索"按钮
- [x] 排盘表单重设计 — 6 行对称布局，磨砂玻璃卡
- [x] 所有按钮/开关/Pill 组改为直角 + 粗绿边框
- [x] 菜单改造 — 顶栏右下 dropdown，毛玻璃效果
- [x] 排盘卡片窄化 — 88% 宽度居中
- [x] 合盘 UI 重做 — 双卡布局 + pill-group 性别
- [x] 手机端响应式适配 — 逐级断点 768/600/480/380px
- [x] 移除暗黑模式、名人 Tab、PDF 导出等废弃功能
- [x] 提交规范：每次提交前更新版本号

### V2.3 (2026-06-01)
- [x] 子时换日修复 — 23:00-23:59 日柱/农历进次日
- [x] 测试流程标准化 — 写入项目记忆

### V2.2 (2026-05-29)
- [x] 设置页新增「版本更新历史」卡片 — 7个版本，中文标注+彩色类型标签+要点列表
- [x] version-history.js 独立数据源 + settings.js 渲染引擎

### V2.1 (2026-05-29)
- [x] 择日月历选中日高亮 — 方案C：当天金色背景 + 选中日红色边框圈
- [x] 吉凶标签修复 — 改用地支索引推算十二神

### V2.0 (2026-05-29)
- [x] 运势5段文案唯一性 — 三合一方案（时段副词前缀 + 5变体轮选 + 藏干支附加句）
- [x] DIM_SS_TEXT 从100条文案扩展至500条
- [x] calcPersonSeed 个性散列
- [x] PERIOD_ADVERB/PERIOD_IDX/HIDDEN_SS_NOTE 常量体系
- [x] 20人自动化测试 — 流日/大运100%唯一

### V2.0 (2026-05-28)
- [x] 运势分析维度窜 bug 修复
- [x] 死代码清理 — 删除 6 个未引用函数
- [x] 合盘 bug 修复 — 甲方缺 hp1Name 输入框 + `?.` 可选链防御
- [x] 版本号 V2.0 — index.html 3 处
- [x] 项目迁移 — 从桌面移至 E:\bazi

### 更早完成
- [x] 合盘 tab 多余 `</div>` 标签修复
- [x] 择日黄历 UI 重构：传统黄历卡片布局 + safeGet 兜底
- [x] 侧边栏顺序重排 + 五运六气移除
- [x] 手机端响应式布局（导航栏 flex-wrap、overflow-x 链式、字号/留白阶梯缩小、K线图自适应）
- [x] 运势分析维度文案系统 — 方案三部署
- [x] v4.0/v3.2/v3.0/v2/V1.0 各版本基础功能

---

## 进行中
- (无)

## 待办
- (无 — 所有待办已清理)

---

## 待排查
- [ ] OpenCode TUI 看不到 Agnes 模型：配置已写入 `opencode.json`，API 可正常返回模型列表，但 `/models` 不显示。可能需重启 OpenCode 或先 `/connect` 注册 API Key

---

## 关键上下文
- **八字小卦专用 API Key**: `sk-N2ff6TRf6nocDG7wpPTuWoOULeEZm5wBpyQr3rVy1nbhWoOl`
- **OpenCode 助手 API Key**: `sk-nE8QyCA6zi9BnjnQDYhNCB6fQKqC4qna0YVFybZ9CfMR3DjZ`
- **版本权威源**: `js/data/version-history.js` 第一条 = 最新版本号
- **当前版本**: V2.8 (2026-06-03)
