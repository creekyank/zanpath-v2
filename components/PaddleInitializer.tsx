"use client";
import { useEffect } from 'react';

export default function PaddleInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).Paddle) return;

    const script = document.createElement('script');
    // 🟢 使用你剛才測試成功的通用網址
    script.src = "https://cdn.paddle.com/paddle/paddle.js"; 
    script.async = true;

    script.onload = () => {
      const paddle = (window as any).Paddle;
      if (paddle) {
        // 🔍 這裡增加一個調試：檢查 Token 是否成功讀取
        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        console.log("Paddle 準備初始化，Token 存在嗎？", !!token);

        paddle.Initialize({
          token: token,
          environment: "production", 
        });
        console.log("✅ Paddle V3 正式環境初始化指令已發出");
      }
    };

    script.onerror = (e) => {
      // 🚩 如果還是 onerror，這行會告訴我們是不是被瀏覽器插件擋了
      console.error("❌ Paddle SDK 載入失敗。這通常是 AdBlock 或域名未授權引起。詳細事件:", e);
    };

    document.head.appendChild(script);
  }, []);

  return null;
}