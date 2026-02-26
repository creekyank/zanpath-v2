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

/* =============================
   DeepSeek
============================= */
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

/* =============================
   Groq (仅用于视觉模块)
============================= */

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * 第一階段：Groq 視覺描述
 */
async function getImageDescription(imageBase64: string, preferences?: string) {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const visionPrompt = `
    你是一位專業的視覺觀察員。請仔細觀察這張圖片，並為後續的文化專家分析提供詳細的「客觀特徵描述」。
    
    【重要：用戶特別要求的觀察重點】：
    ${preferences || "無特定重點，請進行全面觀察"}

    觀察指南：
    1. 如果是人臉：
       - 描述「三停」比例（上停額頭、中停眉眼鼻、下停嘴唇下巴）。
       - 描述細節：眉毛濃淡與形狀、眼睛神采、鼻樑與鼻翼特徵、唇形厚薄、下巴與腮骨。
       - 捕捉神態氣韻（如平靜、自信、威嚴或憂慮）。
    2. 如果是室內空間：
       - 描述整體格局、家具材質與擺放、主色調、明暗光影、是否有植物或特定裝飾物。

    要求：請直接用「中文」條列式回答，只描述視覺事實，不要進行預測或命理分析。
  `;

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct", 
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: visionPrompt },
          { 
            type: "image_url", 
            image_url: { 
              url: `data:image/jpeg;base64,${imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64}` 
            } 
          }
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}


export async function POST(req: Request) {
  try {
    const { prompt, email, moduleType, image, preferences } = await req.json();

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

    /* =============================
       3️⃣ AI 处理逻辑（核心修改点）
    ============================= */
    let finalPrompt = prompt;

    if (
      (moduleType === "face" || moduleType === "fengshui") &&
      image
    ) {
      console.log("📸 Groq Vision Scanning...");
    
      let visualData = "";
    
      try {
        visualData = await getImageDescription(image, preferences);
        console.log("✅ Vision Data OK");
      } catch (err) {
        console.error("❌ Vision failed:", err);
        visualData = "視覺掃描失敗，請依用戶描述分析。";
      }
    
      /* =============================
         1️⃣ 先做 placeholder 替换（完全保留旧逻辑）
      ============================= */
    
      let finalProcessedPrompt = prompt
        .replace("${spaceDescription}", visualData)
        .replace("${visualInputData}", visualData)
        .replace("${preferences}", preferences || "無特別說明")
        .replace("\\${preferences}", preferences || "無特別說明");
    
      /* =============================
         2️⃣ 构建 DeepSeek 最终大脑指令（完全等价旧逻辑）
      ============================= */
    
      finalPrompt = `
    你現在收到了以下背景數據：
    - 視覺掃描事實：${visualData}
    - 用戶特別囑咐：${preferences || "無"}
    
    請嚴格按照下列指令與格式輸出報告：
    ${finalProcessedPrompt}
    `;
    }

    /* =============================
       4️⃣ DeepSeek 流式调用
    ============================= */
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