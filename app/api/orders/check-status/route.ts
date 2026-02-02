import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, moduleType } = await req.json();

    if (!email || !moduleType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userEmail = email.toLowerCase().trim();

    // 🔍 查找該用戶在該模組下，是否有一筆已支付且未使用的訂單
    // 或者是最新的已支付訂單
    const order = await db.order.findFirst({
      where: {
        email: userEmail,
        moduleType: moduleType,
        status: "paid",
      },
      orderBy: { createdAt: "desc" },
    });

    if (order) {
      return NextResponse.json({ 
        isPaid: true, 
        orderId: order.id 
      });
    }

    return NextResponse.json({ isPaid: false });

  } catch (error: any) {
    console.error("❌ Check Status API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}