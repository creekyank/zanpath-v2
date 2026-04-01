
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";
import sharp from "sharp";
import crypto from "crypto";
import dotenv from "dotenv";
import axios from "axios";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 如果环境变量里有代理，就创建一个 Agent

const envPath = path.join(process.cwd(), ".env");
const envLocalPath = "E:/zanpath v2/.env.local";
if (fs.existsSync(envPath)) { dotenv.config({ path: envPath }); }
if (fs.existsSync(envLocalPath)) { dotenv.config({ path: envLocalPath }); }

// 2. 【核心修复】将变量定义移到最上方
const IMAGE_DIR = "E:/zanpath v2/public/images";
const HASH_FILE = "E:/zanpath v2/used-images.json";

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


// 3. 读取 Key
const PEXELS_KEY = process.env.PEXELS_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_KEY;
const PIXABAY_KEY = process.env.PIXABAY_KEY;

const AXIOS_INSTANCE = axios.create({
  timeout: 15 * 1000,
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

const R2 = new S3Client({
  region: "auto",
  endpoint: "https://fd7286ae4e5cfbc38be81b407ddda676.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  }
});

const BUCKET = "zanpath-v2";
const BASE_URL = "https://img.zanpath.com";

const MANIFEST_FILE = "E:/zanpath v2/data/image-manifest.json";


let manifest = {};

if (fs.existsSync(MANIFEST_FILE)) {
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8"));
  } catch {
    manifest = {};
  }
}

async function uploadToR2(buffer, key) {
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "image/webp"
  }));
}

// 统一下载图片
export async function fetchImageBuffer(url) {
  try {
    const res = await AXIOS_INSTANCE.get(url, {
      responseType: "arraybuffer"
    });

    return Buffer.from(res.data);
  } catch (err) {
    console.log("❌ axios 下载失败:", err.message);
    return null;
  }
}

// 4. 定义完之后再打印日志（这样就不会报 ReferenceError 了）
console.log("--- 环境加载检查 ---");
console.log("PEXELS_KEY:", PEXELS_KEY ? "✅ 已获取" : "❌ 未找到");
console.log("UNSPLASH_KEY:", UNSPLASH_KEY ? "✅ 已获取" : "❌ 未找到");
console.log("PIXABAY_KEY:", PIXABAY_KEY ? "✅ 已获取" : "❌ 未找到");
console.log("图片存储路径:", IMAGE_DIR); 
console.log("-------------------\n");

let usedHashes = new Set();

if (fs.existsSync(HASH_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(HASH_FILE, "utf8"));
    usedHashes = new Set(data.used || []);
    console.log(`📦 已加载历史图片 hash: ${usedHashes.size} 个`);
  } catch (e) {
    console.log("⚠️ hash 文件读取失败，重新创建");
  }
}

/* ------------------------- */
/* 判断图片质量 */
/* ------------------------- */

function isGoodQuality(width, height) {

  if (!width || !height) return false;

  if (width < 800) return false;

  if (height < 600) return false;

  return true;

}


    function scoreImage(meta = {}, keyword = "") {
      let score = 0;

      // ✅ 分辨率权重（最重要）
      if (meta.width && meta.height) {
        const area = meta.width * meta.height;

        if (area > 3000000) score += 5;      // > 3MP
        else if (area > 1500000) score += 3;
        else score -= 2;
      }

      // ✅ 横图优先（适合文章）
      if (meta.width > meta.height) score += 2;
      // ✅ 竖图降权（关键）
      if (meta.width && meta.height) {
        const ratio = meta.width / meta.height;
        if (ratio < 1) score -= 2;
      }

      // ✅ 关键词过滤（丑图来源）
      const badWords = [
        "people", "person", "face", "portrait",
        "man", "woman", "smile", "selfie",
        "group", "crowd", "ugly", "deformed"
      ];
      const lower = keyword.toLowerCase();

      if (badWords.some(w => lower.includes(w))) {
        score -= 3; // ❌ 直接废掉
      }

      // ✅ 高级感关键词（加分）
      const goodWords = ["zen", "minimal", "abstract", "nature", "landscape", "mountain"];
      if (goodWords.some(w => lower.includes(w))) {
        score += 2;
      }

      return score;
    }
