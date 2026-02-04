
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

    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        generationToken,
        tokenExpiresAt: { gt: new Date() },
        status: "paid",
        isUsed: false,
      },
      include: { result: true },
    });

    if (!order) {
      return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 403 });
    }

    // ❗如果已经成功生成过，直接拒绝
    if (order.result?.isComplete) {
      return NextResponse.json({ error: "ALREADY_COMPLETED" }, { status: 409 });
    }

    const fingerprint = generateFingerprint(
      userEmail,
      moduleType,
      inputSnapshot
    );

    // 仅锁定，不清 token
    await db.order.update({
      where: { id: order.id },
      data: {
        fingerprint,
        inputData: inputSnapshot,
      },
    });

    const aiResponse = await openai.chat.completions.create({
      model: "deepseek-chat",
      stream: true,
      messages: [
        { role: "system", content: "你是一位精通命理的分析师。" },
        { role: "user", content: prompt },
      ],
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
                    choices: [{ delta: { content: text } }],
                  })}\n\n`
                )
              );
            }
          }

          // ======== 真正成功点 ========

          const result = await db.result.upsert({
            where: { orderId: order.id },
            update: { content: fullContent, isComplete: true },
            create: {
              orderId: order.id,
              content: fullContent,
              isComplete: true,
            },
          });

          const pdfBuffer = await renderToBuffer(
            React.createElement(AnalysisReportPDF, {
              data: { title: "ZanPath AI Report", content: fullContent },
              lang: locale,
            })
          );

          await resend.emails.send({
            from: "ZanPath AI <report@zanpath.com>",
            to: userEmail,
            subject: "Your ZanPath AI Report",
            html: "<p>Your report is ready.</p >",
            attachments: [
              {
                filename: `ZanPath_${moduleType}.pdf`,
                content: pdfBuffer,
              },
            ],
          });

          // ✅ 只有现在，才算“消费完成”
          await db.order.update({
            where: { id: order.id },
            data: {
              isUsed: true,
              generationToken: null,
              tokenExpiresAt: null,
            },
          });

          await db.result.update({
            where: { id: result.id },
            data: { pdfSent: true },
          });

          controller.enqueue(
            new TextEncoder().encode("data: [DONE]\n\n")
          );
          controller.close();
        } catch (err) {
          console.error("🔥 Stream error:", err);
          controller.error(err); // ❗token 仍然有效
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("🔥 chat fatal error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}