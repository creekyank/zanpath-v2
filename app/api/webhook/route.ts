import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * 验证 Paddle Webhook 签名（New Paddle）
 */
function verifyPaddleSignature(
  rawBody: string,
  signature: string | null,
  secret: string
) {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("❌ 缺少 PADDLE_WEBHOOK_SECRET");
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  // ⚠️ 必须用 raw text，不能用 req.json()
  const rawBody = await req.text();

  const signature =
    req.headers.get("paddle-signature") ||
    req.headers.get("paddle-signature-hmac");

  const isValid = verifyPaddleSignature(rawBody, signature, secret);

  if (!isValid) {
    console.error("❌ Paddle Webhook 签名验证失败");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ Webhook JSON 解析失败", err);
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const eventType = event.event_type;
  const data = event.data;

  console.log("📩 Paddle Webhook 收到事件:", eventType);

  /**
   * ✅ 你现在最重要的事件
   */
  if (
    eventType === "transaction.completed" ||
    eventType === "transaction.paid"
  ) {
    const email =
      data?.customer?.email ||
      data?.customer_email;

    const transactionId = data?.id;
    const items = data?.items || [];
    const customData = data?.custom_data || {};

    console.log("✅ 支付完成");
    console.log({
      transactionId,
      email,
      items,
      customData,
    });

    /**
     * TODO（下一步你可以做的事）：
     * 1. 把订单写入数据库（email + module + paid=true）
     * 2. 允许用户调用 AI
     * 3. 给 RecoveryModal 用
     */
  }

  // ⚠️ 一定要返回 200，不然 Paddle 会疯狂重试
  return NextResponse.json({ received: true });
}
