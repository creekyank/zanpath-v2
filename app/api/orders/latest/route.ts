import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { moduleType } = await req.json();

  if (!moduleType) {
    return NextResponse.json({ error: "Missing moduleType" }, { status: 400 });
  }

  const order = await db.order.findFirst({
    where: { moduleType },
    orderBy: { createdAt: "desc" },
    include: { result: true }
  });

  if (!order) {
    return NextResponse.json({ status: "NONE" });
  }

  return NextResponse.json({
    status: order.status,
    email: order.email,
    inputData: order.inputData,
    result: order.result?.content || null
  });
}