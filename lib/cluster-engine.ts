
export function calculateTopicWeight(articles: any[]) {
  const counter: Record<string, number> = {};

  articles.forEach((a) => {
    counter[a.module] = (counter[a.module] || 0) + 1;
  });

  return counter;
}

export function shouldGenerateMore(module: string, weights: any) {
  const total = Object.values(weights).reduce(
    (a: number, b: any) => a + b,
    0
  );

  const current = weights[module] || 0;

  return current / total < 0.2; // 低于20%优先补充
}