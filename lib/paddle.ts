export const openPaddleCheckout = (email: string, moduleName: string) => {
  const paddle = (window as any).Paddle;

  // 1. 自動重試機制：如果腳本還沒加載完，等 1 秒後自動再次觸發
  if (!paddle) {
    console.log("⏳ Paddle SDK 載入中，1秒後自動重試...");
    setTimeout(() => openPaddleCheckout(email, moduleName), 1000);
    return;
  }

  // 2. 獲取前端環境變量 (確保你 Vercel 裡有設定這些)
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  
  const priceMap: Record<string, string | undefined> = {
    naming: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_NAMING,
    lifepath: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_LIFEPATH,
    dream: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_DREAM,
    fengshui: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FENGSHUI,
    face: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_FACE,
  };

  const selectedPriceId = priceMap[moduleName];

  // 3. 安全檢查
  if (!token) {
    console.error("❌ 錯誤：找不到 NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
    return;
  }
  if (!selectedPriceId) {
    console.error(`❌ 錯誤：找不到模組 ${moduleName} 對應的 Price ID`);
    return;
  }

  try {
    // 4. 初始化 Paddle
    paddle.Initialize({
      token: token,
      environment: "production",
    });

    // 5. 打開支付窗口
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
      customer: { email },
      // 測試期間可以留著，正式上線後刪除下面這行
      discountCode: "FREE666", 
      customData: { 
        module: moduleName, 
        user_email: email 
      },
    });
    
    console.log(`🚀 已嘗試為 ${moduleName} 打開支付窗口`);
  } catch (err) {
    console.error("❌ Paddle 執行出錯:", err);
  }
};