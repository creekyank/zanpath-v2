import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/navigation";
import { updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const accept = request.headers.get('accept') || '';
  const url = request.nextUrl.pathname;

  // ✅ 只拦“页面请求”，不拦资源/API
  const isPageRequest =
    !url.startsWith('/api') &&
    !url.startsWith('/_next') &&
    !url.includes('.') &&
    !url.startsWith('/favicon');

  if (isPageRequest && !accept.includes('text/html')) {
    return new NextResponse('Blocked', { status: 403 });
  }

  const response = intlMiddleware(request);

  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    // 排除所有靜態資源，這是防止死循環的關鍵
    "/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)",
  ],
};