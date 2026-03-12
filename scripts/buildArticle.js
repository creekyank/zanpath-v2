const fs = require("fs");
const path = require("path");
const { enhanceArticleSEO } = require("./seoEnhancer");
const SITE_URL = "https://zanpath.com";

/* =================================
参数
================================= */

let title = process.argv[2];
let slug = process.argv[3];
let moduleName = process.argv[4];

if (!title || !moduleName) {
  console.error("Missing arguments");
  process.exit(1);
}

/* =================================
Slug 修复
================================= */

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/^\d+\./, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

if (!slug) slug = slugify(title);

/* =================================
路径
================================= */

const BASE = "E:/zanpath v2/Wisdom";

const FILE_ARTICLE_EN = path.join(BASE, "article_en.txt");
const FILE_ARTICLE_ES = path.join(BASE, "article_es.txt");
const FILE_SEO_EN = path.join(BASE, "seo_en.json");
const FILE_SEO_ES = path.join(BASE, "seo_es.json");
const FILE_IMG = path.join(BASE, "pic_keyword.txt");

const enDir = path.join("content/articles/en", moduleName);
const esDir = path.join("content/articles/es", moduleName);

fs.mkdirSync(enDir, { recursive: true });
fs.mkdirSync(esDir, { recursive: true });

/* =================================
读取文件
================================= */

