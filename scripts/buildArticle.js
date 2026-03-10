
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://zanpath.com";

const title = process.argv[2];
const slug = process.argv[3];
const moduleName = process.argv[4];

if (!title || !slug || !moduleName) {
  console.error("Missing arguments: title slug module");
  process.exit(1);
}

/* -----------------------------
路径映射
----------------------------- */

const folderMap = {
  "life-path": "bazi",
  "dream": "dream",
  "space": "fengshui",
  "naming": "naming",
  "visual": "face"
};

const actualFolderName = folderMap[moduleName] || moduleName;

/* -----------------------------
工具函数
----------------------------- */

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/* 清洗 JSON 文件（防止 ```json 包裹） */
function loadJSON(file) {
  try {
    const raw = fs.readFileSync(file, "utf8")
      .replace(/```json|```/g, "")
      .trim();

    return JSON.parse(raw);
  } catch (e) {
    console.log("⚠ SEO JSON missing or invalid:", file);
    return {};
  }
}

/* 清洗文章内容 */
function cleanContent(content) {
  return content
    .replace(/```html|```markdown|```/g, "")
    .replace(/\\/g, "") // 防止 JSON 转义问题
    .trim();
}

/* 计算阅读时间 */
function calculateReadingTime(content) {
  const clean = content.replace(/[#*]/g, "");
  const words = clean.split(/\s+/).length;
  return Math.max(4, Math.round(words / 220));
}

/* -----------------------------
读取文章
----------------------------- */

const articleEn = cleanContent(
  fs.readFileSync("temp/article_en.txt", "utf8")
);

const articleEs = cleanContent(
  fs.readFileSync("temp/article_es.txt", "utf8")
);

/* -----------------------------
读取 SEO
----------------------------- */

const seoDataEn = loadJSON("temp/seo_en.json");
const seoDataEs = loadJSON("temp/seo_es.json");

const today = new Date().toISOString().split("T")[0];

/* -----------------------------
CTA 动态逻辑
----------------------------- */

function generateCTA(locale, moduleName) {
  const map = {

    "life-path": {
      en: {
        text: "Discover your personal Bazi life path and career potential with an AI-powered analysis.",
        button: "Start Now"
      },
      es: {
        text: "Descubre tu camino de vida Bazi y tu potencial profesional con un análisis impulsado por IA.",
        button: "Comenzar"
      }
    },

    "dream": {
      en: {
        text: "Decode the symbolic messages hidden in your dreams with an AI dream reflection.",
        button: "Analyze My Dream"
      },
      es: {
        text: "Descifra los mensajes simbólicos ocultos en tus sueños con un análisis de sueños con IA.",
        button: "Analizar mi sueño"
      }
    },

    "naming": {
      en: {
        text: "Unlock a meaningful name aligned with destiny using AI-powered name analysis.",
        button: "Find a Name"
      },
      es: {
        text: "Descubre un nombre significativo alineado con el destino con análisis de nombres con IA.",
        button: "Encontrar un nombre"
      }
    },

    "space": {
      en: {
        text: "Improve the energy of your space with a personalized AI Feng Shui analysis.",
        button: "Analyze My Space"
      },
      es: {
        text: "Mejora la energía de tu espacio con un análisis Feng Shui personalizado con IA.",
        button: "Analizar mi espacio"
      }
    },

    "visual": {
      en: {
        text: "Unlock personality and destiny insights hidden in facial features through AI face reading.",
        button: "Analyze My Face"
      },
      es: {
        text: "Descubre rasgos de personalidad y destino ocultos en tu rostro mediante lectura facial con IA.",
        button: "Analizar mi rostro"
      }
    }

  };

  const data = map[moduleName] || map["dream"];

  const url = `${SITE_URL}/${locale}/wisdom/${moduleName}`;

  return {
    text: data[locale].text,
    button: data[locale].button,
    url: url
  };
}

/* -----------------------------
构建文章 JSON
----------------------------- */

function buildArticle(locale, content, seo) {

  const canonical = `${SITE_URL}/${locale}/wisdom/${moduleName}/${slug}`;

  const cta = generateCTA(locale, moduleName);

  return {

    id: slug,
    locale: locale,
    module: moduleName,
    slug: slug,

    status: "published",
    featured: false,

    title: title,

    metaTitle: seo.metaTitle || title,
    metaDescription: seo.metaDescription || "",

    primaryKeyword: seo.primaryKeyword || "",

    secondaryKeywords: seo.secondaryKeywords || [],
    longTailKeywords: seo.longTailKeywords || [],
    semanticKeywords: seo.semanticKeywords || [],

    keywords: seo.keywords || [],

    cluster: seo.cluster || "",
    pillar: seo.pillar || "",

    clusterIntent: seo.clusterIntent || "informational",

    relatedArticles: seo.relatedArticles || [],

    summary: seo.summary || "",

    featuredSnippetAnswer: seo.featuredSnippetAnswer || "",

    readingTime: calculateReadingTime(content),

    datePublished: today,
    dateModified: today,
    lastReviewed: today,

    evergreenScore: 9,
    updateFrequency: "quarterly",

    revisionNotes: "Initial publication",

    targetCTR: 0.05,
    targetPosition: 5,

    optimizationGoal: "featured-snippet",

    priorityLevel: "high",

    author: {
      name: "Zanpath Editorial Team",
      type: "Organization"
    },

    publisher: {
      name: "Zanpath",
      logo: "/images/logo.png"
    },

    canonical: canonical,

    coverImage: `/images/${actualFolderName}/${slug}-1.webp`,

    ogImage: `/images/${actualFolderName}/${slug}-1.webp`,

    imageObjects: [
      {
        "@type": "ImageObject",
        "contentUrl": `/images/${actualFolderName}/${slug}-1.webp`,
        "description": title,
        "representativeOfPage": true
      },
      {
        "@type": "ImageObject",
        "contentUrl": `/images/${actualFolderName}/${slug}-2.webp`,
        "description": title
      }
    ],

    breadcrumbs: [
      { name: "Wisdom", url: `/${locale}/wisdom` },
      { name: moduleName, url: `/${locale}/wisdom/${moduleName}` },
      { name: title, url: "" }
    ],

    faq: seo.faq || [],

    suggestedAnchors: seo.suggestedAnchors || [],

    internalLinks: seo.internalLinks || [],

    content: [
      {
        type: "html",
        text: content
      }
    ],

    cta: cta
  };
}

/* -----------------------------
写入 JSON
----------------------------- */

const enDir = path.join("content/articles/en", actualFolderName);
const esDir = path.join("content/articles/es", actualFolderName);

ensureDir(enDir);
ensureDir(esDir);

const articleEN = buildArticle("en", articleEn, seoDataEn);
const articleES = buildArticle("es", articleEs, seoDataEs);

fs.writeFileSync(
  path.join(enDir, `${slug}.json`),
  JSON.stringify(articleEN, null, 2)
);

fs.writeFileSync(
  path.join(esDir, `${slug}.json`),
  JSON.stringify(articleES, null, 2)
);

console.log("✅ SEO Article JSON generated successfully:", slug);
