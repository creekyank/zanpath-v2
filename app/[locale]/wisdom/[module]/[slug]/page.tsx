import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { getArticle, getAllArticles } from "@/lib/article-loader";
import { buildMetadata } from "@/lib/seo-engine";
import { generateSnippet } from "@/lib/snippet-engine";
import { generateFAQ } from "@/lib/faq-engine";
import { generateAnchorText } from "@/lib/anchor-engine";
import { Article } from "@/content/articles"; // 确保导入了接口

const baseUrl = "https://zanpath.com";

export async function generateMetadata({ params }: any) {
  const { locale, module, slug } = await params;

  const article = getArticle(locale, module, slug);
  if (!article) return {};

  return buildMetadata(article);
}

/* 样式渲染保持不变 */
function renderBlock(block: any, index: number) {

  switch (block.type) {

    /* ===== H1 ===== */

    case "h1":
      return (
        <h1
          key={index}
          id={block.id}
          className="text-3xl md:text-4xl font-bold mt-10 mb-6 text-[#0f3d2e]"
        >
          {block.text}
        </h1>
      );

    /* ===== H2 ===== */

    case "h2":
      return (
        <h2
          key={index}
          id={block.id}
          className="text-2xl md:text-3xl font-bold mt-14 mb-6 text-[#0f3d2e]"
        >
          {block.text}
        </h2>
      );

    /* ===== H3 ===== */

    case "h3":
      return (
        <h3
          key={index}
          id={block.id}
          className="text-xl font-semibold mt-10 mb-4 text-[#1e5c49]"
        >
          {block.text}
        </h3>
      );

    /* ===== Paragraph ===== */

    case "p":
      return (
        <p
          key={index}
          className="text-[#4a7c6d] leading-relaxed mb-6 text-[16px]"
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );

    /* ===== UL ===== */

    case "ul":
      return (
        <ul
          key={index}
          className="list-disc pl-6 space-y-3 mb-6 text-[#4a7c6d]"
        >
          {block.items?.map((item: string, i: number) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </ul>
      );

    /* ===== OL ===== */

    case "ol":
      return (
        <ol
          key={index}
          className="list-decimal pl-6 space-y-3 mb-6 text-[#4a7c6d]"
          style={{ listStyleType: "decimal" }}
        >
          {block.items?.map((item: string, i: number) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </ol>
      );

    /* ===== IMAGE ===== */

    case "image":
      return (
        <img
          key={index}
          src={block.src}
          alt={block.alt || ""}
          loading="lazy"
          decoding="async"
          className="rounded-xl my-8 w-full"
        />
      );

    /* ===== TOC ===== */

    case "toc":
      return (
        <div key={index} className="my-10 p-6 bg-gray-50 rounded-xl border">
          <strong className="text-[#0f3d2e]">
            Table of Contents
          </strong>
    
          <ul className="mt-4 list-disc pl-5 space-y-2">
            {block.items?.map((item: any, i: number) => (
              <li key={i}>
                <a
                  href={`#${item.anchor}`}
                  className="text-blue-600 hover:underline"
                >
                  {item.text}
                </a >
              </li>
            ))}
          </ul>
        </div>
      );

    /* ===== RELATED ARTICLES (block版) ===== */

    case "related":
      return (
        <div
          key={index}
          className="mt-14 border-t pt-8"
        >

          <h3 className="text-xl font-semibold mb-4 text-[#0f3d2e]">
            Related Insights
          </h3>

          <ul className="space-y-2">

            {block.items?.map((item: any, i: number) => (

              <li key={i}>
                <a
                  href={item.url}
                  className="text-blue-600 hover:underline"
                >
                  {item.title}
                </a >
              </li>

            ))}

          </ul>

        </div>
      );

    default:
      return null;

  }

}

export default async function ArticlePage({ params }: any) {
  const { locale, module, slug } = await params;

  /* ===== 模块显示名称翻译 ===== */
  const moduleNames: Record<string, string> =
    locale === "es"
      ? {
          dream: "Sueños",
          space: "Espacio",
          naming: "Nombres",
          "life-path": "Destino",
          visual: "Visual",
        }
      : {
          dream: "Dream",
          space: "Space",
          naming: "Naming",
          "life-path": "Life Path",
          visual: "Visual",
        };

        const displayModule = moduleNames[module] ?? module;

  /* ===== UI 文案翻译 ===== */
  const t =
    locale === "es"
      ? {
          related: "Artículos Relacionados",
          faq: "Preguntas Frecuentes",
          backWisdom: "Volver a Sabiduría",
        }
      : {
          related: "Related Insights",
          faq: "Frequently Asked Questions",
          backWisdom: "Back to Wisdom",
        };

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
    <main className="max-w-4xl mx-auto px-6 py-16 pb-32">

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
        ? article.content.map((block: any, index: number) => {

            if (block.type === "html") {
              return (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{ __html: block.text }}
                />
              );
            }

            return renderBlock(block, index);
        })
        : null}

      </article>
{/* ===== Dynamic CTA Section (简洁统一版) ===== */}
{article.cta && (
          /* 将 mt-28 改为 mt-14 让它离正文近一点，mb-16 改为 mb-10 让它离相关文章近一点 */
          <div className="mt-14 mb-10"> 
            <Link 
              href={article.cta.url}
              className="group block max-w-2xl mx-auto text-center p-4 transition-all"
            >
              {/* 文字部分：mb-8 改为 mb-5 缩短与按钮的距离 */}
              <p className="mb-5 text-[#0f3d2e] font-medium leading-relaxed text-lg group-hover:opacity-80 transition-opacity">
                {article.cta.text}
              </p >

              {/* 按钮部分：
                  px-10 改为 px-8, py-4 改为 py-3 
                  这样尺寸就和下方的 Back to Wisdom 按钮 (px-8 py-3) 完全一致了
              */}
              <span className="inline-block bg-white text-[#0f3d2e] border border-[#0f3d2e] px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 group-hover:bg-[#0f3d2e] group-hover:text-white shadow-md">
                {locale === "es" ? "Comenzar Ahora" : "Start Now"}
              </span>
            </Link>
          </div>
        )}

      {/* ===== Related ===== */}
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="text-2xl font-bold mb-10 text-center">
            {t.related}
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
            {t.faq}
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

      {/* ===== Back To Module List ===== */}
      <div className="mt-20 text-center">
        <Link
          href={`/${locale}/wisdom/${module}`}
          className="inline-block bg-[#0f3d2e] text-white px-8 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-md"
        >
          ← {locale === "es"
              ? `Volver a Artículos de ${displayModule}`
              : `Back to ${displayModule} Articles`}
        </Link>
      </div>

      {/* ===== Back To Wisdom ===== */}
      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/wisdom`}
          className="inline-block bg-white text-[#0f3d2e] px-8 py-3 rounded-full text-sm font-semibold border border-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white transition shadow-md"
        >
          ← {t.backWisdom}
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
                name: locale === "es" ? "Sabiduría" : "Wisdom",
                item: `${baseUrl}/${locale}/wisdom`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: displayModule,
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