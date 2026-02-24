import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OpenAI } from "openai";

export const runtime = "nodejs";
export const maxDuration = 120;

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(req: Request) {
  try {
    const { prompt, email, moduleType } = await req.json();

    if (!prompt || !email || !moduleType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userEmail = email.toLowerCase().trim();

    // 1️⃣ 查找匹配订单
    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        status: { in: ["PAID", "GENERATING", "DONE"] }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!order) {
      return NextResponse.json({ error: "NOT_PAID" }, { status: 403 });
    }

    // 2️⃣ 状态驱动逻辑
    if (order.status === "GENERATING") {
      return NextResponse.json({ error: "ALREADY_GENERATING" }, { status: 409 });
    }

    if (order.status === "DONE") {
      const existing = await db.result.findUnique({ where: { orderId: order.id } });
      return NextResponse.json({
        alreadyDone: true,
        content: existing?.content || ""
      });
    }

    // 3️⃣ 更新状态为生成中
    await db.order.update({ where: { id: order.id }, data: { status: "GENERATING" } });

    // 4️⃣ 调用 AI 接口（确保语言由前端 locale 控制）
    const aiResponse = await openai.chat.completions.create({
      model: "deepseek-chat",
      stream: true,
      messages: [
        { role: "system", content: "You are a master fortune analyst." },
        { role: "user", content: prompt }
      ]
    });

    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of aiResponse) {
            const text = chunk.choices?.[0]?.delta?.content || "";
            if (text) {
              fullContent += text;
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`
                )
              );
            }
          }

          // 保存结果
          await db.result.upsert({
            where: { orderId: order.id },
            update: { content: fullContent },
            create: { orderId: order.id, content: fullContent }
          });

          // 标记订单完成
          await db.order.update({ where: { id: order.id }, data: { status: "DONE" } });

          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (streamErr) {
          console.error("Stream Error:", streamErr);
          controller.error(streamErr);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });

  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}