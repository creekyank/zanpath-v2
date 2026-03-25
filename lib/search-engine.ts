
export function searchArticles(articles: any[], keyword: string) {
  if (!keyword) return articles;

  const k = keyword.toLowerCase();

  return articles.filter(a => {
    const text = (
      a.title +
      " " +
      (a.description || "") +
      " " +
      (a.keywords || []).join(" ")
    ).toLowerCase();

    return text.includes(k);
  });
}

export function highlight(text: string, keyword: string) {
  if (!keyword) return text;

  const reg = new RegExp(`(${keyword})`, "gi");
  return text.replace(reg, `<mark>$1</mark>`);
}