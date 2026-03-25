import Script from "next/script";
import Link from "next/link";
import { getAllArticles } from "@/lib/article-loader";
import { getCategory } from "@/lib/category-engine";
import { searchArticles, highlight } from "@/lib/search-engine";

const baseUrl = "https://zanpath.com";

export async function generateMetadata({ params }: any) {
  const { locale, module } = params;

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

  return {
    title: `${displayModule} Insights & Guides | Zanpath AI`,
    description: `Explore expert ${displayModule} analysis and destiny insights powered by AI metaphysical interpretation.`,
    alternates: {
      canonical: `${baseUrl}/${locale}/wisdom/${module}`,
    },
  };
}

export default async function ModulePage({ params, searchParams }: any) {
  const { locale, module } = params;

  const normalizedModule = module?.toLowerCase?.() || "";

  const category = searchParams?.category || "all";
  const keyword = searchParams?.q || "";
  const page = parseInt(searchParams?.page || "1");

  const PAGE_SIZE = 10;

  /* ================================
  UI 文案
  ================================ */

  const t =
    locale === "es"
      ? {
          insights: "Análisis",
          explore:
            "Explora interpretaciones profundas y perspectivas espirituales.",
          read: "Leer Artículo",
          back: "Volver a Sabiduría",
          search: "Buscar...",
        }
      : {
          insights: "Insights",
          explore:
            "Explore in-depth interpretations and spiritual insights.",
          read: "Read Article",
          back: "Back to Wisdom",
          search: "Search...",
        };

  /* ================================
  模块名称
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
  分类配置（含多语言）
  ================================ */

  const categoryLabels: any = {
    en: {
      all: "All",
      wealth: "Wealth",
      love: "Love",
      career: "Career",
      health: "Health",
      warning: "Warning",
      spiritual: "Spiritual",
      luck: "Luck",
      personality: "Personality",
      home: "Home",
    },
    es: {
      all: "Todo",
      wealth: "Riqueza",
      love: "Amor",
      career: "Carrera",
      health: "Salud",
      warning: "Advertencia",
      spiritual: "Espiritual",
      luck: "Suerte",
      personality: "Personalidad",
      home: "Hogar",
    },
  };

  const categoriesMap: Record<string, string[]> = {
    "life-path": ["all", "wealth", "love", "career", "health"],
    dream: ["all", "love", "warning", "spiritual"],
    naming: ["all", "luck", "personality"],
    space: ["all", "wealth", "home"],
    visual: ["all", "personality", "career"],
  };

  const categories = categoriesMap[normalizedModule] || ["all"];

  /* ================================
  获取文章（关键修复点）
  ================================ */

  let articles = getAllArticles(locale).filter(
    (a) => a.module?.toLowerCase() === normalizedModule
  );

  /* 分类 */
  if (category !== "all") {
    articles = articles.filter(
      (a) => getCategory(a, normalizedModule) === category
    );
  }

  /* 搜索 */
  articles = searchArticles(articles, keyword || "");

  /* ================================
  分页
  ================================ */

  const total = articles.length;

  const paginated = articles.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ================================
  推荐算法
  ================================ */

  function scoreArticle(a: any) {
    let score = 0;
    const text = (a.title + " " + (a.description || "")).toLowerCase();

    if (keyword && text.includes(keyword.toLowerCase())) score += 50;
    if (
      category !== "all" &&
      getCategory(a, normalizedModule) === category
    )
      score += 30;
    if (a.primaryKeyword && text.includes(a.primaryKeyword.toLowerCase()))
      score += 20;
    if (
      a.longTailKeywords?.some((k: string) =>
        text.includes(k.toLowerCase())
      )
    )
      score += 10;

    score += Math.random() * 5;

    return score;
  }

  const recommended = [...articles]
    .map((a) => ({
      ...a,
      _score: scoreArticle(a),
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

        <p className="text-[#4a7c6d] text-sm">{t.explore}</p >
      </div>

      {/* ===== 子分类导航 ===== */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {categories.map((c) => (
          <Link
            key={c}
            href={`/${locale}/wisdom/${module}?category=${c}${keyword ? `&q=${keyword}` : ""}`}
            className={`px-4 py-2 rounded-full border ${
              c === category
                ? "bg-[#0f3d2e] text-white"
                : "bg-white"
            }`}
          >
            {categoryLabels[locale]?.[c] || c}
          </Link>
        ))}
      </div>

      {/* ===== 搜索 ===== */}
      <form method="GET" className="w-full max-w-md mb-10">
        <input
          name="q"
          defaultValue={keyword}
          placeholder={t.search}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </form>

      {/* ===== 列表 ===== */}
      <div className="w-full space-y-6">
        {paginated.length === 0 && (
          <div className="text-center text-gray-400 text-sm">
            No articles found
          </div>
        )}

        {paginated.map((a) => (
          <div
            key={a.slug}
            className="bg-white rounded-3xl shadow-xl shadow-[#dff3ee]/50 p-8 border border-white transition hover:translate-y-[-4px]"
          >
            <h2
              className="text-xl font-bold mb-4"
              dangerouslySetInnerHTML={{
                __html: highlight(a.title || "", keyword || ""),
              }}
            />

            <p
              className="text-[#4a7c6d] text-sm mb-6"
              dangerouslySetInnerHTML={{
                __html: highlight(a.description || "", keyword || ""),
              }}
            />

            <Link
              href={`/${locale}/wisdom/${a.module}/${a.slug}`}
              className="inline-block px-6 py-2 rounded-xl bg-[#0f3d2e] text-white text-sm"
            >
              {t.read}
            </Link>
          </div>
        ))}
      </div>

      {/* ===== 分页 ===== */}
      <div className="mt-10 flex gap-4">
        {page > 1 && (
          <Link
            href={`/${locale}/wisdom/${module}?category=${category}&q=${keyword}&page=${
              page - 1
            }`}
          >
            ← Prev
          </Link>
        )}

        <span>{page}</span>

        {page * PAGE_SIZE < total && (
          <Link
            href={`/${locale}/wisdom/${module}?category=${category}&q=${keyword}&page=${
              page + 1
            }`}
          >
            Next →
          </Link>
        )}
      </div>

      {/* ===== 推荐 ===== */}
      <div className="mt-16 w-full">
        <h2 className="text-xl font-bold mb-6 text-center">
          🔥 Popular Reads
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {recommended.map((a) => (
            <Link
              key={a.slug}
              href={`/${locale}/wisdom/${a.module}/${a.slug}`}
              className="border p-4 rounded-xl hover:bg-gray-50"
            >
              {a.title}
            </Link>
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

      {/* ===== Breadcrumb SEO ===== */}
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