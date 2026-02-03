// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OpenAI } from "openai";
import { generateFingerprint } from "@/lib/fingerprint";

export const runtime = "nodejs";
export const maxDuration = 60;

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function getImageDescription(imageBase64: string, preferences?: string) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
  const visionPrompt = `你是一位專業的視覺觀察員。請仔細觀察這張圖片，提供詳細的「客觀特徵描述」。【用戶要求重點】：${preferences || "全面觀察"} 1. 人臉：描述三停比例、眉眼鼻、唇齒下巴、神態氣韻。 2. 空間：描述格局、材質、光影、色彩配置。直接用中文條列式回答事實，不要進行預測分析。`;
  const response = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    messages: [{ role: "user", content: [{ type: "text", text: visionPrompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64}` } }] }],
  });
  return response.choices[0]?.message?.content || "";
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      email,
      moduleType,
      inputSnapshot,
      generationToken,
      image,
      preferences
    } = body;

    if (!prompt || !email || !moduleType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    
    if (!generationToken) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 403 });
    }
    
    
    const userEmail = email.toLowerCase().trim(); // ✅ 缺的就是它
    const token = generationToken as string;
    
    // 🔐 查找并锁定订单
    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        generationToken: token,
        tokenExpiresAt: { gt: new Date() },
        status: "paid",
        isUsed: false
      }
    });
    
    

    if (!order) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 403 });
    }

    const fingerprint = generateFingerprint(
      userEmail,
      moduleType,
      inputSnapshot,
      image
    );

    // 🔒 原子锁定（关键）
    await db.order.update({
      where: { id: order.id },
      data: {
        isUsed: true,
        fingerprint,
        generationToken: null,
        tokenExpiresAt: null,
        inputData: inputSnapshot
      }
    });

    // ===== AI 请求 =====
    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        stream: true,
        messages: [
          { role: "system", content: "你是一位精通東西方文化的命理與空間分析大師，善於從視覺細節中洞察運勢。。" },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!dsRes.ok) throw new Error("AI provider error");

    return new Response(dsRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Order-Id": order.id
      }
    });

  } catch (err: any) {
    console.error("🔥 chat error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}