
const fs = require("fs")
const path = require("path")

/* =======================================================
CONFIG
======================================================= */

const BASE_URL = "https://zanpath.com"

//const CONTENT_DIR = path.join(process.cwd(), "content/articles/en")

const IMAGE_BASE = "/images/auto"

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

function slugify(text) {

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

}

function countWords(text) {

  return text
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length

}

function readingTime(text) {

  const words = countWords(text)

  return Math.max(1, Math.round(words / 200))

}

/* =======================================================
LOAD EXISTING ARTICLES
======================================================= */

function loadAllArticles(locale) {
  let articles = []
  // 动态生成目录路径
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
          path: file,
          locale: data.locale // 记录语言
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

      scored.push({
        ...a,
        score
      })

    }

  }

  scored.sort((a,b)=>b.score-a.score)

  return scored.slice(0,6)

}

/* =======================================================
INTERNAL LINKS
======================================================= */

function buildInternalLinks(article, related) {

  let links = []

  for (let r of related) {

    links.push({

      anchor: r.title,
      url: `/${article.locale}/wisdom/${r.module}/${r.slug}`

    })

  }

  return links

}

/* =======================================================
TOPIC CLUSTER DETECTION
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

/* =======================================================
PILLAR PAGE MAP
======================================================= */

// 增加 locale 参数接收
function buildPillar(cluster, locale) {
  const map = {
    "bazi-analysis": "life-path",
    "five-elements": "life-path",
    "feng-shui": "feng-shui",
    "face-reading": "face-reading",
    "dream-interpretation": "dream",
    "name-analysis": "naming"
  }

  const modulePath = map[cluster] || cluster;
  return `/${locale}/wisdom/${modulePath}`;
}

/* =======================================================
IMAGE INSERTION
======================================================= */

function insertImages(html) {

  if (!html) return html

  const parts = html.split("<h2>")

  if (parts.length <= 2) return html

  let result = parts[0]

  for (let i = 1; i < parts.length; i++) {

    const image = `
<img
 loading="lazy"
 decoding="async"
 src="${IMAGE_BASE}/section-${i}.webp"
 alt="illustration"
 class="rounded-xl my-6"
/>
`

    result += "<h2>" + image + parts[i]

  }

  return result

}

/* =======================================================
SNIPPET OPTIMIZATION
======================================================= */

function optimizeSnippet(article) {

  if (!article.summary) return article

  if (!article.featuredSnippetAnswer) {

    article.featuredSnippetAnswer =
      article.summary.slice(0,180)

  }

  return article

}

/* =======================================================
META DESCRIPTION OPTIMIZATION
======================================================= */

function optimizeMetaDescription(article) {

  if (!article.metaDescription) return article

  if (article.metaDescription.length > 155) {

    article.metaDescription =
      article.metaDescription.slice(0,155)

  }

  return article

}

/* =======================================================
CANONICAL FIX
======================================================= */

function fixCanonical(article) {
  article.canonical = `${BASE_URL}/${article.locale}/wisdom/${article.module}/${article.slug}`
  return article
}


/* =======================================================
FAQ SCHEMA
======================================================= */

