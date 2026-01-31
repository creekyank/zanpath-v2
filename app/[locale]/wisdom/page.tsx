"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ARTICLES } from "@/content/articles";
import { NAV_MENU, COMMON_FOOTER } from "@/config/site-content";

export default function WisdomPage() {
  const locale = useLocale() as "en" | "es";
  const pathname = usePathname();
  const router = useRouter();
  
  // 獲取數據
  const slugs = Object.keys(ARTICLES);
  const menuItems = NAV_MENU[locale] || NAV_MENU.en;
  const foot = COMMON_FOOTER[locale] || COMMON_FOOTER.en;

  // 靜態文案
  const t = {
    en: {
      title: "Wisdom",
      subtitle: "Exploring the bridge between ancient metaphysical wisdom and modern celestial science.",
      readMore: "Read Full Article",
      placeholder: "More cosmic insights are being transcribed from our private archives...",
      back: "← Back to Tools",
      research: "Scientific Research"
    },
    es: {
      title: "Sabiduría",
      subtitle: "Explorando el puente entre la antigua sabiduría metafísica y la ciencia celeste moderna.",
      readMore: "Leer Artículo Completo",
      placeholder: "Se están transcribiendo más conocimientos cósmicos de nuestros archivos privados...",
      back: "← Volver a Herramientas",
      research: "Investigación Científica"
    }
  }[locale];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">
      
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
                ? "text-[#0f3d2e] border-b-2 border-[#0f3d2e] pb-1" // 激活狀態
                : "hover:text-[#0f3d2e] transition-colors"          // 未激活狀態
              }
            >
              {item.name}
            </Link>
          );
        })}
            </div>
            {/* 🟢 隱藏語言切換，但保留代碼以便未來開啟 */}
            <div className="flex items-center bg-white/50 rounded-full px-3 py-1 border border-gray-200 text-xs">
              <button onClick={() => router.push(pathname, { locale: 'en' })} className={`px-2 py-1 rounded-full ${locale === 'en' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>EN</button>
              <button onClick={() => router.push(pathname, { locale: 'es' })} className={`px-2 py-1 rounded-full ${locale === 'es' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>ES</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 lg:py-20 flex flex-col items-center">
        
        {/* Header Area */}
        <div className="mb-16 text-center max-w-2xl">
          <div className="text-4xl mb-4">📜</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0f3d2e] mb-4">{t.title}</h1>
          <p className="text-[#4a7c6d] text-[15px] leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Article List Container */}
        <div className="w-full space-y-8">
          {slugs.map((slug) => {
            const post = ARTICLES[slug][locale];
            
            return (
              <div 
                key={slug}
                className="bg-white rounded-3xl shadow-xl shadow-[#dff3ee]/50 p-8 border border-white transition hover:translate-y-[-4px] duration-300"
              >
                <div className="text-xs font-bold text-[#356f5b] mb-3 flex justify-between uppercase tracking-wider">
                  <span>{post.category || t.research}</span>
                  <span className="font-normal opacity-60">{post.date}</span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 leading-tight text-[#0f3d2e]">
                  {post.title}
                </h2>
                
                <p className="text-[#4a7c6d] text-sm leading-relaxed mb-6">
                  {post.desc}
                </p>

                <Link 
                  href={`/wisdom/${slug}`}
                  className="inline-block px-8 py-3 rounded-xl bg-[#0f3d2e] text-white font-bold text-center hover:opacity-90 transition shadow-lg shadow-[#0f3d2e]/10"
                >
                  {t.readMore}
                </Link>
              </div>
            );
          })}

          {/* Placeholder */}
          <div className="p-10 border-2 border-dashed border-[#356f5b]/20 rounded-3xl text-center text-[#356f5b]/50 text-sm italic">
            {t.placeholder}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-16">
          <Link href="/" className="text-sm font-medium text-[#356f5b] hover:text-[#0f3d2e] transition-colors border-b border-[#356f5b]/30">
            {t.back}
          </Link>
        </div>
      </main>

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
    </div>
  );
}