# GitHub Pages 部署记录

## 项目：八字排盘 bazi

| 项目 | 值 |
|------|-----|
| 仓库 | https://github.com/xiaopang1948/bazi |
| 在线地址 | https://xiaopang1948.github.io/bazi/ |
| 部署方式 | GitHub Pages（master 分支 / 根目录） |
| 部署日期 | 2026-05-28 (V2.0) |
| 项目位置 | E:\bazi（从桌面移入） |

## 部署命令

```powershell
# 创建仓库并推送
cd E:\bazi
gh repo create bazi --public --push --source=. --remote=origin

# 启用 GitHub Pages（用 API）
$json = '{"source":{"branch":"master","path":"/"}}'
$json | Set-Content -Path "$env:TEMP\gh-pages.json" -NoNewline
gh api repos/xiaopang1948/bazi/pages --input "$env:TEMP\gh-pages.json"
```

## 注意事项

- 纯静态站点，不需要构建步骤
- 依赖 CDN 加载 `lunar-javascript@1.7.7`
- 新版本推送后自动部署，等待约 1-2 分钟生效
