import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/navigation";
import { updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createIntlMiddleware(routing);

// 🟢 根據報錯提示，這裡必須叫 proxy
export async function proxy(request: NextRequest) {
  // 1. 先執行語言中間件
  const response = intlMiddleware(request);

  // 2. 檢查是否需要語言重定向
  if (response.status !== 200) {
    return response;
  }

  // 3. 執行 Supabase Session 更新
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/(en|es)/:path*",
    "/((?!api|_next|favicon.ico|.*\\..*).*)",
  ],
};