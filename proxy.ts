import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/navigation";
import { updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. 讓多語言中間件先處理 (它會決定是否要把 / 變成 /en)
  const response = intlMiddleware(request);

  // 2. 如果 response 是一個跳轉（比如 307/308），直接返回，讓瀏覽器先完成語言跳轉
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // 3. 如果已經有了正確的語言路徑（status 200），再交給 Supabase 處理登錄 Session
  // 傳入當前的 response 確保語言的 Cookie 不會丟失
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 排除所有靜態資源，這是防止死循環的關鍵
    "/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)",
  ],
};