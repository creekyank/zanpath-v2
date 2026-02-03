// app/api/orders/check-status/route.ts
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
        isUsed: false
      },
      orderBy: { createdAt: "asc" }
    });

    if (!order) {
      return NextResponse.json({ isPaid: false });
    }

    // 🔐 生成一次性 Token
    const token = crypto.randomBytes(32).toString("hex");

    await db.order.update({
      where: { id: order.id },
      data: {
        generationToken: token,
        tokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 分钟
      }
    });

    return NextResponse.json({
      isPaid: true,
      generationToken: token
    });

  } catch (err: any) {
    console.error("❌ check-status error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}