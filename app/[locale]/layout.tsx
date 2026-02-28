import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

// 1. 导入 GoogleAnalytics 组件
import { GoogleAnalytics } from '@next/third-parties/google';

import "../globals.css";

export const metadata = {
  metadataBase: new URL("https://zanpath.com")
};

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
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>

        <GoogleAnalytics gaId="G-VP1VKTDHN4" />

      </body>
    </html>
  );
}




