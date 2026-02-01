export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  const paddle = (window as any).Paddle;

  if (!paddle) {
    alert("Payment system is still loading, please wait a moment.");
    return;
  }

  // 🟢 關鍵：在打開 Checkout 之前，必須先初始化
  // 這樣就不需要單獨的 Initializer 組件了
  paddle.Initialize({
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    environment: "production", // 確保這裡是正式環境
  });

  // 1. 自動匹配對應的 Price ID
  const priceMap: Record<string, string | undefined> = {
    naming: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_NAMING,
    lifepath: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_LIFEPATH,
    dream: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_DREAM,
    fengshui: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FENGSHUI,
    face: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FACE,
  };

  const selectedPriceId = priceMap[moduleName];

  if (selectedPriceId) {
    paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "light",
        locale: "en", 
      },
      items: [{ 
        priceId: selectedPriceId, 
        quantity: 1 
      }],
      discountCode: "FREE666", 
      customer: { email },
      customData: { 
        module: moduleName, 
        user_email: email 
      },
    });
  } else {
    // 如果走到這一步，說明環境變量沒讀到
    console.error("Price ID missing for:", moduleName);
    alert("Product configuration error. Please contact support.");
  }
};