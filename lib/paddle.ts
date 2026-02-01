export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  const paddle = (window as any).Paddle;

  // 1. 自動匹配對應的 Price ID
  const priceMap: Record<string, string | undefined> = {
    naming: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_NAMING,
    lifepath: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_LIFEPATH,
    dream: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_DREAM,
    fengshui: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FENGSHUI,
    face: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FACE,
  };

  const selectedPriceId = priceMap[moduleName];

  if (paddle && selectedPriceId) {
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
      // 2. 測試期間帶上這個折扣碼，正式上線後手動刪掉這行即可
      discountCode: "FREE666", 
      customer: { email },
      customData: { 
        module: moduleName, 
        user_email: email 
      },
    });
  } else {
    alert("Payment system initializing... please try again.");
  }
};