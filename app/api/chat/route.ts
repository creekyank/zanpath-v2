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
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ Groq API Key 缺失！");
    throw new Error("Missing GROQ_API_KEY");
  }

  let finalPrompt = prompt;
  if (preferences?.trim()) {
    finalPrompt += `\n\nUser Preferences: ${preferences}`;
  }

  // 處理圖片數據格式
  let imageUrl = "";
  if (imageBase64) {
    const data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    imageUrl = `data:image/jpeg;base64,${data}`;
  }

  console.log("🚀 正在發送請求至 Groq (Llama-3.2-Vision)...");

  // 使用 Groq 的流式輸出
  const response = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    messages: [
      {
        role: "user",
        content: imageBase64 
          ? [
              { type: "text", text: finalPrompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          : finalPrompt,
      },
    ],
    stream: true,
  });

  // 將 OpenAI/Groq 的流轉化為符合 Next.js 的 Response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
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