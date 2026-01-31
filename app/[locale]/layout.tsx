import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from "next-themes";

import "../globals.css";
// 引入我們剛才重寫的、使用 useEffect 手動加載腳本的組件
import PaddleInitializer from "@/components/PaddleInitializer";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // 注意：在 Next.js 15 中 params 是 Promise，需要 await
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 這裡保留原有的 meta 標籤等，不放置 PaddleInitializer */}
      </head>
      <body>
        {/* 🟢 關鍵：將 Paddle 腳本加載器放在 body 最前面 */}
        <PaddleInitializer />

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