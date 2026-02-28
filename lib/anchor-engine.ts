export function generateAnchorText(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 4)
    .slice(0, 4)
    .join(" ");
}