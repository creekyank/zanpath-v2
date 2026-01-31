"use client";
import { useEffect } from 'react';

export default function PaddleInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).Paddle) return;

    const script = document.createElement('script');
    script.src = "https://cdn.paddle.com/paddle/v3/paddle.js";
    script.async = true;
    
    // 🟢 關鍵：在沙盒模式下，手動添加 crossOrigin 屬性
    script.crossOrigin = "anonymous";

    script.onload = () => {
      if ((window as any).Paddle) {
        (window as any).Paddle.Initialize({
          token: "test_1cce9b0416afc993cad22170058", // 你的沙盒 Token
          environment: "sandbox",
        });
        console.log("✅ Paddle Sandbox Initialized on " + window.location.hostname);
      }
    };

    script.onerror = () => {
      console.error("❌ Paddle Script Load Failed. Possible Domain/CORS issue.");
    };

    document.head.appendChild(script);
  }, []);

  return null;
}