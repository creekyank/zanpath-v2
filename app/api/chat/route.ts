import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";

// 🟢 設置 Vercel 函數超時時間為 60 秒 (免費版上限)，防止分析圖片時中斷
export const maxDuration = 60;
export const runtime = 'nodejs';

async function callGemini(prompt: string, imageBase64?: string) {
  const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({
      inline_data: { mime_type: "image/jpeg", data: base64Data }
    });
  }

  console.log("🚀 嘗試調用 Gemini API (v1)...");

  // 🟢 核心修改點：將 v1beta 改為 v1 (正式版)，模型標識符使用最兼容的格式
  const modelId = "gemini-1.5-flash"; 
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${modelId}:streamGenerateContent?alt=sse&key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 4096 
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Gemini 錯誤詳情:", errorText);
    // 這裡會把 Google 返回的錯誤直接拋出，方便我們在日誌中查看
    throw new Error(`Gemini Error: ${response.status} - ${errorText}`);
  }

  return response;
}

export async function POST(req: Request) {
  try {
    const { prompt, email, source, image } = await req.json();
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
        const geminiRes = await callGemini(prompt, image);
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