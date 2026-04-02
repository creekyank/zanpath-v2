/**
 * 从文章的 JSON content 数组中提取朗读文本
 * 1. 跳过 content[0] (因为它是与 meta description 重复的引言)
 * 2. 过滤掉 TOC (目录)
 * 3. 过滤掉 Disclaimer (免责声明块)
 */
export function extractPlayableText(content: any[]) {
  if (!Array.isArray(content)) return "";

  return content
    .filter((block, index) => {
      // 1. 核心逻辑：跳过第 0 项 (引言/Snippet)，因为它和正文开头重复
      if (index === 0) return false;

      // 2. 排除目录块 (TOC)
      if (block.type === "toc") return false;

      // 3. 排除免责声明块 (已经在 content 尾部的 disclaimer 类型)
      if (block.type === "disclaimer") return false;

      // 4. 排除图片和 HTML
      if (block.type === "image" || block.type === "html") return false;

      return true;
    })
    .map((block) => {
      // 如果是列表项 (ul/ol)，将数组合并为字符串
      if (block.items && Array.isArray(block.items)) {
        return block.items.join(". ");
      }
      return block.text || "";
    })
    .filter((text) => text.trim().length > 0)
    .join("  "); // 段落间留出自然的双空格停顿
}

/**
 * 进度持久化：按文章 slug 保存播放到的字符位置
 */
export function saveProgress(slug: string, index: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`radio-progress-${slug}`, index.toString());
  }
}

/**
 * 进度读取
 */
export function loadProgress(slug: string) {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(`radio-progress-${slug}`);
    return saved ? Number(saved) : 0;
  }
  return 0;
}