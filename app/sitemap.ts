import { MetadataRoute } from "next"
import { getAllArticles } from "@/lib/article-loader"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://zanpath.com"

  const articles = await getAllArticles()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${baseUrl}/en/wisdom`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/es/wisdom`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    }
  ]

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => {
    const safeDate =
      article.dateModified ||
      article.datePublished ||
      new Date().toISOString()

    const validDate = new Date(safeDate)

    return {
      url: `${baseUrl}/${article.locale}/wisdom/${article.module}/${article.slug}`,
      lastModified: isNaN(validDate.getTime())
        ? new Date()
        : validDate,
      changeFrequency: article.changefreq || "monthly",
      priority: article.priority || 0.7
    }
  })

  return [...staticPages, ...articlePages]
}