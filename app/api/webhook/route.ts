import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db"; // 確保你有配置 prisma 實例

/**
 * 驗證 Paddle Webhook 簽名
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
    console.error("❌ 簽名頭格式錯誤");
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
    console.error("❌ 簽名比對失敗:", err);
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
    console.error("❌ Paddle Webhook 簽名驗證失敗");
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

  console.log("📩 驗證通過！收到事件:", eventType);

  // 處理支付完成事件
  if (eventType === "transaction.completed" || eventType === "transaction.paid") {
    const emailFromCustom = data?.custom_data?.user_email;
    const emailFromCustomer = data?.customer?.email;
    const finalEmail = (emailFromCustom || emailFromCustomer || data?.customer_email)?.toLowerCase().trim();
    
    const moduleName = data?.custom_data?.module || "naming"; // 默認 naming
    const inputSnapshot = data?.custom_data?.input_snapshot || {}; // 獲取前端傳來的輸入快照

    console.log("✅ 準備寫入數據庫:", {
      email: finalEmail,
      module: moduleName,
      transactionId: data?.id
    });
    
    if (!finalEmail) {
      console.error("❌ Webhook Error: No email found in paddle data");
      return NextResponse.json({ received: true }); // 依然回傳 200，但中斷執行
    }

    try {
      // 🟢 核心改動：將支付記錄同步到數據庫 Order 表
      await db.order.upsert({
        where: { paddleOrderId: data.id },
        update: { 
          status: "paid"
          // 不要更新 isUsed，保持其為 false
        },
        create: {
          paddleOrderId: data.id,
          email: finalEmail,
          status: "paid",
          moduleType: moduleName,
          inputData: inputSnapshot,
          isUsed: false // 🟢 明確初始化為 false
        }
      });
      console.log("🚀 數據庫 Order 已更新為已支付狀態");
    } catch (dbErr: any) {
      console.error("❌ 數據庫寫入失敗:", dbErr.message);
      // 即使數據庫失敗也返回 200，防止 Paddle 重複重試已支付的 Webhook
    }
  }

  return NextResponse.json({ received: true });
}