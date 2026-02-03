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

    if (!prompt || !email || !moduleType || !generationToken) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userEmail = email.toLowerCase().trim();

    // 🔐 查找并锁定订单
    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        generationToken,
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
          { role: "system", content: "你是一位专业命理分析师。" },
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