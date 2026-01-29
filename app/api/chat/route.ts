import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";

// 🟢 1. 設置 Vercel 函數超時時間為 60 秒 (免費版上限)，防止分析圖片時中斷
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

  console.log("🚀 嘗試調用 Gemini API...");

  // 🟢 2. 修正模型路徑：改為 models/gemini-1.5-flash-latest
  // v1beta 接口要求模型必須以 models/ 開頭，且建議使用最新的快照版本
  const modelId = "models/gemini-1.5-flash-latest"; 
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelId}:streamGenerateContent?alt=sse&key=${GOOGLE_API_KEY}`,
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
        return NextResponse.json({ error: "Gemini analysis failed" }, { status: 500 });
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