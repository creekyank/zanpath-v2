import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

// 🟢 這裡的判斷邏輯修改如下，確保排除語言根路徑，防止死循環
if (
  pathname !== "/" &&
  pathname !== "/en" &&        // 增加精確匹配
  pathname !== "/es" &&        // 增加精確匹配
  !pathname.startsWith("/en/") && // 增加路徑匹配
  !pathname.startsWith("/es/") && 
  !user &&
  !pathname.includes("/login") && 
  !pathname.includes("/auth")
) {
  const locale = pathname.split('/')[1] || 'en';
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/auth/login`;
  return NextResponse.redirect(url);
}

return supabaseResponse;
}
