# 八字排盘

纯前端单页应用，基于 6tail/lunar 引擎。

## 部署到 GitHub Pages

### 方式一：用 GitHub 网页操作（无需 git 命令行）

1. 打开 https://github.com 登录你的账号
2. 创建一个新仓库，取名 `bazi`（或者任意名字）
3. 在仓库页面点 **uploading an existing file**
4. 把 `Desktop/bazi/` 文件夹里的所有文件拖进去上传
5. 进入仓库 **Settings → Pages**，在 **Branch** 选 `main`，目录选 `/ (root)`，点 Save
6. 等 1-2 分钟，你的八字排盘就在 `https://你的用户名.github.io/bazi/` 上线了

### 方式二：用 git 命令行

```bash
cd C:\Users\bl\Desktop\bazi
git init
git add .
git commit -m "初始版本"
gh repo create bazi --public --push --source=.
# 或者手动：
# git remote add origin https://github.com/你的用户名/bazi.git
# git push -u origin main

# 然后在 GitHub 仓库 Settings → Pages 中启用
```

## 本地使用

直接用浏览器打开 `index.html` 即可，无需任何服务器。

## 文件结构

```
├── index.html            ← 主页面
├── css/bazi.css          ← 样式（含暗黑模式 + 打印样式）
└── js/
    ├── data/
    │   ├── cities.js     ← 60+ 城市经纬度
    │   └── stars-rules.js ← 20种神煞规则
    ├── core/
    │   ├── bazi-engine.js ← 核心计算引擎
    │   └── harmony.js     ← 合盘分析
    └── ui/
        └── app.js        ← UI交互逻辑
```

## 功能

- 四柱排盘（天干/地支/五行色标）
- 十神、藏干、纳音
- 真太阳时校正（EoT 公式 + 经度修正）
- 五行统计柱状图
- 20 种神煞
- 格局分析（身强/身弱 → 用神/忌神）
- 大运 8 步
- 流年详批（大运×流年冲刑合会）
- 婚姻合盘（纳音/生肖/天干/日支/五行互补）
- 排盘历史（localStorage）
- 暗黑模式
- PDF 导出（浏览器打印）
