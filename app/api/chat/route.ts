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

    // 1. 寻找匹配的订单 (PAID, GENERATING, 或 DONE)
    // 注意：这里去掉了 status: "PAID" 的硬性过滤，以便处理后续状态
    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        // 确保是已经付过费的订单
        status: { in: ["PAID", "GENERATING", "DONE"] }
      },
      orderBy: { createdAt: "desc" }
    });

    // 如果没付过费，拒绝访问
    if (!order) {
      return NextResponse.json({ error: "NOT_PAID" }, { status: 403 });
    }

    // --- 新增：状态驱动逻辑 ---

    // A. 如果正在生成中，提示前端等待（或前端可直接轮询结果）
    if (order.status === "GENERATING") {
      return NextResponse.json({ error: "ALREADY_GENERATING" }, { status: 409 });
    }

    // B. 如果已经完成，直接返回数据库结果，不再调用 AI
    if (order.status === "DONE") {
      const existing = await db.result.findUnique({
        where: { orderId: order.id }
      });

      return NextResponse.json({
        alreadyDone: true,
        content: existing?.content || ""
      });
    }

    // --- 逻辑继续：只有 PAID 状态才会走到这里 ---

    // 2. 更新状态为正在生成
    await db.order.update({
      where: { id: order.id },
      data: { status: "GENERATING" }
    });

    // 3. 调用 AI 接口
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
                  `data: ${JSON.stringify({
                    choices: [{ delta: { content: text } }]
                  })}\n\n`
                )
              );
            }
          }

          // 4. 生成结束后保存到 Result 表
          await db.result.upsert({
            where: { orderId: order.id },
            update: { content: fullContent },
            create: {
              orderId: order.id,
              content: fullContent
            }
          });

          // 5. 更新订单状态为 DONE
          await db.order.update({
            where: { id: order.id },
            data: { status: "DONE" }
          });

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