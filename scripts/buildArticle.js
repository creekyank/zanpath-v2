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

  // 删除图片
  t = t.replace(/<img[\s\S]*?>/gi, "");
  t = t.replace(/!\[.*?\]\(.*?\)/g, "");
  t = t.replace(/\/images\/auto\/section-\d+\.webp/g, "");
  t = t.replace(/section-\d+\.webp/g, "");

  // 删除 Related Insights
  t = t.replace(/Related Insights[\s\S]*?(?=\n#|\n##|\n$)/gi, "");
  t = t.replace(/^Related Insights.*$/gim, "");


  // 删除 markdown image
  t = t.replace(/!\[.*?\]\(.*?\)/g, "");

  t = t.replace(/\*\*/g, "");
  t = t.replace(/\r/g, "");
  t = t.replace(/\n{3,}/g, "\n\n");

  // 删除 FAQ
  t = t.replace(/## FAQ[\s\S]*/i, "");
  t = t.replace (/^---$/gm,"");


  return t.trim();
}

/* =================================
Markdown → HTML
================================= */
function mdToBlocks(text, imageFolder, slug, title) {

  if (!text) return [];

  const img1 = `/images/${imageFolder}/${slug}-1.webp`;
  const img2 = `/images/${imageFolder}/${slug}-2.webp`;

  /* ================================
  工具函数
  ================================ */
  function slugifyAnchor(t) {
    return t
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ================================
  internal link 关键词库
  ================================ */

  const internalLinks = [
    {
      keyword: "five elements",
      url: "/en/wisdom/life-path/understanding-the-five-elements"
    },
    {
      keyword: "bazi chart",
      url: "/en/wisdom/life-path/how-to-read-a-bazi-chart"
    },
    {
      keyword: "feng shui",
      url: "/en/wisdom/space/what-is-feng-shui"
    },
    {
      keyword: "dream meaning",
      url: "/en/wisdom/dream/what-do-dreams-mean"
    }
  ];

  /* ================================
  预处理
  ================================ */

  let lines = text
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n");

    let blocks = [];
    let toc = [];
  
    let buffer = "";
  
    let h2Count = 0;
    let firstImageInserted = false;
    let snippetInserted = false;
  
    let i = 0;

  /* ================================
  段落输出
  ================================ */


  function flushParagraph() {

    if (!buffer.trim()) return;

    let paragraph = buffer.trim();

    let linkInserted = false;

    for (const link of internalLinks) {

      if (linkInserted) break;

      const regex = new RegExp(`\\b${link.keyword}\\b`, "i");

      if (regex.test(paragraph)) {

        paragraph = paragraph.replace(
          regex,
          `<a href=" " class="text-blue-600 underline">${link.keyword}</a >`
        );

        linkInserted = true;

      }

    }

    blocks.push({
      type: "p",
      text: paragraph
    });

    buffer = "";

  }

  /* ================================
  main loop
  ================================ */

  while (i < lines.length) {

    let line = lines[i].trim();

    if (!line) {

      flushParagraph();
      i++;
      continue;

    }

    /* ================================
    H1
    ================================ */

    if (line.startsWith("# ")) {

      flushParagraph();

      const h1 = line.replace(/^# /, "");

      blocks.push({
        type: "h1",
        text: h1
      });

      if (!firstImageInserted) {

        blocks.push({
          type: "image",
          src: img1,
          alt: title
        });

        firstImageInserted = true;

      }

      i++;
      continue;

    }

    /* ================================
    H2
    ================================ */

    if (line.startsWith("## ")) {

      flushParagraph();

      h2Count++;

      const h2 = line.replace(/^## /, "");
      const anchor = slugifyAnchor(h2);

      toc.push({
        text: h2,
        anchor
      });

      blocks.push({
        type: "h2",
        text: h2,
        id: anchor
      });

      if (h2Count === 2) {

        blocks.push({
          type: "image",
          src: img2,
          alt: title
        });

      }

      i++;
      continue;

    }

    /* ================================
    H3
    ================================ */

    if (line.startsWith("### ")) {

      flushParagraph();

      const h3 = line.replace(/^### /, "");

      blocks.push({
        type: "h3",
        text: h3,
        id: slugifyAnchor(h3)
      });

      i++;
      continue;

    }

    /* ================================
    UL / OL → unified list
    ================================ */

    if (
      line.startsWith("- ") ||
      line.startsWith("* ") ||
      /^\d+\.\s/.test(line)
    ) {

      flushParagraph();

      let items = [];

      while (i < lines.length) {

        let current = lines[i].trim();

        if (
          current.startsWith("- ") ||
          current.startsWith("* ") ||
          /^\d+\.\s/.test(current)
        ) {

          let item = current
            .replace(/^[-*]\s/, "")
            .replace(/^\d+\.\s/, "");

          i++;

          while (
            i < lines.length &&
            lines[i].trim() &&
            !lines[i].startsWith("- ") &&
            !lines[i].startsWith("* ") &&
            !/^\d+\.\s/.test(lines[i]) &&
            !lines[i].startsWith("#")
          ) {

            item += " " + lines[i].trim();
            i++;

          }

          items.push(item);

        } else {

          break;

        }

      }

      blocks.push({
        type: "ul",
        items
      });

      continue;

    }

    /* ================================
    normal paragraph
    ================================ */

    buffer += (buffer ? " " : "") + line;

    i++;

  }

  flushParagraph();

  /* ================================
  插入 TOC
  ================================ */

  if (toc.length > 2) {

    blocks.splice(2, 0, {
      type: "toc",
      items: toc
    });

  }


  return blocks;

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
  let blocks = mdToBlocks(article, imageFolder, slug, displayTitle);

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
  
    coverImage: img1,
    ogImage: img1,
  
    faq: seo.faq || [],
  
    content: blocks
  
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