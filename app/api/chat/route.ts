import { NextResponse } from 'next/server';
import { db } from "@/lib/db"; 
import { isAdminEmail } from "@/config/admin";

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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Gemini 錯誤:", errorText);
    throw new Error(`Gemini Error: ${response.status}`);
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

    // 2. 視覺分流
    if (image) {
      console.log("📸 視覺分析...");
      const geminiRes = await callGemini(prompt, image);
      return new Response(geminiRes.body, {
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
      });
    }

    // 3. 文本分析 (DeepSeek)
    try {
      console.log("🧠 DeepSeek...");
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
      if (!dsRes.ok) throw new Error("DS Failed");
      return new Response(dsRes.body, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } });
    } catch (e) {
      const fallbackRes = await callGemini(prompt);
      return new Response(fallbackRes.body, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}