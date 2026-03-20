const fs = require("fs");
const path = require("path");
const { enhanceArticleSEO } = require("./seoEnhancer");

const SITE_URL = "https://zanpath.com";
const BASE_URL = process.env.SITE_URL || "";

const folderMap = {
  "life-path": "bazi",
  "bazi": "bazi",
  "space": "fengshui",
  "fengshui": "fengshui",
  "visual": "face",
  "face": "face",
  "dream": "dream",
  "naming": "naming"
};

/* =========================
参数
========================= */

let title = process.argv[2];
let slug = process.argv[3];
let moduleName = process.argv[4];

if (!title || !moduleName) {
  console.error("Missing arguments");
  process.exit(1);
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/^\d+\./, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

if (!slug) slug = slugify(title);

/* =========================
路径
========================= */

const BASE = "E:/zanpath v2/Wisdom";

const FILE_ARTICLE_EN = path.join(BASE, "article_en.txt");
const FILE_ARTICLE_ES = path.join(BASE, "article_es.txt");
const FILE_SEO_EN = path.join(BASE, "seo_en.json");
const FILE_SEO_ES = path.join(BASE, "seo_es.json");

const enDir = path.join(BASE, "content/articles/en", moduleName);
const esDir = path.join(BASE, "content/articles/es", moduleName);

fs.mkdirSync(enDir, { recursive: true });
fs.mkdirSync(esDir, { recursive: true });

/* =========================
工具
========================= */

function readSafe(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function loadSEO(file) {
  try {
    let raw = readSafe(file);
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}") + 1;

    raw = raw.substring(start, end);

    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/* =========================
🔥 标题提取（强版）
========================= */

function extractTitle(raw, fallback) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

  for (let line of lines) {
    let clean = line
      .replace(/\[.*?\]/g, "")
      .replace(/^#\s*/, "")
      .replace(/[¿?]/g, "")
      .trim();

    if (clean.length > 5 && clean.length < 120) {
      return clean;
    }
  }

  return fallback;
}

/* =========================
🔥 西语 CONTENT 剥离
========================= */

function extractSpanishContent(raw) {
  const parts = raw.split(/\[(?:CONTENT|Contenido)\]/i);
  return (parts[1] || raw).trim();
}

/* =========================
清洗
========================= */

function cleanContent(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\*\*/g, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* =========================
🔥 翻译修正
========================= */

function fixSpanish(text) {
  return text
    .replace(/metabolítica china/gi, "metafísica china")
    .replace(/chart/gi, "carta")
    .replace(/tronco del cielo/gi, "tronco celeste")
    .replace(/Señor del Día/gi, "Maestro del Día");
}

/* =========================
🔥 Markdown → Blocks
========================= */

function mdToBlocks(md, title) {
  const lines = md.split("\n");

  const blocks = [];
  blocks.push({ type: "h1", text: title });

  let current = [];

  function pushP() {
    if (current.length) {
      blocks.push({ type: "p", text: current.join(" ") });
      current = [];
    }
  }

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      pushP();
      blocks.push({ type: "h2", text: line.replace("## ", "") });
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      pushP();
      blocks.push({
        type: "li",
        text: line.replace(/^[-*]\s*/, "")
      });
      continue;
    }

    if (line.startsWith("# ")) continue;

    current.push(line);
  }

  pushP();
  return blocks;
}

/* =========================
阅读时间
========================= */

function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 200));
}

/* =========================
构建
========================= */

function build(locale, raw, seo, fallbackTitle) {
  const today = new Date().toISOString().split("T")[0];

  if (locale === "es") {
    raw = extractSpanishContent(raw);
  }

  let title = extractTitle(raw, fallbackTitle);
  let content = cleanContent(raw);
  // 🔥 【新增修复逻辑】删除正文开头重复的标题文字
  // 我们检查 content 是否以 currentTitle 开头，忽略大小写和标点干扰
  const titleForCompare = title.toLowerCase().trim();
  if (content.toLowerCase().startsWith(titleForCompare)) {
    // 切掉标题长度，并重新 trim
    content = content.slice(title.length).trim();
    // 如果切完之后开头剩下问号、冒号或换行，继续清理
    content = content.replace(/^[:：?？\s]+/, "");
    console.log(`[DEBUG] 已从 ${locale} 正文开头切除重复标题`);
  }



  if (locale === "es") {
    content = fixSpanish(content);
  }

  const blocks = mdToBlocks(content, title);

  const folderMap = {
    "life-path": "bazi",
    "bazi": "bazi",
    "space": "fengshui",
    "fengshui": "fengshui",
    "visual": "face",
    "face": "face",
    "dream": "dream",
    "naming": "naming"
  };

  const folder = folderMap[moduleName] || moduleName;

  return {
    id: slug,
    locale,
    module: moduleName,
    slug,
    status: "published",
    title,
    metaTitle: seo.metaTitle || title,
    metaDescription: seo.metaDescription || "",
    primaryKeyword: seo.primaryKeyword || title,
    content: blocks,
    readingTime: readingTime(content),
    datePublished: today,
    dateModified: today,
    canonical: `${SITE_URL}/${locale}/wisdom/${moduleName}/${slug}`,
    image: `${SITE_URL}/images/${folder}/${slug}-1.webp`,
    author: "ZanPath",
    category: moduleName
  };
}

/* =========================
校验
========================= */

function validate(json) {
  return json.title && json.content && json.content.length > 0;
}

/* =========================
执行
========================= */

console.log("🚀 Build Start");

const rawEn = readSafe(FILE_ARTICLE_EN);
const rawEs = readSafe(FILE_ARTICLE_ES);

const seoEn = loadSEO(FILE_SEO_EN);
const seoEs = loadSEO(FILE_SEO_ES);

let jsonEN = build("en", rawEn, seoEn, title);
let jsonES = build("es", rawEs, seoEs, title);

jsonEN = enhanceArticleSEO(jsonEN);
jsonES = enhanceArticleSEO(jsonES);

if (validate(jsonEN) && validate(jsonES)) {
  fs.writeFileSync(path.join(enDir, `${slug}.json`), JSON.stringify(jsonEN, null, 2));
  fs.writeFileSync(path.join(esDir, `${slug}.json`), JSON.stringify(jsonES, null, 2));
  console.log("✅ DONE:", slug);
} else {
  console.error("❌ JSON invalid");
}