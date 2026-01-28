import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;


// ... 原有的代碼 ...

// 圖片處理工具函數
// lib/utils.ts 增強版
export const processImageForAI = async (file: File): Promise<string> => {
  // 1. 增加格式校驗
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG or WebP images are supported.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // 專業站標準：AI 不需要原圖精度，800px 足矣
        const scaleSize = MAX_WIDTH / img.width;
        
        // 如果原圖寬度就小於 800，則不放大
        const targetWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        const targetHeight = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 2. 轉為 JPG 並壓縮質量到 0.7
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(base64);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};