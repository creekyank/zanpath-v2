import Script from "next/script";
import Link from "next/link";
import { getAllArticles } from "@/lib/article-loader";

const baseUrl = "https://zanpath.com";

export async function generateMetadata({ params }: any) {
  const { locale, module } = await params;

  return {
    title: `${module} Insights & Guides | Zanpath AI`,
    description: `Explore expert ${module} analysis and destiny insights powered by AI metaphysical interpretation.`,
    alternates: {
      canonical: `${baseUrl}/${locale}/wisdom/${module}`,
    },
  };
}

export default async function ModulePage({ params }: any) {
  const { locale, module } = await params;

  const articles = getAllArticles(locale).filter(
    (a) => a.module === module
  );

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
  
      {/* Header */}
      <div className="mb-16 text-center max-w-2xl">
        <div className="text-4xl mb-4">✨</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 capitalize">
          {module} Insights
        </h1>
        <p className="text-[#4a7c6d] text-sm leading-relaxed">
          Explore in-depth {module} interpretations and spiritual insights.
        </p >
      </div>
  
      {/* Article List */}
      <div className="w-full space-y-6">
  
        {articles.map((a) => (
          <div
            key={a.slug}
            className="bg-white rounded-3xl shadow-xl shadow-[#dff3ee]/50 p-8 border border-white transition hover:translate-y-[-4px] duration-300"
          >
            <h2 className="text-xl font-bold mb-4 leading-tight">
              <Link href={`/${locale}/wisdom/${a.module}/${a.slug}`}>
                {a.title}
              </Link>
            </h2>
  
            <p className="text-[#4a7c6d] text-sm mb-6">
              {a.description}
            </p >
  
            <Link
              href={`/${locale}/wisdom/${a.module}/${a.slug}`}
              className="inline-block px-6 py-2 rounded-xl bg-[#0f3d2e] text-white text-sm font-semibold hover:opacity-90 transition"
            >
              Read Article
            </Link>
          </div>
        ))}
  
      </div>
  
      {/* Back To Wisdom */}
      <div className="mt-20 text-center">
        <Link
          href={`/${locale}/wisdom`}
          className="inline-block bg-white text-[#0f3d2e] px-8 py-3 rounded-full text-sm font-semibold border border-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white transition shadow-md"
        >
          ← Back to Wisdom
        </Link>
      </div>
  
      {/* Breadcrumb Schema */}
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
  
    </main>
  );
}