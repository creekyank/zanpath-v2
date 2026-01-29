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

  const response = await groq.chat.completions.create({
    // 確保這裡的模型 ID 是有效的，如 llama-3.2-11b-vision-preview 或最新版
    model: "meta-llama/llama-4-scout-17b-16e-instruct", 
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
    stream: true,
  });

  // 使用更標準的轉換方式，確保每一塊 (chunk) 都能即時推送到前端
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            // 寫入純文字給前端
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (err) {
        console.error("Stream Error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
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