"use client";
import { useEffect } from 'react';

export default function PaddleInitializer() {
  useEffect(() => {
    // 1. 如果已經加載過就跳過
    if (typeof window === 'undefined' || (window as any).Paddle) return;

    // 2. 創建原生的 script 標籤
    const script = document.createElement('script');
    
    // 🟢 使用你剛剛測試成功的那個地址
    script.src = "https://cdn.paddle.com/paddle/paddle.js"; 
    script.async = true;

    script.onload = () => {
      if ((window as any).Paddle) {
        // 初始化
        (window as any).Paddle.Initialize({
          token: "test_1cce9b0416afc993cad22170058",
          environment: "sandbox",
        });
        console.log("✅ Paddle 終於加載成功了！");
      }
    };

    script.onerror = () => {
      console.error("❌ 腳本加載依然失敗，請檢查瀏覽器控制台 Network 標籤");
    };

    document.head.appendChild(script);
  }, []);

  return null;
}