function buildFAQSchema(article) {

  if (!article.faq) return null

  if (!Array.isArray(article.faq)) return null

  if (article.faq.length === 0) return null

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

/* =======================================================
ARTICLE SCHEMA
======================================================= */

function buildArticleSchema(article) {

  return {

    "@context": "https://schema.org",

    "@type": "Article",

    "headline": article.title,

    "description": article.metaDescription,

    "image": `${BASE_URL}${article.coverImage}`,

    "author": {

      "@type": "Organization",
      "name": "ZanPath"

    },

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

/* =======================================================
BREADCRUMB SCHEMA
======================================================= */

function buildBreadcrumbSchema(article) {
  const loc = article.locale; // 获取语言代码
  return {

    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    "itemListElement": [

      {

        "@type": "ListItem",

        "position": 1,

        "name": "Home",

        "item": `${BASE_URL}/${loc}`

      },

      {

        "@type": "ListItem",

        "position": 2,

        "name": "Wisdom",

        "item": `${BASE_URL}/${loc}/wisdom`

      },

      {

        "@type": "ListItem",

        "position": 3,

        "name": article.module,

        "item": `${BASE_URL}/${loc}/wisdom/${article.module}`

      },

      {

        "@type": "ListItem",

        "position": 4,

        "name": article.title,

        "item": article.canonical

      }

    ]

  }

}

/* =======================================================
IMAGE ALT OPTIMIZATION
======================================================= */

function optimizeImageAlt(html, keyword) {

  if (!html) return html

  return html.replace(
    /alt="illustration"/g,
    `alt="${keyword || "article illustration"}"`
  )

}

/* =======================================================
INJECT INTERNAL LINKS INTO HTML
======================================================= */

function injectInternalLinks(html, links) {

  if (!links || links.length === 0) return html

  let modified = html

  for (let link of links) {

    const anchor = link.anchor
    const url = link.url
    const regex = new RegExp(anchor, "i")

    if (regex.test(modified)) {

      // --- 修复处：填入正确的 URL 并去掉标签内多余空格 ---
      modified = modified.replace(
        regex,
        `<a href="${url}">${anchor}</a>`
      )

    }

  }

  return modified

}

/* =======================================================
TOPIC GRAPH
======================================================= */

function buildTopicGraph(article, related) {
  return {
    topic: article.topicCluster,
    pillar: article.pillarPage,
    articles: related.map(r => ({
      title: r.title,
      url: `/${article.locale}/wisdom/${r.module}/${r.slug}` // 改这里
    }))
  }
}

/* =======================================================
STRUCTURED DATA BUILDER
======================================================= */

function buildStructuredData(article) {

  const schemas = []

  const articleSchema = buildArticleSchema(article)

  const breadcrumbSchema = buildBreadcrumbSchema(article)

  schemas.push(articleSchema)

  schemas.push(breadcrumbSchema)

  const faqSchema = buildFAQSchema(article)

  if (faqSchema) {

    schemas.push(faqSchema)

  }

  return schemas

}

/* =======================================================
ENHANCE SEO MAIN FUNCTION
======================================================= */

function enhanceArticleSEO(article) {

  if (!article) return article

  const allArticles = loadAllArticles(article.locale)

  /* -------------------------------- */

  const related = buildRelatedArticles(article, allArticles)

  article.relatedArticles = related.map(r => ({

    title: r.title,

    url: `/${article.locale}/wisdom/${r.module}/${r.slug}`

  }))

  /* -------------------------------- */

  article.internalLinks = buildInternalLinks(article, related)

  /* -------------------------------- */

  const cluster = detectCluster(article)

  article.topicCluster = cluster

  article.pillarPage = buildPillar(cluster, article.locale)

  /* -------------------------------- */

  if (
    article.content &&
    article.content.length > 0 &&
    article.content[0].text
  ) {

    let html = article.content[0].text

    html = insertImages(html)

    html = optimizeImageAlt(html, article.primaryKeyword)

    html = injectInternalLinks(html, article.internalLinks)

    article.content[0].text = html

  }

  /* -------------------------------- */

  article = optimizeSnippet(article)

  article = optimizeMetaDescription(article)

  article = fixCanonical(article)

  /* -------------------------------- */

  if (
    article.content &&
    article.content.length > 0
  ) {

    article.readingTime =
      readingTime(article.content[0].text)

  }

  /* -------------------------------- */

  article.topicGraph =
    buildTopicGraph(article, related)

  /* -------------------------------- */

  article.structuredData =
    buildStructuredData(article)

  /* -------------------------------- */

  return article

}

/* =======================================================
EXPORT
======================================================= */

module.exports = {

  enhanceArticleSEO

}
