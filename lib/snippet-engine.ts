export function generateSnippet(content: string): string {
  if (!content) return "";

  const cleaned = content.replace(/\n/g, " ");
  if (cleaned.length <= 160) return cleaned;

  return cleaned.substring(0, 157) + "...";
}