import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

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
      <head>
        {/* 这里可以放 meta / title */}
      </head>
      <body>
        {/* ✅ 正确的 Paddle New SDK（v2） */}
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log("✅ Paddle SDK (v2) loaded");
          }}
          onError={(e) => {
            console.error("❌ Paddle SDK failed to load", e);
          }}
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
      </body>
    </html>
  );
}
