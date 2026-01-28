import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // 注意：如果是生产环境，建议验证 Paddle 的签名（这里先写核心业务逻辑）
    const formData = new URLSearchParams(body);
    const data = Object.fromEntries(formData.entries());

    // Paddle 的支付成功事件通常是 'transaction_paid' 或 'order_success'
    // 根据你 Paddle 的版本（v1 或 v2）字段会有不同，这里以常见逻辑为例
    const status = data.p_signature ? "v1" : "v2"; 
    const email = data.email || data.customer_email;
    const paddleOrderId = data.order_id || data.p_order_id;
    const passthrough = JSON.parse(data.passthrough || "{}");

    if (data.alert_name === "payment_succeeded" || data.event_type === "transaction.paid") {
      // 🟢 核心操作：在数据库里创建或更新订单状态
      await db.order.upsert({
        where: { paddleOrderId: paddleOrderId },
        update: { status: "paid" },
        create: {
          email: email.toLowerCase().trim(),
          paddleOrderId: paddleOrderId,
          status: "paid",
          moduleType: passthrough.source || "naming"
        }
      });

      console.log(`Payment success for: ${email}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}