"use client";

import { ARTICLES, ArticleSlug } from "@/content/articles";
import { notFound } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation"; // 加上 useRouter
import { NAV_MENU, COMMON_FOOTER } from "@/config/site-content";
import { use } from "react"; // 🟢 引入 React 的 use 鈎子

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default function ArticlePage({ params }: PageProps) {
  // 🟢 在客戶端組件中，使用 use(params) 來解開 Promise
  const resolvedParams = use(params);
  const { slug, locale } = resolvedParams;
  
  const pathname = usePathname();
  const router = useRouter();

  // 獲取數據
  const articleEntry = ARTICLES[slug as ArticleSlug];

  // 如果 slug 不存在，返回 404
  if (!articleEntry) {
    notFound();
  }

  const content = articleEntry[locale as "en" | "es"] || articleEntry.en;
  const menuItems = NAV_MENU[locale as "en" | "es"] || NAV_MENU.en;
  const foot = COMMON_FOOTER[locale as "en" | "es"] || COMMON_FOOTER.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#ffffff] text-[#0f3d2e]">
      
      {/* 頂部導航欄 */}
      <nav className="flex justify-center border-b border-gray-100 bg-transparent backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-5xl flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" className="w-8 h-8" alt="Logo" />
            <span className="font-bold text-lg">Zanpath AI</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:space-x-6 text-[13px] md:text-sm font-medium text-[#356f5b]">
              {menuItems.map((item) => {
                const isActive = item.href === "/" || item.href === ""
                  ? pathname === "/" || pathname === ""
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={isActive
                      ? "text-[#0f3d2e] border-b-2 border-[#0f3d2e] pb-1"
                      : "hover:text-[#0f3d2e] transition-colors"
                    }
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            {/* 語言切換 */}
            <div className="flex items-center bg-white/50 rounded-full px-3 py-1 border border-gray-200 text-xs">
              <button onClick={() => router.push(pathname, { locale: 'en' })} className={`px-2 py-1 rounded-full ${locale === 'en' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>EN</button>
              <button onClick={() => router.push(pathname, { locale: 'es' })} className={`px-2 py-1 rounded-full ${locale === 'es' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>ES</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-6 pb-24">
        {/* 返回按鈕 */}
        <div className="mb-12">
          <Link 
            href="/wisdom" 
            className="text-sm font-bold text-[#356f5b] hover:text-[#0f3d2e] flex items-center gap-2 transition-transform hover:-translate-x-1"
          >
            ← {locale === 'es' ? 'Volver a Sabiduría' : 'Back to Wisdom'}
          </Link>
        </div>

        {/* 文章頭部 */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-[#0f3d2e] text-white text-[10px] font-black rounded-full uppercase tracking-tighter">
              {content.category}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {content.date}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8 tracking-tight text-[#0f3d2e]">
            {content.title}
          </h1>
          
          <p className="text-xl text-[#4a7c6d] leading-relaxed italic border-l-4 border-[#0f3d2e]/20 pl-6 py-2 bg-[#dff3ee]/30 rounded-r-xl">
            {content.desc}
          </p>
        </header>

        {/* 文章正文 */}
        <article className="prose prose-slate max-w-none">
          <div className="text-[#0f3d2e] leading-[1.8] space-y-8 whitespace-pre-line text-lg font-normal">
            {content.content}
          </div>
        </article>

        {/* 頁腳 */}
        <footer className="mt-20 py-10 bg-transparent">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-1">
            <p className="text-sm text-gray-500/80 leading-relaxed">{foot.about}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
             <p className="text-sm text-gray-400">© 2026 Zanpath AI. </p>
            {foot.links.map(link => (
              <Link key={link.name} href={link.href} className="text-sm text-[#356f5b] hover:text-[#0f3d2e] transition-colors">{link.name}</Link>
            ))}
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}