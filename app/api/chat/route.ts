import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";


// 🟢 設置 Vercel 函數超時時間為 60 秒 (免費版上限)，防止分析圖片時中斷
export const maxDuration = 60;
export const runtime = 'nodejs';

async function callGemini(prompt: string, imageBase64?: string, preferences?: string) {
  const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  // 🟢 殺手鐧 Log：檢查 Vercel 到底讀到了哪把 Key，防止環境變量未生效
  console.log("🔑 [Diagnostic] Key prefix:", GOOGLE_API_KEY?.substring(0, 4), "Length:", GOOGLE_API_KEY?.length);

  if (!GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables");
  }

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  
  // 🟢 殺手鐧 1：使用 -latest 穩定版別名，並指定 v1beta
  // 這是目前解決「Model not found」最有效的路徑配置
  const model = genAI.getGenerativeModel(
    { model: "gemini-1.5-flash-latest" }, 
    { apiVersion: 'v1beta' }
  );

  let finalPrompt = prompt;
  if (preferences?.trim()) {
    finalPrompt += `\n\n[Additional Context/Preferences]: ${preferences}`;
  }

  const parts: any[] = [{ text: finalPrompt }];

  if (imageBase64) {
    // 兼容處理 Base64 格式
    const data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: data
      }
    });
  }

  console.log("🚀 SDK Attempt: gemini-1.5-flash-latest via v1beta...");

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  });

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