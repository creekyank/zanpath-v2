// lib/paddle.ts

/**
 * 通用 Paddle 支付跳轉函數
 * @param email 用戶輸入的電子郵件
 * @param moduleName 模塊名稱 (例如: 'dream', 'face', 'naming', 'reflection', 'zodiac')
 * @param locale 當前語言 (例如: 'en', 'es', 'zh')
 */
// lib/paddle.ts 更新版

// lib/paddle.ts

// lib/paddle.ts 修改建議
export const openPaddleCheckout = (email: string, moduleName: string, locale: string) => {
  if (typeof window !== "undefined" && (window as any).Paddle) {
    const paddle = (window as any).Paddle;

    // 🔴 改進點：檢查是否已經初始化過。如果沒初始化才初始化。
    // 如果你在 PaddleInitializer.tsx 已經初始化過，這裡通常可以直接調用 open。
    paddle.Initialize({
      token: "test_1cce9b0416afc993cad22170058",
      environment: "sandbox",
      eventCallback: (data: any) => {
        if (data.name === "checkout.completed") {
          window.dispatchEvent(new CustomEvent("paddle-payment-success", { 
            detail: { email, moduleName } 
          }));
        }
      }
    });

    // 🟢 給初始化留一點點喘息時間，確保 Overlay 能夠彈出
    setTimeout(() => {
      paddle.Checkout.open({
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: locale === "zh" ? "en" : locale, // Paddle 有時不支持 zh，建議做 fallback
        },
        items: [
          {
            priceId: "pri_01kg9bxak39g4gt49k5cm1976c",
            quantity: 1,
          },
        ],
        customer: { email: email },
        customData: {
          module: moduleName,
          user_email: email,
        },
      });
    }, 10); 
  } else {
    alert("Payment gateway is loading, please try again in a second.");
    console.error("Paddle 未能加載");
  }
};