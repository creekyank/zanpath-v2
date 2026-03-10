
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import slugify from "slugify";
import sharp from "sharp";
import crypto from "crypto";
import dotenv from "dotenv";

// 1. 强制指定 .env 文件所在的目录 (E:\zanpath v2)
const envPath = "E:/zanpath v2/.env";
const envLocalPath = "E:/zanpath v2/.env.local";

// 2. 依次尝试加载这两个文件
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath }); // 后加载的会覆盖或补充前面的
}

// 3. 强制指定图片存放的根目录
const IMAGE_DIR = "E:/zanpath v2/public/images";

// 4. 读取 Key
const PEXELS_KEY = process.env.PEXELS_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_KEY;
const PIXABAY_KEY = process.env.PIXABAY_KEY;

// 调试打印：确认 Key 是否真的读到了
console.log("--- 环境加载检查 ---");
console.log("PEXELS_KEY:", PEXELS_KEY ? "✅ 已获取" : "❌ 未找到");
console.log("UNSPLASH_KEY:", UNSPLASH_KEY ? "✅ 已获取" : "❌ 未找到");
console.log("PIXABAY_KEY:", PIXABAY_KEY ? "✅ 已获取" : "❌ 未找到");
console.log("图片存储路径:", IMAGE_DIR);
console.log("-------------------\n");

const usedHashes = new Set();

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
      const res = await fetch(url, { timeout: 15000 }); // 设置15秒超时
  
      if (!res.ok) {
        console.error(`❌ 下载请求失败: ${res.status} ${res.statusText}`);
        return false;
      }
  
      // 使用 ArrayBuffer 并转换为 Buffer，同时增加错误捕获
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
  
      const hash = crypto.createHash("md5").update(buffer).digest("hex");
      if (usedHashes.has(hash)) {
        console.log("⚠️ 检测到重复图片，已跳过");
        return false;
      }
      usedHashes.add(hash);
  
      const pipeline = sharp(buffer).resize(1200);

      const jpg = await pipeline.clone().jpeg({ quality: 75 }).toBuffer();
      const webp = await pipeline.clone().webp({ quality: 75 }).toBuffer();
    
    fs.writeFileSync(savePath + ".jpg", jpg);
    fs.writeFileSync(savePath + ".webp", webp);
    console.log(`✅ 成功保存: ${savePath}.jpg 和 ${savePath}.webp`);
      return true;
  
    } catch (error) {
      // 捕获 ECONNRESET, Timeout 等网络错误
      console.error(`❌ 网络连接异常 (跳过该图): ${error.message}`);
      return false; 
    }
  }

/* ------------------------- */
/* PEXELS */
/* ------------------------- */

async function searchPexels(keyword) {
    if (!PEXELS_KEY) return null;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=5`;
  
    try {
      const res = await fetch(url, { headers: { Authorization: PEXELS_KEY }, timeout: 10000 });
      const data = await res.json();
      if (!data.photos) return null;
      for (const p of data.photos) {
        if (isGoodQuality(p.width, p.height)) return p.src.large;
      }
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
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=5&client_id=${UNSPLASH_KEY}`;

    try {
        const res = await fetch(url, { timeout: 10000 });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.results) return null;
    
        for (const p of data.results) {
          if (isGoodQuality(p.width, p.height)) return p.urls.regular;
        }
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
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&per_page=5`;
  
    try {
      const res = await fetch(url, { timeout: 10000 });
      if (!res.ok) return null;
      const data = await res.json();
      // 修正：Pixabay 使用的是 .hits
      if (!data.hits) return null; 
  
      for (const p of data.hits) {
        // 修正：Pixabay 的宽高字段名不同
        if (isGoodQuality(p.imageWidth, p.imageHeight)) return p.largeImageURL;
      }
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
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(keyword)}&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`;
  
    try {
      const res = await fetch(url, { timeout: 10000 });
      if (!res.ok) return null;
      const data = await res.json();
      
      // 修正：Wikimedia 的判断逻辑不同
      if (!data.query || !data.query.pages) return null; 
      
      const pages = Object.values(data.query.pages);
      for (const p of pages) {
        if (p.imageinfo && p.imageinfo[0]) {
          return p.imageinfo[0].url;
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
    let searchKeyword = keyword;
    
    if (module === 'dream') {
      // 梦境：增加“超现实、神秘”感，避免搜出太生活化的图
      searchKeyword = `${keyword} surreal mystery fantasy`; 
    } else if (module === 'face') {
      // 面相：强制聚焦头部和肖像，避免搜出全身远景图
      searchKeyword = `${keyword} portrait headshot facial`;
    } else if (module === 'fengshui') {
      // 风水：强化环境、建筑和景观感
      searchKeyword = `${keyword} architecture landscape oriental`; 
    } else if (module === 'bazi') {
      // 八字：增加意境词，更符合命理的深邃感
      searchKeyword = `${keyword} zen atmosphere ethereal`;
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
    if (searchKeyword !== keyword) {
      console.log(`✨ 增强搜索词: "${searchKeyword}"`);
    }
  
    // 4. 按优先级轮询各个 API
    for (const searchFunc of searchOrder) {
      try {
        // 这里的 searchFunc 对应 searchUnsplash, searchPexels 等函数
        const img = await searchFunc(searchKeyword);
        
        if (img) {
          // 提取函数名去掉 'search' 前缀作为日志显示
          const apiName = searchFunc.name.replace('search', '');
          console.log(`✅ 命中成功！来源: ${apiName}`);
          return img;
        }
      } catch (error) {
        console.error(`❌ API [${searchFunc.name}] 调用异常，尝试下一个...`);
      }
    }
  
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

  const title = process.argv[2];
  const module = process.argv[3];
  const keywords = process.argv.slice(4);

  if (!title || !module || keywords.length === 0) {

    console.log("usage:");

    console.log(
      'node downloadImage.js "title" module "keyword1" "keyword2"'
    );

    return;

  }

  const slug = slugify(title, { lower: true });

  const dir = `${IMAGE_DIR}/${module}`;

  if (!fs.existsSync(dir)) {

    fs.mkdirSync(dir, { recursive: true });

  }

  let index = 1;

  for (const keyword of keywords) {

    if (index > 2) break;

    const img = await findImage(keyword, module);

    if (!img) {

      console.log("no image for:", keyword);

      continue;

    }

    const file = `${dir}/${slug}-${index}`;

    const ok = await downloadAndProcess(img, file);
    if (ok) {
        const alt = generateAlt(keyword);
        console.log("alt:", alt);
        index++; // 只在这里加一次
      } else {
        console.log(`⏭️ 已跳过关键词 "${keyword}" 的图片处理`);
      }

  }

}

main();