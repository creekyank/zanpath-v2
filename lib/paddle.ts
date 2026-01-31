// lib/paddle.ts

/**
 * 通用 Paddle 支付跳轉函數
 * @param email 用戶輸入的電子郵件
 * @param moduleName 模塊名稱 (例如: 'dream', 'face', 'naming', 'reflection', 'zodiac')
 * @param locale 當前語言 (例如: 'en', 'es', 'zh')
 */
// lib/paddle.ts 更新版

// lib/paddle.ts

export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  if (typeof window !== "undefined" && (window as any).Paddle) {
    const paddle = (window as any).Paddle; // 🟢 強制轉為 any

    // 1. 初始化 (如果 layout.tsx 已經初始化過，這裡其實可以省略，但重複也無妨)
    paddle.Initialize({
      token: "test_1cce9b0416afc993cad22170058",
      environment: "sandbox",
      eventCallback: (data: any) => {
        if (data.name === "checkout.completed") {
          console.log("支付成功！");
          // 發送自定義事件
          window.dispatchEvent(new CustomEvent("paddle-payment-success", { 
            detail: { email, moduleName } 
          }));
        }
      }
    });

    // 2. 打開支付窗口
    paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "light",
        locale: locale,
      },
      items: [
        {
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
    console.error("Paddle 未能加載");
  }
};