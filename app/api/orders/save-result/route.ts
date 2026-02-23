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
    const { email, moduleType } = await req.json();

    if (!email || !moduleType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userEmail = email.toLowerCase().trim();

    /* =========================
       1️⃣ 查找 DONE 状态订单
    ========================= */
    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        status: "DONE"
      },
      orderBy: { createdAt: "desc" },
      include: { result: true }
    });

    if (!order || !order.result) {
      return NextResponse.json(
        { error: "No completed result found" },
        { status: 404 }
      );
    }

    /* =========================
       2️⃣ 防止重复发邮件
    ========================= */
    if ((order.result as any).pdfSent) {
      return NextResponse.json({ success: true });
    }

    const content = order.result.content;

    const subject = `ZanPath AI Report - ${moduleType.toUpperCase()}`;

    const pdfBuffer = await renderToBuffer(
      React.createElement(AnalysisReportPDF, {
        data: { title: subject, content }
      })
    );

    const { error } = await resend.emails.send({
      from: "ZanPath AI <report@zanpath.com>",
      to: userEmail,
      subject,
      html: `
        <h2>Your report is ready</h2>
        <p>Please see attached PDF.</p >
      `,
      attachments: [
        {
          filename: `ZanPath_${moduleType}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    /* =========================
       3️⃣ 标记已发送
    ========================= */
    await db.result.update({
      where: { orderId: order.id },
      data: { pdfSent: true }
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}