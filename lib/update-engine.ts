export function shouldUpdate(articleDate: string) {
  const now = new Date();
  const published = new Date(articleDate);
  const diffDays =
    (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays > 90; // 90天自动标记为需要增强
}