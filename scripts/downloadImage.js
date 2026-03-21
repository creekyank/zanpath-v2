
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import slugify from "slugify";
import sharp from "sharp";
import crypto from "crypto";
import dotenv from "dotenv";

const envPath = "E:/zanpath v2/.env";
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

/* ------------------------- */
/* 下载并处理图片 (健壮版) */
/* ------------------------- */
async function downloadAndProcess(url, savePath) {
    try {
      console.log(`正在从 URL 下载: ${url.substring(0, 50)}...`);
      const res = await fetch(url, { 
        timeout: 20000, // 增加到 20 秒
        headers: { 'User-Agent': 'Mozilla/5.0' } 
      }); 
  
      if (!res.ok) {
        console.error(`❌ 下载请求失败: ${res.status}`);
        return false;
      }
  
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 核心修复：检查 Buffer 长度，防止 0KB 文件写入
      if (buffer.length < 1000) { 
        console.error("❌ 下载的文件过小或损坏 (0KB)，已跳过");
        return false;
      }
      if (buffer.length < 50 * 1024) { 
        console.log(`⚠️ 图片文件仅有 ${(buffer.length / 1024).toFixed(1)} KB，质量太差，已跳过`);
        return false;
      }
  
      const hash = crypto.createHash("md5").update(buffer).digest("hex");

      if (usedHashes.has(hash)) {
        console.log("⚠️ 检测到重复图片（全站），已跳过");
        return false;
      }
  
      if (usedHashes.size > 3000) {
        usedHashes = new Set(Array.from(usedHashes).slice(-2000));
      }
      // 使用 Sharp 处理
      const pipeline = sharp(buffer);
      const metadata = await pipeline.metadata(); // 先读取元数据确认有效性

      if (!metadata.width) throw new Error("无效的图片数据");

      const resized = pipeline
        .resize(1200, null, { withoutEnlargement: true })
        .modulate({
          brightness: 1.05,
          saturation: 0.9
        })
        .sharpen();

      // 写入物理文件
      await resized.clone().jpeg({ quality: 80 }).toFile(savePath + ".jpg");
      await resized.clone().webp({ quality: 80 }).toFile(savePath + ".webp");

      usedHashes.add(hash);     
      // ✅ 写入 JSON（关键）
      fs.writeFileSync(
        HASH_FILE,
        JSON.stringify({ used: Array.from(usedHashes) }, null, 2)
      );
      
      console.log(`✅ 成功保存: ${path.basename(savePath)}.webp`);
      return true;
  
    } catch (error) {
      console.error(`❌ 处理图片时发生错误: ${error.message}`);
      return false; 
    }
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
        return -999; // ❌ 直接废掉
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
      const res = await fetch(url, { headers: { Authorization: PEXELS_KEY }, timeout: 10000 });
      const data = await res.json();
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

  const url =
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=15&client_id=${UNSPLASH_KEY}`;

    try {
        const res = await fetch(url, { timeout: 10000 });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.results) return null;
    
        let best = null;
        let bestScore = -999;
        
        for (const p of data.results) {
          if (!isGoodQuality(p.width, p.height)) continue;
        
          const s = scoreImage(
            { width: p.width, height: p.height },
            keyword + " " + (p.alt_description || "")
          );
        
          if (s > bestScore) {
            bestScore = s;
            best = p.urls.regular;
          }
        }
        
        return best;
      } catch (e) {
        console.error(`⚠️ Unsplash 接口连接超时或重置`);
        return null; // 触发 findImage 尝试下一个 API
      }
      return null;

}

/* ------------------------- */
/* PIXABAY */
/* ------------------------- */

async function searchPixabay(keyword) {
    if (!PIXABAY_KEY) return null;
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=15`;
  
    try {
      const res = await fetch(url, { timeout: 10000 });
      if (!res.ok) return null;
      const data = await res.json();
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
    const res = await fetch(url, { timeout: 10000 });
    if (res.status === 429) {
      console.error("⚠️ 触发频率限制，跳过当前 API");
      return null;
    }
    const data = await res.json();

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
    console.error(`⚠️ Wikimedia 接口连接超时`);
    return null;
  }
  return null;
}

