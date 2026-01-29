import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";


// 🟢 設置 Vercel 函數超時時間為 60 秒 (免費版上限)，防止分析圖片時中斷
export const maxDuration = 60;
export const runtime = 'nodejs';

async function callGemini(prompt: string, imageBase64?: string, preferences?: string) {
  const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  
  // 🟢 1. 配置模型 (SDK 會自動處理 v1/v1beta 和 models/ 前綴)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 🟢 2. 拼接 Prompt
  let finalPrompt = prompt;
  if (preferences && preferences.trim() !== "") {
    finalPrompt = `${prompt}\n\n[User's Personal Preferences]: ${preferences}`;
  }

  const parts: any[] = [{ text: finalPrompt }];

  // 🟢 3. 處理圖片
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data
      }
    });
  }

  console.log("🚀 Calling Gemini via Official SDK...");

  // 🟢 4. 執行流式生成
  const result = await model.generateContentStream({
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  });

  // 🟢 5. 將 SDK 的流轉換為 Web 標準流返回給前端
  return new Response(result.stream as any, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  });
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
    if (image) {
      console.log("📸 正在使用 Gemini 進行視覺分析...");
      try {
        const geminiRes = await callGemini(prompt, image, preferences);
        return new Response(geminiRes.body, {
          headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
        });
      } catch (e: any) {
        console.error("❌ Gemini 視覺分析失敗:", e.message);
        // 返回具體錯誤給前端
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