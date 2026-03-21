const fs = require("fs")
const path = require("path")

/* =======================================================
CONFIG
======================================================= */

const BASE_URL = "https://zanpath.com"

/* =======================================================
UTILS
======================================================= */

function safeJSONParse(str) {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

function countWords(text) {
  return (text || "")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length
}

function readingTime(text) {
  const words = countWords(text)
  return Math.max(3, Math.round(words / 200))
}

/* =======================================================
LOAD EXISTING ARTICLES
======================================================= */

function loadAllArticles(locale) {
  let articles = []
  const contentDir = path.join(process.cwd(), "content/articles", locale)

  if (!fs.existsSync(contentDir)) return articles

  const modules = fs.readdirSync(contentDir)

  for (let module of modules) {
    const dir = path.join(contentDir, module)
    if (!fs.statSync(dir).isDirectory()) continue

    const files = fs.readdirSync(dir)

    for (let f of files) {
      if (!f.endsWith(".json")) continue

      const file = path.join(dir, f)

      try {
        const data = safeJSONParse(fs.readFileSync(file, "utf8"))
        if (!data) continue

        articles.push({
          title: data.title,
          slug: data.slug,
          module: data.module,
          keywords: data.keywords || [],
          locale: data.locale
        })

      } catch {}
    }
  }

  return articles
}

/* =======================================================
KEYWORD SIMILARITY
======================================================= */

function keywordSimilarity(a, b) {
  let score = 0
  const aKeys = a.keywords || []
  const bKeys = b.keywords || []

  for (let k of aKeys) {
    if (bKeys.includes(k)) score++
  }

  return score
}

/* =======================================================
RELATED ARTICLES
======================================================= */

function buildRelatedArticles(current, all) {
  let scored = []

  for (let a of all) {
    if (a.slug === current.slug) continue

    const score = keywordSimilarity(current, a)

    if (score > 0) {
      scored.push({ ...a, score })
    }
  }

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 6)
}

/* =======================================================
INTERNAL LINKS（结构化，不污染 text）
======================================================= */

function attachInlineLinks(blocks, links) {
  if (!blocks || !Array.isArray(blocks)) return blocks
  if (!links || links.length === 0) return blocks

  let used = new Set()

  return blocks.map(block => {

    if (block.type !== "p") return block
    if (!block.text) return block

    let text = block.text

    let inlineLinks = []

    for (let link of links) {

      if (used.has(link.url)) continue

      if (text.toLowerCase().includes(link.anchor.toLowerCase())) {

        inlineLinks.push({
          anchor: link.anchor,
          url: link.url
        })

        used.add(link.url)

        if (inlineLinks.length >= 2) break
      }
    }

    if (inlineLinks.length > 0) {
      return {
        ...block,
        links: inlineLinks   // ✅ 新增字段，不污染 text
      }
    }

    return block
  })
}

/* =======================================================
TOPIC CLUSTER
======================================================= */

function detectCluster(article) {
  const map = {
    "bazi": "bazi-analysis",
    "five elements": "five-elements",
    "feng shui": "feng-shui",
    "face reading": "face-reading",
    "dream": "dream-interpretation",
    "name": "name-analysis"
  }

  for (let k of article.keywords || []) {
    if (map[k]) return map[k]
  }

  return article.module
}

function buildPillar(cluster, locale) {
  const map = {
    "bazi-analysis": "life-path",
    "five-elements": "life-path",
    "feng-shui": "feng-shui",
    "face-reading": "face-reading",
    "dream-interpretation": "dream",
    "name-analysis": "naming"
  }

  const modulePath = map[cluster] || cluster
  return `/${locale}/wisdom/${modulePath}`
}

/* =======================================================
SCHEMA（完全安全）
======================================================= */

function buildArticleSchema(article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription,
    "image": article.coverImage,
    "author": { "@type": "Organization", "name": "ZanPath" },
    "publisher": {
      "@type": "Organization",
      "name": "ZanPath",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.canonical
    }
  }
}

function buildFAQSchema(article) {
  if (!article.faq || !Array.isArray(article.faq) || article.faq.length === 0) {
    return null
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faq.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  }
}

