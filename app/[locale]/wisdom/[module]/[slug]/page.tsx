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
  const { locale, module, slug } = await params;

  const article = getArticle(locale, module, slug);
  if (!article) return {};

  return buildMetadata(article);
}

/* ✅ 只升级样式，不改逻辑 */
function renderBlock(block: any, index: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={index}
          className="text-2xl md:text-3xl font-bold mt-14 mb-6 text-[#0f3d2e]"
        >
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3
          key={index}
          className="text-xl font-semibold mt-10 mb-4 text-[#1e5c49]"
        >
          {block.text}
        </h3>
      );

    case "p":
      return (
        <p
          key={index}
          className="text-[#4a7c6d] leading-relaxed mb-6 text-[16px]"
        >
          {block.text}
        </p >
      );

    case "ul":
      return (
        <ul
          key={index}
          className="list-disc pl-6 space-y-3 mb-6 text-[#4a7c6d]"
        >
          {block.items?.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol
          key={index}
          className="list-decimal pl-6 space-y-3 mb-6 text-[#4a7c6d]"
        >
          {block.items?.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );

    default:
      return null;
  }
}

export default async function ArticlePage({ params }: any) {
  const { locale, module, slug } = await params;

  const article = getArticle(locale, module, slug);
  if (!article) return notFound();

  const all = getAllArticles(locale);

  const related = all
    .filter((a) => a.module === module && a.slug !== slug)
    .slice(0, 4);

  const snippet = generateSnippet(
    Array.isArray(article.content)
      ? article.content.map((c: any) => c.text).join(" ")
      : article.content
  );

  const faq = generateFAQ(
    article.title,
    Array.isArray(article.content)
      ? article.content.map((c: any) => c.text).join(" ")
      : article.content
  );

  const url = `${baseUrl}/${locale}/wisdom/${module}/${slug}`;

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      {/* ===== Header ===== */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8 text-[#0f3d2e]">
          {article.title}
        </h1>

        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-2xl mx-auto border border-white">
          <p className="text-[#4a7c6d] text-[15px] leading-relaxed">
            {snippet}
          </p >
        </div>
      </div>

      {/* ===== Article Content ===== */}
      <article className="prose prose-neutral max-w-none">
        {Array.isArray(article.content)
          ? article.content.map((block: any, index: number) =>
              renderBlock(block, index)
            )
          : (
            <p className="text-[#4a7c6d] leading-relaxed text-[16px]">
              {article.content}
            </p >
          )}
      </article>

      {/* ===== Related ===== */}
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Related Insights
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${locale}/wisdom/${r.module}/${r.slug}`}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-white"
              >
                <h3 className="font-semibold text-[#0f3d2e]">
                  {generateAnchorText(r.title)}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ===== FAQ ===== */}
      {faq.length > 0 && (
        <div className="mt-28">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            {faq.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-white"
              >
                <h3 className="font-semibold mb-3 text-[#0f3d2e]">
                  {f.q}
                </h3>
                <p className="text-[#4a7c6d] text-sm leading-relaxed">
                  {f.a}
                </p >
              </div>
            ))}
          </div>
        </div>
      )}

            {/* ===== Back To List ===== */}
            <div className="mt-20 text-center">
        <Link
          href={`/${locale}/wisdom/${module}`}
          className="inline-block bg-[#0f3d2e] text-white px-8 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-md"
        >
          ← Back to {module.charAt(0).toUpperCase() + module.slice(1)} Articles
        </Link>
      </div>

      {/* ===== Back To Wisdom ===== */}
      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/wisdom`}
          className="inline-block bg-white text-[#0f3d2e] px-8 py-3 rounded-full text-sm font-semibold border border-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white transition shadow-md"
        >
          ← Back to Wisdom
        </Link>
      </div>

      {/* ===== Article Schema ===== */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            datePublished: article.datePublished || article.date,
            dateModified: article.dateModified || article.date,
            author: {
              "@type": "Organization",
              name: "Zanpath",
            },
            publisher: {
              "@type": "Organization",
              name: "Zanpath",
              logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/logo.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url,
            },
          }),
        }}
      />

      {/* ===== FAQ Schema ===== */}
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

      {/* ===== Breadcrumb Schema ===== */}
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
    </main>
  );
}

