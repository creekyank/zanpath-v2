export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  const paddle = (window as any).Paddle;

  if (paddle && paddle.Checkout) {
    paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "light",
        // 🟢 Paddle V3 支持 zh-Hans，但建議先用 en 測試排除語言問題
        locale: "en", 
      },
      items: [
        {
          // 🟢 確保這是你從 Paddle V3 (Billing) 後台拿到的 Price ID
          priceId: "pri_01kg9bxak39g4gt49k5cm1976c", 
          quantity: 1,
        },
      ],
      customer: {
        email: email,
      },
      customData: {
        module: moduleName,
        user_email: email,
      },
    });
  } else {
    alert("Paddle system is updating, please refresh the page.");
  }
};