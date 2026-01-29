import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";
import { OpenAI } from "openai"; // 使用 OpenAI SDK 來驅動 Groq

export const maxDuration = 60;
export const runtime = 'nodejs';

// 初始化 Groq 客戶端
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // 這是對接 Groq 的關鍵
});

async function callGroq(prompt: string, imageBase64?: string, preferences?: string) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  let finalPrompt = prompt;
  if (preferences?.trim()) {
    finalPrompt += `\n\nUser Preferences: ${preferences}`;
  }

  console.log("🚀 正在發送請求至 Groq (meta-llama/llama-4-scout-17b-16e-instruct)...");

  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // 請確認此 ID 在 Groq 後台是 Active 狀態
      messages: [
        {
          role: "user",
          content: imageBase64 
            ? [
                { type: "text", text: finalPrompt },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64}` } }
              ]
            : [{ type: "text", text: finalPrompt }],
        },
      ],
      // 🟢 先關閉流模式，確認能拿到數據
      stream: false, 
    });

    const content = response.choices[0]?.message?.content || "AI 沒有回傳任何內容";
    console.log("✅ Groq 回應成功，長度:", content.length);

    // 返回一個前端能識別的 Response
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("❌ Groq 請求出錯:", error.message);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, email, source, image, preferences } = await req.json();
    const userEmail = email?.toLowerCase().trim();

    // 1. 權限檢查 (保留原邏輯)
    if (source !== "vip_debug" && !isAdminEmail(userEmail)) {
      const hasPaid = await db.order.findFirst({
        where: { email: userEmail, status: 'paid' },
      });
      if (!hasPaid) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. 視覺分析 (切換至 Groq)
    if (image) {
      console.log("📸 正在使用 Groq 進行視覺分析...");
      try {
        return await callGroq(prompt, image, preferences); 
      } catch (e: any) {
        console.error("❌ Groq 視覺分析失敗:", e.message);
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
      console.warn("⚠️ DeepSeek 失敗，嘗試切換到 Groq 備用方案...");
      return await callGroq(prompt);
    }
  } catch (err: any) {
    console.error("🔥 API Route 崩潰:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}