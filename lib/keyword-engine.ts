export function expandKeywords(baseKeywords: string[]) {
  const expanded: string[] = [];

  baseKeywords.forEach((k) => {
    expanded.push(`${k} meaning`);
    expanded.push(`how to understand ${k}`);
    expanded.push(`${k} explained`);
    expanded.push(`${k} personality`);
  });

  return [...new Set(expanded)];
}