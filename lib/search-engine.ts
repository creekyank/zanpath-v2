export function searchArticles(articles: any[], keyword: string) {
  if (!keyword || keyword.trim() === "") {
    return articles;
  }

  const words = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return articles
    .map((a) => {
      const text = (
        (a.title || "") +
        " " +
        (a.description || "") +
        " " +
        (a.primaryKeyword || "") +
        " " +
        (a.keywords || []).join(" ")
      ).toLowerCase();

      let score = 0;

      words.forEach((w) => {
        if (text.includes(w)) score += 10;
      });

      // 标题权重更高
      words.forEach((w) => {
        if ((a.title || "").toLowerCase().includes(w)) {
          score += 20;
        }
      });

      return { ...a, _searchScore: score };
    })
    .filter((a) => a._searchScore > 0)
    .sort((a, b) => b._searchScore - a._searchScore);
}

/* ================================
关键词高亮（安全版）
================================ */

export function highlight(text: string, keyword: string) {
  if (!keyword || keyword.trim() === "") return text;

  try {
    const words = keyword.split(/\s+/).filter(Boolean);

    let result = text;

    words.forEach((word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");

      result = result.replace(
        regex,
        `<mark class="bg-yellow-200 px-1 rounded">$1</mark>`
      );
    });

    return result;
  } catch {
    return text;
  }
}