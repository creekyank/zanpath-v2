import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 最轻量查询
    await db.order.findFirst({
      select: { id: true },
    });

    return NextResponse.json({
      ok: true,
      message: "Database keep-alive success",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Keep-alive error:", err.message);

    return NextResponse.json({
      ok: false,
      error: err.message,
    });
  }
}