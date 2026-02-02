import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * 驗證 Paddle Webhook 簽名 (適用於 Paddle Billing / V3)
 */
function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
) {
  if (!signatureHeader || !secret) return false;

  // 1. 解析簽名頭部 (格式為: ts=1234567;h1=abcdef...)
  const parts = signatureHeader.split(";");
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const h1Part = parts.find((p) => p.startsWith("h1="));

  if (!tsPart || !h1Part) return false;

  const ts = tsPart.split("=")[1];
  const h1 = h1Part.split("=")[1];

  // 2. 構造簽名基礎字串：時間戳 + 冒號 + 原始請求體
  const payload = `${ts}:${rawBody}`;

  // 3. 使用你的 Webhook Secret 計算 HMAC SHA256
  const expectedHmac = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // 4. 安全地對比預期值與傳入的 h1 (這能防止計時攻擊)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedHmac),
      Buffer.from(h1)
    );
  } catch (err) {
    console.error("❌ 簽名對比出錯 (長度不匹配):", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("❌ 缺少 PADDLE_WEBHOOK_SECRET 環境變量");
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  // ⚠️ 必須取得原始文本內容進行驗證
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  const isValid = verifyPaddleSignature(rawBody, signature, secret);

  if (!isValid) {
    console.error("❌ Paddle Webhook 簽名驗證失敗");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ Webhook JSON 解析失敗", err);
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const eventType = event.event_type;
  const data = event.data;

  console.log("📩 Paddle Webhook 收到驗證通過的事件:", eventType);

  /**
   * ✅ 處理支付完成邏輯
   */
  if (
    eventType === "transaction.completed" ||
    eventType === "transaction.paid"
  ) {
    // 優先從 custom_data 拿 email，這最準確
    const email = data?.custom_data?.user_email || data?.customer?.email;
    const moduleName = data?.custom_data?.module;
    const transactionId = data?.id;

    console.log("✅ 支付成功確認:", {
      transactionId,
      email,
      moduleName,
    });

    // TODO: 在此處執行數據庫操作 (例如給用戶開通權限)
  }

  // 返回 200 OK
  return NextResponse.json({ received: true });
}