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
    const { email, content, module, locale } = body; // isComplete 默認後端控制更安全
    const userEmail = email.toLowerCase().trim();

    // 1. 尋找匹配的已支付訂單 (優先找最新的一筆)
    const order = await db.order.findFirst({
      where: { email: userEmail, status: 'paid', moduleType: module },
      orderBy: { createdAt: 'desc' }
    });

    if (!order) {
      console.warn("⚠️ 數據庫未找到匹配的支付訂單:", { userEmail, module });
      return NextResponse.json({ error: "No matching paid order found" }, { status: 404 });
    }

    // 2. 保存/更新結果到數據庫
    // 使用 transaction 確保結果保存和訂單狀態更新同時成功
    const result = await db.$transaction(async (tx) => {
      const upsertedResult = await tx.result.upsert({
        where: { orderId: order.id },
        update: { content, isComplete: true },
        create: { orderId: order.id, content, isComplete: true }
      });

      // 🟢 擴展：可以在這裡標記 Order 為已處理完成，避免重複找回邏輯出錯
      // await tx.order.update({ where: { id: order.id }, data: { status: 'completed' } });
      
      return upsertedResult;
    });

    // 3. 準備郵件內容
    const langKey = (locale === 'es' || locale?.startsWith('es')) ? 'es' : 'en';
    const subjects: any = {
      en: "Your ZanPath AI Analysis Report",
      es: "Tu Informe de Análisis de ZanPath AI"
    };
    const currentSubject = `${subjects[langKey]} - ${module.toUpperCase()}`;

    // 4. 🔥 生成 PDF 
    console.log("🛠️ 正在渲染正式 PDF 報告...");
    const pdfBuffer = await renderToBuffer(
      React.createElement(AnalysisReportPDF, { 
        data: { title: currentSubject, content: content }, 
        lang: langKey 
      })
    );

    // 5. 📧 通過 Resend 發送郵件
    const { data, error } = await resend.emails.send({
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
      console.error("❌ Resend 發信失敗:", error);
      // 注意：即便郵件失敗，結果已經存入數據庫了，用戶可以通過 RecoveryModal 找回
      return NextResponse.json({ error: "Email delivery failed", details: error.message }, { status: 500 });
    }

    // 6. 🟢 發送成功後，更新 Result 表的 pdfSent 狀態 (對應你剛改的 Schema)
    await db.result.update({
      where: { id: result.id },
      data: { pdfSent: true }
    });

    console.log("🚀 正式郵件已成功送達:", userEmail);
    return NextResponse.json({ success: true, message: "Official report delivered" });

  } catch (err: any) {
    console.error("❌ API 內部嚴重錯誤:", err.message);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}