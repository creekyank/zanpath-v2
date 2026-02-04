// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OpenAI } from "openai";
import { generateFingerprint } from "@/lib/fingerprint";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnalysisReportPDF } from "@/lib/pdf-generator";
import React from "react";

export const runtime = "nodejs";
export const maxDuration = 120;

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const {
      prompt,
      email,
      moduleType,
      inputSnapshot,
      generationToken,
      locale = "en",
    } = await req.json();

    if (!prompt || !email || !moduleType || !generationToken) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userEmail = email.toLowerCase().trim();

    // 🔐 查找订单（一次性 token）
    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        generationToken,
        tokenExpiresAt: { gt: new Date() },
        status: "paid",
        isUsed: false,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 403 });
    }

    const fingerprint = generateFingerprint(
      userEmail,
      moduleType,
      inputSnapshot
    );

    // 🔒 原子锁单
    await db.order.update({
      where: { id: order.id },
      data: {
        isUsed: true,
        fingerprint,
        generationToken: null,
        tokenExpiresAt: null,
        inputData: inputSnapshot,
      },
    });

    // ===== 请求 AI（stream）=====
    const aiResponse = await openai.chat.completions.create({
      model: "deepseek-chat",
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "你是一位精通東西方文化的命理與空間分析大師，善於從視覺細節中洞察運勢。",
        },
        { role: "user", content: prompt },
      ],
    });

    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1️⃣ 边接收边推送
          for await (const chunk of aiResponse) {
            const text = chunk.choices?.[0]?.delta?.content || "";

            if (text) {
              fullContent += text;

              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    choices: [{ delta: { content: text } }],
                  })}\n\n`
                )
              );
            }
          }

          // 2️⃣ AI 完成后，开始【必须完成】的交付流程
          console.log("🟢 AI stream finished, start final delivery");

          // ✅ 保存结果
          const result = await db.result.upsert({
            where: { orderId: order.id },
            update: { content: fullContent, isComplete: true },
            create: {
              orderId: order.id,
              content: fullContent,
              isComplete: true,
            },
          });

          console.log("🟢 Result saved:", result.id);

          // ✅ 生成 PDF
          const pdfBuffer = await renderToBuffer(
            React.createElement(AnalysisReportPDF, {
              data: {
                title: "ZanPath AI Analysis Report",
                content: fullContent,
              },
              lang: locale,
            })
          );

          console.log(
            "🟢 PDF generated:",
            (pdfBuffer.length / 1024).toFixed(2),
            "KB"
          );

          // ✅ 发送邮件（必须在 close 之前）
          const { error } = await resend.emails.send({
            from: "ZanPath AI <report@zanpath.com>",
            to: userEmail,
            subject: "Your ZanPath AI Analysis Report",
            html: "<p>Your report is ready. Please find the PDF attached.</p >",
            attachments: [
              {
                filename: `ZanPath_${moduleType}_Report.pdf`,
                content: pdfBuffer,
              },
            ],
          });

          if (error) {
            console.error("❌ Resend error:", error);
            throw new Error("Email send failed");
          }

          console.log("🟢 Email sent successfully:", userEmail);

          // ✅ 标记已发邮件
          await db.result.update({
            where: { id: result.id },
            data: { pdfSent: true },
          });

          // 3️⃣ 一切完成，通知前端 DONE
          controller.enqueue(
            new TextEncoder().encode("data: [DONE]\n\n")
          );
          controller.close();
        } catch (err) {
          console.error("🔥 Stream fatal error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Order-Id": order.id,
      },
    });
  } catch (err: any) {
    console.error("🔥 chat fatal error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}