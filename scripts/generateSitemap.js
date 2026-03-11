const fs = require("fs");
const path = require("path");

const SITE_URL = "https://zanpath.com";
const CONTENT_DIR = path.join(__dirname, "../content/articles");
const SITEMAP_DIR = path.join(__dirname, "../public/sitemaps");

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function escapeXml(str) {
  return str ? str.replace(/[<>&"']/g, (m) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[m])) : "";
}

// 递归扫描所有 JSON 文章
function getAllArticles() {
  let results = [];
  const locales = ["en", "es"]; // 你的语言目录

  locales.forEach(locale => {
    const localeDir = path.join(CONTENT_DIR, locale);
    if (!fs.existsSync(localeDir)) return;

    const modules = fs.readdirSync(localeDir);
    modules.forEach(moduleName => {
      const modulePath = path.join(localeDir, moduleName);
      if (!fs.statSync(modulePath).isDirectory()) return;

      const files = fs.readdirSync(modulePath);
      files.forEach(file => {
        if (file.endsWith(".json")) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(modulePath, file), "utf8"));
            results.push(data);
          } catch (e) {
            console.error(`Error reading ${file}:`, e);
          }
        }
      });
    });
  });
  return results;
}

function generate() {
  console.log("🚀 Starting full sitemap regeneration...");
  ensureDir(SITEMAP_DIR);

  const articles = getAllArticles();
  
  // 1. 生成 Article Sitemap
  let articleXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 2. 生成 Image Sitemap
  let imageXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  articles.forEach(art => {
    const url = art.canonical || `${SITE_URL}/${art.locale}/wisdom/${art.module}/${art.slug}`;
    
    // 1. 添加文章链接
    articleXml += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${art.dateModified || art.datePublished}</lastmod>\n  </url>\n`;

    // 2. 提取图片逻辑
    let imageUrls = [];

    // 提取封面图
    if (art.coverImage) imageUrls.push(art.coverImage);

    // 提取正文 HTML 中的所有 <img> 标签的 src
    if (art.content && Array.isArray(art.content)) {
      art.content.forEach(section => {
        if (section.type === 'html' && section.text) {
          // 使用正则匹配 src="..." 里的路径
          const imgReg = /<img [^>]*src="([^"]+)"/g;
          let match;
          while ((match = imgReg.exec(section.text)) !== null) {
            imageUrls.push(match[1]);
          }
        }
      });
    }

    // 去重并过滤掉不合法的路径
    const uniqueImages = [...new Set(imageUrls)].filter(img => img && img.startsWith('/'));

    // 3. 写入 Image Sitemap
    if (uniqueImages.length > 0) {
      imageXml += `  <url>\n    <loc>${url}</loc>\n`;
      uniqueImages.forEach(imgUrl => {
        imageXml += `    <image:image>\n      <image:loc>${SITE_URL}${imgUrl}</image:loc>\n      <image:title>${escapeXml(art.title)}</image:title>\n      <image:caption>${escapeXml(art.metaDescription)}</image:caption>\n    </image:image>\n`;
      });
      imageXml += `  </url>\n`;
    }
  });

  articleXml += `</urlset>`;
  imageXml += `</urlset>`;

  // 写入文件 (覆盖原有文件)
  fs.writeFileSync(path.join(SITEMAP_DIR, "article-sitemap.xml"), articleXml);
  fs.writeFileSync(path.join(SITEMAP_DIR, "image-sitemap.xml"), imageXml);

  // 3. 生成主入口 Sitemap Index
  const mainXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemaps/article-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemaps/image-sitemap.xml</loc>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(SITEMAP_DIR, "sitemap.xml"), mainXml);
  
  console.log(`✅ Success! Generated sitemaps for ${articles.length} articles.`);
}

generate();