import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnalysisReportPDF } from "@/lib/pdf-generator";
import React from "react";

// 初始化 Resend
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

    // 1. 查找匹配的已支付订单 (必须匹配 email 和对应的模块)
    const order = await db.order.findFirst({
      where: { email: userEmail, status: 'paid', moduleType: moduleType },
      orderBy: { createdAt: 'desc' }
    });

    if (!order) {
      console.warn("🔍 未找到支付订单:", { userEmail, moduleType });
      return NextResponse.json({ error: t.noOrder }, { status: 404 });
    }

    // --- 阶段 A: 发送验证码 (当前端没有传 code 时触发) ---
    if (!code) {
      // 频率限制：60秒内只能发一次
      if (order.lastCodeSentAt && Date.now() - new Date(order.lastCodeSentAt).getTime() < 60000) {
        return NextResponse.json({ error: "Please wait 60s before requesting a new code." }, { status: 429 });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await db.order.update({
        where: { id: order.id },
        data: { 
          recoveryCode: verificationCode, 
          codeExpiresAt: new Date(Date.now() + 10 * 60000), // 10分钟有效
          lastCodeSentAt: new Date()
        }
      });

      // 使用 Resend 发送验证码
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

    // 2. 验证码通过后，检查数据库是否有现成结果
    const result = await db.result.findUnique({ where: { orderId: order.id } });

    if (result && result.isComplete) {
      // ✅ 情况 1: 数据库有完整结果，直接生成 PDF 并补发邮件
      console.log("🛠️ 正在为找回流程渲染 PDF...");
      
      const pdfBuffer = await renderToBuffer(
        React.createElement(AnalysisReportPDF, { 
          data: { title: t.pdfSubject, content: result.content }, 
          lang: langKey 
        })
      );

      // 美化附件文件名，例如 ZanPath_Naming_Report.pdf
      const formattedModuleName = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);

      await resend.emails.send({
        from: "ZanPath AI <report@zanpath.com>",
        to: userEmail,
        subject: t.pdfSubject,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>${langKey === 'es' ? 'Informe Recuperado' : 'Report Recovered'}</h2>
            <p>${t.sentEmail}</p>
          </div>
        `,
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
        inputData: result.inputData, // 返回原始输入数据，用于回填表单
        message: t.sentEmail 
      });

    } else {
      // ❌ 情况 2: 已付款但无结果 (断网/报错)
      // 返回信号让前端设置 isPrePaid = true，允许用户免费重新提交
      return NextResponse.json({ 
        hasResult: false, 
        message: t.recalculate 
      });
    }

  } catch (err: any) {
    console.error("❌ Recovery API 严重错误:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}