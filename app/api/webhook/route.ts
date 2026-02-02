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

  // 1. Paddle 签名头格式是 "ts=123456;h1=abcdef..."
  // 我们必须拆分出时间戳 (ts) 和 签名值 (h1)
  const parts = signatureHeader.split(";");
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const h1Part = parts.find((p) => p.startsWith("h1="));

  if (!tsPart || !h1Part) {
    console.error("❌ 签名头格式错误");
    return false;
  }

  const ts = tsPart.split("=")[1];
  const h1 = h1Part.split("=")[1];

  // 2. 构造签名载体：时间戳 + 冒号 + 原始请求体
  const payload = `${ts}:${rawBody}`;

  // 3. 计算 HMAC SHA256
  const expectedHmac = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // 4. 安全对比。使用 try-catch 防止长度不同导致的崩溃
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

  // ⚠️ 获取原始文本，验证签名必须用 rawBody
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  const isValid = verifyPaddleSignature(rawBody, signature, secret);

  if (!isValid) {
    console.error("❌ Paddle Webhook 签名验证失败");
    // 如果签名不对，返回 401
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

  // 处理支付成功逻辑
  if (eventType === "transaction.completed" || eventType === "transaction.paid") {
    // 这里的 custom_data 是你在 paddle.ts 里传过去的
    const email = data?.custom_data?.user_email || data?.customer?.email;
    const moduleName = data?.custom_data?.module;

    console.log("✅ 支付处理成功:", { email, moduleName });
    
    // 这里写你的业务逻辑，比如更新数据库
  }

  return NextResponse.json({ received: true });
}