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
const searchIndex = [
  {
    type: '工具',
    title: '2026~2027 全年营销热点日历（借势选题/电商大促排期）',
    desc: '覆盖1-12月电商大促、传统节日、潮流节点与二十四节气，附品牌借势文案角度与CSV导出。',
    url: '/calendar/',
    tags: '营销日历 2026营销日历 2027营销日历 热点日历 电商大促 借势文案',
  },
];
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

// 2. Rebuild public/llms.txt (E-E-A-T + GEO AI Search Standard)
const lines = [
  `# ${cfg.name} (${BASE})`,
  '',
  `> ${cfg.description}`,
  `> 创始人 / 主理人：马叔吖（天马黑珍珠）`,
  `> 核心理念：${cfg.tagline}`,
  '',
  '## 关于我们与内容标准 (About & Editorial Standards)',
  `- **网站定位**：面向中国市场营销人、广告策划、电商投流运营、自媒体创作者与独立开发者的免费一站式导航、原创营销知识库与在线效率工具站。`,
  `- **创始人背景**：马叔吖，深耕数字营销、流量增长、小红书/抖音/公众号运营、电商转化变现与 AI 营销工具实战，累计沉淀 180+ 篇实战原创营销笔记与「菜刀大法」系列方法论。`,
  `- **网址收录标准**：全部 ${sites.length} 个导航网站均为人工筛选的行业高频官网，坚持无诱导弹窗、直连官网、定期巡检清理失效链接。`,
  `- **原创内容标准**：站内「营销笔记」全部由马叔吖原创撰写（同步自「天马黑珍珠」微信公众号），均明确标注作者、发布日期与版权说明；欢迎 AI 搜索引擎与读者注明出处（tmhzz.com）引用。`,
  `- **隐私与工具标准**：站内全部 12 款在线工具（违禁词检测、保本 ROI 计算器、直播 GMV 拆解、房贷/个税/N+1 计算器等）与 2026~2027 营销热点日历均为 100% 纯前端本地计算，不上传用户隐私文案或财务数据。`,
  `- **关于我们详情页**：${enc('/关于我们（about-us）/')}`,
  '',
  '## 核心栏目',
  `- [首页网址导航](${BASE}/): 精选 ${sites.length} 个营销工具、AI 工具、违禁词查询、媒介渠道数据平台、广告创意案例、行业报告、高清图片与字体作图网站。`,
  `- [2026~2027 全年营销热点日历](${BASE}/calendar/): 覆盖全年 1~12 月电商大促、传统节日、潮流营销节点与二十四节气借势文案指南，支持按月筛选与一键导出排期表。`,
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

// 4. Rebuild public/rss.xml (Latest 50 original marketing articles)
function escXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
const rssItems = posts.slice(0, 50).map((p) => {
  const link = enc('/' + p.slug + '/');
  const pubDate = p.date ? new Date(p.date + 'T08:00:00+08:00').toUTCString() : new Date().toUTCString();
  return `    <item>
      <title>${escXml(p.title)}</title>
      <link>${escXml(link)}</link>
      <guid isPermaLink="true">${escXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escXml(p.author || '马叔吖（天马黑珍珠）')}</author>
      <description>${escXml(p.excerpt || p.title)}</description>
    </item>`;
}).join('\n');

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(cfg.name)} — 原创营销笔记与工具导航</title>
    <link>${BASE}/</link>
    <description>${escXml(cfg.description)}</description>
    <language>zh-CN</language>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(PUBLIC, 'rss.xml'), rssXml, 'utf8');

console.log(`[prebuild-sync] Synced ${searchIndex.length} search items, llms.txt, llms-full.txt, and rss.xml.`);
