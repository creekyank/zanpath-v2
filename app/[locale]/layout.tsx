import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

import NavBar from "./NavBar";
import Footer from "./Footer";

// 1. 导入 GoogleAnalytics 组件
import { GoogleAnalytics } from '@next/third-parties/google';

import "../globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body>
        {/* ✅ Paddle New (v2) SDK：无事件处理函数 */}
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
        />

        <NextIntlClientProvider messages={messages} locale={locale}>
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">

  <NavBar locale={locale as "en" | "es"} />

    {children}

    <Footer locale={locale as "en" | "es"} />

  </div>
</ThemeProvider>
        </NextIntlClientProvider>

        <GoogleAnalytics gaId="G-VP1VKTDHN4" />

      </body>
    </html>
  );
}