function readSafe(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

/* =================================
AI 强力文本清洗
================================= */

function cleanAIText(text) {

  if (!text) return "";

  let t = text;

  // 删除代码块
  t = t.replace(/```[\s\S]*?```/g, "");

  // 删除 AI 元信息
  t = t.replace(/Title:.*\n/g, "");
  t = t.replace(/Module:.*\n/g, "");
  t = t.replace(/Slug:.*\n/g, "");
  t = t.replace(/Keywords:.*\n/g, "");
  t = t.replace(/SEO:.*\n/g, "");

  // 删除 JSON 残留
  t = t.replace(/\{[\s\S]*?"metaTitle"[\s\S]*?\}/g, "");
  t = t.replace(/\{[\s\S]*?"title"[\s\S]*?\}/g, "");
  t = t.replace(/\{[\s\S]*?"keywords"[\s\S]*?\}/g, "");

  // ⭐ 删除 AI 插入的图片
  t = t.replace(/<img[\s\S]*?>/gi, "");

  // 删除 auto image
  t = t.replace(/\/images\/auto\/section-\d+\.webp/g, "");

  // 删除 markdown image
  t = t.replace(/!\[.*?\]\(.*?\)/g, "");

  t = t.replace(/\*\*/g, "");
  t = t.replace(/\r/g, "");
  t = t.replace(/\n{3,}/g, "\n\n");

  // 删除 FAQ
  t = t.replace(/## FAQ[\s\S]*/i, "");

  return t.trim();
}

/* =================================
Markdown → HTML
================================= */

function mdToHtml(text, imageFolder, slug, title) {

  if (!text) return "";

  text = text
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const img1 = `/images/${imageFolder}/${slug}-1.webp`;
  const img2 = `/images/${imageFolder}/${slug}-2.webp`;

  let lines = text.split("\n");

  /* ---------- MERGE BROKEN PARAGRAPHS ---------- */

  let merged = [];
  let buffer = "";

  for (let l of lines) {

    let t = l.trim();

    if (!t) {
      if (buffer) {
        merged.push(buffer);
        buffer = "";
      }
      continue;
    }

    if (t.startsWith("#") || t.startsWith("- ") || /^\d+\.\s/.test(t)) {
      if (buffer) {
        merged.push(buffer);
        buffer = "";
      }
      merged.push(t);
    } else {
      buffer += (buffer ? " " : "") + t;
    }

  }

  if (buffer) merged.push(buffer);

  lines = merged;

  let html = [];

  let inUL = false;
  let inOL = false;

  let h2Count = 0;
  let firstImageInserted = false;

  for (let raw of lines) {

    let line = raw.trim();
    if (!line) continue;

    /* ---------- H1 ---------- */

    if (line.startsWith("# ")) {

      const h1 = line.replace(/^# /, "");
    
      if (html.find(v => v.startsWith("<h1>"))) {
        html.push(`<h2>${h1}</h2>`);
      } else {
        html.push(`<h1>${h1}</h1>`);
      }
    
      if (!firstImageInserted) {
    
        html.push(`< img loading="lazy" decoding="async" src="${img1}" alt="${title}" class="rounded-xl my-6" />`);

    
        firstImageInserted = true;
      }
    
      continue;
    }

    /* ---------- H2 ---------- */

    if (line.startsWith("## ")) {

      h2Count++;

      if (h2Count === 2) {

        html.push(`< img loading="lazy" decoding="async" src="${img2}" alt="${title}" class="rounded-xl my-6" />`);
      }

      html.push(`<h2>${line.replace(/^## /, "")}</h2>`);

      continue;
    }

    /* ---------- H3 ---------- */

    if (line.startsWith("### ")) {

      html.push(`<h3>${line.replace(/^### /, "")}</h3>`);

      continue;
    }

    /* ---------- H4 ---------- */

    if (line.startsWith("#### ")) {

      html.push(`<h4>${line.replace(/^#### /, "")}</h4>`);

      continue;
    }

    /* ---------- UL ---------- */

    if (line.startsWith("- ") || line.startsWith("* ")) {

      if (!inUL) {

        if (inOL) {
          html.push("</ol>");
          inOL = false;
        }

        html.push("<ul>");
        inUL = true;
      }

      html.push(`<li>${line.replace(/^[-*] /, "")}</li>`);

      continue;
    }

    /* ---------- OL ---------- */

    if (/^\d+\.\s/.test(line)) {

      if (!inOL) {

        if (inUL) {
          html.push("</ul>");
          inUL = false;
        }

        html.push("<ol>");
        inOL = true;
      }

      html.push(`<li>${line.replace(/^\d+\.\s/, "")}</li>`);

      continue;
    }

    /* ---------- CLOSE LIST ---------- */

    if (inUL) {
      html.push("</ul>");
      inUL = false;
    }

    if (inOL) {
      html.push("</ol>");
      inOL = false;
    }

    /* ---------- SAFE TEXT CLEAN ---------- */

    line = line
      .replace(/<\/?p>/gi, "")
      .replace(/<\/?div>/gi, "")
      .replace(/<\/?span>/gi, "")
      .replace(/<\/?section>/gi, "");

    /* ---------- BOLD ---------- */

    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    /* ---------- ITALIC ---------- */

    line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");

    /* ---------- LINK ---------- */

    line = line.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" class="text-blue-600 underline">$1</a>'
    );

    /* ---------- PARAGRAPH ---------- */

    html.push(`<p>${line}</p >`);

  }

  /* ---------- CLOSE LIST END ---------- */

  if (inUL) html.push("</ul>");
  if (inOL) html.push("</ol>");

  let result = html.join("\n");

  /* ---------- FIX BAD P TAG ---------- */

  result = result.replace(/<\/p\s+>/g, "</p >");

  /* ---------- REMOVE EMPTY P ---------- */

  result = result.replace(/<p>\s*<\/p>/g, "");

  return result;

}

/* =================================
关键词清洗
================================= */

function cleanKeywords(arr) {

  if (!arr) return [];

  if (typeof arr === "string") {
    arr = arr.split(",");
  }

  if (!Array.isArray(arr)) return [];

  return arr
    .map(v => String(v).trim())
    .filter(v => v.length > 2)
    .slice(0, 10);
}

/* =================================
FAQ 修复
================================= */

function cleanFAQ(faq) {

  if (!faq) return [];

  if (!Array.isArray(faq)) return [];

  return faq
    .filter(q => q.question && q.answer)
    .slice(0, 5);
}

/* =================================
JSON 修复
================================= */

function loadSEO(file) {

  if (!fs.existsSync(file)) return {};

  try {

    let raw = fs.readFileSync(file, "utf8");

    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}") + 1;

    raw = raw.substring(start, end);

    const data = JSON.parse(raw);

    data.secondaryKeywords = cleanKeywords(data.secondaryKeywords);
    data.longTailKeywords = cleanKeywords(data.longTailKeywords);
    data.semanticKeywords = cleanKeywords(data.semanticKeywords);
    data.keywords = cleanKeywords(data.keywords);

    data.faq = cleanFAQ(data.faq);

    return data;

  } catch (e) {

    console.log("SEO JSON 修复失败");

    return {};
  }
}

/* =================================
阅读时间
================================= */

function readingTime(text) {

  const words = text.split(/\s+/).length;

  return Math.max(4, Math.round(words / 180));
}

/* =================================
生成 JSON
================================= */

function build(locale, article, seo) {
  const today = new Date().toISOString().split("T")[0];

  // 1. 映射关系
  const folderMap = {
    "life-path": "bazi",
    "dream": "dream",
    "naming": "naming",
    "space": "space",
    "visual": "visual"
  };

  const imageFolder = folderMap[moduleName] || moduleName;
  const img1 = `/images/${imageFolder}/${slug}-1.webp`;
  const img2 = `/images/${imageFolder}/${slug}-2.webp`;

  // 2. 西语标题处理
  let displayTitle = title;
  if (locale === "es" && seo.metaTitle) {
    displayTitle = seo.metaTitle.split('|')[0].split('-')[0].trim();
  }

  // 3. 生成 HTML 内容 (传入参数，内部会自动处理第 2 张图的插入)
  let finalHtml = mdToHtml(article, imageFolder, slug, displayTitle);

  // 4. 兼容性补齐：如果 AI 生成的内容里原本就带了占位符，执行替换
  finalHtml = finalHtml.replace(/\/images\/auto\/section-1\.webp/g, img1);
  finalHtml = finalHtml.replace(/\/images\/auto\/section-2\.webp/g, img2);
  
  return {

    id: slug,
    locale: locale,
    module: moduleName,
    slug: slug,

    status: "published",

    title: displayTitle,

    metaTitle: seo.metaTitle || title,

    metaDescription:
      seo.metaDescription ||
      `Explore the deeper meaning behind ${title}.`,

    primaryKeyword:
      seo.primaryKeyword || title.toLowerCase(),

    secondaryKeywords: seo.secondaryKeywords || [],
    longTailKeywords: seo.longTailKeywords || [],
    semanticKeywords: seo.semanticKeywords || [],
    keywords: seo.keywords || [],

    summary: seo.summary || "",

    featuredSnippetAnswer:
      seo.featuredSnippetAnswer || "",

    readingTime: readingTime(article),

    datePublished: today,
    dateModified: today,
    lastReviewed: today,

    canonical:
      `${SITE_URL}/${locale}/wisdom/${moduleName}/${slug}`,

    // --- 💡 修改点 3: 使用映射后的文件夹变量 ---
    coverImage: img1,
    ogImage: img1,

    faq: seo.faq || [],

    content: [
      {
        type: "html",
        text: finalHtml
      }
    ]

  };
}

/* =================================
执行
================================= */

const articleEn = cleanAIText(readSafe(FILE_ARTICLE_EN));
const articleEs = cleanAIText(readSafe(FILE_ARTICLE_ES));

const seoEn = loadSEO(FILE_SEO_EN);
const seoEs = loadSEO(FILE_SEO_ES);

// 1. 先组装基础数据
let jsonEN = build("en", articleEn, seoEn);
let jsonES = build("es", articleEs, seoEs);

// 2. 引入 SEO 增强插件

// 3. 在写入文件前，运行 SEO 增强逻辑
// 这样内部链接、Schema、相关文章才会保存进 JSON
jsonEN = enhanceArticleSEO(jsonEN);
jsonES = enhanceArticleSEO(jsonES);

// 4. 最后写入硬盘
fs.writeFileSync(
  path.join(enDir, `${slug}.json`),
  JSON.stringify(jsonEN, null, 2)
);

fs.writeFileSync(
  path.join(esDir, `${slug}.json`),
  JSON.stringify(jsonES, null, 2)
);

console.log("✅ SEO Factory JSON generated & Enhanced:", slug);