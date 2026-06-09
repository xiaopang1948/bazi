# 八字排盘 — AGENTS.md

## 项目本质

纯前端 SPA，无构建工具。直接浏览器打开 `index.html` 即可运行（无需服务器）。

## 核心命令

```powershell
# 浏览器 E2E 测试（需 playwright-cli 全局安装）
cd E:\bazi
$p = Start-Process -FilePath "python" -ArgumentList "-m http.server 8766 -d $pwd" -WindowStyle Hidden -PassThru
Start-Sleep 2
playwright-cli -s=btest open http://127.0.0.1:8766/
# 必须用 127.0.0.1 而非 localhost（Windows IPv6 兼容问题）
```

详见 `TEST.md`（含 eval 分号限制、多语句用 IIFE 替代、Python HTTP 需用 `Start-Process` 而非 `Start-Job`）。

## 架构关键

- **入口**: `index.html` 加载全部 JS（无模块打包），加载顺序见底部 `<script>` 标签
- **路由**: `js/router.js` — `BaziRouter`，基于 `location.hash`，6 个 tab：bazi/yunshi/zeri/hepan/history/settings
- **状态**: `js/store.js` — `BaziStore`，简单 pub/sub + `localStorage` 持久化（历史记录 key=`bazi_history`，偏好 key=`bazi_prefs`）
- **核心引擎**: `js/core/bazi-engine.js` — 依赖全局 `Lunar`（CDN: `lunar-javascript` 1.7.7，含 CDN fallback）
- **UI**: `js/ui/app.js` 主控 + `js/ui/components/*` 按功能拆分，DOM 操作为主
- **AI 助手**: `bazi-xiaogua/` — XiaoGua 类 IIFE 封装，挂全局 `window.xg`，公开 API: `setBaziData/open/close/destroy`
- **品牌**: 卦卦 — 纯黑背景 + `#00E676` 霓虹绿

## 版本号

**唯一权威源**: `js/data/version-history.js` 数组第一条。左上角、loading 蒙层、页面标题自动从 `VERSION_HISTORY[0]` 读取。提交前只需在此文件插入新条目。

## 开发约定

- 无 `package.json`（已 gitignored），无 npm/node 工具链
- CDN 库 API 不做存在性假设 — 用实际公开 API，库返回的拼音标识用 `JIE_QI_NAME_MAP`（`bazi-engine.js`）做映射转换
- 合盘表单甲方乙方字段须对称，`readHpInput` 读 DOM 用 `?.value` 可选链
- 死代码直接删除，不用注释保留
- 提交前缀：`VX.Y type:`（如 `V2.8 feat:`）

## 测试

- 工具: `playwright-cli`（全局安装 v0.1.13）
- 禁止 `file://` 协议（Playwright 安全策略拦截），必须走 HTTP
- 参考 `TEST.md` 完整脚本

### 快速命令

```powershell
# 冒烟测试（一键）
powershell -File tests/run.ps1

# 手动
cd E:\bazi
$p = Start-Process -FilePath "python" -ArgumentList "-m http.server 8766 -d $pwd" -WindowStyle Hidden -PassThru
Start-Sleep 2
playwright-cli -s=btest open http://127.0.0.1:8766/
# 测试完成后清理
playwright-cli -s=btest close
Stop-Process -Id $p.Id -Force
Remove-Item ".playwright-cli" -Recurse -Force -ErrorAction SilentlyContinue
```

## 经验规则

`lessons.md` 收录项目特定踩坑记录（合盘对称性、CDN 兼容、版本管理、文件操作安全、运势分析结构层条件等），修改代码前先查阅。
