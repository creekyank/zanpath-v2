"use client";
import { useEffect } from 'react';

export default function PaddleInitializer() {
  useEffect(() => {
    // 1. 避免重複初始化
    if (typeof window === 'undefined' || (window as any).Paddle) return;

    // 2. 創建腳本標籤
    const script = document.createElement('script');
    script.id = 'paddle-js-sdk';
    script.src = "https://cdn.paddle.com/paddle/v3/paddle.js";
    script.async = true;
    
    // 3. 🟢 解決 403 Forbidden 的關鍵：匿名跨域請求
    script.crossOrigin = "anonymous";

    script.onload = () => {
      if ((window as any).Paddle) {
        (window as any).Paddle.Initialize({
          token: "test_1cce9b0416afc993cad22170058", // 確保這是你的 Sandbox Token
          environment: "sandbox",
        });
        console.log("✅ Paddle 加載成功");
      }
    };

    script.onerror = () => {
      console.error("❌ Paddle 腳本加載失敗，請檢查網絡或域名授權");
    };

    document.head.appendChild(script);
  }, []);

  return null;
}