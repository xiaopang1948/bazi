# 八字排盘 浏览器测试方案

## 背景

纯前端单页应用（`C:\Users\bl\Desktop\bazi`），依赖 CDN 加载 `lunar-javascript` 库。功能涉及 DOM 操作、异步渲染、多 Tab 切换，仅靠 Node.js 测试覆盖不到 JS 运行时错误和 DOM 状态。

## 工具链

- **Playwright CLI** (`playwright-cli`) — 0.1.13，全局安装
- **Python** — 内置 HTTP 服务器
- **PowerShell** — 进程管理

## 测试步骤

### 1. 启动 HTTP 服务器

不能用后台 Job（`Start-Job`），因为 Playwright 连接时会超时。原因未知，可能与 Job 的网络命名空间隔离有关。

**正确做法**：用 `Start-Process` 创建独立进程，拿到 PID 后用 `curl` 确认端口可访问。

```powershell
$p = Start-Process -FilePath "python" `
  -ArgumentList "-m http.server 8766 -d C:\Users\bl\Desktop\bazi" `
  -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2
curl.exe -s http://127.0.0.1:8766/ | Select-String -Pattern "<title>"
# 输出: 八字排盘
```

**注意事项**：
- 端口避开常用端口（如 8765 有时被其他进程占用）
- 用 `127.0.0.1` 而非 `localhost`。Windows 下 `localhost` 可能走 IPv6 解析，Playwright 的 Chromium 在某些环境下无法访问 IPv6 localhost。`127.0.0.1` 强制走 IPv4，无此问题。

### 2. 打开浏览器

```powershell
playwright-cli -s=btest open http://127.0.0.1:8766/
```

**重要**：
- `-s=btest` 指定 session 名称，便于多 session 管理
- 首次打开后控制台会提示 `Console: N errors, M warnings`，可初步判断错误数量
- `file://` 协议被 Playwright 安全策略拦截，必须走 HTTP

### 3. 读取控制台日志

```powershell
playwright-cli -s=btest console
```

返回所有 Console 消息，含 error/warning 级别和来源。

### 4. 交互操作

支持 CSS 选择器和 role 定位：

```powershell
# 点击按钮（ID 选择器）
playwright-cli -s=btest click "id=btnCalc"
playwright-cli -s=btest click "id=btnHarmony"

# 点击 Tab（class + attribute 选择器）
playwright-cli -s=btest click ".tab[data-tab='hepan']"

# 点击 Tab（role 选择器，更稳定）
playwright-cli -s=btest click "getByRole('button', { name: '择日' })"
```

### 5. 截图

```powershell
playwright-cli -s=btest screenshot --filename=step1-main.png
```

有浏览器截图可以对比 UI 布局，但当前模型不支持图片输入，截图主要用于人工复查。

### 6. 执行 JS 获取 DOM 状态

Playwright eval 接收的参数会被包裹成 `() => (args)`，所以参数本身必须是**表达式**（不能有裸分号多语句）。**正确做法**：

```powershell
# ✅ 用函数包装
playwright-cli -s=btest eval "(function(){try{return Lunar.fromYmd(2026,5,15).getYearInChinese()}catch(e){return e.message}})()"

# ✅ 一元运算符串联
playwright-cli -s=btest eval "!!document.getElementById('hp1City') && !!document.getElementById('hp2City')"

# ✅ 三元表达式
playwright-cli -s=btest eval "document.getElementById('harmonyResult')?.style.display === 'block' ? document.querySelector('#harmonyScoreDisplay div')?.textContent : 'hidden'"

# ✅ 管道传文件（自动读取 stdin，文件需是 IIFE 或表达式）
Get-Content tests/smoke.js -Raw | playwright-cli -s=btest eval

# ❌ 不行：分号多语句
playwright-cli -s=btest eval "var x = 1; var y = 2"    # SyntaxError
```

