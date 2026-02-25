// E:\zanpath v2\app\api\orders\recover\route.ts
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
    emailBody: (code: string) => `<p>Your verification code is: <strong>${code}</strong></p ><p>This code is valid for 10 minutes. Please use it to recover your report.</p >`
  },
  es: {
    noOrder: "No se encontró ningún pedido pagado. Si acaba de pagar, espere 1-2 min para la confirmación.",
    codeSent: "Código de verificación enviado a su correo electrónico.",
    invalidCode: "Código inválido o expirado.",
    sentEmail: "¡Informe encontrado! Se ha re-enviado un PDF profesional a su email.",
    recalculate: "Pedido confirmado pero no se encontró el informe. Puede generarlo gratis ahora.",
    subject: "Código de Verificación - ZanPath AI",
    pdfSubject: "Tu Informe de Análisis de ZanPath AI (Reenviado)",
    emailBody: (code: string) => `<p>Su código de verificación es: <strong>${code}</strong></p ><p>Este código es válido por 10 minutos. Úselo para recuperar su informe.</p >`
  }
};

export async function POST(req: Request) {
  try {
    const { email, code, locale = "en", moduleType } = await req.json();
    const langKey = (locale === 'es' || locale?.startsWith('es')) ? 'es' : 'en';
    const t = RECOVERY_TEXT[langKey];

    if (!email || !moduleType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userEmail = email.toLowerCase().trim();

    // ✅ 查找最新有效订单，支持 PAID / GENERATING / DONE
    const order = await db.order.findFirst({
      where: { 
        email: userEmail, 
        moduleType,
        status: { in: ["PAID", "GENERATING", "DONE"] }
      },
      orderBy: { createdAt: 'desc' },
      include: { result: true }
    });

    if (!order) {
      console.warn("🔍 未找到支付记录:", { userEmail, moduleType });
      return NextResponse.json({ error: t.noOrder }, { status: 404 });
    }

    // --- 阶段 A: 发送验证码 ---
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

    // --- 阶段 B: 校验验证码 ---
    const isCodeValid = order.recoveryCode === code;
    const isNotExpired = order.codeExpiresAt && new Date() < new Date(order.codeExpiresAt);

    if (!isCodeValid || !isNotExpired) {
      return NextResponse.json({ error: t.invalidCode }, { status: 400 });
    }

    // --- 阶段 C: 找回结果 ---
    if (order.result && order.result.content) {
      // 已有完整结果，直接补发 PDF
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
        html: `<div style="font-family: sans-serif; padding: 20px;"><h2>ZanPath AI</h2><p>${t.sentEmail}</p ></div>`,
        attachments: [{ 
          filename: `ZanPath_${formattedModuleName}_Report.pdf`, 
          content: pdfBuffer 
        }]
      });

      return NextResponse.json({ 
        hasResult: true, 
        content: order.result.content, 
        inputData: order.inputData,
        message: t.sentEmail
      });
    } else {
      // 已付款但无结果，允许重新生成
      return NextResponse.json({ 
        hasResult: false, 
        inputData: order.inputData,
        message: t.recalculate
      });
    }

  } catch (err: any) {
    console.error("❌ Recovery API error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}