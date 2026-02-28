
import Script from "next/script";
import Link from "next/link";
import { getAllArticles } from "@/lib/article-loader";

const baseUrl = "https://zanpath.com";

export async function generateMetadata({ params }: any) {
  const { locale, module } = params;

  return {
    title: `${module} Insights & Guides | Zanpath AI`,
    description: `Explore expert ${module} analysis and destiny insights powered by AI metaphysical interpretation.`,
    alternates: {
      canonical: `${baseUrl}/${locale}/wisdom/${module}`,
    },
  };
}

export default function ModulePage({ params }: any) {
  const { locale, module } = params;

  const articles = getAllArticles(locale).filter(
    (a) => a.module === module
  );

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 40 }}>

      <h1>{module} Insights & Analysis</h1>

      <p style={{ marginBottom: 40 }}>
        Discover how {module} influences destiny patterns,
        personal energy alignment and life trajectory
        using AI-powered metaphysical interpretation.
      </p >

      {articles.map((a) => (
        <div key={a.slug} style={{ marginBottom: 20 }}>
          <h2>
            <Link href={`/${locale}/wisdom/${a.module}/${a.slug}`}>
              {a.title}
            </Link>
          </h2>
          <p>{a.description}</p >
        </div>
      ))}

      <Script
        id="breadcrumb-module"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Wisdom",
                item: `${baseUrl}/${locale}/wisdom`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: module,
                item: `${baseUrl}/${locale}/wisdom/${module}`,
              },
            ],
          }),
        }}
      />
    </div>
  );
}