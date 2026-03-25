import Script from "next/script";
import Link from "next/link";
import { getAllArticles } from "@/lib/article-loader";
import { getCategory } from "@/lib/category-engine";
import { searchArticles, highlight } from "@/lib/search-engine";

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

export default async function ModulePage({ params, searchParams }: any) {

  const { locale, module } = params;

  const category = searchParams?.category || "all";
  const keyword = searchParams?.q || "";
  const page = parseInt(searchParams?.page || "1");

  const PAGE_SIZE = 10;

  /* ================================
  UI 文案
  ================================ */

  const t = locale === "es"
    ? {
        insights: "Análisis",
        explore: "Explora interpretaciones profundas y perspectivas espirituales.",
        read: "Leer Artículo",
        back: "Volver a Sabiduría",
        search: "Buscar...",
      }
    : {
        insights: "Insights",
        explore: "Explore in-depth interpretations and spiritual insights.",
        read: "Read Article",
        back: "Back to Wisdom",
        search: "Search...",
      };

/* ================================
模块名称（SEO + 多语言）
================================ */
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

  /* ================================
  分类配置（动态）
  ================================ */

  const categoriesMap: Record<string, string[]> = {
    "life-path": ["all", "wealth", "love", "career", "health"],
    dream: ["all", "love", "warning", "spiritual"],
    naming: ["all", "luck", "personality"],
    space: ["all", "wealth", "home"],
    visual: ["all", "personality", "career"],
  };

  const categories = categoriesMap[module] || ["all"];

  /* ================================
  获取文章
  ================================ */

  let articles = getAllArticles(locale).filter(
    (a) => a.module === module
  );

  /* 分类过滤 */
  if (category !== "all") {
    articles = articles.filter(
      (a) => getCategory(a, module) === category
    );
  }

  /* 搜索过滤 */
  articles = searchArticles(articles, keyword);

  /* ================================
  分页
  ================================ */

  const total = articles.length;
  const paginated = articles.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ================================
  推荐算法（简单但有效）
  ================================ */

  function scoreArticle(a: any, keyword: string) {
  let score = 0;

  const text = (a.title + " " + (a.description || "")).toLowerCase();

  // 1️⃣ 关键词匹配（最重要）
  if (keyword) {
    if (text.includes(keyword.toLowerCase())) score += 50;
  }

  // 2️⃣ 分类加权
  if (category !== "all" && getCategory(a, module) === category) {
    score += 30;
  }

  // 3️⃣ 标题关键词（SEO强信号）
  if (a.primaryKeyword && text.includes(a.primaryKeyword.toLowerCase())) {
    score += 20;
  }

  // 4️⃣ 长尾关键词（加一点权重）
  if (a.longTailKeywords?.some((k: string) => text.includes(k.toLowerCase()))) {
    score += 10;
  }

  // 5️⃣ 随机扰动（避免固定）
  score += Math.random() * 5;

  return score;
}

const recommended = [...articles]
  .map((a) => ({
    ...a,
    _score: scoreArticle(a, keyword),
  }))
  .sort((a, b) => b._score - a._score)
  .slice(0, 4);

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">

      {/* ===== Header ===== */}
      <div className="mb-10 text-center max-w-2xl">
        <div className="text-4xl mb-4">✨</div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 capitalize">
          {displayModule} {t.insights}
        </h1>

        <p className="text-[#4a7c6d] text-sm">
          {t.explore}
        </p >
      </div>

      {/* ===== 分类 Tabs ===== */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {categories.map((c) => (
          <Link
            key={c}
            href={`?category=${c}&q=${keyword}`}
            className={`px-4 py-2 rounded-full border ${
              c === category
                ? "bg-[#0f3d2e] text-white"
                : "bg-white"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* ===== 搜索框 ===== */}
      <form method="GET" className="w-full max-w-md mb-10">
  <input
    name="q"
    defaultValue={keyword}
    placeholder={t.search}
    className="w-full px-4 py-2 border rounded-lg"
  />
</form>

      {/* ===== Article List ===== */}
      <div className="w-full space-y-6">

  {paginated.map((a) => (

    <div
      key={a.slug}
      className="bg-white rounded-3xl shadow-xl shadow-[#dff3ee]/50 p-8 border border-white transition hover:translate-y-[-4px] duration-300"
    >

      <h2
        className="text-xl font-bold mb-4 leading-tight"
        dangerouslySetInnerHTML={{
          __html: highlight(a.title, keyword),
        }}
      />

      <p
        className="text-[#4a7c6d] text-sm mb-6"
        dangerouslySetInnerHTML={{
          __html: highlight(a.description || "", keyword),
        }}
      />

      <Link
        href={`/${locale}/wisdom/${a.module}/${a.slug}`}
        className="inline-block px-6 py-2 rounded-xl bg-[#0f3d2e] text-white text-sm font-semibold hover:opacity-90 transition"
      >
        {t.read}
      </Link>

    </div>

  ))}

</div>

      {/* ===== 分页 ===== */}
      <div className="mt-10 flex gap-4">

        {page > 1 && (
          <Link href={`?category=${category}&q=${keyword}&page=${page - 1}`}>
            ← Prev
          </Link>
        )}

        <span>{page}</span>

        {page * PAGE_SIZE < total && (
          <Link href={`?category=${category}&q=${keyword}&page=${page + 1}`}>
            Next →
          </Link>
        )}

      </div>
          
{/* ===== 推荐 ===== */}
<div className="mt-16 w-full">
  <h2 className="text-xl font-bold mb-6 text-center">
    {keyword
      ? `🔥 Related to "${keyword}"`
      : category !== "all"
      ? `🔥 Top ${category} Insights`
      : "🔥 Popular Reads"}
  </h2>

  <div className="grid md:grid-cols-2 gap-4">
    {recommended.map((a) => (
      <div
        key={a.slug}
        className="bg-white rounded-3xl shadow-xl shadow-[#dff3ee]/50 p-6 border border-white transition hover:translate-y-[-4px] duration-300"
      >
        <h3
          className="text-lg font-bold mb-3 leading-tight"
          dangerouslySetInnerHTML={{
            __html: highlight(a.title, keyword),
          }}
        />

        <p
          className="text-[#4a7c6d] text-sm mb-4"
          dangerouslySetInnerHTML={{
            __html: highlight(a.description || "", keyword),
          }}
        />

        <Link
          href={`/${locale}/wisdom/${a.module}/${a.slug}`}
          className="inline-block px-4 py-2 rounded-lg bg-[#0f3d2e] text-white text-sm font-semibold hover:opacity-90 transition"
        >
          {t.read}
        </Link>
      </div>
    ))}
  </div>
</div>

	

      {/* ===== Back ===== */}
      <div className="mt-20">
        <Link
          href={`/${locale}/wisdom`}
          className="px-6 py-2 border rounded-full"
        >
          ← {t.back}
        </Link>
      </div>

{/* ===== Breadcrumb Schema（SEO增强版） ===== */}
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
          name: locale === "es" ? "Sabiduría" : "Wisdom",
          item: `${baseUrl}/${locale}/wisdom`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: displayModule,
          item: `${baseUrl}/${locale}/wisdom/${module}`,
        },
      ],
    }),
  }}
/>

    </main>
  );
}