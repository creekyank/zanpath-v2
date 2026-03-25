import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/article-loader";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://zanpath.com";
  
  // 核心配置：定义你的语种和模块，用于自动生成列表页 URL
  const locales = ["en", "es"];
  const modules = ["dream", "life-path", "naming", "space", "visual"];

  // 1. 获取所有文章数据
  const allArticles = await getAllArticles();

  // 2. 基础首页
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  // 3. 自动生成语种首页和各个模块的中间列表页 (这是 SEO 最缺的部分)
  const categoryPages: MetadataRoute.Sitemap = [];
  locales.forEach((locale) => {
    // 生成如: /en/wisdom, /es/wisdom
    categoryPages.push({
      url: `${baseUrl}/${locale}/wisdom`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });

    // 生成如: /en/wisdom/dream, /es/wisdom/life-path 等 10 个页面
    modules.forEach((mod) => {
      categoryPages.push({
        url: `${baseUrl}/${locale}/wisdom/${mod}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  });

  // 4. 处理所有文章详情页
  const articlePages: MetadataRoute.Sitemap = allArticles.map((article) => {
    // 确保日期格式正确，防止 Google 报错
    const safeDate = article.dateModified || article.datePublished || new Date().toISOString();
    const validDate = new Date(safeDate);

    return {
      url: `${baseUrl}/${article.locale}/wisdom/${article.module}/${article.slug}`,
      lastModified: isNaN(validDate.getTime()) ? new Date() : validDate,
      changeFrequency: (article.changefreq as any) || "monthly",
      priority: article.priority || 0.7,
    };
  });

  // 最终合并输出
  return [...staticPages, ...categoryPages, ...articlePages];
}