import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // 针对所有搜索引擎爬虫
      allow: '/',      // 允许抓取整个网站
      disallow: [      // 禁止抓取以下路径
        '/api/',       // 保护你的后端接口
        '/admin/',     // 如果你有管理后台
        '/*?q=*',      // 禁止抓取搜索结果页（防止产生大量重复内容）
      ],
    },
    // 最关键的一行：告诉爬虫你的站点地图在哪
    sitemap: 'https://zanpath.com/sitemap.xml',
  }
}