import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

  export const metadata: Metadata = {
    metadataBase: new URL("https://zanpath.com"),
    title: "ZanPath | AI-Powered Personality & Life Insight Tool",
    description: "ZanPath provides AI-generated personality insights and cultural analysis based on traditional Eastern philosophy, designed for self-reflection and personal exploration. For entertainment and educational purposes only.",
    keywords: [
      "AI personality analysis",
      "self discovery tool",
      "personal insight",
      "cultural psychology",
      "AI life analysis",
      "entertainment analysis"
    ],
  };

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
