
import fs from "fs";
import path from "path";

const CONTENT_PATH = path.join(process.cwd(), "content/articles");


export type Article = {
  title: string;
  date: string;
  description: string;
  category?: string;
  keywords?: string[];
  image?: string;
  content: string;
  slug: string;
  module: string;
  locale: string;

  datePublished?: string
  dateModified?: string

  changefreq?: "daily" | "weekly" | "monthly" | "yearly"
  priority?: number
};

export function getAllArticles(locale?: string): Article[] {
  // 如果傳了 locale，就只讀那個目錄；沒傳就讀取 en 和 es
  const locales = locale ? [locale] : ["en", "es"];
  let allArticles: Article[] = [];

  locales.forEach((currentLocale) => {
    const localePath = path.join(CONTENT_PATH, currentLocale);
    if (!fs.existsSync(localePath)) return;

    const modules = fs.readdirSync(localePath);

    modules.forEach((module) => {
      const modulePath = path.join(localePath, module);
      if (!fs.statSync(modulePath).isDirectory()) return;

      const files = fs.readdirSync(modulePath);
      files.forEach((file) => {
        if (!file.endsWith(".json")) return;

        const raw = fs.readFileSync(path.join(modulePath, file), "utf-8");
        const json = JSON.parse(raw);

        allArticles.push({
          ...json,
          slug: file.replace(".json", ""),
          module,
          locale: currentLocale, // 使用當前循環的語言
        });
      });
    });
  });

  return allArticles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getArticle(
  locale: string,
  module: string,
  slug: string
): Article | null {
  const filePath = path.join(
    CONTENT_PATH,
    locale,
    module,
    `${slug}.json`
  );

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(raw);

  return {
    ...json,
    slug,
    module,
    locale,
  };
}