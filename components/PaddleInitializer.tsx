"use client";
import { useEffect } from 'react';

export default function PaddleInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).Paddle) return;

    const script = document.createElement('script');
    // 🟢 強制指向 V3 版本的正確路徑
    script.src = "https://cdn.paddle.com/paddle/v3/paddle.js"; 
    script.async = true;

    script.onload = () => {
      if ((window as any).Paddle) {
        // V3 使用 Initialize
        (window as any).Paddle.Initialize({
          token: "test_1cce9b0416afc993cad22170058",
          environment: "sandbox",
        });
        console.log("✅ Paddle V3 已成功初始化");
      }
    };
    document.head.appendChild(script);
  }, []);

  return null;
}