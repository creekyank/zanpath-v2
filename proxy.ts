import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/navigation";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * 1️⃣ 初始化 next-intl middleware
 */
const intlMiddleware = createIntlMiddleware(routing);

/**
 * 2️⃣ proxy 是 Next.js 16 的唯一入口（不能 export default）
 */
export async function proxy(request: NextRequest) {
  /**
   * 🟢 先让 next-intl 处理语言
   * - 例如 / → /en
   * - /foo → /en/foo
   */
  const intlResponse = intlMiddleware(request);

  // ⚠️ 如果 next-intl 已经决定 redirect，必须立刻返回
  if (intlResponse) {
    return intlResponse;
  }

  /**
   * 🟢 再处理 Supabase session（不会再破坏 locale）
   */
  return await updateSession(request);
}

/**
 * 3️⃣ 匹配规则（非常重要）
 */
export const config = {
  matcher: [
    // 主页
    "/",

    // 所有带 locale 的页面
    "/(en|es)/:path*",

    // 排除静态资源 & api
    "/((?!api|_next|favicon.ico|.*\\..*).*)",
  ],
};