/* ------------------------- */
/* PEXELS */
/* ------------------------- */

async function searchPexels(keyword) {
    if (!PEXELS_KEY) return null;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=15`;
  
    try {
      const res = await AXIOS_INSTANCE.get(url, { headers: { Authorization: PEXELS_KEY } });
      const data = res.data;
      if (!data.photos) return null;
      let best = null;
      let bestScore = -999;

      for (const p of data.photos){
        if (!isGoodQuality(p.width, p.height)) continue;

        const s = scoreImage(
          { width: p.width, height: p.height },
          keyword + " " + (p.alt || "")
        );

        if (s > bestScore) {
          bestScore = s;
          best = p.urls.regular;
        }
      }

      return best;
    } catch (e) {
      console.error(`⚠️ Pexels 接口连接超时`);
      return null;
    }
    return null;
  }

/* ------------------------- */
/* UNSPLASH */
/* ------------------------- */

async function searchUnsplash(keyword) {
  if (!UNSPLASH_KEY) return null;

  // 1. 随机生成 1 到 20 之间的页码
  const randomPage = Math.floor(Math.random() * 20) + 1;

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=15&page=${randomPage}`;

  try {
    const res = await AXIOS_INSTANCE.get(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
    });

    const data = res.data;

    // 2. 如果这一页没结果（有些冷门词可能没20页），尝试回退到第 1 页
    if (!data.results || data.results.length === 0) {
      if (randomPage === 1) return null; // 如果第1页也没图，彻底返回null
      console.log(`⚠️ 第 ${randomPage} 页无结果，回退至第 1 页: ${keyword}`);
      // 这里的逻辑可以改为直接请求第1页，避免死循环
      const fallbackRes = await AXIOS_INSTANCE.get(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=15&page=1`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
      );
      if (!fallbackRes.data.results) return null;
      data.results = fallbackRes.data.results;
    }

    let best = null;
    let bestScore = -999;

    // 3. 【核心优化】打乱本页拿到的 15 张图的顺序
    // 这样即使多次随机到同一页，也不会总是挑中分最高的那同一张
    const shuffledResults = data.results.sort(() => Math.random() - 0.5);

    for (const p of shuffledResults) {
      if (!isGoodQuality(p.width, p.height)) continue;

      // 4. 评分逻辑
      const s = scoreImage(
        { width: p.width, height: p.height },
        keyword + " " + (p.alt_description || "")
      );

      if (s > bestScore) {
        bestScore = s;
        best = p.urls.regular;
      }
    }

    if (best) {
      console.log(`📡 Unsplash 命中 (第 ${randomPage} 页随机挑选)`);
    }
    
    return best;

  } catch (e) {
    if (e.response && e.response.status === 403) {
      console.error(`❌ Unsplash API 额度耗尽 (403)`);
    } else {
      console.error(`⚠️ Unsplash 接口故障: ${e.message}`);
    }
    return null;
  }
}

/* ------------------------- */
/* PIXABAY */
/* ------------------------- */

async function searchPixabay(keyword) {
    if (!PIXABAY_KEY) return null;
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=15`;
  
    try {
      const res = await AXIOS_INSTANCE.get(url, { 
        headers: { Authorization: PIXABAY_KEY }
      });
      const data = res.data;
      // 修正：Pixabay 使用的是 .hits
      if (!data.hits) return null; 
  
      let best = null;
      let bestScore = -999;

      for (const p of data.hits) {
        if (!isGoodQuality(p.width, p.height)) continue;

        const s = scoreImage(
          { width: p.width, height: p.height },
          keyword
        );

        if (s > bestScore) {
          bestScore = s;
          best = p.largeImageURL;
        }
      }

      return best;
    } catch (e) {
      console.error(`⚠️ Pixabay 接口连接超时或重置`);
      return null;
    }
    return null;
  }

/* ------------------------- */
/* WIKIMEDIA */
/* ------------------------- */
async function searchWikimedia(keyword) {
  // 1. URL 关键修改：iiprop 加入了 size
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(keyword)}&gsrlimit=5&prop=imageinfo&iiprop=url|size&format=json&origin=*`;

  try {
    const res = await AXIOS_INSTANCE.get(url);
    if (res.status === 429) {
      console.error("⚠️ 触发频率限制，跳过当前 API");
      return null;
    }
    const data = res.data;

    if (!data.query || !data.query.pages) return null;

    const pages = Object.values(data.query.pages);
    for (const p of pages) {
      if (p.imageinfo && p.imageinfo[0]) {
        const info = p.imageinfo[0];
        const imageUrl = info.url.toLowerCase();

        // 2. 综合判断：格式必须对，且尺寸必须达标
        const isCorrectFormat = 
          imageUrl.endsWith(".jpg") || 
          imageUrl.endsWith(".jpeg") || 
          imageUrl.endsWith(".png") ||
          imageUrl.endsWith(".webp");

        const isLargeEnough = info.width > 800 && info.height > 600;

        if (isCorrectFormat && isLargeEnough) {
          return info.url; // 只有两个条件都满足才返回
        }
        
        // 如果其中一个不满足，循环会继续尝试下一张图
      }
    }
  } catch (e) {
    if (e.response && e.response.status === 429) {
      console.error("⚠️ 触发 Wikimedia 频率限制");
    } else {
      console.error(`⚠️ Wikimedia 接口连接超时: ${e.message}`);
    }
    return null;
}
}

// 免 API 方案 1：Wallhaven 爬取
async function searchWallhaven(keyword) {
  const url = `https://wallhaven.cc/search?q=${encodeURIComponent(keyword)}&purity=100`;
  try {
    const res = await AXIOS_INSTANCE.get(url, { responseType: 'text' });
    const html = res.data;
    // 匹配第一张缩略图对应的原图链接
    const match = html.match(/data-src="(https:\/\/w\.wallhaven\.cc\/full\/.*?\.jpg)"/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

// 免 API 方案 3：Picsum (兜底种子图)
async function searchPicsum(keyword) {
  return `https://picsum.photos/seed/${encodeURIComponent(keyword)}/1200/800`;
}
/* ------------------------- */
/* 多API查找（智能增强 + 模块优先级版） */
/* ------------------------- */

async function findImage(keyword, module = "default") {
  // 1️⃣ 基础风格
  const baseStyle = "zen minimal photography";

  // 2️⃣ 核心修改：直接合并，不要层层叠加
  // 我们只拿 AI 给的 keyword，加上最基础的 baseStyle 即可
  let searchKeyword = `${keyword} ${baseStyle}`;
  
  // 3️⃣ 模块化微调（仅在必要时添加一个词，不要用 += 堆砌）
  if (module === 'dream') {
    searchKeyword += " ethereal";
  } else if (module === 'face' || module === 'visual') {
    searchKeyword += " clean detail close up natural light";
  } else if (module === 'fengshui' || module === 'space') {
    searchKeyword += " interior";
  }

  // =========================
  // API 优先级
  // =========================
  const priorities = {
    bazi: [searchUnsplash, searchPixabay, searchWikimedia, searchPexels, searchWallhaven],
    fengshui: [searchUnsplash, searchWallhaven, searchPexels, searchWikimedia, searchPixabay],
    naming: [searchUnsplash, searchPixabay, searchPexels, searchWallhaven, searchWikimedia],
    dream: [searchUnsplash, searchPixabay, searchWallhaven, searchPexels, searchWikimedia],
    face: [searchUnsplash, searchPixabay, searchWallhaven, searchPexels, searchWikimedia], // ✅ 已去人像优先
    default: [searchUnsplash, searchPexels, searchWallhaven, searchPixabay, searchWikimedia]
  };

  const searchOrder = priorities[module] || priorities.default;

  console.log(`\n🔍 搜图关键词: ${searchKeyword}`);

  // =========================
  // 搜图核心逻辑
  // =========================
  for (const searchFunc of searchOrder) {
    try {
        const imgUrl = await searchFunc(searchKeyword);
        if (!imgUrl) continue;

        const apiName = searchFunc.name.replace('search', '');
        console.log(`📡 ${apiName} 返回图片`);

        const buffer = await fetchImageBuffer(imgUrl);

        if (!buffer) {
          console.log("⚠️ 下载失败");
          continue;
        }

        if (buffer.length < 30 * 1024) {
          console.log(`⚠️ 图片太小，跳过`);
          continue;
        }

        const hash = crypto.createHash("md5").update(buffer).digest("hex");

        if (usedHashes.has(hash)) {
            console.log(`❌ 重复图片，换源`);
            continue;
        }

        console.log(`✅ 命中图片 (${(buffer.length/1024).toFixed(1)}KB)`);
        return { buffer, hash, url: imgUrl };

    } catch (error) {
      console.error(`❌ API异常: ${error.message}`);
    }
  }

  console.log("⚠️ 所有API失败");
  return null;
}

  /* ------------------------- */
/* 图像处理与保存 (针对探测后的 Buffer) */
/* ------------------------- */
async function processAndUpload(buffer, hash, folder, slug, index) {
  try {
    const webpBuffer = await sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const key = `${folder}/${slug}-${index}.webp`;

    await uploadToR2(webpBuffer, key);

    if (usedHashes.size > 5000) {
      usedHashes = new Set(Array.from(usedHashes).slice(-3000));
    }

    usedHashes.add(hash);

    fs.writeFileSync(
      HASH_FILE,
      JSON.stringify({ used: Array.from(usedHashes) }, null, 2)
    );

    console.log(`☁️ 已上传 R2: ${key}`);
    return true;

  } catch (e) {
    console.log("❌ 上传失败:", e.message);
    return false;
  }
}
/* ------------------------- */
/* ALT 文本生成 */
/* ------------------------- */

function generateAlt(keyword) {

  return keyword.replace(/-/g, " ");

}

/* ------------------------- */
/* 主程序 */
/* ------------------------- */
async function main() {
  // 参数顺序：0:node, 1:script, 2:title, 3:slug, 4:module, 5...:keywords
  const title = process.argv[2];
  const slug = process.argv[3];
  const moduleIn = process.argv[4];
  const rawKeywords = process.argv.slice(5);

  if (!title || !slug || !moduleIn || rawKeywords.length === 0) {
    console.log('用法: node downloadImage.js "Title" "slug" "module" "keywords1, keyword2"');
    return;
  }


  const keywords = rawKeywords.join(',').split(',').map(k => k.trim()).filter(k => k);
  const actualFolderName = folderMap[moduleIn] || moduleIn;
  const dir = path.join(IMAGE_DIR, actualFolderName);
  keywords.sort(() => Math.random() - 0.5);

  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`🚀 开始任务: ${title}`);
  console.log(`📂 目标文件夹: /images/${actualFolderName}/`);

  let downloadedCount = 0;
  
  // 遍历所有提供的关键词，直到凑齐 2 张图
  const MAX_TRY = 10;
  let tryCount = 0;

  for (const keyword of keywords) {
    if (downloadedCount >= 2) break;
    if (tryCount >= MAX_TRY) break;

    tryCount++; // ✅ 每次尝试都+1（更稳定）

    const result = await findImage(keyword, moduleIn);

    if (result) {
        const index = downloadedCount + 1;

const success = await processAndUpload(
  result.buffer,
  result.hash,
  actualFolderName,
  slug,
  index
);

        if (success) {
            downloadedCount++;
        }
    } else {
        console.log(`⚠️ 关键词 "${keyword}" 搜图失败`);
    }
}

  if (downloadedCount === 0) {
      console.error(`❌ 严重警告: 未能为文章 "${title}" 下载到任何唯一图片。`);
  } else {
      console.log(`✨ 任务完成：成功下载 ${downloadedCount} 张唯一图片。`);
  }

  // =========================
// ✅ 写入 manifest（只在有图时）
// =========================
  if (downloadedCount > 0) {

    const imageUrls = [];

    for (let i = 1; i <= downloadedCount; i++) {
      imageUrls.push(`${BASE_URL}/${actualFolderName}/${slug}-${i}.webp`);
    }

    manifest[slug] = {
      module: actualFolderName,
      images: imageUrls
    };

    fs.writeFileSync(
      MANIFEST_FILE,
      JSON.stringify(manifest, null, 2)
    );

    console.log("🧾 manifest 更新:", slug);

  } else {
    console.log("⚠️ 没有图片，不写入 manifest（前端将不显示图片）");
  }

}


main();