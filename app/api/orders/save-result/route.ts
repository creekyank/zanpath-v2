import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnalysisReportPDF } from "@/lib/pdf-generator";
import React from "react";

// 初始化 Resend (确保 .env 中 RESEND_API_KEY 已配置)
const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, content, module, isComplete, locale } = body;
    const userEmail = email.toLowerCase().trim();

    // 1. 寻找匹配的已支付订单 (Supabase)
    const order = await db.order.findFirst({
      where: { email: userEmail, status: 'paid', moduleType: module },
      orderBy: { createdAt: 'desc' }
    });

    if (!order) {
      console.warn("⚠️ 数据库未找到匹配的支付订单:", { userEmail, module });
      return NextResponse.json({ error: "No matching paid order found" }, { status: 404 });
    }

    // 2. 保存/更新结果到数据库 (Supabase)
    await db.result.upsert({
      where: { orderId: order.id },
      update: { content, isComplete: true },
      create: { orderId: order.id, content, isComplete: true }
    });

    // 3. 准备邮件内容
    const langKey = (locale === 'es' || locale?.startsWith('es')) ? 'es' : 'en';
    const subjects: any = {
      en: "Your ZanPath AI Analysis Report",
      es: "Tu Informe de Análisis de ZanPath AI"
    };
    const currentSubject = `${subjects[langKey]} - ${module.toUpperCase()}`;

    // 4. 🔥 生成 PDF 
    console.log("🛠️ 正在渲染正式 PDF 报告...");
    const pdfBuffer = await renderToBuffer(
      React.createElement(AnalysisReportPDF, { 
        data: { title: currentSubject, content: content }, 
        lang: langKey 
      })
    );
    console.log("✅ PDF 生成成功，大小:", (pdfBuffer.length / 1024).toFixed(2), "KB");

    // 5. 📧 通过 Resend 发送邮件 (已切换至正式域名)
    const { data, error } = await resend.emails.send({
      // ✅ 域名已验证，现在可以使用正式的域名邮箱发件
      from: "ZanPath AI <report@zanpath.com>", 
      to: userEmail, 
      subject: currentSubject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">${langKey === 'es' ? '¡Tu informe está listo!' : 'Your report is ready!'}</h2>
          <p>${langKey === 'es' 
            ? 'Adjunto encontrará su informe detallado en formato PDF. Gracias por confiar en ZanPath AI.' 
            : 'Please find your detailed analysis report in the attached PDF file. Thank you for choosing ZanPath AI.'}</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
            <p><strong>ZanPath AI</strong></p>
            <p>Discover your spiritual path with Artificial Intelligence.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `ZanPath_${module}_Report.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("❌ Resend 发信失败:", error);
      return NextResponse.json({ error: "Email delivery failed", details: error.message }, { status: 500 });
    }

    console.log("🚀 正式邮件已成功送达:", userEmail);
    return NextResponse.json({ success: true, message: "Official report delivered" });

  } catch (err: any) {
    console.error("❌ API 内部严重错误:", err.message);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}