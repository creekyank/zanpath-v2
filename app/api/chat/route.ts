import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OpenAI } from "openai";

import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnalysisReportPDF } from "@/lib/pdf-generator";
import React from "react";



export const runtime = "nodejs";
export const maxDuration = 120;

const resend = new Resend(process.env.RESEND_API_KEY);

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

          // 标记订单完成
          // 保存结果
        await db.result.upsert({
          where: { orderId: order.id },
          update: { content: fullContent },
          create: { orderId: order.id, content: fullContent }
        });

        // 标记订单完成
        await db.order.update({
          where: { id: order.id },
          data: { status: "DONE" }
        });

        /* =========================
          发送邮件（只发一次）
        ========================= */

        const existingResult = await db.result.findUnique({
          where: { orderId: order.id }
        });

        if (!existingResult?.pdfSent) {

          const subject = `Your ZanPath AI Analysis Report - ${moduleType.toUpperCase()}`;

          const pdfBuffer = await renderToBuffer(
            React.createElement(AnalysisReportPDF, {
              data: { title: subject, content: fullContent },
              lang: "en"
            })
          );

          const { error } = await resend.emails.send({
            from: "ZanPath AI <report@zanpath.com>",
            to: userEmail,
            subject,
            html: `<p>Your report is attached.</p >`,
            attachments: [
              {
                filename: `ZanPath_${moduleType}_Report.pdf`,
                content: pdfBuffer
              }
            ]
          });

          if (!error) {
            await db.result.update({
              where: { orderId: order.id },
              data: { pdfSent: true }
            });
          } else {
            console.error("Email send error:", error);
          }
        }

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