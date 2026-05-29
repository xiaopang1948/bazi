# 项目进度

## 当前版本 V2.1
上次工作: 2026-05-29

### V2.0 (2026-05-29)
- **运势5段文案唯一性**: 三合一方案（时段副词前缀 + 5变体轮选 + 藏干支附加句），彻底消除同人同日刷新文案重复
- **DIM_SS_TEXT扩展**: 100条→500条（每十神good/bad各5变体），配合seed散列让不同人看到不同变体
- **calcPersonSeed**: 用`(year*3 + month*7 + day*11 + hour*19) % 5`做个性散列，同人同天结果不变，换人则不同
- **20人自动化测试验证**: 流日/大运100%唯一，流月/流年唯一率从45%提升至85%
- **新常量体系**: PERIOD_ADVERB(5时段副词), PERIOD_IDX(时段索引), HIDDEN_SS_NOTE(10十神藏干短评)
- **git push**: 已推送至 GitHub

### V2.1 (2026-05-29)
- **择日月历选中日高亮**: 当天保留金色背景 + 选中日红色边框圈，切换日期后红圈跟随
- **吉凶标签修复**: CDN 版 lunar 缺 getDayTwelveDayGod()，改用地支索引推算十二神
- **规则追加**: 每次 git commit 前必须更新版本号（index.html 3处 + progress.md）
- **git push**: 已推送至 GitHub

### V2.0 (2026-05-28)
- **运势维度窜修复**: buildAdvice 全局内容仅 dim==='overall' 时显示，消除"收缩战线"等不相关文案
- **死代码清理**: 删除6个未引用函数(struct+5func)，yunshi.js 从677行减至529行
- **合盘bug修复**: 甲方缺 hp1Name 输入框，readHpInput 静默崩溃；补上 + ?. 可选链防御
- **版本号**: 内测版 V1.0 → V2.0 (index.html 3处)
- **git push**: commit c34ed8a → origin/master
- **迁移**: 项目从桌面移至 E:\bazi
- **GitHub Pages**: 自动部署，访问 https://xiaopang1948.github.io/bazi/

### 已知未完成
- v4: AI解读 / 紫微斗数 / 云端存储（需后端，暂缓）
- CSS 变量化合并（仍有部分重复颜色定义）
- 新组件命名不一致（pillars.js 用 BaziComponents 命名空间，其余用全局函数）
