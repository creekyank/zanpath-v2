
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import slugify from "slugify";
import sharp from "sharp";
import crypto from "crypto";
import dotenv from "dotenv";

import { HttpsProxyAgent } from "https-proxy-agent";

// 如果环境变量里有代理，就创建一个 Agent
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || "http://127.0.0.1:7897";
const agent = new HttpsProxyAgent(proxy);

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
      const res = await fetch(url, { headers: { Authorization: PEXELS_KEY }, timeout: 15000,
        agent: agent });
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
      const res = await fetch(url, { 
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }, // 加上 Client-ID 前缀
        timeout: 15000,
        agent: agent 
    });
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
      const res = await fetch(url, { 
        headers: { Authorization: PIXABAY_KEY }, 
        timeout: 15000,
        agent: agent // <--- 关键：这里也要加
      });
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
    const res = await fetch(url, { timeout: 10000,
      agent: agent });
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
    let baseStyle = "zen minimal abstract landscape chinese ink painting soft light calm atmosphere";

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
  
    console.log(`\n🔍 正在搜寻唯一图片: "${keyword}" (模块: ${module})`);
    // 3. 核心逻辑：遍历 API 寻找非重复图
    for (const searchFunc of searchOrder) {
      try {
          const imgUrl = await searchFunc(searchKeyword);
          if (!imgUrl) continue;

          const apiName = searchFunc.name.replace('search', '');
          console.log(`📡 ${apiName} 返回了图片: ${imgUrl.substring(0, 40)}...`);

          // 预下载并计算 Hash
          const res = await fetch(imgUrl, { 
              timeout: 30000, 
              agent: agent,
              headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
            }
          });

          if (!res.ok) {
              console.log(`⚠️ ${apiName} 下载图片失败 (HTTP ${res.status})`);
              continue;
          }

          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // 基础质量拦截
          if (buffer.length < 30 * 1024) {
            console.log(`⚠️ ${apiName} 图片体积过小 (${(buffer.length/1024).toFixed(1)}KB)，跳过`);
            continue;
        }

          const hash = crypto.createHash("md5").update(buffer).digest("hex");

          // 检查重复
          if (usedHashes.has(hash)) {
              console.log(`❌ ${apiName} 提供的图片全站重复 (Hash 冲突)，强制换源搜索...`);
              continue; // 👈 关键：发现重复，不退出，继续找下一个 API
          }

          // 走到这里说明找到了全站唯一的图
          console.log(`✅ 找到唯一图片！来源: ${apiName} (${(buffer.length/1024).toFixed(1)}KB)`);
            return { buffer, hash, url: imgUrl };

      } catch (error) {
        console.error(`❌ API [${searchFunc.name}] 异常: ${error.message}`);
      }
  }

    return null; // 所有 API 都跑完了也没找到不重复的
  }


  /* ------------------------- */
/* 图像处理与保存 (针对探测后的 Buffer) */
/* ------------------------- */
async function processAndSave(buffer, hash, savePath) {
  try {
      // 使用 Sharp 处理
      const pipeline = sharp(buffer);
      const metadata = await pipeline.metadata();

      if (!metadata.width) throw new Error("无效的图片数据");

      // 图像增强处理
      const resized = pipeline
          .resize(1200, null, { withoutEnlargement: true })
          .modulate({
              brightness: 1.05,
              saturation: 0.9
          })
          .sharpen();

      // 同时写入 JPG (备份) 和 WebP (前端使用)
      await resized.clone().jpeg({ quality: 80 }).toFile(savePath + ".jpg");
      await resized.clone().webp({ quality: 85 }).toFile(savePath + ".webp");

      // 记录 Hash 并持久化
      if (usedHashes.size > 5000) {
        usedHashes = new Set(Array.from(usedHashes).slice(-3000));
    }
      usedHashes.add(hash); 
      fs.writeFileSync(
          HASH_FILE,
          JSON.stringify({ used: Array.from(usedHashes) }, null, 2)
      );
      
      console.log(`💾 物理文件已保存: ${path.basename(savePath)}.webp`);
      return true;

  } catch (error) {
      console.error(`❌ 图像处理失败: ${error.message}`);
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

  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`🚀 开始任务: ${title}`);
  console.log(`📂 目标文件夹: /images/${actualFolderName}/`);

  let downloadedCount = 0;
  
  // 遍历所有提供的关键词，直到凑齐 2 张图
  for (const keyword of keywords) {
      if (downloadedCount >= 2) break;

      // findImage 内部已经集成了：搜索 API -> 下载 -> 校验 Hash -> 换 API 尝试
      const result = await findImage(keyword, moduleIn);
      
      if (result) {
          const savePath = path.join(dir, `${slug}-${downloadedCount + 1}`);
          const success = await processAndSave(result.buffer, result.hash, savePath);
          
          if (success) {
              downloadedCount++;
          }
      } else {
          console.log(`⚠️ 关键词 "${keyword}" 下的所有图片在全站均已存在或搜图失败。`);
      }
  }

  if (downloadedCount === 0) {
      console.error(`❌ 严重警告: 未能为文章 "${title}" 下载到任何唯一图片。`);
  } else {
      console.log(`✨ 任务完成：成功下载 ${downloadedCount} 张唯一图片。`);
  }
}
main();