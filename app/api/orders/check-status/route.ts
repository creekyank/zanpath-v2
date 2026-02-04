import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
        isUsed: false,
        generationToken: { not: null },
        tokenExpiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!order) {
      return NextResponse.json({ ready: false });
    }

    return NextResponse.json({
      ready: true,
      generationToken: order.generationToken
    });
  } catch (err: any) {
    console.error("check-status error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}