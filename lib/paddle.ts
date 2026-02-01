export const openPaddleCheckout = (email: string, moduleName: string) => {
  const paddle = (window as any).Paddle;

  if (!paddle) {
    console.log("⏳ Paddle SDK 尚未加載");
    return;
  }

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  const priceMap: Record<string, string | undefined> = {
    naming: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_NAMING,
    lifepath: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_LIFEPATH,
    dream: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_DREAM,
    fengshui: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FENGSHUI,
    face: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FACE,
  };

  const priceId = priceMap[moduleName];

  if (!token || !priceId) {
    console.error("❌ Paddle token / priceId 缺失", { token, priceId });
    return;
  }

  // ✅ 只初始化一次（非常关键）
  if (!(window as any).__paddle_inited) {
    paddle.Initialize({
      token,
    });
    (window as any).__paddle_inited = true;
    console.log("✅ Paddle initialized");
  }

  paddle.Checkout.open({
    settings: {
      displayMode: "overlay",
      theme: "light",
      locale: "en",
    },
    items: [{ priceId, quantity: 1 }],
    customer: { email },
    customData: { module: moduleName },
  });

  console.log("🚀 Paddle Checkout triggered:", moduleName);
};
