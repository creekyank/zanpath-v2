// app/api/orders/save-result/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderId, content } = await req.json();
    if (!orderId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      await tx.result.upsert({
        where: { orderId },
        update: { content, isComplete: true },
        create: { orderId, content, isComplete: true }
      });
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ save-result error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}