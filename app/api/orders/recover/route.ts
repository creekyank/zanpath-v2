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

    // 1. 查找匹配的已支付訂單 (優先匹配最新的支付記錄)
    const order = await db.order.findFirst({
      where: { email: userEmail, status: 'paid', moduleType: moduleType },
      orderBy: { createdAt: 'desc' },
      include: { result: true } // 一次性取出關聯的結果
    });

    if (!order) {
      console.warn("🔍 未找到支付訂單:", { userEmail, moduleType });
      return NextResponse.json({ error: t.noOrder }, { status: 404 });
    }

    // --- 階段 A: 發送驗證碼 ---
    if (!code) {
      // 頻率限制：60秒內只能發一次
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

    // 驗證碼通過後，檢查是否有 AI 結果
    const result = order.result;

    if (result && result.isComplete) {
      // ✅ 情況 1: 已經有完整結果 -> 補發 PDF 並顯示
      console.log("🛠️ 正在為找回流程渲染 PDF...");
      
      const pdfBuffer = await renderToBuffer(
        React.createElement(AnalysisReportPDF, { 
          data: { title: t.pdfSubject, content: result.content }, 
          lang: langKey 
        })
      );

      const formattedModuleName = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);

      await resend.emails.send({
        from: "ZanPath AI <report@zanpath.com>",
        to: userEmail,
        subject: t.pdfSubject,
        html: `<div style="font-family: sans-serif; padding: 20px;"><h2>ZanPath AI</h2><p>${t.sentEmail}</p></div>`,
        attachments: [
          { 
            filename: `ZanPath_${formattedModuleName}_Report.pdf`, 
            content: pdfBuffer 
          }
        ]
      });

      return NextResponse.json({ 
        hasResult: true, 
        content: result.content, 
        inputData: order.inputData, // 優先從 order 拿原始輸入數據
        message: t.sentEmail 
      });

    } else {
      // ❌ 情況 2: 已付款但無結果 (斷網/生成中斷)
      // 此時最重要的就是把 order.inputData 傳回去，讓前端可以自動回填姓名、生日等
      return NextResponse.json({ 
        hasResult: false, 
        inputData: order.inputData, // 🟢 關鍵：確保這裡返回了 inputData
        message: t.recalculate 
      });
    }

  } catch (err: any) {
    console.error("❌ Recovery API 嚴重錯誤:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}