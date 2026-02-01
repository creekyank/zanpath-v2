"use client";
import { useEffect } from 'react';

export default function PaddleInitializer() {
  useEffect(() => {
    // 防止重複加載
    if (typeof window === 'undefined' || (window as any).Paddle) return;

    const script = document.createElement('script');
    // 🟢 保持使用 V3 腳本
    script.src = "https://cdn.paddle.com/paddle/v3/paddle.js"; 
    script.async = true;

    script.onload = () => {
      const paddle = (window as any).Paddle;
      if (paddle) {
        // 🟢 從環境變量讀取 Token，並切換到 production 模式
        paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN, 
          environment: "production", // 👈 這裡一定要改成 production
        });
        console.log("✅ Paddle V3 正式環境初始化成功");
      }
    };
    
    script.onerror = () => {
      console.error("❌ Paddle SDK 加載失敗，請檢查網絡或域名權限。");
    };

    document.head.appendChild(script);
  }, []);

  return null;
}