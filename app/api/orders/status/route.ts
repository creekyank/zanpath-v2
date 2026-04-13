
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ 全局限流存储（简单版）
const rateLimitMap = new Map<string, { count: number; time: number }>();

export async function POST(req: Request) {
  try {
    /* =============================
       1️⃣ User-Agent 防爬虫
    ============================= */
    const ua = req.headers.get("user-agent") || "";

    if (!ua.includes("Mozilla")) {
      return new Response("Forbidden", { status: 403 });
    }

    /* =============================
       2️⃣ IP 限流（10秒最多10次）
    ============================= */
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, time: now };

    if (now - record.time < 10000) {
      record.count++;

      if (record.count > 10) {
        return new Response("Too Many Requests", { status: 429 });
      }
    } else {
      record.count = 1;
      record.time = now;
    }

    rateLimitMap.set(ip, record);

    /* =============================
       3️⃣ 原有逻辑
    ============================= */
    const { email, moduleType } = await req.json();

    if (!email || !moduleType) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
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

  } catch (err) {
    console.error("API ERROR:", err);
    return new Response("Internal Error", { status: 500 });
  }
}