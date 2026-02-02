import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnalysisReportPDF } from "@/lib/pdf-generator";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

const RECOVERY_TEXT = {
  en: {
    noOrder: "No paid order found. If you just paid, please wait 1-2 minutes for payment confirmation.",
    codeSent: "Verification code sent to your email.",
    invalidCode: "Invalid or expired code.",
    sentEmail: "Report found! A professional PDF has been resent to your email.",
    recalculate: "Order confirmed but no report found. You can now generate it for free.",
    subject: "Verification Code - ZanPath AI",
    pdfSubject: "Your ZanPath AI Analysis Report (Resent)",
    emailBody: (code: string) => `<p>Your verification code is: <strong>${code}</strong></p><p>This code is valid for 10 minutes. Please use it to recover your report.</p>`
  },
  es: {
    noOrder: "No se encontró ningún pedido pagado. Si acaba de pagar, espere 1-2 min para la confirmación.",
    codeSent: "Código de verificación enviado a su correo electrónico.",
    invalidCode: "Código inválido o expirado.",
    sentEmail: "¡Informe encontrado! Se ha re-enviado un PDF profesional a su email.",
    recalculate: "Pedido confirmado pero no se encontró el informe. Puede generarlo gratis ahora.",
    subject: "Código de Verificación - ZanPath AI",
    pdfSubject: "Tu Informe de Análisis de ZanPath AI (Reenviado)",
    emailBody: (code: string) => `<p>Su código de verificación es: <strong>${code}</strong></p><p>Este código es válido por 10 minutos. Úselo para recuperar su informe.</p>`
  }
};

export async function POST(req: Request) {
  try {
    const { email, code, locale = "en", moduleType } = await req.json();
    const langKey = (locale === 'es' || locale?.startsWith('es')) ? 'es' : 'en';
    const t = RECOVERY_TEXT[langKey];
    const userEmail = email.toLowerCase().trim();

    // 1. 🔍 查找邏輯升級：
    // 我們要找的是該 Email 下，對應模塊的、已支付的「最新一筆」訂單
    const order = await db.order.findFirst({
      where: { 
        email: userEmail, 
        status: 'paid', 
        moduleType: moduleType 
      },
      orderBy: { createdAt: 'desc' }, // 優先處理最近的操作
      include: { result: true }
    });

    if (!order) {
      console.warn("🔍 未找到支付記錄:", { userEmail, moduleType });
      return NextResponse.json({ error: t.noOrder }, { status: 404 });
    }

    // --- 階段 A: 發送驗證碼 ---
    if (!code) {
      if (order.lastCodeSentAt && Date.now() - new Date(order.lastCodeSentAt).getTime() < 60000) {
        const waitTime = Math.ceil((60000 - (Date.now() - new Date(order.lastCodeSentAt).getTime())) / 1000);
        return NextResponse.json({ error: `Wait ${waitTime}s.` }, { status: 429 });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await db.order.update({
        where: { id: order.id },
        data: { 
          recoveryCode: verificationCode, 
          codeExpiresAt: new Date(Date.now() + 10 * 60000),
          lastCodeSentAt: new Date()
        }
      });

      await resend.emails.send({
        from: "ZanPath AI <report@zanpath.com>",
        to: userEmail,
        subject: t.subject,
        html: t.emailBody(verificationCode)
      });
      
      return NextResponse.json({ success: true, message: t.codeSent });
    }

    // --- 階段 B: 校驗驗證碼 ---
    const isCodeValid = order.recoveryCode === code;
    const isNotExpired = order.codeExpiresAt && new Date() < new Date(order.codeExpiresAt);

    if (!isCodeValid || !isNotExpired) {
      return NextResponse.json({ error: t.invalidCode }, { status: 400 });
    }

    // --- 階段 C: 根據訂單狀態進行找回 ---

    // 情況 1：已有完整結果 (已經 isUsed: true 且有 Result)
    if (order.result && order.result.isComplete) {
      console.log("🛠️ 正在重新補發 PDF...");
      
      const pdfBuffer = await renderToBuffer(
        React.createElement(AnalysisReportPDF, { 
          data: { title: t.pdfSubject, content: order.result.content }, 
          lang: langKey 
        })
      );

      const formattedModuleName = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);

      await resend.emails.send({
        from: "ZanPath AI <report@zanpath.com>",
        to: userEmail,
        subject: t.pdfSubject,
        html: `<div style="font-family: sans-serif; padding: 20px;"><h2>ZanPath AI</h2><p>${t.sentEmail}</p></div>`,
        attachments: [{ 
          filename: `ZanPath_${formattedModuleName}_Report.pdf`, 
          content: pdfBuffer 
        }]
      });

      return NextResponse.json({ 
        hasResult: true, 
        content: order.result.content, 
        inputData: order.inputData, // 返回當時存下的輸入數據快照
        message: t.sentEmail 
      });
    } 
    
    // 情況 2：已付款但「未使用」或「無結果」 (斷網救星)
    // 只要 status 是 paid，不論 isUsed 是 true 還是 false，只要沒 Result，就允許重新生成
    else {
      console.log("🔓 訂單已確認，引導用戶重新生成...");
      return NextResponse.json({ 
        hasResult: false, 
        inputData: order.inputData, // 🔴 關鍵：把當初支付時存的 inputData 給前端回填
        message: t.recalculate 
      });
    }

  } catch (err: any) {
    console.error("❌ Recovery API 嚴重錯誤:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}