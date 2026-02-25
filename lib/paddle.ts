let paddleInitialized = false;

const PRICE_MAP: Record<string, string> = {
  naming: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_NAMING!,
  bazi: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_NAMING!,

 // bazi: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_BAZI!,

  dream: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_DREAM!,
  face: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FACE!,
  fengshui: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FENGSHUI!
};

export async function openPaddleCheckout(
  email: string,
  moduleType: string,
  inputSnapshot: any
) {
  const Paddle = (window as any).Paddle;

  if (!Paddle) {
    alert("Payment system not loaded.");
    return;
  }

  /* =========================
     1️⃣ 幂等创建订单
  ========================= */
  const res = await fetch("/api/orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      moduleType,
      inputData: inputSnapshot
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Order creation failed");
    return;
  }

  /* =========================
     2️⃣ 只初始化一次 Paddle
  ========================= */
  if (!paddleInitialized) {
    Paddle.Initialize({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    });
    paddleInitialized = true;
  }

  /* =========================
     3️⃣ 打开支付窗口
  ========================= */
  console.log("MODULE:", moduleType);
  console.log("PRICE:", PRICE_MAP[moduleType]);
  console.log("TOKEN:", process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);

  Paddle.Checkout.open({
    items: [
      {
        priceId: PRICE_MAP[moduleType],
        quantity: 1
      }
    ],
    customer: { email },
    customData: {
      module: moduleType,
      user_email: email
    }
  });
}
