import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from "next-themes";
import Script from "next/script"; // 🟢 使用 Next.js 優化過的腳本加載器

import "../globals.css";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 🟢 方案 A：使用 Next.js Script 組件（推薦） */}
        <Script
          src="https://cdn.paddle.com/paddle/v3/paddle.js"
          strategy="beforeInteractive" // 在頁面交互前加載，最穩！
        />
        
        {/* 如果你更喜歡原生寫法，也可以用：
        <script src="https://cdn.paddle.com/paddle/v3/paddle.js" async></script> 
        */}
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* 頁面主要內容 */}
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}