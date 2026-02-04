import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
) {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(";");
  const tsPart = parts.find(p => p.startsWith("ts="));
  const h1Part = parts.find(p => p.startsWith("h1="));

  if (!tsPart || !h1Part) return false;

  const ts = tsPart.split("=")[1];
  const h1 = h1Part.split("=")[1];

  const payload = `${ts}:${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(h1)
  );
}

export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  if (!verifyPaddleSignature(rawBody, signature, secret)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const data = event.data;

  if (
    event.event_type === "transaction.completed" ||
    event.event_type === "transaction.paid"
  ) {
    const email =
      data?.custom_data?.user_email ||
      data?.customer?.email ||
      data?.customer_email;

    if (!email) {
      return NextResponse.json({ received: true });
    }

    const finalEmail = email.toLowerCase().trim();
    const moduleType = data?.custom_data?.module || "naming";
    const inputSnapshot = data?.custom_data?.input_snapshot || {};

    const generationToken = crypto.randomBytes(32).toString("hex");

    await db.order.upsert({
      where: { paddleOrderId: data.id },
      update: {
        status: "paid",
        generationToken,
        tokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      create: {
        paddleOrderId: data.id,
        email: finalEmail,
        moduleType,
        inputData: inputSnapshot,
        status: "paid",
        isUsed: false,
        generationToken,
        tokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
  }

  return NextResponse.json({ received: true });
}