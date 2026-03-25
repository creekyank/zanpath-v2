import Script from "next/script";
import Link from "next/link";
import { getAllArticles } from "@/lib/article-loader";
import { getCategory } from "@/lib/category-engine";
import { searchArticles, highlight } from "@/lib/search-engine";
import PageSizeSelector from "@/components/PageSizeSelector"; // 路径根据你实际存放位置修改
import SearchBox from "@/components/SearchBox";

const baseUrl = "https://zanpath.com";

export async function generateMetadata({ params }: any) {
  const { locale, module } = await params;

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

export default async function ModulePage(props: any) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { locale, module } = params;

  const normalizedModule = (module || "").toLowerCase();

  const category = searchParams?.category || "all";
  const keyword = searchParams?.q || "";
  const page = parseInt(searchParams?.page || "1");

  const PAGE_SIZE = parseInt(searchParams?.ps || "10");

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
  分类
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
  获取文章
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

  /* 搜索（升级版） */
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
  分页数字计算逻辑
  ================================ */
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function getPaginationRange() {
    const delta = 2; // 当前页前后显示的页码数
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  const paginationRange = getPaginationRange();
  /* ================================
  推荐算法（升级版）
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

    if (a.longTailKeywords?.length) score += 10;

    score += Math.random() * 5;

    return score;
  }

  const recommended = [...articles]
    .map((a) => ({ ...a, _score: scoreArticle(a) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 4);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-4xl mb-3">✨</div>
        <h1 className="text-5xl font-bold mb-4">
          {displayModule} {t.insights}
        </h1>
        <p className="text-gray-500">{t.explore}</p >
      </div>

      {/* 分类导航 */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {categories.map((c) => (
          <Link
            key={c}
            href={`/${locale}/wisdom/${module}?category=${c}&ps=${PAGE_SIZE}`}
            className={`px-4 py-2 rounded-full border ${
              c === category
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {categoryLabels[locale]?.[c] || c}
          </Link>
        ))}
      </div>

      {/* 搜索 - 已改为 Client Component */}
      <SearchBox placeholder={t.search} />

      {/* 列表 */}
      <div className="w-full space-y-8"> {/* 增加间距到 space-y-8，呼吸感更好 */}
        {paginated.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            No articles found
          </div>
        )}

        {paginated.map((a) => (
          <div
            key={a.slug}
            // 核心变动：
            // 1. rounded-3xl (大圆角) 
            // 2. shadow-xl shadow-[#dff3ee]/50 (淡绿色投影，更显轻盈)
            // 3. hover:translate-y-[-4px] (悬停浮起动画)
            // 4. border-white (白色边框配合背景，增加质感)
            className="bg-white p-8 rounded-3xl shadow-xl shadow-[#dff3ee]/50 border border-white transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl"
          >
            <h2
              // 标题保持加粗
              className="text-xl font-bold mb-4 text-[#0f3d2e]"
              dangerouslySetInnerHTML={{
                __html: highlight(a.title || "", keyword),
              }}
            />
            <p
              // 描述改为深绿灰色 text-[#4a7c6d]，比 text-gray-500 更符合你的品牌
              className="text-[#4a7c6d] text-sm mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: highlight(a.description || "", keyword),
              }}
            />
            
            {/* 按钮变动：从 text-blue-600 改为 品牌深绿背景的按钮 */}
            <Link
              href={`/${locale}/wisdom/${a.module}/${a.slug}`}
              className="inline-block px-6 py-2 rounded-xl bg-[#0f3d2e] text-white text-sm font-medium hover:bg-[#165240] transition-colors"
            >
              {t.read}
            </Link>
          </div>
        ))}
      </div>

      {/* ===== 分页容器：页码 + 每页数量选择 ===== */}
      <div className="mt-12 flex flex-col items-center gap-6">
        
        {/* 1. 上层：页码导航 */}
        <div className="flex flex-wrap justify-center items-center gap-2">
          {/* 上一页 */}
          {page > 1 ? (
            <Link
              href={`?category=${category}&q=${keyword}&ps=${PAGE_SIZE}&page=${page - 1}`}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-[#4a7c6d] hover:border-[#0f3d2e] hover:text-[#0f3d2e] transition-all"
            >
              ← Prev
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl border border-gray-100 text-gray-300 cursor-not-allowed">
              ← Prev
            </span>
          )}

          {/* 页码数字循环 */}
          <div className="flex gap-1 items-center">
            {paginationRange.map((p, index) => {
              if (p === "...") {
                return <span key={`dot-${index}`} className="px-3 py-2 text-gray-400">...</span>;
              }
              const isCurrent = p === page;
              return (
                <Link
                  key={`page-${p}`}
                  href={`?category=${category}&q=${keyword}&ps=${PAGE_SIZE}&page=${p}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-[#0f3d2e] border-[#0f3d2e] text-white shadow-lg shadow-[#0f3d2e]/20"
                      : "bg-white border-gray-200 text-[#4a7c6d] hover:border-[#0f3d2e] hover:text-[#0f3d2e]"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>

          {/* 下一页 */}
          {page < totalPages ? (
            <Link
              href={`?category=${category}&q=${keyword}&ps=${PAGE_SIZE}&page=${page + 1}`}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-[#4a7c6d] hover:border-[#0f3d2e] hover:text-[#0f3d2e] transition-all"
            >
              Next →
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl border border-gray-100 text-gray-300 cursor-not-allowed">
              Next →
            </span>
          )}
        </div>


        {/* 2. 下层：每页显示数量选择 (现在改用独立的客户端组件) */}
        <PageSizeSelector initialSize={PAGE_SIZE} />
      </div>

{/* 推荐模块 (Popular Reads) */}
<div className="mt-20 w-full">
        <h2 className="text-2xl font-bold mb-8 text-center text-[#0f3d2e]">
          🔥 Popular Reads
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {recommended.map((a) => (
            <Link
              key={a.slug}
              href={`/${locale}/wisdom/${a.module}/${a.slug}`}
              // 关键变动：
              // 1. bg-white (纯白背景)
              // 2. rounded-2xl (圆角)
              // 3. shadow-sm + hover:shadow-md (轻量阴影)
              // 4. border border-transparent hover:border-[#0f3d2e]/20 (优雅的边框变色)
              className="group flex items-center bg-white p-5 rounded-2xl border border-transparent shadow-sm shadow-[#dff3ee] transition-all duration-300 hover:shadow-md hover:border-[#0f3d2e]/20 hover:translate-x-1"
            >
              {/* 左侧小图标 */}
              <span className="mr-3 opacity-50 group-hover:opacity-100 transition-opacity">✨</span>
              
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#0f3d2e] transition-colors">
                {a.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

            {/* Back To Wisdom */}
        <div className="mt-20 text-center">
        <Link
          href={`/${locale}/wisdom`}
          className="inline-block bg-white text-[#0f3d2e] px-8 py-3 rounded-full text-sm font-semibold border border-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white transition shadow-md"
        >
          ←  {t.back}
        </Link>
      </div>

      {/* SEO Breadcrumb */}
      <Script
        id="breadcrumb"
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