/* ------------------------- */
/* 多API查找（智能增强 + 模块优先级版） */
/* ------------------------- */

async function findImage(keyword, module = "default") {
    // 1. 关键词智能增强：根据模块特性自动补全英文描述，提升搜图精准度
    let baseStyle = "zen minimal abstract landscape chinese ink painting soft light calm atmosphere no people no face no portrait no human";

    let searchKeyword = `${keyword} ${baseStyle}`;
    
    if (module === 'dream') {
      searchKeyword = `${keyword} dreamlike surreal night sky mist ${baseStyle}`;
    } else if (module === 'face') {
      // ❌ 不要人脸
      searchKeyword = `${keyword} abstract aura energy glow ${baseStyle}`;
    } else if (module === 'fengshui') {
      searchKeyword = `${keyword} architecture space light shadow ${baseStyle}`;
    } else if (module === 'bazi') {
      searchKeyword = `${keyword} five elements energy flow fire water earth ${baseStyle}`;
    }
  
    // 2. 定义不同模块的 API 搜索优先级
    const priorities = {
      bazi: [searchUnsplash, searchPexels, searchPixabay, searchWikimedia],     // 优先要意境 (Unsplash强项)
      fengshui: [searchUnsplash, searchPexels, searchWikimedia, searchPixabay], // 优先要建筑/景观
      naming: [searchPixabay, searchPexels, searchUnsplash, searchWikimedia],   // 优先要具体实物 (Pixabay强项)
      dream: [searchPixabay, searchUnsplash, searchPexels, searchWikimedia],    // 优先要插画/幻想感
      face: [searchPexels, searchPixabay, searchUnsplash, searchWikimedia],     // 优先要人像 (Pexels人像质量高)
      default: [searchPexels, searchUnsplash, searchPixabay, searchWikimedia]   // 默认顺序
    };
  
    // 3. 获取当前模块的搜索顺序
    const searchOrder = priorities[module] || priorities.default;
  
    console.log(`\n针对模块 [${module}]，原始词: "${keyword}"`);
    let candidates = []; // 用于存放所有 API 返回的可选图片

    // 我们依然按顺序请求，但不再中途 return
    for (const searchFunc of searchOrder) {
      try {
        const img = await searchFunc(searchKeyword);
        
        if (img) {
          const apiName = searchFunc.name.replace('search', '');
          console.log(`✅ ${apiName} 提供了候选图`);
          candidates.push(img);
          
          // 可选性能优化：如果已经拿到 2-3 个候选了，可以提前停止，没必要跑完所有 API
          if (candidates.length >= 2) break; 
        }
      } catch (error) {
        console.error(`❌ API [${searchFunc.name}] 调用异常`);
      }
    }

    // 最后判断是否有候选图
    if (candidates.length > 0) {
      // 方案 A：返回第一个（最符合优先级的）
      // return candidates[0]; 

      // 方案 B：随机选一个（增加多样性，防止每次搜出来的都一样）
      const finalImg = candidates[Math.floor(Math.random() * candidates.length)];
      console.log(`🚀 从 ${candidates.length} 个候选源中筛选出最终图片`);
      return finalImg;
    }

    // --- 修改结束 ---

    console.log(`⚠️ 很遗憾，所有 API 均未找到符合关键词 "${keyword}" 的图片。`);
    return null;
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

  // 2. 映射实际物理文件夹 (如 fengshui -> fengshui, space -> fengshui)
  const actualFolderName = folderMap[moduleIn] || moduleIn;

  // 3. 确定存储目录
  const dir = path.join(IMAGE_DIR, actualFolderName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`🚀 开始搜图。物理路径: /images/${actualFolderName}/`);

  let index = 1;
  for (const keyword of keywords) {
    if (index > 2) break; // 每篇文章下载 2 张图

    const imgUrl = await findImage(keyword, moduleIn);
    if (!imgUrl) continue;

    // 4. 拼接完整文件名路径 (不包含后缀)
    const savePath = path.join(dir, `${slug}-${index}`);

    const success = await downloadAndProcess(imgUrl, savePath);
    if (success) {
      index++;
    }
  }
}
main();