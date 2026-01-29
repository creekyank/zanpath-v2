import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";


// 🟢 設置 Vercel 函數超時時間為 60 秒 (免費版上限)，防止分析圖片時中斷
export const maxDuration = 60;
export const runtime = 'nodejs';

async function callGemini(prompt: string, imageBase64?: string, preferences?: string) {
  const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
  
  // 🟢 核心修改：在初始化時強制指定使用 'v1' 版本
  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  
  // 🟢 指定模型時，確保不帶額外的前綴，讓 SDK 自己處理
  const model = genAI.getGenerativeModel(
    { model: "gemini-1.5-flash" },
    { apiVersion: 'v1' } // <-- 強制切換到 v1
  );

  let finalPrompt = prompt;
  if (preferences && preferences.trim() !== "") {
    finalPrompt = `${prompt}\n\n[User's Personal Preferences]: ${preferences}`;
  }

  const parts: any[] = [{ text: finalPrompt }];

  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data
      }
    });
  }

  console.log("🚀 Calling Gemini via Official SDK (Forced v1)...");

  try {
    const result = await model.generateContentStream({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });

    // 這裡需要等待流的初始化，避免 Vercel 提前關閉連接
    return new Response(result.stream as any, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
    });
  } catch (err: any) {
    console.error("🔥 SDK 內部錯誤:", err);
    throw new Error(`Gemini SDK Error: ${err.message}`);
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, email, source, image, preferences } = await req.json();
    const userEmail = email?.toLowerCase().trim();

    // 1. 權限檢查
    if (source !== "vip_debug" && !isAdminEmail(userEmail)) {
      const hasPaid = await db.order.findFirst({
        where: { email: userEmail, status: 'paid' },
      });
      if (!hasPaid) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. 視覺分析 (Gemini)
// 2. 視覺分析 (Gemini)
if (image) {
  console.log("📸 正在使用 Gemini 進行視覺分析...");
  try {
    // 直接返回 callGemini 返回的 Response 對象
    return await callGemini(prompt, image, preferences); 
  } catch (e: any) {
    console.error("❌ Gemini 視覺分析失敗:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

    // 3. 文本分析 (DeepSeek)
    try {
      console.log("🧠 正在使用 DeepSeek 進行文本分析...");
      const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          stream: true
        })
      });
      
      if (!dsRes.ok) throw new Error(`DeepSeek Failed: ${dsRes.status}`);
      
      return new Response(dsRes.body, { 
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } 
      });
    } catch (e) {
      console.warn("⚠️ DeepSeek 失敗，嘗試切換到 Gemini 備用方案...");
      const fallbackRes = await callGemini(prompt);
      return new Response(fallbackRes.body, { 
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } 
      });
    }
  } catch (err: any) {
    console.error("🔥 API Route 崩潰:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}