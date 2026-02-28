
export function generateFAQ(title: string, content: string) {
  const clean = content.replace(/<[^>]*>?/gm, "");
  const sentences = clean.split(".").filter((s) => s.length > 80);

  const baseQuestions = [
    `What does ${title} mean?`,
    `How does ${title} affect your life?`,
    `Can ${title} influence your destiny?`,
  ];

  return baseQuestions.map((q, i) => ({
    q,
    a: sentences[i] ? sentences[i].slice(0, 220) + "..." : clean.slice(0, 220) + "...",
  }));
}