/* === 在 buildBreadcrumbSchema 中恢复美化逻辑 === */
function buildBreadcrumbSchema(article) {
  const loc = article.locale;
  
  // 救回原来的翻译字典
  const moduleNameMap = {
    "en": {
      "life-path": "Life Path",
      "feng-shui": "Feng Shui",
      "dream": "Dream Interpretation",
      "naming": "Baby Naming"
    },
    "es": {
      "life-path": "Camino de la Vida",
      "feng-shui": "Feng Shui",
      "dream": "Interpretación de Sueños",
      "naming": "Nombres de Bebés"
    }
  };

  const prettyModuleName = (moduleNameMap[loc] && moduleNameMap[loc][article.module]) 
    || article.module.charAt(0).toUpperCase() + article.module.slice(1);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": loc === "es" ? "Inicio" : "Home", "item": `${BASE_URL}/${loc}` },
      { "@type": "ListItem", "position": 2, "name": loc === "es" ? "Sabiduría" : "Wisdom", "item": `${BASE_URL}/${loc}/wisdom` },
      { "@type": "ListItem", "position": 3, "name": prettyModuleName, "item": `${BASE_URL}/${loc}/wisdom/${article.module}` },
      { "@type": "ListItem", "position": 4, "name": article.title, "item": article.canonical }
    ]
  };
}

function buildStructuredData(article) {
  const schemas = []

  schemas.push(buildArticleSchema(article))
  schemas.push(buildBreadcrumbSchema(article))

  const faq = buildFAQSchema(article)
  if (faq) schemas.push(faq)

  return schemas
}


function optimizeMetaDescription(article) {
  if (!article.metaDescription) return article;
  if (article.metaDescription.length > 155) {
    article.metaDescription = article.metaDescription.slice(0, 155).trim() + "...";
  }
  return article;
}

function optimizeSnippet(article) {
  if (!article.summary) return article;
  if (!article.featuredSnippetAnswer) {
    article.featuredSnippetAnswer = article.summary.slice(0, 180).trim() + "...";
  }
  return article;
}

/* === 在 enhanceArticleSEO 中增加 Alt 优化逻辑 === */
function optimizeBlocksAlt(blocks, keyword) {
  if (!blocks || !keyword) return blocks;
  return blocks.map(block => {
    if (block.type === "image") {
      return {
        ...block,
        alt: `${keyword} ${block.alt || "illustration"}` // 把主关键词拼接到 Alt 前面
      };
    }
    return block;
  });
}

/* =======================================================
MAIN
======================================================= */

/* =======================================================
MAIN
======================================================= */

function enhanceArticleSEO(article) {
  if (!article) return article

  const allArticles = loadAllArticles(article.locale);
  const related = buildRelatedArticles(article, allArticles);

  // 1. 生成内链原始数据
  article.internalLinks = related.map(r => ({
    anchor: r.title,
    url: `/${article.locale}/wisdom/${r.module}/${r.slug}`
  }));

  // ✅ 修正：必须把 related 赋值给 relatedArticles，否则前端拿不到数据
  article.relatedArticles = related.map(r => ({
    title: r.title,
    url: `/${article.locale}/wisdom/${r.module}/${r.slug}`
  }));

  // 2. 结构化处理 Blocks (内链 + 图片 Alt)
  // 注意：确保 article.content 是数组
  if (Array.isArray(article.content)) {
    article.content = attachInlineLinks(article.content, article.internalLinks);
    article.content = optimizeBlocksAlt(article.content, article.primaryKeyword);
  }

  // 3. 基础 SEO 字段修剪 (长度截断)
  article = optimizeSnippet(article);
  article = optimizeMetaDescription(article);

  // 4. 路径与集群逻辑
  const cluster = detectCluster(article);
  article.topicCluster = cluster;
  article.pillarPage = buildPillar(cluster, article.locale);
  article.canonical = `${BASE_URL}/${article.locale}/wisdom/${article.module}/${article.slug}`;

  // 5. 阅读时间计算
  if (article.content?.length) {
    const text = article.content
      .filter(b => b.type === "p")
      .map(b => b.text)
      .join(" ");
    article.readingTime = readingTime(text);
  }

  // 6. 生成结构化数据 (Schema)
  article.structuredData = buildStructuredData(article);

  // 7. Topic Graph (用于 SEO 图谱)
  article.topicGraph = {
    topic: article.topicCluster,
    pillar: article.pillarPage,
    articles: article.relatedArticles
  };

  // ✅ 关键：强制纯 JSON（防炸），并返回
  return JSON.parse(JSON.stringify(article));
}

module.exports = {
  enhanceArticleSEO
}