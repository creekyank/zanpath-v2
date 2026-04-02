/**
 * 记录文章播放/阅读历史，增加权重
 */
export function trackPlay(slug: string) {
  if (typeof window === "undefined") return;
  const key = "radio-history";
  
  try {
    const history = JSON.parse(localStorage.getItem(key) || "{}");
    history[slug] = (history[slug] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to track play history", e);
  }
}

/**
 * 获取推荐列表 (100 篇)
 * 1. 排除当前 Slug
 * 2. 按历史权重排序 (听得多的排前面)
 * 3. 截取前 100 篇，保证电台长度
 */
export function getRecommended(all: any[], currentSlug?: string) {
  // 如果在服务端渲染，直接返回前 100 篇
  if (typeof window === "undefined") return all.slice(0, 100);
  
  try {
    const history = JSON.parse(localStorage.getItem("radio-history") || "{}");

    return [...all]
      .filter((a) => a.slug !== currentSlug) // 排除当前篇
      .sort((a, b) => {
        const scoreA = history[a.slug] || 0;
        const scoreB = history[b.slug] || 0;
        return scoreB - scoreA; // 权重高的优先
      })
      .slice(0, 100); // 🔥 扩展到 100 篇，让“电台”更耐听
  } catch (e) {
    // 报错兜底逻辑
    return all.filter(a => a.slug !== currentSlug).slice(0, 100);
  }
}