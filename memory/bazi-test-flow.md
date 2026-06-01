# 八字排盘 SPA 测试流程（标准化）

## 前提

- Python HTTP 服务已启动在 `127.0.0.1:8766`
- playwright-cli 已安装

## 测试步骤（固定顺序）

### 1. 启动 HTTP 服务

```powershell
Start-Process -FilePath "python" -ArgumentList "-m http.server 8766 -d E:\bazi" -WindowStyle Hidden -PassThru
```

### 2. 打开浏览器页面

```powershell
playwright-cli open http://127.0.0.1:8766/
Start-Sleep -Seconds 2
```

检查控制台：`playwright-cli console`（忽略字体加载失败）

### 3. 填写排盘表单（JS 方式，最快）

⚠️ 不要用 `||` 链式赋值——赋值返回值是 truthy，会导致后续字段短路不执行。必须用 IIFE function：

```powershell
# 设置年、月（会自动触发日变化）
playwright-cli eval "(function(){document.getElementById('year').value='1988';document.getElementById('year').dispatchEvent(new Event('change'));document.getElementById('month').value='3';document.getElementById('month').dispatchEvent(new Event('change'));})()"

# 设置其余字段
playwright-cli eval "(function(){document.getElementById('day').value='27';document.getElementById('hour').value='23';document.getElementById('minute').value='55';document.querySelector('[data-value=female]').click();document.getElementById('province').value='山西';document.getElementById('province').dispatchEvent(new Event('change'));document.getElementById('city').value='taiyuan';document.getElementById('useSolarTime').checked=true;})()"

# 点击排盘
playwright-cli eval "document.getElementById('btnCalc')?.click()"

# 等结果渲染
Start-Sleep -Seconds 1
```

如果只改部分字段（比如改时间但保留别的），也**必须**用 function：

```powershell
playwright-cli eval "(function(){document.getElementById('hour').value='22';document.getElementById('minute').value='50';document.getElementById('useSolarTime').checked=false;})()"
```

### 4. 读取结果

```powershell
# 读取 info-bar 基础信息
playwright-cli eval "document.querySelector('#result .info-bar')?.innerText"

# 读取四柱干支（从 mg-grid 表）
playwright-cli eval "(function(){var g=document.getElementById('pillarsGrid');if(!g)return;var rows=g.querySelectorAll('.mg-row');var r={};r.header=rows[0]?.innerText;r.shishen=rows[1]?.innerText;r.stems=rows[2]?.innerText;r.branches=rows[3]?.innerText;return JSON.stringify(r)})()"
```

### 5. 清理解释

```powershell
playwright-cli close
```

## 测试用例

| 案例 | 年 | 月 | 日 | 时 | 分 | 性别 | 省份 | 真太阳时 | 预期日柱 | 预期时柱 |
|------|----|----|-----|----|----|------|---------|--------|---------|---------|
| 主案例 | 1988 | 3 | 27 | 23 | 55 | 女 | 山西 | 开 | 壬午 | 庚子 |
| 00:05 | 1988 | 3 | 28 | 0 | 5 | 女 | 山西 | 关 | 壬午 | 庚子 |
| 亥时 | 1988 | 3 | 27 | 22 | 50 | 女 | 山西 | 关 | 辛巳 | 己亥 |
| 子时末 | 1988 | 3 | 27 | 23 | 59 | 女 | 山西 | 关 | 壬午 | 庚子 |
