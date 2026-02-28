
import { getAllArticles } from "@/lib/article-loader";

export async function GET() {
  const en = getAllArticles("en");
  const es = getAllArticles("es");

  const articles = [...en, ...es]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 30);

  const items = articles
    .map(
      (a) => `
<item>
<title><![CDATA[${a.title}]]></title>
<link>https://zanpath.com/${a.locale}/wisdom/${a.module}/${a.slug}</link>
<description><![CDATA[${a.description}]]></description>
<pubDate>${new Date(a.date).toUTCString()}</pubDate>
</item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Zanpath Wisdom</title>
<link>https://zanpath.com</link>
<description>Latest insights</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}