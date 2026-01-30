"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { NAV_MENU, COMMON_FOOTER, LEGAL_CONTENT } from "@/config/site-content";

export default function PrivacyPage() {
  const locale = useLocale() as "en" | "es";
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = NAV_MENU[locale] || NAV_MENU.en;
  const foot = COMMON_FOOTER[locale] || COMMON_FOOTER.en;
  const legal = LEGAL_CONTENT.terms[locale] || LEGAL_CONTENT.terms.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">
      {/* 導航欄 - 與 Naming 完全一致 */}
      <nav className="flex justify-center border-b border-gray-100 bg-transparent backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-5xl flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" className="w-8 h-8" alt="Logo" />
            <span className="font-bold text-lg">Zanpath AI</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:space-x-6 text-[13px] md:text-sm font-medium text-[#356f5b]">
              {menuItems.map(item => (
                <Link key={item.href} href={item.href} className="hover:text-[#0f3d2e]">
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center bg-white/50 rounded-full px-3 py-1 border border-gray-200 text-xs">
              <button onClick={() => router.push(pathname, { locale: 'en' })} className={`px-2 py-1 rounded-full ${locale === 'en' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>EN</button>
              <button onClick={() => router.push(pathname, { locale: 'es' })} className={`px-2 py-1 rounded-full ${locale === 'es' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>ES</button>
            </div>
          </div>
        </div>
      </nav>

      {/* 內容區塊 */}
      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-white">
          <h1 className="text-3xl font-bold mb-8 border-b pb-4">{legal.title}</h1>
          <div className="whitespace-pre-line leading-loose text-[#356f5b] text-base">
            {legal.content}
          </div>
        </div>
      </main>

      {/* 頁腳 - 與 Naming 完全一致 */}
      <footer className="mt-20 py-10 bg-transparent">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-4">
            <p className="text-sm text-gray-500/80 leading-relaxed">{foot.about}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
             <p className="text-sm text-gray-400">© 2026 Zanpath AI. </p>
            {foot.links.map(link => (
              <Link key={link.name} href={link.href} className={`text-sm ${pathname.includes(link.href) ? 'text-[#0f3d2e] font-bold' : 'text-[#356f5b] hover:text-[#0f3d2e]'} transition-colors`}>{link.name}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}