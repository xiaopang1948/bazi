# 八字排盘 SPA — 项目进度

> 每会话结束时更新此文件。
> 格式：`- [x]` 完成 / `- [~]` 进行中 / `- [ ]` 待办
> 项目位置：E:\bazi

---

## 已完成

### V2.0 (2026-05-29)
- [x] 运势5段文案唯一性 — 三合一方案（时段副词前缀 + 5变体轮选 + 藏干支附加句）
- [x] DIM_SS_TEXT 从100条文案扩展至500条（每十神good/bad各5变体）
- [x] calcPersonSeed 个性散列 — 用生日×质数均匀分配到5变体槽
- [x] PERIOD_ADVERB/PERIOD_IDX/HIDDEN_SS_NOTE 常量体系
- [x] 20人自动化测试 — 流日/大运100%唯一，流月/流年从9/20提升至17/20
- [x] git push 到 GitHub

### V2.0 (2026-05-28)
- [x] 运势分析维度窜 bug 修复 — buildAdvice 全局结构内容仅 dim==='overall' 时显示
- [x] 死代码清理 — 删除 6 个未引用函数/结构体，yunshi.js 从 677 行减至 529 行
- [x] 合盘 bug 修复 — 甲方缺 hp1Name 输入框导致静默崩溃；新增姓名输入框 + `?.` 可选链防御
- [x] 版本号 V2.0 — index.html 3 处 "内测版 V1.0" → "V2.0"
- [x] git push 到 GitHub — commit `c34ed8a` → `origin/master`
- [x] GitHub Pages 自动部署 — https://xiaopang1948.github.io/bazi/
- [x] 项目迁移 — 从桌面移至 E:\bazi

### 之前完成
- [x] 合盘 tab 多余 `</div>` 标签修复
- [x] 择日黄历 UI 重构：传统黄历卡片布局 + safeGet 兜底
- [x] 侧边栏顺序重排 + 五运六气移除
- [x] 手机端响应式布局（导航栏 flex-wrap、overflow-x 链式、字号/留白阶梯缩小、K线图自适应）
- [x] 运势分析维度文案系统 — 方案三部署

## 进行中

- [~] （无）

## 待办（未排序）

- [ ] 运势分析 K 线图完善（dark mode）
- [ ] 合盘/名人功能完善
- [ ] 可能的：PDF 导出
- [ ] 添加 vitest 单元测试框架 + 核心排盘函数测试

---

## 之前讨论但已丢失上下文（待你补充）

- [ ] （待补充）
