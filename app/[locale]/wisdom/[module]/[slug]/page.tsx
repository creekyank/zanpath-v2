import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { getArticle, getAllArticles } from "@/lib/article-loader";
import { buildMetadata } from "@/lib/seo-engine";
import { generateSnippet } from "@/lib/snippet-engine";
import { generateFAQ } from "@/lib/faq-engine";
import { generateAnchorText } from "@/lib/anchor-engine";

const baseUrl = "https://zanpath.com";

export async function generateMetadata({ params }: any) {
  const article = getArticle(
    params.locale,
    params.module,
    params.slug
  );

  if (!article) return {};

  return buildMetadata(article);
}

export default function ArticlePage({ params }: any) {
  const { locale, module, slug } = params;

  const article = getArticle(locale, module, slug);
  if (!article) return notFound();

  const all = getAllArticles(locale);

  const related = all
    .filter((a) => a.module === module && a.slug !== slug)
    .slice(0, 4);

  const snippet = generateSnippet(article.content);
  const faq = generateFAQ(article.title, article.content);

  const url = `${baseUrl}/${locale}/wisdom/${module}/${slug}`;

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 40 }}>

      <h1>{article.title}</h1>

      <div style={{ background: "#f5f5f5", padding: 20, marginBottom: 30 }}>
        <p>{snippet}</p >
      </div>

      <div dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* Topic Cluster */}
      <div style={{ marginTop: 60 }}>
        <h2>Related Insights</h2>
        {related.map((r) => (
          <div key={r.slug}>
            <Link href={`/${locale}/wisdom/${r.module}/${r.slug}`}>
              {generateAnchorText(r.title)}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 60 }}>
        <h2>Frequently Asked Questions</h2>
        {faq.map((f, i) => (
          <div key={i}>
            <h3>{f.q}</h3>
            <p>{f.a}</p >
          </div>
        ))}
      </div>

      {/* ================= FULL SCHEMA ================= */}

      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            datePublished: article.date,
            dateModified: article.date,
            author: {
              "@type": "Organization",
              name: "Zanpath AI",
            },
            publisher: {
              "@type": "Organization",
              name: "Zanpath AI",
              logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/logo.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url,
            },
            image: article.image || `${baseUrl}/default.jpg`,
          }),
        }}
      />

      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.a,
              },
            })),
          }),
        }}
      />

      <Script
        id="breadcrumb-schema"
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
              {
                "@type": "ListItem",
                position: 3,
                name: article.title,
                item: url,
              },
            ],
          }),
        }}
      />
    </div>
  );
}