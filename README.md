# 天马黑珍珠 (tmhzz.com) — 静态导航站

已从 WordPress + OneNav（宝塔服务器）无损迁移为 **Astro 纯静态站点**，支持直接托管在 **GitHub + Cloudflare Pages**，**零服务器费用**。

## 本地开发与构建

```bash
npm install
npm run dev      # 本地预览 http://localhost:4321
npm run build    # 生成静态文件到 dist/
```

## 部署到 GitHub + Cloudflare Pages（3 步上线）

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Migrate tmhzz.com from WordPress to Astro static site"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git
   git push -u origin main
   ```
   > `.gitignore` 已自动排除 `raw_data/`、`scripts/`、`node_modules/` 和 macOS 的 `._*` 文件，不会上传多余的临时备份。

2. **连接 Cloudflare Pages**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
   - 选择你的 GitHub 仓库，填写构建配置：
     - **Framework preset**: `Astro`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Node.js version**（环境变量 `NODE_VERSION`）: `20` 或 `22`
   - 点击 **Save and Deploy**，约 1 分钟后即可获得 `*.pages.dev` 预览地址。

3. **绑定 `tmhzz.com` 域名并停掉宝塔**
   - 在 Cloudflare Pages 项目 → **Custom domains** → 添加 `tmhzz.com` 和 `www.tmhzz.com`。
   - 等待 SSL 证书自动签发并确认线上打开正常后，即可放心地停止宝塔服务器续费。

## 日常如何更新内容？

所有数据都集中在 `src/data/` 下，直接编辑对应 JSON 并 `git push`，Cloudflare 会在 1 分钟内自动重新构建上线：

- `src/data/sites.json`：165 个网址导航条目
- `src/data/sections.json`：首页分类排序与展示的网址 ID
- `src/data/posts.json`：营销笔记文章
- `src/data/apps.json`：资料下载与行业报告（含网盘链接）
- `src/data/books.json`：好书好物推荐
- `src/data/site-config.json`：网站标题、导航菜单、公告、Google AdSense、友链与搜索配置
