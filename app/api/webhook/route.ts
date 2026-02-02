import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * 验证 Paddle Webhook 签名 (针对新版 Paddle Billing)
 */
function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
) {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(";");
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const h1Part = parts.find((p) => p.startsWith("h1="));

  if (!tsPart || !h1Part) {
    console.error("❌ 签名头格式错误");
    return false;
  }

  const ts = tsPart.split("=")[1];
  const h1 = h1Part.split("=")[1];
  const payload = `${ts}:${rawBody}`;

  const expectedHmac = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedHmac),
      Buffer.from(h1)
    );
  } catch (err) {
    console.error("❌ 签名比对失败 (可能是 Secret 不匹配):", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("❌ 缺少 PADDLE_WEBHOOK_SECRET");
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  const isValid = verifyPaddleSignature(rawBody, signature, secret);

  if (!isValid) {
    console.error("❌ Paddle Webhook 签名验证失败");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const eventType = event.event_type;
  const data = event.data;

  console.log("📩 验证通过！收到事件:", eventType);

  if (eventType === "transaction.completed" || eventType === "transaction.paid") {
    const emailFromCustom = data?.custom_data?.user_email;
    const emailFromCustomer = data?.customer?.email;
    const finalEmail = emailFromCustom || emailFromCustomer || data?.customer_email;
    const moduleName = data?.custom_data?.module;

    console.log("✅ 支付成功確認:", {
      email: finalEmail,
      module: moduleName,
      transactionId: data?.id
    });

    // TODO: 这里执行数据库写入逻辑
  }

  // 🟢 之前可能漏掉了下面这两行，导致报错：
  return NextResponse.json({ received: true });
} // <--- 确保这个函数结束的大括号存在