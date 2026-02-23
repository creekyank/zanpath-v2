import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { email, moduleType } = await req.json();

  if (!email || !moduleType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const userEmail = email.toLowerCase().trim();

  const order = await db.order.findFirst({
    where: {
      email: userEmail,
      moduleType
    },
    orderBy: { createdAt: "desc" },
    include: { result: true }
  });

  if (!order) {
    return NextResponse.json({ status: "NONE" });
  }

  return NextResponse.json({
    status: order.status,
    result: order.result?.content || null
  });
}