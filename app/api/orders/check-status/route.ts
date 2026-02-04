
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, moduleType } = await req.json();
    if (!email || !moduleType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userEmail = email.toLowerCase().trim();

    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType,
        status: "paid",
        isUsed: false, // ❗只允许没成功生成过的
      },
      orderBy: { createdAt: "asc" },
    });

    if (!order) {
      return NextResponse.json({ isPaid: false });
    }

    // 如果已经有 token，直接复用（失败重试核心）
    if (order.generationToken && order.tokenExpiresAt && order.tokenExpiresAt > new Date()) {
      return NextResponse.json({
        isPaid: true,
        generationToken: order.generationToken,
      });
    }

    // 否则生成新 token
    const token = crypto.randomBytes(32).toString("hex");

    await db.order.update({
      where: { id: order.id },
      data: {
        generationToken: token,
        tokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({
      isPaid: true,
      generationToken: token,
    });
  } catch (err: any) {
    console.error("❌ check-status error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}