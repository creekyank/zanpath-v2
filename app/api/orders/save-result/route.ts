import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnalysisReportPDF } from "@/lib/pdf-generator";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, content, moduleType, locale } = body;

    if (!email || !content || !moduleType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userEmail = email.toLowerCase().trim();

    /* =====================================================
       1️⃣ 查找已支付订单（兼容 paid / DONE）
    ===================================================== */

    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        status: { in: ["PAID", "GENERATING"] }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!order) {
      console.warn("⚠️ 未找到匹配订单:", userEmail, moduleType);
      return NextResponse.json(
        { error: "No matching order found" },
        { status: 404 }
      );
    }

    /* =====================================================
       2️⃣ 保存结果（事务）
    ===================================================== */

    const result = await db.$transaction(async (tx) => {
      const upserted = await tx.result.upsert({
        where: { orderId: order.id },
        update: {
          content
        },
        create: {
          orderId: order.id,
          content,
          pdfSent: false
        }
      });

      // 生成完成后标记订单 DONE
      await tx.order.update({
        where: { id: order.id },
        data: { status: "DONE" }
      });

      return upserted;
    });

    /* =====================================================
       3️⃣ 防止重复发信
    ===================================================== */

    if (result.pdfSent) {
      console.log("⚠️ 邮件已发送过，跳过:", userEmail);
      return NextResponse.json({ success: true });
    }

    /* =====================================================
       4️⃣ 生成 PDF
    ===================================================== */

    const langKey =
      locale === "es" || locale?.startsWith("es") ? "es" : "en";

    const subjects: Record<string, string> = {
      en: "Your ZanPath AI Analysis Report",
      es: "Tu Informe de Análisis de ZanPath AI"
    };

    const currentSubject =
      `${subjects[langKey]} - ${moduleType.toUpperCase()}`;

    console.log("🛠️ 生成 PDF 中...");

    const pdfBuffer = await renderToBuffer(
      React.createElement(AnalysisReportPDF, {
        data: { title: currentSubject, content },
        lang: langKey
      })
    );

    /* =====================================================
       5️⃣ 发送邮件
    ===================================================== */

    const { error } = await resend.emails.send({
      from: "ZanPath AI <report@zanpath.com>",
      to: userEmail,
      subject: currentSubject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2>
            ${
              langKey === "es"
                ? "¡Tu informe está listo!"
                : "Your report is ready!"
            }
          </h2>
          <p>
            ${
              langKey === "es"
                ? "Adjunto encontrará su informe detallado en formato PDF."
                : "Please find your detailed analysis report attached as a PDF file."
            }
          </p >
          <br/>
          <p><strong>ZanPath AI</strong></p >
        </div>
      `,
      attachments: [
        {
          filename: `ZanPath_${moduleType}_Report.pdf`,
          content: pdfBuffer
        }
      ]
    });

    if (error) {
      console.error("❌ 邮件发送失败:", error);
      return NextResponse.json(
        { error: "Email delivery failed" },
        { status: 500 }
      );
    }

    /* =====================================================
       6️⃣ 标记已发送
    ===================================================== */

    await db.result.update({
      where: { id: result.id },
      data: { pdfSent: true }
    });

    console.log("🚀 邮件已成功发送:", userEmail);

    return NextResponse.json({
      success: true,
      message: "Report saved and email delivered"
    });

  } catch (err: any) {
    console.error("❌ save-result 严重错误:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}