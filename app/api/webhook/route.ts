
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

const ALLOWED_MODULES = ["naming", "bazi", "dream", "face", "fengshui"];

function verifySignature(rawBody: string, sig: string | null, secret: string) {
  if (!sig) return false;

  const parts = sig.split(";");
  const ts = parts.find(p => p.startsWith("ts="))?.split("=")[1];
  const h1 = parts.find(p => p.startsWith("h1="))?.split("=")[1];

  if (!ts || !h1) return false;

  const payload = `${ts}:${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(h1)
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET!;
    const rawBody = await req.text();
    const sig = req.headers.get("paddle-signature");

    if (!verifySignature(rawBody, sig, secret)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event_type !== "transaction.completed") {
      return NextResponse.json({ ok: true });
    }

    const data = event.data;

    const email =
      data?.custom_data?.user_email ||
      data?.customer?.email;

    const moduleType =
      data?.custom_data?.module;

    if (!email || !moduleType) {
      return NextResponse.json({ ok: true });
    }

    if (!ALLOWED_MODULES.includes(moduleType)) {
      console.warn("⚠️ Invalid moduleType:", moduleType);
      return NextResponse.json({ ok: true });
    }

    const finalEmail = email.toLowerCase().trim();

    /* =========================
       查找预创建订单
    ========================= */
    const existing = await db.order.findFirst({
      where: {
        email: finalEmail,
        moduleType,
        status: "CREATED"
      },
      orderBy: { createdAt: "desc" }
    });

    if (!existing) {
      console.warn("⚠️ No matching CREATED order found.");
      return NextResponse.json({ ok: true });
    }

    /* =========================
       防重复更新
    ========================= */
    if (existing.status === "PAID") {
      return NextResponse.json({ ok: true });
    }

    await db.order.update({
      where: { id: existing.id },
      data: {
        status: "PAID",
        paddleOrderId: data.id
      }
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}