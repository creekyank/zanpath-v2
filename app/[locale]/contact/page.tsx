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
  const legal = LEGAL_CONTENT.contact[locale] || LEGAL_CONTENT.contact.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">
      {/* 導航欄 - 與 Naming 完全一致 */}
      <nav className="flex justify-center border-b border-gray-100 bg-transparent backdrop-blur-md sticky top-0 z-50">
    <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-y-3">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" className="w-8 h-8" alt="Logo" />
                <span className="font-bold text-lg">Zanpath AI</span>
              </div>
    {/* 🟢 關鍵修改：將所有導航項與下拉框放在同一個容器內，並使用 flex-wrap */}
    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 md:space-x-6">
          
          {/* 直接循環導航項 */}
          {menuItems.map((item) => {
            const isActive = item.href === "/" || item.href === ""
              ? pathname === "/" || pathname === ""
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[13px] md:text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#0f3d2e] border-b-2 border-[#0f3d2e] pb-1"
                    : "text-[#356f5b] hover:text-[#0f3d2e]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* 🟢 語言下拉框：現在它是導航隊列的「最後一個元素」 */}
          <div className="relative inline-flex items-center ml-1">
            <select
              value={locale}
              onChange={(e) => router.push(pathname, { locale: e.target.value as 'en' | 'es' })}
              className="appearance-none bg-white/40 border border-[#356f5b]/20 text-[#0f3d2e] text-[11px] font-bold rounded-md px-2 py-0.5 pr-6 cursor-pointer focus:outline-none transition-all hover:bg-white/60"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
            {/* 箭頭圖標稍微縮小一點以配合文字 */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-[#0f3d2e]">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
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