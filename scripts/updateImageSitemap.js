const fs = require("fs");
const path = require("path");

const SITE_URL = "https://zanpath.com";

const SITEMAP_DIR = path.join(__dirname, "../public/sitemaps");

const MAX_URLS = 50000;

function ensureDir() {
  if (!fs.existsSync(SITEMAP_DIR)) {
    fs.mkdirSync(SITEMAP_DIR, { recursive: true });
  }
}

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function createArticleBase() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
}

function createImageBase() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`;
}

function createMainSitemap(files) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  files.forEach((file) => {
    xml += `
<sitemap>
<loc>${SITE_URL}/sitemaps/${file}</loc>
</sitemap>\n`;
  });

  xml += `</sitemapindex>`;
  return xml;
}

function getSitemapFiles(prefix) {
  if (!fs.existsSync(SITEMAP_DIR)) return [];

  return fs
    .readdirSync(SITEMAP_DIR)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".xml"))
    .sort((a, b) => {
      const aMatch = a.match(/\d+/);
      const bMatch = b.match(/\d+/);
      const aNum = aMatch ? parseInt(aMatch[0]) : 0;
      const bNum = bMatch ? parseInt(bMatch[0]) : 0;
      return aNum - bNum;
    });
}

function countUrls(content) {
  return (content.match(/<url>/g) || []).length;
}

function addEntryToSitemap(prefix, baseCreator, entry) {
  let files = getSitemapFiles(prefix);

  if (files.length === 0) {
    const file = `${prefix}-1.xml`;
    const filePath = path.join(SITEMAP_DIR, file);
    fs.writeFileSync(filePath, baseCreator());
    files = [file];
  }

  let lastFile = files[files.length - 1];
  let filePath = path.join(SITEMAP_DIR, lastFile);

  let content = fs.readFileSync(filePath, "utf8");

  if (countUrls(content) >= MAX_URLS) {
    const newIndex = files.length + 1;
    lastFile = `${prefix}-${newIndex}.xml`;
    filePath = path.join(SITEMAP_DIR, lastFile);

    fs.writeFileSync(filePath, baseCreator());

    content = fs.readFileSync(filePath, "utf8");
  }

  content = content.replace("</urlset>", "");
  content += entry + "\n</urlset>";

  fs.writeFileSync(filePath, content);
}

function updateMainSitemap() {
  const files = fs
    .readdirSync(SITEMAP_DIR)
    .filter((f) => f.startsWith("article-sitemap") || f.startsWith("image-sitemap"));

  const main = createMainSitemap(files);

  fs.writeFileSync(path.join(SITEMAP_DIR, "sitemap.xml"), main);
}

function updateSitemap(module, articleSlug, imageName, title = "", alt = "") {
  ensureDir();

  const articleUrl = `${SITE_URL}/${articleSlug}`;
  const imageUrl = `${SITE_URL}/images/${module}/${imageName}`;

  if (!title) title = imageName.split(".")[0].replace(/-/g, " ");
  if (!alt) alt = title;

  // ARTICLE ENTRY
  const articleEntry = `
<url>
<loc>${articleUrl}</loc>
</url>`;

  addEntryToSitemap(
    "article-sitemap",
    createArticleBase,
    articleEntry
  );

  // IMAGE ENTRY
  const imageEntry = `
<url>
<loc>${articleUrl}</loc>
<image:image>
<image:loc>${imageUrl}</image:loc>
<image:title>${escapeXml(title)}</image:title>
<image:caption>${escapeXml(alt)}</image:caption>
</image:image>
</url>`;

  addEntryToSitemap(
    "image-sitemap",
    createImageBase,
    imageEntry
  );

  updateMainSitemap();

  console.log("Sitemap updated:", articleSlug);
}

module.exports = updateSitemap;