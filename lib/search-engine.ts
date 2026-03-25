export function searchArticles(articles: any[], keyword: string) {
  if (!keyword || keyword.trim() === "") {
    return articles;
  }

  const lower = keyword.toLowerCase();

  return articles.filter((a) => {
    const text = (
      (a.title || "") +
      " " +
      (a.description || "") +
      " " +
      (a.primaryKeyword || "")
    ).toLowerCase();

    return text.includes(lower);
  });
}

/* ================================
关键词高亮（修复版）
================================ */

export function highlight(text: string, keyword: string) {
  if (!keyword || keyword.trim() === "") return text;

  try {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 防止正则报错
    const regex = new RegExp(`(${escaped})`, "gi");

    return text.replace(
      regex,
      `<mark class="bg-yellow-200 px-1 rounded">`
    );
  } catch (e) {
    return text; // 出错直接返回原文（防炸）
  }
}