**管道技巧**：`playwright-cli eval` 从 stdin 读取代码时不经过 `() => (...)` 包裹，所以支持任意多语句 JavaScript 文件。但对冒烟测试有用 —— 更可靠的是用 IIFE 包裹的 JS 文件通过管道传入（见 `tests/smoke.js`）。

### 7. 验证 DOM 内容

```powershell
# 读取多个元素的文本内容
playwright-cli -s=btest eval "Array.from(document.querySelectorAll('.pillar-nayin')).map(e => e.textContent)"

# 读取合并文本
playwright-cli -s=btest eval "document.querySelector('#zeriContent')?.innerText.replace(/\s+/g,' ').trim().substring(0, 200)"
```

### 8. 清理

```powershell
playwright-cli -s=btest close                    # 关闭浏览器 session
Stop-Process -Id $serverPid -Force               # 停掉 HTTP 服务器
Remove-Item "./.playwright-cli" -Recurse -Force  # 清理截图和日志
```

## 快速冒烟测试（推荐）

最快方式 — 一键运行，覆盖核心路径：

```powershell
powershell -File tests/run.ps1
```

或者带自动暂停（失败时等待按键）：

```powershell
powershell -File tests/run.ps1 -Watch
```

脚本自动完成：启动 HTTP → 打开浏览器 → 跑 smoke.js → 检查结果 → 清理。

`tests/smoke.js` 测试路线：排盘计算 → 四柱验证（日柱壬午/时柱庚子）→ 合盘 Tab → 合盘计算 → 运程 Tab → 择日 Tab → 历史 Tab → 设置 Tab → 返回排盘。使用 `setTimeout` 链等待 DOM 异步更新，结果累在 `window.__test.results`。

## 手动完整测试流程

```powershell
# 1. 启动服务器
$p = Start-Process -FilePath "python" -ArgumentList "-m http.server 8766 -d C:\Users\bl\Desktop\bazi" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2

# 2. 打开浏览器
playwright-cli -s=btest open http://127.0.0.1:8766/

# 3. 排盘
playwright-cli -s=btest click "id=btnCalc"
# 验证纳音
playwright-cli -s=btest eval "Array.from(document.querySelectorAll('.pillar-nayin')).map(e => e.textContent)"

# 4. 合盘
playwright-cli -s=btest click ".tab[data-tab='hepan']"
playwright-cli -s=btest click "id=btnHarmony"
# 验证评分显示
playwright-cli -s=btest eval "document.querySelector('#harmonyScoreDisplay div')?.textContent"

# 5. 择日
playwright-cli -s=btest click ".tab[data-tab='zeri']"
# 验证黄历
playwright-cli -s=btest eval "document.querySelector('#zeriContent p strong')?.textContent"

# 6. 检查控制台
playwright-cli -s=btest console

# 7. 清理
playwright-cli -s=btest close
Stop-Process -Id $p.Id -Force
Remove-Item "./.playwright-cli" -Recurse -Force -ErrorAction SilentlyContinue
```

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| `ERR_CONNECTION_REFUSED` | HTTP server 未运行或端口不对 | 先用 `curl` 确认端口可达 |
| `Access to "file:" protocol is blocked` | Playwright 安全策略 | 必须用 HTTP 服务器提供文件 |
| `SyntaxError: Unexpected token ';'` | eval 不支持分号多语句 | 用 IIFE 或链式表达式替代 |
| `element is not visible` | 目标在隐藏的 Tab 中 | 先切到对应 Tab 再操作 |

## Python HTTP Server 进程管理

**不要用** `Start-Job`（后台 Job）— Playwright 连不上（疑似网络命名空间隔离）。

**用** `Start-Process` 创建独立进程，用 PID 管理生命周期：

```powershell
# 启动
$p = Start-Process -FilePath "python" -ArgumentList "-m http.server 8766 -d C:\path\to\dir" -WindowStyle Hidden -PassThru

# 停止
Stop-Process -Id $p.Id -Force
```
