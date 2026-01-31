"use client";

import Script from 'next/script';

export default function PaddleInitializer() {
  return (
    <Script
      src="https://cdn.paddle.com/paddle/v3/paddle.js"
      strategy="afterInteractive" // 讓 Next.js 處理加載時機
      onLoad={() => {
        if ((window as any).Paddle) {
          (window as any).Paddle.Initialize({
            token: "test_1cce9b0416afc993cad22170058",
            environment: "sandbox",
          });
          console.log("✅ Paddle Initialized via Next/Script");
        }
      }}
      onError={(e) => {
        console.error("❌ Paddle Script Load Error:", e);
      }}
    />
  );
}