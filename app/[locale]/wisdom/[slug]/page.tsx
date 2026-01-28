import { ARTICLES, ArticleSlug } from "@/content/articles";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function ArticlePage({ params }: { params: { slug: string; locale: string } }) {
  const { slug, locale } = params;
  
  // 獲取數據
  const articleEntry = ARTICLES[slug as ArticleSlug];

  // 如果 slug 不在 articles.ts 的 key 裡面，直接返回 404
  if (!articleEntry) {
    notFound();
  }

  const content = articleEntry[locale as "en" | "es"] || articleEntry.en;

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#0f3d2e]">
      {/* 文章頂部導航 */}
      <nav className="max-w-3xl mx-auto pt-12 px-6">
        <Link 
          href="/wisdom" 
          className="text-sm font-medium text-[#356f5b] hover:text-[#0f3d2e] transition-colors flex items-center gap-2"
        >
          ← {locale === 'es' ? 'Volver a Sabiduría' : 'Back to Wisdom'}
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-6 pb-24">
        {/* 文章頭部元數據 */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#0f3d2e] text-white text-xs font-bold rounded-full uppercase tracking-wider">
              {content.category}
            </span>
            <span className="text-sm text-gray-400 font-medium">
              {content.date}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            {content.title}
          </h1>
          
          <p className="text-lg md:text-xl text-[#356f5b] leading-relaxed italic border-l-4 border-[#0f3d2e]/30 pl-6 py-2">
            {content.desc}
          </p>
        </header>

        {/* 文章正文內容 */}
        <article className="prose prose-slate lg:prose-xl max-w-none">
          <div className="text-[#0f3d2e] leading-loose space-y-6 whitespace-pre-line text-base md:text-lg">
            {/* 這裡渲染 content.ts 裡的內容 */}
            {content.content}
          </div>
        </article>

        {/* 底部行動呼籲 (CTA) */}
        <footer className="mt-20 pt-10 border-t border-gray-200">
          <div className="bg-[#0f3d2e] rounded-3xl p-8 text-center text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-4">
              {locale === 'es' ? '¿Listo para descubrir tu propio mapa?' : 'Ready to decode your own map?'}
            </h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              {locale === 'es' 
                ? 'Únete a miles de personas que utilizan la IA para comprender sus ritmos celestiales.' 
                : 'Join thousands using AI to understand their celestial rhythms.'}
            </p>
            <Link 
              href="/" 
              className="inline-block px-8 py-4 bg-white text-[#0f3d2e] font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              {locale === 'es' ? 'Generar Mi Análisis' : 'Generate My Analysis'}
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

// 為了讓 SEO 更好，生成靜態路徑 (可選)
export async function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({
    slug: slug,
  }));
}