# 八字项目经验规则

## 合盘相关

- **当 `readHpInput` 读取 DOM 元素时，先用 `?.value` 可选链，不用裸 `.value`** — 避免 HTML 缺少对应 ID 时报 TypeError 静默崩溃
- **合盘表单甲方乙方须对称** — 甲方有姓名输入框，乙方也必须有；反之亦然

## 文件操作安全

- **`Move-Item` 失败后不要用 `Remove-Item -Recurse` 清理目标目录** — Move-Item 是复制+删源两步，删源失败不代表复制失败，先 `Get-ChildItem` 确认双方状态再做决定
- **移动大项目优先用 `robocopy`**，复制完成确认无误后再手动删源

## 运势分析相关

- **`buildAdvice` 中全局结构层代码（运岁生克、能量评级）必须放在 `dim === 'overall'` 条件内**，非综合维度不展示
- **死代码不要留** — 函数确认无外部引用后直接删除，不要注释保留

## 版本号管理

- **每次 git commit 前必须更新版本号** — index.html 3 处（title、loading overlay、hero title）从 Vx.y 升到下一版，同时在 memory/progress.md 顶部同步
- **版本号同步时同时更新 `js/data/version-history.js`** — 新增当前版本的 entry（version/label/date/tag/items），按倒序插入到数组最前面
