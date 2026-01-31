"use client"; // 🟢 聲明為客戶端組件

import Script from 'next/script';

export default function PaddleInitializer() {
  return (
    <Script
      src="https://cdn.paddle.com/paddle/v3/paddle.js"
      strategy="afterInteractive"
      onLoad={() => {
        if ((window as any).Paddle) {
          (window as any).Paddle.Initialize({
            token: "test_1cce9b0416afc993cad22170058",
            environment: "sandbox",
          });
          console.log("Paddle Sandbox Initialized");
        }
      }}
    />
  );
}