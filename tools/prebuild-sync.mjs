#!/usr/bin/env node
/**
 * Runs before `astro build` (locally and on Cloudflare Pages).
 * Automatically regenerates:
 *   - public/search-index.json (client-side instant search)
 *   - public/llms.txt & public/llms-full.txt (AI search / GEO index)
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://tmhzz.com';
const DATA = path.resolve('src/data');
const PUBLIC = path.resolve('public');

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
}

function enc(p) {
  return BASE + encodeURI(p);
}

const cfg = readJson('site-config.json');
const sections = readJson('sections.json');
const sites = readJson('sites.json');
const posts = readJson('posts.json');
const apps = readJson('apps.json');
const books = readJson('books.json');
const tools = fs.existsSync(path.join(DATA, 'tools.json')) ? readJson('tools.json') : [];

const siteMap = new Map(sites.map((s) => [s.id, s]));

// 1. Rebuild public/search-index.json
const searchIndex = [];
for (const t of tools) {
  searchIndex.push({
    type: '工具',
    title: t.title || '',
    desc: (t.desc || '').slice(0, 120),
    url: t.path,
    tags: `${t.category || ''} ${t.keywords || ''}`,
  });
}
for (const s of sites) {
  searchIndex.push({
    type: '网址',
    title: s.title || '',
    desc: (s.summary || '').slice(0, 120),
    url: `/sites/${s.slug}.html`,
    extUrl: s.url || '',
    icon: s.icon || '',
    tags: [
      ...(s.favorites || []).map((c) => c.name),
      ...(s.tags || []).map((t) => t.name),
    ].join(' '),
  });
}
for (const p of posts) {
  searchIndex.push({
    type: '笔记',
    title: p.title || '',
    desc: (p.excerpt || '').slice(0, 120),
    url: `/${p.slug}/`,
    tags: (p.categories || []).map((c) => c.name).join(' '),
  });
}
for (const a of apps) {
  searchIndex.push({
    type: '资料',
    title: a.title || '',
    desc: (a.summary || '').slice(0, 120),
    url: `/app/${a.slug}.html`,
    tags: (a.categories || []).map((c) => c.name).join(' '),
  });
}
for (const b of books) {
  searchIndex.push({
    type: '好书',
    title: b.title || '',
    desc: (b.summary || '').slice(0, 120),
    url: `/book/${b.slug}.html`,
    tags: (b.categories || []).map((c) => c.name).join(' '),
  });
}

fs.mkdirSync(PUBLIC, { recursive: true });
fs.writeFileSync(path.join(PUBLIC, 'search-index.json'), JSON.stringify(searchIndex), 'utf8');

// 2. Rebuild public/llms.txt
const lines = [
  `# ${cfg.name} (${BASE})`,
  '',
  `> ${cfg.description}`,
  `> 标语：${cfg.tagline}`,
  '',
  '## 核心栏目',
  `- [首页网址导航](${BASE}/): 精选 ${sites.length} 个营销工具、AI 工具、违禁词查询、媒介渠道数据平台、广告创意案例、行业报告、高清图片与字体作图网站。`,
  `- [「天马黑珍珠」营销笔记](${enc('/「天马黑珍珠」营销笔记/')}): 原创营销笔记、思维认知、渠道流量与转化实战文章（共 ${posts.length} 篇）。`,
  `- [资料下载与行业报告](${enc('/资料下载/')}): 精选消费、电商、宠物、年轻人趋势等行业研究报告（共 ${apps.length} 份）。`,
  `- [好书好物推荐](${BASE}/books/): 营销经典书籍与个人精选好物清单（共 ${books.length} 项）。`,
  `- [在线计算器合集](${enc('/计算器/')}): 复利计算器、存款利息计算器、退休年龄计算器。`,
  '',
  '## 导航分类',
  ...sections.map((sec) => `- ${sec.title}（${(sec.siteIds || []).length} 个精选网站）`),
  '',
  '## 精选营销笔记',
  ...posts.map((p) => `- [${p.title}](${enc('/' + p.slug + '/')}): ${(p.excerpt || '').slice(0, 80)}`),
  '',
  '## 行业报告与资料下载',
  ...apps.map((a) => `- [${a.title}](${enc('/app/' + a.slug + '.html')}): ${(a.summary || '').slice(0, 80)}`),
  '',
  '## 免费在线工具箱（营销/电商/理财/职场）',
  ...tools.map((t) => `- [${t.title}](${enc(t.path)}): ${t.desc}`),
  '',
  '## 完整索引',
  `- [完整网址与资源目录 (llms-full.txt)](${BASE}/llms-full.txt)`,
  `- [XML Sitemap](${BASE}/sitemap-index.xml)`,
];
fs.writeFileSync(path.join(PUBLIC, 'llms.txt'), lines.join('\n') + '\n', 'utf8');

// 3. Rebuild public/llms-full.txt
const full = [
  `# ${cfg.name} — 完整内容索引 (${BASE})`,
  '',
  `> ${cfg.description}`,
  '',
  '## 全部导航分类与精选网站',
];
for (const sec of sections) {
  full.push(`\n### ${sec.title}`);
  for (const sid of sec.siteIds || []) {
    const s = siteMap.get(sid);
    if (!s) continue;
    const desc = (s.summary || '').replace(/\s+/g, ' ').trim().slice(0, 100);
    const ext = s.url ? ` | 官网: ${s.url}` : '';
    full.push(`- [${s.title}](${enc('/sites/' + s.slug + '.html')}): ${desc}${ext}`);
  }
}
full.push('\n## 全部营销笔记');
for (const p of posts) {
  full.push(`- [${p.title}](${enc('/' + p.slug + '/')}) (${p.date}): ${(p.excerpt || '').slice(0, 120)}`);
}
full.push('\n## 全部资料报告');
for (const a of apps) {
  full.push(`- [${a.title}](${enc('/app/' + a.slug + '.html')}): ${(a.summary || '').slice(0, 120)}`);
}
full.push('\n## 全部好书好物');
for (const b of books) {
  full.push(`- [${b.title}](${enc('/book/' + b.slug + '.html')}): ${(b.summary || '').slice(0, 120)}`);
}
fs.writeFileSync(path.join(PUBLIC, 'llms-full.txt'), full.join('\n') + '\n', 'utf8');

console.log(`[prebuild-sync] Synced ${searchIndex.length} search items, llms.txt, and llms-full.txt.`);
