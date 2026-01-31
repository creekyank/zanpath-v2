import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from "next-themes";
import Script from 'next/script'; // 🟢 導入 Script
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
    // 🔴 注意：這裡必須有 html 和 body 標籤，如果你的 layout 裡沒寫，記得加上
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 🔵 Paddle SDK 加載與初始化 */}
        <Script
          src="https://cdn.paddle.com/paddle/v3/paddle.js"
          strategy="afterInteractive"
          onLoad={() => {
            // 使用 (window.Paddle as any) 繞過嚴格的類型檢查
            const paddle = (window as any).Paddle;
            if (paddle) {
              paddle.Initialize({
                token: "test_1cce9b0416afc993cad22170058",
                environment: "sandbox",
              });
              console.log("Paddle Sandbox Initialized");
            }
          }}
        />
      </head>
      <body>
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