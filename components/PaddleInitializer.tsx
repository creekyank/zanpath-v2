"use client";

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function PaddleInitializer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 只有在客戶端掛載後才執行
    setMounted(true);
  }, []);

  const handleOnReady = () => {
    if (typeof window !== "undefined" && (window as any).Paddle) {
      (window as any).Paddle.Initialize({
        token: "test_1cce9b0416afc993cad22170058",
        environment: "sandbox",
      });
      console.log("Paddle Sandbox Initialized via onReady");
    }
  };

  if (!mounted) return null;

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v3/paddle.js"
      strategy="afterInteractive"
      onReady={handleOnReady} // 使用 onReady 比 onLoad 更穩定
    />
  );
}