# 前端纯静态应用浏览器测试方案

## 适用场景
纯前端 SPA（无后端、依赖 CDN），Need to run full browser test (DOM/Console/runtime errors).

## 工具
- `playwright-cli` (全局安装)
- `python -m http.server` (提供静态文件)

## 关键步骤

### 1. 启动 HTTP 服务器
```powershell
$p = Start-Process -FilePath "python" -ArgumentList "-m http.server 8766 -d C:\path\to\project" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2
```
- **用 `127.0.0.1` 而非 `localhost`** — 前者强制 IPv4，Playwright Chromium 始终可连
- **用 `Start-Process` 而非 `Start-Job`** — Job 模式下 Playwright 连不上（疑似网络命名空间隔离）

### 2. 打开浏览器
```powershell
playwright-cli -s=mytest open http://127.0.0.1:8766/
```

### 3. 验证
```powershell
# 控制台错误
playwright-cli -s=mytest console

# 执行 JS 查 DOM（不支持分号多语句，用 IIFE 或链式表达式）
playwright-cli -s=mytest eval "document.querySelector('selector')?.textContent"

# 点击交互
playwright-cli -s=mytest click "id=btnCalc"
playwright-cli -s=mytest click ".tab[data-tab='hepan']"
playwright-cli -s=mytest click "getByRole('button', { name: '排盘' })"

# 截图
playwright-cli -s=mytest screenshot --filename=output.png
```

### 4. 清理
```powershell
playwright-cli -s=mytest close
Stop-Process -Id $pid -Force
Remove-Item "./.playwright-cli" -Recurse -Force -ErrorAction SilentlyContinue
```

### 注意事项
- `file://` 协议被 Playwright 安全策略拦截，必须走 HTTP
- eval 不支持 `;` 多语句，用 `(function(){...})()` 或 `&&`/`||`/`?.` 链式表达式
- 切 Tab 后再操作该 Tab 内的元素（否则报 element not visible）

## 参考
- 详细文档: `docs/bazi-browser-test.md`
- 完整测试流程: `bazi/TEST.md`
