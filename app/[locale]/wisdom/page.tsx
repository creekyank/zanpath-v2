
import { getAllArticles } from "@/lib/article-loader";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const baseUrl = "https://zanpath.com";

  return {
    title: "Spiritual Wisdom & Destiny Insights | Zanpath",
    description:
      "Explore life path, dream meaning, naming and destiny insights powered by ancient metaphysics.",
    alternates: {
      canonical: `${baseUrl}/${params.locale}/wisdom`,
      languages: {
        en: `${baseUrl}/en/wisdom`,
        es: `${baseUrl}/es/wisdom`,
      },
    },
  };
}

export default function WisdomPage({
  params,
}: {
  params: { locale: string };
}) {
  const articles = getAllArticles(params.locale);

  const latest = articles.slice(0, 5);
  const modules = Array.from(new Set(articles.map((a) => a.module)));

  return (
    <div style={{ padding: 40 }}>
      <h1>Wisdom</h1>

      <h2>Latest Articles</h2>
      {latest.map((a) => (
        <div key={a.slug}>
          <Link href={`/${a.locale}/wisdom/${a.module}/${a.slug}`}>
            {a.title}
          </Link>
        </div>
      ))}

      <hr style={{ margin: "40px 0" }} />

      {modules.map((module) => (
        <div key={module}>
          <h2>{module}</h2>

          {articles
            .filter((a) => a.module === module)
            .slice(0, 5)
            .map((a) => (
              <div key={a.slug}>
                <Link href={`/${a.locale}/wisdom/${a.module}/${a.slug}`}>
                  {a.title}
                </Link>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}