
"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";

export default function NavBar({
  locale,
}: {
  locale: "en" | "es";
}) {
  const pathname = usePathname();
  const router = useRouter();

  const NAV_MENU = {
    en: [
      { name: "Life Path", href: "/" },
      { name: "Naming", href: "/naming" },
      { name: "Dream", href: "/dream" },
      { name: "Space", href: "/fengshui" },
      { name: "Visual", href: "/face" },
      { name: "Quiz", href: "/quiz" },
      { name: "Wisdom", href: "/wisdom" },
    ],
    es: [
      { name: "Camino de Vida", href: "/" },
      { name: "Nombres", href: "/naming" },
      { name: "Sueños", href: "/dream" },
      { name: "Espacio", href: "/fengshui" },
      { name: "Visual", href: "/face" },
      { name: "Tests", href: "/quiz" },
      { name: "Sabiduría", href: "/wisdom" },
    ],
  };

  const menuItems = NAV_MENU[locale];

  return (
    <nav className="flex justify-center border-b border-gray-100 bg-transparent backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-y-3">

        {/* Logo */}
        <div className="flex items-center space-x-2">
          < img src="/logo.png" className="w-8 h-8" alt="Logo" />
          <span className="font-bold text-lg">Zanpath AI</span>
        </div>

        {/* 菜单 + 语言切换（同一行，支持换行） */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 md:space-x-6">

          {menuItems.map((item) => {
            const isActive =
              item.href === "/"
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

          {/* 语言下拉 */}
          <div className="relative inline-flex items-center ml-2">
            <select
              value={locale}
              onChange={(e) =>
                router.push(pathname, {
                  locale: e.target.value as "en" | "es",
                })
              }
              className="appearance-none bg-white/50 backdrop-blur-md border border-[#356f5b]/30 text-[#0f3d2e] text-xs font-semibold rounded-md px-3 py-1 pr-7 cursor-pointer focus:outline-none hover:bg-white/70 transition-all duration-200 shadow-sm"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#0f3d2e]">
              <svg className="fill-current h-3 w-3 opacity-80" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}