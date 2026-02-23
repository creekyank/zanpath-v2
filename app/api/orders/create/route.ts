import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { email, moduleType, inputData } = await req.json();

  if (!email || !moduleType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const userEmail = email.toLowerCase().trim();

  // 只复用 CREATED
  const existing = await db.order.findFirst({
    where: {
      email: userEmail,
      moduleType,
      status: "CREATED"
    },
    orderBy: { createdAt: "desc" }
  });

  if (existing) {
    return NextResponse.json({
      orderId: existing.id,
      reused: true
    });
  }

  const order = await db.order.create({
    data: {
      email: userEmail,
      moduleType,
      status: "CREATED",
      inputData
    }
  });

  return NextResponse.json({
    orderId: order.id,
    reused: false
  });
}