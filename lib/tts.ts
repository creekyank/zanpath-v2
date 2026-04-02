/**
 * 从文章的 JSON content 数组中提取朗读文本
 */
export function extractPlayableText(content: any[]) {
  if (!Array.isArray(content)) return "";

  return content
    .filter((block, index) => {
      // 1. 智能跳过重复引言：
      // 如果第一项 (index 0) 长度小于 120 字符，通常是 SEO 摘要，跳过它。
      // 如果它很长，说明它是文章正式的开篇引言，必须保留。
      if (index === 0 && block.type === "p" && (block.text?.length || 0) < 120) {
        return false;
      }

      // 2. 排除不适合朗读的块
      if (["toc", "disclaimer", "image", "html"].includes(block.type)) return false;

      // 3. 确保该块有可读文本或列表项
      if (!block.text && (!block.items || !Array.isArray(block.items))) return false;

      return true;
    })
    .map((block) => {
      // --- 处理逻辑：为标题增加停顿感 ---
      
      // 如果是 h2 或 h3 标题（如 Core Concept）
      if (block.type === "h2" || block.type === "h3") {
        const text = block.text?.trim() || "";
        // 💡 关键修复：如果标题末尾没有标点，强行加个句号。
        // 这会让浏览器在读完标题后停顿一下，再读后面的正文。
        return text.endsWith(".") || text.endsWith("?") ? text : `${text}.`;
      }

      // 如果是列表项 (ul/ol)
      if (block.items && Array.isArray(block.items)) {
        return block.items
          .map((item: string) => item.trim()) // ✨ 显式加上 : string
          .filter((item: string) => item.length > 0) // ✨ 显式加上 : string
          .join(". ");
       }

      // 普通段落
      return block.text?.trim() || "";
    })
    .filter((text) => text.length > 0)
    .join("  "); // 段落间留出自然的双空格停顿
}

/**
 * 进度持久化
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
    // 💡 提示：如果你刚才测试时卡在了错误位置，建议临时改为返回 0 来重置测试
    return saved ? Number(saved) : 0;
  }
  return 0;
}