"use client";

import { useEffect } from 'react';

export default function PaddleInitializer() {
  useEffect(() => {
    // 1. 檢查是否已經加載過
    if (document.getElementById('paddle-script')) return;

    // 2. 手動創建 script 標籤
    const script = document.createElement('script');
    script.id = 'paddle-script';
    script.src = "https://cdn.paddle.com/paddle/v3/paddle.js";
    script.async = true;
    
    script.onload = () => {
      if ((window as any).Paddle) {
        (window as any).Paddle.Initialize({
          token: "test_1cce9b0416afc993cad22170058",
          environment: "sandbox",
        });
        console.log("✅ Paddle 加載並初始化成功");
      }
    };

    document.head.appendChild(script);
  }, []);

  return null; // 這個組件不需要渲染任何 HTML
}